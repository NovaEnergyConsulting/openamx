import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus, release, totalmem } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { parseDocumentText } from '../../../../src/parser/parseDocument';
import { evaluateDocumentEnvironment } from '../../../../src/runtime/evaluateDocument';
import { Environment } from '../../../../src/runtime/environment';
import {
  createDiagramModel,
  deserializeDiagramSceneModel,
  evaluateDiagramFrame,
  serializeDiagramSceneModel,
  type DiagramFrame,
  type DiagramSceneModel
} from '../../../../src/runtime/diagramModel';
import { evaluateExpression } from '../../../../src/runtime/evaluateExpression';
import type {
  DiagramDeclarationNode,
  DiagramElementNode,
  DiagramPropertyNode,
  DiagramTimeNode,
  SourceLocation
} from '../../../../src/ast/types';
import { parseExpression } from '../../../../src/parser/parseExpression';
import { renderStaticDiagramSvg } from '../../../../src/renderer/staticDiagram';
import { renderPreparedHtml } from '../../../../src/renderer/renderHtml';
import type { PreparedReport } from '../../../../src/renderer/reportPreparation';
import { preparePdfReport, serializePdfReport } from '../../../../src/renderer/reportPdf';
import { prepareDocxReport, serializeDocxReport } from '../../../../src/renderer/reportDocx';

interface PrototypeInstance {
  readonly internalIndex: number;
  readonly iteratorValue: number;
  readonly source: SourceLocation;
}

