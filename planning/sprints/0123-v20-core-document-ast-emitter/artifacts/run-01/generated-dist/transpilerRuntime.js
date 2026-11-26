import { isMeasurement, measurement, measurementDisplayValue, measurementPhysicalValue } from './runtime/measurement';
import { AmxError, staticError } from './diagnostics/errors';
import { evaluateBinaryValues, evaluateBuiltinValues, evaluateIterableValue, evaluateListAddition, evaluateListItem, evaluateListRemoval, evaluateRangeValues, evaluateUnaryValue } from './runtime/evaluateExpression';
export class AMXRuntimeError extends Error {
    diagnostic;
    code;
    file;
    line;
    column;
    inputPath;
    originalCause;
    constructor(diagnostic, cause) {
        super(diagnostic.message);
        this.name = 'AMXRuntimeError';
        this.diagnostic = Object.freeze({ ...diagnostic });
        this.code = diagnostic.code;
        this.file = diagnostic.file;
        this.line = diagnostic.line;
        this.column = diagnostic.column;
        this.inputPath = diagnostic.inputPath;
        this.originalCause = cause;
    }
}
export class AMXInputError extends TypeError {
    inputPath;
    expected;
    actual;
    code = 'AMX4003';
    diagnostic;
    constructor(inputPath, expected, actual, sourceContext = {}) {
        super(`Invalid input at '${inputPath}': expected ${expected}, got ${actual}`);
        this.inputPath = inputPath;
        this.expected = expected;
        this.actual = actual;
        this.name = 'AMXInputError';
        this.diagnostic = Object.freeze({
            code: this.code,
            message: this.message,
            ...sourceContext,
            inputPath
        });
    }
}
export function amxBinary(operator, left, right, context) {
    return withRuntimeErrorContext(() => evaluateBinaryValues(operator, left, right, sourceLocation(context), context?.file), context);
}
export function amxUnary(operator, value, context) {
    return withRuntimeErrorContext(() => evaluateUnaryValue(operator, value, sourceLocation(context), context?.file), context);
}
export function amxFormatValue(value, context) {
    if (value === null)
        return 'null';
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number')
        return String(value);
    if (typeof value === 'boolean')
        return value ? 'true' : 'false';
    if (isMeasurement(value))
        return `${String(value.value)} ${value.unit.text}`;
    return withRuntimeErrorContext(() => staticError('AMX3007', 'Only String, Number, Boolean, measurement, and null values can be interpolated', sourceLocation(context), context?.file), context);
}
export function amxBuiltin(name, args, context) {
    return withRuntimeErrorContext(() => evaluateBuiltinValues(name, args, sourceLocation(context), context?.file, createDimensionRegistry(context?.unitDescriptors)), context);
}
export function amxIsType(value, descriptor) {
    return matchesInputDescriptor(value, descriptor);
}
export function validateAMXValue(value, descriptor, context) {
    const rootPath = context.inputPath ?? '';
    return validateInputValue(value, descriptor, rootPath, context);
}
export function amxGet1Based(list, index, context) {
    return withRuntimeErrorContext(() => evaluateListItem(list, index, sourceLocation(context), context?.file), context);
}
export function amxRange(start, end, context) {
    return withRuntimeErrorContext(() => evaluateRangeValues(start, end, sourceLocation(context), context?.file), context);
}
export function amxAdd1Based(list, value, position, context) {
    withRuntimeErrorContext(() => evaluateListAddition(list, value, position, context?.mutable !== false, context?.targetName ?? '__generated', sourceLocation(context), context?.file), context);
}
export function amxRemove1Based(list, count, position, context) {
    withRuntimeErrorContext(() => evaluateListRemoval(list, count, position, context?.mutable !== false, context?.targetName ?? '__generated', sourceLocation(context), context?.file), context);
}
export function amxIterate(value, context) {
    return withRuntimeErrorContext(() => evaluateIterableValue(value, sourceLocation(context), context?.file), context);
}
export function amxCopyListArgument(value) {
    return copyArrayTree(value);
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
export function amxTableView(name, columns, rows, title = name, description = '') {
    const copiedColumns = columns.map((column, index) => ({
        field: requireViewString(column.field, `/columns/${index}/field`),
        label: requireViewString(column.label, `/columns/${index}/label`)
    }));
    const copiedRows = rows.map((row, rowIndex) => row.map((value, columnIndex) => cloneViewData(value, `/rows/${rowIndex}/${columnIndex}`)));
    return deepFreeze({
        kind: 'table',
        name,
        title,
        description,
        columns: copiedColumns,
        rows: copiedRows
    });
}
export function amxChartView(view) {
    if (!['bar', 'column', 'line', 'scatter'].includes(view.chartKind)) {
        throwViewInputError('/chartKind', 'supported chart kind', String(view.chartKind));
    }
    if (typeof view.showTable !== 'boolean')
        throwViewInputError('/showTable', 'Boolean', describeInput(view.showTable));
    const copied = {
        kind: 'chart',
        name: requireViewString(view.name, '/name'),
        chartKind: view.chartKind,
        title: requireViewString(view.title, '/title'),
        description: requireViewString(view.description, '/description'),
        data: view.data.map((value, index) => cloneViewData(value, `/data/${index}`)),
        ...(view.labels === undefined ? {} : { labels: view.labels.map((label, index) => requireViewString(label, `/labels/${index}`)) }),
        ...(view.headings === undefined ? {} : { headings: view.headings.map((heading, index) => requireViewString(heading, `/headings/${index}`)) }),
        ...(view.measurementDescriptors === undefined ? {} : {
            measurementDescriptors: view.measurementDescriptors.map((descriptor, index) => cloneChartMeasurementDescriptor(descriptor, index))
        }),
        showTable: view.showTable
    };
    return deepFreeze(copied);
}
export function amxDiagramView(view) {
    if ('schema' in view && view.schema === 'structured-v2') {
        const structured = view;
        return deepFreeze({
            kind: 'diagram',
            schema: 'structured-v2',
            name: requireViewString(structured.name, '/name'),
            title: requireViewString(structured.title, '/title'),
            description: requireViewString(structured.description, '/description'),
            canvas: {
                width: requireViewNumber(structured.canvas.width, '/canvas/width'),
                height: requireViewNumber(structured.canvas.height, '/canvas/height'),
                coordinates: structured.canvas.coordinates === 'bottom-left-y-up'
                    ? 'bottom-left-y-up'
                    : throwViewInputError('/canvas/coordinates', 'bottom-left-y-up', String(structured.canvas.coordinates))
            },
            timeline: {
                variable: requireViewString(structured.timeline.variable, '/timeline/variable'),
                from: requireViewNumber(structured.timeline.from, '/timeline/from'),
                to: requireViewNumber(structured.timeline.to, '/timeline/to'),
                duration: requireViewNumber(structured.timeline.duration, '/timeline/duration')
            },
            initialFrame: {
                time: requireViewNumber(structured.initialFrame.time, '/initialFrame/time'),
                elements: structured.initialFrame.elements.map((element, index) => cloneDiagramPrimitive(element, index))
            }
        });
    }
    const legacy = view;
    return deepFreeze({
        kind: 'diagram',
        schema: 'legacy-v1',
        name: requireViewString(legacy.name, '/name'),
        title: requireViewString(legacy.title, '/title'),
        description: requireViewString(legacy.description, '/description'),
        canvas: {
            width: requireViewNumber(legacy.canvas.width, '/canvas/width'),
            height: requireViewNumber(legacy.canvas.height, '/canvas/height'),
            coordinates: legacy.canvas.coordinates === 'bottom-left-y-up'
                ? 'bottom-left-y-up'
                : throwViewInputError('/canvas/coordinates', 'bottom-left-y-up', String(legacy.canvas.coordinates))
        },
        timeline: {
            variable: requireViewString(legacy.timeline.variable, '/timeline/variable'),
            from: requireViewNumber(legacy.timeline.from, '/timeline/from'),
            to: requireViewNumber(legacy.timeline.to, '/timeline/to'),
            duration: requireViewNumber(legacy.timeline.duration, '/timeline/duration')
        },
        initialFrame: {
            time: requireViewNumber(legacy.initialFrame.time, '/initialFrame/time'),
            elements: legacy.initialFrame.elements.map((element, index) => ({
                type: requireViewString(element.type, `/initialFrame/elements/${index}/type`),
                name: requireViewString(element.name, `/initialFrame/elements/${index}/name`),
                properties: cloneViewData(element.properties, `/initialFrame/elements/${index}/properties`)
            }))
        }
    });
}
function requireViewString(value, path) {
    if (typeof value !== 'string')
        throwViewInputError(path, 'String', describeInput(value));
    return value;
}
function requireViewNumber(value, path) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throwViewInputError(path, 'finite Number', describeInput(value));
    }
    return value;
}
function throwViewInputError(path, expected, actual) {
    throw new AMXInputError(path, expected, actual);
}
function cloneViewData(value, path, ancestors = new Set()) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean')
        return value;
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            throwViewInputError(path, 'finite JSON-like value', describeInput(value));
        return value;
    }
    if (typeof value !== 'object' || isMeasurement(value)) {
        throwViewInputError(path, 'AMX view data value', describeInput(value));
    }
    if (ancestors.has(value)) {
        throw new AMXRuntimeError({
            code: 'AMX3007',
            message: 'Cyclic AMX view data is not supported'
        });
    }
    ancestors.add(value);
    try {
        if (Array.isArray(value)) {
            return value.map((item, index) => cloneViewData(item, `${path}/${index}`, ancestors));
        }
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null) {
            throwViewInputError(path, 'plain AMX view data record', describeInput(value));
        }
        const copy = {};
        for (const [field, item] of Object.entries(value)) {
            copy[field] = cloneViewData(item, appendInputPath(path, field), ancestors);
        }
        return copy;
    }
    finally {
        ancestors.delete(value);
    }
}
function cloneChartMeasurementDescriptor(descriptor, index) {
    const path = `/measurementDescriptors/${index}`;
    if (!['series', 'x', 'y'].includes(descriptor.role)) {
        throwViewInputError(`${path}/role`, 'series, x, or y', String(descriptor.role));
    }
    const unit = descriptor.unit;
    if (!Number.isFinite(unit.scale) || unit.scale <= 0
        || Object.values(unit.vector).some(exponent => !Number.isFinite(exponent))) {
        throwViewInputError(`${path}/unit`, 'valid display-unit descriptor', 'invalid descriptor');
    }
    return {
        role: descriptor.role,
        ...(descriptor.field === undefined ? {} : { field: requireViewString(descriptor.field, `${path}/field`) }),
        label: requireViewString(descriptor.label, `${path}/label`),
        unit: {
            text: requireViewString(unit.text, `${path}/unit/text`),
            scale: unit.scale,
            vector: { ...unit.vector },
            factors: unit.factors.map((factor, factorIndex) => ({
                identity: requireViewString(factor.identity, `${path}/unit/factors/${factorIndex}/identity`),
                name: requireViewString(factor.name, `${path}/unit/factors/${factorIndex}/name`),
                exponent: requireViewNumber(factor.exponent, `${path}/unit/factors/${factorIndex}/exponent`)
            }))
        }
    };
}
function cloneDiagramPrimitive(element, index) {
    const path = `/initialFrame/elements/${index}`;
    switch (element.primitive) {
        case 'line':
            if (!['none', 'start', 'end', 'both'].includes(element.arrow)) {
                throwViewInputError(`${path}/arrow`, 'none, start, end, or both', String(element.arrow));
            }
            return {
                primitive: 'line', name: requireViewString(element.name, `${path}/name`),
                x1: requireViewNumber(element.x1, `${path}/x1`), y1: requireViewNumber(element.y1, `${path}/y1`),
                x2: requireViewNumber(element.x2, `${path}/x2`), y2: requireViewNumber(element.y2, `${path}/y2`),
                stroke: requireViewString(element.stroke, `${path}/stroke`),
                lineWidth: requireViewNumber(element.lineWidth, `${path}/lineWidth`), arrow: element.arrow
            };
        case 'rectangle':
            return {
                primitive: 'rectangle', name: requireViewString(element.name, `${path}/name`),
                x: requireViewNumber(element.x, `${path}/x`), y: requireViewNumber(element.y, `${path}/y`),
                width: requireViewNumber(element.width, `${path}/width`), height: requireViewNumber(element.height, `${path}/height`),
                stroke: requireViewString(element.stroke, `${path}/stroke`),
                ...(element.fill === undefined ? {} : { fill: requireViewString(element.fill, `${path}/fill`) }),
                lineWidth: requireViewNumber(element.lineWidth, `${path}/lineWidth`)
            };
        case 'circle':
            return {
                primitive: 'circle', name: requireViewString(element.name, `${path}/name`),
                cx: requireViewNumber(element.cx, `${path}/cx`), cy: requireViewNumber(element.cy, `${path}/cy`),
                r: requireViewNumber(element.r, `${path}/r`), stroke: requireViewString(element.stroke, `${path}/stroke`),
                ...(element.fill === undefined ? {} : { fill: requireViewString(element.fill, `${path}/fill`) }),
                lineWidth: requireViewNumber(element.lineWidth, `${path}/lineWidth`)
            };
        case 'text':
            return {
                primitive: 'text', name: requireViewString(element.name, `${path}/name`),
                x: requireViewNumber(element.x, `${path}/x`), y: requireViewNumber(element.y, `${path}/y`),
                value: requireViewString(element.value, `${path}/value`), fill: requireViewString(element.fill, `${path}/fill`)
            };
        default:
            throwViewInputError(`${path}/primitive`, 'supported diagram primitive', String(element.primitive));
    }
}
function deepFreeze(value) {
    if (!value || typeof value !== 'object')
        return value;
    for (const child of Object.values(value))
        deepFreeze(child);
    return Object.freeze(value);
}
function createDimensionRegistry(descriptors) {
    if (!descriptors)
        return undefined;
    const dimensions = new Map();
    const units = new Map();
    const baseUnits = new Map();
    for (const descriptor of descriptors) {
        validateUnit(descriptor);
        const vector = new Map(Object.entries(descriptor.vector));
        const unit = {
            name: descriptor.name,
            moduleIdentity: 'generated',
            declarationName: descriptor.name,
            identity: descriptor.identity,
            vector,
            scale: descriptor.scale,
            offset: descriptor.offset
        };
        units.set(descriptor.name, unit);
        for (const [identity, exponent] of vector) {
            if (!dimensions.has(identity)) {
                dimensions.set(identity, {
                    name: identity,
                    moduleIdentity: 'generated',
                    declarationName: identity,
                    baseIdentity: identity,
                    vector: new Map([[identity, 1]])
                });
            }
            if (exponent === 1 && descriptor.scale === 1 && descriptor.offset === 0 && !baseUnits.has(identity)) {
                baseUnits.set(identity, unit);
            }
        }
    }
    return { dimensions, units, baseUnits };
}
function matchesInputDescriptor(value, descriptor, ancestors = new Set()) {
    switch (descriptor.kind) {
        case 'number': return typeof value === 'number';
        case 'string': return typeof value === 'string';
        case 'boolean': return typeof value === 'boolean';
        case 'dateTime': return typeof value === 'string' && validAMXDateTime(value);
        case 'enum':
            return (typeof value === 'string' || typeof value === 'number')
                && descriptor.members.some(member => typeof member === typeof value && member === value);
        case 'measurement':
            return isMeasurement(value)
                && sameVector(value.unit.vector, descriptor.dimensionVector);
        case 'nullable':
            return value === null || matchesInputDescriptor(value, descriptor.value, ancestors);
        case 'list': {
            if (!Array.isArray(value) || ancestors.has(value))
                return false;
            ancestors.add(value);
            try {
                return value.every(item => matchesInputDescriptor(item, descriptor.element, ancestors));
            }
            finally {
                ancestors.delete(value);
            }
        }
        case 'record': {
            if (typeof value !== 'object' || value === null || Array.isArray(value)
                || isMeasurement(value) || ancestors.has(value))
                return false;
            const record = value;
            const fieldNames = new Set(descriptor.fields.map(field => field.name));
            if (Object.keys(record).some(name => !fieldNames.has(name)))
                return false;
            ancestors.add(value);
            try {
                return descriptor.fields.every(field => {
                    if (!Object.prototype.hasOwnProperty.call(record, field.name)) {
                        return field.optional === true || field.defaultValue !== undefined;
                    }
                    return matchesInputDescriptor(record[field.name], field.descriptor, ancestors);
                });
            }
            finally {
                ancestors.delete(value);
            }
        }
    }
}
function validateInputValue(value, descriptor, inputPath, context, ancestors = new Set()) {
    const withContext = (run) => {
        try {
            return run();
        }
        catch (error) {
            if (error instanceof AMXInputError) {
                throw new AMXInputError(error.inputPath, error.expected, error.actual, context);
            }
            throw error;
        }
    };
    switch (descriptor.kind) {
        case 'number': return withContext(() => requireAMXNumber(value, inputPath));
        case 'string': return withContext(() => requireAMXString(value, inputPath));
        case 'boolean': return withContext(() => requireAMXBoolean(value, inputPath));
        case 'dateTime':
            if (typeof value !== 'string' || !validAMXDateTime(value)) {
                throw new AMXInputError(inputPath, 'RFC 3339 DateTime', describeInput(value), context);
            }
            return value;
        case 'enum':
            return withContext(() => requireAMXEnum(value, descriptor.enumName, descriptor.members, inputPath));
        case 'measurement': {
            try {
                validateMeasurementDescriptor(descriptor);
                return requireAMXMeasurement(value, descriptor.dimensionName, descriptor.dimensionVector, descriptor.units, inputPath);
            }
            catch (error) {
                if (error instanceof AMXInputError) {
                    throw new AMXInputError(error.inputPath, error.expected, error.actual, context);
                }
                if (error instanceof RangeError) {
                    throw new AMXInputError(inputPath, 'finite physical Measurement', describeInput(value), context);
                }
                if (error instanceof TypeError) {
                    throw new AMXInputError(inputPath, 'valid Measurement descriptor', 'invalid descriptor', context);
                }
                throw error;
            }
        }
        case 'nullable':
            return value === null ? null : validateInputValue(value, descriptor.value, inputPath, context, ancestors);
        case 'list': {
            const list = withContext(() => requireAMXList(value, inputPath));
            if (ancestors.has(list)) {
                throw new AMXInputError(inputPath, 'acyclic list', 'cyclic list', context);
            }
            ancestors.add(list);
            try {
                return list.map((item, index) => validateInputValue(item, descriptor.element, appendInputPath(inputPath, String(index)), context, ancestors));
            }
            finally {
                ancestors.delete(list);
            }
        }
        case 'record': {
            const fields = descriptor.fields;
            if (new Set(fields.map(field => field.name)).size !== fields.length) {
                throw new AMXInputError(inputPath, 'valid record descriptor', 'duplicate field name', context);
            }
            const record = withContext(() => requireAMXRecord(value, inputPath, fields.map(field => field.name)));
            if (ancestors.has(record)) {
                throw new AMXInputError(inputPath, 'acyclic record', 'cyclic record', context);
            }
            ancestors.add(record);
            try {
                const normalized = {};
                for (const field of fields) {
                    const fieldPath = appendInputPath(inputPath, field.name);
                    if (Object.prototype.hasOwnProperty.call(record, field.name)) {
                        normalized[field.name] = validateInputValue(record[field.name], field.descriptor, fieldPath, context, ancestors);
                    }
                    else if (field.defaultValue) {
                        normalized[field.name] = validateInputValue(field.defaultValue(), field.descriptor, fieldPath, context, ancestors);
                    }
                    else if (field.optional) {
                        normalized[field.name] = null;
                    }
                    else {
                        throw new AMXInputError(fieldPath, descriptorName(field.descriptor), 'missing', context);
                    }
                }
                return normalized;
            }
            finally {
                ancestors.delete(record);
            }
        }
    }
}
function validateMeasurementDescriptor(descriptor) {
    if (!descriptor.dimensionName || Object.values(descriptor.dimensionVector).some(value => !Number.isFinite(value))) {
        throw new TypeError('Invalid measurement dimension descriptor');
    }
    for (const [name, unit] of Object.entries(descriptor.units)) {
        validateUnit(unit);
        if (name !== unit.name || !sameVector(unit.vector, descriptor.dimensionVector)) {
            throw new TypeError('Invalid measurement unit descriptor');
        }
    }
}
function descriptorName(descriptor) {
    switch (descriptor.kind) {
        case 'number': return 'finite Number';
        case 'string': return 'String';
        case 'boolean': return 'Boolean';
        case 'dateTime': return 'RFC 3339 DateTime';
        case 'enum': return `member of enum '${descriptor.enumName}'`;
        case 'measurement': return `Measurement<${descriptor.dimensionName}>`;
        case 'nullable': return `${descriptorName(descriptor.value)} or null`;
        case 'list': return `list of ${descriptorName(descriptor.element)}`;
        case 'record': return `record '${descriptor.recordName}'`;
    }
}
function appendInputPath(inputPath, segment) {
    return `${inputPath}/${escapePointer(segment)}`;
}
function validAMXDateTime(value) {
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/);
    if (!parts)
        return false;
    const [, year, month, day, hour, minute, second, offset] = parts;
    const date = new Date(0);
    date.setUTCFullYear(+year, +month - 1, +day);
    return date.getUTCFullYear() === +year && date.getUTCMonth() === +month - 1 && date.getUTCDate() === +day
        && +hour <= 23 && +minute <= 59 && +second <= 59
        && (offset === 'Z' || (+offset.slice(1, 3) <= 23 && +offset.slice(4) <= 59));
}
function copyArrayTree(value) {
    return Array.isArray(value) ? value.map(copyArrayTree) : value;
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
function sourceLocation(context) {
    if (context?.line === undefined || context.column === undefined)
        return undefined;
    return { line: context.line, column: context.column };
}
function withRuntimeErrorContext(run, context) {
    try {
        return run();
    }
    catch (error) {
        if (error instanceof AMXRuntimeError || error instanceof AMXInputError)
            throw error;
        if (error instanceof AmxError) {
            throw new AMXRuntimeError({
                code: error.code,
                message: error.message,
                file: error.file ?? context?.file,
                line: error.line ?? context?.line,
                column: error.column ?? context?.column,
                inputPath: context?.inputPath
            }, error);
        }
        throw error;
    }
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