import {
  AlignmentType,
  Bookmark,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  InternalHyperlink,
  LevelFormat,
  Packer,
  Paragraph,
  Tab,
  TableLayoutType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IParagraphOptions,
  type IRunOptions,
  type INumberingOptions,
  type ParagraphChild,
  Footer
} from 'docx';
import { ChartRun, type ChartAxisGroup, type ChartPoint, type ChartSeries, type ScatterChartSeries } from 'docx/charts';
import { realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import type { ChartViewEmission, TableViewEmission, ViewDataValue, ViewEmission } from '../runtime/environment';
import { createChartViewModel, type ChartAxisModel, type ChartViewModel } from './chartModel';
import { fitNarrativeImage, type NarrativeBlock, type NarrativeImage, type NarrativeInline, type NarrativeLink } from './narrativeModel';
import type { PreparedReport } from './reportPreparation';

export interface PreparedDocxReport {
  document: Document;
}

export interface DocxExportContext {
  sourceDocumentPath: string;
  destinationPath: string;
}

interface NarrativeRenderContext {
  readonly exportContext?: DocxExportContext;
  readonly bookmarks: ReadonlyMap<string, string>;
  readonly numbering: Array<INumberingOptions['config'][number]>;
  readonly quoteDepth: number;
  readonly listDepth: number;
  readonly listItem?: ListItemState;
}

interface ListItemState {
  readonly reference: string;
  readonly level: number;
  readonly checked?: boolean;
  applied: boolean;
}

type NarrativeRunStyle = Pick<IRunOptions, 'bold' | 'italics' | 'strike' | 'font' | 'size' | 'shading' | 'color' | 'underline'>;

type DocxContent = Paragraph | Table;

const TABLE_WIDTH_TWIPS = 9_026;
// ChartRun uses 15 twips per CSS pixel; leave one pixel of page-width clearance.
const DOCX_CHART_WIDTH_PIXELS = Math.floor(TABLE_WIDTH_TWIPS / 15) - 1;
const IMAGE_WIDTH_PIXELS = 601;
const IMAGE_HEIGHT_PIXELS = 864;
const MAX_BOOKMARK_NAME_LENGTH = 40;

export function prepareDocxReport(report: PreparedReport, context?: DocxExportContext): PreparedDocxReport {
  return preparePreparedDocxReport(report, context);
}

export async function serializeDocxReport(report: PreparedDocxReport): Promise<Uint8Array> {
  return Uint8Array.from(await Packer.toBuffer(report.document));
}

function preparePreparedDocxReport(report: PreparedReport, exportContext?: DocxExportContext): PreparedDocxReport {
  const children: DocxContent[] = [];
  const identity = report.identity;
  if (identity.logo || identity.organization || identity.author || identity.status || identity.classification) {
    const runs: Array<TextRun | ImageRun> = [];
    if (identity.logo) runs.push(new ImageRun({ type: 'png', data: identity.logo.bytes, transformation: { width: 120, height: 48 }, altText: { title: identity.logo.alt, description: identity.logo.alt, name: 'Report logo' } }));
    const metadata = [identity.organization, identity.author && `Author: ${identity.author}`, identity.status && `Status: ${identity.status}`, identity.classification && `Classification: ${identity.classification}`].filter((value): value is string => Boolean(value));
    if (metadata.length > 0) runs.push(new TextRun({ text: `${runs.length ? '\n' : ''}${metadata.join('\n')}`, bold: true }));
    children.push(new Paragraph({ children: runs }));
  }
  const usedBookmarkNames = new Set<string>();
  const bookmarks = headingBookmarks(
    report.items.flatMap(item => item.type === 'narrative' ? item.markdown : []),
    usedBookmarkNames
  );
  const numbering: Array<INumberingOptions['config'][number]> = [];
  let nextListReference = 0;
  for (const item of report.items) {
    if (item.type === 'narrative') {
      const context: NarrativeRenderContext = {
        exportContext,
        bookmarks,
        numbering,
        quoteDepth: 0,
        listDepth: 0
      };
      children.push(...renderBlocks(item.markdown, context, () => `openamx-list-${nextListReference++}`));
    }
    else if (item.type === 'source') children.push(new Paragraph({ style: 'Normal', children: [new TextRun({ text: item.text, font: 'Courier New', size: 18 })] }));
    else addEmission(children, item.emission, identity);
  }
  return {
    document: new Document({
      title: report.title,
      creator: identity.author ?? 'OpenAMX',
      description: 'Editable OpenAMX report',
      numbering: numbering.length > 0 ? { config: numbering } : undefined,
      sections: [{ children, footers: identity.footer ? { default: new Footer({ children: [new Paragraph({ text: identity.footer })] }) } : undefined }]
    })
  };
}

function renderBlocks(
  blocks: readonly NarrativeBlock[],
  context: NarrativeRenderContext,
  nextListReference: () => string
): DocxContent[] {
  return blocks.flatMap(block => renderBlock(block, context, nextListReference));
}

function renderBlock(
  block: NarrativeBlock,
  context: NarrativeRenderContext,
  nextListReference: () => string
): DocxContent[] {
  if (block.type === 'heading') {
    const runs = inlineChildren(block.children, context);
    const bookmark = context.bookmarks.get(block.id);
    const children: ParagraphChild[] = bookmark ? [new Bookmark({ id: bookmark, children: runs })] : runs;
    return [new Paragraph(paragraphOptions(context, { heading: headingLevel(block.depth), children }))];
  }
  if (block.type === 'paragraph') {
    return [new Paragraph(paragraphOptions(context, { children: inlineChildren(block.children, context) }))];
  }
  if (block.type === 'code') {
    return [new Paragraph(paragraphOptions(context, {
      children: codeChildren(block.text),
      shading: { fill: 'F1F4F5' },
      indent: { left: 180, right: 180 },
      spacing: { before: 80, after: 80 }
    }))];
  }
  if (block.type === 'list') {
    const parentItem = context.listItem;
    const prefix = parentItem && !parentItem.applied ? [listMarkerParagraph(context)] : [];
    return [...prefix, ...renderList(block, {
      ...context,
      listItem: undefined,
      listDepth: context.listDepth + (parentItem ? 1 : 0)
    }, nextListReference)];
  }
  if (block.type === 'blockquote') {
    const nestedContext: NarrativeRenderContext = {
      ...context,
      quoteDepth: context.quoteDepth + 1,
      listItem: context.listItem
    };
    return renderBlocks(block.blocks, nestedContext, nextListReference);
  }
  if (block.type === 'table') {
    const widths = tableColumnWidths(block.header.length);
    const header = new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: block.header.map((cell, index) => narrativeTableCell(cell, context, widths[index], index, block.align, true))
    });
    const rows = block.rows.map(row => new TableRow({
      cantSplit: true,
      children: block.header.map((_headerCell, index) =>
        narrativeTableCell(row[index] ?? [], context, widths[index], index, block.align, false))
    }));
    const table = new Table({
      rows: [header, ...rows],
      width: { size: 200, type: WidthType.PERCENTAGE },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      margins: { top: 80, bottom: 80, left: 100, right: 100 }
    });
    if (context.listItem && !context.listItem.applied) {
      return [listMarkerParagraph(context), table];
    }
    return [table];
  }
  if (block.type === 'horizontalRule') {
    return [new Paragraph(paragraphOptions(context, {
      children: [new TextRun({ text: ' ' })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '8A969C', space: 1 } },
      spacing: { before: 120, after: 120 }
    }))];
  }
  return [new Paragraph(paragraphOptions(context, { children: [], includeIfEmpty: true, pageBreakBefore: true }))];
}

