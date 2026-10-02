import { parse as parseCsv } from 'csv-parse/sync';

import type { CsvTextCell } from './csvTextSerialization';
export type { CsvTextCell } from './csvTextSerialization';

export interface DataTextParseIssue {
  message: string;
  code?: string;
  offset?: number;
  line?: number;
  duplicate?: boolean;
  dataPath?: string;
}

export interface DataTextParseResult<T> {
  value?: T;
  issue?: DataTextParseIssue;
}

interface JsonIssue extends DataTextParseIssue {
  offset: number;
}

class StrictJsonParser {
  private offset = 0;

  constructor(private readonly text: string) {}

  parse(): unknown {
    this.skipWhitespace();
    const value = this.parseValue('');
    this.skipWhitespace();
    if (this.offset !== this.text.length) this.fail('Unexpected content after JSON value');
    return value;
  }

  private parseValue(dataPath: string): unknown {
    this.skipWhitespace();
    const character = this.text[this.offset];
    if (character === '{') return this.parseObject(dataPath);
    if (character === '[') return this.parseArray(dataPath);
    if (character === '"') return this.parseString();
    if (character === 't') return this.parseLiteral('true', true);
    if (character === 'f') return this.parseLiteral('false', false);
    if (character === 'n') return this.parseLiteral('null', null);
    if (character === '-' || (character >= '0' && character <= '9')) return this.parseNumber();
    this.fail('Expected a JSON value', dataPath);
  }

  private parseObject(dataPath: string): Record<string, unknown> {
    this.offset++;
    this.skipWhitespace();
    const result: Record<string, unknown> = {};
    const keys = new Set<string>();
    if (this.consume('}')) return result;
    while (true) {
      this.skipWhitespace();
      if (this.text[this.offset] !== '"') this.fail('Expected a quoted object key', dataPath);
      const keyOffset = this.offset;
      const key = this.parseString();
      const propertyPath = `${dataPath}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      if (keys.has(key)) throw { message: `Duplicate JSON object key '${key}'`, offset: keyOffset, duplicate: true, dataPath: propertyPath } satisfies JsonIssue;
      keys.add(key);
      this.skipWhitespace();
      if (!this.consume(':')) this.fail("Expected ':' after object key", propertyPath);
      Object.defineProperty(result, key, {
        value: this.parseValue(propertyPath), enumerable: true, configurable: true, writable: true
      });
      this.skipWhitespace();
      if (this.consume('}')) return result;
      if (!this.consume(',')) this.fail("Expected ',' or '}' in object", dataPath);
    }
  }

  private parseArray(dataPath: string): unknown[] {
    this.offset++;
    this.skipWhitespace();
    const result: unknown[] = [];
    if (this.consume(']')) return result;
    while (true) {
      result.push(this.parseValue(`${dataPath}/${result.length}`));
      this.skipWhitespace();
      if (this.consume(']')) return result;
      if (!this.consume(',')) this.fail("Expected ',' or ']' in array", dataPath);
    }
  }

  private parseString(): string {
    const start = this.offset++;
    while (this.offset < this.text.length) {
      const code = this.text.charCodeAt(this.offset++);
      if (code === 0x22) {
        try { return JSON.parse(this.text.slice(start, this.offset)) as string; }
        catch { this.fail('Invalid JSON string'); }
      }
      if (code < 0x20) this.fail('Unescaped control character in JSON string');
      if (code === 0x5c) {
        const escape = this.text[this.offset++];
        if (escape === 'u') {
          const hex = this.text.slice(this.offset, this.offset + 4);
          if (!/^[0-9A-Fa-f]{4}$/.test(hex)) this.fail('Invalid Unicode escape');
          this.offset += 4;
        } else if (!['"', '\\', '/', 'b', 'f', 'n', 'r', 't'].includes(escape)) {
          this.fail('Invalid JSON escape');
        }
      }
    }
    this.fail('Unterminated JSON string');
  }

  private parseNumber(): number {
    const match = this.text.slice(this.offset).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) this.fail('Invalid JSON number');
    this.offset += match[0].length;
    return Number(match[0]);
  }

  private parseLiteral<T>(literal: string, value: T): T {
    if (!this.text.startsWith(literal, this.offset)) this.fail(`Invalid JSON token '${this.text[this.offset] ?? ''}'`);
    this.offset += literal.length;
    return value;
  }

  private skipWhitespace(): void {
    while (/[\t\n\r ]/.test(this.text[this.offset] ?? '\0')) this.offset++;
  }

  private consume(character: string): boolean {
    if (this.text[this.offset] !== character) return false;
    this.offset++;
    return true;
  }

  private fail(message: string, dataPath?: string): never {
    throw { message, offset: this.offset, dataPath } satisfies JsonIssue;
  }
}

function safeText(value: string): string {
  return value.replace(/[\x00-\x1f\x7f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`).slice(0, 160);
}

function lineAt(text: string, offset: number): number {
  return text.slice(0, offset).split('\n').length;
}

function hasBareCarriageReturn(text: string): boolean {
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '"') {
      if (quoted && text[index + 1] === '"') index++;
      else quoted = !quoted;
    } else if (text[index] === '\r' && !quoted && text[index + 1] !== '\n') {
      return true;
    }
  }
  return false;
}

export function parseStrictJsonText(text: string): DataTextParseResult<unknown> {
  try { return { value: new StrictJsonParser(text).parse() }; }
  catch (error) {
    const issue = error as Partial<JsonIssue>;
    return { issue: {
      message: typeof issue.message === 'string' ? issue.message : 'Malformed JSON',
      offset: Number.isSafeInteger(issue.offset) ? issue.offset : 0,
      duplicate: issue.duplicate,
      dataPath: issue.dataPath
    } };
  }
}

export function parseStrictCsvText(text: string): DataTextParseResult<CsvTextCell[][]> {
  if (hasBareCarriageReturn(text)) {
    const offset = text.indexOf('\r');
    return { issue: { message: 'Bare CR record separators are not valid CSV', offset, line: lineAt(text, offset) } };
  }
  try {
    const rows = parseCsv(text, {
      bom: true,
      columns: false,
      skip_empty_lines: false,
      relax_column_count: true,
      record_delimiter: ['\r\n', '\n'],
      cast: (value, field) => ({ value, quoted: field.quoting })
    }) as unknown as CsvTextCell[][];
    return { value: rows };
  } catch (error) {
    const csvError = error as { message?: string; lines?: number };
    return { issue: { message: `Malformed CSV: ${safeText(csvError.message ?? 'parse error')}`, line: csvError.lines } };
  }
}
