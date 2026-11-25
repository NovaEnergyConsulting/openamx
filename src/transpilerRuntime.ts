import {
  isMeasurement,
  measurement,
  measurementDisplayValue,
  measurementPhysicalValue,
  type MeasurementUnit,
  type MeasurementUnitFactor,
  type MeasurementValue
} from './runtime/measurement';
import {
  AmxError,
  staticError
} from './diagnostics/errors';
import type { SourceLocation } from './ast/types';
import {
  evaluateBinaryValues,
  evaluateBuiltinValues,
  evaluateIterableValue,
  evaluateListAddition,
  evaluateListItem,
  evaluateListRemoval,
  evaluateRangeValues,
  evaluateUnaryValue
} from './runtime/evaluateExpression';
import type { DimensionUnitRegistry, DimensionMetadata, UnitMetadata } from './typechecker/dimensionTypes';

export type AMXPrimitive = string | number | boolean | null;

declare const amxMeasurementBrand: unique symbol;
declare const amxInputOutputType: unique symbol;

export type AMXValue = AMXPrimitive | AMXMeasurement
  | AMXValue[] | readonly AMXValue[]
  | Readonly<{ [field: string]: AMXValue }>;

export interface AMXSourceContext {
  readonly file?: string;
  readonly line?: number;
  readonly column?: number;
  readonly inputPath?: string;
}

export interface AMXRuntimeContext extends AMXSourceContext {
  readonly unitDescriptors?: readonly AMXUnitDescriptor[];
}

export interface AMXRuntimeDiagnostic extends AMXSourceContext {
  readonly code: string;
  readonly message: string;
}

export class AMXRuntimeError extends Error {
  readonly diagnostic: AMXRuntimeDiagnostic;
  readonly code: string;
  readonly file?: string;
  readonly line?: number;
  readonly column?: number;
  readonly inputPath?: string;
  private readonly originalCause?: unknown;

  constructor(diagnostic: AMXRuntimeDiagnostic, cause?: unknown) {
    super(diagnostic.message);
    this.name = 'AMXRuntimeError';
    this.diagnostic = Object.freeze({ ...diagnostic });
    this.code = diagnostic.code;
    this.file = diagnostic.file;
    this.line = diagnostic.line;
    this.column = diagnostic.column;
    this.inputPath = diagnostic.inputPath;
    this.originalCause = cause;
  }
}

export type AMXViewData = AMXPrimitive | readonly AMXViewData[]
  | Readonly<{ [field: string]: AMXViewData }>;

export interface AMXUnitFactor {
  readonly identity: string;
  readonly name: string;
  readonly exponent: number;
}

export interface AMXMeasurementUnit {
  readonly scale: number;
  readonly offset: number;
  readonly vector: Readonly<Record<string, number>>;
  readonly factors: readonly AMXUnitFactor[];
  readonly text: string;
}

export interface AMXUnitDescriptor<DimensionId extends string = string> {
  readonly identity: string;
  readonly name: string;
  readonly scale: number;
  readonly offset: number;
  readonly vector: Readonly<Record<string, number>>;
  readonly factors?: readonly AMXUnitFactor[];
  readonly [amxMeasurementBrand]?: DimensionId;
}

export interface AMXMeasurement<DimensionId extends string = string> {
  readonly __amxMeasurement: true;
  readonly value: number;
  readonly unit: AMXMeasurementUnit;
  readonly [amxMeasurementBrand]: DimensionId;
}

export interface AMXMeasurementInput<DimensionId extends string = string> {
  readonly value: number;
  readonly unit: string;
  readonly [amxMeasurementBrand]?: DimensionId;
}

export interface AMXRunResult<TExports extends object> {
  readonly exports: Readonly<TExports>;
  readonly views: readonly AMXShownView[];
}

export class AMXInputError extends TypeError {
  readonly code = 'AMX4003';
  readonly diagnostic: AMXRuntimeDiagnostic;

