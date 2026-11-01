# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagram-playback.pw.ts >> desktop preview bridge reports frame diagnostics in the active token-bound lifecycle
- Location: tests\ui\diagram-playback.pw.ts:498:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.runtime-status').last()
Expected substring: "AMXD011"
Received string:    "Preview reflects the current buffer."
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('.runtime-status').last() with timeout 5000ms
  - waiting for locator('.runtime-status').last()
    14 × locator resolved to <p role="status" aria-live="polite" class="runtime-status">…</p>
       - unexpected value "Preview reflects the current buffer."

```

```yaml
- status: Preview reflects the current buffer.
```

# Test source

```ts
  430 | 		await expect(page.locator("[data-openamx-diagram]").nth(1).locator('[data-diagram-element="generatedPoint2"]')).toHaveCount(64);
  431 | 	});
  432 | 	expect(corruptRequests).toEqual([]);
  433 | 	expect(browserErrors).toEqual([]);
  434 | });
  435 | 
  436 | test("repeated loop emissions retain all models and stay within measured preview resource limits", async ({ page }) => {
  437 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-resource-"));
  438 | 	try {
  439 | 		createRenderedFixtures(directory);
  440 | 		const htmlPath = join(directory, "stress.html");
  441 | 		const bytes = Buffer.byteLength(readFileSync(htmlPath, "utf8"), "utf8");
  442 | 		expect(bytes).toBeLessThanOrEqual(1024 * 1024);
  443 | 		const cdp = await page.context().newCDPSession(page);
  444 | 		await cdp.send("HeapProfiler.enable");
  445 | 		await cdp.send("Performance.enable");
  446 | 		await cdp.send("HeapProfiler.collectGarbage");
  447 | 		const baselineMetrics = await cdp.send("Performance.getMetrics");
  448 | 		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  449 | 		if (!baselineHeap) throw new Error("Chromium did not report baseline JSHeapUsedSize.");
  450 | 		await page.goto(pathToFileURL(htmlPath).href);
  451 | 		const diagrams = page.locator("[data-openamx-diagram]");
  452 | 		await expect(diagrams).toHaveCount(17);
  453 | 		await expect(page.locator('[data-diagram-element^="point"]')).toHaveCount(17 * 32);
  454 | 
  455 | 		const wholePageNodes = await page.locator("*").count();
  456 | 		expect(wholePageNodes).toBeLessThanOrEqual(2000);
  457 | 		const frameSamples = await page.evaluate(() => {
  458 | 			const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-diagram-scrubber]"));
  459 | 			const samples: number[] = [];
  460 | 			for (let sample = 0; sample < 60; sample++) {
  461 | 				const start = performance.now();
  462 | 				for (const input of inputs) {
  463 | 					input.value = sample % 2 ? "0" : "1";
  464 | 					input.dispatchEvent(new Event("input", { bubbles: true }));
  465 | 				}
  466 | 				samples.push(performance.now() - start);
  467 | 			}
  468 | 			return samples;
  469 | 		});
  470 | 		const sortedSamples = [...frameSamples].sort((left, right) => left - right);
  471 | 		const p95 = sortedSamples[Math.ceil(sortedSamples.length * 0.95) - 1]!;
  472 | 		expect(p95).toBeLessThanOrEqual(16.7);
  473 | 
  474 | 		await cdp.send("HeapProfiler.collectGarbage");
  475 | 		const metrics = await cdp.send("Performance.getMetrics");
  476 | 		const heap = metrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  477 | 		if (!heap) throw new Error("Chromium did not report JSHeapUsedSize.");
  478 | 		const incrementalHeapBytes = Math.max(0, heap.value - baselineHeap.value);
  479 | 		expect(incrementalHeapBytes).toBeLessThanOrEqual(8 * 1024 * 1024);
  480 | 		console.log(JSON.stringify({
  481 | 			userAgent: await page.evaluate(() => navigator.userAgent),
  482 | 			hardwareConcurrency: await page.evaluate(() => navigator.hardwareConcurrency),
  483 | 			htmlBytes: bytes,
  484 | 			emittedDiagrams: await diagrams.count(),
  485 | 			emittedElements: await page.locator('[data-diagram-element^="point"]').count(),
  486 | 			wholePageNodes,
  487 | 			frameSamples,
  488 | 			p95FrameWorkMs: p95,
  489 | 			jsHeapUsedBytesAfterForcedGc: heap.value,
  490 | 			incrementalHeapBytes
  491 | 		}));
  492 | 		await cdp.detach();
  493 | 	} finally {
  494 | 		rmSync(directory, { recursive: true, force: true });
  495 | 	}
  496 | });
  497 | 
  498 | test("desktop preview bridge reports frame diagnostics in the active token-bound lifecycle", async ({ page }) => {
  499 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-desktop-bridge-"));
  500 | 	try {
  501 | 		createRenderedFixtures(directory);
  502 | 		await page.goto("/");
  503 | 		await page.getByRole("button", { name: "Open project" }).click();
  504 | 		await page.getByRole("button", { name: "Refresh preview" }).click();
  505 | 		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
  506 | 		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  507 | 		await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  508 | 		const original = await iframe.getAttribute("srcdoc");
  509 | 		if (!original) throw new Error("The workbench preview did not provide srcdoc.");
  510 | 		const token = original.match(/const token="([a-f0-9]{64})"/)?.[1];
  511 | 		if (!token) throw new Error("The active preview token was not found in trusted preview bootstrap.");
  512 | 		const vectorHtml = readFileSync(join(directory, "VectorRotation-preview.html"), "utf8")
  513 | 			.replace(/const token="[a-f0-9]{64}"/, `const token="${token}"`);
  514 | 		await iframe.evaluate((element, html) => { (element as HTMLIFrameElement).srcdoc = html; }, vectorHtml);
  515 | 		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
  516 | 		const vectorDiagram = frame.locator("[data-openamx-diagram]").first();
  517 | 		await expect(vectorDiagram).toBeVisible();
  518 | 		await expect(vectorDiagram.locator('[data-diagram-element="phaseA"]')).toHaveAttribute("x2", "350");
  519 | 		await expect(vectorDiagram.locator('[data-diagram-element="timeLabel"]')).toHaveText("Angle: 0");
  520 | 		await expect(vectorDiagram.locator("[data-diagram-error]")).toBeHidden();
  521 | 		await expect(page.locator(".runtime-status")).not.toContainText("DIAGRAM_RUNTIME");
  522 | 		const previewHtml = readFileSync(join(directory, "D-NEG-24-preview.html"), "utf8")
  523 | 			.replace(/const token="[a-f0-9]{64}"/, `const token="${token}"`);
  524 | 		await iframe.evaluate((element, html) => { (element as HTMLIFrameElement).srcdoc = html; }, previewHtml);
  525 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
  526 | 			const slider = element as HTMLInputElement;
  527 | 			slider.value = "1";
  528 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  529 | 		});
> 530 | 		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
      |                                                        ^ Error: expect(locator).toContainText(expected) failed
  531 | 		await expect(page.locator('iframe[title="OpenAMX live HTML preview"]').last()).toHaveAttribute("sandbox", "allow-scripts");
  532 | 		await page.getByRole("button", { name: "Details" }).click();
  533 | 		await expect(page.locator(".runtime-details [role=alert]")).toContainText("AMXD011");
  534 | 		await expect(page.locator(".runtime-details [role=alert]")).toContainText(":14:8");
  535 | 		await page.screenshot({ path: join(artifactsDirectory, "desktop-preview-harness-diagram-error.png"), fullPage: true });
  536 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("button", { name: /Reset/ }).click();
  537 | 		await expect(page.locator(".runtime-details [role=alert]")).toHaveCount(0);
  538 | 	} finally {
  539 | 		rmSync(directory, { recursive: true, force: true });
  540 | 	}
  541 | });
  542 | 
  543 | test("stable packaged desktop preview runs diagrams in its sandboxed WebView2 host", async () => {
  544 | 	test.skip(!process.env.OPENAMX_NATIVE_CDP_URL, "Requires a running stable package with a test-only WebView2 CDP endpoint.");
  545 | 	const cdpUrl = process.env.OPENAMX_NATIVE_CDP_URL!;
  546 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-native-package-"));
  547 | 	const project = join(directory, "project");
  548 | 	const projectState = join(project, ".openamx");
  549 | 	const reportPath = join(project, "report.amx");
  550 | 	const resourcePath = join(project, "resource.amx");
  551 | 	const repeatedElements = Array.from({ length: 32 }, (_, index) => `  circle point${index} {
  552 |     cx: item + ${index}
  553 |     cy: 30
  554 |     r: 1
  555 |     stroke: "#263238"
  556 |     lineWidth: 1
  557 |   }`).join("\n");
  558 | 	const resourceSource = `# Native repeated-emission workload
  559 | 
  560 | \`\`\`amx
  561 | for item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] {
  562 |   diagram repeated {
  563 |     title: "Repeated diagram"
  564 |     description: "A repeated emission measured in the stable desktop package."
  565 |     width: 100
  566 |     height: 60
  567 |     time t from 0 to 1 duration 1
  568 | ${repeatedElements}
  569 |   }
  570 | }
  571 | \`\`\`
  572 | `;
  573 | 	try {
  574 | 		mkdirSync(projectState, { recursive: true });
  575 | 		writeFileSync(join(projectState, "project.json"), '{"version":1,"inputs":{}}\n');
  576 | 		writeFileSync(
  577 | 			reportPath,
  578 | 			readFileSync(join(legacyArtifactsDirectory, "native-preview-fixture.amx"), "utf8")
  579 | 		);
  580 | 		writeFileSync(resourcePath, resourceSource);
  581 | 		const browser = await chromium.connectOverCDP(cdpUrl);
  582 | 		const page = browser.contexts().flatMap(context => context.pages())
  583 | 			.find(candidate => candidate.url().startsWith("views://mainview/"));
  584 | 		if (!page) throw new Error("The stable package WebView2 page was not found through CDP.");
  585 | 		const cdp = await page.context().newCDPSession(page);
  586 | 		await cdp.send("HeapProfiler.enable");
  587 | 		await cdp.send("Performance.enable");
  588 | 		await cdp.send("HeapProfiler.collectGarbage");
  589 | 		const baselineMetrics = await cdp.send("Performance.getMetrics");
  590 | 		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  591 | 		if (!baselineHeap) throw new Error("The packaged WebView2 did not report baseline JSHeapUsedSize.");
  592 | 		const opened = await page.locator("#app").evaluate(async (element, paths) => {
  593 | 			type NativeRpc = {
  594 | 				request: {
  595 | 					openProject(params: { path: string }): Promise<{ ok: boolean }>;
  596 | 					openDocument(params: { path: string }): Promise<{ ok: boolean }>;
  597 | 				};
  598 | 			};
  599 | 			type VueRoot = HTMLElement & { _vnode?: { component?: { props?: { rpc?: NativeRpc } } } };
  600 | 			const component = (element as VueRoot)._vnode?.component;
  601 | 			const rpc = component?.props?.rpc;
  602 | 			if (!rpc?.request?.openProject || !rpc.request.openDocument) throw new Error("The packaged desktop RPC bridge is unavailable.");
  603 | 			const projectResult = await rpc.request.openProject({ path: paths.project });
  604 | 			if (!projectResult.ok) return { projectOpened: false, documentOpened: false };
  605 | 			const documentResult = await rpc.request.openDocument({ path: paths.report });
  606 | 			return { projectOpened: projectResult.ok, documentOpened: documentResult.ok };
  607 | 		}, { project, report: reportPath });
  608 | 		expect(opened).toEqual({ projectOpened: true, documentOpened: true });
  609 | 		await page.reload();
  610 | 		const recentProject = page.getByRole("button", { name: project });
  611 | 		await expect(recentProject).toBeVisible({ timeout: 10_000 });
  612 | 		await recentProject.click();
  613 | 		await page.getByRole("button", { name: "Refresh preview" }).click();
  614 | 		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
  615 | 		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  616 | 		await expect(page.locator(".preview-pane .state").last()).toHaveText("success", { timeout: 10_000 });
  617 | 		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
  618 | 		await expect(frame.locator("[data-openamx-diagram]")).toHaveCount(2);
  619 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
  620 | 			const slider = element as HTMLInputElement;
  621 | 			slider.value = "1";
  622 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  623 | 		});
  624 | 		await expect(frame.locator("[data-openamx-diagram]").nth(0).getByRole("alert")).toContainText("AMXD011");
  625 | 		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
  626 | 		await expect(frame.locator("[data-openamx-diagram]").nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "10");
  627 | 		await frame.locator("[data-openamx-diagram]").nth(1).getByRole("slider").evaluate(element => {
  628 | 			const slider = element as HTMLInputElement;
  629 | 			slider.value = "0.5";
  630 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
```