function paragraphOptions(
  context: NarrativeRenderContext,
  options: IParagraphOptions
): IParagraphOptions {
  const quoteIndent = context.quoteDepth * 360;
  const listItem = context.listItem;
  const listIndent = listItem ? (listItem.level + 1) * 720 : 0;
  const children = [...(options.children ?? [])];
  if (listItem && !listItem.applied) {
    if (listItem.checked !== undefined) {
      children.unshift(new TextRun({ text: listItem.checked ? '[x] ' : '[ ] ' }));
    }
    listItem.applied = true;
    return {
      ...options,
      children,
      numbering: { reference: listItem.reference, level: listItem.level },
      ...(quoteIndent > 0 ? { indent: { left: quoteIndent } } : {})
    };
  }
  if (listItem || quoteIndent > 0) {
    return {
      ...options,
      children,
      indent: { left: listIndent + quoteIndent }
    };
  }
  return { ...options, children };
}

function renderList(
  block: Extract<NarrativeBlock, { type: 'list' }>,
  context: NarrativeRenderContext,
  nextListReference: () => string
): DocxContent[] {
  const reference = nextListReference();
  const level = Math.min(context.listDepth, 8);
  context.numbering.push({
    reference,
    levels: Array.from({ length: 9 }, (_value, index) => ({
      level: index,
      format: block.ordered ? LevelFormat.DECIMAL : LevelFormat.BULLET,
      text: block.ordered ? `%${index + 1}.` : ['•', '◦', '▪'][index % 3],
      ...(block.ordered && index === level && block.start !== undefined ? { start: block.start } : {}),
      style: { paragraph: { indent: { left: (index + 1) * 720, hanging: 360 } } }
    }))
  });

  const output: DocxContent[] = [];
  for (const item of block.items) {
    const listItem: ListItemState = { reference, level, checked: item.checked, applied: false };
    const itemContext = { ...context, listItem };
    for (const child of item.blocks) {
      output.push(...renderBlock(child, itemContext, nextListReference));
    }
    if (!listItem.applied) output.push(listMarkerParagraph(itemContext));
  }
  return output;
}

