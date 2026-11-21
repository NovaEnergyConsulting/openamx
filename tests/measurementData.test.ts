import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AmxError } from '../src/diagnostics/errors';
import { parseDocumentText } from '../src/parser/parseDocument';
import { Environment } from '../src/runtime/environment';
import { ExternalUnitTextError, parseExternalUnitText } from '../src/runtime/externalUnits';
import { describeInputSchema, validateInputText } from '../src/runtime/inputData';
import { isMeasurement, measurement } from '../src/runtime/measurement';
import { evaluateDocumentEnvironment } from '../src/runtime/evaluateDocument';
import { describeOutputSchemas, prepareOutputs, serializeOutputs } from '../src/runtime/outputData';
import { prepareReport } from '../src/renderer/reportPreparation';
import { renderPreparedHtml } from '../src/renderer/renderHtml';
import { checkDocument } from '../src/typechecker/checkDocument';
import type { DimensionUnitRegistry } from '../src/typechecker/dimensionTypes';
import type { InputDeclarationNode, TypeDeclarationNode } from '../src/ast/types';
import type { CheckedType } from '../src/typechecker/checkDocument';
import { loadEntryModule } from '../src/runtime/moduleLoader';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

const source = `\`\`\`amx
dimension Length
dimension Time
dimension Speed = Length / Time
unit meter: Length
unit kilometer = 1000 * meter
unit second: Time
unit hour = 3600 * second
unit kilometer_per_hour = kilometer / hour
type JsonRow {
  distance: Length
  readings: Length[]
  optionalSpeed: Speed?
}
type CsvRow {
  speed: Speed?
}
input payload: JsonRow[]
input csvRows: CsvRow[]
\`\`\``;

function setup() {
  const document = parseDocumentText(source);
  const statements = document.nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : []);
  const metadataOnly = parseDocumentText(`\`\`\`amx
dimension Length
dimension Time
dimension Speed = Length / Time
unit meter: Length
unit kilometer = 1000 * meter
unit second: Time
unit hour = 3600 * second
unit kilometer_per_hour = kilometer / hour
\`\`\``);
  const checked = checkDocument(metadataOnly, 'measurement-data.amx');
  const types = new Map(statements
    .filter((statement): statement is TypeDeclarationNode => statement.type === 'typeDeclaration')
    .map(type => [type.name, type]));
  const inputs = new Map(statements
    .filter((statement): statement is InputDeclarationNode => statement.type === 'inputDeclaration')
    .map(input => [input.name, input]));
  const registry: DimensionUnitRegistry = {
    dimensions: checked.dimensions,
    units: checked.units,
    baseUnits: checked.baseUnits
  };
  return { types, inputs, registry };
}

function captureError(action: () => unknown, code: string): AmxError {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    expect((error as AmxError).code).toBe(code);
    return error as AmxError;
  }
  throw new Error(`Expected ${code}`);
}

