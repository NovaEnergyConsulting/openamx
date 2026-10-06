import { parseStatements } from '../parser/parseStatements';
import { findStringLiteralEnd } from '../parser/stringScanner';

/** Format executable AMX block content without changing expression text. */
export function formatAmx(source: string): string {
  const normalized = source.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');

  while (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();
  if (lines.length === 0) return '';

  parseStatements(lines.join('\n'));

  let depth = 0;
  const formatted = lines.map((rawLine) => {
    const line = rawLine.replace(/[ \t]+$/, '');
    if (line.trim().length === 0) return '';

    const content = line.trimStart();
    const braces = scanBraces(content);
    const lineDepth = Math.max(0, depth - braces.leadingClosures);
    const result = `${'  '.repeat(lineDepth)}${content}`;
    depth = Math.max(0, depth + braces.opens - braces.closes);
    return result;
  });

  return `${formatted.join('\n')}\n`;
}

function scanBraces(line: string): { opens: number; closes: number; leadingClosures: number } {
  let opens = 0;
  let closes = 0;
  let leadingClosures = 0;
  let leading = true;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"' || character === "'") {
      leading = false;
      const end = findStringLiteralEnd(line, index);
      if (end !== undefined) index = end;
    } else if (character === '{') {
      leading = false;
      opens++;
    } else if (character === '}') {
      if (leading) leadingClosures++;
      closes++;
      leading = false;
    } else if (!/\s/.test(character)) {
      leading = false;
    }
  }

  return { opens, closes, leadingClosures };
}