import { isMeasurement, measurement, measurementDisplayValue, measurementPhysicalValue } from './runtime/measurement';
export class AMXInputError extends TypeError {
    inputPath;
    expected;
    actual;
    code = 'AMX4003';
    constructor(inputPath, expected, actual) {
        super(`Invalid input at '${inputPath}': expected ${expected}, got ${actual}`);
        this.inputPath = inputPath;
        this.expected = expected;
        this.actual = actual;
        this.name = 'AMXInputError';
    }
}
export function requireAMXNumber(value, inputPath) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new AMXInputError(inputPath, 'finite Number', describeInput(value));
    }
    return value;
}
export function requireAMXString(value, inputPath) {
    if (typeof value !== 'string') {
        throw new AMXInputError(inputPath, 'String', describeInput(value));
    }
    return value;
}
export function requireAMXBoolean(value, inputPath) {
    if (typeof value !== 'boolean') {
        throw new AMXInputError(inputPath, 'Boolean', describeInput(value));
    }
    return value;
}
export function requireAMXEnum(value, enumName, members, inputPath) {
    if ((typeof value !== 'string' && typeof value !== 'number') || !members.includes(value)) {
        throw new AMXInputError(inputPath, `member of enum '${enumName}'`, describeInput(value));
    }
    return value;
}
export function requireAMXMeasurement(value, dimensionName, dimensionVector, units, inputPath) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new AMXInputError(inputPath, `Measurement<${dimensionName}> as {value, unit}`, describeInput(value));
    }
    const record = value;
    const keys = Object.keys(record);
    if (keys.length !== 2 || !keys.includes('value') || !keys.includes('unit')) {
        throw new AMXInputError(inputPath, `exact {value, unit} Measurement<${dimensionName}>`, describeInput(value));
    }
    if (typeof record.unit !== 'string') {
        throw new AMXInputError(`${inputPath}/unit`, 'unit name', describeInput(record.unit));
    }
    const unit = units[record.unit];
    if (!unit) {
        throw new AMXInputError(`${inputPath}/unit`, `visible ${dimensionName} unit`, record.unit);
    }
    if (!sameVector(unit.vector, dimensionVector)) {
        throw new AMXInputError(`${inputPath}/unit`, `unit of dimension ${dimensionName}`, record.unit);
    }
    const numericValue = requireAMXNumber(record.value, `${inputPath}/value`);
    return amxAttach(numericValue, unit);
}
export function requireAMXList(value, inputPath) {
    if (!Array.isArray(value)) {
        throw new AMXInputError(inputPath, 'list', describeInput(value));
    }
    return value;
}
export function requireAMXRecord(value, inputPath, allowedFields) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new AMXInputError(inputPath, 'record object', describeInput(value));
    }
    const record = value;
    const allowed = new Set(allowedFields);
    const unknownField = Object.keys(record).find(field => !allowed.has(field));
    if (unknownField !== undefined) {
        throw new AMXInputError(`${inputPath}/${escapePointer(unknownField)}`, 'declared record field', describeInput(record[unknownField]));
    }
    return record;
}
export function amxAttach(value, unit) {
    validateUnit(unit);
    const result = measurement(requireAMXNumber(value, 'measurement.value'), toMeasurementUnit(unit));
    if (!Number.isFinite(measurementPhysicalValue(result))) {
        throw new RangeError('Measurement physical value must be finite');
    }
    return result;
}
export function amxConvert(value, target) {
    validateUnit(target);
    if (!isMeasurement(value) || !sameVector(value.unit.vector, target.vector)) {
        throw new TypeError(`Cannot convert measurement to unit '${target.name}'`);
    }
    const targetUnit = toMeasurementUnit(target);
    const converted = measurementDisplayValue(measurementPhysicalValue(value), targetUnit);
    if (!Number.isFinite(converted)) {
        throw new RangeError('Converted measurement value must be finite');
    }
    return measurement(converted, targetUnit);
}
export function amxPhysicalValue(value) {
    return measurementPhysicalValue(value);
}
export function amxEqual(left, right) {
    return isMeasurement(left) && isMeasurement(right)
        && sameVector(left.unit.vector, right.unit.vector)
        && measurementPhysicalValue(left) === measurementPhysicalValue(right);
}
export function amxTableView(name, columns, rows) {
    return freezeData({
        kind: 'table',
        name,
        columns: columns.map(column => ({ ...column })),
        rows: rows.map(row => [...row])
    });
}
export function amxChartView(view) {
    return freezeData({ kind: 'chart', ...view, data: [...view.data] });
}
export function amxDiagramView(view) {
    return freezeData({ kind: 'diagram', ...view });
}
function toMeasurementUnit(descriptor) {
    return Object.freeze({
        scale: descriptor.scale,
        offset: descriptor.offset,
        vector: Object.freeze({ ...descriptor.vector }),
        factors: Object.freeze((descriptor.factors ?? [{
                identity: descriptor.identity,
                name: descriptor.name,
                exponent: 1
            }]).map(factor => Object.freeze({ ...factor }))),
        text: descriptor.name
    });
}
function validateUnit(unit) {
    if (!unit.name || !unit.identity || !Number.isFinite(unit.scale) || unit.scale <= 0
        || !Number.isFinite(unit.offset)
        || Object.values(unit.vector).some(exponent => !Number.isFinite(exponent))) {
        throw new TypeError('Invalid AMX unit descriptor');
    }
}
function sameVector(left, right) {
    const leftEntries = Object.entries(left);
    return leftEntries.length === Object.keys(right).length
        && leftEntries.every(([identity, exponent]) => right[identity] === exponent);
}
function freezeData(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value))
        return value;
    for (const child of Object.values(value))
        freezeData(child);
    return Object.freeze(value);
}
function describeInput(value) {
    if (value === null)
        return 'null';
    if (Array.isArray(value))
        return 'list';
    return typeof value;
}
function escapePointer(value) {
    return value.replace(/~/g, '~0').replace(/\//g, '~1');
}
//# sourceMappingURL=transpilerRuntime.js.map