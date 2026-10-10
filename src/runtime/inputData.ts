import * as path from 'path';
import { InputDeclarationNode, SourceLocation, TypeDeclarationNode, TypeReferenceNode } from '../ast/types';
import { AmxDiagnostic, inputError, throwInputErrors } from '../diagnostics/errors';
import { Environment } from './environment';
import { evaluateExpression } from './evaluateExpression';
import { parseStrictCsvText, parseStrictJsonText, type CsvTextCell } from './dataText';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
import { isMeasurement, measurement, type MeasurementValue } from './measurement';
import { ExternalUnitTextError, parseExternalUnitText } from './externalUnits';
import { fieldRegistry } from '../typechecker/declarationRegistry';

function defaultsEnvironment(environment: Environment, registry: DimensionUnitRegistry | undefined): Environment {
  return registry && environment.dimensionRegistry !== registry
    ? new Environment(environment.recordTypes, environment.functions, registry)
    : environment;
}

export { parseStrictCsvText, parseStrictJsonText } from './dataText';
export { serializeCsvText } from './csvTextSerialization';
export type { CsvTextCell, DataTextParseIssue, DataTextParseResult } from './dataText';

export type ValidationMode = 'aggregate' | 'fail-fast';

interface InputMapping {
  name: string;
  path: string;
}

type CsvCell = CsvTextCell;

class StopValidation {}

export type InputTextFormat = 'json' | 'csv';

export interface InputTextValidationResult {
  value?: unknown;
  diagnostics: AmxDiagnostic[];
}

export interface InputSchemaField {
  name: string;
  type: string;
  optional: boolean;
  hasDefault: boolean;
  measurement?: { dimension: string; visibleUnits: string[] };
}

export interface InputSchema {
  name: string;
  type: string;
  acceptedFormats: InputTextFormat[];
  fields?: InputSchemaField[];
  measurement?: { dimension: string; visibleUnits: string[] };
}

export function describeInputSchema(
  declaration: InputDeclarationNode,
  types: Map<string, TypeDeclarationNode>,
  registry?: DimensionUnitRegistry
): InputSchema {
  const recordType = declaration.annotation.type === 'listType'
    && declaration.annotation.element?.type === 'namedType'
    ? types.get(declaration.annotation.element.name!)
    : undefined;
  const csvCompatible = !!recordType && recordType.fields.every(field =>
    isCsvScalar(field.annotation, fieldRegistry(field, registry)));
  return {
    name: declaration.name,
    type: typeName(declaration.annotation),
    acceptedFormats: csvCompatible ? ['json', 'csv'] : ['json'],
    ...(registry ? measurementSchema(declaration.annotation, registry) : {}),
    ...(recordType ? { fields: recordType.fields.map(field => {
      const fieldScope = fieldRegistry(field, registry);
      return {
        name: field.name,
        type: typeName(field.annotation),
        optional: field.optional,
        hasDefault: field.defaultExpression !== undefined,
        ...(fieldScope ? measurementSchema(field.annotation, fieldScope) : {})
      };
    }) } : {})
  };
}

