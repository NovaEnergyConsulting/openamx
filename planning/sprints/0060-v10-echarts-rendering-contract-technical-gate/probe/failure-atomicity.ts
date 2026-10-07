import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serializePdfReport } from '../../../../src/renderer/reportPdf';
import { AmxError } from '../../../../src/diagnostics/errors';
import { preparePdfDestination, writePdfAtomically } from '../../../../src/runtime/pdfDestination';

const root = await mkdtemp(join(tmpdir(), 'openamx-sprint060-pdf-failure-'));
const entry = join(root, 'report.amx');
const target = join(root, 'report.pdf');
const original = Buffer.from('existing destination must remain unchanged');
try {
  await writeFile(entry, '# Probe\n');
  await writeFile(target, original);
  const destination = await preparePdfDestination(target, entry, []);
  await assert.rejects(
    serializePdfReport({ definition: { content: [{ svg: 'not SVG', width: 470, height: 160 }] } }),
    /Invalid svg document/
  );
  assert.deepEqual(await readFile(target), original);
  await assert.rejects(
    writePdfAtomically(destination, Buffer.from('new PDF'), () => { throw new Error('injected pre-commit failure'); }),
    (error: unknown) => error instanceof AmxError && error.code === 'AMX6002'
  );
  assert.deepEqual(await readFile(target), original);
  assert.deepEqual((await readdir(root)).sort(), ['report.amx', 'report.pdf']);
  console.log(JSON.stringify({
    status: 'passed-serialization-and-atomic-writer-failure-probes',
    injectedFailures: ['pdfmake rejects malformed SVG before atomic writer invocation', 'atomic writer pre-commit hook throws AMX6002'],
    targetUnchanged: true,
    temporaryOutputRemains: false,
    limitation: 'valid ECharts output failure and production diagnostics are not injected through the public chart adapter'
  }));
} finally {
  await rm(root, { recursive: true, force: true });
}