function listMarkerParagraph(context: NarrativeRenderContext): Paragraph {
  return new Paragraph(paragraphOptions(context, { children: [], includeIfEmpty: true }));
}

function inlineChildren(
  inlines: readonly NarrativeInline[],
  context: NarrativeRenderContext,
  style: NarrativeRunStyle = {}
): ParagraphChild[] {
  const children: ParagraphChild[] = [];
  for (const inline of inlines) {
    if (inline.type === 'text') {
      if (inline.text) children.push(new TextRun({ text: inline.text, ...style }));
    } else if (inline.type === 'lineBreak') {
      children.push(new TextRun({ break: 1, ...style }));
    } else if (inline.type === 'inlineCode') {
      children.push(new TextRun({
        text: inline.text,
        font: 'Consolas',
        size: 18,
        shading: { fill: 'F1F4F5' },
        ...style
      }));
    } else if (inline.type === 'strong' || inline.type === 'emphasis' || inline.type === 'delete') {
      const nestedStyle = inline.type === 'strong'
        ? { ...style, bold: true }
        : inline.type === 'emphasis'
          ? { ...style, italics: true }
          : { ...style, strike: true };
      children.push(...inlineChildren(inline.children, context, nestedStyle));
    } else if (inline.type === 'link') {
      const linkChildren = inlineChildren(inline.children, context, { ...style, color: '0563C1', underline: {} });
      const link = inline.link;
      if (link.type === 'external') {
        children.push(new ExternalHyperlink({ link: link.href, children: linkChildren }));
      } else if (link.type === 'internal') {
        const anchor = context.bookmarks.get(link.targetId);
        if (anchor) children.push(new InternalHyperlink({ anchor, children: linkChildren }));
        else children.push(...linkChildren);
      } else {
        children.push(new ExternalHyperlink({ link: localLinkUri(link, context.exportContext), children: linkChildren }));
      }
    } else if (inline.type === 'image') {
      children.push(narrativeImageRun(inline.image));
    }
  }
  return children;
}

function codeChildren(text: string): ParagraphChild[] {
  const runs: ParagraphChild[] = [];
  const lines = text.split('\n');
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) runs.push(new TextRun({ break: 1, font: 'Consolas', size: 18 }));
    const pieces = line.split('\t');
    pieces.forEach((piece, pieceIndex) => {
      if (pieceIndex > 0) runs.push(new TextRun({ children: [new Tab()], font: 'Consolas', size: 18 }));
      if (piece) runs.push(new TextRun({ text: piece, font: 'Consolas', size: 18 }));
    });
  });
  return runs.length > 0 ? runs : [new TextRun({ text: '', font: 'Consolas', size: 18 })];
}

