import { ChartDeclarationNode, ChartFieldOptionNode, ChartSeriesOptionNode, DimensionDeclarationNode, ExportNamesDeclarationNode, FunctionDeclarationNode, InputDeclarationNode, OpenAmxDocument, RecordFieldNode, SourceLocation, StatementNode, TableDeclarationNode, TypeDeclarationNode, TypeReferenceNode, UnitDeclarationNode, V02ExpressionNode, VisualizationOptionNode } from '../ast/types';
import { moduleError, staticError } from '../diagnostics/errors';
import type { DimensionMetadata, UnitMetadata } from './dimensionTypes';

export type CheckedType =
  | { kind: 'named'; name: string }
  | { kind: 'list' | 'nullable'; element: CheckedType }
  | { kind: 'null' };

/** Symbols made visible to a module because they were explicitly imported (immutable). */
export interface ModuleCheckContext {
  types?: Map<string, TypeDeclarationNode>;
  functions?: Map<string, FunctionDeclarationNode>;
  bindings?: Map<string, CheckedType>;
  dimensions?: Map<string, DimensionMetadata>;
  units?: Map<string, UnitMetadata>;
  baseUnits?: Map<string, UnitMetadata>;
  moduleIdentity?: string;
  isEntryModule?: boolean;
}

/** Symbols this module makes available to importers because they were declared with `export`. */
export interface ModuleCheckResult {
  exportedTypes: Map<string, TypeDeclarationNode>;
  exportedFunctions: Map<string, FunctionDeclarationNode>;
  exportedBindings: Map<string, CheckedType>;
  bindingTypes: Map<string, CheckedType>;
  exportedDimensions: Map<string, DimensionMetadata>;
  exportedUnits: Map<string, UnitMetadata>;
  dimensions: Map<string, DimensionMetadata>;
  units: Map<string, UnitMetadata>;
}

const named = (name: string): CheckedType => ({ kind: 'named', name });
const list = (element: CheckedType): CheckedType => ({ kind: 'list', element });
const nullable = (element: CheckedType): CheckedType => ({ kind: 'nullable', element });
const primitives = new Set(['Number', 'String', 'Boolean', 'DateTime']);
const signatures: Record<string, { args: string[]; min: number }> = {
  sum: { args: ['Number[]'], min: 1 }, min: { args: ['Number[]'], min: 1 },
  max: { args: ['Number[]'], min: 1 }, mean: { args: ['Number[]'], min: 1 },
  round: { args: ['Number', 'Number'], min: 1 }, abs: { args: ['Number'], min: 1 },
  sqrt: { args: ['Number'], min: 1 }, pow: { args: ['Number', 'Number'], min: 2 }
};

function equal(left: CheckedType, right: CheckedType): boolean {
  return left.kind === right.kind && (left.kind === 'named'
    ? right.kind === 'named' && left.name === right.name
    : left.kind === 'null' || (right.kind !== 'named' && right.kind !== 'null' && equal(left.element, right.element)));
}

function assignable(actual: CheckedType, expected: CheckedType): boolean {
  if (equal(actual, expected)) return true;
  if (expected.kind === 'nullable') return actual.kind === 'null' || assignable(actual, expected.element);
  return actual.kind === 'list' && expected.kind === 'list' && assignable(actual.element, expected.element);
}

function common(left: CheckedType, right: CheckedType): CheckedType | undefined {
  if (assignable(left, right)) return right;
  if (assignable(right, left)) return left;
  return undefined;
}

function format(type: CheckedType): string {
  if (type.kind === 'named') return type.name;
  if (type.kind === 'null') return 'null';
  return type.kind === 'list' ? `${format(type.element)}[]` : `${format(type.element)}?`;
}

export function checkingActivated(_doc: OpenAmxDocument): boolean {
  return true;
}

const stdlibNames = new Set(['sum', 'min', 'max', 'mean', 'round', 'abs', 'sqrt', 'pow']);

function bodyContainsForExpression(expression: V02ExpressionNode): boolean {
  switch (expression.type) {
    case 'forExpression': return true;
    case 'binaryExpression': return bodyContainsForExpression(expression.left) || bodyContainsForExpression(expression.right);
    case 'stringInterpolation': return expression.parts.some(part => typeof part !== 'string' && bodyContainsForExpression(part));
    case 'unaryExpression': return bodyContainsForExpression(expression.argument);
    case 'conditionalExpression': return [expression.test, expression.consequent, expression.alternate].some(bodyContainsForExpression);
    case 'listLiteral': return expression.elements.some(bodyContainsForExpression);
    case 'functionCall': return expression.arguments.some(bodyContainsForExpression);
    case 'rangeExpression': return bodyContainsForExpression(expression.start) || bodyContainsForExpression(expression.end);
    case 'matchExpression': return bodyContainsForExpression(expression.expression) || expression.cases.some(arm => bodyContainsForExpression(arm.expression)) || bodyContainsForExpression(expression.defaultExpression);
    case 'recordConstructor': return expression.fields.some(field => bodyContainsForExpression(field.expression));
    case 'fieldAccess': return bodyContainsForExpression(expression.receiver);
    case 'listAccess': return bodyContainsForExpression(expression.receiver) || bodyContainsForExpression(expression.index);
    default: return false;
  }
}

