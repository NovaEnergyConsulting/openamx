# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagram-playback.pw.ts >> desktop preview bridge reports frame diagnostics in the active token-bound lifecycle
- Location: tests\ui\diagram-playback.pw.ts:494:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.evaluate: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('iframe[title="OpenAMX live HTML preview"]').last().contentFrame().locator('[data-openamx-diagram]').first().getByRole('slider')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Fail next preview" [ref=e4] [cursor=pointer]
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: OpenAMX - V0.17.0
      - generic [ref=e8]: /sprint042-browser-fixture
      - button "Help and shortcuts" [ref=e9] [cursor=pointer]
      - button "Preferences" [ref=e13] [cursor=pointer]
      - button "Commands" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e20]:
        - complementary "Project explorer" [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: PROJECT
            - generic "0 folders, 5 files" [ref=e25]: 0/5
          - button "Project actions" [ref=e27] [cursor=pointer]
          - textbox "Search project files" [ref=e28]:
            - /placeholder: Search files
          - generic [ref=e29]:
            - button "/sprint042-browser-fixture, folder actions" [ref=e30] [cursor=pointer]: /sprint042-browser-fixture
            - button "report.amx amx" [ref=e31] [cursor=pointer]:
              - generic [ref=e32]: report.amx
              - generic [ref=e33]: amx
            - button "second.amx amx" [ref=e34] [cursor=pointer]:
              - generic [ref=e35]: second.amx
              - generic [ref=e36]: amx
            - button "styles.css css" [ref=e37] [cursor=pointer]:
              - generic [ref=e38]: styles.css
              - generic [ref=e39]: css
            - button "data.csv csv" [ref=e40] [cursor=pointer]:
              - generic [ref=e41]: data.csv
              - generic [ref=e42]: csv
            - button "data.json json" [ref=e43] [cursor=pointer]:
              - generic [ref=e44]: data.json
              - generic [ref=e45]: json
        - separator "Resize explorer" [ref=e46]
        - region "Document editor" [ref=e48]:
          - navigation "Open tabs" [ref=e49]:
            - generic [ref=e50]:
              - button "report.amx" [ref=e51] [cursor=pointer]
              - button "Close report.amx" [ref=e52] [cursor=pointer]: x
          - generic [ref=e53]:
            - strong [ref=e54]: /sprint042-browser-fixture/report.amx
            - generic [ref=e55]:
              - button "Find" [ref=e56] [cursor=pointer]
              - button "Format" [ref=e57] [cursor=pointer]
              - button "Save" [disabled] [ref=e58]
          - button "Show outline" [ref=e59] [cursor=pointer]
          - generic "OpenAMX source editor" [ref=e61]:
            - generic [ref=e63]:
              - generic [aria-hidden] [ref=e64]:
                - generic [ref=e65]:
                  - generic [ref=e66]: "1"
                  - generic [ref=e67]: "2"
                  - generic [ref=e68]: "3"
                  - generic [ref=e69]: "4"
                  - generic [ref=e70]: "5"
                  - generic [ref=e71]: "6"
                - generic [ref=e72]:
                  - generic [ref=e73]: ⌄
                  - generic [ref=e74]: ⌄
              - textbox "OpenAMX source" [ref=e75]:
                - generic [ref=e76]: "# Sprint 042 report"
                - generic [ref=e78]: "```amx"
                - generic [ref=e79]: "export let result: Number = 3"
                - generic [ref=e80]: "```"
        - separator "Resize editor and contextual pane" [ref=e82]
        - region "Active document context" [ref=e84]:
          - generic [ref=e85]:
            - tablist "Context view" [ref=e86]:
              - tab "Preview" [selected] [ref=e87] [cursor=pointer]
              - tab "Inputs" [ref=e91] [cursor=pointer]
            - generic [ref=e96]: success
            - generic [ref=e97]:
              - button "Pause live preview" [ref=e98] [cursor=pointer]
              - button "Refresh preview" [active] [ref=e102] [cursor=pointer]
              - button "Export active document" [ref=e108] [cursor=pointer]: Export
              - button "Report settings" [ref=e112] [cursor=pointer]
          - iframe [ref=e114]:
            - generic [ref=f3e1]:
              - heading "Current preview" [level=1] [ref=f3e2]
              - paragraph [ref=f3e3]: "3"
      - region "Runtime drawer" [ref=e115]:
        - generic [ref=e116]:
          - strong [ref=e117]: RUNTIME
          - generic [ref=e118]: idle
          - button "Run active document" [ref=e119] [cursor=pointer]
          - button "Details" [ref=e122] [cursor=pointer]
        - status [ref=e123]: Preview reflects the current buffer.
```

# Test source

```ts
  421 | 		p95FrameWorkMs,
  422 | 		attemptedNetworkRequests: attempted,
  423 | 		browserErrors,
  424 | 		comparison: evidence.s109Comparison,
  425 | 		staticExports: evidence.staticExports
  426 | 	};
  427 | 	writeFileSync(browserEvidencePath, `${JSON.stringify(browserEvidence, null, 2)}\n`, "utf8");
  428 | 	await page.screenshot({ path: join(artifactsDirectory, "64-cap-composition.png"), fullPage: true });
  429 | 	console.log(JSON.stringify(browserEvidence));
  430 | });
  431 | 
  432 | test("repeated loop emissions retain all models and stay within measured preview resource limits", async ({ page }) => {
  433 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-resource-"));
  434 | 	try {
  435 | 		createRenderedFixtures(directory);
  436 | 		const htmlPath = join(directory, "stress.html");
  437 | 		const bytes = Buffer.byteLength(readFileSync(htmlPath, "utf8"), "utf8");
  438 | 		expect(bytes).toBeLessThanOrEqual(1024 * 1024);
  439 | 		const cdp = await page.context().newCDPSession(page);
  440 | 		await cdp.send("HeapProfiler.enable");
  441 | 		await cdp.send("Performance.enable");
  442 | 		await cdp.send("HeapProfiler.collectGarbage");
  443 | 		const baselineMetrics = await cdp.send("Performance.getMetrics");
  444 | 		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  445 | 		if (!baselineHeap) throw new Error("Chromium did not report baseline JSHeapUsedSize.");
  446 | 		await page.goto(pathToFileURL(htmlPath).href);
  447 | 		const diagrams = page.locator("[data-openamx-diagram]");
  448 | 		await expect(diagrams).toHaveCount(17);
  449 | 		await expect(page.locator('[data-diagram-element^="point"]')).toHaveCount(17 * 32);
  450 | 
  451 | 		const wholePageNodes = await page.locator("*").count();
  452 | 		expect(wholePageNodes).toBeLessThanOrEqual(2000);
  453 | 		const frameSamples = await page.evaluate(() => {
  454 | 			const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-diagram-scrubber]"));
  455 | 			const samples: number[] = [];
  456 | 			for (let sample = 0; sample < 60; sample++) {
  457 | 				const start = performance.now();
  458 | 				for (const input of inputs) {
  459 | 					input.value = sample % 2 ? "0" : "1";
  460 | 					input.dispatchEvent(new Event("input", { bubbles: true }));
  461 | 				}
  462 | 				samples.push(performance.now() - start);
  463 | 			}
  464 | 			return samples;
  465 | 		});
  466 | 		const sortedSamples = [...frameSamples].sort((left, right) => left - right);
  467 | 		const p95 = sortedSamples[Math.ceil(sortedSamples.length * 0.95) - 1]!;
  468 | 		expect(p95).toBeLessThanOrEqual(16.7);
  469 | 
  470 | 		await cdp.send("HeapProfiler.collectGarbage");
  471 | 		const metrics = await cdp.send("Performance.getMetrics");
  472 | 		const heap = metrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  473 | 		if (!heap) throw new Error("Chromium did not report JSHeapUsedSize.");
  474 | 		const incrementalHeapBytes = Math.max(0, heap.value - baselineHeap.value);
  475 | 		expect(incrementalHeapBytes).toBeLessThanOrEqual(8 * 1024 * 1024);
  476 | 		console.log(JSON.stringify({
  477 | 			userAgent: await page.evaluate(() => navigator.userAgent),
  478 | 			hardwareConcurrency: await page.evaluate(() => navigator.hardwareConcurrency),
  479 | 			htmlBytes: bytes,
  480 | 			emittedDiagrams: await diagrams.count(),
  481 | 			emittedElements: await page.locator('[data-diagram-element^="point"]').count(),
  482 | 			wholePageNodes,
  483 | 			frameSamples,
  484 | 			p95FrameWorkMs: p95,
  485 | 			jsHeapUsedBytesAfterForcedGc: heap.value,
  486 | 			incrementalHeapBytes
  487 | 		}));
  488 | 		await cdp.detach();
  489 | 	} finally {
  490 | 		rmSync(directory, { recursive: true, force: true });
  491 | 	}
  492 | });
  493 | 
  494 | test("desktop preview bridge reports frame diagnostics in the active token-bound lifecycle", async ({ page }) => {
  495 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-desktop-bridge-"));
  496 | 	try {
  497 | 		createRenderedFixtures(directory);
  498 | 		await page.goto("/");
  499 | 		await page.getByRole("button", { name: "Open project" }).click();
  500 | 		await page.getByRole("button", { name: "Refresh preview" }).click();
  501 | 		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
  502 | 		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  503 | 		await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  504 | 		const original = await iframe.getAttribute("srcdoc");
  505 | 		if (!original) throw new Error("The workbench preview did not provide srcdoc.");
  506 | 		const token = original.match(/const token="([a-f0-9]{64})"/)?.[1];
  507 | 		if (!token) throw new Error("The active preview token was not found in trusted preview bootstrap.");
  508 | 		const vectorHtml = readFileSync(join(directory, "VectorRotation-preview.html"), "utf8")
  509 | 			.replace(/const token="[a-f0-9]{64}"/, `const token="${token}"`);
  510 | 		await iframe.evaluate((element, html) => { (element as HTMLIFrameElement).srcdoc = html; }, vectorHtml);
  511 | 		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
  512 | 		const vectorDiagram = frame.locator("[data-openamx-diagram]").first();
  513 | 		await expect(vectorDiagram).toBeVisible();
  514 | 		await expect(vectorDiagram.locator('[data-diagram-element="phaseA"]')).toHaveAttribute("x2", "350");
  515 | 		await expect(vectorDiagram.locator('[data-diagram-element="timeLabel"]')).toHaveText("Angle: 0");
  516 | 		await expect(vectorDiagram.locator("[data-diagram-error]")).toBeHidden();
  517 | 		await expect(page.locator(".runtime-status")).not.toContainText("DIAGRAM_RUNTIME");
  518 | 		const previewHtml = readFileSync(join(directory, "D-NEG-24-preview.html"), "utf8")
  519 | 			.replace(/const token="[a-f0-9]{64}"/, `const token="${token}"`);
  520 | 		await iframe.evaluate((element, html) => { (element as HTMLIFrameElement).srcdoc = html; }, previewHtml);
> 521 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
      |                                                                            ^ Error: locator.evaluate: Test timeout of 30000ms exceeded.
  522 | 			const slider = element as HTMLInputElement;
  523 | 			slider.value = "1";
  524 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  525 | 		});
  526 | 		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
  527 | 		await expect(page.locator('iframe[title="OpenAMX live HTML preview"]').last()).toHaveAttribute("sandbox", "allow-scripts");
  528 | 		await page.getByRole("button", { name: "Details" }).click();
  529 | 		await expect(page.locator(".runtime-details [role=alert]")).toContainText("AMXD011");
  530 | 		await expect(page.locator(".runtime-details [role=alert]")).toContainText(":14:8");
  531 | 		await page.screenshot({ path: join(artifactsDirectory, "desktop-preview-harness-diagram-error.png"), fullPage: true });
  532 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("button", { name: /Reset/ }).click();
  533 | 		await expect(page.locator(".runtime-details [role=alert]")).toHaveCount(0);
  534 | 	} finally {
  535 | 		rmSync(directory, { recursive: true, force: true });
  536 | 	}
  537 | });
  538 | 
  539 | test("stable packaged desktop preview runs diagrams in its sandboxed WebView2 host", async () => {
  540 | 	test.skip(!process.env.OPENAMX_NATIVE_CDP_URL, "Requires a running stable package with a test-only WebView2 CDP endpoint.");
  541 | 	const cdpUrl = process.env.OPENAMX_NATIVE_CDP_URL!;
  542 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-native-package-"));
  543 | 	const project = join(directory, "project");
  544 | 	const projectState = join(project, ".openamx");
  545 | 	const reportPath = join(project, "report.amx");
  546 | 	const resourcePath = join(project, "resource.amx");
  547 | 	const repeatedElements = Array.from({ length: 32 }, (_, index) => `  circle point${index} {
  548 |     cx: item + ${index}
  549 |     cy: 30
  550 |     r: 1
  551 |     stroke: "#263238"
  552 |     lineWidth: 1
  553 |   }`).join("\n");
  554 | 	const resourceSource = `# Native repeated-emission workload
  555 | 
  556 | \`\`\`amx
  557 | for item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] {
  558 |   diagram repeated {
  559 |     title: "Repeated diagram"
  560 |     description: "A repeated emission measured in the stable desktop package."
  561 |     width: 100
  562 |     height: 60
  563 |     time t from 0 to 1 duration 1
  564 | ${repeatedElements}
  565 |   }
  566 | }
  567 | \`\`\`
  568 | `;
  569 | 	try {
  570 | 		mkdirSync(projectState, { recursive: true });
  571 | 		writeFileSync(join(projectState, "project.json"), '{"version":1,"inputs":{}}\n');
  572 | 		writeFileSync(
  573 | 			reportPath,
  574 | 			readFileSync(join(legacyArtifactsDirectory, "native-preview-fixture.amx"), "utf8")
  575 | 		);
  576 | 		writeFileSync(resourcePath, resourceSource);
  577 | 		const browser = await chromium.connectOverCDP(cdpUrl);
  578 | 		const page = browser.contexts().flatMap(context => context.pages())
  579 | 			.find(candidate => candidate.url().startsWith("views://mainview/"));
  580 | 		if (!page) throw new Error("The stable package WebView2 page was not found through CDP.");
  581 | 		const cdp = await page.context().newCDPSession(page);
  582 | 		await cdp.send("HeapProfiler.enable");
  583 | 		await cdp.send("Performance.enable");
  584 | 		await cdp.send("HeapProfiler.collectGarbage");
  585 | 		const baselineMetrics = await cdp.send("Performance.getMetrics");
  586 | 		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  587 | 		if (!baselineHeap) throw new Error("The packaged WebView2 did not report baseline JSHeapUsedSize.");
  588 | 		const opened = await page.locator("#app").evaluate(async (element, paths) => {
  589 | 			type NativeRpc = {
  590 | 				request: {
  591 | 					openProject(params: { path: string }): Promise<{ ok: boolean }>;
  592 | 					openDocument(params: { path: string }): Promise<{ ok: boolean }>;
  593 | 				};
  594 | 			};
  595 | 			type VueRoot = HTMLElement & { _vnode?: { component?: { props?: { rpc?: NativeRpc } } } };
  596 | 			const component = (element as VueRoot)._vnode?.component;
  597 | 			const rpc = component?.props?.rpc;
  598 | 			if (!rpc?.request?.openProject || !rpc.request.openDocument) throw new Error("The packaged desktop RPC bridge is unavailable.");
  599 | 			const projectResult = await rpc.request.openProject({ path: paths.project });
  600 | 			if (!projectResult.ok) return { projectOpened: false, documentOpened: false };
  601 | 			const documentResult = await rpc.request.openDocument({ path: paths.report });
  602 | 			return { projectOpened: projectResult.ok, documentOpened: documentResult.ok };
  603 | 		}, { project, report: reportPath });
  604 | 		expect(opened).toEqual({ projectOpened: true, documentOpened: true });
  605 | 		await page.reload();
  606 | 		const recentProject = page.getByRole("button", { name: project });
  607 | 		await expect(recentProject).toBeVisible({ timeout: 10_000 });
  608 | 		await recentProject.click();
  609 | 		await page.getByRole("button", { name: "Refresh preview" }).click();
  610 | 		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
  611 | 		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  612 | 		await expect(page.locator(".preview-pane .state").last()).toHaveText("success", { timeout: 10_000 });
  613 | 		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
  614 | 		await expect(frame.locator("[data-openamx-diagram]")).toHaveCount(2);
  615 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
  616 | 			const slider = element as HTMLInputElement;
  617 | 			slider.value = "1";
  618 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  619 | 		});
  620 | 		await expect(frame.locator("[data-openamx-diagram]").nth(0).getByRole("alert")).toContainText("AMXD011");
  621 | 		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
```