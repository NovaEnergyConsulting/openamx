const sourceLineBreak = /\r\n|[\r\n\u2028\u2029]/;

export function safeNarrativeComments(source: string): string[] {
  return source.split(sourceLineBreak).map(line => `// ${line}`);
}