function constantValue(expression: V02ExpressionNode): unknown | undefined {
  switch (expression.type) {
    case 'numberLiteral': return Number.isFinite(expression.value) ? expression.value : undefined;
    case 'stringLiteral': case 'booleanLiteral': return expression.value;
    case 'nullLiteral': return null;
    case 'unaryExpression': {
      const value = constantValue(expression.argument);
      if (expression.operator === '-' && typeof value === 'number' && Number.isFinite(-value)) return -value;
      if (expression.operator === 'not' && typeof value === 'boolean') return !value;
      return undefined;
    }
    case 'binaryExpression': {
      const left = constantValue(expression.left);
      const right = constantValue(expression.right);
      if (left === undefined || right === undefined) return undefined;
      let result: unknown;
      switch (expression.operator) {
        case '+': case '-': case '*': case '/': case '%': case '^':
          if (typeof left !== 'number' || typeof right !== 'number' || ((expression.operator === '/' || expression.operator === '%') && right === 0)) return undefined;
          if (expression.operator === '+') result = left + right;
          else if (expression.operator === '-') result = left - right;
          else if (expression.operator === '*') result = left * right;
          else if (expression.operator === '/') result = left / right;
          else if (expression.operator === '%') result = left % right;
          else result = Math.pow(left, right);
          return typeof result === 'number' && Number.isFinite(result) ? result : undefined;
        case '==': return left === right;
        case '!=': return left !== right;
        case '>': case '>=': case '<': case '<=':
          if (typeof left !== 'number' || typeof right !== 'number') return undefined;
          if (expression.operator === '>') return left > right;
          if (expression.operator === '>=') return left >= right;
          if (expression.operator === '<') return left < right;
          return left <= right;
        case 'and': case 'or':
          if (typeof left !== 'boolean' || typeof right !== 'boolean') return undefined;
          return expression.operator === 'and' ? left && right : left || right;
      }
    }
    default: return undefined;
  }
}

