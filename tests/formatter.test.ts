import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { formatAmx, formatAmxDocument } from '../src/formatter/formatAmx';
import { parseStatements } from '../src/parser/parseStatements';
import { parseDocumentText } from '../src/parser/parseDocument';
import { evaluateDocument } from '../src/runtime/evaluateDocument';

describe('formatAmxDocument', () => {
  it('formats the hello-world document without treating front matter as statements', () => {
    const source = readFileSync(new URL('../examples/hello-world.amx', import.meta.url), 'utf8');
    expect(formatAmxDocument(source)).toBe(source);
  });

  it('preserves surrounding text while formatting multiple blocks idempotently', () => {
    const prefix = '---\ntitle: "Formatting"\n---\n\n# Report  \n\n';
    const middle = '```\n\nNarrative {{ total }}.  \n\n```text\n  not executable  \n```\n\n   ```` amx  \n';
    const suffix = '  `````  \n\nFinal narrative without a newline';
    const first = '  let total = 1  \n';
    const second = 'type Box {\nvalue: Number\n}\n';
    const source = prefix + '```amx\n' + first + middle + second + suffix;
    const expected = prefix + '```amx\nlet total = 1\n' + middle + 'type Box {\n  value: Number\n}\n' + suffix;

    const formatted = formatAmxDocument(source);
    expect(formatted).toBe(expected);
    expect(formatAmxDocument(formatted)).toBe(formatted);
    expect(evaluateDocument(parseDocumentText(formatted))).toEqual(evaluateDocument(parseDocumentText(source)));
  });

  it('preserves CRLF in front matter, narrative, fences, and executable content', () => {
    const source = '---\r\ntitle: CRLF\r\n---\r\n# Report\r\n```amx\r\ntype Box {\r\nvalue: Number  \r\n}\r\n```\r\n';
    const expected = source.replace('value: Number  \r\n', '  value: Number\r\n');
    expect(formatAmxDocument(source)).toBe(expected);
    expect(formatAmxDocument(expected)).toBe(expected);
  });

  it('uses each executable block\'s own line endings', () => {
    const source = '# Mixed\r\n```amx\n  let first = 1  \n```\r\n```amx\r\n  let second = 2  \r\n```';
    expect(formatAmxDocument(source)).toBe('# Mixed\r\n```amx\nlet first = 1\n```\r\n```amx\r\nlet second = 2\r\n```');
  });

  it('leaves illustrative fences and documents without executable blocks unchanged', () => {
    const sources = [
      '',
      '  \r\n# Markdown  \r\n',
      '~~~amx\n  invalid syntax  \n~~~\n',
      '```AMX\n  invalid syntax  \n```\n',
      '```amx extra\n  invalid syntax  \n```\n',
      '````text\n```amx\ninvalid syntax\n```\n````\n',
      '~~~text\n```amx\ninvalid syntax\n```\n~~~\n',
      '    ```amx\n  illustrative text  \n    ```\n'
    ];
    for (const source of sources) expect(formatAmxDocument(source)).toBe(source);
  });

  it('handles empty executable blocks without changing fences or final newline state', () => {
    expect(formatAmxDocument('```amx\n```')).toBe('```amx\n```');
    expect(formatAmxDocument('```amx\r\n \r\n\r\n```\r\n')).toBe('```amx\r\n```\r\n');
  });

  it('rejects invalid later blocks with document-relative error locations', () => {
    const source = '# Report\n```amx\n  let first = 1  \n```\n```amx\ninvalid syntax\n```\n';
    expect(() => formatAmxDocument(source)).toThrow('Unsupported statement at 6:1');
  });

  it('rejects malformed front matter and unclosed executable fences', () => {
    expect(() => formatAmxDocument('---\ntitle: missing delimiter\n')).toThrow('Malformed front matter');
    expect(() => formatAmxDocument('---\ntitle: [\n---\n')).toThrow('Malformed front matter');
    expect(() => formatAmxDocument('# Report\n```amx\nlet value = 1\n')).toThrow('Unclosed amx fence at 2:1');
  });
});

describe('formatAmx', () => {
  it('preserves the legacy IF-V01 conditional expression formatting', () => {
    const source = 'let selected: String = if true then "yes" else "no"';
    expect(formatAmx(source)).toBe(`${source}\n`);
    expect(formatAmx(formatAmx(source))).toBe(`${source}\n`);
  });

  it('formats V0.12 declarations and braced conditionals without changing meaning', () => {
    const source = [
      'type Identifier {',
      'id: String',
      '}',
      'type Named {',
      'id: String',
      'name: String',
      '}',
      'type Asset extends Identifier, Named {',
      'override id: String',
      'status: Number',
      '}',
      'enum Status = {',
      'DRAFT,',
      'ACTIVE',
      '}',
      'let asset: Asset = Asset { id = "A-1", name = "Pump", status = Status.ACTIVE }',
      'let active: Boolean = Status.ACTIVE == 2',
      'let selected: String = if active {',
      ' return "yes"',
      '} else {',
      ' return "no"',
      '}',
      'let legacy: String = if true then "legacy" else "unchanged"',
      'let adjusted: Number = 1',
      'if active {',
      ' let local: Number = 2',
      ' adjusted += local',
      '}'
    ].join('\n');
    const expected = [
      'type Identifier {',
      '  id: String',
      '}',
      'type Named {',
      '  id: String',
      '  name: String',
      '}',
      'type Asset extends Identifier, Named {',
      '  override id: String',
      '  status: Number',
      '}',
      'enum Status = {',
      '  DRAFT,',
      '  ACTIVE',
      '}',
      'let asset: Asset = Asset { id = "A-1", name = "Pump", status = Status.ACTIVE }',
      'let active: Boolean = Status.ACTIVE == 2',
      'let selected: String = if active {',
      '  return "yes"',
      '} else {',
      '  return "no"',
      '}',
      'let legacy: String = if true then "legacy" else "unchanged"',
      'let adjusted: Number = 1',
      'if active {',
      '  let local: Number = 2',
      '  adjusted += local',
      '}',
      ''
    ].join('\n');
    const formatted = formatAmx(source);
    const evaluate = (text: string) => evaluateDocument(parseDocumentText(`\`\`\`amx\n${text}\n\`\`\``));

    expect(formatted).toBe(expected);
    expect(formatAmx(formatted)).toBe(formatted);
    expect(() => parseStatements(formatted)).not.toThrow();
    expect(evaluate(formatted)).toEqual(evaluate(source));
    expect(evaluate(formatted).selected).toBe('yes');
    expect(evaluate(formatted).legacy).toBe('legacy');
    expect(evaluate(formatted).adjusted).toBe(3);
  });

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

  it('formats V0.9 measurements and list mutation meaning-preservingly and idempotently', () => {
    const source = [
      'dimension Length',
      'unit meter: Length',
      'unit kilometer = 1000 * meter',
      'let distances: Length[] = [1 kilometer, 500 meter]',
      'add 2 meter to distances',
      'let selected: Length = distances[1]',
      'let converted = selected in meter',
      'remove 1 from distances'
    ].join('\n');
    const formatted = formatAmx(source);
    const evaluate = (text: string) => evaluateDocument(parseDocumentText(`\`\`\`amx\n${text}\n\`\`\``));

    expect(formatAmx(formatted)).toBe(formatted);
    expect(evaluate(formatted)).toEqual(evaluate(source));
    expect(() => parseStatements(formatted)).not.toThrow();
  });
});