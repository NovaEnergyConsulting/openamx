import * as echarts from 'echarts';

const cases = [
  { id: 'bar', kind: 'bar', xAxis: { type: 'value', name: 'MVA' }, yAxis: { type: 'category', inverse: true, data: ['Pump A', 'Pump A', 'Pump C'] }, series: [{ type: 'bar', name: 'Nameplate (MVA)', data: [4, 0, -2] }] },
  { id: 'column', kind: 'column', xAxis: { type: 'category', data: ['North', 'South', 'East'] }, yAxis: { type: 'value', name: 'Flow (m3/h)' }, series: [{ type: 'bar', name: 'Flow (m3/h)', data: [4, null, -2] }] },
  { id: 'line', kind: 'line', xAxis: { type: 'value', name: 'Step' }, yAxis: [{ type: 'value', name: 'Power (kW)' }, { type: 'value', name: 'Output (MW)' }], series: [{ type: 'line', name: 'Power (kW)', yAxisIndex: 0, connectNulls: false, data: [[1, 4], [2, null], [3, 0]] }, { type: 'line', name: 'Output (MW)', yAxisIndex: 1, connectNulls: false, data: [[1, 1], [2, 2], [3, 3]] }] },
  { id: 'datetime', kind: 'line', xAxis: { type: 'time', name: 'Measured at' }, yAxis: { type: 'value', name: 'Score' }, series: [{ type: 'line', name: 'Score', connectNulls: false, data: [['2026-01-02T00:00:00Z', 4], ['2026-01-01T00:00:00Z', null], ['2026-01-01T00:00:00Z', 2]] }] },
  { id: 'hostile', kind: 'bar', title: '<img src=x onerror=window.__chartPayloadExecuted=1>', xAxis: { type: 'value' }, yAxis: { type: 'category', data: ['<img src=x onerror=window.__chartPayloadExecuted=1>'] }, series: [{ type: 'bar', name: '<img src=x onerror=window.__chartPayloadExecuted=1>', data: [4] }] },
  { id: 'all-null', kind: 'line', xAxis: { type: 'category', data: ['A', 'B'] }, yAxis: { type: 'value' }, series: [{ type: 'line', name: 'Empty series', connectNulls: false, data: [null, null] }] },
  { id: 'scatter-null', kind: 'scatter', xAxis: { type: 'value' }, yAxis: { type: 'value' }, series: [{ type: 'scatter', name: 'Null coordinates', data: [[0, 0], [1, null], [null, 2], [2, 2]] }] },
  { id: 'scatter', kind: 'scatter', xAxis: { type: 'value', name: 'x' }, yAxis: { type: 'value', name: 'y' }, series: [{ type: 'scatter', name: 'Group A', data: [[0, 0], [1, 1], [1, 1]] }, { type: 'scatter', name: 'Group B', data: [[-1, 3]] }] }
];

for (const item of cases) {
  const element = document.createElement('div');
  element.id = item.id;
  element.style.cssText = 'width:min(720px,calc(100vw - 24px));height:360px;margin:12px auto';
  document.body.append(element);
  const chart = echarts.init(element, null, { renderer: 'canvas' });
  chart.setOption({
    animation: false,
    title: item.title ? { text: item.title } : undefined,
    aria: { enabled: true, decal: { show: false } },
    tooltip: { trigger: item.kind === 'scatter' || item.id === 'hostile' ? 'item' : 'axis' },
    legend: { show: true },
    dataZoom: item.kind === 'scatter' || item.kind === 'line' ? [{ type: 'inside', start: 0, end: 100 }] : [],
    xAxis: item.xAxis,
    yAxis: item.yAxis,
    series: item.series
  });
  (window as typeof window & { probeCharts?: Record<string, echarts.ECharts> }).probeCharts ??= {};
  (window as typeof window & { probeCharts: Record<string, echarts.ECharts> }).probeCharts[item.id] = chart;
}
document.querySelector('#reset-zoom')?.addEventListener('click', () => {
  for (const chart of Object.values((window as typeof window & { probeCharts: Record<string, echarts.ECharts> }).probeCharts)) {
    chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
  }
});
const emptyElement = document.createElement('div');
emptyElement.id = 'empty';
emptyElement.style.cssText = 'width:min(720px,calc(100vw - 24px));height:180px;margin:12px auto';
document.body.append(emptyElement);
const emptyChart = echarts.init(emptyElement, null, { renderer: 'canvas' });
emptyChart.setOption({ animation: false, aria: { enabled: true }, xAxis: { type: 'category', data: [] }, yAxis: { type: 'value' }, series: [{ type: 'bar', name: 'No observations', data: [] }] });
(window as typeof window & { probeCharts: Record<string, echarts.ECharts> }).probeCharts.empty = emptyChart;
if (window.parent !== window) {
  let parentReadDenied = false;
  try {
    void (window.parent as typeof window & { __probeSecret?: string }).__probeSecret;
  } catch {
    parentReadDenied = true;
  }
  window.parent.postMessage({ type: 'sprint060-sandbox-probe', parentReadDenied, bridgeVisible: 'openamxBridge' in window }, '*');
}
document.documentElement.dataset.ready = String(cases.length + 1);