import { SourceLocation } from '../ast/types';
import { AmxError } from '../diagnostics/errors';

/**
 * Standard library for OpenAMX v0.1.
 *
 * Functions:
 *   sum(values)   - numeric sum of list elements
 *   min(values)   - minimum numeric value in list
 *   max(values)   - maximum numeric value in list
 *   mean(values)  - arithmetic mean of list elements
 *   round(value, digits?) - round to optional decimal places
 *   abs(value)    - absolute value
 *   sqrt(value)   - square root
 *   pow(value, exponent) - power
 *
 * Errors are surfaced via AmxError with clear messages (no new AMX codes beyond 1004 unless needed).
 */

function ensureList(arg: unknown, callee: string, source?: SourceLocation, file?: string): unknown[] {
  if (!Array.isArray(arg)) {
    const loc = source ? ` at line ${source.line}` : '';
    throw new AmxError({
      code: 'AMX2001',
      message: `${callee} expects a list${loc}`,
      file,
      line: source?.line,
      column: source?.column
    });
  }
  return arg;
}

function ensureNumber(v: unknown, context: string, source?: SourceLocation, file?: string): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  const loc = source ? ` at line ${source.line}` : '';
  throw new AmxError({
    code: 'AMX2002',
    message: `${context} requires a numeric value${loc}`,
    file,
    line: source?.line,
    column: source?.column
  });
}

function ensureArgCount(args: unknown[], expected: number, callee: string, source?: SourceLocation, file?: string): void {
  if (args.length !== expected) {
    const loc = source ? ` at line ${source.line}` : '';
    throw new AmxError({
      code: 'AMX2003',
      message: `${callee} expects ${expected} argument(s), got ${args.length}${loc}`,
      file,
      line: source?.line,
      column: source?.column
    });
  }
}

function ensureMinArgCount(args: unknown[], min: number, callee: string, source?: SourceLocation, file?: string): void {
  if (args.length < min) {
    const loc = source ? ` at line ${source.line}` : '';
    throw new AmxError({
      code: 'AMX2003',
      message: `${callee} expects at least ${min} argument(s), got ${args.length}${loc}`,
      file,
      line: source?.line,
      column: source?.column
    });
  }
}

export function evaluateStandardLibraryCall(
  callee: string,
  args: unknown[],
  source?: SourceLocation,
  file?: string
): unknown {
  switch (callee) {
    case 'sum': {
      ensureArgCount(args, 1, 'sum', source, file);
      const list = ensureList(args[0], 'sum', source, file);
      return list.reduce((acc: number, v) => acc + ensureNumber(v, 'sum element', source, file), 0);
    }

    case 'min': {
      ensureArgCount(args, 1, 'min', source, file);
      const list = ensureList(args[0], 'min', source, file);
      if (list.length === 0) {
        const loc = source ? ` at line ${source.line}` : '';
        throw new AmxError({ code: 'AMX2004', message: `min of empty list${loc}`, file, line: source?.line, column: source?.column });
      }
      return list.reduce((acc: number, v) => Math.min(acc, ensureNumber(v, 'min element', source, file)), Number.POSITIVE_INFINITY);
    }

    case 'max': {
      ensureArgCount(args, 1, 'max', source, file);
      const list = ensureList(args[0], 'max', source, file);
      if (list.length === 0) {
        const loc = source ? ` at line ${source.line}` : '';
        throw new AmxError({ code: 'AMX2004', message: `max of empty list${loc}`, file, line: source?.line, column: source?.column });
      }
      return list.reduce((acc: number, v) => Math.max(acc, ensureNumber(v, 'max element', source, file)), Number.NEGATIVE_INFINITY);
    }

    case 'mean': {
      ensureArgCount(args, 1, 'mean', source, file);
      const list = ensureList(args[0], 'mean', source, file);
      if (list.length === 0) {
        const loc = source ? ` at line ${source.line}` : '';
        throw new AmxError({ code: 'AMX2004', message: `mean of empty list${loc}`, file, line: source?.line, column: source?.column });
      }
      const sum = list.reduce((acc: number, v) => acc + ensureNumber(v, 'mean element', source, file), 0);
      return sum / list.length;
    }

    case 'round': {
      ensureMinArgCount(args, 1, 'round', source, file);
      const value = ensureNumber(args[0], 'round value', source, file);
      const digits = args.length > 1 ? ensureNumber(args[1], 'round digits', source, file) : 0;
      const factor = Math.pow(10, Math.trunc(digits));
      return Math.round(value * factor) / factor;
    }

    case 'abs': {
      ensureArgCount(args, 1, 'abs', source, file);
      const value = ensureNumber(args[0], 'abs value', source, file);
      return Math.abs(value);
    }

    case 'sqrt': {
      ensureArgCount(args, 1, 'sqrt', source, file);
      const value = ensureNumber(args[0], 'sqrt value', source, file);
      if (value < 0) {
        const loc = source ? ` at line ${source.line}` : '';
        throw new AmxError({ code: 'AMX2005', message: `sqrt of negative value${loc}`, file, line: source?.line, column: source?.column });
      }
      return Math.sqrt(value);
    }

    case 'pow': {
      ensureArgCount(args, 2, 'pow', source, file);
      const value = ensureNumber(args[0], 'pow base', source, file);
      const exponent = ensureNumber(args[1], 'pow exponent', source, file);
      return Math.pow(value, exponent);
    }

    default:
      const loc = source ? ` at line ${source.line}` : '';
      throw new AmxError({
        code: 'AMX2000',
        message: `Unknown function '${callee}'${loc}`,
        file,
        line: source?.line,
        column: source?.column
      });
  }
}

