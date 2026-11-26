import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { AmxError } from '../diagnostics/errors';
import { formatAmx } from '../formatter/formatAmx';
import { parseExpression } from '../parser/parseExpression';
import { evaluateExpression } from '../runtime/evaluateExpression';
import { formatAmxValue } from '../runtime/valueSerialization';
import { parseNarrativeImageWidth, prepareNarratives } from './narrativeModel';
import { canonicalDirectory, hasSymlink, isContained } from './reportPaths';
const REPORT_FIELDS = new Set(['organization', 'logo', 'logoAlt', 'stylesheet', 'accent', 'author', 'status', 'classification', 'footer', 'sourceVisible', 'imageWidth']);
const TEXT_LIMITS = { organization: 120, logoAlt: 120, stylesheet: 240, author: 120, status: 80, classification: 80, footer: 300, imageWidth: 16 };
const STYLESHEET_BYTE_LIMIT = 256 * 1024;
export async function prepareReport(doc, env, options = {}) {
    const projectReport = readProjectReport(options.projectRoot);
    const frontMatter = asRecord((doc.metadata ?? {}).report, 'Invalid report frontmatter', options.file);
    validateReport(projectReport, '.openamx/project.json', options.projectRoot);
    validateReport(frontMatter, 'frontmatter', options.file);
    const identity = await resolveIdentity(projectReport, frontMatter, options);
    const narrativeSources = doc.nodes.flatMap(node => node.type === 'narrative'
        ? [{ content: node.content, line: node.source?.line }]
        : []);
    const narratives = await prepareNarratives(narrativeSources, {
        file: options.file,
        projectRoot: options.projectRoot,
        interpolate: (expression, line) => {
            const value = evaluateExpression(parseExpression(expression, line === undefined ? undefined : { line, column: 1 }), env, options.file);
            return formatAmxValue(value);
        }
    });
    const emissionsByNode = new Map();
    for (const emission of env.viewEmissions) {
        const emissions = emissionsByNode.get(emission.documentNodeIndex) ?? [];
        emissions.push(emission);
        emissionsByNode.set(emission.documentNodeIndex, emissions);
    }
    const diagramsByNode = new Map();
    const importedDiagrams = [];
    const entryPath = options.file ? canonicalFilePath(options.file) : undefined;
    for (const emission of env.diagramEmissions) {
        const model = emission.model;
        if (entryPath && model.file && canonicalFilePath(model.file) !== entryPath) {
            importedDiagrams.push(model);
            continue;
        }
        const diagrams = diagramsByNode.get(model.documentNodeIndex) ?? [];
        diagrams.push(model);
        diagramsByNode.set(model.documentNodeIndex, diagrams);
    }
    const firstExecutableNode = doc.nodes.findIndex(node => node.type === 'executableCodeBlock');
    const items = [];
    const diagrams = [];
    let diagramOrder = 0;
    let narrativeIndex = 0;
    for (const [index, node] of doc.nodes.entries()) {
        if (node.type === 'narrative') {
            const narrative = narratives[narrativeIndex++];
            if (!narrative)
                throw new Error('Prepared narrative order does not match the source document');
            items.push(Object.freeze({
                type: 'narrative',
                text: narrative.text,
                markdown: narrative.blocks,
                diagnostics: narrative.diagnostics
            }));
            continue;
        }
        if (node.type !== 'executableCodeBlock')
            continue;
        if (identity.sourceVisible)
            items.push(Object.freeze({ type: 'source', text: formatAmx(node.content) }));
        if (index === firstExecutableNode) {
            for (const model of importedDiagrams) {
                diagrams.push(Object.freeze({ model, beforeItemIndex: items.length, order: diagramOrder++ }));
            }
        }
        const blockEmissions = [
            ...(emissionsByNode.get(index) ?? []).map(emission => ({ type: 'view', emission, statementIndex: emission.statementIndex })),
            ...(diagramsByNode.get(index) ?? []).map(model => ({ type: 'diagram', model, statementIndex: model.statementIndex }))
        ].sort((left, right) => left.statementIndex - right.statementIndex);
        for (const emission of blockEmissions) {
            if (emission.type === 'view')
                items.push(Object.freeze({ type: 'view', emission: emission.emission }));
            else
                diagrams.push(Object.freeze({ model: emission.model, beforeItemIndex: items.length, order: diagramOrder++ }));
        }
    }
    const metadata = doc.metadata ?? {};
    const title = typeof metadata.title === 'string' && metadata.title.trim() ? metadata.title.trim() : 'OpenAMX Document';
    return Object.freeze({
        title,
        identity,
        items: Object.freeze(items),
        ...(diagrams.length ? { diagrams: Object.freeze(diagrams) } : {})
    });
}
function canonicalFilePath(file) {
    const path = existsSync(file) ? realpathSync(file) : resolve(file);
    return process.platform === 'win32' ? path.toLocaleLowerCase('en-US') : path;
}
function readProjectReport(projectRoot) {
    if (!projectRoot)
        return {};
    const root = canonicalDirectory(projectRoot);
    const configPath = resolve(root, '.openamx', 'project.json');
    if (!existsSync(configPath))
        return {};
    let config;
    try {
        config = asRecord(JSON.parse(readFileSync(configPath, 'utf8')), 'Invalid project configuration', configPath);
    }
    catch (error) {
        if (error instanceof AmxError)
            throw error;
        fail('AMX6001', 'Invalid project configuration', configPath);
    }
    for (const key of Object.keys(config)) {
        if (!['version', 'inputs', 'report'].includes(key))
            fail('AMX6001', `Unknown project configuration key '${key}'`, configPath);
    }
    if (config.version !== 1 || !asPlainRecord(config.inputs))
        fail('AMX6001', 'Project configuration requires version 1 and an inputs mapping', configPath);
    return config.report === undefined ? {} : asRecord(config.report, 'Project report must be an object', configPath);
}
export function validateReportSettings(report, projectRoot, file) {
    validateReport(report, file ?? '.openamx/project.json', file);
    const validations = [];
    if (typeof report.logo === 'string')
        validations.push(prepareLogo(report.logo, String(report.logoAlt ?? ''), projectRoot, file));
    if (typeof report.stylesheet === 'string')
        validations.push(Promise.resolve(readReportStylesheet(report.stylesheet, projectRoot, file)));
    return Promise.all(validations).then(() => undefined);
}
function validateReport(report, location, file) {
    for (const [key, value] of Object.entries(report)) {
        if (!REPORT_FIELDS.has(key))
            fail('AMX6001', `Unknown report field '${key}'`, file ?? location);
        if (key === 'sourceVisible') {
            if (typeof value !== 'boolean')
                fail('AMX6001', 'Report sourceVisible must be a Boolean', file ?? location);
            continue;
        }
        if (typeof value !== 'string')
            fail('AMX6001', `Report ${key} must be a string`, file ?? location);
        const text = value.trim();
        if (!text || /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text))
            fail('AMX6001', `Report ${key} contains invalid text`, file ?? location);
        if (TEXT_LIMITS[key] !== undefined && [...text].length > TEXT_LIMITS[key])
            fail('AMX6001', `Report ${key} exceeds its length limit`, file ?? location);
        if (key === 'imageWidth' && !parseNarrativeImageWidth(text)) {
            fail('AMX6001', 'Report imageWidth must be a positive pixel width up to 4096px or a percentage from 1% to 100%', file ?? location);
        }
        if (key === 'stylesheet' && !isValidStylesheetPath(text)) {
            fail('AMX6001', 'Report stylesheet must be a project-relative .css path', file ?? location);
        }
    }
    if (report.logoAlt !== undefined && report.logo === undefined)
        fail('AMX6001', 'Report logoAlt requires a logo', file ?? location);
    if (report.accent !== undefined && (typeof report.accent !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(report.accent)))
        fail('AMX6001', 'Report accent must use #RRGGBB', file ?? location);
}
async function resolveIdentity(projectReport, frontMatter, options) {
    if (frontMatter.logo !== undefined && frontMatter.logoAlt === undefined)
        fail('AMX6001', 'A frontmatter logo override requires logoAlt', options.file);
    const merged = { ...projectReport, ...frontMatter };
    const logoPath = typeof merged.logo === 'string' ? merged.logo.trim() : undefined;
    const logo = logoPath ? await prepareLogo(logoPath, String(merged.logoAlt ?? ''), options.projectRoot, options.file) : undefined;
    const stylesheetPath = typeof merged.stylesheet === 'string' ? merged.stylesheet.trim() : undefined;
    const stylesheetCss = stylesheetPath && options.includeStylesheet !== false
        ? readReportStylesheet(stylesheetPath, options.projectRoot, options.file, options.stylesheetOverlay)
        : undefined;
    return Object.freeze({
        organization: text(merged.organization),
        logo,
        stylesheetCss,
        accent: effectiveReportAccent(text(merged.accent) ?? '#146C94'),
        author: text(merged.author),
        status: text(merged.status),
        classification: text(merged.classification),
        footer: text(merged.footer),
        imageWidth: typeof merged.imageWidth === 'string' ? parseNarrativeImageWidth(merged.imageWidth) : undefined,
        sourceVisible: merged.sourceVisible === undefined ? true : merged.sourceVisible
    });
}
export function readReportStylesheet(path, projectRoot, file, overlay) {
    if (!projectRoot)
        fail('AMX6001', 'A report stylesheet requires an explicit project root', file);
    if (!isValidStylesheetPath(path))
        fail('AMX6001', 'Report stylesheet must be a project-relative .css path', file);
    const root = canonicalDirectory(projectRoot);
    const candidate = resolve(root, path);
    if (!isContained(root, candidate) || hasSymlink(root, candidate) || !existsSync(candidate) || !lstatSync(candidate).isFile()) {
        fail('AMX6001', 'Report stylesheet must be a contained regular file', file);
    }
    const overlayText = overlay?.get(candidate);
    const bytes = overlayText === undefined ? readFileSync(candidate) : Buffer.from(overlayText, 'utf8');
    if (bytes.byteLength > STYLESHEET_BYTE_LIMIT)
        fail('AMX6001', 'Report stylesheet exceeds 256 KiB', file);
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    }
    catch {
        fail('AMX6001', 'Report stylesheet must be valid UTF-8', file);
    }
}
function isValidStylesheetPath(path) {
    return path.length > 0
        && path.length <= 240
        && path.endsWith('.css')
        && !path.startsWith('/')
        && !path.includes('\\')
        && !path.includes(':')
        && !/[\u0000-\u001f\u007f]/u.test(path)
        && path.split('/').every(segment => segment !== '' && segment !== '.' && segment !== '..' && !segment.startsWith('.'));
}
async function prepareLogo(path, alt, projectRoot, file) {
    if (!projectRoot)
        fail('AMX6001', 'A report logo requires an explicit project root', file);
    if (!alt.trim())
        fail('AMX6001', 'A report logo requires descriptive logoAlt', file);
    if (!/^[A-Za-z0-9._/-]+\.(png|jpg)$/.test(path) || path.includes('..') || path.includes('//') || path.startsWith('/') || path.includes('\\'))
        fail('AMX6001', 'Report logo must be a contained .png or .jpg path', file);
    const root = canonicalDirectory(projectRoot);
    const candidate = resolve(root, path);
    if (!isContained(root, candidate) || hasSymlink(root, candidate) || !existsSync(candidate) || !lstatSync(candidate).isFile())
        fail('AMX6001', 'Report logo must be a contained regular file', file);
    const bytes = readFileSync(candidate);
    if (bytes.byteLength > 256 * 1024)
        fail('AMX6001', 'Report logo exceeds 256 KiB', file);
    try {
        const image = sharp(bytes, { animated: false, limitInputPixels: 1_048_576 });
        const metadata = await image.metadata();
        const expectedFormat = path.endsWith('.jpg') ? 'jpeg' : 'png';
        if (metadata.format !== expectedFormat)
            fail('AMX6001', 'Report logo file extension does not match its image format', file);
        if (!metadata.width || !metadata.height || metadata.width > 1024 || metadata.height > 1024 || metadata.width * metadata.height > 1_048_576 || (metadata.pages ?? 1) > 1)
            fail('AMX6001', 'Report logo dimensions are invalid', file);
        const sanitized = await image.rotate().png().toBuffer();
        if (sanitized.byteLength > 1024 * 1024)
            fail('AMX6002', 'Sanitized report logo exceeds 1 MiB', file);
        return Object.freeze({ bytes: Uint8Array.from(sanitized), alt: alt.trim(), dataUri: `data:image/png;base64,${sanitized.toString('base64')}` });
    }
    catch (error) {
        if (error instanceof AmxError)
            throw error;
        fail('AMX6001', 'Report logo is not a supported image', file);
    }
}
function asRecord(value, message, file) {
    if (value === undefined)
        return {};
    if (!asPlainRecord(value))
        fail('AMX6001', message, file);
    return value;
}
function asPlainRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function text(value) {
    return typeof value === 'string' ? value.trim() || undefined : undefined;
}
export function effectiveReportAccent(accent) {
    const channels = [accent.slice(1, 3), accent.slice(3, 5), accent.slice(5, 7)].map(value => Number.parseInt(value, 16) / 255);
    const luminance = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
        .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
    return (1.05 / (luminance + 0.05)) >= 4.5 ? accent : '#146C94';
}
function fail(code, message, file) {
    throw new AmxError({ code, message, file });
}
//# sourceMappingURL=reportPreparation.js.map