import { marked } from 'marked';
import { OpenAmxDocument, NarrativeNode } from '../ast/types';
import { parseExpression } from '../parser/parseExpression';
import { evaluateExpression } from '../runtime/evaluateExpression';
import { Environment } from '../runtime/environment';

/**
 * Render an OpenAmxDocument to a complete standalone HTML5 document.
 *
 * - Walks only NarrativeNode entries in source order.
 * - Substitutes every non-nested {{ expression }} using the full v0.1 expression grammar.
 * - Expressions are parsed with parseExpression and evaluated with evaluateExpression
 *   against the document's let bindings (evaluated in declaration order).
 * - Post-substitution narrative is rendered with marked (headings, paragraphs, bullets).
 * - All VariableDeclarationNodes are omitted.
 * - Frontmatter metadata.title (if string) is used for <title>; otherwise "OpenAMX Document".
 * - Output is deterministic for the supported Markdown subset.
 * - Errors inside {{ }} (e.g. AMX1004) are surfaced with the same AmxError semantics.
 */
export function renderHtml(doc: OpenAmxDocument, file?: string): string {
  const env = new Environment();

  // Populate environment from VariableDeclarationNodes in source order.
  // This mirrors evaluateDocument semantics so {{ }} evaluation is consistent.
  for (const node of doc.nodes) {
    if (node.type === 'variableDeclaration') {
      const value = evaluateExpression(node.expression, env, file);
      env.set(node.name, value);
    }
  }

  const bodyFragments: string[] = [];

  for (const node of doc.nodes) {
    if (node.type === 'narrative') {
      const narrative = node as NarrativeNode;
      const substituted = substituteInlines(narrative.content, env, file, narrative.source?.line);
      // marked.parse returns string | Promise<string> in v14 depending on configuration.
      // For our deterministic sync usage (no async extensions) it is always a string.
      const htmlFragment = marked.parse(substituted) as string;
      bodyFragments.push(htmlFragment);
    }
    // VariableDeclarationNodes are deliberately omitted from rendered output.
  }

  const title =
    doc.metadata && typeof (doc.metadata as Record<string, unknown>).title === 'string'
      ? String((doc.metadata as Record<string, unknown>).title)
      : 'OpenAMX Document';

  const bodyHtml = bodyFragments.join('');

  const escapedTitle = escapeHtml(title);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapedTitle}</title>
</head>
<body>
${bodyHtml}</body>
</html>`;
}

function substituteInlines(
  content: string,
  env: Environment,
  file: string | undefined,
  narrativeLine?: number
): string {
  // Non-nested {{ expr }} substitution. Expressions cannot contain literal "}}" per v0.1.
  return content.replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, (_full, exprText: string) => {
    const trimmed = exprText.trim();
    if (trimmed.length === 0) {
      return '';
    }
    // Attach approximate source for better diagnostics (narrative block start line).
    const source = narrativeLine !== undefined ? { line: narrativeLine, column: 1 } : undefined;
    const exprNode = parseExpression(trimmed, source);
    const value = evaluateExpression(exprNode, env, file);
    return valueToString(value);
  });
}

function valueToString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') {
    // Present integers without trailing .0 for natural readability in text.
    return Number.isInteger(v) ? String(v) : String(v);
  }
  if (typeof v === 'boolean') return String(v); // "true" / "false"
  if (Array.isArray(v)) {
    // Simple deterministic representation for lists inside narrative text.
    return v.map(valueToString).join(', ');
  }
  return String(v);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

