import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  Footer
} from 'docx';
import type { ChartViewEmission, TableViewEmission, ViewDataValue, ViewEmission } from '../runtime/environment';
import type { PreparedReport } from './reportPreparation';

export interface PreparedDocxReport {
  document: Document;
}

export function prepareDocxReport(report: PreparedReport): PreparedDocxReport {
  return preparePreparedDocxReport(report);
}

export async function serializeDocxReport(report: PreparedDocxReport): Promise<Uint8Array> {
  return Uint8Array.from(await Packer.toBuffer(report.document));
}

function preparePreparedDocxReport(report: PreparedReport): PreparedDocxReport {
  const children: Array<Paragraph | Table> = [];
  const identity = report.identity;
  if (identity.logo || identity.organization || identity.author || identity.status || identity.classification) {
    const runs: Array<TextRun | ImageRun> = [];
    if (identity.logo) runs.push(new ImageRun({ type: 'png', data: identity.logo.bytes, transformation: { width: 120, height: 48 }, altText: { title: identity.logo.alt, description: identity.logo.alt, name: 'Report logo' } }));
    const metadata = [identity.organization, identity.author && `Author: ${identity.author}`, identity.status && `Status: ${identity.status}`, identity.classification && `Classification: ${identity.classification}`].filter((value): value is string => Boolean(value));
    if (metadata.length > 0) runs.push(new TextRun({ text: `${runs.length ? '\n' : ''}${metadata.join('\n')}`, bold: true }));
    children.push(new Paragraph({ children: runs }));
  }
  for (const item of report.items) {
    if (item.type === 'narrative') addNarrativeText(children, item.text);
    else if (item.type === 'source') children.push(new Paragraph({ style: 'Normal', children: [new TextRun({ text: item.text, font: 'Courier New', size: 18 })] }));
    else addEmission(children, item.emission);
  }
  return {
    document: new Document({
      title: report.title,
      creator: identity.author ?? 'OpenAMX',
      description: 'Editable OpenAMX report',
      sections: [{ children, footers: identity.footer ? { default: new Footer({ children: [new Paragraph({ text: identity.footer })] }) } : undefined }]
    })
  };
}

function addNarrativeText(children: Array<Paragraph | Table>, narrative: string): void {
  let paragraphLines: string[] = [];
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      children.push(new Paragraph(paragraphLines.join(' ')));
      paragraphLines = [];
    }
  };

  for (const line of narrative.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '<!-- page-break -->') {
      flushParagraph();
      children.push(new Paragraph({ text: '', pageBreakBefore: true }));
    } else if (/^#{1,6}\s+/.test(trimmed)) {
      flushParagraph();
      const level = Math.min(6, (trimmed.match(/^#+/) ?? ['#'])[0].length);
      children.push(new Paragraph({
        text: trimmed.replace(/^#+\s+/, ''),
        heading: headingLevel(level)
      }));
    } else if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      children.push(new Paragraph({
        text: trimmed.replace(/^[-*]\s+/, ''),
        bullet: { level: 0 }
      }));
    } else if (trimmed === '') {
      flushParagraph();
    } else {
      paragraphLines.push(line.trim());
    }
  }
  flushParagraph();
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