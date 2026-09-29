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
  StatementNode
} from '../ast/types';
import { throwInvalidLoopIterable, throwInvalidRangeBounds, throwInvalidReturnContext } from '../diagnostics/errors';
import { Environment } from './environment';
import { evaluateStandardLibraryCall } from './standardLibrary';

/** Evaluate V0.2 expressions, including ranges and expression-form loops. */
export function evaluateExpression(
  node: V02ExpressionNode,
  env: Environment,
  file?: string
): unknown {
  switch (node.type) {
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
    case 'variableDeclaration':
      env.set(statement.name, evaluateExpression(statement.expression, env, file));
      return;
    case 'assignmentStatement':
      env.update(statement.name, evaluateExpression(statement.expression, env, file), statement.source, file);
      return;
    case 'compoundAssignmentStatement': {
      const value = evaluateExpression({
        type: 'binaryExpression',
        operator: '+',
        left: { type: 'identifier', name: statement.name, source: statement.source },
        right: statement.expression,
        source: statement.source
      }, env, file);
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
