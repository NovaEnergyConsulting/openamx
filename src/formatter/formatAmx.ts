import { parseDocumentText } from '../parser/parseDocument';
import { parseStatements } from '../parser/parseStatements';
import { findStringLiteralEnd } from '../parser/stringScanner';
import { DiagramDeclarationNode, DiagramElementNode, DiagramPropertyNode, StatementNode } from '../ast/types';

export function formatAmxDocument(source: string): string {
  const document = parseDocumentText(source);
  const lineStarts = [0];
  for (const newline of source.matchAll(/\n/g)) {
    lineStarts.push(newline.index + 1);
  }

  const replacements = document.nodes.flatMap(node => {
    if (node.type !== 'executableCodeBlock' || !node.source) return [];
    const start = lineStarts[node.source.line];
    const opener = source.slice(lineStarts[node.source.line - 1], start);
    const newline = node.content.match(/\r?\n/)?.[0] ?? (opener.endsWith('\r\n') ? '\r\n' : '\n');
    const canonical = formatAmx(node.content);
    const text = newline === '\r\n' ? canonical.replace(/\n/g, '\r\n') : canonical;
    return [{ start, end: start + node.content.length, text }];
  });

  let formatted = source;
  for (const replacement of replacements.reverse()) {
    formatted = formatted.slice(0, replacement.start) + replacement.text + formatted.slice(replacement.end);
  }
  return formatted;
}

/** Format executable AMX block content without changing expression text. */
export function formatAmx(source: string): string {
  const normalized = source.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');

  while (lines.length > 0 && lines[0].trim().length === 0) lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();
  if (lines.length === 0) return '';

  const statements = parseStatements(lines.join('\n'));
  const diagramsByLine = new Map<number, DiagramDeclarationNode>();
  collectDiagramDeclarations(statements, diagramsByLine);
  let depth = 0;
  const formatted: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const diagram = diagramsByLine.get(index);
    if (diagram) {
      formatted.push(...formatDiagram(diagram, depth));
      index = diagramEndLine(lines, index);
      continue;
    }
    const rawLine = lines[index];
    const line = rawLine.replace(/[ \t]+$/, '');
    if (line.trim().length === 0) {
      formatted.push('');
      continue;
    }

    const content = line.trimStart();
    const braces = scanBraces(content);
    const lineDepth = Math.max(0, depth - braces.leadingClosures);
    formatted.push(`${'  '.repeat(lineDepth)}${content}`);
    depth = Math.max(0, depth + braces.opens - braces.closes);
  }

  return `${formatted.join('\n')}\n`;
}

function collectDiagramDeclarations(statements: StatementNode[], result: Map<number, DiagramDeclarationNode>): void {
  for (const statement of statements) {
    if (statement.type === 'diagramDeclaration') {
      if (statement.source) result.set(statement.source.line - 1, statement);
    } else if (statement.type === 'forStatement') {
      collectDiagramDeclarations(statement.body, result);
    } else if (statement.type === 'bracedIfStatement') {
      collectDiagramDeclarations(statement.consequent, result);
      if (statement.alternate) collectDiagramDeclarations(statement.alternate, result);
    }
  }
}

function diagramEndLine(lines: string[], start: number): number {
  let depth = 0;
  for (let index = start; index < lines.length; index++) {
    const braces = scanBraces(lines[index]);
    depth += braces.opens - braces.closes;
    if (depth === 0) return index;
  }
  return lines.length - 1;
}

function orderedProperties(properties: DiagramPropertyNode[], order: string[]): DiagramPropertyNode[] {
  const positions = new Map(order.map((name, index) => [name, index]));
  return [...properties].sort((left, right) =>
    (positions.get(left.name) ?? Number.MAX_SAFE_INTEGER) - (positions.get(right.name) ?? Number.MAX_SAFE_INTEGER));
}

function formatProperty(property: DiagramPropertyNode, level: number): string[] {
  const indentation = '  '.repeat(level);
  const continuationIndentation = '  '.repeat(level + 1);
  const valueLines = property.rawValue.split('\n');
  return [
    `${indentation}${property.name}: ${valueLines[0]}`,
    ...valueLines.slice(1).map(line => `${continuationIndentation}${line.trimStart()}`)
  ];
}

function elementPropertyOrder(element: DiagramElementNode): string[] {
  switch (element.primitive) {
    case 'line': return ['x1', 'y1', 'x2', 'y2', 'stroke', 'lineWidth', 'arrow'];
    case 'rectangle': return ['x', 'y', 'width', 'height', 'stroke', 'fill', 'lineWidth'];
    case 'circle': return ['cx', 'cy', 'r', 'stroke', 'fill', 'lineWidth'];
    case 'text': return ['x', 'y', 'value', 'fill'];
    default: return [];
  }
}

function formatDiagram(diagram: DiagramDeclarationNode, level: number): string[] {
  const indentation = '  '.repeat(level);
  const output = [`${indentation}diagram ${diagram.name} {`];
  output.push(...orderedProperties(diagram.properties, ['title', 'description', 'width', 'height'])
    .flatMap(property => formatProperty(property, level + 1)));
  for (const time of diagram.times) {
    output.push(`${'  '.repeat(level + 1)}time ${time.name} from ${time.fromText} to ${time.toText} duration ${time.durationText}`);
  }
  for (const element of diagram.elements) {
    output.push(`${'  '.repeat(level + 1)}${element.primitive} ${element.name} {`);
    output.push(...orderedProperties(element.properties, elementPropertyOrder(element))
      .flatMap(property => formatProperty(property, level + 2)));
    output.push(`${'  '.repeat(level + 1)}}`);
  }
  output.push(`${indentation}}`);
  return output;
}

function scanBraces(line: string): { opens: number; closes: number; leadingClosures: number } {
  let opens = 0;
  let closes = 0;
  let leadingClosures = 0;
  let leading = true;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"' || character === "'") {
      leading = false;
      const end = findStringLiteralEnd(line, index);
      if (end !== undefined) index = end;
    } else if (character === '{' || character === '[') {
      leading = false;
      opens++;
    } else if (character === '}' || character === ']') {
      if (leading) leadingClosures++;
      closes++;
      leading = false;
    } else if (!/\s/.test(character)) {
      leading = false;
    }
  }

  return { opens, closes, leadingClosures };
}