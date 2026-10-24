import { describe, expect, it } from 'bun:test';
import { AmxError } from '../src/diagnostics/errors';
import { sourceTokenRange } from '../src/editor/sourceRanges';
import { parseDocumentText } from '../src/parser/parseDocument';
import { checkDocument } from '../src/typechecker/checkDocument';

function sourceFor(body: string): string {
  return `\`\`\`amx\n${body}\n\`\`\`\n`;
}

function checkBody(body: string): void {
  const document = parseDocumentText(sourceFor(body));
  checkDocument(document, 'function-body-type-checking.amx');
}

function captureAmxError(action: () => void): AmxError {
  try {
    action();
  } catch (error) {
    if (error instanceof AmxError) return error;
    throw error;
  }
  throw new Error('Expected an AMX diagnostic');
}

function expectDiagnostic(
  body: string,
  code: string,
  message: string,
  rawLine: number,
  column: number,
  token?: string
): void {
  const source = sourceFor(body);
  const error = captureAmxError(() => {
    const document = parseDocumentText(source);
    checkDocument(document, 'function-body-type-checking.amx');
  });
  expect(error).toMatchObject({
    code,
    message,
    file: 'function-body-type-checking.amx',
    line: rawLine + 1,
    column
  });
  if (token) {
    const range = sourceTokenRange(source, { line: rawLine + 1, column }, token);
    expect(range).toBeDefined();
    if (!range) throw new Error(`Expected source range for '${token}'`);
    expect(source.slice(range.from, range.to)).toBe(token);
  }
}