export function validateInputText(
  text: string,
  format: InputTextFormat,
  declaration: InputDeclarationNode,
  types: Map<string, TypeDeclarationNode>,
  mode: ValidationMode = 'aggregate',
  context: Pick<AmxDiagnostic, 'file' | 'dataFile'> = {},
  registry?: DimensionUnitRegistry
): InputTextValidationResult {
  if (mode !== 'aggregate' && mode !== 'fail-fast') {
    return { diagnostics: [inputError('AMX4001', `Unsupported validation mode '${safeText(String(mode))}'`, { ...context, inputName: declaration.name })] };
  }
  const diagnostics: AmxDiagnostic[] = [];
  const report = (diagnostic: AmxDiagnostic): void => {
    diagnostics.push(diagnostic);
    if (mode === 'fail-fast') throw new StopValidation();
  };
  const validationContext = { ...context, inputName: declaration.name, declarationSource: declaration.source };
  const environment = new Environment(types);
  let value: unknown;
  try {
    if (format === 'json') {
      const parsed = parseStrictJsonText(text);
      if (parsed.issue) {
        const issue = parsed.issue;
        const location = offsetLocation(text, issue.offset ?? 0);
        report(inputError(issue.duplicate ? 'AMX4003' : 'AMX4002', issue.message, {
          ...validationContext,
          dataPath: issue.dataPath || '',
          dataLine: location.line,
          dataColumn: location.column
        }));
        return { value: undefined, diagnostics };
      }
      value = convertJson(parsed.value, declaration.annotation, '', declaration.source, types, environment, report, validationContext, undefined, registry);
    } else {
      value = convertCsv(text, declaration.annotation, declaration.source, types, environment, report, validationContext, registry);
    }
  } catch (error) {
    if (!(error instanceof StopValidation)) throw error;
  }
  return { value, diagnostics };
}

export async function loadInputValues(
  declarations: InputDeclarationNode[],
  types: Map<string, TypeDeclarationNode>,
  rawMappings: string[] = [],
  mode: ValidationMode = 'aggregate',
  entryFile?: string,
  registry?: DimensionUnitRegistry
): Promise<Map<string, unknown>> {
  if (mode !== 'aggregate' && mode !== 'fail-fast') {
    throwInputErrors([inputError('AMX4001', `Unsupported validation mode '${safeText(String(mode))}'`, { file: entryFile })]);
  }
  const diagnostics: AmxDiagnostic[] = [];
  const report = (diagnostic: AmxDiagnostic): void => {
    diagnostics.push(diagnostic);
    if (mode === 'fail-fast') throw new StopValidation();
  };
  const mappings = new Map<string, string>();
  const declarationNames = new Set(declarations.map(declaration => declaration.name));

  try {
    for (const raw of rawMappings) {
      const separator = raw.indexOf('=');
      const name = separator < 0 ? '' : raw.slice(0, separator);
      const filePath = separator < 0 ? '' : raw.slice(separator + 1);
      if (!name || !filePath) {
        report(inputError('AMX4001', `Invalid --input mapping '${safeText(raw)}'; expected name=path`, { file: entryFile, dataFile: raw }));
        continue;
      }
      if (mappings.has(name)) {
        report(inputError('AMX4001', `Input '${name}' is mapped more than once`, { file: entryFile, inputName: name, dataFile: filePath }));
        continue;
      }
      mappings.set(name, filePath);
    }

    for (const [name, filePath] of mappings) {
      if (!declarationNames.has(name)) {
        report(inputError('AMX4001', `Unknown logical input '${name}'`, { file: entryFile, inputName: name, dataFile: filePath }));
      }
    }

    const values = new Map<string, unknown>();
    for (const declaration of declarations) {
      const filePath = mappings.get(declaration.name);
      if (!filePath) {
        report(inputError('AMX4001', `Missing mapping for input '${declaration.name}'`, {
          file: entryFile, inputName: declaration.name, declarationSource: declaration.source
        }));
        continue;
      }
      const extension = path.extname(filePath);
      if (extension !== '.json' && extension !== '.csv') {
        report(inputError('AMX4001', `Input '${declaration.name}' must use a lowercase .json or .csv path`, {
          file: entryFile, inputName: declaration.name, dataFile: filePath, declarationSource: declaration.source
        }));
        continue;
      }
      let bytes: ArrayBuffer;
      try {
        bytes = await Bun.file(path.resolve(filePath)).arrayBuffer();
      } catch {
        report(inputError('AMX4001', `Cannot read UTF-8 input file '${filePath}'`, {
          file: entryFile, inputName: declaration.name, dataFile: filePath, declarationSource: declaration.source
        }));
        continue;
      }
      let text: string;
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch {
        report(inputError('AMX4002', `Input file '${filePath}' is not valid UTF-8`, {
          file: entryFile, inputName: declaration.name, dataFile: filePath, declarationSource: declaration.source
        }));
        continue;
      }

      const validated = validateInputText(text, extension.slice(1) as InputTextFormat, declaration, types, mode, { file: entryFile, dataFile: filePath }, registry);
      diagnostics.push(...validated.diagnostics);
      if (validated.diagnostics.length > 0 && mode === 'fail-fast') throw new StopValidation();
      values.set(declaration.name, validated.value);
    }
    if (diagnostics.length) throwInputErrors(diagnostics);
    return values;
  } catch (error) {
    if (error instanceof StopValidation) throwInputErrors(diagnostics);
    throw error;
  }
}

