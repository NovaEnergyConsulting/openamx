import pdfmake from 'pdfmake';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { OpenAmxDocument } from '../ast/types';
import type { ChartViewEmission, TableViewEmission, ViewDataValue, ViewEmission } from '../runtime/environment';
import type { Environment } from '../runtime/environment';
import { formatAmx } from '../formatter/formatAmx';
import { parseExpression } from '../parser/parseExpression';
import { evaluateExpression } from '../runtime/evaluateExpression';

export interface PdfReportOptions {
  title?: string;
  author?: string;
}

export interface PreparedPdfReport {
  definition: Record<string, unknown>;
}

const fontRoot = resolve(dirname(createRequire(import.meta.url).resolve('pdfmake')), '../fonts/Roboto');

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

export function preparePdfReport(doc: OpenAmxDocument, env: Environment, options: PdfReportOptions = {}): PreparedPdfReport {
  const content: unknown[] = [];
  const emissionsByNode = new Map<number, ViewEmission[]>();
  for (const emission of env.viewEmissions) {
    const emissions = emissionsByNode.get(emission.documentNodeIndex) ?? [];
    emissions.push(emission);
    emissionsByNode.set(emission.documentNodeIndex, emissions);
  }

  for (const [nodeIndex, node] of doc.nodes.entries()) {
    if (node.type === 'narrative') {
      addNarrative(content, node.content, env);
    } else if (node.type === 'executableCodeBlock') {
      content.push({ text: formatAmx(node.content), style: 'source' });
      for (const emission of emissionsByNode.get(nodeIndex) ?? []) addEmission(content, emission);
    }
  }

  const metadata = doc.metadata as Record<string, unknown> | undefined;
  const title = options.title ?? (typeof metadata?.title === 'string' ? metadata.title : 'OpenAMX Document');
  return {
    definition: {
      info: { title, author: options.author ?? 'OpenAMX' },
      pageSize: 'A4',
      pageMargins: [51, 51, 51, 51],
      defaultStyle: { font: 'Roboto', fontSize: 9, color: '#202a27' },
      footer: (currentPage: number, pageCount: number) => ({ text: `${currentPage} / ${pageCount}`, alignment: 'right', margin: [0, 0, 51, 24], fontSize: 8 }),
      styles: {
        title: { fontSize: 20, bold: true, color: '#174e37', margin: [0, 0, 0, 10] },
        heading: { fontSize: 14, bold: true, color: '#174e37', margin: [0, 14, 0, 6] },
        source: { font: 'Roboto', fontSize: 8, color: '#37413d', margin: [0, 5, 0, 10] },
        caption: { fontSize: 8, color: '#66736c', margin: [0, 3, 0, 6] }
      },
      content
    }
  };
}

export async function serializePdfReport(report: PreparedPdfReport): Promise<Uint8Array> {
  const pdf = pdfmake.createPdf(report.definition);
  const buffer = await pdf.getBuffer();
  return Uint8Array.from(buffer);
}

function addNarrative(content: unknown[], narrative: string, env: Environment): void {
  const lines = substituteInlines(narrative, env).split(/\r?\n/);
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

function substituteInlines(content: string, env: Environment): string {
  return content.replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, (_full, expression: string) => {
    if (!expression.trim()) return '';
    const value = evaluateExpression(parseExpression(expression.trim()), env);
    return valueToString(value);
  });
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