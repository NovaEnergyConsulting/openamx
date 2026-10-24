import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sourceTokenRange } from '../src/editor/sourceRanges';
import { formatAmx, formatAmxDocument } from '../src/formatter/formatAmx';
import { AmxError } from '../src/diagnostics/errors';
import { parseDocumentText } from '../src/parser/parseDocument';
import { checkDocument } from '../src/typechecker/checkDocument';
import { evaluateDocumentEnvironment } from '../src/runtime/evaluateDocument';
import { deserializeDiagramSceneModel, evaluateDiagramFrame, serializeDiagramSceneModel } from '../src/runtime/diagramModel';
import { loadEntryModule } from '../src/runtime/moduleLoader';
import type { DiagramSceneModel } from '../src/runtime/diagramModel';

const contract = readFileSync(
  new URL('../planning/sprints/0078-v13-diagram-contract-feasibility-gate/grammar-examples.md', import.meta.url),
  'utf8'
).replace(/\r\n/g, '\n');

function fixture(id: string): string {
  const heading = contract.indexOf(`### ${id} —`);
  if (heading < 0) throw new Error(`Missing approved diagram fixture ${id}`);
  const open = contract.indexOf('````amx-source\n', heading);
  if (open < 0) throw new Error(`Missing document wrapper for ${id}`);
  const start = open + '````amx-source\n'.length;
  const end = contract.indexOf('\n````', start);
  if (end < 0) throw new Error(`Unclosed document wrapper for ${id}`);
  return contract.slice(start, end);
}

function captureModel(source: string, file = 'diagram.amx'): DiagramSceneModel {
  const env = evaluateDocumentEnvironment(parseDocumentText(source), file);
  const emission = env.diagramEmissions[0];
  if (!emission) throw new Error('Expected a diagram model emission');
  return emission.model;
}

function captureFailure(run: () => unknown): AmxError {
  try {
    run();
  } catch (error) {
    if (error instanceof AmxError) return error;
    throw error;
  }
  throw new Error('Expected an AMX diagnostic');
}

