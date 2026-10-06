import * as path from 'path';
import { TypeDeclarationNode } from '../ast/types';
import { outputError } from '../diagnostics/errors';
import { Environment } from './environment';
import type { CheckedType } from '../typechecker/checkDocument';

export interface PreparedOutput {
  name: string;
  path: string;
  format: 'json' | 'csv';
  type: CheckedType;
}

export interface SerializedOutput {
  path: string;
  contents: string;
}

export interface OutputSchema {
  name: string;
  type: string;
  formats: Array<'json' | 'csv'>;
}

function typeName(type: CheckedType): string {
  if (type.kind === 'named') return type.name;
  if (type.kind === 'measurement') return 'measurement';
  if (type.kind === 'null') return 'null';
  return type.kind === 'list' ? `${typeName(type.element)}[]` : `${typeName(type.element)}?`;
}

function isPrimitive(type: CheckedType): boolean {
  return type.kind === 'named' && ['Number', 'String', 'Boolean', 'DateTime'].includes(type.name);
}

function isCsvScalar(type: CheckedType): boolean {
  return isPrimitive(type) || (type.kind === 'nullable' && isPrimitive(type.element));
}

function supportsJson(type: CheckedType, recordTypes: Map<string, TypeDeclarationNode>, visiting = new Set<string>()): boolean {
  if (type.kind === 'nullable' || type.kind === 'list') return supportsJson(type.element, recordTypes, visiting);
  if (type.kind !== 'named') return false;
  if (isPrimitive(type)) return true;
  const declaration = recordTypes.get(type.name);
  if (!declaration || visiting.has(type.name)) return false;
  const next = new Set(visiting).add(type.name);
  return declaration.fields.every(field => supportsJson(checkedType(field.annotation), recordTypes, next));
}

function supportsCsv(type: CheckedType, recordTypes: Map<string, TypeDeclarationNode>): boolean {
  if (type.kind !== 'list' || type.element.kind !== 'named') return false;
  const declaration = recordTypes.get(type.element.name);
  return !!declaration && declaration.fields.every(field => isCsvScalar(checkedType(field.annotation)));
}

export function describeOutputSchemas(
  exportedBindings: Map<string, CheckedType>,
  recordTypes: Map<string, TypeDeclarationNode>
): OutputSchema[] {
  return [...exportedBindings].flatMap(([name, type]) => {
    const formats: Array<'json' | 'csv'> = [];
    if (supportsJson(type, recordTypes)) formats.push('json');
    if (supportsCsv(type, recordTypes)) formats.push('csv');
    return formats.length ? [{ name, type: typeName(type), formats }] : [];
  });
}

function assertJsonShape(type: CheckedType, recordTypes: Map<string, TypeDeclarationNode>, outputName: string): void {
  if (type.kind === 'nullable' || type.kind === 'list') {
    assertJsonShape(type.element, recordTypes, outputName);
    return;
  }
  if (type.kind !== 'named') outputError('AMX6001', `Output '${outputName}' has no declared serializable type`);
  if (isPrimitive(type)) return;
  const declaration = recordTypes.get(type.name);
  if (!declaration) outputError('AMX6001', `Output '${outputName}' uses unknown record type '${type.name}'`);
  for (const field of declaration.fields) assertJsonShape(checkedType(field.annotation), recordTypes, outputName);
}

function checkedType(reference: TypeDeclarationNode['fields'][number]['annotation']): CheckedType {
  if (reference.type === 'namedType') return { kind: 'named', name: reference.name! };
  const element = checkedType(reference.element!);
  return reference.type === 'listType' ? { kind: 'list', element } : { kind: 'nullable', element };
}

function assertCsvShape(type: CheckedType, recordTypes: Map<string, TypeDeclarationNode>, outputName: string): void {
  if (type.kind !== 'list' || type.element.kind !== 'named') {
    outputError('AMX6001', `CSV output '${outputName}' must be a list of one declared record type`);
  }
  const declaration = recordTypes.get(type.element.name);
  if (!declaration) outputError('AMX6001', `CSV output '${outputName}' uses unknown record type '${type.element.name}'`);
  const unsupported = declaration.fields.find(field => !isCsvScalar(checkedType(field.annotation)));
  if (unsupported) {
    outputError('AMX6001', `CSV output '${outputName}' field '${unsupported.name}' must be a scalar or nullable scalar, not ${typeName(checkedType(unsupported.annotation))}`);
  }
}

export function prepareOutputs(
  mappings: string[] | undefined,
  exportedBindings: Map<string, CheckedType>,
  recordTypes: Map<string, TypeDeclarationNode>,
  reservedDestination?: string
): PreparedOutput[] {
  const outputs: PreparedOutput[] = [];
  const names = new Set<string>();
  const destinations = new Set<string>();
  const reserved = reservedDestination ? path.resolve(reservedDestination) : undefined;

  for (const mapping of mappings ?? []) {
    const separator = mapping.indexOf('=');
    if (separator < 0) outputError('AMX6001', `Invalid --output mapping '${mapping}'; expected name=path`);
    const name = mapping.slice(0, separator);
    const destination = mapping.slice(separator + 1);
    if (!name || !destination) outputError('AMX6001', `Invalid --output mapping '${mapping}'; name and path must be non-empty`);
    if (names.has(name)) outputError('AMX6001', `Duplicate output name '${name}'`);
    names.add(name);

    const type = exportedBindings.get(name);
    if (!type) outputError('AMX6001', `Output '${name}' is not an explicitly exported entry-module let value`);

    const absolutePath = path.resolve(destination);
    if (destinations.has(absolutePath)) outputError('AMX6001', `Duplicate output destination '${absolutePath}'`);
    if (absolutePath === reserved) outputError('AMX6001', `Output '${name}' conflicts with the render HTML destination '${absolutePath}'`);
    destinations.add(absolutePath);

    const extension = path.extname(destination);
    if (extension !== '.json' && extension !== '.csv') {
      outputError('AMX6001', `Output '${name}' must use the exact lowercase .json or .csv extension`);
    }
    const format = extension.slice(1) as 'json' | 'csv';
    if (format === 'json') assertJsonShape(type, recordTypes, name);
    else assertCsvShape(type, recordTypes, name);
    outputs.push({ name, path: absolutePath, format, type });
  }
  return outputs;
}

