import { SourceLocation } from '../ast/types';
import { AmxError } from '../diagnostics/errors';
import { isMeasurement } from './measurement';

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

type MathFunction = {
  evaluate: (value: number) => number;
  accepts: (value: number) => boolean;
};

const mathFunctions: Record<string, MathFunction> = {
  sin: { evaluate: Math.sin, accepts: Number.isFinite },
  cos: { evaluate: Math.cos, accepts: Number.isFinite },
  tan: { evaluate: Math.tan, accepts: Number.isFinite },
  asin: { evaluate: Math.asin, accepts: value => Number.isFinite(value) && value >= -1 && value <= 1 },
  acos: { evaluate: Math.acos, accepts: value => Number.isFinite(value) && value >= -1 && value <= 1 },
  atan: { evaluate: Math.atan, accepts: Number.isFinite },
  sinh: { evaluate: Math.sinh, accepts: Number.isFinite },
  cosh: { evaluate: Math.cosh, accepts: Number.isFinite },
  tanh: { evaluate: Math.tanh, accepts: Number.isFinite },
  asinh: { evaluate: Math.asinh, accepts: Number.isFinite },
  acosh: { evaluate: Math.acosh, accepts: value => Number.isFinite(value) && value >= 1 },
  atanh: { evaluate: Math.atanh, accepts: value => Number.isFinite(value) && value > -1 && value < 1 },
  ln: { evaluate: Math.log, accepts: value => Number.isFinite(value) && value > 0 },
  log: { evaluate: Math.log10, accepts: value => Number.isFinite(value) && value > 0 },
  exp: { evaluate: Math.exp, accepts: Number.isFinite }
};

export function isMathematicalFunction(name: string): boolean {
  return Object.hasOwn(mathFunctions, name);
}

function mathError(
  code: 'AMXSL001' | 'AMXSL002',
  message: string,
  source?: SourceLocation,
  file?: string
): AmxError {
  return new AmxError({ code, message, file, line: source?.line, column: source?.column });
}

function libraryError(
  code: string,
  message: string,
  source?: SourceLocation,
  file?: string
): AmxError {
  return new AmxError({ code, message, file, line: source?.line, column: source?.column });
}

function runtimeType(value: unknown): string {
  if (value === null) return 'null';
  if (isMeasurement(value)) return 'Measurement';
  if (Array.isArray(value)) return 'list';
  if (typeof value === 'number') return 'Number';
  if (typeof value === 'string') return 'String';
  if (typeof value === 'boolean') return 'Boolean';
  return typeof value;
}

function ensureLibraryArity(
  callee: string,
  args: unknown[],
  min: number,
  max: number,
  source?: SourceLocation,
  file?: string
): void {
  if (args.length < min || args.length > max) {
    throw libraryError('AMX3004', `Invalid arity for '${callee}'`, source, file);
  }
}

function textArgument(
  callee: string,
  value: unknown,
  source?: SourceLocation,
  file?: string
): string {
  if (typeof value !== 'string') {
    throw libraryError('AMX3002', `${callee} requires a String, got ${runtimeType(value)}`, source, file);
  }
  return value;
}

function isUnicodeWhiteSpace(codePoint: number): boolean {
  return codePoint >= 0x0009 && codePoint <= 0x000d
    || codePoint === 0x0020
    || codePoint === 0x0085
    || codePoint === 0x00a0
    || codePoint === 0x1680
    || codePoint >= 0x2000 && codePoint <= 0x200a
    || codePoint === 0x2028
    || codePoint === 0x2029
    || codePoint === 0x202f
    || codePoint === 0x205f
    || codePoint === 0x3000;
}

function trimText(value: string): string {
  const points = Array.from(value);
  let start = 0;
  let end = points.length;
  while (start < end && isUnicodeWhiteSpace(points[start].codePointAt(0)!)) start++;
  while (end > start && isUnicodeWhiteSpace(points[end - 1].codePointAt(0)!)) end--;
  return points.slice(start, end).join('');
}

interface NumericPattern {
  currency: string;
  grouped: boolean;
  precision: number;
  percent: boolean;
}

