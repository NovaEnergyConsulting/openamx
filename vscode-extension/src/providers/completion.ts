import * as vscode from 'vscode';
import { editorCompletionFacts, prepareEditorCompletion } from '../../../src/editor/completion';
import { analyzeEditorDocument } from './moduleAnalysis';

const kinds: Record<string, vscode.CompletionItemKind> = {
  keyword: vscode.CompletionItemKind.Keyword,
  function: vscode.CompletionItemKind.Function,
  class: vscode.CompletionItemKind.Class,
  variable: vscode.CompletionItemKind.Variable,
  reference: vscode.CompletionItemKind.Reference,
  field: vscode.CompletionItemKind.Field
};

export function registerCompletionProvider(): vscode.Disposable {
  return vscode.languages.registerCompletionItemProvider('amx', {
    provideCompletionItems(document, position) {
      const text = document.getText();
      const cursorOffset = document.offsetAt(position);
      const prepared = prepareEditorCompletion(text, cursorOffset);
      if (!prepared) return undefined;

      let analysis;
      try {
        const entryFile = document.uri.scheme === 'file' ? document.uri.fsPath : undefined;
        analysis = analyzeEditorDocument(prepared.text, entryFile);
      } catch {
        analysis = undefined;
      }

      return editorCompletionFacts(prepared.text, cursorOffset, prepared.document, analysis, text)
        .map(item => new vscode.CompletionItem(item.label, kinds[item.kind]));
    }
  });
}