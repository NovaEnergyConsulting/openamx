import { DiagramDeclarationNode, DiagramElementNode, DiagramPropertyNode, SourceLocation } from '../ast/types';
import { AmxError, staticError } from '../diagnostics/errors';
import { fieldRegistry, setDeclaringRegistry } from '../typechecker/declarationRegistry';
import { evaluateExpression } from './evaluateExpression';
import { Environment } from './environment';

interface FrameElementLocation {
  readonly name: string;
  readonly source?: SourceLocation;
}

export type DiagramFrameElement =
  | (FrameElementLocation & Readonly<{
    primitive: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    lineWidth: number;
    arrow: 'none' | 'start' | 'end' | 'both';
  }>)
  | (FrameElementLocation & Readonly<{
    primitive: 'rectangle';
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: string;
    fill?: string;
    lineWidth: number;
  }>)
  | (FrameElementLocation & Readonly<{
    primitive: 'circle';
    cx: number;
    cy: number;
    r: number;
    stroke: string;
    fill?: string;
    lineWidth: number;
  }>)
  | (FrameElementLocation & Readonly<{
    primitive: 'text';
    x: number;
    y: number;
    value: string;
    fill: string;
  }>);

export interface DiagramFrame {
  readonly time: number;
  readonly elements: readonly DiagramFrameElement[];
}

export interface DiagramSceneModel {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly canvas: Readonly<{ width: number; height: number; coordinates: 'bottom-left-y-up' }>;
  readonly timeline: Readonly<{ variable: string; from: number; to: number; duration: number }>;
  readonly declaration: DiagramDeclarationNode;
  readonly initialFrame: DiagramFrame;
  readonly source?: SourceLocation;
  readonly file?: string;
  readonly documentNodeIndex: number;
  readonly statementIndex: number;
}

const capturedContexts = new WeakMap<DiagramSceneModel, Environment>();

type SerializedValue =
  | readonly ['undefined']
  | readonly ['null']
  | readonly ['boolean', boolean]
  | readonly ['number', number | 'nan' | 'positive-infinity' | 'negative-infinity']
  | readonly ['string', string]
  | readonly ['array', readonly SerializedValue[]]
  | readonly ['object', readonly (readonly [string, SerializedValue])[]]
  | readonly ['map', readonly (readonly [SerializedValue, SerializedValue])[]]
  | readonly ['set', readonly SerializedValue[]];

interface SerializedDiagramSceneModel {
  readonly version: 1;
  readonly model: SerializedValue;
  readonly context: SerializedValue;
}

function serializeValue(value: unknown, ancestors = new Set<object>()): SerializedValue {
  if (value === undefined) return ['undefined'];
  if (value === null) return ['null'];
  if (typeof value === 'boolean') return ['boolean', value];
  if (typeof value === 'number') {
    return ['number', Number.isNaN(value) ? 'nan'
      : value === Infinity ? 'positive-infinity'
        : value === -Infinity ? 'negative-infinity' : value];
  }
  if (typeof value === 'string') return ['string', value];
  if (typeof value !== 'object') throw new Error(`Unsupported diagram context value: ${typeof value}`);
  if (ancestors.has(value)) throw new Error('Diagram context contains a cyclic value and cannot be serialized.');
  ancestors.add(value);
  try {
    if (Array.isArray(value)) return ['array', value.map(item => serializeValue(item, ancestors))];
    if (value instanceof Map) {
      return ['map', [...value].map(([key, item]) => [serializeValue(key, ancestors), serializeValue(item, ancestors)] as const)];
    }
    if (value instanceof Set) return ['set', [...value].map(item => serializeValue(item, ancestors))];
    return ['object', Object.entries(value).map(([key, item]) => [key, serializeValue(item, ancestors)] as const)];
  } finally {
    ancestors.delete(value);
  }
}

