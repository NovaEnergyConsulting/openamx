# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagram-playback.pw.ts >> desktop preview bridge reports frame diagnostics in the active token-bound lifecycle
- Location: tests\ui\diagram-playback.pw.ts:472:1

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
  399 | 		p95FrameWorkMs,
  400 | 		attemptedNetworkRequests: attempted,
  401 | 		browserErrors,
  402 | 		comparison: evidence.s109Comparison,
  403 | 		staticExports: evidence.staticExports
  404 | 	};
  405 | 	writeFileSync(browserEvidencePath, `${JSON.stringify(browserEvidence, null, 2)}\n`, "utf8");
  406 | 	await page.screenshot({ path: join(artifactsDirectory, "64-cap-composition.png"), fullPage: true });
  407 | 	console.log(JSON.stringify(browserEvidence));
  408 | });
  409 | 
  410 | test("repeated loop emissions retain all models and stay within measured preview resource limits", async ({ page }) => {
  411 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-resource-"));
  412 | 	try {
  413 | 		createRenderedFixtures(directory);
  414 | 		const htmlPath = join(directory, "stress.html");
  415 | 		const bytes = Buffer.byteLength(readFileSync(htmlPath, "utf8"), "utf8");
  416 | 		expect(bytes).toBeLessThanOrEqual(1024 * 1024);
  417 | 		const cdp = await page.context().newCDPSession(page);
  418 | 		await cdp.send("HeapProfiler.enable");
  419 | 		await cdp.send("Performance.enable");
  420 | 		await cdp.send("HeapProfiler.collectGarbage");
  421 | 		const baselineMetrics = await cdp.send("Performance.getMetrics");
  422 | 		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  423 | 		if (!baselineHeap) throw new Error("Chromium did not report baseline JSHeapUsedSize.");
  424 | 		await page.goto(pathToFileURL(htmlPath).href);
  425 | 		const diagrams = page.locator("[data-openamx-diagram]");
  426 | 		await expect(diagrams).toHaveCount(17);
  427 | 		await expect(page.locator('[data-diagram-element^="point"]')).toHaveCount(17 * 32);
  428 | 
  429 | 		const wholePageNodes = await page.locator("*").count();
  430 | 		expect(wholePageNodes).toBeLessThanOrEqual(2000);
  431 | 		const frameSamples = await page.evaluate(() => {
  432 | 			const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-diagram-scrubber]"));
  433 | 			const samples: number[] = [];
  434 | 			for (let sample = 0; sample < 60; sample++) {
  435 | 				const start = performance.now();
  436 | 				for (const input of inputs) {
  437 | 					input.value = sample % 2 ? "0" : "1";
  438 | 					input.dispatchEvent(new Event("input", { bubbles: true }));
  439 | 				}
  440 | 				samples.push(performance.now() - start);
  441 | 			}
  442 | 			return samples;
  443 | 		});
  444 | 		const sortedSamples = [...frameSamples].sort((left, right) => left - right);
  445 | 		const p95 = sortedSamples[Math.ceil(sortedSamples.length * 0.95) - 1]!;
  446 | 		expect(p95).toBeLessThanOrEqual(16.7);
  447 | 
  448 | 		await cdp.send("HeapProfiler.collectGarbage");
  449 | 		const metrics = await cdp.send("Performance.getMetrics");
  450 | 		const heap = metrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  451 | 		if (!heap) throw new Error("Chromium did not report JSHeapUsedSize.");
  452 | 		const incrementalHeapBytes = Math.max(0, heap.value - baselineHeap.value);
  453 | 		expect(incrementalHeapBytes).toBeLessThanOrEqual(8 * 1024 * 1024);
  454 | 		console.log(JSON.stringify({
  455 | 			userAgent: await page.evaluate(() => navigator.userAgent),
  456 | 			hardwareConcurrency: await page.evaluate(() => navigator.hardwareConcurrency),
  457 | 			htmlBytes: bytes,
  458 | 			emittedDiagrams: await diagrams.count(),
  459 | 			emittedElements: await page.locator('[data-diagram-element^="point"]').count(),
  460 | 			wholePageNodes,
  461 | 			frameSamples,
  462 | 			p95FrameWorkMs: p95,
  463 | 			jsHeapUsedBytesAfterForcedGc: heap.value,
  464 | 			incrementalHeapBytes
  465 | 		}));
  466 | 		await cdp.detach();
  467 | 	} finally {
  468 | 		rmSync(directory, { recursive: true, force: true });
  469 | 	}
  470 | });
  471 | 
  472 | test("desktop preview bridge reports frame diagnostics in the active token-bound lifecycle", async ({ page }) => {
  473 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-desktop-bridge-"));
  474 | 	try {
  475 | 		createRenderedFixtures(directory);
  476 | 		await page.goto("/");
  477 | 		await page.getByRole("button", { name: "Open project" }).click();
  478 | 		await page.getByRole("button", { name: "Refresh preview" }).click();
  479 | 		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
  480 | 		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  481 | 		await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  482 | 		const original = await iframe.getAttribute("srcdoc");
  483 | 		if (!original) throw new Error("The workbench preview did not provide srcdoc.");
  484 | 		const token = original.match(/const token="([a-f0-9]{64})"/)?.[1];
  485 | 		if (!token) throw new Error("The active preview token was not found in trusted preview bootstrap.");
  486 | 		const vectorHtml = readFileSync(join(directory, "VectorRotation-preview.html"), "utf8")
  487 | 			.replace(/const token="[a-f0-9]{64}"/, `const token="${token}"`);
  488 | 		await iframe.evaluate((element, html) => { (element as HTMLIFrameElement).srcdoc = html; }, vectorHtml);
  489 | 		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
  490 | 		const vectorDiagram = frame.locator("[data-openamx-diagram]").first();
  491 | 		await expect(vectorDiagram).toBeVisible();
  492 | 		await expect(vectorDiagram.locator('[data-diagram-element="phaseA"]')).toHaveAttribute("x2", "350");
  493 | 		await expect(vectorDiagram.locator('[data-diagram-element="timeLabel"]')).toHaveText("Angle: 0");
  494 | 		await expect(vectorDiagram.locator("[data-diagram-error]")).toBeHidden();
  495 | 		await expect(page.locator(".runtime-status")).not.toContainText("DIAGRAM_RUNTIME");
  496 | 		const previewHtml = readFileSync(join(directory, "D-NEG-24-preview.html"), "utf8")
  497 | 			.replace(/const token="[a-f0-9]{64}"/, `const token="${token}"`);
  498 | 		await iframe.evaluate((element, html) => { (element as HTMLIFrameElement).srcdoc = html; }, previewHtml);
> 499 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
      |                                                                            ^ Error: locator.evaluate: Test timeout of 30000ms exceeded.
  500 | 			const slider = element as HTMLInputElement;
  501 | 			slider.value = "1";
  502 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  503 | 		});
  504 | 		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
  505 | 		await expect(page.locator('iframe[title="OpenAMX live HTML preview"]').last()).toHaveAttribute("sandbox", "allow-scripts");
  506 | 		await page.getByRole("button", { name: "Details" }).click();
  507 | 		await expect(page.locator(".runtime-details [role=alert]")).toContainText("AMXD011");
  508 | 		await expect(page.locator(".runtime-details [role=alert]")).toContainText(":14:8");
  509 | 		await page.screenshot({ path: join(artifactsDirectory, "desktop-preview-harness-diagram-error.png"), fullPage: true });
  510 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("button", { name: /Reset/ }).click();
  511 | 		await expect(page.locator(".runtime-details [role=alert]")).toHaveCount(0);
  512 | 	} finally {
  513 | 		rmSync(directory, { recursive: true, force: true });
  514 | 	}
  515 | });
  516 | 
  517 | test("stable packaged desktop preview runs diagrams in its sandboxed WebView2 host", async () => {
  518 | 	test.skip(!process.env.OPENAMX_NATIVE_CDP_URL, "Requires a running stable package with a test-only WebView2 CDP endpoint.");
  519 | 	const cdpUrl = process.env.OPENAMX_NATIVE_CDP_URL!;
  520 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-native-package-"));
  521 | 	const project = join(directory, "project");
  522 | 	const projectState = join(project, ".openamx");
  523 | 	const reportPath = join(project, "report.amx");
  524 | 	const resourcePath = join(project, "resource.amx");
  525 | 	const repeatedElements = Array.from({ length: 32 }, (_, index) => `  circle point${index} {
  526 |     cx: item + ${index}
  527 |     cy: 30
  528 |     r: 1
  529 |     stroke: "#263238"
  530 |     lineWidth: 1
  531 |   }`).join("\n");
  532 | 	const resourceSource = `# Native repeated-emission workload
  533 | 
  534 | \`\`\`amx
  535 | for item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] {
  536 |   diagram repeated {
  537 |     title: "Repeated diagram"
  538 |     description: "A repeated emission measured in the stable desktop package."
  539 |     width: 100
  540 |     height: 60
  541 |     time t from 0 to 1 duration 1
  542 | ${repeatedElements}
  543 |   }
  544 | }
  545 | \`\`\`
  546 | `;
  547 | 	try {
  548 | 		mkdirSync(projectState, { recursive: true });
  549 | 		writeFileSync(join(projectState, "project.json"), '{"version":1,"inputs":{}}\n');
  550 | 		writeFileSync(
  551 | 			reportPath,
  552 | 			readFileSync(join(legacyArtifactsDirectory, "native-preview-fixture.amx"), "utf8")
  553 | 		);
  554 | 		writeFileSync(resourcePath, resourceSource);
  555 | 		const browser = await chromium.connectOverCDP(cdpUrl);
  556 | 		const page = browser.contexts().flatMap(context => context.pages())
  557 | 			.find(candidate => candidate.url().startsWith("views://mainview/"));
  558 | 		if (!page) throw new Error("The stable package WebView2 page was not found through CDP.");
  559 | 		const cdp = await page.context().newCDPSession(page);
  560 | 		await cdp.send("HeapProfiler.enable");
  561 | 		await cdp.send("Performance.enable");
  562 | 		await cdp.send("HeapProfiler.collectGarbage");
  563 | 		const baselineMetrics = await cdp.send("Performance.getMetrics");
  564 | 		const baselineHeap = baselineMetrics.metrics.find(metric => metric.name === "JSHeapUsedSize");
  565 | 		if (!baselineHeap) throw new Error("The packaged WebView2 did not report baseline JSHeapUsedSize.");
  566 | 		const opened = await page.locator("#app").evaluate(async (element, paths) => {
  567 | 			type NativeRpc = {
  568 | 				request: {
  569 | 					openProject(params: { path: string }): Promise<{ ok: boolean }>;
  570 | 					openDocument(params: { path: string }): Promise<{ ok: boolean }>;
  571 | 				};
  572 | 			};
  573 | 			type VueRoot = HTMLElement & { _vnode?: { component?: { props?: { rpc?: NativeRpc } } } };
  574 | 			const component = (element as VueRoot)._vnode?.component;
  575 | 			const rpc = component?.props?.rpc;
  576 | 			if (!rpc?.request?.openProject || !rpc.request.openDocument) throw new Error("The packaged desktop RPC bridge is unavailable.");
  577 | 			const projectResult = await rpc.request.openProject({ path: paths.project });
  578 | 			if (!projectResult.ok) return { projectOpened: false, documentOpened: false };
  579 | 			const documentResult = await rpc.request.openDocument({ path: paths.report });
  580 | 			return { projectOpened: projectResult.ok, documentOpened: documentResult.ok };
  581 | 		}, { project, report: reportPath });
  582 | 		expect(opened).toEqual({ projectOpened: true, documentOpened: true });
  583 | 		await page.reload();
  584 | 		const recentProject = page.getByRole("button", { name: project });
  585 | 		await expect(recentProject).toBeVisible({ timeout: 10_000 });
  586 | 		await recentProject.click();
  587 | 		await page.getByRole("button", { name: "Refresh preview" }).click();
  588 | 		const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
  589 | 		await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  590 | 		await expect(page.locator(".preview-pane .state").last()).toHaveText("success", { timeout: 10_000 });
  591 | 		const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]').last();
  592 | 		await expect(frame.locator("[data-openamx-diagram]")).toHaveCount(2);
  593 | 		await frame.locator("[data-openamx-diagram]").nth(0).getByRole("slider").evaluate(element => {
  594 | 			const slider = element as HTMLInputElement;
  595 | 			slider.value = "1";
  596 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  597 | 		});
  598 | 		await expect(frame.locator("[data-openamx-diagram]").nth(0).getByRole("alert")).toContainText("AMXD011");
  599 | 		await expect(page.locator(".runtime-status").last()).toContainText("AMXD011");
```