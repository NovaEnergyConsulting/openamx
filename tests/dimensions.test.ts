import { afterEach, describe, expect, it } from "bun:test";
import { readFileSync, realpathSync } from "node:fs";
import { mkdtemp as mkdtempAsync, rm as rmAsync } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseDocumentText } from "../src/parser/parseDocument";
import { parseStatements } from "../src/parser/parseStatements";
import { checkDocument } from "../src/typechecker/checkDocument";
import { loadEntryModule } from "../src/runtime/moduleLoader";
import { isMeasurement } from "../src/runtime/measurement";
import { AmxError } from "../src/diagnostics/errors";
import { analyzeEditorModules } from "../src/editor/moduleAnalysis";

const directories: string[] = [];

async function makeDir(): Promise<string> {
  const directory = await mkdtempAsync(join(tmpdir(), "openamx-dimensions-"));
  directories.push(directory);
  return directory;
}

async function write(directory: string, name: string, source: string): Promise<string> {
  const file = join(directory, name);
  await Bun.write(file, source);
  return file;
}

function document(source: string) {
  return parseDocumentText(`\`\`\`amx\n${source}\n\`\`\`\n`);
}

function expectCode(action: () => unknown, code: string): AmxError {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    expect((error as AmxError).code).toBe(code);
    return error as AmxError;
  }
  throw new Error(`Expected ${code} but no error was thrown`);
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map(directory => rmAsync(directory, { recursive: true, force: true })));
});