function deserializeValue(value: unknown): unknown {
  if (!Array.isArray(value) || typeof value[0] !== 'string') throw new Error('Invalid serialized diagram value.');
  switch (value[0]) {
    case 'undefined':
      if (value.length !== 1) throw new Error('Invalid serialized undefined diagram value.');
      return undefined;
    case 'null':
      if (value.length !== 1) throw new Error('Invalid serialized null diagram value.');
      return null;
    case 'boolean':
      if (value.length !== 2 || typeof value[1] !== 'boolean') throw new Error('Invalid serialized boolean diagram value.');
      return value[1];
    case 'number':
      if (value.length !== 2) throw new Error('Invalid serialized number diagram value.');
      if (value[1] === 'nan') return NaN;
      if (value[1] === 'positive-infinity') return Infinity;
      if (value[1] === 'negative-infinity') return -Infinity;
      if (typeof value[1] !== 'number') throw new Error('Invalid serialized number diagram value.');
      return value[1];
    case 'string':
      if (value.length !== 2 || typeof value[1] !== 'string') throw new Error('Invalid serialized string diagram value.');
      return value[1];
    case 'array':
      if (value.length !== 2 || !Array.isArray(value[1])) throw new Error('Invalid serialized array diagram value.');
      return value[1].map(deserializeValue);
    case 'object': {
      if (value.length !== 2 || !Array.isArray(value[1])) throw new Error('Invalid serialized object diagram value.');
      const entries = value[1].map(entry => {
        if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string') {
          throw new Error('Invalid serialized object entry in diagram value.');
        }
        return [entry[0], deserializeValue(entry[1])] as const;
      });
      return Object.fromEntries(entries);
    }
    case 'map':
      if (value.length !== 2 || !Array.isArray(value[1])) throw new Error('Invalid serialized map diagram value.');
      return new Map(value[1].map(entry => {
        if (!Array.isArray(entry) || entry.length !== 2) throw new Error('Invalid serialized map entry in diagram value.');
        return [deserializeValue(entry[0]), deserializeValue(entry[1])];
      }));
    case 'set':
      if (value.length !== 2 || !Array.isArray(value[1])) throw new Error('Invalid serialized set diagram value.');
      return new Set(value[1].map(deserializeValue));
    default:
      throw new Error('Unknown serialized diagram value type.');
  }
}

function mapValue<T>(value: unknown, field: string): Map<string, T> {
  if (!(value instanceof Map)) throw new Error(`Invalid serialized diagram context map '${field}'.`);
  for (const key of value.keys()) if (typeof key !== 'string') throw new Error(`Invalid key in serialized diagram context map '${field}'.`);
  return value as Map<string, T>;
}

export function serializeDiagramSceneModel(model: DiagramSceneModel): string {
  const env = capturedContexts.get(model);
  if (!env) throw new Error('Diagram model has no captured AMX evaluation context');
  const context = {
    values: env.toObject(),
    immutableValues: Object.entries(env.toObject()).filter(([, value]) => env.isImmutable(value)).map(([name]) => name),
    recordTypes: env.recordTypes,
    enumDeclarations: env.enumDeclarations,
    enumValues: env.enumValues,
    functions: env.functions,
    bindingTypes: env.bindingTypes,
    dimensionRegistry: env.dimensionRegistry,
    validationMode: env.validationMode,
    declarationRegistries: {
      records: [...env.recordTypes].map(([name, declaration]) => ({
        name,
        declaration: fieldRegistry(declaration, env.dimensionRegistry),
        fields: (declaration.declaredFields ?? declaration.fields)
          .map(field => fieldRegistry(field, env.dimensionRegistry))
      })),
      functions: [...env.functions].map(([name, declaration]) => ({
        name,
        declaration: fieldRegistry(declaration, env.dimensionRegistry)
      }))
    }
  };
  const payload: SerializedDiagramSceneModel = {
    version: 1,
    model: serializeValue(model),
    context: serializeValue(context)
  };
  return JSON.stringify(payload);
}

