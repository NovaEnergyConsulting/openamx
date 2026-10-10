/// <reference path="../types/echarts-runtime.d.ts" />
import { randomBytes } from 'node:crypto';
import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import echartsBrowserRuntime from 'echarts/dist/echarts.min.js' with { type: 'text' };
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { EChartsOption } from 'echarts';
import { OpenAmxDocument } from '../ast/types';
import { AmxError } from '../diagnostics/errors';
import { parseExpression } from '../parser/parseExpression';
import { evaluateExpression } from '../runtime/evaluateExpression';
import { evaluateDocumentEnvironment } from '../runtime/evaluateDocument';
import { Environment } from '../runtime/environment';
import type { ViewDataValue, ViewEmission, TableViewEmission, ChartViewEmission } from '../runtime/environment';
import { formatAmx } from '../formatter/formatAmx';
import { createChartViewModel, type ChartViewModel } from './chartModel';
import { fitNarrativeImage, type NarrativeBlock, type NarrativeImage, type NarrativeInline, type NarrativeLink } from './narrativeModel';
import { hasSymlink, isContained } from './reportPaths';
import type { PreparedReport } from './reportPreparation';

const REPORT_MARKDOWN_POLICY: sanitizeHtml.IOptions = {
  allowedTags: [
    'a', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul'
  ],
  allowedAttributes: { code: ['class'] },
  allowedSchemes: [],
  allowProtocolRelative: false,
  parseStyleAttributes: false,
  disallowedTagsMode: 'discard',
  enforceHtmlBoundary: true,
  transformTags: { a: sanitizeHtml.simpleTransform('span', {}, true) }
};

export interface ReportIdentityOptions {
  report?: Record<string, unknown>;
  projectRoot?: string;
}

