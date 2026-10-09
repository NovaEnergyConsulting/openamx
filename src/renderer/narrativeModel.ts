import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import sharp from 'sharp';
import { Marked, type Token, type Tokens } from 'marked';
import { AmxError } from '../diagnostics/errors';
import { canonicalDirectory, hasSymlink, isContained } from './reportPaths';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 4_000_000;
const LOCAL_LINK_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.csv', '.json']);

const markdown = new Marked({ gfm: true, breaks: true });

export type NarrativeInline =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'lineBreak' }
  | { readonly type: 'strong' | 'emphasis' | 'delete'; readonly children: readonly NarrativeInline[] }
  | { readonly type: 'inlineCode'; readonly text: string }
  | { readonly type: 'link'; readonly link: NarrativeLink; readonly children: readonly NarrativeInline[] }
  | { readonly type: 'image'; readonly image: NarrativeImage; readonly title?: string };

export type NarrativeBlock =
  | { readonly type: 'heading'; readonly depth: number; readonly id: string; readonly children: readonly NarrativeInline[] }
  | { readonly type: 'paragraph'; readonly children: readonly NarrativeInline[] }
  | { readonly type: 'code'; readonly language?: string; readonly text: string }
  | { readonly type: 'list'; readonly ordered: boolean; readonly start?: number; readonly items: readonly NarrativeListItem[] }
  | { readonly type: 'blockquote'; readonly blocks: readonly NarrativeBlock[] }
  | { readonly type: 'table'; readonly align: readonly (string | null)[]; readonly header: readonly (readonly NarrativeInline[])[]; readonly rows: readonly (readonly (readonly NarrativeInline[])[])[] }
  | { readonly type: 'horizontalRule' }
  | { readonly type: 'pageBreak' };

export interface NarrativeListItem {
  readonly checked?: boolean;
  readonly blocks: readonly NarrativeBlock[];
}

function fencedCodeContent(raw: string): string {
  const openingLineEnd = raw.indexOf('\n');
  if (openingLineEnd === -1) return raw;
  const end = raw.endsWith('\n') ? raw.length - 1 : raw.length;
  const closingLineStart = raw.lastIndexOf('\n', end - 1) + 1;
  return raw.slice(openingLineEnd + 1, closingLineStart);
}

export type NarrativeLink =
  | { readonly type: 'external'; readonly href: string; readonly title?: string }
  | { readonly type: 'internal'; readonly targetId: string; readonly title?: string }
  | { readonly type: 'local'; readonly path: string; readonly sourceBase: 'document-directory'; readonly title?: string; readonly query?: string; readonly fragment?: string };

export interface NarrativeImage {
  readonly format: 'png' | 'jpeg';
  readonly dataUri: string;
  readonly width: number;
  readonly height: number;
  readonly inputBytes: number;
  readonly outputBytes: number;
  readonly alt: string;
}

export interface PreparedNarrative {
  readonly text: string;
  readonly blocks: readonly NarrativeBlock[];
  readonly diagnostics: readonly NarrativeDiagnostic[];
}

export interface NarrativeDiagnostic {
  readonly type: 'rejectedLink';
  readonly reason: 'invalid-external-target' | 'invalid-internal-fragment' | 'invalid-local-target' | 'unsupported-scheme';
}

export interface NarrativeSource {
  readonly content: string;
  readonly line?: number;
}

export interface NarrativePreparationOptions {
  readonly file?: string;
  readonly projectRoot?: string;
  readonly interpolate: (expression: string, line?: number) => string;
}

interface Interpolation {
  readonly marker: string;
  readonly value: string;
  readonly source: string;
}

interface InterpolatedSource {
  readonly markdown: string;
  readonly text: string;
  readonly textValue: (value: string) => string;
  readonly sourceValue: (value: string) => string;
}

interface SourceContext {
  readonly root: string;
  readonly directory: string;
}

interface BuildContext {
  readonly interpolation: InterpolatedSource;
  readonly options: NarrativePreparationOptions;
  readonly headingIds: Set<string>;
  readonly diagnostics: NarrativeDiagnostic[];
  sourceContext?: SourceContext;
}

