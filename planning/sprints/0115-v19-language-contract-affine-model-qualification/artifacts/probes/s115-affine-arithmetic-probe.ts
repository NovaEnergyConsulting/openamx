import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type AffineUnit = Readonly<{
  name: string;
  scale: number;
  offset: number;
}>;

type Measurement = Readonly<{
  value: number;
  unit: AffineUnit;
}>;

const tolerance = 1e-10;
const kelvin: AffineUnit = { name: 'kelvin', scale: 1, offset: 0 };
const celsius: AffineUnit = { name: 'celsius', scale: 1, offset: 273.15 };
const fahrenheitScale = 5 / 9;
const fahrenheitOffset = 273.15 - 160 / 9;
const fahrenheit: AffineUnit = { name: 'fahrenheit', scale: fahrenheitScale, offset: fahrenheitOffset };

function physical(measurement: Measurement): number {
  return measurement.value * measurement.unit.scale + measurement.unit.offset;
}

function convert(measurement: Measurement, target: AffineUnit): Measurement {
  return {
    value: (physical(measurement) - target.offset) / target.scale,
    unit: target
  };
}

function subtract(left: Measurement, right: Measurement): Measurement {
  return {
    value: (physical(left) - physical(right)) / left.unit.scale,
    unit: left.unit
  };
}

function aggregate(values: readonly Measurement[], operation: 'sum' | 'mean'): Measurement {
  if (values.length === 0) throw new Error(`${operation} probe requires at least one value`);
  const first = values[0];
  const total = values.reduce((sum, value) => sum + physical(value), 0);
  const result = operation === 'mean' ? total / values.length : total;
  return { value: (result - first.unit.offset) / first.unit.scale, unit: first.unit };
}

function close(left: number, right: number): boolean {
  return Math.abs(left - right) <= tolerance * Math.max(1, Math.abs(left), Math.abs(right));
}

function requireClose(caseId: string, actual: number, expected: number): void {
  if (!close(actual, expected)) {
    throw new Error(`${caseId}: expected ${expected}, got ${actual}`);
  }
}

function requireTrue(caseId: string, actual: boolean): void {
  if (!actual) throw new Error(`${caseId}: expected true`);
}

const invariant = [
  { value: 0, unit: celsius },
  { value: 32, unit: fahrenheit },
  { value: 273.15, unit: kelvin }
];
for (const value of invariant) requireClose('AFF-CONV-INVARIANT-01', physical(value), 273.15);

const representative = [
  { value: -40, unit: celsius },
  { value: 0, unit: celsius },
  { value: 20, unit: celsius },
  { value: 21.25, unit: celsius }
];
const conversionResults: Array<Record<string, number | string>> = [];
for (const source of representative) {
  const toFahrenheit = convert(source, fahrenheit);
  const toKelvin = convert(source, kelvin);
  const viaFahrenheit = convert(toFahrenheit, celsius);
  const viaKelvin = convert(toKelvin, celsius);
  requireClose('AFF-CONV-REVERSE-01', toFahrenheit.value,
    (physical(source) - fahrenheit.offset) / fahrenheit.scale);
  requireClose('AFF-ROUNDTRIP-01', viaFahrenheit.value, source.value);
  requireClose('AFF-ROUNDTRIP-01', viaKelvin.value, source.value);
  requireTrue('AFF-ROUNDTRIP-01', viaFahrenheit.unit === celsius && viaKelvin.unit === celsius);
  conversionResults.push({
    sourceCelsius: source.value,
    toFahrenheit: toFahrenheit.value,
    toKelvin: toKelvin.value,
    viaFahrenheitCelsius: viaFahrenheit.value,
    viaKelvinCelsius: viaKelvin.value,
    finalUnit: viaFahrenheit.unit.name
  });
}

const sameSubtraction = subtract({ value: 20, unit: celsius }, { value: 10, unit: celsius });
const mixedSubtraction = subtract({ value: 32, unit: fahrenheit }, { value: 20, unit: celsius });
requireClose('AFF-SUB-SAME-01', sameSubtraction.value, 10);
requireClose('AFF-SUB-MIX-01', mixedSubtraction.value, -36);
requireTrue('AFF-SUB-SAME-01', sameSubtraction.unit === celsius);
requireTrue('AFF-SUB-MIX-01', mixedSubtraction.unit === fahrenheit);

