import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = await mkdtemp(join(tmpdir(), 'openamx-sprint060-desktop-package-'));
try {
  const output = join(root, 'bun/jobWorker.js');
  await mkdir(join(root, 'bun'), { recursive: true });
  const result = await Bun.build({
    entrypoints: [resolve(import.meta.dir, 'ssr.ts')],
    target: 'bun',
    outfile: output
  });
  assert.equal(result.success, true, result.logs.map(log => log.message).join('\n'));
  await Bun.write(output, result.outputs[0]!);
  const bytes = (await stat(output)).size;
  const bundle = await readFile(output, 'utf8');
  assert.doesNotMatch(bundle, /from ["']echarts["']/);
  const processResult = Bun.spawnSync([process.execPath, output], { cwd: root });
  assert.equal(processResult.exitCode, 0, new TextDecoder().decode(processResult.stderr));
  const svg = await Bun.file(resolve(import.meta.dir, 'artifacts/ssr.svg')).text();
  assert.match(svg, /<svg/);
  console.log(JSON.stringify({ status: 'passed-bundled-resource-fixture', output: 'bun/jobWorker.js', bundleBytes: bytes, packageExternalEchartsImport: false, runExitCode: processResult.exitCode, limitation: 'temporary Electrobun-shaped package fixture; not an Electrobun app bundle or native runtime' }));
} finally {
  await rm(root, { recursive: true, force: true });
}