  constructor(
    readonly inputPath: string,
    readonly expected: string,
    readonly actual: string,
    sourceContext: AMXSourceContext = {}
  ) {
    super(`Invalid input at '${inputPath}': expected ${expected}, got ${actual}`);
    this.name = 'AMXInputError';
    this.diagnostic = Object.freeze({
      code: this.code,
      message: this.message,
      ...sourceContext,
      inputPath
    });
  }
}

export interface AMXInputFieldDescriptor {
  readonly name: string;
  readonly descriptor: AMXInputDescriptor;
  readonly optional?: boolean;
  readonly defaultValue?: () => unknown;
}

export type AMXInputDescriptor<T = AMXValue> = (
  | Readonly<{ kind: 'number' }>
  | Readonly<{ kind: 'string' }>
  | Readonly<{ kind: 'boolean' }>
  | Readonly<{ kind: 'dateTime' }>
  | Readonly<{ kind: 'enum'; enumName: string; members: readonly (string | number)[] }>
  | Readonly<{
    kind: 'measurement';
    dimensionName: string;
    dimensionVector: Readonly<Record<string, number>>;
    units: Readonly<Record<string, AMXUnitDescriptor>>;
  }>
  | Readonly<{ kind: 'nullable'; value: AMXInputDescriptor }>
  | Readonly<{ kind: 'list'; element: AMXInputDescriptor }>
  | Readonly<{ kind: 'record'; recordName: string; fields: readonly AMXInputFieldDescriptor[] }>
  ) & Readonly<{ [amxInputOutputType]?: T }>;

export interface AMXListMutationContext extends AMXSourceContext {
  readonly targetName?: string;
  readonly mutable?: boolean;
}

export type AMXBinaryOperator = '+' | '-' | '*' | '/' | '%' | '^'
  | '==' | '!=' | '>' | '>=' | '<' | '<=' | 'and' | 'or';
export type AMXUnaryOperator = '-' | 'not';
export type AMXBuiltinName = 'sum' | 'min' | 'max' | 'mean' | 'round' | 'abs'
  | 'sqrt' | 'pow' | 'len' | 'trim' | 'left' | 'right' | 'format'
  | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'sinh' | 'cosh'
  | 'tanh' | 'asinh' | 'acosh' | 'atanh' | 'ln' | 'log' | 'exp';

export function amxBinary(
  operator: AMXBinaryOperator,
  left: AMXValue,
  right: AMXValue,
  context?: AMXSourceContext
): AMXValue {
  return withRuntimeErrorContext(
    () => evaluateBinaryValues(operator, left, right, sourceLocation(context), context?.file) as AMXValue,
    context
  );
}

export function amxUnary(
  operator: AMXUnaryOperator,
  value: AMXValue,
  context?: AMXSourceContext
): AMXValue {
  return withRuntimeErrorContext(
    () => evaluateUnaryValue(operator, value, sourceLocation(context), context?.file) as AMXValue,
    context
  );
}

export function amxFormatValue(value: AMXValue, context?: AMXSourceContext): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (isMeasurement(value)) return `${String(value.value)} ${value.unit.text}`;
  return withRuntimeErrorContext(() => staticError(
    'AMX3007',
    'Only String, Number, Boolean, measurement, and null values can be interpolated',
    sourceLocation(context),
    context?.file
  ), context);
}

export function amxBuiltin(
  name: AMXBuiltinName,
  args: readonly AMXValue[],
  context?: AMXRuntimeContext
): AMXValue {
  return withRuntimeErrorContext(
    () => evaluateBuiltinValues(
      name,
      args,
      sourceLocation(context),
      context?.file,
      createDimensionRegistry(context?.unitDescriptors)
    ) as AMXValue,
    context
  );
}

export function amxIsType(value: AMXValue, descriptor: AMXInputDescriptor): boolean {
  return matchesInputDescriptor(value, descriptor);
}

export function validateAMXValue<T>(
  value: unknown,
  descriptor: AMXInputDescriptor<T>,
  context: AMXSourceContext
): T {
  const rootPath = context.inputPath ?? '';
  return validateInputValue(value, descriptor, rootPath, context) as T;
}

export function amxGet1Based<T extends AMXValue>(
  list: readonly T[],
  index: number,
  context?: AMXSourceContext
): T {
  return withRuntimeErrorContext(
    () => evaluateListItem(list, index, sourceLocation(context), context?.file) as T,
    context
  );
}

