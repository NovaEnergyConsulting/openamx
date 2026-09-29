import { describe, expect, it } from 'bun:test';
import { formatAmx } from '../src/formatter/formatAmx';
import { parseStatements } from '../src/parser/parseStatements';

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
      'let item: Envelope = Envelope { asset: LocalAsset { name: "pump", count: 1 + 2 } }',
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
      'let item: Envelope = Envelope { asset: LocalAsset { name: "pump", count: 1 + 2 } }',
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
});