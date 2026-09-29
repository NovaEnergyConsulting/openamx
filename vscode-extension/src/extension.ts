import * as vscode from 'vscode';
import { registerCompletionProvider } from './providers/completion';
import { createDiagnostics, updateDiagnostics } from './providers/diagnostics';
import { registerFormattingProvider } from './providers/formatting';

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = createDiagnostics();
  context.subscriptions.push(diagnostics);
  context.subscriptions.push(registerFormattingProvider());
  context.subscriptions.push(registerCompletionProvider());

  const update = (document: vscode.TextDocument) => updateDiagnostics(diagnostics, document);
  for (const document of vscode.workspace.textDocuments) update(document);
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(update));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => update(event.document)));
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) update(editor.document);
  }));
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(document => diagnostics.delete(document.uri)));
}

export function deactivate(): void {}