export function amxRange(start: number, end: number, context?: AMXSourceContext): number[] {
  return withRuntimeErrorContext(
    () => evaluateRangeValues(start, end, sourceLocation(context), context?.file),
    context
  );
}

export function amxAdd1Based<T extends AMXValue>(
  list: T[],
  value: T,
  position?: number,
  context?: AMXListMutationContext
): void {
  withRuntimeErrorContext(() => evaluateListAddition(
    list, value, position, context?.mutable !== false, context?.targetName ?? '__generated',
    sourceLocation(context), context?.file
  ), context);
}

export function amxRemove1Based<T extends AMXValue>(
  list: T[],
  count: number,
  position?: number,
  context?: AMXListMutationContext
): void {
  withRuntimeErrorContext(() => evaluateListRemoval(
    list, count, position, context?.mutable !== false, context?.targetName ?? '__generated',
    sourceLocation(context), context?.file
  ), context);
}

export function amxIterate<T extends AMXValue>(value: AMXValue, context?: AMXSourceContext): T[] {
  return withRuntimeErrorContext(
    () => evaluateIterableValue(value, sourceLocation(context), context?.file) as T[],
    context
  );
}

export function amxCopyListArgument<T>(value: T): T {
  return copyArrayTree(value) as T;
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
  return result as AMXMeasurement;
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
  return measurement(converted, targetUnit) as AMXMeasurement;
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
  readonly title: string;
  readonly description: string;
  readonly columns: readonly AMXTableColumn[];
  readonly rows: readonly (readonly AMXViewData[])[];
}

export interface AMXChartMeasurementDescriptor {
  readonly role: 'series' | 'x' | 'y';
  readonly field?: string;
  readonly label: string;
  readonly unit: Readonly<{
    text: string;
    scale: number;
    vector: Readonly<Record<string, number>>;
    factors: readonly AMXUnitFactor[];
  }>;
}

export interface AMXChartView {
  readonly kind: 'chart';
  readonly name: string;
  readonly chartKind: 'bar' | 'column' | 'line' | 'scatter';
  readonly title: string;
  readonly description: string;
  readonly data: readonly AMXViewData[];
  readonly labels?: readonly string[];
  readonly headings?: readonly string[];
  readonly measurementDescriptors?: readonly AMXChartMeasurementDescriptor[];
  readonly showTable: boolean;
}

export type AMXDiagramElement = AMXDiagramPrimitiveElement | AMXLegacyDiagramElement;

export type AMXDiagramPrimitiveElement =
  | Readonly<{ primitive: 'line'; name: string; x1: number; y1: number; x2: number; y2: number; stroke: string; lineWidth: number; arrow: 'none' | 'start' | 'end' | 'both' }>
  | Readonly<{ primitive: 'rectangle'; name: string; x: number; y: number; width: number; height: number; stroke: string; fill?: string; lineWidth: number }>
  | Readonly<{ primitive: 'circle'; name: string; cx: number; cy: number; r: number; stroke: string; fill?: string; lineWidth: number }>
  | Readonly<{ primitive: 'text'; name: string; x: number; y: number; value: string; fill: string }>;

export interface AMXLegacyDiagramElement {
  readonly type: string;
  readonly name: string;
  readonly properties: Readonly<Record<string, AMXViewData>>;
}

export interface AMXDiagramView {
  readonly kind: 'diagram';
  readonly schema?: 'legacy-v1';
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
    elements: readonly AMXLegacyDiagramElement[];
  }>;
}

export interface AMXLegacyDiagramView extends AMXDiagramView {
  readonly schema: 'legacy-v1';
}

export interface AMXStructuredDiagramView {
  readonly kind: 'diagram';
  readonly schema: 'structured-v2';
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly canvas: Readonly<{ width: number; height: number; coordinates: 'bottom-left-y-up' }>;
  readonly timeline: Readonly<{ variable: string; from: number; to: number; duration: number }>;
  readonly initialFrame: Readonly<{ time: number; elements: readonly AMXDiagramPrimitiveElement[] }>;
}

