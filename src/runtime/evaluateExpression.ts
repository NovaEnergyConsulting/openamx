import {
  BinaryExpressionNode,
  UnaryExpressionNode,
  ConditionalExpressionNode,
  ListLiteralNode,
  FunctionCallNode,
  V02ExpressionNode,
  ForExpressionNode,
  ForStatementNode,
  RangeExpressionNode,
  MatchExpressionNode,
  StatementNode,
  SourceLocation,
  TypeReferenceNode
} from '../ast/types';
import { inputError, throwInputErrors, throwInvalidLoopIterable, throwInvalidRangeBounds, throwInvalidReturnContext } from '../diagnostics/errors';
import { Environment } from './environment';
import { evaluateStandardLibraryCall } from './standardLibrary';
import type { CheckedType } from '../typechecker/checkDocument';

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
      if (!Object.prototype.hasOwnProperty.call(record, field.name)) {
        report(`Missing computed field '${field.name}'`, checkedType(field.annotation), 'missing', `${dataPath}.${field.name}`, field.source);
      } else {
        visit(record[field.name], checkedType(field.annotation), `${dataPath}.${field.name}`, field.source);
      }
    }
    for (const name of Object.keys(record).filter(name => !fieldNames.has(name)).sort()) {
      report(`Unknown computed field '${name}'`, target, record[name], `${dataPath}.${name}`, fieldSource);
    }
  };
  visit(value, expected, valuePath);
  if (diagnostics.length) throwInputErrors(diagnostics);
}

function checkedType(reference: TypeReferenceNode): CheckedType {
  if (reference.type === 'namedType') return { kind: 'named', name: reference.name! };
  const element = checkedType(reference.element!);
  return reference.type === 'listType' ? { kind: 'list', element } : { kind: 'nullable', element };
}

function formatCheckedType(type: CheckedType): string {
  if (type.kind === 'named') return type.name;
  if (type.kind === 'null') return 'null';
  return type.kind === 'list' ? `${formatCheckedType(type.element)}[]` : `${formatCheckedType(type.element)}?`;
}

function runtimeDescription(value: unknown): string {
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  let description: string;
  try { description = JSON.stringify(value) ?? String(value); } catch { description = String(value); }
  return description.replace(/[\x00-\x1f\x7f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`).slice(0, 160);
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
          : field.defaultExpression ? evaluateExpression(field.defaultExpression, env, file) : null;
      }
      validateRuntimeValue(record, { kind: 'named', name: node.name }, env, node.source, file, `record ${node.name}`);
      return record;
    }

    case 'fieldAccess':
      return (evaluateExpression(node.receiver, env, file) as Record<string, unknown>)[node.field];

    case 'numberLiteral':
      return node.value;

    case 'stringLiteral':
      return node.value;

    case 'booleanLiteral':
      return node.value;

    case 'identifier':
      // Pass source location for better diagnostics
      return env.get(node.name, node.source, file);

    case 'binaryExpression':
      return evalBinary(node as BinaryExpressionNode, env, file);

    case 'unaryExpression':
      return evalUnary(node as UnaryExpressionNode, env, file);

    case 'conditionalExpression':
      return evalConditional(node as ConditionalExpressionNode, env, file);

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

  switch (node.operator) {
    // Arithmetic (numeric)
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
    case '^': {
      const lNum = toNumber(left, node.left);
      const rNum = toNumber(right, node.right);
      if (node.operator === '+') return lNum + rNum;
      if (node.operator === '-') return lNum - rNum;
      if (node.operator === '*') return lNum * rNum;
      if (node.operator === '/') return lNum / rNum;
      if (node.operator === '%') return lNum % rNum;
      if (node.operator === '^') return Math.pow(lNum, rNum);
      break;
    }

    // Comparisons (produce boolean)
    case '==':
      return left === right;
    case '!=':
      return left !== right;
    case '>':
      return toNumber(left, node.left) > toNumber(right, node.right);
    case '>=':
      return toNumber(left, node.left) >= toNumber(right, node.right);
    case '<':
      return toNumber(left, node.left) < toNumber(right, node.right);
    case '<=':
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

function evalListLiteral(
  node: ListLiteralNode,
  env: Environment,
  file?: string
): unknown[] {
  return node.elements.map(el => evaluateExpression(el, env, file));
}

function evalFunctionCall(
  node: FunctionCallNode,
  env: Environment,
  file?: string
): unknown {
  const args = node.arguments.map(a => evaluateExpression(a, env, file));
  const userFunction = env.functions.get(node.callee);
  if (userFunction) {
    const parameters: Record<string, unknown> = {};
    userFunction.parameters.forEach((parameter, index) => {
      validateRuntimeValue(args[index], checkedType(parameter.annotation), env, node.arguments[index]?.source ?? node.source, file, `function ${node.callee}.${parameter.name}`);
      parameters[parameter.name] = args[index];
    });
    const frame = env.createCallFrame(parameters);
    const result = evaluateExpression(userFunction.body, frame, file);
    validateRuntimeValue(result, checkedType(userFunction.returnType), env, node.source, file, `function ${node.callee} return`);
    return result;
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
  for (const statement of statements) {
    evaluateStatement(statement, env, file);
  }
}

function evaluateStatement(statement: StatementNode, env: Environment, file?: string): void {
  switch (statement.type) {
    case 'importDeclaration':
      // Import materialization is the module loader's responsibility; imported
      // names are already present in the environment before statements run.
      return;
    case 'inputDeclaration':
      // Input values are validated and seeded by the module loader before evaluation.
      return;
    case 'typeDeclaration':
      env.recordTypes.set(statement.name, statement);
      return;
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
    case 'forStatement':
      evalForStatement(statement, env, file);
      return;
    case 'returnStatement':
      throwInvalidReturnContext(statement.source, file);
  }
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
  withLoopBinding(node.variable, values, env, () => {
    for (const statement of node.body) {
      if (statement.type === 'returnStatement') {
        results.push(evaluateExpression(statement.expression, env, file));
      } else {
        evaluateStatement(statement, env, file);
      }
    }
  });
  return results;
}

function evaluateLoopIterable(node: V02ExpressionNode, env: Environment, file?: string): unknown[] {
  const value = evaluateExpression(node, env, file);
  if (!Array.isArray(value)) throwInvalidLoopIterable(node.source, file);
  return value;
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
