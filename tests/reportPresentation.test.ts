import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import JSZip from 'jszip';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { preparePdfReport, serializePdfReport } from '../src/renderer/reportPdf';
import { prepareDocxReport, serializeDocxReport } from '../src/renderer/reportDocx';
import { prepareReport } from '../src/renderer/reportPreparation';
import { renderPreparedHtml } from '../src/renderer/renderHtml';

const directories: string[] = [];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

async function reportText(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise;
  const text: string[] = [];
  for (let page = 1; page <= pdf.numPages; page++) text.push(...(await (await pdf.getPage(page)).getTextContent()).items.map(item => 'str' in item ? item.str : ''));
  return text.join(' ');
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })));
});

describe('prepared PDF and DOCX presentation', () => {
  it('uses the same safe identity and ordered source decision in both formats', async () => {
    const root = await mkdtemp(join(tmpdir(), 'openamx-report-presentation-'));
    directories.push(root);
    await mkdir(join(root, '.openamx'), { recursive: true });
    await writeFile(join(root, 'logo.png'), png);
    await writeFile(join(root, '.openamx', 'project.json'), JSON.stringify({ version: 1, inputs: {}, report: { organization: 'Project organization', logo: 'logo.png', logoAlt: 'Organization logo', footer: 'Project footer' } }));
    const input = join(root, 'report.amx');
    await writeFile(input, `---
title: Branded report
report:
  author: "A. Analyst"
  status: "Draft"
  sourceVisible: false
---

# Heading

Narrative text

\`\`\`amx
let value = 7
\`\`\``);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input, projectRoot: root });
    const pdf = await serializePdfReport(preparePdfReport(prepared));
    const pdfText = await reportText(pdf);
    expect(pdfText).toContain('Project organization');
    expect(pdfText).toContain('Author: A. Analyst');
    expect(pdfText).toContain('Project footer');
    expect(pdfText).toContain('Narrative text');
    expect(pdfText).not.toContain('let value = 7');

    const docx = await serializeDocxReport(prepareDocxReport(prepared));
    const archive = await JSZip.loadAsync(docx);
    const documentXml = await archive.file('word/document.xml')?.async('string');
    const footerXml = await archive.file('word/footer1.xml')?.async('string');
    expect(documentXml).toContain('Project organization');
    expect(documentXml).toContain('A. Analyst');
    expect(documentXml).toContain('Narrative text');
    expect(documentXml).not.toContain('let value = 7');
    expect(footerXml).toContain('Project footer');
    expect(Object.keys(archive.files).some(name => name.startsWith('word/media/') && name.endsWith('.png'))).toBe(true);
  });

  it('preserves measurement units, normalized chart labels/data, and report ordering across HTML, PDF, and DOCX', async () => {
    const root = await mkdtemp(join(tmpdir(), 'openamx-measurement-report-'));
    directories.push(root);
    const input = join(root, 'report.amx');
    await writeFile(input, `\`\`\`amx
dimension Length
unit meter: Length
unit kilometer = 1000 * meter
type Sample {
  id: String
  distance: Length
}
let samples: Sample[] = [
  Sample { id = "A", distance = 1 kilometer },
  Sample { id = "B", distance = 500 meter }
]
table register = table(samples) {
  title: "Distances"
  column id as "Asset"
  column distance as "Distance"
}
let values: Length[] = [1 kilometer, 500 meter]
chart amounts = line(values) {
  title: "Distance trend"
  description: "In display order"
  series "Distance"
}
show register
show amounts
\`\`\``);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input, projectRoot: root });
    const html = renderPreparedHtml(prepared);
    expect(html).toContain('1 kilometer');
    expect(html).toContain('500 meter');
    expect(html).toContain('Distance (kilometer)');
    expect(html).toContain('<td>0.5</td>');

    const pdf = await reportText(await serializePdfReport(preparePdfReport(prepared)));
    expect(pdf).toContain('1 kilometer');
    expect(pdf).toContain('500 meter');
    expect(pdf).toContain('Distance (kilometer)');
    expect(pdf).toContain('0.5');

    const archive = await JSZip.loadAsync(await serializeDocxReport(prepareDocxReport(prepared)));
    const documentXml = await archive.file('word/document.xml')?.async('string');
    expect(documentXml).toContain('1 kilometer');
    expect(documentXml).toContain('500 meter');
    expect(documentXml).toContain('Distance (kilometer)');
    expect(documentXml).toContain('0.5');
    expect(prepared.items.filter(item => item.type === 'view').map(item => item.emission.name)).toEqual(['register', 'amounts']);
  });

  it('keeps renderer-specific empty and all-null table/chart policies', async () => {
    const root = await mkdtemp(join(tmpdir(), 'openamx-empty-measurement-report-'));
    directories.push(root);
    const input = join(root, 'report.amx');
    await writeFile(input, `\`\`\`amx
dimension Length
unit meter: Length
type Sample {
  id: String
  distance: Length?
}
let empty: Sample[] = []
let nulls: Sample[] = [Sample { id = "A", distance = null }]
table emptyTable = table(empty) {
  title: "Empty table"
  column distance as "Distance"
}
table nullTable = table(nulls) {
  title: "Null table"
  column distance as "Distance"
}
chart emptyChart = bar(empty) {
  title: "Empty chart"
  description: "No rows"
  category: id
  series distance as "Distance"
}
chart nullChart = bar(nulls) {
  title: "Null chart"
  description: "Null values"
  category: id
  series distance as "Distance"
}
show emptyTable
show nullTable
show emptyChart
show nullChart
\`\`\``);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input, projectRoot: root });
    const html = renderPreparedHtml(prepared);
    expect(html).toContain('"emptyState":{"label":"No data"}');
    expect(html).toContain('<th scope="col">Distance</th>');
    expect(html).not.toContain('Distance (meter)');
    expect(html).toContain('<td></td>');

    const pdfPrepared = preparePdfReport(prepared);
    const pdf = await reportText(await serializePdfReport(pdfPrepared));
    expect(pdf.match(/No data/g)?.length).toBe(2);
    expect(pdf).not.toContain('(null)');
    expect(pdfPrepared.definition.content).toBeArray();
    const pdfContent = pdfPrepared.definition.content as Array<Record<string, unknown>>;
    const chartBlocks = pdfContent.filter(item => Array.isArray(item.stack));
    expect(chartBlocks.flatMap(item => item.stack as Array<Record<string, unknown>>).filter(item => 'svg' in item)).toHaveLength(2);

    const docx = await JSZip.loadAsync(await serializeDocxReport(prepareDocxReport(prepared)));
    const documentXml = await docx.file('word/document.xml')?.async('string');
    expect(documentXml).toContain('No data');
    expect(documentXml).toContain('(null)');
    expect(documentXml).not.toContain('Distance (meter)');
  });
});