export function deserializeDiagramSceneModel(serialized: string): DiagramSceneModel {
  const payload: unknown = JSON.parse(serialized);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)
    || !('version' in payload) || payload.version !== 1
    || !('model' in payload) || !('context' in payload)) {
    throw new Error('Invalid serialized diagram model envelope.');
  }
  const modelValue = deserializeValue(payload.model);
  const contextValue = deserializeValue(payload.context);
  if (!modelValue || typeof modelValue !== 'object' || Array.isArray(modelValue)
    || !contextValue || typeof contextValue !== 'object' || Array.isArray(contextValue)) {
    throw new Error('Invalid serialized diagram model or evaluation context.');
  }
  const model = freezeData(modelValue as DiagramSceneModel);
  const context = contextValue as {
    values: Record<string, unknown>;
    immutableValues: string[];
    recordTypes: unknown;
    enumDeclarations: unknown;
    enumValues: unknown;
    functions: unknown;
    bindingTypes: unknown;
    dimensionRegistry?: Environment['dimensionRegistry'];
    validationMode: Environment['validationMode'];
    declarationRegistries: {
      records: Array<{ name: string; declaration?: ReturnType<typeof fieldRegistry>; fields: Array<ReturnType<typeof fieldRegistry>> }>;
      functions: Array<{ name: string; declaration?: ReturnType<typeof fieldRegistry> }>;
    };
  };
  if (!context.values || typeof context.values !== 'object' || Array.isArray(context.values)
    || !Array.isArray(context.immutableValues) || !context.declarationRegistries
    || !Array.isArray(context.declarationRegistries.records) || !Array.isArray(context.declarationRegistries.functions)
    || (context.validationMode !== 'aggregate' && context.validationMode !== 'fail-fast')) {
    throw new Error('Invalid serialized diagram evaluation context.');
  }
  const recordTypes = mapValue<Environment['recordTypes'] extends Map<string, infer T> ? T : never>(context.recordTypes, 'recordTypes');
  const functions = mapValue<Environment['functions'] extends Map<string, infer T> ? T : never>(context.functions, 'functions');
  const env = new Environment(recordTypes, functions, context.dimensionRegistry);
  env.validationMode = context.validationMode;
  for (const [name, value] of Object.entries(context.values)) {
    env.set(name, value);
    if (context.immutableValues.includes(name)) env.markImmutable(value);
  }
  for (const [name, value] of mapValue<Environment['enumDeclarations'] extends Map<string, infer T> ? T : never>(context.enumDeclarations, 'enumDeclarations')) {
    env.enumDeclarations.set(name, value);
  }
  for (const [name, value] of mapValue<Environment['enumValues'] extends Map<string, infer T> ? T : never>(context.enumValues, 'enumValues')) {
    env.enumValues.set(name, value);
  }
  for (const [name, value] of mapValue<Environment['bindingTypes'] extends Map<string, infer T> ? T : never>(context.bindingTypes, 'bindingTypes')) {
    env.bindingTypes.set(name, value);
  }
  for (const item of context.declarationRegistries.records) {
    const declaration = recordTypes.get(item.name);
    if (!declaration || !Array.isArray(item.fields)) throw new Error('Invalid serialized record declaration registry.');
    if (item.declaration) setDeclaringRegistry(declaration, item.declaration);
    const fields = declaration.declaredFields ?? declaration.fields;
    if (fields.length !== item.fields.length) throw new Error('Serialized record field registry does not match its declaration.');
    item.fields.forEach((registry, index) => {
      if (registry) setDeclaringRegistry(fields[index]!, registry);
    });
  }
  for (const item of context.declarationRegistries.functions) {
    const declaration = functions.get(item.name);
    if (!declaration) throw new Error('Invalid serialized function declaration registry.');
    if (item.declaration) setDeclaringRegistry(declaration, item.declaration);
  }
  capturedContexts.set(model, env);
  return model;
}

