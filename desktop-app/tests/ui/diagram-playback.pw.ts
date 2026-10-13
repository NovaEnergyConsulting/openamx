import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, expect, test, type Page } from "@playwright/test";

const repositoryRoot = resolve(import.meta.dirname, "../../..");
const artifactsDirectory = resolve(repositoryRoot, "planning/sprints/0080-v13-interactive-html-desktop-preview/artifacts");
mkdirSync(artifactsDirectory, { recursive: true });
const grammarPath = resolve(repositoryRoot, "planning/sprints/0078-v13-diagram-contract-feasibility-gate/grammar-examples.md");
const contract = readFileSync(grammarPath, "utf8").replace(/\r\n/g, "\n");

function fixture(id: string): string {
	const heading = contract.indexOf(`### ${id} —`);
	if (heading < 0) throw new Error(`Missing approved diagram fixture ${id}.`);
	const open = contract.indexOf("````amx-source\n", heading);
	if (open < 0) throw new Error(`Missing complete document for ${id}.`);
	const start = open + "````amx-source\n".length;
	const end = contract.indexOf("\n````", start);
	if (end < 0) throw new Error(`Unclosed complete document for ${id}.`);
	return contract.slice(start, end);
}

function amxBody(document: string): string {
	const body = document.match(/```amx\r?\n([\s\S]*?)\r?\n```/);
	if (!body) throw new Error("Expected an executable AMX block.");
	return body[1]!;
}

function withHealthyDiagram(document: string): string {
	const healthy = `diagram independent {
  title: "Independent diagram"
  description: "This diagram remains usable after another frame fails."
  width: 100
  height: 60
  time t from 0 to 1 duration 1
  circle independentPoint {
    cx: 10 + 30 * t
    cy: 30
    r: 4
    stroke: "#263238"
    lineWidth: 1
  }
}`;
	return document.replace(/\n```\s*$/, `\n${healthy}\n\`\`\`\n`);
}

function createRenderedFixtures(directory: string): void {
	const crank = amxBody(fixture("D-CRANK-01"));
	const battery = amxBody(fixture("D-BATTERY-01"));
	const combined = `---
title: Interactive mechanism and circuit
---
# Interactive examples

\`\`\`amx
${crank}
${battery}
\`\`\`
`;
	const repeatedElements = Array.from({ length: 32 }, (_, index) => `  circle point${index} {
    cx: item + ${index}
    cy: 30
    r: 1
    stroke: "#263238"
    lineWidth: 1
  }`).join("\n");
	const stress = `# Repeated emission workload

\`\`\`amx
for item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] {
  diagram repeated {
    title: "Repeated diagram"
    description: "A diagram emitted from a repeated loop."
    width: 100
    height: 60
    time t from 0 to 1 duration 1
${repeatedElements}
  }
}
\`\`\`
`;
	const quick = `# Playback controls

\`\`\`amx
diagram quick {
  title: "Quick diagram"
  description: "Short timeline for endpoint and loop acceptance."
  width: 100
  height: 60
  time t from 0 to 1 duration 0.18
  circle point {
    cx: 10 + 80 * t
    cy: 30
    r: 4
    stroke: "#263238"
    lineWidth: 1
  }
}
\`\`\`
`;
	const failures = ["D-NEG-15", "D-NEG-22", "D-NEG-24"].map(id => ({
		id,
		source: withHealthyDiagram(fixture(id))
	}));
	const inputs = [
		{ file: "combined.amx", source: combined, mode: "standalone" },
		{ file: "stress.amx", source: stress, mode: "standalone" },
		{ file: "quick.amx", source: quick, mode: "standalone" },
		...failures.flatMap(({ id, source }) => [
			{ file: `${id}.amx`, source, mode: "standalone" },
			{ file: `${id}-preview.amx`, source, mode: "preview" }
		])
	];
	const encodedInputs = JSON.stringify(inputs);
	const script = `
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocumentText } from "./src/parser/parseDocument.ts";
import { evaluateDocumentEnvironment } from "./src/runtime/evaluateDocument.ts";
import { prepareReport } from "./src/renderer/reportPreparation.ts";
import { renderPreparedHtml } from "./src/renderer/renderHtml.ts";
const directory = ${JSON.stringify(directory)};
const inputs = JSON.parse(${JSON.stringify(encodedInputs)});
for (const input of inputs) {
  const file = join(directory, input.file);
  const document = parseDocumentText(input.source);
  const environment = evaluateDocumentEnvironment(document, file);
  const report = await prepareReport(document, environment, { file });
  const result = renderPreparedHtml(report, input.mode === "preview" ? { mode: "preview" } : { mode: "standalone" });
  const html = typeof result === "string" ? result : result.html;
  writeFileSync(file.replace(/\\.amx$/, ".html"), html);
  if (typeof result !== "string") writeFileSync(file.replace(/\\.amx$/, ".token"), result.previewToken);
}
`;
	execFileSync("bun", ["-e", script], { cwd: repositoryRoot, stdio: "pipe" });
}

