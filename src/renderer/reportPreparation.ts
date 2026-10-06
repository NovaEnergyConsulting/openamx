import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import sharp from 'sharp';
import type { OpenAmxDocument } from '../ast/types';
import { AmxError } from '../diagnostics/errors';
import { formatAmx } from '../formatter/formatAmx';
import { parseExpression } from '../parser/parseExpression';
import { evaluateExpression } from '../runtime/evaluateExpression';
import type { Environment, ViewEmission } from '../runtime/environment';
import { isMeasurement } from '../runtime/measurement';

const REPORT_FIELDS = new Set(['organization', 'logo', 'logoAlt', 'accent', 'author', 'status', 'classification', 'footer', 'sourceVisible']);
const TEXT_LIMITS: Record<string, number> = { organization: 120, logoAlt: 120, author: 120, status: 80, classification: 80, footer: 300 };

export interface PreparedLogo {
  readonly bytes: Uint8Array;
  readonly alt: string;
  readonly dataUri: string;
}

export interface ResolvedReportIdentity {
  readonly organization?: string;
  readonly logo?: PreparedLogo;
  readonly accent: string;
  readonly author?: string;
  readonly status?: string;
  readonly classification?: string;
  readonly footer?: string;
  readonly sourceVisible: boolean;
}

export type PreparedReportItem =
  | { readonly type: 'narrative'; readonly text: string }
  | { readonly type: 'source'; readonly text: string }
  | { readonly type: 'view'; readonly emission: ViewEmission };

export interface PreparedReport {
  readonly title: string;
  readonly identity: ResolvedReportIdentity;
  readonly items: readonly PreparedReportItem[];
}

export interface ReportPreparationOptions {
  readonly file?: string;
  readonly projectRoot?: string;
}

export async function prepareReport(doc: OpenAmxDocument, env: Environment, options: ReportPreparationOptions = {}): Promise<PreparedReport> {
  const projectReport = readProjectReport(options.projectRoot);
  const frontMatter = asRecord((doc.metadata ?? {}).report, 'Invalid report frontmatter', options.file);
  validateReport(projectReport, '.openamx/project.json', options.projectRoot);
  validateReport(frontMatter, 'frontmatter', options.file);
  const identity = await resolveIdentity(projectReport, frontMatter, options);
  const emissionsByNode = new Map<number, ViewEmission[]>();
  for (const emission of env.viewEmissions) {
    const emissions = emissionsByNode.get(emission.documentNodeIndex) ?? [];
    emissions.push(emission);
    emissionsByNode.set(emission.documentNodeIndex, emissions);
  }

  const items: PreparedReportItem[] = [];
  for (const [index, node] of doc.nodes.entries()) {
    if (node.type === 'narrative') {
      items.push(Object.freeze({ type: 'narrative', text: substituteInlines(node.content, env, options.file, node.source?.line) }));
      continue;
    }
    if (node.type !== 'executableCodeBlock') continue;
    if (identity.sourceVisible) items.push(Object.freeze({ type: 'source', text: formatAmx(node.content) }));
    for (const emission of emissionsByNode.get(index) ?? []) items.push(Object.freeze({ type: 'view', emission }));
  }
  const metadata = doc.metadata ?? {};
  const title = typeof metadata.title === 'string' && metadata.title.trim() ? metadata.title.trim() : 'OpenAMX Document';
  return Object.freeze({ title, identity, items: Object.freeze(items) });
}

function readProjectReport(projectRoot?: string): Record<string, unknown> {
  if (!projectRoot) return {};
  const root = canonicalDirectory(projectRoot);
  const configPath = resolve(root, '.openamx', 'project.json');
  if (!existsSync(configPath)) return {};
  let config: Record<string, unknown>;
  try {
    config = asRecord(JSON.parse(readFileSync(configPath, 'utf8')), 'Invalid project configuration', configPath);
  } catch (error) {
    if (error instanceof AmxError) throw error;
    fail('AMX6001', 'Invalid project configuration', configPath);
  }
  for (const key of Object.keys(config)) {
    if (!['version', 'inputs', 'report'].includes(key)) fail('AMX6001', `Unknown project configuration key '${key}'`, configPath);
  }
  if (config.version !== 1 || !asPlainRecord(config.inputs)) fail('AMX6001', 'Project configuration requires version 1 and an inputs mapping', configPath);
  return config.report === undefined ? {} : asRecord(config.report, 'Project report must be an object', configPath);
}

export function validateReportSettings(report: Record<string, unknown>, projectRoot?: string, file?: string): Promise<void> {
  validateReport(report, file ?? '.openamx/project.json', file);
  if (report.logo === undefined) return Promise.resolve();
  if (typeof report.logo !== 'string') return Promise.resolve();
  return prepareLogo(report.logo, String(report.logoAlt ?? ''), projectRoot, file).then(() => undefined);
}

function validateReport(report: Record<string, unknown>, location: string, file?: string): void {
  for (const [key, value] of Object.entries(report)) {
    if (!REPORT_FIELDS.has(key)) fail('AMX6001', `Unknown report field '${key}'`, file ?? location);
    if (key === 'sourceVisible') {
      if (typeof value !== 'boolean') fail('AMX6001', 'Report sourceVisible must be a Boolean', file ?? location);
      continue;
    }
    if (typeof value !== 'string') fail('AMX6001', `Report ${key} must be a string`, file ?? location);
    const text = value.trim();
    if (!text || /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text)) fail('AMX6001', `Report ${key} contains invalid text`, file ?? location);
    if (TEXT_LIMITS[key] !== undefined && [...text].length > TEXT_LIMITS[key]) fail('AMX6001', `Report ${key} exceeds its length limit`, file ?? location);
  }
  if (report.logoAlt !== undefined && report.logo === undefined) fail('AMX6001', 'Report logoAlt requires a logo', file ?? location);
  if (report.accent !== undefined && (typeof report.accent !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(report.accent))) fail('AMX6001', 'Report accent must use #RRGGBB', file ?? location);
}