function narrativeImageRun(image: NarrativeImage): ImageRun {
  const dimensions = fitNarrativeImage(image, { maxWidth: IMAGE_WIDTH_PIXELS, maxHeight: IMAGE_HEIGHT_PIXELS });
  return new ImageRun({
    type: image.format === 'jpeg' ? 'jpg' : 'png',
    data: image.dataUri,
    transformation: dimensions,
    altText: { title: image.alt, description: image.alt, name: image.alt }
  });
}

function narrativeTableCell(
  inlines: readonly NarrativeInline[],
  context: NarrativeRenderContext,
  width: number,
  index: number,
  align: readonly (string | null)[],
  header: boolean
): TableCell {
  const children = inlineChildren(inlines, context, header ? { bold: true } : {});
  return new TableCell({
    children: [new Paragraph({
      children,
      alignment: tableAlignment(align[index])
    })],
    width: { size: width, type: WidthType.DXA },
    verticalAlign: 'center',
    ...(header ? { shading: { fill: 'E7EEE8' } } : {})
  });
}

function tableAlignment(align: string | null | undefined): typeof AlignmentType[keyof typeof AlignmentType] | undefined {
  if (align === 'center') return AlignmentType.CENTER;
  if (align === 'right') return AlignmentType.RIGHT;
  if (align === 'left') return AlignmentType.LEFT;
  return undefined;
}

function tableColumnWidths(count: number): number[] {
  if (count === 0) throw new Error('Narrative table must contain at least one column.');
  const width = Math.floor(TABLE_WIDTH_TWIPS / count);
  const remainder = TABLE_WIDTH_TWIPS - width * count;
  return Array.from({ length: count }, (_value, index) => width + (index === 0 ? remainder : 0));
}

function headingBookmarks(blocks: readonly NarrativeBlock[], usedNames: Set<string>): Map<string, string> {
  const bookmarks = new Map<string, string>();
  const visit = (items: readonly NarrativeBlock[]) => {
    for (const block of items) {
      if (block.type === 'heading') {
        if (!bookmarks.has(block.id)) bookmarks.set(block.id, uniqueBookmarkName(block.id, usedNames));
      } else if (block.type === 'blockquote') {
        visit(block.blocks);
      } else if (block.type === 'list') {
        for (const item of block.items) visit(item.blocks);
      }
    }
  };
  visit(blocks);
  return bookmarks;
}

function uniqueBookmarkName(id: string, usedNames: Set<string>): string {
  const normalized = `amx_${id.replace(/[^A-Za-z0-9_]/g, '_')}`.slice(0, MAX_BOOKMARK_NAME_LENGTH);
  let suffix = 0;
  let candidate = normalized || 'amx_section';
  while (usedNames.has(candidate)) {
    suffix++;
    const ending = `_${suffix}`;
    candidate = `${normalized.slice(0, MAX_BOOKMARK_NAME_LENGTH - ending.length)}${ending}`;
  }
  usedNames.add(candidate);
  return candidate;
}

function localLinkUri(
  link: Extract<NarrativeLink, { type: 'local' }>,
  context?: DocxExportContext
): string {
  if (!context) throw new Error('DOCX local links require validated source-document and final-destination context.');
  if (link.sourceBase !== 'document-directory') throw new Error('DOCX local link has an unsupported source base.');
  const sourceDirectory = realpathSync(dirname(resolve(context.sourceDocumentPath)));
  const outputDirectory = dirname(resolve(context.destinationPath));
  const sourceTarget = resolve(sourceDirectory, ...link.path.split('/'));
  const relativePath = relative(outputDirectory, sourceTarget);
  if (!relativePath || isAbsolute(relativePath)) throw new Error('DOCX local link target cannot be represented relative to the final DOCX destination.');
  const encodedPath = relativePath.split(sep).map(segment => encodeURIComponent(segment)).join('/');
  return `${encodedPath}${link.query === undefined ? '' : `?${link.query}`}${link.fragment === undefined ? '' : `#${link.fragment}`}`;
}

