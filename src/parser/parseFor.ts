import { ForExpressionNode, ForStatementNode, SourceLocation, StatementNode } from '../ast/types';
import { parseExpression } from './parseExpression';
import { parseStatements } from './parseStatements';

interface ParsedLoop {
  variable: string;
  iterableText: string;
  bodyText: string;
  bodySource: SourceLocation;
}

function parseLoop(text: string, source?: SourceLocation): ParsedLoop {
  const lines = text.split(/\r?\n/);
  const header = lines[0].match(/^\s*for\s+([A-Za-z][A-Za-z0-9_]*)\s+in\s+(.+?)\s*\{\s*$/);
  if (!header) {
    throw new Error(`Invalid for loop at ${source?.line ?? 1}:${source?.column ?? 1}`);
  }
  if (lines.length < 2 || !/^\s*}\s*$/.test(lines[lines.length - 1])) {
    throw new Error(`Unclosed for loop at ${source?.line ?? 1}:${source?.column ?? 1}`);
  }
  if (lines.slice(1, -1).some(line => /^\s*for\b/.test(line))) {
    throw new Error(`Nested loops are unsupported at ${source?.line ?? 1}:${source?.column ?? 1}`);
  }
  return {
    variable: header[1],
    iterableText: header[2],
    bodyText: lines.slice(1, -1).join('\n'),
    bodySource: { line: (source?.line ?? 1) + 1, column: 1 }
  };
}

export function parseForStatement(text: string, source?: SourceLocation): ForStatementNode {
  const loop = parseLoop(text, source);
  if (/^\s*return\b/m.test(loop.bodyText)) {
    throw new Error(`Statement-form for loops cannot contain return at ${source?.line ?? 1}:${source?.column ?? 1}`);
  }
  const body = parseStatements(loop.bodyText, loop.bodySource, { allowFor: false });
  return {
    type: 'forStatement',
    variable: loop.variable,
    iterable: parseExpression(loop.iterableText, source),
    body,
    source
  };
}

export function parseForExpression(text: string, source?: SourceLocation): ForExpressionNode {
  const loop = parseLoop(text, source);
  const body: StatementNode[] = parseStatements(loop.bodyText, loop.bodySource, {
    allowReturn: true,
    allowFor: false
  });
  const returnCount = body.filter(statement => statement.type === 'returnStatement').length;
  if (returnCount !== 1) {
    throw new Error(`Expression-form for loops require exactly one return expression at ${source?.line ?? 1}:${source?.column ?? 1}`);
  }
  return {
    type: 'forExpression',
    variable: loop.variable,
    iterable: parseExpression(loop.iterableText, source),
    body,
    source
  };
}