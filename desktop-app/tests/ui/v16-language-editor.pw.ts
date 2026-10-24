import { expect, test, type Page } from "@playwright/test";

const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const lastAnalysis = (page: Page) => page.evaluate(() => {
	const snapshot: unknown = Reflect.get(window, "__openamxHarnessSnapshot");
	if (typeof snapshot !== "function") return undefined;
	const result: unknown = snapshot();
	return typeof result === "object" && result !== null && "lastAnalysis" in result
		? result.lastAnalysis
		: undefined;
});

async function clickLastTextOccurrence(page: Page, value: string) {
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
		start.node.parentElement?.closest(".cm-line")?.scrollIntoView({ block: "center", inline: "nearest" });
		const bounds = range.getBoundingClientRect();
		return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
	}, value);
	await page.mouse.click(point.x, point.y);
}

async function selectedLine(page: Page) {
	return page.evaluate(() => {
		const selection = window.getSelection();
		const anchor = selection?.anchorNode;
		const element = anchor instanceof Element ? anchor : anchor?.parentElement;
		return element?.closest(".cm-line")?.textContent ?? "";
	});
}

test("desktop CodeMirror exposes V0.16 function editor services", async ({ page }) => {
	const source = [
		"# V0.16 function editor check",
		"",
		"```amx",
		"let caller: Number = 9",
		"fn double(value: Number): Number = value*2",
		"fn choose(value: Number, values: Number[]): Number {",
		"let total = value",
		"if value > 0 {",
		"  let branchOnly = total",
		"  let shadow = value",
		"  for value in values {",
		"    let loopLocal = value",
		"    ",
		"    return loopLocal",
		"  }",
		"  let afterLoop = value",
		"}",
		"return value",
		"let later = value",
		"}",
		"```",
		""
	].join("\n");
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const editor = sourceEditor(page);
	await editor.fill(source);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [] });
	await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain("return");
	await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain("value");
	await expect.poll(() => page.locator(".amx-token-type").allTextContents()).toContain("Number");
	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);

	await page.getByRole("button", { name: "Format", exact: true }).click();
	const formatted = await page.locator(".cm-content").innerText();
	await page.getByRole("button", { name: "Format", exact: true }).click();
	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);

	await clickLastTextOccurrence(page, "return loopLocal");
	await editor.press("Home");
	await editor.press("ArrowUp");
	await editor.press("Home");
	await page.keyboard.press("Control+Space");
	await expect.poll(() => lastAnalysis(page)).toMatchObject({
		completions: expect.arrayContaining(["value", "values", "total", "branchOnly", "shadow", "loopLocal"])
	});
	const loopCompletions = page.locator(".cm-tooltip-autocomplete");
	for (const label of ["value", "values", "total", "loopLocal"]) await expect(loopCompletions).toContainText(label);
	for (const absent of ["caller", "later"]) await expect(loopCompletions).not.toContainText(absent);

	await page.keyboard.press("Escape");
	await page.getByRole("button", { name: "Show outline" }).click();
	const outline = page.getByRole("navigation", { name: "Document outline" });
	await expect(outline).toContainText("choose");
	await expect(outline).toContainText("value");
	await expect(outline).toContainText("total");
	await expect(outline).toContainText("loopLocal");
	await outline.getByRole("button", { name: "Go to binding total" }).click();
	await expect.poll(() => selectedLine(page)).toContain("let total = value");

	await clickLastTextOccurrence(page, "value");
	await expect.poll(() => selectedLine(page)).toContain("let later = value");
	await page.keyboard.press("F12");
	await expect.poll(() => selectedLine(page)).toContain("fn choose(value: Number, values: Number[]): Number {");

	const invalid = [
		"😀 narrative",
		"```amx",
		"fn maybe(value: Number): Number {",
		"  if value > 0 {",
		"    return value",
		"  }",
		"}",
		"```",
		""
	].join("\r\n");
	await editor.fill(invalid);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({
		diagnostics: [{ code: "AMXF4001", line: 7, column: 1 }]
	});
	const diagnostic = page.locator(".amx-diagnostic");
	await expect(diagnostic).toHaveCount(1);
	await expect(diagnostic).toHaveText("}");
	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? "")).toBe("}");
});
