import * as vscode from 'vscode';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { parseFrontMatter } from '../../../src/parser/parseFrontMatter';

export function createDiagnostics(): vscode.DiagnosticCollection {
  return vscode.languages.createDiagnosticCollection('openamx');
}

export function updateDiagnostics(
  collection: vscode.DiagnosticCollection,
  document: vscode.TextDocument
): void {
  if (document.languageId !== 'amx') return;

  if (parseFrontMatter(document.getText()).error) {
    collection.delete(document.uri);
    return;
  }

  try {
    parseDocumentText(document.getText());
    collection.delete(document.uri);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const location = message.match(/\bat (\d+):(\d+)/);
    const line = Math.max(0, Number(location?.[1] ?? 1) - 1);
    const column = Math.max(0, Number(location?.[2] ?? 1) - 1);
    const position = new vscode.Position(line, column);
    const endColumn = Math.min(column + 1, document.lineAt(line).text.length);
    const range = new vscode.Range(position, new vscode.Position(line, endColumn));
    collection.set(document.uri, [new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)]);
  }
}