import {
  SourceLocation,
  V02ExpressionNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  ConditionalExpressionNode,
  ListLiteralNode,
  FunctionCallNode,
  RangeExpressionNode,
  MatchExpressionNode,
  MatchCaseNode
} from '../ast/types';
import { parseForExpression } from './parseFor';

type Token =
  | { type: 'number'; value: number; text: string; offset: number }
  | { type: 'string'; value: string; text: string; offset: number }
  | { type: 'boolean'; value: boolean; text: string; offset: number }
  | { type: 'identifier'; name: string; text: string; offset: number }
  | { type: 'null'; text: string; offset: number }
  | { type: 'forExpression'; value: string; text: string }
  | { type: 'matchExpression'; value: string; text: string; offset: number }
  | { type: 'operator'; op: string; text: string }
  | { type: 'keyword'; word: 'and' | 'or' | 'not' | 'if' | 'then' | 'else'; text: string }
  | { type: 'lparen' | 'rparen' | 'lbracket' | 'rbracket' | 'lbrace' | 'rbrace' | 'colon' | 'dot' | 'comma' | 'eof'; text?: string; offset?: number };

function tokenize(text: string, source?: SourceLocation): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = text.length;

  function skipWs() {
    while (i < len && /\s/.test(text[i])) i++;
  }

  while (i < len) {
    skipWs();
    if (i >= len) break;

    const ch = text[i];

    if (text.startsWith('for', i) && !/[A-Za-z0-9_]/.test(text[i + 3] ?? '')) {
      const end = findForExpressionEnd(text, i);
      const loopText = text.slice(i, end + 1);
      tokens.push({ type: 'forExpression', value: loopText, text: loopText });
      i = end + 1;
      continue;
    }

    if (text.startsWith('match', i) && !/[A-Za-z0-9_]/.test(text[i + 5] ?? '')) {
      const end = findMatchExpressionEnd(text, i, source);
      const matchText = text.slice(i, end + 1);
      tokens.push({ type: 'matchExpression', value: matchText, text: matchText, offset: i });
      i = end + 1;
      continue;
    }

    // Number literal: digits, optional decimal part. No sign here (unary minus is separate).
    if (/\d/.test(ch)) {
      let j = i;
      while (j < len && /\d/.test(text[j])) j++;
      if (text[j] === '.') {
        j++;
        while (j < len && /\d/.test(text[j])) j++;
      }
      const numStr = text.slice(i, j);
      tokens.push({ type: 'number', value: Number(numStr), text: numStr, offset: i });
      i = j;
      continue;
    }

    // String literal "..." or '...'
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      let str = '';
      while (j < len && text[j] !== quote) {
        str += text[j];
        j++;
      }
      if (j >= len) {
        throw new Error('Unterminated string literal');
      }
      tokens.push({ type: 'string', value: str, text: text.slice(i, j + 1), offset: i });
      i = j + 1;
      continue;
    }

    // Identifier or boolean literal
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < len && /[A-Za-z0-9_]/.test(text[j])) j++;
      const word = text.slice(i, j);
      if (word === 'true') {
        tokens.push({ type: 'boolean', value: true, text: word, offset: i });
      } else if (word === 'false') {
        tokens.push({ type: 'boolean', value: false, text: word, offset: i });
      } else if (word === 'null') {
        tokens.push({ type: 'null', text: word, offset: i });
      } else if (word === 'and' || word === 'or' || word === 'not' || word === 'if' || word === 'then' || word === 'else') {
        tokens.push({ type: 'keyword', word: word as any, text: word });
      } else {
        tokens.push({ type: 'identifier', name: word, text: word, offset: i });
      }
      i = j;
      continue;
    }

    // Two-character comparison operators
    if (ch === '=' || ch === '!' || ch === '>' || ch === '<') {
      const two = text.slice(i, i + 2);
      if (two === '==' || two === '!=' || two === '>=' || two === '<=') {
        tokens.push({ type: 'operator', op: two, text: two });
        i += 2;
        continue;
      }
    }

    // Single-character comparison operators (bare > < after two-char check)
    if (ch === '>' || ch === '<') {
      tokens.push({ type: 'operator', op: ch, text: ch });
      i++;
      continue;
    }

    // Single-character operators and grouping
    if ('+-*/%^()[].,{}:'.includes(ch)) {
      if (ch === '(') {
        tokens.push({ type: 'lparen', text: ch });
      } else if (ch === ')') {
        tokens.push({ type: 'rparen', text: ch });
      } else if (ch === '[') {
        tokens.push({ type: 'lbracket', text: ch });
      } else if (ch === ']') {
        tokens.push({ type: 'rbracket', text: ch });
      } else if (ch === ',') {
        tokens.push({ type: 'comma', text: ch });
      } else if (ch === '{' || ch === '}' || ch === ':' || ch === '.') {
        tokens.push({ type: ({ '{': 'lbrace', '}': 'rbrace', ':': 'colon', '.': 'dot' } as const)[ch as '{' | '}' | ':' | '.'], text: ch, offset: i });
      } else {
        tokens.push({ type: 'operator', op: ch, text: ch });
      }
      i++;
      continue;
    }

    throw new Error(`Unexpected character '${ch}' in expression at position ${i}`);
  }

  tokens.push({ type: 'eof' } as Token);
  return tokens;
}

