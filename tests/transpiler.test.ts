import { describe, expect, it } from 'bun:test';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { safeNarrativeComments } from '../src/transpiler/source';
import { transpileDocument } from '../src/transpiler';

describe('transpiler source comments', () => {
  it('encodes prose as inert one-line comments across source separators', () => {
    expect(safeNarrativeComments('first\r\n//# directive\rthird\u2028fourth\u2029last'))
      .toEqual(['// first', '// //# directive', '// third', '// fourth', '// last']);
  });

  it('emits narrative-only documents through the typed source API', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'entry.amx', outputPath: 'entry.ts',
        sourceText: 'A report title\n{{ expression }}', resolvedImports: []
      }]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.modules[0].code).toContain('// {{ expression }}');
    expect(result.modules[0].code).toContain('openamx/transpiler-runtime');
    expect(result.modules[0].code).toContain('AMXRunInputs = Readonly<Record<string, never>>');
  });

  it('returns checker diagnostics without partial generated modules', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'entry.amx', outputPath: 'entry.ts',
        sourceText: '```amx\nlet value: String = 1\n```', resolvedImports: []
      }]
    });
    expect(result).toMatchObject({ ok: false, diagnostics: [{ code: 'AMX3002', file: 'entry.amx' }] });
    expect(result.ok && 'modules' in result).toBe(false);
  });

  it('attaches source identity to parser failures', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'broken.amx', outputPath: 'broken.ts', resolvedImports: [],
        sourceText: '```amx\nlet value: String = "unterminated\n```'
      }]
    });
    expect(result).toMatchObject({
      ok: false,
      diagnostics: [{ code: 'AMX3006', file: 'broken.amx', line: 2 }]
    });
  });

  it('lowers records, enums, functions, matches, loops, and constructors', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'ast.amx', outputPath: 'ast.ts', resolvedImports: [],
        sourceText: [
          '```amx', 'type Point {', '  x: Number', '  y: Number', '}',
          'enum State = {', '  READY', '  FAILED', '}',
          'fn square(value: Number): Number = value ^ 2',
          'let values: Number[] = for item in [1 to 3] {', '  return square(item)', '}',
          'let selected: Number = match true {', '  case true => 7', '  default => 0', '}',
          'let point: Point = Point { x = values[1], y = selected }',
          'export let result: Number = point.x + point.y', '```'
        ].join('\n')
      }]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const code = result.modules[0].code;
    expect(code).toContain('interface __amx_');
    expect(code).toContain('function __amx_');
    expect(code).toContain('Object.freeze({');
    expect(code).toContain('__amxIterate<number>');
    expect(code).toContain('new Map<string, unknown>');
  });

  it('emits resolved imports in dependency-first initialization order', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [
        {
          moduleId: 'entry', sourcePath: 'project/main.amx', outputPath: 'gen/reports/main.ts',
          sourceText: '```amx\nimport { base, double } from "../lib.amx"\nexport let total: Number = double(base)\n```',
          resolvedImports: [{ importPath: '../lib.amx', moduleId: 'lib' }]
        },
        {
          moduleId: 'lib', sourcePath: 'project/lib.amx', outputPath: 'gen/lib.ts',
          sourceText: '```amx\nexport let base: Number = 5\nexport fn double(value: Number): Number = value * 2\n```',
          resolvedImports: []
        }
      ]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.modules.map(module => module.moduleId)).toEqual(['lib', 'entry']);
    expect(result.modules[1].code).toContain('from "../lib.ts"');
    expect(result.modules[1].code).toContain('__amxInitialize as __amxInit_');
  });

  it('rejects cyclic, missing-target, and unreachable in-memory graphs', () => {
    const cycle = transpileDocument({
      entryModuleId: 'entry',
      modules: [
        {
          moduleId: 'entry', sourcePath: 'entry.amx', outputPath: 'entry.ts',
          sourceText: '```amx\nimport { value } from "./dep.amx"\n```',
          resolvedImports: [{ importPath: './dep.amx', moduleId: 'dep' }]
        },
        {
          moduleId: 'dep', sourcePath: 'dep.amx', outputPath: 'dep.ts',
          sourceText: '```amx\nimport { value } from "./entry.amx"\nexport let value: Number = 1\n```',
          resolvedImports: [{ importPath: './entry.amx', moduleId: 'entry' }]
        }
      ]
    });
    expect(cycle).toMatchObject({ ok: false, diagnostics: [{ code: 'AMX5003', file: 'entry.amx' }] });

    const missingTarget = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'entry.amx', outputPath: 'entry.ts',
        sourceText: '```amx\nimport { value } from "./dep.amx"\n```',
        resolvedImports: [{ importPath: './dep.amx', moduleId: 'missing' }]
      }]
    });
    expect(missingTarget).toMatchObject({ ok: false, diagnostics: [{ code: 'AMX5001', file: 'entry.amx' }] });

    const unreachable = transpileDocument({
      entryModuleId: 'entry',
      modules: [
        { moduleId: 'entry', sourcePath: 'entry.amx', outputPath: 'entry.ts', sourceText: '', resolvedImports: [] },
        { moduleId: 'unused', sourcePath: 'unused.amx', outputPath: 'unused.ts', sourceText: '', resolvedImports: [] }
      ]
    });
    expect(unreachable).toMatchObject({ ok: false, diagnostics: [{ code: 'AMX5001', file: 'unused.amx' }] });
  });

  it('marks imported list mutation helpers immutable', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [
        {
          moduleId: 'entry', sourcePath: 'project/main.amx', outputPath: 'main.ts',
          sourceText: '```amx\nimport { values } from "./lib.amx"\nadd 2 to values\n```',
          resolvedImports: [{ importPath: './lib.amx', moduleId: 'lib' }]
        },
        {
          moduleId: 'lib', sourcePath: 'project/lib.amx', outputPath: 'lib.ts',
          sourceText: '```amx\nexport let values: Number[] = [1]\n```', resolvedImports: []
        }
      ]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.modules[1].code).toContain('targetName: "values", mutable: false');
  });

  it('emits recursive input descriptors for imported records', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [
        {
          moduleId: 'entry', sourcePath: 'project/main.amx', outputPath: 'gen/main.ts',
          sourceText: '```amx\nimport { Payload } from "./types.amx"\ninput payload: Payload\nexport let amount: Number = payload.amount\n```',
          resolvedImports: [{ importPath: './types.amx', moduleId: 'types' }]
        },
        {
          moduleId: 'types', sourcePath: 'project/types.amx', outputPath: 'gen/types.ts',
          sourceText: '```amx\nexport type Payload {\n  amount: Number\n  note?: String?\n}\n```', resolvedImports: []
        }
      ]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const entryCode = result.modules[1].code;
    expect(entryCode).toContain('payload: __AMXExternal_');
    expect(entryCode).toContain('recordName: "Payload"');
    expect(entryCode).toContain("kind: 'number'");
    expect(entryCode).toContain('__amxValidateValue<__AMXValidatedInputs>');
    expect(result.modules[0].code).toContain('export interface __AMXExternal_');
  });

  it('uses declaration-visible units for imported measurement record inputs', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [
        {
          moduleId: 'entry', sourcePath: 'project/main.amx', outputPath: 'main.ts',
          sourceText: '```amx\nimport { Payload } from "./types.amx"\ninput payload: Payload\nexport let ready: Boolean = true\n```',
          resolvedImports: [{ importPath: './types.amx', moduleId: 'types' }]
        },
        {
          moduleId: 'types', sourcePath: 'project/types.amx', outputPath: 'types.ts',
          sourceText: '```amx\nimport { Length, meter, centimeter } from "./units.amx"\nexport type Payload {\n  distance: Length\n}\n```',
          resolvedImports: [{ importPath: './units.amx', moduleId: 'units' }]
        },
        {
          moduleId: 'units', sourcePath: 'project/units.amx', outputPath: 'units.ts',
          sourceText: '```amx\nexport dimension Length\nexport unit meter: Length\nexport unit centimeter = 0.01 * meter\n```',
          resolvedImports: []
        }
      ]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const entryCode = result.modules.find(module => module.moduleId === 'entry')!.code;
    expect(entryCode).toContain('dimensionName: "Length"');
    expect(entryCode).toContain('"meter": { identity:');
    expect(entryCode).toContain('"centimeter": { identity:');
  });

  it('mangles wrapper-like AMX names and is deterministic across checkout roots', () => {
    const make = (sourcePath: string) => transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath, outputPath: 'generated/main.ts', resolvedImports: [],
        sourceText: '```amx\nexport let run: Number = 1\nexport let AMXRunInputs: Number = 2\nexport let AMXRunExports: Number = 3\n```'
      }]
    });
    const first = make('C:/worktree-one/main.amx');
    const second = make('D:/worktree-two/main.amx');
    expect(first).toMatchObject({ ok: true });
    expect(second).toMatchObject({ ok: true });
    if (!first.ok || !second.ok) return;
    expect(first.modules[0].code).toBe(second.modules[0].code);
    expect(first.modules[0].code).toContain('"run":');
    expect(first.modules[0].code).toContain('"AMXRunInputs":');
    expect(first.modules[0].code).toContain('"AMXRunExports":');
    expect(first.modules[0].code).not.toContain('C:/worktree-one');
    expect(first.modules[0].code).not.toContain('D:/worktree-two');
  });

  it('emits table/chart snapshots and structured-v2 diagram declarations', () => {
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'views.amx', outputPath: 'views.ts', resolvedImports: [],
        sourceText: [
          '```amx', 'type Row {', '  x: Number', '  y: Number', '}',
          'let rows: Row[] = [Row { x = 1, y = 2 }]', 'let labels: String[] = ["A"]', 'let values: Number[] = [2]',
          'table data = table(rows) {', '  title: "Rows"', '  column x as "X"', '  column y as "Y"', '}',
          'chart trend = column(values) {', '  title: "Trend"', '  description: "Values"', '  labels: labels', '  series "Load"', '  showTable true', '}',
          'show data', 'show trend',
          'diagram scene {', '  title: "Scene"', '  description: "Initial frame"', '  width: 10', '  height: 10',
          '  time t from 0 to 1 duration 1',
          '  for item in values {', '    if item > 1 {', '      circle point {', '        cx: item', '        cy: t', '        r: 2', '        stroke: "#263238"', '        lineWidth: 1', '      }', '    }', '  }', '}', '```'
        ].join('\n')
      }]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const code = result.modules[0].code;
    expect(code).toContain('__amxTableView("data"');
    expect(code).toContain('__amxChartView({ name: "trend"');
    expect(code).toContain('schema: \'structured-v2\'');
    expect(code).toContain('Number of elements in this diagram exceed the maximum (64)');
  });

  it('generates a strict multi-module oracle fixture with recursive inputs and ordered view parity', async () => {
    const unitsSource = [
      '```amx', 'export dimension Length', 'export unit meter: Length',
      'export unit centimeter = 0.01 * meter', '```', ''
    ].join('\n');
    const typesSource = [
      '```amx', 'import { Length, meter, centimeter } from "./units.amx"',
      'export enum Status = {', '  READY = "ready"', '  FAILED = "failed"', '}',
      'export enum Priority = {', '  LOW = 1', '  HIGH = 2', '}',
      'export type BaseRow {', '  label: String', '}',
      'export type Row extends BaseRow {', '  override label: String', '  value: Length', '  rating: Number = 7', '  measuredAt: DateTime', '  note?: String?', '}',
      'export type Payload {', '  distance: Length', '  status: Status', '  priority: Priority', '  observedAt: DateTime', '  locations: Row[]', '  labels: String?[]', '}',
      'diagram importedScene {',
      '  title: "Imported"', '  description: "Dependency frame"', '  width: 20', '  height: 10', '  time t from 0 to 1 duration 1',
      '  line axis {', '    x1: 0', '    y1: 0', '    x2: 10', '    y2: 10', '    stroke: "#263238"', '    lineWidth: 1', '    arrow: "end"', '  }',
      '  rectangle plate {', '    x: 1', '    y: 1', '    width: 4', '    height: 2', '    stroke: "#263238"', '    fill: "#ffffff"', '    lineWidth: 1', '  }',
      '  circle hub {', '    cx: 5', '    cy: 5', '    r: 1', '    stroke: "#263238"', '    lineWidth: 1', '  }',
      '  text caption {', '    x: 2', '    y: 2', '    value: "Dependency"', '    fill: "#263238"', '  }',
      '}',
      '```', ''
    ].join('\n');
    const source = [
      '---', 'title: Calculation', '---', 'This stays literal: {{ 1 + 1 }}', '```amx',
      'import { Payload, Priority, Row, Status } from "./types.amx"',
      'import { Length, meter, centimeter } from "./units.amx"',
      'input payload: Payload',
      'fn square(value: Number): Number = value ^ 2',
      'fn adjust(count: Number): Number {',
      '  let total = count',
      '  total = total + 1',
      '  count += 2',
      '  return total + count',
      '}',
      'let values: Number[] = for item in [1 to 3] {', '  return square(item)', '}',
      'let selected: Number = match 1 {', '  case 1 => values[1]', '  default => 0', '}',
      'let ready: Boolean = payload.status is Status',
      'let total: Number = sum(values)',
      'let totalText: String = "Total ${total}"',
      'let rows: Row[] = [Row { label = "A", value = 1 meter, measuredAt = "2024-02-29T12:30:00Z" }, Row { label = "B", value = 200 centimeter, measuredAt = "2024-02-29T13:30:00Z" }]',
      'table data = table(rows) {', '  title: "Rows"', '  column label as "Label"', '  column value as "Value"', '}',
      'chart trend = column(rows) {', '  title: "Trend"', '  description: "Values"', '  category: label', '  series value as "Load"', '  showTable total > 0', '}',
      'chart barTrend = bar(rows) {', '  title: "Bar"', '  description: "Ratings"', '  category: label', '  series rating as "Rating"', '}',
      'chart lineTrend = line(rows) {', '  title: "Line"', '  description: "Timeline"', '  x: measuredAt', '  series rating as "Rating"', '}',
      'chart scatterTrend = scatter(rows) {', '  title: "Scatter"', '  description: "Coordinates"', '  x: rating', '  y: rating', '  group: label', '}',
      'let scalarValues: Number[] = [1, 2]',
      'let scalarLabels: String[] = ["One", "Two"]',
      'chart scalarTrend = bar(scalarValues) {', '  title: "Scalar"', '  description: "Labels"', '  labels: scalarLabels', '  series "Value"', '}',
      'show data', 'add Row { label = "C", value = 3 meter, measuredAt = "2024-02-29T14:30:00Z" } to rows at 2', 'show data',
      'export let distanceMeters: Number = payload.distance / 1 meter',
      'export let converted: Length = payload.distance in centimeter',
      'export let result: Number = total + selected + distanceMeters + adjust(2)',
      'export let summary: String = totalText',
      'export let observedAt: DateTime = payload.observedAt',
      'export let firstLocationRating: Number = payload.locations[1].rating',
      'export let firstLocationNote: String? = payload.locations[1].note',
      'export let secondLabel: String? = payload.labels[2]',
      'diagram scene {', '  title: "Scene"', '  description: "Initial frame"', '  width: 100', '  height: 50', '  time t from 0 to 1 duration 1',
      '  for item in values {', '    if item > 2 {', '      circle point {', '        cx: item * 10', '        cy: t', '        r: 2', '        stroke: "#263238"', '        lineWidth: 1',
      '      }', '    }', '  }',
      '}', 'show trend',
      'show barTrend', 'show lineTrend', 'show scatterTrend', 'show scalarTrend',
      'export let readyExport: Boolean = ready',
      'export let distanceMetersAgain: Number = distanceMeters',
      '```', ''
    ].join('\n');
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [
        {
          moduleId: 'entry', sourcePath: 'project/main.amx', outputPath: 'main.ts', sourceText: source,
          resolvedImports: [
            { importPath: './types.amx', moduleId: 'types' },
            { importPath: './units.amx', moduleId: 'units' }
          ]
        },
        {
          moduleId: 'types', sourcePath: 'project/types.amx', outputPath: 'types.ts', sourceText: typesSource,
          resolvedImports: [{ importPath: './units.amx', moduleId: 'units' }]
        },
        { moduleId: 'units', sourcePath: 'project/units.amx', outputPath: 'units.ts', sourceText: unitsSource, resolvedImports: [] }
      ]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const entryCode = result.modules.find(module => module.moduleId === 'entry')!.code;
    const typesCode = result.modules.find(module => module.moduleId === 'types')!.code;
    expect(entryCode).toContain('// This stays literal: {{ 1 + 1 }}');
    expect(entryCode).toContain('__amxDiagramView(');
    expect(typesCode).toContain('__AMXMeasurementInput<"Length">');
    expect(entryCode.split('\n').filter(line => line.includes('1 + 1')).every(line => line.trimStart().startsWith('//'))).toBe(true);

    const artifactRoot = process.env.OPENAMX_S123_ARTIFACT_ROOT
      ? join(process.cwd(), process.env.OPENAMX_S123_ARTIFACT_ROOT)
      : join(process.cwd(), 'planning', 'sprints', '0123-v20-core-document-ast-emitter', 'artifacts', 'run-01');
    const fixtureDirectory = join(artifactRoot, 'fixtures');
    await mkdir(fixtureDirectory, { recursive: true });
    await Bun.write(join(fixtureDirectory, 'main.amx'), source);
    await Bun.write(join(fixtureDirectory, 'types.amx'), typesSource);
    await Bun.write(join(fixtureDirectory, 'units.amx'), unitsSource);
    await Bun.write(join(fixtureDirectory, 'payload.json'), JSON.stringify({
      distance: { value: 1.5, unit: 'meter' }, status: 'ready', priority: 2,
      observedAt: '2024-02-29T12:30:00Z',
      locations: [{ label: 'Site A', value: { value: 500, unit: 'centimeter' }, measuredAt: '2024-02-29T12:30:00Z' }],
      labels: ['First', null]
    }));
    await Bun.write(join(fixtureDirectory, 'invalid-payload.json'), JSON.stringify({
      distance: { value: 1.5, unit: 'meter' }, status: 'unknown', priority: 2,
      observedAt: '2024-02-29T12:30:00Z',
      locations: [{ label: 'Site A', value: { value: 500, unit: 'centimeter' }, measuredAt: '2024-02-29T12:30:00Z' }],
      labels: ['First', null]
    }));
    for (const module of result.modules) {
      const target = join(fixtureDirectory, module.outputPath);
      await mkdir(dirname(target), { recursive: true });
      await Bun.write(target, module.code);
    }
    await Bun.write(join(fixtureDirectory, 'oracle.ts'), [
      "import { deepStrictEqual } from 'node:assert/strict';",
      "import { dirname, join } from 'node:path';",
      "import { fileURLToPath } from 'node:url';",
      "import { loadEntryModule } from '../../../../../../src/runtime/moduleLoader.ts';",
      "import { run } from './main.ts';",
      'const directory = dirname(fileURLToPath(import.meta.url));',
      'const amx = await loadEntryModule(join(directory, "main.amx"), { inputMappings: [`payload=${join(directory, "payload.json")}`] });',
      'const payload = { payload: { distance: { value: 1.5, unit: "meter" }, status: "ready", priority: 2, observedAt: "2024-02-29T12:30:00Z", locations: [{ label: "Site A", value: { value: 500, unit: "centimeter" }, measuredAt: "2024-02-29T12:30:00Z" }], labels: ["First", null] } } as unknown as Parameters<typeof run>[0];',
      'const generated = run(payload);',
      'const replay = run(payload);',
      'if (replay.exports === generated.exports || replay.views === generated.views) throw new Error("Generated run state was reused");',
      'function normalizeVector(vector: unknown): unknown { if (!vector || typeof vector !== "object") return vector; return Object.fromEntries(Object.entries(vector).map(([identity, exponent]) => { let name = identity; try { const key = JSON.parse(identity) as unknown; if (Array.isArray(key) && typeof key[1] === "string") name = key[1]; } catch {} return [name, exponent]; })); }',
      'function normalize(value: unknown): unknown { if (Array.isArray(value)) return value.map(normalize); if (!value || typeof value !== "object") return value; const result: Record<string, unknown> = {}; for (const [key, item] of Object.entries(value)) { if (key === "vector") result[key] = normalizeVector(item); else if (key === "factors" && Array.isArray(item)) result[key] = item.map(factor => { const entry = factor as { name: string; exponent: number }; return { name: entry.name, exponent: entry.exponent }; }); else result[key] = normalize(item); } return result; }',
      'deepStrictEqual(normalize(generated.exports), normalize({ result: amx.env.get("result"), readyExport: amx.env.get("readyExport"), distanceMeters: amx.env.get("distanceMeters"), converted: amx.env.get("converted"), summary: amx.env.get("summary"), observedAt: amx.env.get("observedAt"), firstLocationRating: amx.env.get("firstLocationRating"), firstLocationNote: amx.env.get("firstLocationNote"), secondLabel: amx.env.get("secondLabel"), distanceMetersAgain: amx.env.get("distanceMetersAgain") }));',
      'const events: Array<{ moduleOrder: number; documentNodeIndex: number; statementIndex: number; view: unknown }> = [];',
      'for (const emission of amx.viewEmissions) {',
      '  if (emission.kind === "table") {',
      '    const columns = emission.declaration.options.filter(option => option.type === "tableColumnOption").map(option => ({ field: option.field, label: option.label }));',
      '    const title = emission.declaration.options.find(option => option.type === "viewTitleOption")?.value ?? emission.name;',
      '    const rows = emission.data.map(item => columns.map(column => (item as Record<string, unknown>)[column.field] ?? null));',
      '    events.push({ moduleOrder: 1, documentNodeIndex: emission.documentNodeIndex, statementIndex: emission.statementIndex, view: { kind: "table", name: emission.name, title, description: "", columns, rows } });',
      '  } else {',
      '    const title = emission.declaration.options.find(option => option.type === "viewTitleOption")?.value ?? emission.name;',
      '    const description = emission.declaration.options.find(option => option.type === "viewDescriptionOption")?.value ?? "";',
      '    events.push({ moduleOrder: 1, documentNodeIndex: emission.documentNodeIndex, statementIndex: emission.statementIndex, view: { kind: "chart", name: emission.name, chartKind: emission.declaration.kind, title, description, data: emission.data, ...(emission.labels === undefined ? {} : { labels: emission.labels }), ...(emission.headings === undefined ? {} : { headings: emission.headings }), ...(emission.measurementDescriptors?.length ? { measurementDescriptors: emission.measurementDescriptors } : {}), showTable: emission.showTable } });',
      '  }',
      '}',
      'for (const { model } of amx.diagramEmissions) {',
      '  const elements = model.initialFrame.elements.map(element => { const { source, ...primitive } = element; return primitive; });',
      '  events.push({ moduleOrder: model.file?.endsWith("types.amx") ? 0 : 1, documentNodeIndex: model.documentNodeIndex, statementIndex: model.statementIndex, view: { kind: "diagram", schema: "structured-v2", name: model.name, title: model.title, description: model.description, canvas: model.canvas, timeline: model.timeline, initialFrame: { time: model.initialFrame.time, elements } } });',
      '}',
      'events.sort((left, right) => left.moduleOrder - right.moduleOrder || left.documentNodeIndex - right.documentNodeIndex || left.statementIndex - right.statementIndex);',
      'deepStrictEqual(normalize(generated.views), normalize(events.map(event => event.view)));',
      'let generatedInputCode = ""; try { run({ payload: { distance: { value: 1.5, unit: "meter" }, status: "unknown" } } as unknown as Parameters<typeof run>[0]); } catch (error) { generatedInputCode = (error as { code?: string }).code ?? ""; }',
      'let amxInputCode = ""; try { await loadEntryModule(join(directory, "main.amx"), { inputMappings: [`payload=${join(directory, "invalid-payload.json")}`] }); } catch (error) { amxInputCode = (error as { code?: string }).code ?? ""; }',
      'if (generatedInputCode !== "AMX4003" || amxInputCode !== generatedInputCode) throw new Error(`Input diagnostic mismatch: ${generatedInputCode} !== ${amxInputCode}`);',
      'console.log(JSON.stringify({ exports: generated.exports, views: generated.views, generatedInputCode, amxInputCode }));',
      ''
    ].join('\n'));
  });
});