const sumValues = [{ value: 10, unit: celsius }, { value: 20, unit: celsius }];
const mixedValues = [
  { value: 10, unit: celsius },
  { value: 50, unit: fahrenheit },
  { value: 300, unit: kelvin }
];
const total = aggregate(sumValues, 'sum');
const mean = aggregate(mixedValues, 'mean');
requireClose('AFF-SUM-01', total.value, 303.15);
requireTrue('AFF-SUM-01', total.unit === celsius);
requireClose('AFF-MEAN-01', mean.value,
  (physical(mixedValues[0]) + physical(mixedValues[1]) + physical(mixedValues[2])) / 3 - celsius.offset);
requireTrue('AFF-MEAN-01', mean.unit === celsius);

const declarationMetadata = {
  celsius: { scale: celsius.scale, offset: celsius.offset },
  fahrenheit: { scale: fahrenheit.scale, offset: fahrenheit.offset },
  precedence: { scale: 2 / 4, offset: Math.PI },
  constants: { PI: Math.PI, E: Math.E }
};
requireClose('AFF-PRECEDENCE-01', declarationMetadata.precedence.scale, 0.5);
requireClose('AFF-PRECEDENCE-01', declarationMetadata.precedence.offset, Math.PI);
requireClose('AFF-PI-01', declarationMetadata.constants.PI, Math.PI);
requireClose('AFF-E-01', declarationMetadata.constants.E, Math.E);

const output = {
  probe: 'S115 affine arithmetic qualification',
  baselineEvidenceOnly: true,
  productRuntimeEvidence: false,
  parserCheckerEvidence: false,
  rendererEvidence: false,
  tolerance,
  passedCaseIds: [
    'AFF-CONV-INVARIANT-01',
    'AFF-CONV-REVERSE-01',
    'AFF-ROUNDTRIP-01',
    'AFF-SUB-SAME-01',
    'AFF-SUB-MIX-01',
    'AFF-SUM-01',
    'AFF-MEAN-01',
    'AFF-PRECEDENCE-01',
    'AFF-PI-01',
    'AFF-E-01'
  ],
  declarationMetadata,
  invariantPhysicalValues: invariant.map(value => ({
    unit: value.unit.name,
    displayValue: value.value,
    physicalKelvin: physical(value)
  })),
  conversionResults,
  subtraction: {
    same: { value: sameSubtraction.value, unit: sameSubtraction.unit.name },
    mixed: { value: mixedSubtraction.value, unit: mixedSubtraction.unit.name }
  },
  physicalAggregates: {
    sum: { value: total.value, unit: total.unit.name },
    mean: { value: mean.value, unit: mean.unit.name }
  },
  rejectionPolicyEvidence: [
    { caseId: 'AFF-ADD-01', result: 'REJECT-POLICY-ONLY' },
    { caseId: 'AFF-MUL-01', result: 'REJECT-POLICY-ONLY' },
    { caseId: 'AFF-DIV-01', result: 'REJECT-POLICY-ONLY' },
    { caseId: 'AFF-POW-01', result: 'REJECT-POLICY-ONLY' },
    { caseId: 'AFF-SQRT-01', result: 'REJECT-POLICY-ONLY' },
    { caseId: 'AFF-USER-CONST-01', result: 'NOT-RUN-DECLARATION-CHECKER' },
    { caseId: 'AFF-IMPORTED-CONST-01', result: 'NOT-RUN-DECLARATION-CHECKER' },
    { caseId: 'AFF-CALL-01', result: 'NOT-RUN-DECLARATION-CHECKER' }
  ],
  limitation: 'Arithmetic evidence only; this probe does not execute OpenAMX parsing, checking, runtime evaluation, chart normalization, external-data validation, or rendering.'
};

const outputDirectory = join(import.meta.dirname, '..', 'outputs');
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(join(outputDirectory, 's115-affine-arithmetic.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
