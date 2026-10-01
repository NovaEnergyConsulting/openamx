/**
 * Sprint 015 module/function focused tests: pure functions, local imports/exports,
 * deterministic loading, isolation, diagnostics, and the opt-in Asset Management library.
 */

import { describe, it, expect, afterEach } from "bun:test";
import { rm, mkdir, realpath } from "fs/promises";
import { loadEntryModule } from "../src/runtime/moduleLoader";
import { AmxError } from "../src/diagnostics/errors";

const tmpDirs: string[] = [];
const tmpRootFiles: string[] = [];

async function makeDir(): Promise<string> {
  const dir = `./openamx-test-modules-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await mkdir(dir, { recursive: true });
  tmpDirs.push(dir);
  return dir;
}

async function write(dir: string, name: string, content: string): Promise<string> {
  const p = `${dir}/${name}`;
  await Bun.write(p, content);
  return p;
}

async function writeRootFile(content: string): Promise<string> {
  const name = `./openamx-test-root-${Date.now()}-${Math.random().toString(36).slice(2)}.amx`;
  await Bun.write(name, content);
  tmpRootFiles.push(name);
  return name;
}

afterEach(async () => {
  for (const dir of tmpDirs) {
    try { await rm(dir, { recursive: true, force: true }); } catch {}
  }
  tmpDirs.length = 0;
  for (const file of tmpRootFiles) {
    try { await rm(file, { force: true }); } catch {}
  }
  tmpRootFiles.length = 0;
});

async function expectAmxError(promise: Promise<unknown>, code: string): Promise<AmxError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    expect((error as AmxError).code).toBe(code);
    return error as AmxError;
  }
  throw new Error(`Expected ${code} but no error was thrown`);
}

describe("Sprint 015 pure functions", () => {
  it("calls typed functions, including nested standard-library and earlier-function calls", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nfn square(n: Number): Number = n * n\nfn sumOfSquares(a: Number, b: Number): Number = square(a) + square(b)\nlet total: Number = sumOfSquares(3, 4)\nlet rounded: Number = round(sqrt(total))\n```\n");
    const { env } = await loadEntryModule(entry);
    expect(env.toObject()).toMatchObject({ total: 25, rounded: 5 });
  });

  it("rejects a function body that captures a document binding", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nlet base: Number = 10\nfn addBase(n: Number): Number = n + base\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3001");
  });

  it("rejects a recursive function call", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nfn loopy(n: Number): Number = loopy(n)\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3004");
  });

  it("rejects a forward call to a function declared later", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nfn first(n: Number): Number = second(n)\nfn second(n: Number): Number = n\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3004");
  });

  it("rejects a for expression inside a function body", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nfn sumRange(n: Number): Number[] = for i in [1 to n] {\n  return i\n}\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3003");
  });

  it("rejects a function name that shadows a standard-library function", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nfn sum(n: Number): Number = n\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3005");
  });

  it("rejects invalid arity and argument types on a user function call", async () => {
    const dir = await makeDir();
    const entryArity = await write(dir, "arity.amx", "```amx\nfn addOne(n: Number): Number = n + 1\nlet value: Number = addOne(1, 2)\n```\n");
    await expectAmxError(loadEntryModule(entryArity), "AMX3004");
    const entryType = await write(dir, "type.amx", "```amx\nfn addOne(n: Number): Number = n + 1\nlet value: Number = addOne(\"x\")\n```\n");
    await expectAmxError(loadEntryModule(entryType), "AMX3002");
  });
});

