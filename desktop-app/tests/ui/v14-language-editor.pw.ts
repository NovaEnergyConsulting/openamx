import { expect, test, type Page, type TestInfo } from "@playwright/test";

const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const lastAnalysis = (page: Page) => page.evaluate(() =>
	(window as Window & { __openamxHarnessSnapshot: () => { lastAnalysis?: { diagnostics: Array<{ code: string; line?: number; column?: number }>; completions?: string[] } } })
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
		const bounds = range.getBoundingClientRect();
		return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
	}, value);
	await page.mouse.click(point.x, point.y);
}

test("desktop CodeMirror exposes V0.14 editor services in the Vite workbench harness", async ({ page }, testInfo: TestInfo) => {
	const source = [
		"# V0.14 editor check",
		"",
		"```amx",
		"type Point {",
		"  x: Number",
		"}",
		"let candidate: Number = 1",
		"let matched = candidate is Point",
		"let sine = sin(PI / 2)",
		'let formatted = format(1.25, "0.00")',
		"```",
		""
	].join("\n");
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const editor = sourceEditor(page);
	await editor.fill(source);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [] });
	await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain("is");
	await expect.poll(() => page.locator(".amx-token-type").allTextContents()).toContain("Point");
	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);

	await page.getByRole("button", { name: "Format", exact: true }).click();
	const formatted = await page.locator(".cm-content").innerText();
	await page.getByRole("button", { name: "Format", exact: true }).click();
	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
	await page.screenshot({
		path: testInfo.outputPath("v14-language-editor.png"),
		animations: "disabled",
		style: "#fail-next-preview { display: none !important; }"
	});

	const incompleteSource = source.replace("let matched = candidate is Point", "let matched = candidate is ");
	await editor.fill(incompleteSource);
	await clickLastTextOccurrence(page, "candidate is ");
	await editor.press("End");
	await page.keyboard.press("Control+Space");
	await expect.poll(() => lastAnalysis(page)).toMatchObject({
		completions: expect.arrayContaining(["Point", "PI", "E", "sin", "format"])
	});
	const completionMenu = page.locator(".cm-tooltip-autocomplete");
	for (const label of ["Point", "PI", "E", "sin", "format"]) await expect(completionMenu).toContainText(label);

	const invalidSource = source.replace("let matched = candidate is Point", "let matched = candidate is Missing");
	await editor.fill(invalidSource);
	await expect.poll(() => lastAnalysis(page)).toMatchObject({
		diagnostics: [{ code: "AMX3001", line: 8, column: 28 }]
	});
	const diagnostic = page.locator(".amx-diagnostic");
	await expect(diagnostic).toHaveCount(1);
	await expect(diagnostic).toHaveText("M");
	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? ""))
		.toBe("let matched = candidate is Missing");
});
