import { readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import type { ImportDeclarationNode, OpenAmxDocument, StatementNode } from '../ast/types';
import { AmxError, moduleError, staticError } from '../diagnostics/errors';
import { parseDocumentText } from '../parser/parseDocument';
import { normalizeParserLineSeparators } from './source';
import type { TranspileGraphInput, TranspileSourceModule } from './types';

export interface ResolveTranspileGraphOptions {
  readonly importRoot?: string;
}

interface PendingImport {
  readonly declaration: ImportDeclarationNode;
  readonly importingFile: string;
}

function statementsOf(document: OpenAmxDocument): StatementNode[] {
  const statements: StatementNode[] = [];
  for (const node of document.nodes) {
    if (node.type === 'executableCodeBlock') statements.push(...node.statements);
    else if (node.type === 'variableDeclaration') statements.push(node);
  }
  return statements;
}

type ImportableKind = 'type' | 'enum' | 'function' | 'binding' | 'dimension' | 'unit';

interface NamedDeclaration {
  readonly name: string;
  readonly kind: ImportableKind;
  readonly exported: boolean;
}

function namedDeclaration(statement: StatementNode): NamedDeclaration | undefined {
  switch (statement.type) {
    case 'typeDeclaration':
      return { name: statement.name, kind: 'type', exported: statement.exported === true };
    case 'enumDeclaration':
      return { name: statement.name, kind: 'enum', exported: statement.exported === true };
    case 'functionDeclaration':
      return { name: statement.name, kind: 'function', exported: statement.exported === true };
    case 'dimensionDeclaration':
      return { name: statement.name, kind: 'dimension', exported: statement.exported === true };
    case 'unitDeclaration':
      return { name: statement.name, kind: 'unit', exported: statement.exported === true };
    case 'variableDeclaration':
    case 'inputDeclaration':
    case 'tableDeclaration':
    case 'chartDeclaration':
      return { name: statement.name, kind: 'binding', exported: 'exported' in statement && statement.exported === true };
    default:
      return undefined;
  }
}

function isDimensionOrUnit(kind: ImportableKind | undefined): boolean {
  return kind === 'dimension' || kind === 'unit';
}

function validateImportedNames(modules: readonly TranspileSourceModule[]): void {
  const exportsByModule = new Map<string, Map<string, ImportableKind>>();
  const statementsByModule = new Map<string, StatementNode[]>();

  for (const module of modules) {
    const statements = statementsOf(parseSource(module.sourceText, module.sourcePath));
    const declarations = new Map<string, NamedDeclaration>();
    for (const statement of statements) {
      const declaration = namedDeclaration(statement);
      if (declaration) declarations.set(declaration.name, declaration);
    }
    const exports = new Map<string, ImportableKind>();
    for (const declaration of declarations.values()) {
      if (declaration.exported) exports.set(declaration.name, declaration.kind);
    }
    for (const statement of statements) {
      if (statement.type !== 'exportNamesDeclaration') continue;
      for (const exported of statement.names) {
        const declaration = declarations.get(exported.name);
        if (declaration) exports.set(exported.name, declaration.kind);
      }
    }
    exportsByModule.set(module.moduleId, exports);
    statementsByModule.set(module.moduleId, statements);
  }

  for (const module of modules) {
    const declarations = new Map<string, NamedDeclaration>();
    const statements = statementsByModule.get(module.moduleId)!;
    for (const statement of statements) {
      const declaration = namedDeclaration(statement);
      if (declaration) declarations.set(declaration.name, declaration);
    }
    const imported = new Map<string, boolean>();
    for (const statement of statements) {
      if (statement.type !== 'importDeclaration') continue;
      const dependencyId = module.resolvedImports.find(mapping => mapping.importPath === statement.path)?.moduleId;
      if (!dependencyId) moduleError('AMX5001', `Import '${statement.path}' has no resolved module`, statement.pathSource, module.sourcePath);
      const dependencyExports = exportsByModule.get(dependencyId!);
      if (!dependencyExports) moduleError('AMX5001', `Resolved module '${dependencyId}' is missing`, statement.pathSource, module.sourcePath);

      for (const importedName of statement.names) {
        const kind = dependencyExports!.get(importedName.name);
        const dimensionOrUnit = isDimensionOrUnit(kind);
        const previousDimensionOrUnit = imported.get(importedName.name) === true;
        if (imported.has(importedName.name)) {
          if (dimensionOrUnit || previousDimensionOrUnit) {
            staticError('AMX3008', `Duplicate import of dimension/unit '${importedName.name}'`, importedName.source, module.sourcePath);
          }
          moduleError('AMX5002', `Duplicate import of '${importedName.name}'`, importedName.source, module.sourcePath);
        }

        const local = declarations.get(importedName.name);
        if (local) {
          if (dimensionOrUnit || isDimensionOrUnit(local.kind)) {
            staticError('AMX3008', `Imported dimension/unit '${importedName.name}' collides with a local declaration`, importedName.source, module.sourcePath);
          }
          moduleError('AMX5002', `Imported name '${importedName.name}' collides with a local declaration`, importedName.source, module.sourcePath);
        }
        imported.set(importedName.name, dimensionOrUnit);
        if (!kind) {
          moduleError('AMX5002', `Module '${statement.path}' does not export '${importedName.name}'`, importedName.source, module.sourcePath);
        }
      }
    }
  }
}

function isWithinDirectory(root: string, candidate: string): boolean {
  const relativePath = path.relative(root, candidate);
  return relativePath !== '' && relativePath !== '..'
    && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function realpathOrFail(target: string, message: string, file: string, source?: ImportDeclarationNode['pathSource']): string {
  try {
    return realpathSync(target);
  } catch {
    return moduleError('AMX5001', message, source, file);
  }
}

function outputPathFor(root: string, canonicalPath: string, sourcePath: string): string {
  const relativePath = path.relative(root, canonicalPath);
  if (!relativePath || path.isAbsolute(relativePath) || relativePath === '..'
    || relativePath.startsWith(`..${path.sep}`) || !relativePath.endsWith('.amx')) {
    return moduleError('AMX5001', `Invalid source-relative module path '${relativePath}'`, undefined, sourcePath);
  }
  return relativePath.split(path.sep).join('/').replace(/\.amx$/, '.ts');
}

function validateImportPath(declaration: ImportDeclarationNode, file: string): void {
  const importPath = declaration.path;
  if (!(importPath.startsWith('./') || importPath.startsWith('../'))) {
    moduleError('AMX5001', `Import path '${importPath}' must be relative and start with './' or '../'`, declaration.pathSource, file);
  }
  if (importPath.includes('\\')) {
    moduleError('AMX5001', `Import path '${importPath}' must use '/' separators`, declaration.pathSource, file);
  }
  if (!importPath.endsWith('.amx')) {
    moduleError('AMX5001', `Import path '${importPath}' must end with the exact lowercase '.amx' suffix`, declaration.pathSource, file);
  }
  if (path.isAbsolute(importPath)) {
    moduleError('AMX5001', `Import path '${importPath}' must be relative`, declaration.pathSource, file);
  }
}

function parseSource(sourceText: string, sourcePath: string): OpenAmxDocument {
  try {
    return parseDocumentText(normalizeParserLineSeparators(sourceText));
  } catch (error) {
    if (error instanceof AmxError) {
      error.file ??= sourcePath;
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return moduleError('AMX5001', `Failed to parse module '${sourcePath}': ${message}`, undefined, sourcePath);
  }
}

export function resolveTranspileGraph(
  entryPath: string,
  options: ResolveTranspileGraphOptions = {}
): TranspileGraphInput {
  const absoluteEntry = path.resolve(entryPath);
  const canonicalEntry = realpathOrFail(absoluteEntry, `Entry module '${entryPath}' could not be read`, entryPath);
  if (!canonicalEntry.endsWith('.amx')) {
    moduleError('AMX5001', `Entry module '${entryPath}' must have the exact lowercase '.amx' suffix`, undefined, entryPath);
  }

  let entryStats;
  try {
    entryStats = statSync(canonicalEntry);
  } catch {
    moduleError('AMX5001', `Entry module '${entryPath}' could not be read`, undefined, entryPath);
  }
  if (!entryStats!.isFile()) moduleError('AMX5001', 'Entry module must be a regular file', undefined, canonicalEntry);

  const canonicalRoot = options.importRoot === undefined
    ? path.dirname(canonicalEntry)
    : realpathOrFail(path.resolve(options.importRoot), `Import root '${options.importRoot}' could not be read`, entryPath);
  let rootStats;
  try {
    rootStats = statSync(canonicalRoot);
  } catch {
    moduleError('AMX5001', `Import root '${options.importRoot ?? canonicalRoot}' could not be read`, undefined, entryPath);
  }
  if (!rootStats!.isDirectory()) moduleError('AMX5001', 'Import root must be a directory', undefined, entryPath);
  if (canonicalEntry !== canonicalRoot && !isWithinDirectory(canonicalRoot, canonicalEntry)) {
    moduleError('AMX5001', `Entry module '${entryPath}' resolves outside the import root directory tree`, undefined, entryPath);
  }

  const loaded = new Map<string, TranspileSourceModule>();
  const visiting: string[] = [];
  const dependencyOrder: TranspileSourceModule[] = [];

  const visit = (canonicalPath: string, viaImport?: PendingImport): TranspileSourceModule => {
    const cycleIndex = visiting.indexOf(canonicalPath);
    if (cycleIndex !== -1) {
      const cycle = [...visiting.slice(cycleIndex), canonicalPath]
        .map(item => path.relative(canonicalRoot, item).split(path.sep).join('/') || path.basename(item));
      return moduleError(
        'AMX5003',
        `Import cycle detected: ${cycle.join(' -> ')}`,
        viaImport?.declaration.pathSource,
        viaImport?.importingFile ?? canonicalPath
      );
    }
    const existing = loaded.get(canonicalPath);
    if (existing) return existing;

    visiting.push(canonicalPath);
    const sourcePath = canonicalPath;
    const outputPath = outputPathFor(canonicalRoot, canonicalPath, sourcePath);
    let sourceText: string;
    try {
      sourceText = readFileSync(canonicalPath, 'utf8');
    } catch {
      return moduleError(
        'AMX5001',
        viaImport ? `Module '${viaImport.declaration.path}' could not be read` : `Entry module '${entryPath}' could not be read`,
        viaImport?.declaration.pathSource,
        viaImport?.importingFile ?? sourcePath
      );
    }

    const statements = statementsOf(parseSource(sourceText, sourcePath));
    if (canonicalPath !== canonicalEntry) {
      const input = statements.find(statement => statement.type === 'inputDeclaration');
      if (input?.type === 'inputDeclaration') {
        staticError('AMX3005', 'Inputs may only be declared in the entry module', input.source, sourcePath);
      }
    }
    const imports: ImportDeclarationNode[] = [];
    let sawNonImport = false;
    for (const statement of statements) {
      if (statement.type === 'importDeclaration') {
        if (sawNonImport) {
          moduleError('AMX5001', 'Import declarations must precede all other executable items', statement.source, sourcePath);
        }
        imports.push(statement);
      } else {
        sawNonImport = true;
      }
    }

    const resolvedImports: TranspileSourceModule['resolvedImports'][number][] = [];
    for (const declaration of imports) {
      validateImportPath(declaration, sourcePath);
      const target = path.resolve(path.dirname(canonicalPath), declaration.path);
      const canonicalTarget = realpathOrFail(
        target,
        `Module '${declaration.path}' could not be found`,
        sourcePath,
        declaration.pathSource
      );
      if (!isWithinDirectory(canonicalRoot, canonicalTarget)) {
        moduleError(
          'AMX5001',
          `Module '${declaration.path}' resolves outside the ${options.importRoot === undefined ? 'entry directory tree' : 'import root directory tree'}`,
          declaration.pathSource,
          sourcePath
        );
      }
      const dependency = visit(canonicalTarget, { declaration, importingFile: sourcePath });
      resolvedImports.push({ importPath: declaration.path, moduleId: dependency.moduleId });
    }

    visiting.pop();
    const module: TranspileSourceModule = {
      moduleId: outputPath,
      sourcePath,
      outputPath,
      sourceText,
      resolvedImports
    };
    loaded.set(canonicalPath, module);
    dependencyOrder.push(module);
    return module;
  };

  const entry = visit(canonicalEntry);
  validateImportedNames(dependencyOrder);
  return { entryModuleId: entry.moduleId, modules: dependencyOrder };
}