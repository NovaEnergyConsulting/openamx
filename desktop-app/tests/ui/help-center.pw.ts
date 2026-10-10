import { expect, test, type Page, type TestInfo } from "@playwright/test";

const expectedTopicIds = [
	"getting-started", "starters", "language", "language-v0.12", "language-v0.9", "documents", "data",
	"preview-export", "recovery", "diagnostics", "release-notes"
];
const expectedSearchTerms = [
	["getting-started", "welcome first project starter create open"],
	["starters", "example templates hello asset management operation note"],
	["language", "language syntax code fence markdown let type function import export input record table chart cli"],
	["language-v0.12", "language v0.12 record inheritance extends override effective fields enum enumeration primitive values braced if expression statement return AMX3011 AMX3021"],
	["language-v0.9", "v0.9 migration record constructor equals = colon annotation string escape interpolation list index dimension unit measurement conversion JSON CSV"],
	["documents", "active tab import source editor save intelligence rename"],
	["data", "csv json external private mapping schema validation"],
	["preview-export", "run preview cancel stale html offline interactive charts legend zoom static pdf data table docx json csv"],
	["recovery", "conflict autosave crash restore discard recovery"],
	["diagnostics", "logs export privacy path secret credential source input"],
	["release-notes", "version changes release notes feature"]
];

async function openHelp(page: Page, width: number, height: number) {
	await page.setViewportSize({ width, height });
	await page.goto("/");
	await page.locator("button[aria-label='Help and shortcuts']").click();
	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toBeVisible();
}

async function dialogBounds(page: Page) {
	return page.locator(".help-dialog").evaluate(element => {
		const { x, y, width, height } = element.getBoundingClientRect();
		return { x, y, width, height };
	});
}

async function captureHelp(page: Page, testInfo: TestInfo, name: string) {
	await page.screenshot({ path: testInfo.outputPath(name), animations: "disabled", style: "#fail-next-preview { display: none !important; }" });
}

