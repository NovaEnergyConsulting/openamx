import { createHash } from 'node:crypto';
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import path from 'node:path';
import { AmxError } from '../diagnostics/errors';
import type { TranspileResult, TranspiledModule } from './types';

export type TranspileWritePhase = 'stage' | 'publish' | 'rollback';
export type TranspilePathStateName = 'staged' | 'published' | 'restored' | 'unrecovered';

export interface TranspilePathState {
  readonly outputPath: string;
  readonly state: TranspilePathStateName;
  readonly detail?: string;
}

export interface WriteTranspiledGraphOptions {
  readonly overwrite?: boolean;
  readonly failureInjector?: (phase: TranspileWritePhase, outputPath: string) => void;
  readonly expectedPlan?: TranspiledGraphWritePlan;
}

export interface TranspiledGraphWritePlan {
  readonly outputDirectory: string;
  readonly entryModuleId: string;
  readonly graphHash: string;
  readonly rootIdentity: { readonly device: number; readonly inode: number };
  readonly targets: readonly {
    readonly outputPath: string;
    readonly exists: boolean;
    readonly sha256?: string;
    readonly size?: number;
    readonly mode?: number;
    readonly modifiedAt?: number;
  }[];
}

export class TranspileOutputError extends AmxError {
  readonly pathStates: readonly TranspilePathState[];
  readonly retainedStagePath?: string;

  constructor(
    code: 'AMX6001' | 'AMX6002',
    message: string,
    pathStates: readonly TranspilePathState[] = [],
    retainedStagePath?: string
  ) {
    super({ code, message });
    this.pathStates = pathStates;
    this.retainedStagePath = retainedStagePath;
  }
}

interface PlannedTarget {
  readonly module: TranspiledModule;
  readonly absolutePath: string;
  readonly exists: boolean;
  readonly original?: {
    readonly sha256: string;
    readonly size: number;
    readonly mode: number;
    readonly modifiedAt: number;
  };
}

function outputError(code: 'AMX6001' | 'AMX6002', message: string): never {
  throw new TranspileOutputError(code, message);
}

