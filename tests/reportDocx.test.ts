import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import JSZip from 'jszip';
import sharp from 'sharp';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { prepareDocxReport, serializeDocxReport } from '../src/renderer/reportDocx';
import { prepareReport } from '../src/renderer/reportPreparation';

async function packageParts(bytes: Uint8Array): Promise<Map<string, string>> {
  const archive = await JSZip.loadAsync(bytes);
  const parts = new Map<string, string>();
  for (const [name, entry] of Object.entries(archive.files)) {
    if (!entry.dir) parts.set(name, name.endsWith('.xml') || name.endsWith('.rels') ? await entry.async('string') : '');
  }
  return parts;
}

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

describe('report DOCX adapter', () => {
  it('preserves semantic order and editable report content', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    const rowValues = Array.from({ length: 3 }, (_value, index) => `Row { name = "Pump ${index + 1}", score = ${index + 1} }`).join(', ');
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
    const parts = await packageParts(await serializeDocxReport(prepareDocxReport(await prepareReport(loaded.doc, loaded.env, { file: input }))));
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

  it('renders the shared narrative AST as editable Word structures and final-relative links', async () => {
    const root = await mkdtemp(join(tmpdir(), 'openamx-docx-native-'));
    temporaryDirectories.push(root);
    const sourceDirectory = join(root, 'source');
    const outputDirectory = join(root, 'output', 'nested');
    const companionDirectory = join(sourceDirectory, 'companions');
    await Promise.all([
      mkdir(outputDirectory, { recursive: true }),
      mkdir(companionDirectory, { recursive: true })
    ]);
    const input = join(sourceDirectory, 'report.amx');
    const imagePath = join(sourceDirectory, 'tiny.png');
    const destination = join(outputDirectory, 'report.docx');
    await writeFile(join(companionDirectory, 'asset one.txt'), 'companion');
    await writeFile(imagePath, await sharp({
      create: { width: 1200, height: 1800, channels: 3, background: '#386e8a' }
    }).png().toBuffer());
    await writeFile(input, [
      '# Section',
      '',
      'A **bold** and *italic* and ~~deleted~~ paragraph with `inline code`.',
      'A visible line break follows.',
      '[Jump to the duplicate](#section-2), [external](https://example.com/report?q=1), and [local](./companions/asset%20one.txt?download=1#page).',
      '',
      '```amx',
      'let boundary: Number = 1',
      '```',
      '',
      '# Section',
      '',
      '![Tiny chart](./tiny.png)',
      '',
      '## Résumé',
      '',
      '> Outer quote',
      '>',
      '> > Nested quote',
      '',
      '- Parent item',
      '  - Nested item',
      '',
      '1. First ordered item',
      '2. Second ordered item',
      '',
      '| Left | Center | Right |',
      '| :--- | :---: | ---: |',
      '| **Emphasized** | `code` | linked text |',
      '',
      '---',
      '',
      '###### Small heading',
      '',
      '<!-- page-break -->',
      '',
      '```text',
      '\t  keep leading tab and spaces',
      'second line',
      '```'
    ].join('\n'));

    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input });
    await unlink(imagePath);
    const bytes = await serializeDocxReport(prepareDocxReport(prepared, {
      sourceDocumentPath: input,
      destinationPath: destination
    }));
    const parts = await packageParts(bytes);
    const documentXml = parts.get('word/document.xml') ?? '';
    const relsXml = parts.get('word/_rels/document.xml.rels') ?? '';
    const numberingXml = parts.get('word/numbering.xml') ?? '';

    expect(documentXml).toContain('<w:tbl>');
    expect(documentXml).toContain('<w:tblHeader');
    expect(documentXml).toContain('<w:tblW w:type="pct" w:w="10000"/>');
    expect(documentXml).toContain('<w:cantSplit/>');
    expect(documentXml).toContain('w:anchor="amx_section_2"');
    expect(documentXml).toContain('w:name="amx_section"');
    expect(documentXml).toContain('w:name="amx_section_2"');
    expect(documentXml).toContain('w:name="amx_resume"');
    expect(documentXml).toContain('w:val="Heading6"');
    expect(documentXml).toContain('w:numPr');
    expect(documentXml).toContain('w:ilvl w:val="1"');
    expect(documentXml).toContain('<w:pBdr>');
    expect(documentXml).toContain('<w:pageBreakBefore');
    expect(documentXml).toContain('<w:br/>');
    expect(documentXml).toContain('<w:tab/></w:r>');
    expect(documentXml).toContain('w:ascii="Consolas"');
    expect(documentXml).toContain('keep leading tab and spaces');
    expect(documentXml).toContain('<wp:extent cx="5486400" cy="8229600"/>');
    expect(documentXml).toContain('descr="Tiny chart"');
    expect(documentXml).toContain('Outer quote');
    expect(documentXml).toContain('Nested quote');
    expect(documentXml).toContain('Emphasized');
    expect(numberingXml).toContain('w:numFmt w:val="decimal"');
    expect(numberingXml).toContain('w:numFmt w:val="bullet"');
    expect(relsXml).toContain('Target="https://example.com/report?q=1"');
    expect(relsXml).toContain('Target="../../source/companions/asset%20one.txt?download=1#page"');
    expect(relsXml).not.toContain(root);
    expect(relsXml).not.toContain('.tmp');
    expect([...parts.keys()].some(name => name.startsWith('word/media/') && name.endsWith('.png'))).toBe(true);
  });

  it('emits a repeating header for a multi-page native Markdown table', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-multipage-table-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    const rows = Array.from({ length: 100 }, (_value, index) =>
      `| Record ${index + 1} | ${'Narrative content should wrap across the page and remain readable. '.repeat(4)} |`);
    await Bun.write(input, [
      '| Identifier | Description |',
      '| --- | --- |',
      ...rows
    ].join('\n'));
    const loaded = await loadEntryModule(input);
    const report = await prepareReport(loaded.doc, loaded.env, { file: input });
    const parts = await packageParts(await serializeDocxReport(prepareDocxReport(report)));
    const documentXml = parts.get('word/document.xml') ?? '';
    expect(documentXml).toContain('<w:tblHeader');
    expect(documentXml.match(/<w:tr>/g)).toHaveLength(101);
  });
});