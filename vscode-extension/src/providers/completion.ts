import * as vscode from 'vscode';
import {
  DocumentNode,
  ForExpressionNode,
  ForStatementNode,
  MatchExpressionNode,
  OpenAmxDocument,
  RangeExpressionNode,
  StatementNode,
  TypeDeclarationNode,
  V02ExpressionNode
} from '../../../src/ast/types';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { parseFrontMatter } from '../../../src/parser/parseFrontMatter';
import { checkingActivated } from '../../../src/typechecker/checkDocument';
import { EditorAnalysis, analyzeEditorDocument } from './moduleAnalysis';

const v02Keywords = [
  'let', 'for', 'in', 'to', 'return', 'match', 'case', 'default',
  'if', 'then', 'else', 'and', 'or', 'not', 'true', 'false'
];
const v03Keywords = ['null', 'type', 'fn', 'import', 'from', 'input', 'export'];

const functions = ['sum', 'min', 'max', 'mean', 'round', 'abs', 'sqrt', 'pow'];
const primitiveTypes = ['Number', 'String', 'Boolean', 'DateTime'];

export function registerCompletionProvider(): vscode.Disposable {
  return vscode.languages.registerCompletionItemProvider('amx', {
    provideCompletionItems(document, position) {
      const text = document.getText();
      const cursorOffset = document.offsetAt(position);
      const completionSource = completionBuffer(text, cursorOffset);
      if (!completionSource) return undefined;
      const parsed = parseDocumentText(completionSource);
      let analysis: EditorAnalysis | undefined;
      try {
        const entryFile = document.uri.scheme === 'file' ? document.uri.fsPath : undefined;
        analysis = analyzeEditorDocument(completionSource, entryFile);
      } catch {
        analysis = undefined;
      }

      const currentBlock = parsed.nodes.find(node =>
        node.type === 'executableCodeBlock' && node.source &&
        cursorOffset >= blockContentStart(document, node) && cursorInAmxFence(text, cursorOffset)
      );
      if (!currentBlock || currentBlock.type !== 'executableCodeBlock') return undefined;

      const visible = visibleSymbols(document, parsed, cursorOffset, analysis);
      const cursorPrefix = document.lineAt(position.line).text.slice(0, position.character);
      const v03 = checkingActivated(parsed)
        || /^\s*(?:type|fn|import|input|export)\b/.test(cursorPrefix)
        || /:\s*[A-Z][A-Za-z0-9_]*$/.test(cursorPrefix);
      const fieldReceiver = document.lineAt(position.line).text.slice(0, position.character).match(/\b([A-Za-z][A-Za-z0-9_]*)\.\w*$/)?.[1];
      const fields = fieldReceiver ? visible.recordTypes.get(fieldReceiver)?.fields.map(field => field.name) ?? [] : [];
      const items = [
        ...[...v02Keywords, ...(v03 ? v03Keywords : [])].map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Keyword)),
        ...functions.map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Function)),
        ...visible.functions.map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Function)),
        ...(v03 ? visible.types : []).map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Class)),
        ...visible.variables.map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Variable)),
        ...fields.map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Field))
      ];
      return items;
    }
  });
}

