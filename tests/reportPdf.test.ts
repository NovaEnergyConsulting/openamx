import { describe, expect, it } from 'bun:test';
import { afterEach } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { parseDocumentText } from '../src/parser/parseDocument';
import { Environment } from '../src/runtime/environment';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { preparePdfReport, serializePdfReport } from '../src/renderer/reportPdf';
import { prepareReport } from '../src/renderer/reportPreparation';
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
    const rowValues = Array.from({ length: 55 }, (_value, index) => `Row { name: "Pump ${index + 1}", score: ${index + 1} }`).join(', ');
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
});