type MutableNarrativeBlock =
  | { type: 'heading'; depth: number; id: string; children: NarrativeInline[] }
  | { type: 'paragraph'; children: NarrativeInline[] }
  | { type: 'code'; language?: string; text: string }
  | { type: 'list'; ordered: boolean; start?: number; items: NarrativeListItem[] }
  | { type: 'blockquote'; blocks: NarrativeBlock[] }
  | { type: 'table'; align: (string | null)[]; header: NarrativeInline[][]; rows: NarrativeInline[][][] }
  | { type: 'horizontalRule' }
  | { type: 'pageBreak' };

export async function prepareNarratives(
  sources: readonly NarrativeSource[],
  options: NarrativePreparationOptions
): Promise<readonly PreparedNarrative[]> {
  const headingIds = new Set<string>();
  const pending: Array<{
    readonly text: string;
    readonly blocks: readonly NarrativeBlock[];
    readonly diagnostics: readonly NarrativeDiagnostic[];
  }> = [];

  for (const source of sources) {
    const interpolation = interpolateSource(source.content, options.interpolate, source.line);
    const diagnostics: NarrativeDiagnostic[] = [];
    const context: BuildContext = { interpolation, options, headingIds, diagnostics };
    const blocks = await buildBlocks(markdown.lexer(interpolation.markdown), context);
    pending.push({ text: interpolation.text, blocks, diagnostics });
  }

  const targets = new Set<string>();
  for (const narrative of pending) collectHeadingIds(narrative.blocks, targets);
  return Object.freeze(pending.map(narrative => freezeDeep({
    text: narrative.text,
    blocks: resolveInternalLinks(narrative.blocks, targets),
    diagnostics: narrative.diagnostics
  })));
}

export function fitNarrativeImage(
  image: Pick<NarrativeImage, 'width' | 'height'>,
  bounds: { readonly maxWidth: number; readonly maxHeight: number }
): { readonly width: number; readonly height: number } {
  if (!Number.isFinite(bounds.maxWidth) || !Number.isFinite(bounds.maxHeight) || bounds.maxWidth <= 0 || bounds.maxHeight <= 0) {
    throw new RangeError('Narrative image bounds must be finite positive numbers');
  }
  if (!Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width <= 0 || image.height <= 0) {
    throw new RangeError('Narrative image dimensions must be finite positive numbers');
  }
  const scale = Math.min(1, bounds.maxWidth / image.width, bounds.maxHeight / image.height);
  return Object.freeze({ width: image.width * scale, height: image.height * scale });
}

function interpolateSource(
  source: string,
  interpolate: NarrativePreparationOptions['interpolate'],
  line?: number
): InterpolatedSource {
  const pattern = /\{\{\s*([\s\S]*?)\s*\}\}/g;
  let prefix = '\uE000OPENAMX_INTERPOLATION-';
  while (source.includes(prefix)) prefix += 'X';
  const interpolations: Interpolation[] = [];
  const markdownSource = source.replace(pattern, (whole, expression: string) => {
    const marker = `${prefix}${interpolations.length}\uE001`;
    const value = expression.trim() ? interpolate(expression.trim(), line) : '';
    interpolations.push({ marker, value, source: whole.replace(/\r\n/g, '\n') });
    return marker;
  });
  let index = 0;
  const text = source.replace(pattern, () => interpolations[index++]?.value ?? '');
  const markerPattern = new RegExp(`${escapeRegExp(prefix)}(\\d+)\\uE001`, 'g');
  const replaceMarkers = (value: string, replacement: (item: Interpolation) => string): string => value.replace(
    markerPattern,
    (_marker, markerIndex: string) => {
      const item = interpolations[Number(markerIndex)];
      return item ? replacement(item) : _marker;
    }
  );

  return {
    markdown: markdownSource.replace(/\r\n/g, '\n'),
    text,
    textValue: value => replaceMarkers(value, item => item.value),
    sourceValue: value => replaceMarkers(value, item => item.source)
  };
}