export type AMXShownView = AMXTableView | AMXChartView | AMXDiagramView | AMXStructuredDiagramView;

export function amxTableView(
  name: string,
  columns: readonly AMXTableColumn[],
  rows: readonly (readonly AMXViewData[])[],
  title = name,
  description = ''
): AMXTableView {
  const copiedColumns = columns.map((column, index) => ({
    field: requireViewString(column.field, `/columns/${index}/field`),
    label: requireViewString(column.label, `/columns/${index}/label`)
  }));
  const copiedRows = rows.map((row, rowIndex) => row.map((value, columnIndex) =>
    cloneViewData(value, `/rows/${rowIndex}/${columnIndex}`)));
  return deepFreeze({
    kind: 'table' as const,
    name,
    title,
    description,
    columns: copiedColumns,
    rows: copiedRows
  });
}

export function amxChartView(view: Omit<AMXChartView, 'kind'>): AMXChartView {
  if (!['bar', 'column', 'line', 'scatter'].includes(view.chartKind)) {
    throwViewInputError('/chartKind', 'supported chart kind', String(view.chartKind));
  }
  if (typeof view.showTable !== 'boolean') throwViewInputError('/showTable', 'Boolean', describeInput(view.showTable));
  const copied = {
    kind: 'chart' as const,
    name: requireViewString(view.name, '/name'),
    chartKind: view.chartKind,
    title: requireViewString(view.title, '/title'),
    description: requireViewString(view.description, '/description'),
    data: view.data.map((value, index) => cloneViewData(value, `/data/${index}`)),
    ...(view.labels === undefined ? {} : { labels: view.labels.map((label, index) => requireViewString(label, `/labels/${index}`)) }),
    ...(view.headings === undefined ? {} : { headings: view.headings.map((heading, index) => requireViewString(heading, `/headings/${index}`)) }),
    ...(view.measurementDescriptors === undefined ? {} : {
      measurementDescriptors: view.measurementDescriptors.map((descriptor, index) => cloneChartMeasurementDescriptor(descriptor, index))
    }),
    showTable: view.showTable
  };
  return deepFreeze(copied);
}

export function amxDiagramView(view: Omit<AMXDiagramView, 'kind' | 'schema'>): AMXLegacyDiagramView;
export function amxDiagramView(view: Omit<AMXStructuredDiagramView, 'kind'>): AMXStructuredDiagramView;
export function amxDiagramView(
  view: Omit<AMXLegacyDiagramView, 'kind' | 'schema'> | Omit<AMXStructuredDiagramView, 'kind'>
): AMXLegacyDiagramView | AMXStructuredDiagramView {
  if ('schema' in view && view.schema === 'structured-v2') {
    const structured = view as Omit<AMXStructuredDiagramView, 'kind'>;
    return deepFreeze({
      kind: 'diagram' as const,
      schema: 'structured-v2' as const,
      name: requireViewString(structured.name, '/name'),
      title: requireViewString(structured.title, '/title'),
      description: requireViewString(structured.description, '/description'),
      canvas: {
        width: requireViewNumber(structured.canvas.width, '/canvas/width'),
        height: requireViewNumber(structured.canvas.height, '/canvas/height'),
        coordinates: structured.canvas.coordinates === 'bottom-left-y-up'
          ? 'bottom-left-y-up' as const
          : throwViewInputError('/canvas/coordinates', 'bottom-left-y-up', String(structured.canvas.coordinates))
      },
      timeline: {
        variable: requireViewString(structured.timeline.variable, '/timeline/variable'),
        from: requireViewNumber(structured.timeline.from, '/timeline/from'),
        to: requireViewNumber(structured.timeline.to, '/timeline/to'),
        duration: requireViewNumber(structured.timeline.duration, '/timeline/duration')
      },
      initialFrame: {
        time: requireViewNumber(structured.initialFrame.time, '/initialFrame/time'),
        elements: structured.initialFrame.elements.map((element, index) => cloneDiagramPrimitive(element, index))
      }
    });
  }
  const legacy = view as Omit<AMXLegacyDiagramView, 'kind' | 'schema'>;
  return deepFreeze({
    kind: 'diagram' as const,
    schema: 'legacy-v1' as const,
    name: requireViewString(legacy.name, '/name'),
    title: requireViewString(legacy.title, '/title'),
    description: requireViewString(legacy.description, '/description'),
    canvas: {
      width: requireViewNumber(legacy.canvas.width, '/canvas/width'),
      height: requireViewNumber(legacy.canvas.height, '/canvas/height'),
      coordinates: legacy.canvas.coordinates === 'bottom-left-y-up'
        ? 'bottom-left-y-up' as const
        : throwViewInputError('/canvas/coordinates', 'bottom-left-y-up', String(legacy.canvas.coordinates))
    },
    timeline: {
      variable: requireViewString(legacy.timeline.variable, '/timeline/variable'),
      from: requireViewNumber(legacy.timeline.from, '/timeline/from'),
      to: requireViewNumber(legacy.timeline.to, '/timeline/to'),
      duration: requireViewNumber(legacy.timeline.duration, '/timeline/duration')
    },
    initialFrame: {
      time: requireViewNumber(legacy.initialFrame.time, '/initialFrame/time'),
      elements: legacy.initialFrame.elements.map((element, index) => ({
        type: requireViewString(element.type, `/initialFrame/elements/${index}/type`),
        name: requireViewString(element.name, `/initialFrame/elements/${index}/name`),
        properties: cloneViewData(element.properties, `/initialFrame/elements/${index}/properties`) as Readonly<Record<string, AMXViewData>>
      }))
    }
  });
}

