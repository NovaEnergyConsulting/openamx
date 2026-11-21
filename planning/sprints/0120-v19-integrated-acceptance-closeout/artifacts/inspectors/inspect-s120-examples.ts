import { createHash } from 'node:crypto';
import JSZip from 'jszip';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const outputRoot = 'planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/outputs';
const htmlPath = `${outputRoot}/example-07.html`;
const pdfPath = `${outputRoot}/example-07.pdf`;
const docxPath = `${outputRoot}/example-07.docx`;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function hash(path: string) {
  const bytes = Buffer.from(await Bun.file(path).arrayBuffer());
  return {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  };
}

const example05 = await Bun.file(`${outputRoot}/example-05-run.json`).json();
assert(example05.freezingCelsius.value === 0, 'freezing Celsius must be 0');
assert(Math.abs(example05.freezingFahrenheit.value - 32) < 1e-10, 'freezing Fahrenheit must equal 32');
assert(example05.freezingKelvin.value === 273.15, 'freezing Kelvin must be 273.15');
assert(example05.sameTemperature === true, 'temperature invariant must hold');
assert(example05.temperatureSpan.value === 10 && example05.temperatureSpan.unit.text === 'celsius', 'subtraction must retain 10 celsius');
assert(example05.temperatureTotal.value === 303.15 && example05.temperatureTotal.unit.text === 'celsius', 'physical sum must retain 303.15 celsius');
assert(example05.temperatureMean.value === 15 && example05.temperatureMean.unit.text === 'celsius', 'physical mean must retain display unit');

const summary = await Bun.file(`${outputRoot}/named/summary.json`).json();
const rows = await Bun.file(`${outputRoot}/named/rows.csv`).text();
assert(summary.totalScore === 38, 'named summary totalScore must be 38');
assert(summary.assetName === 'North Pump 01', 'named summary asset must be stable');
assert(rows.includes('16') && rows.includes('18') && rows.includes('4'), 'named CSV must retain [16,18,4]');

const html = await Bun.file(htmlPath).text();
const figures = [...html.matchAll(/<figure class="openamx-view openamx-chart"[\s\S]*?<\/figure>/g)]
  .map(match => match[0]);
const htmlCharts = figures.map(figure => {
  const title = figure.match(/<strong id="[^"]+">([^<]+)<\/strong>/)?.[1] ?? '';
  const payloadText = figure.match(/data-chart-model>([\s\S]*?)<\/script>/)?.[1];
  assert(payloadText, `missing chart payload for ${title}`);
  const payload = JSON.parse(payloadText);
  return {
    title,
    showTable: payload.showTable,
    htmlTable: figure.includes('openamx-chart-data'),
    payloadTable: Object.prototype.hasOwnProperty.call(payload, 'table'),
    tableId: payload.accessibility?.tableId ?? null,
    tableCaptionReference: figure.includes('-table-caption')
  };
});
assert(htmlCharts.length === 4, 'HTML must contain four charts');
assert(htmlCharts.map(chart => chart.showTable).join(',') === 'false,false,true,true', 'HTML chart states must be false,false,true,true');
for (const chart of htmlCharts.slice(0, 2)) {
  assert(!chart.htmlTable && !chart.payloadTable && chart.tableId === null && !chart.tableCaptionReference, `false HTML chart leaked table data: ${chart.title}`);
}
for (const chart of htmlCharts.slice(2)) {
  assert(chart.htmlTable && chart.payloadTable && chart.tableId !== null && chart.tableCaptionReference, `true HTML chart lost table data: ${chart.title}`);
}
assert(html.includes('Screening register'), 'ordinary HTML register must remain');