function convertJson(
  value: unknown,
  annotation: TypeReferenceNode,
  pointer: string,
  declarationSource: SourceLocation | undefined,
  types: Map<string, TypeDeclarationNode>,
  environment: Environment,
  report: (diagnostic: AmxDiagnostic) => void,
  context: Omit<AmxDiagnostic, 'code' | 'message'>,
  fieldSource?: SourceLocation,
  registry?: DimensionUnitRegistry,
  internalDefault = false
): unknown {
  if (annotation.type === 'nullableType') {
    if (value === null) return null;
    return convertJson(value, annotation.element!, pointer, declarationSource, types, environment, report, context, fieldSource, registry, internalDefault);
  }
  if (value === null) {
    report(shapeDiagnostic('Null is not allowed for this input type', typeName(annotation), 'null', pointer, context, declarationSource, fieldSource));
    return null;
  }
  if (annotation.type === 'listType') {
    if (!Array.isArray(value)) {
      report(shapeDiagnostic('Expected a JSON array', typeName(annotation), actualType(value), pointer, context, declarationSource, fieldSource));
      return [];
    }
    return value.map((item, index) => convertJson(item, annotation.element!, `${pointer}/${index}`, declarationSource, types, environment, report, context, fieldSource, registry, internalDefault));
  }
  const name = annotation.name!;
  const dimension = registry?.dimensions.get(name);
  if (dimension && internalDefault && isMeasurement(value)) {
    if (sameVector(value.unit.vector, dimension.vector)) return value;
    report(measurementDiagnostic('AMX4005', 'Measurement default has an incompatible dimension', pointer, context, declarationSource, fieldSource, formatVector(dimension.vector, registry!), formatVector(value.unit.vector, registry!)));
    return null;
  }
  if (dimension) return convertJsonMeasurement(value, dimension.vector, pointer, declarationSource, fieldSource, context, report, registry!);
  if (name === 'Number' || name === 'String' || name === 'Boolean' || name === 'DateTime') {
    const valid = name === 'Number' ? typeof value === 'number' && Number.isFinite(value)
      : name === 'String' || name === 'DateTime' ? typeof value === 'string'
        : typeof value === 'boolean';
    if (!valid) {
      report(shapeDiagnostic(name === 'DateTime' ? 'Expected an RFC 3339 DateTime string' : 'Input value has the wrong scalar type', name, describe(value), pointer, context, declarationSource, fieldSource));
      return value;
    }
    if (name === 'DateTime' && !isDateTime(value as string)) {
      report(shapeDiagnostic('Invalid RFC 3339 DateTime value', name, describe(value), pointer, context, declarationSource, fieldSource));
    }
    return value;
  }
  const declaration = types.get(name);
  if (!declaration) {
    report(shapeDiagnostic(`Unknown input record type '${name}'`, name, actualType(value), pointer, context, declarationSource, fieldSource));
    return value;
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    report(shapeDiagnostic('Expected a JSON object', name, actualType(value), pointer, context, declarationSource, fieldSource));
    return {};
  }
  const object = value as Record<string, unknown>;
  const declared = new Set(declaration.fields.map(field => field.name));
  for (const key of Object.keys(object).filter(key => !declared.has(key)).sort()) {
    const propertyPointer = `${pointer}/${escapePointer(key)}`;
    report(shapeDiagnostic(`Unknown field '${key}'`, 'declared record field', describe(object[key]), propertyPointer, context, declarationSource, fieldSource));
  }
  const materialized: Record<string, unknown> = {};
  for (const field of declaration.fields) {
    const fieldScope = fieldRegistry(field, registry);
    const propertyPointer = `${pointer}/${escapePointer(field.name)}`;
    if (Object.prototype.hasOwnProperty.call(object, field.name)) {
      materialized[field.name] = convertJson(object[field.name], field.annotation, propertyPointer, declarationSource, types, environment, report, context, field.source, fieldScope, internalDefault);
    } else if (field.defaultExpression) {
      const value = evaluateExpression(field.defaultExpression, defaultsEnvironment(environment, fieldScope), context.file);
      materialized[field.name] = convertJson(value, field.annotation, propertyPointer, declarationSource, types, environment, report, context, field.source, fieldScope, true);
    } else if (field.optional) {
      materialized[field.name] = null;
    } else {
      report(shapeDiagnostic(`Missing required field '${field.name}'`, typeName(field.annotation), 'missing', propertyPointer, context, declarationSource, field.source));
    }
  }
  return materialized;
}

