import { composeUnits, isAffineUnit, powerUnit, unitFromMetadata } from './measurement';
export class ExternalUnitTextError extends Error {
    unknownUnit;
    constructor(message, unknownUnit) {
        super(message);
        this.unknownUnit = unknownUnit;
        this.name = 'ExternalUnitTextError';
    }
}
const unitless = Object.freeze({
    scale: 1,
    offset: 0,
    vector: Object.freeze({}),
    factors: Object.freeze([]),
    text: '1'
});
export function parseExternalUnitText(text, registry) {
    let offset = 0;
    const source = text.trim();
    if (!source)
        throw new ExternalUnitTextError('Unit expression is empty', false);
    const skipWhitespace = () => {
        while (/\s/.test(source[offset] ?? ''))
            offset++;
    };
    const consume = (token) => {
        skipWhitespace();
        if (!source.startsWith(token, offset))
            return false;
        offset += token.length;
        return true;
    };
    const parseProduct = () => {
        let unit = parseFactor();
        while (true) {
            if (consume('*')) {
                const right = parseFactor();
                rejectAffineComposition(unit, right);
                unit = validateUnit(composeUnits(unit, right));
            }
            else if (consume('/')) {
                const right = parseFactor();
                rejectAffineComposition(unit, right);
                unit = validateUnit(composeUnits(unit, right, true));
            }
            else
                return unit;
        }
    };
    const parseFactor = () => {
        skipWhitespace();
        let unit;
        if (consume('(')) {
            unit = parseProduct();
            if (!consume(')'))
                throw new ExternalUnitTextError("Expected ')' in unit expression", false);
        }
        else if (source[offset] === '1' && !/[A-Za-z0-9_]/.test(source[offset + 1] ?? '')) {
            offset++;
            unit = unitless;
        }
        else {
            const match = source.slice(offset).match(/^[A-Za-z_][A-Za-z0-9_]*/);
            if (!match)
                throw new ExternalUnitTextError('Expected a visible unit name', false);
            offset += match[0].length;
            const metadata = registry.units.get(match[0]);
            if (!metadata)
                throw new ExternalUnitTextError(`Unknown or invisible unit '${match[0]}'`, true);
            unit = unitFromMetadata(metadata);
        }
        if (consume('^')) {
            if (isAffineUnit(unit)) {
                throw new ExternalUnitTextError('Affine units may not be used in external unit powers', false);
            }
            skipWhitespace();
            const exponent = source.slice(offset).match(/^[+-]?\d+/);
            if (!exponent)
                throw new ExternalUnitTextError('Unit powers must be signed integer literals', false);
            offset += exponent[0].length;
            const power = Number(exponent[0]);
            if (!Number.isSafeInteger(power))
                throw new ExternalUnitTextError('Unit power is outside the supported integer range', false);
            unit = powerUnit(unit, power);
        }
        return validateUnit(unit);
    };
    const parsed = parseProduct();
    skipWhitespace();
    if (offset !== source.length)
        throw new ExternalUnitTextError(`Unexpected '${source[offset]}' in unit expression`, false);
    return Object.freeze({ ...parsed, text: source });
}
function rejectAffineComposition(left, right) {
    if (isAffineUnit(left) || isAffineUnit(right)) {
        throw new ExternalUnitTextError('Affine units may not be used in external unit products or divisions', false);
    }
}
function validateUnit(unit) {
    if (!Number.isFinite(unit.scale) || unit.scale <= 0 || !Number.isFinite(unit.offset)
        || Object.values(unit.vector).some(exponent => !Number.isSafeInteger(exponent))
        || unit.factors.some(factor => !Number.isSafeInteger(factor.exponent))) {
        throw new ExternalUnitTextError('Unit expression exceeds supported scale or exponent limits', false);
    }
    return unit;
}
//# sourceMappingURL=externalUnits.js.map