function requireViewString(value: unknown, path: string): string {
  if (typeof value !== 'string') throwViewInputError(path, 'String', describeInput(value));
  return value;
}

function requireViewNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throwViewInputError(path, 'finite Number', describeInput(value));
  }
  return value;
}

function throwViewInputError(path: string, expected: string, actual: string): never {
  throw new AMXInputError(path, expected, actual);
}

function cloneViewData(value: unknown, path: string, ancestors = new Set<object>()): AMXViewData {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throwViewInputError(path, 'finite JSON-like value', describeInput(value));
    return value;
  }
  if (typeof value !== 'object' || isMeasurement(value)) {
    throwViewInputError(path, 'AMX view data value', describeInput(value));
  }
  if (ancestors.has(value)) {
    throw new AMXRuntimeError({
      code: 'AMX3007',
      message: 'Cyclic AMX view data is not supported'
    });
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item, index) => cloneViewData(item, `${path}/${index}`, ancestors));
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throwViewInputError(path, 'plain AMX view data record', describeInput(value));
    }
    const copy: Record<string, AMXViewData> = {};
    for (const [field, item] of Object.entries(value)) {
      copy[field] = cloneViewData(item, appendInputPath(path, field), ancestors);
    }
    return copy;
  } finally { ancestors.delete(value); }
}

function cloneChartMeasurementDescriptor(
  descriptor: AMXChartMeasurementDescriptor,
  index: number
): AMXChartMeasurementDescriptor {
  const path = `/measurementDescriptors/${index}`;
  if (!['series', 'x', 'y'].includes(descriptor.role)) {
    throwViewInputError(`${path}/role`, 'series, x, or y', String(descriptor.role));
  }
  const unit = descriptor.unit;
  if (!Number.isFinite(unit.scale) || unit.scale <= 0
    || Object.values(unit.vector).some(exponent => !Number.isFinite(exponent))) {
    throwViewInputError(`${path}/unit`, 'valid display-unit descriptor', 'invalid descriptor');
  }
  return {
    role: descriptor.role,
    ...(descriptor.field === undefined ? {} : { field: requireViewString(descriptor.field, `${path}/field`) }),
    label: requireViewString(descriptor.label, `${path}/label`),
    unit: {
      text: requireViewString(unit.text, `${path}/unit/text`),
      scale: unit.scale,
      vector: { ...unit.vector },
      factors: unit.factors.map((factor, factorIndex) => ({
        identity: requireViewString(factor.identity, `${path}/unit/factors/${factorIndex}/identity`),
        name: requireViewString(factor.name, `${path}/unit/factors/${factorIndex}/name`),
        exponent: requireViewNumber(factor.exponent, `${path}/unit/factors/${factorIndex}/exponent`)
      }))
    }
  };
}