async function buildBlocks(tokens: readonly Token[], context: BuildContext): Promise<MutableNarrativeBlock[]> {
  const blocks: MutableNarrativeBlock[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'space':
      case 'def':
        break;
      case 'heading': {
        const heading = token as Tokens.Heading;
        const children = await buildInlines(heading.tokens, context);
        blocks.push({ type: 'heading', depth: heading.depth, id: uniqueHeadingId(children, context.headingIds), children });
        break;
      }
      case 'paragraph': {
        const paragraph = token as Tokens.Paragraph;
        blocks.push({ type: 'paragraph', children: await buildInlines(paragraph.tokens, context) });
        break;
      }
      case 'text': {
        const text = token as Tokens.Text;
        const children = text.tokens
          ? await buildInlines(text.tokens, context)
          : textNodes(context.interpolation.textValue(text.text));
        blocks.push({ type: 'paragraph', children });
        break;
      }
      case 'code': {
        const code = token as Tokens.Code;
        if (code.codeBlockStyle === 'indented') {
          fail('AMX6001', 'Narrative code blocks must use fenced Markdown', context.options.file);
        }
        const block: MutableNarrativeBlock = { type: 'code', text: context.interpolation.sourceValue(fencedCodeContent(code.raw)) };
        if (code.lang) block.language = code.lang;
        blocks.push(block);
        break;
      }
      case 'list': {
        const list = token as Tokens.List;
        const items: NarrativeListItem[] = [];
        for (const item of list.items) {
          const preparedItem: { checked?: boolean; blocks: NarrativeBlock[] } = {
            blocks: await buildBlocks(item.tokens, context)
          };
          if (item.checked !== undefined) preparedItem.checked = item.checked;
          items.push(preparedItem);
        }
        const block: MutableNarrativeBlock = { type: 'list', ordered: list.ordered, items };
        if (typeof list.start === 'number') block.start = list.start;
        blocks.push(block);
        break;
      }
      case 'blockquote': {
        const quote = token as Tokens.Blockquote;
        blocks.push({ type: 'blockquote', blocks: await buildBlocks(quote.tokens, context) });
        break;
      }
      case 'table': {
        const table = token as Tokens.Table;
        const header: NarrativeInline[][] = [];
        for (const cell of table.header) header.push(await buildInlines(cell.tokens, context));
        const rows: NarrativeInline[][][] = [];
        for (const row of table.rows) {
          const preparedRow: NarrativeInline[][] = [];
          for (const cell of row) preparedRow.push(await buildInlines(cell.tokens, context));
          rows.push(preparedRow);
        }
        blocks.push({ type: 'table', align: table.align, header, rows });
        break;
      }
      case 'hr':
        blocks.push({ type: 'horizontalRule' });
        break;
      case 'html': {
        const html = token as Tokens.HTML | Tokens.Tag;
        if (html.block && isPageBreakDirective(html.text)) {
          blocks.push({ type: 'pageBreak' });
          break;
        }
        blocks.push({
          type: 'paragraph',
          children: literalTextNodes(context.interpolation.textValue(html.text.replace(/\n+$/g, '')))
        });
        break;
      }
      default:
        throw new AmxError({
          code: 'AMX6001',
          message: `Unsupported Markdown block token '${token.type}'`,
          file: context.options.file
        });
    }
  }
  return blocks;
}

async function buildInlines(tokens: readonly Token[], context: BuildContext): Promise<NarrativeInline[]> {
  const inlines: NarrativeInline[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const text = token as Tokens.Text;
        if (text.tokens) inlines.push(...await buildInlines(text.tokens, context));
        else inlines.push(...textNodes(context.interpolation.textValue(text.text)));
        break;
      }
      case 'escape': {
        const escaped = token as Tokens.Escape;
        inlines.push(...textNodes(context.interpolation.textValue(escaped.text)));
        break;
      }
      case 'strong':
      case 'em':
      case 'del': {
        const nested = token as Tokens.Strong | Tokens.Em | Tokens.Del;
        const type = token.type === 'strong' ? 'strong' : token.type === 'em' ? 'emphasis' : 'delete';
        inlines.push({ type, children: await buildInlines(nested.tokens, context) });
        break;
      }
      case 'codespan': {
        const code = token as Tokens.Codespan;
        inlines.push({ type: 'inlineCode', text: context.interpolation.sourceValue(codeSpanContent(code.raw)) });
        break;
      }
      case 'br':
        inlines.push({ type: 'lineBreak' });
        break;
      case 'link': {
        const link = token as Tokens.Link;
        const children = await buildInlines(link.tokens, context);
        const preparedLink = prepareLink(context.interpolation.sourceValue(link.href), link.title ?? undefined, context);
        if (!preparedLink) inlines.push(...children);
        else inlines.push({ type: 'link', link: preparedLink, children });
        break;
      }
      case 'image': {
        const image = token as Tokens.Image;
        const alt = context.interpolation.textValue(image.text).trim();
        const preparedImage = await prepareImage(context.interpolation.sourceValue(image.href), alt, context);
        const prepared: { type: 'image'; image: NarrativeImage; title?: string } = { type: 'image', image: preparedImage };
        if (image.title !== null) prepared.title = image.title;
        inlines.push(prepared);
        break;
      }
      case 'html': {
        const html = token as Tokens.HTML | Tokens.Tag;
        inlines.push(...literalTextNodes(context.interpolation.textValue(html.text)));
        break;
      }
      default:
        throw new AmxError({
          code: 'AMX6001',
          message: `Unsupported Markdown inline token '${token.type}'`,
          file: context.options.file
        });
    }
  }
  return inlines;
}

