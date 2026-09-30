import { describe, expect, it } from 'bun:test';
import JSZip from 'jszip';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { prepareDocxReport, serializeDocxReport } from '../src/renderer/reportDocx';

async function packageParts(bytes: Uint8Array): Promise<Map<string, string>> {
  const archive = await JSZip.loadAsync(bytes);
  const parts = new Map<string, string>();
  for (const [name, entry] of Object.entries(archive.files)) {
    if (!entry.dir) parts.set(name, name.endsWith('.xml') || name.endsWith('.rels') ? await entry.async('string') : '');
  }
  return parts;
}

describe('report DOCX adapter', () => {
  it('preserves semantic order and editable report content', async () => {
    const input = `/tmp/openamx-docx-${Date.now()}.amx`;
    const rowValues = Array.from({ length: 3 }, (_value, index) => `Row { name: "Pump ${index + 1}", score: ${index + 1} }`).join(', ');
    const source = [
      '# Report', '', 'Narrative before', '', '- First item', '- Second item', '', '```amx',
      'type Row {', '  name: String', '  score: Number', '}',
      `let rows: Row[] = [${rowValues}]`, 'let scores: Number[] = [4, 7]',
      'table register = table(rows) {', '  title: "Risk Register"', '  column name as "Asset"', '  column score as "Score"', '}',
      'chart exposure = bar(scores) {', '  title: "Exposure"', '  description: "Static scores"', '  series "Score"', '}',
      'show register', 'show exposure', '```'
    ].join('\n');
    await Bun.write(input, source);
    const loaded = await loadEntryModule(input);
    const parts = await packageParts(await serializeDocxReport(prepareDocxReport(loaded.doc, loaded.env)));
    const documentXml = parts.get('word/document.xml') ?? '';
    const relsXml = parts.get('word/_rels/document.xml.rels') ?? '';
    expect(documentXml).toContain('w:val="Heading1"');
    expect(documentXml).toContain('Narrative before');
    expect(documentXml).toContain('First item');
    expect(documentXml).toContain('Risk Register');
    expect(documentXml).toContain('Pump 1');
    expect(documentXml).toContain('Pump 3');
    expect(documentXml).toContain('Exposure');
    expect(documentXml.indexOf('Narrative before')).toBeLessThan(documentXml.indexOf('Risk Register'));
    expect(documentXml.indexOf('Risk Register')).toBeLessThan(documentXml.indexOf('Exposure'));
    expect(documentXml).toContain('<w:tbl>');
    expect(relsXml).toContain('image');
    expect([...parts.keys()].some(name => name.startsWith('word/media/') && name.endsWith('.svg'))).toBe(true);
  });
});