describe('diagram language and shared scene model', () => {
  it('parses, checks, and evaluates both approved complete-document fixtures', () => {
    const crankDocument = parseDocumentText(fixture('D-CRANK-01'));
    const crankEnv = evaluateDocumentEnvironment(crankDocument, 'D-CRANK-01.amx');
    const batteryEnv = evaluateDocumentEnvironment(parseDocumentText(fixture('D-BATTERY-01')), 'D-BATTERY-01.amx');
    expect(crankEnv.diagramEmissions).toHaveLength(1);
    expect(batteryEnv.diagramEmissions).toHaveLength(1);

    const crank = crankEnv.diagramEmissions[0].model;
    const crankPin = evaluateDiagramFrame(crank, 1.5).elements.find(element => element.name === 'crankPin');
    expect(crank.name).toBe('crankSlider');
    expect(crank.title).toBe('Crank-slider mechanism');
    expect(crank.canvas).toEqual({ width: 320, height: 200, coordinates: 'bottom-left-y-up' });
    expect(crank.timeline).toEqual({ variable: 't', from: 0, to: 2, duration: 4 });
    expect(crank.initialFrame.elements.map(element => element.name)).toEqual([
      'lowerGuide', 'upperGuide', 'connectingRod', 'crank', 'pivot', 'crankPin', 'piston', 'timeLabel'
    ]);
    expect(crankPin).toMatchObject({ primitive: 'circle', cx: 70, cy: 66, r: 6 });
    expect(evaluateDiagramFrame(crank, 2).time).toBe(2);
    const browserRoundTrip = deserializeDiagramSceneModel(serializeDiagramSceneModel(crank));
    expect(evaluateDiagramFrame(browserRoundTrip, 1.5).elements.find(element => element.name === 'crankPin'))
      .toMatchObject({ primitive: 'circle', cx: 70, cy: 66, r: 6 });
    const declaration = crankDocument.nodes.find(node => node.type === 'executableCodeBlock')?.statements
      .find(statement => statement.type === 'diagramDeclaration');
    const title = declaration?.type === 'diagramDeclaration'
      ? declaration.properties.find(property => property.name === 'title')?.expression
      : undefined;
    if (!title || title.type !== 'stringLiteral') throw new Error('Expected the source diagram title literal');
    title.value = 'Changed after model capture';
    expect(crank.title).toBe('Crank-slider mechanism');
    expect(crank.declaration.properties.find(property => property.name === 'title')?.rawValue)
      .toBe('"Crank-slider mechanism"');
    expect(Object.isFrozen(crank.declaration.properties[0])).toBe(true);

    const battery = batteryEnv.diagramEmissions[0].model;
    const atStart = battery.initialFrame.elements.find(element => element.name === 'currentIndicator');
    const atMiddle = evaluateDiagramFrame(battery, 2).elements.find(element => element.name === 'currentIndicator');
    const currentLabel = evaluateDiagramFrame(battery, 2).elements.find(element => element.name === 'currentLabel');
    expect(atStart).toMatchObject({ primitive: 'line', x1: 58, arrow: 'end' });
    expect(atMiddle).toMatchObject({ primitive: 'line', x1: 108, x2: 122, arrow: 'end' });
    expect(currentLabel).toMatchObject({ primitive: 'text', value: 'I = 0.6 A' });
  });

  it('evaluates the rotating-vector example before and after browser serialization', () => {
    const source = readFileSync(new URL('./fixtures/examples/v0.16-vector-rotation.amx', import.meta.url), 'utf8');
    const model = captureModel(source, 'VectorRotationDiagram.amx');
    const browserModel = deserializeDiagramSceneModel(serializeDiagramSceneModel(model));
    const expectedFrames = [
      { time: 0, vectorX: 350, cursorX: 400, angle: 'Angle: 0' },
      { time: 1, vectorX: 50, cursorX: 598, angle: 'Angle: 180' },
      { time: 2, vectorX: 350, cursorX: 796, angle: 'Angle: 360' }
    ];

    for (const candidate of [model, browserModel]) {
      for (const expected of expectedFrames) {
        const elements = new Map(evaluateDiagramFrame(candidate, expected.time).elements.map(element => [element.name, element]));
        const phaseA = elements.get('phaseA');
        const phaseADot = elements.get('phaseADot');
        if (phaseA?.primitive !== 'line' || phaseADot?.primitive !== 'circle') {
          throw new Error('Expected the phase A vector and dot.');
        }
        expect(phaseA.x2).toBeCloseTo(expected.vectorX, 8);
        expect(phaseA.y2).toBeCloseTo(200, 8);
        expect(phaseADot.cx).toBeCloseTo(expected.cursorX, 8);
        expect(phaseADot.cy).toBeCloseTo(200, 8);
        expect(elements.get('timeLabel')).toMatchObject({ value: expected.angle });
      }
    }
    expect(model.initialFrame).toEqual(evaluateDiagramFrame(browserModel, 0));
    const phaseB = model.initialFrame.elements.find(element => element.name === 'phaseB');
    const phaseC = model.initialFrame.elements.find(element => element.name === 'phaseC');
    if (phaseB?.primitive !== 'line' || phaseC?.primitive !== 'line') throw new Error('Expected three vector lines.');
    expect(phaseB.x2).toBeCloseTo(125, 8);
    expect(phaseB.y2).toBeCloseTo(329.9038, 3);
    expect(phaseC.x2).toBeCloseTo(125, 8);
    expect(phaseC.y2).toBeCloseTo(70.0962, 3);
  });

  it('preserves all 24 invalid-fixture diagnostics and their original-document locations', () => {
    const expected: Array<{
      id: string;
      code: string;
      message: string;
      line: number;
      column: number;
      frameTime?: number;
    }> = [
      { id: 'D-NEG-01', code: 'AMXD001', message: 'Missing required field: title', line: 5, column: 1 },
      { id: 'D-NEG-02', code: 'AMXD001', message: 'Missing required field: description', line: 5, column: 1 },
      { id: 'D-NEG-03', code: 'AMX3002', message: 'Expected String, got Number', line: 6, column: 10 },
      { id: 'D-NEG-04', code: 'AMXD001', message: 'Missing required field: width', line: 5, column: 1 },
      { id: 'D-NEG-05', code: 'AMXD001', message: 'Missing required field: height', line: 5, column: 1 },
      { id: 'D-NEG-06', code: 'AMXD001', message: 'Missing required field: time', line: 5, column: 1 },
      { id: 'D-NEG-07', code: 'AMX3002', message: 'Expected Number, got String', line: 8, column: 10 },
      { id: 'D-NEG-08', code: 'AMXD002', message: 'Unknown diagram property', line: 11, column: 3 },
      { id: 'D-NEG-09', code: 'AMXD002', message: 'Unknown diagram property', line: 15, column: 5 },
      { id: 'D-NEG-10', code: 'AMXD003', message: 'Canvas width is invalid', line: 8, column: 10 },
      { id: 'D-NEG-11', code: 'AMXD004', message: 'Invalid time bounds', line: 10, column: 3 },
      { id: 'D-NEG-12', code: 'AMXD005', message: 'Invalid playback duration value', line: 10, column: 31 },
      { id: 'D-NEG-13', code: 'AMXD006', message: 'Inconsistent time style', line: 15, column: 13 },
      { id: 'D-NEG-14', code: 'AMXD008', message: 'Invalid primitive geometry', line: 14, column: 8 },
      { id: 'D-NEG-15', code: 'AMXD009', message: 'Frame evaluation leads to invalid results. The underlying error is: ', line: 14, column: 8, frameTime: 2 },
      { id: 'D-NEG-16', code: 'AMX3001', message: "Unknown identifier 't'", line: 18, column: 23 },
      { id: 'D-NEG-17', code: 'AMXD003', message: 'Canvas width is invalid', line: 8, column: 10 },
      { id: 'D-NEG-18', code: 'AMXD004', message: 'Invalid time bounds', line: 10, column: 15 },
      { id: 'D-NEG-19', code: 'AMXD008', message: 'Invalid primitive geometry', line: 14, column: 12 },
      { id: 'D-NEG-20', code: 'AMXD001', message: 'Missing required field: x2', line: 11, column: 3 },
      { id: 'D-NEG-21', code: 'AMXD007', message: 'Unsupported arrow literal', line: 18, column: 12 },
      { id: 'D-NEG-22', code: 'AMXD010', message: 'Infinity value calculated for time upper bound', line: 14, column: 8, frameTime: 2 },
      { id: 'D-NEG-23', code: 'AMXD004', message: 'Invalid time bounds', line: 10, column: 3, frameTime: -1 },
      { id: 'D-NEG-24', code: 'AMXD011', message: 'Expression produces an infinite result', line: 14, column: 8, frameTime: 1 }
    ];

    expect(expected).toHaveLength(24);
    for (const item of expected) {
      const source = fixture(item.id);
      const error = captureFailure(() => {
        const model = captureModel(source, `${item.id}.amx`);
        if (item.frameTime !== undefined) evaluateDiagramFrame(model, item.frameTime);
      });
      expect(error.code).toBe(item.code);
      expect(error.file).toBe(`${item.id}.amx`);
      expect(error.line).toBe(item.line);
      expect(error.column).toBe(item.column);
      if (item.code === 'AMXD009') {
        expect(error.message.startsWith(item.message)).toBe(true);
        expect(error.message).toContain('sqrt');
      } else {
        expect(error.message).toBe(item.message);
      }
    }
  });

  it('uses original UTF-16 source offsets for editor token ranges', () => {
    const source = fixture('D-NEG-09').replace('title: D-NEG-09', 'title: 🚀 D-NEG-09');
    const range = sourceTokenRange(source, { line: 15, column: 5 }, 'rotate');
    expect(range).toEqual({
      from: source.indexOf('rotate'),
      to: source.indexOf('rotate') + 'rotate'.length
    });
  });

  it('captures full imported AMX context and re-evaluates each frame without mutating its model', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-diagram-context-'));
    const modulePath = join(directory, 'model.amx');
    const entryPath = join(directory, 'entry.amx');
    try {
      await writeFile(modulePath, `\`\`\`amx\n${[
        'export dimension Length',
        'export unit meter: Length',
        'export unit kilometer = 1000 * meter',
        'export enum Surface = {',
        '  ROUGH = "rough",',
        '  SMOOTH = "smooth"',
        '}',
        'export type Profile {',
        '  factor: Number',
        '  surface: String',
        '  note: String?',
        '}',
        'export fn scale(distance: Length, profile: Profile): Number = (distance / 1 meter) * profile.factor',
        'export fn directSurface(): String = Surface.ROUGH'
      ].join('\n')}\n\`\`\`\n`);
      const entry = [
        'import { Length, kilometer, Profile, Surface, scale, directSurface } from "./model.amx"',
        'let distance: Length = 2 kilometer',
        'let profile: Profile = Profile { factor = 3, surface = Surface.ROUGH, note = null }',
        'let factors: Number[] = [1, 2, 3]',
        'diagram typedContext {',
        '  title: "Typed context"',
        '  description: "Imported function and typed AMX values"',
        '  width: 120',
        '  height: 80',
        '  time t from 0 to 1 duration 1',
        '  circle sample {',
        '    cx: if profile.surface == "rough" then scale(distance, profile) * (1 + t) / 1000 * factors[2] else 0',
        '    cy: 10',
        '    r: 2',
        '    stroke: "#263238"',
        '    lineWidth: 1',
        '  }',
        '  text label {',
        '    x: 10',
        '    y: 10',
        '    value: "${round(scale(distance, profile) * (1 + t) / 1000 * factors[2], 2)} ${profile.note}"',
        '    fill: "#263238"',
        '  }',
        '}'
      ].join('\n');
      await writeFile(entryPath, `\`\`\`amx\n${entry}\n\`\`\`\n`);
      const loaded = await loadEntryModule(entryPath);
      const model = loaded.env.diagramEmissions[0].model;
      const browserRoundTrip = deserializeDiagramSceneModel(serializeDiagramSceneModel(model));
      const initial = model.initialFrame.elements.find(element => element.name === 'sample');
      const interior = evaluateDiagramFrame(model, 0.25).elements.find(element => element.name === 'sample');
      const browserInterior = evaluateDiagramFrame(browserRoundTrip, 0.25).elements.find(element => element.name === 'sample');
      const upper = evaluateDiagramFrame(model, 1).elements.find(element => element.name === 'sample');
      const label = evaluateDiagramFrame(model, 0.25).elements.find(element => element.name === 'label');
      expect(initial).toMatchObject({ primitive: 'circle', cx: 12 });
      expect(interior).toMatchObject({ primitive: 'circle', cx: 15 });
      expect(browserInterior).toMatchObject({ primitive: 'circle', cx: 15 });
      expect(upper).toMatchObject({ primitive: 'circle', cx: 24 });
      expect(label).toMatchObject({ primitive: 'text', value: '15 null' });
      expect(Object.isFrozen(model)).toBe(true);
      expect(Object.isFrozen(model.declaration)).toBe(true);
      expect(Object.isFrozen(model.declaration.elements)).toBe(true);
      expect(Object.isFrozen(model.initialFrame.elements)).toBe(true);

      loaded.env.update('distance', { value: 900, unit: { text: 'kilometer' } });
      expect(evaluateDiagramFrame(model, 0.25).elements.find(element => element.name === 'sample')).toMatchObject({ cx: 15 });

      const directEntryPath = join(directory, 'direct.amx');
      const directEntry = [
        'import { directSurface } from "./model.amx"',
        'diagram enumContext {',
        '  title: "Enum context"',
        '  description: "Preserved imported-function behavior"',
        '  width: 10',
        '  height: 10',
        '  time t from 0 to 1 duration 1',
        '  text label {',
        '    x: 1',
        '    y: 1',
        '    value: directSurface()',
        '    fill: "#263238"',
        '  }',
        '}'
      ].join('\n');
      await writeFile(directEntryPath, `\`\`\`amx\n${directEntry}\n\`\`\`\n`);
      const error = await loadEntryFailure(directEntryPath);
      expect(error).toMatchObject({ code: 'AMX1004', message: "Undefined identifier 'Surface'" });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('aggregates imported-module diagrams in dependency/source order and applies report caps across modules', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'openamx-diagram-modules-'));
    const moduleDocument = (body: string) => `\`\`\`amx\n${body}\n\`\`\`\n`;
    const simpleDiagram = (name: string, elements = 0, prefix = name, x = '1') => [
      `diagram ${name} {`,
      '  title: "Module diagram"',
      '  description: "Imported module diagram"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      ...Array.from({ length: elements }, (_, index) => [
        `  text ${prefix}Element${index} {`,
        `    x: ${x}`,
        '    y: 1',
        '    value: "x"',
        '    fill: "#263238"',
        '  }'
      ]).flat(),
      '}'
    ].join('\n');
    try {
      const firstPath = join(directory, 'first.amx');
      const secondPath = join(directory, 'second.amx');
      const entryPath = join(directory, 'entry.amx');
      await writeFile(firstPath, moduleDocument([
        'export let first: Number = 1',
        simpleDiagram('fromFirst', 1, 'fromFirst', 'first + t')
      ].join('\n')));
      await writeFile(secondPath, moduleDocument(['export let second: Number = 2', simpleDiagram('fromSecond')].join('\n')));
      await writeFile(entryPath, moduleDocument([
        'import { first } from "./first.amx"',
        'import { second } from "./second.amx"',
        simpleDiagram('fromEntry')
      ].join('\n')));

      const loaded = await loadEntryModule(entryPath);
      expect(loaded.diagramEmissions.map(emission => emission.model.name)).toEqual([
        'fromFirst', 'fromSecond', 'fromEntry'
      ]);
      expect(loaded.env.diagramEmissions.map(emission => emission.model.name)).toEqual([
        'fromFirst', 'fromSecond', 'fromEntry'
      ]);
      expect(loaded.diagramEmissions[0].model.file).toBe(firstPath);
      expect(loaded.diagramEmissions[1].model.file).toBe(secondPath);
      expect(loaded.diagramEmissions[0].model.initialFrame.elements[0]).toMatchObject({ x: 1 });
      expect(evaluateDiagramFrame(loaded.diagramEmissions[0].model, 0.5).elements[0]).toMatchObject({ x: 1.5 });

      const cappedFirstPath = join(directory, 'capped-first.amx');
      const cappedSecondPath = join(directory, 'capped-second.amx');
      const cappedEntryPath = join(directory, 'capped-entry.amx');
      await writeFile(cappedFirstPath, moduleDocument([
        'export let firstCap: Number = 1',
        ...Array.from({ length: 8 }, (_, index) => simpleDiagram(`first${index}`))
      ].join('\n')));
      await writeFile(cappedSecondPath, moduleDocument([
        'export let secondCap: Number = 2',
        ...Array.from({ length: 8 }, (_, index) => simpleDiagram(`second${index}`))
      ].join('\n')));
      await writeFile(cappedEntryPath, moduleDocument([
        'import { firstCap } from "./capped-first.amx"',
        'import { secondCap } from "./capped-second.amx"',
        simpleDiagram('entrySeventeenth')
      ].join('\n')));
      const diagramOverflow = await loadEntryFailure(cappedEntryPath);
      expect(diagramOverflow.code).toBe('AMXD012');
      expect(diagramOverflow.message).toBe('A single report can have up to 16 diagrams maximum.');
      expect(diagramOverflow.file).toBe(cappedEntryPath);

      const elementFirstPath = join(directory, 'elements-first.amx');
      const elementSecondPath = join(directory, 'elements-second.amx');
      const elementEntryPath = join(directory, 'elements-entry.amx');
      await writeFile(elementFirstPath, moduleDocument([
        'export let firstElements: Number = 1',
        simpleDiagram('firstElementsDiagram', 256, 'first')
      ].join('\n')));
      await writeFile(elementSecondPath, moduleDocument([
        'export let secondElements: Number = 2',
        simpleDiagram('secondElementsDiagram', 257, 'second')
      ].join('\n')));
      await writeFile(elementEntryPath, moduleDocument([
        'import { firstElements } from "./elements-first.amx"',
        'import { secondElements } from "./elements-second.amx"'
      ].join('\n')));
      const elementOverflow = await loadEntryFailure(elementEntryPath);
      expect(elementOverflow.code).toBe('AMXD013');
      expect(elementOverflow.message).toBe('A single report can have up to 512 elements maximum.');
      expect(elementOverflow.file).toBe(elementSecondPath);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('enforces the 16-diagram and 512-semantic-element report-wide limits', () => {
    const diagram = (name: string, elements: number) => [
      `diagram ${name} {`,
      '  title: "Limit"',
      '  description: "Limit test"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      ...Array.from({ length: elements }, (_, index) => [
        `  text ${name}Label${index} {`,
        '    x: 0',
        '    y: 0',
        '    value: "x"',
        '    fill: "#263238"',
        '  }'
      ]).flat(),
      '}'
    ].join('\n');
    const document = (body: string) => parseDocumentText(`\`\`\`amx\n${body}\n\`\`\``);
    const sixteen = Array.from({ length: 16 }, (_, index) => diagram(`d${index}`, 0)).join('\n');
    const seventeen = `${sixteen}\n${diagram('d16', 0)}`;
    expect(() => checkDocument(document(sixteen))).not.toThrow();
    const diagramOverflow = captureFailure(() => checkDocument(document(seventeen)));
    expect(diagramOverflow.code).toBe('AMXD012');
    expect(diagramOverflow.message).toBe('A single report can have up to 16 diagrams maximum.');
    expect(diagramOverflow.line).toBe(114);
    expect(diagramOverflow.column).toBe(1);

    const fiveHundredTwelve = `${diagram('first', 256)}\n${diagram('second', 256)}`;
    const fiveHundredThirteen = `${diagram('first', 256)}\n${diagram('second', 257)}`;
    expect(() => checkDocument(document(fiveHundredTwelve))).not.toThrow();
    const elementOverflow = captureFailure(() => checkDocument(document(fiveHundredThirteen)));
    expect(elementOverflow.code).toBe('AMXD013');
    expect(elementOverflow.message).toBe('A single report can have up to 512 elements maximum.');
  });

  it('reports the separately allocated height and static-style diagnostics', () => {
    const base = (propertyLines: string[]) => parseDocumentText(`---\ntitle: Diagnostic\n---\n\`\`\`amx\ndiagram invalid {\n  title: "Invalid"\n  description: "Invalid"\n  width: 10\n  height: 10\n  time t from 0 to 1 duration 1\n  circle point {\n    cx: 1\n    cy: 1\n    r: 1\n${propertyLines.join('\n')}\n  }\n}\n\`\`\`\n`);
    const invalidCases = [
      {
        document: parseDocumentText('---\ntitle: Height\n---\n```amx\ndiagram invalid {\n  title: "Invalid"\n  description: "Invalid"\n  width: 10\n  height: 0\n  time t from 0 to 1 duration 1\n}\n```\n'),
        code: 'AMXD014',
        message: 'Canvas height is invalid'
      },
      {
        document: parseDocumentText('---\ntitle: Height\n---\n```amx\ndiagram invalid {\n  title: "Invalid"\n  description: "Invalid"\n  width: 10\n  height: 1 / 0\n  time t from 0 to 1 duration 1\n}\n```\n'),
        code: 'AMXD014',
        message: 'Canvas height is invalid'
      },
      {
        document: base(['    stroke: "red"', '    lineWidth: 1']),
        code: 'AMXD015',
        message: 'Invalid diagram style specified'
      },
      {
        document: base(['    stroke: "#263238"', '    fill: "transparent"', '    lineWidth: 1']),
        code: 'AMXD015',
        message: 'Invalid diagram style specified'
      },
      {
        document: base(['    stroke: "#263238"', '    lineWidth: 0']),
        code: 'AMXD015',
        message: 'Invalid diagram style specified'
      }
    ];
    for (const item of invalidCases) {
      const error = captureFailure(() => evaluateDocumentEnvironment(item.document, 'style.amx'));
      expect(error).toMatchObject({ code: item.code, message: item.message });
    }
  });

  it('emits nested diagrams once per conditional or loop execution without counting repetitions as authored declarations', () => {
    const repeatedValues = Array.from({ length: 17 }, (_, index) => index + 1).join(', ');
    const source = [
      'if true {',
      ...smallDiagram('conditional'),
      '}',
      `for item in [${repeatedValues}] {`,
      ...smallDiagram('repeated', 'item'),
      '}'
    ].join('\n');
    const formatted = formatAmx(source);
    expect(formatted).toContain('  diagram conditional {\n    title: "Nested"');
    expect(formatAmx(formatted)).toBe(formatted);
    const env = evaluateDocumentEnvironment(parseDocumentText(`\`\`\`amx\n${source}\n\`\`\``), 'nested.amx');
    expect(env.diagramEmissions).toHaveLength(18);
    expect(env.diagramEmissions[0].model.name).toBe('conditional');
    expect(env.diagramEmissions.slice(1).every(emission => emission.model.name === 'repeated')).toBe(true);
    expect(env.diagramEmissions[1].model.initialFrame.elements[0]).toMatchObject({ primitive: 'circle', cx: 1 });
    expect(env.diagramEmissions[17].model.initialFrame.elements[0]).toMatchObject({ primitive: 'circle', cx: 17 });
  });
});

