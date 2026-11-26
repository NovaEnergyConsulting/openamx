import path from 'node:path';
import type {
  EnumDeclarationNode,
  FunctionDeclarationNode,
  ImportDeclarationNode,
  OpenAmxDocument,
  StatementNode,
  TypeDeclarationNode
} from '../ast/types';
import { AmxError, moduleError } from '../diagnostics/errors';
import { parseDocumentText } from '../parser/parseDocument';
import {
  checkDocument,
  type CheckedType,
  type ModuleCheckResult
} from '../typechecker/checkDocument';
import type { DimensionMetadata, UnitMetadata } from '../typechecker/dimensionTypes';
import type { TranspileSourceModule } from './types';
import { normalizeParserLineSeparators } from './source';

export interface PreparedModule {
  readonly input: TranspileSourceModule;
  readonly document: OpenAmxDocument;
  readonly statements: readonly StatementNode[];
  readonly imports: ReadonlyMap<string, PreparedModule>;
  readonly check: ModuleCheckResult;
  readonly importSpecifiers: ReadonlyMap<string, string>;
}

export interface PreparedGraph {
  readonly entry: PreparedModule;
  readonly dependencyOrder: readonly PreparedModule[];
}

function statementsOf(document: OpenAmxDocument): StatementNode[] {
  const statements: StatementNode[] = [];
  for (const node of document.nodes) {
    if (node.type === 'executableCodeBlock') statements.push(...node.statements);
    else if (node.type === 'variableDeclaration') statements.push(node);
  }
  return statements;
}

function validateOutputPath(module: TranspileSourceModule): void {
  const outputPath = module.outputPath;
  if (!outputPath || outputPath.includes('\\') || path.posix.isAbsolute(outputPath)
    || outputPath.split('/').some(part => part === '..' || part === '')
    || path.posix.normalize(outputPath) !== outputPath || !outputPath.endsWith('.ts')) {
    moduleError('AMX5001', `Invalid output-relative TypeScript path '${outputPath}'`, undefined, module.sourcePath);
  }
}

function collectDocuments(input: readonly TranspileSourceModule[]): Map<string, {
  input: TranspileSourceModule;
  document: OpenAmxDocument;
  statements: StatementNode[];
  importMappings: Map<string, string>;
}> {
  const records = new Map<string, {
    input: TranspileSourceModule;
    document: OpenAmxDocument;
    statements: StatementNode[];
    importMappings: Map<string, string>;
  }>();
  const outputPaths = new Set<string>();

  for (const module of input) {
    if (!module.moduleId || records.has(module.moduleId)) {
      moduleError('AMX5001', `Duplicate or empty module identity '${module.moduleId}'`, undefined, module.sourcePath);
    }
    validateOutputPath(module);
    if (outputPaths.has(module.outputPath)) {
      moduleError('AMX5001', `Duplicate output path '${module.outputPath}'`, undefined, module.sourcePath);
    }
    outputPaths.add(module.outputPath);

    const importMappings = new Map<string, string>();
    for (const mapping of module.resolvedImports) {
      if (importMappings.has(mapping.importPath)) {
        moduleError('AMX5002', `Duplicate resolved import mapping '${mapping.importPath}'`, undefined, module.sourcePath);
      }
      importMappings.set(mapping.importPath, mapping.moduleId);
    }

    let document: OpenAmxDocument;
    try {
      document = parseDocumentText(normalizeParserLineSeparators(module.sourceText));
    } catch (error) {
      if (error instanceof AmxError) {
        error.file ??= module.sourcePath;
        throw error;
      }
      const parseError = error instanceof Error ? error : new Error(String(error));
      Object.assign(parseError, { file: module.sourcePath });
      throw parseError;
    }
    records.set(module.moduleId, {
      input: module,
      document,
      statements: statementsOf(document),
      importMappings
    });
  }
  return records;
}

function importedContext(
  source: TranspileSourceModule,
  statements: readonly StatementNode[],
  dependencies: ReadonlyMap<string, PreparedModule>
): {
  types: Map<string, TypeDeclarationNode>;
  enums: Map<string, EnumDeclarationNode>;
  functions: Map<string, FunctionDeclarationNode>;
  bindings: Map<string, CheckedType>;
  dimensions: Map<string, DimensionMetadata>;
  units: Map<string, UnitMetadata>;
} {
  const context = {
    types: new Map<string, TypeDeclarationNode>(),
    enums: new Map<string, EnumDeclarationNode>(),
    functions: new Map<string, FunctionDeclarationNode>(),
    bindings: new Map<string, CheckedType>(),
    dimensions: new Map<string, DimensionMetadata>(),
    units: new Map<string, UnitMetadata>()
  };

  for (const statement of statements) {
    if (statement.type !== 'importDeclaration') continue;
    const dependency = dependencies.get(statement.path);
    if (!dependency) moduleError('AMX5001', `Import '${statement.path}' has no resolved module`, statement.pathSource, source.sourcePath);
    for (const imported of statement.names) {
      const name = imported.name;
      const check = dependency!.check;
      if (check.exportedTypes.has(name)) context.types.set(name, check.exportedTypes.get(name)!);
      else if (check.exportedEnums.has(name)) context.enums.set(name, check.exportedEnums.get(name)!);
      else if (check.exportedFunctions.has(name)) context.functions.set(name, check.exportedFunctions.get(name)!);
      else if (check.exportedBindings.has(name)) context.bindings.set(name, check.exportedBindings.get(name)!);
      else if (check.exportedDimensions.has(name)) context.dimensions.set(name, check.exportedDimensions.get(name)!);
      else if (check.exportedUnits.has(name)) context.units.set(name, check.exportedUnits.get(name)!);
      else moduleError('AMX5002', `Module '${statement.path}' does not export '${name}'`, imported.source, source.sourcePath);
    }
  }
  return context;
}