function addEmission(
  children: Array<Paragraph | Table>,
  emission: ViewEmission,
  identity: PreparedReport['identity']
): void {
  if (emission.kind === 'table') addTable(children, emission);
  else addChart(children, emission, identity);
}

function addTable(children: Array<Paragraph | Table>, emission: TableViewEmission): void {
  const title = emission.declaration.options.find(option => option.type === 'viewTitleOption');
  const columns = emission.declaration.options.filter(option => option.type === 'tableColumnOption');
  const caption = title?.type === 'viewTitleOption' ? title.value : emission.name;
  children.push(new Paragraph({ text: caption, heading: HeadingLevel.HEADING_2 }));
  const header = new TableRow({ children: columns.map(column => tableCell(column.label, true)) });
  const rows = emission.data.map(value => new TableRow({
    children: columns.map(column => tableCell(isRecord(value) ? valueToString(value[column.field]) : ''))
  }));
  children.push(new Table({ rows: [header, ...rows] }));
}

function addChart(
  children: Array<Paragraph | Table>,
  emission: ChartViewEmission,
  identity: PreparedReport['identity']
): void {
  const model = createChartViewModel(emission, identity);
  children.push(new Paragraph({ text: model.title, heading: HeadingLevel.HEADING_2 }));
  children.push(new Paragraph(model.description));

  if (model.plottedPointCount === 0) {
    addNoChartAlternative(children, model, 'Chart not shown: no plottable data.');
    return;
  }

  if (model.kind === 'scatter') {
    const chartSeries = scatterChartSeries(model);
    if (chartSeries.some(series => series.points.length === 0)) {
      addNoChartAlternative(children, model, 'Chart not shown: Word cannot represent a scatter group with no plottable points.');
      return;
    }
    const run = new ChartRun({
      type: 'scatter',
      title: chartTitle(model, identity.accent),
      altText: chartAltText(model),
      series: chartSeries,
      markers: true,
      lines: 'none',
      legend: chartSeries.length > 1 ? {} : false,
      xAxis: chartValueAxis(model.axes.find(axis => axis.role === 'x')),
      yAxis: chartValueAxis(model.axes.find(axis => axis.role === 'y')),
      transformation: docxChartDimensions(model)
    });
    children.push(new Paragraph({ children: [run] }));
    addChartTable(children, model);
    return;
  }

  if (model.kind === 'line' && numericXAxis(model)) {
    const plotted = numericLineScatterSeries(model);
    if (plotted.series.length === 0) {
      addNoChartAlternative(children, model, 'Chart not shown: no plottable data.');
      return;
    }
    const valueAxes = activeNumericLineAxes(model, plotted.activeAxisIds);
    if (valueAxes.length > 1) {
      addNoChartAlternative(children, model, 'Chart not shown: Word cannot represent all measurement axes without changing their meaning.');
      return;
    }
    const description = [
      ...plotted.omittedSeries.map(name => `Series "${name}" has no plottable coordinates and is listed only in the complete data table.`),
      ...(plotted.hasGaps ? ['Null gaps break the line; continued segments are hidden from the legend.'] : [])
    ];
    const run = new ChartRun({
      type: 'scatter',
      title: chartTitle(model, identity.accent),
      altText: chartAltText(model, description),
      series: plotted.series,
      markers: true,
      lines: 'straight',
      legend: model.series.length > 1
        ? { hiddenEntries: plotted.hiddenLegendEntries }
        : false,
      xAxis: chartValueAxis(model.axes.find(axis => axis.role === 'x')),
      yAxis: chartValueAxis(valueAxes[0]),
      transformation: docxChartDimensions(model)
    });
    children.push(new Paragraph({ children: [run] }));
    if (plotted.omittedSeries.length > 0) {
      children.push(new Paragraph(`Series with no plottable coordinates, shown only in the complete table: ${plotted.omittedSeries.join(', ')}.`));
    }
    addChartTable(children, model);
    return;
  }

  if (model.kind === 'line' && model.dateTimePresentation === 'UTC ISO 8601') {
    const plotted = dateTimeLineSeries(model);
    if (plotted.categories.length === 0 || !plotted.hasPlottablePoints) {
      addNoChartAlternative(children, model, 'Chart not shown: no plottable data.');
      return;
    }
    const valueAxes = model.axes.filter(axis => axis.role === 'y');
    if (valueAxes.length > 2) {
      addNoChartAlternative(children, model, 'Chart not shown: Word cannot represent all measurement axes without changing their meaning.');
      return;
    }
    const run = new ChartRun({
      type: 'line',
      title: chartTitle(model, identity.accent),
      altText: chartAltText(model, plotted.hasGaps ? ['DateTime rows with null x coordinates break the line; continued segments are hidden from the legend.'] : []),
      categories: plotted.categories,
      series: plotted.series,
      markers: true,
      emptyValues: 'gap',
      legend: model.series.length > 1 ? { hiddenEntries: plotted.hiddenLegendEntries } : false,
      valueAxis: chartValueAxis(valueAxes[0]),
      ...(valueAxes.length > 1 ? { secondaryValueAxis: chartValueAxis(valueAxes[1]) } : {}),
      transformation: docxChartDimensions(model)
    });
    children.push(new Paragraph({ children: [run] }));
    addChartTable(children, model);
    return;
  }

  const valueAxisRole = model.kind === 'bar' ? 'x' : 'y';
  const valueAxes = model.axes.filter(axis => axis.role === valueAxisRole);
  if (valueAxes.length > 2) {
    addNoChartAlternative(children, model, 'Chart not shown: Word cannot represent all measurement axes without changing their meaning.');
    return;
  }
  const categories = model.table.rows.map(row => chartCategory(row.values[0], model.dateTimePresentation === 'UTC ISO 8601'));
  const series: ChartSeries[] = model.series.map((item, seriesIndex) => {
    const axisIndex = valueAxes.findIndex(axis => axis.id === item.axisId);
    if (axisIndex < 0) throw new Error(`DOCX chart series "${item.name}" has no matching value axis.`);
    return {
      name: item.name,
      color: chartColorForDocx(item.color),
      values: model.table.rows.map(row => chartNumber(row.values[seriesIndex + 1])),
      ...(valueAxes.length > 1 ? { axis: axisIndex === 0 ? 'primary' : 'secondary' as ChartAxisGroup } : {}),
      ...(model.kind === 'line' ? { markers: true } : {})
    };
  });
  const run = new ChartRun({
    type: model.kind,
    title: chartTitle(model, identity.accent),
    altText: chartAltText(model),
    categories,
    series,
    legend: model.series.length > 1 ? {} : false,
    ...(model.kind === 'bar' ? { categoryAxis: { reverseOrder: true } } : {}),
    ...(model.kind === 'line' ? { emptyValues: 'gap' as const } : {}),
    valueAxis: chartValueAxis(valueAxes[0]),
    ...(valueAxes.length > 1 ? { secondaryValueAxis: chartValueAxis(valueAxes[1]) } : {}),
    transformation: docxChartDimensions(model)
  });
  children.push(new Paragraph({ children: [run] }));
  addChartTable(children, model);
}