describe('Sprint 057 measurement data contracts', () => {
  it('captures immutable chart unit descriptors alongside normalized values', () => {
    const doc = parseDocumentText(`\`\`\`amx
dimension Length
dimension Time
unit meter: Length
unit kilometer = 1000 * meter
unit second: Time
type Observation {
  label: String
  distance: Length
  duration: Time
}
let observations: Observation[] = [
  Observation { label = "A", distance = 1 kilometer, duration = 2 second },
  Observation { label = "B", distance = 500 meter, duration = 3 second }
]
chart travel = column(observations) {
  title: "Travel"
  description: "Distance and duration"
  category: label
  series distance as "Distance"
  series duration as "Duration"
}
show travel
\`\`\``);
    const emission = evaluateDocumentEnvironment(doc, 'chart-measurement.amx').viewEmissions[0];
    expect(emission).toMatchObject({
      kind: 'chart',
      data: [{ distance: 1, duration: 2 }, { distance: 0.5, duration: 3 }],
      headings: ['label', 'Distance (kilometer)', 'Duration (second)'],
      measurementDescriptors: [
        { role: 'series', field: 'distance', label: 'Distance', unit: { text: 'kilometer', scale: 1000 } },
        { role: 'series', field: 'duration', label: 'Duration', unit: { text: 'second', scale: 1 } }
      ]
    });

    const descriptors = emission.kind === 'chart' ? emission.measurementDescriptors! : [];
    expect(Object.values(descriptors[0].unit.vector)).toEqual([1]);
    expect(descriptors[0].unit.factors).toMatchObject([{ name: 'kilometer', exponent: 1 }]);
    expect(Object.values(descriptors[1].unit.vector)).toEqual([1]);
    expect(descriptors[1].unit.factors).toMatchObject([{ name: 'second', exponent: 1 }]);
    expect(Object.isFrozen(descriptors)).toBe(true);
    for (const descriptor of descriptors) {
      expect(Object.isFrozen(descriptor)).toBe(true);
      expect(Object.isFrozen(descriptor.unit)).toBe(true);
      expect(Object.isFrozen(descriptor.unit.vector)).toBe(true);
      expect(Object.isFrozen(descriptor.unit.factors)).toBe(true);
      expect(Object.isFrozen(descriptor.unit.factors[0])).toBe(true);
    }

  });

  it('loads exact nested JSON measurement objects and rejects bare values and malformed shapes', () => {
    const { types, inputs, registry } = setup();
    const declaration = inputs.get('payload')!;
    const valid = validateInputText(
      '[{"distance":{"value":1,"unit":"kilometer"},"readings":[{"value":500,"unit":"meter"}],"optionalSpeed":null}]',
      'json', declaration, types, 'aggregate', { dataFile: 'input.json' }, registry
    );
    expect(valid.diagnostics).toEqual([]);
    const row = (valid.value as Array<Record<string, unknown>>)[0];
    expect(isMeasurement(row.distance)).toBe(true);
    expect((row.distance as { value: number; unit: { text: string; scale: number } })).toMatchObject({
      value: 1, unit: { text: 'kilometer', scale: 1000 }
    });
    expect(isMeasurement((row.readings as unknown[])[0])).toBe(true);

    for (const [json, code, path] of [
      ['[{"distance":10,"readings":[],"optionalSpeed":null}]', 'AMX4005', '/0/distance'],
      ['[{"distance":{"value":1,"unit":"meter","extra":1},"readings":[],"optionalSpeed":null}]', 'AMX4005', '/0/distance'],
      ['[{"distance":{"value":1e999,"unit":"meter"},"readings":[],"optionalSpeed":null}]', 'AMX4005', '/0/distance'],
      ['[{"distance":{"value":1,"unit":"hidden"},"readings":[],"optionalSpeed":null}]', 'AMX4004', '/0/distance/unit'],
      ['[{"distance":{"value":1,"unit":"second"},"readings":[],"optionalSpeed":null}]', 'AMX4005', '/0/distance/unit'],
      ['[{"distance":{"value":1,"unit":"meter + 1"},"readings":[],"optionalSpeed":null}]', 'AMX4004', '/0/distance/unit']
    ] as const) {
      const invalid = validateInputText(json, 'json', declaration, types, 'aggregate', { dataFile: 'input.json' }, registry);
      expect(invalid.diagnostics[0]).toMatchObject({ code, dataPath: path, dataFile: 'input.json', inputName: 'payload' });
    }

    const aggregateText = '[{"distance":10,"readings":[],"optionalSpeed":null},{"distance":{"value":2,"unit":"second"},"readings":[],"optionalSpeed":null}]';
    const aggregate = validateInputText(aggregateText, 'json', declaration, types, 'aggregate', {}, registry);
    const firstOnly = validateInputText(aggregateText, 'json', declaration, types, 'fail-fast', {}, registry);
    expect(aggregate.diagnostics).toHaveLength(2);
    expect(firstOnly.diagnostics).toHaveLength(1);
    expect(aggregate.diagnostics.map(item => item.dataPath)).toEqual(['/0/distance', '/1/distance/unit']);
  });

  it('parses restricted visible compound unit expressions in CSV with record and column locations', () => {
    const { types, inputs, registry } = setup();
    const declaration = inputs.get('csvRows')!;
    const valid = validateInputText('speed\n10 kilometer_per_hour\n2 (meter / second)\n-0.5 meter / second\n', 'csv', declaration, types, 'aggregate', {}, registry);
    expect(valid.diagnostics).toEqual([]);
    const speeds = (valid.value as Array<{ speed: { value: number; unit: { scale: number; text: string } } }>).map(row => row.speed);
    expect(speeds.map(value => value.value)).toEqual([10, 2, -0.5]);
    expect(speeds.map(value => value.unit.text)).toEqual(['kilometer_per_hour', '(meter / second)', 'meter / second']);
    expect(speeds[0].unit.scale).toBeCloseTo(1000 / 3600);

    const malformed = validateInputText('speed\n2 meter + 1\n', 'csv', declaration, types, 'aggregate', { dataFile: 'speed.csv' }, registry);
    expect(malformed.diagnostics[0]).toMatchObject({
      code: 'AMX4004', dataPath: 'record[1].speed', recordNumber: 1,
      dataLine: 2, dataColumn: 1, dataFile: 'speed.csv'
    });
    const unknown = validateInputText('speed\n2 hidden_unit\n', 'csv', declaration, types, 'aggregate', {}, registry);
    expect(unknown.diagnostics[0]).toMatchObject({ code: 'AMX4004', dataPath: 'record[1].speed' });
    const badNumber = validateInputText('speed\n1e999 meter / second\n', 'csv', declaration, types, 'aggregate', {}, registry);
    expect(badNumber.diagnostics[0]).toMatchObject({ code: 'AMX4005', dataLine: 2, dataColumn: 1 });

    const units = parseExternalUnitText('kilometer / hour ^ 2', registry);
    expect(units.scale).toBeCloseTo(1000 / (3600 ** 2));
    expect(Object.keys(units.vector)).toHaveLength(2);
    expect(Object.values(parseExternalUnitText('second ^ -2', registry).vector)).toEqual([-2]);
    expect(Object.values(parseExternalUnitText('second ^ +2', registry).vector)).toEqual([2]);
    expect(parseExternalUnitText('1 / second', registry).text).toBe('1 / second');
    expect(() => parseExternalUnitText('meter + 2', registry)).toThrow();
    expect(() => parseExternalUnitText('unknown_unit', registry)).toThrow();
  });

  it('describes measurement expectations and round-trips JSON/CSV value and unit text', () => {
    const { types, inputs, registry } = setup();
    const inputSchema = describeInputSchema(inputs.get('payload')!, types, registry);
    expect(inputSchema.fields?.[0]).toMatchObject({
      name: 'distance', measurement: { dimension: 'Length', visibleUnits: ['kilometer', 'meter'] }
    });

    const rowType: CheckedType = { kind: 'list', element: { kind: 'named', name: 'CsvRow' } };
    const outputSchemas = describeOutputSchemas(new Map([['csvRows', rowType]]), types, registry);
    expect(outputSchemas[0]).toMatchObject({
      measurements: [{ path: '$.speed', dimension: 'Length * Time^-1', visibleUnits: ['kilometer_per_hour'] }]
    });

    const speedUnit = parseExternalUnitText('meter / second', registry);
    const env = new Environment(types, new Map(), registry);
    env.set('csvRows', [{ speed: measurement(2, speedUnit) }]);
    const binding = new Map([['csvRows', rowType]]);
    const jsonOutput = serializeOutputs(prepareOutputs(['csvRows=rows.json'], binding, types, undefined, registry), env)[0];
    const csvOutput = serializeOutputs(prepareOutputs(['csvRows=rows.csv'], binding, types, undefined, registry), env)[0];
    expect(JSON.parse(jsonOutput.contents)).toEqual([{ speed: { value: 2, unit: 'meter / second' } }]);
    expect(csvOutput.contents).toBe('speed\n2 meter / second\n');
    expect(validateInputText(jsonOutput.contents, 'json', inputs.get('csvRows')!, types, 'aggregate', {}, registry).diagnostics).toEqual([]);
    expect(validateInputText(csvOutput.contents, 'csv', inputs.get('csvRows')!, types, 'aggregate', {}, registry).diagnostics).toEqual([]);
    captureError(() => prepareOutputs(['csvRows=rows.csv'], new Map([['csvRows', rowType]]), types), 'AMX6001');
  });

  it('loads file-backed measurements using the already checked entry-visible registry', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-measurement-input-'));
    temporaryDirectories.push(directory);
    const units = join(directory, 'units.amx');
    const entry = join(directory, 'entry.amx');
    const data = join(directory, 'distance.json');
    await writeFile(units, `\`\`\`amx
export dimension Length
export unit meter: Length
export unit kilometer = 1000 * meter
\`\`\`
`);
    await writeFile(entry, `\`\`\`amx
import { Length, meter, kilometer } from "./units.amx"
input distance: Length
let inMeters = distance in meter
\`\`\`
`);
    await writeFile(data, '{"value":1.5,"unit":"kilometer"}');
    const loaded = await loadEntryModule(entry, { inputMappings: [`distance=${data}`] });
    expect(isMeasurement(loaded.env.get('distance'))).toBe(true);
    expect(loaded.env.get('inMeters')).toMatchObject({ value: 1500, unit: { text: 'meter' } });
    expect(loaded.registry.units.has('kilometer')).toBe(true);
  });

  it('resolves imported record measurement fields and unit text in the declaring module', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-measurement-imported-record-'));
    temporaryDirectories.push(directory);
    await mkdir(join(directory, 'types'));
    await writeFile(join(directory, 'types', 'nameplate.amx'), `\`\`\`amx
export dimension ApparentPower
export unit MVA: ApparentPower
export unit kVA = 0.001 * MVA

export type NameplateData {
  EquipmentNumber: String
  PowerRating_MVA: ApparentPower
  Spare: ApparentPower? = 1 MVA
  PrimaryVoltage_kV: Number
}

export fn uprated(p: ApparentPower): ApparentPower = p + 1 MVA
\`\`\`
`);
    const entry = join(directory, 'report.amx');
    await writeFile(entry, `\`\`\`amx
import {NameplateData, uprated} from "./types/nameplate.amx"
input nameplateData: NameplateData[]
let transformer = nameplateData[2]
let upgraded = uprated(transformer.PowerRating_MVA)
export let rows: NameplateData[] = nameplateData
\`\`\`

Rating for {{transformer.EquipmentNumber}} {{transformer.PowerRating_MVA}} upgraded {{upgraded}}
`);
    const csvPath = join(directory, 'nameplate.csv');
    await writeFile(csvPath, 'EquipmentNumber,PowerRating_MVA,PrimaryVoltage_kV\nTX-001,75 MVA,132\nTX-002,50000 kVA,100\n');
    const csvOut = join(directory, 'rows.csv');
    const jsonOut = join(directory, 'rows.json');
    const loaded = await loadEntryModule(entry, { inputMappings: [`nameplateData=${csvPath}`], outputMappings: [`rows=${csvOut}`] });
    expect(loaded.registry.units.has('MVA')).toBe(false);
    expect(loaded.env.get('transformer')).toMatchObject({
      EquipmentNumber: 'TX-002',
      PowerRating_MVA: { value: 50000, unit: { text: 'kVA' } },
      Spare: { value: 1, unit: { text: 'MVA' } }
    });
    expect(serializeOutputs(loaded.outputs, loaded.env)[0].contents)
      .toBe('EquipmentNumber,PowerRating_MVA,Spare,PrimaryVoltage_kV\nTX-001,75 MVA,1 MVA,132\nTX-002,50000 kVA,1 MVA,100\n');
    const html = renderPreparedHtml(await prepareReport(loaded.doc, loaded.env, { file: entry, projectRoot: directory }));
    expect(loaded.env.get('upgraded')).toMatchObject({ value: 51000, unit: { text: 'kVA' } });
    expect(html).toContain('Rating for TX-002 50000 kVA upgraded 51000 kVA');
    expect(html).not.toContain('[object Object]');

    const jsonPath = join(directory, 'nameplate.json');
    await writeFile(jsonPath, '[{"EquipmentNumber":"TX-001","PowerRating_MVA":{"value":75,"unit":"MVA"},"PrimaryVoltage_kV":132},{"EquipmentNumber":"TX-002","PowerRating_MVA":{"value":50,"unit":"MVA"},"PrimaryVoltage_kV":100}]');
    const fromJson = await loadEntryModule(entry, { inputMappings: [`nameplateData=${jsonPath}`], outputMappings: [`rows=${jsonOut}`] });
    expect(JSON.parse(serializeOutputs(fromJson.outputs, fromJson.env)[0].contents)[0].PowerRating_MVA).toEqual({ value: 75, unit: 'MVA' });

    const inspected = await loadEntryModule(entry, {
      inputInspection: { name: 'nameplateData', format: 'csv', text: 'EquipmentNumber,PowerRating_MVA,PrimaryVoltage_kV\nTX-001,75 meter,132\n' }
    });
    expect(inspected.inputInspection?.schema.acceptedFormats).toEqual(['json', 'csv']);
    expect(inspected.inputInspection?.schema.fields?.find(field => field.name === 'PowerRating_MVA')).toMatchObject({
      measurement: { dimension: 'ApparentPower', visibleUnits: ['MVA', 'kVA'] }
    });
    expect(inspected.inputInspection?.diagnostics[0]).toMatchObject({ code: 'AMX4004', dataPath: 'record[1].PowerRating_MVA' });
    expect(inspected.inputInspection?.outputs[0]).toMatchObject({
      formats: ['json', 'csv'],
      measurements: [
        { path: '$.PowerRating_MVA', dimension: 'ApparentPower', visibleUnits: ['MVA', 'kVA'] },
        { path: '$.Spare', dimension: 'ApparentPower', visibleUnits: ['MVA', 'kVA'] }
      ]
    });
  });

  it('AFF-EXTERNAL-01/AFF-EXTERNAL-ALIAS-01 accepts atomic affine and alias unit text with internal offset', () => {
    const metadata = parseDocumentText(`\`\`\`amx
dimension ThermodynamicTemperature
dimension Time
unit kelvin: ThermodynamicTemperature
unit celsius = kelvin + 273.15
unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
unit degC = celsius
unit degF = fahrenheit
unit second: Time
\`\`\``);
    const checked = checkDocument(metadata, 'affine-data.amx');
    const registry: DimensionUnitRegistry = { dimensions: checked.dimensions, units: checked.units, baseUnits: checked.baseUnits };
    const document = parseDocumentText(`\`\`\`amx
type Reading {
  temperature: ThermodynamicTemperature
}
input reading: Reading
input rows: Reading[]
\`\`\``);
    const statements = document.nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : []);
    const types = new Map(statements.filter((item): item is TypeDeclarationNode => item.type === 'typeDeclaration').map(item => [item.name, item]));
    const inputs = new Map(statements.filter((item): item is InputDeclarationNode => item.type === 'inputDeclaration').map(item => [item.name, item]));
    const json = validateInputText('{"temperature":{"value":20,"unit":"celsius"}}', 'json', inputs.get('reading')!, types, 'aggregate', { dataFile: 'reading.json' }, registry);
    const alias = validateInputText('{"temperature":{"value":20,"unit":"degF"}}', 'json', inputs.get('reading')!, types, 'aggregate', {}, registry);
    const csv = validateInputText('temperature\n20 degC\n', 'csv', inputs.get('rows')!, types, 'aggregate', {}, registry);

    expect(json.diagnostics).toEqual([]);
    expect(alias.diagnostics).toEqual([]);
    expect(csv.diagnostics).toEqual([]);
    expect(json.value).toMatchObject({ temperature: { value: 20, unit: { text: 'celsius', scale: 1, offset: 273.15 } } });
    expect(alias.value).toMatchObject({ temperature: { value: 20, unit: { text: 'degF', scale: 5 / 9 } } });
    expect((alias.value as any).temperature.unit.offset).toBeCloseTo(273.15 - 160 / 9, 14);
    expect((csv.value as any[])[0].temperature).toMatchObject({ value: 20, unit: { text: 'degC', offset: 273.15 } });
    expect(parseExternalUnitText('(celsius)', registry).offset).toBe(273.15);
  });

  it('AFF-EXTERNAL-COMPOUND-01 rejects affine external factors with AMX4004 and data paths', () => {
    const metadata = parseDocumentText(`\`\`\`amx
dimension ThermodynamicTemperature
dimension Time
unit kelvin: ThermodynamicTemperature
unit celsius = kelvin + 273.15
unit second: Time
\`\`\``);
    const checked = checkDocument(metadata, 'affine-compound.amx');
    const registry: DimensionUnitRegistry = { dimensions: checked.dimensions, units: checked.units, baseUnits: checked.baseUnits };
    const inputDocument = parseDocumentText(`\`\`\`amx
type Reading {
  temperature: ThermodynamicTemperature
}
input reading: ThermodynamicTemperature
input rows: Reading[]
\`\`\``);
    const statements = inputDocument.nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : []);
    const types = new Map(statements.filter((item): item is TypeDeclarationNode => item.type === 'typeDeclaration').map(item => [item.name, item]));
    const inputs = new Map(statements.filter((item): item is InputDeclarationNode => item.type === 'inputDeclaration').map(item => [item.name, item]));
    const statement = inputs.get('reading')!;

    for (const text of ['celsius / second', 'celsius * kelvin', '2 / celsius', 'celsius ^ 1', '(celsius) ^ 2']) {
      expect(() => parseExternalUnitText(text, registry)).toThrow(ExternalUnitTextError);
      const result = validateInputText(JSON.stringify({ value: 20, unit: text }), 'json', statement, new Map(), 'aggregate', { dataFile: 'temperature.json' }, registry);
      expect(result.diagnostics[0]).toMatchObject({ code: 'AMX4004', dataPath: '/unit', dataFile: 'temperature.json' });
      const csv = validateInputText(`temperature\n20 ${text}\n`, 'csv', inputs.get('rows')!, types, 'aggregate', { dataFile: 'temperature.csv' }, registry);
      expect(csv.diagnostics[0]).toMatchObject({ code: 'AMX4004', dataPath: 'record[1].temperature', dataFile: 'temperature.csv', dataLine: 2, dataColumn: 1 });
    }
  });

  it('AFF-EXTERNAL-SHAPE-01/S118-OUTPUT-SHAPE-01 preserves exact public JSON/CSV shape', () => {
    const metadata = parseDocumentText(`\`\`\`amx
dimension ThermodynamicTemperature
unit kelvin: ThermodynamicTemperature
unit celsius = kelvin + 273.15
unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
\`\`\``);
    const checked = checkDocument(metadata, 'affine-shape.amx');
    const registry: DimensionUnitRegistry = { dimensions: checked.dimensions, units: checked.units, baseUnits: checked.baseUnits };
    const inputDocument = parseDocumentText(`\`\`\`amx
type Reading {
  temperature: ThermodynamicTemperature
}
input reading: ThermodynamicTemperature
input rows: Reading[]
\`\`\``);
    const statements = inputDocument.nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : []);
    const types = new Map(statements.filter((item): item is TypeDeclarationNode => item.type === 'typeDeclaration').map(item => [item.name, item]));
    const inputs = new Map(statements.filter((item): item is InputDeclarationNode => item.type === 'inputDeclaration').map(item => [item.name, item]));
    const statement = inputs.get('reading')!;
    for (const invalid of [
      '{"value":20,"unit":"celsius","offset":273.15}',
      '{"value":20,"unit":"celsius","scale":1}',
      '{"value":20}',
      '{"unit":"celsius"}'
    ]) {
      const result = validateInputText(invalid, 'json', statement, new Map(), 'aggregate', {}, registry);
      expect(result.diagnostics[0]).toMatchObject({ code: 'AMX4005', dataPath: '' });
    }

    const unit = parseExternalUnitText('celsius', registry);
    const env = new Environment(types, new Map(), registry);
    env.set('reading', measurement(20, unit));
    env.set('rows', [{ temperature: measurement(20, unit) }]);
    const binding: CheckedType = { kind: 'measurement', vector: registry.dimensions.get('ThermodynamicTemperature')!.vector };
    const rowBinding: CheckedType = { kind: 'list', element: { kind: 'named', name: 'Reading' } };
    const outputs = prepareOutputs(['reading=value.json', 'rows=value.csv'], new Map([['reading', binding], ['rows', rowBinding]]), types, undefined, registry);
    const serialized = serializeOutputs(outputs, env);
    expect(JSON.parse(serialized[0].contents)).toEqual({ value: 20, unit: 'celsius' });
    expect(serialized[1].contents).toBe('temperature\n20 celsius\n');
    expect(serialized.every(output => !output.contents.includes('offset') && !output.contents.includes('scale'))).toBe(true);
  });
});
