/**
 * Error subclass carrying AmxDiagnostic information.
 */
export class AmxError extends Error {
    code;
    file;
    line;
    column;
    declarationSource;
    fieldSource;
    diagnostics;
    constructor(diag, diagnostics) {
        super(diag.message);
        this.name = 'AmxError';
        this.code = diag.code;
        this.file = diag.file;
        this.line = diag.line;
        this.column = diag.column;
        this.declarationSource = diag.declarationSource;
        this.fieldSource = diag.fieldSource;
        this.diagnostics = diagnostics;
    }
}
export function inputError(code, message, context = {}) {
    return { code, message, ...context };
}
export function throwInputErrors(diagnostics) {
    const first = diagnostics[0] ?? inputError('AMX4001', 'Input validation failed');
    throw new AmxError(first, diagnostics);
}
export function staticError(code, message, source, file, declarationSource) {
    throw new AmxError({ code, message, file, line: source?.line, column: source?.column, declarationSource });
}
export function throwMeasurementDomainError(message, source, file) {
    throw new AmxError({ code: 'AMX1009', message, file, line: source?.line, column: source?.column });
}
export function syntaxError(message, source, file) {
    throw new AmxError({ code: 'AMX3006', message, file, line: source?.line, column: source?.column });
}
export function moduleError(code, message, source, file) {
    throw new AmxError({ code, message, file, line: source?.line, column: source?.column });
}
export function outputError(code, message) {
    throw new AmxError({ code, message });
}
/**
 * Create an AMX1004 undefined identifier diagnostic.
 */
export function createUndefinedIdentifierDiagnostic(name, source, file) {
    return {
        code: 'AMX1004',
        message: `Undefined identifier '${name}'`,
        file,
        line: source?.line,
        column: source?.column
    };
}
/**
 * Throw an AMX1004 error for an undefined identifier.
 */
export function throwUndefinedIdentifier(name, source, file) {
    const diag = createUndefinedIdentifierDiagnostic(name, source, file);
    throw new AmxError(diag);
}
export function throwInvalidRangeBounds(source, file) {
    throw new AmxError({
        code: 'AMX1005',
        message: 'Range bounds must be finite integers',
        file,
        line: source?.line,
        column: source?.column
    });
}
export function throwInvalidLoopIterable(source, file) {
    throw new AmxError({
        code: 'AMX1006',
        message: 'For loops require a list or range value',
        file,
        line: source?.line,
        column: source?.column
    });
}
export function throwInvalidReturnContext(source, file) {
    throw new AmxError({
        code: 'AMX1007',
        message: 'Return is only valid inside an expression-form for loop',
        file,
        line: source?.line,
        column: source?.column
    });
}
export function throwFunctionFallthrough(source, file) {
    throw new AmxError({
        code: 'AMXF4002',
        message: 'Function finished without returning a valid expression',
        file,
        line: source?.line,
        column: source?.column
    });
}
export function throwListOperationError(message, source, file) {
    throw new AmxError({ code: 'AMX1008', message, file, line: source?.line, column: source?.column });
}
//# sourceMappingURL=errors.js.map