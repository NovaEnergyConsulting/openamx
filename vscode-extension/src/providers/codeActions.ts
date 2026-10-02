import * as vscode from 'vscode';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { editorCodeActionFacts } from '../../../src/editor/refactoring';

export function registerCodeActions(): vscode.Disposable {
  const pending = new WeakMap<vscode.CodeAction, { document: vscode.TextDocument; version: number; range: vscode.Range; oldText: string; replacement: string; diagnostic: vscode.Diagnostic }>();
  return vscode.languages.registerCodeActionsProvider('amx', {
    provideCodeActions(document, _range, context) {
      const revision = document.version;
      let parsed;
      try { parsed = parseDocumentText(document.getText()); } catch { return []; }
      const source = document.getText();
      const facts = editorCodeActionFacts(source, parsed, context.diagnostics.map(item => ({
        code: String(item.code ?? ''), message: item.message,
        from: document.offsetAt(item.range.start), to: document.offsetAt(item.range.end)
      })));
      const actions: vscode.CodeAction[] = [];
      for (const fact of facts) {
        const range = new vscode.Range(document.positionAt(fact.from), document.positionAt(fact.to));
        const oldText = source.slice(fact.from, fact.to);
        const diagnostic = context.diagnostics.find(item => item.code === fact.code && item.message === `Unknown or not-yet-declared visualization '${oldText}'` && item.range.contains(range.start));
        if (!diagnostic || document.version !== revision || document.getText(range) !== oldText) continue;
        const action = new vscode.CodeAction(fact.title, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.isPreferred = false;
        pending.set(action, { document, version: revision, range, oldText, replacement: fact.replacement, diagnostic });
        actions.push(action);
      }
      return actions;
    },
    resolveCodeAction(action) {
      const request = pending.get(action);
      if (!request) return action;
      const { document, version, range, oldText, replacement, diagnostic } = request;
      if (document.version !== version || document.getText(range) !== oldText ||
        !vscode.languages.getDiagnostics(document.uri).some(item => item.code === diagnostic.code
          && item.message === diagnostic.message && item.range.isEqual(diagnostic.range))) {
        action.disabled = { reason: 'The document or diagnostic changed' };
        return action;
      }
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, range, replacement);
      action.edit = edit;
      return action;
    }
  }, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] });
}