function parseNumericPattern(pattern: unknown, source?: SourceLocation, file?: string): NumericPattern {
  if (typeof pattern !== 'string') {
    throw libraryError('AMXSL004', 'Incorrect formatting pattern', source, file);
  }
  const match = /^([$€£])?(#,##0|0)(?:\.(0{1,6}))?(%)?$/.exec(pattern);
  if (!match) throw libraryError('AMXSL004', 'Incorrect formatting pattern', source, file);
  return {
    currency: match[1] ?? '',
    grouped: match[2] === '#,##0',
    precision: match[3]?.length ?? 0,
    percent: match[4] === '%'
  };
}

interface NumericLocale {
  decimal: string;
  group: string;
}

function parseNumericLocale(locale: unknown, source?: SourceLocation, file?: string): NumericLocale {
  switch (locale) {
    case 'en-US': return { decimal: '.', group: ',' };
    case 'de-DE': return { decimal: ',', group: '.' };
    case 'fr-FR': return { decimal: ',', group: '\u202f' };
    default: throw libraryError('AMXSL005', 'Formatting locale is malformed or unsupported', source, file);
  }
}

function roundedScaledInteger(value: number, precision: number): bigint {
  const [mantissa, exponentText] = Math.abs(value).toString().toLowerCase().split('e');
  const exponent = exponentText === undefined ? 0 : Number(exponentText);
  const [integerPart, fractionalPart = ''] = mantissa.split('.');
  const digits = `${integerPart}${fractionalPart}`.replace(/^0+(?=\d)/, '');
  const coefficient = BigInt(digits || '0');
  const shift = precision + exponent - fractionalPart.length;
  if (shift >= 0) return coefficient * 10n ** BigInt(shift);
  const divisor = 10n ** BigInt(-shift);
  const quotient = coefficient / divisor;
  const remainder = coefficient % divisor;
  return quotient + (remainder * 2n >= divisor ? 1n : 0n);
}

function groupInteger(value: string, separator: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function formatNumericValue(
  value: number,
  pattern: NumericPattern,
  locale: NumericLocale
): string {
  const displayedValue = pattern.percent ? value * 100 : value;
  const negative = displayedValue < 0;
  const precisionFactor = 10n ** BigInt(pattern.precision);
  const scaled = roundedScaledInteger(displayedValue, pattern.precision);
  const integer = (scaled / precisionFactor).toString();
  const fraction = pattern.precision
    ? `${locale.decimal}${(scaled % precisionFactor).toString().padStart(pattern.precision, '0')}`
    : '';
  const integerText = pattern.grouped ? groupInteger(integer, locale.group) : integer;
  return `${negative ? '-' : ''}${pattern.currency}${integerText}${fraction}${pattern.percent ? '%' : ''}`;
}

export function evaluateStandardLibraryCall(
  callee: string,
  args: unknown[],
  source?: SourceLocation,
  file?: string,
  argumentSources: (SourceLocation | undefined)[] = []
): unknown {
  const argumentSource = (index: number): SourceLocation | undefined => argumentSources[index] ?? source;

  if (callee === 'len') {
    ensureLibraryArity(callee, args, 1, 1, source, file);
    const value = args[0];
    if (typeof value === 'string') return Array.from(value).length;
    if (Array.isArray(value)) return value.length;
    throw libraryError('AMX3002', `len requires a String or list, got ${runtimeType(value)}`, argumentSource(0), file);
  }

  if (callee === 'trim') {
    ensureLibraryArity(callee, args, 1, 1, source, file);
    return trimText(textArgument(callee, args[0], argumentSource(0), file));
  }

  if (callee === 'left' || callee === 'right') {
    ensureLibraryArity(callee, args, 1, 2, source, file);
    const points = Array.from(textArgument(callee, args[0], argumentSource(0), file));
    const count = args.length === 1 ? 1 : args[1];
    if (typeof count !== 'number' || !Number.isFinite(count) || !Number.isInteger(count) || count < 0) {
      throw libraryError('AMXSL003', 'Invalid text slice count', argumentSource(1), file);
    }
    const length = Math.min(count, points.length);
    return callee === 'left'
      ? points.slice(0, length).join('')
      : points.slice(points.length - length).join('');
  }

  if (callee === 'format') {
    ensureLibraryArity(callee, args, 2, 3, source, file);
    const value = args[0];
    const valueSource = argumentSource(0);
    if (typeof value !== 'number' && !isMeasurement(value)) {
      throw libraryError(
        'AMX3002',
        `format expects a Number or Measurement, got ${runtimeType(value)}`,
        valueSource,
        file
      );
    }
    const displayedValue = isMeasurement(value) ? value.value : value;
    if (!Number.isFinite(displayedValue)) {
      throw libraryError('AMXSL006', 'Input is non-finite', valueSource, file);
    }
    const pattern = parseNumericPattern(args[1], argumentSource(1), file);
    const locale = parseNumericLocale(args.length === 3 ? args[2] : 'en-US', argumentSource(2), file);
    if (pattern.percent && !Number.isFinite(displayedValue * 100)) {
      throw libraryError('AMXSL006', 'Input is non-finite', valueSource, file);
    }
    const formatted = formatNumericValue(displayedValue, pattern, locale);
    return isMeasurement(value) ? `${formatted} ${value.unit.text}` : formatted;
  }

  const mathFunction = mathFunctions[callee];
  if (mathFunction) {
    if (args.length !== 1) {
      throw new AmxError({
        code: 'AMX3004',
        message: `Invalid arity for '${callee}'`,
        file,
        line: source?.line,
        column: source?.column
      });
    }
    const value = args[0];
    if (typeof value !== 'number') {
      const actual = value === null ? 'null'
        : Array.isArray(value) ? 'list'
          : typeof value === 'object' ? 'Measurement'
            : typeof value === 'string' ? 'String'
              : typeof value === 'boolean' ? 'Boolean' : typeof value;
      throw new AmxError({
        code: 'AMX3002',
        message: `Expected Number or dimensionless Measurement, got ${actual}`,
        file,
        line: source?.line,
        column: source?.column
      });
    }
    if (!mathFunction.accepts(value)) {
      throw mathError('AMXSL001', 'Invalid input for mathematical function', source, file);
    }
    const result = mathFunction.evaluate(value);
    if (!Number.isFinite(result)) {
      throw mathError('AMXSL002', 'Function evaluation results in infinite result', source, file);
    }
    return result;
  }

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