describe("Sprint 015 modules, imports, and exports", () => {
  it("evaluates an imported type, function, and value, deterministically once, and isolates unrelated module bindings", async () => {
    const dir = await makeDir();
    await write(dir, "lib.amx", "```amx\nlet libOnly: Number = 99\nexport type Point {\n  x: Number\n  y: Number\n}\nexport fn distanceSquared(a: Point, b: Point): Number = (a.x - b.x) ^ 2 + (a.y - b.y) ^ 2\nexport let origin: Point = Point { x: 0, y: 0 }\n```\n");
    const entry = await write(dir, "entry.amx", "```amx\nimport { Point, distanceSquared, origin } from \"./lib.amx\"\n\nlet p: Point = Point { x: 3, y: 4 }\nlet d: Number = distanceSquared(p, origin)\n```\n");
    const { env } = await loadEntryModule(entry);
    const values = env.toObject();
    expect(values).toMatchObject({ p: { x: 3, y: 4 }, d: 25, origin: { x: 0, y: 0 } });
    expect(values).not.toHaveProperty("libOnly");
  });

  it("evaluates a diamond dependency graph once and shares the same exported value by reference", async () => {
    const dir = await makeDir();
    await write(dir, "shared.amx", "```amx\nexport let shared: Number[] = [1, 2, 3]\n```\n");
    await write(dir, "left.amx", "```amx\nimport { shared } from \"./shared.amx\"\nexport let leftShared: Number[] = shared\n```\n");
    await write(dir, "right.amx", "```amx\nimport { shared } from \"./shared.amx\"\nexport let rightShared: Number[] = shared\n```\n");
    const entry = await write(dir, "entry.amx", "```amx\nimport { leftShared } from \"./left.amx\"\nimport { rightShared } from \"./right.amx\"\n```\n");
    const { env } = await loadEntryModule(entry);
    const values = env.toObject() as { leftShared: number[]; rightShared: number[] };
    expect(values.leftShared).toBe(values.rightShared);
  });

  it("prefers contained unsaved imported modules and leaves their files unchanged", async () => {
    const dir = await makeDir();
    const dependencyPath = await write(dir, "lib.amx", "```amx\nexport let value: Number = 1\n```\n");
    const entryPath = await write(dir, "entry.amx", "```amx\nimport { value } from \"./lib.amx\"\nlet result: Number = value\n```\n");
    const diskText = await Bun.file(dependencyPath).text();
    const canonicalDependencyPath = await realpath(dependencyPath);
    const { env } = await loadEntryModule(entryPath, {
      sourceOverlay: new Map([[canonicalDependencyPath, "```amx\nexport let value: Number = 2\n```\n"]])
    });

    expect(env.toObject()).toMatchObject({ value: 2, result: 2 });
    expect(await Bun.file(dependencyPath).text()).toBe(diskText);
  });

  it("uses saved dependency text when no overlay is supplied and rejects outside overlay paths", async () => {
    const dir = await makeDir();
    const dependencyPath = await write(dir, "lib.amx", "```amx\nexport let value: Number = 3\n```\n");
    const entryPath = await write(dir, "entry.amx", "```amx\nimport { value } from \"./lib.amx\"\n```\n");
    const { env } = await loadEntryModule(entryPath);
    expect(env.toObject()).toMatchObject({ value: 3 });

    const outsidePath = await writeRootFile("```amx\nexport let secret: Number = 9\n```\n");
    const canonicalOutsidePath = await realpath(outsidePath);
    await expectAmxError(loadEntryModule(entryPath, {
      sourceOverlay: new Map([[canonicalOutsidePath, "```amx\nexport let secret: Number = 9\n```\n"]])
    }), "AMX5001");
    expect(await Bun.file(dependencyPath).text()).toContain("value: Number = 3");
  });

  it("rejects assignment to and redeclaration of an immutable imported binding", async () => {
    const dir = await makeDir();
    await write(dir, "lib.amx", "```amx\nexport let value: Number = 1\n```\n");
    const reassign = await write(dir, "reassign.amx", "```amx\nimport { value } from \"./lib.amx\"\nvalue = 2\n```\n");
    await expectAmxError(loadEntryModule(reassign), "AMX5002");
    const redeclare = await write(dir, "redeclare.amx", "```amx\nimport { value } from \"./lib.amx\"\nlet value: Number = 2\n```\n");
    await expectAmxError(loadEntryModule(redeclare), "AMX5002");
  });

  it("rejects a missing export name with AMX5002", async () => {
    const dir = await makeDir();
    await write(dir, "lib.amx", "```amx\nexport let value: Number = 1\n```\n");
    const entry = await write(dir, "entry.amx", "```amx\nimport { missing } from \"./lib.amx\"\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX5002");
  });

  it("rejects a duplicate imported name and an import/local name collision with AMX5002", async () => {
    const dir = await makeDir();
    await write(dir, "lib.amx", "```amx\nexport let value: Number = 1\n```\n");
    const duplicate = await write(dir, "duplicate.amx", "```amx\nimport { value } from \"./lib.amx\"\nimport { value } from \"./lib.amx\"\n```\n");
    await expectAmxError(loadEntryModule(duplicate), "AMX5002");
    const collide = await write(dir, "collide.amx", "```amx\nimport { value } from \"./lib.amx\"\nlet value: Number = 2\n```\n");
    await expectAmxError(loadEntryModule(collide), "AMX5002");
  });

  it("rejects invalid import paths (absolute, backslash, missing relative prefix, wrong extension, outside entry root)", async () => {
    const dir = await makeDir();
    await write(dir, "lib.amx", "```amx\nexport let value: Number = 1\n```\n");
    const absolute = await write(dir, "absolute.amx", "```amx\nimport { value } from \"/lib.amx\"\n```\n");
    await expectAmxError(loadEntryModule(absolute), "AMX5001");
    const backslash = await write(dir, "backslash.amx", "```amx\nimport { value } from \"./sub\\\\lib.amx\"\n```\n");
    await expectAmxError(loadEntryModule(backslash), "AMX5001");
    const noPrefix = await write(dir, "noprefix.amx", "```amx\nimport { value } from \"lib.amx\"\n```\n");
    await expectAmxError(loadEntryModule(noPrefix), "AMX5001");
    const wrongExt = await write(dir, "wrongext.amx", "```amx\nimport { value } from \"./lib.txt\"\n```\n");
    await expectAmxError(loadEntryModule(wrongExt), "AMX5001");
    const outside = await write(dir, "outside.amx", "```amx\nimport { value } from \"../outside.amx\"\n```\n");
    await expectAmxError(loadEntryModule(outside), "AMX5001");
  });

  it("rejects a direct import cycle with AMX5003 and reports the ordered cycle", async () => {
    const dir = await makeDir();
    await write(dir, "a.amx", "```amx\nimport { b } from \"./b.amx\"\nexport let a: Number = 1\n```\n");
    await write(dir, "b.amx", "```amx\nimport { a } from \"./a.amx\"\nexport let b: Number = 2\n```\n");
    const error = await expectAmxError(loadEntryModule(`${dir}/a.amx`), "AMX5003");
    expect(error.message).toContain("a.amx");
    expect(error.message).toContain("b.amx");
  });

  it("rejects an unavailable module path with AMX5001", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nimport { value } from \"./missing.amx\"\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX5001");
  });
});