function literalListLength(expression: V02ExpressionNode): number | undefined {
  if (expression.type === 'listLiteral') return expression.elements.length;
  if (expression.type !== 'rangeExpression') return undefined;
  const start = constantValue(expression.start);
  const end = constantValue(expression.end);
  if (typeof start !== 'number' || typeof end !== 'number'
    || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return undefined;
  const length = Math.abs(end - start) + 1;
  return Number.isSafeInteger(length) ? length : undefined;
}

export function checkDocument(doc: OpenAmxDocument, file?: string, context?: ModuleCheckContext): ModuleCheckResult {
  const types = new Map<string, TypeDeclarationNode>(context?.types ?? []);
  let bindings = new Map<string, CheckedType>(context?.bindings ?? []);
  const functions = new Map<string, FunctionDeclarationNode>(context?.functions ?? []);
  const dimensions = new Map<string, DimensionMetadata>(context?.dimensions ?? []);
  const units = new Map<string, UnitMetadata>(context?.units ?? []);
  const baseUnits = context?.baseUnits ?? new Map<string, UnitMetadata>();
  const moduleIdentity = context?.moduleIdentity ?? file ?? '<memory>';
  const immutableNames = new Set<string>([...(context?.bindings?.keys() ?? []), ...(context?.functions?.keys() ?? []), ...(context?.types?.keys() ?? []), ...(context?.dimensions?.keys() ?? []), ...(context?.units?.keys() ?? [])]);
  const inputNames = new Set<string>();
  const exportedTypes = new Map<string, TypeDeclarationNode>();
  const exportedFunctions = new Map<string, FunctionDeclarationNode>();
  const exportedBindings = new Map<string, CheckedType>();
  const exportedDimensions = new Map<string, DimensionMetadata>();
  const exportedUnits = new Map<string, UnitMetadata>();
  const exportedNames = new Set<string>();
  const views = new Map<string, TableDeclarationNode | ChartDeclarationNode>();
  let loopDepth = 0;
  let allowListMutation = true;
  const fail = (code: 'AMX3001' | 'AMX3002' | 'AMX3003' | 'AMX3004' | 'AMX3005' | 'AMX3007' | 'AMX3008' | 'AMX3009', message: string, source?: SourceLocation): never => staticError(code, message, source, file);
  const failDeclaration = (message: string, source?: SourceLocation, declarationSource?: SourceLocation): never =>
    staticError('AMX3008', message, source, file, declarationSource);

  function hasName(name: string): boolean {
    return primitives.has(name) || stdlibNames.has(name) || types.has(name) || functions.has(name)
      || bindings.has(name) || views.has(name) || dimensions.has(name) || units.has(name);
  }

  function normalizedVector(vector: Map<string, number>): ReadonlyMap<string, number> {
    return new Map([...vector.entries()].filter(([, exponent]) => exponent !== 0).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0));
  }

  function combineVectors(left: ReadonlyMap<string, number>, right: ReadonlyMap<string, number>, multiplier: number, source?: SourceLocation): ReadonlyMap<string, number> {
    const result = new Map(left);
    for (const [identity, exponent] of right) {
      const combined = (result.get(identity) ?? 0) + exponent * multiplier;
      if (!Number.isSafeInteger(combined)) failDeclaration('Dimension exponent is outside the supported integer range', source);
      if (combined === 0) result.delete(identity);
      else result.set(identity, combined);
    }
    return normalizedVector(result);
  }

  function integerExponent(expression: V02ExpressionNode): number | undefined {
    if (expression.type === 'numberLiteral' && Number.isSafeInteger(expression.value)) return expression.value;
    if (expression.type === 'unaryExpression' && expression.operator === '-' && expression.argument.type === 'numberLiteral'
      && Number.isSafeInteger(-expression.argument.value)) return -expression.argument.value;
    return undefined;
  }

  function resolveDimensionExpression(expression: V02ExpressionNode): ReadonlyMap<string, number> {
    if (expression.type === 'identifier') {
      const dimension = dimensions.get(expression.name);
      if (!dimension) return failDeclaration(`Unknown or not-yet-declared dimension '${expression.name}'`, expression.source);
      return dimension.vector;
    }
    if (expression.type === 'binaryExpression' && (expression.operator === '*' || expression.operator === '/')) {
      return combineVectors(
        resolveDimensionExpression(expression.left),
        resolveDimensionExpression(expression.right),
        expression.operator === '*' ? 1 : -1,
        expression.source
      );
    }
    if (expression.type === 'binaryExpression' && expression.operator === '^') {
      const exponent = integerExponent(expression.right);
      if (exponent === undefined) return failDeclaration('Dimension powers must be signed integer literals', expression.right.source ?? expression.source);
      const base = resolveDimensionExpression(expression.left);
      const result = new Map<string, number>();
      for (const [identity, value] of base) {
        const powered = value * exponent;
        if (!Number.isSafeInteger(powered)) failDeclaration('Dimension exponent is outside the supported integer range', expression.source);
        if (powered !== 0) result.set(identity, powered);
      }
      return normalizedVector(result);
    }
    return failDeclaration('Dimension expressions may use only visible dimensions, *, /, and integer powers', expression.source);
  }

  interface UnitExpressionValue {
    vector: ReadonlyMap<string, number>;
    scale: number;
    hasUnit: boolean;
  }

  function validateUnitScale(scale: number, source?: SourceLocation): number {
    if (!Number.isFinite(scale) || scale <= 0) failDeclaration('Unit scale must be finite and greater than zero', source);
    return scale;
  }

  function resolveUnitExpression(expression: V02ExpressionNode): UnitExpressionValue {
    if (expression.type === 'numberLiteral') {
      return { vector: new Map(), scale: validateUnitScale(expression.value, expression.source), hasUnit: false };
    }
    if (expression.type === 'identifier') {
      const unit = units.get(expression.name);
      if (!unit) return failDeclaration(`Unknown or not-yet-declared unit '${expression.name}'`, expression.source);
      return { vector: unit.vector, scale: unit.scale, hasUnit: true };
    }
    if (expression.type === 'binaryExpression' && (expression.operator === '*' || expression.operator === '/')) {
      const left = resolveUnitExpression(expression.left);
      const right = resolveUnitExpression(expression.right);
      const divide = expression.operator === '/';
      return {
        vector: combineVectors(left.vector, right.vector, divide ? -1 : 1, expression.source),
        scale: validateUnitScale(divide ? left.scale / right.scale : left.scale * right.scale, expression.source),
        hasUnit: left.hasUnit || right.hasUnit
      };
    }
    if (expression.type === 'binaryExpression' && expression.operator === '^') {
      const exponent = integerExponent(expression.right);
      if (exponent === undefined) return failDeclaration('Unit powers must be signed integer literals', expression.right.source ?? expression.source);
      const base = resolveUnitExpression(expression.left);
      const vector = new Map<string, number>();
      for (const [identity, value] of base.vector) {
        const powered = value * exponent;
        if (!Number.isSafeInteger(powered)) failDeclaration('Dimension exponent is outside the supported integer range', expression.source);
        if (powered !== 0) vector.set(identity, powered);
      }
      return {
        vector: normalizedVector(vector),
        scale: validateUnitScale(Math.pow(base.scale, exponent), expression.source),
        hasUnit: base.hasUnit
      };
    }
    return failDeclaration('Unit expressions may use only positive finite numbers, visible units, *, /, and integer powers', expression.source);
  }

  function checkDimension(statement: DimensionDeclarationNode): void {
    if (loopDepth > 0) failDeclaration('Dimension declarations may only occur at module scope', statement.source);
    if (hasName(statement.name)) failDeclaration(`Dimension '${statement.name}' conflicts with another declaration`, statement.nameSource ?? statement.source);
    const baseIdentity = statement.expression ? undefined : JSON.stringify([moduleIdentity, statement.name]);
    const vector = statement.expression
      ? resolveDimensionExpression(statement.expression)
      : new Map([[baseIdentity!, 1]]);
    const metadata: DimensionMetadata = {
      name: statement.name,
      moduleIdentity,
      declarationName: statement.name,
      ...(baseIdentity ? { baseIdentity } : {}),
      vector: normalizedVector(new Map(vector)),
      source: statement.nameSource ?? statement.source
    };
    dimensions.set(statement.name, metadata);
    if (statement.exported) {
      if (exportedNames.has(statement.name)) failDeclaration(`Duplicate export '${statement.name}'`, statement.nameSource ?? statement.source);
      exportedNames.add(statement.name);
      exportedDimensions.set(statement.name, metadata);
    }
  }

  function checkUnit(statement: UnitDeclarationNode): void {
    if (loopDepth > 0) failDeclaration('Unit declarations may only occur at module scope', statement.source);
    if (primitives.has(statement.name) || types.has(statement.name) || functions.has(statement.name)
      || bindings.has(statement.name) || views.has(statement.name) || dimensions.has(statement.name) || units.has(statement.name)) {
      failDeclaration(`Unit '${statement.name}' conflicts with another declaration`, statement.nameSource ?? statement.source);
    }
    let vector: ReadonlyMap<string, number>;
    let scale: number;
    if (statement.dimension) {
      const dimension = dimensions.get(statement.dimension);
      if (!dimension) failDeclaration(`Unknown or not-yet-declared dimension '${statement.dimension}'`, statement.dimensionSource ?? statement.source);
      if (!dimension!.baseIdentity || dimension!.vector.size !== 1 || dimension!.vector.get(dimension!.baseIdentity) !== 1) {
        failDeclaration(`Independent unit '${statement.name}' must refer to a base dimension`, statement.dimensionSource ?? statement.source, dimension!.source);
      }
      const existing = baseUnits.get(dimension!.baseIdentity!);
      if (existing) failDeclaration(`Base dimension '${statement.dimension}' already has independent unit '${existing.name}'`, statement.dimensionSource ?? statement.source, existing.source);
      vector = dimension!.vector;
      scale = 1;
    } else if (statement.expression) {
      const resolved = resolveUnitExpression(statement.expression);
      if (!resolved.hasUnit) failDeclaration('A derived unit must reference at least one visible unit', statement.expression.source);
      vector = resolved.vector;
      scale = validateUnitScale(resolved.scale, statement.expression.source);
    } else {
      return failDeclaration('Unit declaration requires a base dimension or a unit expression', statement.source);
    }
    const metadata: UnitMetadata = {
      name: statement.name,
      moduleIdentity,
      declarationName: statement.name,
      identity: JSON.stringify([moduleIdentity, statement.name]),
      vector: normalizedVector(new Map(vector)),
      scale,
      source: statement.nameSource ?? statement.source
    };
    units.set(statement.name, metadata);
    if (statement.dimension) baseUnits.set([...vector.keys()][0], metadata);
    if (statement.exported) {
      if (exportedNames.has(statement.name)) failDeclaration(`Duplicate export '${statement.name}'`, statement.nameSource ?? statement.source);
      exportedNames.add(statement.name);
      exportedUnits.set(statement.name, metadata);
    }
  }

  function reExport(statement: ExportNamesDeclarationNode): void {
    if (loopDepth > 0) failDeclaration('Re-export declarations may only occur at module scope', statement.source);
    for (const item of statement.names) {
      if (exportedNames.has(item.name)) failDeclaration(`Duplicate export '${item.name}'`, item.source);
      const dimension = context?.dimensions?.get(item.name);
      const unit = context?.units?.get(item.name);
      if (dimension) exportedDimensions.set(item.name, dimension);
      else if (unit) exportedUnits.set(item.name, unit);
      else failDeclaration(`'${item.name}' is not an explicitly imported dimension or unit`, item.source);
      exportedNames.add(item.name);
    }
  }

  function resolve(ref: TypeReferenceNode): CheckedType {
    if (ref.type === 'namedType') {
      if (!ref.name || (!primitives.has(ref.name) && !types.has(ref.name))) fail('AMX3001', `Unknown type '${ref.name}'`, ref.source);
      return named(ref.name!);
    }
    return ref.type === 'listType' ? list(resolve(ref.element!)) : nullable(resolve(ref.element!));
  }

  function requireType(actual: CheckedType, expected: CheckedType, source?: SourceLocation): void {
    if (!assignable(actual, expected)) fail('AMX3002', `Expected ${format(expected)}, got ${format(actual)}`, source);
  }

  function requireOperatorType(actual: CheckedType, expected: CheckedType, source?: SourceLocation): void {
    if (!assignable(actual, expected)) fail('AMX3007', `Expected ${format(expected)}, got ${format(actual)}`, source);
  }

  function checkDateTime(value: string): boolean {
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/);
    if (!parts) return false;
    const [, year, month, day, hour, minute, second, offset] = parts;
    const date = new Date(0);
    date.setUTCFullYear(+year, +month - 1, +day);
    if (date.getUTCFullYear() !== +year || date.getUTCMonth() !== +month - 1 || date.getUTCDate() !== +day || +hour > 23 || +minute > 59 || +second > 59) return false;
    return offset === 'Z' || (+offset.slice(1, 3) <= 23 && +offset.slice(4) <= 59);
  }

  function infer(expression: V02ExpressionNode, expected?: CheckedType): CheckedType {
    switch (expression.type) {
      case 'numberLiteral': return named('Number');
      case 'booleanLiteral': return named('Boolean');
      case 'stringLiteral':
        if (expected?.kind === 'named' && expected.name === 'DateTime') {
          if (!checkDateTime(expression.value)) fail('AMX3002', 'Invalid DateTime literal', expression.source);
          return expected;
        }
        if (expected?.kind === 'nullable' && expected.element.kind === 'named' && expected.element.name === 'DateTime') {
          if (!checkDateTime(expression.value)) fail('AMX3002', 'Invalid DateTime literal', expression.source);
          return expected.element;
        }
        return named('String');
      case 'stringInterpolation':
        for (const part of expression.parts) {
          if (typeof part === 'string') continue;
          const type = infer(part);
          const stringifiable = (value: CheckedType): boolean => value.kind === 'null'
            || (value.kind === 'named' && ['String', 'Number', 'Boolean'].includes(value.name))
            || (value.kind === 'nullable' && stringifiable(value.element));
          if (!stringifiable(type)) {
            fail('AMX3007', `Cannot interpolate a ${format(type)} value into a string`, part.source ?? expression.source);
          }
        }
        return named('String');
      case 'nullLiteral': return { kind: 'null' };
      case 'identifier': {
        const value = bindings.get(expression.name);
        if (!value) fail('AMX3001', `Unknown identifier '${expression.name}'`, expression.source);
        return value!;
      }
      case 'listLiteral': {
        const context = expected?.kind === 'nullable' ? expected.element : expected;
        const elementType = context?.kind === 'list' ? context.element : undefined;
        if (!expression.elements.length) {
          if (!elementType) fail('AMX3003', 'Empty list needs a list type', expression.source);
          return list(elementType!);
        }
        if (elementType) {
          for (const item of expression.elements) requireType(infer(item, elementType), elementType, item.source);
          return list(elementType);
        }
        let element = infer(expression.elements[0], elementType);
        if (element.kind === 'null') fail('AMX3003', 'Null list elements need a contextual element type', expression.elements[0].source);
        for (const item of expression.elements.slice(1)) {
          const next = infer(item, elementType);
          const merged = common(element, next);
          if (!merged) fail('AMX3002', 'List elements have incompatible types', item.source);
          element = merged!;
        }
        if (elementType) requireType(element, elementType, expression.source);
        return list(elementType ?? element);
      }
      case 'recordConstructor': {
        const declaration = types.get(expression.name);
        if (!declaration) fail('AMX3001', `Unknown record type '${expression.name}'`, expression.source);
        const seen = new Set<string>();
        for (const field of expression.fields) {
          if (seen.has(field.name)) fail('AMX3005', `Duplicate field '${field.name}'`, field.source);
          seen.add(field.name);
          const declared = declaration!.fields.find(item => item.name === field.name);
          if (!declared) fail('AMX3001', `Unknown field '${field.name}'`, field.source);
          const target = resolve(declared!.annotation);
          requireType(infer(field.expression, target), target, field.expression.source ?? field.source);
        }
        for (const field of declaration!.fields) {
          if (!seen.has(field.name) && !field.optional && !field.defaultExpression) fail('AMX3002', `Missing required field '${field.name}'`, expression.source);
        }
        return named(expression.name);
      }
      case 'fieldAccess': {
        const receiver = infer(expression.receiver);
        const declaration = receiver.kind === 'named' ? types.get(receiver.name) : undefined;
        if (!declaration) fail('AMX3003', 'Field access requires a non-null record', expression.source);
        const field = declaration!.fields.find(item => item.name === expression.field);
        if (!field) fail('AMX3001', `Unknown field '${expression.field}'`, expression.source);
        return resolve(field!.annotation);
      }
      case 'listAccess': {
        const receiver = infer(expression.receiver);
        if (receiver.kind !== 'list') return fail('AMX3002', `List access requires a non-null list, got ${format(receiver)}`, expression.source);
        requireType(infer(expression.index), named('Number'), expression.index.source);
        const index = constantValue(expression.index);
        if (typeof index === 'number' && (!Number.isInteger(index) || index < 1)) {
          fail('AMX3009', `List index ${index} must be a positive integer`, expression.index.source ?? expression.source);
        }
        const length = literalListLength(expression.receiver);
        if (length !== undefined && typeof index === 'number' && index > length) {
          fail('AMX3009', `List index ${index} is out of bounds for length ${length}; expected 1..${length}`, expression.index.source ?? expression.source);
        }
        return receiver.element;
      }
      case 'binaryExpression': {
        const left = infer(expression.left);
        const right = infer(expression.right, left.kind === 'named' && left.name === 'DateTime' ? left : undefined);
        if (['and', 'or'].includes(expression.operator)) {
          requireOperatorType(left, named('Boolean'), expression.left.source);
          requireOperatorType(right, named('Boolean'), expression.right.source);
        } else if (['==', '!='].includes(expression.operator)) {
          const scalar = (type: CheckedType) => type.kind === 'named' && primitives.has(type.name);
          if (!((scalar(left) && equal(left, right)) || (left.kind === 'null' && right.kind === 'nullable') || (right.kind === 'null' && left.kind === 'nullable'))) fail('AMX3003', 'Equality requires compatible scalar operands', expression.source);
        } else {
          requireOperatorType(left, named('Number'), expression.left.source);
          requireOperatorType(right, named('Number'), expression.right.source);
        }
        return ['and', 'or', '==', '!=', '>', '>=', '<', '<='].includes(expression.operator) ? named('Boolean') : named('Number');
      }
      case 'unaryExpression':
        requireOperatorType(infer(expression.argument), named(expression.operator === 'not' ? 'Boolean' : 'Number'), expression.argument.source);
        return named(expression.operator === 'not' ? 'Boolean' : 'Number');
      case 'conditionalExpression': {
        requireType(infer(expression.test), named('Boolean'), expression.test.source);
        const test = expression.test;
        const checkedName = test.type === 'binaryExpression' && ['==', '!='].includes(test.operator)
          ? test.left.type === 'identifier' && test.right.type === 'nullLiteral' ? test.left.name
            : test.right.type === 'identifier' && test.left.type === 'nullLiteral' ? test.right.name : undefined
          : undefined;
        const original = checkedName ? bindings.get(checkedName) : undefined;
        const branch = (value: V02ExpressionNode, narrowed: boolean): CheckedType => {
          if (checkedName && original?.kind === 'nullable' && narrowed) bindings.set(checkedName, original.element);
          try { return infer(value, expected); }
          finally { if (checkedName && original) bindings.set(checkedName, original); }
        };
        const nonNullInConsequent = test.type === 'binaryExpression' && test.operator === '!=';
        const consequent = branch(expression.consequent, nonNullInConsequent);
        const alternate = branch(expression.alternate, !nonNullInConsequent);
        const result = common(consequent, alternate);
        if (!result) fail('AMX3002', 'Conditional branches have incompatible types', expression.source);
        return result!;
      }
      case 'rangeExpression':
        requireType(infer(expression.start), named('Number'), expression.start.source);
        requireType(infer(expression.end), named('Number'), expression.end.source);
        return list(named('Number'));
      case 'functionCall': {
        const userFunction = functions.get(expression.callee);
        if (userFunction) {
          if (expression.arguments.length !== userFunction.parameters.length) fail('AMX3004', `Invalid arity for '${expression.callee}'`, expression.source);
          expression.arguments.forEach((argument, index) => {
            const target = resolve(userFunction.parameters[index].annotation);
            requireType(infer(argument, target), target, argument.source);
          });
          return resolve(userFunction.returnType);
        }
        const signature = signatures[expression.callee];
        if (!signature) fail('AMX3004', `Unknown function '${expression.callee}'`, expression.source);
        if (expression.arguments.length < signature.min || expression.arguments.length > signature.args.length) fail('AMX3004', `Invalid arity for '${expression.callee}'`, expression.source);
        expression.arguments.forEach((argument, index) => {
          const target = signature.args[index] === 'Number[]' ? list(named('Number')) : named('Number');
          requireType(infer(argument, target), target, argument.source);
        });
        return named('Number');
      }
      case 'matchExpression': {
        const scrutinee = infer(expression.expression);
        if (scrutinee.kind !== 'named' || !['Number', 'String', 'Boolean'].includes(scrutinee.name)) fail('AMX3003', 'Match needs a non-null scalar', expression.expression.source);
        let result: CheckedType | undefined;
        const arms = [...expression.cases.map(arm => ({ ...arm, isCase: true })),
          { expression: expression.defaultExpression, source: expression.defaultSource, isCase: false }]
          .sort((left, right) => (left.source?.line ?? 0) - (right.source?.line ?? 0) || (left.source?.column ?? 0) - (right.source?.column ?? 0));
        for (const arm of arms) {
          if (arm.isCase && 'value' in arm && !equal(infer(arm.value), scrutinee)) fail('AMX3002', 'Match case type differs from scrutinee', arm.source);
          const next = infer(arm.expression, expected);
          const merged = result ? common(result, next) : next;
          if (!merged) fail('AMX3002', 'Match arms have incompatible types', arm.source);
          result = merged;
        }
        return result!;
      }
      case 'forExpression': return checkLoop(expression.variable, expression.iterable, expression.body, expression.source, expected, false);
    }
  }

  function checkLoop(variable: string, iterable: V02ExpressionNode, body: StatementNode[], source?: SourceLocation, expected?: CheckedType, statementForm = true): CheckedType {
    const target = infer(iterable);
    if (target.kind !== 'list') fail('AMX3003', 'For loop needs a list or range', iterable.source ?? source);
    const prior = bindings.get(variable);
    const existing = new Set(bindings.keys());
    bindings.set(variable, (target as { kind: 'list'; element: CheckedType }).element);
    let returned: CheckedType | undefined;
    const previousMutationPermission = allowListMutation;
    allowListMutation = statementForm;
    loopDepth++;
    try {
      for (const statement of body) {
        if (statement.type === 'returnStatement') returned = infer(statement.expression, expected?.kind === 'list' ? expected.element : undefined);
        else checkStatement(statement);
      }
    } finally {
      loopDepth--;
      allowListMutation = previousMutationPermission;
      for (const name of bindings.keys()) if (!existing.has(name)) bindings.delete(name);
      if (prior) bindings.set(variable, prior);
      else bindings.delete(variable);
    }
    return list(returned ?? named('Number'));
  }

  function checkDefault(expression: V02ExpressionNode, target: CheckedType): void {
    if (expression.type === 'listLiteral') {
      for (const item of expression.elements) checkDefault(item, target.kind === 'list' ? target.element : target);
    } else if (expression.type === 'recordConstructor') {
      for (const field of expression.fields) {
        const declaration = types.get(expression.name);
        const declared = declaration?.fields.find(item => item.name === field.name);
        if (declared) checkDefault(field.expression, resolve(declared.annotation));
      }
    } else if (!(expression.type === 'unaryExpression' && expression.operator === '-' && expression.argument.type === 'numberLiteral')
      && !['numberLiteral', 'stringLiteral', 'booleanLiteral', 'nullLiteral'].includes(expression.type)) {
      fail('AMX3005', 'Record default must be a literal', expression.source);
    }
    requireType(infer(expression, target), target, expression.source);
  }

  function checkViewName(name: string, source?: SourceLocation, exported = false): void {
    if (loopDepth > 0) fail('AMX3005', 'Visualizations may only be declared at module top level', source);
    if (exported) fail('AMX3005', 'Visualizations cannot be exported', source);
    if (primitives.has(name) || stdlibNames.has(name) || types.has(name) || functions.has(name) || bindings.has(name) || views.has(name)) {
      fail('AMX3005', `Visualization '${name}' conflicts with another declaration`, source);
    }
    if (context?.isEntryModule === false) fail('AMX3005', 'Visualizations may only be declared in the entry module', source);
  }

  function optionsOf<T extends VisualizationOptionNode['type']>(
    view: TableDeclarationNode | ChartDeclarationNode,
    type: T
  ): Extract<VisualizationOptionNode, { type: T }>[] {
    return view.options.filter((option): option is Extract<VisualizationOptionNode, { type: T }> => option.type === type);
  }

  function oneOption<T extends VisualizationOptionNode['type']>(
    view: TableDeclarationNode | ChartDeclarationNode,
    type: T,
    description: string,
    required: boolean
  ): Extract<VisualizationOptionNode, { type: T }> | undefined {
    const found = optionsOf(view, type);
    if (found.length > 1) fail('AMX3005', `Repeated ${description} option`, found[1].source);
    if (required && found.length === 0) fail('AMX3003', `Missing ${description} option`, view.source);
    return found[0];
  }

  function viewListElement(name: string, source?: SourceLocation): { kind: 'records'; name: string } | { kind: 'numbers' } {
    const valueType = bindings.get(name);
    if (!valueType) return fail('AMX3001', `Unknown visualization binding '${name}'`, source);
    if (valueType.kind !== 'list') return fail('AMX3002', `Visualization binding '${name}' must be a list`, source);
    const element = valueType.element;
    if (element.kind === 'named' && element.name === 'Number') return { kind: 'numbers' };
    if (element.kind === 'named' && types.has(element.name)) return { kind: 'records', name: element.name };
    return fail('AMX3002', `Unsupported visualization list element type '${format(element)}'`, source);
  }

  function viewField(recordName: string, fieldName: string, source?: SourceLocation): CheckedType {
    const declaration = types.get(recordName)!;
    const field = declaration.fields.find(item => item.name === fieldName);
    if (!field) fail('AMX3001', `Unknown field '${fieldName}' on '${recordName}'`, source);
    return resolve(field!.annotation);
  }

  function isScalar(type: CheckedType): boolean {
    if (type.kind === 'named') return primitives.has(type.name);
    return type.kind === 'nullable' && type.element.kind === 'named' && primitives.has(type.element.name);
  }

  function isNumber(type: CheckedType): boolean {
    return (type.kind === 'named' && type.name === 'Number')
      || (type.kind === 'nullable' && type.element.kind === 'named' && type.element.name === 'Number');
  }

  function chartFieldOption(view: ChartDeclarationNode, role: ChartFieldOptionNode['role'], required: boolean): ChartFieldOptionNode | undefined {
    const found = optionsOf(view, 'chartFieldOption').filter(option => option.role === role);
    if (found.length > 1) fail('AMX3005', `Repeated '${role}' option`, found[1].source);
    if (required && found.length === 0) fail('AMX3003', `Missing '${role}' option`, view.source);
    return found[0];
  }

  function checkTable(view: TableDeclarationNode): void {
    checkViewName(view.name, view.source, view.exported);
    oneOption(view, 'viewTitleOption', 'title', true);
    const columns = optionsOf(view, 'tableColumnOption');
    if (columns.length === 0) fail('AMX3003', 'Table requires at least one column', view.source);
    const allowed = new Set<VisualizationOptionNode['type']>(['viewTitleOption', 'tableColumnOption']);
    const unsupported = view.options.find(option => !allowed.has(option.type));
    if (unsupported) fail('AMX3003', 'Option is not valid for a table', unsupported.source);
    const input = viewListElement(view.binding, view.bindingSource);
    if (input.kind !== 'records') return fail('AMX3002', 'Tables require a list of records', view.bindingSource);
    const fields = new Set<string>();
    for (const column of columns) {
      if (fields.has(column.field)) fail('AMX3005', `Repeated table field '${column.field}'`, column.fieldSource);
      fields.add(column.field);
      const fieldType = viewField(input.name, column.field, column.fieldSource);
      if (!isScalar(fieldType)) fail('AMX3002', `Table column '${column.field}' must have a scalar field type`, column.fieldSource);
    }
    views.set(view.name, view);
  }

  function checkChart(view: ChartDeclarationNode): void {
    checkViewName(view.name, view.source, view.exported);
    oneOption(view, 'viewTitleOption', 'title', true);
    oneOption(view, 'viewDescriptionOption', 'description', true);
    const allowed: Set<VisualizationOptionNode['type']> = new Set(['viewTitleOption', 'viewDescriptionOption', 'chartFieldOption', 'chartSeriesOption']);
    const unsupported = view.options.find(option => !allowed.has(option.type));
    if (unsupported) fail('AMX3003', 'Option is not valid for a chart', unsupported.source);
    const input = viewListElement(view.binding, view.bindingSource);
    const fields = optionsOf(view, 'chartFieldOption');
    const series = optionsOf(view, 'chartSeriesOption');
    const seenRoles = new Set<string>();
    for (const field of fields) {
      if (seenRoles.has(field.role)) fail('AMX3005', `Repeated '${field.role}' option`, field.source);
      seenRoles.add(field.role);
    }

    if (input.kind === 'numbers') {
      if (view.kind === 'scatter') fail('AMX3002', 'Scatter charts require a list of records', view.bindingSource);
      if (fields.some(field => field.role !== 'labels')) fail('AMX3003', `Field options are not valid for ${view.kind} charts with Number[] data`, fields.find(field => field.role !== 'labels')?.source);
      if (series.length !== 1 || series[0].field) fail('AMX3003', `${view.kind} charts with Number[] data require exactly one scalar series label`, series[1]?.source ?? view.source);
      const labels = chartFieldOption(view, 'labels', false);
      if (labels) {
        const labelType = bindings.get(labels.field);
        if (!labelType) fail('AMX3001', `Unknown labels binding '${labels.field}'`, labels.fieldSource);
        if (labelType!.kind !== 'list' || labelType!.element.kind !== 'named' || labelType!.element.name !== 'String') {
          fail('AMX3002', 'Chart labels must bind a String[] value', labels.fieldSource);
        }
      }
      views.set(view.name, view);
      return;
    }

    if (view.kind === 'scatter') {
      const x = chartFieldOption(view, 'x', true)!;
      const y = chartFieldOption(view, 'y', true)!;
      const group = chartFieldOption(view, 'group', false);
      if (fields.some(field => field.role === 'category' || field.role === 'labels')) fail('AMX3003', 'Scatter charts do not accept category or labels', fields.find(field => field.role === 'category' || field.role === 'labels')?.source);
      if (series.length) fail('AMX3003', 'Scatter charts do not accept series options', series[0].source);
      for (const axis of [x, y]) if (!isNumber(viewField(input.name, axis.field, axis.fieldSource))) fail('AMX3002', `Scatter axis '${axis.role}' must bind a Number field`, axis.fieldSource);
      if (group && viewField(input.name, group.field, group.fieldSource).kind !== 'named') fail('AMX3002', 'Scatter group must bind a non-null String field', group.fieldSource);
      if (group && !equal(viewField(input.name, group.field, group.fieldSource), named('String'))) fail('AMX3002', 'Scatter group must bind a non-null String field', group.fieldSource);
      views.set(view.name, view);
      return;
    }

    const requiredRole = view.kind === 'line' ? 'x' : 'category';
    const forbidden = fields.find(field => field.role !== requiredRole);
    if (forbidden) fail('AMX3003', `Option '${forbidden.role}' is not valid for ${view.kind} charts`, forbidden.source);
    if (input.kind === 'records') {
      const role = chartFieldOption(view, requiredRole, true)!;
      const roleType = viewField(input.name, role.field, role.fieldSource);
      if (view.kind === 'line') {
        if (!(equal(roleType, named('Number')) || equal(roleType, named('DateTime')))) fail('AMX3002', 'Line chart x must bind a Number or DateTime field', role.fieldSource);
      } else if (!isScalar(roleType) || roleType.kind === 'nullable') {
        fail('AMX3002', 'Bar/column category must bind a non-null scalar field', role.fieldSource);
      }
      if (series.length === 0 || series.some(item => !item.field)) fail('AMX3003', `${view.kind} charts with record data require field series`, view.source);
      const seenSeries = new Set<string>();
      for (const item of series) {
        if (seenSeries.has(item.field!)) fail('AMX3005', `Repeated chart series field '${item.field}'`, item.fieldSource);
        seenSeries.add(item.field!);
        if (!isNumber(viewField(input.name, item.field!, item.fieldSource))) fail('AMX3002', 'Chart series must bind a Number field', item.fieldSource);
      }
      views.set(view.name, view);
      return;
    }
    fail('AMX3003', `Unsupported ${view.kind} chart data shape`, view.bindingSource);
  }

  function checkStatement(statement: StatementNode): void {
    switch (statement.type) {
      case 'importDeclaration':
        return;
      case 'exportNamesDeclaration':
        reExport(statement);
        return;
      case 'dimensionDeclaration':
        checkDimension(statement);
        return;
      case 'unitDeclaration':
        checkUnit(statement);
        return;
      case 'inputDeclaration': {
        if (hasName(statement.name)) {
          fail('AMX3005', `Input '${statement.name}' collides with another declaration`, statement.source);
        }
        bindings.set(statement.name, resolve(statement.annotation));
        immutableNames.add(statement.name);
        inputNames.add(statement.name);
        return;
      }
      case 'typeDeclaration': {
        if (hasName(statement.name)) fail('AMX3005', `Duplicate type '${statement.name}'`, statement.source);
        const fields = new Set<string>();
        for (const field of statement.fields) {
          if (fields.has(field.name)) fail('AMX3005', `Duplicate field '${field.name}'`, field.source);
          fields.add(field.name);
          const target = resolve(field.annotation);
          if (field.optional && !field.defaultExpression && target.kind !== 'nullable') fail('AMX3005', `Optional field '${field.name}' needs a nullable type or default`, field.source);
        }
        types.set(statement.name, statement);
        for (const field of statement.fields) if (field.defaultExpression) checkDefault(field.defaultExpression, resolve(field.annotation));
        if (statement.exported) exportedTypes.set(statement.name, statement);
        return;
      }
      case 'functionDeclaration': {
        if (hasName(statement.name)) fail('AMX3005', `Duplicate declaration '${statement.name}'`, statement.source);
        if (stdlibNames.has(statement.name)) fail('AMX3005', `Function '${statement.name}' cannot shadow a standard-library function`, statement.source);
        const paramNames = new Set<string>();
        const paramScope = new Map<string, CheckedType>();
        for (const parameter of statement.parameters) {
          if (paramNames.has(parameter.name)) fail('AMX3005', `Duplicate parameter '${parameter.name}'`, parameter.source);
          paramNames.add(parameter.name);
          paramScope.set(parameter.name, resolve(parameter.annotation));
        }
        const returnType = resolve(statement.returnType);
        if (bodyContainsForExpression(statement.body)) fail('AMX3003', 'Function bodies cannot contain a for expression', statement.body.source ?? statement.source);
        const outerBindings = bindings;
        bindings = paramScope;
        try {
          const actual = infer(statement.body, returnType);
          requireType(actual, returnType, statement.body.source ?? statement.source);
        } finally {
          bindings = outerBindings;
        }
        functions.set(statement.name, statement);
        if (statement.exported) exportedFunctions.set(statement.name, statement);
        return;
      }
      case 'variableDeclaration': {
        if (types.has(statement.name) || functions.has(statement.name) || views.has(statement.name) || dimensions.has(statement.name) || units.has(statement.name)) fail('AMX3005', `Binding '${statement.name}' conflicts with another declaration`, statement.source);
        if (inputNames.has(statement.name)) fail('AMX3005', `Binding '${statement.name}' conflicts with an input`, statement.source);
        if (immutableNames.has(statement.name)) moduleError('AMX5002', `Cannot redeclare imported binding '${statement.name}'`, statement.source, file);
        const target = statement.annotation ? resolve(statement.annotation) : bindings.get(statement.name);
        const actual = infer(statement.expression, target);
        if (!target && actual.kind === 'null') fail('AMX3002', 'Null needs a nullable type annotation', statement.expression.source);
        if (target) requireType(actual, target, statement.expression.source ?? statement.source);
        const finalType = target ?? actual;
        bindings.set(statement.name, finalType);
        if (statement.exported) exportedBindings.set(statement.name, finalType);
        return;
      }
      case 'assignmentStatement': case 'compoundAssignmentStatement': {
        if (views.has(statement.name)) fail('AMX3005', `Cannot assign to immutable visualization '${statement.name}'`, statement.source);
        if (inputNames.has(statement.name)) fail('AMX3005', `Cannot assign to immutable input '${statement.name}'`, statement.source);
        if (immutableNames.has(statement.name)) moduleError('AMX5002', `Cannot assign to imported binding '${statement.name}'`, statement.source, file);
        const target = bindings.get(statement.name);
        if (!target) fail('AMX3001', `Unknown identifier '${statement.name}'`, statement.source);
        if (statement.type === 'compoundAssignmentStatement') requireType(target!, named('Number'), statement.source);
        requireType(infer(statement.expression, target), target!, statement.expression.source ?? statement.source);
        return;
      }
      case 'addStatement': case 'removeStatement': {
        if (!allowListMutation) fail('AMX3003', 'List mutations are not allowed in expression-form loops', statement.source);
        const target = bindings.get(statement.name);
        if (!target) return fail('AMX3001', `Unknown identifier '${statement.name}'`, statement.targetSource ?? statement.source);
        if (target.kind !== 'list') return fail('AMX3002', `Mutation target '${statement.name}' must be a list`, statement.targetSource ?? statement.source);
        if (statement.type === 'addStatement') {
          requireType(infer(statement.value, target.element), target.element, statement.value.source ?? statement.source);
          if (statement.index) {
            requireType(infer(statement.index), named('Number'), statement.index.source);
            const index = constantValue(statement.index);
            if (typeof index === 'number' && (!Number.isInteger(index) || index < 1)) {
              fail('AMX3009', `Insertion position ${index} must be a positive integer`, statement.index.source);
            }
          }
        } else {
          requireType(infer(statement.count), named('Number'), statement.count.source);
          const count = constantValue(statement.count);
          if (typeof count === 'number' && (!Number.isInteger(count) || count < 1)) {
            fail('AMX3009', `Removal count ${count} must be a positive integer`, statement.count.source);
          }
          if (statement.index) {
            requireType(infer(statement.index), named('Number'), statement.index.source);
            const index = constantValue(statement.index);
            if (typeof index === 'number' && (!Number.isInteger(index) || index < 1)) {
              fail('AMX3009', `Removal position ${index} must be a positive integer`, statement.index.source);
            }
          }
        }
        return;
      }
      case 'tableDeclaration': checkTable(statement); return;
      case 'chartDeclaration': checkChart(statement); return;
      case 'showStatement':
        if (loopDepth > 0) fail('AMX3005', 'Show statements may only occur at module top level', statement.source);
        if (context?.isEntryModule === false) fail('AMX3005', 'Show statements may only occur in the entry module', statement.source);
        if (!views.has(statement.name)) fail('AMX3001', `Unknown or not-yet-declared visualization '${statement.name}'`, statement.nameSource ?? statement.source);
        return;
      case 'forStatement': checkLoop(statement.variable, statement.iterable, statement.body, statement.source, undefined, true); return;
      case 'returnStatement': fail('AMX3003', 'Return outside expression loop', statement.source);
    }
  }

  let sawNonImport = false;
  let sawInput = false;
  let sawOtherItem = false;
  for (const node of doc.nodes) {
    if (node.type !== 'executableCodeBlock') continue;
    for (const statement of node.statements) {
      if (statement.type === 'importDeclaration') {
        if (sawNonImport) fail('AMX3005', 'Import declarations must precede all other executable items', statement.source);
      } else if (statement.type === 'inputDeclaration') {
        if (sawOtherItem) fail('AMX3005', 'Input declarations must precede other executable items', statement.source);
        sawInput = true;
        sawNonImport = true;
      } else {
        sawOtherItem = true;
        sawNonImport = true;
      }
      checkStatement(statement);
    }
  }

  return {
    exportedTypes,
    exportedFunctions,
    exportedBindings,
    bindingTypes: new Map(bindings),
    exportedDimensions,
    exportedUnits,
    dimensions,
    units
  };
}