import { afterEach, describe, expect, it } from 'bun:test';
import { Packer } from 'docx';
import { mkdir, mkdtemp, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import JSZip from 'jszip';
import sharp from 'sharp';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import { prepareDocxReport, serializeDocxReport } from '../src/renderer/reportDocx';
import { prepareReport } from '../src/renderer/reportPreparation';
import { prepareDocxDestination, writeDocxAtomically } from '../src/runtime/docxDestination';

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
    expect(relsXml).toContain('chart');
    expect([...parts.keys()].some(name => /^word\/charts\/chart\d+\.xml$/.test(name))).toBe(true);
    expect([...parts.keys()].some(name => name.startsWith('word/embeddings/') && name.endsWith('.xlsx'))).toBe(true);
    expect([...parts.keys()].some(name => name.startsWith('word/media/') && name.endsWith('.svg'))).toBe(false);
  });

  it('serializes all chart kinds as native charts with embedded workbooks and complete table alternatives', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-native-charts-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    await writeFile(input, `\`\`\`amx
type CategoryRow {
  label: String
  first: Number?
  second: Number?
}
let categories: CategoryRow[] = [
  CategoryRow { label = "same", first = -2, second = 0 },
  CategoryRow { label = "same", first = 0, second = 3 },
  CategoryRow { label = "last", first = null, second = -1 }
]
chart horizontal = bar(categories) {
  title: "Horizontal"
  description: "Two ordered series"
  category: label
  series first as "First"
  series second as "Second"
}
chart vertical = column(categories) {
  title: "Vertical"
  description: "Two ordered series"
  category: label
  series first as "First"
  series second as "Second"
}
type TimelineRow {
  at: DateTime
  value: Number?
}
let timeline: TimelineRow[] = [
  TimelineRow { at = "2025-01-01T00:00:00Z", value = 1 },
  TimelineRow { at = "2025-01-11T00:00:00Z", value = null },
  TimelineRow { at = "2025-03-01T00:00:00Z", value = 4 }
]
chart dates = line(timeline) {
  title: "Date line"
  description: "UTC dates and a null gap"
  x: at
  series value as "Value"
}
type NumericRow {
  x: Number
  value: Number?
  absent: Number?
}
let numeric: NumericRow[] = [
  NumericRow { x = 10, value = 1, absent = null },
  NumericRow { x = 30, value = null, absent = null },
  NumericRow { x = 30, value = 8, absent = null },
  NumericRow { x = 11, value = 2, absent = null }
]
chart numericLine = line(numeric) {
  title: "Numeric line"
  description: "Continuous numeric x values"
  x: x
  series value as "Value"
  series absent as "Absent"
}
type ScatterRow {
  x: Number?
  y: Number?
  group: String
}
let points: ScatterRow[] = [
  ScatterRow { x = 1, y = 2, group = "A" },
  ScatterRow { x = null, y = 8, group = "A" },
  ScatterRow { x = 4, y = 5, group = "B" }
]
chart scatter = scatter(points) {
  title: "Grouped scatter"
  description: "First-seen groups"
  x: x
  y: y
  group: group
}
show horizontal
show vertical
show dates
show numericLine
show scatter
\`\`\``);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input });
    const archive = await JSZip.loadAsync(await serializeDocxReport(prepareDocxReport(prepared)));
    const names = Object.keys(archive.files);
    const chartNames = names.filter(name => /^word\/charts\/chart\d+\.xml$/.test(name));
    const workbooks = names.filter(name => name.startsWith('word/embeddings/') && name.endsWith('.xlsx'));
    const documentXml = await archive.file('word/document.xml')?.async('string') ?? '';
    const relationships = await archive.file('word/_rels/document.xml.rels')?.async('string') ?? '';
    const chartExtents = [...documentXml.matchAll(/<wp:extent cx="(\d+)" cy="(\d+)"\/>/g)];
    expect(chartNames).toHaveLength(5);
    expect(workbooks).toHaveLength(5);
    expect(documentXml.match(/<w:tbl>/g)).toHaveLength(5);
    expect(chartExtents).toHaveLength(chartNames.length);
    for (const [, width, height] of chartExtents) {
      expect(Number(width)).toBeLessThanOrEqual(9_026 * 635);
      expect(Number(width) / Number(height)).toBeCloseTo(2, 4);
    }
    expect(documentXml).toContain('Continuous numeric x values');
    expect(documentXml).toContain('Series &quot;Absent&quot; has no plottable coordinates');
    expect(documentXml).toContain('Date line');
    expect(documentXml).toContain('Grouped scatter');
    expect(documentXml).toContain('(null)');
    expect(relationships).toContain('chart');
    expect(relationships).not.toContain('TargetMode="External"');
    expect(names.some(name => name.startsWith('word/media/') && name.endsWith('.svg'))).toBe(false);
    expect(names.some(name => /vbaProject|macros/i.test(name))).toBe(false);

    const chartXml = await Promise.all(chartNames.map(name => archive.file(name)!.async('string')));
    expect(chartXml.some(xml => xml.includes('<c:barDir val="bar"/>'))).toBe(true);
    expect(chartXml.some(xml => xml.includes('<c:barDir val="col"/>'))).toBe(true);
    expect(chartXml.some(xml => xml.includes('<c:lineChart>') && xml.includes('<c:dateAx>'))).toBe(true);
    expect(chartXml.join('').toLowerCase()).toContain('146c94');
    expect(chartXml.filter(xml => xml.includes('<c:scatterChart>'))).toHaveLength(2);
    for (const chartName of chartNames) {
      const relName = chartName.replace('word/charts/', 'word/charts/_rels/').replace('.xml', '.xml.rels');
      const chartRels = await archive.file(relName)?.async('string');
      expect(chartRels).toContain('Microsoft_Excel_Worksheet');
      expect(chartRels).not.toContain('TargetMode="External"');
    }

    const numericXml = await archive.file(chartNames[3]!)!.async('string');
    expect(numericXml).toContain('Numeric line');
    expect(numericXml).toContain('<c:scatterChart>');
    expect(numericXml.match(/<c:ser>/g)).toHaveLength(2);
    expect(numericXml).toContain('<c:v>10</c:v>');
    expect(numericXml).toContain('<c:v>30</c:v>');
    expect(numericXml).toContain('<c:v>11</c:v>');
    expect(numericXml).not.toContain('Absent');

    const embeddedWorkbook = await JSZip.loadAsync(await archive.file(workbooks[3]!)!.async('uint8array'));
    const worksheetXml = await embeddedWorkbook.file('xl/worksheets/sheet1.xml')?.async('string') ?? '';
    expect(worksheetXml).toContain('<v>10</v>');
    expect(worksheetXml).toContain('<v>30</v>');
    expect(worksheetXml).toContain('<v>11</v>');
  });

  it('uses truthful notice-and-table alternatives for zero-point and unsupported chart cases', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-chart-deferrals-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    await writeFile(input, `\`\`\`amx
type ValueRow {
  label: Number
  value: Number?
}
let empty: ValueRow[] = []
let allNull: ValueRow[] = [ValueRow { label = 1, value = null }]
chart emptyChart = bar(empty) {
  title: "Empty chart"
  description: "No rows"
  category: label
  series value as "Value"
}
chart nullChart = line(allNull) {
  title: "All-null chart"
  description: "All values are null"
  x: label
  series value as "Value"
}
type UnlocatedRow {
  x: Number?
  value: Number
}
let unlocated: UnlocatedRow[] = [UnlocatedRow { x = null, value = 3 }]
chart unlocatedChart = line(unlocated) {
  title: "Unlocated points"
  description: "No row has a numeric x coordinate"
  x: x
  series value as "Value"
}
type PointRow {
  x: Number?
  y: Number?
  group: String
}
let points: PointRow[] = [
  PointRow { x = null, y = 8, group = "No points" },
  PointRow { x = 1, y = 2, group = "Plotted" }
]
chart mixedGroups = scatter(points) {
  title: "Mixed groups"
  description: "One group has no plottable points"
  x: x
  y: y
  group: group
}
show emptyChart
show nullChart
show unlocatedChart
show mixedGroups
\`\`\``);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input });
    const archive = await JSZip.loadAsync(await serializeDocxReport(prepareDocxReport(prepared)));
    const names = Object.keys(archive.files);
    const documentXml = await archive.file('word/document.xml')?.async('string') ?? '';
    expect(names.some(name => /^word\/charts\/chart\d+\.xml$/.test(name))).toBe(false);
    expect(documentXml.match(/Chart not shown: no plottable data\./g)).toHaveLength(3);
    expect(documentXml).toContain('Chart not shown: Word cannot represent a scatter group with no plottable points.');
    expect(documentXml).toContain('>1<');
    expect(documentXml).toContain('No row has a numeric x coordinate');
    expect(documentXml).toContain('No points');
    expect(documentXml).toContain('Plotted');
    expect(documentXml).toContain('8');
    expect(documentXml).toContain('(null)');
    expect(documentXml.match(/<w:tbl>/g)).toHaveLength(4);
  });

  it('omits only numeric-X line series with no plottable coordinates and preserves their table data', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-line-null-x-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    await writeFile(input, `\`\`\`amx
type NumericRow {
  x: Number?
  onlyAtNull: Number?
  value: Number?
}
let rows: NumericRow[] = [
  NumericRow { x = null, onlyAtNull = 8, value = 1 },
  NumericRow { x = 10, onlyAtNull = null, value = 3 },
  NumericRow { x = 20, onlyAtNull = null, value = 4 }
]
chart trend = line(rows) {
  title: "Nullable X"
  description: "One series has no plottable coordinates"
  x: x
  series onlyAtNull as "OnlyAtNull"
  series value as "Value"
}
show trend
\`\`\``);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input });
    const archive = await JSZip.loadAsync(await serializeDocxReport(prepareDocxReport(prepared)));
    const chartXml = await archive.file('word/charts/chart1.xml')?.async('string') ?? '';
    const documentXml = await archive.file('word/document.xml')?.async('string') ?? '';
    expect(chartXml).toContain('<c:scatterChart>');
    expect(chartXml).not.toContain('OnlyAtNull');
    expect(chartXml).toContain('Value');
    expect(chartXml).toContain('<c:v>10</c:v>');
    expect(chartXml).toContain('<c:v>20</c:v>');
    expect(documentXml).toContain('Series &quot;OnlyAtNull&quot; has no plottable coordinates');
    expect(documentXml).toContain('OnlyAtNull');
    expect(documentXml).toContain('>8<');
    expect(documentXml.match(/<w:tbl>/g)).toHaveLength(1);
  });

  it('maps two measurement axes and defers charts requiring three axes without merging units', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-chart-axes-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    await writeFile(input, `\`\`\`amx
dimension Length
unit meter: Length
unit kilometer = 1000 * meter
dimension Mass
unit gram: Mass
dimension Time
unit second: Time
type Measurement {
  id: String
  distance: Length
  mass: Mass
  duration: Time
}
let values: Measurement[] = [
  Measurement { id = "A", distance = 1 kilometer, mass = 2 gram, duration = 3 second },
  Measurement { id = "B", distance = 500 meter, mass = 4 gram, duration = 5 second }
]
chart twoAxes = column(values) {
  title: "Two axes"
  description: "Independent units"
  category: id
  series distance as "Distance"
  series mass as "Mass"
}
chart threeAxes = column(values) {
  title: "Three axes"
  description: "Unsupported independent units"
  category: id
  series distance as "Distance"
  series mass as "Mass"
  series duration as "Duration"
}
show twoAxes
show threeAxes
\`\`\``);
    const loaded = await loadEntryModule(input);
    const prepared = await prepareReport(loaded.doc, loaded.env, { file: input });
    const archive = await JSZip.loadAsync(await serializeDocxReport(prepareDocxReport(prepared)));
    const chartNames = Object.keys(archive.files).filter(name => /^word\/charts\/chart\d+\.xml$/.test(name));
    const documentXml = await archive.file('word/document.xml')?.async('string') ?? '';
    expect(chartNames).toHaveLength(1);
    const chartXml = await archive.file(chartNames[0]!)?.async('string') ?? '';
    expect(chartXml.match(/<c:valAx>/g)).toHaveLength(2);
    expect(chartXml).toContain('kilometer');
    expect(chartXml).toContain('gram');
    expect(documentXml).toContain('Distance (kilometer)');
    expect(documentXml).toContain('Mass (gram)');
    expect(documentXml).toContain('Duration (second)');
    expect(documentXml).toContain('Chart not shown: Word cannot represent all measurement axes without changing their meaning.');
    expect(documentXml.match(/<w:tbl>/g)).toHaveLength(2);
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

  it('preserves an existing destination when native chart serialization fails', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-docx-serialization-failure-'));
    temporaryDirectories.push(directory);
    const input = join(directory, 'report.amx');
    const output = join(directory, 'report.docx');
    await writeFile(input, '```amx\nlet values: Number[] = [1]\nchart valuesChart = bar(values) {\n  title: "Values"\n  description: "Serialization failure fixture"\n  series "Value"\n}\nshow valuesChart\n```\n');
    await writeFile(output, 'preserve existing DOCX bytes');
    const loaded = await loadEntryModule(input);
    const report = await prepareReport(loaded.doc, loaded.env, { file: input });
    const destination = await prepareDocxDestination(output, input, undefined);
    const originalToBuffer = Packer.toBuffer;

    try {
      Packer.toBuffer = async () => {
        throw new Error('injected native chart serialization failure');
      };
      await expect(async () => {
        const bytes = await serializeDocxReport(prepareDocxReport(report));
        await writeDocxAtomically(destination, bytes);
      }).toThrow('injected native chart serialization failure');
    } finally {
      Packer.toBuffer = originalToBuffer;
    }

    expect(await Bun.file(output).text()).toBe('preserve existing DOCX bytes');
    expect((await readdir(directory)).sort()).toEqual(['report.amx', 'report.docx']);
  });
});