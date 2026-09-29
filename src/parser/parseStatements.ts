import { SourceLocation, StatementNode, VariableDeclarationNode } from '../ast/types';
import { parseExpression } from './parseExpression';

/**
 * Parse the declaration-only statement subset supported in V0.2 Sprint 007.
 * `start` identifies the first source position in the original document.
 */
export function parseStatements(
  body: string,
  start: SourceLocation = { line: 1, column: 1 }
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

    const letMatch = rawLine.match(/^\s*let\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (letMatch) {
      const name = letMatch[1];
      const expressionText = letMatch[2];
      let expression;
      try {
        expression = parseExpression(expressionText, source);
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
      continue;
    }

    throw new Error(`Unsupported statement at ${source.line}:${source.column}`);
  }

  return statements;
}

