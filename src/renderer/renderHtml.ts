import { marked } from 'marked';
import { OpenAmxDocument } from '../ast/types';
import { parseExpression } from '../parser/parseExpression';
import { evaluateExpression } from '../runtime/evaluateExpression';
import { evaluateDocumentEnvironment } from '../runtime/evaluateDocument';
import { Environment } from '../runtime/environment';
import type { ViewDataValue, ViewEmission, TableViewEmission, ChartViewEmission } from '../runtime/environment';
import { formatAmx } from '../formatter/formatAmx';

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
export function renderHtml(doc: OpenAmxDocument, file?: string, env?: Environment): string {
  const environment = env ?? evaluateDocumentEnvironment(doc, file);
  const emissionsByNode = new Map<number, ViewEmission[]>();
  for (const emission of environment.viewEmissions) {
    const emissions = emissionsByNode.get(emission.documentNodeIndex) ?? [];
    emissions.push(emission);
    emissionsByNode.set(emission.documentNodeIndex, emissions);
  }

  const bodyFragments: string[] = [];

  for (const [nodeIndex, node] of doc.nodes.entries()) {
    if (node.type === 'narrative') {
      const substituted = substituteInlines(node.content, environment, file, node.source?.line);
      // marked.parse returns string | Promise<string> in v14 depending on configuration.
      // For our deterministic sync usage (no async extensions) it is always a string.
      const htmlFragment = marked.parse(substituted) as string;
      bodyFragments.push(htmlFragment);
    } else if (node.type === 'executableCodeBlock') {
      const formatted = formatAmx(node.content);
      bodyFragments.push(`<pre><code class="language-amx">${escapeHtml(formatted)}</code></pre>`);
      for (const emission of emissionsByNode.get(nodeIndex) ?? []) {
        bodyFragments.push(renderViewEmission(emission));
      }
    }
  }

  const title =
    doc.metadata && typeof (doc.metadata as Record<string, unknown>).title === 'string'
      ? String((doc.metadata as Record<string, unknown>).title)
      : 'OpenAMX Document';

  const bodyHtml = bodyFragments.join('');

  const escapedTitle = escapeHtml(title);

  const viewAssets = environment.viewEmissions.length > 0 ? renderViewAssets() : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapedTitle}</title>${viewAssets ? `\n${viewAssets}` : ''}
</head>
<body>
${bodyHtml}</body>
</html>`;
}

function renderViewEmission(emission: ViewEmission): string {
  if (emission.kind === 'table') return renderTable(emission);
  return renderChart(emission);
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

function renderChart(emission: ChartViewEmission): string {
  const id = viewId(emission);
  const title = emission.declaration.options.find(option => option.type === 'viewTitleOption');
  const description = emission.declaration.options.find(option => option.type === 'viewDescriptionOption');
  const caption = title?.type === 'viewTitleOption' ? title.value : emission.name;
  const detail = description?.type === 'viewDescriptionOption' ? description.value : `${emission.kind} chart`;
  const rows = chartRows(emission);
  const svg = rows.length === 0 ? '' : renderChartSvg(emission, rows);
  const textRows = rows.map(row => `<tr>${row.map(value => `<td>${escapeHtml(valueToString(value))}</td>`).join('')}</tr>`).join('');
  const headings = chartHeadings(emission);
  return `<figure class="openamx-view openamx-chart" data-view="${id}" aria-labelledby="${id}-title" aria-describedby="${id}-description">
  <figcaption><strong id="${id}-title">${escapeHtml(caption)}</strong><span id="${id}-description">${escapeHtml(detail)}</span></figcaption>
  ${svg || '<p class="openamx-empty">No data</p>'}
  <table class="openamx-chart-data"><caption>Data for ${escapeHtml(caption)}</caption><thead><tr>${headings.map(value => `<th scope="col">${escapeHtml(value)}</th>`).join('')}</tr></thead><tbody>${textRows}</tbody></table>
  <div class="openamx-print-chart"><strong>${escapeHtml(caption)}</strong><p>${escapeHtml(detail)}</p><table><thead><tr>${headings.map(value => `<th scope="col">${escapeHtml(value)}</th>`).join('')}</tr></thead><tbody>${textRows}</tbody></table></div>
