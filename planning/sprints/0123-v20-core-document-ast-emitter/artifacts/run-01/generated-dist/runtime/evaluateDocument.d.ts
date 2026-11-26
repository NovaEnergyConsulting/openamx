import { OpenAmxDocument } from '../ast/types';
import { Environment } from './environment';
/**
 * Evaluate an OpenAmxDocument in source order.
 * - Only executable code-block statements are processed.
 * - All blocks share one environment and execute in document order.
 * - Narrative nodes and legacy top-level declarations are ignored.
 * Returns a plain object map of final variable bindings.
 */
export declare function evaluateDocument(doc: OpenAmxDocument, file?: string): Record<string, unknown>;
/** Evaluate executable blocks once and return their shared final environment. */
export declare function evaluateDocumentEnvironment(doc: OpenAmxDocument, file?: string): Environment;
//# sourceMappingURL=evaluateDocument.d.ts.map