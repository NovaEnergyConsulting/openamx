import { OpenAmxDocument, VariableDeclarationNode } from '../ast/types';
import { Environment } from './environment';
import { evaluateExpression } from './evaluateExpression';

/**
 * Evaluate an OpenAmxDocument in source order.
 * - Only VariableDeclarationNodes are processed.
 * - Narrative nodes are ignored for evaluation.
 * - Variables are evaluated strictly in declaration order (no hoisting).
 * - Forward references produce AMX1004 via evaluateExpression / Environment.
 * Returns a plain object map of final variable bindings.
 */
export function evaluateDocument(
  doc: OpenAmxDocument,
  file?: string
): Record<string, unknown> {
  const env = new Environment();

  for (const node of doc.nodes) {
    if (node.type === 'variableDeclaration') {
      const decl = node as VariableDeclarationNode;
      const value = evaluateExpression(decl.expression, env, file);
      env.set(decl.name, value);
    }
    // narrative nodes are deliberately ignored for evaluation
  }

  return env.toObject();
}
