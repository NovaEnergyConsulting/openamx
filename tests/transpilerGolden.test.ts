import { describe, expect, it } from 'bun:test';
import { safeNarrativeComments } from '../src/transpiler/source';

describe('transpiler source goldens', () => {
  it('keeps empty lines, comment terminators, and interpolation inert', () => {
    expect(safeNarrativeComments('before\n\n*/ {{ 1 + 1 }}\n'))
      .toEqual([
        '// before',
        '// ',
        '// */ {{ 1 + 1 }}',
        '// '
      ]);
  });
});