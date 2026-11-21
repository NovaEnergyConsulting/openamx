import type { UnitMetadata, DimensionUnitRegistry } from '../typechecker/dimensionTypes';

export interface MeasurementUnitFactor {
  identity: string;
  name: string;
  exponent: number;
}

export interface MeasurementUnit {
  readonly scale: number;
  readonly offset: number;
  readonly vector: Readonly<Record<string, number>>;
  readonly factors: readonly MeasurementUnitFactor[];
  readonly text: string;
}

export interface MeasurementValue {
  readonly __amxMeasurement: true;
  readonly value: number;
  readonly unit: MeasurementUnit;
}

export function isMeasurement(value: unknown): value is MeasurementValue {
  return !!value && typeof value === 'object'
    && (value as Partial<MeasurementValue>).__amxMeasurement === true
    && typeof (value as Partial<MeasurementValue>).value === 'number'
    && !!(value as Partial<MeasurementValue>).unit;
}

function vectorRecord(vector: ReadonlyMap<string, number>): Readonly<Record<string, number>> {
  return Object.freeze(Object.fromEntries(vector));
}

function formatFactors(factors: readonly MeasurementUnitFactor[]): string {
  const sorted = [...factors].filter(factor => factor.exponent !== 0)
    .sort((left, right) => left.identity < right.identity ? -1 : left.identity > right.identity ? 1 : 0);
  const numerator = sorted.filter(factor => factor.exponent > 0)
    .map(factor => `${factor.name}${factor.exponent === 1 ? '' : ` ^ ${factor.exponent}`}`);
  const denominator = sorted.filter(factor => factor.exponent < 0)
    .map(factor => `${factor.name}${factor.exponent === -1 ? '' : ` ^ ${-factor.exponent}`}`);
  return `${numerator.length ? numerator.join(' * ') : '1'}${denominator.length ? ` / ${denominator.join(' * ')}` : ''}`;
}

export function unitFromMetadata(unit: UnitMetadata): MeasurementUnit {
  const factors = [{ identity: unit.identity, name: unit.name, exponent: 1 }];
  return Object.freeze({
    scale: unit.scale,
    offset: unit.offset,
    vector: vectorRecord(unit.vector),
    factors: Object.freeze(factors),
    text: unit.name
  });
}

export function physicalValue(value: number, unit: Readonly<{ scale: number; offset: number }>): number {
  return value * unit.scale + unit.offset;
}

export function displayValue(physical: number, unit: Readonly<{ scale: number; offset: number }>): number {
  return (physical - unit.offset) / unit.scale;
}

export function measurementPhysicalValue(value: MeasurementValue): number {
  return physicalValue(value.value, value.unit);
}

export function measurementDisplayValue(physical: number, unit: MeasurementUnit): number {
  return displayValue(physical, unit);
}

export function isAffineUnit(unit: MeasurementUnit): boolean {
  return unit.offset !== 0;
}

function combineFactors(left: MeasurementUnit, right: MeasurementUnit, multiplier: number): MeasurementUnitFactor[] {
  const factors = new Map<string, MeasurementUnitFactor>();
  for (const factor of left.factors) factors.set(factor.identity, { ...factor });
  for (const factor of right.factors) {
    const current = factors.get(factor.identity);
    factors.set(factor.identity, {
      identity: factor.identity,
      name: factor.name,
      exponent: (current?.exponent ?? 0) + factor.exponent * multiplier
    });
  }
  return [...factors.values()].filter(factor => factor.exponent !== 0);
}

function combineVectorRecords(left: MeasurementUnit, right: MeasurementUnit, multiplier: number): Record<string, number> {
  const vector: Record<string, number> = { ...left.vector };
  for (const [identity, exponent] of Object.entries(right.vector)) {
    const next = (vector[identity] ?? 0) + exponent * multiplier;
    if (next) vector[identity] = next;
    else delete vector[identity];
  }
  return vector;
}

export function composeUnits(left: MeasurementUnit, right: MeasurementUnit, divide = false): MeasurementUnit {
  if (isAffineUnit(left) || isAffineUnit(right)) {
    throw new Error('Affine measurement units cannot be composed');
  }
  const multiplier = divide ? -1 : 1;
  const factors = combineFactors(left, right, multiplier);
  return Object.freeze({
    scale: divide ? left.scale / right.scale : left.scale * right.scale,
    offset: 0,
    vector: Object.freeze(combineVectorRecords(left, right, multiplier)),
    factors: Object.freeze(factors),
    text: formatFactors(factors)
  });
}

export function powerUnit(unit: MeasurementUnit, exponent: number): MeasurementUnit {
  if (isAffineUnit(unit)) {
    throw new Error('Affine measurement units may not be powered');
  }
  const factors = unit.factors.map(factor => ({ ...factor, exponent: factor.exponent * exponent }))
    .filter(factor => factor.exponent !== 0);
  return Object.freeze({
    scale: Math.pow(unit.scale, exponent),
    offset: unit.offset,
    vector: Object.freeze(Object.fromEntries(Object.entries(unit.vector)
      .map(([identity, power]) => [identity, power * exponent]).filter(([, power]) => power !== 0) as [string, number][])),
    factors: Object.freeze(factors),
    text: formatFactors(factors)
  });
}

export function measurement(value: number, unit: MeasurementUnit): MeasurementValue {
  return Object.freeze({ __amxMeasurement: true, value, unit });
}

export function canonicalUnit(vector: ReadonlyMap<string, number>, registry: DimensionUnitRegistry): MeasurementUnit {
  const factors: MeasurementUnitFactor[] = [];
  for (const [identity, exponent] of [...vector].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)) {
    const base = registry.baseUnits.get(identity);
    if (!base) throw new Error(`No visible canonical base unit for dimension identity ${identity}`);
    factors.push({ identity: base.identity, name: base.name, exponent });
  }
  return Object.freeze({
    scale: 1,
    offset: 0,
    vector: vectorRecord(vector),
    factors: Object.freeze(factors),
    text: formatFactors(factors)
  });
}

export function sqrtMeasurement(value: MeasurementValue, registry: DimensionUnitRegistry): MeasurementValue {
  if (isAffineUnit(value.unit)) throw new Error('Affine measurement sqrt is not supported');
  const vector = new Map<string, number>();
  for (const [identity, exponent] of Object.entries(value.unit.vector)) {
    if (exponent % 2 !== 0) throw new Error('sqrt requires integral measurement dimension exponents');
    vector.set(identity, exponent / 2);
  }
  const physical = measurementPhysicalValue(value);
  const physicalRoot = Math.sqrt(physical);
  if (!Number.isFinite(physicalRoot)) return measurement(physicalRoot, canonicalUnit(vector, registry));
  const requestedScale = Math.sqrt(value.unit.scale);
  const declared = [...registry.units.values()].find(unit =>
    unit.scale === requestedScale && unit.vector.size === vector.size
      && [...vector].every(([identity, exponent]) => unit.vector.get(identity) === exponent));
  if (declared) return measurement(physicalRoot / declared.scale, unitFromMetadata(declared));
  const unit = canonicalUnit(vector, registry);
  return measurement(physicalRoot, unit);
}
