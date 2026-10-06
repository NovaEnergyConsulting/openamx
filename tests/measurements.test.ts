import { describe, expect, it } from 'bun:test';
import { AmxError } from '../src/diagnostics/errors';
import { parseDocumentText } from '../src/parser/parseDocument';
import { parseExpression } from '../src/parser/parseExpression';
import { evaluateDocument } from '../src/runtime/evaluateDocument';
import { isMeasurement } from '../src/runtime/measurement';
import { checkDocument } from '../src/typechecker/checkDocument';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { unlink } from 'node:fs/promises';

const sourceDocument = (source: string) => parseDocumentText(`\`\`\`amx\n${source}\n\`\`\``);
const run = (source: string) => evaluateDocument(sourceDocument(source), 'measurement.amx');

const definitions = [
  'dimension Length',
  'dimension Time',
  'dimension Area = Length ^ 2',
  'dimension Speed = Length / Time',
  'unit meter: Length',
  'unit kilometer = 1000 * meter',
  'unit second: Time',
  'unit hour = 3600 * second',
  'unit square_meter = meter ^ 2',
  'unit kilometer_per_hour = kilometer / hour'
].join('\n');

function measurementValue(value: unknown): { value: number; unit: { text: string; scale: number } } {
  expect(isMeasurement(value)).toBe(true);
  return value as { value: number; unit: { text: string; scale: number } };
}

function expectCode(source: string, code: string): AmxError {
  try {
    checkDocument(sourceDocument(source), 'measurement.amx');
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    expect((error as AmxError).code).toBe(code);
    return error as AmxError;
  }
  throw new Error(`Expected ${code}`);
}

