import { afterEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
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
  it('renders shared narrative nodes with final-output-relative standalone links and opaque preview targets', async () => {
    const root = await mkdtemp(join(tmpdir(), 'openamx-html-alignment-'));
    directories.push(root);
    const sourceDirectory = join(root, 'source');
    const outputDirectory = join(root, 'output');
    const companionDirectory = join(sourceDirectory, 'companions');
    await mkdir(companionDirectory, { recursive: true });
    await mkdir(outputDirectory);
    await writeFile(join(companionDirectory, 'asset one.txt'), 'offline companion');
    const image = await sharp({ create: { width: 1200, height: 600, channels: 3, background: '#336699' } }).png().toBuffer();
    await writeFile(join(sourceDirectory, 'wide.png'), image);
    const input = join(sourceDirectory, 'report.amx');
    await writeFile(input, `# Heading

Soft
line with **nested _emphasis_** and \`code\`.

[Internal](#heading) [External](https://example.invalid/report)
[Companion](./companions/asset%20one.txt?download=1#section)

![A wide test image](./wide.png "Image title")

| Name | Value |
| :--- | ---: |
| First | **one** |

<!-- page-break -->

<script>inert()</script>`);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input, projectRoot: root });
    const standalone = renderPreparedHtml(prepared, {
      mode: 'standalone',
      sourceDocumentPath: input,
      projectRoot: root,
      outputPath: join(outputDirectory, 'final.html')
    });
    expect(standalone).toContain('<h1 id="heading">Heading</h1>');
    expect(standalone).toContain('Soft<br>line with <strong>nested <em>emphasis</em></strong> and <code>code</code>.');
    expect(standalone).toContain('<a href="#heading">Internal</a>');
    expect(standalone).toContain('<a href="https://example.invalid/report" rel="noopener noreferrer">External</a>');
    expect(standalone).toContain('<a href="../source/companions/asset%20one.txt?download=1#section">Companion</a>');
    expect(standalone).toContain('alt="A wide test image" width="1024" height="512"');
    expect(standalone).toContain('data:image/png;base64,');
    expect(standalone).toContain('<table class="openamx-narrative-table">');
    expect(standalone).toContain('<th scope="col" align="left">Name</th>');
    expect(standalone).toContain('<th scope="col" align="right">Value</th>');
    expect(standalone).toContain('class="openamx-page-break"');
    expect(standalone).toContain('&lt;script&gt;inert()&lt;/script&gt;');
    expect(standalone).not.toContain(root);

    const preview = renderPreparedHtml(prepared, { mode: 'preview' });
    const ids = [...preview.html.matchAll(/data-openamx-target="([a-f0-9]{32})"/g)].map(match => match[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(preview.previewToken).toMatch(/^[a-f0-9]{64}$/);
    expect(preview.targets[ids[0]]).toEqual({ kind: 'external', href: 'https://example.invalid/report' });
    expect(preview.targets[ids[1]]).toEqual({ kind: 'local', path: 'companions/asset one.txt' });
    expect(preview.html).toContain('<a href="#heading">Internal</a>');
    expect(preview.html).not.toContain('https://example.invalid/report');
    expect(preview.html).not.toContain('asset%20one.txt');
    expect(preview.html).not.toContain(root);
    expect(preview.html).toContain("connect-src 'none'");
    expect(preview.html).not.toContain('allow-same-origin');
    expect(standalone).toContain("script-src 'none'");
    expect(preview.html).toMatch(/script-src 'nonce-[^']+'/);
    expect(preview.html).toContain('type:"navigate"');
  });

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
    await writeFile(input, `Narrative before captured emissions.

\`\`\`amx
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
\`\`\`

Narrative after captured emissions.
`);
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
    expect(pdf.indexOf('Narrative before captured emissions')).toBeLessThan(pdf.indexOf('Distances'));
    expect(pdf.indexOf('Distances')).toBeLessThan(pdf.indexOf('Distance trend'));
    expect(pdf.indexOf('Distance trend')).toBeLessThan(pdf.indexOf('Narrative after captured emissions'));

    const archive = await JSZip.loadAsync(await serializeDocxReport(prepareDocxReport(prepared)));
    const documentXml = await archive.file('word/document.xml')?.async('string');
    expect(documentXml).toContain('1 kilometer');
    expect(documentXml).toContain('500 meter');
    expect(documentXml).toContain('Distance (kilometer)');
    expect(documentXml).toContain('0.5');
    expect(documentXml.indexOf('Narrative before captured emissions')).toBeLessThan(documentXml.indexOf('Distances'));
    expect(documentXml.indexOf('Distances')).toBeLessThan(documentXml.indexOf('Distance trend'));
    expect(documentXml.indexOf('Distance trend')).toBeLessThan(documentXml.indexOf('Narrative after captured emissions'));
    expect(Object.keys(archive.files).some(name => /^word\/charts\/chart\d+\.xml$/.test(name))).toBe(true);
    expect(Object.keys(archive.files).some(name => name.startsWith('word/embeddings/') && name.endsWith('.xlsx'))).toBe(true);
    expect(Object.keys(archive.files).some(name => name.startsWith('word/media/') && name.endsWith('.svg'))).toBe(false);
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
    expect(documentXml.match(/Chart not shown: no plottable data/g)?.length).toBe(2);
    expect(documentXml).toContain('(null)');
    expect(documentXml).not.toContain('Distance (meter)');
    expect(Object.keys(docx.files).some(name => /^word\/charts\/chart\d+\.xml$/.test(name))).toBe(false);
  });
});