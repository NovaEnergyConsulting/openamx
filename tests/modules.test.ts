/**
 * Sprint 015 module/function focused tests: pure functions, local imports/exports,
 * deterministic loading, isolation, diagnostics, and the opt-in Asset Management library.
 */

import { describe, it, expect, afterEach } from "bun:test";
import { rm, mkdir } from "fs/promises";
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
