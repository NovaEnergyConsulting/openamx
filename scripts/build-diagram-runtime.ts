import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const entrypoint = fileURLToPath(new URL('../src/renderer/diagramBrowserEntry.ts', import.meta.url));
const sourceBundle = fileURLToPath(new URL('../src/renderer/diagramBrowserRuntime.ts', import.meta.url));
const result = await Bun.build({
  entrypoints: [entrypoint],
  target: 'browser',
  format: 'iife',
  minify: true,
  write: false
});
if (!result.success) throw new AggregateError(result.logs, 'Unable to build the offline diagram runtime.');
const bundle = result.outputs[0];
if (!bundle) throw new Error('The offline diagram runtime build produced no output.');
const contents = await bundle.text();
const generated = `const diagramBrowserRuntime = ${JSON.stringify(contents)};\nexport default diagramBrowserRuntime;\n`;
const current = existsSync(sourceBundle) ? await readFile(sourceBundle, 'utf8') : undefined;
if (current === undefined || current.replace(/\r\n/g, '\n') !== generated) {
  await mkdir(fileURLToPath(new URL('../src/renderer', import.meta.url)), { recursive: true });
  await Bun.write(sourceBundle, generated);
}
