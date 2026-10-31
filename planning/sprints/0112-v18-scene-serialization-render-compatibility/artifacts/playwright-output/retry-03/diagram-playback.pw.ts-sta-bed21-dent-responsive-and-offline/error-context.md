# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagram-playback.pw.ts >> standalone local-file playback is paused, accessible, independent, responsive and offline
- Location: tests\ui\diagram-playback.pw.ts:179:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - heading "Playback controls" [level=1] [ref=f1e2]
  - code [ref=f1e4]: "diagram quick { title: \"Quick diagram\" description: \"Short timeline for endpoint and loop acceptance.\" width: 100 height: 60 time t from 0 to 1 duration 0.18 circle point { cx: 10 + 80 * t cy: 30 r: 4 stroke: \"#263238\" lineWidth: 1 } }"
  - figure [ref=f1e5]:
    - generic [ref=f1e6]:
      - strong [ref=f1e7]: Quick diagram
      - generic [ref=f1e8]: Short timeline for endpoint and loop acceptance.
    - group "Playback controls for Quick diagram" [ref=f1e9]:
      - button "Pause Quick diagram" [active] [ref=f1e10]: Pause
      - button "Reset Quick diagram" [ref=f1e11]: Reset
      - generic [ref=f1e12]:
        - checkbox "Loop Quick diagram" [checked] [ref=f1e13]
        - text: Loop
      - generic [ref=f1e14]:
        - generic [ref=f1e15]: Time
        - slider "Time for Quick diagram" [ref=f1e16]: "0.185"
      - status [ref=f1e17]: "0.185"
    - img "Quick diagram" [ref=f1e18]
