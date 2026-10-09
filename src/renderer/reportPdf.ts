import * as echarts from 'echarts';
import pdfmake from 'pdfmake';
import { existsSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ChartViewEmission, TableViewEmission, ViewDataValue, ViewEmission } from '../runtime/environment';
import { createChartViewModel, type ChartViewModel } from './chartModel';
import { fitNarrativeImage, type NarrativeBlock, type NarrativeImage, type NarrativeInline, type NarrativeLink } from './narrativeModel';
import type { PreparedReport } from './reportPreparation';

export interface PreparedPdfReport {
  definition: Record<string, unknown>;
}

export interface PdfExportContext {
  sourceDocumentPath: string;
  destinationPath: string;
}

type ChartRenderer = (model: ChartViewModel) => string;

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
  renderChartOrContext: ChartRenderer | PdfExportContext = renderStaticChart,
  context?: PdfExportContext
): PreparedPdfReport {
  const renderChart = typeof renderChartOrContext === 'function' ? renderChartOrContext : renderStaticChart;
  const exportContext = typeof renderChartOrContext === 'function' ? context : renderChartOrContext;
  return preparePreparedPdfReport(report, renderChart, exportContext);
}

export async function serializePdfReport(report: PreparedPdfReport): Promise<Uint8Array> {
  const pdf = pdfmake.createPdf(report.definition);
  const buffer = await pdf.getBuffer();
  return Uint8Array.from(buffer);
}

function preparePreparedPdfReport(
  report: PreparedReport,
  renderChart: ChartRenderer,
  context?: PdfExportContext
): PreparedPdfReport {
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
    if (item.type === 'narrative') addNarrativeBlocks(content, item.markdown, context);
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
        code: { font: 'Roboto', fontSize: 8, background: '#f1f4f5', margin: [0, 3, 0, 8] },
        blockquote: { color: '#405459', margin: [12, 2, 0, 8] },
        metadata: { fontSize: 9, color: '#18282D', margin: [0, 0, 0, 2] }
      },
      content
    }
  };
}

function addNarrativeBlocks(content: unknown[], blocks: readonly NarrativeBlock[], context?: PdfExportContext): void {
  for (const block of blocks) {
    if (block.type === 'heading') {
      content.push({
        text: inlineRuns(block.children, context),
        style: block.depth === 1 ? 'title' : 'heading',
        ...(block.depth > 1 ? { fontSize: Math.max(9, 16 - block.depth) } : {}),
        id: block.id
      });
    } else if (block.type === 'paragraph') {
      content.push({ text: inlineRuns(block.children, context), margin: [0, 0, 0, 7] });
    } else if (block.type === 'code') {
      content.push({ text: block.text, style: 'code', preserveLeadingSpaces: true });
    } else if (block.type === 'list') {
      const items = block.items.map(item => {
        const children: unknown[] = [];
        addNarrativeBlocks(children, item.blocks, context);
        if (item.checked !== undefined && children.length > 0) {
          const first = children[0];
          if (isPlainRecord(first) && Array.isArray(first.text)) {
            first.text = [{ text: item.checked ? '[x] ' : '[ ] ' }, ...first.text];
          } else if (isPlainRecord(first) && typeof first.text === 'string') {
            first.text = `${item.checked ? '[x] ' : '[ ] '}${first.text}`;
          }
        }
        return children.length === 1 ? children[0] : children;
      });
      content.push(block.ordered
        ? { ol: items, ...(block.start === undefined ? {} : { start: block.start }), margin: [0, 0, 0, 7] }
        : { ul: items, margin: [0, 0, 0, 7] });
    } else if (block.type === 'blockquote') {
      const quoted: unknown[] = [];
      addNarrativeBlocks(quoted, block.blocks, context);
      content.push({ stack: quoted, style: 'blockquote' });
    } else if (block.type === 'table') {
      const cell = (children: readonly NarrativeInline[], header: boolean, alignment: string | null) => ({
        text: inlineRuns(children, context),
        ...(header ? { bold: true, fillColor: '#e7eee8' } : {}),
        ...(alignment ? { alignment } : {})
      });
      content.push({
        table: {
          headerRows: 1,
          keepWithHeaderRows: 1,
          widths: block.header.map(() => '*'),
          body: [
            block.header.map((children, index) => cell(children, true, block.align[index])),
            ...block.rows.map(row => row.map((children, index) => cell(children, false, block.align[index])))
          ]
        },
        layout: 'lightHorizontalLines',
        fontSize: 8
      });
    } else if (block.type === 'horizontalRule') {
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 2, x2: 493, y2: 2, lineWidth: 0.5, lineColor: '#9AA8AC' }],
        margin: [0, 6, 0, 6]
      });
    } else {
      content.push({ text: '', pageBreak: 'before' });
    }
  }
}