async function localRequests(page: Page, action: () => Promise<void>): Promise<string[]> {
	const attempted: string[] = [];
	const listener = (request: import("@playwright/test").Request) => {
		if (/^(https?:|ws:|wss:)/i.test(request.url())) attempted.push(request.url());
	};
	page.on("request", listener);
	await action();
	await page.waitForTimeout(100);
	page.off("request", listener);
	return attempted;
}

test("standalone local-file playback is paused, accessible, independent, responsive and offline", async ({ page }) => {
	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-html-"));
	const browserErrors: string[] = [];
	page.on("pageerror", error => browserErrors.push(error.message));
	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
	try {
		createRenderedFixtures(directory);
		const htmlPath = join(directory, "combined.html");
		const attempted = await localRequests(page, async () => {
			await page.goto(pathToFileURL(htmlPath).href);
			await expect(page.locator("[data-openamx-diagram]")).toHaveCount(2);
			await expect(page.locator("[data-openamx-diagram]").first().locator("figcaption strong")).toHaveText("Crank-slider mechanism");
			await expect(page.locator("[data-openamx-diagram]").first().locator("svg *")).not.toHaveCount(0);
		});
		expect(attempted).toEqual([]);
		const diagrams = page.locator("[data-openamx-diagram]");
		const crank = diagrams.nth(0);
		const battery = diagrams.nth(1);
		const crankTime = crank.locator("[data-diagram-time]");
		const crankPlay = crank.getByRole("button", { name: "Play Crank-slider mechanism" });
		await expect(crankTime).toHaveText("0");
		await expect(crankPlay).toHaveText("Play");
		await expect(crank.getByRole("checkbox", { name: "Loop Crank-slider mechanism" })).not.toBeChecked();
		await expect(crank.locator('[data-diagram-element="crankPin"]')).toHaveAttribute("cx", "36");
		await expect(crank.getByRole("img", { name: "Crank-slider mechanism" })).toBeVisible();
		await expect(crank).toHaveAttribute("aria-describedby", /description/);
		await page.keyboard.press("Tab");
		await expect(crankPlay).toBeFocused();
		expect(await crankPlay.evaluate(button => getComputedStyle(button).outlineStyle)).toBe("solid");
		await page.keyboard.press("Enter");
		await expect(crank.getByRole("button", { name: "Pause Crank-slider mechanism" })).toHaveText("Pause");
		await page.keyboard.press("Space");
		await expect(crankPlay).toHaveText("Play");

		const crankScrubber = crank.getByRole("slider", { name: "Time for Crank-slider mechanism" });
		await crankScrubber.evaluate(element => {
			const slider = element as HTMLInputElement;
			slider.value = "1";
			slider.dispatchEvent(new Event("input", { bubbles: true }));
		});
		await expect(crankTime).toHaveText("1");
		await expect(crank.locator('[data-diagram-element="crankPin"]')).toHaveAttribute("cx", "104");
		await crankPlay.focus();
		await page.keyboard.press("Enter");
		await expect(crank.getByRole("button", { name: "Pause Crank-slider mechanism" })).toHaveText("Pause");
		await page.keyboard.press("Space");
		await expect(crankPlay).toHaveText("Play");
		await crank.getByRole("button", { name: "Reset Crank-slider mechanism" }).click();
		await expect(crankTime).toHaveText("0");

		const batteryScrubber = battery.getByRole("slider", { name: "Time for Battery-resistor DC circuit" });
		await batteryScrubber.evaluate(element => {
			const slider = element as HTMLInputElement;
			slider.value = "2";
			slider.dispatchEvent(new Event("input", { bubbles: true }));
		});
		await expect(battery.locator("[data-diagram-time]")).toHaveText("2");
		await expect(crankTime).toHaveText("0");
		await expect(battery.locator('[data-diagram-element="currentIndicator"]')).toHaveAttribute("x1", "108");

		const bounds = await crank.locator("svg").boundingBox();
		if (!bounds) throw new Error("Crank SVG has no visible bounds.");
		expect(bounds.width / bounds.height).toBeCloseTo(1.6, 1);
		await page.screenshot({ path: join(artifactsDirectory, "standalone-diagram-playback.png"), fullPage: true });
		await page.setViewportSize({ width: 420, height: 900 });
		const resized = await crank.locator("svg").boundingBox();
		if (!resized) throw new Error("Resized crank SVG has no visible bounds.");
		expect(resized.width / resized.height).toBeCloseTo(1.6, 1);

		await page.goto(pathToFileURL(join(directory, "quick.html")).href);
		const quick = page.locator("[data-openamx-diagram]");
		await quick.evaluate(root => {
			const output = root.querySelector("[data-diagram-time]")!;
			const windowState = window as Window & { __diagramTimes?: string[] };
			windowState.__diagramTimes = [];
			new MutationObserver(() => windowState.__diagramTimes?.push(output.textContent ?? ""))
				.observe(output, { childList: true, characterData: true, subtree: true });
		});
		await quick.getByRole("checkbox", { name: "Loop Quick diagram" }).check();
		await quick.getByRole("button", { name: "Play Quick diagram" }).click();
		await page.waitForTimeout(550);
		expect(await quick.evaluate(root => (window as Window & { __diagramTimes?: string[] }).__diagramTimes?.includes("0"))).toBe(true);
		await expect(quick.getByRole("button", { name: "Pause Quick diagram" })).toHaveText("Pause");
		await quick.getByRole("button", { name: "Reset Quick diagram" }).click();
		await quick.getByRole("checkbox", { name: "Loop Quick diagram" }).uncheck();
		await quick.getByRole("button", { name: "Play Quick diagram" }).click();
		await expect(quick.locator("[data-diagram-time]")).toHaveText("1", { timeout: 1500 });
		await expect(quick.getByRole("button", { name: "Play Quick diagram" })).toHaveText("Play");
		await expect(quick.locator('[data-diagram-element="point"]')).toHaveAttribute("cx", "90");
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});

test("AMXD009, AMXD010 and AMXD011 clear only the failed diagram and recover without stale geometry", async ({ page }) => {
	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-errors-"));
	const browserErrors: string[] = [];
	page.on("pageerror", error => browserErrors.push(error.message));
	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
	try {
		createRenderedFixtures(directory);
		const cases = [
			{ id: "D-NEG-15", time: "2", diagnostic: "AMXD009", source: ":14:8" },
			{ id: "D-NEG-22", time: "2", diagnostic: "AMXD010", source: ":14:8" },
			{ id: "D-NEG-24", time: "1", diagnostic: "AMXD011", source: ":14:8" }
		];
		for (const item of cases) {
			await page.goto(pathToFileURL(join(directory, `${item.id}.html`)).href);
			const diagrams = page.locator("[data-openamx-diagram]");
			await expect(diagrams).toHaveCount(2);
			await expect(diagrams.nth(0).locator("svg *"), browserErrors.join("\n")).not.toHaveCount(0);
			const failed = diagrams.nth(0);
			await failed.getByRole("slider").evaluate((element, time) => {
				const slider = element as HTMLInputElement;
				slider.value = time;
				slider.dispatchEvent(new Event("input", { bubbles: true }));
			}, item.time);
			await expect(failed.locator("[data-diagram-time]")).toHaveText(item.time);
			const alert = failed.getByRole("alert");
			await expect(alert).toContainText(item.diagnostic);
			await expect(alert).toContainText(item.source);
			if (item.diagnostic === "AMXD009") await expect(alert).toContainText("sqrt of negative value");
			await expect(failed.locator("svg")).toHaveAttribute("aria-hidden", "true");
			await expect(failed.locator("svg")).toBeEmpty();
			await expect(diagrams.nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "10");
			await diagrams.nth(1).getByRole("slider").evaluate(element => {
				const slider = element as HTMLInputElement;
				slider.value = "0.5";
				slider.dispatchEvent(new Event("input", { bubbles: true }));
			});
			await expect(diagrams.nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "25");
			if (item.id === "D-NEG-24") {
				await page.screenshot({ path: join(artifactsDirectory, "standalone-diagram-frame-error.png"), fullPage: true });
			}
			await failed.getByRole("button", { name: /Reset/ }).click();
			await expect(alert).toBeHidden();
			await expect(failed.locator("svg")).not.toHaveAttribute("aria-hidden", "true");
			await expect(failed.locator("svg").locator("*")).not.toHaveCount(0);
		}
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});

test("repeated loop emissions retain all models and stay within measured preview resource limits", async ({ page }) => {
	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-resource-"));
	try {
		createRenderedFixtures(directory);
		const htmlPath = join(directory, "stress.html");
		const bytes = Buffer.byteLength(readFileSync(htmlPath, "utf8"), "utf8");
		expect(bytes).toBeLessThanOrEqual(1024 * 1024);
		const cdp = await page.context().newCDPSession(page);
		await cdp.send("HeapProfiler.enable");
		await cdp.send("Performance.enable");
		await cdp.send("HeapProfiler.collectGarbage");
		const baselineMetrics = await cdp.send("Performance.getMetrics");
		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
		if (!baselineHeap) throw new Error("Chromium did not report baseline JSHeapUsedSize.");
		await page.goto(pathToFileURL(htmlPath).href);
		const diagrams = page.locator("[data-openamx-diagram]");
		await expect(diagrams).toHaveCount(17);
		await expect(page.locator('[data-diagram-element^="point"]')).toHaveCount(17 * 32);

		const wholePageNodes = await page.locator("*").count();
		expect(wholePageNodes).toBeLessThanOrEqual(2000);
		const frameSamples = await page.evaluate(() => {
			const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-diagram-scrubber]"));
			const samples: number[] = [];
			for (let sample = 0; sample < 60; sample++) {
				const start = performance.now();
				for (const input of inputs) {
					input.value = sample % 2 ? "0" : "1";
					input.dispatchEvent(new Event("input", { bubbles: true }));
				}
				samples.push(performance.now() - start);
			}
			return samples;
		});
		const sortedSamples = [...frameSamples].sort((left, right) => left - right);
		const p95 = sortedSamples[Math.ceil(sortedSamples.length * 0.95) - 1]!;
		expect(p95).toBeLessThanOrEqual(16.7);

		await cdp.send("HeapProfiler.collectGarbage");
		const metrics = await cdp.send("Performance.getMetrics");
		const heap = metrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
		if (!heap) throw new Error("Chromium did not report JSHeapUsedSize.");
		const incrementalHeapBytes = Math.max(0, heap.value - baselineHeap.value);
		expect(incrementalHeapBytes).toBeLessThanOrEqual(8 * 1024 * 1024);
		console.log(JSON.stringify({
			userAgent: await page.evaluate(() => navigator.userAgent),
			hardwareConcurrency: await page.evaluate(() => navigator.hardwareConcurrency),
			htmlBytes: bytes,
			emittedDiagrams: await diagrams.count(),
			emittedElements: await page.locator('[data-diagram-element^="point"]').count(),
			wholePageNodes,
			frameSamples,
			p95FrameWorkMs: p95,
			jsHeapUsedBytesAfterForcedGc: heap.value,
			incrementalHeapBytes
		}));
		await cdp.detach();
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});

test("desktop preview bridge reports frame diagnostics in the active token-bound lifecycle", async ({ page }) => {
	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-desktop-bridge-"));
	try {
		createRenderedFixtures(directory);
		await page.goto("/");
		await page.getByRole("button", { name: "Open project" }).click();
		await page.getByRole("button", { name: "Refresh preview" }).click();
		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
		await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
		const original = await iframe.getAttribute("srcdoc");
		if (!original) throw new Error("The workbench preview did not provide srcdoc.");
		const token = original.match(/const token="([a-f0-9]{64})"/)?.[1];
		if (!token) throw new Error("The active preview token was not found in trusted preview bootstrap.");
		const previewHtml = readFileSync(join(directory, "D-NEG-24-preview.html"), "utf8")
			.replace(/const token="[a-f0-9]{64}"/, `const token="${token}"`);
		await iframe.evaluate((element, html) => { (element as HTMLIFrameElement).srcdoc = html; }, previewHtml);
		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
			const slider = element as HTMLInputElement;
			slider.value = "1";
			slider.dispatchEvent(new Event("input", { bubbles: true }));
		});
		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
		await expect(page.locator('iframe[title="OpenAMX live HTML preview"]').last()).toHaveAttribute("sandbox", "allow-scripts");
		await page.getByRole("button", { name: "Details" }).click();
		await expect(page.locator(".runtime-details [role=alert]")).toContainText("AMXD011");
		await expect(page.locator(".runtime-details [role=alert]")).toContainText(":14:8");
		await page.screenshot({ path: join(artifactsDirectory, "desktop-preview-harness-diagram-error.png"), fullPage: true });
		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("button", { name: /Reset/ }).click();
		await expect(page.locator(".runtime-details [role=alert]")).toHaveCount(0);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});

test("stable packaged desktop preview runs diagrams in its sandboxed WebView2 host", async () => {
	test.skip(!process.env.OPENAMX_NATIVE_CDP_URL, "Requires a running stable package with a test-only WebView2 CDP endpoint.");
	const cdpUrl = process.env.OPENAMX_NATIVE_CDP_URL!;
	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-native-package-"));
	const project = join(directory, "project");
	const projectState = join(project, ".openamx");
	const reportPath = join(project, "report.amx");
	const resourcePath = join(project, "resource.amx");
	const repeatedElements = Array.from({ length: 32 }, (_, index) => `  circle point${index} {
    cx: item + ${index}
    cy: 30
    r: 1
    stroke: "#263238"
    lineWidth: 1
  }`).join("\n");
	const resourceSource = `# Native repeated-emission workload

\`\`\`amx
for item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] {
  diagram repeated {
    title: "Repeated diagram"
    description: "A repeated emission measured in the stable desktop package."
    width: 100
    height: 60
    time t from 0 to 1 duration 1
${repeatedElements}
  }
}
\`\`\`
`;
	try {
		mkdirSync(projectState, { recursive: true });
		writeFileSync(join(projectState, "project.json"), '{"version":1,"inputs":{}}\n');
		writeFileSync(
			reportPath,
			readFileSync(join(artifactsDirectory, "native-preview-fixture.amx"), "utf8")
		);
		writeFileSync(resourcePath, resourceSource);
		const browser = await chromium.connectOverCDP(cdpUrl);
		const page = browser.contexts().flatMap(context => context.pages())
			.find(candidate => candidate.url().startsWith("views://mainview/"));
		if (!page) throw new Error("The stable package WebView2 page was not found through CDP.");
		const cdp = await page.context().newCDPSession(page);
		await cdp.send("HeapProfiler.enable");
		await cdp.send("Performance.enable");
		await cdp.send("HeapProfiler.collectGarbage");
		const baselineMetrics = await cdp.send("Performance.getMetrics");
		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
		if (!baselineHeap) throw new Error("The packaged WebView2 did not report baseline JSHeapUsedSize.");
		const opened = await page.locator("#app").evaluate(async (element, paths) => {
			type NativeRpc = {
				request: {
					openProject(params: { path: string }): Promise<{ ok: boolean }>;
					openDocument(params: { path: string }): Promise<{ ok: boolean }>;
				};
			};
			type VueRoot = HTMLElement & { _vnode?: { component?: { props?: { rpc?: NativeRpc } } } };
			const component = (element as VueRoot)._vnode?.component;
			const rpc = component?.props?.rpc;
			if (!rpc?.request?.openProject || !rpc.request.openDocument) throw new Error("The packaged desktop RPC bridge is unavailable.");
			const projectResult = await rpc.request.openProject({ path: paths.project });
			if (!projectResult.ok) return { projectOpened: false, documentOpened: false };
			const documentResult = await rpc.request.openDocument({ path: paths.report });
			return { projectOpened: projectResult.ok, documentOpened: documentResult.ok };
		}, { project, report: reportPath });
		expect(opened).toEqual({ projectOpened: true, documentOpened: true });
		await page.reload();
		const recentProject = page.getByRole("button", { name: project });
		await expect(recentProject).toBeVisible({ timeout: 10_000 });
		await recentProject.click();
		await page.getByRole("button", { name: "Refresh preview" }).click();
		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
		await expect(page.locator(".preview-pane .state").last()).toHaveText("success", { timeout: 10_000 });
		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
		await expect(frame.locator("[data-openamx-diagram]")).toHaveCount(2);
		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
			const slider = element as HTMLInputElement;
			slider.value = "1";
			slider.dispatchEvent(new Event("input", { bubbles: true }));
		});
		await expect(frame.locator("[data-openamx-diagram]").nth(0).getByRole("alert")).toContainText("AMXD011");
		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
		await expect(frame.locator("[data-openamx-diagram]").nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "10");
		await frame.locator("[data-openamx-diagram]").nth(1).getByRole("slider").evaluate(element => {
			const slider = element as HTMLInputElement;
			slider.value = "0.5";
			slider.dispatchEvent(new Event("input", { bubbles: true }));
		});
		await expect(frame.locator("[data-openamx-diagram]").nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "25");
		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("alert").scrollIntoViewIfNeeded();
		await page.screenshot({ path: join(artifactsDirectory, "desktop-preview-native-package.png"), fullPage: true });
		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("button", { name: /Reset/ }).click();
		await expect(page.locator(".runtime-status").last()).not.toContainText("AMXD011");

		const openedResource = await page.locator("#app").evaluate(async (element, path) => {
			type NativeRpc = { request: { openDocument(params: { path: string }): Promise<{ ok: boolean }> } };
			type VueRoot = HTMLElement & { _vnode?: { component?: { props?: { rpc?: NativeRpc } } } };
			const rpc = (element as VueRoot)._vnode?.component?.props?.rpc;
			if (!rpc) throw new Error("The packaged desktop RPC bridge is unavailable.");
			return (await rpc.request.openDocument({ path })).ok;
		}, resourcePath);
		expect(openedResource).toBe(true);
		await page.reload();
		await expect(recentProject).toBeVisible({ timeout: 10_000 });
		await recentProject.click();
		await page.getByRole("button", { name: "Refresh preview" }).click();
		await expect(page.locator(".preview-pane .state").last()).toHaveText("success", { timeout: 10_000 });
		const resourceFrame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
		await expect(resourceFrame.locator("[data-openamx-diagram]")).toHaveCount(17);
		await expect(resourceFrame.locator('[data-diagram-element^="point"]')).toHaveCount(17 * 32);
		const previewHtml = await page.locator('iframe[title="OpenAMX live HTML preview"]').last().getAttribute("srcdoc");
		if (!previewHtml) throw new Error("The packaged preview returned no srcdoc content.");
		const htmlBytes = Buffer.byteLength(previewHtml, "utf8");
		const domNodes = await page.locator("*").count() + await resourceFrame.locator("*").count();
		expect(htmlBytes).toBeLessThanOrEqual(1024 * 1024);
		expect(domNodes).toBeLessThanOrEqual(2000);
		const frameSamples = await resourceFrame.locator("body").evaluate(body => {
			const inputs = Array.from(body.querySelectorAll<HTMLInputElement>("[data-diagram-scrubber]"));
			const samples: number[] = [];
			for (let sample = 0; sample < 60; sample++) {
				const start = performance.now();
				for (const input of inputs) {
					input.value = sample % 2 ? "0" : "1";
					input.dispatchEvent(new Event("input", { bubbles: true }));
				}
				samples.push(performance.now() - start);
			}
			return samples;
		});
		const sortedFrameSamples = [...frameSamples].sort((left, right) => left - right);
		const p95FrameWorkMs = sortedFrameSamples[Math.ceil(sortedFrameSamples.length * 0.95) - 1]!;
		expect(p95FrameWorkMs).toBeLessThanOrEqual(16.7);
		await cdp.send("HeapProfiler.collectGarbage");
		const finalMetrics = await cdp.send("Performance.getMetrics");
		const finalHeap = finalMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
		if (!finalHeap) throw new Error("The packaged WebView2 did not report final JSHeapUsedSize.");
		const incrementalHeapBytes = Math.max(0, finalHeap.value - baselineHeap.value);
		expect(incrementalHeapBytes).toBeLessThanOrEqual(8 * 1024 * 1024);
		console.log(JSON.stringify({
			userAgent: await page.evaluate(() => navigator.userAgent),
			hardwareConcurrency: await page.evaluate(() => navigator.hardwareConcurrency),
			htmlBytes,
			emittedDiagrams: await resourceFrame.locator("[data-openamx-diagram]").count(),
			emittedElements: await resourceFrame.locator('[data-diagram-element^="point"]').count(),
			domNodes,
			frameSamples,
			p95FrameWorkMs,
			jsHeapUsedBytesAfterForcedGc: finalHeap.value,
			incrementalHeapBytes
		}));
		await resourceFrame.locator("[data-openamx-diagram]").first().scrollIntoViewIfNeeded();
		await page.screenshot({ path: join(artifactsDirectory, "desktop-preview-native-repeated-emissions.png"), fullPage: true });
		await cdp.detach();
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
