import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import sharp from 'sharp';
import { buildProbeDiagrams, evaluateDiagram, getModelSource, type DiagramElement, type DiagramModel, type EvaluatedDiagram } from './diagram-model';
import { loadEntryModule } from '../../../../src/runtime/moduleLoader';
import { parseExpression } from '../../../../src/parser/parseExpression';
import type { CheckedType } from '../../../../src/typechecker/checkDocument';
import type { DimensionMetadata, DimensionUnitRegistry, UnitMetadata } from '../../../../src/typechecker/dimensionTypes';

const probeDirectory = dirname(import.meta.path);
const artifactDirectory = resolve(probeDirectory, 'artifacts');
const repositoryRoot = resolve(probeDirectory, '../../../..');
const output = (name: string) => resolve(artifactDirectory, name);
interface PdfMakeProbe {
  setUrlAccessPolicy(policy: () => boolean): void;
  setLocalAccessPolicy(policy: (filePath: string) => boolean): void;
  setFonts(fonts: Readonly<Record<string, Readonly<Record<string, string>>>>): void;
  createPdf(definition: Record<string, unknown>): { getBuffer(): Promise<Uint8Array> };
}
const pdfmake = createRequire(import.meta.url)('pdfmake') as PdfMakeProbe;
const packagedFontRoot = resolve(repositoryRoot, 'src', 'renderer', 'pdfmake-fonts');
const pdfFontRoot = existsSync(resolve(packagedFontRoot, 'Roboto-Regular.ttf'))
  ? packagedFontRoot
  : resolve(dirname(createRequire(import.meta.url).resolve('pdfmake')), '..', 'fonts', 'Roboto');
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(filePath => filePath.startsWith(pdfFontRoot));
pdfmake.setFonts({
  Roboto: {
    normal: resolve(pdfFontRoot, 'Roboto-Regular.ttf'),
    bold: resolve(pdfFontRoot, 'Roboto-Medium.ttf'),
    italics: resolve(pdfFontRoot, 'Roboto-Italic.ttf'),
    bolditalics: resolve(pdfFontRoot, 'Roboto-MediumItalic.ttf')
  }
});
const numberText = (value: number) => {
  if (!Number.isFinite(value)) throw new Error(`Non-finite diagram coordinate: ${value}`);
  return String(Number(value.toFixed(4)));
};
const escapeXml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[character]!));
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]!));
const escapeJsonForHtml = (value: string) => value
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

function serializeCheckedType(type: CheckedType): object {
  if (type.kind === 'measurement') return { kind: type.kind, vector: [...type.vector] };
  if (type.kind === 'list' || type.kind === 'nullable') {
    return { kind: type.kind, element: serializeCheckedType(type.element) };
  }
  return type;
}

function serializeRegistry(
  registry: DimensionUnitRegistry | undefined
): undefined | {
  dimensions: readonly (readonly [string, Omit<DimensionMetadata, 'vector'> & { vector: readonly (readonly [string, number])[] }])[];
  units: readonly (readonly [string, Omit<UnitMetadata, 'vector'> & { vector: readonly (readonly [string, number])[] }])[];
  baseUnits: readonly (readonly [string, Omit<UnitMetadata, 'vector'> & { vector: readonly (readonly [string, number])[] }])[];
} {
  if (!registry) return undefined;
  const dimensions = [...registry.dimensions].map(([name, value]) => [
    name, { ...value, vector: [...value.vector] }
  ] as const);
  const units = [...registry.units].map(([name, value]) => [
    name, { ...value, vector: [...value.vector] }
  ] as const);
  const baseUnits = [...registry.baseUnits].map(([name, value]) => [
    name, { ...value, vector: [...value.vector] }
  ] as const);
  return { dimensions, units, baseUnits };
}

function serializeModelContext(model: DiagramModel): object {
  return {
    bindings: model.bindings,
    functions: model.functions,
    recordTypes: model.recordTypes,
    enumDeclarations: model.enumDeclarations,
    enumValues: model.enumValues.map(([name, value]) => [name, value]),
    bindingTypes: model.bindingTypes.map(([name, type]) => [name, serializeCheckedType(type)]),
    dimensionRegistry: serializeRegistry(model.dimensionRegistry)
  };
}

