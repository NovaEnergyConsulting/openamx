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
import { realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import type { ChartViewEmission, TableViewEmission, ViewDataValue, ViewEmission } from '../runtime/environment';
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
    else addEmission(children, item.emission);
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

function addEmission(children: Array<Paragraph | Table>, emission: ViewEmission): void {
  if (emission.kind === 'table') addTable(children, emission);
  else addChart(children, emission);
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

function addChart(children: Array<Paragraph | Table>, emission: ChartViewEmission): void {
  const title = emission.declaration.options.find(option => option.type === 'viewTitleOption');
  const description = emission.declaration.options.find(option => option.type === 'viewDescriptionOption');
  const caption = title?.type === 'viewTitleOption' ? title.value : emission.name;
  const detail = description?.type === 'viewDescriptionOption' ? description.value : `${emission.kind} chart`;
  const rows = chartRows(emission);
  children.push(new Paragraph({ text: caption, heading: HeadingLevel.HEADING_2 }));
  children.push(new Paragraph(detail));
  if (rows.length > 0) {
    children.push(new Paragraph({
      children: [new ImageRun({
        type: 'svg',
        data: new TextEncoder().encode(chartSvg(rows)),
        transformation: { width: 480, height: 180 },
        fallback: { type: 'png', data: transparentPng }
      })]
    }));
  } else {
    children.push(new Paragraph('No data'));
  }
  const headings = emission.headings ? [...emission.headings] : emission.declaration.kind === 'scatter'
    ? ['x', 'y', 'group']
    : ['label', ...emission.declaration.options.filter(option => option.type === 'chartSeriesOption').map(option => option.label)];
  const tableRows = [
    new TableRow({ children: headings.map(heading => tableCell(heading, true)) }),
    ...rows.map(row => new TableRow({ children: row.map(value => tableCell(valueToString(value))) }))
  ];
  children.push(new Table({ rows: tableRows }));
}

function tableCell(value: string, bold = false): TableCell {
  return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: value, bold })] })] });
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

function chartSvg(rows: ViewDataValue[][]): string {
  const values = rows.flatMap(row => row.slice(1)).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const max = Math.max(1, ...values.map(value => Math.abs(value)));
  const bars = rows.flatMap((row, rowIndex) => row.slice(1).map((value, seriesIndex) => typeof value === 'number'
    ? `<rect x="${40 + rowIndex * 560 / Math.max(1, rows.length) + seriesIndex * 14}" y="${145 - value / max * 105}" width="12" height="${Math.max(0, value / max * 105)}" fill="${['#146c94', '#d97706', '#15803d'][seriesIndex % 3]}"/>`
    : '')).join('');
  return `<svg width="600" height="160" viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="145" x2="580" y2="145" stroke="#58675d"/>${bars}</svg>`;
}

const transparentPng = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));

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