function prepareLink(href: string, title: string | undefined, context: BuildContext): NarrativeLink | undefined {
  let link: NarrativeLink;
  if (href.startsWith('#')) {
    let targetId: string;
    try {
      targetId = decodeURIComponent(href.slice(1));
    } catch {
      return rejectLink(context, 'invalid-internal-fragment');
    }
    link = { type: 'internal', targetId, ...(title === undefined ? {} : { title }) };
  } else if (/^https?:\/\//i.test(href)) {
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      return rejectLink(context, 'invalid-external-target');
    }
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
      return rejectLink(context, 'invalid-external-target');
    }
    link = { type: 'external', href: url.href, ...(title === undefined ? {} : { title }) };
  } else if (/^[A-Za-z][A-Za-z\d+.-]*:/.test(href) || href.startsWith('//')) {
    return rejectLink(context, 'unsupported-scheme');
  } else {
    try {
      const path = parseRelativeTarget(href, context.options.file);
      if (!LOCAL_LINK_EXTENSIONS.has(extension(path.path))) return rejectLink(context, 'invalid-local-target');
      const source = sourceContext(context);
      resolveContainedFile(source, path.path, context.options.file, 'Narrative local link must target a contained regular file');
      link = {
        type: 'local',
        path: path.path,
        sourceBase: 'document-directory',
        ...(path.query === undefined ? {} : { query: path.query }),
        ...(path.fragment === undefined ? {} : { fragment: path.fragment }),
        ...(title === undefined ? {} : { title })
      };
    } catch (error) {
      if (!(error instanceof AmxError)) throw error;
      return rejectLink(context, 'invalid-local-target');
    }
  }
  return link;
}

async function prepareImage(href: string, alt: string, context: BuildContext): Promise<NarrativeImage> {
  if (!alt) fail('AMX6001', 'Narrative images require descriptive alt text', context.options.file);
  const path = parseRelativeTarget(href, context.options.file);
  if (path.query !== undefined || path.fragment !== undefined) {
    fail('AMX6001', 'Narrative image paths cannot include a query or fragment', context.options.file);
  }
  const extensionName = extension(path.path);
  const expectedFormat = extensionName === '.png' ? 'png' : extensionName === '.jpg' || extensionName === '.jpeg' ? 'jpeg' : undefined;
  if (!expectedFormat) fail('AMX6001', 'Narrative images must be local PNG or JPEG files', context.options.file);

  const source = sourceContext(context);
  const candidate = resolveContainedFile(source, path.path, context.options.file, 'Narrative image must be a contained regular file');
  const inputStat = statSync(candidate);
  if (inputStat.size > MAX_IMAGE_BYTES) {
    fail('AMX6001', 'Narrative image exceeds the 4 MiB input limit', context.options.file);
  }
  const bytes = readFileSync(candidate);
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    fail('AMX6001', 'Narrative image exceeds the 4 MiB input limit', context.options.file);
  }
  if (!hasExpectedSignature(bytes, expectedFormat)) {
    fail('AMX6001', 'Narrative image extension does not match PNG or JPEG content', context.options.file);
  }

  const image = sharp(bytes, { animated: true, limitInputPixels: MAX_IMAGE_PIXELS });
  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;
  try {
    metadata = await image.metadata();
  } catch (error) {
    if (error instanceof AmxError) throw error;
    fail('AMX6001', 'Narrative image is not a supported PNG or JPEG file', context.options.file);
  }
  if (metadata.format !== expectedFormat) {
    fail('AMX6001', 'Narrative image extension does not match its image format', context.options.file);
  }
  if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS || (metadata.pages ?? 1) > 1) {
    fail('AMX6001', 'Narrative image dimensions or frame count are invalid', context.options.file);
  }

  let sanitized: { data: Buffer; info: { format: string; width: number; height: number } };
  try {
    const output = sharp(bytes, { animated: false, limitInputPixels: MAX_IMAGE_PIXELS }).rotate();
    sanitized = expectedFormat === 'png'
      ? await output.png().toBuffer({ resolveWithObject: true })
      : await output.jpeg({ quality: 90 }).toBuffer({ resolveWithObject: true });
  } catch (error) {
    if (error instanceof AmxError) throw error;
    fail('AMX6001', 'Narrative image could not be sanitized', context.options.file);
  }
  if (sanitized.data.byteLength > MAX_IMAGE_BYTES) {
    fail('AMX6002', 'Sanitized narrative image exceeds the 4 MiB output limit', context.options.file);
  }
  if (sanitized.info.format !== expectedFormat) {
    fail('AMX6001', 'Sanitized narrative image has an unexpected format', context.options.file);
  }

  const mime = expectedFormat === 'png' ? 'image/png' : 'image/jpeg';
  return Object.freeze({
    format: expectedFormat,
    dataUri: `data:${mime};base64,${sanitized.data.toString('base64')}`,
    width: sanitized.info.width,
    height: sanitized.info.height,
    inputBytes: bytes.byteLength,
    outputBytes: sanitized.data.byteLength,
    alt
  });
}