interface PrototypeSceneModel {
  readonly version: 1;
  readonly title: string;
  readonly description: string;
  readonly timeline: Readonly<{ variable: 't'; from: 0; to: 1; duration: 1 }>;
  readonly instances: readonly PrototypeInstance[];
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const artifactDirectory = resolve(scriptDirectory);
const rawDirectory = resolve(artifactDirectory, 'raw');
const logDirectory = resolve(artifactDirectory, 'logs');
const repositoryRoot = resolve(scriptDirectory, '../../../../');

function prototypeModel(): PrototypeSceneModel {
  return {
    version: 1,
    title: 'Per-instance binding probe',
    description: 'Prototype-only ordered generated content',
    timeline: { variable: 't', from: 0, to: 1, duration: 1 },
    instances: [2, 5, 9].map((iteratorValue, internalIndex) => ({
      internalIndex,
      iteratorValue,
      source: { line: 12, column: 3 }
    }))
  };
}

function evaluatePrototype(model: PrototypeSceneModel, time: number): DiagramFrame {
  const elements = model.instances.map(instance => {
    const environment = new Environment();
    environment.set('item', instance.iteratorValue);
    environment.set('t', time);
    const cx = evaluateExpression(parseExpression('item * 10'), environment) as number;
    const cy = evaluateExpression(parseExpression('t * 4'), environment) as number;
    return Object.freeze({
      primitive: 'circle' as const,
      name: `prototype-${instance.internalIndex}`,
      source: instance.source,
      cx,
      cy,
      r: 2,
      stroke: '#263238',
      lineWidth: 1
    });
  });
  return Object.freeze({ time, elements: Object.freeze(elements) });
}

function property(name: string, value: string, source: SourceLocation): DiagramPropertyNode {
  return {
    name,
    expression: parseExpression(value, source),
    rawValue: value,
    nameSource: source,
    valueSource: source,
    source
  };
}

function modelFromFrame(frame: DiagramFrame, instances: readonly PrototypeInstance[] = []): DiagramSceneModel {
  const elements: DiagramElementNode[] = frame.elements.map((element, index) => {
    assert.equal(element.primitive, 'circle');
    const source = element.source ?? { line: index + 1, column: 1 };
    return {
      type: 'diagramElement',
      primitive: 'circle',
      name: element.name,
      nameSource: source,
      source,
      properties: [
        property('cx', String(element.cx), source),
        property('cy', String(element.cy), source),
        property('r', String(element.r), source),
        property('stroke', JSON.stringify(element.stroke), source),
        property('lineWidth', String(element.lineWidth), source)
      ]
    };
  });
  const timeSource = { line: 5, column: 3 };
  const time: DiagramTimeNode = {
    name: 't',
    nameSource: timeSource,
    from: parseExpression('0', timeSource),
    fromText: '0',
    fromSource: timeSource,
    to: parseExpression('1', timeSource),
    toText: '1',
    toSource: timeSource,
    duration: parseExpression('1', timeSource),
    durationText: '1',
    durationSource: timeSource,
    source: timeSource
  };
  const declaration: DiagramDeclarationNode & { prototypeBindings: readonly PrototypeInstance[] } = {
    type: 'diagramDeclaration',
    name: 'rendererProjection',
    nameSource: { line: 1, column: 1 },
    source: { line: 1, column: 1 },
    properties: [
      property('title', JSON.stringify('Renderer projection'), { line: 2, column: 3 }),
      property('description', JSON.stringify('Ordered frame projection'), { line: 3, column: 3 }),
      property('width', '120', { line: 4, column: 3 }),
      property('height', '40', { line: 4, column: 3 })
    ],
    times: [time],
    elements,
    prototypeBindings: instances
  };
  return createDiagramModel(declaration, new Environment(), undefined, 0, 0);
}

async function writeRaw(name: string, value: unknown): Promise<void> {
  await mkdir(rawDirectory, { recursive: true });
  const path = resolve(rawDirectory, name);
  if (!existsSync(path)) await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function runPrototype(): Promise<void> {
  const before = prototypeModel();
  const times = [0, 0.5, 1];
  const frames = times.map(time => evaluatePrototype(before, time));
  const expectedNames = ['prototype-0', 'prototype-1', 'prototype-2'];

  for (const [index, time] of times.entries()) {
    const frame = frames[index]!;
    assert.deepEqual(frame.elements.map(element => element.name), expectedNames);
    assert.deepEqual(frame.elements.map(element => element.cx), [20, 50, 90]);
    assert.deepEqual(frame.elements.map(element => element.cy), [time * 4, time * 4, time * 4]);
    assert.ok(frame.elements.every(element => element.source?.line === 12));
  }
  assert.deepEqual(frames.map(frame => frame.elements.map(element => element.name)), [
    expectedNames, expectedNames, expectedNames
  ]);
  assert.notDeepEqual(frames[0]!.elements.map(element => element.cy), frames[2]!.elements.map(element => element.cy));

  const sceneModel = modelFromFrame(frames[1]!, before.instances);
  const serializedSceneModel = serializeDiagramSceneModel(sceneModel);
  const roundTripSceneModel = deserializeDiagramSceneModel(serializedSceneModel);
  const recoveredBindings = (roundTripSceneModel.declaration as DiagramDeclarationNode & {
    prototypeBindings: readonly PrototypeInstance[]
  }).prototypeBindings;
  assert.deepEqual(recoveredBindings, before.instances);
  const afterSceneRoundTrip: PrototypeSceneModel = { ...before, instances: recoveredBindings };
  const roundTripFrames = times.map(time => evaluatePrototype(afterSceneRoundTrip, time));
  for (const [index, frame] of frames.entries()) assert.deepEqual(frame, roundTripFrames[index]);

  const projectedModel = modelFromFrame(roundTripFrames[1]!, recoveredBindings);
  const projectedFrame = evaluateDiagramFrame(projectedModel, 0);
  const svg = renderStaticDiagramSvg(projectedModel).svg;
  assert.deepEqual(projectedFrame.elements.map(element => element.name), expectedNames);
  assert.equal((svg.match(/<circle /g) ?? []).length, 3);
  assert.ok(svg.indexOf('cx="20"') < svg.indexOf('cx="50"'));
  assert.ok(svg.indexOf('cx="50"') < svg.indexOf('cx="90"'));

  const report: PreparedReport = {
    title: 'Qualification probe',
    identity: { accent: '#146C94', sourceVisible: false },
    items: [],
    diagrams: [{ model: projectedModel, beforeItemIndex: 0, order: 0 }]
  };
  const html = renderPreparedHtml(report, { mode: 'standalone' }) as string;
  assert.ok(html.includes('data-openamx-diagram="openamx-diagram-0"'));
  assert.ok(html.includes('data-diagram-model data-encoding="gzip-base64"'));

  await writeRaw('prototype-retry-02.json', {
    status: 'PASS',
    scope: 'prototype schema and projected existing renderer contract only',
    times,
    frames,
    roundTripFrames,
    sceneModelRoundTrip: {
      serializedSceneModelBytes: Buffer.byteLength(serializedSceneModel, 'utf8'),
      perInstanceBindingsPreserved: recoveredBindings.length === 3,
      frameMembershipAndValuesPreserved: true,
      productionFrameEvaluatorUsesPrototypeBindings: false
    },
    rendererProjection: { orderedSvgCircles: 3, htmlBytes: Buffer.byteLength(html, 'utf8') },
    limitation: 'The production scene serializer round-trips the prototype binding descriptors as model data; the production frame evaluator does not consume them. Per-instance evaluation remains prototype-only.'
  });
  await writeFile(resolve(logDirectory, 'prototype-retry-02.log'), 'Prototype PASS: three distinct iterator bindings, three t values, production scene-model serializer round-trip of prototype descriptors, ordered SVG and interactive HTML projection.\n', 'utf8');
  console.log('Prototype PASS: three distinct iterator bindings, three t values, JSON round-trip parity, ordered SVG and interactive HTML projection.');
}

type WorkloadKind = 'circle' | 'text' | 'mixed';

interface EmittedSeed {
  readonly index: number;
  readonly primitive: 'circle' | 'line';
  readonly source: SourceLocation;
}

type ControlNode =
  | { readonly type: 'primitive'; readonly seed: EmittedSeed }
  | { readonly type: 'for'; readonly values: readonly number[]; readonly body: readonly ControlNode[] }
  | { readonly type: 'if'; readonly selected: boolean; readonly consequent: readonly ControlNode[]; readonly alternate: readonly ControlNode[] };

interface WorkloadSpec {
  readonly id: string;
  readonly count: number;
  readonly kind: WorkloadKind;
  readonly dynamic: boolean;
  readonly textLength?: number;
  readonly directCount?: number;
  readonly boundaryCase?: 'cap' | 'cap+1';
}

interface TimedResult<T> {
  readonly status: 'PASS' | 'FAIL';
  readonly samplesMs: readonly number[];
  readonly medianMs?: number;
  readonly p95Ms?: number;
  readonly value?: T;
  readonly error?: string;
  readonly stoppedAfterSlowSample?: boolean;
}

const QUALIFIED_CAP_CANDIDATE = 64;
const BENCHMARK_COUNTS = [64, 65, 512, 1024, 2048, 4096, 8192, 16384] as const;
const MEASURED_REPETITIONS = 5;
const SLOW_SAMPLE_MS = 60_000;

function environmentRecord(): Record<string, unknown> {
  return {
    platform: process.platform,
    architecture: process.arch,
    osRelease: release(),
    cpuModel: cpus()[0]?.model ?? 'UNKNOWN',
    logicalCpuCount: cpus().length,
    totalMemoryBytes: totalmem(),
    nodeVersion: process.version,
    bunVersion: process.versions.bun ?? 'NOT_BUN'
  };
}

function percentile(samples: readonly number[], fraction: number): number | undefined {
  if (samples.length === 0) return undefined;
  const sorted = [...samples].sort((left, right) => left - right);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}

async function timeOperation<T>(operation: () => T | Promise<T>): Promise<TimedResult<T>> {
  const samplesMs: number[] = [];
  let value: T | undefined;
  let stoppedAfterSlowSample = false;
  try {
    await operation();
    for (let repetition = 0; repetition < MEASURED_REPETITIONS; repetition++) {
      const start = performance.now();
      value = await operation();
      const elapsed = performance.now() - start;
      samplesMs.push(elapsed);
      if (elapsed > SLOW_SAMPLE_MS) {
        stoppedAfterSlowSample = true;
        break;
      }
    }
    return {
      status: 'PASS', samplesMs,
      medianMs: percentile(samplesMs, 0.5),
      p95Ms: percentile(samplesMs, 0.95),
      value,
      ...(stoppedAfterSlowSample ? { stoppedAfterSlowSample } : {})
    };
  } catch (error) {
    return { status: 'FAIL', samplesMs, error: error instanceof Error ? error.stack ?? error.message : String(error) };
  }
}

function sourceAt(line: number): SourceLocation {
  return { line, column: 3 };
}

function controlWorkload(count: number, directCount: number): ControlNode[] {
  const generatedCount = count - directCount;
  const firstLoopCount = Math.floor(generatedCount / 2);
  const element = (index: number, primitive: 'circle' | 'line' = index % 2 === 0 ? 'circle' : 'line'): ControlNode => ({
    type: 'primitive', seed: { index, primitive, source: sourceAt(index + 8) }
  });
  return [
    ...Array.from({ length: directCount }, (_, index) => element(index, 'circle')),
    {
      type: 'for',
      values: Array.from({ length: firstLoopCount }, (_, index) => directCount + index),
      body: [{
        type: 'if', selected: true,
        consequent: [element(directCount)],
        alternate: [element(directCount, 'line')]
      }]
    },
    {
      type: 'if', selected: true,
      consequent: [{
        type: 'for',
        values: Array.from({ length: generatedCount - firstLoopCount }, (_, index) => directCount + firstLoopCount + index),
        body: [element(directCount + firstLoopCount)]
      }],
      alternate: []
    },
    { type: 'if', selected: false, consequent: [element(count)], alternate: [] }
  ];
}

function expandControlWorkload(nodes: readonly ControlNode[], insideFor = false, currentValue?: number): EmittedSeed[] {
  const output: EmittedSeed[] = [];
  for (const node of nodes) {
    if (node.type === 'primitive') {
      output.push(currentValue === undefined ? node.seed : { ...node.seed, index: currentValue });
    } else if (node.type === 'if') {
      output.push(...expandControlWorkload(node.selected ? node.consequent : node.alternate, insideFor, currentValue));
    } else {
      if (insideFor) throw new Error('Qualification control workload contains a nested for loop.');
      for (const value of node.values) {
        for (const child of node.body) {
          if (child.type === 'if') output.push(...expandControlWorkload([{
            ...child, selected: value % 2 === 0
          }], true, value));
          else if (child.type === 'primitive') output.push(...expandControlWorkload([child], true, value));
          else throw new Error('Qualification control workload contains a nested for loop.');
        }
      }
    }
  }
  return output;
}

function syntheticDeclaration(spec: WorkloadSpec, suffix = ''): DiagramDeclarationNode {
  const timeSource = sourceAt(7);
  const time: DiagramTimeNode = {
    name: 't', nameSource: timeSource,
    from: parseExpression('0', timeSource), fromText: '0', fromSource: timeSource,
    to: parseExpression('1', timeSource), toText: '1', toSource: timeSource,
    duration: parseExpression('1', timeSource), durationText: '1', durationSource: timeSource,
    source: timeSource
  };
  const elements: DiagramElementNode[] = [];
  const seeds = spec.kind === 'mixed'
    ? expandControlWorkload(controlWorkload(spec.count, spec.directCount ?? Math.floor(spec.count / 4)))
    : Array.from({ length: spec.count }, (_, index): EmittedSeed => ({
      index, primitive: spec.kind === 'text' ? 'circle' : spec.kind, source: sourceAt(index + 8)
    }));
  if (seeds.length !== spec.count) throw new Error(`Expected ${spec.count} emitted elements, got ${seeds.length}.`);
  for (const seed of seeds) {
    const index = seed.index;
    const source = seed.source;
    const primitive = spec.kind === 'text' ? 'text' : seed.primitive;
    const coordinate = index % 1000;
    const x = spec.dynamic ? `${coordinate} + t * 10` : String(coordinate);
    const y = String(index % 100);
    const properties = primitive === 'circle'
      ? [
        property('cx', x, source), property('cy', y, source), property('r', '2', source),
        property('stroke', JSON.stringify('#263238'), source),
        property('fill', JSON.stringify('#8CB369'), source), property('lineWidth', '1', source)
      ]
      : primitive === 'line'
        ? [
          property('x1', x, source), property('y1', y, source),
          property('x2', spec.dynamic ? `${coordinate + 10} + t * 10` : String(coordinate + 10), source),
          property('y2', String(index % 100), source), property('stroke', JSON.stringify('#263238'), source),
          property('lineWidth', '1', source)
        ]
        : [
          property('x', x, source), property('y', y, source),
          property('value', JSON.stringify(`${'x'.repeat(spec.textLength ?? 1)}-${index}`), source),
          property('fill', JSON.stringify('#263238'), source)
        ];
    elements.push({
      type: 'diagramElement', primitive, name: `probe${suffix}-${index}`,
      nameSource: source, source, properties
    });
  }
  const name = `qualification${suffix}`;
  return {
    type: 'diagramDeclaration', name, nameSource: sourceAt(1), source: sourceAt(1),
    properties: [
      property('title', JSON.stringify(name), sourceAt(2)),
      property('description', JSON.stringify('Synthetic flattened qualification workload'), sourceAt(3)),
      property('width', '1200', sourceAt(4)), property('height', '800', sourceAt(5))
    ],
    times: [time], elements
  };
}

function buildSyntheticModel(spec: WorkloadSpec, suffix = ''): DiagramSceneModel {
  return createDiagramModel(syntheticDeclaration(spec, suffix), new Environment(), undefined, 0, 0);
}

function loadExampleBaseline(): DiagramSceneModel {
  const path = resolve(repositoryRoot, 'examples/08_Formula_Driven_Diagrams.amx');
  const doc = parseDocumentText(readFileSync(path, 'utf8'));
  const env = evaluateDocumentEnvironment(doc, path);
  const model = env.diagramEmissions[0]?.model;
  if (!model) throw new Error('Formula-driven diagram example did not emit a model.');
  return model;
}

function preparedReport(models: readonly DiagramSceneModel[]): PreparedReport {
  return {
    title: 'Sprint 109 qualification workload',
    identity: { accent: '#146C94', sourceVisible: false },
    items: [],
    diagrams: models.map((model, order) => ({ model, beforeItemIndex: 0, order }))
  };
}

function compact<T>(result: TimedResult<T>, summarize: (value: T) => unknown): Record<string, unknown> {
  return {
    status: result.status,
    samplesMs: result.samplesMs,
    medianMs: result.medianMs ?? null,
    p95Ms: result.p95Ms ?? null,
    ...(result.value === undefined ? {} : { result: summarize(result.value) }),
    ...(result.error ? { error: result.error } : {}),
    ...(result.stoppedAfterSlowSample ? { stoppedAfterSlowSample: true } : {})
  };
}

function summarizeModelList(models: readonly DiagramSceneModel[]): Record<string, unknown> {
  return {
    diagramCount: models.length,
    elementCount: models.reduce((total, model) => total + model.declaration.elements.length, 0)
  };
}

async function runCase(spec: WorkloadSpec, builders?: () => DiagramSceneModel[]): Promise<Record<string, unknown>> {
  const before = process.memoryUsage();
  const controlExpansion = spec.id === 'B4'
    ? await timeOperation(() => expandControlWorkload(controlWorkload(spec.count, spec.directCount ?? Math.floor(spec.count / 4))))
    : undefined;
  const built = await timeOperation(() => builders?.() ?? [buildSyntheticModel(spec)]);
  if (built.status !== 'PASS' || !built.value) {
    return { spec, status: 'FAIL', construction: compact(built, summarizeModelList) };
  }
  const models = built.value;
  const report = preparedReport(models);
  const frameResults: Record<string, unknown> = {};
  for (const time of [0, 0.5, 1]) {
    const result = await timeOperation(() => models.map(model => evaluateDiagramFrame(model, time)));
    frameResults[String(time)] = compact(result, frames => ({
      diagramCount: frames.length,
      orderedElementCount: frames.reduce((total, frame) => total + frame.elements.length, 0),
      firstNames: frames[0]?.elements.slice(0, 3).map(element => element.name) ?? []
    }));
  }

  const serializedResult = await timeOperation(() => models.map(serializeDiagramSceneModel));
  const serializedModels = serializedResult.value ?? [];
  const serializedEnvelope = JSON.stringify(serializedModels);
  const deserializedResult = await timeOperation(() => serializedModels.map(deserializeDiagramSceneModel));
  const htmlResult = await timeOperation(() => renderPreparedHtml(report, { mode: 'standalone' }) as string);
  const svgResult = await timeOperation(() => models.map(renderStaticDiagramSvg));
  const result: Record<string, unknown> = {
    spec,
    status: 'PASS',
    accounting: {
      emittedPrimitives: spec.count,
      directPrimitives: spec.directCount ?? 0,
      controlBlockPrimitives: spec.count - (spec.directCount ?? 0),
      countAllEmittedRule: spec.count,
      countControlBlockOnlyRule: spec.count - (spec.directCount ?? 0),
      candidateAllEmittedRule: spec.count <= QUALIFIED_CAP_CANDIDATE ? 'WITHIN_CANDIDATE' : 'OVER_CANDIDATE',
      candidateControlBlockOnlyRule: spec.count - (spec.directCount ?? 0) <= QUALIFIED_CAP_CANDIDATE
        ? 'WITHIN_CANDIDATE' : 'OVER_CANDIDATE'
    },
    construction: compact(built, summarizeModelList),
    ...(controlExpansion ? {
      controlExpansion: compact(controlExpansion, seeds => ({
        emittedElements: seeds.length,
        firstNames: seeds.slice(0, 3).map(seed => `${spec.id}-${seed.index}`),
        controlModel: 'direct primitives + for with nested selected if + selected if containing for + empty branch'
      }))
    } : {}),
    frameEvaluation: frameResults,
    serialization: {
      ...compact(serializedResult, values => ({ diagramCount: values.length })),
      jsonBytes: Buffer.byteLength(serializedEnvelope, 'utf8'),
      gzipBytes: gzipSync(serializedEnvelope, { level: 9 }).byteLength,
      base64GzipBytes: Buffer.byteLength(gzipSync(serializedEnvelope, { level: 9 }).toString('base64'), 'utf8')
    },
    deserialization: compact(deserializedResult, summarizeModelList),
    interactiveHtml: {
      ...compact(htmlResult, html => ({
        characters: html.length,
        utf8Bytes: Buffer.byteLength(html, 'utf8'),
        exceedsDesktopWorkerCharacterLimit: html.length > 8_000_000
      })),
      rendererLimitBytes: 100 * 1024 * 1024,
      desktopWorkerLimitCharacters: 8_000_000
    },
    staticSvg: compact(svgResult, values => ({
      diagramCount: values.length,
      bytes: values.reduce((total, item) => total + Buffer.byteLength(item.svg, 'utf8'), 0)
    })),
    memory: {
      rssBeforeBytes: before.rss,
      rssAfterBytes: process.memoryUsage().rss,
      peakMemory: 'NOT MEASURED'
    }
  };

  if (spec.id === 'B0' || spec.id === 'B6' || spec.id.startsWith('B7')) {
    const pdfResult = await timeOperation(async () => serializePdfReport(preparePdfReport(report)));
    const docxResult = await timeOperation(async () => serializeDocxReport(await prepareDocxReport(report)));
    result.staticExports = {
      pdf: compact(pdfResult, bytes => ({ bytes: bytes.byteLength })),
      docx: compact(docxResult, bytes => ({ bytes: bytes.byteLength }))
    };
  } else {
    result.staticExports = { status: 'NOT RUN', reason: 'PDF/DOCX qualification is isolated in B0 and B6.' };
  }
  return result;
}

function workloadSpecs(): WorkloadSpec[] {
  const specs: WorkloadSpec[] = [
    { id: 'B0', count: 8, kind: 'circle', dynamic: true },
    { id: 'B0', count: 512, kind: 'circle', dynamic: false }
  ];
  for (const count of BENCHMARK_COUNTS) {
    specs.push({ id: 'B1', count, kind: 'circle', dynamic: false });
    specs.push({ id: 'B2', count, kind: 'circle', dynamic: true });
    specs.push({ id: 'B3', count, kind: 'text', dynamic: false, textLength: 128 });
    specs.push({ id: 'B4', count, kind: 'mixed', dynamic: true, directCount: Math.floor(count / 4) });
    specs.push({ id: 'B5', count, kind: 'circle', dynamic: true });
    specs.push({ id: 'B6', count, kind: 'text', dynamic: false, textLength: 32 });
  }
  for (const count of [QUALIFIED_CAP_CANDIDATE, QUALIFIED_CAP_CANDIDATE + 1]) {
    specs.push({
      id: 'B4-MIX', count, kind: 'mixed', dynamic: true, directCount: 16,
      boundaryCase: count === QUALIFIED_CAP_CANDIDATE ? 'cap' : 'cap+1'
    });
  }
  for (const generatedCount of [QUALIFIED_CAP_CANDIDATE, QUALIFIED_CAP_CANDIDATE + 1]) {
    specs.push({
      id: 'B4-GEN', count: 512 + generatedCount, kind: 'mixed', dynamic: true, directCount: 512,
      boundaryCase: generatedCount === QUALIFIED_CAP_CANDIDATE ? 'cap' : 'cap+1'
    });
  }
  return specs;
}

function csvEscape(value: unknown): string {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function runBenchmark(): Promise<void> {
  await mkdir(rawDirectory, { recursive: true });
  await mkdir(logDirectory, { recursive: true });
  const cases: Record<string, unknown>[] = [];
  const startedAt = new Date().toISOString();
  for (const spec of workloadSpecs()) {
    const result = spec.id === 'B0' && spec.count === 8
      ? await runCase(spec, () => [loadExampleBaseline()])
      : await runCase(spec);
    cases.push(result);
    console.log(`${spec.id} count=${spec.count}: ${String(result.status)}`);
  }
  const compositionSpecs: WorkloadSpec[] = [
    ...[64, 65, 128].map(count => ({ id: 'B7-CIRCLE', count, kind: 'circle' as const, dynamic: true })),
    ...[64, 65, 128].map(count => ({ id: 'B7-TEXT', count, kind: 'text' as const, dynamic: false, textLength: 128 })),
    ...[64, 65].map(generatedCount => ({
      id: 'B7-AUTHOR-GEN', count: 32 + generatedCount, kind: 'mixed' as const, dynamic: true,
      directCount: 32, boundaryCase: generatedCount === QUALIFIED_CAP_CANDIDATE ? 'cap' as const : 'cap+1' as const
    }))
  ];
  for (const spec of compositionSpecs) {
    const composition = await runCase(spec, () => Array.from({ length: 16 }, (_, index) =>
      buildSyntheticModel(spec, `-${index}`)));
    cases.push({ ...composition, reportComposition: {
      diagrams: 16, elementsPerDiagram: spec.count, totalEmitted: 16 * spec.count,
      wholePageDomLimit: 2000, authoredDeclarationsPerReport: spec.directCount ? spec.directCount * 16 : 0,
      generatedElementsPerDiagram: spec.directCount ? spec.count - spec.directCount : 0,
      authoredReportLimit: 512, authoredLimitRemainsSeparate: true
    } });
    console.log(`${spec.id} count=${spec.count} across 16 diagrams: ${String(composition.status)}`);
  }
  const document = {
    status: 'COMPLETE', startedAt, completedAt: new Date().toISOString(),
    environment: environmentRecord(),
    methodology: {
      warmups: 1,
      measuredRepetitions: MEASURED_REPETITIONS,
      geometricCounts: BENCHMARK_COUNTS,
      provisionalCapCandidate: QUALIFIED_CAP_CANDIDATE,
      boundaryRows: cases.filter(item => (item.spec as WorkloadSpec | undefined)?.boundaryCase
        || (item.spec as WorkloadSpec | undefined)?.count === QUALIFIED_CAP_CANDIDATE
        || (item.spec as WorkloadSpec | undefined)?.count === QUALIFIED_CAP_CANDIDATE + 1),
      perSampleStop: 'Further repetitions stop after a sample exceeds 60 seconds; synchronous operations cannot be interrupted mid-call.',
      hardCountCeilingPerDiagram: 16384,
      cases,
      limitations: [
        'Synthetic benchmark declarations are flattened ASTs; they do not measure production parser/checker expansion of diagram-local control syntax.',
        'The binding prototype is a separate schema and does not add per-instance environments to the production scene serializer.',
        'One Windows host only; no cross-platform qualification or certification.',
        'Peak memory is not measured; RSS before/after is contextual only.'
      ]
    }
  };
  await writeRaw('benchmark-retry-05.json', document);
  const csvRows = ['workload,count,status,constructionMedianMs,constructionP95Ms,frame0MedianMs,frameHalfMedianMs,frame1MedianMs,modelJsonBytes,modelGzipBytes,htmlCharacters,htmlUtf8Bytes,svgBytes'];
  for (const item of cases) {
    const spec = item.spec as WorkloadSpec | undefined;
    const frame = item.frameEvaluation as Record<string, Record<string, unknown>> | undefined;
    const serialization = item.serialization as Record<string, unknown> | undefined;
    const html = item.interactiveHtml as Record<string, unknown> | undefined;
    const svg = item.staticSvg as Record<string, unknown> | undefined;
    const construction = item.construction as Record<string, unknown> | undefined;
    csvRows.push([
      spec?.id, spec?.count, item.status,
      construction?.medianMs, construction?.p95Ms,
      frame?.['0']?.medianMs, frame?.['0.5']?.medianMs, frame?.['1']?.medianMs,
      serialization?.jsonBytes, serialization?.gzipBytes,
      (html?.result as Record<string, unknown> | undefined)?.characters,
      (html?.result as Record<string, unknown> | undefined)?.utf8Bytes,
      (svg?.result as Record<string, unknown> | undefined)?.bytes
    ].map(csvEscape).join(','));
  }
  await writeFile(resolve(rawDirectory, 'benchmark-retry-05.csv'), `${csvRows.join('\n')}\n`, 'utf8');
  await writeFile(resolve(logDirectory, 'benchmark-retry-05.log'), `${cases.map(item => {
    const spec = item.spec as WorkloadSpec | undefined;
    return `${spec?.id ?? 'B7'} count=${spec?.count ?? 512} status=${String(item.status)}`;
  }).join('\n')}\n`, 'utf8');
  console.log(`Benchmark data written for ${cases.length} workload points.`);
}

async function runBrowserBenchmark(): Promise<void> {
  await mkdir(rawDirectory, { recursive: true });
  await mkdir(logDirectory, { recursive: true });
  const browserPath = new URL('../../../../desktop-app/node_modules/playwright/index.mjs', import.meta.url);
  let chromium: { launch: (options: Record<string, unknown>) => Promise<any> };
  try {
    ({ chromium } = await import(browserPath.href) as { chromium: typeof chromium });
  } catch (error) {
    const unavailable = {
      status: 'BLOCKED/UNAVAILABLE',
      reason: `Existing desktop-app Playwright package is unavailable: ${error instanceof Error ? error.message : String(error)}`,
      environment: environmentRecord()
    };
    await writeRaw('browser.json', unavailable);
    await writeFile(resolve(logDirectory, 'browser.log'), JSON.stringify(unavailable, null, 2), 'utf8');
    console.log('Browser benchmark BLOCKED/UNAVAILABLE: Playwright package is not installed at the approved path.');
    return;
  }

  const output: Record<string, unknown>[] = [];
  let browser: any;
  try {
    browser = await chromium.launch({ headless: true });
    const browserCounts = [8, 64, 65, 128, 256, 512, 1024, 2048, 4096, 8192, 16384] as const;
    for (const count of browserCounts) {
      const spec: WorkloadSpec = { id: 'BROWSER', count, kind: 'circle', dynamic: true };
      const model = buildSyntheticModel(spec);
      const html = renderPreparedHtml(preparedReport([model]), { mode: 'standalone' }) as string;
      const page = await browser.newPage();
      try {
        const renderStart = performance.now();
        await page.setContent(html, { waitUntil: 'load', timeout: 60_000 });
        await page.locator('[data-diagram-canvas] [data-diagram-element]').first().waitFor({ timeout: 60_000 });
        const renderMs = performance.now() - renderStart;
        const expected = evaluateDiagramFrame(model, 0).elements.map(element => element.name);
        const elements = page.locator('[data-diagram-canvas] [data-diagram-element]');
        const atStart = await elements.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-diagram-element')));
        assert.deepEqual(atStart, expected);
        const scrubber = page.locator('[data-diagram-scrubber]');
        const selectTime = async (time: number): Promise<number> => {
          const label = time.toFixed(3);
          const frameStart = performance.now();
          await scrubber.evaluate((node, value) => {
            const input = node as HTMLInputElement;
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, String(time));
          await page.waitForFunction(value => document.querySelector('[data-diagram-time]')?.textContent === value, label);
          const names = await elements.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-diagram-element')));
          assert.deepEqual(names, expected);
          return performance.now() - frameStart;
        };
        await selectTime(0.125);
        const frameTimesMs: number[] = [];
        for (const time of [0.25, 0.5, 0.75, 0.875, 1]) frameTimesMs.push(await selectTime(time));
        const frameWork = await page.evaluate(() => {
          const input = document.querySelector<HTMLInputElement>('[data-diagram-scrubber]');
          if (!input) throw new Error('Missing diagram scrubber.');
          const times = Array.from({ length: 20 }, (_, index) => (index + 1) / 21);
          for (const time of [0.111, 0.222, 0.333, 0.444, 0.555]) {
            input.value = String(time);
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const samplesMs: number[] = [];
          for (const time of times) {
            const start = performance.now();
            input.value = String(time);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            samplesMs.push(performance.now() - start);
          }
          return {
            samplesMs,
            displayTime: document.querySelector('[data-diagram-time]')?.textContent,
            names: [...document.querySelectorAll('[data-diagram-canvas] [data-diagram-element]')]
              .map(element => element.getAttribute('data-diagram-element'))
          };
        });
        assert.deepEqual(frameWork.names, expected);
        assert.equal(frameWork.displayTime, (20 / 21).toFixed(3));
        output.push({
          count,
          status: 'PASS',
          pageInitializationMs: renderMs,
          warmupScrub: '0.125',
          clientScrubLatencyMs: frameTimesMs,
          clientScrubMedianMs: percentile(frameTimesMs, 0.5),
          clientScrubP95Ms: percentile(frameTimesMs, 0.95),
          inPageFrameWorkSamplesMs: frameWork.samplesMs,
          inPageFrameWorkMedianMs: percentile(frameWork.samplesMs, 0.5),
          inPageFrameWorkP95Ms: percentile(frameWork.samplesMs, 0.95),
          frameMedianMs: percentile(frameTimesMs, 0.5),
          frameP95Ms: percentile(frameTimesMs, 0.95),
          orderedMembershipStable: true,
          domElements: await page.locator('*').count(),
          htmlCharacters: html.length,
          htmlUtf8Bytes: Buffer.byteLength(html, 'utf8'),
          modelScope: 'flattened AST equivalent; not a generated-control production model'
        });
        console.log(`Browser count=${count}: PASS`);
      } finally {
        await page.close();
      }
    }
    const compositions: Record<string, unknown>[] = [];
    const compositionSpecs: WorkloadSpec[] = [
      ...[64, 65, 128].map(count => ({ id: 'B7-CIRCLE', count, kind: 'circle' as const, dynamic: true })),
      ...[64, 65, 128].map(count => ({ id: 'B7-TEXT', count, kind: 'text' as const, dynamic: false, textLength: 128 })),
      ...[64, 65].map(generatedCount => ({
        id: 'B7-AUTHOR-GEN', count: 32 + generatedCount, kind: 'mixed' as const, dynamic: true,
        directCount: 32, boundaryCase: generatedCount === QUALIFIED_CAP_CANDIDATE ? 'cap' as const : 'cap+1' as const
      }))
    ];
    for (const spec of compositionSpecs) {
      const models = Array.from({ length: 16 }, (_, index) => buildSyntheticModel(spec, `-${index}`));
      const html = renderPreparedHtml(preparedReport(models), { mode: 'standalone' }) as string;
      const page = await browser.newPage();
      try {
        const start = performance.now();
        await page.setContent(html, { waitUntil: 'load', timeout: 60_000 });
        const elementCounts = models.map(model => model.declaration.elements.length);
        await page.waitForFunction(counts => {
          const figures = [...document.querySelectorAll('[data-openamx-diagram]')];
          return figures.length === counts.length
            && figures.every((figure, index) => figure.querySelectorAll('[data-diagram-element]').length === counts[index]);
        }, elementCounts, { timeout: 60_000 });
        await page.locator('[data-diagram-canvas] [data-diagram-element]').first().waitFor({ timeout: 60_000 });
        const pageInitializationMs = performance.now() - start;
        const expected = models.map(model => evaluateDiagramFrame(model, 0).elements.map(element => element.name));
        const readMembership = () => page.locator('[data-openamx-diagram]').evaluateAll(figures => figures.map(figure =>
          [...figure.querySelectorAll<SVGElement>('[data-diagram-element]')]
            .map(element => element.getAttribute('data-diagram-element'))));
        assert.deepEqual(await readMembership(), expected);
        await page.locator('[data-diagram-scrubber]').first().evaluate(node => {
          const input = node as HTMLInputElement;
          input.value = '0.5';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        assert.equal(await page.locator('[data-diagram-time]').first().textContent(), '0.500');
        assert.deepEqual(await readMembership(), expected);
        const domElements = await page.locator('*').count();
        compositions.push({
          id: spec.id, perDiagramCount: spec.count, diagrams: 16, totalEmitted: 16 * spec.count,
          authoredDeclarationsPerReport: spec.directCount ? spec.directCount * 16 : 0,
          generatedElementsPerDiagram: spec.directCount ? spec.count - spec.directCount : 0,
          authoredLimitRemainsSeparate: true,
          status: 'PASS', orderedMembershipStable: true, pageInitializationMs, domElements,
          within2000DomNodeLimit: domElements <= 2000,
          htmlCharacters: html.length, htmlUtf8Bytes: Buffer.byteLength(html, 'utf8')
        });
      } finally {
        await page.close();
      }
      console.log(`${spec.id} count=${spec.count} across 16 diagrams: PASS`);
    }
    const result = { status: 'PASS', environment: environmentRecord(), browserVersion: browser.version(), workloads: output, compositions };
    await writeRaw('browser-retry-09.json', result);
    await writeFile(resolve(logDirectory, 'browser-retry-09.log'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  } catch (error) {
    const result = {
      status: 'FAIL',
      environment: environmentRecord(),
      completedWorkloads: output,
      error: error instanceof Error ? error.stack ?? error.message : String(error)
    };
    await writeRaw('browser-retry-09-failure.json', result);
    await writeFile(resolve(logDirectory, 'browser-retry-09.log'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.error('Browser benchmark FAIL; raw completed workloads and failure were recorded.');
  } finally {
    await browser?.close();
  }
}

const modes = process.argv.slice(2);
if (modes.length !== 1) throw new Error('Select exactly one probe mode.');
switch (modes[0]) {
  case '--prototype':
    await runPrototype();
    break;
  case '--benchmark':
    await runBenchmark();
    break;
  case '--browser':
    await runBrowserBenchmark();
    break;
  default:
    throw new Error('Supported modes: --prototype, --benchmark, --browser.');
}