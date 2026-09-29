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
export class AmxError extends Error implements AmxDiagnostic {
  code: string;
  file?: string;
  line?: number;
  column?: number;
  diagnostics?: AmxDiagnostic[];

  constructor(diag: AmxDiagnostic, diagnostics?: AmxDiagnostic[]) {
    super(diag.message);
    this.name = 'AmxError';
    this.code = diag.code;
    this.file = diag.file;
    this.line = diag.line;
    this.column = diag.column;
    this.diagnostics = diagnostics;
  }
}

export function inputError(
  code: 'AMX4001' | 'AMX4002' | 'AMX4003',
  message: string,
  context: Omit<AmxDiagnostic, 'code' | 'message'> = {}
): AmxDiagnostic {
  return { code, message, ...context };
}

export function throwInputErrors(diagnostics: AmxDiagnostic[]): never {
  const first = diagnostics[0] ?? inputError('AMX4001', 'Input validation failed');
  throw new AmxError(first, diagnostics);
}

export function staticError(code: 'AMX3001' | 'AMX3002' | 'AMX3003' | 'AMX3004' | 'AMX3005', message: string, source?: SourceLocation, file?: string): never {
  throw new AmxError({ code, message, file, line: source?.line, column: source?.column });
}

export function moduleError(code: 'AMX5001' | 'AMX5002' | 'AMX5003', message: string, source?: SourceLocation, file?: string): never {
  throw new AmxError({ code, message, file, line: source?.line, column: source?.column });
}

export function outputError(code: 'AMX6001' | 'AMX6002', message: string): never {
  throw new AmxError({ code, message });
}

/**
 * Create an AMX1004 undefined identifier diagnostic.
 */
export function createUndefinedIdentifierDiagnostic(
  name: string,
  source?: SourceLocation,
  file?: string
): AmxDiagnostic {
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
export function throwUndefinedIdentifier(
  name: string,
  source?: SourceLocation,
  file?: string
): never {
  const diag = createUndefinedIdentifierDiagnostic(name, source, file);
  throw new AmxError(diag);
}

export function throwInvalidRangeBounds(source?: SourceLocation, file?: string): never {
  throw new AmxError({
    code: 'AMX1005',
    message: 'Range bounds must be finite integers',
    file,
    line: source?.line,
    column: source?.column
  });
}

export function throwInvalidLoopIterable(source?: SourceLocation, file?: string): never {
  throw new AmxError({
    code: 'AMX1006',
    message: 'For loops require a list or range value',
    file,
    line: source?.line,
    column: source?.column
  });
}

export function throwInvalidReturnContext(source?: SourceLocation, file?: string): never {
  throw new AmxError({
    code: 'AMX1007',
    message: 'Return is only valid inside an expression-form for loop',
    file,
    line: source?.line,
    column: source?.column
  });
}