function convertCsv(
  text: string,
  annotation: TypeReferenceNode,
  declarationSource: SourceLocation | undefined,
  types: Map<string, TypeDeclarationNode>,
  environment: Environment,
  report: (diagnostic: AmxDiagnostic) => void,
  context: Omit<AmxDiagnostic, 'code' | 'message'>,
  registry?: DimensionUnitRegistry
): unknown[] {
  if (annotation.type !== 'listType' || annotation.element?.type !== 'namedType' || !types.has(annotation.element.name!)) {
    report(shapeDiagnostic('CSV input requires a list of one record type', 'RecordType[]', typeName(annotation), '', context, declarationSource));
    return [];
  }
  const recordType = types.get(annotation.element.name!)!;
  const scalarFields = recordType.fields.every(field => isCsvScalar(field.annotation, fieldRegistry(field, registry)));
  if (!scalarFields) {
    report(shapeDiagnostic('CSV records may contain only scalar fields', 'scalar-field RecordType[]', recordType.name, '', context, declarationSource));
    return [];
  }
  const parsed = parseStrictCsvText(text);
  if (parsed.issue) {
    report(inputError('AMX4002', parsed.issue.message, { ...context, dataLine: parsed.issue.line }));
    return [];
  }
  const rows = parsed.value ?? [];
  if (!rows.length) {
    report(inputError('AMX4002', 'CSV input is missing its header record', { ...context, dataLine: 1 }));
    return [];
  }
  const headers = rows[0].map(cell => cell.value);
  const fieldNames = new Set(recordType.fields.map(field => field.name));
  const seenHeaders = new Set<string>();
  for (const header of [...new Set(headers.filter(header => !header))].sort()) {
    report(shapeDiagnostic('CSV header names must be non-empty', 'declared field name', 'empty', headerPath(header), context, declarationSource));
  }
  for (const header of headers) {
    if (seenHeaders.has(header)) report(shapeDiagnostic(`Duplicate CSV header '${header}'`, 'unique header', header, headerPath(header), context, declarationSource));
    seenHeaders.add(header);
  }
  for (const header of [...new Set(headers.filter(header => !fieldNames.has(header)))].sort()) {
    report(shapeDiagnostic(`Unknown CSV header '${header}'`, 'declared field name', header, headerPath(header), context, declarationSource));
  }
  for (const field of recordType.fields) {
    if (!headers.includes(field.name) && !field.optional && !field.defaultExpression) {
      report(shapeDiagnostic(`CSV header is missing required field '${field.name}'`, typeName(field.annotation), 'missing column', headerPath(field.name), context, declarationSource, field.source));
    }
  }

  const result: unknown[] = [];
  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];
    const recordNumber = index;
    if (row.length !== headers.length) {
      report(inputError('AMX4003', `CSV record ${recordNumber} has ${row.length} fields; expected ${headers.length}`, {
        ...context, dataPath: `record[${recordNumber}]`, recordNumber, dataLine: recordNumber + 1,
        expected: `${headers.length} fields`, actual: `${row.length} fields`
      }));
    }
    const materialized: Record<string, unknown> = {};
    for (const field of recordType.fields) {
      const column = headers.indexOf(field.name);
      const propertyPath = `record[${recordNumber}].${field.name}`;
      if (column < 0) {
        if (field.defaultExpression) {
          const fieldScope = fieldRegistry(field, registry);
          const value = evaluateExpression(field.defaultExpression, defaultsEnvironment(environment, fieldScope), context.file);
          materialized[field.name] = convertJson(value, field.annotation, propertyPath, context.declarationSource, types, environment, report, context, field.source, fieldScope, true);
        }
        else if (field.optional) materialized[field.name] = null;
        continue;
      }
      const cell = row[column];
      if (!cell) continue;
      materialized[field.name] = convertCsvCell(cell, field.annotation, propertyPath, recordNumber, column + 1, field.source, report, context, fieldRegistry(field, registry));
    }
    result.push(materialized);
  }
  return result;
}

