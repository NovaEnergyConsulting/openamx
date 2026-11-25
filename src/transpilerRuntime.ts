import {
  isMeasurement,
  measurement,
  measurementDisplayValue,
  measurementPhysicalValue,
  type MeasurementUnit,
  type MeasurementUnitFactor,
  type MeasurementValue
} from './runtime/measurement';

export type AMXPrimitive = string | number | boolean | null;

export type AMXViewData = AMXPrimitive | readonly AMXViewData[]
  | Readonly<{ [field: string]: AMXViewData }>;

export interface AMXUnitDescriptor {
  readonly identity: string;
  readonly name: string;
  readonly scale: number;
  readonly offset: number;
  readonly vector: Readonly<Record<string, number>>;
  readonly factors?: readonly MeasurementUnitFactor[];
}

export interface AMXMeasurement extends MeasurementValue {}

export class AMXInputError extends TypeError {
  readonly code = 'AMX4003';

  constructor(
    readonly inputPath: string,
    readonly expected: string,
    readonly actual: string
  ) {
    super(`Invalid input at '${inputPath}': expected ${expected}, got ${actual}`);
    this.name = 'AMXInputError';
  }
}

export function requireAMXNumber(value: unknown, inputPath: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new AMXInputError(inputPath, 'finite Number', describeInput(value));
  }
  return value;
}

export function requireAMXString(value: unknown, inputPath: string): string {
  if (typeof value !== 'string') {
    throw new AMXInputError(inputPath, 'String', describeInput(value));
  }
  return value;
}

export function requireAMXBoolean(value: unknown, inputPath: string): boolean {
  if (typeof value !== 'boolean') {
    throw new AMXInputError(inputPath, 'Boolean', describeInput(value));
  }
  return value;
}

export function requireAMXEnum(
  value: unknown,
  enumName: string,
  members: readonly (string | number)[],
  inputPath: string
): string | number {
  if ((typeof value !== 'string' && typeof value !== 'number') || !members.includes(value)) {
    throw new AMXInputError(inputPath, `member of enum '${enumName}'`, describeInput(value));
  }
  return value;
}

export function requireAMXMeasurement(
  value: unknown,
  dimensionName: string,
  dimensionVector: Readonly<Record<string, number>>,
  units: Readonly<Record<string, AMXUnitDescriptor>>,
  inputPath: string
): AMXMeasurement {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AMXInputError(inputPath, `Measurement<${dimensionName}> as {value, unit}`, describeInput(value));
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 2 || !keys.includes('value') || !keys.includes('unit')) {
    throw new AMXInputError(inputPath, `exact {value, unit} Measurement<${dimensionName}>`, describeInput(value));
  }
  if (typeof record.unit !== 'string') {
    throw new AMXInputError(`${inputPath}/unit`, 'unit name', describeInput(record.unit));
  }
  const unit = units[record.unit];
  if (!unit) {
    throw new AMXInputError(`${inputPath}/unit`, `visible ${dimensionName} unit`, record.unit);
  }
  if (!sameVector(unit.vector, dimensionVector)) {
    throw new AMXInputError(`${inputPath}/unit`, `unit of dimension ${dimensionName}`, record.unit);
  }
  const numericValue = requireAMXNumber(record.value, `${inputPath}/value`);
  return amxAttach(numericValue, unit);
}

export function requireAMXList(value: unknown, inputPath: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new AMXInputError(inputPath, 'list', describeInput(value));
  }
  return value;
}

export function requireAMXRecord(
  value: unknown,
  inputPath: string,
  allowedFields: readonly string[]
): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AMXInputError(inputPath, 'record object', describeInput(value));
  }
  const record = value as Record<string, unknown>;
  const allowed = new Set(allowedFields);
  const unknownField = Object.keys(record).find(field => !allowed.has(field));
  if (unknownField !== undefined) {
    throw new AMXInputError(`${inputPath}/${escapePointer(unknownField)}`, 'declared record field', describeInput(record[unknownField]));
  }
  return record;
}

export function amxAttach(value: number, unit: AMXUnitDescriptor): AMXMeasurement {
  validateUnit(unit);
  const result = measurement(requireAMXNumber(value, 'measurement.value'), toMeasurementUnit(unit));
  if (!Number.isFinite(measurementPhysicalValue(result))) {
    throw new RangeError('Measurement physical value must be finite');
  }
  return result;
}