const pdf = await getDocument({
  data: new Uint8Array(await Bun.file(pdfPath).arrayBuffer()),
  useSystemFonts: true,
  disableFontFace: true
}).promise;
const pdfPages: string[] = [];
for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
  const page = await pdf.getPage(pageNumber);
  pdfPages.push((await page.getTextContent()).items
    .map(item => 'str' in item ? item.str : '')
    .join(' '));
}
const pdfText = pdfPages.join(' ');
for (const title of ['Score by screening', 'Score by screening - false', 'Score by screening - true', 'Score by screening - expression']) {
  assert(pdfText.includes(title), `PDF missing chart title: ${title}`);
}
assert(!pdfText.includes('Data for Score by screening - false'), 'PDF false chart leaked table heading');
assert(!pdfText.includes('Data for Score by screening<'), 'PDF omitted chart leaked table heading');
const retainedPdfScoreHeadings = pdfText.match(/Illustrative score/g)?.length ?? 0;
assert(retainedPdfScoreHeadings >= 3, 'PDF true chart tables and ordinary register lost expected headings');
assert(pdfText.includes('Screening register'), 'ordinary PDF register must remain');

const archive = await JSZip.loadAsync(await Bun.file(docxPath).arrayBuffer());
const documentXml = await archive.file('word/document.xml')?.async('string') ?? '';
const drawingProperties = [...documentXml.matchAll(/<wp:docPr\b([^>]*)\/?\s*>/g)]
  .map(match => match[1] ?? '');
function chartAlt(title: string) {
  const attributes = drawingProperties.find(value => value.includes(`name="${title}"`) || value.includes(`title="${title}"`));
  return { found: Boolean(attributes), tableReference: attributes ? /table/i.test(attributes) : false };
}
const docxInspection = {
  wordTables: (documentXml.match(/<w:tbl>/g) ?? []).length,
  charts: Object.keys(archive.files).filter(name => /^word\/charts\/chart\d+\.xml$/.test(name)).length,
  omittedCaption: documentXml.includes('Data for Score by screening<'),
  falseCaption: documentXml.includes('Data for Score by screening - false'),
  trueCaption: documentXml.includes('Data for Score by screening - true'),
  expressionCaption: documentXml.includes('Data for Score by screening - expression'),
  omittedAlt: chartAlt('Score by screening'),
  falseAlt: chartAlt('Score by screening - false'),
  trueAlt: chartAlt('Score by screening - true'),
  expressionAlt: chartAlt('Score by screening - expression')
};
assert(docxInspection.charts === 4, 'DOCX must contain four native charts');
assert(docxInspection.wordTables === 3, 'DOCX must retain one ordinary and two true chart tables');
assert(!docxInspection.omittedCaption && !docxInspection.falseCaption, 'DOCX false charts leaked table captions');
assert(docxInspection.trueCaption && docxInspection.expressionCaption, 'DOCX true charts lost table captions');
for (const alt of [docxInspection.omittedAlt, docxInspection.falseAlt]) assert(alt.found && !alt.tableReference, 'DOCX false chart alt leaked table reference');
for (const alt of [docxInspection.trueAlt, docxInspection.expressionAlt]) assert(alt.found && alt.tableReference, 'DOCX true chart alt lost table reference');

console.log(JSON.stringify({
  status: 'PASS',
  hashes: {
    html: await hash(htmlPath),
    pdf: await hash(pdfPath),
    docx: await hash(docxPath),
    example05: await hash(`${outputRoot}/example-05-run.json`),
    summary: await hash(`${outputRoot}/named/summary.json`),
    rows: await hash(`${outputRoot}/named/rows.csv`)
  },
  affine: {
    freezing: [example05.freezingCelsius.value, example05.freezingFahrenheit.value, example05.freezingKelvin.value],
    subtraction: example05.temperatureSpan.value,
    sum: example05.temperatureTotal.value,
    mean: example05.temperatureMean.value
  },
  named: { totalScore: summary.totalScore, scores: [16, 18, 4] },
  html: htmlCharts,
  pdf: { pages: pdf.numPages, falseTableText: false, trueTableHeading: true, ordinaryRegister: true },
  docx: docxInspection
}, null, 2));