function convertCsvCell(
  cell: CsvCell,
  annotation: TypeReferenceNode,
  dataPath: string,
  recordNumber: number,
  columnNumber: number,
  fieldSource: SourceLocation | undefined,
  report: (diagnostic: AmxDiagnostic) => void,
  context: Omit<AmxDiagnostic, 'code' | 'message'>,
  registry?: DimensionUnitRegistry
): unknown {
  const base = annotation.type === 'nullableType' ? annotation.element! : annotation;
  const nullable = annotation.type === 'nullableType';
  const location = { ...context, recordNumber, dataLine: recordNumber + 1, dataColumn: columnNumber };
  if (cell.value === '' && !cell.quoted) {
    if (nullable) return null;
    report(shapeDiagnostic('Blank CSV cell represents null, but this field is not nullable', typeName(annotation), 'null', dataPath, location, undefined, fieldSource));
    return null;
  }
  if (cell.value === '' && cell.quoted) {
    if (base.type === 'namedType' && base.name === 'String') return '';
    report(shapeDiagnostic('Quoted empty CSV cell is valid only for String fields', typeName(annotation), 'empty String', dataPath, location, undefined, fieldSource));
    return '';
  }
  if (base.type !== 'namedType') return cell.value;
  const dimension = registry?.dimensions.get(base.name!);
  if (dimension) {
    const match = cell.value.match(/^\s*([+-]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)\s+(.+?)\s*$/);
    if (!match || !Number.isFinite(Number(match[1]))) {
      report(measurementDiagnostic('AMX4005', 'CSV measurement cells must contain a finite number followed by a unit expression', dataPath, location, declarationSourceFrom(context), fieldSource, 'finite number and unit', safeText(cell.value)));
      return cell.value;
    }
    return convertMeasurement(Number(match[1]), match[2], dimension.vector, dataPath, location, declarationSourceFrom(context), fieldSource, report, registry!);
  }
  if (base.name === 'String') return cell.value;
  if (base.name === 'Boolean') {
    if (cell.value === 'true') return true;
    if (cell.value === 'false') return false;
    report(shapeDiagnostic('Boolean CSV cells must be lowercase true or false', 'Boolean', cell.value, dataPath, location, undefined, fieldSource));
    return cell.value;
  }
  if (base.name === 'Number') {
    if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(cell.value) || !Number.isFinite(Number(cell.value))) {
      report(shapeDiagnostic('Invalid finite JSON-number CSV cell', 'Number', cell.value, dataPath, location, undefined, fieldSource));
      return cell.value;
    }
    return Number(cell.value);
  }
  if (base.name === 'DateTime') {
    if (!isDateTime(cell.value)) report(shapeDiagnostic('Invalid RFC 3339 DateTime CSV cell', 'DateTime', cell.value, dataPath, location, undefined, fieldSource));
    return cell.value;
  }
  return cell.value;
}

