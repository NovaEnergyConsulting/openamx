import * as vscode from 'vscode';
import { parseFrontMatter } from '../../../src/parser/parseFrontMatter';
import { analyzeEditorDocument, EditorIssue } from './moduleAnalysis';

const publishedByEntry = new WeakMap<vscode.DiagnosticCollection, Map<string, Set<string>>>();

export function createDiagnostics(): vscode.DiagnosticCollection {
  return vscode.languages.createDiagnosticCollection('openamx');
}

export function updateDiagnostics(
  collection: vscode.DiagnosticCollection,
  document: vscode.TextDocument
): void {
  if (document.languageId !== 'amx') return;

  const entryKey = document.uri.toString();
  const published = publishedByEntry.get(collection) ?? new Map<string, Set<string>>();
  publishedByEntry.set(collection, published);
  clearEntryDiagnostics(collection, published, entryKey);

  if (parseFrontMatter(document.getText()).error) {
    return;
  }

  try {
    const entryFile = document.uri.scheme === 'file' ? document.uri.fsPath : undefined;
    analyzeEditorDocument(document.getText(), entryFile);
  } catch (error) {
    const diagnosticIssue = error as EditorIssue;
    const targetUri = diagnosticIssue.file ? vscode.Uri.file(diagnosticIssue.file) : document.uri;
    const targetDocument = targetUri.toString() === document.uri.toString()
      ? document
      : vscode.workspace.textDocuments.find(item => item.uri.toString() === targetUri.toString());
    const line = Math.max(0, (diagnosticIssue.line ?? 1) - 1);
    const column = Math.max(0, (diagnosticIssue.column ?? 1) - 1);
    const lineLength = targetDocument && line < targetDocument.lineCount
      ? targetDocument.lineAt(line).text.length
      : column + 1;
    const position = new vscode.Position(line, Math.min(column, lineLength));
    const range = new vscode.Range(position, new vscode.Position(line, Math.min(column + 1, lineLength)));
    const diagnostic = new vscode.Diagnostic(range, diagnosticIssue.message, vscode.DiagnosticSeverity.Error);
    diagnostic.code = diagnosticIssue.code;
    diagnostic.source = 'OpenAMX';
    collection.set(targetUri, [diagnostic]);
    published.set(entryKey, new Set([targetUri.toString()]));
  }
}

export function clearDiagnosticsForDocument(
  collection: vscode.DiagnosticCollection,
  document: vscode.TextDocument
): void {
  const published = publishedByEntry.get(collection);
  if (published) clearEntryDiagnostics(collection, published, document.uri.toString());
  collection.delete(document.uri);
}

function clearEntryDiagnostics(
  collection: vscode.DiagnosticCollection,
  published: Map<string, Set<string>>,
  entryKey: string
): void {
  const previous = published.get(entryKey);
  if (!previous) {
    if (![...published.values()].some(outputs => outputs.has(entryKey))) {
      collection.delete(vscode.Uri.parse(entryKey));
    }
    return;
  }
  published.delete(entryKey);
  for (const outputKey of previous) {
    if ([...published.values()].some(outputs => outputs.has(outputKey))) continue;
    collection.delete(vscode.Uri.parse(outputKey));
  }
}