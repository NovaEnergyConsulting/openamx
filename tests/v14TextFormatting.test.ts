import { describe, expect, it } from 'bun:test';
import { AmxError } from '../src/diagnostics/errors';
import { parseDocumentText } from '../src/parser/parseDocument';
import { evaluateDocument } from '../src/runtime/evaluateDocument';
import { isMeasurement, measurement, type MeasurementUnit } from '../src/runtime/measurement';
import { evaluateStandardLibraryCall } from '../src/runtime/standardLibrary';

function fixtureDocument(id: string, source: string) {
  return parseDocumentText(`---\nfixture: ${id}\n---\n\`\`\`amx\n${source}\n\`\`\`\n`);
}

function runFixture(id: string, source: string): Record<string, unknown> {
  return evaluateDocument(fixtureDocument(id, source), `${id}.amx`);
}

function expectDiagnostic(
  id: string,
  source: string,
  expected: { code: string; message: string; line: number; column: number }
): AmxError {
  return expectDocumentDiagnostic(
    id,
    `---\nfixture: ${id}\n---\n\`\`\`amx\n${source}\n\`\`\`\n`,
    expected
  );
}

function expectDocumentDiagnostic(
  id: string,
  document: string,
  expected: { code: string; message: string; line: number; column: number }
): AmxError {
  try {
    evaluateDocument(parseDocumentText(document), `${id}.amx`);
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    if (!(error instanceof AmxError)) throw error;
    expect(error.code).toBe(expected.code);
    expect(error.message).toBe(expected.message);
    expect(error.line).toBe(expected.line);
    expect(error.column).toBe(expected.column);
    expect(error.file).toBe(`${id}.amx`);
    return error;
  }
  throw new Error(`Expected ${expected.code} from ${id}`);
}

