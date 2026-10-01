import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  FunctionDeclarationNode,
  ImportDeclarationNode,
  OpenAmxDocument,
  StatementNode,
  TypeDeclarationNode
} from '../../../src/ast/types';
import { AmxError } from '../../../src/diagnostics/errors';
import { parseDocumentText } from '../../../src/parser/parseDocument';
import {
  CheckedType,
  checkDocument,
  checkingActivated,
  ModuleCheckResult
} from '../../../src/typechecker/checkDocument';

export interface EditorIssue {
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  message: string;
}

export interface EditorAnalysis {
  document: OpenAmxDocument;
  importedTypes: Map<string, TypeDeclarationNode>;
  importedFunctions: Map<string, FunctionDeclarationNode>;
  importedBindings: Map<string, CheckedType>;
  bindingTypes?: Map<string, CheckedType>;
  modules?: Map<string, ModuleRecord>;
}

export interface ModuleRecord {
  file: string;
  document: OpenAmxDocument;
  checkResult: ModuleCheckResult;
  importedTypes: Map<string, TypeDeclarationNode>;
  importedFunctions: Map<string, FunctionDeclarationNode>;
  importedBindings: Map<string, CheckedType>;
  importTargets: Map<string, string>;
}

interface ImportEdge {
  file: string;
  source?: ImportDeclarationNode['pathSource'];
}

const emptyCheckResult = (): ModuleCheckResult => ({
  exportedTypes: new Map(),
  exportedFunctions: new Map(),
  exportedBindings: new Map(),
  bindingTypes: new Map()
});

function statementsOf(document: OpenAmxDocument): StatementNode[] {
  return document.nodes.flatMap(node => node.type === 'executableCodeBlock' ? node.statements : []);
}

function issue(code: string, message: string, file: string, source?: { line: number; column: number }): never {
  throw new AmxError({ code, message, file, line: source?.line, column: source?.column });
}

function parseIssue(error: unknown, file?: string): EditorIssue {
  if (error instanceof AmxError) {
    return { code: error.code, message: error.message, file: error.file ?? file, line: error.line, column: error.column };
  }
  const message = error instanceof Error ? error.message : String(error);
  const location = message.match(/\bat (\d+):(\d+)/);
  return {
    message,
    file,
    ...(location ? { line: Number(location[1]), column: Number(location[2]) } : {})
  };
}

