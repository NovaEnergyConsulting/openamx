import {
  ChartDeclarationNode,
  ChartFieldOptionNode,
  ChartSeriesOptionNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  ConditionalExpressionNode,
  BracedIfExpressionNode,
  BracedIfStatementNode,
  ListLiteralNode,
  FunctionCallNode,
  V02ExpressionNode,
  ForExpressionNode,
  ForStatementNode,
  RangeExpressionNode,
  MatchExpressionNode,
  RecordFieldNode,
  StatementNode,
  SourceLocation,
  TypeReferenceNode,
  ListAccessNode,
  AddStatementNode,
  RemoveStatementNode
} from '../ast/types';
import { inputError, staticError, throwInputErrors, throwInvalidLoopIterable, throwInvalidRangeBounds, throwInvalidReturnContext, throwListOperationError, throwMeasurementDomainError } from '../diagnostics/errors';
import { ChartViewEmission, Environment, ViewDataValue, ViewEmission } from './environment';
import { evaluateStandardLibraryCall } from './standardLibrary';
import type { CheckedType } from '../typechecker/checkDocument';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
import { fieldRegistry } from '../typechecker/declarationRegistry';
import { canonicalUnit, composeUnits, isMeasurement, measurement, powerUnit, sqrtMeasurement, unitFromMetadata, type MeasurementUnit, type MeasurementValue } from './measurement';

function validateRuntimeValue(
  value: unknown,
  expected: CheckedType,
  env: Environment,
  source: SourceLocation | undefined,
  file: string | undefined,
  valuePath: string
): void {
  const diagnostics: ReturnType<typeof inputError>[] = [];
  const report = (message: string, target: CheckedType, actual: unknown, dataPath: string, fieldSource?: SourceLocation): void => {
    const diagnostic = inputError('AMX4003', message, {
      file,
      line: source?.line,
      column: source?.column,
      dataPath,
      expected: formatCheckedType(target),
      actual: runtimeDescription(actual),
      fieldSource
    });
    diagnostics.push(diagnostic);
    if (env.validationMode === 'fail-fast') throwInputErrors([diagnostic]);
  };
  const visit = (actual: unknown, target: CheckedType, dataPath: string, fieldSource?: SourceLocation): void => {
    if (target.kind === 'null') {
      if (actual !== null) report('Expected null', target, actual, dataPath, fieldSource);
      return;
    }
    if (target.kind === 'nullable') {
      if (actual !== null) visit(actual, target.element, dataPath, fieldSource);
      return;
    }
    if (target.kind === 'list') {
      if (!Array.isArray(actual)) {
        report('Expected a list value', target, actual, dataPath, fieldSource);
        return;
      }
      actual.forEach((item, index) => visit(item, target.element, `${dataPath}[${index}]`, fieldSource));
      return;
    }
    if (target.kind === 'measurement') {
      if (!isMeasurement(actual)) {
        report('Expected a measurement value', target, actual, dataPath, fieldSource);
        return;
      }
      const vector = actual.unit.vector;
      if (Object.keys(vector).length !== target.vector.size
        || [...target.vector].some(([identity, exponent]) => vector[identity] !== exponent)) {
        report('Measurement dimension does not match the declared dimension', target, actual, dataPath, fieldSource);
      }
      if (!Number.isFinite(actual.value) || !Number.isFinite(actual.value * actual.unit.scale)) {
        report('Measurement value must be finite', target, actual, dataPath, fieldSource);
      }
      return;
    }
    if (target.kind !== 'named') return;
    if (target.name === 'Number') {
      if (typeof actual !== 'number' || !Number.isFinite(actual)) report('Expected a finite Number value', target, actual, dataPath, fieldSource);
      return;
    }
    if (target.name === 'String' || target.name === 'DateTime') {
      if (typeof actual !== 'string') report(`Expected a ${target.name} value`, target, actual, dataPath, fieldSource);
      else if (target.name === 'DateTime' && !validDateTime(actual)) report('Invalid RFC 3339 DateTime value', target, actual, dataPath, fieldSource);
      return;
    }
    if (target.name === 'Boolean') {
      if (typeof actual !== 'boolean') report('Expected a Boolean value', target, actual, dataPath, fieldSource);
      return;
    }
    const declaration = env.recordTypes.get(target.name);
    if (!declaration || typeof actual !== 'object' || actual === null || Array.isArray(actual)) {
      report(`Expected a ${target.name} record`, target, actual, dataPath, fieldSource);
      return;
    }
    const record = actual as Record<string, unknown>;
    const fieldNames = new Set(declaration.fields.map(field => field.name));
    for (const field of declaration.fields) {
      const fieldScope = fieldRegistry(field, env.dimensionRegistry);
      if (!Object.prototype.hasOwnProperty.call(record, field.name)) {
        report(`Missing computed field '${field.name}'`, checkedType(field.annotation, fieldScope), 'missing', `${dataPath}.${field.name}`, field.source);
      } else {
        visit(record[field.name], checkedType(field.annotation, fieldScope), `${dataPath}.${field.name}`, field.source);
      }
    }
    for (const name of Object.keys(record).filter(name => !fieldNames.has(name)).sort()) {
      report(`Unknown computed field '${name}'`, target, record[name], `${dataPath}.${name}`, fieldSource);
    }
  };
  visit(value, expected, valuePath);
  if (diagnostics.length) throwInputErrors(diagnostics);
}

