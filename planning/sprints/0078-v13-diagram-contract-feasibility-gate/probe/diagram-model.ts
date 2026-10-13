import type { EnumDeclarationNode, FunctionDeclarationNode, SourceLocation, TypeDeclarationNode, V02ExpressionNode } from '../../../../src/ast/types';
import { parseDocumentText } from '../../../../src/parser/parseDocument';
import { parseExpression } from '../../../../src/parser/parseExpression';
import { evaluateExpression } from '../../../../src/runtime/evaluateExpression';
import { evaluateDocumentEnvironment } from '../../../../src/runtime/evaluateDocument';
import { Environment } from '../../../../src/runtime/environment';
import type { CheckedType } from '../../../../src/typechecker/checkDocument';
import type { DimensionUnitRegistry } from '../../../../src/typechecker/dimensionTypes';

export interface DiagramSource {
  readonly file: string;
  readonly line: number;
  readonly column: number;
}

export interface DiagramElement {
  readonly kind: 'line' | 'rectangle' | 'circle' | 'text';
  readonly name: string;
  readonly geometry: Readonly<Record<string, V02ExpressionNode>>;
  readonly style: Readonly<{
    stroke?: string;
    fill?: string;
    lineWidth?: number;
    arrow?: 'none' | 'end';
  }>;
  readonly source: DiagramSource;
}

export interface DiagramModel {
  readonly id: 'crank-slider' | 'battery-resistor';
  readonly title: string;
  readonly description: string;
  readonly width: number;
  readonly height: number;
  readonly time: Readonly<{ variable: string; start: number; end: number; duration: number }>;
  readonly timeSource: DiagramSource;
  readonly elements: readonly DiagramElement[];
  readonly bindings: Readonly<Record<string, unknown>>;
  readonly functions: readonly FunctionDeclarationNode[];
  readonly recordTypes: readonly TypeDeclarationNode[];
  readonly enumValues: readonly (readonly [string, Readonly<Record<string, string | number>>])[];
  readonly enumDeclarations: readonly EnumDeclarationNode[];
  readonly bindingTypes: readonly (readonly [string, CheckedType])[];
  readonly dimensionRegistry?: DimensionUnitRegistry;
}

export interface EvaluatedElement {
  readonly kind: DiagramElement['kind'];
  readonly name: string;
  readonly geometry: Readonly<Record<string, number | string>>;
  readonly style: DiagramElement['style'];
  readonly source: DiagramSource;
}

export interface EvaluatedDiagram {
  readonly model: DiagramModel;
  readonly time: number;
  readonly elements: readonly EvaluatedElement[];
}

export class FrameEvaluationError extends Error {
  constructor(
    message: string,
    readonly source: DiagramSource,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'FrameEvaluationError';
  }
}

const crankSource = `---
title: Crank-slider feasibility fixture
---
# Crank-slider

\`\`\`amx
let crankRadius: Number = 34
let rodLength: Number = 105
let pivotX: Number = 70
fn crankX(t: Number, r: Number): Number = r * (1 - 2 * abs(t - 1))
fn crankY(t: Number, r: Number): Number = if t <= 1 then sqrt(r * r - crankX(t, r) * crankX(t, r)) else -sqrt(r * r - crankX(t, r) * crankX(t, r))
fn sliderX(t: Number, pivot: Number, r: Number, rod: Number): Number = pivot + crankX(t, r) + sqrt(rod * rod - crankY(t, r) * crankY(t, r))
diagram crankSlider {
  title: "Crank-slider mechanism"
  description: "A crank pin follows one full circular path and drives a piston through a fixed-length connecting rod."
  width: 320
  height: 200
  time t from 0 to 2 duration 4
  line lowerGuide {
    x1: 115
    y1: 88
    x2: 260
    y2: 88
    stroke: "#52616B"
    lineWidth: 2
    arrow: "none"
  }
  line upperGuide {
    x1: 115
    y1: 112
    x2: 260
    y2: 112
    stroke: "#52616B"
    lineWidth: 2
    arrow: "none"
  }
  line connectingRod {
    x1: pivotX + crankX(t, crankRadius)
    y1: 100 + crankY(t, crankRadius)
    x2: sliderX(t, pivotX, crankRadius, rodLength)
    y2: 100
    stroke: "#D07A32"
    lineWidth: 5
    arrow: "none"
  }
  line crank {
    x1: pivotX
    y1: 100
    x2: pivotX + crankX(t, crankRadius)
    y2: 100 + crankY(t, crankRadius)
    stroke: "#6950A1"
    lineWidth: 4
    arrow: "none"
  }
  circle pivot {
    cx: pivotX
    cy: 100
    r: 7
    stroke: "#263238"
    fill: "#FFFFFF"
    lineWidth: 2
  }
  circle crankPin {
    cx: pivotX + crankX(t, crankRadius)
    cy: 100 + crankY(t, crankRadius)
    r: 6
    stroke: "#263238"
    fill: "#F3B64B"
    lineWidth: 2
  }
  rectangle piston {
    x: sliderX(t, pivotX, crankRadius, rodLength) - 12
    y: 90
    width: 24
    height: 20
    stroke: "#263238"
    fill: "#DCE8F0"
    lineWidth: 2
  }
  text timeLabel {
    x: 18
    y: 24
    value: "t = \${round(t, 2)} s"
    fill: "#263238"
  }
}
\`\`\`
`;