describe("Sprint 015 opt-in Asset Management library", () => {
  it("keeps the six library types absent from the core environment until explicitly imported", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\nlet a: Asset = Asset { id: \"1\", name: \"n\", assetClass: \"c\", criticality: 1 }\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3001");
  });

  it("imports and constructs the six approved Asset Management schemas from the real library file", async () => {
    const entry = await writeRootFile(
      "```amx\n" +
      "import { FailureMode, Risk, Strategy, Asset, MaintenanceTask, LifecycleCost } from \"./libraries/asset-management.amx\"\n\n" +
      "let mode: FailureMode = FailureMode { id: \"FM1\", name: \"Bearing wear\", severity: 8, occurrence: 3 }\n" +
      "let asset: Asset = Asset { id: \"A1\", name: \"Pump 1\", assetClass: \"Pump\", criticality: 5, failureModes: [mode] }\n" +
      "let risk: Risk = Risk { id: \"R1\", failureMode: mode, likelihood: 2, consequence: 4 }\n" +
      "let strategy: Strategy = Strategy { id: \"S1\", name: \"Predictive\" }\n" +
      "let task: MaintenanceTask = MaintenanceTask { id: \"T1\", assetId: \"A1\", title: \"Inspect\", intervalDays: 30 }\n" +
      "let cost: LifecycleCost = LifecycleCost { assetId: \"A1\", acquisitionCost: 1000, operatingCost: 200, maintenanceCost: 50 }\n" +
      "```\n"
    );
    const { env } = await loadEntryModule(entry);
    const values = env.toObject();
    expect(values).toMatchObject({
      asset: { id: "A1", assetClass: "Pump", criticality: 5 },
      risk: { id: "R1", likelihood: 2, consequence: 4, score: null },
      strategy: { id: "S1", targetRiskIds: [] },
      task: { id: "T1", strategyId: null },
      cost: { assetId: "A1", disposalCost: null }
    });
  });
});

