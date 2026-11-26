export function isMeasurement(value) {
    return !!value && typeof value === 'object'
        && value.__amxMeasurement === true
        && typeof value.value === 'number'
        && !!value.unit;
}
function vectorRecord(vector) {
    return Object.freeze(Object.fromEntries(vector));
}
function formatFactors(factors) {
    const sorted = [...factors].filter(factor => factor.exponent !== 0)
        .sort((left, right) => left.identity < right.identity ? -1 : left.identity > right.identity ? 1 : 0);
    const numerator = sorted.filter(factor => factor.exponent > 0)
        .map(factor => `${factor.name}${factor.exponent === 1 ? '' : ` ^ ${factor.exponent}`}`);
    const denominator = sorted.filter(factor => factor.exponent < 0)
        .map(factor => `${factor.name}${factor.exponent === -1 ? '' : ` ^ ${-factor.exponent}`}`);
    return `${numerator.length ? numerator.join(' * ') : '1'}${denominator.length ? ` / ${denominator.join(' * ')}` : ''}`;
}
export function unitFromMetadata(unit) {
    const factors = [{ identity: unit.identity, name: unit.name, exponent: 1 }];
    return Object.freeze({
        scale: unit.scale,
        offset: unit.offset,
        vector: vectorRecord(unit.vector),
        factors: Object.freeze(factors),
        text: unit.name
    });
}
export function physicalValue(value, unit) {
    return value * unit.scale + unit.offset;
}
export function displayValue(physical, unit) {
    return (physical - unit.offset) / unit.scale;
}
export function measurementPhysicalValue(value) {
    return physicalValue(value.value, value.unit);
}
export function measurementDisplayValue(physical, unit) {
    return displayValue(physical, unit);
}
export function isAffineUnit(unit) {
    return unit.offset !== 0;
}
function combineFactors(left, right, multiplier) {
    const factors = new Map();
    for (const factor of left.factors)
        factors.set(factor.identity, { ...factor });
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
function combineVectorRecords(left, right, multiplier) {
    const vector = { ...left.vector };
    for (const [identity, exponent] of Object.entries(right.vector)) {
        const next = (vector[identity] ?? 0) + exponent * multiplier;
        if (next)
            vector[identity] = next;
        else
            delete vector[identity];
    }
    return vector;
}
export function composeUnits(left, right, divide = false) {
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
export function powerUnit(unit, exponent) {
    if (isAffineUnit(unit)) {
        throw new Error('Affine measurement units may not be powered');
    }
    const factors = unit.factors.map(factor => ({ ...factor, exponent: factor.exponent * exponent }))
        .filter(factor => factor.exponent !== 0);
    return Object.freeze({
        scale: Math.pow(unit.scale, exponent),
        offset: unit.offset,
        vector: Object.freeze(Object.fromEntries(Object.entries(unit.vector)
            .map(([identity, power]) => [identity, power * exponent]).filter(([, power]) => power !== 0))),
        factors: Object.freeze(factors),
        text: formatFactors(factors)
    });
}
export function measurement(value, unit) {
    return Object.freeze({ __amxMeasurement: true, value, unit });
}
export function canonicalUnit(vector, registry) {
    const factors = [];
    for (const [identity, exponent] of [...vector].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)) {
        const base = registry.baseUnits.get(identity);
        if (!base)
            throw new Error(`No visible canonical base unit for dimension identity ${identity}`);
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
export function sqrtMeasurement(value, registry) {
    if (isAffineUnit(value.unit))
        throw new Error('Affine measurement sqrt is not supported');
    const vector = new Map();
    for (const [identity, exponent] of Object.entries(value.unit.vector)) {
        if (exponent % 2 !== 0)
            throw new Error('sqrt requires integral measurement dimension exponents');
        vector.set(identity, exponent / 2);
    }
    const physical = measurementPhysicalValue(value);
    const physicalRoot = Math.sqrt(physical);
    if (!Number.isFinite(physicalRoot))
        return measurement(physicalRoot, canonicalUnit(vector, registry));
    const requestedScale = Math.sqrt(value.unit.scale);
    const declared = [...registry.units.values()].find(unit => unit.scale === requestedScale && unit.vector.size === vector.size
        && [...vector].every(([identity, exponent]) => unit.vector.get(identity) === exponent));
    if (declared)
        return measurement(physicalRoot / declared.scale, unitFromMetadata(declared));
    const unit = canonicalUnit(vector, registry);
    return measurement(physicalRoot, unit);
}
//# sourceMappingURL=measurement.js.map