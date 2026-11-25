import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadEntryModule } from '../../../../../../src/runtime/moduleLoader.ts';
import type { DiagramEmission, ViewEmission } from '../../../../../../src/runtime/environment.ts';
import {
  AMXInputError,
  amxAttach,
  amxBinary,
  type AMXDiagramPrimitiveElement,
  type AMXMeasurement,
  type AMXShownView,
  type AMXViewData
} from 'openamx/transpiler-runtime';
import { run, type AMXRunInputs } from './main.ts';

interface RuntimeMeasurement {
  readonly value: number;
  readonly unit: {
    readonly text: string;
    readonly vector: Readonly<Record<string, number>>;
  };
}

interface RuntimeDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly inputName?: string;
  readonly dataPath?: string;
  readonly expected?: string;
  readonly actual?: string;
}

const validInputs: AMXRunInputs = {
  amount: 5,
  status: 'ready',
  priority: 2,
  distance: { value: 1, unit: 'kilometer' },
  rows: [
      { status: 'ready', priority: 1, amount: 2 },
      { status: 'failed', priority: 2, amount: 4, note: null }
  ]
};

const celsius = {
  identity: 'ThermodynamicTemperature', name: 'celsius', scale: 1, offset: 273.15,
  vector: { ThermodynamicTemperature: 1 },
  factors: [{ identity: 'celsius', name: 'celsius', exponent: 1 }]
} as const;

const amxSource = [
  '```amx',
  'import { Length, meter, kilometer, ThermodynamicTemperature, kelvin, celsius, Status, Priority, Row } from "./definitions.amx"',
  'input amount: Number',
  'input status: Status',
  'input priority: Priority',
  'input distance: Length',
  'input rows: Row[]',
  'let rowAmounts: Number[] = [rows[1].amount, rows[2].amount]',
  'let total = amount + sum(rowAmounts)',
  'let distanceMeters = distance in meter',
  'let temperatureDelta = 20 celsius - 10 celsius',
  'let distanceText = "Distance ${distance}"',
  'let chartDistances: Length[] = [1 kilometer, 500 meter]',
  'let distanceLabels: String[] = ["input", "comparison"]',
  'table rowsTable = table(rows) {',
  '  title: "Input rows"',
  '  column amount as "Amount"',
  '  column tag as "Tag"',
  '  column note as "Note"',
  '}',
  'chart distanceChart = line(chartDistances) {',
  '  title: "Distance"',
  '  description: "Normalized measurements"',
  '  series "Distance"',
  '  labels: distanceLabels',
  '  showTable false',
  '}',
  'show rowsTable',
  'show distanceChart',
  '```',
  ''
].join('\n');