const batterySource = `---
title: Battery-resistor feasibility fixture
---
# Battery-resistor circuit

\`\`\`amx
let supplyVoltage: Number = 9
let resistance: Number = 15
let current: Number = supplyVoltage / resistance
fn indicatorX(t: Number): Number = 58 + 25 * t
diagram batteryResistor {
  title: "Battery-resistor DC circuit"
  description: "A 9 volt battery drives a 15 ohm resistor; the arrow travels clockwise to indicate conventional current."
  width: 320
  height: 200
  time t from 0 to 4 duration 4
  line upperLeftWire {
    x1: 50
    y1: 130
    x2: 188
    y2: 130
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line upperRightWire {
    x1: 218
    y1: 130
    x2: 250
    y2: 130
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line leftUpperWire {
    x1: 50
    y1: 130
    x2: 50
    y2: 98
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line leftLowerWire {
    x1: 50
    y1: 68
    x2: 50
    y2: 50
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line rightWire {
    x1: 250
    y1: 130
    x2: 250
    y2: 50
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line lowerWire {
    x1: 250
    y1: 50
    x2: 50
    y2: 50
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line positivePlate {
    x1: 39
    y1: 92
    x2: 61
    y2: 92
    stroke: "#263238"
    lineWidth: 4
    arrow: "none"
  }
  line negativePlate {
    x1: 43
    y1: 74
    x2: 57
    y2: 74
    stroke: "#263238"
    lineWidth: 3
    arrow: "none"
  }
  rectangle resistor {
    x: 188
    y: 118
    width: 30
    height: 24
    stroke: "#263238"
    fill: "#FFF5E6"
    lineWidth: 2
  }
  line currentIndicator {
    x1: indicatorX(t)
    y1: 130
    x2: indicatorX(t) + 14
    y2: 130
    stroke: "#D04A3A"
    lineWidth: 4
    arrow: "end"
  }
  text voltageLabel {
    x: 20
    y: 24
    value: "9 V"
    fill: "#263238"
  }
  text resistanceLabel {
    x: 180
    y: 156
    value: "15 ohm"
    fill: "#263238"
  }
  text currentLabel {
    x: 88
    y: 154
    value: "I = \${round(current, 2)} A"
    fill: "#263238"
  }
}
\`\`\`
`;

interface EvaluationContext {
  readonly file: string;
  readonly bindings: Readonly<Record<string, unknown>>;
  readonly functions: readonly FunctionDeclarationNode[];
  readonly environment: Environment;
}

