import { expect, test, type Page } from "@playwright/test";

const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const lastAnalysis = (page: Page) => page.evaluate(() =>
	(window as Window & { __openamxHarnessSnapshot: () => { lastAnalysis?: { diagnostics: Array<{ code: string; line?: number; column?: number }>; completions?: string[]; symbols?: Array<{ name: string; declaration: boolean; parent?: { from: number; to: number } }> } } })
		.__openamxHarnessSnapshot().lastAnalysis
);

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
		const lineElement = start.node.parentElement?.closest(".cm-line");
		lineElement?.scrollIntoView({ block: "center", inline: "nearest" });
		const bounds = range.getBoundingClientRect();
		return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
	}, value);
	await page.mouse.click(point.x, point.y);
}

async function selectedLine(page: Page) {
	return page.locator(".cm-content").evaluate(content => {
		const selection = window.getSelection();
		const anchor = selection?.anchorNode;
		const element = anchor instanceof Element ? anchor : anchor?.parentElement;
		return element?.closest(".cm-line")?.textContent ?? "";
	});
}

test("desktop CodeMirror exposes V0.13 diagram language services and outline", async ({ page }, testInfo) => {
	const source = [
		"# Diagram editor check",
		"",
		"```amx",
		"let radius: Number = 10",
		"diagram motion {",
		' title: "Motion"',
		' description: "A moving rod."',
		" width: 100",
		" height: 80",
		" time t from 0 to 2 duration 4",
		" line rod {",
		"  x1: radius",
		"  y1: 10",
		"  x2: radius + t",
		"  y2: 20",
		'  stroke: "#263238"',
		"  lineWidth: 2",
		"  ",
		" }",
		" text timer {",
		"  x: 2",
		"  y: 2",
		'  value: "t = ${round(t, 2)}"',
		'  fill: "#263238"',
		" }",
		"}",
		"```",
		""
	].join("\n");
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const editor = sourceEditor(page);
	await editor.fill(source);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [] });
	await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain("diagram");
	await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain("motion");
	await expect.poll(() => page.locator(".amx-token-field").allTextContents()).toContain("x1");
	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);

	await clickLastTextOccurrence(page, "lineWidth: 2");
	await editor.press("End");
	await editor.press("ArrowDown");
	await page.keyboard.press("Control+Space");
	await expect(page.locator(".cm-tooltip-autocomplete")).toContainText("arrow");

	await page.getByRole("button", { name: "Format", exact: true }).click();
	await expect.poll(() => page.locator(".cm-content").innerText()).toContain('  title: "Motion"');
	const formatted = await page.locator(".cm-content").innerText();
	await page.getByRole("button", { name: "Format", exact: true }).click();
	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);

	await page.getByRole("button", { name: "Show outline" }).click();
	const outline = page.getByRole("navigation", { name: "Document outline" });
	await expect(outline).toBeVisible();
	const outlineToggle = page.getByRole("button", { name: "Hide outline" });
	await expect(outlineToggle).toHaveAttribute("aria-expanded", "true");
	await expect(outline).toContainText("radius");
	await expect(outline).toContainText("motion");
	await expect(outline).toContainText("t");
	await expect(outline).toContainText("rod");
	await expect(outline).toContainText("timer");
	await page.screenshot({
		path: testInfo.outputPath("desktop-editor-outline.png"),
		animations: "disabled",
		style: "#fail-next-preview { display: none !important; }"
	});
	await outlineToggle.focus();
	await page.keyboard.press("Tab");
	await expect(editor).toBeFocused();
	await page.setViewportSize({ width: 820, height: 720 });
	const outlineBounds = await outline.boundingBox();
	expect(outlineBounds).toBeTruthy();
	expect(outlineBounds!.x + outlineBounds!.width).toBeLessThanOrEqual(820);

	await outline.getByRole("button", { name: "Go to diagramTime t" }).click();
	await expect.poll(() => selectedLine(page)).toContain("time t from 0 to 2 duration 4");
	await clickLastTextOccurrence(page, "t");
	await page.keyboard.press("F12");
	await expect.poll(() => selectedLine(page)).toContain("time t from 0 to 2 duration 4");

	const invalid = [
		"😀 narrative",
		"```amx",
		"diagram broken {",
		'  title: "Broken"',
		'  description: "Missing one endpoint."',
		"  width: 100",
		"  height: 80",
		"  time t from 0 to 1 duration 1",
		"  line rod {",
		"    x1: 0",
		"    y1: 0",
		"    y2: 1",
		"  }",
		"}",
		"```"
	].join("\n");
	await editor.fill(invalid);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [{ code: "AMXD001", line: 9, column: 3 }] });
	const diagnostic = page.locator(".amx-diagnostic");
	await expect(diagnostic).toHaveCount(1);
	await expect(diagnostic).toHaveText("l");
	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? "")).toBe("  line rod {");

	const arrowValue = source.replace('  lineWidth: 2\n', '  lineWidth: 2\n  arrow: "end"\n');
	await editor.fill(arrowValue);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [] });
	await clickLastTextOccurrence(page, 'arrow: "end"');
	await editor.press("End");
	for (let index = 0; index < 4; index++) await editor.press("ArrowLeft");
	await expect.poll(() => selectedLine(page)).toContain('arrow: "end"');
	await page.keyboard.press("Control+Space");
	await expect.poll(() => lastAnalysis(page)).toMatchObject({ completions: expect.arrayContaining(['"none"', '"start"', '"end"', '"both"']) });
	const arrowOptions = page.locator(".cm-tooltip-autocomplete");
	for (const value of ['"none"', '"start"', '"end"', '"both"']) await expect(arrowOptions).toContainText(value);
});