describe('Sprint 087 text and numeric formatting', () => {
  it('evaluates the approved text and format bindings with exact outputs', () => {
    const values = runFixture('MATH-TEXT-FORMAT-VALID-01', `dimension Length
unit meter: Length
unit centimeter = 0.01 * meter
unit ratio = meter / meter
let stringLength = len("A🙂B")
let listLength = len([1, 2, 3])
let firstTwo = left("A🙂B", 2)
let lastTwo = right("A🙂B", 2)
let defaultLeft = left("AMX")
let emptyRight = right("AMX", 0)
let oversizedLeft = left("A🙂B", 99)
let combiningLength = len("é")
let controlTrim = trim("\\t\\nAMX\\r")
let trimmed = trim(" AMX ")
let grouped = format(1234.5, "#,##0.00", "en-US")
let defaultLocale = format(1234.5, "#,##0.00")
let maxPrecision = format(1.234567, "0.000000", "en-US")
let groupedGerman = format(1234.5, "#,##0.00", "de-DE")
let groupedFrench = format(1234.5, "#,##0.00", "fr-FR")
let percent = format(0.125, "0.0%", "en-US")
let currency = format(1234.5, "$#,##0.00", "en-US")
let currencyMeasurement = format(1.25 meter, "$0.00", "en-US")
let euroPrefix = format(1, "€0.00", "en-US")
let poundPrefix = format(1, "£0.00", "en-US")
let negativeCurrency = format(-1234.5, "$#,##0.00", "en-US")
let roundedTie = format(1.125, "0.00", "en-US")
let negativeTie = format(-1.125, "0.00", "en-US")
let negativeZero = format(-0, "0.00", "en-US")
let formattedMeasurement = format(1.25 meter, "0.00", "en-US")
let percentMeasurement = format(1.25 meter, "0.0%", "en-US")
let scaledMeasurement = format(100 centimeter, "0.00", "en-US")`);

    expect(values).toMatchObject({
      stringLength: 3,
      listLength: 3,
      firstTwo: 'A🙂',
      lastTwo: '🙂B',
      defaultLeft: 'A',
      emptyRight: '',
      oversizedLeft: 'A🙂B',
      combiningLength: 2,
      controlTrim: 'AMX',
      trimmed: 'AMX',
      grouped: '1,234.50',
      defaultLocale: '1,234.50',
      maxPrecision: '1.234567',
      groupedGerman: '1.234,50',
      groupedFrench: '1\u202f234,50',
      percent: '12.5%',
      currency: '$1,234.50',
      currencyMeasurement: '$1.25 meter',
      euroPrefix: '€1.00',
      poundPrefix: '£1.00',
      negativeCurrency: '-$1,234.50',
      roundedTie: '1.13',
      negativeTie: '-1.13',
      negativeZero: '0.00',
      formattedMeasurement: '1.25 meter',
      percentMeasurement: '125.0% meter',
      scaledMeasurement: '100.00 centimeter'
    });
  });

  it('counts list elements and slices strings by code point, not grapheme cluster', () => {
    const values = runFixture('TEXT-CODEPOINT-BOUNDARIES-01', `let emptyLiteralLength = len([])
let empty: Number[] = []
let nested: Number[][] = [empty, [1]]
let nestedLength = len(nested)
let emptyLength = len(empty)
let firstBase = left("éx", 1)
let firstCombiningSequence = left("éx", 2)
let lastPoint = right("éx", 1)`);
    expect(values).toMatchObject({
      nestedLength: 2,
      emptyLiteralLength: 0,
      emptyLength: 0,
      firstBase: 'e',
      firstCombiningSequence: 'é',
      lastPoint: 'x'
    });
  });

  it('trims precisely the approved Unicode 15.1 White_Space set', () => {
    const points = [
      ...Array.from({ length: 5 }, (_, index) => 0x0009 + index),
      0x0020, 0x0085, 0x00a0, 0x1680,
      ...Array.from({ length: 11 }, (_, index) => 0x2000 + index),
      0x2028, 0x2029, 0x202f, 0x205f, 0x3000
    ];
    const whitespace = points.map(point => String.fromCodePoint(point)).join('');
    expect(evaluateStandardLibraryCall('trim', [`${whitespace}AMX${whitespace}`])).toBe('AMX');

    const excluded = '\ufeff\u180e';
    expect(evaluateStandardLibraryCall('trim', [`${whitespace}${excluded}AMX${excluded}${whitespace}`]))
      .toBe(`${excluded}AMX${excluded}`);
    expect(evaluateStandardLibraryCall('trim', [' \tA \tB\n'])).toBe('A \tB');
  });

  it('rounds from shortest decimal spellings and keeps formatting locale-independent', () => {
    const values = runFixture('FORMAT-ROUNDING-BOUNDARIES-01', `let positiveTie = format(2.675, "0.00")
let negativeTie = format(-2.675, "0.00")
let groupedFrench = format(1234567, "#,##0", "fr-FR")
let ungroupedLarge = format(1234567, "0", "en-US")`);
    expect(values).toMatchObject({
      positiveTie: '2.68',
      negativeTie: '-2.68',
      groupedFrench: '1\u202f234\u202f567',
      ungroupedLarge: '1234567'
    });
  });

  it('reports exact text arity, type, and invalid count diagnostics', () => {
    expectDiagnostic('TEXT-ARITY-01', 'let result = len()', {
      code: 'AMX3004', message: "Invalid arity for 'len'", line: 5, column: 14
    });
    expectDiagnostic('TEXT-TYPE-01', 'let result = len(1)', {
      code: 'AMX3002', message: 'len requires a String or list, got Number', line: 5, column: 18
    });
    expectDiagnostic('TEXT-COUNT-NEG-01', 'let result = left("A", -1)', {
      code: 'AMXSL003', message: 'Invalid text slice count', line: 5, column: 24
    });
    expectDiagnostic('TEXT-COUNT-FRACTION-01', 'let result = left("A", 1.5)', {
      code: 'AMXSL003', message: 'Invalid text slice count', line: 5, column: 24
    });
    expectDiagnostic('TEXT-COUNT-NONFINITE-01', 'let result = right("A", 1 / 0)', {
      code: 'AMXSL003', message: 'Invalid text slice count', line: 5, column: 25
    });
    expectDiagnostic('TEXT-COUNT-TYPE-01', 'let result = left("A", "one")', {
      code: 'AMXSL003', message: 'Invalid text slice count', line: 5, column: 24
    });
    expectDiagnostic('TEXT-COUNT-ARITY-EXTRA-01', 'let result = right("A", 1, 2)', {
      code: 'AMX3004', message: "Invalid arity for 'right'", line: 5, column: 14
    });
  });

  it('reports exact format arity, value, pattern, locale, and finite diagnostics', () => {
    expectDiagnostic('FORMAT-ARITY-01', 'let result = format(1)', {
      code: 'AMX3004', message: "Invalid arity for 'format'", line: 5, column: 14
    });
    expectDiagnostic('FORMAT-TYPE-01', 'let result = format("text", "0")', {
      code: 'AMX3002', message: 'format expects a Number or Measurement, got String', line: 5, column: 21
    });
    expectDiagnostic('FORMAT-MALFORMED-01', 'let result = format(1, "0.0.0")', {
      code: 'AMXSL004', message: 'Incorrect formatting pattern', line: 5, column: 24
    });
    expectDiagnostic('FORMAT-UNSUPPORTED-01', 'let result = format(1, "yyyy-mm-dd")', {
      code: 'AMXSL004', message: 'Incorrect formatting pattern', line: 5, column: 24
    });
    expectDiagnostic('FORMAT-PRECISION-OVERFLOW-01', 'let result = format(1.234567, "0.0000000")', {
      code: 'AMXSL004', message: 'Incorrect formatting pattern', line: 5, column: 31
    });
    expectDiagnostic('FORMAT-LOCALE-INVALID-01', 'let result = format(1, "0", "not a locale")', {
      code: 'AMXSL005',
      message: 'Formatting locale is malformed or unsupported',
      line: 5, column: 29
    });
    expectDiagnostic('FORMAT-LOCALE-UNSUPPORTED-01', 'let result = format(1, "0", "zz-ZZ")', {
      code: 'AMXSL005',
      message: 'Formatting locale is malformed or unsupported',
      line: 5, column: 29
    });
    expectDiagnostic('FORMAT-FINITE-01', 'let result = format(1 / 0, "0")', {
      code: 'AMXSL006', message: 'Input is non-finite', line: 5, column: 21
    });
    expectDiagnostic('FORMAT-ARITY-EXTRA-01', 'let result = format(1, "0", "en-US", "extra")', {
      code: 'AMX3004', message: "Invalid arity for 'format'", line: 5, column: 14
    });
  });

  it('rejects unsupported pattern forms and malformed locale values explicitly', () => {
    for (const pattern of ['"0"', '0E+00', '0;[Red]-0', '[>=1]0', '0.0000000', '0#']) {
      const encodedPattern = pattern.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
      expectDiagnostic('FORMAT-UNSUPPORTED-SYNTAX-01', `let result = format(1, "${encodedPattern}")`, {
        code: 'AMXSL004', message: 'Incorrect formatting pattern', line: 5, column: 24
      });
    }
    for (const locale of ['en', 'EN-us', 'fr_FR']) {
      expectDiagnostic('FORMAT-UNSUPPORTED-LOCALE-01', `let result = format(1, "0", "${locale}")`, {
        code: 'AMXSL005',
        message: 'Formatting locale is malformed or unsupported',
        line: 5, column: 29
      });
    }
    expectDiagnostic('FORMAT-PATTERN-TYPE-01', 'let result = format(1, 0)', {
      code: 'AMXSL004', message: 'Incorrect formatting pattern', line: 5, column: 24
    });
    expectDiagnostic('FORMAT-LOCALE-TYPE-01', 'let result = format(1, "0", false)', {
      code: 'AMXSL005',
      message: 'Formatting locale is malformed or unsupported',
      line: 5, column: 29
    });
  });

  it('defensively rejects malformed internal non-finite Measurement values', () => {
    const unit: MeasurementUnit = {
      scale: 1,
      vector: {},
      factors: [],
      text: 'meter'
    };
    const invalidValue = measurement(Number.POSITIVE_INFINITY, unit);
    expect(isMeasurement(invalidValue)).toBe(true);
    try {
      evaluateStandardLibraryCall('format', [invalidValue, '0']);
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      if (!(error instanceof AmxError)) throw error;
      expect(error).toMatchObject({ code: 'AMXSL006', message: 'Input is non-finite' });
      return;
    }
    throw new Error('Expected AMXSL006 from non-finite internal Measurement');
  });

  it('rejects percent scaling that produces a non-finite formatted value', () => {
    try {
      evaluateStandardLibraryCall('format', [Number.MAX_VALUE, '0%']);
    } catch (error) {
      expect(error).toBeInstanceOf(AmxError);
      if (!(error instanceof AmxError)) throw error;
      expect(error.code).toBe('AMXSL006');
      expect(error.message).toBe('Input is non-finite');
      return;
    }
    throw new Error('Expected AMXSL006 from non-finite percent scaling');
  });

  it('keeps diagnostic columns correct in original CRLF documents with non-BMP text', () => {
    const id = 'FORMAT-CRLF-UTF16-01';
    const line = 'let result = "🙂 ${format(1 / 0, \'0\')}"';
    const document = [
      '---',
      `fixture: ${id}`,
      '---',
      '```amx',
      line,
      '```',
      ''
    ].join('\r\n');
    expectDocumentDiagnostic(id, document, {
      code: 'AMXSL006',
      message: 'Input is non-finite',
      line: 5,
      column: line.indexOf('1 / 0') + 1
    });
  });
});