describe('Sprint 098 function-body return checking', () => {
  it('reports a missing return at the function closing brace', () => {
    expectDiagnostic([
      'fn maybe(value: Number): Number {',
      '  if value > 0 {',
      '    return value',
      '  }',
      '}'
    ].join('\n'), 'AMXF4001', 'Missing return value from function', 5, 1, '}');
  });

  it('accepts direct returns and if/else branches that both return', () => {
    expect(() => checkBody([
      'fn direct(value: Number): Number {',
      '  return value',
      '}',
      'fn choose(value: Number): Number {',
      '  if value > 0 {',
      '    return value',
      '  } else {',
      '    return 0',
      '  }',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('allows later returns to close partial and nested branch paths', () => {
    expect(() => checkBody([
      'fn nested(a: Boolean, b: Boolean): Number {',
      '  if a {',
      '    if b {',
      '      return 1',
      '    }',
      '  } else {',
      '    return 0',
      '  }',
      '  return 2',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('reports a missing path left by a nested partial branch', () => {
    expectDiagnostic([
      'fn nested(a: Boolean, b: Boolean): Number {',
      '  if a {',
      '    if b {',
      '      return 1',
      '    }',
      '  } else {',
      '    return 0',
      '  }',
      '}'
    ].join('\n'), 'AMXF4001', 'Missing return value from function', 9, 1, '}');
  });

  it('treats statement loops as possibly empty and accepts a later fallback', () => {
    expectDiagnostic([
      'fn first(values: Number[]): Number {',
      '  for value in values {',
      '    return value',
      '  }',
      '}'
    ].join('\n'), 'AMXF4001', 'Missing return value from function', 5, 1, '}');

    expect(() => checkBody([
      'fn firstOrDefault(values: Number[]): Number {',
      '  for value in values {',
      '    return value',
      '  }',
      '  return 0',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('checks incompatible explicit returns, including unreachable returns', () => {
    expectDiagnostic([
      'fn invalid(value: Number): Number {',
      '  if value > 0 {',
      '    return "positive"',
      '  } else {',
      '    return 0',
      '  }',
      '}'
    ].join('\n'), 'AMX3002', 'Expected Number, got String', 3, 12, '"positive"');

    expectDiagnostic([
      'fn result(): Number {',
      '  return 5',
      '  return "unreachable"',
      '}'
    ].join('\n'), 'AMX3002', 'Expected Number, got String', 3, 10, '"unreachable"');
  });

  it('checks unreachable non-return statements without reopening flow', () => {
    expectDiagnostic([
      'fn result(): Number {',
      '  return 5',
      '  missing = 1',
      '}'
    ].join('\n'), 'AMX3001', "Unknown identifier 'missing'", 3, 3, 'missing');

    expect(() => checkBody([
      'fn result(): Number {',
      '  let values = [1]',
      '  return 5',
      '  add 2 to values',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('checks unreachable expressions for unknown functions', () => {
    expectDiagnostic([
      'fn result(): Number {',
      '  return 5',
      '  let unused = later()',
      '}'
    ].join('\n'), 'AMX3004', "Unknown function 'later'", 3, 16, 'later');
  });

  it('preserves statement branch and loop scopes, assignment, and repeated let', () => {
    expect(() => checkBody([
      'fn scoped(value: String): String {',
      '  let result = 1',
      '  let result = result + 1',
      '  if true {',
      '    let local = 8',
      '    result = local',
      '    result += 1',
      '  } else {',
      '    let local = 9',
      '  }',
      '  for value in [7] {',
      '    let observed = value',
      '  }',
      '  return value',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('does not expose a branch-local binding after its scope closes', () => {
    expectDiagnostic([
      'fn scoped(): Number {',
      '  if true {',
      '    let local = 8',
      '  }',
      '  return local',
      '}'
    ].join('\n'), 'AMX3001', "Unknown identifier 'local'", 5, 10, 'local');
  });

  it('restores cross-type nested shadows after their lexical block', () => {
    expect(() => checkBody([
      'fn shadow(value: Boolean): Number {',
      '  if true {',
      '    let value: String = "inner"',
      '    let observed: String = value',
      '  }',
      '  return if value then 1 else 0',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('keeps function locals isolated from document bindings and later declarations', () => {
    expectDiagnostic([
      'let outside = 1',
      'fn capture(): Number {',
      '  return outside',
      '}'
    ].join('\n'), 'AMX3001', "Unknown identifier 'outside'", 3, 10, 'outside');

    expectDiagnostic([
      'fn first(): Number {',
      '  return later()',
      '}',
      'fn later(): Number {',
      '  return 1',
      '}'
    ].join('\n'), 'AMX3004', "Unknown function 'later'", 2, 10, 'later');

    expectDiagnostic([
      'fn repeat(value: Number): Number {',
      '  return repeat(value)',
      '}'
    ].join('\n'), 'AMX3004', "Unknown function 'repeat'", 2, 10, 'repeat');
  });

  it('keeps braced-if expression returns local to the expression', () => {
    expect(() => checkBody([
      'fn choose(value: Number): Number {',
      '  let selected: Number = if value > 0 {',
      '    return 1',
      '  } else {',
      '    return 0',
      '  }',
      '  return selected + 10',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('accepts nullable and list return values using existing assignability', () => {
    expect(() => checkBody([
      'fn maybe(): String? {',
      '  return null',
      '}',
      'fn values(): Number[] {',
      '  return [1, 2]',
      '}'
    ].join('\n'))).not.toThrow();
  });

  it('uses existing measurement return assignability rules', () => {
    expect(() => checkBody([
      'dimension Length',
      'dimension Time',
      'unit meter: Length',
      'unit second: Time',
      'fn distance(): Length {',
      '  return 1 meter',
      '}'
    ].join('\n'))).not.toThrow();

    expectDiagnostic([
      'dimension Length',
      'dimension Time',
      'unit meter: Length',
      'unit second: Time',
      'fn duration(): Length {',
      '  return 1 second',
      '}'
    ].join('\n'), 'AMX3007', 'Expected Measurement<["function-body-type-checking.amx","Length"]^1>, got Measurement<["function-body-type-checking.amx","Time"]^1>', 6, 10, '1 second');
  });

  it('preserves expression-bodied function checking', () => {
    expect(() => checkBody('fn triple(value: Number): Number = value * 3')).not.toThrow();
  });

  it('reports the same missing-return location with CRLF source', () => {
    expectDiagnostic([
      'fn maybe(value: Number): Number {',
      '  if value > 0 {',
      '    return value',
      '  }',
      '}'
    ].join('\r\n'), 'AMXF4001', 'Missing return value from function', 5, 1, '}');
  });

  it('reports the same incompatible-return location with CRLF source', () => {
    expectDiagnostic([
      'fn invalid(): Number {',
      '  return "wrong"',
      '}'
    ].join('\r\n'), 'AMX3002', 'Expected Number, got String', 2, 10, '"wrong"');
  });

  it('checks empty statement bodies as fallthrough', () => {
    expectDiagnostic([
      'fn empty(): Number {',
      '}'
    ].join('\n'), 'AMXF4001', 'Missing return value from function', 2, 1, '}');
  });
});