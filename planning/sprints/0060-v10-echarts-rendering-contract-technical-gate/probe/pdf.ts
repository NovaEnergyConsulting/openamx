import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import pdfmake from 'pdfmake';
import * as echarts from 'echarts';

const charts = [
  { title: 'bar', options: { xAxis: { type: 'value' }, yAxis: { type: 'category', inverse: true, data: ['Pump A', 'Pump A', 'Pump C'] }, series: [{ type: 'bar', name: 'Nameplate (MVA)', data: [4, 0, -2] }] } },
  { title: 'column', options: { xAxis: { type: 'category', data: ['North', 'South', 'East'] }, yAxis: { type: 'value', name: 'Flow (m3/h)' }, series: [{ type: 'bar', name: 'Flow (m3/h)', data: [4, null, -2] }] } },
  { title: 'line', options: { xAxis: { type: 'value' }, yAxis: [{ type: 'value', name: 'Power (kW)' }, { type: 'value', name: 'Output (MW)' }], series: [{ type: 'line', name: 'Power (kW)', yAxisIndex: 0, connectNulls: false, data: [[1, 4], [2, null], [3, 0]] }, { type: 'line', name: 'Output (MW)', yAxisIndex: 1, connectNulls: false, data: [[1, 1], [2, 2], [3, 3]] }] } },
  { title: 'datetime', options: { xAxis: { type: 'time', name: 'Measured at' }, yAxis: { type: 'value', name: 'Score' }, series: [{ type: 'line', name: 'Score', connectNulls: false, data: [['2026-01-02T00:00:00Z', 4], ['2026-01-01T00:00:00Z', null], ['2026-01-01T00:00:00Z', 2]] }] } },
  { title: 'scatter', options: { xAxis: { type: 'value', name: 'x' }, yAxis: { type: 'value', name: 'y' }, series: [{ type: 'scatter', name: 'Group A', data: [[0, 0], [1, 1], [1, 1]] }, { type: 'scatter', name: 'Group B', data: [[-1, 3]] }] } }
];
const svgs = charts.map(({ title, options }) => {
  const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 640, height: 240 });
  chart.setOption({ animation: false, legend: { show: true }, ...options });
  const svg = chart.renderToSVGString();
  chart.dispose();
  assert.match(svg, /<svg/);
  assert.ok(svg.length > 1000);
  return { title, svg };
});
const probeDir = resolve(import.meta.dir);
const fontRoot = resolve(probeDir, '../../../../node_modules/pdfmake/fonts/Roboto');
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(path => path.startsWith(fontRoot));
pdfmake.setFonts({ Roboto: {
  normal: resolve(fontRoot, 'Roboto-Regular.ttf'),
  bold: resolve(fontRoot, 'Roboto-Medium.ttf'),
  italics: resolve(fontRoot, 'Roboto-Italic.ttf'),
  bolditalics: resolve(fontRoot, 'Roboto-MediumItalic.ttf')
} });
const pdf = pdfmake.createPdf({
  info: { title: 'Sprint 060 ECharts PDF probe' },
  pageSize: 'A4', pageMargins: [51, 51, 51, 51],
  defaultStyle: { font: 'Roboto' },
  content: [
    { text: 'Static ECharts probe' },
    ...svgs.flatMap(({ title, svg }) => [{ text: title }, { svg, width: 470, height: 176 }]),
    { text: 'Pump A 4; Pump A 0; Pump C -2; North 4; South null; East -2' }
  ]
});
const bytes = Uint8Array.from(await pdf.getBuffer());
assert.equal(String.fromCharCode(...bytes.subarray(0, 5)), '%PDF-');
const output = resolve(import.meta.dir, 'artifacts/charts.pdf');
await mkdir(resolve(output, '..'), { recursive: true });
await Bun.write(output, bytes);
console.log(JSON.stringify({ echarts: echarts.version, pdfmake: '0.3.11', charts: svgs.map(item => ({ title: item.title, svgBytes: Buffer.byteLength(item.svg) })), pdfBytes: bytes.byteLength, output }));