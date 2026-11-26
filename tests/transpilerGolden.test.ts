import { describe, expect, it } from 'bun:test';
import { safeNarrativeComments } from '../src/transpiler/source';
import { transpileDocument } from '../src/transpiler';

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

  it('preserves raw frontmatter and narrative across mixed ECMAScript line separators', () => {
    const source = '---\r\ntitle: "Mixed"\r# raw */\nkind: report\u2028---\u2029Before /* */ with {{ 1 + 1 }}\r\n```amx\nexport let value: Number = 1\n```\rAfter */\u2028';
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'mixed.amx', outputPath: 'mixed.ts',
        sourceText: source, resolvedImports: []
      }]
    });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const generated = result.modules[0].code;
    expect(generated).toContain('// # raw */');
    expect(generated).toContain('// kind: report');
    expect(generated).toContain('// Before /* */ with {{ 1 + 1 }}');
    expect(generated).toContain('// After */');
    expect(generated.split('\n').filter(line => line.includes('*/') || line.includes('{{ 1 + 1 }}'))
      .every(line => line.trimStart().startsWith('//'))).toBe(true);
  });

  it('keeps non-AMX fences and prose around AMX blocks inert and source ordered', () => {
    const source = [
      '---', '# frontmatter */', 'title: "Safe"', '---',
      'Before //# and */',
      '```text', '```amx', 'let forged: Number = 99', '```',
      'Middle {{ 2 + 3 }}',
      '```amx', 'export let value: Number = 1', '```',
      'After \\u2028 and */'
    ].join('\r\n').replace('---\r\nBefore', '---\u2028Before').replace('Middle {{ 2 + 3 }}\r\n', 'Middle {{ 2 + 3 }}\r')
      .replace('```\r\nAfter', '```\u2029After');
    const result = transpileDocument({
      entryModuleId: 'entry',
      modules: [{
        moduleId: 'entry', sourcePath: 'fences.amx', outputPath: 'fences.ts',
        sourceText: source, resolvedImports: []
      }]
    });

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    const generated = result.modules[0].code;
    expect(generated).toContain('// # frontmatter */');
    expect(generated).toContain('// Before //# and */');
    expect(generated).toContain('// ```text');
    expect(generated).toContain('// let forged: Number = 99');
    expect(generated).toContain('// Middle {{ 2 + 3 }}');
    expect(generated).toContain('// After \\u2028 and */');
    expect(generated.indexOf('// Before //# and */')).toBeLessThan(generated.indexOf('// let forged: Number = 99'));
    expect(generated.indexOf('// Middle {{ 2 + 3 }}')).toBeLessThan(generated.indexOf('value: number = 1'));
    expect(generated.split('\n').filter(line => line.includes('*/') || line.includes('{{ 2 + 3 }}'))
      .every(line => line.trimStart().startsWith('//'))).toBe(true);
    expect(generated).not.toContain('forged: number');
  });
});