function invalidValue(output: PreparedOutput, detail: string): never {
  outputError('AMX6002', `Cannot serialize output '${output.name}': ${detail}`);
}

function jsonValue(value: unknown, type: CheckedType, output: PreparedOutput, recordTypes: Map<string, TypeDeclarationNode>): unknown {
  if (type.kind === 'nullable') {
    if (value === null) return null;
    return jsonValue(value, type.element, output, recordTypes);
  }
  if (type.kind === 'null') {
    if (value === null) return null;
    return invalidValue(output, 'expected null');
  }
  if (type.kind === 'list') {
    if (!Array.isArray(value)) return invalidValue(output, `expected ${typeName(type)}`);
    return value.map(item => jsonValue(item, type.element, output, recordTypes));
  }
  if (type.kind !== 'named') return invalidValue(output, `unsupported type ${typeName(type)}`);
  if (type.name === 'Number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return invalidValue(output, `expected a finite Number, got ${String(value)}`);
    return value;
  }
  if (type.name === 'String' || type.name === 'DateTime') {
    if (typeof value !== 'string') return invalidValue(output, `expected ${type.name}`);
    return value;
  }
  if (type.name === 'Boolean') {
    if (typeof value !== 'boolean') return invalidValue(output, 'expected Boolean');
    return value;
  }

  const declaration = recordTypes.get(type.name);
  if (!declaration || typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalidValue(output, `expected record ${type.name}`);
  }
  const record = value as Record<string, unknown>;
  const knownFields = new Set(declaration.fields.map(field => field.name));
  const extras = Object.keys(record).filter(key => !knownFields.has(key)).sort();
  if (extras.length) return invalidValue(output, `record ${type.name} has undeclared field '${extras[0]}'`);
  const ordered: Record<string, unknown> = {};
  for (const field of declaration.fields) {
    if (!Object.prototype.hasOwnProperty.call(record, field.name)) return invalidValue(output, `record ${type.name} is missing field '${field.name}'`);
    ordered[field.name] = jsonValue(record[field.name], checkedType(field.annotation), output, recordTypes);
  }
  return ordered;
}

function csvCell(value: unknown, type: CheckedType, output: PreparedOutput): string {
  let text: string;
  if (type.kind === 'nullable') {
    if (value === null) return '';
    return csvCell(value, type.element, output);
  }
  if (type.kind !== 'named') return invalidValue(output, `unsupported CSV cell type ${typeName(type)}`);
  if (type.name === 'Number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return invalidValue(output, `expected a finite Number, got ${String(value)}`);
    text = JSON.stringify(value);
  } else if (type.name === 'Boolean') {
    if (typeof value !== 'boolean') return invalidValue(output, 'expected Boolean');
    text = value ? 'true' : 'false';
  } else if (type.name === 'String' || type.name === 'DateTime') {
    if (typeof value !== 'string') return invalidValue(output, `expected ${type.name}`);
    text = value;
  } else {
    return invalidValue(output, `unsupported CSV cell type ${typeName(type)}`);
  }
  const quote = text === '' || /[",\r\n]/.test(text) || /^\s|\s$/.test(text);
  return quote ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvContents(value: unknown, type: CheckedType, output: PreparedOutput, recordTypes: Map<string, TypeDeclarationNode>): string {
  if (type.kind !== 'list' || type.element.kind !== 'named') return invalidValue(output, 'expected a declared record list');
  const declaration = recordTypes.get(type.element.name);
  if (!declaration || !Array.isArray(value)) return invalidValue(output, `expected ${typeName(type)}`);
  const fields = declaration.fields;
  const rows = [fields.map(field => csvCell(field.name, { kind: 'named', name: 'String' }, output)).join(',')];
  const knownFields = new Set(fields.map(field => field.name));
  for (const [index, item] of value.entries()) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return invalidValue(output, `record ${index} is not an object`);
    const record = item as Record<string, unknown>;
    const extras = Object.keys(record).filter(key => !knownFields.has(key)).sort();
    if (extras.length) return invalidValue(output, `record ${index} has undeclared field '${extras[0]}'`);
    rows.push(fields.map(field => {
      if (!Object.prototype.hasOwnProperty.call(record, field.name)) return invalidValue(output, `record ${index} is missing field '${field.name}'`);
      return csvCell(record[field.name], checkedType(field.annotation), output);
    }).join(','));
  }
  return `${rows.join('\n')}\n`;
}

export function serializeOutputs(outputs: PreparedOutput[], env: Environment): SerializedOutput[] {
  return outputs.map(output => {
    const value = env.get(output.name);
    const contents = output.format === 'json'
      ? `${JSON.stringify(jsonValue(value, output.type, output, env.recordTypes), null, 2)}\n`
      : csvContents(value, output.type, output, env.recordTypes);
    return { path: output.path, contents };
  });
}

export async function writeOutputs(outputs: SerializedOutput[]): Promise<void> {
  for (const output of outputs) {
    try {
      await Bun.write(output.path, output.contents);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      outputError('AMX6002', `Failed to write output '${output.path}': ${detail}`);
    }
  }
}