function findForExpressionEnd(text: string, start: number): number {
  let open = -1;
  let depth = 0;
  let quote: string | undefined;
  let escaped = false;

  for (let index = start; index < text.length; index++) {
    const character = text[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{') {
      if (open === -1) open = index;
      depth++;
    } else if (character === '}' && open !== -1) {
      depth--;
      if (depth === 0) return index;
    }
  }
  throw new Error(`Unclosed braced expression`);
}

function findMatchExpressionEnd(text: string, start: number, source?: SourceLocation): number {
  let quote: string | undefined;
  const braces: boolean[] = [];
  let parentheses = 0;
  let pendingMatches = 0;
  let pendingFor = false;
  for (let index = start; index < text.length; index++) {
    const character = text[index];
    if (quote) {
      if (character === quote && text[index - 1] !== '\\') quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(') parentheses++;
    else if (character === ')') parentheses--;
    else if (text.startsWith('match', index)
      && !/[A-Za-z0-9_]/.test(text[index - 1] ?? '')
      && !/[A-Za-z0-9_]/.test(text[index + 5] ?? '')) {
      pendingMatches++;
      index += 4;
    } else if (text.startsWith('for', index)
      && !/[A-Za-z0-9_]/.test(text[index - 1] ?? '')
      && !/[A-Za-z0-9_]/.test(text[index + 3] ?? '')) {
      pendingFor = true;
      index += 2;
    } else if (character === '{') {
      braces.push(!pendingFor && (parentheses === 0 || pendingMatches > 1));
      pendingFor = false;
    } else if (character === '}') {
      if (braces.pop()) pendingMatches--;
      if (braces.length === 0 && pendingMatches === 0 && parentheses === 0) return index;
    }
  }
  const position = locationAt(text, start, source);
  throw new Error(`Unclosed match expression at ${position.line}:${position.column}`);
}

function locationAt(text: string, offset: number, source?: SourceLocation): SourceLocation {
  const before = text.slice(0, offset).split(/\r?\n/);
  return {
    line: (source?.line ?? 1) + before.length - 1,
    column: (before.length === 1 ? source?.column ?? 1 : 1) + before[before.length - 1].length
  };
}

function parseMatchExpression(text: string, source?: SourceLocation): MatchExpressionNode {
  let open = -1;
  let depth = 0;
  let quote: string | undefined;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quote) {
      if (character === quote && text[index - 1] !== '\\') quote = undefined;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{') {
      if (depth === 0) open = index;
      depth++;
    } else if (character === '}') {
      depth--;
    }
  }
  const fail = (message: string, offset: number): never => {
    const position = locationAt(text, offset, source);
    throw new Error(`${message} at ${position.line}:${position.column}`);
  };
  if (open < 0 || depth !== 0) fail('Malformed match braces', 0);
  const scrutineeText = text.slice(5, open).trim();
  if (!scrutineeText) fail('Missing match scrutinee', 5);
  const scrutineeOffset = text.indexOf(scrutineeText, 5);
  const expression = parseExpression(scrutineeText, locationAt(text, scrutineeOffset, source));
  const body = text.slice(open + 1, -1);
  if (!/^[ \t]*\r?\n/.test(body) || !/\r?\n[ \t]*$/.test(body)) fail('Match arms require newlines', open + 1);

  const arms: { text: string; offset: number }[] = [];
  let armStart = open + 1;
  depth = 0;
  quote = undefined;
  for (let index = armStart; index < text.length - 1; index++) {
    const character = text[index];
    if (quote) {
      if (character === quote && text[index - 1] !== '\\') quote = undefined;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{') depth++;
    else if (character === '}') depth--;
    else if (character === '\n' && depth === 0) {
      if (text.slice(armStart, index).trim()) arms.push({ text: text.slice(armStart, index), offset: armStart });
      armStart = index + 1;
    }
  }
  if (text.slice(armStart, -1).trim()) fail('Match arm must end with a newline', armStart);

  const cases: MatchCaseNode[] = [];
  let defaultExpression: V02ExpressionNode | undefined;
  let defaultSource: SourceLocation | undefined;
  const parseBranch = (branch: string, offset: number): V02ExpressionNode => {
    try {
      return parseExpression(branch, locationAt(text, offset, source));
    } catch (error) {
      return fail(`Invalid match arm expression: ${error instanceof Error ? error.message : String(error)}`, offset);
    }
  };
  for (const arm of arms) {
    const leading = arm.text.length - arm.text.trimStart().length;
    const armOffset = arm.offset + leading;
    const armText = arm.text.trim();
    const armSource = locationAt(text, armOffset, source);
    const arrow = armText.indexOf('=>');
    if (arrow < 0) fail('Expected => in match arm', armOffset);
    const pattern = armText.slice(0, arrow).trim();
    const branch = armText.slice(arrow + 2).trim();
    if (!branch) fail('Missing match arm expression', armOffset + arrow + 2);
    const branchOffset = armOffset + armText.indexOf(branch, arrow + 2);
    if (pattern === 'default') {
      if (defaultExpression) fail('Duplicate default match arm', armOffset);
      defaultSource = armSource;
      defaultExpression = parseBranch(branch, branchOffset);
    } else {
      const literal = pattern.match(/^case\s+(-?(?:\d+(?:\.\d*)?)|"[^"\n]*"|'[^'\n]*'|true|false)$/);
      if (!literal) return fail('Match case requires a number, string, or boolean literal', armOffset);
      const valueOffset = armOffset + armText.indexOf(literal[1]);
      const valueSource = locationAt(text, valueOffset, source);
      const value: MatchCaseNode['value'] = /^-?\d/.test(literal[1])
        ? { type: 'numberLiteral', value: Number(literal[1]), source: valueSource }
        : literal[1] === 'true' || literal[1] === 'false'
          ? { type: 'booleanLiteral', value: literal[1] === 'true', source: valueSource }
          : { type: 'stringLiteral', value: literal[1].slice(1, -1), source: valueSource };
      cases.push({ value, expression: parseBranch(branch, branchOffset), source: armSource });
    }
  }
  if (!defaultExpression) return fail('Match requires exactly one default arm', 0);
  return { type: 'matchExpression', expression, cases, defaultExpression, defaultSource, source };
}

export function parseExpression(text: string, source?: SourceLocation): V02ExpressionNode {
  const tokens = tokenize(text, source);
  let pos = 0;

  function current(): Token {
    return tokens[pos];
  }

  function advance() {
    pos++;
  }

  function consumeRParen() {
    const t = current();
    if (t.type !== 'rparen') {
      throw new Error(`Expected ')' but got ${t.type}`);
    }
    advance();
  }

  // Full precedence (highest to lowest) per Sprint 004 / language-spec-v0.1.md:
  // parentheses, function calls (handled in primary)
  // unary: - not
  // power: ^ (right-assoc)
  // * / %
  // + -
  // comparison: == != > >= < <=
  // logical and
  // logical or
  // conditional if/then/else (lowest)
  const PREC: Record<string, number> = {
    // comparisons
    '==': 2,
    '!=': 2,
    '>': 2,
    '>=': 2,
    '<': 2,
    '<=': 2,
    // arithmetic
    '^': 5,
    '*': 4,
    '/': 4,
    '%': 4,
    '+': 3,
    '-': 3,
    // logicals (lower than comparisons)
    'and': 1,
    'or': 0
  };

  function isRightAssociative(op: string): boolean {
    return op === '^';
  }

  function parsePrimary(): V02ExpressionNode {
    const t = current();

    if (t.type === 'matchExpression') {
      advance();
      return parseMatchExpression(t.value, locationAt(text, t.offset, source));
    }

    if (t.type === 'forExpression') {
      advance();
      return parseForExpression(t.value, source);
    }

    if (t.type === 'number') {
      advance();
      return { type: 'numberLiteral', value: t.value, source: locationAt(text, t.offset, source) };
    }
    if (t.type === 'string') {
      advance();
      return { type: 'stringLiteral', value: t.value, source: locationAt(text, t.offset, source) };
    }
    if (t.type === 'boolean') {
      advance();
      return { type: 'booleanLiteral', value: t.value, source: locationAt(text, t.offset, source) };
    }
    if (t.type === 'null') {
      advance();
      return { type: 'nullLiteral', source: locationAt(text, t.offset, source) };
    }
    if (t.type === 'identifier') {
      const name = t.name;
      advance();

      if (current().type === 'lbrace') {
        advance();
        const fields: { name: string; expression: V02ExpressionNode; source?: SourceLocation }[] = [];
        while (current().type !== 'rbrace') {
          const field = current();
          if (field.type !== 'identifier') throw new Error('Expected constructor field name');
          advance();
          if (current().type !== 'colon') throw new Error('Expected : after constructor field');
          advance();
          fields.push({ name: field.name, expression: parseExpr(0), source: locationAt(text, field.offset, source) });
          if (current().type !== 'comma') break;
          advance();
        }
        if (current().type !== 'rbrace') throw new Error('Expected } after constructor fields');
        advance();
        return { type: 'recordConstructor', name, fields, source: locationAt(text, t.offset, source) };
      }

      // Function call: identifier followed by '('
      if (current().type === 'lparen') {
        advance(); // consume '('
        const args: V02ExpressionNode[] = [];
        if (current().type !== 'rparen') {
          while (true) {
            args.push(parseExpr(0));
            if (current().type === 'comma') {
              advance();
              continue;
            }
            break;
          }
        }
        if (current().type !== 'rparen') {
          throw new Error(`Expected ')' after function call arguments`);
        }
        advance(); // consume ')'
        return {
          type: 'functionCall',
          callee: name,
          arguments: args,
          source: locationAt(text, t.offset, source)
        } as FunctionCallNode;
      }

      return { type: 'identifier', name, source: locationAt(text, t.offset, source) };
    }
    if (t.type === 'lparen') {
      advance();
      const expr = parseExpr(0);
      consumeRParen();
      return expr;
    }
    if (t.type === 'lbracket') {
      advance();
      if (current().type === 'rbracket') {
        advance();
        return { type: 'listLiteral', elements: [], source } as ListLiteralNode;
      }

      const first = parseExpr(0);
      const rangeSeparator = current();
      if (rangeSeparator.type === 'identifier' && rangeSeparator.name === 'to') {
        advance();
        const end = parseExpr(0);
        if (current().type !== 'rbracket') {
          throw new Error(`Expected ']' after range expression`);
        }
        advance();
        return { type: 'rangeExpression', start: first, end, source } as RangeExpressionNode;
      }

      const elements: V02ExpressionNode[] = [first];
      while (current().type === 'comma') {
        advance();
        elements.push(parseExpr(0));
      }
      if (current().type !== 'rbracket') {
        throw new Error(`Expected ',' or ']' after list expression`);
      }
      advance();
      return { type: 'listLiteral', elements, source } as ListLiteralNode;
    }
    if (t.type === 'operator' && t.op === '-') {
      // Unary minus (higher precedence than ^)
      advance();
      const argument = parsePrimary();
      return {
        type: 'unaryExpression',
        operator: '-',
        argument,
        source
      } as UnaryExpressionNode;
    }
    if (t.type === 'keyword' && t.word === 'not') {
      // Unary not
      advance();
      const argument = parsePrimary();
      return {
        type: 'unaryExpression',
        operator: 'not',
        argument,
        source
      } as UnaryExpressionNode;
    }

    throw new Error(
      `Unexpected token in expression: ${t.type} ${(t as any).op || (t as any).name || (t as any).word || ''}`
    );
  }

  function parseExpr(minPrec: number): V02ExpressionNode {
    // Handle leading conditional (lowest precedence) before calling parsePrimary.
    // Conditionals only start at the top level of an expression (minPrec === 0).
    const t0 = current();
    if (minPrec === 0 && t0.type === 'keyword' && t0.word === 'if') {
      advance(); // consume 'if'
      const test = parseExpr(0);
      if (current().type !== 'keyword' || (current() as any).word !== 'then') {
        throw new Error(`Expected 'then' after if condition`);
      }
      advance(); // then
      const consequent = parseExpr(0);
      if (current().type !== 'keyword' || (current() as any).word !== 'else') {
        throw new Error(`Expected 'else' after then branch`);
      }
      advance(); // else
      const alternate = parseExpr(0);
      return {
        type: 'conditionalExpression',
        test,
        consequent,
        alternate,
        source
      } as ConditionalExpressionNode;
    }

    let left = parsePrimary();

    while (true) {
      const t = current();

      if (t.type === 'dot') {
        advance();
        const field = current();
        if (field.type !== 'identifier') throw new Error('Expected field name after .');
        advance();
        left = { type: 'fieldAccess', receiver: left, field: field.name, source: locationAt(text, t.offset ?? 0, source) };
        continue;
      }

      // Conditional appearing after a left-hand side (e.g. via lower-precedence context).
      // Guarded so it only triggers at the true top level.
      if (t.type === 'keyword' && t.word === 'if') {
        if (0 < minPrec) break;
        advance(); // consume 'if'
        const test = parseExpr(0);
        if (current().type !== 'keyword' || (current() as any).word !== 'then') {
          throw new Error(`Expected 'then' after if condition`);
        }
        advance(); // then
        const consequent = parseExpr(0);
        if (current().type !== 'keyword' || (current() as any).word !== 'else') {
          throw new Error(`Expected 'else' after then branch`);
        }
        advance(); // else
        const alternate = parseExpr(0);
        return {
          type: 'conditionalExpression',
          test,
          consequent,
          alternate,
          source
        } as ConditionalExpressionNode;
      }

      // Binary operators (arithmetic, comparison, logical keywords)
      if (t.type === 'operator') {
        const op = t.op;
        const prec = PREC[op];
        if (prec === undefined || prec < minPrec) break;

        advance(); // consume operator

        const nextMinPrec = isRightAssociative(op) ? prec : prec + 1;
        const right = parseExpr(nextMinPrec);

        left = {
          type: 'binaryExpression',
          operator: op as BinaryExpressionNode['operator'],
          left,
          right,
          source
        } as BinaryExpressionNode;
        continue;
      }

      if (t.type === 'keyword' && (t.word === 'and' || t.word === 'or')) {
        const op = t.word;
        const prec = PREC[op];
        if (prec === undefined || prec < minPrec) break;

        advance(); // consume keyword operator

        const nextMinPrec = prec + 1;
        const right = parseExpr(nextMinPrec);

        left = {
          type: 'binaryExpression',
          operator: op as BinaryExpressionNode['operator'],
          left,
          right,
          source
        } as BinaryExpressionNode;
        continue;
      }

      break;
    }

    return left;
  }

  const result = parseExpr(0);

  if (current().type !== 'eof') {
    throw new Error(`Unexpected input after expression at token ${current().type}`);
  }

  return result;
}