/** Parse, link, and statically check a buffer and its local imports without evaluating modules. */
export function analyzeEditorDocument(text: string, entryFile?: string): EditorAnalysis {
  let entryDocument: OpenAmxDocument;
  try {
    entryDocument = parseDocumentText(text);
  } catch (error) {
    throw parseIssue(error, entryFile);
  }

  const entryImports = statementsOf(entryDocument).filter(
    (statement): statement is ImportDeclarationNode => statement.type === 'importDeclaration'
  );
  if (entryImports.length === 0) {
    const checkResult = checkingActivated(entryDocument)
      ? checkDocument(entryDocument, entryFile)
      : emptyCheckResult();
    return { document: entryDocument, importedTypes: new Map(), importedFunctions: new Map(), importedBindings: new Map(), ...checkResult };
  }
  if (!entryFile || !path.isAbsolute(entryFile)) {
    const firstImport = entryImports[0];
    issue('AMX5001', 'Local imports require a saved file in the workspace', entryFile ?? '', firstImport.pathSource);
  }

  let realEntry: string;
  try {
    realEntry = fs.realpathSync(entryFile);
  } catch {
    issue('AMX5001', `Entry module '${entryFile}' could not be read`, entryFile);
  }
  const entryRoot = path.dirname(realEntry!);
  const resolved = new Map<string, ModuleRecord>();
  const visiting: string[] = [];

  const visit = (file: string, document: OpenAmxDocument, viaImport?: ImportEdge): ModuleRecord => {
    const existing = resolved.get(file);
    if (existing) return existing;
    const cycleIndex = visiting.indexOf(file);
    if (cycleIndex >= 0) {
      issue('AMX5003', `Import cycle detected: ${[...visiting.slice(cycleIndex), file].map(item => path.relative(entryRoot, item) || path.basename(item)).join(' -> ')}`, viaImport?.file ?? file, viaImport?.source);
    }
    visiting.push(file);

    const statements = statementsOf(document);
    if (file !== realEntry) {
      const input = statements.find((statement): statement is Extract<StatementNode, { type: 'inputDeclaration' }> => statement.type === 'inputDeclaration');
      if (input) issue('AMX3005', 'Inputs may only be declared in the entry module', file, input.source);
    }
    const imports = statements.filter((statement): statement is ImportDeclarationNode => statement.type === 'importDeclaration');
    const localNames = new Set(statements.flatMap(statement =>
      statement.type === 'typeDeclaration' || statement.type === 'functionDeclaration'
        || statement.type === 'variableDeclaration' || statement.type === 'inputDeclaration'
        || statement.type === 'tableDeclaration' || statement.type === 'chartDeclaration'
        ? [statement.name] : []
    ));
    const importedTypes = new Map<string, TypeDeclarationNode>();
    const importedFunctions = new Map<string, FunctionDeclarationNode>();
    const importedBindings = new Map<string, CheckedType>();
    const importedNames = new Set<string>();
    const importTargets = new Map<string, string>();

    for (const importNode of imports) {
      validateImportPath(importNode, file, entryRoot);
      const targetPath = path.resolve(path.dirname(file), importNode.path);
      const relativeTarget = path.relative(entryRoot, targetPath);
      let segment = entryRoot;
      for (const part of relativeTarget.split(path.sep)) {
        segment = path.join(segment, part);
        try {
          if (fs.lstatSync(segment).isSymbolicLink()) {
            issue('AMX5001', `Module '${importNode.path}' uses a symbolic link`, file, importNode.pathSource);
          }
        } catch (error) {
          if (error instanceof AmxError) throw error;
          issue('AMX5001', `Module '${importNode.path}' could not be found`, file, importNode.pathSource);
        }
      }
      let targetFile: string;
      try {
        targetFile = fs.realpathSync(targetPath);
      } catch {
        issue('AMX5001', `Module '${importNode.path}' could not be found`, file, importNode.pathSource);
      }
      const relativeToRoot = path.relative(entryRoot, targetFile!);
      if (relativeToRoot === '' || relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        issue('AMX5001', `Module '${importNode.path}' resolves outside the entry directory tree`, file, importNode.pathSource);
      }

      let dependencyDocument: OpenAmxDocument;
      try {
        dependencyDocument = parseDocumentText(readModuleText(targetFile!));
      } catch (error) {
        const nested = parseIssue(error, targetFile!);
        issue('AMX5001', `Failed to parse module '${importNode.path}': ${nested.message}`, file, importNode.pathSource);
      }
      const dependency = visit(targetFile!, dependencyDocument!, { file, source: importNode.pathSource });
      for (const importedName of importNode.names) {
        if (importedNames.has(importedName.name)) {
          issue('AMX5002', `Duplicate import of '${importedName.name}'`, file, importedName.source);
        }
        importedNames.add(importedName.name);
        if (localNames.has(importedName.name)) {
          issue('AMX5002', `Imported name '${importedName.name}' collides with a local declaration`, file, importedName.source);
        }
        if (dependency.checkResult.exportedTypes.has(importedName.name)) {
          importedTypes.set(importedName.name, dependency.checkResult.exportedTypes.get(importedName.name)!);
        } else if (dependency.checkResult.exportedFunctions.has(importedName.name)) {
          importedFunctions.set(importedName.name, dependency.checkResult.exportedFunctions.get(importedName.name)!);
        } else if (dependency.checkResult.exportedBindings.has(importedName.name)) {
          importedBindings.set(importedName.name, dependency.checkResult.exportedBindings.get(importedName.name)!);
        } else {
          issue('AMX5002', `Module '${importNode.path}' does not export '${importedName.name}'`, file, importedName.source);
        }
        importTargets.set(importedName.name, targetFile!);
      }
    }

    let checkResult = emptyCheckResult();
    if (imports.length > 0 || checkingActivated(document)) {
      try {
        checkResult = checkDocument(document, file, {
          types: importedTypes,
          functions: importedFunctions,
          bindings: importedBindings
        });
      } catch (error) {
        visiting.pop();
        throw parseIssue(error, file);
      }
    }

    visiting.pop();
    const record = { file, document, checkResult, importedTypes, importedFunctions, importedBindings, importTargets };
    resolved.set(file, record);
    return record;
  };

  const result = visit(realEntry!, entryDocument);
  return {
    document: result.document,
    importedTypes: result.importedTypes,
    importedFunctions: result.importedFunctions,
    importedBindings: result.importedBindings,
    modules: resolved
  };
}

function readModuleText(file: string): string {
  for (const document of vscode.workspace.textDocuments) {
    if (document.uri.scheme !== 'file') continue;
    try {
      if (fs.realpathSync(document.uri.fsPath) === file) return document.getText();
    } catch {
      continue;
    }
  }
  return fs.readFileSync(file, 'utf8');
}

function validateImportPath(importNode: ImportDeclarationNode, file: string, entryRoot: string): void {
  const importPath = importNode.path;
  if (!(importPath.startsWith('./') || importPath.startsWith('../'))
    || importPath.includes('\\') || !importPath.endsWith('.amx') || path.isAbsolute(importPath)) {
    issue('AMX5001', `Invalid local module path '${importPath}'`, file, importNode.pathSource);
  }
  const target = path.resolve(path.dirname(file), importPath);
  const relativeToRoot = path.relative(entryRoot, target);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    issue('AMX5001', `Module '${importPath}' resolves outside the entry directory tree`, file, importNode.pathSource);
  }
}