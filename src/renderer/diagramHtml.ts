import { Buffer } from 'node:buffer';
import { gzipSync } from 'node:zlib';
import { serializeDiagramSceneModel, type DiagramSceneModel } from '../runtime/diagramModel';

export const MAX_INTERACTIVE_DIAGRAM_HTML_BYTES = 100 * 1024 * 1024;

export function assertDiagramHtmlSize(html: string, hasDiagrams: boolean): void {
  if (!hasDiagrams) return;
  const bytes = Buffer.byteLength(html, 'utf8');
  if (bytes > MAX_INTERACTIVE_DIAGRAM_HTML_BYTES) {
    throw new Error(`Interactive diagram HTML exceeds the ${MAX_INTERACTIVE_DIAGRAM_HTML_BYTES}-byte limit (${bytes} bytes).`);
  }
}

export function renderDiagramFigure(model: DiagramSceneModel, id: string): string {
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const serializedModel = gzipSync(serializeDiagramSceneModel(model), { level: 9 }).toString('base64');
  const from = String(model.timeline.from);
  const to = String(model.timeline.to);
  return `<figure class="openamx-diagram" data-openamx-diagram="${id}" data-diagram-id="${id}" aria-labelledby="${titleId}" aria-describedby="${descriptionId}">
  <figcaption><strong id="${titleId}">${escapeHtml(model.title)}</strong><span id="${descriptionId}">${escapeHtml(model.description)}</span></figcaption>
  <div class="openamx-diagram-controls" role="group" aria-label="Playback controls for ${escapeHtml(model.title)}">
    <button type="button" data-diagram-play aria-label="Play ${escapeHtml(model.title)}">Play</button>
    <button type="button" data-diagram-reset aria-label="Reset ${escapeHtml(model.title)}">Reset</button>
    <label><input type="checkbox" data-diagram-loop aria-label="Loop ${escapeHtml(model.title)}"> Loop</label>
    <label><span>Time</span><input type="range" data-diagram-scrubber min="${from}" max="${to}" step="any" value="${from}" aria-label="Time for ${escapeHtml(model.title)}"></label>
    <output data-diagram-time aria-live="polite">${from}</output>
  </div>
  <svg class="openamx-diagram-canvas" data-diagram-canvas width="${model.canvas.width}" height="${model.canvas.height}" viewBox="0 0 ${model.canvas.width} ${model.canvas.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${titleId}" aria-describedby="${descriptionId}"></svg>
  <p class="openamx-diagram-error" data-diagram-error role="alert" hidden></p>
  <script type="application/json" data-diagram-model data-encoding="gzip-base64">${serializedModel}</script>
</figure>`;
}

export function renderDiagramAssets(nonce: string, runtime: string): string {
  const safeRuntime = runtime.replace(/<\/script/gi, '<\\/script');
  return `<style nonce="${nonce}">
.openamx-diagram{margin:1.5rem 0}.openamx-diagram figcaption{display:flex;flex-direction:column;gap:.25rem}.openamx-diagram-controls{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin:.75rem 0}.openamx-diagram-controls label{display:inline-flex;align-items:center;gap:.35rem}.openamx-diagram-controls input[type=range]{min-width:10rem}.openamx-diagram-canvas{display:block;width:100%;height:auto;border:1px solid #a8b3bd}.openamx-diagram-error{color:#8b1e1e;font-weight:600}.openamx-diagram button:focus-visible,.openamx-diagram input:focus-visible{outline:3px solid #146c94;outline-offset:2px}
</style><script nonce="${nonce}">${safeRuntime}</script>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]!);
}