const definitionsSource = [
  '```amx',
  'export dimension Length',
  'export unit meter: Length',
  'export unit kilometer = 1000 * meter',
  'export dimension ThermodynamicTemperature',
  'export unit kelvin: ThermodynamicTemperature',
  'export unit celsius = kelvin + 273.15',
  'export enum Status = {',
  '  READY = "ready",',
  '  FAILED = "failed"',
  '}',
  'export enum Priority = {',
  '  LOW = 1,',
  '  HIGH = 2',
  '}',
  'export type Row {',
  '  status: Status',
  '  priority: Priority',
  '  amount: Number',
  '  tag: String = "default"',
  '  note?: String?',
  '}',
  'diagram scene {',
  '  title: "Scene"',
  '  description: "Initial frame"',
  '  width: 100',
  '  height: 80',
  '  time time from 0 to 1 duration 1',
  '  line axis {',
  '    x1: 0',
  '    y1: 0',
  '    x2: 10',
  '    y2: 10',
  '    stroke: "#111111"',
  '    lineWidth: 1',
  '    arrow: "none"',
  '  }',
  '  rectangle block {',
  '    x: 2',
  '    y: 3',
  '    width: 4',
  '    height: 5',
  '    stroke: "#222222"',
  '    fill: "#eeeeee"',
  '    lineWidth: 1',
  '  }',
  '  circle pivot {',
  '    cx: 5',
  '    cy: 6',
  '    r: 2',
  '    stroke: "#333333"',
  '    fill: "#ffffff"',
  '    lineWidth: 1',
  '  }',
  '  text label {',
  '    x: 7',
  '    y: 8',
  '    value: "AMX"',
  '    fill: "#444444"',
  '  }',
  '}',
  '```',
  ''
].join('\n');

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'openamx-s122-oracle-'));
try {
  const entryPath = join(temporaryDirectory, 'entry.amx');
  await writeFile(join(temporaryDirectory, 'definitions.amx'), definitionsSource, 'utf8');
  await writeFile(entryPath, amxSource, 'utf8');
  const inputPaths = {
    amount: await writeJson('amount.json', validInputs.amount),
    status: await writeJson('status.json', validInputs.status),
    priority: await writeJson('priority.json', validInputs.priority),
    distance: await writeJson('distance.json', validInputs.distance),
    rows: await writeJson('rows.json', validInputs.rows)
  };
  const loaded = await loadEntryModule(entryPath, {
    inputMappings: Object.entries(inputPaths).map(([name, path]) => `${name}=${path}`)
  });
  const bindings = loaded.env.toObject();
  const dimensionNames = new Map(
    [...loaded.registry.dimensions].map(([name, dimension]) => [dimension.baseIdentity!, name])
  );
  const unitNames = new Map(
    [...loaded.registry.units.values()].map(unit => [unit.identity, unit.declarationName])
  );
  const generated = run(validInputs);
   const generatedAgain = run(validInputs);
   if (generated === generatedAgain || generated.views === generatedAgain.views
     || generated.views[0] === generatedAgain.views[0]) {
     throw new Error('Generated run did not return fresh result and view state.');
   }
  const reference = {
    exports: {
      total: bindings.total,
      status: bindings.status,
      priority: bindings.priority,
      distanceMeters: normalizedMeasurement(bindings.distanceMeters as RuntimeMeasurement, dimensionNames),
      temperatureDelta: normalizedMeasurement(bindings.temperatureDelta as RuntimeMeasurement, dimensionNames),
      distanceText: bindings.distanceText
    },
    views: normalizeViews(loaded.viewEmissions, loaded.diagramEmissions, dimensionNames, unitNames)
  };
  const actual = {
    exports: {
      total: generated.exports.total,
      status: generated.exports.status,
      priority: generated.exports.priority,
      distanceMeters: normalizedMeasurement(generated.exports.distanceMeters, dimensionNames),
      temperatureDelta: normalizedMeasurement(generated.exports.temperatureDelta, dimensionNames),
      distanceText: generated.exports.distanceText
    },
    views: generated.views
  };
  assertEqual(actual, reference, 'generated outputs and ordered views');

  const invalidCases = [
    { name: 'status', value: 1, path: 'status' },
    { name: 'priority', value: '2', path: 'priority' },
    {
      name: 'rows',
      value: [{ status: 1, priority: 1, amount: 2 }, validInputs.rows[1]],
      path: 'rows/0/status'
    }
  ] as const;
  const invalidResults = [];
  for (const invalidCase of invalidCases) {
    const invalidInputs = { ...validInputs, [invalidCase.name]: invalidCase.value } as unknown as AMXRunInputs;
    const generatedError = captureError(() => run(invalidInputs));
    if (!(generatedError instanceof AMXInputError)) throw generatedError;
    if (generatedError.code !== 'AMX4003' || generatedError.inputPath !== invalidCase.path) {
      throw new Error(`Generated validation mismatch for ${invalidCase.name}: ${JSON.stringify(generatedError.diagnostic)}`);
    }

    const invalidPath = await writeJson(`invalid-${invalidCase.name}.json`, invalidCase.value);
    const amxError = await captureAsyncError(() => loadEntryModule(entryPath, {
      inputMappings: Object.entries({ ...inputPaths, [invalidCase.name]: invalidPath })
        .map(([name, path]) => `${name}=${path}`)
    }));
    const diagnostic = readDiagnostic(amxError);
    const amxPath = `${diagnostic.inputName ?? ''}${diagnostic.dataPath ?? ''}`;
    if (diagnostic.code !== 'AMX4003' || amxPath !== invalidCase.path) {
      throw new Error(`AMX input validation mismatch for ${invalidCase.name}: ${JSON.stringify(diagnostic)}`);
    }
    invalidResults.push({ name: invalidCase.name, path: invalidCase.path, generated: generatedError.diagnostic, amx: diagnostic });
  }

  const missingAmount = Object.fromEntries(Object.entries(validInputs).filter(([name]) => name !== 'amount')) as unknown as AMXRunInputs;
   const unknownInput = { ...validInputs, unexpected: true } as unknown as AMXRunInputs;
   const topLevelErrors = [
     { name: 'missing amount', inputs: missingAmount, path: 'amount' },
     { name: 'unknown input', inputs: unknownInput, path: 'inputs/unexpected' }
   ].map(item => {
     const error = captureError(() => run(item.inputs));
     if (!(error instanceof AMXInputError) || error.code !== 'AMX4003' || error.inputPath !== item.path) {
       throw new Error(`Top-level input mismatch for ${item.name}: ${JSON.stringify((error as Error).message)}`);
     }
     return { name: item.name, path: item.path, error: error.diagnostic };
   });

  const generatedAffineError = captureError(() => amxBinary(
    '+',
    amxAttach(20, celsius),
    amxAttach(10, celsius),
    { file: 'affine.amx', line: 4, column: 15 }
  ));
  const affinePath = join(temporaryDirectory, 'affine.amx');
  await writeFile(affinePath, [
    '```amx',
    'dimension ThermodynamicTemperature',
    'unit kelvin: ThermodynamicTemperature',
    'unit celsius = kelvin + 273.15',
    'let invalid = 20 celsius + 10 celsius',
    '```',
    ''
  ].join('\n'), 'utf8');
  const amxAffineError = await captureAsyncError(() => loadEntryModule(affinePath));
  if (!('code' in amxAffineError) || typeof amxAffineError.code !== 'string'
    || !('code' in generatedAffineError) || generatedAffineError.code !== amxAffineError.code
    || generatedAffineError.message !== amxAffineError.message) {
    throw new Error(`Affine diagnostic mismatch: ${JSON.stringify({ generatedAffineError, amxAffineError })}`);
  }

  const result = {
    status: 'PASS',
    outputsAndViews: { actual, reference },
    invalidInputs: invalidResults,
    topLevelErrors,
    repeatedRunFreshness: 'PASS',
    affineDiagnostic: {
      generated: { code: generatedAffineError.code, message: generatedAffineError.message },
      amx: { code: amxAffineError.code, message: amxAffineError.message }
    }
  };
  const resultPath = fileURLToPath(new URL('../oracle-result.json', import.meta.url));
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

async function writeJson(name: string, value: unknown): Promise<string> {
  const path = join(temporaryDirectory, name);
  await writeFile(path, JSON.stringify(value), 'utf8');
  return path;
}

function normalizedMeasurement(
  value: AMXMeasurement | RuntimeMeasurement,
  dimensionNames: ReadonlyMap<string, string>
) {
  return {
    value: value.value,
    unit: value.unit.text,
    vector: Object.fromEntries(Object.entries(value.unit.vector).map(([identity, exponent]) => [
      dimensionNames.get(identity) ?? identity,
      exponent
    ]))
  };
}

function normalizeViews(
  emissions: readonly ViewEmission[],
  diagrams: readonly DiagramEmission[],
  dimensionNames: ReadonlyMap<string, string>,
  unitNames: ReadonlyMap<string, string>
): readonly AMXShownView[] {
  const events: Array<{ moduleOrder: number; documentNodeIndex: number; statementIndex: number; view: AMXShownView }> = [];
  for (const emission of emissions) {
    const titleOption = emission.declaration.options.find(option => option.type === 'viewTitleOption');
    const descriptionOption = emission.declaration.options.find(option => option.type === 'viewDescriptionOption');
    const title = titleOption?.type === 'viewTitleOption' ? titleOption.value : emission.name;
    const description = descriptionOption?.type === 'viewDescriptionOption'
      ? descriptionOption.value
      : (emission.kind === 'chart' ? `${emission.declaration.kind} chart` : '');
    if (emission.kind === 'table') {
      const columns = emission.declaration.options.flatMap(option => option.type === 'tableColumnOption'
        ? [{ field: option.field, label: option.label }]
        : []);
      const rows = emission.data.map(item => {
        const record = item as Readonly<Record<string, AMXViewData>>;
        return columns.map(column => record[column.field] ?? null);
      });
      events.push({
        moduleOrder: 1,
        documentNodeIndex: emission.documentNodeIndex,
        statementIndex: emission.statementIndex,
        view: { kind: 'table', name: emission.name, title, description, columns, rows }
      });
      continue;
    }
    events.push({
      moduleOrder: 1,
      documentNodeIndex: emission.documentNodeIndex,
      statementIndex: emission.statementIndex,
      view: {
        kind: 'chart', name: emission.name, chartKind: emission.declaration.kind,
        title, description, data: emission.data as readonly AMXViewData[],
        ...(emission.labels === undefined ? {} : { labels: emission.labels }),
        ...(emission.headings === undefined ? {} : { headings: emission.headings }),
        ...(emission.measurementDescriptors?.length ? {
          measurementDescriptors: emission.measurementDescriptors.map(descriptor => ({
            ...descriptor,
            unit: {
              ...descriptor.unit,
              vector: Object.fromEntries(Object.entries(descriptor.unit.vector).map(([identity, exponent]) => [
                dimensionNames.get(identity) ?? identity,
                exponent
              ])),
              factors: descriptor.unit.factors.map(factor => ({
                ...factor,
                identity: unitNames.get(factor.identity) ?? factor.identity
              }))
            }
          }))
        } : {}),
        showTable: emission.showTable
      }
    });
  }
  for (const emission of diagrams) {
    const model = emission.model;
    const elements = model.initialFrame.elements.map(element => {
      const { source: _source, ...dto } = element;
      return dto as AMXDiagramPrimitiveElement;
    });
    events.push({
      moduleOrder: 0,
      documentNodeIndex: model.documentNodeIndex,
      statementIndex: model.statementIndex,
      view: {
        kind: 'diagram', schema: 'structured-v2', name: model.name,
        title: model.title, description: model.description,
        canvas: model.canvas, timeline: model.timeline,
        initialFrame: { time: model.initialFrame.time, elements }
      }
    });
  }
  events.sort((left, right) => left.moduleOrder - right.moduleOrder
    || left.documentNodeIndex - right.documentNodeIndex
    || left.statementIndex - right.statementIndex);
  return events.map(event => event.view);
}

function captureError(runValue: () => unknown): Error & { readonly code: string } {
  try { runValue(); }
  catch (error) {
    if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
      return error as Error & { readonly code: string };
    }
    throw error;
  }
  throw new Error('Expected generated execution to fail.');
}

async function captureAsyncError(runValue: () => Promise<unknown>): Promise<Error> {
  try { await runValue(); }
  catch (error) {
    if (error instanceof Error) return error;
    throw error;
  }
  throw new Error('Expected AMX execution to fail.');
}

function readDiagnostic(error: Error): RuntimeDiagnostic {
  if (!('code' in error) || typeof error.code !== 'string') throw error;
  const diagnostics = (error as Error & { readonly diagnostics?: readonly RuntimeDiagnostic[] }).diagnostics;
  const diagnostic = diagnostics?.[0];
  if (!diagnostic) throw new Error(`AMX error ${error.code} has no structured diagnostic.`);
  return diagnostic;
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (stableJson(actual) !== stableJson(expected)) {
    throw new Error(`${label} mismatch:\n${JSON.stringify({ actual, expected }, null, 2)}`);
  }
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const fields = Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`);
    return `{${fields.join(',')}}`;
  }
  return JSON.stringify(value);
}