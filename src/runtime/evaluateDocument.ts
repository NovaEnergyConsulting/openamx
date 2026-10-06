import { OpenAmxDocument } from '../ast/types';
import { Environment } from './environment';
import { evaluateStatements } from './evaluateExpression';
import { checkDocument } from '../typechecker/checkDocument';

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
  const checked = checkDocument(doc, file);
  const env = new Environment(new Map(), new Map(), {
    dimensions: checked.dimensions,
    units: checked.units,
    baseUnits: checked.baseUnits
  });
  for (const [name, type] of checked.bindingTypes) env.bindingTypes.set(name, type);

  for (let nodeIndex = 0; nodeIndex < doc.nodes.length; nodeIndex++) {
    const node = doc.nodes[nodeIndex];
    if (node.type === 'executableCodeBlock') {
      env.currentDocumentNodeIndex = nodeIndex;
      evaluateStatements(node.statements, env, file);
    }
  }

  return env;
}