function evaluateFieldDefault(field: RecordFieldNode, env: Environment, file?: string): unknown {
  if (!field.defaultExpression) return null;
  const currentRegistry = env.dimensionRegistry;
  env.dimensionRegistry = fieldRegistry(field, currentRegistry);
  try {
    return evaluateExpression(field.defaultExpression, env, file);
  } finally {
    env.dimensionRegistry = currentRegistry;
  }
}

function checkedType(reference: TypeReferenceNode, scope?: Environment | DimensionUnitRegistry): CheckedType {
  const registry = scope instanceof Environment ? scope.dimensionRegistry : scope;
  if (reference.type === 'namedType') {
    const dimension = registry?.dimensions.get(reference.name!);
    return dimension ? { kind: 'measurement', vector: dimension.vector } : { kind: 'named', name: reference.name! };
  }
  const element = checkedType(reference.element!, registry);
  return reference.type === 'listType' ? { kind: 'list', element } : { kind: 'nullable', element };
}

function formatCheckedType(type: CheckedType): string {
  if (type.kind === 'named') return type.name;
  if (type.kind === 'measurement') return 'measurement';
  if (type.kind === 'null') return 'null';
  return type.kind === 'list' ? `${formatCheckedType(type.element)}[]` : `${formatCheckedType(type.element)}?`;
}

