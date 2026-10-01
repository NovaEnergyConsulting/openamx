import * as vscode from 'vscode';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { declarationRange, tokenRange } from './symbolRanges';

export function registerCodeActions(): vscode.Disposable {
  const pending = new WeakMap<vscode.CodeAction, { document: vscode.TextDocument; version: number; range: vscode.Range; oldText: string; replacement: string; diagnostic: vscode.Diagnostic }>();
  return vscode.languages.registerCodeActionsProvider('amx', {
    provideCodeActions(document, _range, context) {
      const revision = document.version;
      let parsed;
      try { parsed = parseDocumentText(document.getText()); } catch { return []; }
      const views = new Map<string, vscode.Range>();
      const actions: vscode.CodeAction[] = [];
      for (const node of parsed.nodes) {
        if (node.type !== 'executableCodeBlock') continue;
        for (const statement of node.statements) {
          if (statement.type === 'tableDeclaration' || statement.type === 'chartDeclaration') {
            const range = declarationRange(document, statement);
            if (range) views.set(statement.name, range);
          }
          if (statement.type !== 'showStatement' || views.size !== 1) continue;
          const token = tokenRange(document, statement.nameSource, statement.name);
          const diagnostic = context.diagnostics.find(item =>
            item.source === 'OpenAMX' && item.code === 'AMX3001'
            && item.message === `Unknown or not-yet-declared visualization '${statement.name}'`
            && token?.contains(item.range.start));
          if (!token || !diagnostic) continue;
          const replacement = [...views.keys()][0];
          if (replacement === statement.name) continue;
          const action = new vscode.CodeAction(`Use visible view '${replacement}'`, vscode.CodeActionKind.QuickFix);
          action.diagnostics = [diagnostic];
          action.isPreferred = false;
          if (document.version === revision && document.getText(token) === statement.name) {
            pending.set(action, { document, version: revision, range: token, oldText: statement.name, replacement, diagnostic });
            actions.push(action);
          }
        }
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