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