export interface ResolvedReportIdentity {
  organization?: string;
  logo?: string;
  logoAlt?: string;
  accent?: string;
  author?: string;
  status?: string;
  classification?: string;
  footer?: string;
  sourceVisible: boolean;
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface BrowserChartModel {
  kind: ChartViewModel['kind'];
  title: string;
  description: string;
  dimensions: ChartViewModel['dimensions'];
  option: JsonValue;
  formatterPaths: string[];
  table: ChartViewModel['table'];
  series: ChartViewModel['series'];
  axes: ChartViewModel['axes'];
  accessibility: ChartViewModel['accessibility'];
  plottedPointCount: number;
  emptyState?: ChartViewModel['emptyState'];
  dateTimePresentation?: ChartViewModel['dateTimePresentation'];
  zoomable: boolean;
}

export type PreviewNavigationTarget =
  | { readonly kind: 'external'; readonly href: string }
  | { readonly kind: 'local'; readonly path: string };

export interface StandaloneHtmlOptions {
  readonly mode?: 'standalone';
  readonly sourceDocumentPath?: string;
  readonly projectRoot?: string;
  readonly outputPath?: string;
}

export interface PreviewHtmlOptions {
  readonly mode: 'preview';
}

export interface RenderedPreviewHtml {
  readonly html: string;
  readonly previewToken: string;
  readonly targets: Readonly<Record<string, PreviewNavigationTarget>>;
}

interface NarrativeHtmlContext {
  readonly mode: 'standalone' | 'preview';
  readonly sourceDocumentPath?: string;
  readonly projectRoot?: string;
  readonly outputPath?: string;
  readonly previewToken?: string;
  readonly targets: Record<string, PreviewNavigationTarget>;
}

/**
 * Render an OpenAmxDocument to a complete standalone HTML5 document.
 *
 * - Executes all executable blocks once before rendering any document nodes.
 * - Resolves narrative expressions against the final shared environment.
 * - Post-substitution narrative is rendered with marked (headings, paragraphs, bullets).
 * - Executable blocks are rendered as escaped, formatted source at their source position.
 * - Frontmatter metadata.title (if string) is used for <title>; otherwise "OpenAMX Document".
 * - Output is deterministic for the supported Markdown subset.
 * - Errors inside {{ }} (e.g. AMX1004) are surfaced with the same AmxError semantics.
 */
export function renderHtml(doc: OpenAmxDocument, file?: string, env?: Environment, options?: ReportIdentityOptions): string {
  const environment = env ?? evaluateDocumentEnvironment(doc, file);
  const resolvedReport = resolveReportIdentity(doc, options?.report);
  const emissionsByNode = new Map<number, ViewEmission[]>();
  for (const emission of environment.viewEmissions) {
    const emissions = emissionsByNode.get(emission.documentNodeIndex) ?? [];
    emissions.push(emission);
    emissionsByNode.set(emission.documentNodeIndex, emissions);
  }

  const bodyFragments: string[] = [];
  const sourceVisible = resolvedReport.sourceVisible !== false;
  const header = renderReportHeader(resolvedReport, file);

  if (header) {
    bodyFragments.push(header);
  }

  for (const [nodeIndex, node] of doc.nodes.entries()) {
    if (node.type === 'narrative') {
      const substituted = substituteInlines(node.content, environment, file, node.source?.line);
      const htmlFragment = renderSafeMarkdown(substituted);
      bodyFragments.push(htmlFragment);
    } else if (node.type === 'executableCodeBlock') {
      if (sourceVisible) {
        const formatted = formatAmx(node.content);
        bodyFragments.push(`<pre><code class="language-amx">${escapeHtml(formatted)}</code></pre>`);
      }
      for (const emission of emissionsByNode.get(nodeIndex) ?? []) {
        bodyFragments.push(renderViewEmission(emission, resolvedReport));
      }
    }
  }

  const title =
    doc.metadata && typeof (doc.metadata as Record<string, unknown>).title === 'string'
      ? String((doc.metadata as Record<string, unknown>).title)
      : 'OpenAMX Document';

  const bodyHtml = bodyFragments.join('');
  const escapedTitle = escapeHtml(title);
  const hasViews = environment.viewEmissions.length > 0;
  const nonce = hasViews || !!resolvedReport.accent ? randomBytes(18).toString('base64') : '';
  const accentStyle = safeAccentStyle(resolvedReport.accent, nonce);
  const viewAssets = hasViews ? renderViewAssets(nonce) : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  ${renderContentSecurityPolicy(nonce, hasViews)}
  <title>${escapedTitle}</title>${accentStyle ? `\n${accentStyle}` : ''}${viewAssets ? `\n${viewAssets}` : ''}
</head>
<body>
${bodyHtml}</body>
</html>`;
}

export function renderPreparedHtml(report: PreparedReport, options?: StandaloneHtmlOptions): string;
export function renderPreparedHtml(report: PreparedReport, options: PreviewHtmlOptions): RenderedPreviewHtml;
export function renderPreparedHtml(report: PreparedReport, options: StandaloneHtmlOptions | PreviewHtmlOptions = {}): string | RenderedPreviewHtml {
  const isPreview = options.mode === 'preview';
  const previewToken = isPreview ? randomBytes(32).toString('hex') : undefined;
  const context: NarrativeHtmlContext = {
    mode: isPreview ? 'preview' : 'standalone',
    ...(previewToken ? { previewToken } : {}),
    ...(!isPreview && options.sourceDocumentPath ? { sourceDocumentPath: options.sourceDocumentPath } : {}),
    ...(!isPreview && options.projectRoot ? { projectRoot: options.projectRoot } : {}),
    ...(!isPreview && options.outputPath ? { outputPath: options.outputPath } : {}),
    targets: {}
  };
  const bodyFragments: string[] = [];
  const identity = report.identity;
  const metadata = [
    identity.organization,
    identity.author && `Author: ${identity.author}`,
    identity.status && `Status: ${identity.status}`,
    identity.classification && `Classification: ${identity.classification}`
  ].filter((value): value is string => Boolean(value));
  if (identity.logo || metadata.length > 0) {
    const logo = identity.logo ? `<img class="openamx-report-logo" src="${escapeHtml(identity.logo.dataUri)}" alt="${escapeHtml(identity.logo.alt)}" />` : '';
    bodyFragments.push(`<header class="openamx-report-header"><div class="openamx-report-identity">${logo}<div class="openamx-report-meta">${metadata.map(value => `<div class="openamx-report-attr">${escapeHtml(value)}</div>`).join('')}</div></div></header>`);
  }
  for (const item of report.items) {
    if (item.type === 'narrative') bodyFragments.push(renderNarrativeBlocks(item.markdown, context));
    else if (item.type === 'source') bodyFragments.push(`<pre><code class="language-amx">${escapeHtml(item.text)}</code></pre>`);
    else bodyFragments.push(renderViewEmission(item.emission, identity));
  }
  if (identity.footer) bodyFragments.push(`<footer class="openamx-report-footer">${escapeHtml(identity.footer)}</footer>`);
  const hasViews = report.items.some(item => item.type === 'view');
  const hasNarrativeAssets = report.items.some(item => item.type === 'narrative' && hasHtmlAssets(item.markdown));
  const nonce = hasViews || identity.accent !== '#146C94' || hasNarrativeAssets || isPreview ? randomBytes(18).toString('base64') : '';
  const accentStyle = safeAccentStyle(identity.accent, nonce);
  const viewAssets = hasViews ? renderViewAssets(nonce) : '';
  const narrativeAssets = hasNarrativeAssets ? renderNarrativeAssets(nonce) : '';
  const previewNavigation = previewToken ? renderPreviewNavigationBootstrap(nonce, previewToken) : '';
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  ${renderContentSecurityPolicy(nonce, hasViews, isPreview)}
  <title>${escapeHtml(report.title)}</title>${accentStyle ? `\n${accentStyle}` : ''}${narrativeAssets ? `\n${narrativeAssets}` : ''}${viewAssets ? `\n${viewAssets}` : ''}${previewNavigation ? `\n${previewNavigation}` : ''}
</head>
<body>
${bodyFragments.join('')}</body>
</html>`;
  if (previewToken) return { html, previewToken, targets: context.targets };
  return html;
}

function renderNarrativeBlocks(blocks: readonly NarrativeBlock[], context: NarrativeHtmlContext): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        return `<h${block.depth} id="${escapeHtml(block.id)}">${renderNarrativeInlines(block.children, context)}</h${block.depth}>`;
      case 'paragraph':
        return `<p>${renderNarrativeInlines(block.children, context)}</p>`;
      case 'code':
        return `<pre><code${block.language ? ` class="language-${escapeHtml(block.language)}"` : ''}>${escapeHtml(block.text)}</code></pre>`;
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul';
        const start = block.ordered && block.start !== undefined && block.start !== 1 ? ` start="${block.start}"` : '';
        return `<${tag}${start}>${block.items.map(item => `<li>${renderNarrativeBlocks(item.blocks, context)}</li>`).join('')}</${tag}>`;
      }
      case 'blockquote':
        return `<blockquote>${renderNarrativeBlocks(block.blocks, context)}</blockquote>`;
      case 'table':
        return `<table class="openamx-narrative-table"><thead><tr>${block.header.map((cell, index) => `<th scope="col"${tableCellAlignment(block.align[index])}>${renderNarrativeInlines(cell, context)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map((cell, index) => `<td${tableCellAlignment(block.align[index])}>${renderNarrativeInlines(cell, context)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'horizontalRule':
        return '<hr>';
      case 'pageBreak':
        return '<div class="openamx-page-break" aria-hidden="true"></div>';
    }
  }).join('');
}

function tableCellAlignment(alignment: string | null | undefined): string {
  return alignment === 'left' || alignment === 'center' || alignment === 'right' ? ` align="${alignment}"` : '';
}

function renderNarrativeInlines(inlines: readonly NarrativeInline[], context: NarrativeHtmlContext): string {
  return inlines.map(inline => {
    switch (inline.type) {
      case 'text': return escapeHtml(inline.text);
      case 'lineBreak': return '<br>';
      case 'strong': return `<strong>${renderNarrativeInlines(inline.children, context)}</strong>`;
      case 'emphasis': return `<em>${renderNarrativeInlines(inline.children, context)}</em>`;
      case 'delete': return `<del>${renderNarrativeInlines(inline.children, context)}</del>`;
      case 'inlineCode': return `<code>${escapeHtml(inline.text)}</code>`;
      case 'image': return renderNarrativeImage(inline.image, inline.title);
      case 'link': return renderNarrativeLink(inline.link, inline.children, context);
    }
  }).join('');
}

function renderNarrativeImage(image: NarrativeImage, title: string | undefined): string {
  const dimensions = fitNarrativeImage(image, { maxWidth: 1024, maxHeight: 768 });
  return `<img class="openamx-narrative-image" src="${escapeHtml(image.dataUri)}" alt="${escapeHtml(image.alt)}" width="${Math.round(dimensions.width)}" height="${Math.round(dimensions.height)}"${title === undefined ? '' : ` title="${escapeHtml(title)}"`}>`;
}

function renderNarrativeLink(link: NarrativeLink, children: readonly NarrativeInline[], context: NarrativeHtmlContext): string {
  const label = renderNarrativeInlines(children, context);
  const title = link.title === undefined ? '' : ` title="${escapeHtml(link.title)}"`;
  if (link.type === 'internal') return `<a href="#${encodeURIComponent(link.targetId)}"${title}>${label}</a>`;
  if (context.mode === 'preview') {
    const targetId = addPreviewTarget(context, link);
    return `<a href="#" data-openamx-target="${targetId}"${title}>${label}</a>`;
  }
  if (link.type === 'external') return `<a href="${escapeHtml(link.href)}" rel="noopener noreferrer"${title}>${label}</a>`;
  return `<a href="${escapeHtml(standaloneLocalLinkUri(link, context))}"${title}>${label}</a>`;
}

function addPreviewTarget(context: NarrativeHtmlContext, link: Exclude<NarrativeLink, { type: 'internal' }>): string {
  let targetId: string;
  do targetId = randomBytes(16).toString('hex');
  while (context.targets[targetId]);
  context.targets[targetId] = link.type === 'external'
    ? { kind: 'external', href: link.href }
    : { kind: 'local', path: link.path };
  return targetId;
}

function standaloneLocalLinkUri(
  link: Extract<NarrativeLink, { type: 'local' }>,
  context: NarrativeHtmlContext
): string {
  if (!context.sourceDocumentPath || !context.outputPath || link.sourceBase !== 'document-directory') {
    throw new Error('Standalone HTML local links require source-document and final-output path context.');
  }
  const sourceDirectory = realpathSync(dirname(resolve(context.sourceDocumentPath)));
  const sourceRoot = context.projectRoot ? realpathSync(context.projectRoot) : sourceDirectory;
  if (sourceDirectory !== sourceRoot && !isContained(sourceRoot, sourceDirectory)) {
    throw new Error('HTML source document is outside the permitted project root.');
  }
  const sourceTarget = resolve(sourceDirectory, ...link.path.split('/'));
  if (!isContained(sourceRoot, sourceTarget) || hasSymlink(sourceRoot, sourceTarget)
    || !existsSync(sourceTarget) || !lstatSync(sourceTarget).isFile()) {
    throw new Error('HTML local link target is no longer a contained regular file.');
  }
  const canonicalTarget = realpathSync(sourceTarget);
  if (!isContained(sourceRoot, canonicalTarget)) throw new Error('HTML local link target is outside the permitted project root.');
  const outputDirectory = realpathSync(dirname(resolve(context.outputPath)));
  const relativePath = relative(outputDirectory, canonicalTarget);
  if (!relativePath || isAbsolute(relativePath)) throw new Error('HTML local link target cannot be represented relative to the final HTML destination.');
  const encodedPath = relativePath.split(sep).map(segment => encodeURIComponent(segment)).join('/');
  return `${encodedPath}${link.query === undefined ? '' : `?${link.query}`}${link.fragment === undefined ? '' : `#${link.fragment}`}`;
}

function hasHtmlAssets(blocks: readonly NarrativeBlock[]): boolean {
  return blocks.some(block => {
    if (block.type === 'pageBreak' || block.type === 'table') return true;
    if (block.type === 'blockquote') return hasHtmlAssets(block.blocks);
    if (block.type === 'list') return block.items.some(item => hasHtmlAssets(item.blocks));
    return block.type === 'paragraph' || block.type === 'heading'
      ? hasInlineHtmlAssets(block.children)
      : false;
  });
}

function hasInlineHtmlAssets(inlines: readonly NarrativeInline[]): boolean {
  return inlines.some(inline => inline.type === 'image'
    || (inline.type === 'link' || inline.type === 'strong' || inline.type === 'emphasis' || inline.type === 'delete')
      && hasInlineHtmlAssets(inline.children));
}

function renderNarrativeAssets(nonce: string): string {
  return `<style nonce="${nonce}">.openamx-narrative-image{display:block;max-width:100%;height:auto}.openamx-narrative-table{border-collapse:collapse;width:100%;margin:1rem 0}.openamx-narrative-table th,.openamx-narrative-table td{border:1px solid #a8b3bd;padding:.4rem;text-align:left}.openamx-page-break{break-before:page;page-break-before:always}@media screen{.openamx-page-break{border-top:1px dashed #a8b3bd;margin:1.5rem 0}}</style>`;
}

function renderPreviewNavigationBootstrap(nonce: string, previewToken: string): string {
  const token = JSON.stringify(previewToken);
  return `<script nonce="${nonce}">(()=>{const token=${token};let port;window.addEventListener("message",event=>{const data=event.data;if(event.source!==parent||!data||data.type!=="openamx-preview-init"||data.previewToken!==token||event.ports.length!==1)return;port=event.ports[0];port.start()},{once:true});document.addEventListener("click",event=>{const source=event.target;if(!(source instanceof Element))return;const link=source.closest("a[data-openamx-target]");if(!link)return;event.preventDefault();if(!event.isTrusted||!navigator.userActivation?.isActive||!port)return;const targetId=link.getAttribute("data-openamx-target");if(!targetId)return;port.postMessage({version:1,type:"navigate",previewToken:token,targetId})},true)})();</script>`;
}

function renderViewEmission(emission: ViewEmission, identity: Pick<ResolvedReportIdentity, 'accent'>): string {
  if (emission.kind === 'table') return renderTable(emission);
  return renderChart(emission, identity);
}

function renderSafeMarkdown(markdown: string): string {
  return sanitizeHtml(marked.parse(markdown) as string, REPORT_MARKDOWN_POLICY);
}

function renderTable(emission: TableViewEmission): string {
  const title = emission.declaration.options.find(option => option.type === 'viewTitleOption');
  const columns = emission.declaration.options.filter(option => option.type === 'tableColumnOption');
  const id = viewId(emission);
  const rows = emission.data.filter(isRecordValue);
  const caption = title?.type === 'viewTitleOption' ? title.value : emission.name;
  const header = columns.map(column => `<th scope="col" aria-sort="none"><button type="button" data-sort="${escapeHtml(column.field)}">${escapeHtml(column.label)}</button></th>`).join('');
  const body = rows.map((row, index) => `<tr data-row-index="${index}">${columns.map(column => `<td>${escapeHtml(valueToString(row[column.field]))}</td>`).join('')}</tr>`).join('');
  const printBody = rows.map(row => `<tr>${columns.map(column => `<td>${escapeHtml(valueToString(row[column.field]))}</td>`).join('')}</tr>`).join('');
  const payload = safeJson({ columns: columns.map(column => ({ field: column.field, label: column.label })), rows });
  return `<section class="openamx-view openamx-table" data-view="${id}" aria-labelledby="${id}-caption">
  <h2 id="${id}-caption" class="sr-only">${escapeHtml(caption)}</h2>
  <div class="openamx-table-controls"><label>Filter <input type="search" data-filter aria-controls="${id}-interactive"></label><label>Rows <select data-page-size aria-controls="${id}-interactive"><option>10</option><option selected>25</option><option>50</option></select></label></div>
  <p class="openamx-status" data-status aria-live="polite"></p>
  <table id="${id}-interactive"><caption>${escapeHtml(caption)}</caption><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>
  <nav class="openamx-pagination" aria-label="${escapeHtml(caption)} pages"><button type="button" data-page="previous" aria-label="Previous page">Previous</button><span data-page-label></span><button type="button" data-page="next" aria-label="Next page">Next</button></nav>
  <script type="application/json" id="${id}-data">${payload}</script>
  <div class="openamx-print-view"><table><caption>${escapeHtml(caption)}</caption><thead><tr>${columns.map(column => `<th scope="col">${escapeHtml(column.label)}</th>`).join('')}</tr></thead><tbody>${printBody}</tbody></table></div>
</section>`;
}

function renderChart(emission: ChartViewEmission, identity: Pick<ResolvedReportIdentity, 'accent'>): string {
  const accent = identity.accent && /^#[0-9A-Fa-f]{6}$/.test(identity.accent) ? identity.accent : '#146C94';
  const model = createChartViewModel(emission, { accent });
  const browserModel = serializeChartModel(model);
  const id = model.table.id;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const summaryId = `${id}-summary`;
  const seriesControls = model.series.length > 1
    ? `<div class="openamx-chart-legend" role="group" aria-label="Chart series">${model.series.map(series => `<button type="button" class="openamx-legend-toggle" data-series="${escapeHtml(series.name)}" aria-pressed="true"><span aria-hidden="true" style="--series-color:${escapeHtml(series.color)}"></span>${escapeHtml(series.name)}</button>`).join('')}</div>`
    : '';
  const zoomControls = browserModel.zoomable
    ? `<div class="openamx-chart-controls" role="group" aria-label="Chart zoom controls"><button type="button" data-zoom="out" aria-label="Zoom out">Zoom out</button><button type="button" data-zoom="in" aria-label="Zoom in">Zoom in</button><button type="button" data-zoom="reset">Reset zoom</button></div>`
    : '';
  const textRows = model.table.rows.map(row => `<tr>${row.values.map(value => `<td>${escapeHtml(valueToString(value))}</td>`).join('')}</tr>`).join('');
  const data = safeJson(browserModel);
  return `<figure class="openamx-view openamx-chart" id="${id}-figure" data-openamx-chart aria-labelledby="${titleId}" aria-describedby="${descriptionId} ${summaryId}">
  <figcaption><strong id="${titleId}">${escapeHtml(model.title)}</strong><span id="${descriptionId}">${escapeHtml(model.description)}</span></figcaption>
  <p id="${summaryId}" class="sr-only">${escapeHtml(model.accessibility.summary)}</p>
  ${seriesControls}${zoomControls}
  <div id="${id}-plot" class="openamx-chart-plot" role="img" aria-label="${escapeHtml(model.title)}" aria-describedby="${descriptionId} ${summaryId} ${id}-table-caption"></div>
  <table class="openamx-chart-data" id="${id}"><caption id="${id}-table-caption">${escapeHtml(model.table.caption)}</caption><thead><tr>${model.table.headings.map(value => `<th scope="col">${escapeHtml(value)}</th>`).join('')}</tr></thead><tbody>${textRows}</tbody></table>
  <script type="application/json" data-chart-model>${data}</script>
</figure>`;
}

function serializeChartModel(model: ChartViewModel): BrowserChartModel {
  const formatterPaths: string[] = [];
  const option = projectSerializable(model.option, '$', formatterPaths) as JsonValue;
  const zoomable = model.kind === 'scatter' || (model.kind === 'line' && model.option.xAxis !== undefined
    && !isCategoryAxis(model.option.xAxis));
  if (zoomable) {
    const zoom = [{ type: 'inside', xAxisIndex: 0, ...(model.kind === 'scatter' ? { yAxisIndex: 0 } : {}), filterMode: 'none', zoomOnMouseWheel: true, moveOnMouseMove: true, moveOnMouseWheel: true }];
    optionProperty(option, 'dataZoom', zoom);
  }
  return {
    kind: model.kind,
    title: model.title,
    description: model.description,
    dimensions: model.dimensions,
    option,
    formatterPaths,
    table: model.table,
    series: model.series,
    axes: model.axes,
    accessibility: model.accessibility,
    plottedPointCount: model.plottedPointCount,
    ...(model.emptyState ? { emptyState: model.emptyState } : {}),
    ...(model.dateTimePresentation ? { dateTimePresentation: model.dateTimePresentation } : {}),
    zoomable
  };
}

function projectSerializable(value: unknown, path: string, formatterPaths: string[]): JsonValue | undefined {
  if (typeof value === 'function') {
    const allowed = path === '$.tooltip.formatter'
      || /\.(xAxis|yAxis)(\.\d+)?\.axisLabel\.formatter$/.test(path)
      || /\.(xAxis|yAxis)(\.\d+)?\.axisPointer\.label\.formatter$/.test(path);
    if (!allowed) throw new Error(`Unsupported function in chart model at ${path}.`);
    formatterPaths.push(path);
    return undefined;
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Non-finite chart value at ${path}.`);
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => projectSerializable(item, `${path}.${index}`, formatterPaths) ?? null);
  }
  if (typeof value === 'object') {
    const projected: Record<string, JsonValue> = {};
    for (const [key, item] of Object.entries(value)) {
      const itemPath = `${path}.${key}`;
      const itemProjection = projectSerializable(item, itemPath, formatterPaths);
      if (itemProjection !== undefined) projected[key] = itemProjection;
    }
    return projected;
  }
  if (value === undefined) return undefined;
  throw new Error(`Unsupported chart model value at ${path}.`);
}

function optionProperty(option: JsonValue, key: string, value: JsonValue): void {
  if (option === null || Array.isArray(option) || typeof option !== 'object') throw new Error('Chart option projection is not an object.');
  option[key] = value;
}

function isCategoryAxis(axis: EChartsOption['xAxis']): boolean {
  const first = Array.isArray(axis) ? axis[0] : axis;
  return first?.type === 'category' || first?.type === undefined;
}

function viewId(emission: ViewEmission): string {
  return `openamx-view-${emission.documentNodeIndex}-${emission.statementIndex}`;
}

function isRecordValue(value: ViewDataValue): value is { readonly [field: string]: ViewDataValue } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function renderContentSecurityPolicy(nonce: string, hasViews: boolean, hasPreviewNavigation = false): string {
  const scripts = hasViews || hasPreviewNavigation ? `'nonce-${nonce}'` : "'none'";
  const styles = hasViews || nonce ? `'nonce-${nonce}'` : "'none'";
  const styleAttributes = hasViews ? "; style-src-attr 'unsafe-inline'" : '';
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${scripts}; style-src ${styles}${styleAttributes}; img-src data:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'; media-src 'none'">`;
}

function safeAccentStyle(accent: string | undefined, nonce: string): string {
  if (!accent || !/^#[0-9A-Fa-f]{6}$/.test(accent) || accent.toLowerCase() === '#146c94') return '';
  return `<style nonce="${nonce}">:root{--openamx-accent:${accent};}</style>`;
}

function renderChartBootstrap(): string {
  return `(()=>{
const charts=new Map();
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const iso=value=>{const date=new Date(typeof value==='number'?value:Date.parse(value));return Number.isNaN(date.getTime())?'':date.toISOString()};
const locate=(object,path)=>path.slice(2).split('.').reduce((current,key)=>current==null?undefined:current[/^\\d+$/.test(key)?Number(key):key],object);
const rowLabel=(value,model)=>{const row=model.table.rows.find(item=>item.id===String(value));return row?String(row.values[0]??''):String(value??'')};
const axisLabel=(value,model)=>model.dateTimePresentation?iso(value):rowLabel(value,model);
const formatTooltip=(input,model)=>{const entries=(Array.isArray(input)?input:[input]).filter(item=>item&&typeof item==='object');return entries.map(entry=>{const series=model.series.find(item=>item.id===entry.seriesId||item.name===entry.seriesName);const values=Array.isArray(entry.value)?entry.value:[];if(model.kind==='scatter'){const x=values[0]??null,y=values[1]??null;const xUnit=model.axes.find(item=>item.role==='x')?.name,yUnit=model.axes.find(item=>item.role==='y')?.name;return '<div><strong>'+escapeHtml(entry.seriesName||'')+'</strong><br>x: '+escapeHtml(x)+(xUnit?' '+escapeHtml(xUnit):'')+'<br>y: '+escapeHtml(y)+(yUnit?' '+escapeHtml(yUnit):'')+'</div>'}const rawCategory=entry.axisValue??values[0]??entry.name;const category=model.dateTimePresentation?iso(rawCategory):rowLabel(rawCategory,model);const value=model.kind==='line'?values[1]:entry.value;const categoryUnit=model.kind==='line'?model.axes.find(item=>item.role==='x')?.name:undefined;const coordinate=escapeHtml(category)+(categoryUnit?' '+escapeHtml(categoryUnit):'');return '<div><strong>'+escapeHtml(entry.seriesName||'')+'</strong><br>'+coordinate+': '+escapeHtml(value)+(series?.unit?.text?' '+escapeHtml(series.unit.text):'')+'</div>'}).join('')};
const setZoom=(chart,zoom)=>{const current=chart.getOption().dataZoom?.[0]??{start:0,end:100};chart.setOption({dataZoom:[{...current,...zoom}]})};
const restoreFormatters=model=>{for(const path of model.formatterPaths){const key=path.split('.').at(-1),parentPath=path.slice(0,path.lastIndexOf('.')),parent=locate(model.option,parentPath);if(!parent)throw new Error('Chart formatter path is invalid.');if(path==='$.tooltip.formatter')parent[key]=params=>formatTooltip(params,model);else if(parentPath.endsWith('.axisPointer.label'))parent[key]=params=>iso(params?.value);else parent[key]=value=>axisLabel(value,model)}};
const initialize=root=>{const payloadNode=root.querySelector('[data-chart-model]'),plot=root.querySelector('.openamx-chart-plot');if(!payloadNode||!plot)return;const model=JSON.parse(payloadNode.textContent||'null');restoreFormatters(model);const chart=echarts.init(plot,null,{renderer:'canvas'});chart.setOption(model.option);root.querySelectorAll('[data-series]').forEach(button=>button.addEventListener('click',()=>chart.dispatchAction({type:'legendToggleSelect',name:button.dataset.series})));chart.on('legendselectchanged',event=>root.querySelectorAll('[data-series]').forEach(button=>button.setAttribute('aria-pressed',String(event.selected?.[button.dataset.series]!==false))));root.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{const current=chart.getOption().dataZoom?.[0]??{start:0,end:100},span=(current.end??100)-(current.start??0);if(button.dataset.zoom==='reset')setZoom(chart,{start:0,end:100});else{const next=Math.max(5,Math.min(100,span*(button.dataset.zoom==='in'?.75:1.33))),center=((current.start??0)+(current.end??100))/2;setZoom(chart,{start:Math.max(0,center-next/2),end:Math.min(100,center+next/2)})}}));const resizeObserver=new ResizeObserver(()=>chart.resize());resizeObserver.observe(plot);charts.set(root,{chart,resizeObserver})};
const dispose=root=>{const item=charts.get(root);if(!item)return;item.resizeObserver.disconnect();item.chart.dispose();charts.delete(root)};
const start=()=>{
document.querySelectorAll('[data-openamx-chart]').forEach(initialize);
const mutationObserver=new MutationObserver(()=>{for(const root of charts.keys())if(!document.documentElement.contains(root))dispose(root)});mutationObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('pagehide',()=>{for(const root of charts.keys())dispose(root);mutationObserver.disconnect()},{once:true});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();`;
}

function renderViewAssets(nonce: string): string {
  const assets = `<style>
.openamx-view{margin:1.5rem 0}.openamx-view table{border-collapse:collapse;width:100%}.openamx-view th,.openamx-view td{border:1px solid #a8b3bd;padding:.4rem;text-align:left}.openamx-view th button{font:inherit;font-weight:700;background:none;border:0;padding:0;cursor:pointer}.openamx-table-controls{display:flex;gap:1rem;flex-wrap:wrap;margin:.5rem 0}.openamx-status{min-height:1.4em}.openamx-pagination{display:flex;gap:.75rem;align-items:center;margin:.5rem 0}.openamx-chart svg{display:block;width:100%;max-width:40rem;height:auto;border:1px solid #a8b3bd}.openamx-chart figcaption{display:flex;flex-direction:column;gap:.25rem}.openamx-chart-data{margin-top:.75rem}.openamx-print-view,.openamx-print-chart{display:none}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media print{.openamx-table-controls,.openamx-status,.openamx-pagination,.openamx-table>table,.openamx-chart>svg,.openamx-chart-data{display:none}.openamx-print-view,.openamx-print-chart{display:block}.openamx-view{break-inside:avoid}.openamx-view th{background:#eee}.openamx-view thead{display:table-header-group}}
</style>
<script>
document.addEventListener('DOMContentLoaded',()=>{for(const root of document.querySelectorAll('[data-view].openamx-table')){const table=root.querySelector('table[id$="-interactive"]'),body=table?.querySelector('tbody'),filter=root.querySelector('[data-filter]'),size=root.querySelector('[data-page-size]'),status=root.querySelector('[data-status]'),pageLabel=root.querySelector('[data-page-label]');if(!table||!body||!filter||!size||!status||!pageLabel)continue;const payload=JSON.parse(document.getElementById(root.dataset.view+'-data').textContent),rows=[...body.querySelectorAll('tr')],original=rows.map((row,index)=>({row,index,text:row.textContent?.toLowerCase()??''}));let page=0,pageSize=25,sortField='',ascending=true;const update=()=>{let visible=original.filter(item=>item.text.includes(filter.value.toLowerCase()));if(sortField){visible.sort((a,b)=>{const av=payload.rows[a.index][sortField],bv=payload.rows[b.index][sortField];if(av===null&&bv!==null)return 1;if(av!==null&&bv===null)return -1;let result=av===bv?0:av<bv?-1:1;return (ascending?result:-result)||a.index-b.index})}visible.forEach(item=>body.appendChild(item.row));const pages=Math.max(1,Math.ceil(visible.length/pageSize));page=Math.min(page,pages-1);rows.forEach(row=>row.hidden=true);visible.slice(page*pageSize,(page+1)*pageSize).forEach(item=>item.row.hidden=false);status.textContent=visible.length===0?(filter.value?'No matching rows':'No rows'):'Showing '+(page*pageSize+1)+'-'+Math.min((page+1)*pageSize,visible.length)+' of '+visible.length+' rows';pageLabel.textContent='Page '+(page+1)+' of '+pages;root.querySelector('[data-page="previous"]').disabled=page===0;root.querySelector('[data-page="next"]').disabled=page>=pages-1};filter.addEventListener('input',()=>{page=0;update()});size.addEventListener('change',()=>{pageSize=Number(size.value);page=0;update()});root.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{const next=button.dataset.sort??'';ascending=sortField===next?!ascending:true;sortField=next;table.querySelectorAll('th').forEach(th=>th.setAttribute('aria-sort',th.querySelector('button')===button?(ascending?'ascending':'descending'):'none'));page=0;update()}));root.querySelector('[data-page="previous"]').addEventListener('click',()=>{page--;update()});root.querySelector('[data-page="next"]').addEventListener('click',()=>{page++;update()});update()}});
</script>`;
  return assets
    .replace('<style>', `<style nonce="${nonce}">`)
    .replace('<script>', `<script nonce="${nonce}">`)
    .replace('</script>', `</script><style nonce="${nonce}">.openamx-chart-plot{width:100%;min-width:320px;height:360px}.openamx-chart-legend,.openamx-chart-controls{display:flex;align-items:center;flex-wrap:wrap;gap:.5rem;margin:.5rem 0}.openamx-legend-toggle{display:inline-flex;align-items:center;gap:.4rem}.openamx-legend-toggle span{width:.75rem;height:.75rem;border-radius:50%;background:var(--series-color);flex:none}.openamx-legend-toggle[aria-pressed="false"]{opacity:.55}@media print{.openamx-chart-controls,.openamx-chart-legend{display:none!important}.openamx-chart-plot{min-width:0;break-inside:avoid}.openamx-chart-data{display:table!important}}</style><script nonce="${nonce}">${echartsBrowserRuntime}</script><script nonce="${nonce}">${renderChartBootstrap()}</script>`);
}

function renderReportHeader(report: ResolvedReportIdentity, _file?: string): string {
  const org = report.organization?.trim();
  const author = report.author?.trim();
  const status = report.status?.trim();
  const classification = report.classification?.trim();
  const footer = report.footer?.trim();
  const logo = report.logo?.trim();

  if (!org && !author && !status && !classification && !logo && !footer) {
    return '';
  }

  const logoMarkup = logo ? `<img class="openamx-report-logo" src="${escapeHtml(logo)}" alt="${escapeHtml(report.logoAlt ?? 'Report logo')}" />` : '';
  const meta = [
    org ? `<div class="openamx-report-attr">${escapeHtml(org)}</div>` : '',
    author ? `<div class="openamx-report-attr">Author: ${escapeHtml(author)}</div>` : '',
    status ? `<div class="openamx-report-attr">Status: ${escapeHtml(status)}</div>` : '',
    classification ? `<div class="openamx-report-attr">Classification: ${escapeHtml(classification)}</div>` : '',
    footer ? `<div class="openamx-report-attr">${escapeHtml(footer)}</div>` : '',
  ].filter(Boolean).join('');

  return `<header class="openamx-report-header"><div class="openamx-report-identity">${logoMarkup}<div class="openamx-report-meta">${meta || '<div class="openamx-report-attr">OpenAMX report</div>'}</div></div></header>`;
}

function resolveReportIdentity(doc: OpenAmxDocument, override?: Record<string, unknown>): ResolvedReportIdentity {
  const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
  const frontMatterReport = isRecord(metadata.report) ? metadata.report : {};
  const merged = { ...frontMatterReport, ...override };
  const sourceVisible = merged.sourceVisible === undefined ? true : Boolean(merged.sourceVisible);
  const logo = typeof merged.logo === 'string' ? merged.logo : undefined;

  if (logo) throw new AmxError({ code: 'AMX6001', message: 'Logo reports require shared report preparation' });

  return {
    organization: stringOrUndefined(merged.organization),
    logo: undefined,
    logoAlt: stringOrUndefined(merged.logoAlt),
    accent: stringOrUndefined(merged.accent),
    author: stringOrUndefined(merged.author),
    status: stringOrUndefined(merged.status),
    classification: stringOrUndefined(merged.classification),
    footer: stringOrUndefined(merged.footer),
    sourceVisible,
  };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function substituteInlines(
  content: string,
  env: Environment,
  file: string | undefined,
  narrativeLine?: number
): string {
  // Non-nested {{ expr }} substitution. Expressions cannot contain literal "}}" per v0.1.
  return content.replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, (_full, exprText: string) => {
    const trimmed = exprText.trim();
    if (trimmed.length === 0) {
      return '';
    }
    // Attach approximate source for better diagnostics (narrative block start line).
    const source = narrativeLine !== undefined ? { line: narrativeLine, column: 1 } : undefined;
    const exprNode = parseExpression(trimmed, source);
    const value = evaluateExpression(exprNode, env, file);
    return escapeHtml(valueToString(value));
  });
}

function valueToString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') {
    // Present integers without trailing .0 for natural readability in text.
    return Number.isInteger(v) ? String(v) : String(v);
  }
  if (typeof v === 'boolean') return String(v); // "true" / "false"
  if (Array.isArray(v)) {
    // Simple deterministic representation for lists inside narrative text.
    return v.map(valueToString).join(', ');
  }
  return String(v);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
