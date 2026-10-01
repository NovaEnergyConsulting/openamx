import * as vscode from 'vscode';
import { SourceLocation, StatementNode } from '../../../src/ast/types';

export function tokenRange(document: vscode.TextDocument, source: SourceLocation | undefined, token: string): vscode.Range | undefined {
  if (!source || source.line < 1 || source.line > document.lineCount || source.column < 1) return undefined;
  const line = document.lineAt(source.line - 1).text;
  const start = source.column - 1;
  if (line.slice(start, start + token.length) !== token) return undefined;
  return new vscode.Range(source.line - 1, start, source.line - 1, start + token.length);
}

export function declarationRange(document: vscode.TextDocument, statement: StatementNode): vscode.Range | undefined {
  if (!('name' in statement) || !statement.source) return undefined;
  const keywords: Partial<Record<StatementNode['type'], string>> = {
    typeDeclaration: 'type', functionDeclaration: 'fn', inputDeclaration: 'input',
    variableDeclaration: 'let', tableDeclaration: 'table', chartDeclaration: 'chart'
  };
  const keyword = keywords[statement.type];
  if (!keyword) return undefined;
  if (statement.source.line > document.lineCount) return undefined;
  const line = document.lineAt(statement.source.line - 1)?.text;
  const start = statement.source.column - 1;
  const match = line?.slice(start).match(new RegExp(`^${keyword}\\s+(${statement.name})\\b`));
  if (!match) return undefined;
  return tokenRange(document, { line: statement.source.line, column: start + match[0].indexOf(statement.name) + 1 }, statement.name);
}