function docxChartDimensions(model: ChartViewModel): { width: number; height: number } {
  const width = Math.min(model.dimensions.width, DOCX_CHART_WIDTH_PIXELS);
  return {
    width,
    height: Math.round(model.dimensions.height * width / model.dimensions.width)
  };
}

function addNoChartAlternative(
  children: Array<Paragraph | Table>,
  model: ChartViewModel,
  notice: string
): void {
  children.push(new Paragraph(notice));
  addChartTable(children, model);
}

function addChartTable(children: Array<Paragraph | Table>, model: ChartViewModel): void {
  const header = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: model.table.headings.map(heading => tableCell(heading, true))
  });
  const rows = model.table.rows.map(row => new TableRow({
    cantSplit: true,
    children: row.values.map(value => tableCell(valueToString(value)))
  }));
  children.push(new Paragraph({ text: model.table.caption, heading: HeadingLevel.HEADING_3 }));
  const columnCount = Math.max(1, model.table.headings.length);
  const baseColumnWidth = Math.floor(TABLE_WIDTH_TWIPS / columnCount);
  children.push(new Table({
    rows: [header, ...rows],
    width: { size: 200, type: WidthType.PERCENTAGE },
    columnWidths: model.table.headings.map((_heading, index) =>
      index === columnCount - 1 ? TABLE_WIDTH_TWIPS - baseColumnWidth * (columnCount - 1) : baseColumnWidth),
    layout: TableLayoutType.FIXED,
    margins: { top: 80, bottom: 80, left: 100, right: 100 }
  }));
}

