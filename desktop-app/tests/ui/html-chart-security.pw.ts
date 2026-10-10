import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

test.use({ hasTouch: true });

const repositoryRoot = resolve(import.meta.dirname, "../../..");
const hostileNarrative = `![offline narrative image](./offline.png)\n\n[visible external link](https://openamx-sprint062.invalid/link)\n\n[local destination](./offline.png) [relative destination](../outside.html) [data HTML](data:text/html,%3Cscript%3Ealert(1)%3C/script%3E)\n\n<a href="javascript:alert(1)" target="_top" onclick="window.__authoredScript=1">raw link text</a>\n\n<meta http-equiv="refresh" content="0;url=https://openamx-sprint062.invalid/refresh">\n<script>window.__authoredScript=2</script>\n<style>@import url(https://openamx-sprint062.invalid/style.css)</style>\n<img src="https://openamx-sprint062.invalid/image.png" alt="remote image">\n<form action="https://openamx-sprint062.invalid/submit"><button>form text</button></form>\n<iframe src="https://openamx-sprint062.invalid/frame">frame text</iframe><object data="https://openamx-sprint062.invalid/object">object text</object><embed src="https://openamx-sprint062.invalid/embed">\n<svg><use href="https://openamx-sprint062.invalid/icon.svg#icon"></use></svg>`;