function cloneData<T>(value: T, seen = new Map<object, unknown>()): T {
  if (!value || typeof value !== 'object') return value;
  const existing = seen.get(value);
  if (existing) return existing as T;
  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    seen.set(value, copy);
    for (const item of value) copy.push(cloneData(item, seen));
    return copy as T;
  }
  if (value instanceof Map) {
    const copy = new Map<unknown, unknown>();
    seen.set(value, copy);
    for (const [key, item] of value) copy.set(cloneData(key, seen), cloneData(item, seen));
    return copy as T;
  }
  if (value instanceof Set) {
    const copy = new Set<unknown>();
    seen.set(value, copy);
    for (const item of value) copy.add(cloneData(item, seen));
    return copy as T;
  }
  const copy: Record<string, unknown> = {};
  seen.set(value, copy);
  for (const [key, item] of Object.entries(value)) copy[key] = cloneData(item, seen);
  return copy as T;
}

function freezeData<T>(value: T, seen = new Set<object>()): T {
  if (!value || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) value.forEach(item => freezeData(item, seen));
  else if (!(value instanceof Map) && !(value instanceof Set)) {
    Object.values(value).forEach(item => freezeData(item, seen));
  }
  return Object.freeze(value);
}

function cloneEnvironment(source: Environment): Environment {
  const recordTypes = cloneData(source.recordTypes);
  const functions = cloneData(source.functions);
  const registry = source.dimensionRegistry ? cloneData(source.dimensionRegistry) : undefined;
  const copy = new Environment(recordTypes, functions, registry);
  copy.validationMode = source.validationMode;

  for (const [name, declaration] of source.recordTypes) {
    const cloned = recordTypes.get(name)!;
    const declarationRegistry = fieldRegistry(declaration, source.dimensionRegistry);
    if (declarationRegistry) setDeclaringRegistry(cloned, cloneData(declarationRegistry));
    const originalFields = declaration.declaredFields ?? declaration.fields;
    const copiedFields = cloned.declaredFields ?? cloned.fields;
    for (let index = 0; index < originalFields.length; index++) {
      const fieldRegistryValue = fieldRegistry(originalFields[index], source.dimensionRegistry);
      if (fieldRegistryValue && copiedFields[index]) {
        setDeclaringRegistry(copiedFields[index], cloneData(fieldRegistryValue));
      }
    }
  }
  for (const [name, declaration] of source.functions) {
    const declarationRegistry = fieldRegistry(declaration, source.dimensionRegistry);
    if (declarationRegistry) setDeclaringRegistry(functions.get(name)!, cloneData(declarationRegistry));
  }
  for (const [name, value] of source.enumDeclarations) copy.enumDeclarations.set(name, cloneData(value));
  for (const [name, value] of source.enumValues) copy.enumValues.set(name, cloneData(value));
  for (const [name, type] of source.bindingTypes) copy.bindingTypes.set(name, cloneData(type));
  for (const [name, value] of Object.entries(source.toObject())) {
    const cloned = cloneData(value);
    copy.set(name, cloned);
    if (source.isImmutable(value)) copy.markImmutable(cloned);
  }
  return copy;
}

function property(element: DiagramElementNode, name: string): DiagramPropertyNode {
  const found = element.properties.find(item => item.name === name);
  if (!found) throw new Error(`Type checker accepted missing diagram property '${name}'`);
  return found;
}

function requiredNumber(
  element: DiagramElementNode,
  name: string,
  env: Environment,
  file: string | undefined,
  timeline: DiagramSceneModel['timeline'],
  time: number
): number {
  const item = property(element, name);
  const value = evaluateExpression(item.expression, env, file);
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    if (value === Infinity && time === timeline.to) {
      staticError('AMXD010', 'Infinity value calculated for time upper bound', item.valueSource ?? item.source, file);
    }
    if (value === Infinity && time > timeline.from && time < timeline.to) {
      staticError('AMXD011', 'Expression produces an infinite result', item.valueSource ?? item.source, file);
    }
    staticError('AMXD008', 'Invalid primitive geometry', item.valueSource ?? item.source, file);
  }
  return value;
}

