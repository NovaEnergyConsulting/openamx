import { OpenAmxDocument } from '../ast/types';
import { Environment } from './environment';
import { evaluateStatements } from './evaluateExpression';
import { checkDocument, checkingActivated } from '../typechecker/checkDocument';

/**
 * Evaluate an OpenAmxDocument in source order.
 * - Only executable code-block statements are processed.
 * - All blocks share one environment and execute in document order.
 * - Narrative nodes and legacy top-level declarations are ignored.
 * Returns a plain object map of final variable bindings.
 */
export function evaluateDocument(
  doc: OpenAmxDocument,
  file?: string
): Record<string, unknown> {
  return evaluateDocumentEnvironment(doc, file).toObject();
}

/** Evaluate executable blocks once and return their shared final environment. */
export function evaluateDocumentEnvironment(doc: OpenAmxDocument, file?: string): Environment {
  const checked = checkingActivated(doc) ? checkDocument(doc, file) : undefined;
  const env = new Environment();
  if (checked) {
    for (const [name, type] of checked.bindingTypes) env.bindingTypes.set(name, type);
  }

  for (const node of doc.nodes) {
    if (node.type === 'executableCodeBlock') {
      evaluateStatements(node.statements, env, file);
    }
  }

  return env;
}