function sourceContext(context: BuildContext): SourceContext {
  if (context.sourceContext) return context.sourceContext;
  if (!context.options.file) {
    fail('AMX6001', 'Relative narrative links and images require a source document path', context.options.file);
  }
  const directory = canonicalDirectory(
    dirname(resolve(context.options.file)),
    'Narrative source document directory must be an existing directory'
  );
  const root = context.options.projectRoot
    ? canonicalDirectory(context.options.projectRoot)
    : directory;
  if (!isSameOrContained(root, directory)) {
    fail('AMX6001', 'Narrative source document must be contained within the permitted project root', context.options.file);
  }
  context.sourceContext = { root, directory };
  return context.sourceContext;
}

function resolveContainedFile(source: SourceContext, relativePath: string, file: string | undefined, message: string): string {
  const candidate = resolve(source.directory, ...relativePath.split('/'));
  if (!isContained(source.root, candidate) || hasSymlink(source.root, candidate) || !existsSync(candidate) || !lstatSync(candidate).isFile()) {
    fail('AMX6001', message, file);
  }
  const canonical = realpathSync(candidate);
  if (!isContained(source.root, canonical)) fail('AMX6001', message, file);
  return canonical;
}

function parseRelativeTarget(
  href: string,
  file?: string
): { readonly path: string; readonly query?: string; readonly fragment?: string } {
  const hashIndex = href.indexOf('#');
  const beforeFragment = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? undefined : href.slice(hashIndex + 1);
  const queryIndex = beforeFragment.indexOf('?');
  const encodedPath = queryIndex === -1 ? beforeFragment : beforeFragment.slice(0, queryIndex);
  const query = queryIndex === -1 ? undefined : beforeFragment.slice(queryIndex + 1);
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(encodedPath);
  } catch {
    fail('AMX6001', 'Narrative local path contains invalid percent encoding', file);
  }
  if (!decodedPath || decodedPath.startsWith('/') || decodedPath.includes('\\') || /^[A-Za-z]:/.test(decodedPath) || /[\u0000-\u001f\u007f]/u.test(decodedPath)) {
    fail('AMX6001', 'Narrative local paths must be relative to the source document', file);
  }
  const segments = decodedPath.split('/');
  if (segments.some((segment, index) => segment === '' && index !== segments.length - 1)) {
    fail('AMX6001', 'Narrative local paths cannot contain empty path segments', file);
  }
  const normalizedPath = segments.filter(segment => segment !== '' && segment !== '.').join('/');
  if (!normalizedPath) fail('AMX6001', 'Narrative local path must identify a file', file);
  return {
    path: normalizedPath,
    ...(query === undefined ? {} : { query }),
    ...(fragment === undefined ? {} : { fragment })
  };
}

function isPageBreakDirective(text: string): boolean {
  return /^[\t ]*<!-- page-break -->[\t ]*\n*$/u.test(text);
}

