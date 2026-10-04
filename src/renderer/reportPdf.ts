import pdfmake from 'pdfmake';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ChartViewEmission, TableViewEmission, ViewDataValue, ViewEmission } from '../runtime/environment';
import type { PreparedReport } from './reportPreparation';

export interface PreparedPdfReport {
  definition: Record<string, unknown>;
}

const packagedFontRoot = fileURLToPath(new URL('./pdfmake-fonts/', import.meta.url));
const fontRoot = existsSync(resolve(packagedFontRoot, 'Roboto-Regular.ttf'))
  ? packagedFontRoot
  : resolve(dirname(createRequire(import.meta.url).resolve('pdfmake')), '../fonts/Roboto');

pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy((filePath: string) => filePath.startsWith(fontRoot));
pdfmake.setFonts({
  Roboto: {
    normal: resolve(fontRoot, 'Roboto-Regular.ttf'),
    bold: resolve(fontRoot, 'Roboto-Medium.ttf'),
    italics: resolve(fontRoot, 'Roboto-Italic.ttf'),
    bolditalics: resolve(fontRoot, 'Roboto-MediumItalic.ttf')
  }
});

export function preparePdfReport(report: PreparedReport): PreparedPdfReport {
  return preparePreparedPdfReport(report);
}

export async function serializePdfReport(report: PreparedPdfReport): Promise<Uint8Array> {
  const pdf = pdfmake.createPdf(report.definition);
  const buffer = await pdf.getBuffer();
  return Uint8Array.from(buffer);
}

function preparePreparedPdfReport(report: PreparedReport): PreparedPdfReport {
  const content: unknown[] = [];
  const identity = report.identity;
  const metadata = [
    identity.organization,
    identity.author && `Author: ${identity.author}`,
    identity.status && `Status: ${identity.status}`,
    identity.classification && `Classification: ${identity.classification}`
  ].filter((value): value is string => Boolean(value));
  if (identity.logo || metadata.length > 0) {
    content.push({
      columns: [
        identity.logo ? { image: identity.logo.dataUri, fit: [120, 48], alt: identity.logo.alt } : {},
        { stack: metadata.map(text => ({ text, style: 'metadata' })) }
      ],
      columnGap: 12,
      margin: [0, 0, 0, 16]
    });
  }
  for (const item of report.items) {
    if (item.type === 'narrative') addNarrativeText(content, item.text);
    else if (item.type === 'source') content.push({ text: item.text, style: 'source' });
    else addEmission(content, item.emission);
  }
  return {
    definition: {
      info: { title: report.title, author: identity.author ?? 'OpenAMX' },
      pageSize: 'A4',
      pageMargins: [51, 51, 51, 51],
      defaultStyle: { font: 'Roboto', fontSize: 9, color: '#18282D' },
      footer: (currentPage: number, pageCount: number) => ({ text: [identity.footer, `${currentPage} / ${pageCount}`].filter(Boolean).join('  |  '), alignment: 'right', margin: [0, 0, 51, 24], fontSize: 8 }),
      styles: {
        title: { fontSize: 20, bold: true, color: identity.accent, margin: [0, 0, 0, 10] },
        heading: { fontSize: 14, bold: true, color: identity.accent, margin: [0, 14, 0, 6] },
        source: { font: 'Roboto', fontSize: 8, color: '#405459', margin: [0, 5, 0, 10] },
        caption: { fontSize: 8, color: '#405459', margin: [0, 3, 0, 6] },
        metadata: { fontSize: 9, color: '#18282D', margin: [0, 0, 0, 2] }
      },
      content
    }
  };
}

