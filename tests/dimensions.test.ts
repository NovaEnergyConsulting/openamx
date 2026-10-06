import { afterEach, describe, expect, it } from "bun:test";
import { readFileSync, realpathSync } from "node:fs";
import { mkdtemp as mkdtempAsync, rm as rmAsync } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseDocumentText } from "../src/parser/parseDocument";
import { parseStatements } from "../src/parser/parseStatements";
import { checkDocument } from "../src/typechecker/checkDocument";
import { loadEntryModule } from "../src/runtime/moduleLoader";
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
    const actualDeclarations = library.split(/\r?\n/).map(line => line.trim()).filter(line => line.startsWith("export "));
    expect(actualDeclarations).toEqual(expectedDeclarations);
    expect(checked.exportedDimensions.size).toBe(16);
    expect(checked.exportedUnits.size).toBe(46);
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
      kelvin: "ThermodynamicTemperature", mole: "AmountOfSubstance", candela: "LuminousIntensity",
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
    for (const [unitName, scale] of Object.entries(scales)) expect(checked.units.get(unitName)?.scale).toBe(scale);
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
