import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import * as echarts from 'echarts';

const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 640, height: 360 });
chart.setOption({
  xAxis: { type: 'category', data: ['A', 'B'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [1, null], connectNulls: false }]
});
const svg = chart.renderToSVGString();
assert.match(svg, /^<svg[\s>]/);
assert.match(svg, /<path/);
assert.match(svg, /A/);
const output = resolve(import.meta.dir, 'artifacts/ssr.svg');
await mkdir(dirname(output), { recursive: true });
await Bun.write(output, svg);
chart.dispose();
console.log(JSON.stringify({ echarts: echarts.version, svgBytes: Buffer.byteLength(svg), output }));