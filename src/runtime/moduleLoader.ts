import * as path from 'path';
import * as fs from 'fs';
import {
  FunctionDeclarationNode,
  ImportDeclarationNode,
  OpenAmxDocument,
  StatementNode,
  TypeDeclarationNode
} from '../ast/types';
import { parseDocument, parseDocumentText } from '../parser/parseDocument';
import { checkDocument, CheckedType, ModuleCheckResult } from '../typechecker/checkDocument';
import { evaluateStatements } from './evaluateExpression';
import { Environment } from './environment';
import { AmxError, moduleError, staticError, throwInputErrors, type AmxDiagnostic } from '../diagnostics/errors';
import { describeInputSchema, loadInputValues, validateInputText, type InputSchema, type InputTextFormat, ValidationMode } from './inputData';
import { describeOutputSchemas, prepareOutputs, type OutputSchema, PreparedOutput } from './outputData';
import type { ViewEmission } from './environment';

/**
 * Local `.amx` module loader (Sprint 015).
 *
 * Owns all filesystem access for imports: canonicalizing paths, enforcing
 * entry-directory containment, resolving the complete dependency graph with
 * source-order depth-first traversal, detecting cycles, and evaluating each
 * module exactly once before its importer. AMX expressions/functions never
 * receive paths or file handles; only this loader touches the filesystem.
 */

interface ModuleRecord {
  canonicalPath: string;
  doc: OpenAmxDocument;
  checkResult: ModuleCheckResult;
  importedTypes: Map<string, TypeDeclarationNode>;
  importedFunctions: Map<string, FunctionDeclarationNode>;
  importedBindings: Map<string, CheckedType>;
  importedBindingSources: Map<string, string>;
}

export interface LoadedEntryModule {
  doc: OpenAmxDocument;
  env: Environment;
  outputs: PreparedOutput[];
  viewEmissions: readonly ViewEmission[];
  inputInspection?: EntryInputInspection;
  outputSchemas?: OutputSchema[];
}

export interface EntryInputInspection {
  schema: InputSchema;
  valid: boolean;
  diagnostics: AmxDiagnostic[];
  outputs: OutputSchema[];
}

export interface ModuleLoadOptions {
  entryText?: string;
  sourceOverlay?: ReadonlyMap<string, string>;
  inputMappings?: string[];
  validation?: ValidationMode;
  inputInspection?: { name: string; format: InputTextFormat; text: string };
  outputInspection?: boolean;
  outputMappings?: string[];
  reservedOutputPath?: string;
}

function flattenStatements(doc: OpenAmxDocument): StatementNode[] {
  const statements: StatementNode[] = [];
  for (const node of doc.nodes) {
    if (node.type === 'executableCodeBlock') statements.push(...node.statements);
  }
  return statements;
}

function validateImportPathSyntax(importNode: ImportDeclarationNode, file: string): void {
  const importPath = importNode.path;
  if (!(importPath.startsWith('./') || importPath.startsWith('../'))) {
    moduleError('AMX5001', `Import path '${importPath}' must be relative and start with './' or '../'`, importNode.pathSource, file);
  }
  if (importPath.includes('\\')) {
    moduleError('AMX5001', `Import path '${importPath}' must use '/' separators`, importNode.pathSource, file);
  }
  if (!importPath.endsWith('.amx')) {
    moduleError('AMX5001', `Import path '${importPath}' must end with the exact lowercase '.amx' suffix`, importNode.pathSource, file);
  }
  if (path.isAbsolute(importPath)) {
    moduleError('AMX5001', `Import path '${importPath}' must be relative`, importNode.pathSource, file);
  }
}

function realpathOrFail(absolutePath: string, code: 'AMX5001', message: string, sourceFile: string): string {
  try {
    return fs.realpathSync(absolutePath);
  } catch {
    moduleError(code, message, undefined, sourceFile);
  }
}

/**
 * Resolve, check, and evaluate the complete module graph reachable from `entryPath`,
 * returning the entry module's document and final evaluated environment.
 */
