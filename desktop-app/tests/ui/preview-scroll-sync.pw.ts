import { expect, test } from "@playwright/test";

const sourceEditor = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const preview = (page: import("@playwright/test").Page) => page.frameLocator('iframe[title="OpenAMX live HTML preview"]');
const previewProgress = (page: import("@playwright/test").Page) => preview(page).locator("body").evaluate(() => {
	const maximum = document.documentElement.scrollHeight - window.innerHeight;
	return maximum > 0 ? window.scrollY / maximum : 0;
});
const editorProgress = (page: import("@playwright/test").Page) => page.locator(".cm-scroller").evaluate(element => {
	const scroller = element as HTMLElement;
	const maximum = scroller.scrollHeight - scroller.clientHeight;
	return maximum > 0 ? scroller.scrollTop / maximum : 0;
});

test("editor caret and preview scrolling stay synchronized across edits and refreshes", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	await page.getByRole("button", { name: "Refresh preview" }).click();

	const source = [
		"# Scroll sync fixture",
		"",
		"```amx",
		"export let result: Number = 3",
		"```",
		"",
		"scroll narrative",
		...Array.from({ length: 120 }, (_, index) => `source line ${index}`)
	].join("\n");
	await sourceEditor(page).fill(source);
	await expect(preview(page).locator("body")).toContainText("scroll preview line 119");
	await expect.poll(() => previewProgress(page)).toBeGreaterThan(0.95);

	const caretLine = await page.locator(".cm-activeLine").innerText();
	await preview(page).locator("body").evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
	await expect.poll(() => editorProgress(page)).toBeGreaterThan(0.4);
	await expect.poll(() => editorProgress(page)).toBeLessThan(0.6);
	expect(await page.locator(".cm-activeLine").innerText()).toBe(caretLine);

	await sourceEditor(page).press("Control+Home");
	await expect.poll(() => previewProgress(page)).toBeLessThan(0.05);
	await sourceEditor(page).press("Control+End");
	await expect.poll(() => previewProgress(page)).toBeGreaterThan(0.95);

	const iframe = page.locator('iframe[title="OpenAMX live HTML preview"]');
	const previousPreview = await iframe.getAttribute("srcdoc");
	await sourceEditor(page).press("!");
	await expect.poll(() => iframe.getAttribute("srcdoc")).not.toBe(previousPreview);
	await expect(preview(page).locator("body")).toContainText("scroll preview line 119");
	await expect.poll(() => previewProgress(page)).toBeGreaterThan(0.95);

	const editedPreview = await iframe.getAttribute("srcdoc");
	await page.getByRole("button", { name: "Refresh preview" }).click();
	await expect.poll(() => iframe.getAttribute("srcdoc")).not.toBe(editedPreview);
	await expect.poll(() => previewProgress(page)).toBeGreaterThan(0.95);
});