function createRenderedFixture(directory: string): string {
	const sourcePath = resolve(repositoryRoot, "examples/kitchen-sink.amx");
	const outputPath = resolve(directory, "report.html");
	const previewPath = resolve(directory, "preview.html");
	const previewTokenPath = resolve(directory, "preview-token.txt");
	const navigationPath = resolve(directory, "navigation-preview.html");
	const navigationTokenPath = resolve(directory, "navigation-preview-token.txt");
	const hostileChartText = "</script><img src=x onerror=window.__chartAttack=1>";
	const code = `import { readFileSync, writeFileSync } from "node:fs"; import { resolve } from "node:path"; import { parseDocumentText } from "./src/parser/parseDocument.ts"; import { evaluateDocumentEnvironment } from "./src/runtime/evaluateDocument.ts"; import { loadEntryModule } from "./src/runtime/moduleLoader.ts"; import { prepareReport } from "./src/renderer/reportPreparation.ts"; import { renderPreparedHtml } from "./src/renderer/renderHtml.ts"; const source=readFileSync(${JSON.stringify(sourcePath)},"utf8").replace("Record bar chart",${JSON.stringify(hostileChartText)}).replace('series score as "Score"',${JSON.stringify(`series score as "${hostileChartText}"`)}); const loaded=await loadEntryModule(${JSON.stringify(sourcePath)},{entryText:source}); const preparedSourcePath=resolve(${JSON.stringify(directory)},"report.amx"); writeFileSync(resolve(${JSON.stringify(directory)},"offline.png"),Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64")); loaded.doc.nodes.push({type:"narrative",content:${JSON.stringify(hostileNarrative)}}); const prepared=await prepareReport(loaded.doc,loaded.env,{file:preparedSourcePath,projectRoot:${JSON.stringify(directory)}}); writeFileSync(${JSON.stringify(outputPath)},renderPreparedHtml(prepared,{mode:"standalone",sourceDocumentPath:preparedSourcePath,projectRoot:${JSON.stringify(directory)},outputPath:${JSON.stringify(outputPath)}})); const preview=renderPreparedHtml(prepared,{mode:"preview"}); writeFileSync(${JSON.stringify(previewPath)},preview.html); writeFileSync(${JSON.stringify(previewTokenPath)},preview.previewToken); const navigationDocument=parseDocumentText(${JSON.stringify(`# Navigation-only preview

[Safe external](https://generated-only.invalid/safe) [Local file](./offline.png) [Internal anchor](#anchor)

![Offline image](./offline.png)

## Anchor`)}); const navigationReport=await prepareReport(navigationDocument,evaluateDocumentEnvironment(navigationDocument),{file:preparedSourcePath,projectRoot:${JSON.stringify(directory)}}); const navigation=renderPreparedHtml(navigationReport,{mode:"preview"}); writeFileSync(${JSON.stringify(navigationPath)},navigation.html); writeFileSync(${JSON.stringify(navigationTokenPath)},navigation.previewToken);`;
	execFileSync("bun", ["-e", code], { cwd: repositoryRoot, stdio: "pipe" });
	return { previewPath, previewTokenPath, navigationPath, navigationTokenPath };
}

async function outboundRequests(page: Page, action: () => Promise<void>): Promise<string[]> {
	const attempted: string[] = [];
	const onRequest = (request: import("@playwright/test").Request) => {
		if (!request.url().startsWith("file:") && !request.url().startsWith("http://127.0.0.1:4183/")) attempted.push(request.url());
	};
	page.on("request", onRequest);
	await action();
	await page.waitForTimeout(250);
	page.off("request", onRequest);
	return attempted;
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
	await page.screenshot({ path: testInfo.outputPath(name), fullPage: true, animations: "disabled" });
}

test("standalone and desktop preview render offline charts without authored navigation", async ({ page }, testInfo) => {
	const directory = mkdtempSync(resolve(tmpdir(), "openamx-sprint062-"));
	try {
		const { previewPath, previewTokenPath, navigationPath, navigationTokenPath } = createRenderedFixture(directory);
		const htmlPath = resolve(directory, "report.html");
		const html = readFileSync(htmlPath, "utf8");
		const previewHtml = readFileSync(previewPath, "utf8");
		const previewToken = readFileSync(previewTokenPath, "utf8");
		const navigationHtml = readFileSync(navigationPath, "utf8");
		const navigationToken = readFileSync(navigationTokenPath, "utf8");
		const browserErrors: string[] = [];
		page.on("pageerror", error => browserErrors.push(error.message));
		page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
		const attempted = await outboundRequests(page, async () => {
			await page.goto(pathToFileURL(htmlPath).href);
			await page.waitForTimeout(250);
			console.log(JSON.stringify({ browserErrors, chartNodes: await page.locator("[data-openamx-chart]").count(), canvases: await page.locator(".openamx-chart-plot canvas").count() }));
			await expect(page.locator(".openamx-chart-plot canvas"), browserErrors.join("\n")).toHaveCount(10);
		});
		expect(attempted).toEqual([]);
		await expect(page.locator("img.openamx-narrative-image")).toHaveCount(1);
		expect(await page.locator("img.openamx-narrative-image").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(1);
		expect(await page.locator("[data-openamx-chart]").count()).toBe(10);
		expect(await page.locator(".openamx-chart-data tbody tr").count()).toBeGreaterThan(100);
		const scatterPayload = await page.locator('[data-chart-model]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent ?? "null")).find(model => model.kind === "scatter"));
		expect(scatterPayload.option.dataZoom[0].xAxisIndex).toBe(0);
		expect(scatterPayload.option.dataZoom[0].yAxisIndex).toBe(0);
		expect(await page.locator('a[href^="https:"],a[href^="http:"]').count()).toBeGreaterThan(0);
		expect(await page.locator('a[href^="javascript:"],a[href^="data:"],a[href^="file:"]').count()).toBe(0);
		expect(await page.locator('meta[http-equiv="refresh"],script:not([nonce]):not([type="application/json"]),img[src^=http],form,svg use[href]').count()).toBe(0);
		expect(html).not.toContain("../outside.html");
		expect(await page.locator("iframe,object,embed").count()).toBe(0);
		expect(await page.evaluate(() => (window as Window & { __authoredScript?: number }).__authoredScript)).toBeUndefined();
		expect(await page.getByText("visible external link").count()).toBe(1);
		const hostileChart = page.locator("[data-openamx-chart]").first();
		const chartPayload = JSON.parse((await hostileChart.locator("[data-chart-model]").textContent()) ?? "null");
		expect(chartPayload.title).toContain("</script>");
		const hostileChartDom = await page.locator("body").evaluate(() => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { dispatchAction: (action: object) => void } | undefined } }).echarts;
			const plot = document.querySelector(".openamx-chart-plot")!;
			chart.getInstanceByDom(plot)?.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: 0 });
			return { attackRan: (window as Window & { __chartAttack?: number }).__chartAttack, injectedImages: document.querySelectorAll(".echarts-tooltip img, .openamx-chart img").length };
		});
		expect(hostileChartDom).toEqual({ attackRan: undefined, injectedImages: 0 });
		await expect(page.getByRole("button", { name: "Zoom in" }).first()).toBeVisible();
		const rowsBefore = await page.locator(".openamx-chart-data tbody tr").count();
		const numericLine = page.locator(".openamx-chart-plot").nth(2);
		const initialZoom = await numericLine.evaluate(plot => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { getOption: () => { dataZoom: Array<{ start: number; end: number }> } } } }).echarts.getInstanceByDom(plot)!;
			return [chart.getOption().dataZoom[0].start, chart.getOption().dataZoom[0].end];
		});
		const zoomIn = page.getByRole("button", { name: "Zoom in" }).first();
		await zoomIn.focus();
		await page.keyboard.press("Enter");
		const keyboardZoom = await numericLine.evaluate(plot => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { getOption: () => { dataZoom: Array<{ start: number; end: number }> } } } }).echarts.getInstanceByDom(plot)!;
			return [chart.getOption().dataZoom[0].start, chart.getOption().dataZoom[0].end];
		});
		expect(keyboardZoom[0]).toBeGreaterThan(initialZoom[0]);
		expect(keyboardZoom[1]).toBeLessThan(initialZoom[1]);
		const plotBounds = await numericLine.boundingBox();
		if (!plotBounds) throw new Error("Numeric line chart plot has no layout bounds.");
		await page.mouse.move(plotBounds.x + plotBounds.width / 2, plotBounds.y + plotBounds.height / 2);
		await page.mouse.wheel(0, -120);
		const pointerZoom = await expect.poll(() => numericLine.evaluate(plot => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { getOption: () => { dataZoom: Array<{ start: number; end: number }> } } } }).echarts.getInstanceByDom(plot)!;
			return [chart.getOption().dataZoom[0].start, chart.getOption().dataZoom[0].end];
		})).not.toEqual(keyboardZoom);
		await page.mouse.move(plotBounds.x + plotBounds.width * 0.6, plotBounds.y + plotBounds.height * 0.55);
		await page.mouse.down();
		await page.mouse.move(plotBounds.x + plotBounds.width * 0.4, plotBounds.y + plotBounds.height * 0.55, { steps: 4 });
		await page.mouse.up();
		await expect.poll(() => numericLine.evaluate(plot => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { getOption: () => { dataZoom: Array<{ start: number; end: number }> } } } }).echarts.getInstanceByDom(plot)!;
			return [chart.getOption().dataZoom[0].start, chart.getOption().dataZoom[0].end];
		})).not.toEqual(pointerZoom);
		await page.getByRole("button", { name: "Zoom in" }).first().click();
		const zoomed = await numericLine.evaluate(plot => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { getOption: () => { dataZoom: Array<{ start: number; end: number }> } } } }).echarts.getInstanceByDom(plot)!;
			return [chart.getOption().dataZoom[0].start, chart.getOption().dataZoom[0].end];
		});
		expect(zoomed[0]).toBeGreaterThan(initialZoom[0]);
		expect(zoomed[1]).toBeLessThan(initialZoom[1]);
		await page.getByRole("button", { name: "Reset zoom" }).first().click();
		const resetZoom = await numericLine.evaluate(plot => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { getOption: () => { dataZoom: Array<{ start: number; end: number }> } } } }).echarts.getInstanceByDom(plot)!;
			return [chart.getOption().dataZoom[0].start, chart.getOption().dataZoom[0].end];
		});
		expect(resetZoom).toEqual([0, 100]);
		const legend = page.locator(".openamx-legend-toggle").first();
		await legend.click();
		await expect(legend).toHaveAttribute("aria-pressed", "false");
		await expect(page.locator(".openamx-chart-data tbody tr")).toHaveCount(rowsBefore);
		await page.emulateMedia({ media: "print" });
		await expect(page.locator(".openamx-chart-data").first()).toBeVisible();
		await expect(page.locator(".openamx-chart-controls").first()).toBeHidden();
		await expect(page.locator(".openamx-chart-plot canvas").first()).toBeVisible();
		await capture(page, testInfo, "sprint062-standalone-print.png");
		await page.emulateMedia({ media: "screen" });
		await capture(page, testInfo, "sprint062-standalone-wide.png");
		await page.setViewportSize({ width: 390, height: 844 });
		await expect(page.locator(".openamx-chart-plot canvas")).toHaveCount(10);
		await capture(page, testInfo, "sprint062-standalone-narrow.png");

		await page.goto("/");
		await page.getByRole("button", { name: "Open project" }).click();
		expect(await page.locator('iframe[title="OpenAMX live HTML preview"]').count()).toBe(1);
		const frame = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
		await expect(frame).toHaveAttribute("sandbox", "allow-scripts");
		const previewAttempts = await outboundRequests(page, async () => {
			await frame.evaluate((element, srcdoc) => { (element as HTMLIFrameElement).srcdoc = srcdoc; }, previewHtml);
			await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last().locator(".openamx-chart-data").first()).toBeVisible();
		});
		expect(previewAttempts).toEqual([]);
		const previewFrame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
		await expect(previewFrame.locator("a[data-openamx-target][href='#']")).toHaveCount(2);
		await expect(previewFrame.locator('a[href^="https:"],a[href^="http:"],a[href^="file:"]')).toHaveCount(0);
		await expect(previewFrame.locator("img.openamx-narrative-image")).toHaveCount(1);
		expect(await previewFrame.locator("img.openamx-narrative-image").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(1);
		expect(previewHtml).not.toContain("openamx-sprint062.invalid/link");
		expect(previewHtml).not.toContain("../outside.html");
		expect(previewHtml).toMatch(/script-src 'nonce-[^']+'/);
		const generatedPage = await page.context().newPage();
		const generatedOutbound: string[] = [];
		generatedPage.on("request", request => { if (!request.url().startsWith("data:")) generatedOutbound.push(request.url()); });
		const navigationMessages: unknown[] = [];
		await generatedPage.setContent('<iframe id="generated-preview" sandbox="allow-scripts"></iframe>');
		await generatedPage.evaluate(({ srcdoc, token }) => {
			const frame = document.querySelector<HTMLIFrameElement>("#generated-preview")!;
			const channel = new MessageChannel();
			(window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages = [];
			channel.port1.onmessage = event => (window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages.push(event.data);
			channel.port1.start();
			frame.addEventListener("load", () => {
				frame.contentWindow!.postMessage({ type: "openamx-preview-init", previewToken: token }, "*", [channel.port2]);
			}, { once: true });
			frame.srcdoc = srcdoc;
		}, { srcdoc: navigationHtml, token: navigationToken });
		const generatedFrame = generatedPage.frameLocator("#generated-preview");
		expect(navigationHtml).toMatch(/script-src 'nonce-[^']+'/);
		expect(navigationHtml).not.toContain("generated-only.invalid");
		expect(navigationHtml).not.toContain("offline.png");
		await expect(generatedFrame.locator("img.openamx-narrative-image")).toHaveCount(1);
		expect(await generatedFrame.locator("img.openamx-narrative-image").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(1);
		await generatedFrame.getByRole("link", { name: "Safe external" }).evaluate(element => {
			element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
		});
		await generatedPage.evaluate(() => new Promise(resolve => setTimeout(resolve, 0)));
		navigationMessages.push(...await generatedPage.evaluate(() => (window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages));
		expect(navigationMessages).toEqual([]);
		await generatedFrame.getByRole("link", { name: "Safe external" }).click();
		await expect.poll(() => generatedPage.evaluate(() => (window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages.length)).toBe(1);
		const generatedMessage = (await generatedPage.evaluate(() => (window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages))[0];
		expect(generatedMessage).toEqual({
			version: 1, type: "navigate", previewToken: navigationToken, targetId: expect.stringMatching(/^[a-f0-9]{32}$/)
		});
		await generatedFrame.getByRole("link", { name: "Local file" }).click();
		await expect.poll(() => generatedPage.evaluate(() => (window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages.length)).toBe(2);
		await generatedFrame.getByRole("link", { name: "Internal anchor" }).click();
		await expect.poll(() => generatedPage.evaluate(() => (window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages.length)).toBe(2);
		await generatedPage.evaluate(() => {
			const frame = document.querySelector<HTMLIFrameElement>("#generated-preview")!;
			frame.contentWindow!.postMessage({
				version: 1, type: "navigate", previewToken: "0".repeat(64),
				targetId: "0".repeat(32), href: "https://attacker.invalid/"
			}, "*");
		});
		await generatedFrame.locator("body").evaluate(() => {
			window.parent.postMessage({
				version: 1, type: "navigate", previewToken: "0".repeat(64),
				targetId: "0".repeat(32), href: "https://attacker.invalid/"
			}, "*");
		});
		await generatedPage.waitForTimeout(50);
		expect(await generatedPage.evaluate(() => (window as Window & { __previewNavigationMessages: unknown[] }).__previewNavigationMessages)).toHaveLength(2);
		expect(generatedOutbound).toEqual([]);
		await generatedPage.close();
		await expect(previewFrame.locator('meta[http-equiv="refresh"],form,svg use[href]')).toHaveCount(0);
		await expect(previewFrame.locator("iframe,object,embed")).toHaveCount(0);
		await expect(previewFrame.locator(".openamx-chart-plot canvas")).toHaveCount(10);
		const access = await frame.evaluate(element => {
			const child = (element as HTMLIFrameElement).contentWindow!;
			try { void child.document.body; return { frameDocumentDenied: false }; }
			catch { return { frameDocumentDenied: true }; }
		});
		expect(access).toEqual({ frameDocumentDenied: true });
		await page.evaluate(() => Object.assign(window, { openamxBridge: { secret: "parent-only" }, __privateApplicationState: "parent-only" }));
		const isolated = page.frameLocator('iframe[title="isolated script-permission probe"]');
		const scriptedAttempts = await outboundRequests(page, async () => {
			await page.evaluate(srcdoc => {
				const scriptedFrame = document.createElement("iframe");
				scriptedFrame.title = "isolated script-permission probe";
				scriptedFrame.name = "isolated-script-permission-probe";
				scriptedFrame.setAttribute("sandbox", "allow-scripts");
				scriptedFrame.srcdoc = srcdoc;
				document.body.append(scriptedFrame);
			}, previewHtml);
			await expect(isolated.locator(".openamx-chart-plot canvas")).toHaveCount(10);
			await isolated.getByText("visible external link").click();
			const touchZoom = isolated.getByRole("button", { name: "Zoom in" }).first();
			await touchZoom.tap();
		});
		expect(scriptedAttempts).toEqual([]);
		const isolation = await page.frame({ name: "isolated-script-permission-probe" })!.evaluate(() => {
			const checks = { parentReadDenied: false, bridgeDenied: false, appStateDenied: false, storageDenied: false };
			try { void window.parent.document; } catch { checks.parentReadDenied = true; }
			try { void (window.parent as Window & { openamxBridge?: unknown }).openamxBridge; } catch { checks.bridgeDenied = true; }
			try { void (window.parent as Window & { __privateApplicationState?: unknown }).__privateApplicationState; } catch { checks.appStateDenied = true; }
			try { void window.localStorage.length; } catch { checks.storageDenied = true; }
			return checks;
		});
		expect(isolation).toEqual({ parentReadDenied: true, bridgeDenied: true, appStateDenied: true, storageDenied: true });
		await capture(page, testInfo, "sprint062-desktop-preview.png");
		const removedChart = isolated.locator(".openamx-chart-plot").first();
		const disposed = await removedChart.evaluate(async plot => {
			const chart = (window as Window & { echarts: { getInstanceByDom: (element: Element) => { isDisposed: () => boolean } | undefined } }).echarts.getInstanceByDom(plot)!;
			plot.closest("[data-openamx-chart]")!.remove();
			await new Promise(resolve => setTimeout(resolve, 0));
			return chart.isDisposed();
		});
		expect(disposed).toBe(true);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