</figure>`;
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
    if (isRecordValue(value)) {
      if (emission.declaration.kind === 'scatter') return [value[x?.type === 'chartFieldOption' ? x.field : 'x'], value[y?.type === 'chartFieldOption' ? y.field : 'y'], group?.type === 'chartFieldOption' ? value[group.field] : ''];
      return [category?.type === 'chartFieldOption' ? value[category.field] : labels[index], ...series.map(option => option.type === 'chartSeriesOption' && option.field ? value[option.field] : null)];
    }
    return [labels[index], value];
  });
}

function chartHeadings(emission: ChartViewEmission): string[] {
  if (emission.declaration.kind === 'scatter') return ['x', 'y', 'group'];
  const series = emission.declaration.options.filter(option => option.type === 'chartSeriesOption');
  return ['label', ...series.map(option => option.label)];
}

function renderChartSvg(emission: ChartViewEmission, rows: ViewDataValue[][]): string {
  const width = 640;
  const height = 240;
  const numeric = rows.flatMap(row => row.slice(1)).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const max = Math.max(1, ...numeric.map(value => Math.abs(value)));
  if (emission.declaration.kind === 'scatter') {
    const points = rows.filter(row => typeof row[0] === 'number' && typeof row[1] === 'number').map((row, index) => `<circle cx="${40 + (Number(row[0]) / max) * 560}" cy="${200 - (Number(row[1]) / max) * 160}" r="5" fill="${chartColor(index)}"><title>${escapeHtml(valueToString(row[0]))}, ${escapeHtml(valueToString(row[1]))}</title></circle>`).join('');
    return `<svg role="img" viewBox="0 0 ${width} ${height}" aria-label="${escapeHtml(emission.name)} chart" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="200" x2="600" y2="200" stroke="currentColor"/><line x1="40" y1="40" x2="40" y2="200" stroke="currentColor"/>${points}</svg>`;
  }
  const bars = rows.flatMap((row, rowIndex) => row.slice(1).map((value, seriesIndex) => typeof value === 'number' ? `<rect x="${40 + rowIndex * 560 / Math.max(1, rows.length) + seriesIndex * 14}" y="${200 - (value / max) * 160}" width="12" height="${Math.max(0, (value / max) * 160)}" fill="${chartColor(seriesIndex)}"><title>${escapeHtml(valueToString(row[0]))}: ${escapeHtml(valueToString(value))}</title></rect>` : '')).join('');
  return `<svg role="img" viewBox="0 0 ${width} ${height}" aria-label="${escapeHtml(emission.name)} chart" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="200" x2="600" y2="200" stroke="currentColor"/><line x1="40" y1="40" x2="40" y2="200" stroke="currentColor"/>${bars}</svg>`;
}

function chartColor(index: number): string {
  return ['#146c94', '#d97706', '#15803d', '#b42318'][index % 4];
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

function renderViewAssets(): string {
  return `<style>
.openamx-view{margin:1.5rem 0}.openamx-view table{border-collapse:collapse;width:100%}.openamx-view th,.openamx-view td{border:1px solid #a8b3bd;padding:.4rem;text-align:left}.openamx-view th button{font:inherit;font-weight:700;background:none;border:0;padding:0;cursor:pointer}.openamx-table-controls{display:flex;gap:1rem;flex-wrap:wrap;margin:.5rem 0}.openamx-status{min-height:1.4em}.openamx-pagination{display:flex;gap:.75rem;align-items:center;margin:.5rem 0}.openamx-chart svg{display:block;width:100%;max-width:40rem;height:auto;border:1px solid #a8b3bd}.openamx-chart figcaption{display:flex;flex-direction:column;gap:.25rem}.openamx-chart-data{margin-top:.75rem}.openamx-print-view,.openamx-print-chart{display:none}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media print{.openamx-table-controls,.openamx-status,.openamx-pagination,.openamx-table>table,.openamx-chart>svg,.openamx-chart-data{display:none}.openamx-print-view,.openamx-print-chart{display:block}.openamx-view{break-inside:avoid}.openamx-view th{background:#eee}.openamx-view thead{display:table-header-group}}
</style>
<script>
document.addEventListener('DOMContentLoaded',()=>{for(const root of document.querySelectorAll('[data-view].openamx-table')){const table=root.querySelector('table[id$="-interactive"]'),body=table?.querySelector('tbody'),filter=root.querySelector('[data-filter]'),size=root.querySelector('[data-page-size]'),status=root.querySelector('[data-status]'),pageLabel=root.querySelector('[data-page-label]');if(!table||!body||!filter||!size||!status||!pageLabel)continue;const payload=JSON.parse(document.getElementById(root.dataset.view+'-data').textContent),rows=[...body.querySelectorAll('tr')],original=rows.map((row,index)=>({row,index,text:row.textContent?.toLowerCase()??''}));let page=0,pageSize=25,sortField='',ascending=true;const update=()=>{let visible=original.filter(item=>item.text.includes(filter.value.toLowerCase()));if(sortField){visible.sort((a,b)=>{const av=payload.rows[a.index][sortField],bv=payload.rows[b.index][sortField];if(av===null&&bv!==null)return 1;if(av!==null&&bv===null)return -1;let result=av===bv?0:av<bv?-1:1;return (ascending?result:-result)||a.index-b.index})}visible.forEach(item=>body.appendChild(item.row));const pages=Math.max(1,Math.ceil(visible.length/pageSize));page=Math.min(page,pages-1);rows.forEach(row=>row.hidden=true);visible.slice(page*pageSize,(page+1)*pageSize).forEach(item=>item.row.hidden=false);status.textContent=visible.length===0?(filter.value?'No matching rows':'No rows'):'Showing '+(page*pageSize+1)+'-'+Math.min((page+1)*pageSize,visible.length)+' of '+visible.length+' rows';pageLabel.textContent='Page '+(page+1)+' of '+pages;root.querySelector('[data-page="previous"]').disabled=page===0;root.querySelector('[data-page="next"]').disabled=page>=pages-1};filter.addEventListener('input',()=>{page=0;update()});size.addEventListener('change',()=>{pageSize=Number(size.value);page=0;update()});root.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{const next=button.dataset.sort??'';ascending=sortField===next?!ascending:true;sortField=next;table.querySelectorAll('th').forEach(th=>th.setAttribute('aria-sort',th.querySelector('button')===button?(ascending?'ascending':'descending'):'none'));page=0;update()}));root.querySelector('[data-page="previous"]').addEventListener('click',()=>{page--;update()});root.querySelector('[data-page="next"]').addEventListener('click',()=>{page++;update()});update()}});
</script>`;
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

