import { expect, test } from "@playwright/test";

test("creates and edits CSS source from the project explorer", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	page.once("dialog", dialog => dialog.accept("theme.css"));
	await page.getByRole("button", { name: "New CSS", exact: true }).click();
	const cssFile = page.locator(".explorer .file").filter({ hasText: "theme.css" });
	await expect(cssFile).toBeVisible();
	await expect(cssFile.locator("small")).toHaveText("css");
	const editor = page.getByRole("textbox", { name: "CSS source", exact: true });
	await expect(editor).toBeVisible();
	const text = "body {\n  color: teal;\n}\n";
	await editor.fill(text);
	await expect.poll(() => page.evaluate(() =>
		(window as Window & { __openamxHarnessSnapshot: () => { currentText: string } }).__openamxHarnessSnapshot().currentText
	)).toBe(text);
	await expect(page.getByRole("button", { name: "Find", exact: true })).toBeEnabled();
	await expect(page.getByRole("button", { name: "Format", exact: true })).toBeDisabled();
	await page.locator(".explorer .file").filter({ hasText: "report.amx" }).click();
	await expect(page.getByRole("textbox", { name: "OpenAMX source", exact: true })).toBeVisible();
	await cssFile.click();
	await expect(editor.locator(".cm-line")).toHaveText(text.split("\n"));
});

test("highlights CSS tokens with theme colors and offers CSS completions", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	page.once("dialog", dialog => dialog.accept("highlight.css"));
	await page.getByRole("button", { name: "New CSS", exact: true }).click();
	const editor = page.getByRole("textbox", { name: "CSS source", exact: true });
	await editor.fill("/* Stylesheet comment */\n@media screen {\n  .report {\n    color: #123456;\n    margin: 12px;\n  }\n}\n");
	const selector = editor.locator("span").filter({ hasText: /^report$/ });
	const property = editor.locator("span").filter({ hasText: /^color$/ });
	const value = editor.locator("span").filter({ hasText: /^#123456$/ });
	const comment = editor.locator("span").filter({ hasText: /^\/\* Stylesheet comment \*\/$/ });
	const keyword = editor.locator("span").filter({ hasText: /^@media$/ });
	await expect(selector).toBeVisible();
	await expect(property).toBeVisible();
	await expect(value).toBeVisible();
	await expect(comment).toHaveCSS("font-style", "italic");
	await expect(keyword).toBeVisible();
	for (const theme of ["light", "dark"]) {
		await page.getByRole("button", { name: "Preferences", exact: true }).click();
		await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(theme);
		await page.getByRole("button", { name: "Save preferences", exact: true }).click();
		const colors = await page.locator("main").evaluate(element => {
			const style = getComputedStyle(element);
			return {
				selector: style.getPropertyValue("--amx-token-type").trim(),
				property: style.getPropertyValue("--amx-token-field").trim(),
				value: style.getPropertyValue("--amx-token-literal").trim(),
				keyword: style.getPropertyValue("--amx-token-keyword").trim()
			};
		});
		const rgb = (hex: string) => `rgb(${[1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16)).join(", ")})`;
		await expect(selector).toHaveCSS("color", rgb(colors.selector));
		await expect(property).toHaveCSS("color", rgb(colors.property));
		await expect(value).toHaveCSS("color", rgb(colors.value));
		await expect(keyword).toHaveCSS("color", rgb(colors.keyword));
	}
	await editor.fill("body {\n  col");
	await editor.press("Control+End");
	await editor.press("Control+Space");
	await expect(page.getByRole("option", { name: "color", exact: true })).toBeVisible();
	await page.getByRole("option", { name: "color", exact: true }).click();
	await expect(editor.locator(".cm-line").nth(1)).toContainText("color");
});