describe("Sprint 016 entry inputs and CLI mappings", () => {
  it("runs current entry text through local imports and JSON/CSV validation without writing it", async () => {
    const dir = await makeDir();
    const entryPath = await write(dir, "entry.amx", "saved buffer that must not execute");
    await write(dir, "asset.amx", "```amx\nexport type Asset {\n  id: String\n  value: Number\n}\n```\n");
    await write(dir, "asset.json", '{"id":"A-1","value":4}');
    await write(dir, "assets.csv", "id,value\nA-2,5\n");
    const entryText = [
      "Narrative before source.",
      "",
      "```amx",
      'import { Asset } from "./asset.amx"',
      "input asset: Asset",
      "input assets: Asset[]",
      "let total: Number = asset.value + 1",
      "```",
      ""
    ].join("\n");

    const { env } = await loadEntryModule(entryPath, {
      entryText,
      inputMappings: [`asset=${dir}/asset.json`, `assets=${dir}/assets.csv`]
    });

    expect(env.toObject()).toMatchObject({
      asset: { id: "A-1", value: 4 },
      assets: [{ id: "A-2", value: 5 }],
      total: 5
    });
    expect(await Bun.file(entryPath).text()).toBe("saved buffer that must not execute");
  });

  it("keeps current-buffer validation diagnostics located in the unsaved source", async () => {
    const dir = await makeDir();
    const entryPath = await write(dir, "entry.amx", "saved source");
    await write(dir, "asset.amx", "```amx\nexport type Asset {\n  id: String\n  value: Number\n}\n```\n");
    await write(dir, "invalid.json", '{"id":"A-1"}');
    const entryText = [
      "# Report",
      "",
      "```amx",
      'import { Asset } from "./asset.amx"',
      "input asset: Asset",
      "```",
      ""
    ].join("\n");

    const error = await expectAmxError(loadEntryModule(entryPath, {
      entryText,
      inputMappings: [`asset=${dir}/invalid.json`]
    }), "AMX4003");

    expect(error.diagnostics?.[0].file).toBe(entryPath);
    expect(error.diagnostics?.[0].declarationSource?.line).toBe(5);
  });

  it("enforces entry-root containment for imports from current-buffer text", async () => {
    const dir = await makeDir();
    const entryPath = await write(dir, "entry.amx", "saved source");
    const outside = await writeRootFile("```amx\nexport let secret: Number = 1\n```\n");
    const outsideName = outside.slice(outside.lastIndexOf("/") + 1);
    const entryText = `\`\`\`amx\nimport { secret } from "../${outsideName}"\n\`\`\`\n`;

    const error = await expectAmxError(loadEntryModule(entryPath, { entryText }), "AMX5001");
    expect(error.message).toContain("outside the entry directory tree");
    expect(error.file?.endsWith("/entry.amx")).toBe(true);
    expect(await Bun.file(outside).exists()).toBe(true);
  });

  it("validates and injects JSON inputs before entry evaluation", async () => {
    const dir = await makeDir();
    await write(dir, "values.json", '[2,3,5]');
    const entry = await write(dir, "entry.amx", "```amx\ninput values: Number[]\nlet total: Number = sum(values)\n```\n");
    const { env } = await loadEntryModule(entry, { inputMappings: [`values=${dir}/values.json`] });
    expect(env.toObject()).toEqual({ values: [2, 3, 5], total: 10 });
  });

  it("reports unknown, duplicate, and missing mappings as AMX4001 in stable order", async () => {
    const dir = await makeDir();
    await write(dir, "one.json", '1');
    const entry = await write(dir, "entry.amx", "```amx\ninput first: Number\ninput second: Number\n```\n");
    const error = await expectAmxError(loadEntryModule(entry, {
      inputMappings: [`first=${dir}/one.json`, `first=${dir}/one.json`, `unknown=${dir}/other.json`]
    }), "AMX4001");
    expect(error.diagnostics?.map(item => item.inputName)).toEqual(['first', 'unknown', 'second']);
    await expectAmxError(loadEntryModule(entry, { validation: 'collect' as 'aggregate' }), "AMX4001");
  });

  it("orders failures by input declarations rather than CLI mapping order", async () => {
    const dir = await makeDir();
    await write(dir, "first.json", '"bad"');
    await write(dir, "second.json", 'false');
    const entry = await write(dir, "entry.amx", "```amx\ninput first: Number\ninput second: Number\n```\n");
    const mappings = [`second=${dir}/second.json`, `first=${dir}/first.json`];
    const aggregate = await expectAmxError(loadEntryModule(entry, { inputMappings: mappings }), "AMX4003");
    expect(aggregate.diagnostics?.map(item => item.inputName)).toEqual(['first', 'second']);
    const failFast = await expectAmxError(loadEntryModule(entry, { inputMappings: mappings, validation: 'fail-fast' }), "AMX4003");
    expect(failFast.diagnostics?.map(item => item.inputName)).toEqual(['first']);
  });

  it("prevents evaluation when an input is invalid and rejects inputs in imported modules", async () => {
    const dir = await makeDir();
    await write(dir, "invalid.json", '"not a number"');
    const entry = await write(dir, "entry.amx", "```amx\ninput amount: Number\nlet values: Number[] = []\nlet failure: Number = min(values)\n```\n");
    const inputFailure = await expectAmxError(loadEntryModule(entry, {
      inputMappings: [`amount=${dir}/invalid.json`]
    }), "AMX4003");
    expect(inputFailure.diagnostics?.[0].inputName).toBe('amount');

    await write(dir, "library.amx", "```amx\ninput hidden: Number\n```\n");
    const importing = await write(dir, "importer.amx", "```amx\nimport { absent } from \"./library.amx\"\n```\n");
    await expectAmxError(loadEntryModule(importing), "AMX3005");
  });

  it("validates computed typed records in declaration order and honors fail-fast", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "computed.amx", "```amx\ntype Pair {\n  first: Number\n  second: Number\n}\nlet pair: Pair = Pair { first: 1 / 0, second: 0 / 0 }\n```\n");
    const aggregate = await expectAmxError(loadEntryModule(entry), "AMX4003");
    expect(aggregate.diagnostics?.map(item => item.dataPath)).toEqual(['record Pair.first', 'record Pair.second']);
    expect(aggregate.diagnostics?.every(item => item.fieldSource?.line)).toBe(true);
    const failFast = await expectAmxError(loadEntryModule(entry, { validation: 'fail-fast' }), "AMX4003");
    expect(failFast.diagnostics).toHaveLength(1);
    expect(failFast.diagnostics?.[0].dataPath).toBe('record Pair.first');
  });

  it("does not expose input file paths to expressions or pure functions", async () => {
    const dir = await makeDir();
    await write(dir, "value.json", '3');
    const entry = await write(dir, "entry.amx", "```amx\ninput value: Number\nfn readValue(): Number = value\n```\n");
    await expectAmxError(loadEntryModule(entry, { inputMappings: [`value=${dir}/value.json`] }), "AMX3001");
  });

  it("accepts repeated CLI --input options and preserves no-output run JSON", async () => {
    const dir = await makeDir();
    await write(dir, "first=one.json", '4');
    await write(dir, "second.json", '7');
    const entry = await write(dir, "entry.amx", "```amx\ninput first: Number\ninput second: Number\nlet total: Number = first + second\n```\n");
    const command = Bun.spawnSync([
      'bun', 'run', 'src/cli.ts', 'run', entry,
      '--input', `first=${dir}/first=one.json`, '--input', `second=${dir}/second.json`, '--validation', 'fail-fast'
    ]);
    expect(command.exitCode).toBe(0);
    expect(new TextDecoder().decode(command.stdout)).toContain('"total": 11');
    expect(new TextDecoder().decode(command.stderr)).toBe('');
  });

  it("supports render inputs and keeps V0.2 no-input run behavior", async () => {
    const dir = await makeDir();
    await write(dir, "amount.json", '9');
    const typedEntry = await write(dir, "render.amx", "Total: {{ amount }}\n\n```amx\ninput amount: Number\n```\n");
    const htmlPath = `${dir}/rendered.html`;
    const render = Bun.spawnSync([
      'bun', 'run', 'src/cli.ts', 'render', typedEntry, '--out', htmlPath,
      '--input', `amount=${dir}/amount.json`, '--validation', 'aggregate'
    ]);
    expect(render.exitCode).toBe(0);
    expect(await Bun.file(htmlPath).text()).toContain('Total: 9');

    const legacyEntry = await write(dir, "legacy.amx", "```amx\nlet value = 3\n```\n");
    const run = Bun.spawnSync(['bun', 'run', 'src/cli.ts', 'run', legacyEntry]);
    expect(run.exitCode).toBe(0);
    expect(new TextDecoder().decode(run.stdout)).toContain('"value": 3');
  });

  it("does not write rendered HTML when input validation fails", async () => {
    const dir = await makeDir();
    await write(dir, "invalid.json", '"wrong"');
    const entry = await write(dir, "entry.amx", "```amx\ninput amount: Number\n```\n");
    const htmlPath = `${dir}/must-not-exist.html`;
    const command = Bun.spawnSync([
      'bun', 'run', 'src/cli.ts', 'render', entry, '--out', htmlPath,
      '--input', `amount=${dir}/invalid.json`
    ]);
    expect(command.exitCode).not.toBe(0);
    expect(new TextDecoder().decode(command.stderr)).toContain('AMX4003');
    expect(await Bun.file(htmlPath).exists()).toBe(false);
  });
});

