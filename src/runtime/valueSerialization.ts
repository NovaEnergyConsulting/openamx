import { isMeasurement } from './measurement';

export function formatAmxValue(value: unknown, nullText = ''): string {
  if (value === null || value === undefined) return nullText;
  if (Array.isArray(value)) return value.map(item => formatAmxValue(item, nullText)).join(', ');
  if (isMeasurement(value)) return `${String(value.value)} ${value.unit.text}`;
  if (typeof value === 'object') return JSON.stringify(value, null, 2) ?? '';
  return String(value);
}