function svgForFrame(frame: EvaluatedDiagram): string {
  const { model } = frame;
  const elements: string[] = [];
  for (const element of frame.elements) {
    const geometry = element.geometry;
    const g = (name: string) => {
      const value = geometry[name];
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${element.name}.${name} must be a finite Number`);
      }
      return numberText(value);
    };
    const fill = escapeXml(element.style.fill ?? 'none');
    const stroke = escapeXml(element.style.stroke ?? 'none');
    const lineWidth = numberText(element.style.lineWidth ?? 1);
    if (!/^(?:#[0-9A-Fa-f]{6}|none)$/.test(fill) || !/^(?:#[0-9A-Fa-f]{6}|none)$/.test(stroke)) {
      throw new Error(`${element.name} has an unsupported color`);
    }
    if ((element.style.lineWidth ?? 1) <= 0) throw new Error(`${element.name} has a non-positive line width`);

    if (element.kind === 'line') {
      const x1 = Number(g('x1'));
      const y1 = Number(g('y1'));
      const x2 = Number(g('x2'));
      const y2 = Number(g('y2'));
      elements.push(`<line x1="${numberText(x1)}" y1="${numberText(y1)}" x2="${numberText(x2)}" y2="${numberText(y2)}" stroke="${stroke}" stroke-width="${lineWidth}" stroke-linecap="round"/>`);
      if (element.style.arrow === 'end') {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.hypot(dx, dy);
        if (length === 0) throw new Error(`${element.name} arrow must have nonzero length`);
        const ux = dx / length;
        const uy = dy / length;
        const headLength = 9;
        const halfWidth = 4.5;
        const baseX = x2 - headLength * ux;
        const baseY = y2 - headLength * uy;
        const points = [
          `${numberText(x2)},${numberText(y2)}`,
          `${numberText(baseX + halfWidth * uy)},${numberText(baseY - halfWidth * ux)}`,
          `${numberText(baseX - halfWidth * uy)},${numberText(baseY + halfWidth * ux)}`
        ].join(' ');
        elements.push(`<polygon points="${points}" fill="${stroke}"/>`);
      }
    } else if (element.kind === 'rectangle') {
      elements.push(`<rect x="${g('x')}" y="${g('y')}" width="${g('width')}" height="${g('height')}" fill="${fill}" stroke="${stroke}" stroke-width="${lineWidth}"/>`);
    } else if (element.kind === 'circle') {
      elements.push(`<circle cx="${g('cx')}" cy="${g('cy')}" r="${g('r')}" fill="${fill}" stroke="${stroke}" stroke-width="${lineWidth}"/>`);
    } else {
      const x = g('x');
      const y = g('y');
      const value = geometry.value;
      if (typeof value !== 'string') throw new Error(`${element.name}.value must be a String`);
      elements.push(`<text x="${x}" y="${y}" transform="translate(0 ${numberText(Number(y) * 2)}) scale(1,-1)" fill="${fill}" font-family="Arial, sans-serif" font-size="14">${escapeXml(value)}</text>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-labelledby="${model.id}-svg-title ${model.id}-svg-description"><title id="${model.id}-svg-title">${escapeXml(model.title)}</title><desc id="${model.id}-svg-description">${escapeXml(model.description)}</desc><g transform="translate(0 ${model.height}) scale(1,-1)">${elements.join('')}</g></svg>`;
}

function serializeModel(model: DiagramModel): object {
  return {
    id: model.id,
    title: model.title,
    description: model.description,
    width: model.width,
    height: model.height,
    time: model.time,
    timeSource: model.timeSource,
    elements: model.elements,
    ...serializeModelContext(model)
  };
}

function browserRuntimeSource(): string {
  return `
const svgNamespace = "http://www.w3.org/2000/svg";
const formatNumber = value => {
  if (!Number.isFinite(value)) throw new Error("non-finite geometry");
  return String(Number(value.toFixed(4)));
};
const svgNode = (name, attributes = {}) => {
  const node = document.createElementNS(svgNamespace, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
};
const evaluateFrame = (model, time) => {
  const environment = new OpenAmxProbe.Environment();
  for (const [name, value] of Object.entries(model.bindings)) environment.set(name, value);
  for (const fn of model.functions) environment.functions.set(fn.name, fn);
  for (const declaration of model.recordTypes ?? []) environment.recordTypes.set(declaration.name, declaration);
  for (const declaration of model.enumDeclarations ?? []) environment.enumDeclarations.set(declaration.name, declaration);
  for (const [name, values] of model.enumValues ?? []) environment.enumValues.set(name, values);
  const hydrateType = type => {
    if (type.kind === "measurement") return { ...type, vector: new Map(type.vector) };
    if (type.kind === "list" || type.kind === "nullable") return { ...type, element: hydrateType(type.element) };
    return type;
  };
  for (const [name, type] of model.bindingTypes ?? []) environment.bindingTypes.set(name, hydrateType(type));
  if (model.dimensionRegistry) {
    const hydrateMap = entries => new Map(entries.map(([name, value]) => [name, { ...value, vector: new Map(value.vector) }]));
    environment.dimensionRegistry = {
      dimensions: hydrateMap(model.dimensionRegistry.dimensions),
      units: hydrateMap(model.dimensionRegistry.units),
      baseUnits: hydrateMap(model.dimensionRegistry.baseUnits)
    };
  }
  environment.set(model.time.variable, time);
  const elements = model.elements.map(element => {
    const geometry = {};
    for (const [property, node] of Object.entries(element.geometry)) {
      const value = OpenAmxProbe.evaluateExpression(node, environment, element.source.file);
      if (typeof value === "number" && !Number.isFinite(value)) {
        const error = new Error(element.name + "." + property + " produced a non-finite Number");
        error.source = node.source ?? element.source;
        throw error;
      }
      if (typeof value !== "number" && typeof value !== "string") {
        const error = new Error(element.name + "." + property + " produced a non-scalar value");
        error.source = node.source ?? element.source;
        throw error;
      }
      geometry[property] = value;
    }
    return { ...element, geometry };
  });
  return { model, time, elements };
};
const drawFrame = (svg, frame) => {
  const { model } = frame;
  const content = svgNode("g", { transform: "translate(0 " + model.height + ") scale(1,-1)" });
  for (const element of frame.elements) {
    const getNumber = property => {
      const value = element.geometry[property];
      if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(element.name + "." + property + " must be finite");
      return formatNumber(value);
    };
    const stroke = element.style.stroke ?? "none";
    const fill = element.style.fill ?? "none";
    const width = formatNumber(element.style.lineWidth ?? 1);
    if (element.kind === "line") {
      const x1 = Number(getNumber("x1"));
      const y1 = Number(getNumber("y1"));
      const x2 = Number(getNumber("x2"));
      const y2 = Number(getNumber("y2"));
      content.append(svgNode("line", { x1, y1, x2, y2, stroke, "stroke-width": width, "stroke-linecap": "round" }));
      if (element.style.arrow === "end") {
        const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
        if (!length) throw new Error(element.name + " arrow must have nonzero length");
        const ux = dx / length, uy = dy / length, baseX = x2 - 9 * ux, baseY = y2 - 9 * uy;
        const points = [[x2,y2],[baseX + 4.5 * uy,baseY - 4.5 * ux],[baseX - 4.5 * uy,baseY + 4.5 * ux]]
          .map(point => point.map(formatNumber).join(",")).join(" ");
        content.append(svgNode("polygon", { points, fill: stroke }));
      }
    } else if (element.kind === "rectangle") {
      content.append(svgNode("rect", { x: getNumber("x"), y: getNumber("y"), width: getNumber("width"), height: getNumber("height"), fill, stroke, "stroke-width": width }));
    } else if (element.kind === "circle") {
      content.append(svgNode("circle", { cx: getNumber("cx"), cy: getNumber("cy"), r: getNumber("r"), fill, stroke, "stroke-width": width }));
    } else {
      const x = getNumber("x"), y = getNumber("y");
      const text = element.geometry.value;
      if (typeof text !== "string") throw new Error(element.name + ".value must be a String");
      const label = svgNode("text", { x, y, transform: "translate(0 " + formatNumber(Number(y) * 2) + ") scale(1,-1)", fill, "font-family": "Arial, sans-serif", "font-size": 14 });
      label.textContent = text;
      content.append(label);
    }
  }
  svg.replaceChildren(content);
};
const renderDiagram = model => {
  const section = document.createElement("figure");
  section.className = "diagram";
  section.setAttribute("aria-labelledby", model.id + "-title");
  section.setAttribute("aria-describedby", model.id + "-description");
  const caption = document.createElement("figcaption");
  const title = document.createElement("h2");
  title.id = model.id + "-title";
  title.textContent = model.title;
  const description = document.createElement("p");
  description.id = model.id + "-description";
  description.textContent = model.description;
  caption.append(title, description);
  const controls = document.createElement("div");
  controls.className = "controls";
  const play = document.createElement("button");
  play.type = "button";
  play.textContent = "Play";
  play.setAttribute("aria-label", "Play " + model.title);
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Reset";
  reset.setAttribute("aria-label", "Reset " + model.title);
  const scrubber = document.createElement("input");
  scrubber.type = "range";
  scrubber.min = String(model.time.start);
  scrubber.max = String(model.time.end);
  scrubber.step = "any";
  scrubber.value = String(model.time.start);
  scrubber.setAttribute("aria-label", "Time for " + model.title);
  const timeOutput = document.createElement("output");
  timeOutput.setAttribute("aria-live", "off");
  const loopLabel = document.createElement("label");
  const loop = document.createElement("input");
  loop.type = "checkbox";
  loop.setAttribute("aria-label", "Loop " + model.title);
  loopLabel.append(loop, document.createTextNode(" Loop"));
  const status = document.createElement("p");
  status.className = "frame-status";
  status.setAttribute("role", "status");
  const svg = svgNode("svg", { viewBox: "0 0 " + model.width + " " + model.height, role: "img" });
  svg.setAttribute("aria-labelledby", model.id + "-title " + model.id + "-description");
  controls.append(play, reset, scrubber, timeOutput, loopLabel);
  section.append(caption, controls, status, svg);
  document.querySelector("#diagrams").append(section);
  let playing = false;
  let startedAt = 0;
  let startTime = model.time.start;
  let animation = 0;
  const update = time => {
    try {
      const frame = evaluateFrame(model, time);
      drawFrame(svg, frame);
      scrubber.value = String(time);
      timeOutput.value = String(Number(time.toFixed(3)));
      status.textContent = "";
      return true;
    } catch (error) {
      playing = false;
      cancelAnimationFrame(animation);
      svg.replaceChildren();
      const reportedSource = error.source ?? {};
      const source = {
        file: reportedSource.file ?? error.file ?? model.elements[0].source.file,
        line: reportedSource.line ?? error.line ?? model.timeSource.line,
        column: reportedSource.column ?? error.column ?? model.timeSource.column
      };
      status.setAttribute("role", "alert");
      status.textContent = "Frame evaluation failed at " + source.file + ":" + source.line + ":" + source.column + ": " + error.message;
      play.textContent = "Play";
      play.setAttribute("aria-label", "Play " + model.title);
      return false;
    }
  };
  const tick = now => {
    if (!playing) return;
    let time = startTime + (now - startedAt) / 1000 / model.time.duration * (model.time.end - model.time.start);
    if (time >= model.time.end) {
      if (loop.checked) {
        const spanMs = model.time.duration * 1000;
        time = model.time.start + ((now - startedAt) % spanMs) / spanMs * (model.time.end - model.time.start);
      } else {
        time = model.time.end;
        update(time);
        playing = false;
        play.textContent = "Play";
        play.setAttribute("aria-label", "Play " + model.title);
        return;
      }
    }
    if (update(time)) animation = requestAnimationFrame(tick);
  };
  play.addEventListener("click", () => {
    if (playing) {
      playing = false;
      cancelAnimationFrame(animation);
      play.textContent = "Play";
      play.setAttribute("aria-label", "Play " + model.title);
      return;
    }
    startTime = Number(scrubber.value);
    startedAt = performance.now();
    playing = true;
    play.textContent = "Pause";
    play.setAttribute("aria-label", "Pause " + model.title);
    animation = requestAnimationFrame(tick);
  });
  reset.addEventListener("click", () => {
    playing = false;
    cancelAnimationFrame(animation);
    play.textContent = "Play";
    play.setAttribute("aria-label", "Play " + model.title);
    update(model.time.start);
  });
  scrubber.addEventListener("input", () => {
    playing = false;
    cancelAnimationFrame(animation);
    play.textContent = "Play";
    play.setAttribute("aria-label", "Play " + model.title);
    update(Number(scrubber.value));
  });
  update(model.time.start);
  return section;
};
const modelPayload = JSON.parse(document.querySelector("#diagram-model").textContent);
const renderStartedAt = performance.now();
for (const model of modelPayload.diagrams) renderDiagram(model);
document.documentElement.dataset.probeInitialRenderMs = String(Number((performance.now() - renderStartedAt).toFixed(4)));
`;
}

async function bundleEvaluator(): Promise<{ code: string; bytes: number; elapsedMs: number }> {
  const started = performance.now();
  const esbuild = createRequire(resolve(repositoryRoot, 'desktop-app/package.json'))('esbuild') as {
    build(options: {
      stdin: { contents: string; resolveDir: string; sourcefile: string; loader: 'ts' };
      bundle: true;
      write: false;
      format: 'iife';
      globalName: string;
      platform: 'browser';
      target: string;
      minify: true;
      legalComments: 'none';
    }): Promise<{ outputFiles: readonly { text: string }[] }>;
  };
  const result = await esbuild.build({
    stdin: {
      contents: `
        import { evaluateExpression } from "${resolve(repositoryRoot, 'src/runtime/evaluateExpression.ts').replaceAll('\\', '/')}";
        import { Environment } from "${resolve(repositoryRoot, 'src/runtime/environment.ts').replaceAll('\\', '/')}";
        export { evaluateExpression, Environment };
      `,
      resolveDir: repositoryRoot,
      sourcefile: 'openamx-diagram-runtime-probe.ts',
      loader: 'ts'
    },
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'OpenAmxProbe',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    legalComments: 'none'
  });
  const code = result.outputFiles[0].text;
  return { code, bytes: Buffer.byteLength(code), elapsedMs: performance.now() - started };
}

interface BrowserProbePage {
  setContent(content: string, options?: { waitUntil?: 'load' }): Promise<void>;
  evaluate<T, Argument = void>(pageFunction: (argument: Argument) => T, argument?: Argument): Promise<T>;
  locator(selector: string): {
    evaluate<T>(pageFunction: (element: Element) => T): Promise<T>;
    screenshot(options: { path: string }): Promise<void>;
  };
  close(): Promise<void>;
  on(event: 'request', listener: (request: { url(): string }) => void): void;
  on(event: 'pageerror', listener: (error: Error) => void): void;
}

interface BrowserProbe {
  newPage(): Promise<BrowserProbePage>;
  close(): Promise<void>;
}

interface ChromiumProbe {
  launch(options: { headless: true }): Promise<BrowserProbe>;
}

async function buildTypedContextProbe(base: DiagramModel): Promise<{
  readonly model: DiagramModel;
  readonly serializedBytes: number;
  readonly hostFrames: readonly { readonly time: number; readonly x: number }[];
  readonly contextSummary: Readonly<Record<string, number>>;
}> {
  const entryPath = resolve(repositoryRoot, 'examples/hello-world.amx');
  const modulePath = resolve(repositoryRoot, 'examples/libraries/asset-management.amx');
  const moduleText = `\`\`\`amx
export dimension Length
export unit meter: Length
export unit kilometer = 1000 * meter
export enum Surface = {
  Rough = "rough"
  Smooth = "smooth"
}
export type Profile {
  factor: Number
  surface: String
}
export fn scale(distance: Length, profile: Profile): Number = if profile.surface == "rough" then distance / 1 meter * profile.factor else distance / 1 meter
\`\`\`
`;
  const entryText = `\`\`\`amx
import { Length, meter, kilometer, Profile, Surface, scale } from "./libraries/asset-management.amx"
let distance: Length = 2 kilometer
let profile: Profile = Profile { factor = 3, surface = Surface.Rough }
let answer: Number = scale(distance, profile)
\`\`\`
`;
  const loaded = await loadEntryModule(entryPath, {
    entryText,
    sourceOverlay: new Map([[modulePath, moduleText]])
  });
  const crankPin = base.elements.find(element => element.name === 'crankPin');
  if (!crankPin) throw new Error('Crank-slider probe has no crankPin');
  const dynamicX = parseExpression('scale(distance, profile) * (1 + t) / 1000', crankPin.geometry.cx.source);
  const model: DiagramModel = {
    ...base,
    title: 'Typed AMX context transport probe',
    description: 'Imported function with a record, enum-valued field, measurement and unit registry.',
    bindings: loaded.env.toObject(),
    functions: [...loaded.env.functions.values()],
    recordTypes: [...loaded.env.recordTypes.values()],
    enumValues: [...loaded.env.enumValues.entries()],
    enumDeclarations: [...loaded.env.enumDeclarations.values()],
    bindingTypes: [...loaded.env.bindingTypes.entries()],
    dimensionRegistry: loaded.env.dimensionRegistry,
    elements: [{
      ...crankPin,
      geometry: {
        cx: dynamicX,
        cy: parseExpression('100', crankPin.geometry.cy.source),
        r: parseExpression('6', crankPin.geometry.r.source)
      }
    }]
  };
  const hostFrames = [0, 0.25, 1].map(time => ({
    time,
    x: evaluateDiagram(model, time).elements[0].geometry.cx as number
  }));
  const serializedBytes = Buffer.byteLength(JSON.stringify(serializeModelContext(model)));
  return {
    model,
    serializedBytes,
    hostFrames,
    contextSummary: {
      bindings: Object.keys(model.bindings).length,
      functions: model.functions.length,
      records: model.recordTypes.length,
      enums: model.enumDeclarations.length,
      dimensions: model.dimensionRegistry?.dimensions.size ?? 0,
      units: model.dimensionRegistry?.units.size ?? 0,
      baseUnits: model.dimensionRegistry?.baseUnits.size ?? 0
    }
  };
}

async function verifyTypedContextInBrowser(
  evaluatorBundle: string,
  model: DiagramModel,
  expectedFrames: readonly { readonly time: number; readonly x: number }[]
): Promise<Readonly<Record<string, unknown>>> {
  const { chromium } = createRequire(resolve(repositoryRoot, 'desktop-app/package.json'))('@playwright/test') as {
    chromium: ChromiumProbe;
  };
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const externalRequests: string[] = [];
    const pageErrors: string[] = [];
    page.on('request', request => {
      if (!request.url().startsWith('file:')) externalRequests.push(request.url());
    });
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setContent(interactiveHtml([model], evaluatorBundle), { waitUntil: 'load' });
    const initial = await page.evaluate(() => ({
      figures: document.querySelectorAll('figure.diagram').length,
      resources: performance.getEntriesByType('resource').length
    }));
    if (initial.figures !== 1 || pageErrors.length) {
      throw new Error(`Typed context diagram did not render: ${JSON.stringify({ initial, pageErrors })}`);
    }
    const browserFrames: Array<{ time: number; x: number }> = [];
    for (const expected of expectedFrames) {
      await page.evaluate(time => {
        const scrubber = document.querySelector('input[type="range"]') as HTMLInputElement;
        scrubber.value = String(time);
        scrubber.dispatchEvent(new Event('input', { bubbles: true }));
      }, expected.time);
      const x = await page.locator('figure.diagram circle').evaluate(element => Number(element.getAttribute('cx')));
      browserFrames.push({ time: expected.time, x });
    }
    if (externalRequests.length || initial.resources !== 0 || pageErrors.length) {
      throw new Error(`Typed context browser probe attempted external resources or errored: ${JSON.stringify({ externalRequests, resources: initial.resources, pageErrors })}`);
    }
    if (browserFrames.some((frame, index) => frame.time !== expectedFrames[index].time
      || frame.x !== expectedFrames[index].x)) {
      throw new Error(`Typed context browser parity failed: ${JSON.stringify({ actual: browserFrames, expected: expectedFrames })}`);
    }
    await page.close();
    return {
      frames: browserFrames,
      serializedContextBytes: Buffer.byteLength(JSON.stringify(serializeModelContext(model))),
      externalRequests,
      resourceEntries: initial.resources,
      pageErrors
    };
  } finally {
    await browser.close();
  }
}

function interactiveHtml(models: readonly DiagramModel[], evaluator: string): string {
  const nonce = randomBytes(18).toString('base64');
  const payload = escapeJsonForHtml(JSON.stringify({ diagrams: models.map(serializeModel) }));
  const title = models.map(model => model.title).join(' and ');
  const csp = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; img-src data:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style nonce="${nonce}">
*{box-sizing:border-box}body{margin:0;padding:1.25rem;font:16px/1.5 Arial,sans-serif;color:#263238;background:#f6f8fa}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:1.25rem}
figure{margin:0;padding:1rem;background:#fff;border:1px solid #ccd5db;border-radius:.5rem}
h2{margin:0 0 .25rem;font-size:1.25rem}figcaption p{margin:.25rem 0 .75rem}
.controls{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;margin:.5rem 0}
button,input{font:inherit}button{padding:.3rem .7rem}input[type=range]{flex:1;min-width:120px}
svg{display:block;width:100%;height:auto;max-height:70vh;background:#fff}
.frame-status:empty{display:none}.frame-status[role=alert]{color:#9c2520}
</style>
</head>
<body><main id="diagrams"></main>
<script type="application/json" id="diagram-model">${payload}</script>
<script nonce="${nonce}">${evaluator}\n${browserRuntimeSource()}</script>
</body></html>`;
}

async function buildPdf(models: readonly DiagramModel[]): Promise<Uint8Array> {
  const columns = models.map(model => ({
    width: '*',
    stack: [
      { text: model.title, style: 'heading' },
      { text: model.description, style: 'description' },
      { svg: svgForFrame(evaluateDiagram(model, model.time.start)), width: 245 }
    ]
  }));
  const pdf = pdfmake.createPdf({
    info: { title: 'V0.13 diagram feasibility probes', author: 'OpenAMX Sprint 078' },
    pageSize: 'A4',
    pageMargins: [42, 36, 42, 36],
    defaultStyle: { fontSize: 9, color: '#263238' },
    styles: {
      heading: { fontSize: 13, bold: true, margin: [0, 0, 0, 4] },
      description: { fontSize: 8, margin: [0, 0, 0, 8] }
    },
    content: [{ columns, columnGap: 18 }]
  });
  const bytes = await pdf.getBuffer();
  return Uint8Array.from(bytes);
}

async function buildDocx(models: readonly DiagramModel[]): Promise<Uint8Array> {
  const children: Array<Paragraph> = [];
  for (const model of models) {
    const svg = svgForFrame(evaluateDiagram(model, model.time.start));
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    const dimensions = await sharp(png).metadata();
    if (!dimensions.width || !dimensions.height) throw new Error(`Could not inspect rasterized ${model.id} dimensions`);
    const maxWidth = 280;
    const scale = Math.min(maxWidth / dimensions.width, 170 / dimensions.height);
    children.push(new Paragraph({ text: model.title, heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ children: [new TextRun({ text: model.description })] }));
    children.push(new Paragraph({
      children: [new ImageRun({
        type: 'png',
        data: png,
        transformation: { width: dimensions.width * scale, height: dimensions.height * scale },
        altText: { title: model.title, description: model.description, name: model.title }
      })]
    }));
  }
  const document = new Document({
    title: 'V0.13 diagram feasibility probes',
    description: 'Static lower-bound frames from the shared Sprint 078 diagram model',
    sections: [{ children }]
  });
  return Uint8Array.from(await Packer.toBuffer(document));
}

function makeInvalidModel(base: DiagramModel, kind: 'initial' | 'later'): DiagramModel {
  const first = base.elements.find(element => element.kind === 'circle');
  if (!first) throw new Error('Crank-slider probe has no circle to use for the invalid-frame check');
  const geometry = {
    ...first.geometry,
    r: {
      type: 'functionCall' as const,
      callee: 'sqrt',
      arguments: [{
        type: 'binaryExpression' as const,
        operator: kind === 'initial' ? '-' as const : '-' as const,
        left: { type: 'numberLiteral' as const, value: kind === 'initial' ? 0 : 1 },
        right: kind === 'initial'
          ? { type: 'numberLiteral' as const, value: 1 }
          : {
            type: 'identifier' as const,
            name: base.time.variable,
            source: first.geometry.r.source
          }
      }],
      source: first.geometry.r.source
    }
  };
  const invalidElement: DiagramElement = { ...first, name: `${first.name}-invalid`, geometry };
  return {
    ...base,
    id: base.id,
    title: `${base.title} invalid ${kind} frame`,
    elements: [invalidElement],
    time: kind === 'later' ? { ...base.time, start: 0, end: 2 } : { ...base.time, start: 0, end: 2 }
  };
}

function invalidProbeSource(base: DiagramModel, kind: 'initial' | 'later') {
  const element = makeInvalidModel(base, kind).elements[0];
  const source = element.geometry.r.source;
  return {
    file: element.source.file,
    line: source?.line ?? element.source.line,
    column: source?.column ?? element.source.column
  };
}

async function main(): Promise<void> {
  await mkdir(artifactDirectory, { recursive: true });
  const models = buildProbeDiagrams();
  const evaluationStart = performance.now();
  const evaluated = models.map(model => [model.time.start, (model.time.start + model.time.end) / 2, model.time.end]
    .map(time => evaluateDiagram(model, time)));
  const evaluationMs = performance.now() - evaluationStart;
  const bundle = await bundleEvaluator();
  const typedContextProbe = await buildTypedContextProbe(models[0]);
  const typedContextBrowser = await verifyTypedContextInBrowser(
    bundle.code,
    typedContextProbe.model,
    typedContextProbe.hostFrames
  );
  const htmlStarted = performance.now();
  const html = interactiveHtml(models, bundle.code);
  const htmlBuildMs = performance.now() - htmlStarted;
  const htmlPath = output('diagrams.html');
  await writeFile(htmlPath, html);

  const pdfStarted = performance.now();
  const pdfBytes = await buildPdf(models);
  const pdfMs = performance.now() - pdfStarted;
  const pdfPath = output('diagrams.pdf');
  await writeFile(pdfPath, pdfBytes);

  const docxStarted = performance.now();
  const docxBytes = await buildDocx(models);
  const docxMs = performance.now() - docxStarted;
  const docxPath = output('diagrams.docx');
  await writeFile(docxPath, docxBytes);

  const packageParts = await JSZip.loadAsync(docxBytes);
  const documentXml = await packageParts.file('word/document.xml')?.async('string');
  if (!documentXml) throw new Error('DOCX has no word/document.xml part');
  for (const model of models) {
    if (!documentXml.includes(model.title) || !documentXml.includes(model.description)) {
      throw new Error(`DOCX is missing visible ${model.id} title or description text`);
    }
    if (!documentXml.includes(`descr="${escapeXml(model.description)}"`)) {
      throw new Error(`DOCX is missing ${model.id} accessible image description`);
    }
  }
  const media = Object.keys(packageParts.files).filter(name => name.startsWith('word/media/') && name.endsWith('.png'));
  if (media.length !== models.length) throw new Error(`Expected ${models.length} embedded DOCX PNG frames, found ${media.length}`);

  const artifactEntries = await Promise.all([htmlPath, pdfPath, docxPath].map(async path => ({
    path: path.slice(probeDirectory.length + 1),
    bytes: (await stat(path)).size
  })));
  const metrics = {
    environment: {
      platform: process.platform,
      architecture: process.arch,
      bun: Bun.version,
      node: process.version
    },
    probe: {
      modelCount: models.length,
      primitiveCounts: models.map(model => ({ id: model.id, count: model.elements.length })),
      timeSamples: models.map(model => ({
        id: model.id,
        times: [model.time.start, (model.time.start + model.time.end) / 2, model.time.end]
      })),
      evaluatedFrameCount: evaluated.flat().length,
      hostEvaluationMs: Number(evaluationMs.toFixed(3)),
      browserEvaluatorBundleBytes: bundle.bytes,
      browserEvaluatorBundleBuildMs: Number(bundle.elapsedMs.toFixed(3)),
      htmlBuildMs: Number(htmlBuildMs.toFixed(3)),
      pdfSerializeMs: Number(pdfMs.toFixed(3)),
      docxSerializeMs: Number(docxMs.toFixed(3)),
      sourceFixtureBytes: Buffer.byteLength(models.map(model => getModelSource(model.id)).join('\n')),
      typedContextParity: {
        ...typedContextProbe.contextSummary,
        hostFrames: typedContextProbe.hostFrames,
        browser: typedContextBrowser
      },
      invalidProbeSource: {
        initial: invalidProbeSource(models[0], 'initial'),
        later: invalidProbeSource(models[0], 'later')
      },
      docxAccessibleImageCount: media.length,
      docxVisibleTextOrder: models.map(model => ({
        id: model.id,
        titleOffset: documentXml.indexOf(model.title),
        descriptionOffset: documentXml.indexOf(model.description)
      })),
      artifacts: artifactEntries
    },
    browser: null,
    desktop: null,
    pdfVisualInspection: 'NOT RUN',
    docxVisualInspection: 'NOT RUN'
  };
  await writeFile(output('measurements.json'), `${JSON.stringify(metrics, null, 2)}\n`);
  console.log(JSON.stringify(metrics, null, 2));
}

await main();