function completionBuffer(text: string, cursorOffset: number): string | undefined {
  try {
    parseDocumentText(text);
    return text;
  } catch {
    const frontMatter = parseFrontMatter(text);
    if (frontMatter.error) return undefined;
    const bodyOffset = text.length - frontMatter.body.length;
    const relativeCursor = Math.max(0, cursorOffset - bodyOffset);
    const cursorLine = text.slice(bodyOffset, bodyOffset + relativeCursor).split(/\r?\n/).length - 1;
    const lines = frontMatter.body.split(/\r?\n/);
    let open: { marker: string; executable: boolean } | undefined;
    for (let index = 0; index < cursorLine; index++) {
      const line = lines[index] ?? '';
      if (!open) {
        const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (match) open = { marker: match[1], executable: match[1][0] === '`' && match[2].trim() === 'amx' };
      } else {
        const closing = line.match(/^ {0,3}(`+|~+)(\s*)$/);
        if (closing && closing[1][0] === open.marker[0] && closing[1].length >= open.marker.length) open = undefined;
      }
    }
    const currentLine = lines[cursorLine] ?? '';
    const currentCloser = currentLine.match(/^ {0,3}(`+|~+)(\s*)$/);
    if (!open?.executable || (currentCloser && currentCloser[1][0] === open.marker[0]
      && currentCloser[1].length >= open.marker.length)) return undefined;

    const lineStart = text.lastIndexOf('\n', Math.max(0, cursorOffset - 1)) + 1;
    const closer = `${open.marker}\n`;
    const candidates = [
      `${text.slice(0, cursorOffset)}${text.slice(0, cursorOffset).endsWith('\n') ? '' : '\n'}${closer}`,
      `${text.slice(0, lineStart)}${text.slice(0, lineStart).endsWith('\n') ? '' : '\n'}${closer}`
    ];
    for (const candidate of candidates) {
      try {
        parseDocumentText(candidate);
        return candidate;
      } catch {
        // Ignore an incomplete current statement and retain only prior complete statements.
      }
    }
    return undefined;
  }
}

function cursorInAmxFence(text: string, cursorOffset: number): boolean {
  const frontMatter = parseFrontMatter(text);
  if (frontMatter.error) return false;
  const bodyOffset = text.length - frontMatter.body.length;
  if (cursorOffset < bodyOffset) return false;
  const relativeCursor = cursorOffset - bodyOffset;
  const cursorLine = frontMatter.body.slice(0, relativeCursor).split(/\r?\n/).length - 1;
  const lines = frontMatter.body.split(/\r?\n/);
  let open: { marker: string; executable: boolean } | undefined;
  for (let index = 0; index <= cursorLine; index++) {
    const line = lines[index] ?? '';
    if (!open) {
      const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (match) open = { marker: match[1], executable: match[1][0] === '`' && match[2].trim() === 'amx' };
    } else {
      const closing = line.match(/^ {0,3}(`+|~+)(\s*)$/);
      if (closing && closing[1][0] === open.marker[0] && closing[1].length >= open.marker.length) open = undefined;
    }
  }
  return !!open?.executable;
}

function blockContentStart(document: vscode.TextDocument, node: Extract<DocumentNode, { type: 'executableCodeBlock' }>): number {
  return document.offsetAt(new vscode.Position(node.source!.line, 0));
}

interface VisibleSymbols {
  variables: string[];
  functions: string[];
  types: string[];
  recordTypes: Map<string, TypeDeclarationNode>;
}

function visibleSymbols(
  document: vscode.TextDocument,
  parsed: OpenAmxDocument,
  cursorOffset: number,
  analysis?: EditorAnalysis
): VisibleSymbols {
  const names = new Set<string>();
  const visibleFunctions = new Set<string>();
  const visibleTypes = new Set(primitiveTypes);
  const recordTypes = new Map<string, TypeDeclarationNode>();
  const localTypeDeclarations = new Map<string, TypeDeclarationNode>();
  const localBindingTypes = new Map<string, string>();
  const activeIterators = new Set<string>();

  const collectStatements = (statements: StatementNode[]) => {
    for (const statement of statements) {
      const start = statementOffset(document, statement);
      if (start >= cursorOffset) continue;

      if (statement.type === 'variableDeclaration') {
        if (statementEndOffset(document, statement) <= cursorOffset) {
          names.add(statement.name);
          const inferredType = statement.annotation?.type === 'namedType'
            ? statement.annotation.name
            : statement.expression.type === 'recordConstructor' ? statement.expression.name : undefined;
          if (inferredType) localBindingTypes.set(statement.name, inferredType);
        }
        collectExpression(statement.expression);
      } else if (statement.type === 'inputDeclaration') {
        if (statementEndOffset(document, statement) <= cursorOffset) {
          names.add(statement.name);
          if (statement.annotation.type === 'namedType') localBindingTypes.set(statement.name, statement.annotation.name!);
        }
      } else if (statement.type === 'typeDeclaration') {
        if (statementEndOffset(document, statement) <= cursorOffset) {
          visibleTypes.add(statement.name);
          localTypeDeclarations.set(statement.name, statement);
        }
      } else if (statement.type === 'functionDeclaration') {
        if (statementEndOffset(document, statement) <= cursorOffset) visibleFunctions.add(statement.name);
      } else if (statement.type === 'importDeclaration') {
        if (statementEndOffset(document, statement) <= cursorOffset) {
          for (const item of statement.names) {
            if (analysis?.importedTypes.has(item.name)) visibleTypes.add(item.name);
            if (analysis?.importedFunctions.has(item.name)) visibleFunctions.add(item.name);
            if (analysis?.importedBindings.has(item.name)) {
              names.add(item.name);
              const bindingType = analysis.importedBindings.get(item.name);
              if (bindingType?.kind === 'named') localBindingTypes.set(item.name, bindingType.name);
            }
          }
        }
      } else if (statement.type === 'forStatement') {
        collectLoop(statement);
      } else if (statement.type === 'assignmentStatement' || statement.type === 'compoundAssignmentStatement') {
        collectExpression(statement.expression);
      } else if ('expression' in statement) {
        collectExpression(statement.expression);
      }
    }
  };

  const collectLoop = (loop: ForStatementNode | ForExpressionNode) => {
    const bounds = loopBounds(document, loop);
    if (bounds && cursorOffset > bounds.open && cursorOffset <= bounds.close) {
      activeIterators.add(loop.variable);
    }
    collectExpression(loop.iterable);
    collectStatements(loop.body);
  };

  const collectExpression = (expression: V02ExpressionNode) => {
    switch (expression.type) {
      case 'forExpression':
        collectLoop(expression);
        break;
      case 'binaryExpression':
        collectExpression(expression.left);
        collectExpression(expression.right);
        break;
      case 'unaryExpression':
        collectExpression(expression.argument);
        break;
      case 'conditionalExpression':
        collectExpression(expression.test);
        collectExpression(expression.consequent);
        collectExpression(expression.alternate);
        break;
      case 'matchExpression':
        collectMatch(expression);
        break;
      case 'rangeExpression':
        collectRange(expression);
        break;
      case 'functionCall':
        expression.arguments.forEach(collectExpression);
        break;
      case 'listLiteral':
        expression.elements.forEach(collectExpression);
        break;
      default:
        break;
    }
  };

  const collectMatch = (expression: MatchExpressionNode) => {
    collectExpression(expression.expression);
    expression.cases.forEach(arm => collectExpression(arm.expression));
    collectExpression(expression.defaultExpression);
  };

  const collectRange = (expression: RangeExpressionNode) => {
    collectExpression(expression.start);
    collectExpression(expression.end);
  };

  for (const node of parsed.nodes) {
    if (node.type === 'executableCodeBlock' && node.source && statementOffsetFromLocation(document, node.source) < cursorOffset) {
      collectStatements(node.statements);
    }
  }

  for (const iterator of activeIterators) names.add(iterator);
  for (const [name, typeName] of localBindingTypes) {
    const declaration = localTypeDeclarations.get(typeName) ?? analysis?.importedTypes.get(typeName);
    if (declaration) recordTypes.set(name, declaration);
  }
  if (analysis) {
    for (const [name, declaration] of analysis.importedTypes) {
      if (visibleTypes.has(name)) localTypeDeclarations.set(name, declaration);
    }
  }
  return {
    variables: [...names],
    functions: [...visibleFunctions],
    types: [...visibleTypes],
    recordTypes
  };
}

function statementOffset(document: vscode.TextDocument, statement: StatementNode): number {
  return statementOffsetFromLocation(document, statement.source);
}

function statementOffsetFromLocation(
  document: vscode.TextDocument,
  source: { line: number; column: number } | undefined
): number {
  if (!source) return Number.MAX_SAFE_INTEGER;
  return document.offsetAt(new vscode.Position(source.line - 1, source.column - 1));
}

function statementEndOffset(document: vscode.TextDocument, statement: StatementNode): number {
  const source = statement.source;
  if (!source) return Number.MAX_SAFE_INTEGER;
  const start = statementOffset(document, statement);
  const text = document.getText();
  let depth = 0;
  let quote: string | undefined;
  let escaped = false;

  for (let offset = start; offset < text.length; offset++) {
    const character = text[offset];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '{') depth++;
    else if (character === '}') depth--;
    else if (character === '\n' && depth <= 0) return offset;
  }
  return text.length;
}

function loopBounds(
  document: vscode.TextDocument,
  loop: ForStatementNode | ForExpressionNode
): { open: number; close: number } | undefined {
  if (!loop.source) return undefined;
  const lineIndex = loop.source.line - 1;
  const lineText = document.lineAt(lineIndex).text;
  const openingColumn = lineText.lastIndexOf('{');
  if (openingColumn < 0 || lineText.slice(openingColumn).trim() !== '{') return undefined;

  const open = document.offsetAt(new vscode.Position(lineIndex, openingColumn));
  const text = document.getText();
  let depth = 0;
  let quote: string | undefined;
  let escaped = false;

  for (let offset = open; offset < text.length; offset++) {
    const character = text[offset];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '{') depth++;
    else if (character === '}' && --depth === 0) return { open, close: offset };
  }
  return undefined;
}