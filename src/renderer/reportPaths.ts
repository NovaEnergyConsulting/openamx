import { existsSync, lstatSync, realpathSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { AmxError } from '../diagnostics/errors';

export function canonicalDirectory(path: string, message = 'Project root must be an existing directory'): string {
  try {
    const canonical = realpathSync(path);
    if (!statSync(canonical).isDirectory()) {
      throw new AmxError({ code: 'AMX6001', message, file: path });
    }
    return canonical;
  } catch (error) {
    if (error instanceof AmxError) throw error;
    throw new AmxError({ code: 'AMX6001', message, file: path });
  }
}

export function isContained(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  return relation !== '..' && !relation.startsWith(`..${sep}`) && relation !== '';
}

export function hasSymlink(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  let current = root;
  for (const segment of relation.split(sep)) {
    current = resolve(current, segment);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) return true;
  }
  return false;
}
