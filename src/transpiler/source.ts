const sourceLineBreak = /\r\n|[\r\n\u2028\u2029]/;

export function normalizeParserLineSeparators(source: string): string {
  return source.replace(/\r\n|[\r\u2028\u2029]/g, '\n');
}

export function safeNarrativeComments(source: string): string[] {
  return source.split(sourceLineBreak).map(line => `// ${line}`);
}

export function rawFrontMatterComments(source: string): string[] {
  const lines = source.split(sourceLineBreak);
  if (lines[0]?.trim() !== '---') return [];
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (closingIndex < 0) return [];
  return safeNarrativeComments(lines.slice(0, closingIndex + 1).join('\n'));
}