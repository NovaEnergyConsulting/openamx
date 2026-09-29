import * as vscode from 'vscode';
import {
  DocumentNode,
  ForExpressionNode,
  ForStatementNode,
  MatchExpressionNode,
  OpenAmxDocument,
  RangeExpressionNode,
  StatementNode,
  V02ExpressionNode
} from '../../../src/ast/types';
import { parseDocumentText } from '../../../src/parser/parseDocument';

const keywords = [
  'let', 'for', 'in', 'to', 'return', 'match', 'case', 'default',
  'if', 'then', 'else', 'and', 'or', 'not', 'true', 'false'
];

const functions = ['sum', 'min', 'max', 'mean', 'round', 'abs', 'sqrt', 'pow'];

export function registerCompletionProvider(): vscode.Disposable {
  return vscode.languages.registerCompletionItemProvider('amx', {
    provideCompletionItems(document, position) {
      const text = document.getText();
      let parsed: OpenAmxDocument;
      try {
        parsed = parseDocumentText(text);
      } catch {
        return undefined;
      }

      const cursorOffset = document.offsetAt(position);
      const currentBlock = parsed.nodes.find(node =>
        node.type === 'executableCodeBlock' && node.source &&
        cursorOffset >= blockContentStart(document, node) &&
        cursorOffset < blockContentStart(document, node) + node.content.length
      );
      if (!currentBlock || currentBlock.type !== 'executableCodeBlock') return undefined;

      const names = visibleVariables(document, parsed, cursorOffset);
      const items = [
        ...keywords.map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Keyword)),
        ...functions.map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Function)),
        ...names.map(label => new vscode.CompletionItem(label, vscode.CompletionItemKind.Variable))
      ];
      return items;
    }
  });
}

function blockContentStart(document: vscode.TextDocument, node: Extract<DocumentNode, { type: 'executableCodeBlock' }>): number {
  return document.offsetAt(new vscode.Position(node.source!.line, 0));
}

function visibleVariables(
  document: vscode.TextDocument,
  parsed: OpenAmxDocument,
  cursorOffset: number
): string[] {
  const names = new Set<string>();
  const activeIterators = new Set<string>();

  const collectStatements = (statements: StatementNode[]) => {
    for (const statement of statements) {
      const start = statementOffset(document, statement);
      if (start >= cursorOffset) continue;

      if (statement.type === 'variableDeclaration') {
        if (statementEndOffset(document, statement) <= cursorOffset) names.add(statement.name);
        collectExpression(statement.expression);
      } else if (statement.type === 'forStatement') {
        collectLoop(statement);
      } else if (statement.type === 'assignmentStatement' || statement.type === 'compoundAssignmentStatement') {
        collectExpression(statement.expression);
      } else {
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
  return [...names];
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