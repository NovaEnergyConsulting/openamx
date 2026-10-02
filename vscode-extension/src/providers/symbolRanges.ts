import * as vscode from 'vscode';
import { SourceLocation, StatementNode } from '../../../src/ast/types';
import { declarationNameRange, sourceTokenRange } from '../../../src/editor/sourceRanges';

export function tokenRange(document: vscode.TextDocument, source: SourceLocation | undefined, token: string): vscode.Range | undefined {
  const range = sourceTokenRange(document.getText(), source, token);
  return range ? new vscode.Range(document.positionAt(range.from), document.positionAt(range.to)) : undefined;
}

export function declarationRange(document: vscode.TextDocument, statement: StatementNode): vscode.Range | undefined {
  const range = declarationNameRange(document.getText(), statement);
  return range ? new vscode.Range(document.positionAt(range.from), document.positionAt(range.to)) : undefined;
}