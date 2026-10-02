import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { AmxError } from '../../../src/diagnostics/errors';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import {
  analyzeEditorModules,
  EditorIssue,
  EditorModuleAnalysis,
  EditorModuleRecord
} from '../../../src/editor/moduleAnalysis';

export type { EditorIssue } from '../../../src/editor/moduleAnalysis';
export type EditorAnalysis = EditorModuleAnalysis;
export type ModuleRecord = EditorModuleRecord;

/** VS Code owns disk and open-buffer access; parsing and checking are shared with desktop. */
export function analyzeEditorDocument(text: string, entryFile?: string): EditorAnalysis {
  let imports = false;
  try {
    imports = parseDocumentText(text).nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : [])
      .some(statement => statement.type === 'importDeclaration');
  } catch { /* Shared analysis owns parser diagnostics. */ }

  let canonicalEntry = entryFile;
  if (imports && entryFile) {
    try { canonicalEntry = fs.realpathSync(entryFile); }
    catch {
      throw new AmxError({ code: 'AMX5001', message: `Entry module '${entryFile}' could not be read`, file: entryFile });
    }
  }
  const entryRoot = canonicalEntry ? path.dirname(canonicalEntry) : undefined;

  return analyzeEditorModules(text, canonicalEntry, imports ? (_fromFile, targetPath, importNode) => {
    if (!entryRoot) throw new AmxError({ code: 'AMX5001', message: 'Local imports require a saved file in the workspace', file: entryFile, line: importNode.pathSource?.line, column: importNode.pathSource?.column });

    const relativeTarget = path.relative(entryRoot, targetPath);
    let segment = entryRoot;
    for (const part of relativeTarget.split(path.sep)) {
      segment = path.join(segment, part);
      try {
        if (fs.lstatSync(segment).isSymbolicLink()) {
          throw new AmxError({ code: 'AMX5001', message: `Module '${importNode.path}' uses a symbolic link`, file: _fromFile, line: importNode.pathSource?.line, column: importNode.pathSource?.column });
        }
      } catch (error) {
        if (error instanceof AmxError) throw error;
        throw new AmxError({ code: 'AMX5001', message: `Module '${importNode.path}' could not be found`, file: _fromFile, line: importNode.pathSource?.line, column: importNode.pathSource?.column });
      }
    }

    let canonical: string;
    try { canonical = fs.realpathSync(targetPath); }
    catch { throw new AmxError({ code: 'AMX5001', message: `Module '${importNode.path}' could not be found`, file: _fromFile, line: importNode.pathSource?.line, column: importNode.pathSource?.column }); }
    const relation = path.relative(entryRoot, canonical);
    if (!relation || relation.startsWith('..') || path.isAbsolute(relation)) {
      throw new AmxError({ code: 'AMX5001', message: `Module '${importNode.path}' resolves outside the entry directory tree`, file: _fromFile, line: importNode.pathSource?.line, column: importNode.pathSource?.column });
    }

    const openDocument = vscode.workspace.textDocuments.find(document => {
      if (document.uri.scheme !== 'file') return false;
      try { return fs.realpathSync(document.uri.fsPath) === canonical; }
      catch { return false; }
    });
    return { file: canonical, text: openDocument?.getText() ?? fs.readFileSync(canonical, 'utf8') };
  } : undefined);
}