function cloneDiagramPrimitive(
  element: AMXDiagramPrimitiveElement,
  index: number
): AMXDiagramPrimitiveElement {
  const path = `/initialFrame/elements/${index}`;
  switch (element.primitive) {
    case 'line':
      if (!['none', 'start', 'end', 'both'].includes(element.arrow)) {
        throwViewInputError(`${path}/arrow`, 'none, start, end, or both', String(element.arrow));
      }
      return {
        primitive: 'line', name: requireViewString(element.name, `${path}/name`),
        x1: requireViewNumber(element.x1, `${path}/x1`), y1: requireViewNumber(element.y1, `${path}/y1`),
        x2: requireViewNumber(element.x2, `${path}/x2`), y2: requireViewNumber(element.y2, `${path}/y2`),
        stroke: requireViewString(element.stroke, `${path}/stroke`),
        lineWidth: requireViewNumber(element.lineWidth, `${path}/lineWidth`), arrow: element.arrow
      };
    case 'rectangle':
      return {
        primitive: 'rectangle', name: requireViewString(element.name, `${path}/name`),
        x: requireViewNumber(element.x, `${path}/x`), y: requireViewNumber(element.y, `${path}/y`),
        width: requireViewNumber(element.width, `${path}/width`), height: requireViewNumber(element.height, `${path}/height`),
        stroke: requireViewString(element.stroke, `${path}/stroke`),
        ...(element.fill === undefined ? {} : { fill: requireViewString(element.fill, `${path}/fill`) }),
        lineWidth: requireViewNumber(element.lineWidth, `${path}/lineWidth`)
      };
    case 'circle':
      return {
        primitive: 'circle', name: requireViewString(element.name, `${path}/name`),
        cx: requireViewNumber(element.cx, `${path}/cx`), cy: requireViewNumber(element.cy, `${path}/cy`),
        r: requireViewNumber(element.r, `${path}/r`), stroke: requireViewString(element.stroke, `${path}/stroke`),
        ...(element.fill === undefined ? {} : { fill: requireViewString(element.fill, `${path}/fill`) }),
        lineWidth: requireViewNumber(element.lineWidth, `${path}/lineWidth`)
      };
    case 'text':
      return {
        primitive: 'text', name: requireViewString(element.name, `${path}/name`),
        x: requireViewNumber(element.x, `${path}/x`), y: requireViewNumber(element.y, `${path}/y`),
        value: requireViewString(element.value, `${path}/value`), fill: requireViewString(element.fill, `${path}/fill`)
      };
    default:
      throwViewInputError(`${path}/primitive`, 'supported diagram primitive', String((element as { primitive?: unknown }).primitive));
  }
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object') return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function createDimensionRegistry(
  descriptors?: readonly AMXUnitDescriptor[]
): DimensionUnitRegistry | undefined {
  if (!descriptors) return undefined;
  const dimensions = new Map<string, DimensionMetadata>();
  const units = new Map<string, UnitMetadata>();
  const baseUnits = new Map<string, UnitMetadata>();
  for (const descriptor of descriptors) {
    validateUnit(descriptor);
    const vector = new Map(Object.entries(descriptor.vector));
    const unit: UnitMetadata = {
      name: descriptor.name,
      moduleIdentity: 'generated',
      declarationName: descriptor.name,
      identity: descriptor.identity,
      vector,
      scale: descriptor.scale,
      offset: descriptor.offset
    };
    units.set(descriptor.name, unit);
    for (const [identity, exponent] of vector) {
      if (!dimensions.has(identity)) {
        dimensions.set(identity, {
          name: identity,
          moduleIdentity: 'generated',
          declarationName: identity,
          baseIdentity: identity,
          vector: new Map([[identity, 1]])
        });
      }
      if (exponent === 1 && descriptor.scale === 1 && descriptor.offset === 0 && !baseUnits.has(identity)) {
        baseUnits.set(identity, unit);
      }
    }
  }
  return { dimensions, units, baseUnits };
}

