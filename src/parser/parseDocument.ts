import { OpenAmxDocument } from '../ast/types';
import { parseFrontMatter } from './parseFrontMatter';
import { parseStatements } from './parseStatements';

/**
 * Parse an .amx document from disk.
 *
 * Steps (Sprint 002 scope):
 * 1. Read UTF-8 text.
 * 2. Extract optional YAML front matter (delegate to parseFrontMatter).
 * 3. Split remaining body into ordered DocumentNode[] (delegate to parseStatements).
 * 4. Return OpenAmxDocument { metadata, nodes }.
 *
 * No evaluation or rendering is performed.
 */
export async function parseDocument(filePath: string): Promise<OpenAmxDocument> {
  const content = await Bun.file(filePath).text();
  const { metadata, body, error } = parseFrontMatter(content);

  if (error) {
    // Surface a clear error while still attempting to parse body (per frontmatter impl tolerance).
    // For Sprint 002 we throw so tests can assert on malformed front matter.
    throw new Error(error);
  }

  const nodes = parseStatements(body);
  return {
    metadata,
    nodes
  };
}

