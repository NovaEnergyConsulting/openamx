import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadEntryModule } from '../../../../../../../src/runtime/moduleLoader.ts';
import { AMXInputError, type AMXMeasurement, type AMXShownView } from 'openamx/transpiler-runtime';
import { run, type AMXRunInputs } from './main.ts';

interface RuntimeMeasurement {
  readonly value: number;
  readonly unit: {
    readonly text: string;
    readonly vector: Readonly<Record<string, number>>;
  };
}

const entryPath = fileURLToPath(new URL('../amx/main.amx', import.meta.url));
const amountPath = fileURLToPath(new URL('../inputs/amount.json', import.meta.url));
const invalidAmountPath = fileURLToPath(new URL('../inputs/invalid-amount.json', import.meta.url));
const amountText = await readFile(amountPath, 'utf8');
const amount = JSON.parse(amountText) as number;
const generated = run({ amount });
let generatedInvalidRejected = 0;

for (const invalidInputs of [
  { amount: 'invalid' },
  {},
  { amount: Number.POSITIVE_INFINITY }
]) {
  try {
    run(invalidInputs as unknown as AMXRunInputs);
  } catch (error) {
    if (!(error instanceof AMXInputError) || error.inputPath !== 'amount') throw error;
    generatedInvalidRejected++;
  }
}

if (generatedInvalidRejected !== 3) throw new Error('A generated invalid caller input was not rejected.');

const loaded = await loadEntryModule(entryPath, {
  inputMappings: [`amount=${amountPath}`]
});
let amxInvalidRejected = false;
try {
  await loadEntryModule(entryPath, {
    inputMappings: [`amount=${invalidAmountPath}`]
  });
} catch (error) {
  if (!(error instanceof Error) || !('code' in error) || error.code !== 'AMX4003') throw error;
  amxInvalidRejected = true;
}
if (!amxInvalidRejected) throw new Error('The AMX runtime accepted an invalid input.');
const bindings = loaded.env.toObject();
const dimensionNames = new Map(
  [...loaded.registry.dimensions].map(([name, dimension]) => [dimension.baseIdentity!, name])
);

function normalizedMeasurement(value: AMXMeasurement | RuntimeMeasurement) {
  const vector = Object.fromEntries(Object.entries(value.unit.vector).map(([identity, exponent]) => [
    dimensionNames.get(identity) ?? identity,
    exponent
  ]));
  return { value: value.value, unit: value.unit.text, vector };
}

const runtimeMeasurement = bindings.inMeters as RuntimeMeasurement;
const viewEvents: Array<{
  readonly documentNodeIndex: number;
  readonly statementIndex: number;
  readonly view: AMXShownView;
}> = [];

for (const emission of loaded.viewEmissions) {
  if (emission.kind !== 'chart') throw new Error(`Unexpected table view '${emission.name}' in the chart fixture.`);
  const titleOption = emission.declaration.options.find(option => option.type === 'viewTitleOption');
  const descriptionOption = emission.declaration.options.find(option => option.type === 'viewDescriptionOption');
  viewEvents.push({
    documentNodeIndex: emission.documentNodeIndex,
    statementIndex: emission.statementIndex,
    view: {
      kind: 'chart',
      name: emission.name,
      chartKind: emission.declaration.kind,
      title: titleOption?.type === 'viewTitleOption' ? titleOption.value : emission.name,
      description: descriptionOption?.type === 'viewDescriptionOption'
        ? descriptionOption.value
        : `${emission.declaration.kind} chart`,
      data: emission.data,
      showTable: emission.showTable
    }
  });
}

for (const emission of loaded.diagramEmissions) {
  const model = emission.model;
  if (model.initialFrame.elements.length !== 0) throw new Error(`Unexpected authored diagram elements in '${model.name}'.`);
  viewEvents.push({
    documentNodeIndex: model.documentNodeIndex,
    statementIndex: model.statementIndex,
    view: {
      kind: 'diagram',
      name: model.name,
      title: model.title,
      description: model.description,
      canvas: model.canvas,
      timeline: model.timeline,
      initialFrame: { time: model.initialFrame.time, elements: [] }
    }
  });
}

viewEvents.sort((left, right) => left.documentNodeIndex - right.documentNodeIndex
  || left.statementIndex - right.statementIndex);

const reference = {
  exports: {
    doubled: bindings.doubled,
    inMeters: normalizedMeasurement(runtimeMeasurement),
    sameDistance: bindings.sameDistance
  },
  views: viewEvents.map(event => event.view)
};
const actual = {
  exports: {
    doubled: generated.exports.doubled,
    inMeters: normalizedMeasurement(generated.exports.inMeters),
    sameDistance: generated.exports.sameDistance
  },
  views: generated.views
};

if (stableJson(actual) !== stableJson(reference)) {
  throw new Error(`Generated/reference mismatch:\n${JSON.stringify({ actual, reference }, null, 2)}`);
}

console.log(JSON.stringify({ actual, reference, generatedInvalidRejected, amxInvalidRejected }, null, 2));

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const fields = Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`);
    return `{${fields.join(',')}}`;
  }
  return JSON.stringify(value);
}