function evaluateFrame(
  declaration: DiagramDeclarationNode,
  timeline: DiagramSceneModel['timeline'],
  time: number,
  sourceEnvironment: Environment,
  file?: string
): DiagramFrame {
  if (typeof time !== 'number' || !Number.isFinite(time) || time < timeline.from || time > timeline.to) {
    staticError('AMXD004', 'Invalid time bounds', declaration.times[0]?.source ?? declaration.source, file);
  }
  const env = cloneEnvironment(sourceEnvironment);
  env.set(timeline.variable, time);

  const elements = declaration.elements.map((element): DiagramFrameElement => {
    const readNumber = (name: string) => requiredNumber(element, name, env, file, timeline, time);
    const readStyle = (name: string) => {
      const value = property(element, name).expression;
      if (value.type !== 'stringLiteral') throw new Error('Type checker accepted a non-literal diagram style');
      return value.value;
    };
    const readLineWidth = () => {
      const value = property(element, 'lineWidth').expression;
      if (value.type !== 'numberLiteral') throw new Error('Type checker accepted a non-literal line width');
      return value.value;
    };
    try {
      switch (element.primitive) {
        case 'line': {
          const arrow = element.properties.find(item => item.name === 'arrow')?.expression;
          const arrowValue = arrow?.type === 'stringLiteral' ? arrow.value : 'none';
          return Object.freeze({
            primitive: 'line', name: element.name, source: element.source,
            x1: readNumber('x1'), y1: readNumber('y1'), x2: readNumber('x2'), y2: readNumber('y2'),
            stroke: readStyle('stroke'),
            lineWidth: readLineWidth(),
            arrow: arrowValue as 'none' | 'start' | 'end' | 'both'
          });
        }
        case 'rectangle': {
          const width = readNumber('width');
          const height = readNumber('height');
          if (width <= 0) staticError('AMXD008', 'Invalid primitive geometry', property(element, 'width').valueSource, file);
          if (height <= 0) staticError('AMXD008', 'Invalid primitive geometry', property(element, 'height').valueSource, file);
          const fill = element.properties.some(item => item.name === 'fill') ? readStyle('fill') : undefined;
          return Object.freeze({
            primitive: 'rectangle', name: element.name, source: element.source,
            x: readNumber('x'), y: readNumber('y'), width, height, stroke: readStyle('stroke'),
            ...(fill === undefined ? {} : { fill }),
            lineWidth: readLineWidth()
          });
        }
        case 'circle': {
          const r = readNumber('r');
          if (r <= 0) staticError('AMXD008', 'Invalid primitive geometry', property(element, 'r').valueSource, file);
          const fill = element.properties.some(item => item.name === 'fill') ? readStyle('fill') : undefined;
          return Object.freeze({
            primitive: 'circle', name: element.name, source: element.source,
            cx: readNumber('cx'), cy: readNumber('cy'), r, stroke: readStyle('stroke'),
            ...(fill === undefined ? {} : { fill }),
            lineWidth: readLineWidth()
          });
        }
        case 'text': {
          const label = property(element, 'value');
          const value = evaluateExpression(label.expression, env, file);
          if (typeof value !== 'string') staticError('AMX3002', 'Expected String, got non-String value', label.valueSource, file);
          return Object.freeze({
            primitive: 'text', name: element.name, source: element.source,
            x: readNumber('x'), y: readNumber('y'), value, fill: readStyle('fill')
          });
        }
        default:
          throw new Error(`Type checker accepted unsupported diagram primitive '${element.primitive}'`);
      }
    } catch (error) {
      if (error instanceof AmxError && time !== timeline.from && error.code !== 'AMXD008'
        && error.code !== 'AMXD010' && error.code !== 'AMXD011') {
        throw new AmxError({
          code: 'AMXD009',
          message: `Frame evaluation leads to invalid results. The underlying error is: ${error.message}`,
          file: error.file ?? file,
          line: error.line ?? element.source?.line,
          column: error.column ?? element.source?.column
        });
      }
      throw error;
    }
  });
  return Object.freeze({ time, elements: Object.freeze(elements) });
}

