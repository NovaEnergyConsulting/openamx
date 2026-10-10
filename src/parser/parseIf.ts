import { BracedIfExpressionNode, BracedIfStatementNode, SourceLocation } from '../ast/types';
import { syntaxError } from '../diagnostics/errors';
import { parseExpression } from './parseExpression';
import { parseStatements } from './parseStatements';

interface IfBlocks {
  condition: string;
  consequent: string;
  alternate?: string;
  consequentSource: SourceLocation;
  alternateSource?: SourceLocation;
  consequentClosingSource: SourceLocation;
  alternateClosingSource?: SourceLocation;
  endOffset: number;
}

export function parseBracedIfExpression(text: string, source?: SourceLocation): BracedIfExpressionNode {
  const blocks = readIfBlocks(text, source);
  if (!blocks.alternate) syntaxError("Expression-form 'if' requires an 'else' block", source);
  return {
    type: 'bracedIfExpression',
    test: parseExpression(blocks.condition, offsetLocation(text, text.indexOf(blocks.condition), source)),
    consequent: parseStatements(blocks.consequent, blocks.consequentSource, { allowReturn: true }),
    alternate: parseStatements(blocks.alternate, blocks.alternateSource!, { allowReturn: true }),
    consequentSource: blocks.consequentClosingSource,
    alternateSource: blocks.alternateClosingSource,
    source
  };
}

export function parseBracedIfStatement(
  text: string,
  source?: SourceLocation,
  context: { allowReturn?: boolean; allowFor?: boolean } = {}
): { statement: BracedIfStatementNode; lineCount: number } {
  const blocks = readIfBlocks(text, source);
  const statementText = text.slice(0, blocks.endOffset);
  return {
    statement: {
      type: 'bracedIfStatement',
      test: parseExpression(blocks.condition, offsetLocation(text, text.indexOf(blocks.condition), source)),
      consequent: parseStatements(blocks.consequent, blocks.consequentSource, context),
      ...(blocks.alternate === undefined ? {} : { alternate: parseStatements(blocks.alternate, blocks.alternateSource!, context) }),
      consequentSource: blocks.consequentClosingSource,
      ...(blocks.alternateClosingSource ? { alternateSource: blocks.alternateClosingSource } : {}),
      source
    },
    lineCount: statementText.split(/\r?\n/).length
  };
}

export function findBracedIfExpressionEnd(text: string, start: number): number | undefined {
  if (!/^if\b/.test(text.slice(start))) return undefined;
  const firstOpen = findFirstBlockOpen(text, start + 2);
  if (firstOpen === undefined) return undefined;
  if (containsTopLevelWord(text, start + 2, firstOpen, 'then')) return undefined;
  const firstClose = matchingBrace(text, firstOpen);
  if (firstClose === undefined) return undefined;
  let cursor = skipWhitespace(text, firstClose + 1);
  if (!text.startsWith('else', cursor) || /[A-Za-z0-9_]/.test(text[cursor + 4] ?? '')) return firstClose;
  cursor = skipWhitespace(text, cursor + 4);
  if (text[cursor] !== '{') return firstClose;
  return matchingBrace(text, cursor);
}

function containsTopLevelWord(text: string, start: number, end: number, word: string): boolean {
  let depth = 0;
  for (let index = start; index < end; index++) {
    const character = text[index];
    if (character === '"' || character === "'") {
      const close = quotedEnd(text, index);
      if (close === undefined) return false;
      index = close;
    } else if (character === '(' || character === '[') {
      depth++;
    } else if (character === ')' || character === ']') {
      depth--;
    } else if (depth === 0 && text.startsWith(word, index)
      && !/[A-Za-z0-9_]/.test(text[index - 1] ?? '')
      && !/[A-Za-z0-9_]/.test(text[index + word.length] ?? '')) {
      return true;
    }
  }
  return false;
}

function readIfBlocks(text: string, source?: SourceLocation): IfBlocks {
  const firstOpen = findFirstBlockOpen(text, 2);
  if (firstOpen === undefined) syntaxError("Expected '{' after braced 'if' condition", source);
  const firstClose = matchingBrace(text, firstOpen);
  if (firstClose === undefined) syntaxError("Unclosed 'if' block", source);
  const condition = text.slice(2, firstOpen).trim();
  if (!condition) syntaxError("Expected condition after 'if'", source);
  const consequentBody = text.slice(firstOpen + 1, firstClose);
  const consequentSource = offsetLocation(text, firstOpen + 1, source);
  const consequentClosingSource = offsetLocation(text, firstClose, source);
  let cursor = skipWhitespace(text, firstClose + 1);
  if (!text.startsWith('else', cursor) || /[A-Za-z0-9_]/.test(text[cursor + 4] ?? '')) {
    return {
      condition,
      consequent: consequentBody,
      consequentSource,
      consequentClosingSource,
      endOffset: firstClose + 1
    };
  }
  cursor = skipWhitespace(text, cursor + 4);
  if (text[cursor] !== '{') syntaxError("Expected '{' after 'else'", offsetLocation(text, cursor, source));
  const alternateClose = matchingBrace(text, cursor);
  if (alternateClose === undefined) syntaxError("Unclosed 'else' block", offsetLocation(text, cursor, source));
  return {
    condition,
    consequent: consequentBody,
    alternate: text.slice(cursor + 1, alternateClose),
    consequentSource,
    alternateSource: offsetLocation(text, cursor + 1, source),
    consequentClosingSource,
    alternateClosingSource: offsetLocation(text, alternateClose, source),
    endOffset: alternateClose + 1
  };
}

function findFirstBlockOpen(text: string, start: number): number | undefined {
  let depth = 0;
  for (let index = start; index < text.length; index++) {
    const character = text[index];
    if (character === '"' || character === "'") {
      const close = quotedEnd(text, index);
      if (close === undefined) return undefined;
      index = close;
    } else if (character === '(' || character === '[') {
      depth++;
    } else if (character === ')' || character === ']') {
      depth--;
    } else if (character === '{' && depth === 0) {
      return index;
    }
  }
  return undefined;
}

function matchingBrace(text: string, open: number): number | undefined {
  let depth = 0;
  for (let index = open; index < text.length; index++) {
    const character = text[index];
    if (character === '"' || character === "'") {
      const close = quotedEnd(text, index);
      if (close === undefined) return undefined;
      index = close;
    } else if (character === '{') {
      depth++;
    } else if (character === '}' && --depth === 0) {
      return index;
    }
  }
  return undefined;
}

function quotedEnd(text: string, start: number): number | undefined {
  const quote = text[start];
  for (let index = start + 1; index < text.length; index++) {
    if (text[index] === '\\') index++;
    else if (text[index] === quote) return index;
  }
  return undefined;
}

function skipWhitespace(text: string, start: number): number {
  let index = start;
  while (index < text.length && /\s/.test(text[index])) index++;
  return index;
}

function offsetLocation(text: string, offset: number, source?: SourceLocation): SourceLocation {
  const before = text.slice(0, offset).split(/\r?\n/);
  return {
    line: (source?.line ?? 1) + before.length - 1,
    column: before.length === 1 ? (source?.column ?? 1) + before[0].length : before.at(-1)!.length + 1
  };
}