function runtimeDescription(value: unknown): string {
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  let description: string;
  try { description = JSON.stringify(value) ?? String(value); } catch { description = String(value); }
  return description.replace(/[\x00-\x1f\x7f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`).slice(0, 160);
}

function sameMeasurementVector(value: MeasurementValue, vector: ReadonlyMap<string, number>): boolean {
  return Object.keys(value.unit.vector).length === vector.size
    && [...vector].every(([identity, exponent]) => value.unit.vector[identity] === exponent);
}

function validDateTime(value: string): boolean {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/);
  if (!parts) return false;
  const [, year, month, day, hour, minute, second, offset] = parts;
  const date = new Date(0);
  date.setUTCFullYear(+year, +month - 1, +day);
  return date.getUTCFullYear() === +year && date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day
    && +hour <= 23 && +minute <= 59 && +second <= 59
    && (offset === 'Z' || (+offset.slice(1, 3) <= 23 && +offset.slice(4) <= 59));
}

/** Evaluate V0.2 expressions, including ranges and expression-form loops. */
export function evaluateExpression(
  node: V02ExpressionNode,
  env: Environment,
  file?: string
): unknown {
  switch (node.type) {
    case 'nullLiteral':
      return null;

    case 'recordConstructor': {
      const declaration = env.recordTypes.get(node.name);
      if (!declaration) throw new Error(`Unknown record type '${node.name}'`);
      const supplied = new Map(node.fields.map(field => [field.name, evaluateExpression(field.expression, env, file)]));
      const record: Record<string, unknown> = {};
      for (const field of declaration.fields) {
        record[field.name] = supplied.has(field.name) ? supplied.get(field.name)
          : field.defaultExpression ? evaluateFieldDefault(field, env, file) : null;
      }
      validateRuntimeValue(record, { kind: 'named', name: node.name }, env, node.source, file, `record ${node.name}`);
      return record;
    }

    case 'fieldAccess': {
      if (node.receiver.type === 'identifier') {
        const enumeration = env.enumValues.get(node.receiver.name);
        if (enumeration) return enumeration[node.field];
      }
      return (evaluateExpression(node.receiver, env, file) as Record<string, unknown>)[node.field];
    }

    case 'listAccess':
      return evalListAccess(node, env, file);

    case 'numberLiteral':
      return node.value;

    case 'stringLiteral':
      return node.value;

    case 'stringInterpolation':
      return node.parts.map(part => {
        if (typeof part === 'string') return part;
        const value = evaluateExpression(part, env, file);
        if (value === null) return 'null';
        if (typeof value === 'string' || typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (isMeasurement(value)) return `${String(value.value)} ${value.unit.text}`;
        return staticError('AMX3007', 'Only String, Number, Boolean, measurement, and null values can be interpolated', part.source, file);
      }).join('');

    case 'booleanLiteral':
      return node.value;

    case 'identifier':
      // Pass source location for better diagnostics
      return env.get(node.name, node.source, file);

    case 'measurementAttachment': {
      const value = evaluateExpression(node.value, env, file);
      const unit = env.dimensionRegistry?.units.get(node.unit);
      if (!unit) return staticError('AMX3008', `Unknown or invisible unit '${node.unit}'`, node.unitSource ?? node.source, file);
      if (typeof value !== 'number') return staticError('AMX3007', 'Unit attachment requires a Number expression', node.source, file);
      const result = measurement(value, unitFromMetadata(unit));
      if (!Number.isFinite(result.value * result.unit.scale)) {
        throwMeasurementDomainError('Measurement physical value must be finite', node.source, file);
      }
      return result;
    }

    case 'measurementConversion': {
      const value = evaluateExpression(node.value, env, file);
      const unit = env.dimensionRegistry?.units.get(node.unit);
      if (!unit) return staticError('AMX3008', `Unknown or invisible unit '${node.unit}'`, node.unitSource ?? node.source, file);
      if (!isMeasurement(value) || !sameMeasurementVector(value, unit.vector)) {
        return staticError('AMX3007', `Cannot convert value to unit '${node.unit}'`, node.source, file);
      }
      const converted = value.value * value.unit.scale / unit.scale;
      if (!Number.isFinite(converted)) throwMeasurementDomainError('Converted measurement value must be finite', node.source, file);
      return measurement(converted, unitFromMetadata(unit));
    }

    case 'binaryExpression':
      return evalBinary(node as BinaryExpressionNode, env, file);

    case 'unaryExpression':
      return evalUnary(node as UnaryExpressionNode, env, file);

    case 'conditionalExpression':
      return evalConditional(node as ConditionalExpressionNode, env, file);

    case 'bracedIfExpression':
      return evalBracedIfExpression(node as BracedIfExpressionNode, env, file);

    case 'listLiteral':
      return evalListLiteral(node as ListLiteralNode, env, file);

    case 'functionCall':
      return evalFunctionCall(node as FunctionCallNode, env, file);

    case 'rangeExpression':
      return evalRange(node as RangeExpressionNode, env, file);

    case 'forExpression':
      return evalForExpression(node as ForExpressionNode, env, file);

    case 'matchExpression':
      return evalMatch(node, env, file);

    default: {
      // Exhaustiveness check: if a new node type is added without a case, this will fail to compile.
      const _exhaustive: never = node;
      throw new Error(`Unsupported expression node type: ${_exhaustive}`);
    }
  }
}

function evalMatch(node: MatchExpressionNode, env: Environment, file?: string): unknown {
  const value = evaluateExpression(node.expression, env, file);
  for (const arm of node.cases) {
    if (value === arm.value.value) return evaluateExpression(arm.expression, env, file);
  }
  return evaluateExpression(node.defaultExpression, env, file);
}

function evalBinary(
  node: BinaryExpressionNode,
  env: Environment,
  file?: string
): unknown {
  const left = evaluateExpression(node.left, env, file);
  const right = evaluateExpression(node.right, env, file);
  const operatorSource = node.operatorSource ?? node.source;

  switch (node.operator) {
    // Arithmetic (numeric)
    case '+':
    case '-': {
      if (isMeasurement(left) || isMeasurement(right)) {
        if (!isMeasurement(left) || !isMeasurement(right) || !sameMeasurementVector(left, new Map(Object.entries(right.unit.vector)))) {
          return staticError('AMX3007', 'Addition and subtraction require compatible measurements', operatorSource, file);
        }
        const physicalLeft = left.value * left.unit.scale;
        const physicalRight = right.value * right.unit.scale;
        const physical = node.operator === '+' ? physicalLeft + physicalRight : physicalLeft - physicalRight;
        const value = physical / left.unit.scale;
        if (!Number.isFinite(value) || !Number.isFinite(physical)) {
          throwMeasurementDomainError('Measurement arithmetic result must be finite', operatorSource, file);
        }
        return measurement(value, left.unit);
      }
      const lNum = toNumber(left, node.left);
      const rNum = toNumber(right, node.right);
      return node.operator === '+' ? lNum + rNum : lNum - rNum;
    }
    case '*':
    case '/': {
      if (isMeasurement(left) || isMeasurement(right)) {
        const numberUnit: MeasurementUnit = { scale: 1, vector: {}, factors: [], text: '1' };
        const leftMeasurement = isMeasurement(left) ? left : undefined;
        const rightMeasurement = isMeasurement(right) ? right : undefined;
        const leftValue = leftMeasurement ? leftMeasurement.value : toNumber(left, node.left);
        const rightValue = rightMeasurement ? rightMeasurement.value : toNumber(right, node.right);
        const leftUnit = leftMeasurement?.unit ?? numberUnit;
        const rightUnit = rightMeasurement?.unit ?? numberUnit;
        const rightPhysical = rightValue * rightUnit.scale;
        if (node.operator === '/' && rightPhysical === 0) {
          throwMeasurementDomainError('Measurement division by zero', operatorSource, file);
        }
        const unit = composeUnits(leftUnit, rightUnit, node.operator === '/');
        const physical = node.operator === '/'
          ? leftValue * leftUnit.scale / rightPhysical
          : leftValue * leftUnit.scale * rightValue * rightUnit.scale;
        if (unit.vector && Object.keys(unit.vector).length === 0) {
          if (!Number.isFinite(physical)) throwMeasurementDomainError('Measurement arithmetic result must be finite', operatorSource, file);
          return physical;
        }
        const value = node.operator === '/' ? leftValue / rightValue : leftValue * rightValue;
        if (!Number.isFinite(unit.scale) || unit.scale <= 0 || !Number.isFinite(value) || !Number.isFinite(physical)) {
          throwMeasurementDomainError('Measurement arithmetic result must be finite', operatorSource, file);
        }
        return measurement(value, unit);
      }
      const lNum = toNumber(left, node.left);
      const rNum = toNumber(right, node.right);
      return node.operator === '*' ? lNum * rNum : lNum / rNum;
    }
    case '%': {
      const lNum = toNumber(left, node.left);
      const rNum = toNumber(right, node.right);
      return lNum % rNum;
    }
    case '^': {
      if (isMeasurement(left)) {
        const exponent = toNumber(right, node.right);
        if (!Number.isSafeInteger(exponent)) {
          return staticError('AMX3007', 'A dimensional power exponent must be an integer literal', node.right.source, file);
        }
        if (left.value === 0 && exponent < 0) {
          throwMeasurementDomainError('Zero measurement cannot be raised to a negative power', operatorSource, file);
        }
        const unit = powerUnit(left.unit, exponent);
        const value = Math.pow(left.value, exponent);
        if (!Number.isFinite(value) || !Number.isFinite(unit.scale)) {
          throwMeasurementDomainError('Measurement power result must be finite', operatorSource, file);
        }
        if (Object.keys(unit.vector).length === 0) return value * unit.scale;
        return measurement(value, unit);
      }
      const lNum = toNumber(left, node.left);
      const rNum = toNumber(right, node.right);
      return Math.pow(lNum, rNum);
    }

    // Comparisons (produce boolean)
    case '==':
      if (isMeasurement(left) && isMeasurement(right)) {
        return sameMeasurementVector(left, new Map(Object.entries(right.unit.vector)))
          && left.value * left.unit.scale === right.value * right.unit.scale;
      }
      return left === right;
    case '!=':
      if (isMeasurement(left) && isMeasurement(right)) {
        return !sameMeasurementVector(left, new Map(Object.entries(right.unit.vector)))
          || left.value * left.unit.scale !== right.value * right.unit.scale;
      }
      return left !== right;
    case '>':
      if (isMeasurement(left) && isMeasurement(right)) return left.value * left.unit.scale > right.value * right.unit.scale;
      return toNumber(left, node.left) > toNumber(right, node.right);
    case '>=':
      if (isMeasurement(left) && isMeasurement(right)) return left.value * left.unit.scale >= right.value * right.unit.scale;
      return toNumber(left, node.left) >= toNumber(right, node.right);
    case '<':
      if (isMeasurement(left) && isMeasurement(right)) return left.value * left.unit.scale < right.value * right.unit.scale;
      return toNumber(left, node.left) < toNumber(right, node.right);
    case '<=':
      if (isMeasurement(left) && isMeasurement(right)) return left.value * left.unit.scale <= right.value * right.unit.scale;
      return toNumber(left, node.left) <= toNumber(right, node.right);

    // Logical (short-circuit not required for simple impl; evaluate both then apply)
    case 'and':
      return toBoolean(left) && toBoolean(right);
    case 'or':
      return toBoolean(left) || toBoolean(right);

    default:
      throw new Error(`Unsupported binary operator: ${node.operator}`);
  }
}

function evalUnary(
  node: UnaryExpressionNode,
  env: Environment,
  file?: string
): unknown {
  const arg = evaluateExpression(node.argument, env, file);

  if (node.operator === '-') {
    if (isMeasurement(arg)) return measurement(-arg.value, arg.unit);
    return -toNumber(arg, node.argument);
  }
  if (node.operator === 'not') {
    return !toBoolean(arg);
  }

  throw new Error(`Unsupported unary operator: ${node.operator}`);
}

function evalConditional(
  node: ConditionalExpressionNode,
  env: Environment,
  file?: string
): unknown {
  const testVal = evaluateExpression(node.test, env, file);
  return toBoolean(testVal)
    ? evaluateExpression(node.consequent, env, file)
    : evaluateExpression(node.alternate, env, file);
}

class ConditionalValueReturn {
  constructor(readonly value: unknown) {}
}

class ForExpressionReturn {
  constructor(readonly value: unknown) {}
}

const conditionalReturnDepth = new WeakMap<Environment, number>();
const forExpressionDepth = new WeakMap<Environment, number>();

function withDepth<T>(depths: WeakMap<Environment, number>, env: Environment, run: () => T): T {
  depths.set(env, (depths.get(env) ?? 0) + 1);
  try {
    return run();
  } finally {
    const depth = depths.get(env)! - 1;
    if (depth) depths.set(env, depth);
    else depths.delete(env);
  }
}

function evaluateScopedStatements(statements: StatementNode[], env: Environment, file?: string): void {
  const existing = new Set(Object.keys(env.toObject()));
  try {
    evaluateStatements(statements, env, file);
  } finally {
    for (const name of Object.keys(env.toObject())) {
      if (!existing.has(name)) env.delete(name);
    }
  }
}

function evalBracedIfExpression(node: BracedIfExpressionNode, env: Environment, file?: string): unknown {
  const branch = toBoolean(evaluateExpression(node.test, env, file)) ? node.consequent : node.alternate;
  const closingSource = branch === node.consequent ? node.consequentSource : node.alternateSource;
  try {
    withDepth(conditionalReturnDepth, env, () => evaluateScopedStatements(branch, env, file));
  } catch (error) {
    if (error instanceof ConditionalValueReturn) return error.value;
    throw error;
  }
  return staticError('AMX3021', 'Every possible path in an if expression must return a value', closingSource ?? node.source, file);
}

function evalListLiteral(
  node: ListLiteralNode,
  env: Environment,
  file?: string
): unknown[] {
  return node.elements.map(el => evaluateExpression(el, env, file));
}

function evalListAccess(node: ListAccessNode, env: Environment, file?: string): unknown {
  const receiver = evaluateExpression(node.receiver, env, file);
  const index = evaluateExpression(node.index, env, file);
  if (!Array.isArray(receiver)) {
    throwListOperationError('List access requires a list value', node.source, file);
  }
  if (typeof index !== 'number' || !Number.isFinite(index) || !Number.isInteger(index) || index < 1) {
    throwListOperationError(`List index must be a positive integer; got ${runtimeDescription(index)}`, node.index.source ?? node.source, file);
  }
  if (index > receiver.length) {
    throwListOperationError(`List index ${index} is out of bounds for length ${receiver.length}; expected 1..${receiver.length}`, node.index.source ?? node.source, file);
  }
  return receiver[index - 1];
}

function evalFunctionCall(
  node: FunctionCallNode,
  env: Environment,
  file?: string
): unknown {
  const args = node.arguments.map(a => evaluateExpression(a, env, file));
  const userFunction = env.functions.get(node.callee);
  if (userFunction) {
    const functionRegistry = fieldRegistry(userFunction, env.dimensionRegistry);
    const parameters: Record<string, unknown> = {};
    userFunction.parameters.forEach((parameter, index) => {
      validateRuntimeValue(args[index], checkedType(parameter.annotation, functionRegistry), env, node.arguments[index]?.source ?? node.source, file, `function ${node.callee}.${parameter.name}`);
      parameters[parameter.name] = args[index];
    });
    const frame = env.createCallFrame(parameters);
    frame.dimensionRegistry = functionRegistry;
    userFunction.parameters.forEach(parameter => {
      frame.bindingTypes.set(parameter.name, checkedType(parameter.annotation, functionRegistry));
    });
    const result = evaluateExpression(userFunction.body, frame, file);
    validateRuntimeValue(result, checkedType(userFunction.returnType, functionRegistry), env, node.source, file, `function ${node.callee} return`);
    return result;
  }
  const values = args[0];
  if (['sum', 'mean', 'min', 'max'].includes(node.callee) && Array.isArray(values)
    && (values.length > 0 && isMeasurement(values[0]))) {
    const measurements = values as MeasurementValue[];
    const first = measurements[0];
    for (const current of measurements) {
      if (!sameMeasurementVector(first, new Map(Object.entries(current.unit.vector)))) {
        return staticError('AMX3007', `${node.callee} requires compatible measurement dimensions`, node.source, file);
      }
      if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'number'
        && ['sum', 'mean', 'min', 'max'].includes(node.callee)) {
        return evaluateStandardLibraryCall(node.callee, args, node.source, file);
      }
    }
    if (node.callee === 'min' || node.callee === 'max') {
      if (!measurements.length) return evaluateStandardLibraryCall(node.callee, args, node.source, file);
      return measurements.reduce((best, current) => {
        const better = node.callee === 'min'
          ? current.value * current.unit.scale < best.value * best.unit.scale
          : current.value * current.unit.scale > best.value * best.unit.scale;
        return better ? current : best;
      });
    }
    const physicalSum = measurements.reduce((sum, current) => sum + current.value * current.unit.scale, 0);
    const value = (node.callee === 'mean' ? physicalSum / measurements.length : physicalSum) / first.unit.scale;
    if (!Number.isFinite(value)) throwMeasurementDomainError(`${node.callee} result must be finite`, node.source, file);
    return measurement(value, first.unit);
  }
  if (node.callee === 'sum' && Array.isArray(values) && values.length === 0
    && node.arguments[0]?.type === 'identifier') {
    const type = env.bindingTypes.get(node.arguments[0].name);
    if (type?.kind === 'list' && type.element.kind === 'measurement' && env.dimensionRegistry) {
      return measurement(0, canonicalUnit(type.element.vector, env.dimensionRegistry));
    }
  }
  if (isMeasurement(args[0])) {
    const value = args[0];
    switch (node.callee) {
      case 'abs':
        return measurement(Math.abs(value.value), value.unit);
      case 'round': {
        const digits = args.length > 1 ? toNumber(args[1], node.arguments[1]) : 0;
        const factor = Math.pow(10, Math.trunc(digits));
        const rounded = Math.round(value.value * factor) / factor;
        if (!Number.isFinite(rounded)) throwMeasurementDomainError('round result must be finite', node.source, file);
        return measurement(rounded, value.unit);
      }
      case 'sqrt': {
        const physical = value.value * value.unit.scale;
        if (physical < 0) throwMeasurementDomainError('sqrt of a negative measurement value', node.source, file);
        if (!env.dimensionRegistry) throw new Error('Measurement registry is unavailable during sqrt evaluation');
        try {
          const result = sqrtMeasurement(value, env.dimensionRegistry);
          if (!Number.isFinite(result.value) || !Number.isFinite(result.unit.scale)) {
            throwMeasurementDomainError('sqrt result must be finite', node.source, file);
          }
          if (Object.keys(result.unit.vector).length === 0) return result.value * result.unit.scale;
          return result;
        } catch (error) {
          if (error instanceof Error && error.message.startsWith('sqrt requires')) {
            return staticError('AMX3007', error.message, node.source, file);
          }
          throw error;
        }
      }
      case 'pow': {
        const exponent = toNumber(args[1], node.arguments[1]);
        if (!Number.isSafeInteger(exponent)) return staticError('AMX3007', 'A dimensional pow exponent must be an integer literal', node.arguments[1]?.source, file);
        if (value.value === 0 && exponent < 0) throwMeasurementDomainError('Zero measurement cannot be raised to a negative power', node.source, file);
        const unit = powerUnit(value.unit, exponent);
        const result = Math.pow(value.value, exponent);
        if (!Number.isFinite(result) || !Number.isFinite(unit.scale)) throwMeasurementDomainError('pow result must be finite', node.source, file);
        if (!Object.keys(unit.vector).length) return result * unit.scale;
        return measurement(result, unit);
      }
    }
  }
  return evaluateStandardLibraryCall(node.callee, args, node.source, file);
}

function toNumber(v: unknown, nodeForError?: V02ExpressionNode): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  const loc = nodeForError?.source;
  const locInfo = loc ? ` at line ${loc.line}` : '';
  throw new Error(`Cannot convert value to number${locInfo}`);
}

function toBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  // Treat non-empty arrays/objects as truthy for list/aggregate contexts
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === 'object') return true;
  return false;
}

export function evaluateStatements(statements: StatementNode[], env: Environment, file?: string): void {
  const priorStatementIndex = env.currentStatementIndex;
  try {
    for (let statementIndex = 0; statementIndex < statements.length; statementIndex++) {
      env.currentStatementIndex = statementIndex;
      evaluateStatement(statements[statementIndex], env, file);
    }
  } finally {
    env.currentStatementIndex = priorStatementIndex;
  }
}

function snapshotValue(value: unknown): ViewDataValue {
  if (isMeasurement(value)) return `${value.value} ${value.unit.text}`;
  if (Array.isArray(value)) return Object.freeze(value.map(snapshotValue));
  if (value && typeof value === 'object') {
    const copy: Record<string, ViewDataValue> = {};
    for (const [key, item] of Object.entries(value)) copy[key] = snapshotValue(item);
    return Object.freeze(copy);
  }
  return value as string | number | boolean | null;
}

function snapshotView(name: string, env: Environment, file?: string, source?: SourceLocation): ViewEmission {
  const declaration = env.viewDefinitions.get(name);
  if (!declaration) return staticError('AMX3001', `Unknown visualization '${name}'`, source, file);
  const value = env.get(declaration.binding, declaration.bindingSource, file);
  if (!Array.isArray(value)) {
    const diagnostic = inputError('AMX4003', `Visualization '${name}' requires a list value`, {
      file, line: declaration.bindingSource?.line, column: declaration.bindingSource?.column,
      dataPath: `visualization ${name}`, expected: 'list', actual: Array.isArray(value) ? 'list' : typeof value
    });
    throwInputErrors([diagnostic]);
  }

  let labels: readonly string[] | undefined;
  let headings: readonly string[] | undefined;
  let measurementDescriptors: ChartViewEmission['measurementDescriptors'];
  let viewData: readonly ViewDataValue[];
  if (declaration.type === 'chartDeclaration') {
    const labelsOption = declaration.options.find(option => option.type === 'chartFieldOption' && option.role === 'labels');
    if (labelsOption?.type === 'chartFieldOption') {
      const labelValues = env.get(labelsOption.field, labelsOption.fieldSource, file);
      if (!Array.isArray(labelValues) || !labelValues.every(label => typeof label === 'string')) {
        const diagnostic = inputError('AMX4003', `Chart '${name}' labels must be a String[] value`, {
          file, line: labelsOption.source?.line, column: labelsOption.source?.column,
          dataPath: `visualization ${name}.labels`, expected: 'String[]', actual: Array.isArray(labelValues) ? 'invalid list value' : typeof labelValues
        });
        throwInputErrors([diagnostic]);
      }
      if (labelValues.length !== value.length) {
        const diagnostic = inputError('AMX4003', `Chart '${name}' has ${value.length} values but ${labelValues.length} labels`, {
          file, line: labelsOption.source?.line, column: labelsOption.source?.column,
          dataPath: `visualization ${name}.labels`, expected: `${value.length} labels`, actual: `${labelValues.length} labels`
        });
        throwInputErrors([diagnostic]);
      }
      labels = snapshotValue(labelValues) as readonly string[];
    }
    const normalized = normalizeChartMeasurements(value, declaration, name, file);
    viewData = normalized.data;
    headings = normalized.headings;
    measurementDescriptors = normalized.measurementDescriptors;
  } else {
    viewData = snapshotValue(value) as readonly ViewDataValue[];
  }

  const emission = {
    name, data: viewData,
    documentNodeIndex: env.currentDocumentNodeIndex, statementIndex: env.currentStatementIndex, source
  };
  return declaration.type === 'tableDeclaration'
    ? Object.freeze({ kind: 'table', ...emission, declaration })
    : Object.freeze({
      kind: 'chart', ...emission, declaration,
      ...(labels ? { labels } : {}), ...(headings ? { headings } : {}),
      ...(measurementDescriptors?.length ? { measurementDescriptors } : {})
    });
}

function normalizeChartMeasurements(
  data: unknown[],
  declaration: ChartDeclarationNode,
  name: string,
  file?: string
): {
  data: readonly ViewDataValue[];
  headings: readonly string[];
  measurementDescriptors: ChartViewEmission['measurementDescriptors'];
} {
  const scatter = declaration.kind === 'scatter';
  const selectedColumns: Array<{
    role: 'series' | 'x' | 'y';
    field?: string;
    label: string;
    source?: SourceLocation;
  }> = scatter
    ? declaration.options
      .filter((option): option is ChartFieldOptionNode => option.type === 'chartFieldOption' && (option.role === 'x' || option.role === 'y'))
      .map(option => ({ role: option.role as 'x' | 'y', field: option.field, label: option.role, source: option.source }))
    : declaration.options
      .filter((option): option is ChartSeriesOptionNode => option.type === 'chartSeriesOption')
      .map(option => ({ role: 'series' as const, field: option.field, label: option.label, source: option.source }));
  const chosenUnits = selectedColumns.map(column => {
    const field = column.field;
    const values = data.map(item => item !== null && typeof item === 'object' && !Array.isArray(item) && !isMeasurement(item)
      ? (item as Record<string, unknown>)[field ?? '']
      : field === undefined ? item : undefined);
    const first = values.find(value => value !== null && value !== undefined);
    const measurementFirst = isMeasurement(first) ? first : undefined;
    for (const value of values) {
      if (value === null || value === undefined) continue;
      if (measurementFirst) {
        if (!isMeasurement(value) || !sameMeasurementUnits(value, measurementFirst)) {
          staticError('AMX3007', `Chart '${name}' contains incompatible measurement dimensions`, column.source, file, declaration.source);
        }
      } else if (isMeasurement(value)) {
        staticError('AMX3007', `Chart '${name}' mixes measurements with non-measurement values`, column.source, file, declaration.source);
      }
    }
    return measurementFirst;
  });

  const headings = scatter
    ? (['x', 'y'] as const).map((axis, index) => chosenUnits[index] ? `${axis} (${chosenUnits[index]!.unit.text})` : axis).concat('group')
    : ['label', ...selectedColumns.flatMap((column, index) => column.role === 'series'
      ? [chosenUnits[index] ? `${column.label} (${chosenUnits[index]!.unit.text})` : column.label]
      : [])];
  const measurementDescriptors = selectedColumns.flatMap((column, index) => {
    const unit = chosenUnits[index]?.unit;
    if (!unit) return [];
    return [Object.freeze({
      role: column.role,
      ...(column.field === undefined ? {} : { field: column.field }),
      label: column.label,
      unit: Object.freeze({
        text: unit.text,
        scale: unit.scale,
        vector: Object.freeze({ ...unit.vector }),
        factors: Object.freeze(unit.factors.map(factor => Object.freeze({ ...factor })))
      })
    })];
  });
  const normalizedData = data.map((item): ViewDataValue => {
    if (item !== null && typeof item === 'object' && !Array.isArray(item) && !isMeasurement(item)) {
      const values: Record<string, ViewDataValue> = {};
      for (const [field, value] of Object.entries(item)) {
        const columnIndex = selectedColumns.findIndex(column => column.field === field);
        values[field] = columnIndex < 0
          ? snapshotValue(value)
          : normalizeChartValue(value, chosenUnits[columnIndex], name, selectedColumns[columnIndex]?.source, declaration, file);
      }
      return Object.freeze(values);
    }
    return normalizeChartValue(item, chosenUnits[0], name, selectedColumns[0]?.source, declaration, file);
  });
  return {
    data: Object.freeze(normalizedData),
    headings: Object.freeze(headings),
    measurementDescriptors: Object.freeze(measurementDescriptors)
  };
}

function normalizeChartValue(
  value: unknown,
  target: MeasurementValue | undefined,
  name: string,
  source: SourceLocation | undefined,
  declaration: ChartDeclarationNode,
  file?: string
): ViewDataValue {
  if (value === null || value === undefined) return null;
  if (!target) return snapshotValue(value);
  if (!isMeasurement(value) || !sameMeasurementUnits(value, target)) {
    staticError('AMX3007', `Chart '${name}' contains an incompatible measurement value`, source, file, declaration.source);
  }
  const converted = value.value * value.unit.scale / target.unit.scale;
  if (!Number.isFinite(converted)) {
    staticError('AMX3007', `Chart '${name}' measurement cannot be normalized to its first display unit`, source, file, declaration.source);
  }
  return converted;
}

function sameMeasurementUnits(left: MeasurementValue, right: MeasurementValue): boolean {
  const leftEntries = Object.entries(left.unit.vector);
  return leftEntries.length === Object.keys(right.unit.vector).length
    && leftEntries.every(([identity, exponent]) => right.unit.vector[identity] === exponent);
}

function evaluateStatement(statement: StatementNode, env: Environment, file?: string): void {
  switch (statement.type) {
    case 'importDeclaration': case 'exportNamesDeclaration':
      // Import materialization is the module loader's responsibility; imported
      // names are already present in the environment before statements run.
      return;
    case 'dimensionDeclaration': case 'unitDeclaration':
      return;
    case 'inputDeclaration':
      // Input values are validated and seeded by the module loader before evaluation.
      return;
    case 'tableDeclaration': case 'chartDeclaration':
      env.viewDefinitions.set(statement.name, statement);
      return;
    case 'showStatement':
      env.viewEmissions.push(snapshotView(statement.name, env, file, statement.source));
      return;
    case 'typeDeclaration':
      env.recordTypes.set(statement.name, statement);
      return;
    case 'enumDeclaration': {
      const values = statement.resolvedValues ?? statement.members.map((member, index) => {
        if (!member.value) return index + 1;
        if (member.value.type === 'numberLiteral' || member.value.type === 'stringLiteral') return member.value.value;
        return staticError('AMX3020', 'Only constant values can be assigned to enum members', member.valueSource ?? member.value.source, file);
      });
      const enumeration: Record<string, string | number> = {};
      statement.members.forEach((member, index) => { enumeration[member.name] = values[index]; });
      env.enumDeclarations.set(statement.name, statement);
      env.enumValues.set(statement.name, enumeration);
      return;
    }
    case 'functionDeclaration':
      env.functions.set(statement.name, statement);
      return;
    case 'variableDeclaration':
      {
        const value = evaluateExpression(statement.expression, env, file);
        const type = env.bindingTypes.get(statement.name);
        if (type) validateRuntimeValue(value, type, env, statement.source, file, statement.name);
        env.set(statement.name, value);
      }
      return;
    case 'assignmentStatement': {
      const value = evaluateExpression(statement.expression, env, file);
      const type = env.bindingTypes.get(statement.name);
      if (type) validateRuntimeValue(value, type, env, statement.source, file, statement.name);
      env.update(statement.name, value, statement.source, file);
      return;
    }
    case 'compoundAssignmentStatement': {
      const value = evaluateExpression({
        type: 'binaryExpression',
        operator: '+',
        left: { type: 'identifier', name: statement.name, source: statement.source },
        right: statement.expression,
        source: statement.source
      }, env, file);
      const type = env.bindingTypes.get(statement.name);
      if (type) validateRuntimeValue(value, type, env, statement.source, file, statement.name);
      env.update(statement.name, value, statement.source, file);
      return;
    }
    case 'addStatement':
      evaluateAddStatement(statement, env, file);
      return;
    case 'removeStatement':
      evaluateRemoveStatement(statement, env, file);
      return;
    case 'forStatement':
      evalForStatement(statement, env, file);
      return;
    case 'bracedIfStatement':
      evalBracedIfStatement(statement, env, file);
      return;
    case 'returnStatement':
      if (conditionalReturnDepth.has(env)) {
        throw new ConditionalValueReturn(evaluateExpression(statement.expression, env, file));
      }
      if (forExpressionDepth.has(env)) {
        throw new ForExpressionReturn(evaluateExpression(statement.expression, env, file));
      }
      throwInvalidReturnContext(statement.source, file);
  }
}

function evalBracedIfStatement(node: BracedIfStatementNode, env: Environment, file?: string): void {
  const branch = toBoolean(evaluateExpression(node.test, env, file)) ? node.consequent : node.alternate;
  if (branch) evaluateScopedStatements(branch, env, file);
}

function mutationTarget(name: string, env: Environment, source?: SourceLocation, file?: string): unknown[] {
  const target = env.get(name, source, file);
  if (!Array.isArray(target)) throwListOperationError(`Mutation target '${name}' is not a list`, source, file);
  if (env.isImmutable(target)) throwListOperationError(`Cannot mutate immutable imported list '${name}'`, source, file);
  return target;
}

function mutationElementType(name: string, env: Environment): CheckedType | undefined {
  const type = env.bindingTypes.get(name);
  return type?.kind === 'list' ? type.element : undefined;
}

function checkedPositiveInteger(value: unknown, description: string, source: SourceLocation | undefined, file?: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
    throwListOperationError(`${description} must be a positive integer; got ${runtimeDescription(value)}`, source, file);
  }
  return value;
}

function evaluateAddStatement(node: AddStatementNode, env: Environment, file?: string): void {
  const target = mutationTarget(node.name, env, node.source, file);
  const value = evaluateExpression(node.value, env, file);
  const elementType = mutationElementType(node.name, env);
  if (elementType) validateRuntimeValue(value, elementType, env, node.value.source ?? node.source, file, `${node.name} element`);
  const position = node.index
    ? checkedPositiveInteger(evaluateExpression(node.index, env, file), 'Insertion position', node.index.source ?? node.source, file)
    : target.length + 1;
  if (position > target.length + 1) {
    throwListOperationError(`Insertion position ${position} is out of bounds for length ${target.length}; expected 1..${target.length + 1}`, node.index?.source ?? node.source, file);
  }
  target.splice(position - 1, 0, value);
}

function evaluateRemoveStatement(node: RemoveStatementNode, env: Environment, file?: string): void {
  const target = mutationTarget(node.name, env, node.source, file);
  const count = checkedPositiveInteger(evaluateExpression(node.count, env, file), 'Removal count', node.count.source ?? node.source, file);
  if (target.length === 0) throwListOperationError('Cannot remove from an empty list', node.source, file);
  if (!node.index) {
    target.pop();
    return;
  }
  const position = checkedPositiveInteger(evaluateExpression(node.index, env, file), 'Removal position', node.index.source ?? node.source, file);
  if (position > target.length) {
    throwListOperationError(`Removal position ${position} is out of bounds for length ${target.length}; expected 1..${target.length}`, node.index.source ?? node.source, file);
  }
  if (count > target.length - position + 1) {
    throwListOperationError(`Removal interval ${position}..${position + count - 1} exceeds list length ${target.length}`, node.count.source ?? node.source, file);
  }
  target.splice(position - 1, count);
}

function evalRange(node: RangeExpressionNode, env: Environment, file?: string): number[] {
  const start = evaluateExpression(node.start, env, file);
  const end = evaluateExpression(node.end, env, file);
  if (typeof start !== 'number' || !Number.isFinite(start) || !Number.isInteger(start)
      || typeof end !== 'number' || !Number.isFinite(end) || !Number.isInteger(end)) {
    throwInvalidRangeBounds(node.source, file);
  }
  const values: number[] = [];
  const step = start <= end ? 1 : -1;
  for (let value = start; step > 0 ? value <= end : value >= end; value += step) {
    values.push(value);
    if (value + step === value && value !== end) throwInvalidRangeBounds(node.source, file);
  }
  return values;
}

function evalForStatement(node: ForStatementNode, env: Environment, file?: string): void {
  const values = evaluateLoopIterable(node.iterable, env, file);
  withLoopBinding(node.variable, values, env, () => evaluateStatements(node.body, env, file));
}

function evalForExpression(node: ForExpressionNode, env: Environment, file?: string): unknown[] {
  const values = evaluateLoopIterable(node.iterable, env, file);
  const results: unknown[] = [];
  withDepth(forExpressionDepth, env, () => withLoopBinding(node.variable, values, env, () => {
    for (const statement of node.body) {
      if (statement.type === 'returnStatement') {
        results.push(evaluateExpression(statement.expression, env, file));
      } else {
        try {
          evaluateStatement(statement, env, file);
        } catch (error) {
          if (error instanceof ForExpressionReturn) results.push(error.value);
          else throw error;
        }
      }
    }
  }));
  return results;
}

function evaluateLoopIterable(node: V02ExpressionNode, env: Environment, file?: string): unknown[] {
  const value = evaluateExpression(node, env, file);
  if (!Array.isArray(value)) throwInvalidLoopIterable(node.source, file);
  return value.slice();
}

function withLoopBinding(
  name: string,
  values: unknown[],
  env: Environment,
  runIteration: () => void
): void {
  const existed = env.has(name);
  const previous = existed ? env.get(name) : undefined;
  try {
    for (const value of values) {
      env.set(name, value);
      runIteration();
    }
  } finally {
    if (existed) env.set(name, previous);
    else env.delete(name);
  }
}
