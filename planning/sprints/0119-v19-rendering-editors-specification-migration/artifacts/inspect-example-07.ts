import { createHash } from 'node:crypto';
import JSZip from 'jszip';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = 'planning/sprints/0119-v19-rendering-editors-specification-migration/artifacts/outputs';
const htmlPath = `${root}/example-07.html`;
const pdfPath = `${root}/example-07.pdf`;
const docxPath = `${root}/example-07.docx`;

const html = await Bun.file(htmlPath).text();
const figures = [...html.matchAll(/<figure class="openamx-view openamx-chart"[\s\S]*?<\/figure>/g)]
  .map(match => match[0]);
const htmlCharts = figures.map(figure => {
  const title = figure.match(/<strong id="[^"]+">([^<]+)<\/strong>/)?.[1] ?? '';
  const payload = JSON.parse(figure.match(/data-chart-model>([\s\S]*?)<\/script>/)?.[1] ?? 'null');
  return {
    title,
    showTable: payload.showTable,
    htmlTable: figure.includes('openamx-chart-data'),
    payloadTable: Object.prototype.hasOwnProperty.call(payload, 'table'),
    rowLabels: payload.rowLabels ? Object.keys(payload.rowLabels).length : 0,
    tableId: payload.accessibility?.tableId ?? null,
    tableCaptionReference: figure.includes('-table-caption')
  };
});

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
const titles = [
  'Score by screening',
  'Score by screening - false',
  'Score by screening - true',
  'Score by screening - expression'
].map(title => ({ title, present: pdfText.includes(title) }));

const archive = await JSZip.loadAsync(await Bun.file(docxPath).arrayBuffer());
const documentXml = await archive.file('word/document.xml')?.async('string') ?? '';
const drawingProperties = [...documentXml.matchAll(/<wp:docPr\b([^>]*)\/?\s*>/g)]
  .map(match => match[1] ?? '');
const chartAlt = (title: string) => {
  const attributes = drawingProperties.find(value => value.includes(`name="${title}"`)
    || value.includes(`title="${title}"`));
  return attributes
    ? { found: true, tableReference: /table/i.test(attributes) }
    : { found: false, tableReference: false };
};
const hashes = Object.fromEntries(await Promise.all([htmlPath, pdfPath, docxPath].map(async path => [
  path,
  createHash('sha256').update(Buffer.from(await Bun.file(path).arrayBuffer())).digest('hex')
])));

console.log(JSON.stringify({
  hashes,
  html: htmlCharts,
  pdf: {
    pages: pdf.numPages,
    titles,
    falseTableText: pdfText.includes('Data for Score by screening - false'),
    trueTableHeading: pdfText.includes('Illustrative score'),
    ordinaryRegister: pdfText.includes('Screening register')
  },
  docx: {
    wordTables: (documentXml.match(/<w:tbl>/g) ?? []).length,
    charts: Object.keys(archive.files).filter(name => /^word\/charts\/chart\d+\.xml$/.test(name)).length,
    trueCaption: documentXml.includes('Data for Score by screening - true'),
    expressionCaption: documentXml.includes('Data for Score by screening - expression'),
    falseCaption: documentXml.includes('Data for Score by screening - false'),
    omittedCaption: documentXml.includes('Data for Score by screening<'),
    omittedAlt: chartAlt('Score by screening'),
    falseAlt: chartAlt('Score by screening - false'),
    trueAlt: chartAlt('Score by screening - true'),
    expressionAlt: chartAlt('Score by screening - expression')
  }
}, null, 2));
