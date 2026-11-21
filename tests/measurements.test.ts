import { describe, expect, it } from 'bun:test';
import { AmxError } from '../src/diagnostics/errors';
import { parseDocumentText } from '../src/parser/parseDocument';
import { parseExpression } from '../src/parser/parseExpression';
import { evaluateDocument } from '../src/runtime/evaluateDocument';
import { composeUnits, isAffineUnit, isMeasurement, measurement, measurementDisplayValue, measurementPhysicalValue, powerUnit, unitFromMetadata } from '../src/runtime/measurement';
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

function measurementValue(value: unknown): { value: number; unit: { text: string; scale: number; offset: number } } {
  expect(isMeasurement(value)).toBe(true);
  return value as { value: number; unit: { text: string; scale: number; offset: number } };
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

const affineDefinitions = [
  'dimension ThermodynamicTemperature',
  'unit kelvin: ThermodynamicTemperature',
  'unit celsius = kelvin + 273.15',
  'unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)',
  'unit degC = celsius',
  'unit degF = fahrenheit'
].join('\n');

function expectRuntimeCode(source: string, code: string, message?: string): AmxError {
  try {
    run(source);
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    expect((error as AmxError).code).toBe(code);
    if (message) expect((error as AmxError).message).toBe(message);
    return error as AmxError;
  }
  throw new Error(`Expected ${code}`);
}

describe('Sprint 118 affine measurement runtime', () => {
  it('S118-UNIT-OFFSET-01/S118-PHYSICAL-01/S118-COMPOSE-01 copies immutable metadata and centralizes conversion', () => {
    const affine = checkDocument(sourceDocument(affineDefinitions), 'affine.amx');
    const linear = checkDocument(sourceDocument(definitions), 'linear.amx');
    const celsius = unitFromMetadata(affine.units.get('celsius')!);
    const fahrenheit = unitFromMetadata(affine.units.get('fahrenheit')!);
    const meter = unitFromMetadata(linear.units.get('meter')!);
    const kilometer = unitFromMetadata(linear.units.get('kilometer')!);
    const zeroC = measurement(0, celsius);
    const thirtyTwoF = measurement(32, fahrenheit);

    expect(celsius.offset).toBe(273.15);
    expect(fahrenheit.scale).toBeCloseTo(5 / 9, 14);
    expect(measurementPhysicalValue(zeroC)).toBe(273.15);
    expect(measurementPhysicalValue(thirtyTwoF)).toBeCloseTo(273.15, 14);
    expect(measurementDisplayValue(273.15, fahrenheit)).toBeCloseTo(32, 12);
    expect(isAffineUnit(celsius)).toBe(true);
    expect(isAffineUnit(meter)).toBe(false);
    expect(Object.isFrozen(celsius)).toBe(true);
    expect(Object.isFrozen(celsius.vector)).toBe(true);
    expect(Object.isFrozen(celsius.factors)).toBe(true);
    expect(composeUnits(kilometer, meter)).toMatchObject({ offset: 0, scale: 1000 });
    expect(powerUnit(meter, 2)).toMatchObject({ offset: 0, scale: 1 });
    expect(() => composeUnits(celsius, meter)).toThrow('Affine measurement units cannot be composed');
  });

  it('AFF-CONV-INVARIANT-01/AFF-CONV-REVERSE-01/AFF-ROUNDTRIP-01 preserves physical and display units', () => {
    const values = run(`${affineDefinitions}
let zeroC = (0 celsius) in kelvin
let freezingF = (0 celsius) in fahrenheit
let freezingC = (32 fahrenheit) in celsius
let kelvinC = (273.15 kelvin) in celsius
let roundTrip = (((21.25 celsius) in fahrenheit) in celsius)`);
    expect(measurementValue(values.zeroC)).toMatchObject({ value: 273.15, unit: { text: 'kelvin', offset: 0 } });
    expect(measurementValue(values.freezingF).value).toBeCloseTo(32, 12);
    expect(measurementValue(values.freezingF).unit.text).toBe('fahrenheit');
    expect(measurementValue(values.freezingC).value).toBeCloseTo(0, 12);
    expect(measurementValue(values.kelvinC).value).toBeCloseTo(0, 12);
    expect(measurementValue(values.roundTrip).value).toBeCloseTo(21.25, 12);
    expect(measurementValue(values.roundTrip).unit.text).toBe('celsius');
  });

  it('AFF-EQUAL-01 compares canonical physical values for equality and ordering', () => {
    const values = run(`${affineDefinitions}
let equal = 0 celsius == 32 fahrenheit and 32 fahrenheit == 273.15 kelvin
let unequal = 0 celsius != 273.15 kelvin
let lower = 0 celsius < 33 fahrenheit
let lowerEqual = 0 celsius <= 32 fahrenheit
let higher = 34 fahrenheit > 0 celsius
let higherEqual = 32 fahrenheit >= 273.15 kelvin`);
    expect(values).toMatchObject({ equal: true, unequal: false, lower: true, lowerEqual: true, higher: true, higherEqual: true });
  });

  it('AFF-SUB-SAME-01/AFF-SUB-MIX-01 uses physical subtraction with the left display unit', () => {
    const values = run(`${affineDefinitions}
let same = 20 celsius - 10 celsius
let mixed = 32 fahrenheit - 20 celsius
let kelvinLeft = 273.15 kelvin - 0 celsius`);
    expect(measurementValue(values.same)).toMatchObject({ value: 10, unit: { text: 'celsius', scale: 1, offset: 273.15 } });
    expect(measurementValue(values.mixed).value).toBeCloseTo(-36, 12);
    expect(measurementValue(values.mixed).unit.text).toBe('fahrenheit');
    expect(measurementValue(values.kelvinLeft)).toMatchObject({ value: 0, unit: { text: 'kelvin', offset: 0 } });
  });

  it('AFF-ADD-01/AFF-MUL-01/AFF-DIV-01/AFF-POW-01/AFF-SQRT-01 rejects unsupported affine operations', () => {
    const add = expectRuntimeCode(`${affineDefinitions}\nlet invalid = 10 celsius + 20 celsius`, 'AMX3007');
    expect(add.message).toBe('Direct addition of affine measurements is not supported');
    expectRuntimeCode(`${affineDefinitions}\nlet invalid = 2 * 10 celsius`, 'AMX3007', 'Affine measurement multiplication is not supported');
    expectRuntimeCode(`${affineDefinitions}\nlet invalid = 10 celsius / 2`, 'AMX3007', 'Affine measurement division is not supported');
    expectRuntimeCode(`${affineDefinitions}\nlet invalid = 10 celsius ^ 2`, 'AMX3007', 'Affine measurement powers are not supported');
    expectRuntimeCode(`${affineDefinitions}\nlet invalid = pow(10 celsius, 2)`, 'AMX3007', 'Affine measurement powers are not supported');
    expectCode(`${affineDefinitions}\nlet invalid = sqrt(10 celsius)`, 'AMX3007');
  });

  it('AFF-SUM-01/AFF-SUM-MIX-01/AFF-MEAN-01 aggregates physical values into the first display unit', () => {
    const values = run(`${affineDefinitions}
let total = sum([10 celsius, 20 celsius])
let mixedTotal = sum([10 celsius, 50 fahrenheit, 300 kelvin])
let average = mean([10 celsius, 50 fahrenheit, 300 kelvin])`);
    expect(measurementValue(values.total)).toMatchObject({ value: 303.15, unit: { text: 'celsius' } });
    expect(measurementValue(values.mixedTotal).value).toBeCloseTo(593.15, 12);
    expect(measurementValue(values.average).value).toBeCloseTo(15.616666666666667, 12);
    expect(measurementValue(values.mixedTotal).unit.text).toBe('celsius');
    expect(measurementValue(values.average).unit.text).toBe('celsius');
  });

  it('AFF-MINMAX-01/AFF-ABSROUND-01/AFF-NEG-01/S118-EMPTY-SUM-01 selects and transforms display values', () => {
    const values = run(`${affineDefinitions}
let minimum = min([50 fahrenheit, 300 kelvin, 10 celsius])
let maximum = max([10 celsius, 50 fahrenheit, 300 kelvin])
let absolute = abs(-10 celsius)
let rounded = round(10.24 celsius, 1)
let negative = -10 celsius
let empty: ThermodynamicTemperature[] = []
let emptyTotal = sum(empty)`);
    expect(measurementValue(values.minimum).unit.text).toBe('fahrenheit');
    expect(measurementValue(values.minimum).value).toBe(50);
    expect(measurementValue(values.maximum).unit.text).toBe('kelvin');
    expect(measurementValue(values.maximum).value).toBe(300);
    expect(measurementValue(values.absolute)).toMatchObject({ value: 10, unit: { text: 'celsius' } });
    expect(measurementValue(values.rounded)).toMatchObject({ value: 10.2, unit: { text: 'celsius' } });
    expect(measurementValue(values.negative)).toMatchObject({ value: -10, unit: { text: 'celsius' } });
    expect(measurementValue(values.emptyTotal)).toMatchObject({ value: 0, unit: { text: 'kelvin', offset: 0 } });
  });

  it('AFF-DISPLAY-01/AFF-INCOMPAT-01/AFF-NUMBER-REG-01 preserves display and existing linear behavior', () => {
    const values = run(`${affineDefinitions}
let converted: ThermodynamicTemperature = (273.15 kelvin) in celsius
let display = "\${converted}"`);
    expect(measurementValue(values.converted).value).toBe(0);
    expect(measurementValue(values.converted).unit.text).toBe('celsius');
    expect(values.display).toBe('0 celsius');
    const incompatible = expectCode(`${affineDefinitions}\ndimension Length\nunit meter: Length\nlet invalid = 1 celsius in meter`, 'AMX3007');
    expect([incompatible.line, incompatible.column]).toEqual([10, 25]);
    expect(run(`${definitions}\nlet linear = 1 kilometer + 500 meter`).linear).toMatchObject({ value: 1.5, unit: { text: 'kilometer' } });
    expect(run('let number = 2 * 3 + 1').number).toBe(7);
  });

  it('S118-SI-IMPORT-01 executes conversions and aliases from the published SI library', async () => {
    const entry = `./openamx-affine-si-import-${Date.now()}-${Math.random().toString(36).slice(2)}.amx`;
    await Bun.write(entry, `\`\`\`amx
import { ThermodynamicTemperature, kelvin, celsius, fahrenheit, degC, degF } from "./libraries/si.amx"
let zeroC: ThermodynamicTemperature = 0 celsius
let freezingF: ThermodynamicTemperature = 32 fahrenheit
let equal: Boolean = zeroC == freezingF and freezingF == 273.15 kelvin
let delta = 20 celsius - 10 celsius
let mixed = 32 fahrenheit - 20 celsius
let total = sum([10 celsius, 20 celsius])
let inF = zeroC in degF
let alias = 10 degC
\`\`\``);
    try {
      const loaded = await loadEntryModule(entry);
      expect(loaded.env.get('equal')).toBe(true);
      expect(loaded.env.get('delta')).toMatchObject({ value: 10, unit: { text: 'celsius', offset: 273.15 } });
      expect(measurementValue(loaded.env.get('mixed')).value).toBeCloseTo(-36, 12);
      expect(loaded.env.get('total')).toMatchObject({ value: 303.15, unit: { text: 'celsius' } });
      expect(measurementValue(loaded.env.get('inF')).value).toBeCloseTo(32, 12);
      expect(measurementValue(loaded.env.get('inF')).unit.text).toBe('degF');
      expect(loaded.env.get('alias')).toMatchObject({ value: 10, unit: { text: 'degC', scale: 1, offset: 273.15 } });
      expect(loaded.registry.units.get('degC')?.offset).toBe(273.15);
    } finally {
      await unlink(entry);
    }
  });

  it('AFF-FINITE-01/S118-CHECKER-FINITE-01 checks static and dynamic physical overflow', () => {
    const huge = `1${'0'.repeat(308)}`;
    const staticFailure = expectCode(`dimension Temperature\nunit kelvin: Temperature\nunit doubled = 2 * kelvin\nlet invalid = ${huge} doubled`, 'AMX3010');
    expect(staticFailure.message).toBe('Measurement physical value must be finite');
    const dynamicFailure = expectRuntimeCode(`dimension Temperature
unit kelvin: Temperature
unit doubled = 2 * kelvin
let displayed: Number = ${huge}
let invalid = displayed doubled`, 'AMX1009');
    expect(dynamicFailure.message).toBe('Measurement physical value must be finite');
    expect(dynamicFailure).toMatchObject({ file: 'measurement.amx', line: 6, column: 15 });
  });
});