function convertJsonMeasurement(
  value: unknown,
  vector: ReadonlyMap<string, number>,
  pointer: string,
  declarationSource: SourceLocation | undefined,
  fieldSource: SourceLocation | undefined,
  context: Omit<AmxDiagnostic, 'code' | 'message'>,
  report: (diagnostic: AmxDiagnostic) => void,
  registry: DimensionUnitRegistry
): MeasurementValue | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    report(measurementDiagnostic('AMX4005', 'Measurement input must use the exact {value, unit} object shape', pointer, context, declarationSource, fieldSource, '{value, unit}', actualType(value)));
    return null;
  }
  const object = value as Record<string, unknown>;
  const keys = Object.keys(object);
  if (keys.length !== 2 || !keys.includes('value') || !keys.includes('unit')) {
    report(measurementDiagnostic('AMX4005', 'Measurement input must contain exactly the value and unit fields', pointer, context, declarationSource, fieldSource, '{value, unit}', describe(value)));
    return null;
  }
  if (typeof object.value !== 'number' || !Number.isFinite(object.value) || typeof object.unit !== 'string') {
    report(measurementDiagnostic('AMX4005', 'Measurement value must be finite and unit must be a string', pointer, context, declarationSource, fieldSource, 'finite value and unit string', describe(value)));
    return null;
  }
  return convertMeasurement(object.value, object.unit, vector, `${pointer}/unit`, context, declarationSource, fieldSource, report, registry);
}

function convertMeasurement(
  value: number,
  unitText: string,
  expectedVector: ReadonlyMap<string, number>,
  unitPath: string,
  context: Omit<AmxDiagnostic, 'code' | 'message'>,
  declarationSource: SourceLocation | undefined,
  fieldSource: SourceLocation | undefined,
  report: (diagnostic: AmxDiagnostic) => void,
  registry: DimensionUnitRegistry
): MeasurementValue | null {
  let unit;
  try {
    unit = parseExternalUnitText(unitText, registry);
  } catch (error) {
    if (!(error instanceof ExternalUnitTextError)) throw error;
    const details = {
      ...context,
      dataPath: unitPath,
      declarationSource: declarationSource ?? context.declarationSource,
      fieldSource
    };
    report(inputError(error.unknownUnit ? 'AMX4004' : 'AMX4004', error.message, details));
    return null;
  }
  if (!sameVector(unit.vector, expectedVector)) {
    report(measurementDiagnostic('AMX4005', 'Measurement unit has an incompatible dimension', unitPath, context, declarationSource, fieldSource, formatVector(expectedVector, registry), formatVector(unit.vector, registry)));
    return null;
  }
  return measurement(value, unit);
}

function measurementDiagnostic(
  code: 'AMX4004' | 'AMX4005',
  message: string,
  dataPath: string,
  context: Omit<AmxDiagnostic, 'code' | 'message'>,
  declarationSource?: SourceLocation,
  fieldSource?: SourceLocation,
  expected?: string,
  actual?: string
): AmxDiagnostic {
  return inputError(code, message, {
    ...context,
    dataPath,
    ...(expected ? { expected } : {}),
    ...(actual ? { actual: safeText(actual) } : {}),
    declarationSource: declarationSource ?? context.declarationSource,
    fieldSource
  });
}

function declarationSourceFrom(context: Omit<AmxDiagnostic, 'code' | 'message'>): SourceLocation | undefined {
  return context.declarationSource;
}