interface InlineStyle {
  bold?: boolean;
  italics?: boolean;
  decoration?: string;
  background?: string;
  font?: string;
  link?: string;
  linkToDestination?: string;
}

function inlineRuns(
  inlines: readonly NarrativeInline[],
  context?: PdfExportContext,
  style: InlineStyle = {}
): unknown[] {
  const runs: unknown[] = [];
  for (const inline of inlines) {
    if (inline.type === 'text') {
      runs.push({ text: inline.text, ...style });
    } else if (inline.type === 'lineBreak') {
      runs.push({ text: '\n', ...style });
    } else if (inline.type === 'inlineCode') {
      runs.push({ text: inline.text, font: 'Roboto', background: '#f1f4f5', ...style });
    } else if (inline.type === 'strong' || inline.type === 'emphasis' || inline.type === 'delete') {
      const nestedStyle = inline.type === 'strong'
        ? { ...style, bold: true }
        : inline.type === 'emphasis'
          ? { ...style, italics: true }
          : { ...style, decoration: 'lineThrough' };
      runs.push(...inlineRuns(inline.children, context, nestedStyle));
    } else if (inline.type === 'link') {
      const linkStyle: InlineStyle = {
        ...style,
        ...(inline.link.type === 'external' ? { link: inline.link.href } : {}),
        ...(inline.link.type === 'internal' ? { linkToDestination: inline.link.targetId } : {}),
        ...(inline.link.type === 'local' ? { link: localLinkUri(inline.link, context) } : {})
      };
      runs.push(...inlineRuns(inline.children, context, linkStyle));
    } else if (inline.type === 'image') {
      runs.push(imageRun(inline.image, style));
    }
  }
  return runs;
}

function imageRun(image: NarrativeImage, style: InlineStyle): Record<string, unknown> {
  const dimensions = fitNarrativeImage(image, { maxWidth: 493, maxHeight: 739 });
  return {
    image: image.dataUri,
    width: dimensions.width,
    height: dimensions.height,
    alt: image.alt,
    ...style
  };
}

function localLinkUri(
  link: Extract<NarrativeLink, { type: 'local' }>,
  context?: PdfExportContext
): string {
  if (!context) throw new Error('PDF local links require validated source-document and final-destination context.');
  if (link.sourceBase !== 'document-directory') throw new Error('PDF local link has an unsupported source base.');
  const sourceDirectory = realpathSync(dirname(resolve(context.sourceDocumentPath)));
  const outputDirectory = dirname(resolve(context.destinationPath));
  const sourceTarget = resolve(sourceDirectory, ...link.path.split('/'));
  const relativePath = relative(outputDirectory, sourceTarget);
  if (!relativePath || isAbsolute(relativePath)) throw new Error('PDF local link target cannot be represented relative to the final PDF destination.');
  const encodedPath = relativePath.split(sep).map(segment => encodeURIComponent(segment)).join('/');
  return `${encodedPath}${link.query === undefined ? '' : `?${link.query}`}${link.fragment === undefined ? '' : `#${link.fragment}`}`;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
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