export function prepareGraph(entryModuleId: string, modules: readonly TranspileSourceModule[]): PreparedGraph {
  if (!modules.length) moduleError('AMX5001', 'A transpile graph must contain at least one module');

  const records = collectDocuments(modules);
  const entryRecord = records.get(entryModuleId);
  if (!entryRecord) moduleError('AMX5001', `Entry module '${entryModuleId}' is missing`);

  const states = new Map<string, 'visiting' | 'visited'>();
  const ordered: PreparedModule[] = [];
  const prepared = new Map<string, PreparedModule>();
  const sharedBaseUnits = new Map<string, UnitMetadata>();

  const visit = (moduleId: string, ancestry: readonly string[]): PreparedModule => {
    const state = states.get(moduleId);
    if (state === 'visiting') {
      const record = records.get(moduleId)!;
      moduleError('AMX5003', `Import cycle detected: ${[...ancestry, moduleId].join(' -> ')}`, undefined, record.input.sourcePath);
    }
    const existing = prepared.get(moduleId);
    if (existing) return existing;

    const record = records.get(moduleId);
    if (!record) moduleError('AMX5001', `Resolved module '${moduleId}' is missing`);
    states.set(moduleId, 'visiting');

    const dependencies = new Map<string, PreparedModule>();
    const specifiers = new Map<string, string>();
    const usedImportPaths = new Set<string>();
    for (const statement of record!.statements) {
      if (statement.type !== 'importDeclaration') continue;
      const dependencyId = record!.importMappings.get(statement.path);
      if (!dependencyId) {
        moduleError('AMX5001', `Import '${statement.path}' has no resolved module`, statement.pathSource, record!.input.sourcePath);
      }
      if (!records.has(dependencyId!)) {
        moduleError('AMX5001', `Resolved module '${dependencyId}' is missing`, statement.pathSource, record!.input.sourcePath);
      }
      usedImportPaths.add(statement.path);
      const dependency = visit(dependencyId!, [...ancestry, moduleId]);
      dependencies.set(statement.path, dependency);
      const relativePath = path.posix.relative(path.posix.dirname(record!.input.outputPath), dependency.input.outputPath);
      specifiers.set(statement.path, relativePath.startsWith('.') ? relativePath : `./${relativePath}`);
    }
    for (const importPath of record!.importMappings.keys()) {
      if (!usedImportPaths.has(importPath)) {
        moduleError('AMX5001', `Resolved import '${importPath}' is not declared by the source`, undefined, record!.input.sourcePath);
      }
    }

    const imported = importedContext(record!.input, record!.statements, dependencies);
    const check = checkDocument(record!.document, record!.input.sourcePath, {
      ...imported,
      baseUnits: sharedBaseUnits,
      moduleIdentity: record!.input.outputPath,
      isEntryModule: moduleId === entryModuleId
    });
    const module: PreparedModule = {
      input: record!.input,
      document: record!.document,
      statements: record!.statements,
      imports: dependencies,
      importSpecifiers: specifiers,
      check
    };
    prepared.set(moduleId, module);
    states.set(moduleId, 'visited');
    ordered.push(module);
    return module;
  };

  const entry = visit(entryModuleId, []);
  if (prepared.size !== records.size) {
    const unreachable = [...records.keys()].filter(moduleId => !prepared.has(moduleId));
    const firstUnreachable = records.get(unreachable[0]);
    moduleError('AMX5001', `Unreachable modules in resolved graph: ${unreachable.join(', ')}`, undefined, firstUnreachable?.input.sourcePath);
  }
  return { entry, dependencyOrder: ordered };
}

export function sourceDiagnostic(error: unknown, fallbackFile?: string) {
  if (error instanceof AmxError) {
    return {
      code: error.code,
      message: error.message,
      file: error.file ?? fallbackFile,
      ...(error.line === undefined ? {} : { line: error.line }),
      ...(error.column === undefined ? {} : { column: error.column })
    };
  }
  const sourceError = error instanceof Error
    ? error as Error & { code?: string; file?: string; line?: number; column?: number }
    : undefined;
  return {
    message: error instanceof Error ? error.message : String(error),
    ...(sourceError?.code === undefined ? {} : { code: sourceError.code }),
    ...((sourceError?.file ?? fallbackFile) ? { file: sourceError?.file ?? fallbackFile } : {}),
    ...(sourceError?.line === undefined ? {} : { line: sourceError.line }),
    ...(sourceError?.column === undefined ? {} : { column: sourceError.column })
  };
}

export function importsOf(module: PreparedModule): readonly ImportDeclarationNode[] {
  return module.statements.filter((statement): statement is ImportDeclarationNode => statement.type === 'importDeclaration');
}