export async function loadEntryModule(entryPath: string, options: ModuleLoadOptions = {}): Promise<LoadedEntryModule> {
  const absoluteEntry = path.resolve(entryPath);
  const realEntry = realpathOrFail(absoluteEntry, 'AMX5001', `Entry module '${entryPath}' could not be read`, entryPath);
  const entryRoot = path.dirname(realEntry);

  if (options.sourceOverlay) {
    if (options.sourceOverlay.size > 100) {
      moduleError('AMX5001', 'Source overlay exceeds the 100-module limit', undefined, entryPath);
    }
    for (const overlayPath of options.sourceOverlay.keys()) {
      if (!path.isAbsolute(overlayPath)) {
        moduleError('AMX5001', 'Source overlay paths must be canonical absolute paths', undefined, entryPath);
      }
      const canonicalOverlayPath = realpathOrFail(overlayPath, 'AMX5001', 'Source overlay module could not be read', entryPath);
      const relativeToRoot = path.relative(entryRoot, canonicalOverlayPath);
      if (canonicalOverlayPath !== overlayPath || relativeToRoot === '' || relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        moduleError('AMX5001', 'Source overlay paths must be canonical and contained by the entry directory tree', undefined, entryPath);
      }
    }
  }

  const resolved = new Map<string, ModuleRecord>();
  const visiting: string[] = [];
  const evaluationOrder: string[] = [];

  async function visit(canonicalPath: string, viaImportSource: { pathSource?: ImportDeclarationNode['pathSource']; file: string } | undefined): Promise<ModuleRecord> {
    const existing = resolved.get(canonicalPath);
    if (existing) return existing;

    const cycleIndex = visiting.indexOf(canonicalPath);
    if (cycleIndex !== -1) {
      const cycle = [...visiting.slice(cycleIndex), canonicalPath].map(p => path.relative(entryRoot, p) || path.basename(p));
      moduleError('AMX5003', `Import cycle detected: ${cycle.join(' -> ')}`, viaImportSource?.pathSource, viaImportSource?.file);
    }

    visiting.push(canonicalPath);

    let doc: OpenAmxDocument;
    try {
      const overlayText = options.sourceOverlay?.get(canonicalPath);
      doc = canonicalPath === realEntry && options.entryText !== undefined
        ? parseDocumentText(options.entryText)
        : overlayText !== undefined
          ? parseDocumentText(overlayText)
          : await parseDocument(canonicalPath);
    } catch (error) {
      if (error instanceof AmxError && error.code === 'AMX3006') {
        error.file ??= canonicalPath;
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      visiting.pop();
      return moduleError('AMX5001', `Failed to parse module '${canonicalPath}': ${message}`, undefined, canonicalPath);
    }

    const statements = flattenStatements(doc);
    const localNames = new Set<string>();
    for (const statement of statements) {
      if (statement.type === 'typeDeclaration' || statement.type === 'functionDeclaration' || statement.type === 'variableDeclaration' || statement.type === 'inputDeclaration'
        || statement.type === 'tableDeclaration' || statement.type === 'chartDeclaration') {
        localNames.add(statement.name);
      }
    }

    if (canonicalPath !== realEntry) {
      const input = statements.find(statement => statement.type === 'inputDeclaration');
      if (input?.type === 'inputDeclaration') {
        staticError('AMX3005', 'Inputs may only be declared in the entry module', input.source, canonicalPath);
      }
    }

    let sawNonImport = false;
    for (const statement of statements) {
      if (statement.type === 'importDeclaration') {
        if (sawNonImport) moduleError('AMX5001', 'Import declarations must precede all other executable items', statement.source, canonicalPath);
      } else {
        sawNonImport = true;
      }
    }

    const imports = statements.filter((s): s is ImportDeclarationNode => s.type === 'importDeclaration');
    const importedTypes = new Map<string, TypeDeclarationNode>();
    const importedFunctions = new Map<string, FunctionDeclarationNode>();
    const importedBindings = new Map<string, CheckedType>();
    const importedBindingSources = new Map<string, string>();
    const importedNamesSeen = new Set<string>();

    for (const importNode of imports) {
      validateImportPathSyntax(importNode, canonicalPath);
      const importerDir = path.dirname(canonicalPath);
      const targetAbsolute = path.resolve(importerDir, importNode.path);
      const targetReal = realpathOrFail(
        targetAbsolute,
        'AMX5001',
        `Module '${importNode.path}' could not be found`,
        canonicalPath
      );
      const relativeToRoot = path.relative(entryRoot, targetReal);
      if (relativeToRoot === '' || relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        moduleError('AMX5001', `Module '${importNode.path}' resolves outside the entry directory tree`, importNode.pathSource, canonicalPath);
      }

      const dependency = await visit(targetReal, { pathSource: importNode.pathSource, file: canonicalPath });

      for (const importedName of importNode.names) {
        if (importedNamesSeen.has(importedName.name)) {
          moduleError('AMX5002', `Duplicate import of '${importedName.name}'`, importedName.source, canonicalPath);
        }
        importedNamesSeen.add(importedName.name);
        if (localNames.has(importedName.name)) {
          moduleError('AMX5002', `Imported name '${importedName.name}' collides with a local declaration`, importedName.source, canonicalPath);
        }

        if (dependency.checkResult.exportedTypes.has(importedName.name)) {
          importedTypes.set(importedName.name, dependency.checkResult.exportedTypes.get(importedName.name)!);
        } else if (dependency.checkResult.exportedFunctions.has(importedName.name)) {
          importedFunctions.set(importedName.name, dependency.checkResult.exportedFunctions.get(importedName.name)!);
        } else if (dependency.checkResult.exportedBindings.has(importedName.name)) {
          importedBindings.set(importedName.name, dependency.checkResult.exportedBindings.get(importedName.name)!);
          importedBindingSources.set(importedName.name, dependency.canonicalPath);
        } else {
          moduleError('AMX5002', `Module '${importNode.path}' does not export '${importedName.name}'`, importedName.source, canonicalPath);
        }
      }
    }

    const checkResult: ModuleCheckResult = checkDocument(doc, canonicalPath, {
      types: importedTypes,
      functions: importedFunctions,
      bindings: importedBindings,
      isEntryModule: canonicalPath === realEntry
    });

    visiting.pop();
    const record: ModuleRecord = { canonicalPath, doc, checkResult, importedTypes, importedFunctions, importedBindings, importedBindingSources };
    resolved.set(canonicalPath, record);
    evaluationOrder.push(canonicalPath);
    return record;
  }

  await visit(realEntry, undefined);

  const entryRecord = resolved.get(realEntry)!;
  const entryStatements = flattenStatements(entryRecord.doc);
  const inputDeclarations = entryStatements.filter(statement => statement.type === 'inputDeclaration');
  const entryTypes = new Map(entryRecord.importedTypes);
  for (const statement of entryStatements) {
    if (statement.type === 'typeDeclaration') entryTypes.set(statement.name, statement);
  }
  const outputs = prepareOutputs(
    options.outputMappings,
    entryRecord.checkResult.exportedBindings,
    entryTypes,
    options.reservedOutputPath
  );
  const outputSchemas = options.inputInspection || options.outputInspection
    ? describeOutputSchemas(entryRecord.checkResult.exportedBindings, entryTypes)
    : undefined;
  if (options.inputInspection) {
    const declaration = inputDeclarations.find(input => input.name === options.inputInspection!.name);
    if (!declaration) {
      throwInputErrors([{
        code: 'AMX4001',
        message: `Unknown logical input '${options.inputInspection.name}'`,
        file: entryPath,
        inputName: options.inputInspection.name
      }]);
    }
    const validation = validateInputText(
      options.inputInspection.text,
      options.inputInspection.format,
      declaration,
      entryTypes,
      options.validation ?? 'aggregate',
      { file: entryPath }
    );
    return {
      doc: entryRecord.doc,
      env: new Environment(entryTypes),
      outputs,
      viewEmissions: [],
      inputInspection: {
        schema: describeInputSchema(declaration, entryTypes),
        valid: validation.diagnostics.length === 0,
        diagnostics: validation.diagnostics,
        outputs: outputSchemas ?? []
      }
    };
  }
  if (options.outputInspection) {
    return { doc: entryRecord.doc, env: new Environment(entryTypes), outputs, viewEmissions: [], outputSchemas: outputSchemas ?? [] };
  }
  const inputValues = await loadInputValues(
    inputDeclarations,
    entryTypes,
    options.inputMappings,
    options.validation,
    entryPath
  );

  const evaluatedEnvironments = new Map<string, Environment>();
  for (const canonicalPath of evaluationOrder) {
    const record = resolved.get(canonicalPath)!;
    const env = new Environment();
    env.validationMode = options.validation ?? 'aggregate';
    for (const [name, typeDeclaration] of record.importedTypes) env.recordTypes.set(name, typeDeclaration);
    for (const [name, functionDeclaration] of record.importedFunctions) env.functions.set(name, functionDeclaration);
    for (const [name, bindingType] of record.checkResult.bindingTypes) env.bindingTypes.set(name, bindingType);
    for (const [name, sourcePath] of record.importedBindingSources) {
      const dependencyEnv = evaluatedEnvironments.get(sourcePath)!;
      env.set(name, dependencyEnv.get(name));
    }
    if (canonicalPath === realEntry) {
      for (const [name, value] of inputValues) env.set(name, value);
    }
    for (let nodeIndex = 0; nodeIndex < record.doc.nodes.length; nodeIndex++) {
      const node = record.doc.nodes[nodeIndex];
      if (node.type === 'executableCodeBlock') {
        env.currentDocumentNodeIndex = nodeIndex;
        evaluateStatements(node.statements, env, canonicalPath);
      }
    }
    evaluatedEnvironments.set(canonicalPath, env);
  }

  const entryEnv = evaluatedEnvironments.get(realEntry)!;
  return { doc: resolved.get(realEntry)!.doc, env: entryEnv, outputs, viewEmissions: entryEnv.viewEmissions };
}
