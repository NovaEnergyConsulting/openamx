import { expect, test, type Page } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const harnessSnapshot = (page: Page) => page.evaluate(() => {
	const snapshot: unknown = Reflect.get(window, "__openamxHarnessSnapshot");
	return typeof snapshot === "function" ? snapshot() as unknown : undefined;
});
const lastAnalysis = (page: Page) => page.evaluate(() => {
	const snapshot: unknown = Reflect.get(window, "__openamxHarnessSnapshot");
	if (typeof snapshot !== "function") return undefined;
	const result: unknown = snapshot();
	return typeof result === "object" && result !== null && "lastAnalysis" in result
		? result.lastAnalysis
		: undefined;
});
const harnessAnalysisRequestCount = async (page: Page) => {
	const snapshot = await harnessSnapshot(page);
	return typeof snapshot === "object" && snapshot !== null && "analysisRequests" in snapshot
		&& Array.isArray(snapshot.analysisRequests) ? snapshot.analysisRequests.length : 0;
};
const harnessCurrentText = async (page: Page) => {
	const snapshot = await harnessSnapshot(page);
	return typeof snapshot === "object" && snapshot !== null && "currentText" in snapshot
		&& typeof snapshot.currentText === "string" ? snapshot.currentText : undefined;
};

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
	const initialAnalysisRequests = await harnessAnalysisRequestCount(page);
	await editor.fill(source);
	await page.keyboard.press("Control+Space");
	await expect.poll(() => harnessCurrentText(page)).toBe(source);
	await expect.poll(() => harnessAnalysisRequestCount(page)).toBeGreaterThan(initialAnalysisRequests);
	const returnOffset = source.indexOf("return loopLocal");
	await expect.poll(() => lastAnalysis(page)).toMatchObject({
		diagnostics: [],
		highlights: expect.arrayContaining([expect.objectContaining({
			from: returnOffset, to: returnOffset + "return".length, kind: "keyword"
		})])
	});
	await page.keyboard.press("Escape");
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

test("desktop CodeMirror renders parser-proven nested V0.18 diagram facts", async ({ page }) => {
	const source = [
		"```amx",
		"let rowOffset: Number = 2",
		"diagram generatedTrace {",
			'title: "Generated trace"',
			'description: "Nested generated points."',
			"width: 100",
			"height: 80",
			"time t from 0 to 1 duration 2",
			"  for sample in [0, 1] {",
			"    if sample > 0 {",
			"      circle tracePoint {",
			"        cx: sample + t",
			"        cy: sample * 2",
			"        r: 2",
			'        stroke: "#263238"',
			'        fill: "#F3B64B"',
			"        lineWidth: 1",
			"      }",
			"    } else {",
			"      rectangle skippedPoint {",
			"        x: sample",
			"        y: 1",
			"        width: 2",
			"        height: 2",
			'        stroke: "#263238"',
			"        lineWidth: 1",
			"      }",
			"    }",
			"  }",
			"  if rowOffset > 0 {",
			"    for row in [1] {",
			"      text nestedLabel {",
			"        x: row",
			"        y: 1",
				'value: "row"',
				'fill: "#263238"',
			"      }",
			"    }",
			"  }",
		"}",
		"```",
		"",
	].join("\n");
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const editor = sourceEditor(page);
	const initialAnalysisRequests = await harnessAnalysisRequestCount(page);
	await editor.fill(source);
	await page.keyboard.press("Control+Space");
	await expect.poll(() => harnessCurrentText(page)).toBe(source);
	await expect.poll(() => harnessAnalysisRequestCount(page)).toBeGreaterThan(initialAnalysisRequests);
	const loopOffset = source.indexOf("for sample in");
	await expect.poll(() => lastAnalysis(page)).toMatchObject({
		diagnostics: [],
		highlights: expect.arrayContaining([expect.objectContaining({
			from: loopOffset, to: loopOffset + "for".length, kind: "keyword"
		})])
	});
	await page.keyboard.press("Escape");
	for (const keyword of ["for", "in", "if", "else"]) {
		await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain(keyword);
	}
	for (const declaration of ["sample", "row", "tracePoint", "skippedPoint", "nestedLabel"]) {
		await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain(declaration);
	}
	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);

	await page.getByRole("button", { name: "Format", exact: true }).click();
	const formatted = await page.locator(".cm-content").innerText();
	await page.getByRole("button", { name: "Format", exact: true }).click();
	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
});

test("standalone Example 08 playback keeps generated membership fixed while properties animate", async ({ page }) => {
	const htmlPath = resolve("..", "planning/sprints/0113-v18-editor-specification-example/artifacts/outputs/example-08.html");
	const browserErrors: string[] = [];
	page.on("pageerror", error => browserErrors.push(error.message));
	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
	await page.goto(pathToFileURL(htmlPath).href);

	const diagram = page.locator('[data-openamx-diagram="openamx-diagram-0"]');
	const tracePoints = diagram.locator('[data-diagram-element="tracePoint"]');
	const time = diagram.locator("[data-diagram-time]");
	await expect(diagram.getByRole("img", { name: "Crank-slider mechanism" })).toBeVisible();
	await expect(time).toHaveText("0.000");
	await expect(tracePoints).toHaveCount(3);
	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
		.toEqual(["40", "44", "48"]);

	const scrubber = diagram.getByRole("slider", { name: "Time for Crank-slider mechanism" });
	await scrubber.evaluate(element => {
		const input = element as HTMLInputElement;
		input.value = "0.5";
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await expect(time).toHaveText("0.500");
	await expect(tracePoints).toHaveCount(3);
	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
		.toEqual(["74", "78", "82"]);
	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cy"))))
		.toEqual(["134", "134", "134"]);

	const play = diagram.getByRole("button", { name: "Play Crank-slider mechanism" });
	await play.click();
	const pause = diagram.getByRole("button", { name: "Pause Crank-slider mechanism" });
	await expect(pause).toHaveText("Pause");
	await expect.poll(() => time.textContent()).not.toBe("0.500");
	await pause.click();
	await expect(diagram.getByRole("button", { name: "Play Crank-slider mechanism" })).toHaveText("Play");
	await expect(tracePoints).toHaveCount(3);
	expect(browserErrors).toEqual([]);
});