function lstatIfExists(target: string): ReturnType<typeof lstatSync> | undefined {
  try {
    return lstatSync(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

function isWithinDirectory(root: string, candidate: string): boolean {
  const relativePath = path.relative(root, candidate);
  return relativePath !== '' && relativePath !== '..'
    && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function canonicalizeFuturePath(target: string): string {
  let cursor = path.resolve(target);
  const suffix: string[] = [];
  while (!lstatIfExists(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) throw new Error(`No existing parent for '${target}'`);
    suffix.unshift(path.basename(cursor));
    cursor = parent;
  }
  if (suffix.length && !statSync(cursor).isDirectory()) {
    outputError('AMX6001', `Output path has a non-directory parent '${cursor}'`);
  }
  return path.resolve(realpathSync(cursor), ...suffix);
}

function missingDirectories(target: string): string[] {
  let cursor = path.resolve(target);
  const missing: string[] = [];
  while (!lstatIfExists(cursor)) {
    missing.push(cursor);
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return missing.reverse();
}

function ensureRelativeOutputPath(outputPath: string): string[] {
  const segments = outputPath.split('/');
  if (!outputPath || outputPath.includes('\\') || path.posix.isAbsolute(outputPath)
    || segments.some(segment => !segment || segment === '.' || segment === '..')
    || path.posix.normalize(outputPath) !== outputPath || !outputPath.endsWith('.ts')) {
    outputError('AMX6001', `Invalid output-relative TypeScript path '${outputPath}'`);
  }
  return segments;
}

function normalizedKey(value: string): string {
  return value.normalize('NFC').replaceAll('\\', '/').toLowerCase();
}

function sourceRootForEntry(entry: TranspiledModule): string {
  const outputDirectory = path.posix.dirname(entry.outputPath);
  const depth = outputDirectory === '.' ? 0 : outputDirectory.split('/').length;
  let root = path.dirname(entry.sourcePath);
  for (let index = 0; index < depth; index++) root = path.dirname(root);
  return realpathSync(root);
}

function preflight(
  modules: readonly TranspiledModule[],
  entryModuleId: string,
  outputDirectory: string,
  overwrite: boolean
): { root: string; rootIdentity?: { device: number; inode: number }; targets: PlannedTarget[] } {
  if (!outputDirectory.trim()) outputError('AMX6001', 'An explicit output directory is required');
  const entry = modules.find(module => module.moduleId === entryModuleId);
  if (!entry) outputError('AMX6001', 'The generated graph does not contain its entry module');
  const segmentsByModule = new Map(modules.map(module => [module.moduleId, ensureRelativeOutputPath(module.outputPath)]));

  const root = canonicalizeFuturePath(outputDirectory);
  const rootStat = lstatIfExists(root);
  if (rootStat && !statSync(root).isDirectory()) outputError('AMX6001', 'Output root must be a directory');
  const sourceRoot = sourceRootForEntry(entry!);
  if (root === sourceRoot || isWithinDirectory(sourceRoot, root)) {
    outputError('AMX6001', 'Output directory must not be inside the AMX import root');
  }

  const sourceKeys = new Set(modules.map(module => normalizedKey(realpathSync(module.sourcePath))));
  const outputKeys = new Set<string>();
  const targetKeys = new Set<string>();
  const targets: PlannedTarget[] = [];
  const conflicts: string[] = [];

  for (const module of modules) {
    const segments = segmentsByModule.get(module.moduleId)!;
    const outputKey = normalizedKey(module.outputPath);
    if (outputKeys.has(outputKey)) outputError('AMX6001', `Output path collision at '${module.outputPath}'`);
    outputKeys.add(outputKey);

    const absolutePath = path.resolve(root, ...segments);
    const canonicalTarget = canonicalizeFuturePath(absolutePath);
    if (!isWithinDirectory(root, canonicalTarget)) {
      outputError('AMX6001', `Output target escapes the selected directory: '${module.outputPath}'`);
    }
    if (sourceKeys.has(normalizedKey(canonicalTarget))) {
      outputError('AMX6001', `Output target aliases an AMX source: '${module.outputPath}'`);
    }
    const targetKey = normalizedKey(canonicalTarget);
    if (targetKeys.has(targetKey)) outputError('AMX6001', `Output targets alias at '${module.outputPath}'`);
    targetKeys.add(targetKey);

    let parent = root;
    for (const segment of segments.slice(0, -1)) {
      parent = path.join(parent, segment);
      if (lstatIfExists(parent) && !statSync(parent).isDirectory()) {
        outputError('AMX6001', `Output parent is not a directory: '${module.outputPath}'`);
      }
    }

    const targetStat = lstatIfExists(absolutePath);
    if (targetStat?.isSymbolicLink()) {
      outputError('AMX6001', `Refusing symbolic-link output target '${module.outputPath}'`);
    }
    if (targetStat && !targetStat.isFile()) {
      outputError('AMX6001', `Output target is not a regular file: '${module.outputPath}'`);
    }
    if (targetStat && !overwrite) conflicts.push(module.outputPath);
    const original = targetStat ? {
      sha256: sha256(readFileSync(absolutePath)),
      size: Number(targetStat.size),
      mode: Number(targetStat.mode),
      modifiedAt: Number(targetStat.mtimeMs)
    } : undefined;
    targets.push({ module, absolutePath, exists: Boolean(targetStat), original });
  }

  const sortedKeys = [...outputKeys].sort();
  for (let index = 0; index < sortedKeys.length; index++) {
    const current = sortedKeys[index];
    if (sortedKeys.slice(index + 1).some(other => other.startsWith(`${current}/`))) {
      outputError('AMX6001', `Output file/directory conflict at '${current}'`);
    }
  }
  if (conflicts.length) {
    outputError('AMX6001', `Existing output targets require --overwrite: ${conflicts.sort().join(', ')}`);
  }
  const rootMetadata = rootStat ? statSync(root) : undefined;
  return {
    root,
    ...(rootMetadata ? { rootIdentity: { device: Number(rootMetadata.dev), inode: Number(rootMetadata.ino) } } : {}),
    targets
  };
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function graphHash(result: Extract<TranspileResult, { ok: true }>): string {
  const graph = {
    entryModuleId: result.entryModuleId,
    modules: result.modules.map(({ moduleId, sourcePath, outputPath, code }) => ({ moduleId, sourcePath, outputPath, code }))
  };
  return createHash('sha256').update(JSON.stringify(graph), 'utf8').digest('hex');
}

function sameTargetPlan(
  expected: TranspiledGraphWritePlan['targets'][number],
  actual: PlannedTarget
): boolean {
  return expected.outputPath === actual.module.outputPath
    && expected.exists === actual.exists
    && expected.sha256 === actual.original?.sha256
    && expected.size === actual.original?.size
    && expected.mode === actual.original?.mode
    && expected.modifiedAt === actual.original?.modifiedAt;
}

function assertExpectedPlan(
  result: Extract<TranspileResult, { ok: true }>,
  expected: TranspiledGraphWritePlan,
  actual: ReturnType<typeof preflight>
): void {
  if (expected.entryModuleId !== result.entryModuleId || expected.graphHash !== graphHash(result)
    || expected.outputDirectory !== actual.root
    || !actual.rootIdentity
    || expected.rootIdentity.device !== actual.rootIdentity.device
    || expected.rootIdentity.inode !== actual.rootIdentity.inode
    || expected.targets.length !== actual.targets.length
    || expected.targets.some((target, index) => !sameTargetPlan(target, actual.targets[index]!))) {
    outputError('AMX6001', 'Graph output changed after overwrite approval; no output was written');
  }
}

export function inspectTranspiledGraphWrite(
  result: Extract<TranspileResult, { ok: true }>,
  outputDirectory: string
): TranspiledGraphWritePlan {
  let plan: ReturnType<typeof preflight>;
  try {
    plan = preflight(result.modules, result.entryModuleId, outputDirectory, true);
  } catch (error) {
    if (error instanceof TranspileOutputError) throw error;
    throw new TranspileOutputError('AMX6001', `Output preflight failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!plan.rootIdentity) outputError('AMX6001', 'A graph write plan requires an existing output directory');
  return Object.freeze({
    outputDirectory: plan.root,
    entryModuleId: result.entryModuleId,
    graphHash: graphHash(result),
    rootIdentity: Object.freeze({ ...plan.rootIdentity }),
    targets: Object.freeze(plan.targets.map(target => Object.freeze({
      outputPath: target.module.outputPath,
      exists: target.exists,
      ...(target.original ? {
        sha256: target.original.sha256,
        size: target.original.size,
        mode: target.original.mode,
        modifiedAt: target.original.modifiedAt
      } : {})
    })))
  });
}

function originalWasRestored(target: PlannedTarget): boolean {
  if (!target.original) return false;
  const stat = statSync(target.absolutePath);
  return stat.isFile() && stat.size === target.original.size
    && stat.mode === target.original.mode && stat.mtimeMs === target.original.modifiedAt
    && sha256(readFileSync(target.absolutePath)) === target.original.sha256;
}

function removeCreatedDirectories(created: readonly string[]): void {
  for (const directory of [...created].reverse()) {
    try { rmdirSync(directory); } catch { /* Keep non-empty or inaccessible directories. */ }
  }
}

function pathStates(states: Map<string, TranspilePathState>): TranspilePathState[] {
  return [...states.values()].sort((left, right) => left.outputPath.localeCompare(right.outputPath));
}

export function writeTranspiledGraph(
  result: Extract<TranspileResult, { ok: true }>,
  outputDirectory: string,
  options: WriteTranspiledGraphOptions = {}
): { readonly entryPath: string; readonly outputPaths: readonly string[] } {
  let plan: ReturnType<typeof preflight>;
  try {
    plan = preflight(result.modules, result.entryModuleId, outputDirectory, options.overwrite === true);
  } catch (error) {
    if (error instanceof TranspileOutputError) throw error;
    throw new TranspileOutputError('AMX6001', `Output preflight failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (options.expectedPlan) assertExpectedPlan(result, options.expectedPlan, plan);

  const createdDirectories: string[] = [];
  for (const directory of missingDirectories(plan.root)) {
    try {
      mkdirSync(directory);
      createdDirectories.push(directory);
    } catch (error) {
      removeCreatedDirectories(createdDirectories);
      throw new TranspileOutputError('AMX6002', `Could not create output directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (realpathSync(plan.root) !== plan.root) {
    removeCreatedDirectories(createdDirectories);
    outputError('AMX6001', 'Output directory changed during preflight');
  }

  let stageDirectory: string;
  try {
    stageDirectory = mkdtempSync(path.join(plan.root, '.openamx-transpile-'));
  } catch (error) {
    removeCreatedDirectories(createdDirectories);
    throw new TranspileOutputError('AMX6002', `Could not create output staging directory: ${error instanceof Error ? error.message : String(error)}`);
  }

  const states = new Map<string, TranspilePathState>();
  const stagedPaths = new Map<string, string>();
  const backups = new Map<string, string>();
  const published = new Set<string>();

  try {
    for (const target of plan.targets) {
      options.failureInjector?.('stage', target.module.outputPath);
      const stagedPath = path.join(stageDirectory, 'staged', ...target.module.outputPath.split('/'));
      mkdirSync(path.dirname(stagedPath), { recursive: true });
      const bytes = Buffer.from(target.module.code, 'utf8');
      writeFileSync(stagedPath, bytes, { flag: 'wx' });
      if (sha256(readFileSync(stagedPath)) !== sha256(bytes)) throw new Error(`Staged content verification failed for '${target.module.outputPath}'`);
      stagedPaths.set(target.module.outputPath, stagedPath);
      states.set(target.module.outputPath, { outputPath: target.module.outputPath, state: 'staged' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    rmSync(stageDirectory, { recursive: true, force: true });
    removeCreatedDirectories(createdDirectories);
    throw new TranspileOutputError('AMX6002', `Failed while staging generated graph: ${message}`, pathStates(states));
  }

  if (options.expectedPlan) {
    try {
      const currentPlan = preflight(result.modules, result.entryModuleId, outputDirectory, true);
      assertExpectedPlan(result, options.expectedPlan, currentPlan);
    } catch (error) {
      rmSync(stageDirectory, { recursive: true, force: true });
      removeCreatedDirectories(createdDirectories);
      if (error instanceof TranspileOutputError) throw error;
      throw new TranspileOutputError('AMX6001', `Output plan revalidation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    for (const target of plan.targets) {
      for (const directory of missingDirectories(path.dirname(target.absolutePath))) {
        if (!lstatIfExists(directory)) {
          mkdirSync(directory);
          createdDirectories.push(directory);
        }
      }
    }

    for (const target of plan.targets) {
      const outputPath = target.module.outputPath;
      options.failureInjector?.('publish', outputPath);
      if (target.exists) {
        const backupPath = path.join(stageDirectory, 'backups', ...outputPath.split('/'));
        mkdirSync(path.dirname(backupPath), { recursive: true });
        renameSync(target.absolutePath, backupPath);
        backups.set(outputPath, backupPath);
      }
      renameSync(stagedPaths.get(outputPath)!, target.absolutePath);
      published.add(outputPath);
      states.set(outputPath, { outputPath, state: 'published' });
    }

    for (const target of plan.targets) {
      const actual = readFileSync(target.absolutePath);
      const expected = Buffer.from(target.module.code, 'utf8');
      if (sha256(actual) !== sha256(expected)) throw new Error(`Published content verification failed for '${target.module.outputPath}'`);
    }
  } catch (error) {
    const primaryMessage = error instanceof Error ? error.message : String(error);
    const rollbackErrors: string[] = [];
    for (const target of [...plan.targets].reverse()) {
      const outputPath = target.module.outputPath;
      const backupPath = backups.get(outputPath);
      if (!published.has(outputPath) && !backupPath) continue;
      try {
        options.failureInjector?.('rollback', outputPath);
        if (published.has(outputPath) && lstatIfExists(target.absolutePath)) {
          rmSync(target.absolutePath, { force: true });
        }
        if (backupPath) {
          renameSync(backupPath, target.absolutePath);
          if (!originalWasRestored(target)) throw new Error(`Original destination verification failed for '${outputPath}'`);
        } else if (published.has(outputPath) && lstatIfExists(target.absolutePath)) {
          throw new Error(`New destination could not be removed for '${outputPath}'`);
        }
        states.set(outputPath, { outputPath, state: 'restored' });
      } catch (rollbackError) {
        const detail = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
        rollbackErrors.push(`${outputPath}: ${detail}`);
        states.set(outputPath, { outputPath, state: 'unrecovered', detail });
      }
    }
    const unrecovered = [...states.values()].some(state => state.state === 'unrecovered');
    if (unrecovered) {
      throw new TranspileOutputError(
        'AMX6002',
        `Graph publication failed: ${primaryMessage}; rollback incomplete: ${rollbackErrors.join('; ')}`,
        pathStates(states),
        stageDirectory
      );
    }
    rmSync(stageDirectory, { recursive: true, force: true });
    removeCreatedDirectories(createdDirectories);
    throw new TranspileOutputError(
      'AMX6002',
      `Graph publication failed and rollback was verified: ${primaryMessage}`,
      pathStates(states)
    );
  }

  rmSync(stageDirectory, { recursive: true, force: true });
  const entry = result.modules.find(module => module.moduleId === result.entryModuleId)!;
  return {
    entryPath: path.join(plan.root, ...entry.outputPath.split('/')),
    outputPaths: plan.targets.map(target => target.module.outputPath)
  };
}