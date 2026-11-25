/**
 * Sprint 015 module/function focused tests: pure functions, local imports/exports,
 * deterministic loading, isolation, diagnostics, and the opt-in Asset Management library.
 */

import { describe, it, expect, afterEach } from "bun:test";
import { mkdir, mkdtemp, rm, realpath, symlink } from "fs/promises";
import { basename, join, relative, sep } from "node:path";
import { tmpdir } from "node:os";
import { loadEntryModule } from "../src/runtime/moduleLoader";
import { AmxError } from "../src/diagnostics/errors";
import {
  AMXRuntimeError,
  amxAdd1Based,
  AMXInputError,
  amxAttach,
  amxBinary,
  amxBuiltin,
  amxChartView,
  amxCopyListArgument,
  amxConvert,
  amxDiagramView,
  amxEqual,
  amxFormatValue,
  amxGet1Based,
  amxIterate,
  amxIsType,
  amxPhysicalValue,
  amxRange,
  amxRemove1Based,
  amxTableView,
  amxUnary,
  type AMXInputDescriptor,
  type AMXMeasurement,
  type AMXValue,
  type AMXViewData,
  requireAMXEnum,
  requireAMXMeasurement,
  requireAMXBoolean,
  requireAMXNumber,
  requireAMXRecord,
  requireAMXString,
  validateAMXValue
} from "../src/transpilerRuntime";

const tmpDirs: string[] = [];
const tmpRootFiles: string[] = [];

async function makeDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "openamx-test-modules-"));
  tmpDirs.push(dir);
  return dir;
}

async function write(dir: string, name: string, content: string): Promise<string> {
  const p = join(dir, name);
  await Bun.write(p, content);
  return p;
}