function matchesInputDescriptor(
  value: unknown,
  descriptor: AMXInputDescriptor,
  ancestors = new Set<object>()
): boolean {
  switch (descriptor.kind) {
    case 'number': return typeof value === 'number';
    case 'string': return typeof value === 'string';
    case 'boolean': return typeof value === 'boolean';
    case 'dateTime': return typeof value === 'string' && validAMXDateTime(value);
    case 'enum':
      return (typeof value === 'string' || typeof value === 'number')
        && descriptor.members.some(member => typeof member === typeof value && member === value);
    case 'measurement':
      return isMeasurement(value)
        && sameVector(value.unit.vector, descriptor.dimensionVector);
    case 'nullable':
      return value === null || matchesInputDescriptor(value, descriptor.value, ancestors);
    case 'list': {
      if (!Array.isArray(value) || ancestors.has(value)) return false;
      ancestors.add(value);
      try { return value.every(item => matchesInputDescriptor(item, descriptor.element, ancestors)); }
      finally { ancestors.delete(value); }
    }
    case 'record': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)
        || isMeasurement(value) || ancestors.has(value)) return false;
      const record = value as Record<string, unknown>;
      const fieldNames = new Set(descriptor.fields.map(field => field.name));
      if (Object.keys(record).some(name => !fieldNames.has(name))) return false;
      ancestors.add(value);
      try {
        return descriptor.fields.every(field => {
          if (!Object.prototype.hasOwnProperty.call(record, field.name)) {
            return field.optional === true || field.defaultValue !== undefined;
          }
          return matchesInputDescriptor(record[field.name], field.descriptor, ancestors);
        });
      } finally { ancestors.delete(value); }
    }
  }
}

function validateInputValue(
  value: unknown,
  descriptor: AMXInputDescriptor<unknown>,
  inputPath: string,
  context: AMXSourceContext,
  ancestors = new Set<object>()
): unknown {
  const withContext = <T>(run: () => T): T => {
    try { return run(); }
    catch (error) {
      if (error instanceof AMXInputError) {
        throw new AMXInputError(error.inputPath, error.expected, error.actual, context);
      }
      throw error;
    }
  };
  switch (descriptor.kind) {
    case 'number': return withContext(() => requireAMXNumber(value, inputPath));
    case 'string': return withContext(() => requireAMXString(value, inputPath));
    case 'boolean': return withContext(() => requireAMXBoolean(value, inputPath));
    case 'dateTime':
      if (typeof value !== 'string' || !validAMXDateTime(value)) {
        throw new AMXInputError(inputPath, 'RFC 3339 DateTime', describeInput(value), context);
      }
      return value;
    case 'enum':
      return withContext(() => requireAMXEnum(value, descriptor.enumName, descriptor.members, inputPath));
    case 'measurement': {
      try {
        validateMeasurementDescriptor(descriptor);
        return requireAMXMeasurement(
          value,
          descriptor.dimensionName,
          descriptor.dimensionVector,
          descriptor.units,
          inputPath
        );
      } catch (error) {
        if (error instanceof AMXInputError) {
          throw new AMXInputError(error.inputPath, error.expected, error.actual, context);
        }
        if (error instanceof RangeError) {
          throw new AMXInputError(inputPath, 'finite physical Measurement', describeInput(value), context);
        }
        if (error instanceof TypeError) {
          throw new AMXInputError(inputPath, 'valid Measurement descriptor', 'invalid descriptor', context);
        }
        throw error;
      }
    }
    case 'nullable':
      return value === null ? null : validateInputValue(value, descriptor.value, inputPath, context, ancestors);
    case 'list': {
      const list = withContext(() => requireAMXList(value, inputPath));
      if (ancestors.has(list as object)) {
        throw new AMXInputError(inputPath, 'acyclic list', 'cyclic list', context);
      }
      ancestors.add(list as object);
      try {
        return list.map((item, index) => validateInputValue(
          item,
          descriptor.element,
          appendInputPath(inputPath, String(index)),
          context,
          ancestors
        ));
      } finally { ancestors.delete(list as object); }
    }
    case 'record': {
      const fields = descriptor.fields;
      if (new Set(fields.map(field => field.name)).size !== fields.length) {
        throw new AMXInputError(inputPath, 'valid record descriptor', 'duplicate field name', context);
      }
      const record = withContext(() => requireAMXRecord(value, inputPath, fields.map(field => field.name)));
      if (ancestors.has(record as object)) {
        throw new AMXInputError(inputPath, 'acyclic record', 'cyclic record', context);
      }
      ancestors.add(record as object);
      try {
        const normalized: Record<string, unknown> = {};
        for (const field of fields) {
          const fieldPath = appendInputPath(inputPath, field.name);
          if (Object.prototype.hasOwnProperty.call(record, field.name)) {
            normalized[field.name] = validateInputValue(record[field.name], field.descriptor, fieldPath, context, ancestors);
          } else if (field.defaultValue) {
            normalized[field.name] = validateInputValue(field.defaultValue(), field.descriptor, fieldPath, context, ancestors);
          } else if (field.optional) {
            normalized[field.name] = null;
          } else {
            throw new AMXInputError(fieldPath, descriptorName(field.descriptor), 'missing', context);
          }
        }
        return normalized;
      } finally { ancestors.delete(record as object); }
    }
  }
}