function addNarrativeText(content: unknown[], narrative: string): void {
  const lines = narrative.split(/\r?\n/);
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length > 0) content.push({ text: paragraph.join(' '), margin: [0, 0, 0, 7] });
    paragraph = [];
  };
  for (const line of lines) {
    if (line.trim() === '<!-- page-break -->') {
      flush();
      content.push({ text: '', pageBreak: 'before' });
    } else if (/^#{1,6}\s+/.test(line)) {
      flush();
      content.push({ text: line.replace(/^#{1,6}\s+/, ''), style: line.startsWith('# ') ? 'title' : 'heading' });
    } else if (line.trim() === '') {
      flush();
    } else {
      paragraph.push(line.trim());
    }
  }
  flush();
}

function addEmission(content: unknown[], emission: ViewEmission): void {
  if (emission.kind === 'table') addTable(content, emission);
  else addChart(content, emission);
}

function addTable(content: unknown[], emission: TableViewEmission): void {
  const title = emission.declaration.options.find(option => option.type === 'viewTitleOption');
  const columns = emission.declaration.options.filter(option => option.type === 'tableColumnOption');
  const caption = title?.type === 'viewTitleOption' ? title.value : emission.name;
  const body = [
    columns.map(column => ({ text: column.label, bold: true, fillColor: '#e7eee8' })),
    ...emission.data.map(value => columns.map(column => valueToString(isRecord(value) ? value[column.field] : null)))
  ];
  content.push({ text: caption, style: 'heading' });
  content.push({ table: { headerRows: 1, keepWithHeaderRows: 1, widths: columns.map(() => '*'), body }, layout: 'lightHorizontalLines', fontSize: 8 });
}

function addChart(content: unknown[], emission: ChartViewEmission): void {
  const title = emission.declaration.options.find(option => option.type === 'viewTitleOption');
  const description = emission.declaration.options.find(option => option.type === 'viewDescriptionOption');
  const caption = title?.type === 'viewTitleOption' ? title.value : emission.name;
  const detail = description?.type === 'viewDescriptionOption' ? description.value : `${emission.kind} chart`;
  const rows = chartRows(emission);
  content.push({ text: caption, style: 'heading' });
  content.push({ text: detail, style: 'caption' });
  if (rows.length > 0) content.push({ svg: chartSvg(rows), width: 470, height: 160 });
  content.push({ table: { headerRows: 1, widths: rows[0]?.map(() => '*') ?? ['*'], body: [chartHeadings(emission), ...rows.map(row => row.map(valueToString))] }, layout: 'lightHorizontalLines', fontSize: 8 });
}

function chartRows(emission: ChartViewEmission): ViewDataValue[][] {
  const options = emission.declaration.options;
  const category = options.find(option => option.type === 'chartFieldOption' && option.role === 'category');
  const x = options.find(option => option.type === 'chartFieldOption' && option.role === 'x');
  const y = options.find(option => option.type === 'chartFieldOption' && option.role === 'y');
  const group = options.find(option => option.type === 'chartFieldOption' && option.role === 'group');
  const series = options.filter(option => option.type === 'chartSeriesOption');
  const labels = emission.labels ?? emission.data.map((_value, index) => String(index + 1));
  return emission.data.map((value, index) => {
    if (isRecord(value)) {
      if (emission.declaration.kind === 'scatter') return [value[x?.type === 'chartFieldOption' ? x.field : 'x'], value[y?.type === 'chartFieldOption' ? y.field : 'y'], group?.type === 'chartFieldOption' ? value[group.field] : ''];
      return [category?.type === 'chartFieldOption' ? value[category.field] : labels[index], ...series.map(option => option.type === 'chartSeriesOption' && option.field ? value[option.field] : null)];
    }
    return [labels[index], value];
  });
}

function chartHeadings(emission: ChartViewEmission): string[] {
  if (emission.declaration.kind === 'scatter') return ['x', 'y', 'group'];
  return ['label', ...emission.declaration.options.filter(option => option.type === 'chartSeriesOption').map(option => option.label)];
}

function chartSvg(rows: ViewDataValue[][]): string {
  const values = rows.flatMap(row => row.slice(1)).filter((value): value is number => typeof value === 'number');
  const max = Math.max(1, ...values.map(value => Math.abs(value)));
  const bars = rows.flatMap((row, rowIndex) => row.slice(1).map((value, seriesIndex) => typeof value === 'number'
    ? `<rect x="${40 + rowIndex * 560 / Math.max(1, rows.length) + seriesIndex * 14}" y="${145 - value / max * 105}" width="12" height="${Math.max(0, value / max * 105)}" fill="${['#146c94', '#d97706', '#15803d'][seriesIndex % 3]}"/>`
    : '')).join('');
  return `<svg width="600" height="160" viewBox="0 0 600 160"><line x1="40" y1="145" x2="580" y2="145" stroke="#58675d"/>${bars}</svg>`;
}

function isRecord(value: ViewDataValue): value is { readonly [field: string]: ViewDataValue } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(valueToString).join(', ');
  return String(value);
}