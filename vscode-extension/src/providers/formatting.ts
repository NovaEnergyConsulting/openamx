import * as vscode from 'vscode';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import { formatAmx } from '../../../src/formatter/formatAmx';

export function registerFormattingProvider(): vscode.Disposable {
  return vscode.languages.registerDocumentFormattingEditProvider('amx', {
    provideDocumentFormattingEdits(document) {
      let parsed;
      try {
        parsed = parseDocumentText(document.getText());
      } catch {
        return [];
      }

      const edits: vscode.TextEdit[] = [];
      for (const node of parsed.nodes) {
        if (node.type !== 'executableCodeBlock' || !node.source) continue;
        const start = document.offsetAt(new vscode.Position(node.source.line, 0));
        const range = new vscode.Range(document.positionAt(start), document.positionAt(start + node.content.length));
        const canonical = formatAmx(node.content);
        const formatted = document.eol === vscode.EndOfLine.CRLF
          ? canonical.replace(/\n/g, '\r\n')
          : canonical;
        if (formatted !== node.content) edits.push(vscode.TextEdit.replace(range, formatted));
      }
      return edits;
    }
  });
}