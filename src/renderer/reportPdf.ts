import * as echarts from 'echarts';
import pdfmake from 'pdfmake';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ChartViewEmission, TableViewEmission, ViewDataValue, ViewEmission } from '../runtime/environment';
import { createChartViewModel, type ChartViewModel } from './chartModel';
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

export function preparePdfReport(
  report: PreparedReport,
  renderChart: (model: ChartViewModel) => string = renderStaticChart
): PreparedPdfReport {
  return preparePreparedPdfReport(report, renderChart);
}

export async function serializePdfReport(report: PreparedPdfReport): Promise<Uint8Array> {
  const pdf = pdfmake.createPdf(report.definition);
  const buffer = await pdf.getBuffer();
  return Uint8Array.from(buffer);
}

function preparePreparedPdfReport(report: PreparedReport, renderChart: (model: ChartViewModel) => string): PreparedPdfReport {
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
    else addEmission(content, item.emission, identity, renderChart);
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

function addEmission(
  content: unknown[],
  emission: ViewEmission,
  identity: PreparedReport['identity'],
  renderChart: (model: ChartViewModel) => string
): void {
  if (emission.kind === 'table') addTable(content, emission);
  else addChart(content, emission, identity, renderChart);
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

function addChart(
  content: unknown[],
  emission: ChartViewEmission,
  identity: PreparedReport['identity'],
  renderChart: (model: ChartViewModel) => string
): void {
  const model = createChartViewModel(emission, identity);
  content.push({
    stack: [
      { text: model.title, style: 'heading' },
      { text: model.description, style: 'caption' },
      { svg: renderChart(model), width: 470 }
    ],
    unbreakable: true
  });
  content.push({
    table: {
      headerRows: 1,
      widths: model.table.headings.map(() => '*'),
      body: [
        model.table.headings.map(text => ({ text, bold: true, fillColor: '#e7eee8' })),
        ...model.table.rows.map(row => row.values.map(valueToString))
      ]
    },
    layout: 'lightHorizontalLines',
    fontSize: 8
  });
}

function renderStaticChart(model: ChartViewModel): string {
  const chart = echarts.init(null, undefined, {
    renderer: 'svg',
    ssr: true,
    width: model.dimensions.width,
    height: model.dimensions.height
  });
  try {
    const tooltip = model.option.tooltip;
    chart.setOption({
      ...model.option,
      animation: false,
      title: { ...model.option.title, show: false },
      xAxis: centerNamedAxis(model.option.xAxis, model.emptyState !== undefined),
      yAxis: centerNamedAxis(model.option.yAxis, model.emptyState !== undefined),
      tooltip: Array.isArray(tooltip)
        ? tooltip.map(item => ({ ...item, show: false }))
        : { ...tooltip, show: false }
    });
    const svg = chart.renderToSVGString();
    assertSupportedSvg(svg);
    return svg;
  } finally {
    chart.dispose();
  }
}

function centerNamedAxis(axis: unknown, hide: boolean): unknown {
  const adjust = (item: unknown) => {
    if (item === null || typeof item !== 'object') return item;
    const named = 'name' in item && typeof item.name === 'string'
      ? { ...item, nameLocation: 'middle' }
      : { ...item };
    if (!hide) return named;
    return {
      ...named,
      show: false,
      axisLine: { ...('axisLine' in named && named.axisLine && typeof named.axisLine === 'object' ? named.axisLine : {}), show: false }
    };
  };
  return Array.isArray(axis) ? axis.map(adjust) : adjust(axis);
}

function assertSupportedSvg(svg: string): void {
  const supportedElements = new Set(['svg', 'g', 'path', 'rect', 'circle', 'text', 'defs', 'clipPath', 'style']);
  const elements = [...svg.matchAll(/<([A-Za-z][A-Za-z0-9:-]*)\b/g)].map(match => match[1]);
  const unsupported = [...new Set(elements.filter(element => !supportedElements.has(element)))];
  if (!svg.startsWith('<svg') || unsupported.length > 0) {
    throw new Error(`ECharts PDF SVG uses unsupported output${unsupported.length ? `: ${unsupported.join(', ')}` : ''}`);
  }
}

function isRecord(value: ViewDataValue): value is { readonly [field: string]: ViewDataValue } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(valueToString).join(', ');
  return String(value);
}