test("bundled help keeps stable topics, local search, registry shortcuts, routing, and app-owned actions", async ({ page }) => {
	const externalRequests: string[] = [];
	page.on("request", request => {
		if (new URL(request.url()).origin !== "http://127.0.0.1:4183") externalRequests.push(request.url());
	});
	await openHelp(page, 1440, 900);
	const topicButtons = page.locator(".help-topics [data-topic-id]");
	await expect(topicButtons).toHaveCount(expectedTopicIds.length);
	await expect(topicButtons.evaluateAll(elements => elements.map(element => element.getAttribute("data-topic-id")))).resolves.toEqual(expectedTopicIds);

	const search = page.getByRole("searchbox", { name: "Search help and commands" });
	await search.fill("imports");
	await expect(page.locator(".help-topics [data-topic-id='language']")).toBeVisible();
	await expect(page.locator(".help-topics [data-topic-id='documents']")).toBeVisible();
	for (const [id, terms] of expectedSearchTerms) {
		await search.fill(terms);
		await expect(page.locator(`.help-topics [data-topic-id='${id}']`), `${id} search terms`).toBeVisible();
	}
	await search.fill("offline");
	const previewTopic = page.locator(".help-topics [data-topic-id='preview-export']");
	await previewTopic.click();
	await expect(page.locator(".help-content")).toContainText("PDF charts are static");
	await expect(page.locator(".help-content")).toContainText("PDF charts are static with complete data tables");
	await search.fill("measurement conversion");
	const v09Topic = page.locator(".help-topics [data-topic-id='language-v0.9']");
	const v012Topic = page.locator(".help-topics [data-topic-id='language-v0.12']");
	await search.fill("effective fields");
	await expect(v012Topic).toBeVisible();
	await v012Topic.click();
	await expect(page.locator(".help-content")).toContainText("does not make the child assignable to its parent");
	await expect(page.locator(".help-content")).toContainText("numbering starts at 1");
	await expect(page.locator(".help-content")).toContainText("explicit value return on every path");
	await expect(page.locator(".help-content")).toContainText("Branch declarations stay local");
	await search.fill("measurement conversion");
	await expect(v09Topic).toBeVisible();
	await v09Topic.click();
	await expect(page.locator(".help-content")).toContainText("Record constructor fields use =");
	await expect(page.locator(".help-content")).toContainText("List indexes are 1-based");
	await search.fill("Ctrl/Cmd+S");
	await expect(page.locator(".help-shortcuts")).toContainText("Save active tab");
	await expect(page.locator(".help-shortcuts")).toContainText("Ctrl/Cmd+S");
	await expect(search).toHaveValue("Ctrl/Cmd+S");
	await search.fill("");
	await page.keyboard.press("Escape");

	await page.keyboard.press("Control+Shift+P");
	await page.getByRole("textbox", { name: "Search commands" }).fill("Release notes");
	await page.getByRole("dialog", { name: "Commands" }).getByRole("button", { name: "Release notes" }).click();
	await expect(page.locator(".help-topics [data-topic-id='release-notes']")).toHaveAttribute("aria-current", "page");

	await page.goto("/?help-section=language");
	await expect(page.locator(".help-topics [data-topic-id='language']")).toHaveAttribute("aria-current", "page");
	await page.goto("/?help-section=not-a-topic");
	await expect(page.locator(".help-topics [data-topic-id='getting-started']")).toHaveAttribute("aria-current", "page");

	await page.goto("/");
	await page.locator("button[aria-label='Help and shortcuts']").click();
	await page.getByRole("button", { name: "Create a project with Hello OpenAMX" }).click();
	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toHaveCount(0);
	await expect(page.getByRole("status")).toContainText("Created a starter project");
	await page.locator("button[aria-label='Help and shortcuts']").click();
	await page.locator(".help-topics [data-topic-id='diagnostics']").click();
	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("button", { name: "Download diagnostic summary" }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe("openamx-diagnostic-summary.json");
	expect(externalRequests).toEqual([]);
});

test("help frame stays viewport-bounded with fixed chrome and a scrollable body", async ({ page }, testInfo) => {
	for (const viewport of [
		{ width: 1024, height: 720, name: "1024x720" },
		{ width: 1440, height: 900, name: "1440x900" }
	]) {
		await openHelp(page, viewport.width, viewport.height);
		const dialog = page.locator(".help-dialog");
		const initial = await dialogBounds(page);
		expect(initial.x).toBeGreaterThanOrEqual(0);
		expect(initial.y).toBeGreaterThanOrEqual(0);
		expect(initial.x + initial.width).toBeLessThanOrEqual(viewport.width);
		expect(initial.y + initial.height).toBeLessThanOrEqual(viewport.height);
		expect(initial.width).toBeGreaterThanOrEqual(viewport.width * 0.75);
		expect(initial.width).toBeLessThanOrEqual(viewport.width * 0.81);
		expect(initial.height).toBeGreaterThanOrEqual(viewport.height * 0.75);
		expect(initial.height).toBeLessThanOrEqual(viewport.height * 0.81);

		const header = await page.locator(".help-header").boundingBox();
		const search = await page.locator(".help-search").boundingBox();
		const footer = await page.locator(".help-footer").boundingBox();
		const body = page.locator(".help-layout");
		const scrollMetrics = await body.evaluate(element => ({ scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }));
		expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
		await captureHelp(page, testInfo, `sprint046-help-${viewport.name}.png`);
		await body.evaluate(element => { element.scrollTop = element.scrollHeight; });
		await expect.poll(() => body.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
		const chromeBounds = async () => Promise.all([".help-header", ".help-search", ".help-footer"].map(selector => page.locator(selector).boundingBox()));
		const originalChrome = [header, search, footer];
		for (const [index, bounds] of (await chromeBounds()).entries()) expect(Math.abs(bounds!.y - originalChrome[index]!.y)).toBeLessThanOrEqual(1);

		const query = page.getByRole("searchbox", { name: "Search help and commands" });
		for (const term of ["recovery", "preview", "no-such-help-topic"]) {
			await query.fill(term);
			expect(await dialogBounds(page), `${viewport.name} after ${term}`).toEqual(initial);
			for (const [index, bounds] of (await chromeBounds()).entries()) expect(Math.abs(bounds!.y - originalChrome[index]!.y), `${viewport.name} chrome ${index} after ${term}`).toBeLessThanOrEqual(1);
		}
		if (viewport.name === "1024x720") console.log(`Help visual: ${viewport.name}; fixed frame ${Math.round(initial.width)}x${Math.round(initial.height)}; body ${scrollMetrics.clientHeight}px viewport / ${scrollMetrics.scrollHeight}px content.`);
		await page.goto("about:blank");
	}
});
