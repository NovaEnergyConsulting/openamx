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
}

/**
 * Error subclass carrying AmxDiagnostic information.
 */
export class AmxError extends Error implements AmxDiagnostic {
  code: string;
  file?: string;
  line?: number;
  column?: number;

  constructor(diag: AmxDiagnostic) {
    super(diag.message);
    this.name = 'AmxError';
    this.code = diag.code;
    this.file = diag.file;
    this.line = diag.line;
    this.column = diag.column;
  }
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