describe("Sprint 055 dimension and unit declarations", () => {
  it("parses declaration forms, exports, re-exports, and source locations", () => {
    const statements = parseStatements(
      "export dimension Length\n dimension Speed = Length / Time\nexport unit meter: Length\nunit kilometer = 1000 * meter\nexport { Length, meter }",
      { line: 4, column: 1 }
    );
    expect(statements).toMatchObject([
      { type: "dimensionDeclaration", name: "Length", exported: true, source: { line: 4 } },
      { type: "dimensionDeclaration", name: "Speed", expression: { type: "binaryExpression" } },
      { type: "unitDeclaration", name: "meter", dimension: "Length", exported: true },
      { type: "unitDeclaration", name: "kilometer", expression: { type: "binaryExpression" } },
      { type: "exportNamesDeclaration", names: [{ name: "Length" }, { name: "meter" }] }
    ]);
    expect(() => parseStatements("dimension 3Length")).toThrow(expect.objectContaining({ code: "AMX3006" }));
    expect(() => parseStatements("unit broken =")).toThrow(expect.objectContaining({ code: "AMX3006" }));
  });

  it("resolves declarations in source order and rejects unknown, forward, colliding, and local names", () => {
    expectCode(() => checkDocument(document("dimension Speed = Length / Time\ndimension Length\ndimension Time")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\nunit Length: Length")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\nfor item in [1] {\n  dimension Local\n}")), "AMX3008");
    expectCode(() => checkDocument(document("fn local(): Number = for item in [1] {\n  dimension Local\n  return item\n}")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit meter: Length")), "AMX3008");
  });

  it("normalizes derived vectors and resolves finite explicit unit scales", () => {
    const checked = checkDocument(document([
      "dimension Length",
      "dimension Time",
      "dimension Speed = Length / Time",
      "dimension Velocity = Length * Time ^ -1",
      "unit meter: Length",
      "unit kilometer = 1000 * meter",
      "unit second: Time",
      "unit hour = 3600 * second",
      "unit km_per_hour = kilometer / hour"
    ].join("\n")), "/workspace/physics.amx");
    expect([...checked.dimensions.get("Speed")!.vector]).toEqual([...checked.dimensions.get("Velocity")!.vector]);
    expect(checked.units.get("kilometer")?.scale).toBe(1000);
    expect(checked.units.get("km_per_hour")?.scale).toBeCloseTo(1000 / 3600);
    expect([...checked.units.get("km_per_hour")!.vector]).toEqual([...checked.dimensions.get("Speed")!.vector]);
  });

  it("rejects invalid unit scales, base-unit relationships, and duplicate independent units", () => {
    expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit zero = 0 * meter")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit negative = -1 * meter")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit invalid = meter + meter")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit kilometer = 1000 * meter\nunit overflow = kilometer ^ 1000000000000000")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit another: Length")), "AMX3008");
    expectCode(() => checkDocument(document("dimension Length\n dimension Area = Length ^ 2\nunit square: Area")), "AMX3008");
    const failure = expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit meter2: Length")), "AMX3008");
    expect(failure.declarationSource).toMatchObject({ line: 3 });
  });

  it("checks the exact approved SI inventory and definitions", async () => {
    const library = await Bun.file(join(process.cwd(), "libraries", "si.amx")).text();
    const checked = checkDocument(parseDocumentText(library), join(process.cwd(), "libraries", "si.amx"));
    const blueprint = await Bun.file(join(
      process.cwd(),
      "planning",
      "sprints",
      "0051-v09-language-contract-cross-surface-design",
      "blueprint.md"
    )).text();
    const inventory = blueprint.split("### 3. Finite Optional SI Inventory Proposal")[1].split("The approved inventory has")[0];
    const inventoryRows = inventory.split(/\r?\n/).flatMap(line => {
      const match = line.match(/^\| (Base dimension|Base unit|Scaled unit|Alias|Derived dimension|Derived unit) \| `([^`]+)` \| (.+) \|$/);
      return match ? [{ kind: match[1], name: match[2], definition: match[3].replaceAll("`", "").trim() }] : [];
    });
    const expectedDeclarations = inventoryRows.map(({ kind, name, definition }) => {
      if (kind === "Base dimension") return [`export dimension ${name}`];
      if (kind === "Base unit") return [`export unit ${name}: ${definition.replace(/,\s*scale 1$/, "")}`];
      if (kind === "Derived dimension") return [`export dimension ${name} = ${definition}`];
      return [`export unit ${name} = ${definition}`];
    }).flat();
    expectedDeclarations.splice(expectedDeclarations.indexOf("export unit K = kelvin") + 1, 0,
      "export unit celsius = kelvin + 273.15",
      "export unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)",
      "export unit degC = celsius",
      "export unit degF = fahrenheit");
    const actualDeclarations = library.split(/\r?\n/).map(line => line.trim()).filter(line => line.startsWith("export "));
    expect(actualDeclarations).toEqual(expectedDeclarations);
    expect(checked.exportedDimensions.size).toBe(16);
    expect(checked.exportedUnits.size).toBe(50);
    expect(checked.units.get("millimeter")?.scale).toBe(0.001);
    expect(checked.units.get("kilometer_per_hour")?.scale).toBe(1000 / 3600);
    expect(checked.units.get("N")?.vector).toEqual(checked.units.get("newton")?.vector);
    expect(checked.units.get("mm")?.scale).toBe(checked.units.get("millimeter")?.scale);
    expect(checked.units.get("N")?.scale).toBe(checked.units.get("newton")?.scale);
    const unitDimensions: Record<string, string> = {
      meter: "Length", millimeter: "Length", centimeter: "Length", kilometer: "Length",
      kilogram: "Mass", gram: "Mass", tonne: "Mass",
      second: "Time", millisecond: "Time", minute: "Time", hour: "Time",
      ampere: "ElectricCurrent", milliampere: "ElectricCurrent",
      kelvin: "ThermodynamicTemperature", celsius: "ThermodynamicTemperature", fahrenheit: "ThermodynamicTemperature",
      degC: "ThermodynamicTemperature", degF: "ThermodynamicTemperature",
      mole: "AmountOfSubstance", candela: "LuminousIntensity",
      square_meter: "Area", cubic_meter: "Volume", meter_per_second: "Speed", kilometer_per_hour: "Speed",
      hertz: "Frequency", newton: "Force", pascal: "Pressure", joule: "Energy", watt: "Power"
    };
    for (const [unitName, dimensionName] of Object.entries(unitDimensions)) {
      expect([...checked.units.get(unitName)!.vector]).toEqual([...checked.dimensions.get(dimensionName)!.vector]);
    }
    const scales: Record<string, number> = {
      meter: 1, kilogram: 1, second: 1, ampere: 1, kelvin: 1, mole: 1, candela: 1,
      millimeter: 0.001, centimeter: 0.01, kilometer: 1000, gram: 0.001, tonne: 1000,
      millisecond: 0.001, minute: 60, hour: 3600, milliampere: 0.001,
      m: 1, mm: 0.001, cm: 0.01, km: 1000, kg: 1, g: 0.001, t: 1000, s: 1,
      ms: 0.001, min: 60, h: 3600, A: 1, mA: 0.001, K: 1, mol: 1, cd: 1,
      square_meter: 1, cubic_meter: 1, meter_per_second: 1, kilometer_per_hour: 1000 / 3600,
      hertz: 1, newton: 1, pascal: 1, joule: 1, watt: 1, Hz: 1, N: 1, Pa: 1, J: 1, W: 1
    };
    for (const [unitName, scale] of Object.entries(scales)) {
      expect(checked.units.get(unitName)?.scale).toBe(scale);
      expect(checked.units.get(unitName)?.offset).toBe(0);
    }
    expect(checked.units.get("celsius")).toMatchObject({ scale: 1, offset: 273.15 });
    expect(checked.units.get("fahrenheit")?.scale).toBeCloseTo(5 / 9, 14);
    expect(checked.units.get("fahrenheit")?.offset).toBeCloseTo(273.15 - 160 / 9, 14);
    expect(checked.units.get("degC")).toMatchObject({ scale: 1, offset: 273.15 });
    expect(checked.units.get("degF")?.scale).toBe(checked.units.get("fahrenheit")?.scale);
    expect(checked.units.get("degF")?.offset).toBe(checked.units.get("fahrenheit")?.offset);
    expect(checked.units.get("degC")?.vector).toEqual(checked.units.get("celsius")?.vector);
    expect(checked.units.get("degF")?.vector).toEqual(checked.units.get("fahrenheit")?.vector);
    for (const unit of checked.units.values()) expect(Number.isFinite(unit.offset)).toBe(true);
    for (const { name, definition } of inventoryRows.filter(row => row.kind === "Alias")) {
      expect(checked.units.get(name)?.scale).toBe(checked.units.get(definition)?.scale);
      expect(checked.units.get(name)?.vector).toEqual(checked.units.get(definition)?.vector);
    }
    expect(checked.exportedUnits.has("dm")).toBe(false);
    expect(checked.exportedUnits.has("inch")).toBe(false);
  });

  it("preserves base identity through explicit import and re-export and canonical path aliases", async () => {
    const directory = await makeDir();
    await write(directory, "base.amx", "```amx\nexport dimension Length\nexport unit meter: Length\n```\n");
    await write(directory, "left.amx", "```amx\nimport { Length } from \"./base.amx\"\nexport dimension Left = Length\n```\n");
    await write(directory, "right.amx", "```amx\nimport { Length } from \"./nested/../base.amx\"\nexport dimension Right = Length\n```\n");
    await write(directory, "bridge.amx", "```amx\nimport { Length, meter } from \"./base.amx\"\nexport { Length, meter }\n```\n");
    const entry = await write(directory, "entry.amx", "```amx\nimport { Left } from \"./left.amx\"\nimport { Right } from \"./right.amx\"\nimport { Length, meter } from \"./bridge.amx\"\n```\n");
    const loaded = await loadEntryModule(entry, { outputInspection: true });
    expect(loaded.registry.dimensions.get("Length")?.baseIdentity).toBe(JSON.stringify([realpathSync(join(directory, "base.amx")), "Length"]));
    expect([...loaded.registry.dimensions.get("Left")!.vector]).toEqual([...loaded.registry.dimensions.get("Right")!.vector]);
    expect(loaded.registry.units.get("meter")?.moduleIdentity).toBe(loaded.registry.dimensions.get("Length")?.moduleIdentity);
  });

  it("preserves imported parent field dimension and unit context in inherited defaults and output schemas", async () => {
    const directory = await makeDir();
    await write(directory, "si.amx", "```amx\nexport dimension Length\nexport unit meter: Length\n```\n");
    await write(directory, "library.amx", [
      '```amx',
      'import { Length, meter } from "./si.amx"',
      'export type Identifier {',
      '  id: String',
      '  distance: Length = 2 meter',
      '}',
      '```',
      ''
    ].join('\n'));
    const entry = await write(directory, "entry.amx", [
      '```amx',
      'import { Identifier } from "./library.amx"',
      'type Asset extends Identifier {',
      '  name: String',
      '}',
      'export let assets: Asset[] = [Asset { id = "A-1", name = "Pump" }]',
      '```',
      ''
    ].join('\n'));

    const inspected = await loadEntryModule(entry, { outputInspection: true });
    expect(inspected.outputSchemas).toEqual([{
      name: "assets",
      type: "Asset[]",
      formats: ["json", "csv"],
      measurements: [{ path: "$.distance", dimension: "Length", visibleUnits: ["meter"] }]
    }]);

    const loaded = await loadEntryModule(entry);
    const assets = loaded.env.get("assets") as Array<Record<string, unknown>>;
    expect(assets).toHaveLength(1);
    expect(isMeasurement(assets[0].distance)).toBe(true);
    expect((assets[0].distance as { value: number; unit: { text?: string } }).value).toBe(2);
    expect((assets[0].distance as { value: number; unit: { text?: string } }).unit.text).toBe("meter");
  });

  it("does not unify independently declared same-name dimensions", async () => {
    const directory = await makeDir();
    await write(directory, "one.amx", "```amx\nexport dimension Length\nexport dimension First = Length\n```\n");
    await write(directory, "two.amx", "```amx\nexport dimension Length\nexport dimension Second = Length\n```\n");
    const entry = await write(directory, "entry.amx", "```amx\nimport { First } from \"./one.amx\"\nimport { Second } from \"./two.amx\"\n```\n");
    const { registry } = await loadEntryModule(entry, { outputInspection: true });
    expect([...registry.dimensions.get("First")!.vector.keys()]).not.toEqual([...registry.dimensions.get("Second")!.vector.keys()]);
  });

  it("resolves imported dimension/unit metadata in shared editor module analysis", async () => {
    const directory = await makeDir();
    await write(directory, "base.amx", "```amx\nexport dimension Length\nexport unit meter: Length\n```\n");
    const entry = await write(directory, "entry.amx", "```amx\nimport { Length, meter } from \"./base.amx\"\ndimension Distance = Length\nunit kilometer = 1000 * meter\n```\n");
    const text = await Bun.file(entry).text();
    const analysis = analyzeEditorModules(text, entry, (_fromFile, targetPath) => ({
      file: targetPath,
      text: readFileSync(targetPath, "utf8")
    }));
    expect(analysis.importedDimensions.has("Length")).toBe(true);
    expect(analysis.importedUnits.has("meter")).toBe(true);
    expect(analysis.modules?.get(realpathSync(entry))?.checkResult.dimensions.get("Distance")?.vector)
      .toEqual(analysis.importedDimensions.get("Length")?.vector);
  });

  it("enforces explicit visibility and one independent unit across the module graph", async () => {
    const directory = await makeDir();
    await write(directory, "base.amx", "```amx\nexport dimension Length\n```\n");
    await write(directory, "left.amx", "```amx\nimport { Length } from \"./base.amx\"\nexport unit meter: Length\n```\n");
    await write(directory, "right.amx", "```amx\nimport { Length } from \"./base.amx\"\nexport unit foot: Length\n```\n");
    const entry = await write(directory, "entry.amx", "```amx\nimport { meter } from \"./left.amx\"\nimport { Length } from \"./base.amx\"\nunit hidden = meter\n```\n");
    const loaded = await loadEntryModule(entry, { outputInspection: true });
    expect(loaded.registry.units.has("meter")).toBe(true);

    const invisible = await write(directory, "invisible.amx", "```amx\nimport { Length } from \"./base.amx\"\nunit hidden = meter\n```\n");
    try {
      await loadEntryModule(invisible);
      throw new Error("Expected an invisible unit error");
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      expect((error as AmxError).code).toBe("AMX3008");
    }

    const invalid = await write(directory, "duplicate-base.amx", "```amx\nimport { meter } from \"./left.amx\"\nimport { foot } from \"./right.amx\"\n```\n");
    try {
      await loadEntryModule(invalid);
      throw new Error("Expected a duplicate independent base unit error");
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      expect((error as AmxError).code).toBe("AMX3008");
    }
  });

  it("makes metadata available for schema inspection without evaluating statements", async () => {
    const directory = await makeDir();
    await write(directory, "si.amx", "```amx\nexport dimension Length\nexport unit meter: Length\n```\n");
    const entry = await write(directory, "entry.amx", "```amx\nimport { Length, meter } from \"./si.amx\"\ninput values: Number[]\nlet mustNotEvaluate: Number = 1 / 0\n```\n");
    const loaded = await loadEntryModule(entry, {
      inputInspection: { name: "values", format: "json", text: "[]" }
    });
    expect(loaded.inputInspection?.valid).toBe(true);
    expect(loaded.registry.dimensions.has("Length")).toBe(true);
    expect(loaded.registry.units.has("meter")).toBe(true);
    expect(loaded.env.has("mustNotEvaluate")).toBe(false);
  });
});