function chartAltText(model: ChartViewModel, details: readonly string[] = []): { name: string; title: string; description: string } {
  return {
    name: model.accessibility.tableId,
    title: model.accessibility.title,
    description: [model.accessibility.description, model.accessibility.summary, ...details].join(' ')
  };
}

function chartTitle(model: ChartViewModel, accent: string): { text: string; font: { color: string } } {
  return { text: model.title, font: { color: chartColorForDocx(accent) } };
}

function chartValueAxis(axis: ChartAxisModel | undefined) {
  return axis?.name ? { title: axis.name } : undefined;
}

function chartCategory(value: ViewDataValue | undefined, dateTime: boolean): string | number | Date {
  if (dateTime) {
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw new Error('DOCX DateTime chart categories must contain valid date-time values.');
    }
    return new Date(value);
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  throw new Error('DOCX chart categories must be strings, numbers, or DateTime values.');
}

function chartNumber(value: ViewDataValue | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('DOCX chart values must be finite numbers or null.');
  }
  return value;
}

function chartColorForDocx(color: string): string {
  return color.replace(/^#/, '');
}

function numericXAxis(model: ChartViewModel): boolean {
  const axis = Array.isArray(model.option.xAxis) ? model.option.xAxis[0] : model.option.xAxis;
  return axis?.type === 'value';
}

function scatterChartSeries(model: ChartViewModel): ScatterChartSeries[] {
  const grouped = model.table.headings.length > 2;
  const indices = new Map<string, number>();
  const points = model.series.map(() => [] as ChartPoint[]);
  for (const row of model.table.rows) {
    const groupValue = grouped ? row.values[2] ?? null : null;
    const key = groupValue === null ? '__ungrouped__' : `${typeof groupValue}:${String(groupValue)}`;
    let index = indices.get(key);
    if (index === undefined) {
      index = indices.size;
      if (index >= points.length) throw new Error('DOCX scatter table groups do not match the chart model series.');
      indices.set(key, index);
    }
    const x = row.values[0];
    const y = row.values[1];
    if (x === null || y === null) continue;
    if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) {
      throw new Error('DOCX scatter coordinates must be finite numbers or null.');
    }
    points[index].push({ x, y });
  }
  return model.series.map((series, index) => ({
    name: series.name,
    color: chartColorForDocx(series.color),
    points: points[index]
  }));
}

interface NumericLineScatterSeries {
  readonly series: ScatterChartSeries[];
  readonly omittedSeries: string[];
  readonly hiddenLegendEntries: string[];
  readonly activeAxisIds: string[];
  readonly hasGaps: boolean;
}

function numericLineScatterSeries(model: ChartViewModel): NumericLineScatterSeries {
  const series: ScatterChartSeries[] = [];
  const omittedSeries: string[] = [];
  const hiddenLegendEntries: string[] = [];
  const activeAxisIds = new Set<string>();
  const occupiedNames = new Set(model.series.map(item => item.name));
  let hasGaps = false;

  for (let seriesIndex = 0; seriesIndex < model.series.length; seriesIndex++) {
    const item = model.series[seriesIndex];
    const segments: ChartPoint[][] = [];
    let current: ChartPoint[] = [];
    const finishSegment = (): void => {
      if (current.length > 0) segments.push(current);
      current = [];
    };

    for (const row of model.table.rows) {
      const x = row.values[0];
      const y = row.values[seriesIndex + 1];
      if (x === null || y === null) {
        if (current.length > 0) hasGaps = true;
        finishSegment();
        continue;
      }
      if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) {
        throw new Error('Numeric-X line chart coordinates must be finite numbers or null.');
      }
      current.push({ x, y });
    }
    finishSegment();

    if (segments.length === 0) {
      omittedSeries.push(item.name);
      continue;
    }
    if (item.axisId) activeAxisIds.add(item.axisId);

    segments.forEach((segment, segmentIndex) => {
      let name = item.name;
      if (segmentIndex > 0) {
        let suffix = segmentIndex + 1;
        name = `${item.name} (OpenAMX segment ${suffix})`;
        while (occupiedNames.has(name)) name = `${item.name} (OpenAMX segment ${++suffix})`;
        occupiedNames.add(name);
        hiddenLegendEntries.push(name);
      }
      series.push({
        name,
        color: chartColorForDocx(item.color),
        points: segment
      });
    });
  }
  return { series, omittedSeries, hiddenLegendEntries, activeAxisIds: [...activeAxisIds], hasGaps };
}