export function amxConvert(value: AMXMeasurement, target: AMXUnitDescriptor): AMXMeasurement {
  validateUnit(target);
  if (!isMeasurement(value) || !sameVector(value.unit.vector, target.vector)) {
    throw new TypeError(`Cannot convert measurement to unit '${target.name}'`);
  }
  const targetUnit = toMeasurementUnit(target);
  const converted = measurementDisplayValue(measurementPhysicalValue(value), targetUnit);
  if (!Number.isFinite(converted)) {
    throw new RangeError('Converted measurement value must be finite');
  }
  return measurement(converted, targetUnit);
}

export function amxPhysicalValue(value: AMXMeasurement): number {
  return measurementPhysicalValue(value);
}

export function amxEqual(left: AMXMeasurement, right: AMXMeasurement): boolean {
  return isMeasurement(left) && isMeasurement(right)
    && sameVector(left.unit.vector, right.unit.vector)
    && measurementPhysicalValue(left) === measurementPhysicalValue(right);
}

export interface AMXTableColumn {
  readonly field: string;
  readonly label: string;
}

export interface AMXTableView {
  readonly kind: 'table';
  readonly name: string;
  readonly columns: readonly AMXTableColumn[];
  readonly rows: readonly (readonly AMXViewData[])[];
}

export interface AMXChartView {
  readonly kind: 'chart';
  readonly name: string;
  readonly chartKind: 'bar' | 'column' | 'line' | 'scatter';
  readonly title: string;
  readonly description: string;
  readonly data: readonly AMXViewData[];
  readonly showTable: boolean;
}

export interface AMXDiagramElement {
  readonly type: string;
  readonly name: string;
  readonly properties: Readonly<Record<string, AMXViewData>>;
}

export interface AMXDiagramView {
  readonly kind: 'diagram';
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly canvas: Readonly<{
    width: number;
    height: number;
    coordinates: 'bottom-left-y-up';
  }>;
  readonly timeline: Readonly<{
    variable: string;
    from: number;
    to: number;
    duration: number;
  }>;
  readonly initialFrame: Readonly<{
    time: number;
    elements: readonly AMXDiagramElement[];
  }>;
}

export type AMXShownView = AMXTableView | AMXChartView | AMXDiagramView;

export function amxTableView(
  name: string,
  columns: readonly AMXTableColumn[],
  rows: readonly (readonly AMXViewData[])[]
): AMXTableView {
  return freezeData({
    kind: 'table' as const,
    name,
    columns: columns.map(column => ({ ...column })),
    rows: rows.map(row => [...row])
  });
}

export function amxChartView(view: Omit<AMXChartView, 'kind'>): AMXChartView {
  return freezeData({ kind: 'chart' as const, ...view, data: [...view.data] });
}

export function amxDiagramView(view: Omit<AMXDiagramView, 'kind'>): AMXDiagramView {
  return freezeData({ kind: 'diagram' as const, ...view });
}

function toMeasurementUnit(descriptor: AMXUnitDescriptor): MeasurementUnit {
  return Object.freeze({
    scale: descriptor.scale,
    offset: descriptor.offset,
    vector: Object.freeze({ ...descriptor.vector }),
    factors: Object.freeze((descriptor.factors ?? [{
      identity: descriptor.identity,
      name: descriptor.name,
      exponent: 1
    }]).map(factor => Object.freeze({ ...factor }))),
    text: descriptor.name
  });
}

function validateUnit(unit: AMXUnitDescriptor): void {
  if (!unit.name || !unit.identity || !Number.isFinite(unit.scale) || unit.scale <= 0
    || !Number.isFinite(unit.offset)
    || Object.values(unit.vector).some(exponent => !Number.isFinite(exponent))) {
    throw new TypeError('Invalid AMX unit descriptor');
  }
}

function sameVector(
  left: Readonly<Record<string, number>>,
  right: Readonly<Record<string, number>>
): boolean {
  const leftEntries = Object.entries(left);
  return leftEntries.length === Object.keys(right).length
    && leftEntries.every(([identity, exponent]) => right[identity] === exponent);
}

function freezeData<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeData(child);
  return Object.freeze(value);
}

function describeInput(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'list';
  return typeof value;
}

function escapePointer(value: string): string {
  return value.replace(/~/g, '~0').replace(/\//g, '~1');
}