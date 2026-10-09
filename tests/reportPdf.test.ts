import { describe, expect, it } from 'bun:test';
import { afterEach } from 'bun:test';
import { mkdir, mkdtemp, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import sharp from 'sharp';
import { parseDocumentText } from '../src/parser/parseDocument';
import { Environment } from '../src/runtime/environment';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { preparePdfReport, serializePdfReport } from '../src/renderer/reportPdf';
import { prepareReport } from '../src/renderer/reportPreparation';
import { preparePdfDestination, writePdfAtomically } from '../src/runtime/pdfDestination';
const temporaryDirectories: string[] = [];

afterEach(async () => {
  for (const directory of temporaryDirectories) await rm(directory, { recursive: true, force: true });
  temporaryDirectories.length = 0;
});

async function textByPage(bytes: Uint8Array): Promise<string[]> {
  const pdf = await getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise;
  const pages: string[] = [];
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => 'str' in item ? item.str : '').join(' '));
  }
  return pages;
}

function collectRecords(value: unknown, records: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const item of value) collectRecords(item, records);
  } else if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    records.push(record);
    for (const item of Object.values(record)) collectRecords(item, records);
  }
  return records;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

describe('report PDF adapter', () => {
  it('serializes searchable report content, static chart data, and an explicit page break', async () => {
    const doc = parseDocumentText(`# Report\n\nNarrative text\n\n<!-- page-break -->\n\n## Appendix`);
    const prepared = await prepareReport(doc, new Environment());
    const bytes = await serializePdfReport(preparePdfReport(prepared));
    const byteLength = bytes.byteLength;
    const pages = await textByPage(bytes);
    const repeatedBytes = await serializePdfReport(preparePdfReport(prepared));
    const repeatedPages = await textByPage(repeatedBytes);
    expect(pages.length).toBe(2);
    expect(pages[0]).toContain('Report');
    expect(pages[0]).toContain('Narrative text');
    expect(pages[1]).toContain('Appendix');
    expect(pages[0]).toContain('1 / 2');
    expect(byteLength).toBeGreaterThan(1000);
    expect(repeatedPages).toEqual(pages);
  });

  it('serializes production table rows and chart data from captured emissions', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-report-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    const rowValues = Array.from({ length: 55 }, (_value, index) => `Row { name = "Pump ${index + 1}", score = ${index + 1} }`).join(', ');
    await Bun.write(input, `# Emissions\n\n\`\`\`amx\ntype Row {\n  name: String\n  score: Number\n}\nlet rows: Row[] = [${rowValues}]\nlet scores: Number[] = [4, 7]\ntable register = table(rows) {\n  title: "Risk Register"\n  column name as "Asset"\n  column score as "Score"\n}\nchart exposure = bar(scores) {\n  title: "Exposure"\n  description: "Static scores"\n  series "Score"\n}\nshow register\nshow exposure\n\`\`\``);
    const loaded = await loadEntryModule(input);
    const bytes = await serializePdfReport(preparePdfReport(await prepareReport(loaded.doc, loaded.env, { file: input })));
    const pages = await textByPage(bytes);
    const text = pages.join(' ');
    expect(text).toContain('Risk Register');
    expect(text).toContain('Pump 1');
    expect(text).toContain('Pump 55');
    expect(text).toContain('Exposure');
    expect(text).toContain('Static scores');
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.filter(page => page.includes('Asset')).length).toBeGreaterThan(1);
  });

  it('renders the shared narrative AST with safe final-output-relative links and sanitized images', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-pdf-markdown-'));
    temporaryDirectories.push(directory);
    const sourceDirectory = join(directory, 'source');
    const imageDirectory = join(sourceDirectory, 'images');
    const companionDirectory = join(sourceDirectory, 'companions');
    const outputDirectory = join(directory, 'output');
    await Promise.all([
      mkdir(imageDirectory, { recursive: true }),
      mkdir(companionDirectory, { recursive: true }),
      mkdir(outputDirectory, { recursive: true })
    ]);
    const input = join(sourceDirectory, 'report.amx');
    const portraitPath = join(imageDirectory, 'portrait.png');
    const landscapePath = join(imageDirectory, 'landscape.png');
    await writeFile(join(companionDirectory, 'asset one.txt'), 'portable companion');
    await writeFile(portraitPath, await sharp({
      create: { width: 1200, height: 1800, channels: 3, background: '#ffffff' }
    }).png().toBuffer());
    await writeFile(landscapePath, await sharp({
      create: { width: 2400, height: 1350, channels: 3, background: '#ffffff' }
    }).png().toBuffer());

    const markdownRows = Array.from({ length: 70 }, (_value, index) => `| Markdown row ${index + 1} | Value ${index + 1} |`).join('\n');
    await writeFile(input, `# Main **heading**

Paragraph with **bold *nested***, *emphasis*, ~~deleted~~, \`inline code\`, and a soft
line break. It links to [HTTP](http://example.com/target), [HTTPS](https://example.com/target), [companion](./companions/asset%20one.txt?download=1#excerpt%20part), [appendix](#appendix), [duplicate](#appendix-2), [missing](#missing), and [unsupported](javascript:alert(1)).

Hard break with spaces${'  '}
continues here. Hard break with a backslash\\
continues here.

Literal <strong>HTML</strong> and {{ "**interpolated**" }} stay text.

1. Ordered item
2. Second item
   - Nested item

> A quoted paragraph.

---

\`\`\`text
  leading spaces
\tcode tab
<!-- page-break -->
\`\`\`

![Portrait image](./images/portrait.png)

![Landscape image](./images/landscape.png)

| Markdown field | Markdown value |
| --- | --- |
${markdownRows}

## Appendix

## Appendix

<!-- page-break -->

### After page break

#### Heading level four

##### Heading level five

###### Heading level six
`);

    const loaded = await loadEntryModule(input);
    const report = await prepareReport(loaded.doc, loaded.env, { file: input });
    expect(report.items.filter(item => item.type === 'narrative').flatMap(item => item.type === 'narrative' ? item.diagnostics : []))
      .toContainEqual({ type: 'rejectedLink', reason: 'unsupported-scheme' });
    await Promise.all([unlink(portraitPath), unlink(landscapePath)]);
    const context = { sourceDocumentPath: input, destinationPath: join(outputDirectory, 'report.pdf') };
    const prepared = preparePdfReport(report, context);
    const records = collectRecords(prepared.definition.content);
    const images = records.filter(record => typeof record.image === 'string');
    const headings = records.filter(record => typeof record.id === 'string');
    const code = records.find(record => record.style === 'code');
    const markdownTable = records.find(record => isRecord(record.table));
    const tableDefinition = markdownTable?.table;
    expect(headings.map(record => record.id)).toContain('appendix');
    expect(headings.map(record => record.id)).toContain('appendix-2');
    expect(headings.map(record => record.id)).toContain('heading-level-six');
    expect(code?.text).toBe('  leading spaces\n\tcode tab\n<!-- page-break -->\n');
    expect(records.filter(record => record.text === '\n').length).toBeGreaterThan(2);
    expect(records.some(record => record.bold === true)).toBe(true);
    expect(records.some(record => record.italics === true)).toBe(true);
    expect(records.some(record => record.decoration === 'lineThrough')).toBe(true);
    expect(records.some(record => Array.isArray(record.ol))).toBe(true);
    expect(records.some(record => Array.isArray(record.ul))).toBe(true);
    expect(records.some(record => Array.isArray(record.canvas))).toBe(true);
    expect(records.some(record => record.pageBreak === 'before')).toBe(true);
    expect(isRecord(tableDefinition)).toBe(true);
    if (isRecord(tableDefinition)) {
      expect(tableDefinition.headerRows).toBe(1);
      expect(Array.isArray(tableDefinition.body)).toBe(true);
    }
    expect(isRecord(prepared.definition.defaultStyle) ? prepared.definition.defaultStyle.font : undefined).toBe('Roboto');
    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image.width).toBeLessThanOrEqual(493);
      expect(image.height).toBeLessThanOrEqual(739);
      expect(image.alt).toBeTruthy();
      expect(image.image).toStartWith('data:image/png;base64,');
    }
    expect(Number(images[0].width) / Number(images[0].height)).toBeCloseTo(1200 / 1800, 5);
    expect(Number(images[1].width) / Number(images[1].height)).toBeCloseTo(2400 / 1350, 5);
    expect(() => preparePdfReport(report)).toThrow('validated source-document and final-destination context');

    const pdf = await getDocument({
      data: await serializePdfReport(prepared),
      useSystemFonts: true,
      disableFontFace: true
    }).promise;
    const pages: string[] = [];
    const annotations: { url?: string; unsafeUrl?: string; dest?: unknown }[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      pages.push((await page.getTextContent()).items.map(item => 'str' in item ? item.str : '').join(' '));
      annotations.push(...await page.getAnnotations());
    }
    const text = pages.join(' ');
    const urls = annotations
      .flatMap(annotation => [annotation.url, annotation.unsafeUrl])
      .filter((url): url is string => typeof url === 'string');
    expect(text).toContain('Main');
    expect(text).toContain('line break');
    expect(text).toContain('<strong>HTML</strong>');
    expect(text).toContain('**interpolated**');
    expect(text).toContain('unsupported');
    expect(text).toContain('Markdown row 70');
    expect(text).toContain('After page break');
    expect(text).toContain('Heading level six');
    expect(pages.filter(page => page.includes('Markdown field')).length).toBeGreaterThan(1);
    expect(pages.findIndex(page => page.includes('After page break')))
      .toBeGreaterThan(pages.findIndex(page => page.includes('Markdown row 70')));
    expect(pdf.numPages).toBeGreaterThan(2);
    expect(urls).toContain('https://example.com/target');
    expect(urls).toContain('http://example.com/target');
    expect(urls).toContain('../source/companions/asset%20one.txt?download=1#excerpt%20part');
    expect(urls.some(url => url.includes('missing'))).toBe(false);
    expect(urls.some(url => url.includes('javascript:'))).toBe(false);
    const destinations = annotations.map(annotation => annotation.dest).filter((destination): destination is string => typeof destination === 'string');
    expect(destinations).toContain('appendix');
    expect(destinations).toContain('appendix-2');
    expect(urls.every(url => !url.includes(directory) && !url.startsWith('file:') && !url.includes('.tmp'))).toBe(true);
  });

  it('renders every shared chart kind as static SVG and retains complete searchable rows', async () => {
    const loaded = await loadEntryModule('examples/kitchen-sink.amx');
    const report = await prepareReport(loaded.doc, loaded.env, { file: 'examples/kitchen-sink.amx' });
    const chartCount = report.items.filter(item => item.type === 'view' && item.emission.kind === 'chart').length;
    const prepared = preparePdfReport(report);
    const content = prepared.definition.content as Array<Record<string, unknown>>;
    const chartBlocks = content.filter(item => Array.isArray(item.stack)
      && (item.stack as Array<Record<string, unknown>>).some(child => typeof child.svg === 'string'));
    const graphics = chartBlocks.flatMap(item => item.stack as Array<Record<string, unknown>>)
      .filter(item => typeof item.svg === 'string');
    const pages = await textByPage(await serializePdfReport(prepared));
    const text = pages.join(' ');

    expect(chartCount).toBe(10);
    expect(chartBlocks).toHaveLength(chartCount);
    expect(chartBlocks.every(item => item.unbreakable === true)).toBe(true);
    expect(graphics).toHaveLength(chartCount);
    expect(graphics.every(item => (item.svg as string).startsWith('<svg'))).toBe(true);
    expect(text).toContain('Record bar chart');
    expect(text).toContain('DateTime x line chart');
    expect(text).toContain('Grouped scatter chart');
    expect(text).toContain('No data');
    expect(text).toContain('Category');
    expect(text).toContain('Nullable benchmark');
    expect(text).toContain('Ordinary Markdown Is Still Markdown');
    expect(text).toContain('Reading convention');
    expect(text).toContain('An unordered list item');
    expect(text).toContain('Document part');
    expect(text).not.toContain('**bold**');
    expect(text).not.toContain('| Document part | Role |');
  });

  it('surfaces a chart render failure before atomic output can replace an existing file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-pdf-render-failure-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    const output = join(directory, 'report.pdf');
    await Bun.write(input, '```amx\nlet values: Number[] = [1]\nchart valuesChart = bar(values) {\n  title: "Values"\n  description: "Renderer failure fixture"\n  series "Value"\n}\nshow valuesChart\n```');
    await Bun.write(output, 'preserve existing PDF bytes');
    const loaded = await loadEntryModule(input);
    const report = await prepareReport(loaded.doc, loaded.env, { file: input });
    const destination = await preparePdfDestination(output, input, undefined);

    await expect(async () => {
      const prepared = preparePdfReport(report, () => {
        throw new Error('injected chart render failure');
      });
      await writePdfAtomically(destination, await serializePdfReport(prepared));
    }).toThrow('injected chart render failure');

    expect(await Bun.file(output).text()).toBe('preserve existing PDF bytes');
    expect((await readdir(directory)).sort()).toEqual(['report.amx', 'report.pdf']);
  });

  it('produces equivalent PDF narrative structures for LF and CRLF source text', async () => {
    const source = '# Heading\n\nA soft\nline break and a hard  \nbreak.\n\n```text\n  code\n\twith a tab\n```\n';
    const prepare = async (text: string) => {
      const report = await prepareReport(parseDocumentText(text), new Environment());
      return preparePdfReport(report).definition.content;
    };
    expect(await prepare(source.replace(/\n/g, '\r\n'))).toEqual(await prepare(source));
  });
});