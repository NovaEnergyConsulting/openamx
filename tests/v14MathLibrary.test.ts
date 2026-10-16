import { describe, expect, it } from 'bun:test';
import { AmxError } from '../src/diagnostics/errors';
import { parseDocumentText } from '../src/parser/parseDocument';
import { evaluateDocument } from '../src/runtime/evaluateDocument';
import { isMeasurement } from '../src/runtime/measurement';

function fixtureDocument(id: string, source: string) {
  return parseDocumentText(`---\nfixture: ${id}\n---\n\`\`\`amx\n${source}\n\`\`\`\n`);
}

function runFixture(id: string, source: string): Record<string, unknown> {
  return evaluateDocument(fixtureDocument(id, source), `${id}.amx`);
}

function expectClose(actual: unknown, expected: number): void {
  expect(typeof actual).toBe('number');
  expect(Number.isFinite(actual)).toBe(true);
  const value = actual as number;
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(Math.max(1e-12, Math.abs(expected) * 1e-12));
}

function expectMeasurement(value: unknown, expectedValue: number, unit: string): void {
  expect(isMeasurement(value)).toBe(true);
  if (!isMeasurement(value)) throw new Error('Expected an AMX Measurement');
  expect(value.value).toBe(expectedValue);
  expect(value.unit.text).toBe(unit);
}

function expectDiagnostic(
  id: string,
  source: string,
  expected: { code: string; message: string; line: number; column: number }
): AmxError {
  try {
    runFixture(id, source);
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    if (!(error instanceof AmxError)) throw error;
    expect(error).toMatchObject({ ...expected, file: `${id}.amx` });
    return error;
  }
  throw new Error(`Expected ${expected.code} from ${id}`);
}

describe('Sprint 086 mathematical standard library', () => {
  it('evaluates all approved constants and unary functions within the accepted tolerance', () => {
    const values = runFixture('MATH-TEXT-FORMAT-VALID-01', `dimension Length
unit meter: Length
unit ratio = meter / meter
let ratioValue = 2 ratio
let piValue = PI
let eValue = E
let sine = sin(PI / 2)
let cosine = cos(0)
let tangent = tan(0)
let tangentPoleApproximation = tan(PI / 2)
let arcSine = asin(1)
let arcCosine = acos(1)
let arcTangent = atan(1)
let hyperbolicSine = sinh(0)
let hyperbolicCosine = cosh(0)
let hyperbolicTangent = tanh(0)
let inverseHyperbolicSine = asinh(0)
let inverseHyperbolicCosine = acosh(1)
let inverseHyperbolicTangent = atanh(0)
let naturalLog = ln(E)
let commonLog = log(100)
let exponential = exp(1)
let dimensionlessMeasurementSine = sin(ratioValue)`);

    expect(values.piValue).toBe(Math.PI);
    expect(values.eValue).toBe(Math.E);
    const expected: Record<string, number> = {
      sine: 1,
      cosine: 1,
      tangent: 0,
      arcSine: Math.PI / 2,
      arcCosine: 0,
      arcTangent: Math.PI / 4,
      hyperbolicSine: 0,
      hyperbolicCosine: 1,
      hyperbolicTangent: 0,
      inverseHyperbolicSine: 0,
      inverseHyperbolicCosine: 0,
      inverseHyperbolicTangent: 0,
      naturalLog: 1,
      commonLog: 2,
      exponential: Math.E,
      dimensionlessMeasurementSine: Math.sin(2)
    };
    for (const [name, value] of Object.entries(expected)) expectClose(values[name], value);
    expect(typeof values.tangentPoleApproximation).toBe('number');
    expect(Number.isFinite(values.tangentPoleApproximation)).toBe(true);
    for (const name of Object.keys(expected)) expect(isMeasurement(values[name])).toBe(false);
  });

  it('normalizes non-unit-scale dimensionless Measurement inputs and returns a Number', () => {
    const values = runFixture('MATH-DIMENSIONLESS-SCALED-01', `dimension Length
unit meter: Length
unit ratio = meter / meter
unit centiratio = 0.01 * ratio
let value = 200 centiratio
let result = cos(value)`);
    expectClose(values.result, Math.cos(2));
    expect(isMeasurement(values.result)).toBe(false);
  });

  it('accepts both inverse-trigonometric endpoints and rejects both atanh endpoints', () => {
    const values = runFixture('MATH-DOMAIN-BOUNDARIES-01', `let asinLower = asin(-1)
let acosLower = acos(-1)`);
    expectClose(values.asinLower, -Math.PI / 2);
    expectClose(values.acosLower, Math.PI);
    for (const source of ['let result = atanh(-1)', 'let result = atanh(1)']) {
      expectDiagnostic('MATH-DOM-ATANH-BOUNDARY-01', source, {
        code: 'AMXSL001',
        message: 'Invalid input for mathematical function',
        line: 5, column: 14
      });
    }
  });

  it('reports exact arity, type, dimensional-input, domain, and finite diagnostics', () => {
    expectDiagnostic('MATH-ARITY-01', 'let result = sin()', {
      code: 'AMX3004', message: "Invalid arity for 'sin'", line: 5, column: 14
    });
    expectDiagnostic('MATH-ARITY-EXTRA-01', 'let result = sin(1, 2)', {
      code: 'AMX3004', message: "Invalid arity for 'sin'", line: 5, column: 14
    });
    expectDiagnostic('MATH-TYPE-01', 'let result = sin("x")', {
      code: 'AMX3002',
      message: 'Expected Number or dimensionless Measurement, got String',
      line: 5, column: 18
    });
    expectDiagnostic('MATH-MEASUREMENT-DIM-01', `dimension Length
unit meter: Length
let result = sin(1 meter)`, {
      code: 'AMX3007',
      message: "'sin' requires a Number or dimensionless Measurement",
      line: 7, column: 18
    });

    const invalidDomains: Array<[string, string, number, number]> = [
      ['MATH-DOM-ASIN-01', 'let result = asin(2)', 5, 14],
      ['MATH-DOM-ACOS-01', 'let result = acos(-2)', 5, 14],
      ['MATH-DOM-ACOSH-01', 'let result = acosh(0)', 5, 14],
      ['MATH-DOM-ATANH-01', 'let result = atanh(1)', 5, 14],
      ['MATH-DOM-LN-01', 'let result = ln(0)', 5, 14],
      ['MATH-DOM-LOG-01', 'let result = log(-1)', 5, 14]
    ];
    for (const [id, source, line, column] of invalidDomains) {
      expectDiagnostic(id, source, {
        code: 'AMXSL001',
        message: 'Invalid input for mathematical function',
        line,
        column
      });
    }
    expectDiagnostic('MATH-FINITE-01', 'let result = exp(10000)', {
      code: 'AMXSL002',
      message: 'Function evaluation results in infinite result',
      line: 5, column: 14
    });
    expectDiagnostic('MATH-NONFINITE-INPUT-01', 'let result = sin(1 / 0)', {
      code: 'AMXSL001',
      message: 'Invalid input for mathematical function',
      line: 5, column: 14
    });
  });
});