function codeSpanContent(raw: string): string {
  const delimiter = raw.match(/^`+/u)?.[0];
  if (!delimiter || !raw.endsWith(delimiter)) return raw;
  return raw.slice(delimiter.length, -delimiter.length);
}

function uniqueHeadingId(children: readonly NarrativeInline[], used: Set<string>): string {
  const plain = inlinePlainText(children)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  const base = plain || 'section';
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  used.add(candidate);
  return candidate;
}

function inlinePlainText(inlines: readonly NarrativeInline[]): string {
  return inlines.map(inline => {
    if (inline.type === 'text' || inline.type === 'inlineCode') return inline.text;
    if (inline.type === 'lineBreak') return ' ';
    if (inline.type === 'image') return inline.image.alt;
    return inlinePlainText(inline.children);
  }).join('');
}

function collectHeadingIds(blocks: readonly NarrativeBlock[], ids: Set<string>): void {
  for (const block of blocks) {
    if (block.type === 'heading') ids.add(block.id);
    else if (block.type === 'blockquote') collectHeadingIds(block.blocks, ids);
    else if (block.type === 'list') {
      for (const item of block.items) collectHeadingIds(item.blocks, ids);
    }
  }
}

function rejectLink(context: BuildContext, reason: NarrativeDiagnostic['reason']): undefined {
  context.diagnostics.push({ type: 'rejectedLink', reason });
  return undefined;
}

function resolveInternalLinks(blocks: readonly NarrativeBlock[], ids: ReadonlySet<string>): NarrativeBlock[] {
  const resolved: NarrativeBlock[] = [];
  for (const block of blocks) {
    if (block.type === 'heading' || block.type === 'paragraph') {
      if (block.type === 'heading') {
        resolved.push({ type: 'heading', depth: block.depth, id: block.id, children: resolveInlineLinks(block.children, ids) });
      } else {
        resolved.push({ type: 'paragraph', children: resolveInlineLinks(block.children, ids) });
      }
    } else if (block.type === 'blockquote') {
      resolved.push({ type: 'blockquote', blocks: resolveInternalLinks(block.blocks, ids) });
    } else if (block.type === 'list') {
      resolved.push({
        type: 'list',
        ordered: block.ordered,
        items: block.items.map(item => ({
          ...(item.checked === undefined ? {} : { checked: item.checked }),
          blocks: resolveInternalLinks(item.blocks, ids)
        })),
        ...(block.start === undefined ? {} : { start: block.start })
      });
    } else if (block.type === 'table') {
      resolved.push({
        type: 'table',
        align: block.align,
        header: block.header.map(cell => resolveInlineLinks(cell, ids)),
        rows: block.rows.map(row => row.map(cell => resolveInlineLinks(cell, ids)))
      });
    } else {
      resolved.push(block);
    }
  }
  return resolved;
}

function resolveInlineLinks(inlines: readonly NarrativeInline[], ids: ReadonlySet<string>): NarrativeInline[] {
  return inlines.flatMap(inline => {
    if (inline.type === 'link' && inline.link.type === 'internal' && !ids.has(inline.link.targetId)) {
      return resolveInlineLinks(inline.children, ids);
    }
    if (inline.type === 'link' || inline.type === 'strong' || inline.type === 'emphasis' || inline.type === 'delete') {
      return [{ ...inline, children: resolveInlineLinks(inline.children, ids) }];
    }
    return [inline];
  });
}

function textNodes(text: string): NarrativeInline[] {
  return text ? [{ type: 'text', text }] : [];
}

function literalTextNodes(text: string): NarrativeInline[] {
  const nodes: NarrativeInline[] = [];
  for (const [index, line] of text.split('\n').entries()) {
    if (index > 0) nodes.push({ type: 'lineBreak' });
    nodes.push(...textNodes(line));
  }
  return nodes;
}

function extension(path: string): string {
  return extname(path.replace(/\//g, sep)).toLowerCase();
}

function hasExpectedSignature(bytes: Uint8Array, format: 'png' | 'jpeg'): boolean {
  if (format === 'png') {
    return bytes.byteLength >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  return bytes.byteLength >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isSameOrContained(root: string, candidate: string): boolean {
  return resolve(root) === resolve(candidate) || isContained(root, candidate);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function freezeDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach(item => freezeDeep(item));
    return Object.freeze(value) as T;
  }
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(item => freezeDeep(item));
    return Object.freeze(value) as T;
  }
  return value;
}

function fail(code: 'AMX6001' | 'AMX6002', message: string, file?: string): never {
  throw new AmxError({ code, message, file });
}
