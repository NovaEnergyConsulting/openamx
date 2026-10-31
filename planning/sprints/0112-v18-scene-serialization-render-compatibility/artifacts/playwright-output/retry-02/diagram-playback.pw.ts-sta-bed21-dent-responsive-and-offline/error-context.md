# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diagram-playback.pw.ts >> standalone local-file playback is paused, accessible, independent, responsive and offline
- Location: tests\ui\diagram-playback.pw.ts:201:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('[data-openamx-diagram]').first().locator('[data-diagram-time]')
Expected: "0"
Received: "0.000"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" locator('[data-openamx-diagram]').first().locator('[data-diagram-time]') with timeout 5000ms
  - waiting for locator('[data-openamx-diagram]').first().locator('[data-diagram-time]')
    13 × locator resolved to <output aria-live="polite" data-diagram-time="">0.000</output>
       - unexpected value "0.000"

```

```yaml
- status: "0.000"
```

# Test source

```ts
  121 |     cy: 30
  122 |     r: 4
  123 |     stroke: "#263238"
  124 |     lineWidth: 1
  125 |   }
  126 | }
  127 | \`\`\`
  128 | `;
  129 | 	const generated = `# Generated preview
  130 | 
  131 | \`\`\`amx
  132 | diagram generatedPreview {
  133 | 	title: "Generated preview"
  134 | 	description: "Three generated instances retain their own loop values"
  135 | 	width: 120
  136 | 	height: 60
  137 | 	time t from 0 to 1 duration 1
  138 | 	for item in [2, 5, 9] {
  139 | 		circle point {
  140 | 			cx: item * 10 + 20 * t
  141 | 			cy: 30
  142 | 			r: 4
  143 | 			stroke: "#263238"
  144 | 			lineWidth: 1
  145 | 		}
  146 | 	}
  147 | }
  148 | \`\`\`
  149 | `;
  150 | 	const failures = ["D-NEG-15", "D-NEG-22", "D-NEG-24"].map(id => ({
  151 | 		id,
  152 | 		source: withHealthyDiagram(fixture(id))
  153 | 	}));
  154 | 	const inputs = [
  155 | 		{ file: "combined.amx", source: combined, mode: "standalone" },
  156 | 		{ file: "VectorRotation-preview.amx", source: vectorRotation, mode: "preview" },
  157 | 		{ file: "stress.amx", source: stress, mode: "standalone" },
  158 | 		{ file: "quick.amx", source: quick, mode: "standalone" },
  159 | 		{ file: "generated-preview.amx", source: generated, mode: "preview" },
  160 | 		...failures.flatMap(({ id, source }) => [
  161 | 			{ file: `${id}.amx`, source, mode: "standalone" },
  162 | 			{ file: `${id}-preview.amx`, source, mode: "preview" }
  163 | 		])
  164 | 	];
  165 | 	const encodedInputs = JSON.stringify(inputs);
  166 | 	const script = `
  167 | import { writeFileSync } from "node:fs";
  168 | import { join } from "node:path";
  169 | import { parseDocumentText } from "./src/parser/parseDocument.ts";
  170 | import { evaluateDocumentEnvironment } from "./src/runtime/evaluateDocument.ts";
  171 | import { prepareReport } from "./src/renderer/reportPreparation.ts";
  172 | import { renderPreparedHtml } from "./src/renderer/renderHtml.ts";
  173 | const directory = ${JSON.stringify(directory)};
  174 | const inputs = JSON.parse(${JSON.stringify(encodedInputs)});
  175 | for (const input of inputs) {
  176 |   const file = join(directory, input.file);
  177 |   const document = parseDocumentText(input.source);
  178 |   const environment = evaluateDocumentEnvironment(document, file);
  179 |   const report = await prepareReport(document, environment, { file });
  180 |   const result = renderPreparedHtml(report, input.mode === "preview" ? { mode: "preview" } : { mode: "standalone" });
  181 |   const html = typeof result === "string" ? result : result.html;
  182 |   writeFileSync(file.replace(/\\.amx$/, ".html"), html);
  183 |   if (typeof result !== "string") writeFileSync(file.replace(/\\.amx$/, ".token"), result.previewToken);
  184 | }
  185 | `;
  186 | 	execFileSync("bun", ["-e", script], { cwd: repositoryRoot, stdio: "pipe" });
  187 | }
  188 | 
  189 | async function localRequests(page: Page, action: () => Promise<void>): Promise<string[]> {
  190 | 	const attempted: string[] = [];
  191 | 	const listener = (request: import("@playwright/test").Request) => {
  192 | 		if (/^(https?:|ws:|wss:)/i.test(request.url())) attempted.push(request.url());
  193 | 	};
  194 | 	page.on("request", listener);
  195 | 	await action();
  196 | 	await page.waitForTimeout(100);
  197 | 	page.off("request", listener);
  198 | 	return attempted;
  199 | }
  200 | 
  201 | test("standalone local-file playback is paused, accessible, independent, responsive and offline", async ({ page }) => {
  202 | 	const directory = mkdtempSync(join(tmpdir(), "openamx-diagram-html-"));
  203 | 	const browserErrors: string[] = [];
  204 | 	page.on("pageerror", error => browserErrors.push(error.message));
  205 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  206 | 	try {
  207 | 		createRenderedFixtures(directory);
  208 | 		const htmlPath = join(directory, "combined.html");
  209 | 		const attempted = await localRequests(page, async () => {
  210 | 			await page.goto(pathToFileURL(htmlPath).href);
  211 | 			await expect(page.locator("[data-openamx-diagram]")).toHaveCount(2);
  212 | 			await expect(page.locator("[data-openamx-diagram]").first().locator("figcaption strong")).toHaveText("Crank-slider mechanism");
  213 | 			await expect(page.locator("[data-openamx-diagram]").first().locator("svg *")).not.toHaveCount(0);
  214 | 		});
  215 | 		expect(attempted).toEqual([]);
  216 | 		const diagrams = page.locator("[data-openamx-diagram]");
  217 | 		const crank = diagrams.nth(0);
  218 | 		const battery = diagrams.nth(1);
  219 | 		const crankTime = crank.locator("[data-diagram-time]");
  220 | 		const crankPlay = crank.getByRole("button", { name: "Play Crank-slider mechanism" });
> 221 | 		await expect(crankTime).toHaveText("0");
      |                           ^ Error: expect(locator).toHaveText(expected) failed
  222 | 		await expect(crankPlay).toHaveText("Play");
  223 | 		await expect(crank.getByRole("checkbox", { name: "Loop Crank-slider mechanism" })).not.toBeChecked();
  224 | 		await expect(crank.locator('[data-diagram-element="crankPin"]')).toHaveAttribute("cx", "36");
  225 | 		await expect(crank.getByRole("img", { name: "Crank-slider mechanism" })).toBeVisible();
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
```