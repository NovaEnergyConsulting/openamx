import { OpenAmxDocument } from '../ast/types';
/**
 * Parse an .amx document from disk.
 *
 * Steps (Sprint 002 scope):
 * 1. Read UTF-8 text.
 * 2. Extract optional YAML front matter (delegate to parseFrontMatter).
 * 3. Preserve narrative and parse declarations only within exact `amx` fences.
 * 4. Return OpenAmxDocument { metadata, nodes }.
 *
 * No evaluation or rendering is performed.
 */
export declare function parseDocument(filePath: string): Promise<OpenAmxDocument>;
/** Parse an OpenAMX document from in-memory text without file-system access. */
export declare function parseDocumentText(content: string): OpenAmxDocument;
//# sourceMappingURL=parseDocument.d.ts.map