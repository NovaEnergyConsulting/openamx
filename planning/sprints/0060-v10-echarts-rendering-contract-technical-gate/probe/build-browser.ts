import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const nonce = crypto.randomUUID().replaceAll('-', '');
const result = await Bun.build({
  entrypoints: [resolve(import.meta.dir, 'browser-entry.ts')],
  target: 'browser',
  format: 'iife',
  minify: true
});
if (!result.success) throw new AggregateError(result.logs, 'Browser probe bundle failed.');
const bundle = await result.outputs[0]!.text();
const payload = JSON.stringify({ title: '<img src=x onerror=window.__payloadAttack=1>', description: '<script>window.__payloadAttack=2</script>', label: '</script><script>window.__payloadAttack=3</script>', value: '<svg onload=window.__payloadAttack=4>' })
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none';"><title>Sprint 060 offline chart probe</title><style>body{font:14px sans-serif}h1{font-size:18px}#charts{max-width:760px;margin:auto}#empty{position:relative}#empty-state{position:absolute;inset:45% 0 auto;text-align:center}@media print{canvas{max-width:100%;break-inside:avoid}.chart-interactive{display:none}}</style></head><body><main id="charts"><h1>Offline ECharts probe</h1><div id="untrusted"><img src="https://example.invalid/narrative" onerror="window.__narrativeAttack=1"><script>window.__narrativeAttack=2</script></div><button type="button" id="reset-zoom">Reset zoom</button><img id="event-attack" src="data:," onerror="window.__eventAttributeAttack=1"><script type="application/json" id="chart-payload">${payload}</script><table id="complete-data" aria-label="Complete chart data"><caption>All captured values, independent of chart state</caption><thead><tr><th>Series</th><th>Point order</th><th>Value</th><th>Unit</th></tr></thead><tbody><tr><td>Power</td><td>1</td><td>4</td><td>kW</td></tr><tr><td>Power</td><td>2</td><td>0</td><td>kW</td></tr><tr><td>Power</td><td>3</td><td></td><td>kW</td></tr></tbody></table><div id="empty"><p id="empty-state">No data</p></div></main><script nonce="${nonce}">${bundle}</script></body></html>`;
const output = resolve(import.meta.dir, 'artifacts/charts.html');
await mkdir(dirname(output), { recursive: true });
await Bun.write(output, html);
console.log(JSON.stringify({ htmlBytes: Buffer.byteLength(html), bundleBytes: Buffer.byteLength(bundle), output }));