describe("Sprint 117 affine declaration metadata", () => {
  it("AFF-LINEAR-01/DECL-CEL-01/DECL-FHR-01/ALIAS-01/PRECEDENCE-01 and scalar/metadata cases retain complete transforms", () => {
    const checked = checkDocument(document([
      "dimension ThermodynamicTemperature",
      "dimension Length",
      "dimension Time",
      "unit kelvin: ThermodynamicTemperature",
      "unit meter: Length",
      "unit second: Time",
      "unit celsius = kelvin + 273.15",
      "unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)",
      "unit degC = celsius",
      "unit degF = fahrenheit",
      "unit scaledCelsius = 2 * celsius",
      "unit halfCelsius = celsius / 2",
      "unit piKelvin = kelvin + PI",
      "unit piScale = PI * kelvin",
      "unit eKelvin = E * kelvin",
      "unit eOffset = kelvin + E",
      "unit precedence = 2 * kelvin / 4 + PI",
      "unit parenthesizedPrecedence = (2 * kelvin / 4) + PI",
      "unit negativeOffset = meter + (273.15 - 300)",
      "unit negativeIntermediate = meter + (2 - 3)",
      "unit shiftedLeft = 2 + meter",
      "unit scalarPower = 2 ^ -2 * meter",
      "unit linearCompound = meter / second",
      "unit reciprocal = 2 / second",
      "unit identity = celsius ^ 1"
    ].join("\n")), "/workspace/affine.amx");

    const expected: Record<string, { scale: number; offset: number }> = {
      kelvin: { scale: 1, offset: 0 },
      meter: { scale: 1, offset: 0 },
      second: { scale: 1, offset: 0 },
      celsius: { scale: 1, offset: 273.15 },
      fahrenheit: { scale: 5 / 9, offset: 273.15 - 160 / 9 },
      degC: { scale: 1, offset: 273.15 },
      degF: { scale: 5 / 9, offset: 273.15 - 160 / 9 },
      scaledCelsius: { scale: 2, offset: 546.3 },
      halfCelsius: { scale: 0.5, offset: 136.575 },
      piKelvin: { scale: 1, offset: Math.PI },
      piScale: { scale: Math.PI, offset: 0 },
      eKelvin: { scale: Math.E, offset: 0 },
      eOffset: { scale: 1, offset: Math.E },
      precedence: { scale: 0.5, offset: Math.PI },
      parenthesizedPrecedence: { scale: 0.5, offset: Math.PI },
      negativeOffset: { scale: 1, offset: 273.15 - 300 },
      negativeIntermediate: { scale: 1, offset: -1 },
      shiftedLeft: { scale: 1, offset: 2 },
      scalarPower: { scale: 0.25, offset: 0 },
      linearCompound: { scale: 1, offset: 0 },
      reciprocal: { scale: 2, offset: 0 },
      identity: { scale: 1, offset: 273.15 }
    };
    for (const [name, transform] of Object.entries(expected)) {
      expect(checked.units.get(name)?.scale).toBeCloseTo(transform.scale, 14);
      expect(checked.units.get(name)?.offset).toBeCloseTo(transform.offset, 14);
      expect(Number.isFinite(checked.units.get(name)?.offset)).toBe(true);
    }
    expect(checked.units.get("kelvin")?.offset).toBe(0);
    expect(checked.units.get("degC")?.vector).toEqual(checked.units.get("celsius")?.vector);
    expect(checked.units.get("degC")?.identity).toBe(JSON.stringify(["/workspace/affine.amx", "degC"]));
    expect(checked.units.get("degC")?.identity).not.toBe(checked.units.get("celsius")?.identity);
    expect(checked.units.get("degC")?.source).toEqual({ line: 10, column: 6 });
    expect(checked.units.get("celsius")?.source).toEqual({ line: 8, column: 6 });
    expect([...checked.units.get("linearCompound")!.vector]).toEqual([
      [JSON.stringify(["/workspace/affine.amx", "Length"]), 1],
      [JSON.stringify(["/workspace/affine.amx", "Time"]), -1]
    ]);
  });

  it("AFF-USER-CONST-01/FORWARD-01/CALL-01/TWO-UNIT-ADD-01/REVERSE-SUB-01 reject with AMX3008", () => {
    const cases: Array<{ id: string; source: string; message: string; line: number; column: number }> = [
      { id: "AFF-USER-CONST-01", source: "dimension Length\nunit meter: Length\nlet factor: Number = 2\nunit invalid = factor * meter", message: "Unknown or not-yet-declared unit 'factor'", line: 5, column: 16 },
      { id: "AFF-FORWARD-01", source: "dimension Length\nunit meter: Length\nunit invalid = later\nunit later = meter", message: "Unknown or not-yet-declared unit 'later'", line: 4, column: 16 },
      { id: "AFF-CALL-01", source: "fn factor(value: Number): Number = value\ndimension Length\nunit meter: Length\nunit invalid = factor(2) * meter", message: "Unit expressions may use only finite scalars, visible units, PI, E, +, -, *, /, and signed integer powers", line: 5, column: 16 },
      { id: "AFF-TWO-UNIT-ADD-01", source: "dimension Temperature\nunit kelvin: Temperature\nunit celsius = kelvin + 273.15\nunit invalid = kelvin + celsius", message: "Unit declaration addition and subtraction require one affine unit term and one dimensionless scalar", line: 5, column: 23 },
      { id: "AFF-TWO-UNIT-ADD-01 subtraction", source: "dimension Temperature\nunit kelvin: Temperature\nunit celsius = kelvin + 273.15\nunit invalid = celsius - kelvin", message: "Unit declaration addition and subtraction require one affine unit term and one dimensionless scalar", line: 5, column: 24 },
      { id: "AFF-REVERSE-SUB-01", source: "dimension Temperature\nunit kelvin: Temperature\nunit invalid = 273.15 - kelvin", message: "Unit declaration subtraction requires the unit term on the left", line: 4, column: 23 }
    ];
    for (const testCase of cases) {
      const failure = expectCode(() => checkDocument(document(testCase.source)), "AMX3008");
      expect(failure.message, testCase.id).toBe(testCase.message);
      expect(failure.line, testCase.id).toBe(testCase.line);
      expect(failure.column, testCase.id).toBe(testCase.column);
    }
  });

  it("AFF-SCALE-ZERO-01/NEG-01/INF-01/OFFSET-INF-01 and S117 scalar cases enforce finite transforms", () => {
    const hugeFiniteScale = `1${"0".repeat(200)}`;
    const hugeFiniteOffset = `1${"0".repeat(308)}`;
    const cases: Array<{ id: string; source: string; message: string; line: number; column: number }> = [
      { id: "AFF-SCALE-ZERO-01", source: "dimension Length\nunit meter: Length\nunit invalid = 0 * meter", message: "Unit scale must be finite and greater than zero", line: 4, column: 18 },
      { id: "AFF-SCALE-NEG-01", source: "dimension Length\nunit meter: Length\nunit invalid = -1 * meter", message: "Unit scale must be finite and greater than zero", line: 4, column: 19 },
      { id: "AFF-SCALE-INF-01", source: `dimension Length\nunit meter: Length\nunit huge = ${hugeFiniteScale} * meter\nunit invalid = huge * huge`, message: "Unit scale must be finite and greater than zero", line: 5, column: 21 },
      { id: "AFF-OFFSET-INF-01", source: `dimension Temperature\nunit kelvin: Temperature\nunit huge = kelvin + ${hugeFiniteOffset}\nunit invalid = huge + ${hugeFiniteOffset}`, message: "Unit offset must be finite", line: 5, column: 21 },
      { id: "S117-SCALAR-NONFINITE-01", source: "dimension Length\nunit meter: Length\nunit invalid = meter + (1 / 0)", message: "Unit expression scalar division requires a non-zero denominator", line: 4, column: 27 },
      { id: "S117-SCALAR-NONFINITE-01 overflow", source: `dimension Length\nunit meter: Length\nunit invalid = meter + (${hugeFiniteScale} * ${hugeFiniteScale})`, message: "Unit expression scalar must be finite", line: 4, column: 227 },
      { id: "S117-SCALAR-ONLY-01", source: "unit invalid = PI", message: "A derived unit must reference at least one visible unit", line: 2, column: 16 }
    ];
    for (const testCase of cases) {
      const failure = expectCode(() => checkDocument(document(testCase.source)), "AMX3008");
      expect(failure.message, testCase.id).toBe(testCase.message);
      expect(failure.line, testCase.id).toBe(testCase.line);
      expect(failure.column, testCase.id).toBe(testCase.column);
    }
  });

  it("AFF-COMPOUND-01/POWER-IDENTITY-01/S117-POWER-01/DIM-01 enforce affine and dimension composition", () => {
    const affineFailures = [
      { id: "celsius * second", source: "dimension Temperature\ndimension Time\nunit kelvin: Temperature\nunit second: Time\nunit celsius = kelvin + 273.15\nunit invalid = celsius * second", line: 7, column: 24 },
      { id: "celsius / second", source: "dimension Temperature\ndimension Time\nunit kelvin: Temperature\nunit second: Time\nunit celsius = kelvin + 273.15\nunit invalid = celsius / second", line: 7, column: 24 },
      { id: "2 / celsius", source: "dimension Temperature\nunit kelvin: Temperature\nunit celsius = kelvin + 273.15\nunit invalid = 2 / celsius", line: 5, column: 18 },
      { id: "celsius ^ 2", source: "dimension Temperature\nunit kelvin: Temperature\nunit celsius = kelvin + 273.15\nunit invalid = celsius ^ 2", line: 5, column: 24 }
    ];
    for (const testCase of affineFailures) {
      const failure = expectCode(() => checkDocument(document(testCase.source)), "AMX3008");
      expect(failure.message, testCase.id).toBe("Affine units may not be multiplied, divided, or raised to non-identity powers in declarations");
      expect(failure.line, testCase.id).toBe(testCase.line);
      expect(failure.column, testCase.id).toBe(testCase.column);
    }

    const nonInteger = expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit invalid = meter ^ 0.5")), "AMX3008");
    expect(nonInteger.message).toBe("Unit powers must be signed integer literals");
    expect(nonInteger.line).toBe(4);
    expect(nonInteger.column).toBe(24);

    const dimensionOverflow = expectCode(() => checkDocument(document("dimension Length\nunit meter: Length\nunit area = meter ^ 2\nunit invalid = area ^ 4503599627370496")), "AMX3008");
    expect(dimensionOverflow.message).toBe("Dimension exponent is outside the supported integer range");
    expect(dimensionOverflow.line).toBe(5);
    expect(dimensionOverflow.column).toBe(21);
  });

  it("AFF-IMPORT-01/IMPORTED-CONST-01/S117-REEXPORT-01/S117-EDITOR-01 preserve affine metadata across module maps", async () => {
    const directory = await makeDir();
    const base = await write(directory, "temperature.amx", [
      "```amx",
      "export dimension Temperature",
      "export unit kelvin: Temperature",
      "export unit celsius = kelvin + 273.15",
      "export unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)",
      "export let factor: Number = 2",
      "```",
      ""
    ].join("\n"));
    await write(directory, "bridge.amx", [
      "```amx",
      "import { Temperature, kelvin, celsius, fahrenheit } from \"./temperature.amx\"",
      "export { Temperature, kelvin, celsius, fahrenheit }",
      "```",
      ""
    ].join("\n"));
    const entry = await write(directory, "entry.amx", [
      "```amx",
      "import { Temperature, kelvin, celsius, fahrenheit } from \"./bridge.amx\"",
      "unit degC = celsius",
      "unit degF = fahrenheit",
      "```",
      ""
    ].join("\n"));

    const loaded = await loadEntryModule(entry, { outputInspection: true });
    const runtimeCelsius = loaded.registry.units.get("celsius")!;
    const runtimeFahrenheit = loaded.registry.units.get("fahrenheit")!;
    const alias = loaded.registry.units.get("degC")!;
    const aliasF = loaded.registry.units.get("degF")!;
    expect(runtimeCelsius.scale).toBe(1);
    expect(runtimeCelsius.offset).toBe(273.15);
    expect(runtimeCelsius.moduleIdentity).toBe(realpathSync(base));
    expect(runtimeFahrenheit.scale).toBe(5 / 9);
    expect(runtimeFahrenheit.offset).toBeCloseTo(273.15 - 160 / 9, 14);
    expect(alias.scale).toBe(runtimeCelsius.scale);
    expect(alias.offset).toBe(runtimeCelsius.offset);
    expect(alias.vector).toEqual(runtimeCelsius.vector);
    expect(aliasF.scale).toBe(runtimeFahrenheit.scale);
    expect(aliasF.offset).toBe(runtimeFahrenheit.offset);
    expect(aliasF.vector).toEqual(runtimeFahrenheit.vector);

    const analysis = analyzeEditorModules(await Bun.file(entry).text(), entry, (_fromFile, targetPath) => ({
      file: targetPath,
      text: readFileSync(targetPath, "utf8")
    }));
    const editorCelsius = analysis.importedUnits.get("celsius")!;
    expect(editorCelsius.scale).toBe(runtimeCelsius.scale);
    expect(editorCelsius.offset).toBe(runtimeCelsius.offset);
    expect(editorCelsius.vector).toEqual(runtimeCelsius.vector);
    expect(editorCelsius.identity).toBe(runtimeCelsius.identity);
    const editorFahrenheit = analysis.importedUnits.get("fahrenheit")!;
    expect(editorFahrenheit.scale).toBe(runtimeFahrenheit.scale);
    expect(editorFahrenheit.offset).toBe(runtimeFahrenheit.offset);
    expect(editorFahrenheit.identity).toBe(runtimeFahrenheit.identity);

    const invalid = await write(directory, "invalid-import.amx", "```amx\nimport { Temperature, kelvin, factor } from \"./temperature.amx\"\nunit invalid = factor * kelvin\n```\n");
    try {
      await loadEntryModule(invalid, { outputInspection: true });
      throw new Error("Expected imported ordinary binding to be rejected");
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      expect((error as AmxError).code).toBe("AMX3008");
      expect((error as AmxError).message).toBe("Unknown or not-yet-declared unit 'factor'");
      expect((error as AmxError).line).toBe(3);
      expect((error as AmxError).column).toBe(16);
    }
  });

  it("S117-SOURCE-01 preserves affine diagnostic locations for LF and CRLF documents", () => {
    const body = [
      "dimension Temperature",
      "unit kelvin: Temperature",
      "unit celsius = kelvin + 273.15",
      "unit invalid = kelvin + celsius",
      ""
    ];
    for (const separator of ["\n", "\r\n"]) {
      const failure = expectCode(() => checkDocument(parseDocumentText(`\`\`\`amx${separator}${body.join(separator)}\`\`\`${separator}`)), "AMX3008");
      expect(failure.message).toBe("Unit declaration addition and subtraction require one affine unit term and one dimensionless scalar");
      expect(failure.line).toBe(5);
      expect(failure.column).toBe(23);
    }
  });

  it("AFF-CYCLE-01 preserves AMX5003 module-cycle diagnostics", async () => {
    const directory = await makeDir();
    const left = await write(directory, "left.amx", "```amx\nimport { celsius } from \"./right.amx\"\nexport unit hidden = celsius\n```\n");
    await write(directory, "right.amx", "```amx\nimport { hidden } from \"./left.amx\"\nexport unit celsius = hidden\n```\n");
    try {
      await loadEntryModule(left, { outputInspection: true });
      throw new Error("Expected module cycle");
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      expect((error as AmxError).code).toBe("AMX5003");
      expect((error as AmxError).message).toContain("Import cycle detected");
    }
  });
});