interface DateTimeLineSeries {
  readonly categories: Date[];
  readonly series: ChartSeries[];
  readonly hiddenLegendEntries: string[];
  readonly hasPlottablePoints: boolean;
  readonly hasGaps: boolean;
}

function dateTimeLineSeries(model: ChartViewModel): DateTimeLineSeries {
  const categories: Date[] = [];
  const rowCategoryIndices: Array<number | undefined> = [];
  for (const row of model.table.rows) {
    const value = row.values[0];
    if (value === null) {
      rowCategoryIndices.push(undefined);
      continue;
    }
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw new Error('DOCX DateTime chart categories must contain valid date-time values or null.');
    }
    rowCategoryIndices.push(categories.length);
    categories.push(new Date(value));
  }

  const series: ChartSeries[] = [];
  const hiddenLegendEntries: string[] = [];
  const occupiedNames = new Set(model.series.map(item => item.name));
  let hasPlottablePoints = false;
  let hasGaps = false;

  for (let seriesIndex = 0; seriesIndex < model.series.length; seriesIndex++) {
    const item = model.series[seriesIndex];
    const segments: Array<Array<number | null>> = [];
    let current = Array<number | null>(categories.length).fill(null);
    let hasCategory = false;
    const finishSegment = (): void => {
      if (hasCategory) segments.push(current);
      current = Array<number | null>(categories.length).fill(null);
      hasCategory = false;
    };
    for (let rowIndex = 0; rowIndex < model.table.rows.length; rowIndex++) {
      const categoryIndex = rowCategoryIndices[rowIndex];
      if (categoryIndex === undefined) {
        if (hasCategory) hasGaps = true;
        finishSegment();
        continue;
      }
      hasCategory = true;
      const value = chartNumber(model.table.rows[rowIndex].values[seriesIndex + 1]);
      current[categoryIndex] = value;
      if (value !== null) hasPlottablePoints = true;
    }
    finishSegment();
    if (segments.length === 0 && categories.length > 0) {
      segments.push(Array<number | null>(categories.length).fill(null));
    }
    segments.forEach((values, segmentIndex) => {
      let name = item.name;
      if (segmentIndex > 0) {
        let suffix = segmentIndex + 1;
        name = `${item.name} (OpenAMX segment ${suffix})`;
        while (occupiedNames.has(name)) name = `${item.name} (OpenAMX segment ${++suffix})`;
        occupiedNames.add(name);
        hiddenLegendEntries.push(name);
      }
      series.push({
        name,
        color: chartColorForDocx(item.color),
        values
      });
    });
  }
  return { categories, series, hiddenLegendEntries, hasPlottablePoints, hasGaps };
}

function activeNumericLineAxes(model: ChartViewModel, activeAxisIds: readonly string[]): ChartAxisModel[] {
  const activeIds = new Set(activeAxisIds);
  return model.axes.filter(axis => axis.role === 'y' && activeIds.has(axis.id));
}

function tableCell(value: string, bold = false): TableCell {
  return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: value, bold })] })] });
}

function headingLevel(level: number): typeof HeadingLevel[keyof typeof HeadingLevel] {
  return [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6][level - 1];
}

function isRecord(value: ViewDataValue): value is { readonly [field: string]: ViewDataValue } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return '(null)';
  if (Array.isArray(value)) return value.map(valueToString).join(', ');
  return String(value);
}