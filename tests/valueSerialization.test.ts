import { describe, expect, it } from 'bun:test';
import { formatAmxValue } from '../src/runtime/valueSerialization';

describe('AMX value serialization', () => {
  it('pretty-prints objects recursively', () => {
    expect(formatAmxValue({ name: 'Transformer', details: { voltage: 132 } })).toBe(
      '{\n  "name": "Transformer",\n  "details": {\n    "voltage": 132\n  }\n}'
    );
  });

  it('keeps arrays comma-separated and supports formatted objects inside arrays', () => {
    expect(formatAmxValue([1, 2, 3])).toBe('1, 2, 3');
    expect(formatAmxValue([{ name: 'Transformer' }, 3])).toBe('{\n  "name": "Transformer"\n}, 3');
  });

  it('preserves caller-selected null formatting', () => {
    expect(formatAmxValue(null)).toBe('');
    expect(formatAmxValue(null, '(null)')).toBe('(null)');
  });
});