function measurementSchema(annotation: TypeReferenceNode, registry: DimensionUnitRegistry): Pick<InputSchemaField, 'measurement'> | Record<string, never> {
  let base = annotation;
  while (base.type !== 'namedType') base = base.element!;
  const dimension = registry.dimensions.get(base.name!);
  if (!dimension) return {};
  return {
    measurement: {
      dimension: base.name!,
      visibleUnits: [...registry.units.values()]
        .filter(unit => sameVector(unit.vector, dimension.vector))
        .map(unit => unit.name)
        .sort()
    }
  };
}

function sameVector(
  left: ReadonlyMap<string, number> | Readonly<Record<string, number>>,
  right: ReadonlyMap<string, number> | Readonly<Record<string, number>>
): boolean {
  const leftEntries = left instanceof Map ? [...left] : Object.entries(left);
  const rightMap = new Map(right instanceof Map ? right : Object.entries(right));
  return leftEntries.length === rightMap.size && leftEntries.every(([identity, exponent]) => rightMap.get(identity) === exponent);
}

function formatVector(vector: ReadonlyMap<string, number> | Readonly<Record<string, number>>, registry: DimensionUnitRegistry): string {
  const entries = vector instanceof Map ? [...vector] : Object.entries(vector);
  return entries.sort(([left], [right]) => left.localeCompare(right)).map(([identity, exponent]) => {
    const base = [...registry.dimensions.values()].find(dimension => dimension.baseIdentity === identity);
    if (!base) throw new Error('Measurement schema references an unavailable base dimension');
    return `${base.declarationName}${exponent === 1 ? '' : `^${exponent}`}`;
  }).join(' * ') || 'dimensionless';
}

function shapeDiagnostic(
  message: string,
  expected: string,
  actual: string,
  dataPath: string,
  context: Omit<AmxDiagnostic, 'code' | 'message'>,
  declarationSource?: SourceLocation,
  fieldSource?: SourceLocation
): AmxDiagnostic {
  return inputError('AMX4003', message, {
    ...context,
    dataPath,
    expected,
    actual: safeText(actual),
    declarationSource: declarationSource ?? context.declarationSource,
    fieldSource
  });
}

function typeName(annotation: TypeReferenceNode): string {
  if (annotation.type === 'namedType') return annotation.name!;
  return annotation.type === 'listType' ? `${typeName(annotation.element!)}[]` : `${typeName(annotation.element!)}?`;
}

function isCsvScalar(annotation: TypeReferenceNode, registry?: DimensionUnitRegistry): boolean {
  const base = annotation.type === 'nullableType' ? annotation.element! : annotation;
  return base.type === 'namedType' && (
    ['String', 'Number', 'Boolean', 'DateTime'].includes(base.name!)
    || !!registry?.dimensions.has(base.name!)
  );
}

function isDateTime(value: string): boolean {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/);
  if (!parts) return false;
  const [, year, month, day, hour, minute, second, offset] = parts;
  const date = new Date(0);
  date.setUTCFullYear(+year, +month - 1, +day);
  return date.getUTCFullYear() === +year && date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day
    && +hour <= 23 && +minute <= 59 && +second <= 59
    && (offset === 'Z' || (+offset.slice(1, 3) <= 23 && +offset.slice(4) <= 59));
}

function actualType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value;
}

function describe(value: unknown): string {
  let text: string;
  try { text = JSON.stringify(value); } catch { text = String(value); }
  return safeText(text ?? String(value));
}

function safeText(value: string): string {
  return value.replace(/[\x00-\x1f\x7f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`).slice(0, 160);
}

function escapePointer(value: string): string {
  return value.replace(/~/g, '~0').replace(/\//g, '~1');
}

function headerPath(value: string): string {
  return value ? `header.${value}` : 'header';
}

function offsetLocation(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset);
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}