describe('Sprint 086 Measurement standard library compatibility', () => {
  it('preserves approved Measurement values, displayed units, and typed-empty sum', () => {
    const values = runFixture('MEAS-STDLIB-VALID-01', `dimension Length
unit meter: Length
unit kilometer = 1000 * meter
unit square_meter = meter ^ 2
let distances: Length[] = [1 kilometer, 500 meter]
let total = sum(distances)
let average = mean(distances)
let minimum = min(distances)
let maximum = max(distances)
let absolute = abs(-2 kilometer)
let rounded = round(1.236 kilometer, 2)
let areaRoot = sqrt(9 square_meter)
let areaPower = pow(2 meter, 2)
let reciprocal = pow(2 meter, -1)
let empty: Length[] = []
let emptyTotal = sum(empty)`);

    expectMeasurement(values.total, 1.5, 'kilometer');
    expectMeasurement(values.average, 0.75, 'kilometer');
    expectMeasurement(values.minimum, 500, 'meter');
    expectMeasurement(values.maximum, 1, 'kilometer');
    expectMeasurement(values.absolute, 2, 'kilometer');
    expectMeasurement(values.rounded, 1.24, 'kilometer');
    expectMeasurement(values.areaRoot, 3, 'meter');
    expectMeasurement(values.areaPower, 4, 'meter ^ 2');
    expectMeasurement(values.reciprocal, 0.5, '1 / meter');
    expectMeasurement(values.emptyTotal, 0, 'meter');
  });

  it('retains exact incompatibility, empty aggregate, and sqrt regression diagnostics', () => {
    expectDiagnostic('MEAS-COMPAT-01', `dimension Length
dimension Time
unit meter: Length
unit second: Time
let result = sum([1 meter, 1 second])`, {
      code: 'AMX3007',
      message: 'List elements have incompatible types',
      line: 9, column: 28
    });
    for (const [id, name] of [
      ['MEAS-EMPTY-MEAN-01', 'mean'],
      ['MEAS-EMPTY-MIN-01', 'min'],
      ['MEAS-EMPTY-MAX-01', 'max']
    ] as const) {
      expectDiagnostic(id, `dimension Length
unit meter: Length
let empty: Length[] = []
let result = ${name}(empty)`, {
        code: 'AMX2004',
        message: `${name} of empty list at line 8`,
        line: 8, column: 14
      });
    }
    expectDiagnostic('MATH-SQRT-REGRESSION-01', 'let result = sqrt(-1)', {
      code: 'AMX2005',
      message: 'sqrt of negative value at line 5',
      line: 5, column: 14
    });
    expectDiagnostic('MATH-SQRT-MEAS-REGRESSION-01', `dimension Length
unit meter: Length
unit square_meter = meter ^ 2
let result = sqrt(-1 square_meter)`, {
      code: 'AMX3010',
      message: 'sqrt of a negative measurement value',
      line: 8, column: 14
    });
  });
});