describe("Sprint 021 module visualization boundaries", () => {
  it("returns entry view emissions without adding view names to the binding object", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", `\`\`\`amx\nimport { Asset } from "./assets.amx"\nlet assets: Asset[] = [Asset { id: "A" }]\ntable register = table(assets) {\n  title: "Register"\n  column id as "Asset"\n}\nshow register\n\`\`\`\n`);
    await write(dir, "assets.amx", `\`\`\`amx\nexport type Asset {\n  id: String\n}\n\`\`\`\n`);
    const loaded = await loadEntryModule(entry);
    expect(loaded.viewEmissions).toHaveLength(1);
    expect(loaded.viewEmissions[0]).toMatchObject({
      name: 'register', documentNodeIndex: 0, statementIndex: 3, data: [{ id: 'A' }]
    });
    expect(loaded.env.toObject()).toEqual({ assets: [{ id: 'A' }] });
  });

  it("rejects view declarations in imported modules", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", `\`\`\`amx\nimport { Asset } from "./assets.amx"\n\`\`\`\n`);
    await write(dir, "assets.amx", `\`\`\`amx\nexport type Asset {\n  id: String\n}\nexport let assets: Asset[] = []\ntable privateView = table(assets) {\n  title: "Private"\n  column id as "Asset"\n}\n\`\`\`\n`);
    const error = await expectAmxError(loadEntryModule(entry), 'AMX3005');
    expect(error.message).toContain('entry module');
    expect(error.file).toContain('assets.amx');
  });
});
