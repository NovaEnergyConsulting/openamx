import { DocumentNode, SourceLocation, VariableDeclarationNode } from '../ast/types';
import { parseExpression } from './parseExpression';

/**
 * Statement splitter.
 *
 * Splits post-frontmatter body into ordered DocumentNode[].
 * - Lines starting with "let " (after optional leading whitespace) are VariableDeclarationNode.
 * - All other lines (including blank lines) are collected into NarrativeNode blocks.
 * - `let ...` lines are completely stripped from narrative content.
 * - Source order is strictly preserved.
 * - Basic SourceLocation (line, column=1) attached.
 *
 * Recognises simple Markdown structure only as raw text:
 *   #, ##, ### headings
 *   paragraphs
 *   - bullet lists
 * These remain inside NarrativeNode.content for later rendering.
 *
 * Delegates to parseExpression (Sprint 003+) for let RHS expressions.
 * Only arithmetic expressions are supported in Sprint 003 scope.
 */
export function parseStatements(body: string): DocumentNode[] {
  if (!body || body.trim().length === 0) {
    return [];
  }

  const lines = body.split(/\r?\n/);
  const nodes: DocumentNode[] = [];
  let narrativeLines: string[] = [];
  let narrativeStartLine = -1;

  function flushNarrative() {
    if (narrativeLines.length > 0) {
      const content = narrativeLines.join('\n');
      const source: SourceLocation = { line: narrativeStartLine, column: 1 };
      nodes.push({
        type: 'narrative',
        content,
        source
      });
      narrativeLines = [];
      narrativeStartLine = -1;
    }
  }

  // Valid identifier per spec: Letter (Letter | Digit | "_")*
  const identifierRegex = /^[A-Za-z][A-Za-z0-9_]*$/;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNumber = i + 1; // 1-based relative to body start

    // Detect let at start of logical line (leading whitespace allowed before "let")
    const letMatch = rawLine.match(/^\s*let\s+([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (letMatch) {
      // Flush any pending narrative before the let
      flushNarrative();

      const name = letMatch[1];
      if (!identifierRegex.test(name)) {
        // Should not happen due to regex in capture, but defensive
        throw new Error(`Malformed let declaration at line ${lineNumber}: invalid identifier "${name}"`);
      }

      const exprText = letMatch[2]; // may contain trailing spaces; parseExpression trims
      const source: SourceLocation = { line: lineNumber, column: 1 };

      // Delegate to full expression parser (Sprint 003). Errors surface as thrown exceptions.
      const expression = parseExpression(exprText, source);

      const decl: VariableDeclarationNode = {
        type: 'variableDeclaration',
        name,
        expression,
        source
      };
      nodes.push(decl);
      continue;
    }

    // Narrative line (headings, paragraphs, bullets, blank lines, etc.)
    if (narrativeStartLine === -1) {
      narrativeStartLine = lineNumber;
    }
    narrativeLines.push(rawLine);
  }

  // Flush trailing narrative
  flushNarrative();

  return nodes;
}

