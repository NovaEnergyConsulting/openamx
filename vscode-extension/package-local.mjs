import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(extensionDirectory, '..');
const manifest = JSON.parse(await readFile(path.join(extensionDirectory, 'package.json'), 'utf8'));
const stage = await mkdtemp(path.join(os.tmpdir(), 'openamx-vsix-'));
const output = path.join(extensionDirectory, `${manifest.name}-${manifest.version}.vsix`);

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    windowsHide: true,
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status ?? 'unknown'}.`);
}

try {
  run('node', ['./esbuild.mjs'], extensionDirectory);
  for (const relativePath of ['package.json', '.vscodeignore', 'README.md', 'amx.tmGrammar.json', 'language-configuration.json']) {
    await cp(path.join(extensionDirectory, relativePath), path.join(stage, relativePath));
  }
  await cp(path.join(extensionDirectory, 'dist/extension.js'), path.join(stage, 'dist/extension.js'));
  await cp(path.join(rootDirectory, 'LICENSE.md'), path.join(stage, 'LICENSE.md'));
  const vsce = path.join(extensionDirectory, 'node_modules', '.bin', process.platform === 'win32' ? 'vsce.cmd' : 'vsce');
  run(vsce, ['package', '--no-dependencies', '--out', output], stage);
} finally {
  await rm(stage, { recursive: true, force: true });
}