function smallDiagram(name: string, x = '1'): string[] {
  return [
    `  diagram ${name} {`,
    '    title: "Nested"',
    '    description: "Nested execution"',
    '    width: 20',
    '    height: 20',
    '    time t from 0 to 1 duration 1',
    `    circle ${name}Point {`,
    `      cx: ${x}`,
    '      cy: 1',
    '      r: 1',
    '      stroke: "#263238"',
    '      lineWidth: 1',
    '    }',
    '  }'
  ];
}

async function loadEntryFailure(path: string): Promise<AmxError> {
  try {
    await loadEntryModule(path);
  } catch (error) {
    if (error instanceof AmxError) return error;
    throw error;
  }
  throw new Error('Expected entry-module evaluation to fail');
}

describe('diagram canonical formatter', () => {
  it('keeps the complete approved documents stable and meaning-preserving', () => {
    for (const id of ['D-CRANK-01', 'D-BATTERY-01']) {
      const source = fixture(id);
      const formatted = formatAmxDocument(source);
      expect(formatAmxDocument(formatted)).toBe(formatted);
      const before = captureModel(source);
      const after = captureModel(formatted);
      expect(after.initialFrame).toEqual(before.initialFrame);
      for (const time of [before.timeline.from, (before.timeline.from + before.timeline.to) / 2, before.timeline.to]) {
        expect(evaluateDiagramFrame(after, time)).toEqual(evaluateDiagramFrame(before, time));
      }
    }
  });

  it('orders diagram fields canonically and preserves expression text and model meaning', () => {
    const source = [
      'diagram ordered {',
      '  height: 80',
      '  width: 120',
      '  description: "Accessible"',
      '  title: "Ordered"',
      '  time t from 0 to 1 duration 2',
      '  rectangle box {',
      '    lineWidth: 2',
      '    fill: "#FFFFFF"',
      '    stroke: "#263238"',
      '    height: 20',
      '    width: 30',
      '    y: 2',
      '    x: 1 + t',
      '  }',
      '}'
    ].join('\n');
    const expected = [
      'diagram ordered {',
      '  title: "Ordered"',
      '  description: "Accessible"',
      '  width: 120',
      '  height: 80',
      '  time t from 0 to 1 duration 2',
      '  rectangle box {',
      '    x: 1 + t',
      '    y: 2',
      '    width: 30',
      '    height: 20',
      '    stroke: "#263238"',
      '    fill: "#FFFFFF"',
      '    lineWidth: 2',
      '  }',
      '}',
      ''
    ].join('\n');
    const formatted = formatAmx(source);
    expect(formatted).toBe(expected);
    expect(formatAmx(formatted)).toBe(formatted);
    const before = captureModel(`\`\`\`amx\n${source}\n\`\`\``);
    const after = captureModel(`\`\`\`amx\n${formatted}\`\`\``);
    expect(after.initialFrame).toEqual(before.initialFrame);
    expect(evaluateDiagramFrame(after, 0.5)).toEqual(evaluateDiagramFrame(before, 0.5));
  });

  it('accepts an empty diagram as permitted by the approved Element* grammar', () => {
    const source = [
      'diagram empty {',
      '  title: "Empty"',
      '  description: "No authored elements"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '}'
    ].join('\n');
    const model = captureModel(`\`\`\`amx\n${source}\n\`\`\``);
    expect(model.initialFrame.elements).toEqual([]);
    expect(formatAmx(source)).toContain('diagram empty');
  });
});
