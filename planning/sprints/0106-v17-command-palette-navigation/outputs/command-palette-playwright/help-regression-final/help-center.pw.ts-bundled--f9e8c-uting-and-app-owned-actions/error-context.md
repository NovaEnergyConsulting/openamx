# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: help-center.pw.ts >> bundled help keeps stable topics, local search, registry shortcuts, routing, and app-owned actions
- Location: tests\ui\help-center.pw.ts:42:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: 'Commands' }).getByRole('button', { name: 'Release notes' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Fail next preview" [ref=e4] [cursor=pointer]
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: OpenAMX - V0.16.1
      - generic [ref=e8]: Welcome
      - button "Help and shortcuts" [ref=e9] [cursor=pointer]
      - button "Preferences" [ref=e13] [cursor=pointer]
      - button "Commands" [ref=e17] [cursor=pointer]
    - region "Welcome to OpenAMX" [ref=e18]:
      - paragraph [ref=e19]: OPENAMX WORKBENCH
      - heading "Open or create a project" [level=1] [ref=e20]
      - paragraph [ref=e21]: Create a project in an empty folder, open an existing project or choose a recent project from the list below.
      - generic [ref=e22]:
        - button "Open project" [ref=e23] [cursor=pointer]
        - button "Create project" [ref=e24] [cursor=pointer]
      - status [ref=e25]: Open a project and an .amx file to begin.
      - region "Recent projects" [ref=e26]:
        - generic [ref=e27]: RECENT PROJECTS
        - paragraph [ref=e29]: No validated recent projects.
      - generic [ref=e30]: "Recovery: no snapshots to restore"
      - generic [ref=e32]:
        - button "Help and shortcuts" [ref=e33] [cursor=pointer]
        - button "Release notes" [ref=e34] [cursor=pointer]
    - dialog "Commands" [ref=e36]:
      - textbox "Search commands" [active] [ref=e37]:
        - /placeholder: Find a command
        - text: Release notes
      - listbox "Commands" [ref=e38]:
        - option "Release notes" [selected] [ref=e39] [cursor=pointer]
      - button "Close" [ref=e40] [cursor=pointer]
```

# Test source

```ts
  12  | 	["language-v0.14", "language v0.14 is type check structural record enum list optional nullable measurement dimension PI E sin cos tan asin acos atan sinh cosh tanh asinh acosh atanh ln log exp len trim left right format Unicode code points locale grouping percent currency AMXSL001 AMXSL002 AMXSL003 AMXSL004 AMXSL005 AMXSL006"],
  13  | 	["language-v0.16", "language v0.16 function body function bodies statements braced expression body return AMXF4001 AMXF4002 AMX3002 AMX3006 lexical local scope parameter list copy deep nested array loop fallback"],
  14  | 	["language-v0.12", "language v0.12 record inheritance extends override effective fields enum enumeration primitive values braced if expression statement return AMX3011 AMX3021"],
  15  | 	["language-v0.9", "v0.9 migration record constructor equals = colon annotation string escape interpolation list index dimension unit measurement conversion JSON CSV"],
  16  | 	["documents", "active tab import source editor save intelligence rename"],
  17  | 	["data", "csv json external private mapping schema validation"],
  18  | 	["preview-export", "run preview cancel stale html offline interactive charts legend zoom static pdf data table docx json csv"],
  19  | 	["recovery", "conflict autosave crash restore discard recovery"],
  20  | 	["diagnostics", "logs export privacy path secret credential source input"],
  21  | 	["release-notes", "version changes release notes feature"]
  22  | ];
  23  | 
  24  | async function openHelp(page: Page, width: number, height: number) {
  25  | 	await page.setViewportSize({ width, height });
  26  | 	await page.goto("/");
  27  | 	await page.locator("button[aria-label='Help and shortcuts']").click();
  28  | 	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toBeVisible();
  29  | }
  30  | 
  31  | async function dialogBounds(page: Page) {
  32  | 	return page.locator(".help-dialog").evaluate(element => {
  33  | 		const { x, y, width, height } = element.getBoundingClientRect();
  34  | 		return { x, y, width, height };
  35  | 	});
  36  | }
  37  | 
  38  | async function captureHelp(page: Page, testInfo: TestInfo, name: string) {
  39  | 	await page.screenshot({ path: testInfo.outputPath(name), animations: "disabled", style: "#fail-next-preview { display: none !important; }" });
  40  | }
  41  | 
  42  | test("bundled help keeps stable topics, local search, registry shortcuts, routing, and app-owned actions", async ({ page }) => {
  43  | 	const externalRequests: string[] = [];
  44  | 	page.on("request", request => {
  45  | 		if (new URL(request.url()).origin !== "http://127.0.0.1:4183") externalRequests.push(request.url());
  46  | 	});
  47  | 	await openHelp(page, 1440, 900);
  48  | 	const topicButtons = page.locator(".help-topics [data-topic-id]");
  49  | 	await expect(topicButtons).toHaveCount(expectedTopicIds.length);
  50  | 	await expect(topicButtons.evaluateAll(elements => elements.map(element => element.getAttribute("data-topic-id")))).resolves.toEqual(expectedTopicIds);
  51  | 
  52  | 	const search = page.getByRole("searchbox", { name: "Search help and commands" });
  53  | 	await search.fill("imports");
  54  | 	await expect(page.locator(".help-topics [data-topic-id='language']")).toBeVisible();
  55  | 	await expect(page.locator(".help-topics [data-topic-id='documents']")).toBeVisible();
  56  | 	for (const [id, terms] of expectedSearchTerms) {
  57  | 		await search.fill(terms);
  58  | 		await expect(page.locator(`.help-topics [data-topic-id='${id}']`), `${id} search terms`).toBeVisible();
  59  | 	}
  60  | 	await search.fill("offline");
  61  | 	const previewTopic = page.locator(".help-topics [data-topic-id='preview-export']");
  62  | 	await previewTopic.click();
  63  | 	await expect(page.locator(".help-content")).toContainText("PDF charts are static");
  64  | 	await expect(page.locator(".help-content")).toContainText("PDF charts are static with complete data tables");
  65  | 	await search.fill("measurement conversion");
  66  | 	const v09Topic = page.locator(".help-topics [data-topic-id='language-v0.9']");
  67  | 	const v012Topic = page.locator(".help-topics [data-topic-id='language-v0.12']");
  68  | 	await search.fill("effective fields");
  69  | 	await expect(v012Topic).toBeVisible();
  70  | 	await v012Topic.click();
  71  | 	await expect(page.locator(".help-content")).toContainText("does not make the child assignable to its parent");
  72  | 	await expect(page.locator(".help-content")).toContainText("numbering starts at 1");
  73  | 	await expect(page.locator(".help-content")).toContainText("explicit value return on every path");
  74  | 	await expect(page.locator(".help-content")).toContainText("Branch declarations stay local");
  75  | 	await search.fill("loop");
  76  | 	const v013Topic = page.locator(".help-topics [data-topic-id='language-v0.13']");
  77  | 	await expect(v013Topic).toBeVisible();
  78  | 	await v013Topic.click();
  79  | 	await expect(page.locator(".help-content")).toContainText("start paused at the interval's lower bound");
  80  | 	await expect(page.locator(".help-content")).toContainText("PDF titles and descriptions are visible and searchable");
  81  | 	await expect(page.locator(".help-content")).toContainText("no screen-reader, minimum-host, or cross-platform qualification");
  82  | 	await search.fill("code points");
  83  | 	const v014Topic = page.locator(".help-topics [data-topic-id='language-v0.14']");
  84  | 	await expect(v014Topic).toBeVisible();
  85  | 	await v014Topic.click();
  86  | 	await expect(page.locator(".help-content")).toContainText("A valid mismatch returns false");
  87  | 	await expect(page.locator(".help-content")).toContainText("dimensionless Measurements");
  88  | 	await expect(page.locator(".help-content")).toContainText("Unicode 15.1 White_Space");
  89  | 	await expect(page.locator(".help-content")).toContainText("Integrated acceptance, release, and publication remain separate");
  90  | 	await search.fill("function body");
  91  | 	const v016Topic = page.locator(".help-topics [data-topic-id='language-v0.16']");
  92  | 	await expect(v016Topic).toBeVisible();
  93  | 	await v016Topic.click();
  94  | 	await expect(page.locator(".help-content")).toContainText("AMXF4001 marks missing return at the closing brace");
  95  | 	await expect(page.locator(".help-content")).toContainText("independent recursive array copy");
  96  | 	await expect(page.locator(".help-content")).toContainText("docs/language-spec-v0.16.md");
  97  | 	await expect(page.locator(".help-content")).toContainText("examples/15_Function_Bodies.amx");
  98  | 	await search.fill("measurement conversion");
  99  | 	await expect(v09Topic).toBeVisible();
  100 | 	await v09Topic.click();
  101 | 	await expect(page.locator(".help-content")).toContainText("Record constructor fields use =");
  102 | 	await expect(page.locator(".help-content")).toContainText("List indexes are 1-based");
  103 | 	await search.fill("Ctrl/Cmd+S");
  104 | 	await expect(page.locator(".help-shortcuts")).toContainText("Save active tab");
  105 | 	await expect(page.locator(".help-shortcuts")).toContainText("Ctrl/Cmd+S");
  106 | 	await expect(search).toHaveValue("Ctrl/Cmd+S");
  107 | 	await search.fill("");
  108 | 	await page.keyboard.press("Escape");
  109 | 
  110 | 	await page.keyboard.press("Control+Shift+P");
  111 | 	await page.getByRole("textbox", { name: "Search commands" }).fill("Release notes");
> 112 | 	await page.getByRole("dialog", { name: "Commands" }).getByRole("button", { name: "Release notes" }).click();
      |                                                                                                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  113 | 	await expect(page.locator(".help-topics [data-topic-id='release-notes']")).toHaveAttribute("aria-current", "page");
  114 | 
  115 | 	await page.goto("/?help-section=language");
  116 | 	await expect(page.locator(".help-topics [data-topic-id='language']")).toHaveAttribute("aria-current", "page");
  117 | 	await page.goto("/?help-section=not-a-topic");
  118 | 	await expect(page.locator(".help-topics [data-topic-id='getting-started']")).toHaveAttribute("aria-current", "page");
  119 | 
  120 | 	await page.goto("/");
  121 | 	await page.locator("button[aria-label='Help and shortcuts']").click();
  122 | 	await page.getByRole("button", { name: "Create a project with Hello OpenAMX" }).click();
  123 | 	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toHaveCount(0);
  124 | 	await expect(page.getByRole("status")).toContainText("Created a starter project");
  125 | 
  126 | 	await page.locator("button[aria-label='Help and shortcuts']").click();
  127 | 	const startersTopic = page.locator(".help-topics [data-topic-id='starters']");
  128 | 	await startersTopic.click();
  129 | 	await expect(page.locator(".help-content")).toContainText("numbered 00-15 guide");
  130 | 	const starterItems = page.locator(".starter-list .starter-item");
  131 | 	await expect(starterItems).toHaveCount(3);
  132 | 	await expect(starterItems.nth(0)).toContainText("Hello OpenAMX");
  133 | 	await expect(starterItems.nth(1)).toContainText("Operations note");
  134 | 	await expect(starterItems.nth(2)).toContainText("OpenAMX learning guide");
  135 | 	await expect(starterItems.nth(2).getByRole("button", { name: "Create guided project" })).toBeVisible();
  136 | 	await page.keyboard.press("Escape");
  137 | 
  138 | 	await page.locator("button[aria-label='Help and shortcuts']").click();
  139 | 	await page.locator(".help-topics [data-topic-id='diagnostics']").click();
  140 | 	const downloadPromise = page.waitForEvent("download");
  141 | 	await page.getByRole("button", { name: "Download diagnostic summary" }).click();
  142 | 	const download = await downloadPromise;
  143 | 	expect(download.suggestedFilename()).toBe("openamx-diagnostic-summary.json");
  144 | 	expect(externalRequests).toEqual([]);
  145 | });
  146 | 
  147 | test("help frame stays viewport-bounded with fixed chrome and a scrollable body", async ({ page }, testInfo) => {
  148 | 	for (const viewport of [
  149 | 		{ width: 1024, height: 720, name: "1024x720" },
  150 | 		{ width: 1440, height: 900, name: "1440x900" }
  151 | 	]) {
  152 | 		await openHelp(page, viewport.width, viewport.height);
  153 | 		const dialog = page.locator(".help-dialog");
  154 | 		const initial = await dialogBounds(page);
  155 | 		expect(initial.x).toBeGreaterThanOrEqual(0);
  156 | 		expect(initial.y).toBeGreaterThanOrEqual(0);
  157 | 		expect(initial.x + initial.width).toBeLessThanOrEqual(viewport.width);
  158 | 		expect(initial.y + initial.height).toBeLessThanOrEqual(viewport.height);
  159 | 		expect(initial.width).toBeGreaterThanOrEqual(viewport.width * 0.75);
  160 | 		expect(initial.width).toBeLessThanOrEqual(viewport.width * 0.81);
  161 | 		expect(initial.height).toBeGreaterThanOrEqual(viewport.height * 0.75);
  162 | 		expect(initial.height).toBeLessThanOrEqual(viewport.height * 0.81);
  163 | 
  164 | 		const header = await page.locator(".help-header").boundingBox();
  165 | 		const search = await page.locator(".help-search").boundingBox();
  166 | 		const footer = await page.locator(".help-footer").boundingBox();
  167 | 		const body = page.locator(".help-layout");
  168 | 		const scrollMetrics = await body.evaluate(element => ({ scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }));
  169 | 		expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
  170 | 		await captureHelp(page, testInfo, `sprint046-help-${viewport.name}.png`);
  171 | 		await body.evaluate(element => { element.scrollTop = element.scrollHeight; });
  172 | 		await expect.poll(() => body.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  173 | 		const chromeBounds = async () => Promise.all([".help-header", ".help-search", ".help-footer"].map(selector => page.locator(selector).boundingBox()));
  174 | 		const originalChrome = [header, search, footer];
  175 | 		for (const [index, bounds] of (await chromeBounds()).entries()) expect(Math.abs(bounds!.y - originalChrome[index]!.y)).toBeLessThanOrEqual(1);
  176 | 
  177 | 		const query = page.getByRole("searchbox", { name: "Search help and commands" });
  178 | 		for (const term of ["recovery", "preview", "no-such-help-topic"]) {
  179 | 			await query.fill(term);
  180 | 			expect(await dialogBounds(page), `${viewport.name} after ${term}`).toEqual(initial);
  181 | 			for (const [index, bounds] of (await chromeBounds()).entries()) expect(Math.abs(bounds!.y - originalChrome[index]!.y), `${viewport.name} chrome ${index} after ${term}`).toBeLessThanOrEqual(1);
  182 | 		}
  183 | 		if (viewport.name === "1024x720") console.log(`Help visual: ${viewport.name}; fixed frame ${Math.round(initial.width)}x${Math.round(initial.height)}; body ${scrollMetrics.clientHeight}px viewport / ${scrollMetrics.scrollHeight}px content.`);
  184 | 		await page.goto("about:blank");
  185 | 	}
  186 | });
  187 | 
```