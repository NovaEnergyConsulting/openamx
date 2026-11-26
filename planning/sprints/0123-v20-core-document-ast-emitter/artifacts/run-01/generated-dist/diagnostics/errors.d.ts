import { SourceLocation } from '../ast/types';
/**
 * Structured diagnostic for OpenAMX runtime and parse errors (Sprint 003+).
 * Includes AMXxxxx codes and optional source location.
 */
export interface AmxDiagnostic {
    code: string;
    message: string;
    file?: string;
    line?: number;
    column?: number;
    inputName?: string;
    dataFile?: string;
    dataPath?: string;
    expected?: string;
    actual?: string;
    dataLine?: number;
    dataColumn?: number;
    recordNumber?: number;
    declarationSource?: SourceLocation;
    fieldSource?: SourceLocation;
}
/**
 * Error subclass carrying AmxDiagnostic information.
 */
export declare class AmxError extends Error implements AmxDiagnostic {
    code: string;
    file?: string;
    line?: number;
    column?: number;
    declarationSource?: SourceLocation;
    fieldSource?: SourceLocation;
    diagnostics?: AmxDiagnostic[];
    constructor(diag: AmxDiagnostic, diagnostics?: AmxDiagnostic[]);
}
export declare function inputError(code: 'AMX4001' | 'AMX4002' | 'AMX4003' | 'AMX4004' | 'AMX4005', message: string, context?: Omit<AmxDiagnostic, 'code' | 'message'>): AmxDiagnostic;
export declare function throwInputErrors(diagnostics: AmxDiagnostic[]): never;
export declare function staticError(code: 'AMX3001' | 'AMX3002' | 'AMX3003' | 'AMX3004' | 'AMX3005' | 'AMX3007' | 'AMX3008' | 'AMX3009' | 'AMX3010' | 'AMX3011' | 'AMX3012' | 'AMX3013' | 'AMX3014' | 'AMX3015' | 'AMX3016' | 'AMX3017' | 'AMX3018' | 'AMX3019' | 'AMX3020' | 'AMX3021' | 'AMXF4001' | 'AMXD001' | 'AMXD002' | 'AMXD003' | 'AMXD004' | 'AMXD005' | 'AMXD006' | 'AMXD007' | 'AMXD008' | 'AMXD009' | 'AMXD010' | 'AMXD011' | 'AMXD012' | 'AMXD013' | 'AMXD014' | 'AMXD015' | 'AMXD6001' | 'AMXD6004', message: string, source?: SourceLocation, file?: string, declarationSource?: SourceLocation): never;
export declare function throwMeasurementDomainError(message: string, source?: SourceLocation, file?: string): never;
export declare function syntaxError(message: string, source?: SourceLocation, file?: string): never;
export declare function moduleError(code: 'AMX5001' | 'AMX5002' | 'AMX5003', message: string, source?: SourceLocation, file?: string): never;
export declare function outputError(code: 'AMX6001' | 'AMX6002', message: string): never;
/**
 * Create an AMX1004 undefined identifier diagnostic.
 */
export declare function createUndefinedIdentifierDiagnostic(name: string, source?: SourceLocation, file?: string): AmxDiagnostic;
/**
 * Throw an AMX1004 error for an undefined identifier.
 */
export declare function throwUndefinedIdentifier(name: string, source?: SourceLocation, file?: string): never;
export declare function throwInvalidRangeBounds(source?: SourceLocation, file?: string): never;
export declare function throwInvalidLoopIterable(source?: SourceLocation, file?: string): never;
export declare function throwInvalidReturnContext(source?: SourceLocation, file?: string): never;
export declare function throwFunctionFallthrough(source?: SourceLocation, file?: string): never;
export declare function throwListOperationError(message: string, source?: SourceLocation, file?: string): never;
//# sourceMappingURL=errors.d.ts.map