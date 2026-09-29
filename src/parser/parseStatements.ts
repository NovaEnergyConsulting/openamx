import { SourceLocation, StatementNode, VariableDeclarationNode } from '../ast/types';
import { parseExpression } from './parseExpression';
import { parseForStatement } from './parseFor';

interface ParseContext {
  allowReturn?: boolean;
  allowFor?: boolean;
}

/** Parse V0.2 statements while preserving original-document source locations. */
export function parseStatements(
  body: string,
  start: SourceLocation = { line: 1, column: 1 },
  context: ParseContext = {}
): StatementNode[] {
  if (!body || body.trim().length === 0) {
    return [];
  }

  const lines = body.split(/\r?\n/);
  const statements: StatementNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNumber = start.line + i;
    const indentation = rawLine.length - rawLine.trimStart().length;
    const source: SourceLocation = {
      line: lineNumber,
      column: i === 0 ? start.column + indentation : indentation + 1
    };

    if (rawLine.trim().length === 0) {
      continue;
    }

    if (context.allowFor === false && containsForExpression(rawLine)) {
      throw new Error(`Nested loops are unsupported at ${source.line}:${source.column}`);
    }

    if (/^\s*for\b/.test(rawLine)) {
      if (context.allowFor === false) {
        throw new Error(`Nested loops are unsupported at ${source.line}:${source.column}`);
      }
      const endIndex = findLoopEnd(lines, i, { line: lineNumber, column: source.column });
      statements.push(parseForStatement(lines.slice(i, endIndex + 1).join('\n'), source));
      i = endIndex;
      continue;
    }

    if (/^\s*(break|continue)\b/.test(rawLine)) {
      throw new Error(`Unsupported loop control statement at ${source.line}:${source.column}`);
    }

    const returnMatch = rawLine.match(/^\s*return\s+(.+)\s*$/);
    if (returnMatch) {
      if (context.allowReturn !== true) {
        throw new Error(`Return is only valid inside an expression-form for loop at ${source.line}:${source.column}`);
      }
      const expressionText = collectExpressionLoop(lines, i, returnMatch[1], start);
      statements.push({
        type: 'returnStatement',
        expression: parseExpression(expressionText.text, containsMatchExpression(expressionText.text)
          ? { line: source.line, column: rawLine.indexOf(returnMatch[1]) + 1 } : source),
        source
      });
      i += expressionText.lineCount - 1;
      continue;
    }

    const letMatch = rawLine.match(/^\s*let\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (letMatch) {
      const name = letMatch[1];
      const expressionText = collectExpressionLoop(lines, i, letMatch[2], start);
      let expression;
      try {
        expression = parseExpression(expressionText.text, containsMatchExpression(expressionText.text)
          ? { line: source.line, column: rawLine.indexOf(letMatch[2]) + 1 } : source);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid declaration at ${source.line}:${source.column}: ${message}`);
      }

      const decl: VariableDeclarationNode = {
        type: 'variableDeclaration',
        name,
        expression,
        source
      };
      statements.push(decl);
      i += expressionText.lineCount - 1;
      continue;
    }

    const compoundMatch = rawLine.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*\+=\s*(.*)$/);
    const assignmentMatch = rawLine.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*=(?!=)\s*(.*)$/);
    const assignment = compoundMatch ?? assignmentMatch;
    if (assignment) {
      const expressionText = collectExpressionLoop(lines, i, assignment[2], start);
      try {
        statements.push({
          type: compoundMatch ? 'compoundAssignmentStatement' : 'assignmentStatement',
          name: assignment[1],
          ...(compoundMatch ? { operator: '+=' as const } : {}),
          expression: parseExpression(expressionText.text, containsMatchExpression(expressionText.text)
            ? { line: source.line, column: rawLine.indexOf(assignment[2]) + 1 } : source),
          source
        } as StatementNode);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid assignment at ${source.line}:${source.column}: ${message}`);
      }
      i += expressionText.lineCount - 1;
      continue;
    }

    throw new Error(`Unsupported statement at ${source.line}:${source.column}`);
  }

  return statements;
}

function findLoopEnd(lines: string[], startIndex: number, source: SourceLocation): number {
  const text = lines.slice(startIndex).join('\n');
  let open = -1;
  let depth = 0;
  let quote: string | undefined;
  let escaped = false;

  for (let offset = 0; offset < text.length; offset++) {
    const character = text[offset];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{') {
      if (open === -1) open = offset;
      depth++;
    } else if (character === '}' && open !== -1) {
      depth--;
      if (depth === 0) {
        return startIndex + text.slice(0, offset).split('\n').length - 1;
      }
    }
  }
  throw new Error(`${open === -1 ? "Expected '{' to start" : 'Unclosed'} for loop at ${source.line}:${source.column}`);
}

function collectExpressionLoop(
  lines: string[],
  lineIndex: number,
  expression: string,
  start: SourceLocation
): { text: string; lineCount: number } {
  if (!containsForExpression(expression) && !containsMatchExpression(expression)) return { text: expression, lineCount: 1 };
  if (containsMatchExpression(expression) && !containsForExpression(expression)) {
    const end = findLoopEnd(lines, lineIndex, { line: start.line + lineIndex, column: start.column });
    const expressionOffset = lines[lineIndex].indexOf(expression);
    return {
      text: [lines[lineIndex].slice(expressionOffset), ...lines.slice(lineIndex + 1, end + 1)].join('\n'),
      lineCount: end - lineIndex + 1
    };
  }
  const loopEnd = findLoopEnd(lines, lineIndex, {
    line: start.line + lineIndex,
    column: start.column
  });
  const expressionOffset = lines[lineIndex].indexOf(expression);
  return {
    text: [lines[lineIndex].slice(expressionOffset), ...lines.slice(lineIndex + 1, loopEnd + 1)].join('\n'),
    lineCount: loopEnd - lineIndex + 1
  };
}

function containsForExpression(text: string): boolean {
  const withoutStrings = text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '');
  return /\bfor\s+[A-Za-z][A-Za-z0-9_]*\s+in\b/.test(withoutStrings);
}

function containsMatchExpression(text: string): boolean {
  const withoutStrings = text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '');
  return /\bmatch\s+/.test(withoutStrings);
}

