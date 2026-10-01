import * as vscode from 'vscode';
import { registerCompletionProvider } from './providers/completion';
import { clearDiagnosticsForDocument, createDiagnostics, updateDiagnostics } from './providers/diagnostics';
import { registerFormattingProvider } from './providers/formatting';
import { registerNavigationProviders } from './providers/navigation';
import { registerCodeActions } from './providers/codeActions';

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = createDiagnostics();
  context.subscriptions.push(diagnostics);
  context.subscriptions.push(registerFormattingProvider());
  context.subscriptions.push(registerCompletionProvider());
  context.subscriptions.push(...registerNavigationProviders());
  context.subscriptions.push(registerCodeActions());

  const update = (document: vscode.TextDocument) => updateDiagnostics(diagnostics, document);
  for (const document of vscode.workspace.textDocuments) update(document);
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(update));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
    update(event.document);
    for (const document of vscode.workspace.textDocuments) {
      if (document.languageId === 'amx' && document.uri.toString() !== event.document.uri.toString()) update(document);
    }
  }));
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) update(editor.document);
  }));
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(document => clearDiagnosticsForDocument(diagnostics, document)));
}

export function deactivate(): void {}