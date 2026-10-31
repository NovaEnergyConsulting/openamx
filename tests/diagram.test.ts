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

function serializedObjectField(value: unknown, name: string): unknown {
  if (!Array.isArray(value) || value[0] !== 'object' || !Array.isArray(value[1])) {
    throw new Error('Expected a serialized object value.');
  }
  const entry = value[1].find((candidate: unknown) => Array.isArray(candidate) && candidate[0] === name);
  if (!Array.isArray(entry)) throw new Error(`Missing serialized object field '${name}'.`);
  return entry[1];
}

function setSerializedObjectField(value: unknown, name: string, replacement: unknown): void {
  if (!Array.isArray(value) || value[0] !== 'object' || !Array.isArray(value[1])) {
    throw new Error('Expected a serialized object value.');
  }
  const entry = value[1].find((candidate: unknown) => Array.isArray(candidate) && candidate[0] === name);
  if (!Array.isArray(entry)) throw new Error(`Missing serialized object field '${name}'.`);
  entry[1] = replacement;
}

function serializedArrayItems(value: unknown): unknown[] {
  if (!Array.isArray(value) || value[0] !== 'array' || !Array.isArray(value[1])) {
    throw new Error('Expected a serialized array value.');
  }
  return value[1];
}

function serializedScalar(value: unknown): unknown {
  return Array.isArray(value) ? value[1] : undefined;
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
    const simpleDiagram = (name: string, elements = 0, prefix = name, x = '1', nested = false) => {
      const authoredElements = Array.from({ length: elements }, (_, index) => [
        `  text ${prefix}Element${index} {`,
        `    x: ${x}`,
        '    y: 1',
        '    value: "x"',
        '    fill: "#263238"',
        '  }'
      ]).flat();
      return [
        `diagram ${name} {`,
        '  title: "Module diagram"',
        '  description: "Imported module diagram"',
        '  width: 10',
        '  height: 10',
        '  time t from 0 to 1 duration 1',
        ...(nested ? ['  if true {', ...authoredElements.map(line => `  ${line}`), '  }'] : authoredElements),
        '}'
      ].join('\n');
    };
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
        simpleDiagram('firstElementsDiagram', 256, 'first', '1', true)
      ].join('\n')));
      await writeFile(elementSecondPath, moduleDocument([
        'export let secondElements: Number = 2',
        simpleDiagram('secondElementsDiagram', 257, 'second', '1', true)
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

  it('checks nested diagram controls and restores shadowed iterator bindings', () => {
    const source = [
      '```amx',
      'let item: Number = 9',
      'diagram generated {',
      '  title: "Generated"',
      '  description: "Static checking only"',
      '  width: 100',
      '  height: 50',
      '  time t from 0 to 1 duration 1',
      '  for item in [1, 2] {',
      '    if item > 1 {',
      '      circle loopBranch {',
      '        cx: item * 10',
      '        cy: t',
      '        r: 2',
      '        stroke: "#263238"',
      '        lineWidth: 1',
      '      }',
      '    }',
      '  }',
      '  for ranged in [1 to 3] {',
      '  }',
      '  if true {',
      '    for other in [3, 4] {',
      '      circle conditionalBranch {',
      '        cx: other * 10',
      '        cy: t',
      '        r: 2',
      '        stroke: "#263238"',
      '        lineWidth: 1',
      '      }',
      '    }',
      '  }',
      '  circle direct {',
      '    cx: item',
      '    cy: t',
      '    r: 2',
      '    stroke: "#263238"',
      '    lineWidth: 1',
      '  }',
      '}',
      '```'
    ].join('\n');
    expect(() => checkDocument(parseDocumentText(source))).not.toThrow();
  });

  it('expands diagram controls once in depth-first order and retains per-instance frame bindings', () => {
    const circle = (name: string, cx: string, indent: string) => [
      `${indent}circle ${name} {`,
      `${indent}  cx: ${cx}`,
      `${indent}  cy: t`,
      `${indent}  r: 2`,
      `${indent}  stroke: "#263238"`,
      `${indent}  lineWidth: 1`,
      `${indent}}`
    ];
    const source = [
      '```amx',
      'let item: Number = 9',
      'diagram generated {',
      '  title: "Generated"',
      '  description: "Expansion and frame bindings"',
      '  width: 100',
      '  height: 50',
      '  time t from 0 to 1 duration 1',
      ...circle('before', '0', '  '),
      '  if true {',
      ...circle('branch', '5', '    '),
      '  }',
      '  for item in [1, 2] {',
      '    if item != 2 {',
      ...circle('repeated', 'item * 10', '      '),
      '    }',
      '  }',
      '  if false {',
      ...circle('hidden', '0', '    '),
      '  }',
      '  if true {',
      '    for nested in [4, 5] {',
      ...circle('conditionalLoop', 'nested * 10', '      '),
      '    }',
      '  }',
      ...circle('after', 'item', '  '),
      '}',
      '```'
    ].join('\n');
    const env = evaluateDocumentEnvironment(parseDocumentText(source), 'generated.amx');
    const model = env.diagramEmissions[0]!.model;
    const expected = [
      ['before', 0], ['branch', 5], ['repeated', 10], ['conditionalLoop', 40],
      ['conditionalLoop', 50], ['after', 9]
    ];

    expect(env.get('item')).toBe(9);
    expect(model.initialFrame.elements.map(element => element.name)).toEqual(expected.map(([name]) => name));
    const serialized = serializeDiagramSceneModel(model);
    expect(JSON.parse(serialized).version).toBe(2);
    const restored = deserializeDiagramSceneModel(serialized);
    expect(JSON.parse(serialized).instances).toHaveLength(expected.length);

    const quarterFrame = evaluateDiagramFrame(model, 0.25);
    expect(quarterFrame.elements.map(element => element.primitive === 'circle'
      ? [element.name, element.cx, element.cy]
      : [element.name, null, null])).toEqual([
      ['before', 0, 0.25], ['branch', 5, 0.25], ['repeated', 10, 0.25],
      ['conditionalLoop', 40, 0.25], ['conditionalLoop', 50, 0.25], ['after', 9, 0.25]
    ]);
    expect(evaluateDiagramFrame(model, 0.75).elements.map(element => element.name)).toEqual(expected.map(([name]) => name));
    expect(evaluateDiagramFrame(model, 0.25).elements).toEqual(quarterFrame.elements);
    expect(evaluateDiagramFrame(model, 1).elements.map(element => element.primitive === 'circle' ? element.cy : null))
      .toEqual([1, 1, 1, 1, 1, 1]);
    for (const time of [0, 0.25, 1]) {
      expect(evaluateDiagramFrame(restored, time)).toEqual(evaluateDiagramFrame(model, time));
    }

    const alteredCondition = JSON.parse(serialized) as { model: unknown };
    const declaration = serializedObjectField(alteredCondition.model, 'declaration');
    const content = serializedArrayItems(serializedObjectField(declaration, 'content'));
    const branch = content.find(node => serializedScalar(serializedObjectField(node, 'type')) === 'diagramIfBlock');
    if (!branch) throw new Error('Expected the serialized conditional branch.');
    const condition = serializedObjectField(branch, 'test');
    setSerializedObjectField(condition, 'value', ['boolean', false]);
    const restoredWithoutControlEvaluation = deserializeDiagramSceneModel(JSON.stringify(alteredCondition));
    expect(evaluateDiagramFrame(restoredWithoutControlEvaluation, 0.25).elements)
      .toEqual(evaluateDiagramFrame(model, 0.25).elements);
  });

  it('preserves scalar, list, record, enum, and measurement loop bindings', () => {
    const circle = (name: string, cx: string, indent: string) => [
      `${indent}circle ${name} {`,
      `${indent}  cx: ${cx}`,
      `${indent}  cy: t`,
      `${indent}  r: 2`,
      `${indent}  stroke: "#263238"`,
      `${indent}  lineWidth: 1`,
      `${indent}}`
    ];
    const source = [
      '```amx',
      'enum Surface = {',
      '  ROUGH = "rough",',
      '  SMOOTH = "smooth"',
      '}',
      'type Profile {',
      '  factor: Number',
      '  label: String',
      '}',
      'dimension Length',
      'unit meter: Length',
      'unit centimeter = 0.01 * meter',
      'let profiles: Profile[] = [Profile { factor = 2, label = "A" }, Profile { factor = 3, label = "B" }]',
      'let rows: Number[][] = [[1, 2], [3, 4]]',
      'let distances: Length[] = [1 meter, 250 centimeter]',
      'diagram typedGenerated {',
      '  title: "Typed generated bindings"',
      '  description: "AMX data values survive model round trips"',
      '  width: 120',
      '  height: 80',
      '  time t from 0 to 1 duration 1',
      '  for profile in profiles {',
      ...circle('recordBound', 'profile.factor * 10 + t', '    '),
      '  }',
      '  for row in rows {',
      ...circle('listBound', 'row[1] + t', '    '),
      '  }',
      '  for surface in [Surface.ROUGH, Surface.SMOOTH] {',
      ...circle('enumBound', 'if surface == "rough" then 10 + t else 20 + t', '    '),
      '  }',
      '  for distance in distances {',
      ...circle('measurementBound', 'distance / 1 meter + t', '    '),
      '  }',
      '}',
      '```'
    ].join('\n');
    const model = captureModel(source);
    const restored = deserializeDiagramSceneModel(serializeDiagramSceneModel(model));
    const atStart = evaluateDiagramFrame(restored, 0).elements;
    expect(atStart.map(element => element.primitive === 'circle' ? [element.name, element.cx] : null)).toEqual([
      ['recordBound', 20], ['recordBound', 30],
      ['listBound', 1], ['listBound', 3],
      ['enumBound', 10], ['enumBound', 20],
      ['measurementBound', 1], ['measurementBound', 2.5]
    ]);
    expect(evaluateDiagramFrame(restored, 0.5).elements).toEqual(evaluateDiagramFrame(model, 0.5).elements);
  });

  it('reads legacy v1 static models and rejects incomplete or malformed instance payloads', () => {
    const staticModel = captureModel(fixture('D-CRANK-01'));
    const legacy = JSON.parse(serializeDiagramSceneModel(staticModel)) as Record<string, unknown>;
    legacy.version = 1;
    delete legacy.instances;
    const legacyModel = deserializeDiagramSceneModel(JSON.stringify(legacy));
    expect(evaluateDiagramFrame(legacyModel, 1)).toEqual(evaluateDiagramFrame(staticModel, 1));

    const controlModel = captureModel([
      '```amx',
      'diagram generated {',
      '  title: "Generated"',
      '  description: "Legacy compatibility"',
      '  width: 100',
      '  height: 50',
      '  time t from 0 to 1 duration 1',
      '  for item in [3] {',
      '    circle point {',
      '      cx: item + t',
      '      cy: 20',
      '      r: 2',
      '      stroke: "#263238"',
      '      lineWidth: 1',
      '    }',
      '  }',
      '}',
      '```'
    ].join('\n'));
    const payload = JSON.parse(serializeDiagramSceneModel(controlModel)) as {
      version: number;
      instanceCount: number;
      instances?: Array<{ sourcePath: unknown; bindings: Array<{ name: string; value: unknown }> }>;
      [key: string]: unknown;
    };
    const legacyGenerated = { ...payload, version: 1 };
    delete legacyGenerated.instances;
    expect(() => deserializeDiagramSceneModel(JSON.stringify(legacyGenerated)))
      .toThrow('Version 1 control-bearing diagram models are missing expanded instances.');

    const unknownVersion = { ...payload, version: 99 };
    expect(() => deserializeDiagramSceneModel(JSON.stringify(unknownVersion)))
      .toThrow('Invalid serialized diagram model envelope.');
    const incomplete = { ...payload };
    delete incomplete.instances;
    expect(() => deserializeDiagramSceneModel(JSON.stringify(incomplete)))
      .toThrow('Invalid serialized diagram instance list.');

    const truncated = { ...payload, instanceCount: payload.instanceCount + 1 };
    expect(() => deserializeDiagramSceneModel(JSON.stringify(truncated)))
      .toThrow('Serialized diagram instance count does not match its payload.');

    const invalidLocator = JSON.parse(JSON.stringify(payload)) as typeof payload;
    invalidLocator.instances![0]!.sourcePath = [{ type: 'content', index: 99 }];
    expect(() => deserializeDiagramSceneModel(JSON.stringify(invalidLocator)))
      .toThrow('Serialized diagram instance source path does not resolve.');

    const incompleteBindings = JSON.parse(JSON.stringify(payload)) as typeof payload;
    incompleteBindings.instances![0]!.bindings = [];
    expect(() => deserializeDiagramSceneModel(JSON.stringify(incompleteBindings)))
      .toThrow('Serialized diagram instance has incomplete loop bindings.');

    const unsupportedBinding = JSON.parse(JSON.stringify(payload)) as typeof payload;
    unsupportedBinding.instances![0]!.bindings[0]!.value = ['map', []];
    expect(() => deserializeDiagramSceneModel(JSON.stringify(unsupportedBinding)))
      .toThrow('Unsupported serialized diagram instance binding value.');
  });

  it('reevaluates membership only when a diagram model is recreated', () => {
    const source = (values: string) => [
      '```amx',
      `let positions: Number[] = [${values}]`,
      'diagram changingMembership {',
      '  title: "Changing membership"',
      '  description: "Model-local expansion"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '  for position in positions {',
      '    circle generated {',
      '      cx: position',
      '      cy: t',
      '      r: 1',
      '      stroke: "#263238"',
      '      lineWidth: 1',
      '    }',
      '  }',
      '}',
      '```'
    ].join('\n');
    const first = captureModel(source('1, 2'));
    const second = captureModel(source('7'));
    const assertStableFrames = (model: DiagramSceneModel, values: number[]) => {
      for (const time of [0.5, 1, 0.25]) {
        const frame = evaluateDiagramFrame(model, time);
        expect(frame.elements.map(element => element.primitive === 'circle'
          ? [element.name, element.cx, element.cy]
          : null)).toEqual(values.map(value => ['generated', value, time]));
      }
    };

    expect(first.initialFrame.elements.map(element => element.primitive === 'circle' ? element.cx : null)).toEqual([1, 2]);
    expect(second.initialFrame.elements.map(element => element.primitive === 'circle' ? element.cx : null)).toEqual([7]);
    assertStableFrames(first, [1, 2]);
    assertStableFrames(second, [7]);
  });

  it('preserves source locations for generated primitive diagnostics', () => {
    const source = [
      '```amx',
      'diagram invalidGenerated {',
      '  title: "Invalid generated element"',
      '  description: "Property location"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '  for item in [1, 2] {',
      '    circle generated {',
      '      cx: item',
      '      cy: t',
      '      r: item - t',
      '      stroke: "#263238"',
      '      lineWidth: 1',
      '    }',
      '  }',
      '}',
      '```'
    ].join('\n');
    const lines = source.split(/\r?\n/);
    const propertyLine = lines.findIndex(line => line.includes('r: item - t'));
    const model = captureModel(source, 'invalid-generated.amx');
    const restored = deserializeDiagramSceneModel(serializeDiagramSceneModel(model));
    expect(evaluateDiagramFrame(restored, 0.5).elements).toEqual(evaluateDiagramFrame(model, 0.5).elements);
    const error = captureFailure(() => evaluateDiagramFrame(model, 1));
    const restoredError = captureFailure(() => evaluateDiagramFrame(restored, 1));

    expect(error).toMatchObject({
      code: 'AMXD008',
      message: 'Invalid primitive geometry',
      file: 'invalid-generated.amx',
      line: propertyLine + 1,
      column: lines[propertyLine]!.indexOf('item') + 1
    });
    expect(restoredError).toMatchObject({
      code: error.code,
      message: error.message,
      file: error.file,
      line: error.line,
      column: error.column
    });
  });

  it('emits nothing for empty iterables and unselected branches', () => {
    const source = [
      '```amx',
      'let emptyValues: Number[] = []',
      'diagram emptyControls {',
      '  title: "Empty controls"',
      '  description: "Empty results"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '  for unused in emptyValues {',
      '  }',
      '  if false {',
      '    circle hidden {',
      '      cx: 1',
      '      cy: t',
      '      r: 1',
      '      stroke: "#263238"',
      '      lineWidth: 1',
      '    }',
      '  }',
      '  circle direct {',
      '    cx: 2',
      '    cy: t',
      '    r: 1',
      '    stroke: "#263238"',
      '    lineWidth: 1',
      '  }',
      '}',
      '```'
    ].join('\n');
    const model = captureModel(source);
    expect(model.initialFrame.elements.map(element => element.name)).toEqual(['direct']);
    expect(evaluateDiagramFrame(model, 0.5).elements[0]).toMatchObject({ cx: 2, cy: 0.5 });
  });

  it('enforces the 64 control-emission cap independently of direct elements and diagrams', () => {
    const capDiagram = (name: string, generatedCount: number, directCount: number) => [
      `diagram ${name} {`,
      `  title: "${name}"`,
      '  description: "Generated cap"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      ...Array.from({ length: directCount }, (_, index) => [
        `  circle ${name}Direct${index} {`,
        '    cx: 0',
        '    cy: 0',
        '    r: 1',
        '    stroke: "#263238"',
        '    lineWidth: 1',
        '  }'
      ]).flat(),
      `  for iteration${name} in [1 to ${generatedCount}] {`,
      `    circle ${name}Generated {`,
      `      cx: iteration${name}`,
      '      cy: t',
      '      r: 1',
      '      stroke: "#263238"',
      '      lineWidth: 1',
      '    }',
      '  }',
      '}'
    ].join('\n');
    const document = (diagrams: string[]) => parseDocumentText(`\`\`\`amx\n${diagrams.join('\n')}\n\`\`\``);

    const exact = captureModel(`\`\`\`amx\n${capDiagram('exact', 64, 2)}\n\`\`\``);
    expect(exact.initialFrame.elements).toHaveLength(66);

    const overflowSource = `\`\`\`amx\n${capDiagram('overflow', 65, 1)}\n\`\`\``;
    const overflowLines = overflowSource.split(/\r?\n/);
    const anchorIndex = overflowLines.findIndex(line => line.includes('circle overflowGenerated {'));
    const overflow = captureFailure(() => captureModel(overflowSource, 'overflow.amx'));
    expect(overflow).toMatchObject({
      code: 'AMXD6004',
      message: 'Number of elements in this diagram exceed the maximum (64)',
      file: 'overflow.amx',
      line: anchorIndex + 1,
      column: overflowLines[anchorIndex]!.indexOf('circle') + 1
    });

    const mixed = captureModel(`\`\`\`amx\n${capDiagram('mixed', 64, 511)}\n\`\`\``, 'mixed.amx');
    expect(mixed.initialFrame.elements).toHaveLength(575);

    const separate = evaluateDocumentEnvironment(document([
      capDiagram('first', 64, 0),
      capDiagram('second', 64, 0)
    ]), 'separate.amx');
    expect(separate.diagramEmissions).toHaveLength(2);
    expect(separate.diagramEmissions.map(emission => emission.model.initialFrame.elements.length)).toEqual([64, 64]);
  });

  it('rejects a diagram iterator that collides with its timeline variable', () => {
    const source = [
      '```amx',
      'diagram collision {',
      '  title: "Collision"',
      '  description: "Timeline binding"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '  for t in [1] {',
      '  }',
      '}',
      '```'
    ].join('\n');
    const error = captureFailure(() => checkDocument(parseDocumentText(source)));
    expect(error).toMatchObject({
      code: 'AMXD6001',
      message: 'Variable [t] is already used to control the diagrams timeline. Use a different variable name.',
      line: 8,
      column: 7
    });
  });

  it('reuses loop and conditional type diagnostics inside diagram controls', () => {
    const document = (control: string, preamble: string[] = []) => parseDocumentText([
      '```amx',
      ...preamble,
      'diagram invalid {',
      '  title: "Invalid"',
      '  description: "Invalid controls"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      ...control.split('\n').map(line => `  ${line}`),
      '}',
      '```'
    ].join('\n'));
    const iterableError = captureFailure(() => checkDocument(document('for item in 1 {\n}')));
    expect(iterableError).toMatchObject({ code: 'AMX3003', message: 'For loop needs a list or range' });
    const conditionError = captureFailure(() => checkDocument(document('if 1 {\n}')));
    expect(conditionError).toMatchObject({ code: 'AMX3002', message: 'Expected Boolean, got Number' });
    const measurementError = captureFailure(() => checkDocument(document(
      'for item in 1 meter {\n}',
      ['dimension Length', 'unit meter: Length']
    )));
    expect(measurementError).toMatchObject({ code: 'AMX3007', message: 'For loop needs a list or range' });
  });

  it('does not leak a new diagram iterator beyond its control block', () => {
    const source = [
      '```amx',
      'diagram generated {',
      '  title: "Generated"',
      '  description: "Iterator scope"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '  for item in [1] {',
      '  }',
      '}',
      'let outside: Number = item',
      '```'
    ].join('\n');
    const error = captureFailure(() => checkDocument(parseDocumentText(source)));
    expect(error).toMatchObject({ code: 'AMX3001', message: "Unknown identifier 'item'" });
  });

  it('applies existing primitive requirements inside conditional content', () => {
    const source = [
      '```amx',
      'diagram generated {',
      '  title: "Generated"',
      '  description: "Nested primitive validation"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '  if true {',
      '    circle incomplete {',
      '      cx: 1',
      '      cy: 1',
      '      r: 1',
      '      lineWidth: 1',
      '    }',
      '  }',
      '}',
      '```'
    ].join('\n');
    const error = captureFailure(() => checkDocument(parseDocumentText(source)));
    expect(error).toMatchObject({ code: 'AMXD001', message: 'Missing required field: stroke', line: 9, column: 5 });
  });

  it('rejects diagram time in controls at the identifier with AMXD6001', () => {
    const controls = [
      { timeName: 't', control: 'for item in [t] {\n  }', identifier: 't]' },
      { timeName: 't', control: 'if "🚀" == "🚀" and t > 0 {\n  }', identifier: 't >' },
      { timeName: 'ti', control: 'if ti > 0 {\n  }', identifier: 'ti >' }
    ];
    for (const newline of ['\n', '\r\n']) {
      for (const { timeName, control, identifier } of controls) {
        const source = [
          '---',
          'title: Control diagnostics',
          '---',
          '# Control diagnostics',
          '',
          '```amx',
          'diagram invalid {',
          '  title: "Invalid"',
          '  description: "Invalid controls"',
          '  width: 10',
          '  height: 10',
          `  time ${timeName} from 0 to 1 duration 1`,
          ...control.split('\n').map(line => `  ${line}`),
          '}',
          '```'
        ].join('\n').replace(/\n/g, newline);
        const sourceLines = source.split(/\r?\n/);
        const controlLine = sourceLines.find(line => line.includes(identifier))!;
        const expectedColumn = controlLine.lastIndexOf(identifier.split(' ')[0]) + 1;
        const error = captureFailure(() => checkDocument(parseDocumentText(source)));
        expect(error).toMatchObject({
          code: 'AMXD6001',
          message: `Variable [${timeName}] is already used to control the diagrams timeline. Use a different variable name.`,
          line: sourceLines.indexOf(controlLine) + 1,
          column: expectedColumn
        });
      }
    }
  });

  it('counts nested authored primitives once toward the existing 512-element limit', () => {
    const diagram = (count: number) => [
      'diagram nestedCount {',
      '  title: "Limit"',
      '  description: "Nested authored elements"',
      '  width: 10',
      '  height: 10',
      '  time t from 0 to 1 duration 1',
      '  if true {',
      ...Array.from({ length: count }, (_, index) => [
        `    text nested${index} {`,
        '      x: 0',
        '      y: 0',
        '      value: "x"',
        '      fill: "#263238"',
        '    }'
      ]).flat(),
      '  }',
      '}'
    ].join('\n');
    const document = (count: number) => parseDocumentText(['```amx', diagram(count), '```'].join('\n'));
    expect(() => checkDocument(document(512))).not.toThrow();
    const overflow = captureFailure(() => checkDocument(document(513)));
    expect(overflow.code).toBe('AMXD013');
    expect(overflow.message).toBe('A single report can have up to 512 elements maximum.');
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
