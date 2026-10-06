import { describe, expect, it } from 'bun:test';
import { formatAmx } from '../src/formatter/formatAmx';
import { parseStatements } from '../src/parser/parseStatements';
import { parseDocumentText } from '../src/parser/parseDocument';
import { evaluateDocument } from '../src/runtime/evaluateDocument';

describe('formatAmx', () => {
  it('normalizes line endings, edge whitespace, and final newline', () => {
    expect(formatAmx('\r\n  let value = 1  \r\n\r\n  value += 2\r\n\r\n'))
      .toBe('let value = 1\n\nvalue += 2\n');
    expect(formatAmx(' \r\n\t\r\n')).toBe('');
      expect(formatAmx('let first = 1\rlet second = 2')).toBe('let first = 1\nlet second = 2\n');
  });

  it('formats nested for and match bodies and remains idempotent', () => {
    const source = [
      'let values = for item in [1, 2] {',
      '  return match item {',
      '    case 1 => "}"',
      '    default => "{"',
      '  }',
      '}'
    ].join('\n');
    const expected = [
      'let values = for item in [1, 2] {',
      '  return match item {',
      '    case 1 => "}"',
      '    default => "{"',
      '  }',
      '}',
      ''
    ].join('\n');
    const formatted = formatAmx(source);

    expect(formatted).toBe(expected);
    expect(formatAmx(formatted)).toBe(formatted);
    expect(() => parseStatements(formatted)).not.toThrow();
  });

  it('preserves expression spelling and braces inside strings', () => {
    const source = ['  let text = "{ not a block }"  ', '  let total=1+2'].join('\n');
    const formatted = formatAmx(source);

    expect(formatted).toBe('let text = "{ not a block }"\nlet total=1+2\n');
    expect(() => parseStatements(formatted)).not.toThrow();
  });

  it('preserves interpolation meaning and remains idempotent', () => {
    const source = [
      'type Box {',
      'name: String',
      'value: Number',
      '}',
      'let total: Number = 1 + 2',
      'let label: String = "total=${total}; nested=${Box { name = "brace }", value = total }.name}"'
    ].join('\n');
    const formatted = formatAmx(source);
    const evaluate = (text: string) => evaluateDocument(parseDocumentText(`\`\`\`amx\n${text}\n\`\`\``));

    expect(formatAmx(formatted)).toBe(formatted);
    expect(evaluate(formatted)).toEqual(evaluate(source));
  });

  it('formats parser-valid V0.3 declarations and braced expressions idempotently', () => {
    const source = [
      'import { Asset } from "./model.amx"',
      'input assets: Asset[]',
      'export type LocalAsset {',
      'name: String',
      'count: Number',
      '}',
      'type Envelope {',
      'asset: LocalAsset',
      '}',
      'fn label(asset: LocalAsset): String = asset.name',
      'let item: Envelope = Envelope { asset = LocalAsset { name = "pump", count = 1 + 2 } }',
      'let selected = match 1 {',
      'case 1 => "one"',
      'default => "other"',
      '}'
    ].join('\n');
    const expected = [
      'import { Asset } from "./model.amx"',
      'input assets: Asset[]',
      'export type LocalAsset {',
      '  name: String',
      '  count: Number',
      '}',
      'type Envelope {',
      '  asset: LocalAsset',
      '}',
      'fn label(asset: LocalAsset): String = asset.name',
      'let item: Envelope = Envelope { asset = LocalAsset { name = "pump", count = 1 + 2 } }',
      'let selected = match 1 {',
      '  case 1 => "one"',
      '  default => "other"',
      '}',
      ''
    ].join('\n');
    const formatted = formatAmx(source);

    expect(formatted).toBe(expected);
    expect(formatAmx(formatted)).toBe(formatted);
    expect(() => parseStatements(formatted)).not.toThrow();
  });

  it('formats parser-valid V0.4 visualization declarations and show', () => {
    const source = [
      'type Asset {',
      'id: String',
      '}',
      'let assets: Asset[] = []',
      'table register = table(assets) {',
      'title: "Register"',
      'column id as "Asset"',
      '}',
      'show register'
    ].join('\n');
    const formatted = formatAmx(source);
    expect(formatted).toBe([
      'type Asset {',
      '  id: String',
      '}',
      'let assets: Asset[] = []',
      'table register = table(assets) {',
      '  title: "Register"',
      '  column id as "Asset"',
      '}',
      'show register',
      ''
    ].join('\n'));
    expect(formatAmx(formatted)).toBe(formatted);
    expect(() => parseStatements(formatted)).not.toThrow();
  });

  it('formats valid multiline constructors idempotently and refuses legacy constructor colons', () => {
    const source = [
      'let item = Outer {',
      'inner = Inner {',
      'name = "braces } and commas, are string data",',
      '},',
      'values = [1, 2],',
      '}'
    ].join('\n');
    const formatted = formatAmx(source);
    expect(formatted).toBe([
      'let item = Outer {',
      '  inner = Inner {',
      '    name = "braces } and commas, are string data",',
      '  },',
      '  values = [1, 2],',
      '}',
      ''
    ].join('\n'));
    expect(formatAmx(formatted)).toBe(formatted);
    expect(() => formatAmx('let item = Item { field: 1 }')).toThrow(expect.objectContaining({ code: 'AMX3006' }));
  });

  it('preserves evaluated meaning when formatting a typed multiline record', () => {
    const source = [
      'type Point {',
      'x: Number',
      'y: Number',
      '}',
      'let point: Point = Point {',
      'x = (1 + 2),',
      'y = 4,',
      '}'
    ].join('\n');
    const formatted = formatAmx(source);
    const evaluate = (text: string) => evaluateDocument(parseDocumentText(`\`\`\`amx\n${text}\n\`\`\``));

    expect(evaluate(formatted)).toEqual(evaluate(source));
  });
});