describe('Sprint 056 measurement expressions', () => {
  it('parses approved attachment, power, unary, and conversion precedence', () => {
    expect(parseExpression('2 meter ^ 2')).toMatchObject({
      type: 'binaryExpression',
      operator: '^',
      left: { type: 'measurementAttachment', unit: 'meter' }
    });
    expect(parseExpression('-2 meter')).toMatchObject({
      type: 'unaryExpression',
      argument: { type: 'measurementAttachment', unit: 'meter' }
    });
    expect(parseExpression('-2 ^ 2')).toMatchObject({
      type: 'binaryExpression',
      operator: '^',
      left: { type: 'unaryExpression', operator: '-' }
    });
    expect(parseExpression('2 ^ 3 ^ 2')).toMatchObject({
      type: 'binaryExpression',
      operator: '^',
      right: { type: 'binaryExpression', operator: '^' }
    });
    expect(parseExpression('(2 ^ 2) meter')).toMatchObject({
      type: 'measurementAttachment',
      value: { type: 'binaryExpression', operator: '^' }
    });
    expect(parseExpression('(distance in meter)')).toMatchObject({
      type: 'measurementConversion',
      unit: 'meter'
    });
    expect(parseExpression('left < right in meter')).toMatchObject({
      type: 'binaryExpression',
      operator: '<',
      right: { type: 'measurementConversion', unit: 'meter' }
    });
    expect(() => parseExpression('distance in (meter)')).toThrow();
    expect(() => parseExpression('2 (meter)')).toThrow();
    expect(() => parseExpression('2 3')).toThrow();
  });

  it('converts and computes values with preserved display units and physical scales', () => {
    const values = run(`${definitions}
let distance = 1 kilometer + 500 meter
let amount: Number = 2
let attached = amount meter
let converted = (1 kilometer + 500 meter) in meter
let ratio = 1 kilometer / 500 meter
let speed = 10 meter / 2 second
let power = 2 meter ^ 2
let zeroPower = 2 meter ^ 0
let product = 2 kilometer * 3 meter
let scaledQuotient = 2 kilometer / 500 second
let doubled = 3 * 2 meter
let negative = -2 meter
let canceled = 10 meter / 2 meter`);
    expect(measurementValue(values.distance)).toMatchObject({ value: 1.5, unit: { text: 'kilometer', scale: 1000 } });
    expect(measurementValue(values.attached)).toMatchObject({ value: 2, unit: { text: 'meter' } });
    expect(measurementValue(values.converted)).toMatchObject({ value: 1500, unit: { text: 'meter', scale: 1 } });
    expect(values.ratio).toBe(2);
    expect(measurementValue(values.speed).unit.text).toBe('meter / second');
    expect(measurementValue(values.power)).toMatchObject({ value: 4, unit: { text: 'meter ^ 2' } });
    expect(values.zeroPower).toBe(1);
    expect(measurementValue(values.product)).toMatchObject({ value: 6, unit: { text: 'kilometer * meter', scale: 1000 } });
    expect(measurementValue(values.scaledQuotient)).toMatchObject({ value: 0.004, unit: { text: 'kilometer / second', scale: 1000 } });
    expect(measurementValue(values.doubled)).toMatchObject({ value: 6, unit: { text: 'meter' } });
    expect(measurementValue(values.negative)).toMatchObject({ value: -2, unit: { text: 'meter' } });
    expect(values.canceled).toBe(5);
  });

  it('compares compatible measurements using normalized physical values', () => {
    const values = run(`${definitions}
let equal = 1 kilometer == 1000 meter
let less = 500 meter < 1 kilometer
let greater = 2 kilometer > 1000 meter`);
    expect(values.equal).toBe(true);
    expect(values.less).toBe(true);
    expect(values.greater).toBe(true);
  });

  it('consumes the approved Sprint 055 SI registry through explicit module imports', async () => {
    const entry = `./openamx-measurement-import-${Date.now()}-${Math.random().toString(36).slice(2)}.amx`;
    await Bun.write(entry, `\`\`\`amx
import { Length, meter, kilometer } from "./libraries/si.amx"
let distance: Length = 1 kilometer + 500 meter
let text = "\${distance}"
\`\`\`
`);
    try {
      const loaded = await loadEntryModule(entry);
      expect(measurementValue(loaded.env.get('distance'))).toMatchObject({ value: 1.5, unit: { text: 'kilometer' } });
      expect(loaded.env.get('text')).toBe('1.5 kilometer');
      expect(loaded.registry.units.has('meter')).toBe(true);
    } finally {
      await unlink(entry);
    }
  });

  it('preserves type and display metadata through bindings, functions, records, lists, and nullable values', () => {
    const values = run(`${definitions}
type Box {
  distance: Length = 1 kilometer
}
fn identity(value: Length): Length = value
let box = Box { }
let distances: Length[] = [box.distance, 500 meter]
let picked: Length = distances[2]
let optional: Length? = identity(picked)
let selected: Length = if optional != null then optional else 0 meter
let assigned: Length = 1 meter
assigned = 2 kilometer
let rendered = "distance=${'${selected}'}"`);
    expect(measurementValue((values.box as { distance: unknown }).distance).unit.text).toBe('kilometer');
    expect(measurementValue(values.picked).unit.text).toBe('meter');
    expect(measurementValue(values.selected)).toMatchObject({ value: 500, unit: { text: 'meter' } });
    expect(measurementValue(values.assigned)).toMatchObject({ value: 2, unit: { text: 'kilometer' } });
    expect(values.rendered).toBe('distance=500 meter');
  });

  it('implements measurement aggregates, math functions, and typed empty sum', () => {
    const values = run(`${definitions}
let distances: Length[] = [1 kilometer, 500 meter]
let total = sum(distances)
let average = mean(distances)
let minimum = min(distances)
let maximum = max(distances)
let absolute = abs(-2 kilometer)
let rounded = round(1.236 kilometer, 2)
let root = sqrt(9 square_meter)
let powered = pow(2 meter, 2)
let reciprocal = pow(2 meter, -1)
let empty: Length[] = []
let emptyTotal = sum(empty)`);
    expect(measurementValue(values.total)).toMatchObject({ value: 1.5, unit: { text: 'kilometer' } });
    expect(measurementValue(values.average)).toMatchObject({ value: 0.75, unit: { text: 'kilometer' } });
    expect(measurementValue(values.minimum)).toMatchObject({ value: 500, unit: { text: 'meter' } });
    expect(measurementValue(values.maximum)).toMatchObject({ value: 1, unit: { text: 'kilometer' } });
    expect(measurementValue(values.absolute)).toMatchObject({ value: 2, unit: { text: 'kilometer' } });
    expect(measurementValue(values.rounded)).toMatchObject({ value: 1.24, unit: { text: 'kilometer' } });
    expect(measurementValue(values.root)).toMatchObject({ value: 3, unit: { text: 'meter' } });
    expect(measurementValue(values.powered)).toMatchObject({ value: 4, unit: { text: 'meter ^ 2' } });
    expect(measurementValue(values.reciprocal)).toMatchObject({ value: 0.5, unit: { text: '1 / meter' } });
    expect(measurementValue(values.emptyTotal)).toMatchObject({ value: 0, unit: { text: 'meter' } });
    expect(() => run(`${definitions}\nlet empty: Length[] = []\nlet result = mean(empty)`))
      .toThrow(expect.objectContaining({ code: 'AMX2004' }));
    expect(() => run(`${definitions}\nlet empty: Length[] = []\nlet result = min(empty)`))
      .toThrow(expect.objectContaining({ code: 'AMX2004' }));
  });

  it('rejects incompatible operations and statically invalid dimensions/domains with approved diagnostics', () => {
    expectCode(`${definitions}\nlet invalid = 1 + 2 meter`, 'AMX3007');
    expectCode(`${definitions}\nlet invalid = 1 meter + 1 second`, 'AMX3007');
    expectCode(`${definitions}\nlet invalid = 1 meter > 1 second`, 'AMX3007');
    expectCode(`${definitions}\nlet invalid = 1 meter + 1`, 'AMX3007');
    expectCode(`${definitions}\nlet invalid = 1 meter % 2`, 'AMX3007');
    expectCode(`${definitions}\nlet invalid = 1 meter in second`, 'AMX3007');
    expectCode(`${definitions}\nfor item in (1 meter in meter) {\n  let invalid = item\n}`, 'AMX3007');
    expectCode(`${definitions}\nlet exponent = 2\nlet invalid = 1 meter ^ exponent`, 'AMX3007');
    expectCode(`${definitions}\nlet invalid = sqrt(9 meter)`, 'AMX3007');
    expectCode(`${definitions}\nlet invalid = 1 meter / 0`, 'AMX3010');
    expectCode(`${definitions}\nlet invalid = pow(0 meter, -1)`, 'AMX3010');
    expectCode(`${definitions}\nlet invalid = sqrt(-1 square_meter)`, 'AMX3010');
    const invisible = expectCode('dimension Length\nlet invalid = 1 meter', 'AMX3008');
    expect(invisible.line).toBe(3);
  });

  it('reports dynamic measurement division faults at the original operator location', () => {
    try {
      run(`${definitions}
let zero: Number = 0
let invalid = 1 meter / zero`);
      throw new Error('Expected dynamic division failure');
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      expect(error as AmxError).toMatchObject({ code: 'AMX1009', file: 'measurement.amx' });
      expect((error as AmxError).line).toBe(13);
      expect((error as AmxError).column).toBe(23);
    }
  });

  it('reports dynamic square-root domain failures without losing the measurement type', () => {
    try {
      run(`${definitions}
let negative: Area = -1 square_meter
let invalid = sqrt(negative)`);
      throw new Error('Expected dynamic sqrt failure');
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      expect((error as AmxError).code).toBe('AMX1009');
    }
  });
});
