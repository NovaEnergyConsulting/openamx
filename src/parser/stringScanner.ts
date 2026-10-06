export function findStringLiteralEnd(text: string, start: number): number | undefined {
  const quote = text[start];
  if (quote !== '"' && quote !== "'") return undefined;

  for (let index = start + 1; index < text.length; index++) {
    const character = text[index];
    if (character === '\r' || character === '\n') return undefined;
    if (character === '\\') {
      if (index + 1 >= text.length || text[index + 1] === '\r' || text[index + 1] === '\n') return undefined;
      index++;
      continue;
    }
    if (character === quote) return index;
    if (quote === '"' && text.startsWith('${', index)) {
      const close = findInterpolationEnd(text, index + 2);
      if (close === undefined) return undefined;
      index = close;
    }
  }
  return undefined;
}

export function findInterpolationEnd(text: string, start: number): number | undefined {
  const delimiters: string[] = [];
  let quote: string | undefined;
  let escaped = false;

  for (let index = start; index < text.length; index++) {
    const character = text[index];
    if (character === '\r' || character === '\n') return undefined;
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '(' || character === '[' || character === '{') delimiters.push(character);
    else if (character === '}' && delimiters[delimiters.length - 1] === '{') delimiters.pop();
    else if (character === '}' && delimiters.length === 0) return index;
    else if ((character === ')' && delimiters[delimiters.length - 1] === '(')
      || (character === ']' && delimiters[delimiters.length - 1] === '[')) delimiters.pop();
  }
  return undefined;
}

export function withoutStringLiterals(text: string): string {
  let result = '';
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '"' || text[index] === "'") {
      const end = findStringLiteralEnd(text, index);
      if (end === undefined) break;
      index = end;
    } else {
      result += text[index];
    }
  }
  return result;
}