async function resolveIdentity(projectReport: Record<string, unknown>, frontMatter: Record<string, unknown>, options: ReportPreparationOptions): Promise<ResolvedReportIdentity> {
  if (frontMatter.logo !== undefined && frontMatter.logoAlt === undefined) fail('AMX6001', 'A frontmatter logo override requires logoAlt', options.file);
  const merged = { ...projectReport, ...frontMatter };
  const logoPath = typeof merged.logo === 'string' ? merged.logo.trim() : undefined;
  const logo = logoPath ? await prepareLogo(logoPath, String(merged.logoAlt ?? ''), options.projectRoot, options.file) : undefined;
  return Object.freeze({
    organization: text(merged.organization),
    logo,
    accent: effectiveReportAccent(text(merged.accent) ?? '#146C94'),
    author: text(merged.author),
    status: text(merged.status),
    classification: text(merged.classification),
    footer: text(merged.footer),
    sourceVisible: merged.sourceVisible === undefined ? true : merged.sourceVisible as boolean
  });
}

async function prepareLogo(path: string, alt: string, projectRoot: string | undefined, file?: string): Promise<PreparedLogo> {
  if (!projectRoot) fail('AMX6001', 'A report logo requires an explicit project root', file);
  if (!alt.trim()) fail('AMX6001', 'A report logo requires descriptive logoAlt', file);
  if (!/^[A-Za-z0-9._/-]+\.(png|jpg)$/.test(path) || path.includes('..') || path.includes('//') || path.startsWith('/') || path.includes('\\')) fail('AMX6001', 'Report logo must be a contained .png or .jpg path', file);
  const root = canonicalDirectory(projectRoot);
  const candidate = resolve(root, path);
  if (!isContained(root, candidate) || hasSymlink(root, candidate) || !existsSync(candidate) || !lstatSync(candidate).isFile()) fail('AMX6001', 'Report logo must be a contained regular file', file);
  const bytes = readFileSync(candidate);
  if (bytes.byteLength > 256 * 1024) fail('AMX6001', 'Report logo exceeds 256 KiB', file);
  try {
    const image = sharp(bytes, { animated: false, limitInputPixels: 1_048_576 });
    const metadata = await image.metadata();
    const expectedFormat = path.endsWith('.jpg') ? 'jpeg' : 'png';
    if (metadata.format !== expectedFormat) fail('AMX6001', 'Report logo file extension does not match its image format', file);
    if (!metadata.width || !metadata.height || metadata.width > 1024 || metadata.height > 1024 || metadata.width * metadata.height > 1_048_576 || (metadata.pages ?? 1) > 1) fail('AMX6001', 'Report logo dimensions are invalid', file);
    const sanitized = await image.rotate().png().toBuffer();
    if (sanitized.byteLength > 1024 * 1024) fail('AMX6002', 'Sanitized report logo exceeds 1 MiB', file);
    return Object.freeze({ bytes: Uint8Array.from(sanitized), alt: alt.trim(), dataUri: `data:image/png;base64,${sanitized.toString('base64')}` });
  } catch (error) {
    if (error instanceof AmxError) throw error;
    fail('AMX6001', 'Report logo is not a supported image', file);
  }
}

function substituteInlines(content: string, env: Environment, file?: string, line?: number): string {
  return content.replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, (_full, expression: string) => {
    if (!expression.trim()) return '';
    return valueToString(evaluateExpression(parseExpression(expression.trim(), line === undefined ? undefined : { line, column: 1 }), env, file));
  });
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(valueToString).join(', ');
  if (isMeasurement(value)) return `${String(value.value)} ${value.unit.text}`;
  return String(value);
}

function asRecord(value: unknown, message: string, file?: string): Record<string, unknown> {
  if (value === undefined) return {};
  if (!asPlainRecord(value)) fail('AMX6001', message, file);
  return value;
}

function asPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

export function effectiveReportAccent(accent: string): string {
  const channels = [accent.slice(1, 3), accent.slice(3, 5), accent.slice(5, 7)].map(value => Number.parseInt(value, 16) / 255);
  const luminance = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  return (1.05 / (luminance + 0.05)) >= 4.5 ? accent : '#146C94';
}

function canonicalDirectory(path: string): string {
  try {
    const canonical = realpathSync(path);
    if (!statSync(canonical).isDirectory()) fail('AMX6001', 'Project root must be an existing directory', path);
    return canonical;
  } catch (error) {
    if (error instanceof AmxError) throw error;
    fail('AMX6001', 'Project root must be an existing directory', path);
  }
}

function isContained(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  return relation !== '..' && !relation.startsWith(`..${sep}`) && relation !== '';
}

function hasSymlink(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  let current = root;
  for (const segment of relation.split(sep)) {
    current = resolve(current, segment);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) return true;
  }
  return false;
}

function fail(code: 'AMX6001' | 'AMX6002', message: string, file?: string): never {
  throw new AmxError({ code, message, file });
}