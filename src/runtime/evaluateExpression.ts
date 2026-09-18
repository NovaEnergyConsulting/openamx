import {
  ExpressionNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  ConditionalExpressionNode,
  ListLiteralNode,
  FunctionCallNode
} from '../ast/types';
import { Environment } from './environment';
import { evaluateStandardLibraryCall } from './standardLibrary';

/**
 * Evaluate an ExpressionNode.
 * Supports full v0.1 expression set: arithmetic, comparisons, logicals, conditionals,
 * list literals, and function calls (delegated to standardLibrary).
 * Throws AmxError (AMX1004) for undefined identifiers.
 */
export function evaluateExpression(
  node: ExpressionNode,
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

    default: {
      // Exhaustiveness check: if a new node type is added without a case, this will fail to compile.
      const _exhaustive: never = node;
      throw new Error(`Unsupported expression node type: ${_exhaustive}`);
    }
  }
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

function toNumber(v: unknown, nodeForError?: ExpressionNode): number {
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
