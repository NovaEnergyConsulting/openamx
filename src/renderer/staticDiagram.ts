import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import { evaluateDiagramFrame, type DiagramFrameElement, type DiagramSceneModel } from '../runtime/diagramModel';

const MAX_SVG_EDGE = 1200;

export interface StaticDiagramSvg {
  readonly svg: string;
  readonly width: number;
  readonly height: number;
}

export interface StaticDiagramPng {
  readonly bytes: Uint8Array;
  readonly width: number;
  readonly height: number;
}

export function renderStaticDiagramSvg(model: DiagramSceneModel): StaticDiagramSvg {
  const { width: canvasWidth, height: canvasHeight } = model.canvas;
  if (!Number.isFinite(canvasWidth) || canvasWidth <= 0 || !Number.isFinite(canvasHeight) || canvasHeight <= 0) {
    throw new Error(`Diagram '${model.name}' has invalid canvas dimensions.`);
  }

  const frame = evaluateDiagramFrame(model, model.timeline.from);
  const scale = Math.min(MAX_SVG_EDGE / canvasWidth, MAX_SVG_EDGE / canvasHeight);
  const width = canvasWidth * scale;
  const height = canvasHeight * scale;
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new Error(`Diagram '${model.name}' cannot be represented with finite SVG dimensions.`);
  }
  const title = escapeXml(model.title);
  const description = escapeXml(model.description);
  const content = frame.elements.map(element => renderElement(element)).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${formatNumber(width)}" height="${formatNumber(height)}" viewBox="0 0 ${formatNumber(canvasWidth)} ${formatNumber(canvasHeight)}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="diagram-title diagram-description"><title id="diagram-title">${title}</title><desc id="diagram-description">${description}</desc><g transform="translate(0 ${formatNumber(canvasHeight)}) scale(1 -1)">${content}</g></svg>`;
  return Object.freeze({ svg, width, height });
}

export async function rasterizeStaticDiagramSvg(svg: string): Promise<StaticDiagramPng> {
  const { data, info } = await sharp(Buffer.from(svg, 'utf8')).png().toBuffer({ resolveWithObject: true });
  if (info.width <= 0 || info.height <= 0) throw new Error('Rasterized diagram has invalid pixel dimensions.');
  return Object.freeze({ bytes: Uint8Array.from(data), width: info.width, height: info.height });
}

function renderElement(element: DiagramFrameElement): string {
  const stroke = escapeXml(element.primitive === 'text' ? 'none' : element.stroke);
  const fill = escapeXml(element.primitive === 'text'
    ? element.fill
    : element.primitive === 'line' ? 'none' : element.fill ?? 'none');
  const lineWidth = element.primitive === 'text' ? 0 : element.lineWidth;
  switch (element.primitive) {
    case 'line': {
      const line = `<line x1="${formatNumber(element.x1)}" y1="${formatNumber(element.y1)}" x2="${formatNumber(element.x2)}" y2="${formatNumber(element.y2)}" stroke="${stroke}" stroke-width="${formatNumber(lineWidth)}" fill="none"/>`;
      return `${line}${renderArrow(element, 'start')}${renderArrow(element, 'end')}`;
    }
    case 'rectangle':
      return `<rect x="${formatNumber(element.x)}" y="${formatNumber(element.y)}" width="${formatNumber(element.width)}" height="${formatNumber(element.height)}" stroke="${stroke}" stroke-width="${formatNumber(lineWidth)}" fill="${fill}"/>`;
    case 'circle':
      return `<circle cx="${formatNumber(element.cx)}" cy="${formatNumber(element.cy)}" r="${formatNumber(element.r)}" stroke="${stroke}" stroke-width="${formatNumber(lineWidth)}" fill="${fill}"/>`;
    case 'text':
      return `<text x="${formatNumber(element.x)}" y="${formatNumber(element.y)}" transform="translate(0 ${formatNumber(element.y * 2)}) scale(1 -1)" fill="${fill}">${escapeXml(element.value)}</text>`;
  }
}

function renderArrow(
  element: Extract<DiagramFrameElement, { primitive: 'line' }>,
  end: 'start' | 'end'
): string {
  if (element.arrow !== end && element.arrow !== 'both') return '';
  const tipX = end === 'start' ? element.x1 : element.x2;
  const tipY = end === 'start' ? element.y1 : element.y2;
  const tailX = end === 'start' ? element.x2 : element.x1;
  const tailY = end === 'start' ? element.y2 : element.y1;
  const dx = tipX - tailX;
  const dy = tipY - tailY;
  const length = Math.hypot(dx, dy);
  if (length === 0) return '';
  const size = Math.max(4, element.lineWidth * 4);
  const ux = dx / length;
  const uy = dy / length;
  const baseX = tipX - ux * size;
  const baseY = tipY - uy * size;
  const halfWidth = size * 0.45;
  const leftX = baseX - uy * halfWidth;
  const leftY = baseY + ux * halfWidth;
  const rightX = baseX + uy * halfWidth;
  const rightY = baseY - ux * halfWidth;
  return `<polygon points="${formatNumber(tipX)},${formatNumber(tipY)} ${formatNumber(leftX)},${formatNumber(leftY)} ${formatNumber(rightX)},${formatNumber(rightY)}" fill="${escapeXml(element.stroke)}"/>`;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) throw new Error('Static diagram contains non-finite geometry.');
  return Object.is(value, -0) ? '0' : String(value);
}

function escapeXml(value: string): string {
  for (const character of value) {
    const codePoint = character.codePointAt(0)!;
    if (!(codePoint === 0x9 || codePoint === 0xA || codePoint === 0xD
      || (codePoint >= 0x20 && codePoint <= 0xD7FF)
      || (codePoint >= 0xE000 && codePoint <= 0xFFFD)
      || (codePoint >= 0x10000 && codePoint <= 0x10FFFF))) {
      throw new Error('Diagram text contains a character that cannot be represented in SVG/XML.');
    }
  }
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  })[character]!);
}
