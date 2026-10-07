import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as echarts from 'echarts';

const cases = [
  { label: 'small', points: 20 },
  { label: 'typical', points: 1000 },
  { label: 'bounded-large', points: 5000 }
];
const results = [];
for (const item of cases) {
  const data = Array.from({ length: item.points }, (_value, index) => [
    `Point ${String(index + 1).padStart(5, '0')}`,
    index % 31 === 0 ? null : ((index * 37) % 2000) - 1000
  ] as [string, number | null]);
  const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 640, height: 360 });
  const timings: number[] = [];
  let firstSvg = '';
  let normalizedFirstSvg = '';
  const rawHashes = new Set<string>();
  for (let iteration = 0; iteration < 4; iteration++) {
    const start = performance.now();
    chart.setOption({ animation: false, xAxis: { type: 'category', data: data.map(row => row[0]) }, yAxis: { type: 'value' }, series: [{ type: 'line', connectNulls: false, data: data.map(row => row[1]) }] }, true);
    const svg = chart.renderToSVGString();
    timings.push(performance.now() - start);
    const normalizedSvg = svg.replace(/zr\d+-cls-\d+/g, 'zrN-cls-N').replace(/zr\d+-c\d+/g, 'zrN-cN');
    rawHashes.add(createHash('sha256').update(svg).digest('hex'));
    if (iteration === 0) {
      firstSvg = svg;
      normalizedFirstSvg = normalizedSvg;
    } else {
      assert.equal(normalizedSvg, normalizedFirstSvg, `SVG structure changed at iteration ${iteration} for ${item.label}`);
    }
  }
  chart.dispose();
  results.push({
    ...item,
    svgBytes: Buffer.byteLength(firstSvg),
    svgSha256: createHash('sha256').update(firstSvg).digest('hex'),
    rawOutputStable: rawHashes.size === 1,
    normalizedStructureStable: true,
    tableJsonBytes: Buffer.byteLength(JSON.stringify(data)),
    renderMs: timings,
    repeatedOutputStable: true
  });
}

const multiStart = performance.now();
const multiCharts = Array.from({ length: 4 }, () => echarts.init(null, null, { renderer: 'svg', ssr: true, width: 640, height: 360 }));
const multiBytes = multiCharts.map((chart, chartIndex) => {
  chart.setOption({ animation: false, xAxis: { type: 'category', data: ['A', 'B', 'C'] }, yAxis: { type: 'value' }, series: [{ type: 'line', data: [chartIndex, chartIndex + 1, chartIndex + 2] }] });
  return Buffer.byteLength(chart.renderToSVGString());
});
multiCharts.forEach(chart => chart.dispose());
const result = {
  echarts: echarts.version,
  environment: `Bun ${Bun.version}; ${process.platform} ${process.arch}`,
  viewport: '640x360 SVG SSR',
  cases: results,
  multipleCharts: { count: multiCharts.length, svgBytes: multiBytes, totalMs: performance.now() - multiStart }
};
assert.ok(results.every(item => item.normalizedStructureStable));
await Bun.write(new URL('./artifacts/benchmark.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));