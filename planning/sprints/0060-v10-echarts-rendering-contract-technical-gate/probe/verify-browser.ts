import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(resolve(import.meta.dir, '../../../../desktop-app/package.json'));
const { chromium } = require('@playwright/test');
const browser = await chromium.launch({
  headless: true,
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND']
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const externalRequests: string[] = [];
const externalRequestFailures: Array<{ url: string; error?: string }> = [];
const cspViolations: string[] = [];
page.on('request', request => {
  if (!request.url().startsWith('file:')) externalRequests.push(request.url());
});
page.on('requestfailed', request => {
  if (!request.url().startsWith('file:')) externalRequestFailures.push({ url: request.url(), error: request.failure()?.errorText });
});
page.on('console', message => {
  if (message.type() === 'error' && message.text().includes('Content Security Policy')) cspViolations.push(message.text());
});
await page.goto(pathToFileURL(resolve(import.meta.dir, 'artifacts/charts.html')).href);
await page.waitForFunction(() => document.documentElement.dataset.ready === '9');
const originalAriaLine = await page.locator('#line').getAttribute('aria-label');
const originalAriaDateTime = await page.locator('#datetime').getAttribute('aria-label');
await page.evaluate(async () => {
  const charts = (window as typeof window & { probeCharts: Record<string, import('echarts').ECharts> }).probeCharts;
  charts.line.dispatchAction({ type: 'dataZoom', start: 25, end: 75 });
  charts.line.dispatchAction({ type: 'legendToggleSelect', name: 'Power (kW)' });
  charts.hostile.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
  await new Promise(resolve => setTimeout(resolve, 200));
  for (const chart of Object.values(charts)) chart.resize();
});
const desktop = await page.evaluate(() => {
  const charts = (window as typeof window & { probeCharts: Record<string, import('echarts').ECharts> }).probeCharts;
  const line = charts.line;
  const timeData = charts.datetime.getOption().series[0]!.data as [string, number | null][];
  const barCategories = charts.bar.getOption().yAxis?.[0]?.data;
  return {
    chartCount: Object.keys(charts).length,
    canvases: document.querySelectorAll('canvas').length,
    zoom: [line.getOption().dataZoom?.[0]?.start, line.getOption().dataZoom?.[0]?.end],
    legendSelected: line.getOption().legend?.[0]?.selected?.['Power (kW)'],
    timeOrder: timeData.map(value => value[0]),
    timeNull: timeData[1]?.[1] === null,
    duplicateScatter: charts.scatter.getOption().series[0]!.data[1]![0] === charts.scatter.getOption().series[0]!.data[2]![0],
    allNullData: charts['all-null'].getOption().series[0]!.data,
    scatterNullData: charts['scatter-null'].getOption().series[0]!.data,
    emptyData: charts.empty.getOption().series[0]!.data,
    barCategories,
    hostileNodes: document.querySelectorAll('#hostile img, #hostile script').length,
    payloadExecuted: (window as typeof window & { __chartPayloadExecuted?: boolean }).__chartPayloadExecuted === true,
    fullDataRows: document.querySelectorAll('#complete-data tbody tr').length,
    emptyState: document.querySelector('#empty-state')?.textContent,
    width: document.querySelector('#bar')?.clientWidth
  };
});
assert.equal(desktop.chartCount, 9);
assert.ok(desktop.canvases >= 9);
assert.deepEqual(desktop.zoom, [25, 75]);
assert.equal(desktop.legendSelected, false);
await page.locator('#reset-zoom').click();
assert.deepEqual(await page.evaluate(() => {
  const chart = (window as typeof window & { probeCharts: Record<string, import('echarts').ECharts> }).probeCharts.line;
  return [chart.getOption().dataZoom?.[0]?.start, chart.getOption().dataZoom?.[0]?.end];
}), [0, 100]);
assert.deepEqual(desktop.timeOrder, ['2026-01-02T00:00:00Z', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z']);
assert.equal(desktop.timeNull, true);
assert.equal(desktop.duplicateScatter, true);
assert.deepEqual(desktop.allNullData, [null, null]);
assert.deepEqual(desktop.scatterNullData, [[0, 0], [1, null], [null, 2], [2, 2]]);
assert.deepEqual(desktop.emptyData, []);
assert.deepEqual(desktop.barCategories, ['Pump A', 'Pump A', 'Pump C']);
assert.match(originalAriaLine ?? '', /NaN/);
assert.match(originalAriaDateTime ?? '', /1767/);
assert.equal(desktop.hostileNodes, 0);
assert.equal(desktop.payloadExecuted, false);
assert.equal(desktop.fullDataRows, 3);
assert.equal(desktop.emptyState, 'No data');
const payload = JSON.parse((await page.locator('#chart-payload').textContent()) ?? 'null');
assert.equal(payload.title, '<img src=x onerror=window.__payloadAttack=1>');
assert.equal(await page.evaluate(() => (window as typeof window & { __payloadAttack?: number }).__payloadAttack), undefined);
assert.deepEqual(externalRequests, ['https://example.invalid/narrative']);
assert.ok(externalRequestFailures.some(item => item.url === 'https://example.invalid/narrative' && item.error?.toLowerCase().includes('csp')));
assert.ok(cspViolations.length > 0, 'CSP must block the hostile event attribute');
await page.screenshot({ path: resolve(import.meta.dir, 'artifacts/charts-browser.png'), fullPage: true });
await page.emulateMedia({ media: 'print' });
assert.equal(await page.locator('#complete-data').isVisible(), true);
await page.emulateMedia({ media: 'screen' });
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => {
  for (const chart of Object.values((window as typeof window & { probeCharts: Record<string, import('echarts').ECharts> }).probeCharts)) chart.resize();
});
const mobileWidth = await page.locator('#bar').evaluate(element => element.clientWidth);
assert.ok(mobileWidth <= 390 && mobileWidth >= 300);
await page.screenshot({ path: resolve(import.meta.dir, 'artifacts/charts-browser-mobile.png'), fullPage: true });

const html = await Bun.file(resolve(import.meta.dir, 'artifacts/charts.html')).text();
await page.goto('about:blank');
const sandboxResult = await page.evaluate(async reportHtml => new Promise<{ parentReadDenied: boolean; bridgeVisible: boolean }>((resolveResult, reject) => {
  const timeout = setTimeout(() => reject(new Error('sandbox bootstrap did not report')), 5000);
  (window as typeof window & { __probeSecret: string; openamxBridge: object }).__probeSecret = 'parent-private';
  (window as typeof window & { openamxBridge: object }).openamxBridge = {};
  window.addEventListener('message', event => {
    if (event.data?.type !== 'sprint060-sandbox-probe') return;
    clearTimeout(timeout);
    resolveResult(event.data);
  });
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.srcdoc = reportHtml.replace('</main>', '<a id="navigation-probe" href="https://example.invalid/sprint060">external navigation probe</a></main>');
  document.body.append(frame);
}), html);
assert.equal(sandboxResult.parentReadDenied, true);
assert.equal(sandboxResult.bridgeVisible, false);
const navigationRequest = page.waitForRequest(request => request.url() === 'https://example.invalid/sprint060');
await page.frameLocator('iframe').locator('#navigation-probe').click();
await navigationRequest;
const navigationEscape = { requestObserved: externalRequests.includes('https://example.invalid/sprint060'), parentUrlUnchanged: page.url() === 'about:blank' };
assert.equal(navigationEscape.requestObserved, true);
assert.equal(navigationEscape.parentUrlUnchanged, true);
const refreshRequest = page.waitForRequest(request => request.url() === 'https://example.invalid/meta-refresh');
await page.evaluate(() => {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; connect-src 'none'; navigate-to 'none'"><meta http-equiv="refresh" content="0;url=https://example.invalid/meta-refresh">`;
  document.body.append(frame);
});
await refreshRequest;
const externalCountBeforeForm = externalRequests.length;
await page.evaluate(() => {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; connect-src 'none'; form-action 'none'; navigate-to 'none'"><form action="https://example.invalid/form"><button>submit</button></form>`;
  document.body.append(frame);
});
await page.frameLocator('iframe').last().locator('button').click();
await page.waitForTimeout(300);
const formBlocked = externalRequests.length === externalCountBeforeForm;
assert.equal(formBlocked, true);
const navigationControls = {
  clickLinkRequest: navigationEscape.requestObserved,
  metaRefreshRequest: externalRequests.includes('https://example.invalid/meta-refresh'),
  formRequestBlocked: formBlocked,
  requests: externalRequests
};
assert.equal(navigationControls.metaRefreshRequest, true);
console.log(JSON.stringify({ status: 'passed-with-network-navigation-finding', browser: 'Chromium 152.0.7977.82', desktop, mobileWidth, externalRequestsBeforeSandbox: externalRequests.slice(0, 1), blockedRequests: externalRequestFailures, cspViolations: cspViolations.length, sandboxResult, navigationEscape, navigationControls }));
await browser.close();