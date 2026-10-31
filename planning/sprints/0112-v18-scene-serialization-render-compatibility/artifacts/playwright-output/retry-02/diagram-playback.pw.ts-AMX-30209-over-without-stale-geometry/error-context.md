# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagram-playback.pw.ts >> AMXD009, AMXD010 and AMXD011 clear only the failed diagram and recover without stale geometry
- Location: tests\ui\diagram-playback.pw.ts:303:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('[data-openamx-diagram]').first().locator('[data-diagram-time]')
Expected: "2"
Received: "2.000"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" locator('[data-openamx-diagram]').first().locator('[data-diagram-time]') with timeout 5000ms
  - waiting for locator('[data-openamx-diagram]').first().locator('[data-diagram-time]')
    14 × locator resolved to <output aria-live="polite" data-diagram-time="">2.000</output>
       - unexpected value "2.000"

```

```yaml
- status: "2.000"
```

# Test source

```ts
  226 | 		await expect(crank).toHaveAttribute("aria-describedby", /description/);
  227 | 		await page.keyboard.press("Tab");
  228 | 		await expect(crankPlay).toBeFocused();
  229 | 		expect(await crankPlay.evaluate(button => getComputedStyle(button).outlineStyle)).toBe("solid");
  230 | 		await page.keyboard.press("Enter");
  231 | 		await expect(crank.getByRole("button", { name: "Pause Crank-slider mechanism" })).toHaveText("Pause");
  232 | 		await page.keyboard.press("Space");
  233 | 		await expect(crankPlay).toHaveText("Play");
  234 | 
  235 | 		const crankScrubber = crank.getByRole("slider", { name: "Time for Crank-slider mechanism" });
  236 | 		await crankScrubber.evaluate(element => {
  237 | 			const slider = element as HTMLInputElement;
  238 | 			slider.value = "1";
  239 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  240 | 		});
  241 | 		await expect(crankTime).toHaveText("1");
  242 | 		await expect(crank.locator('[data-diagram-element="crankPin"]')).toHaveAttribute("cx", "104");
  243 | 		await crankPlay.focus();
  244 | 		await page.keyboard.press("Enter");
  245 | 		await expect(crank.getByRole("button", { name: "Pause Crank-slider mechanism" })).toHaveText("Pause");
  246 | 		await page.keyboard.press("Space");
  247 | 		await expect(crankPlay).toHaveText("Play");
  248 | 		await crank.getByRole("button", { name: "Reset Crank-slider mechanism" }).click();
  249 | 		await expect(crankTime).toHaveText("0");
  250 | 		await crankScrubber.evaluate(element => {
  251 | 			const slider = element as HTMLInputElement;
  252 | 			slider.value = "0.1234567";
  253 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  254 | 		});
  255 | 		await expect(crankTime).toHaveText("0.123");
  256 | 		await expect(crankScrubber).toHaveValue("0.1234567");
  257 | 		await expect(crankScrubber).toHaveAttribute("aria-valuetext", "0.123");
  258 | 
  259 | 		const batteryScrubber = battery.getByRole("slider", { name: "Time for Battery-resistor DC circuit" });
  260 | 		await batteryScrubber.evaluate(element => {
  261 | 			const slider = element as HTMLInputElement;
  262 | 			slider.value = "2";
  263 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  264 | 		});
  265 | 		await expect(battery.locator("[data-diagram-time]")).toHaveText("2");
  266 | 		await expect(crankTime).toHaveText("0.123");
  267 | 		await expect(battery.locator('[data-diagram-element="currentIndicator"]')).toHaveAttribute("x1", "108");
  268 | 
  269 | 		const bounds = await crank.locator("svg").boundingBox();
  270 | 		if (!bounds) throw new Error("Crank SVG has no visible bounds.");
  271 | 		expect(bounds.width / bounds.height).toBeCloseTo(1.6, 1);
  272 | 		await page.screenshot({ path: join(artifactsDirectory, "standalone-diagram-playback.png"), fullPage: true });
  273 | 		await page.setViewportSize({ width: 420, height: 900 });
  274 | 		const resized = await crank.locator("svg").boundingBox();
  275 | 		if (!resized) throw new Error("Resized crank SVG has no visible bounds.");
  276 | 		expect(resized.width / resized.height).toBeCloseTo(1.6, 1);
  277 | 
  278 | 		await page.goto(pathToFileURL(join(directory, "quick.html")).href);
  279 | 		const quick = page.locator("[data-openamx-diagram]");
  280 | 		await quick.evaluate(root => {
  281 | 			const output = root.querySelector("[data-diagram-time]")!;
  282 | 			const windowState = window as Window & { __diagramTimes?: string[] };
  283 | 			windowState.__diagramTimes = [];
  284 | 			new MutationObserver(() => windowState.__diagramTimes?.push(output.textContent ?? ""))
  285 | 				.observe(output, { childList: true, characterData: true, subtree: true });
  286 | 		});
  287 | 		await quick.getByRole("checkbox", { name: "Loop Quick diagram" }).check();
  288 | 		await quick.getByRole("button", { name: "Play Quick diagram" }).click();
  289 | 		await page.waitForTimeout(550);
  290 | 		expect(await quick.evaluate(root => (window as Window & { __diagramTimes?: string[] }).__diagramTimes?.includes("0"))).toBe(true);
  291 | 		await expect(quick.getByRole("button", { name: "Pause Quick diagram" })).toHaveText("Pause");
  292 | 		await quick.getByRole("button", { name: "Reset Quick diagram" }).click();
  293 | 		await quick.getByRole("checkbox", { name: "Loop Quick diagram" }).uncheck();
  294 | 		await quick.getByRole("button", { name: "Play Quick diagram" }).click();
  295 | 		await expect(quick.locator("[data-diagram-time]")).toHaveText("1", { timeout: 1500 });
  296 | 		await expect(quick.getByRole("button", { name: "Play Quick diagram" })).toHaveText("Play");
  297 | 		await expect(quick.locator('[data-diagram-element="point"]')).toHaveAttribute("cx", "90");
  298 | 	} finally {
  299 | 		rmSync(directory, { recursive: true, force: true });
  300 | 	}
  301 | });
  302 | 
  303 | test("AMXD009, AMXD010 and AMXD011 clear only the failed diagram and recover without stale geometry", async ({ page }) => {
  304 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-errors-"));
  305 | 	const browserErrors: string[] = [];
  306 | 	page.on("pageerror", error => browserErrors.push(error.message));
  307 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  308 | 	try {
  309 | 		createRenderedFixtures(directory);
  310 | 		const cases = [
  311 | 			{ id: "D-NEG-15", time: "2", diagnostic: "AMXD009", source: ":14:8" },
  312 | 			{ id: "D-NEG-22", time: "2", diagnostic: "AMXD010", source: ":14:8" },
  313 | 			{ id: "D-NEG-24", time: "1", diagnostic: "AMXD011", source: ":14:8" }
  314 | 		];
  315 | 		for (const item of cases) {
  316 | 			await page.goto(pathToFileURL(join(directory, `${item.id}.html`)).href);
  317 | 			const diagrams = page.locator("[data-openamx-diagram]");
  318 | 			await expect(diagrams).toHaveCount(2);
  319 | 			await expect(diagrams.nth(0).locator("svg *"), browserErrors.join("\n")).not.toHaveCount(0);
  320 | 			const failed = diagrams.nth(0);
  321 | 			await failed.getByRole("slider").evaluate((element, time) => {
  322 | 				const slider = element as HTMLInputElement;
  323 | 				slider.value = time;
  324 | 				slider.dispatchEvent(new Event("input", { bubbles: true }));
  325 | 			}, item.time);
> 326 | 			await expect(failed.locator("[data-diagram-time]")).toHaveText(item.time);
      |                                                        ^ Error: expect(locator).toHaveText(expected) failed
  327 | 			const alert = failed.getByRole("alert");
  328 | 			await expect(alert).toContainText(item.diagnostic);
  329 | 			await expect(alert).toContainText(item.source);
  330 | 			if (item.diagnostic === "AMXD009") await expect(alert).toContainText("sqrt of negative value");
  331 | 			await expect(failed.locator("svg")).toHaveAttribute("aria-hidden", "true");
  332 | 			await expect(failed.locator("svg")).toBeEmpty();
  333 | 			await expect(diagrams.nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "10");
  334 | 			await diagrams.nth(1).getByRole("slider").evaluate(element => {
  335 | 				const slider = element as HTMLInputElement;
  336 | 				slider.value = "0.5";
  337 | 				slider.dispatchEvent(new Event("input", { bubbles: true }));
  338 | 			});
  339 | 			await expect(diagrams.nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "25");
  340 | 			if (item.id === "D-NEG-24") {
  341 | 				await page.screenshot({ path: join(artifactsDirectory, "standalone-diagram-frame-error.png"), fullPage: true });
  342 | 			}
  343 | 			await failed.getByRole("button", { name: /Reset/ }).click();
  344 | 			await expect(alert).toBeHidden();
  345 | 			await expect(failed.locator("svg")).not.toHaveAttribute("aria-hidden", "true");
  346 | 			await expect(failed.locator("svg").locator("*")).not.toHaveCount(0);
  347 | 		}
  348 | 	} finally {
  349 | 		rmSync(directory, { recursive: true, force: true });
  350 | 	}
  351 | });
  352 | 
  353 | test("generated composition matches in-process frames in standalone browser playback", async ({ page }) => {
  354 | 	const htmlPath = resolve(repositoryRoot, "planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/outputs/64-cap-composition.html");
  355 | 	const evidencePath = resolve(repositoryRoot, "planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/raw/production-composition.json");
  356 | 	const browserEvidencePath = join(rawArtifactsDirectory, "production-browser-measurements.json");
  357 | 	const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as CompositionEvidence;
  358 | 	const browserErrors: string[] = [];
  359 | 	page.on("pageerror", error => browserErrors.push(error.message));
  360 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  361 | 	const attempted = await localRequests(page, async () => {
  362 | 		await page.goto(pathToFileURL(htmlPath).href);
  363 | 		await expect(page.locator("[data-openamx-diagram]")).toHaveCount(evidence.workload.diagrams);
  364 | 	});
  365 | 	expect(attempted).toEqual([]);
  366 | 	expect(browserErrors).toEqual([]);
  367 | 	const diagrams = page.locator("[data-openamx-diagram]");
  368 | 	expect(await page.locator('[data-diagram-element="generatedPoint1"]').count()).toBe(64);
  369 | 	expect(await page.locator("[data-diagram-element]").count()).toBe(evidence.workload.totalFrameElements);
  370 | 	const wholePageNodes = await page.locator("*").count();
  371 | 	const scrubbers = page.locator("[data-diagram-scrubber]");
  372 | 
  373 | 	for (let timeIndex = 0; timeIndex < evidence.workload.requestedTimes.length; timeIndex++) {
  374 | 		const time = evidence.workload.requestedTimes[timeIndex]!;
  375 | 		for (let diagramIndex = 0; diagramIndex < evidence.workload.diagrams; diagramIndex++) {
  376 | 			const diagram = diagrams.nth(diagramIndex);
  377 | 			if (timeIndex > 0) {
  378 | 				await scrubbers.nth(diagramIndex).evaluate((element, value) => {
  379 | 					const slider = element as HTMLInputElement;
  380 | 					slider.value = String(value);
  381 | 					slider.dispatchEvent(new Event("input", { bubbles: true }));
  382 | 				}, time);
  383 | 			}
  384 | 			const actual = await diagram.locator("[data-diagram-element]").evaluateAll(nodes => nodes.map(node => ({
  385 | 				name: node.getAttribute("data-diagram-element") ?? "",
  386 | 				primitive: node.localName,
  387 | 				cx: Number(node.getAttribute("cx")),
  388 | 				cy: Number(node.getAttribute("cy")),
  389 | 				r: Number(node.getAttribute("r")),
  390 | 				stroke: node.getAttribute("stroke") ?? "",
  391 | 				fill: node.getAttribute("fill") ?? "none",
  392 | 				lineWidth: Number(node.getAttribute("stroke-width"))
  393 | 			})));
  394 | 			expect(actual).toEqual(evidence.expectedFrames[diagramIndex]![timeIndex]);
  395 | 		}
  396 | 	}
  397 | 
  398 | 	const frameSamplesMs = await page.evaluate(() => {
  399 | 		const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-diagram-scrubber]"));
  400 | 		const samples: number[] = [];
  401 | 		for (let sample = 0; sample < 60; sample++) {
  402 | 			const start = performance.now();
  403 | 			for (const input of inputs) {
  404 | 				input.value = sample % 2 ? "0" : "1";
  405 | 				input.dispatchEvent(new Event("input", { bubbles: true }));
  406 | 			}
  407 | 			samples.push(performance.now() - start);
  408 | 		}
  409 | 		return samples;
  410 | 	});
  411 | 	const sortedSamples = [...frameSamplesMs].sort((left, right) => left - right);
  412 | 	const p95FrameWorkMs = sortedSamples[Math.ceil(sortedSamples.length * 0.95) - 1]!;
  413 | 	const browserEvidence = {
  414 | 		browser: await page.evaluate(() => ({ userAgent: navigator.userAgent, hardwareConcurrency: navigator.hardwareConcurrency })),
  415 | 		htmlBytes: Buffer.byteLength(readFileSync(htmlPath, "utf8"), "utf8"),
  416 | 		diagrams: await diagrams.count(),
  417 | 		frameElements: await page.locator("[data-diagram-element]").count(),
  418 | 		wholePageNodes,
  419 | 		requestedTimes: evidence.workload.requestedTimes,
  420 | 		frameSamplesMs,
  421 | 		p95FrameWorkMs,
  422 | 		attemptedNetworkRequests: attempted,
  423 | 		browserErrors,
  424 | 		comparison: evidence.s109Comparison,
  425 | 		staticExports: evidence.staticExports
  426 | 	};
```