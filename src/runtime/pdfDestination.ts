import { lstat, open, realpath, rename, unlink } from 'node:fs/promises';
import * as path from 'node:path';
import { outputError } from '../diagnostics/errors';

export interface PdfDestination {
  path: string;
  parent: string;
}

export async function preparePdfDestination(
  destination: string | undefined,
  entryPath: string,
  inputMappings: string[] | undefined
): Promise<PdfDestination> {
  if (!destination) outputError('AMX6001', 'PDF export requires --out <path>');
  if (path.extname(destination) !== '.pdf') outputError('AMX6001', 'PDF destination must use the exact lowercase .pdf extension');

  const absolute = path.resolve(destination);
  const parent = path.dirname(absolute);
  let canonicalParent: string;
  try {
    canonicalParent = await realpath(parent);
  } catch {
    outputError('AMX6001', `PDF destination parent '${parent}' does not exist`);
  }

  const canonicalDestination = path.join(canonicalParent, path.basename(absolute));
  const conflicts = [path.resolve(entryPath), ...(inputMappings ?? []).map(mapping => mapping.slice(mapping.indexOf('=') + 1))]
    .map(candidate => path.resolve(candidate));
  if (conflicts.includes(canonicalDestination)) {
    outputError('AMX6001', `PDF destination '${canonicalDestination}' conflicts with an input or entry module`);
  }

  try {
    const existing = await lstat(canonicalDestination);
    if (existing.isSymbolicLink()) outputError('AMX6001', `PDF destination '${canonicalDestination}' must not be a symlink`);
    if (!existing.isFile()) outputError('AMX6001', `PDF destination '${canonicalDestination}' is not a regular file`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      outputError('AMX6001', `Cannot inspect PDF destination '${canonicalDestination}'`);
    }
  }
  return { path: canonicalDestination, parent: canonicalParent };
}

export async function writePdfAtomically(destination: PdfDestination, bytes: Uint8Array): Promise<void> {
  const temporary = path.join(destination.parent, `.${path.basename(destination.path)}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`);
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(temporary, 'wx');
    await handle.write(bytes);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporary, destination.path);
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined);
    await unlink(temporary).catch(() => undefined);
    const detail = error instanceof Error ? error.message : String(error);
    outputError('AMX6002', `Failed to write PDF '${destination.path}': ${detail}`);
  }
}