function evaluateDocumentNumber(
  expression: DiagramDeclarationNode['times'][number]['from'],
  env: Environment,
  file: string | undefined,
  code: 'AMXD003' | 'AMXD004' | 'AMXD005' | 'AMXD014',
  message: string,
  source?: SourceLocation
): number {
  const value = evaluateExpression(expression, env, file);
  if (typeof value !== 'number' || !Number.isFinite(value)
    || (code === 'AMXD003' || code === 'AMXD014' || code === 'AMXD005') && value <= 0) {
    staticError(code, message, source, file);
  }
  return value;
}

export function createDiagramModel(
  sourceDeclaration: DiagramDeclarationNode,
  sourceEnvironment: Environment,
  file: string | undefined,
  documentNodeIndex: number,
  statementIndex: number
): DiagramSceneModel {
  const declaration = freezeData(cloneData(sourceDeclaration));
  const env = cloneEnvironment(sourceEnvironment);
  const getDiagramProperty = (name: string): DiagramPropertyNode => {
    const item = declaration.properties.find(propertyItem => propertyItem.name === name);
    if (!item) throw new Error(`Type checker accepted missing diagram property '${name}'`);
    return item;
  };
  const widthProperty = getDiagramProperty('width');
  const heightProperty = getDiagramProperty('height');
  const width = evaluateDocumentNumber(widthProperty.expression, env, file, 'AMXD003', 'Canvas width is invalid', widthProperty.valueSource);
  const height = evaluateDocumentNumber(heightProperty.expression, env, file, 'AMXD014', 'Canvas height is invalid', heightProperty.valueSource);
  const titleExpression = getDiagramProperty('title').expression;
  const descriptionExpression = getDiagramProperty('description').expression;
  if (titleExpression.type !== 'stringLiteral' || descriptionExpression.type !== 'stringLiteral') {
    throw new Error('Type checker accepted a non-literal diagram title or description');
  }
  const time = declaration.times[0];
  const from = evaluateDocumentNumber(time.from, env, file, 'AMXD004', 'Invalid time bounds', time.fromSource ?? time.source);
  const to = evaluateDocumentNumber(time.to, env, file, 'AMXD004', 'Invalid time bounds', time.toSource ?? time.source);
  if (from >= to) staticError('AMXD004', 'Invalid time bounds', time.source ?? declaration.source, file);
  const duration = evaluateDocumentNumber(time.duration, env, file, 'AMXD005', 'Invalid playback duration value', time.durationSource ?? time.source);
  const timeline = Object.freeze({ variable: time.name, from, to, duration });
  const initialFrame = evaluateFrame(declaration, timeline, from, env, file);
  const model: DiagramSceneModel = Object.freeze({
    name: declaration.name,
    title: titleExpression.value,
    description: descriptionExpression.value,
    canvas: Object.freeze({ width, height, coordinates: 'bottom-left-y-up' as const }),
    timeline,
    declaration,
    initialFrame,
    source: declaration.source,
    file,
    documentNodeIndex,
    statementIndex
  });
  capturedContexts.set(model, env);
  return model;
}

export function evaluateDiagramFrame(
  model: DiagramSceneModel,
  time: number,
  file = model.file
): DiagramFrame {
  const env = capturedContexts.get(model);
  if (!env) throw new Error('Diagram model has no captured AMX evaluation context');
  return evaluateFrame(model.declaration, model.timeline, time, env, file);
}
