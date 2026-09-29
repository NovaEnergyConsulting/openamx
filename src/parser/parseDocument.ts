import { OpenAmxDocument } from '../ast/types';
import { parseFrontMatter } from './parseFrontMatter';
import { parseStatements } from './parseStatements';

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
export async function parseDocument(filePath: string): Promise<OpenAmxDocument> {
  const content = await Bun.file(filePath).text();
  const frontMatter = parseFrontMatter(content);
  const { metadata, body, error } = frontMatter;

  if (error) {
    // Surface a clear error while still attempting to parse body (per frontmatter impl tolerance).
    // For Sprint 002 we throw so tests can assert on malformed front matter.
    throw new Error(error);
  }

  const nodes = parseDocumentBody(body, frontMatter.bodyStartLine);
  return {
    metadata,
    nodes
  };
}

interface SourceLine {
  text: string;
  start: number;
  contentEnd: number;
  nextStart: number;
}

function parseDocumentBody(body: string, startLine: number) {
  const lines = sourceLines(body);
  const nodes: OpenAmxDocument['nodes'] = [];
  let narrativeStart = 0;
  let index = 0;

  function flushNarrative(end: number, startIndex: number) {
    if (end <= narrativeStart) return;
    nodes.push({
      type: 'narrative',
      content: body.slice(narrativeStart, end),
      source: { line: startLine + startIndex, column: 1 }
    });
  }

  while (index < lines.length) {
    const line = lines[index];
    const opening = line.text.match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
    if (!opening) {
      index++;
      continue;
    }

    const fence = opening[2];
    const isExecutable = fence[0] === '`' && opening[3].trim() === 'amx';
    const closingIndex = findClosingFence(lines, index + 1, fence);

    if (!isExecutable) {
      index = closingIndex === -1 ? lines.length : closingIndex + 1;
      continue;
    }

    const openerLocation = { line: startLine + index, column: opening[1].length + 1 };
    if (closingIndex === -1) {
      throw new Error(`Unclosed amx fence at ${openerLocation.line}:${openerLocation.column}`);
    }

    flushNarrative(line.start, index === 0 ? 0 : narrativeLineIndex(lines, narrativeStart));
    const contentStart = line.nextStart;
    const contentEnd = lines[closingIndex].start;
    const content = body.slice(contentStart, contentEnd);
    const statements = parseStatements(content, {
      line: startLine + index + 1,
      column: 1
    });
    nodes.push({
      type: 'executableCodeBlock',
      content,
      statements,
      source: openerLocation
    });

    index = closingIndex + 1;
    narrativeStart = lines[closingIndex].nextStart;
  }

  if (narrativeStart < body.length) {
    const narrativeStartLineIndex = narrativeLineIndex(lines, narrativeStart);
    flushNarrative(body.length, narrativeStartLineIndex);
  }

  return nodes;
}

function sourceLines(text: string): SourceLine[] {
  const lines: SourceLine[] = [];
  let start = 0;
  while (start < text.length) {
    const newline = text.indexOf('\n', start);
    const nextStart = newline === -1 ? text.length : newline + 1;
    const contentEnd = newline === -1
      ? text.length
      : newline > start && text[newline - 1] === '\r' ? newline - 1 : newline;
    lines.push({ text: text.slice(start, contentEnd), start, contentEnd, nextStart });
    start = nextStart;
  }
  return lines;
}

function findClosingFence(lines: SourceLine[], from: number, opener: string): number {
  for (let i = from; i < lines.length; i++) {
    const closing = lines[i].text.match(/^( {0,3})(`+|~+)(\s*)$/);
    if (closing && closing[2][0] === opener[0] && closing[2].length >= opener.length) {
      return i;
    }
  }
  return -1;
}

function narrativeLineIndex(lines: SourceLine[], offset: number): number {
  const index = lines.findIndex(line => line.start === offset);
  return index === -1 ? Math.max(0, lines.length - 1) : index;
}