async function writeRootFile(content: string, directory = process.cwd()): Promise<string> {
  const name = join(directory, `openamx-test-root-${Date.now()}-${Math.random().toString(36).slice(2)}.amx`);
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

describe("S122 transpiler runtime boundary", () => {
  it("routes operators, interpolation, list operations, and builtins through public helpers", () => {
    expect(amxBinary('^', 2, 3)).toBe(8);
    expect(amxUnary('not', '')).toBe(true);
    expect(amxFormatValue(null)).toBe('null');
    expect(amxFormatValue(true)).toBe('true');
    expect(() => amxFormatValue({ nested: [] })).toThrow(expect.objectContaining({ code: 'AMX3007' }));

    const values: AMXValue[] = [1, 3];
    amxAdd1Based(values, 2, 2);
    expect(values).toEqual([1, 2, 3]);
    expect(amxGet1Based(values, 2)).toBe(2);
    expect(amxRange(3, 1)).toEqual([3, 2, 1]);
    expect(amxIterate(values)).toEqual([1, 2, 3]);
    amxRemove1Based(values, 1, 2);
    expect(values).toEqual([1, 3]);

    const nested: AMXValue[] = [[1, [2]]];
    const copied = amxCopyListArgument(nested);
    expect(copied).toEqual(nested);
    expect(copied).not.toBe(nested);
    expect(copied[0]).not.toBe(nested[0]);
    const shared: AMXValue[] = [1];
    const copiedAliases = amxCopyListArgument([shared, shared]);
    expect(copiedAliases[0]).not.toBe(copiedAliases[1]);
    expect(copiedAliases[0]).not.toBe(shared);
    expect(amxBuiltin('sum', [[1, 2, 3]])).toBe(6);
    expect(amxBuiltin('trim', ['  AMX  '])).toBe('AMX');
  });

  it("matches AMX arithmetic, comparison, measurement, range, and list diagnostics", () => {
    expect(amxBinary('-', 8, 3)).toBe(5);
    expect(amxBinary('*', 4, 3)).toBe(12);
    expect(amxBinary('/', 8, 2)).toBe(4);
    expect(amxBinary('%', 8, 3)).toBe(2);
    expect(amxBinary('==', 2, 2)).toBe(true);
    expect(amxBinary('!=', 2, 3)).toBe(true);
    expect(amxBinary('>', 3, 2)).toBe(true);
    expect(amxBinary('>=', 3, 3)).toBe(true);
    expect(amxBinary('<', 2, 3)).toBe(true);
    expect(amxBinary('<=', 3, 3)).toBe(true);

    const meter = { identity: 'length', name: 'meter', scale: 1, offset: 0, vector: { length: 1 } } as const;
    const kilometer = { identity: 'length', name: 'kilometer', scale: 1000, offset: 0, vector: { length: 1 } } as const;
    const oneKilometer = amxAttach(1, kilometer);
    const halfKilometer = amxAttach(500, meter);
    expect(amxBinary('+', oneKilometer, halfKilometer)).toMatchObject({ value: 1.5, unit: { text: 'kilometer' } });
    expect(amxBinary('==', oneKilometer, amxAttach(1000, meter))).toBe(true);
    expect(amxBinary('>', oneKilometer, halfKilometer)).toBe(true);
    expect(amxUnary('-', oneKilometer)).toMatchObject({ value: -1, unit: { text: 'kilometer' } });
    expect(amxBinary('/', oneKilometer, halfKilometer)).toBe(2);
    expect(amxBinary('*', oneKilometer, amxAttach(2, {
      identity: 'time', name: 'second', scale: 1, offset: 0, vector: { time: 1 }
    }))).toMatchObject({ value: 2, unit: { text: 'kilometer * second' } });
    expect(amxBinary('^', amxAttach(2, meter), 2)).toMatchObject({ value: 4, unit: { text: 'meter ^ 2' } });
    expect(amxFormatValue(oneKilometer)).toBe('1 kilometer');
    expect(amxRange(2, 2)).toEqual([2]);
    expect(amxRange(3, 1)).toEqual([3, 2, 1]);
    expect(amxGet1Based([1, 2, 3], 1)).toBe(1);
    expect(amxGet1Based([1, 2, 3], 3)).toBe(3);
    expect(amxIterate([1, 2, 3])).toEqual([1, 2, 3]);
    expect(() => amxIterate(3)).toThrow(expect.objectContaining({ code: 'AMX1006' }));
    expect(() => amxGet1Based([1], 2)).toThrow(expect.objectContaining({ code: 'AMX1008' }));
    const insertedAtStart: AMXValue[] = [2, 3];
    amxAdd1Based(insertedAtStart, 1, 1);
    expect(insertedAtStart).toEqual([1, 2, 3]);

    try {
      amxGet1Based([1], 0, { file: 'entry.amx', line: 2, column: 5 });
      throw new Error('Expected invalid list index');
    } catch (error) {
      expect(error).toBeInstanceOf(AMXRuntimeError);
      expect(error).toMatchObject({ code: 'AMX1008', file: 'entry.amx', line: 2, column: 5 });
    }
    expect(() => amxRange(1.5, 3)).toThrow(expect.objectContaining({ code: 'AMX1005' }));
    expect(() => amxBinary('/', oneKilometer, amxAttach(0, meter), { file: 'entry.amx', line: 3, column: 8 }))
      .toThrow(expect.objectContaining({ code: 'AMX1009', file: 'entry.amx', line: 3, column: 8 }));

    const celsius = { identity: 'celsius', name: 'celsius', scale: 1, offset: 273.15, vector: { temperature: 1 } } as const;
    const warm = amxAttach(20, celsius);
    const cool = amxAttach(10, celsius);
    expect(amxBinary('-', warm, cool)).toMatchObject({ value: 10, unit: { text: 'celsius' } });
    expect(() => amxBinary('+', warm, cool)).toThrow(expect.objectContaining({ code: 'AMX3007' }));
    expect(() => amxBinary('*', warm, 2)).toThrow(expect.objectContaining({ code: 'AMX3007' }));
    expect(() => amxBinary('/', warm, 2)).toThrow(expect.objectContaining({ code: 'AMX3007' }));
    expect(() => amxBinary('^', warm, 2)).toThrow(expect.objectContaining({ code: 'AMX3007' }));
    expect(() => amxBuiltin('sqrt', [warm], { unitDescriptors: [celsius] }))
      .toThrow(expect.objectContaining({ code: 'AMX3007' }));
    expect(() => amxBuiltin('pow', [warm, 2], { unitDescriptors: [celsius] }))
      .toThrow(expect.objectContaining({ code: 'AMX3007' }));

    const list: AMXValue[] = [1, 2, 3, 4];
    amxRemove1Based(list, 2, 2);
    expect(list).toEqual([1, 4]);
    amxRemove1Based(list, 1);
    expect(list).toEqual([1]);
    amxAdd1Based(list, 2);
    expect(list).toEqual([1, 2]);
    expect(() => amxAdd1Based(list, 3, 5)).toThrow(expect.objectContaining({ code: 'AMX1008' }));
    expect(() => amxRemove1Based(list, 1, 2, { mutable: false, targetName: 'imported' }))
      .toThrow(expect.objectContaining({ code: 'AMX1008' }));
    expect(() => amxRemove1Based(list, 0)).toThrow(expect.objectContaining({ code: 'AMX1008' }));
    expect(() => amxRemove1Based(list, 2, 2)).toThrow(expect.objectContaining({ code: 'AMX1008' }));
  });

  it("exercises every public standard-library builtin and its domain diagnostics", () => {
    expect(amxBuiltin('sum', [[1, 2, 3]])).toBe(6);
    expect(amxBuiltin('min', [[3, 1, 2]])).toBe(1);
    expect(amxBuiltin('max', [[3, 1, 2]])).toBe(3);
    expect(amxBuiltin('mean', [[2, 4]])).toBe(3);
    expect(amxBuiltin('round', [1.236, 2])).toBe(1.24);
    expect(amxBuiltin('abs', [-3])).toBe(3);
    expect(amxBuiltin('sqrt', [9])).toBe(3);
    expect(amxBuiltin('pow', [2, 3])).toBe(8);
    expect(amxBuiltin('len', ['🍎'])).toBe(1);
    expect(amxBuiltin('trim', ['  AMX  '])).toBe('AMX');
    expect(amxBuiltin('left', ['🍎OpenAMX', 1])).toBe('🍎');
    expect(amxBuiltin('right', ['OpenAMX🍎', 1])).toBe('🍎');
    expect(amxBuiltin('format', [1234.5, '#,##0.00'])).toBe('1,234.50');
    expect(amxBuiltin('sin', [0])).toBe(0);
    expect(amxBuiltin('cos', [0])).toBe(1);
    expect(amxBuiltin('tan', [0])).toBe(0);
    expect(amxBuiltin('asin', [1])).toBeCloseTo(Math.PI / 2);
    expect(amxBuiltin('acos', [1])).toBe(0);
    expect(amxBuiltin('atan', [0])).toBe(0);
    expect(amxBuiltin('sinh', [0])).toBe(0);
    expect(amxBuiltin('cosh', [0])).toBe(1);
    expect(amxBuiltin('tanh', [0])).toBe(0);
    expect(amxBuiltin('asinh', [0])).toBe(0);
    expect(amxBuiltin('acosh', [1])).toBe(0);
    expect(amxBuiltin('atanh', [0])).toBe(0);
    expect(amxBuiltin('ln', [1])).toBe(0);
    expect(amxBuiltin('log', [100])).toBe(2);
    expect(amxBuiltin('exp', [0])).toBe(1);
    expect(() => amxBuiltin('sqrt', [-1])).toThrow(expect.objectContaining({ code: 'AMX2005' }));
    expect(() => amxBuiltin('asin', [2])).toThrow(expect.objectContaining({ code: 'AMXSL001' }));
    expect(() => amxBuiltin('sum', [])).toThrow(expect.objectContaining({ code: 'AMX2003' }));
  });

  it("validates recursive values, exact enum primitives, defaults, and JSON Pointer paths", () => {
    type Payload = {
      state: 'ready' | 'failed';
      level: 1 | 2;
      rows: Array<{ 'state/code': 'ready' | 'failed' }>;
      note: string | null;
      nullableRequired: string | null;
    };
    const descriptor: AMXInputDescriptor<Payload> = {
      kind: 'record',
      recordName: 'Payload',
      fields: [
        { name: 'state', descriptor: { kind: 'enum', enumName: 'Status', members: ['ready', 'failed'] }, defaultValue: () => 'ready' },
        { name: 'level', descriptor: { kind: 'enum', enumName: 'Priority', members: [1, 2] } },
        { name: 'rows', descriptor: { kind: 'list', element: { kind: 'record', recordName: 'Row', fields: [
          { name: 'state/code', descriptor: { kind: 'enum', enumName: 'Status', members: ['ready', 'failed'] } }
        ] } } },
        { name: 'note', descriptor: { kind: 'nullable', value: { kind: 'string' } }, optional: true },
        { name: 'nullableRequired', descriptor: { kind: 'nullable', value: { kind: 'string' } } }
      ]
    };
    const context = { inputPath: 'payload', file: 'entry.amx', line: 9, column: 4 };
    const normalized = validateAMXValue<Payload>({
      level: 1,
      rows: [{ 'state/code': 'ready' }],
      nullableRequired: null
    }, descriptor, context);
    expect(normalized).toEqual({
      state: 'ready', level: 1, rows: [{ 'state/code': 'ready' }], note: null, nullableRequired: null
    });
    expect(amxIsType(normalized, descriptor)).toBe(true);
    expect(amxIsType({ level: '1' }, descriptor)).toBe(false);

    expect(() => validateAMXValue({
      level: 1, rows: [], extra: true, nullableRequired: null
    }, descriptor, context)).toThrow(expect.objectContaining({
      code: 'AMX4003', inputPath: 'payload/extra', expected: 'declared record field'
    }));
    expect(() => validateAMXValue({ level: 1, rows: [] }, descriptor, context))
      .toThrow(expect.objectContaining({ code: 'AMX4003', inputPath: 'payload/nullableRequired', actual: 'missing' }));
    expect(() => validateAMXValue(null, descriptor, context)).toThrow(AMXInputError);

    const cyclicList: unknown[] = [];
    cyclicList.push(cyclicList);
    expect(() => validateAMXValue(cyclicList, { kind: 'list', element: { kind: 'number' } }, { inputPath: 'items' }))
      .toThrow(expect.objectContaining({ code: 'AMX4003', inputPath: 'items/0' }));

    try {
      validateAMXValue({
        level: '1',
        rows: [{ 'state/code': 'ready' }],
        nullableRequired: null
      }, descriptor, context);
      throw new Error('Expected an invalid numeric enum input');
    } catch (error) {
      expect(error).toBeInstanceOf(AMXInputError);
      expect(error).toMatchObject({ code: 'AMX4003', inputPath: 'payload/level', expected: "member of enum 'Priority'" });
      expect((error as AMXInputError).diagnostic).toMatchObject({ file: 'entry.amx', line: 9, column: 4 });
    }

    try {
      validateAMXValue({
        level: 1,
        rows: [{ 'state/code': 1 }],
        nullableRequired: null
      }, descriptor, context);
      throw new Error('Expected an invalid nested string enum input');
    } catch (error) {
      expect(error).toBeInstanceOf(AMXInputError);
      expect(error).toMatchObject({ inputPath: 'payload/rows/0/state~1code', actual: 'number' });
    }
    expect(() => validateAMXValue('2024-02-29T12:30:00Z', { kind: 'dateTime' }, context)).not.toThrow();
    expect(() => validateAMXValue('2023-02-29T12:30:00Z', { kind: 'dateTime' }, context)).toThrow(AMXInputError);
  });

  it("preserves measurement builtin units and source diagnostics", () => {
    const length = { identity: 'length', name: 'meter', scale: 1, offset: 0, vector: { length: 1 } } as const;
    const area = {
      identity: 'area', name: 'square_meter', scale: 1, offset: 0, vector: { length: 2 },
      factors: [{ identity: 'length', name: 'meter', exponent: 2 }]
    } as const;
    const squareMeters = amxAttach(9, area);
    const root = amxBuiltin('sqrt', [squareMeters], { unitDescriptors: [area, length] }) as AMXMeasurement;
    expect(root).toMatchObject({ value: 3, unit: { text: 'meter', vector: { length: 1 } } });

    const kilometer = { identity: 'kilometer', name: 'kilometer', scale: 1000, offset: 0, vector: { length: 1 } } as const;
    const distances = [amxAttach(1, kilometer), amxAttach(500, length)];
    expect(amxBuiltin('sum', [distances])).toMatchObject({ value: 1.5, unit: { text: 'kilometer' } });
    expect(amxBuiltin('mean', [distances])).toMatchObject({ value: 0.75, unit: { text: 'kilometer' } });
    expect(amxBuiltin('min', [distances])).toBe(distances[1]);
    expect(amxBuiltin('max', [distances])).toBe(distances[0]);
    expect(amxBuiltin('abs', [amxAttach(-2, kilometer)])).toMatchObject({ value: 2, unit: { text: 'kilometer' } });
    expect(amxBuiltin('round', [amxAttach(1.236, kilometer), 2])).toMatchObject({ value: 1.24, unit: { text: 'kilometer' } });
    expect(amxBuiltin('format', [amxAttach(12.5, kilometer), '0.0'])).toBe('12.5 kilometer');

    const one = { identity: 'one', name: 'one', scale: 1, offset: 0, vector: {} } as const;
    const dimensionless = amxAttach(1, one);
    expect(amxBuiltin('sin', [dimensionless], { unitDescriptors: [one] })).toBeCloseTo(Math.sin(1));
    expect(() => amxBuiltin('sin', [amxAttach(1, length)], { unitDescriptors: [length] }))
      .toThrow(expect.objectContaining({ code: 'AMX3007' }));

    const celsius = { identity: 'temperature', name: 'celsius', scale: 1, offset: 273.15, vector: { temperature: 1 } } as const;
    const fahrenheit = { identity: 'fahrenheit', name: 'fahrenheit', scale: 5 / 9, offset: 273.15 - 160 / 9, vector: { temperature: 1 } } as const;
    const kelvin = { identity: 'kelvin', name: 'kelvin', scale: 1, offset: 0, vector: { temperature: 1 } } as const;
    expect(amxConvert(amxAttach(0, celsius), fahrenheit).value).toBeCloseTo(32, 12);
    expect(amxConvert(amxAttach(0, celsius), kelvin).value).toBeCloseTo(273.15, 12);
    const affineValues = [amxAttach(10, celsius), amxAttach(20, celsius)];
    expect(amxBuiltin('sum', [affineValues])).toMatchObject({ value: 303.15, unit: { text: 'celsius' } });
    expect(amxBuiltin('mean', [affineValues])).toMatchObject({ value: 15, unit: { text: 'celsius' } });
    const temperature = amxAttach(20, celsius);
    try {
      amxBinary('+', temperature, temperature, { file: 'entry.amx', line: 4, column: 7 });
      throw new Error('Expected affine addition to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(AMXRuntimeError);
      expect(error).toMatchObject({ code: 'AMX3007', file: 'entry.amx', line: 4, column: 7 });
    }
  });

  it("validates exact recursive measurement inputs and descriptor boundaries", () => {
    const meter = { identity: 'length', name: 'meter', scale: 1, offset: 0, vector: { length: 1 } } as const;
    const kilometer = { identity: 'length', name: 'kilometer', scale: 1000, offset: 0, vector: { length: 1 } } as const;
    const second = { identity: 'time', name: 'second', scale: 1, offset: 0, vector: { time: 1 } } as const;
    const descriptor: AMXInputDescriptor<AMXMeasurement> = {
      kind: 'measurement', dimensionName: 'Length', dimensionVector: { length: 1 },
      units: { meter, kilometer }
    };
    const context = { inputPath: 'distance' };
    const distance = validateAMXValue<AMXMeasurement>({ value: 1, unit: 'kilometer' }, descriptor, context);
    expect(distance).toMatchObject({ value: 1, unit: { text: 'kilometer' } });

    for (const invalid of [
      { value: 1, unit: 'meter', extra: true },
      { value: 1 },
      1
    ]) {
      expect(() => validateAMXValue(invalid, descriptor, context))
        .toThrow(expect.objectContaining({ code: 'AMX4003', inputPath: 'distance' }));
    }
    expect(() => validateAMXValue({ value: 1, unit: 'mile' }, descriptor, context))
      .toThrow(expect.objectContaining({ code: 'AMX4003', inputPath: 'distance/unit' }));
    expect(() => requireAMXMeasurement({ value: 1, unit: 'second' }, 'Length', { length: 1 }, { meter, second }, 'distance'))
      .toThrow(AMXInputError);
    expect(() => validateAMXValue({ value: Number.POSITIVE_INFINITY, unit: 'meter' }, descriptor, context))
      .toThrow(expect.objectContaining({ code: 'AMX4003', inputPath: 'distance/value' }));
    const overflowing: AMXInputDescriptor<AMXMeasurement> = {
      kind: 'measurement', dimensionName: 'Length', dimensionVector: { length: 1 },
      units: { huge: { ...meter, name: 'huge', scale: 1e308 } }
    };
    expect(() => validateAMXValue({ value: 1e308, unit: 'huge' }, overflowing, context))
      .toThrow(expect.objectContaining({ code: 'AMX4003', expected: 'finite physical Measurement' }));
    const invalidDescriptor: AMXInputDescriptor<AMXMeasurement> = {
      kind: 'measurement', dimensionName: 'Length', dimensionVector: { length: 1 },
      units: { meter: { ...meter, scale: Number.POSITIVE_INFINITY } }
    };
    let descriptorError: unknown;
    try { validateAMXValue({ value: 1, unit: 'meter' }, invalidDescriptor, context); }
    catch (error) { descriptorError = error; }
    expect(descriptorError).toBeInstanceOf(AMXInputError);
    expect(descriptorError).toMatchObject({ code: 'AMX4003', expected: 'valid Measurement descriptor' });
  });

  it("provides typed scalar and enum input checks with source-path errors", () => {
    expect(requireAMXNumber(6, "amount")).toBe(6);
    expect(requireAMXString('ready', 'status')).toBe('ready');
    expect(requireAMXBoolean(true, 'enabled')).toBe(true);
    expect(requireAMXEnum("ready", "Status", ["ready", "failed"], "status")).toBe("ready");
    expect(() => requireAMXNumber(Number.POSITIVE_INFINITY, "amount")).toThrow(AMXInputError);
    expect(() => requireAMXString(1, 'status')).toThrow(AMXInputError);
    expect(() => requireAMXBoolean('true', 'enabled')).toThrow(AMXInputError);
    expect(() => requireAMXEnum("unknown", "Status", ["ready", "failed"], "status")).toThrow(AMXInputError);
    expect(() => requireAMXRecord(null, 'inputs', ['amount'])).toThrow(AMXInputError);
    expect(() => requireAMXRecord({ amount: 1, 'other/key': 2 }, 'inputs', ['amount']))
      .toThrow(expect.objectContaining({ inputPath: 'inputs/other~1key', code: 'AMX4003' }));
  });

  it("validates measurement shape and preserves conversion and physical equality", () => {
    const lengthVector = { length: 1 };
    const meter = { identity: "length", name: "meter", scale: 1, offset: 0, vector: lengthVector } as const;
    const kilometer = { identity: "length", name: "kilometer", scale: 1000, offset: 0, vector: lengthVector } as const;
    const units = { meter, kilometer };
    const distance = requireAMXMeasurement({ value: 1, unit: "kilometer" }, "Length", lengthVector, units, "distance");
    const converted = amxConvert(distance, meter);

    expect(converted.value).toBe(1000);
    expect(amxPhysicalValue(distance)).toBe(1000);
    expect(amxEqual(distance, amxAttach(1000, meter))).toBe(true);
    expect(() => requireAMXMeasurement(1, "Length", lengthVector, units, "distance")).toThrow(AMXInputError);
  });

  it("constructs distinct frozen table, chart, and declaration-time diagram DTOs", () => {
    const table = amxTableView("records", [{ field: "id", label: "ID" }], [["A-1"]]);
    const chart = amxChartView({
      name: "sample",
      chartKind: "column",
      title: "Sample",
      description: "Sample values",
      data: [2, 4],
      showTable: true
    });
    const diagram = amxDiagramView({
      name: "empty",
      title: "Empty",
      description: "No authored elements",
      canvas: { width: 10, height: 10, coordinates: "bottom-left-y-up" },
      timeline: { variable: "t", from: 0, to: 1, duration: 1 },
      initialFrame: { time: 0, elements: [] }
    });

    expect([table.kind, chart.kind, diagram.kind]).toEqual(["table", "chart", "diagram"]);
    expect(Object.isFrozen(table.rows[0])).toBe(true);
    expect(Object.isFrozen(diagram.initialFrame)).toBe(true);
    expect(diagram.schema).toBe('legacy-v1');
    for (const chartKind of ['bar', 'column', 'line', 'scatter'] as const) {
      expect(amxChartView({
        name: chartKind, chartKind, title: chartKind, description: '', data: [], showTable: false
      }).chartKind).toBe(chartKind);
    }
    expect(() => amxTableView('unsupported', [], [[new Date() as unknown as AMXViewData]]))
      .toThrow(AMXInputError);
  });

  it("detaches view snapshots and exposes structured diagram data beside legacy DTOs", () => {
    const sourceRow = { nested: [1, { value: 2 }] };
    const table = amxTableView('records', [{ field: 'payload', label: 'Payload' }], [[sourceRow]], 'Records', 'Snapshot');
    const sourceChartData = [{ label: 'A', value: 2 }];
    const chart = amxChartView({
      name: 'series', chartKind: 'line', title: 'Series', description: 'Values',
      data: sourceChartData, labels: ['A'], headings: ['label', 'value'],
      measurementDescriptors: [{ role: 'series', field: 'value', label: 'Load', unit: {
        text: 'kilonewton', scale: 1000, vector: { force: 1 },
        factors: [{ identity: 'force', name: 'kilonewton', exponent: 1 }]
      } }],
      showTable: false
    });
    const structured = amxDiagramView({
      schema: 'structured-v2', name: 'scene', title: 'Scene', description: 'Initial frame',
      canvas: { width: 100, height: 80, coordinates: 'bottom-left-y-up' },
      timeline: { variable: 'time', from: 0, to: 1, duration: 1 },
      initialFrame: { time: 0, elements: [{
        primitive: 'line', name: 'axis', x1: 0, y1: 0, x2: 10, y2: 10,
        stroke: '#000000', lineWidth: 1, arrow: 'none'
      }] }
    });

    sourceRow.nested[0] = 99;
    sourceRow.nested[1].value = 100;
    sourceChartData[0].value = 10;
    expect(table).toMatchObject({ title: 'Records', description: 'Snapshot', rows: [[{ nested: [1, { value: 2 }] }]] });
    expect(chart).toMatchObject({ labels: ['A'], headings: ['label', 'value'], showTable: false, data: [{ value: 2 }] });
    expect(structured).toMatchObject({ kind: 'diagram', schema: 'structured-v2', initialFrame: { elements: [{ primitive: 'line' }] } });
    expect(Object.isFrozen(sourceRow)).toBe(false);
    expect(Object.isFrozen(sourceRow.nested)).toBe(false);
    expect(Object.isFrozen(table.rows[0][0])).toBe(true);

    const cyclic: { value?: AMXViewData } = {};
    cyclic.value = cyclic as AMXViewData;
    expect(() => amxTableView('cycle', [], [[cyclic]])).toThrow(AMXRuntimeError);
  });
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
  it("resolves nested imports within an explicitly selected project root", async () => {
    const dir = await makeDir();
    const models = join(dir, "src", "models");
    const duval = join(dir, "src", "algorithms", "duval");
    await mkdir(models, { recursive: true });
    await mkdir(duval, { recursive: true });
    const unitsPath = await write(models, "Units.amx", "```amx\nexport type Concentration {\n  value: Number\n}\nexport let ppm: Number = 1\n```\n");
    const entry = await write(duval, "DuvalTriangleOne.algorithm.amx", "```amx\nimport { Concentration, ppm } from \"../../models/Units.amx\"\nlet value: Concentration = Concentration { value = ppm }\n```\n");

    const { env } = await loadEntryModule(entry, {
      importRoot: dir,
      sourceOverlay: new Map([[await realpath(unitsPath), "```amx\nexport type Concentration {\n  value: Number\n}\nexport let ppm: Number = 5\n```\n"]])
    });

    expect(env.toObject()).toMatchObject({ value: { value: 5 } });

    const outside = await writeRootFile("```amx\nexport let outsideValue: Number = 2\n```\n");
    const outsideImport = relative(duval, outside).split(sep).join("/");
    const escapingEntry = await write(duval, "Escaping.amx", `\`\`\`amx\nimport { outsideValue } from "${outsideImport}"\nlet value: Number = outsideValue\n\`\`\`\n`);
    await expectAmxError(loadEntryModule(escapingEntry, { importRoot: dir }), "AMX5001");

    await symlink(outside, join(models, "linked.amx"));
    const symlinkEntry = await write(duval, "Symlink.amx", "```amx\nimport { outsideValue } from \"../../models/linked.amx\"\nlet value: Number = outsideValue\n```\n");
    await expectAmxError(loadEntryModule(symlinkEntry, { importRoot: dir }), "AMX5001");
  });

  it("evaluates an imported type, function, and value, deterministically once, and isolates unrelated module bindings", async () => {
    const dir = await makeDir();
    await write(dir, "lib.amx", "```amx\nlet libOnly: Number = 99\nexport type Point {\n  x: Number\n  y: Number\n}\nexport fn distanceSquared(a: Point, b: Point): Number = (a.x - b.x) ^ 2 + (a.y - b.y) ^ 2\nexport let origin: Point = Point { x = 0, y = 0 }\n```\n");
    const entry = await write(dir, "entry.amx", "```amx\nimport { Point, distanceSquared, origin } from \"./lib.amx\"\n\nlet p: Point = Point { x = 3, y = 4 }\nlet d: Number = distanceSquared(p, origin)\n```\n");
    const { env } = await loadEntryModule(entry);
    const values = env.toObject();
    expect(values).toMatchObject({ p: { x: 3, y: 4 }, d: 25, origin: { x: 0, y: 0 } });
    expect(values).not.toHaveProperty("libOnly");
  });

  it("imports and evaluates an exported statement-bodied function", async () => {
    const dir = await makeDir();
    await write(dir, "lib.amx", "```amx\nexport fn increment(value: Number): Number {\n  return value + 1\n}\n```\n");
    const entry = await write(dir, "entry.amx", "```amx\nimport { increment } from \"./lib.amx\"\nlet result: Number = increment(4)\n```\n");
    const { env } = await loadEntryModule(entry);
    expect(env.toObject()).toMatchObject({ result: 5 });
  });

  it("implements RI-V04 for an imported and exported record parent", async () => {
    const dir = await makeDir();
    await write(dir, "library.amx", [
      '---',
      'fixture: RI-V04',
      'file: library.amx',
      '---',
      '```amx',
      'export type Identifier {',
      '  id: String',
      '}',
      '```',
      ''
    ].join('\n'));
    const entry = await write(dir, "entry.amx", [
      '---',
      'fixture: RI-V04',
      'file: entry.amx',
      '---',
      '```amx',
      'import { Identifier } from "./library.amx"',
      'type Asset extends Identifier {',
      '  duty: Number',
      '}',
      'let asset: Asset = Asset { id = "A-1", duty = 2 }',
      '```',
      ''
    ].join('\n'));
    const { env } = await loadEntryModule(entry);
    expect(env.toObject().asset).toEqual({ id: 'A-1', duty: 2 });
  });

  it("implements EN-V04 for an imported and exported enum with primitive member values", async () => {
    const dir = await makeDir();
    await write(dir, "library.amx", [
      '---',
      'fixture: EN-V04',
      'file: library.amx',
      '---',
      '```amx',
      'export enum Status = {',
      '  DRAFT,',
      '  ACTIVE',
      '}',
      '```',
      ''
    ].join('\n'));
    const entry = await write(dir, "entry.amx", [
      '---',
      'fixture: EN-V04',
      'file: entry.amx',
      '---',
      '```amx',
      'import { Status } from "./library.amx"',
      'let active: Number = Status.ACTIVE',
      '```',
      ''
    ].join('\n'));
    const { env } = await loadEntryModule(entry);
    expect(env.toObject().active).toBe(2);
  });

  it("validates file-backed input values against an imported enum", async () => {
    const dir = await makeDir();
    await write(dir, "library.amx", [
      '```amx',
      'export enum Status = {',
      '  READY = "ready",',
      '  FAILED = "failed"',
      '}',
      'export type Row {',
      '  status: Status',
      '}',
      '```',
      ''
    ].join('\n'));
    const entry = await write(dir, "entry.amx", [
      '```amx',
      'import { Status, Row } from "./library.amx"',
      'input status: Status',
      'input rows: Row[]',
      '```',
      ''
    ].join('\n'));
    const validInput = await write(dir, "status.json", '"ready"');
    const rowsInput = await write(dir, "rows.json", '[{"status":"failed"}]');
    const { env } = await loadEntryModule(entry, { inputMappings: [`status=${validInput}`, `rows=${rowsInput}`] });
    expect(env.toObject().status).toBe('ready');
    expect(env.toObject().rows).toEqual([{ status: 'failed' }]);

    const validCsv = await write(dir, "rows.csv", 'status\nready\n');
    const csvResult = await loadEntryModule(entry, { inputMappings: [`status=${validInput}`, `rows=${validCsv}`] });
    expect(csvResult.env.toObject().rows).toEqual([{ status: 'ready' }]);

    const invalidInput = await write(dir, "invalid-status.json", '"unknown"');
    const error = await expectAmxError(loadEntryModule(entry, { inputMappings: [`status=${invalidInput}`, `rows=${rowsInput}`] }), "AMX4003");
    expect(error.diagnostics?.[0]).toMatchObject({ inputName: 'status', expected: 'Status', actual: '"unknown"' });
    const invalidCsv = await write(dir, "invalid-rows.csv", 'status\nunknown\n');
    const csvError = await expectAmxError(loadEntryModule(entry, { inputMappings: [`status=${validInput}`, `rows=${invalidCsv}`] }), "AMX4003");
    expect(csvError.diagnostics?.[0]).toMatchObject({ inputName: 'rows', dataPath: 'record[1].status', expected: 'Status' });
  });

  it("validates imported numeric enums in file-backed JSON and CSV inputs", async () => {
    const dir = await makeDir();
    await write(dir, "library.amx", [
      '```amx',
      'export enum Priority = {',
      '  LOW = 10,',
      '  HIGH = 20',
      '}',
      'export type Row {',
      '  priority: Priority',
      '}',
      '```',
      ''
    ].join('\n'));
    const entry = await write(dir, "entry.amx", [
      '```amx',
      'import { Priority, Row } from "./library.amx"',
      'input rows: Row[]',
      '```',
      ''
    ].join('\n'));
    const json = await write(dir, "rows.json", '[{"priority":20}]');
    const csv = await write(dir, "rows.csv", 'priority\n10\n');
    const jsonResult = await loadEntryModule(entry, { inputMappings: [`rows=${json}`] });
    const csvResult = await loadEntryModule(entry, { inputMappings: [`rows=${csv}`] });
    expect(jsonResult.env.toObject().rows).toEqual([{ priority: 20 }]);
    expect(csvResult.env.toObject().rows).toEqual([{ priority: 10 }]);

    const invalidJson = await write(dir, "invalid-rows.json", '[{"priority":"20"}]');
    const jsonError = await expectAmxError(loadEntryModule(entry, { inputMappings: [`rows=${invalidJson}`] }), "AMX4003");
    expect(jsonError.diagnostics?.[0]).toMatchObject({ inputName: 'rows', dataPath: '/0/priority', expected: 'Priority' });
    const invalidCsv = await write(dir, "invalid-rows.csv", 'priority\n30\n');
    const csvError = await expectAmxError(loadEntryModule(entry, { inputMappings: [`rows=${invalidCsv}`] }), "AMX4003");
    expect(csvError.diagnostics?.[0]).toMatchObject({ inputName: 'rows', dataPath: 'record[1].priority', expected: 'Priority' });
  });

  it("rejects EN-I09 when an imported enum is not exported", async () => {
    const dir = await makeDir();
    await write(dir, "library.amx", [
      '---',
      'fixture: EN-I09',
      'file: library.amx',
      '---',
      '```amx',
      'enum Status = {',
      '  ACTIVE',
      '}',
      '```',
      ''
    ].join('\n'));
    const entry = await write(dir, "entry.amx", [
      '---',
      'fixture: EN-I09',
      'file: entry.amx',
      '---',
      '```amx',
      'import { Status } from "./library.amx"',
      'let active: Number = Status.ACTIVE',
      '```',
      ''
    ].join('\n'));
    const error = await expectAmxError(loadEntryModule(entry), "AMX5002");
    expect(error.file).toBe(await realpath(entry));
    expect(error).toMatchObject({ line: 6, column: 10 });
  });

  it("rejects RI-I10 when an imported record parent is not exported", async () => {
    const dir = await makeDir();
    await write(dir, "library.amx", [
      '---',
      'fixture: RI-I10',
      'file: library.amx',
      '---',
      '```amx',
      'type Identifier {',
      '  id: String',
      '}',
      '```',
      ''
    ].join('\n'));
    const entry = await write(dir, "entry.amx", [
      '---',
      'fixture: RI-I10',
      'file: entry.amx',
      '---',
      '```amx',
      'import { Identifier } from "./library.amx"',
      'type Asset extends Identifier {',
      '  tag: String',
      '}',
      '```',
      ''
    ].join('\n'));
    const error = await expectAmxError(loadEntryModule(entry), "AMX5002");
    expect(error.file).toBe(await realpath(entry));
    expect(error).toMatchObject({ line: 6, column: 10 });
  });

  it("statically rejects an invalid untyped imported module before loading its exports", async () => {
    const dir = await makeDir();
    await write(dir, "library.amx", "```amx\nexport let invalid = \"three\" + 1\n```\n");
    const entry = await write(dir, "entry.amx", "```amx\nimport { invalid } from \"./library.amx\"\nlet result = invalid\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3007");
  });

  it("preserves AMX3006 for legacy constructor syntax through file-backed module loading", async () => {
    const dir = await makeDir();
    const entry = await write(dir, "entry.amx", "```amx\ntype Item {\n  id: Number\n}\nlet item = Item { id: 1 }\n```\n");
    const error = await expectAmxError(loadEntryModule(entry), "AMX3006");
    expect(error.file).toBe(entry);
    expect(error.line).toBe(5);
    expect(error.column).toBe(21);
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

  it("inspects mapped data in memory against imported types without evaluating AMX or writing files", async () => {
    const dir = await makeDir();
    const dependencyPath = await write(dir, "types.amx", [
      "```amx", "export type Row {", "  id: String", "  amount: Number", "}", "```", ""
    ].join("\n"));
    const entryPath = await write(dir, "entry.amx", [
      "```amx", "import { Row } from \"./types.amx\"", "input rows: Row[]", "let forbidden: Number = 1 / 0", "```", ""
    ].join("\n"));
    const canonicalDependencyPath = await realpath(dependencyPath);
    const diskText = await Bun.file(dependencyPath).text();
    const inspection = await loadEntryModule(entryPath, {
      sourceOverlay: new Map([[canonicalDependencyPath, [
        "```amx", "export type Row {", "  id: String", "  amount: Number = 4", "}", "```", ""
      ].join("\n")]]),
      inputInspection: { name: "rows", format: "json", text: "[{\"id\":\"A\"}]" }
    });

    expect(inspection.inputInspection).toEqual({
      schema: {
        name: "rows", type: "Row[]", acceptedFormats: ["json", "csv"],
        fields: [
          { name: "id", type: "String", optional: false, hasDefault: false },
          { name: "amount", type: "Number", optional: false, hasDefault: true }
        ]
      },
      valid: true,
      diagnostics: [],
      outputs: []
    });
    expect(inspection.env.toObject()).toEqual({});
    expect(await Bun.file(dependencyPath).text()).toBe(diskText);
  });

  it("discovers eligible explicit outputs through unsaved imports without loading inputs or evaluating", async () => {
    const dir = await makeDir();
    const dependencyPath = await write(dir, "types.amx", "```amx\nexport type Row {\n  id: String\n  amount: Number\n}\n```\n");
    const entryPath = await write(dir, "entry.amx", [
      "```amx", "import { Row } from \"./types.amx\"", "input sourceRows: Row[]", "export let result: Number = 1 / 0",
      "let privateRows: Row[] = []", "export let rows: Row[] = []", "```", ""
    ].join("\n"));
    const canonicalDependencyPath = await realpath(dependencyPath);
    const inspection = await loadEntryModule(entryPath, {
      sourceOverlay: new Map([[canonicalDependencyPath, "```amx\nexport type Row {\n  id: String\n  amount: Number?\n}\n```\n"]]),
      outputInspection: true
    });

    expect(inspection.outputSchemas).toEqual([
      { name: "result", type: "Number", formats: ["json"] },
      { name: "rows", type: "Row[]", formats: ["json", "csv"] }
    ]);
    expect(inspection.env.toObject()).toEqual({});
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
    const entry = await write(dir, "entry.amx", "```amx\nlet a: Asset = Asset { id = \"1\", name = \"n\", assetClass = \"c\", criticality = 1 }\n```\n");
    await expectAmxError(loadEntryModule(entry), "AMX3001");
  });

  it("imports and constructs the six approved Asset Management schemas from the real library file", async () => {
    const entry = await writeRootFile(
      "```amx\n" +
      "import { FailureMode, Risk, Strategy, Asset, MaintenanceTask, LifecycleCost } from \"./libraries/asset-management.amx\"\n\n" +
      "let mode: FailureMode = FailureMode { id = \"FM1\", name = \"Bearing wear\", severity = 8, occurrence = 3 }\n" +
      "let asset: Asset = Asset { id = \"A1\", name = \"Pump 1\", assetClass = \"Pump\", criticality = 5, failureModes = [mode] }\n" +
      "let risk: Risk = Risk { id = \"R1\", failureMode = mode, likelihood = 2, consequence = 4 }\n" +
      "let strategy: Strategy = Strategy { id = \"S1\", name = \"Predictive\" }\n" +
      "let task: MaintenanceTask = MaintenanceTask { id = \"T1\", assetId = \"A1\", title = \"Inspect\", intervalDays = 30 }\n" +
      "let cost: LifecycleCost = LifecycleCost { assetId = \"A1\", acquisitionCost = 1000, operatingCost = 200, maintenanceCost = 50 }\n" +
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
    const outside = await writeRootFile("```amx\nexport let secret: Number = 1\n```\n", tmpdir());
    const outsideName = basename(outside);
    const entryText = `\`\`\`amx\nimport { secret } from "../${outsideName}"\n\`\`\`\n`;

    const error = await expectAmxError(loadEntryModule(entryPath, { entryText }), "AMX5001");
    expect(error.message).toContain("outside the entry directory tree");
    expect(error.file && basename(error.file)).toBe("entry.amx");
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
    const entry = await write(dir, "computed.amx", "```amx\ntype Pair {\n  first: Number\n  second: Number\n}\nlet pair: Pair = Pair { first = 1 / 0, second = 0 / 0 }\n```\n");
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
      process.execPath, 'run', 'src/cli.ts', 'run', entry,
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
      process.execPath, 'run', 'src/cli.ts', 'render', typedEntry, '--out', htmlPath,
      '--input', `amount=${dir}/amount.json`, '--validation', 'aggregate'
    ]);
    expect(render.exitCode).toBe(0);
    expect(await Bun.file(htmlPath).text()).toContain('Total: 9');

    const legacyEntry = await write(dir, "legacy.amx", "```amx\nlet value = 3\n```\n");
    const run = Bun.spawnSync([process.execPath, 'run', 'src/cli.ts', 'run', legacyEntry]);
    expect(run.exitCode).toBe(0);
    expect(new TextDecoder().decode(run.stdout)).toContain('"value": 3');
  });

  it("does not write rendered HTML when input validation fails", async () => {
    const dir = await makeDir();
    await write(dir, "invalid.json", '"wrong"');
    const entry = await write(dir, "entry.amx", "```amx\ninput amount: Number\n```\n");
    const htmlPath = `${dir}/must-not-exist.html`;
    const command = Bun.spawnSync([
      process.execPath, 'run', 'src/cli.ts', 'render', entry, '--out', htmlPath,
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
    const entry = await write(dir, "entry.amx", `\`\`\`amx\nimport { Asset } from "./assets.amx"\nlet assets: Asset[] = [Asset { id = "A" }]\ntable register = table(assets) {\n  title: "Register"\n  column id as "Asset"\n}\nshow register\n\`\`\`\n`);
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
