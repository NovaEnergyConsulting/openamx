import {
  ExpressionNode,
  SourceLocation,
  BinaryExpressionNode,
  UnaryExpressionNode,
  ConditionalExpressionNode,
  ListLiteralNode,
  FunctionCallNode
} from '../ast/types';

type Token =
  | { type: 'number'; value: number; text: string }
  | { type: 'string'; value: string; text: string }
  | { type: 'boolean'; value: boolean; text: string }
  | { type: 'identifier'; name: string; text: string }
  | { type: 'operator'; op: string; text: string }
  | { type: 'keyword'; word: 'and' | 'or' | 'not' | 'if' | 'then' | 'else'; text: string }
  | { type: 'lparen' | 'rparen' | 'lbracket' | 'rbracket' | 'comma' | 'eof'; text?: string };

function tokenize(text: string): Token[] {
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

    // Number literal: digits, optional decimal part. No sign here (unary minus is separate).
    if (/\d/.test(ch)) {
      let j = i;
      while (j < len && /\d/.test(text[j])) j++;
      if (text[j] === '.') {
        j++;
        while (j < len && /\d/.test(text[j])) j++;
      }
      const numStr = text.slice(i, j);
      tokens.push({ type: 'number', value: Number(numStr), text: numStr });
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
      tokens.push({ type: 'string', value: str, text: text.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Identifier or boolean literal
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < len && /[A-Za-z0-9_]/.test(text[j])) j++;
      const word = text.slice(i, j);
      if (word === 'true') {
        tokens.push({ type: 'boolean', value: true, text: word });
      } else if (word === 'false') {
        tokens.push({ type: 'boolean', value: false, text: word });
      } else if (word === 'and' || word === 'or' || word === 'not' || word === 'if' || word === 'then' || word === 'else') {
        tokens.push({ type: 'keyword', word: word as any, text: word });
      } else {
        tokens.push({ type: 'identifier', name: word, text: word });
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
    if ('+-*/%^()[].,'.includes(ch)) {
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

export function parseExpression(text: string, source?: SourceLocation): ExpressionNode {
  const tokens = tokenize(text);
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

  function parsePrimary(): ExpressionNode {
    const t = current();

    if (t.type === 'number') {
      advance();
      return { type: 'numberLiteral', value: t.value, source };
    }
    if (t.type === 'string') {
      advance();
      return { type: 'stringLiteral', value: t.value, source };
    }
    if (t.type === 'boolean') {
      advance();
      return { type: 'booleanLiteral', value: t.value, source };
    }
    if (t.type === 'identifier') {
      const name = t.name;
      advance();

      // Function call: identifier followed by '('
      if (current().type === 'lparen') {
        advance(); // consume '('
        const args: ExpressionNode[] = [];
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
          source
        } as FunctionCallNode;
      }

      return { type: 'identifier', name, source };
    }
    if (t.type === 'lparen') {
      advance();
      const expr = parseExpr(0);
      consumeRParen();
      return expr;
    }
    if (t.type === 'lbracket') {
      // List literal [ expr, ... ]
      advance();
      const elements: ExpressionNode[] = [];
      if (current().type !== 'rbracket') {
        while (true) {
          elements.push(parseExpr(0));
          if (current().type === 'comma') {
            advance();
            continue;
          }
          break;
        }
      }
      if (current().type !== 'rbracket') {
        throw new Error(`Expected ']' after list literal`);
      }
      advance();
      return {
        type: 'listLiteral',
        elements,
        source
      } as ListLiteralNode;
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

  function parseExpr(minPrec: number): ExpressionNode {
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

