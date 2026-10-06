import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
import { composeUnits, powerUnit, unitFromMetadata, type MeasurementUnit } from './measurement';

export class ExternalUnitTextError extends Error {
  constructor(message: string, readonly unknownUnit: boolean) {
    super(message);
    this.name = 'ExternalUnitTextError';
  }
}

const unitless: MeasurementUnit = Object.freeze({
  scale: 1,
  vector: Object.freeze({}),
  factors: Object.freeze([]),
  text: '1'
});

export function parseExternalUnitText(text: string, registry: DimensionUnitRegistry): MeasurementUnit {
  let offset = 0;
  const source = text.trim();
  if (!source) throw new ExternalUnitTextError('Unit expression is empty', false);

  const skipWhitespace = () => {
    while (/\s/.test(source[offset] ?? '')) offset++;
  };
  const consume = (token: string) => {
    skipWhitespace();
    if (!source.startsWith(token, offset)) return false;
    offset += token.length;
    return true;
  };

  const parseProduct = (): MeasurementUnit => {
    let unit = parseFactor();
    while (true) {
      if (consume('*')) unit = validateUnit(composeUnits(unit, parseFactor()));
      else if (consume('/')) unit = validateUnit(composeUnits(unit, parseFactor(), true));
      else return unit;
    }
  };

  const parseFactor = (): MeasurementUnit => {
    skipWhitespace();
    let unit: MeasurementUnit;
    if (consume('(')) {
      unit = parseProduct();
      if (!consume(')')) throw new ExternalUnitTextError("Expected ')' in unit expression", false);
    } else if (source[offset] === '1' && !/[A-Za-z0-9_]/.test(source[offset + 1] ?? '')) {
      offset++;
      unit = unitless;
    } else {
      const match = source.slice(offset).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (!match) throw new ExternalUnitTextError('Expected a visible unit name', false);
      offset += match[0].length;
      const metadata = registry.units.get(match[0]);
      if (!metadata) throw new ExternalUnitTextError(`Unknown or invisible unit '${match[0]}'`, true);
      unit = unitFromMetadata(metadata);
    }

    if (consume('^')) {
      skipWhitespace();
      const exponent = source.slice(offset).match(/^[+-]?\d+/);
      if (!exponent) throw new ExternalUnitTextError('Unit powers must be signed integer literals', false);
      offset += exponent[0].length;
      const power = Number(exponent[0]);
      if (!Number.isSafeInteger(power)) throw new ExternalUnitTextError('Unit power is outside the supported integer range', false);
      unit = powerUnit(unit, power);
    }
    return validateUnit(unit);
  };

  const parsed = parseProduct();
  skipWhitespace();
  if (offset !== source.length) throw new ExternalUnitTextError(`Unexpected '${source[offset]}' in unit expression`, false);
  return Object.freeze({ ...parsed, text: source });
}

function validateUnit(unit: MeasurementUnit): MeasurementUnit {
  if (!Number.isFinite(unit.scale) || unit.scale <= 0
    || Object.values(unit.vector).some(exponent => !Number.isSafeInteger(exponent))
    || unit.factors.some(factor => !Number.isSafeInteger(factor.exponent))) {
    throw new ExternalUnitTextError('Unit expression exceeds supported scale or exponent limits', false);
  }
  return unit;
}
