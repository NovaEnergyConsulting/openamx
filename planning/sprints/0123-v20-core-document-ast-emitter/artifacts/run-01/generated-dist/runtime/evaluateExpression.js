import { inputError, staticError, throwInputErrors, throwInvalidLoopIterable, throwInvalidRangeBounds, throwInvalidReturnContext, throwFunctionFallthrough, throwListOperationError, throwMeasurementDomainError } from '../diagnostics/errors';
import { Environment } from './environment';
import { evaluateStandardLibraryCall, isMathematicalFunction } from './standardLibrary';
import { fieldRegistry } from '../typechecker/declarationRegistry';
import { canonicalUnit, composeUnits, isAffineUnit, isMeasurement, measurement, measurementDisplayValue, measurementPhysicalValue, powerUnit, sqrtMeasurement, unitFromMetadata } from './measurement';
import { createDiagramModel } from './diagramModel';
function validateRuntimeValue(value, expected, env, source, file, valuePath) {
    const diagnostics = [];
    const report = (message, target, actual, dataPath, fieldSource) => {
        const diagnostic = inputError('AMX4003', message, {
            file,
            line: source?.line,
            column: source?.column,
            dataPath,
            expected: formatCheckedType(target),
            actual: runtimeDescription(actual),
            fieldSource
        });
        diagnostics.push(diagnostic);
        if (env.validationMode === 'fail-fast')
            throwInputErrors([diagnostic]);
    };
    const visit = (actual, target, dataPath, fieldSource) => {
        if (target.kind === 'null') {
            if (actual !== null)
                report('Expected null', target, actual, dataPath, fieldSource);
            return;
        }
        if (target.kind === 'nullable') {
            if (actual !== null)
                visit(actual, target.element, dataPath, fieldSource);
            return;
        }
        if (target.kind === 'list') {
            if (!Array.isArray(actual)) {
                report('Expected a list value', target, actual, dataPath, fieldSource);
                return;
            }
            actual.forEach((item, index) => visit(item, target.element, `${dataPath}[${index}]`, fieldSource));
            return;
        }
        if (target.kind === 'measurement') {
            if (!isMeasurement(actual)) {
                report('Expected a measurement value', target, actual, dataPath, fieldSource);
                return;
            }
            const vector = actual.unit.vector;
            if (Object.keys(vector).length !== target.vector.size
                || [...target.vector].some(([identity, exponent]) => vector[identity] !== exponent)) {
                report('Measurement dimension does not match the declared dimension', target, actual, dataPath, fieldSource);
            }
            if (!Number.isFinite(actual.value) || !Number.isFinite(measurementPhysicalValue(actual))) {
                report('Measurement value must be finite', target, actual, dataPath, fieldSource);
            }
            return;
        }
        if (target.kind !== 'named')
            return;
        if (target.name === 'Number') {
            if (typeof actual !== 'number' || !Number.isFinite(actual))
                report('Expected a finite Number value', target, actual, dataPath, fieldSource);
            return;
        }
        if (target.name === 'String' || target.name === 'DateTime') {
            if (typeof actual !== 'string')
                report(`Expected a ${target.name} value`, target, actual, dataPath, fieldSource);
            else if (target.name === 'DateTime' && !validDateTime(actual))
                report('Invalid RFC 3339 DateTime value', target, actual, dataPath, fieldSource);
            return;
        }
        if (target.name === 'Boolean') {
            if (typeof actual !== 'boolean')
                report('Expected a Boolean value', target, actual, dataPath, fieldSource);
            return;
        }
        const declaration = env.recordTypes.get(target.name);
        if (!declaration || typeof actual !== 'object' || actual === null || Array.isArray(actual)) {
            report(`Expected a ${target.name} record`, target, actual, dataPath, fieldSource);
            return;
        }
        const record = actual;
        const fieldNames = new Set(declaration.fields.map(field => field.name));
        for (const field of declaration.fields) {
            const fieldScope = fieldRegistry(field, env.dimensionRegistry);
            if (!Object.prototype.hasOwnProperty.call(record, field.name)) {
                report(`Missing computed field '${field.name}'`, checkedType(field.annotation, fieldScope), 'missing', `${dataPath}.${field.name}`, field.source);
            }
            else {
                visit(record[field.name], checkedType(field.annotation, fieldScope), `${dataPath}.${field.name}`, field.source);
            }
        }
        for (const name of Object.keys(record).filter(name => !fieldNames.has(name)).sort()) {
            report(`Unknown computed field '${name}'`, target, record[name], `${dataPath}.${name}`, fieldSource);
        }
    };
    visit(value, expected, valuePath);
    if (diagnostics.length)
        throwInputErrors(diagnostics);
}
function evaluateFieldDefault(field, env, file) {
    if (!field.defaultExpression)
        return null;
    const currentRegistry = env.dimensionRegistry;
    env.dimensionRegistry = fieldRegistry(field, currentRegistry);
    try {
        return evaluateExpression(field.defaultExpression, env, file);
    }
    finally {
        env.dimensionRegistry = currentRegistry;
    }
}
function checkedType(reference, scope) {
    const registry = scope instanceof Environment ? scope.dimensionRegistry : scope;
    if (reference.type === 'namedType') {
        const dimension = registry?.dimensions.get(reference.name);
        return dimension ? { kind: 'measurement', vector: dimension.vector } : { kind: 'named', name: reference.name };
    }
    const element = checkedType(reference.element, registry);
    return reference.type === 'listType' ? { kind: 'list', element } : { kind: 'nullable', element };
}
function formatCheckedType(type) {
    if (type.kind === 'named')
        return type.name;
    if (type.kind === 'measurement')
        return 'measurement';
    if (type.kind === 'null')
        return 'null';
    return type.kind === 'list' ? `${formatCheckedType(type.element)}[]` : `${formatCheckedType(type.element)}?`;
}
function runtimeDescription(value) {
    if (typeof value === 'number' && !Number.isFinite(value))
        return String(value);
    let description;
    try {
        description = JSON.stringify(value) ?? String(value);
    }
    catch {
        description = String(value);
    }
    return description.replace(/[\x00-\x1f\x7f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`).slice(0, 160);
}
function sameMeasurementVector(value, vector) {
    return Object.keys(value.unit.vector).length === vector.size
        && [...vector].every(([identity, exponent]) => value.unit.vector[identity] === exponent);
}
function validDateTime(value) {
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
function matchesRuntimeType(value, target, env, file, registry = env.dimensionRegistry) {
    if (target.type === 'nullableType') {
        return value === null || matchesRuntimeType(value, target.element, env, file, registry);
    }
    if (target.type === 'listType') {
        return Array.isArray(value) && value.every(item => matchesRuntimeType(item, target.element, env, file, registry));
    }
    const name = target.name;
    const dimension = registry?.dimensions.get(name);
    if (dimension)
        return isMeasurement(value) && sameMeasurementVector(value, dimension.vector);
    if (name === 'Number')
        return typeof value === 'number';
    if (name === 'String')
        return typeof value === 'string';
    if (name === 'Boolean')
        return typeof value === 'boolean';
    if (name === 'DateTime')
        return typeof value === 'string' && validDateTime(value);
    const enumeration = env.enumDeclarations.get(name);
    if (enumeration) {
        if (typeof value !== 'number' && typeof value !== 'string')
            return false;
        if (!enumeration.resolvedValues)
            throw new Error(`Enum '${name}' has not been resolved`);
        return enumeration.resolvedValues.includes(value);
    }
    const declaration = env.recordTypes.get(name);
    if (declaration) {
        if (typeof value !== 'object' || value === null || Array.isArray(value) || isMeasurement(value))
            return false;
        const record = value;
        return declaration.fields.every(field => {
            if (!Object.prototype.hasOwnProperty.call(record, field.name))
                return field.optional;
            return matchesRuntimeType(record[field.name], field.annotation, env, file, fieldRegistry(field, registry));
        });
    }
    return staticError('AMX3001', `Unknown type '${name}'`, target.source, file);
}
/** Evaluate V0.2 expressions, including ranges and expression-form loops. */
export function evaluateExpression(node, env, file) {
    switch (node.type) {
        case 'nullLiteral':
            return null;
        case 'recordConstructor': {
            const declaration = env.recordTypes.get(node.name);
            if (!declaration)
                throw new Error(`Unknown record type '${node.name}'`);
            const supplied = new Map(node.fields.map(field => [field.name, evaluateExpression(field.expression, env, file)]));
            const record = {};
            for (const field of declaration.fields) {
                record[field.name] = supplied.has(field.name) ? supplied.get(field.name)
                    : field.defaultExpression ? evaluateFieldDefault(field, env, file) : null;
            }
            validateRuntimeValue(record, { kind: 'named', name: node.name }, env, node.source, file, `record ${node.name}`);
            return record;
        }
        case 'fieldAccess': {
            if (node.receiver.type === 'identifier') {
                const enumeration = env.enumValues.get(node.receiver.name);
                if (enumeration)
                    return enumeration[node.field];
            }
            return evaluateExpression(node.receiver, env, file)[node.field];
        }
        case 'listAccess':
            return evalListAccess(node, env, file);
        case 'numberLiteral':
            return node.value;
        case 'stringLiteral':
            return node.value;
        case 'stringInterpolation':
            return node.parts.map(part => {
                if (typeof part === 'string')
                    return part;
                const value = evaluateExpression(part, env, file);
                if (value === null)
                    return 'null';
                if (typeof value === 'string' || typeof value === 'number')
                    return String(value);
                if (typeof value === 'boolean')
                    return value ? 'true' : 'false';
                if (isMeasurement(value))
                    return `${String(value.value)} ${value.unit.text}`;
                return staticError('AMX3007', 'Only String, Number, Boolean, measurement, and null values can be interpolated', part.source, file);
            }).join('');
        case 'booleanLiteral':
            return node.value;
        case 'identifier':
            if (node.name === 'PI')
                return Math.PI;
            if (node.name === 'E')
                return Math.E;
            // Pass source location for better diagnostics
            return env.get(node.name, node.source, file);
        case 'measurementAttachment': {
            const value = evaluateExpression(node.value, env, file);
            const unit = env.dimensionRegistry?.units.get(node.unit);
            if (!unit)
                return staticError('AMX3008', `Unknown or invisible unit '${node.unit}'`, node.unitSource ?? node.source, file);
            if (typeof value !== 'number')
                return staticError('AMX3007', 'Unit attachment requires a Number expression', node.source, file);
            const result = measurement(value, unitFromMetadata(unit));
            if (!Number.isFinite(measurementPhysicalValue(result))) {
                throwMeasurementDomainError('Measurement physical value must be finite', node.source, file);
            }
            return result;
        }
        case 'measurementConversion': {
            const value = evaluateExpression(node.value, env, file);
            const unit = env.dimensionRegistry?.units.get(node.unit);
            if (!unit)
                return staticError('AMX3008', `Unknown or invisible unit '${node.unit}'`, node.unitSource ?? node.source, file);
            if (!isMeasurement(value) || !sameMeasurementVector(value, unit.vector)) {
                return staticError('AMX3007', `Cannot convert value to unit '${node.unit}'`, node.source, file);
            }
            const target = unitFromMetadata(unit);
            const converted = measurementDisplayValue(measurementPhysicalValue(value), target);
            if (!Number.isFinite(converted))
                throwMeasurementDomainError('Converted measurement value must be finite', node.source, file);
            return measurement(converted, target);
        }
        case 'binaryExpression':
            return evalBinary(node, env, file);
        case 'typeTestExpression':
            return matchesRuntimeType(evaluateExpression(node.value, env, file), node.target, env, file);
        case 'unaryExpression':
            return evalUnary(node, env, file);
        case 'conditionalExpression':
            return evalConditional(node, env, file);
        case 'bracedIfExpression':
            return evalBracedIfExpression(node, env, file);
        case 'listLiteral':
            return evalListLiteral(node, env, file);
        case 'functionCall':
            return evalFunctionCall(node, env, file);
        case 'rangeExpression':
            return evalRange(node, env, file);
        case 'forExpression':
            return evalForExpression(node, env, file);
        case 'matchExpression':
            return evalMatch(node, env, file);
        default: {
            // Exhaustiveness check: if a new node type is added without a case, this will fail to compile.
            const _exhaustive = node;
            throw new Error(`Unsupported expression node type: ${_exhaustive}`);
        }
    }
}
function evalMatch(node, env, file) {
    const value = evaluateExpression(node.expression, env, file);
    for (const arm of node.cases) {
        if (value === arm.value.value)
            return evaluateExpression(arm.expression, env, file);
    }
    return evaluateExpression(node.defaultExpression, env, file);
}
function evalBinary(node, env, file) {
    const left = evaluateExpression(node.left, env, file);
    const right = evaluateExpression(node.right, env, file);
    const operatorSource = node.operatorSource ?? node.source;
    switch (node.operator) {
        // Arithmetic (numeric)
        case '+':
        case '-': {
            if (isMeasurement(left) || isMeasurement(right)) {
                if (!isMeasurement(left) || !isMeasurement(right) || !sameMeasurementVector(left, new Map(Object.entries(right.unit.vector)))) {
                    return staticError('AMX3007', 'Addition and subtraction require compatible measurements', operatorSource, file);
                }
                if (node.operator === '+' && (isAffineUnit(left.unit) || isAffineUnit(right.unit))) {
                    return staticError('AMX3007', 'Direct addition of affine measurements is not supported', operatorSource, file);
                }
                const physicalLeft = measurementPhysicalValue(left);
                const physicalRight = measurementPhysicalValue(right);
                const physical = node.operator === '+' ? physicalLeft + physicalRight : physicalLeft - physicalRight;
                const value = node.operator === '+'
                    ? measurementDisplayValue(physical, left.unit)
                    : physical / left.unit.scale;
                if (!Number.isFinite(value) || !Number.isFinite(physical)) {
                    throwMeasurementDomainError('Measurement arithmetic result must be finite', operatorSource, file);
                }
                return measurement(value, left.unit);
            }
            const lNum = toNumber(left, node.left);
            const rNum = toNumber(right, node.right);
            return node.operator === '+' ? lNum + rNum : lNum - rNum;
        }
        case '*':
        case '/': {
            if (isMeasurement(left) || isMeasurement(right)) {
                const numberUnit = { scale: 1, offset: 0, vector: {}, factors: [], text: '1' };
                const leftMeasurement = isMeasurement(left) ? left : undefined;
                const rightMeasurement = isMeasurement(right) ? right : undefined;
                if (leftMeasurement && isAffineUnit(leftMeasurement.unit) || rightMeasurement && isAffineUnit(rightMeasurement.unit)) {
                    return staticError('AMX3007', node.operator === '*' ? 'Affine measurement multiplication is not supported' : 'Affine measurement division is not supported', operatorSource, file);
                }
                const leftValue = leftMeasurement ? leftMeasurement.value : toNumber(left, node.left);
                const rightValue = rightMeasurement ? rightMeasurement.value : toNumber(right, node.right);
                const leftUnit = leftMeasurement?.unit ?? numberUnit;
                const rightUnit = rightMeasurement?.unit ?? numberUnit;
                const leftPhysical = leftMeasurement ? measurementPhysicalValue(leftMeasurement) : leftValue;
                const rightPhysical = rightMeasurement ? measurementPhysicalValue(rightMeasurement) : rightValue;
                if (node.operator === '/' && rightPhysical === 0) {
                    throwMeasurementDomainError('Measurement division by zero', operatorSource, file);
                }
                const unit = composeUnits(leftUnit, rightUnit, node.operator === '/');
                const physical = node.operator === '/'
                    ? leftPhysical / rightPhysical
                    : leftPhysical * rightPhysical;
                if (unit.vector && Object.keys(unit.vector).length === 0) {
                    if (!Number.isFinite(physical))
                        throwMeasurementDomainError('Measurement arithmetic result must be finite', operatorSource, file);
                    return physical;
                }
                const value = node.operator === '/' ? leftValue / rightValue : leftValue * rightValue;
                if (!Number.isFinite(unit.scale) || unit.scale <= 0 || !Number.isFinite(value) || !Number.isFinite(physical)) {
                    throwMeasurementDomainError('Measurement arithmetic result must be finite', operatorSource, file);
                }
                return measurement(value, unit);
            }
            const lNum = toNumber(left, node.left);
            const rNum = toNumber(right, node.right);
            return node.operator === '*' ? lNum * rNum : lNum / rNum;
        }
        case '%': {
            const lNum = toNumber(left, node.left);
            const rNum = toNumber(right, node.right);
            return lNum % rNum;
        }
        case '^': {
            if (isMeasurement(left)) {
                if (isAffineUnit(left.unit)) {
                    return staticError('AMX3007', 'Affine measurement powers are not supported', operatorSource, file);
                }
                const exponent = toNumber(right, node.right);
                if (!Number.isSafeInteger(exponent)) {
                    return staticError('AMX3007', 'A dimensional power exponent must be an integer literal', node.right.source, file);
                }
                if (left.value === 0 && exponent < 0) {
                    throwMeasurementDomainError('Zero measurement cannot be raised to a negative power', operatorSource, file);
                }
                const unit = powerUnit(left.unit, exponent);
                const value = Math.pow(left.value, exponent);
                if (!Number.isFinite(value) || !Number.isFinite(unit.scale)) {
                    throwMeasurementDomainError('Measurement power result must be finite', operatorSource, file);
                }
                const result = measurement(value, unit);
                if (Object.keys(unit.vector).length === 0)
                    return measurementPhysicalValue(result);
                return result;
            }
            const lNum = toNumber(left, node.left);
            const rNum = toNumber(right, node.right);
            return Math.pow(lNum, rNum);
        }
        // Comparisons (produce boolean)
        case '==':
            if (isMeasurement(left) && isMeasurement(right)) {
                return sameMeasurementVector(left, new Map(Object.entries(right.unit.vector)))
                    && measurementPhysicalValue(left) === measurementPhysicalValue(right);
            }
            return left === right;
        case '!=':
            if (isMeasurement(left) && isMeasurement(right)) {
                return !sameMeasurementVector(left, new Map(Object.entries(right.unit.vector)))
                    || measurementPhysicalValue(left) !== measurementPhysicalValue(right);
            }
            return left !== right;
        case '>':
            if (isMeasurement(left) && isMeasurement(right))
                return measurementPhysicalValue(left) > measurementPhysicalValue(right);
            return toNumber(left, node.left) > toNumber(right, node.right);
        case '>=':
            if (isMeasurement(left) && isMeasurement(right))
                return measurementPhysicalValue(left) >= measurementPhysicalValue(right);
            return toNumber(left, node.left) >= toNumber(right, node.right);
        case '<':
            if (isMeasurement(left) && isMeasurement(right))
                return measurementPhysicalValue(left) < measurementPhysicalValue(right);
            return toNumber(left, node.left) < toNumber(right, node.right);
        case '<=':
            if (isMeasurement(left) && isMeasurement(right))
                return measurementPhysicalValue(left) <= measurementPhysicalValue(right);
            return toNumber(left, node.left) <= toNumber(right, node.right);
        // Logical (short-circuit not required for simple impl; evaluate both then apply)
        case 'and':
            return toBoolean(left) && toBoolean(right);
        case 'or':
            return toBoolean(left) || toBoolean(right);
        default:
            throw new Error(`Unsupported binary operator: ${node.operator}`);
    }
}
function evalUnary(node, env, file) {
    const arg = evaluateExpression(node.argument, env, file);
    if (node.operator === '-') {
        if (isMeasurement(arg))
            return measurement(-arg.value, arg.unit);
        return -toNumber(arg, node.argument);
    }
    if (node.operator === 'not') {
        return !toBoolean(arg);
    }
    throw new Error(`Unsupported unary operator: ${node.operator}`);
}
export function evaluateBinaryValues(operator, leftValue, rightValue, source, file) {
    const environment = new Environment();
    const leftName = '__amxRuntimeLeftValue';
    const rightName = '__amxRuntimeRightValue';
    environment.set(leftName, leftValue);
    environment.set(rightName, rightValue);
    return evalBinary({
        type: 'binaryExpression',
        operator,
        left: { type: 'identifier', name: leftName, source },
        right: { type: 'identifier', name: rightName, source },
        operatorSource: source,
        source
    }, environment, file);
}
export function evaluateUnaryValue(operator, value, source, file) {
    const environment = new Environment();
    const name = '__amxRuntimeUnaryValue';
    environment.set(name, value);
    return evalUnary({
        type: 'unaryExpression',
        operator,
        argument: { type: 'identifier', name, source },
        source
    }, environment, file);
}
export function evaluateBuiltinValues(callee, values, source, file, dimensionRegistry) {
    const environment = new Environment();
    environment.dimensionRegistry = dimensionRegistry;
    const argumentsList = values.map((value, index) => {
        const name = `__amxRuntimeArgument${index}`;
        environment.set(name, value);
        return { type: 'identifier', name, source };
    });
    return evalFunctionCall({
        type: 'functionCall',
        callee,
        arguments: argumentsList,
        source
    }, environment, file);
}
export function evaluateListItem(listValue, indexValue, source, file) {
    const environment = new Environment();
    const listName = '__amxRuntimeListValue';
    const indexName = '__amxRuntimeIndexValue';
    environment.set(listName, listValue);
    environment.set(indexName, indexValue);
    return evalListAccess({
        type: 'listAccess',
        receiver: { type: 'identifier', name: listName, source },
        index: { type: 'identifier', name: indexName, source },
        source
    }, environment, file);
}
export function evaluateRangeValues(startValue, endValue, source, file) {
    const environment = new Environment();
    const startName = '__amxRuntimeRangeStart';
    const endName = '__amxRuntimeRangeEnd';
    environment.set(startName, startValue);
    environment.set(endName, endValue);
    return evalRange({
        type: 'rangeExpression',
        start: { type: 'identifier', name: startName, source },
        end: { type: 'identifier', name: endName, source },
        source
    }, environment, file);
}
export function evaluateListAddition(list, value, position, mutable, targetName, source, file) {
    const environment = new Environment();
    environment.set(targetName, list);
    if (!mutable)
        environment.markImmutable(list);
    const valueName = '__amxRuntimeListAddValue';
    const positionName = '__amxRuntimeListAddPosition';
    environment.set(valueName, value);
    environment.set(positionName, position);
    evaluateAddStatement({
        type: 'addStatement', name: targetName,
        value: { type: 'identifier', name: valueName, source },
        ...(position === undefined ? {} : { index: { type: 'identifier', name: positionName, source } }),
        source
    }, environment, file);
}
export function evaluateListRemoval(list, count, position, mutable, targetName, source, file) {
    const environment = new Environment();
    environment.set(targetName, list);
    if (!mutable)
        environment.markImmutable(list);
    const countName = '__amxRuntimeListRemoveCount';
    const positionName = '__amxRuntimeListRemovePosition';
    environment.set(countName, count);
    environment.set(positionName, position);
    evaluateRemoveStatement({
        type: 'removeStatement', name: targetName,
        count: { type: 'identifier', name: countName, source },
        ...(position === undefined ? {} : { index: { type: 'identifier', name: positionName, source } }),
        source
    }, environment, file);
}
export function evaluateIterableValue(value, source, file) {
    const environment = new Environment();
    const name = '__amxRuntimeIterableValue';
    environment.set(name, value);
    return evaluateLoopIterable({ type: 'identifier', name, source }, environment, file);
}
function evalConditional(node, env, file) {
    const testVal = evaluateExpression(node.test, env, file);
    return toBoolean(testVal)
        ? evaluateExpression(node.consequent, env, file)
        : evaluateExpression(node.alternate, env, file);
}
class ConditionalValueReturn {
    value;
    constructor(value) {
        this.value = value;
    }
}
class ForExpressionReturn {
    value;
    constructor(value) {
        this.value = value;
    }
}
class FunctionBodyReturn {
    value;
    constructor(value) {
        this.value = value;
    }
}
const conditionalReturnDepth = new WeakMap();
const forExpressionDepth = new WeakMap();
const functionReturnDepth = new WeakMap();
const scopedBindings = new WeakMap();
function withDepth(depths, env, run) {
    depths.set(env, (depths.get(env) ?? 0) + 1);
    try {
        return run();
    }
    finally {
        const depth = depths.get(env) - 1;
        if (depth)
            depths.set(env, depth);
        else
            depths.delete(env);
    }
}
function rememberScopedBinding(name, env) {
    const scopes = scopedBindings.get(env);
    const currentScope = scopes?.[scopes.length - 1];
    if (!currentScope || currentScope.has(name))
        return;
    const existed = env.has(name);
    currentScope.set(name, { existed, value: existed ? env.get(name) : undefined });
}
function evaluateScopedStatements(statements, env, file) {
    const scopes = scopedBindings.get(env) ?? [];
    const bindings = new Map();
    scopes.push(bindings);
    scopedBindings.set(env, scopes);
    try {
        evaluateStatements(statements, env, file);
    }
    finally {
        scopes.pop();
        for (const [name, previous] of bindings) {
            if (previous.existed)
                env.set(name, previous.value);
            else
                env.delete(name);
        }
        if (!scopes.length)
            scopedBindings.delete(env);
    }
}
function evalBracedIfExpression(node, env, file) {
    const branch = toBoolean(evaluateExpression(node.test, env, file)) ? node.consequent : node.alternate;
    const closingSource = branch === node.consequent ? node.consequentSource : node.alternateSource;
    try {
        withDepth(conditionalReturnDepth, env, () => evaluateScopedStatements(branch, env, file));
    }
    catch (error) {
        if (error instanceof ConditionalValueReturn)
            return error.value;
        throw error;
    }
    return staticError('AMX3021', 'Every possible path in an if expression must return a value', closingSource ?? node.source, file);
}
function evalListLiteral(node, env, file) {
    return node.elements.map(el => evaluateExpression(el, env, file));
}
function evalListAccess(node, env, file) {
    const receiver = evaluateExpression(node.receiver, env, file);
    const index = evaluateExpression(node.index, env, file);
    if (!Array.isArray(receiver)) {
        throwListOperationError('List access requires a list value', node.source, file);
    }
    if (typeof index !== 'number' || !Number.isFinite(index) || !Number.isInteger(index) || index < 1) {
        throwListOperationError(`List index must be a positive integer; got ${runtimeDescription(index)}`, node.index.source ?? node.source, file);
    }
    if (index > receiver.length) {
        throwListOperationError(`List index ${index} is out of bounds for length ${receiver.length}; expected 1..${receiver.length}`, node.index.source ?? node.source, file);
    }
    return receiver[index - 1];
}
function functionArgumentSource(expression, fallback) {
    if (expression.type === 'binaryExpression') {
        return functionArgumentSource(expression.left, fallback) ?? expression.operatorSource ?? expression.source ?? fallback;
    }
    if (expression.type === 'unaryExpression') {
        const operandSource = functionArgumentSource(expression.argument, fallback);
        if (operandSource) {
            return {
                line: operandSource.line,
                column: Math.max(1, operandSource.column - (expression.operator === 'not' ? 3 : 1))
            };
        }
    }
    if (expression.type === 'measurementAttachment' || expression.type === 'measurementConversion') {
        return functionArgumentSource(expression.value, fallback) ?? expression.source ?? fallback;
    }
    return expression.source ?? fallback;
}
function copyArrayTree(value) {
    return Array.isArray(value) ? value.map(copyArrayTree) : value;
}
function isListParameter(type) {
    return type.kind === 'list' || (type.kind === 'nullable' && type.element.kind === 'list');
}
function evalFunctionCall(node, env, file) {
    const args = node.arguments.map(a => evaluateExpression(a, env, file));
    const userFunction = env.functions.get(node.callee);
    if (userFunction) {
        const functionRegistry = fieldRegistry(userFunction, env.dimensionRegistry);
        const parameters = {};
        userFunction.parameters.forEach((parameter, index) => {
            const parameterType = checkedType(parameter.annotation, functionRegistry);
            validateRuntimeValue(args[index], parameterType, env, node.arguments[index]?.source ?? node.source, file, `function ${node.callee}.${parameter.name}`);
            const value = args[index];
            parameters[parameter.name] = isListParameter(parameterType) && value !== null
                ? copyArrayTree(value)
                : value;
        });
        const frame = env.createCallFrame(parameters);
        frame.dimensionRegistry = functionRegistry;
        userFunction.parameters.forEach(parameter => {
            frame.bindingTypes.set(parameter.name, checkedType(parameter.annotation, functionRegistry));
        });
        let result;
        const body = userFunction.body;
        if (body.kind === 'expression') {
            result = evaluateExpression(body.expression, frame, file);
        }
        else {
            let returned = false;
            try {
                withDepth(functionReturnDepth, frame, () => evaluateStatements(body.statements, frame, file));
            }
            catch (error) {
                if (!(error instanceof FunctionBodyReturn))
                    throw error;
                returned = true;
                result = error.value;
            }
            if (!returned)
                throwFunctionFallthrough(body.closingSource, file);
        }
        validateRuntimeValue(result, checkedType(userFunction.returnType, functionRegistry), env, node.source, file, `function ${node.callee} return`);
        return result;
    }
    const values = args[0];
    if (['sum', 'mean', 'min', 'max'].includes(node.callee) && Array.isArray(values)
        && (values.length > 0 && isMeasurement(values[0]))) {
        const measurements = values;
        const first = measurements[0];
        for (const current of measurements) {
            if (!sameMeasurementVector(first, new Map(Object.entries(current.unit.vector)))) {
                return staticError('AMX3007', `${node.callee} requires compatible measurement dimensions`, node.source, file);
            }
            if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'number'
                && ['sum', 'mean', 'min', 'max'].includes(node.callee)) {
                return evaluateStandardLibraryCall(node.callee, args, node.source, file);
            }
        }
        if (node.callee === 'min' || node.callee === 'max') {
            if (!measurements.length)
                return evaluateStandardLibraryCall(node.callee, args, node.source, file);
            return measurements.reduce((best, current) => {
                const better = node.callee === 'min'
                    ? measurementPhysicalValue(current) < measurementPhysicalValue(best)
                    : measurementPhysicalValue(current) > measurementPhysicalValue(best);
                return better ? current : best;
            });
        }
        const physicalSum = measurements.reduce((sum, current) => sum + measurementPhysicalValue(current), 0);
        const physicalResult = node.callee === 'mean' ? physicalSum / measurements.length : physicalSum;
        const value = measurementDisplayValue(physicalResult, first.unit);
        if (!Number.isFinite(physicalSum) || !Number.isFinite(physicalResult) || !Number.isFinite(value)) {
            throwMeasurementDomainError(`${node.callee} result must be finite`, node.source, file);
        }
        return measurement(value, first.unit);
    }
    if (node.callee === 'sum' && Array.isArray(values) && values.length === 0
        && node.arguments[0]?.type === 'identifier') {
        const type = env.bindingTypes.get(node.arguments[0].name);
        if (type?.kind === 'list' && type.element.kind === 'measurement' && env.dimensionRegistry) {
            return measurement(0, canonicalUnit(type.element.vector, env.dimensionRegistry));
        }
    }
    if (isMeasurement(args[0])) {
        const value = args[0];
        if (isMathematicalFunction(node.callee)) {
            if (Object.keys(value.unit.vector).length !== 0) {
                return staticError('AMX3007', `'${node.callee}' requires a Number or dimensionless Measurement`, node.arguments[0]?.source ?? node.source, file);
            }
            return evaluateStandardLibraryCall(node.callee, [measurementPhysicalValue(value)], node.source, file);
        }
        switch (node.callee) {
            case 'abs':
                return measurement(Math.abs(value.value), value.unit);
            case 'round': {
                const digits = args.length > 1 ? toNumber(args[1], node.arguments[1]) : 0;
                const factor = Math.pow(10, Math.trunc(digits));
                const rounded = Math.round(value.value * factor) / factor;
                if (!Number.isFinite(rounded))
                    throwMeasurementDomainError('round result must be finite', node.source, file);
                return measurement(rounded, value.unit);
            }
            case 'sqrt': {
                if (isAffineUnit(value.unit)) {
                    return staticError('AMX3007', 'Affine measurement sqrt is not supported', node.source, file);
                }
                const physical = measurementPhysicalValue(value);
                if (physical < 0)
                    throwMeasurementDomainError('sqrt of a negative measurement value', node.source, file);
                if (!env.dimensionRegistry)
                    throw new Error('Measurement registry is unavailable during sqrt evaluation');
                try {
                    const result = sqrtMeasurement(value, env.dimensionRegistry);
                    if (!Number.isFinite(result.value) || !Number.isFinite(result.unit.scale)) {
                        throwMeasurementDomainError('sqrt result must be finite', node.source, file);
                    }
                    if (Object.keys(result.unit.vector).length === 0)
                        return measurementPhysicalValue(result);
                    return result;
                }
                catch (error) {
                    if (error instanceof Error && error.message.startsWith('sqrt requires')) {
                        return staticError('AMX3007', error.message, node.source, file);
                    }
                    throw error;
                }
            }
            case 'pow': {
                if (isAffineUnit(value.unit)) {
                    return staticError('AMX3007', 'Affine measurement powers are not supported', node.source, file);
                }
                const exponent = toNumber(args[1], node.arguments[1]);
                if (!Number.isSafeInteger(exponent))
                    return staticError('AMX3007', 'A dimensional pow exponent must be an integer literal', node.arguments[1]?.source, file);
                if (value.value === 0 && exponent < 0)
                    throwMeasurementDomainError('Zero measurement cannot be raised to a negative power', node.source, file);
                const unit = powerUnit(value.unit, exponent);
                const result = Math.pow(value.value, exponent);
                if (!Number.isFinite(result) || !Number.isFinite(unit.scale))
                    throwMeasurementDomainError('pow result must be finite', node.source, file);
                const powered = measurement(result, unit);
                if (!Object.keys(unit.vector).length)
                    return measurementPhysicalValue(powered);
                return powered;
            }
        }
    }
    return evaluateStandardLibraryCall(node.callee, args, node.source, file, node.arguments.map(argument => functionArgumentSource(argument, node.source)));
}
function toNumber(v, nodeForError) {
    if (typeof v === 'number')
        return v;
    if (typeof v === 'boolean')
        return v ? 1 : 0;
    if (typeof v === 'string') {
        const n = Number(v);
        if (!Number.isNaN(n))
            return n;
    }
    const loc = nodeForError?.source;
    const locInfo = loc ? ` at line ${loc.line}` : '';
    throw new Error(`Cannot convert value to number${locInfo}`);
}
export function toBoolean(v) {
    if (typeof v === 'boolean')
        return v;
    if (typeof v === 'number')
        return v !== 0;
    if (typeof v === 'string')
        return v.length > 0;
    // Treat non-empty arrays/objects as truthy for list/aggregate contexts
    if (Array.isArray(v))
        return v.length > 0;
    if (v && typeof v === 'object')
        return true;
    return false;
}
export function evaluateStatements(statements, env, file) {
    const priorStatementIndex = env.currentStatementIndex;
    try {
        for (let statementIndex = 0; statementIndex < statements.length; statementIndex++) {
            env.currentStatementIndex = statementIndex;
            evaluateStatement(statements[statementIndex], env, file);
        }
    }
    finally {
        env.currentStatementIndex = priorStatementIndex;
    }
}
function snapshotValue(value) {
    if (isMeasurement(value))
        return `${value.value} ${value.unit.text}`;
    if (Array.isArray(value))
        return Object.freeze(value.map(snapshotValue));
    if (value && typeof value === 'object') {
        const copy = {};
        for (const [key, item] of Object.entries(value))
            copy[key] = snapshotValue(item);
        return Object.freeze(copy);
    }
    return value;
}
function snapshotView(name, env, file, source) {
    const declaration = env.viewDefinitions.get(name);
    if (!declaration)
        return staticError('AMX3001', `Unknown visualization '${name}'`, source, file);
    const value = env.get(declaration.binding, declaration.bindingSource, file);
    if (!Array.isArray(value)) {
        const diagnostic = inputError('AMX4003', `Visualization '${name}' requires a list value`, {
            file, line: declaration.bindingSource?.line, column: declaration.bindingSource?.column,
            dataPath: `visualization ${name}`, expected: 'list', actual: Array.isArray(value) ? 'list' : typeof value
        });
        throwInputErrors([diagnostic]);
    }
    let labels;
    let headings;
    let measurementDescriptors;
    let showTable = false;
    let viewData;
    if (declaration.type === 'chartDeclaration') {
        const showTableOption = declaration.options.find(option => option.type === 'chartShowTableOption');
        if (showTableOption?.type === 'chartShowTableOption') {
            const resolved = evaluateExpression(showTableOption.expression, env, file);
            if (typeof resolved !== 'boolean') {
                staticError('AMX3002', `Expected Boolean, got ${typeof resolved}`, showTableOption.expression.source, file);
            }
            showTable = resolved;
        }
        const labelsOption = declaration.options.find(option => option.type === 'chartFieldOption' && option.role === 'labels');
        if (labelsOption?.type === 'chartFieldOption') {
            const labelValues = env.get(labelsOption.field, labelsOption.fieldSource, file);
            if (!Array.isArray(labelValues) || !labelValues.every(label => typeof label === 'string')) {
                const diagnostic = inputError('AMX4003', `Chart '${name}' labels must be a String[] value`, {
                    file, line: labelsOption.source?.line, column: labelsOption.source?.column,
                    dataPath: `visualization ${name}.labels`, expected: 'String[]', actual: Array.isArray(labelValues) ? 'invalid list value' : typeof labelValues
                });
                throwInputErrors([diagnostic]);
            }
            if (labelValues.length !== value.length) {
                const diagnostic = inputError('AMX4003', `Chart '${name}' has ${value.length} values but ${labelValues.length} labels`, {
                    file, line: labelsOption.source?.line, column: labelsOption.source?.column,
                    dataPath: `visualization ${name}.labels`, expected: `${value.length} labels`, actual: `${labelValues.length} labels`
                });
                throwInputErrors([diagnostic]);
            }
            labels = snapshotValue(labelValues);
        }
        const normalized = normalizeChartMeasurements(value, declaration, name, file);
        viewData = normalized.data;
        headings = normalized.headings;
        measurementDescriptors = normalized.measurementDescriptors;
    }
    else {
        viewData = snapshotValue(value);
    }
    const emission = {
        name, data: viewData,
        documentNodeIndex: env.currentDocumentNodeIndex, statementIndex: env.currentStatementIndex, source
    };
    return declaration.type === 'tableDeclaration'
        ? Object.freeze({ kind: 'table', ...emission, declaration })
        : Object.freeze({
            kind: 'chart', ...emission, declaration, showTable,
            ...(labels ? { labels } : {}), ...(headings ? { headings } : {}),
            ...(measurementDescriptors?.length ? { measurementDescriptors } : {})
        });
}
function normalizeChartMeasurements(data, declaration, name, file) {
    const scatter = declaration.kind === 'scatter';
    const selectedColumns = scatter
        ? declaration.options
            .filter((option) => option.type === 'chartFieldOption' && (option.role === 'x' || option.role === 'y'))
            .map(option => ({ role: option.role, field: option.field, label: option.role, source: option.source }))
        : declaration.options
            .filter((option) => option.type === 'chartSeriesOption')
            .map(option => ({ role: 'series', field: option.field, label: option.label, source: option.source }));
    const chosenUnits = selectedColumns.map(column => {
        const field = column.field;
        const values = data.map(item => item !== null && typeof item === 'object' && !Array.isArray(item) && !isMeasurement(item)
            ? item[field ?? '']
            : field === undefined ? item : undefined);
        const first = values.find(value => value !== null && value !== undefined);
        const measurementFirst = isMeasurement(first) ? first : undefined;
        for (const value of values) {
            if (value === null || value === undefined)
                continue;
            if (measurementFirst) {
                if (!isMeasurement(value) || !sameMeasurementUnits(value, measurementFirst)) {
                    staticError('AMX3007', `Chart '${name}' contains incompatible measurement dimensions`, column.source, file, declaration.source);
                }
            }
            else if (isMeasurement(value)) {
                staticError('AMX3007', `Chart '${name}' mixes measurements with non-measurement values`, column.source, file, declaration.source);
            }
        }
        return measurementFirst;
    });
    const headings = scatter
        ? ['x', 'y'].map((axis, index) => chosenUnits[index] ? `${axis} (${chosenUnits[index].unit.text})` : axis).concat('group')
        : ['label', ...selectedColumns.flatMap((column, index) => column.role === 'series'
                ? [chosenUnits[index] ? `${column.label} (${chosenUnits[index].unit.text})` : column.label]
                : [])];
    const measurementDescriptors = selectedColumns.flatMap((column, index) => {
        const unit = chosenUnits[index]?.unit;
        if (!unit)
            return [];
        return [Object.freeze({
                role: column.role,
                ...(column.field === undefined ? {} : { field: column.field }),
                label: column.label,
                unit: Object.freeze({
                    text: unit.text,
                    scale: unit.scale,
                    vector: Object.freeze({ ...unit.vector }),
                    factors: Object.freeze(unit.factors.map(factor => Object.freeze({ ...factor })))
                })
            })];
    });
    const normalizedData = data.map((item) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item) && !isMeasurement(item)) {
            const values = {};
            for (const [field, value] of Object.entries(item)) {
                const columnIndex = selectedColumns.findIndex(column => column.field === field);
                values[field] = columnIndex < 0
                    ? snapshotValue(value)
                    : normalizeChartValue(value, chosenUnits[columnIndex], name, selectedColumns[columnIndex]?.source, declaration, file);
            }
            return Object.freeze(values);
        }
        return normalizeChartValue(item, chosenUnits[0], name, selectedColumns[0]?.source, declaration, file);
    });
    return {
        data: Object.freeze(normalizedData),
        headings: Object.freeze(headings),
        measurementDescriptors: Object.freeze(measurementDescriptors)
    };
}
function normalizeChartValue(value, target, name, source, declaration, file) {
    if (value === null || value === undefined)
        return null;
    if (!target)
        return snapshotValue(value);
    if (!isMeasurement(value) || !sameMeasurementUnits(value, target)) {
        staticError('AMX3007', `Chart '${name}' contains an incompatible measurement value`, source, file, declaration.source);
    }
    const converted = measurementDisplayValue(measurementPhysicalValue(value), target.unit);
    if (!Number.isFinite(converted)) {
        staticError('AMX3007', `Chart '${name}' measurement cannot be normalized to its first display unit`, source, file, declaration.source);
    }
    return converted;
}
function sameMeasurementUnits(left, right) {
    const leftEntries = Object.entries(left.unit.vector);
    return leftEntries.length === Object.keys(right.unit.vector).length
        && leftEntries.every(([identity, exponent]) => right.unit.vector[identity] === exponent);
}
function evaluateStatement(statement, env, file) {
    switch (statement.type) {
        case 'importDeclaration':
        case 'exportNamesDeclaration':
            // Import materialization is the module loader's responsibility; imported
            // names are already present in the environment before statements run.
            return;
        case 'dimensionDeclaration':
        case 'unitDeclaration':
            return;
        case 'inputDeclaration':
            // Input values are validated and seeded by the module loader before evaluation.
            return;
        case 'tableDeclaration':
        case 'chartDeclaration':
            env.viewDefinitions.set(statement.name, statement);
            return;
        case 'diagramDeclaration':
            env.diagramEmissions.push({
                model: createDiagramModel(statement, env, file, env.currentDocumentNodeIndex, env.currentStatementIndex)
            });
            return;
        case 'showStatement':
            env.viewEmissions.push(snapshotView(statement.name, env, file, statement.source));
            return;
        case 'typeDeclaration':
            env.recordTypes.set(statement.name, statement);
            return;
        case 'enumDeclaration': {
            const values = statement.resolvedValues ?? statement.members.map((member, index) => {
                if (!member.value)
                    return index + 1;
                if (member.value.type === 'numberLiteral' || member.value.type === 'stringLiteral')
                    return member.value.value;
                return staticError('AMX3020', 'Only constant values can be assigned to enum members', member.valueSource ?? member.value.source, file);
            });
            const enumeration = {};
            statement.members.forEach((member, index) => { enumeration[member.name] = values[index]; });
            env.enumDeclarations.set(statement.name, statement);
            env.enumValues.set(statement.name, enumeration);
            return;
        }
        case 'functionDeclaration':
            env.functions.set(statement.name, statement);
            return;
        case 'variableDeclaration':
            {
                rememberScopedBinding(statement.name, env);
                const value = evaluateExpression(statement.expression, env, file);
                const type = env.bindingTypes.get(statement.name);
                if (type)
                    validateRuntimeValue(value, type, env, statement.source, file, statement.name);
                env.set(statement.name, value);
            }
            return;
        case 'assignmentStatement': {
            const value = evaluateExpression(statement.expression, env, file);
            const type = env.bindingTypes.get(statement.name);
            if (type)
                validateRuntimeValue(value, type, env, statement.source, file, statement.name);
            env.update(statement.name, value, statement.source, file);
            return;
        }
        case 'compoundAssignmentStatement': {
            const value = evaluateExpression({
                type: 'binaryExpression',
                operator: '+',
                left: { type: 'identifier', name: statement.name, source: statement.source },
                right: statement.expression,
                source: statement.source
            }, env, file);
            const type = env.bindingTypes.get(statement.name);
            if (type)
                validateRuntimeValue(value, type, env, statement.source, file, statement.name);
            env.update(statement.name, value, statement.source, file);
            return;
        }
        case 'addStatement':
            evaluateAddStatement(statement, env, file);
            return;
        case 'removeStatement':
            evaluateRemoveStatement(statement, env, file);
            return;
        case 'forStatement':
            evalForStatement(statement, env, file);
            return;
        case 'bracedIfStatement':
            evalBracedIfStatement(statement, env, file);
            return;
        case 'returnStatement':
            if (conditionalReturnDepth.has(env)) {
                throw new ConditionalValueReturn(evaluateExpression(statement.expression, env, file));
            }
            if (forExpressionDepth.has(env)) {
                throw new ForExpressionReturn(evaluateExpression(statement.expression, env, file));
            }
            if (functionReturnDepth.has(env)) {
                throw new FunctionBodyReturn(evaluateExpression(statement.expression, env, file));
            }
            throwInvalidReturnContext(statement.source, file);
    }
}
function evalBracedIfStatement(node, env, file) {
    const branch = toBoolean(evaluateExpression(node.test, env, file)) ? node.consequent : node.alternate;
    if (branch)
        evaluateScopedStatements(branch, env, file);
}
function mutationTarget(name, env, source, file) {
    const target = env.get(name, source, file);
    if (!Array.isArray(target))
        throwListOperationError(`Mutation target '${name}' is not a list`, source, file);
    if (env.isImmutable(target))
        throwListOperationError(`Cannot mutate immutable imported list '${name}'`, source, file);
    return target;
}
function mutationElementType(name, env) {
    const type = env.bindingTypes.get(name);
    return type?.kind === 'list' ? type.element : undefined;
}
function checkedPositiveInteger(value, description, source, file) {
    if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
        throwListOperationError(`${description} must be a positive integer; got ${runtimeDescription(value)}`, source, file);
    }
    return value;
}
function evaluateAddStatement(node, env, file) {
    const target = mutationTarget(node.name, env, node.source, file);
    const value = evaluateExpression(node.value, env, file);
    const elementType = mutationElementType(node.name, env);
    if (elementType)
        validateRuntimeValue(value, elementType, env, node.value.source ?? node.source, file, `${node.name} element`);
    const position = node.index
        ? checkedPositiveInteger(evaluateExpression(node.index, env, file), 'Insertion position', node.index.source ?? node.source, file)
        : target.length + 1;
    if (position > target.length + 1) {
        throwListOperationError(`Insertion position ${position} is out of bounds for length ${target.length}; expected 1..${target.length + 1}`, node.index?.source ?? node.source, file);
    }
    target.splice(position - 1, 0, value);
}
function evaluateRemoveStatement(node, env, file) {
    const target = mutationTarget(node.name, env, node.source, file);
    const count = checkedPositiveInteger(evaluateExpression(node.count, env, file), 'Removal count', node.count.source ?? node.source, file);
    if (target.length === 0)
        throwListOperationError('Cannot remove from an empty list', node.source, file);
    if (!node.index) {
        target.pop();
        return;
    }
    const position = checkedPositiveInteger(evaluateExpression(node.index, env, file), 'Removal position', node.index.source ?? node.source, file);
    if (position > target.length) {
        throwListOperationError(`Removal position ${position} is out of bounds for length ${target.length}; expected 1..${target.length}`, node.index.source ?? node.source, file);
    }
    if (count > target.length - position + 1) {
        throwListOperationError(`Removal interval ${position}..${position + count - 1} exceeds list length ${target.length}`, node.count.source ?? node.source, file);
    }
    target.splice(position - 1, count);
}
function evalRange(node, env, file) {
    const start = evaluateExpression(node.start, env, file);
    const end = evaluateExpression(node.end, env, file);
    if (typeof start !== 'number' || !Number.isFinite(start) || !Number.isInteger(start)
        || typeof end !== 'number' || !Number.isFinite(end) || !Number.isInteger(end)) {
        throwInvalidRangeBounds(node.source, file);
    }
    const values = [];
    const step = start <= end ? 1 : -1;
    for (let value = start; step > 0 ? value <= end : value >= end; value += step) {
        values.push(value);
        if (value + step === value && value !== end)
            throwInvalidRangeBounds(node.source, file);
    }
    return values;
}
function evalForStatement(node, env, file) {
    const values = evaluateLoopIterable(node.iterable, env, file);
    withLoopBinding(node.variable, values, env, () => {
        if (functionReturnDepth.has(env))
            evaluateScopedStatements(node.body, env, file);
        else
            evaluateStatements(node.body, env, file);
    });
}
function evalForExpression(node, env, file) {
    const values = evaluateLoopIterable(node.iterable, env, file);
    const results = [];
    withDepth(forExpressionDepth, env, () => withLoopBinding(node.variable, values, env, () => {
        for (const statement of node.body) {
            if (statement.type === 'returnStatement') {
                results.push(evaluateExpression(statement.expression, env, file));
            }
            else {
                try {
                    evaluateStatement(statement, env, file);
                }
                catch (error) {
                    if (error instanceof ForExpressionReturn)
                        results.push(error.value);
                    else
                        throw error;
                }
            }
        }
    }));
    return results;
}
export function evaluateLoopIterable(node, env, file) {
    const value = evaluateExpression(node, env, file);
    if (!Array.isArray(value))
        throwInvalidLoopIterable(node.source, file);
    return value.slice();
}
export function withLoopBinding(name, values, env, runIteration) {
    const existed = env.has(name);
    const previous = existed ? env.get(name) : undefined;
    try {
        for (const value of values) {
            env.set(name, value);
            runIteration();
        }
    }
    finally {
        if (existed)
            env.set(name, previous);
        else
            env.delete(name);
    }
}
//# sourceMappingURL=evaluateExpression.js.map