```

# Test source

```ts
  168 | 	const attempted: string[] = [];
  169 | 	const listener = (request: import("@playwright/test").Request) => {
  170 | 		if (/^(https?:|ws:|wss:)/i.test(request.url())) attempted.push(request.url());
  171 | 	};
  172 | 	page.on("request", listener);
  173 | 	await action();
  174 | 	await page.waitForTimeout(100);
  175 | 	page.off("request", listener);
  176 | 	return attempted;
  177 | }
  178 | 
  179 | test("standalone local-file playback is paused, accessible, independent, responsive and offline", async ({ page }) => {
  180 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-html-"));
  181 | 	const browserErrors: string[] = [];
  182 | 	page.on("pageerror", error => browserErrors.push(error.message));
  183 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  184 | 	try {
  185 | 		createRenderedFixtures(directory);
  186 | 		const htmlPath = join(directory, "combined.html");
  187 | 		const attempted = await localRequests(page, async () => {
  188 | 			await page.goto(pathToFileURL(htmlPath).href);
  189 | 			await expect(page.locator("[data-openamx-diagram]")).toHaveCount(2);
  190 | 			await expect(page.locator("[data-openamx-diagram]").first().locator("figcaption strong")).toHaveText("Crank-slider mechanism");
  191 | 			await expect(page.locator("[data-openamx-diagram]").first().locator("svg *")).not.toHaveCount(0);
  192 | 		});
  193 | 		expect(attempted).toEqual([]);
  194 | 		const diagrams = page.locator("[data-openamx-diagram]");
  195 | 		const crank = diagrams.nth(0);
  196 | 		const battery = diagrams.nth(1);
  197 | 		const crankTime = crank.locator("[data-diagram-time]");
  198 | 		const crankPlay = crank.getByRole("button", { name: "Play Crank-slider mechanism" });
  199 | 		await expect(crankTime).toHaveText("0.000");
  200 | 		await expect(crankPlay).toHaveText("Play");
  201 | 		await expect(crank.getByRole("checkbox", { name: "Loop Crank-slider mechanism" })).not.toBeChecked();
  202 | 		await expect(crank.locator('[data-diagram-element="crankPin"]')).toHaveAttribute("cx", "36");
  203 | 		await expect(crank.getByRole("img", { name: "Crank-slider mechanism" })).toBeVisible();
  204 | 		await expect(crank).toHaveAttribute("aria-describedby", /description/);
  205 | 		await page.keyboard.press("Tab");
  206 | 		await expect(crankPlay).toBeFocused();
  207 | 		expect(await crankPlay.evaluate(button => getComputedStyle(button).outlineStyle)).toBe("solid");
  208 | 		await page.keyboard.press("Enter");
  209 | 		await expect(crank.getByRole("button", { name: "Pause Crank-slider mechanism" })).toHaveText("Pause");
  210 | 		await page.keyboard.press("Space");
  211 | 		await expect(crankPlay).toHaveText("Play");
  212 | 
  213 | 		const crankScrubber = crank.getByRole("slider", { name: "Time for Crank-slider mechanism" });
  214 | 		await crankScrubber.evaluate(element => {
  215 | 			const slider = element as HTMLInputElement;
  216 | 			slider.value = "1";
  217 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  218 | 		});
  219 | 		await expect(crankTime).toHaveText("1.000");
  220 | 		await expect(crank.locator('[data-diagram-element="crankPin"]')).toHaveAttribute("cx", "104");
  221 | 		await crankPlay.focus();
  222 | 		await page.keyboard.press("Enter");
  223 | 		await expect(crank.getByRole("button", { name: "Pause Crank-slider mechanism" })).toHaveText("Pause");
  224 | 		await page.keyboard.press("Space");
  225 | 		await expect(crankPlay).toHaveText("Play");
  226 | 		await crank.getByRole("button", { name: "Reset Crank-slider mechanism" }).click();
  227 | 		await expect(crankTime).toHaveText("0.000");
  228 | 		await crankScrubber.evaluate(element => {
  229 | 			const slider = element as HTMLInputElement;
  230 | 			slider.value = "0.1234567";
  231 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  232 | 		});
  233 | 		await expect(crankTime).toHaveText("0.123");
  234 | 		await expect(crankScrubber).toHaveValue("0.1234567");
  235 | 		await expect(crankScrubber).toHaveAttribute("aria-valuetext", "0.123");
  236 | 
  237 | 		const batteryScrubber = battery.getByRole("slider", { name: "Time for Battery-resistor DC circuit" });
  238 | 		await batteryScrubber.evaluate(element => {
  239 | 			const slider = element as HTMLInputElement;
  240 | 			slider.value = "2";
  241 | 			slider.dispatchEvent(new Event("input", { bubbles: true }));
  242 | 		});
  243 | 		await expect(battery.locator("[data-diagram-time]")).toHaveText("2.000");
  244 | 		await expect(crankTime).toHaveText("0.123");
  245 | 		await expect(battery.locator('[data-diagram-element="currentIndicator"]')).toHaveAttribute("x1", "108");
  246 | 
  247 | 		const bounds = await crank.locator("svg").boundingBox();
  248 | 		if (!bounds) throw new Error("Crank SVG has no visible bounds.");
  249 | 		expect(bounds.width / bounds.height).toBeCloseTo(1.6, 1);
  250 | 		await page.screenshot({ path: join(artifactsDirectory, "standalone-diagram-playback.png"), fullPage: true });
  251 | 		await page.setViewportSize({ width: 420, height: 900 });
  252 | 		const resized = await crank.locator("svg").boundingBox();
  253 | 		if (!resized) throw new Error("Resized crank SVG has no visible bounds.");
  254 | 		expect(resized.width / resized.height).toBeCloseTo(1.6, 1);
  255 | 
  256 | 		await page.goto(pathToFileURL(join(directory, "quick.html")).href);
  257 | 		const quick = page.locator("[data-openamx-diagram]");
  258 | 		await quick.evaluate(root => {
  259 | 			const output = root.querySelector("[data-diagram-time]")!;
  260 | 			const windowState = window as Window & { __diagramTimes?: string[] };
  261 | 			windowState.__diagramTimes = [];
  262 | 			new MutationObserver(() => windowState.__diagramTimes?.push(output.textContent ?? ""))
  263 | 				.observe(output, { childList: true, characterData: true, subtree: true });
  264 | 		});
  265 | 		await quick.getByRole("checkbox", { name: "Loop Quick diagram" }).check();
  266 | 		await quick.getByRole("button", { name: "Play Quick diagram" }).click();
  267 | 		await page.waitForTimeout(550);
> 268 | 		expect(await quick.evaluate(root => (window as Window & { __diagramTimes?: string[] }).__diagramTimes?.includes("0"))).toBe(true);
      |                                                                                                                          ^ Error: expect(received).toBe(expected) // Object.is equality
  269 | 		await expect(quick.getByRole("button", { name: "Pause Quick diagram" })).toHaveText("Pause");
  270 | 		await quick.getByRole("button", { name: "Reset Quick diagram" }).click();
  271 | 		await quick.getByRole("checkbox", { name: "Loop Quick diagram" }).uncheck();
  272 | 		await quick.getByRole("button", { name: "Play Quick diagram" }).click();
  273 | 		await expect(quick.locator("[data-diagram-time]")).toHaveText("1.000", { timeout: 1500 });
  274 | 		await expect(quick.getByRole("button", { name: "Play Quick diagram" })).toHaveText("Play");
  275 | 		await expect(quick.locator('[data-diagram-element="point"]')).toHaveAttribute("cx", "90");
  276 | 	} finally {
  277 | 		rmSync(directory, { recursive: true, force: true });
  278 | 	}
  279 | });
  280 | 
  281 | test("AMXD009, AMXD010 and AMXD011 clear only the failed diagram and recover without stale geometry", async ({ page }) => {
  282 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-errors-"));
  283 | 	const browserErrors: string[] = [];
  284 | 	page.on("pageerror", error => browserErrors.push(error.message));
  285 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  286 | 	try {
  287 | 		createRenderedFixtures(directory);
  288 | 		const cases = [
  289 | 			{ id: "D-NEG-15", time: "2", diagnostic: "AMXD009", source: ":14:8" },
  290 | 			{ id: "D-NEG-22", time: "2", diagnostic: "AMXD010", source: ":14:8" },
  291 | 			{ id: "D-NEG-24", time: "1", diagnostic: "AMXD011", source: ":14:8" }
  292 | 		];
  293 | 		for (const item of cases) {
  294 | 			await page.goto(pathToFileURL(join(directory, `${item.id}.html`)).href);
  295 | 			const diagrams = page.locator("[data-openamx-diagram]");
  296 | 			await expect(diagrams).toHaveCount(2);
  297 | 			await expect(diagrams.nth(0).locator("svg *"), browserErrors.join("\n")).not.toHaveCount(0);
  298 | 			const failed = diagrams.nth(0);
  299 | 			await failed.getByRole("slider").evaluate((element, time) => {
  300 | 				const slider = element as HTMLInputElement;
  301 | 				slider.value = time;
  302 | 				slider.dispatchEvent(new Event("input", { bubbles: true }));
  303 | 			}, item.time);
  304 | 			await expect(failed.locator("[data-diagram-time]")).toHaveText(Number(item.time).toFixed(3));
  305 | 			const alert = failed.getByRole("alert");
  306 | 			await expect(alert).toContainText(item.diagnostic);
  307 | 			await expect(alert).toContainText(item.source);
  308 | 			if (item.diagnostic === "AMXD009") await expect(alert).toContainText("sqrt of negative value");
  309 | 			await expect(failed.locator("svg")).toHaveAttribute("aria-hidden", "true");
  310 | 			await expect(failed.locator("svg")).toBeEmpty();
  311 | 			await expect(diagrams.nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "10");
  312 | 			await diagrams.nth(1).getByRole("slider").evaluate(element => {
  313 | 				const slider = element as HTMLInputElement;
  314 | 				slider.value = "0.5";
  315 | 				slider.dispatchEvent(new Event("input", { bubbles: true }));
  316 | 			});
  317 | 			await expect(diagrams.nth(1).locator('[data-diagram-element="independentPoint"]')).toHaveAttribute("cx", "25");
  318 | 			if (item.id === "D-NEG-24") {
  319 | 				await page.screenshot({ path: join(artifactsDirectory, "standalone-diagram-frame-error.png"), fullPage: true });
  320 | 			}
  321 | 			await failed.getByRole("button", { name: /Reset/ }).click();
  322 | 			await expect(alert).toBeHidden();
  323 | 			await expect(failed.locator("svg")).not.toHaveAttribute("aria-hidden", "true");
  324 | 			await expect(failed.locator("svg").locator("*")).not.toHaveCount(0);
  325 | 		}
  326 | 	} finally {
  327 | 		rmSync(directory, { recursive: true, force: true });
  328 | 	}
  329 | });
  330 | 
  331 | test("generated composition matches in-process frames in standalone browser playback", async ({ page }) => {
  332 | 	const htmlPath = resolve(repositoryRoot, "planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/outputs/64-cap-composition.html");
  333 | 	const evidencePath = resolve(repositoryRoot, "planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/raw/production-composition.json");
  334 | 	const browserEvidencePath = join(rawArtifactsDirectory, "production-browser-measurements.json");
  335 | 	const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as CompositionEvidence;
  336 | 	const browserErrors: string[] = [];
  337 | 	page.on("pageerror", error => browserErrors.push(error.message));
  338 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  339 | 	const attempted = await localRequests(page, async () => {
  340 | 		await page.goto(pathToFileURL(htmlPath).href);
  341 | 		await expect(page.locator("[data-openamx-diagram]")).toHaveCount(evidence.workload.diagrams);
  342 | 	});
  343 | 	expect(attempted).toEqual([]);
  344 | 	expect(browserErrors).toEqual([]);
  345 | 	const diagrams = page.locator("[data-openamx-diagram]");
  346 | 	expect(await page.locator('[data-diagram-element="generatedPoint1"]').count()).toBe(64);
  347 | 	expect(await page.locator("[data-diagram-element]").count()).toBe(evidence.workload.totalFrameElements);
  348 | 	const wholePageNodes = await page.locator("*").count();
  349 | 	const scrubbers = page.locator("[data-diagram-scrubber]");
  350 | 
  351 | 	for (let timeIndex = 0; timeIndex < evidence.workload.requestedTimes.length; timeIndex++) {
  352 | 		const time = evidence.workload.requestedTimes[timeIndex]!;
  353 | 		for (let diagramIndex = 0; diagramIndex < evidence.workload.diagrams; diagramIndex++) {
  354 | 			const diagram = diagrams.nth(diagramIndex);
  355 | 			if (timeIndex > 0) {
  356 | 				await scrubbers.nth(diagramIndex).evaluate((element, value) => {
  357 | 					const slider = element as HTMLInputElement;
  358 | 					slider.value = String(value);
  359 | 					slider.dispatchEvent(new Event("input", { bubbles: true }));
  360 | 				}, time);
  361 | 			}
  362 | 			const actual = await diagram.locator("[data-diagram-element]").evaluateAll(nodes => nodes.map(node => ({
  363 | 				name: node.getAttribute("data-diagram-element") ?? "",
  364 | 				primitive: node.localName,
  365 | 				cx: Number(node.getAttribute("cx")),
  366 | 				cy: Number(node.getAttribute("cy")),
  367 | 				r: Number(node.getAttribute("r")),
  368 | 				stroke: node.getAttribute("stroke") ?? "",
```