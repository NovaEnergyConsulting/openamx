const sourceLineBreak = /\r\n|[\r\n\u2028\u2029]/;
export function safeNarrativeComments(source) {
    return source.split(sourceLineBreak).map(line => `// ${line}`);
}
//# sourceMappingURL=source.js.map