function locationAt(source: string, offset: number, file: string): DiagramSource {
  const prefix = source.slice(0, offset);
  const lines = prefix.split('\n');
  return { file, line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function expression(source: string, file: string, property: string, value: string): V02ExpressionNode {
  const token = `${property}: ${value}`;
  const propertyOffset = source.indexOf(token);
  if (propertyOffset < 0) throw new Error(`Fixture is missing ${token}`);
  return parseExpression(value, locationAt(source, propertyOffset + property.length + 2, file));
}

function elementSource(source: string, file: string, name: string): DiagramSource {
  const declaration = new RegExp(`^  (?:line|rectangle|circle|text) ${name} \\{$`, 'm');
  const offset = source.search(declaration);
  if (offset < 0) throw new Error(`Fixture is missing element ${name}`);
  return locationAt(source, offset, file);
}

function element(
  source: string,
  file: string,
  kind: DiagramElement['kind'],
  name: string,
  geometry: Readonly<Record<string, string>>,
  style: DiagramElement['style']
): DiagramElement {
  return {
    kind,
    name,
    geometry: Object.fromEntries(Object.entries(geometry).map(([property, value]) => [
      property,
      expression(source, file, property, value)
    ])),
    style,
    source: elementSource(source, file, name)
  };
}

function contextFromSource(source: string, file: string): EvaluationContext {
  const supportSource = source.replace(/diagram [A-Za-z][A-Za-z0-9_]* \{[\s\S]*?\n\}\n(?=\`\`\`)/, '');
  const document = parseDocumentText(supportSource);
  const environment = evaluateDocumentEnvironment(document, file);
  return {
    file,
    bindings: environment.toObject(),
    functions: [...environment.functions.values()],
    environment
  };
}

function timeSource(source: string, file: string): DiagramSource {
  const offset = source.indexOf('  time t from ');
  if (offset < 0) throw new Error('Fixture is missing its diagram time declaration');
  return locationAt(source, offset, file);
}

export function buildProbeDiagrams(): readonly DiagramModel[] {
  const crankFile = 'crank-slider.amx';
  const crank = contextFromSource(crankSource, crankFile);
  const crankElements = [
    element(crankSource, crankFile, 'line', 'lowerGuide', { x1: '115', y1: '88', x2: '260', y2: '88' }, { stroke: '#52616B', lineWidth: 2, arrow: 'none' }),
    element(crankSource, crankFile, 'line', 'upperGuide', { x1: '115', y1: '112', x2: '260', y2: '112' }, { stroke: '#52616B', lineWidth: 2, arrow: 'none' }),
    element(crankSource, crankFile, 'line', 'connectingRod', {
      x1: 'pivotX + crankX(t, crankRadius)', y1: '100 + crankY(t, crankRadius)',
      x2: 'sliderX(t, pivotX, crankRadius, rodLength)', y2: '100'
    }, { stroke: '#D07A32', lineWidth: 5, arrow: 'none' }),
    element(crankSource, crankFile, 'line', 'crank', {
      x1: 'pivotX', y1: '100', x2: 'pivotX + crankX(t, crankRadius)', y2: '100 + crankY(t, crankRadius)'
    }, { stroke: '#6950A1', lineWidth: 4, arrow: 'none' }),
    element(crankSource, crankFile, 'circle', 'pivot', { cx: 'pivotX', cy: '100', r: '7' }, { stroke: '#263238', fill: '#FFFFFF', lineWidth: 2 }),
    element(crankSource, crankFile, 'circle', 'crankPin', {
      cx: 'pivotX + crankX(t, crankRadius)', cy: '100 + crankY(t, crankRadius)', r: '6'
    }, { stroke: '#263238', fill: '#F3B64B', lineWidth: 2 }),
    element(crankSource, crankFile, 'rectangle', 'piston', {
      x: 'sliderX(t, pivotX, crankRadius, rodLength) - 12', y: '90', width: '24', height: '20'
    }, { stroke: '#263238', fill: '#DCE8F0', lineWidth: 2 }),
    element(crankSource, crankFile, 'text', 'timeLabel', {
      x: '18', y: '24', value: '"t = ${round(t, 2)} s"'
    }, { fill: '#263238' })
  ];
  const batteryFile = 'battery-resistor.amx';
  const battery = contextFromSource(batterySource, batteryFile);
  const batteryElements = [
    element(batterySource, batteryFile, 'line', 'upperLeftWire', { x1: '50', y1: '130', x2: '188', y2: '130' }, { stroke: '#52616B', lineWidth: 3, arrow: 'none' }),
    element(batterySource, batteryFile, 'line', 'upperRightWire', { x1: '218', y1: '130', x2: '250', y2: '130' }, { stroke: '#52616B', lineWidth: 3, arrow: 'none' }),
    element(batterySource, batteryFile, 'line', 'leftUpperWire', { x1: '50', y1: '130', x2: '50', y2: '98' }, { stroke: '#52616B', lineWidth: 3, arrow: 'none' }),
    element(batterySource, batteryFile, 'line', 'leftLowerWire', { x1: '50', y1: '68', x2: '50', y2: '50' }, { stroke: '#52616B', lineWidth: 3, arrow: 'none' }),
    element(batterySource, batteryFile, 'line', 'rightWire', { x1: '250', y1: '130', x2: '250', y2: '50' }, { stroke: '#52616B', lineWidth: 3, arrow: 'none' }),
    element(batterySource, batteryFile, 'line', 'lowerWire', { x1: '250', y1: '50', x2: '50', y2: '50' }, { stroke: '#52616B', lineWidth: 3, arrow: 'none' }),
    element(batterySource, batteryFile, 'line', 'positivePlate', { x1: '39', y1: '92', x2: '61', y2: '92' }, { stroke: '#263238', lineWidth: 4, arrow: 'none' }),
    element(batterySource, batteryFile, 'line', 'negativePlate', { x1: '43', y1: '74', x2: '57', y2: '74' }, { stroke: '#263238', lineWidth: 3, arrow: 'none' }),
    element(batterySource, batteryFile, 'rectangle', 'resistor', { x: '188', y: '118', width: '30', height: '24' }, { stroke: '#263238', fill: '#FFF5E6', lineWidth: 2 }),
    element(batterySource, batteryFile, 'line', 'currentIndicator', {
      x1: 'indicatorX(t)', y1: '130', x2: 'indicatorX(t) + 14', y2: '130'
    }, { stroke: '#D04A3A', lineWidth: 4, arrow: 'end' }),
    element(batterySource, batteryFile, 'text', 'voltageLabel', { x: '20', y: '24', value: '"9 V"' }, { fill: '#263238' }),
    element(batterySource, batteryFile, 'text', 'resistanceLabel', { x: '180', y: '156', value: '"15 ohm"' }, { fill: '#263238' }),
    element(batterySource, batteryFile, 'text', 'currentLabel', {
      x: '88', y: '154', value: '"I = ${round(current, 2)} A"'
    }, { fill: '#263238' })
  ];

  return [
    {
      id: 'crank-slider',
      title: 'Crank-slider mechanism',
      description: 'A crank pin follows one full circular path and drives a piston through a fixed-length connecting rod.',
      width: 320,
      height: 200,
      time: { variable: 't', start: 0, end: 2, duration: 4 },
      timeSource: timeSource(crankSource, crankFile),
      elements: crankElements,
      bindings: crank.bindings,
        functions: crank.functions,
        recordTypes: [...crank.environment.recordTypes.values()],
        enumValues: [...crank.environment.enumValues.entries()],
        enumDeclarations: [...crank.environment.enumDeclarations.values()],
        bindingTypes: [...crank.environment.bindingTypes.entries()],
        dimensionRegistry: crank.environment.dimensionRegistry
    },
    {
      id: 'battery-resistor',
      title: 'Battery-resistor DC circuit',
      description: 'A 9 volt battery drives a 15 ohm resistor; the arrow travels clockwise to indicate conventional current.',
      width: 320,
      height: 200,
      time: { variable: 't', start: 0, end: 4, duration: 4 },
      timeSource: timeSource(batterySource, batteryFile),
      elements: batteryElements,
      bindings: battery.bindings,
      functions: battery.functions,
      recordTypes: [...battery.environment.recordTypes.values()],
      enumValues: [...battery.environment.enumValues.entries()],
      enumDeclarations: [...battery.environment.enumDeclarations.values()],
      bindingTypes: [...battery.environment.bindingTypes.entries()],
      dimensionRegistry: battery.environment.dimensionRegistry
    }
  ];
}

export function evaluateDiagram(model: DiagramModel, time: number): EvaluatedDiagram {
  if (!Number.isFinite(time) || time < model.time.start || time > model.time.end) {
    throw new FrameEvaluationError('Selected time is outside the finite diagram interval', model.timeSource);
  }
  const evaluationContext = new Environment();
  for (const [name, value] of Object.entries(model.bindings)) evaluationContext.set(name, value);
  for (const fn of model.functions) evaluationContext.functions.set(fn.name, fn);
  for (const declaration of model.recordTypes) evaluationContext.recordTypes.set(declaration.name, declaration);
  for (const declaration of model.enumDeclarations) evaluationContext.enumDeclarations.set(declaration.name, declaration);
  for (const [name, values] of model.enumValues) evaluationContext.enumValues.set(name, { ...values });
  for (const [name, type] of model.bindingTypes) evaluationContext.bindingTypes.set(name, type);
  evaluationContext.dimensionRegistry = model.dimensionRegistry;
  evaluationContext.set(model.time.variable, time);

  const elements = model.elements.map(elementModel => {
    const geometry: Record<string, number | string> = {};
    for (const [property, expressionNode] of Object.entries(elementModel.geometry)) {
      const expressionSource = expressionNode.source
        ? { ...elementModel.source, line: expressionNode.source.line, column: expressionNode.source.column }
        : elementModel.source;
      let value: unknown;
      try {
        value = evaluateExpression(expressionNode, evaluationContext, elementModel.source.file);
      } catch (error) {
        throw new FrameEvaluationError(
          `Could not evaluate ${elementModel.name}.${property} at time ${time}`,
          expressionNode.source
            ? { ...elementModel.source, line: expressionNode.source.line, column: expressionNode.source.column }
            : elementModel.source,
          { cause: error }
        );
      }
      if (typeof value !== 'number' && typeof value !== 'string') {
        throw new FrameEvaluationError(`${elementModel.name}.${property} produced a non-scalar value`, expressionSource);
      }
      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw new FrameEvaluationError(`${elementModel.name}.${property} produced a non-finite number at time ${time}`, expressionSource);
      }
      geometry[property] = value;
    }
    return {
      kind: elementModel.kind,
      name: elementModel.name,
      geometry,
      style: elementModel.style,
      source: elementModel.source
    };
  });
  return { model, time, elements };
}

export function getModelSource(modelId: DiagramModel['id']): string {
  return modelId === 'crank-slider' ? crankSource : batterySource;
}

export function sourceLocationAt(source: string, offset: number, file: string): SourceLocation & { readonly file: string } {
  return locationAt(source, offset, file);
}