function validateMeasurementDescriptor(
  descriptor: Extract<AMXInputDescriptor<unknown>, { kind: 'measurement' }>
): void {
  if (!descriptor.dimensionName || Object.values(descriptor.dimensionVector).some(value => !Number.isFinite(value))) {
    throw new TypeError('Invalid measurement dimension descriptor');
  }
  for (const [name, unit] of Object.entries(descriptor.units)) {
    validateUnit(unit);
    if (name !== unit.name || !sameVector(unit.vector, descriptor.dimensionVector)) {
      throw new TypeError('Invalid measurement unit descriptor');
    }
  }
}

function descriptorName(descriptor: AMXInputDescriptor): string {
  switch (descriptor.kind) {
    case 'number': return 'finite Number';
    case 'string': return 'String';
    case 'boolean': return 'Boolean';
    case 'dateTime': return 'RFC 3339 DateTime';
    case 'enum': return `member of enum '${descriptor.enumName}'`;
    case 'measurement': return `Measurement<${descriptor.dimensionName}>`;
    case 'nullable': return `${descriptorName(descriptor.value)} or null`;
    case 'list': return `list of ${descriptorName(descriptor.element)}`;
    case 'record': return `record '${descriptor.recordName}'`;
  }
}

function appendInputPath(inputPath: string, segment: string): string {
  return `${inputPath}/${escapePointer(segment)}`;
}

function validAMXDateTime(value: string): boolean {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/);
  if (!parts) return false;
  const [, year, month, day, hour, minute, second, offset] = parts;
  const date = new Date(0);
  date.setUTCFullYear(+year, +month - 1, +day);
  return date.getUTCFullYear() === +year && date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day
    && +hour <= 23 && +minute <= 59 && +second <= 59
    && (offset === 'Z' || (+offset.slice(1, 3) <= 23 && +offset.slice(4) <= 59));
}

function copyArrayTree(value: unknown): unknown {
  return Array.isArray(value) ? value.map(copyArrayTree) : value;
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

function sourceLocation(context?: AMXSourceContext): SourceLocation | undefined {
  if (context?.line === undefined || context.column === undefined) return undefined;
  return { line: context.line, column: context.column };
}

function withRuntimeErrorContext<T>(run: () => T, context?: AMXSourceContext): T {
  try {
    return run();
  } catch (error) {
    if (error instanceof AMXRuntimeError || error instanceof AMXInputError) throw error;
    if (error instanceof AmxError) {
      throw new AMXRuntimeError({
        code: error.code,
        message: error.message,
        file: error.file ?? context?.file,
        line: error.line ?? context?.line,
        column: error.column ?? context?.column,
        inputPath: context?.inputPath
      }, error);
    }
    throw error;
  }
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