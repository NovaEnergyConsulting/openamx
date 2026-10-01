import { lstat, open, realpath, rename, unlink } from 'node:fs/promises';
import * as path from 'node:path';
import { outputError } from '../diagnostics/errors';

export interface DocxDestination {
  path: string;
  parent: string;
}

export async function prepareDocxDestination(destination: string | undefined, entryPath: string, inputMappings: string[] | undefined): Promise<DocxDestination> {
  if (!destination) outputError('AMX6001', 'DOCX export requires --out <path>');
  if (path.extname(destination) !== '.docx') outputError('AMX6001', 'DOCX destination must use the exact lowercase .docx extension');
  const absolute = path.resolve(destination);
  const parent = path.dirname(absolute);
  let canonicalParent: string;
  try {
    canonicalParent = await realpath(parent);
  } catch {
    outputError('AMX6001', `DOCX destination parent '${parent}' does not exist`);
  }
  const canonicalDestination = path.join(canonicalParent, path.basename(absolute));
  const conflicts = [path.resolve(entryPath), ...(inputMappings ?? []).map(mapping => mapping.slice(mapping.indexOf('=') + 1))]
    .map(candidate => path.resolve(candidate));
  if (conflicts.includes(canonicalDestination)) outputError('AMX6001', `DOCX destination '${canonicalDestination}' conflicts with an input or entry module`);
  try {
    const existing = await lstat(canonicalDestination);
    if (existing.isSymbolicLink()) outputError('AMX6001', `DOCX destination '${canonicalDestination}' must not be a symlink`);
    if (!existing.isFile()) outputError('AMX6001', `DOCX destination '${canonicalDestination}' is not a regular file`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') outputError('AMX6001', `Cannot inspect DOCX destination '${canonicalDestination}'`);
  }
  return { path: canonicalDestination, parent: canonicalParent };
}

export async function writeDocxAtomically(destination: DocxDestination, bytes: Uint8Array, beforeCommit?: () => void): Promise<void> {
  const temporary = path.join(destination.parent, `.${path.basename(destination.path)}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`);
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(temporary, 'wx');
    await handle.write(bytes);
    await handle.sync();
    await handle.close();
    handle = undefined;
    beforeCommit?.();
    await rename(temporary, destination.path);
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined);
    await unlink(temporary).catch(() => undefined);
    const detail = error instanceof Error ? error.message : String(error);
    outputError('AMX6002', `Failed to write DOCX '${destination.path}': ${detail}`);
  }
}