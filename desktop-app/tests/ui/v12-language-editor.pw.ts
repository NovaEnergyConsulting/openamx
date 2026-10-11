import { expect, test, type Page } from "@playwright/test";

const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const lastAnalysis = (page: Page) => page.evaluate(() =>
	(window as Window & { __openamxHarnessSnapshot: () => { lastAnalysis?: { diagnostics: Array<{ code: string; line?: number; column?: number }>; symbols?: Array<{ name: string; declaration: boolean }> } } })
		.__openamxHarnessSnapshot().lastAnalysis
);

async function clickLastTextOccurrence(page: Page, value: string, control = false) {
	const point = await page.locator(".cm-content").evaluate((content, search) => {
		const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
		const nodes: Text[] = [];
		let combined = "";
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			if (!(node instanceof Text)) continue;
			nodes.push(node);
			combined += node.data;
		}
		const from = combined.lastIndexOf(search);
		if (from < 0) throw new Error(`Could not find ${search} in the editor.`);
		const to = from + search.length;
		let offset = 0;
		let start: { node: Text; offset: number } | undefined;
		let end: { node: Text; offset: number } | undefined;
		for (const node of nodes) {
			const next = offset + node.data.length;
			if (!start && from >= offset && from < next) start = { node, offset: from - offset };
			if (to > offset && to <= next) { end = { node, offset: to - offset }; break; }
			offset = next;
		}
		if (!start || !end) throw new Error(`Could not locate ${search} in the editor text nodes.`);
		const range = document.createRange();
		range.setStart(start.node, start.offset);
		range.setEnd(end.node, end.offset);
		const bounds = range.getBoundingClientRect();
		return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
	}, value);
	await page.mouse.click(point.x, point.y, { modifiers: control ? ["Control"] : [] });
}

async function selectedLine(page: Page) {
	return page.locator(".cm-content").evaluate(content => {
		const selection = window.getSelection();
		const anchor = selection?.anchorNode;
		const element = anchor instanceof Element ? anchor : anchor?.parentElement;
		return element?.closest(".cm-line")?.textContent ?? "";
	});
}

async function openWorkbench(page: Page, text: string) {
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const editor = sourceEditor(page);
	await editor.fill(text);
	return editor;
}

const validText = [
	"# V0.12 editor acceptance",
	"",
	"```amx",
	"type Identifier {",
	"  id: String",
	"}",
	"type Asset extends Identifier {",
	"  tag: String",
	"}",
	"enum Status = {",
	"  DRAFT,",
	"  ACTIVE",
	"}",
	'let asset: Asset = Asset { id = "A-1", tag = "pump" }',
	"let current: Number = Status.ACTIVE",
	"let selected: Number = if true {",
	"  return Status.ACTIVE",
	"} else {",
	"  return Status.DRAFT",
	"}",
	"```",
	""
].join("\n");

test("V0.12 syntax highlighting and enum-member navigation render in the desktop editor", async ({ page }) => {
	const editor = await openWorkbench(page, validText);
	await expect.poll(async () => page.locator(".amx-token-keyword").allTextContents()).toContain("extends");
	await expect.poll(async () => page.locator(".amx-token-declaration").allTextContents()).toContain("ACTIVE");
	await expect.poll(async () => page.locator(".amx-token-field").allTextContents()).toContain("id");
	await expect.poll(async () => page.locator(".amx-token-reference").allTextContents()).toContain("Status");
	await expect.poll(() => lastAnalysis(page)).toMatchObject({
		symbols: expect.arrayContaining([expect.objectContaining({ name: "ACTIVE", declaration: false })])
	});

	await clickLastTextOccurrence(page, "ACTIVE", true);
	await expect.poll(() => selectedLine(page)).toBe("  ACTIVE,");
});

test("V0.12 enum-member completion is available in the desktop editor", async ({ page }) => {
	const closeFence = validText.lastIndexOf("```");
	const completionText = `${validText.slice(0, closeFence)}let selectedStatus: Number = Status.\n${validText.slice(closeFence)}`;
	const editor = await openWorkbench(page, completionText);
	await expect.poll(() => page.locator(".amx-diagnostic").count()).toBeGreaterThan(0);
	await clickLastTextOccurrence(page, "Status.");
	await expect.poll(() => selectedLine(page)).toContain("Status.");
	await editor.press("End");
	await expect(page.locator(".cm-editor.cm-focused")).toHaveCount(1);
	await page.keyboard.press("Control+Space");
	await expect(page.locator(".cm-tooltip-autocomplete")).toContainText("ACTIVE");
});

test("V0.12 duplicate enum diagnostics are marked at the offending member in the desktop editor", async ({ page }) => {
	const invalidText = [
		"```amx",
		"enum Status = {",
		"  ACTIVE,",
		"  ACTIVE",
		"}",
		"```",
		""
	].join("\n");
	await openWorkbench(page, invalidText);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [{ code: "AMX3016", line: 4, column: 3 }] });
	const diagnostic = page.locator(".amx-diagnostic");
	await expect(diagnostic).toHaveCount(1);
	await expect(diagnostic).toHaveText("A");
	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? "")).toBe("  ACTIVE");
});
