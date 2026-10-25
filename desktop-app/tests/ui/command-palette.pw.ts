import { expect, test, type Page } from "@playwright/test";

type PaletteHarnessWindow = Window & {
	__openamxHarnessSnapshot: () => { jobRequests: Array<{ operation: string }> };
};

async function openProjectFixture(page: Page) {
	await page.goto("/?scenario=project-explorer-workflows");
	await page.getByRole("button", { name: "Open project" }).click();
}

async function jobRequests(page: Page) {
	return page.evaluate(() => (window as PaletteHarnessWindow).__openamxHarnessSnapshot().jobRequests);
}

async function jobOperations(page: Page) {
	return (await jobRequests(page)).map(job => job.operation);
}

test("palette filters, navigates enabled commands, and runs the selected command", async ({ page }) => {
	await openProjectFixture(page);
	await expect.poll(() => jobOperations(page)).toEqual(["preview"]);
	const opener = page.getByRole("button", { name: "Commands" });
	await opener.click();
	const palette = page.getByRole("dialog", { name: "Commands" });
	const search = palette.getByRole("textbox", { name: "Search commands" });
	await expect(search).toBeFocused();
	const firstCommand = palette.getByRole("button").first();
	await expect(firstCommand).toHaveAttribute("aria-pressed", "true");
	await expect(search).toHaveAttribute("aria-activedescendant", "command-option-help.open");
	await expect(firstCommand).toHaveClass(/command-selected/);
	await expect(firstCommand).toContainText("Help and shortcuts");

	await search.fill("active");
	const duplicate = palette.getByRole("button", { name: /Duplicate active file/ });
	const move = palette.getByRole("button", { name: /Move or rename active file/ });
	const save = palette.getByRole("button", { name: /Save active tab/ });
	const format = palette.getByRole("button", { name: /Format active tab/ });
	const run = palette.getByRole("button", { name: /Run active document/ });
	await expect(duplicate).toHaveAttribute("aria-pressed", "true");
	await expect(save).toBeDisabled();
	await expect(save).toHaveAttribute("aria-pressed", "false");
	await expect(save).toContainText("No unsaved active tab");
	await expect(search).toHaveAttribute("aria-activedescendant", "command-option-project.duplicate-file");
	await page.evaluate(() => {
		document.body.style.minHeight = "200vh";
		window.scrollTo(0, 120);
	});
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
	const scrollPosition = await page.evaluate(() => window.scrollY);

	await page.keyboard.press("ArrowDown");
	await expect(move).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("ArrowDown");
	await expect(format).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("ArrowDown");
	await expect(run).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("ArrowDown");
	await expect(run).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("ArrowUp");
	await expect(format).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("ArrowUp");
	await expect(move).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("ArrowUp");
	await expect(duplicate).toHaveAttribute("aria-pressed", "true");
	await page.keyboard.press("ArrowUp");
	await expect(duplicate).toHaveAttribute("aria-pressed", "true");

	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowDown");
	await expect(run).toHaveAttribute("aria-pressed", "true");
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollPosition);
	await page.keyboard.press("Enter");
	await expect(palette).toBeHidden();
	await expect.poll(() => jobOperations(page)).toEqual(["preview", "run"]);
	await expect(page.locator(".runtime-drawer .drawer-heading .state")).toHaveText("success");
	await expect(opener).toBeFocused();

	await opener.click();
	await search.fill("Run active document");
	const clickRun = palette.getByRole("button", { name: /Run active document/ });
	await expect(clickRun).toHaveAttribute("aria-pressed", "true");
	await clickRun.click();
	await expect(palette).toBeHidden();
	await expect.poll(() => jobOperations(page)).toEqual(["preview", "run", "run"]);
	await expect(page.locator(".runtime-drawer .drawer-heading .state")).toHaveText("success");
});

test("keyboard shortcut restores its invoker and palette Enter does not run global shortcuts", async ({ page }) => {
	await openProjectFixture(page);
	const preferences = page.getByRole("button", { name: "Preferences" });
	await preferences.focus();
	await page.keyboard.press("Control+Shift+P");
	const palette = page.getByRole("dialog", { name: "Commands" });
	const search = palette.getByRole("textbox", { name: "Search commands" });
	await expect(search).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(preferences).toBeFocused();

	const opener = page.getByRole("button", { name: "Commands" });
	await opener.click();
	await page.locator(".palette-backdrop").click({ position: { x: 8, y: 8 } });
	await expect(palette).toBeHidden();
	await expect(opener).toBeFocused();

	await opener.click();
	await search.fill("Focus editor");
	await expect.poll(async () => (await jobRequests(page)).length).toBe(1);
	const jobsBeforeRunShortcut = await jobRequests(page);
	await page.keyboard.press("Control+Enter");
	await expect(palette).toBeHidden();
	await expect(page.locator(".workbench")).toHaveClass(/focus-editor/);
	await page.waitForTimeout(350);
	await expect(await jobRequests(page)).toHaveLength(jobsBeforeRunShortcut.length);

	await opener.click();
	await search.fill("Focus editor");
	const jobsBeforePreviewShortcut = await jobRequests(page);
	await page.keyboard.press("Control+Shift+Enter");
	await expect(palette).toBeHidden();
	await page.waitForTimeout(350);
	await expect(await jobRequests(page)).toHaveLength(jobsBeforePreviewShortcut.length);
});

test("selection clears when the selected command becomes unavailable while open", async ({ page }) => {
	await openProjectFixture(page);
	const editor = page.locator(".cm-content").first();
	await editor.click();
	await page.keyboard.press("End");
	await page.keyboard.type(" ");

	const opener = page.getByRole("button", { name: "Commands" });
	await opener.click();
	const palette = page.getByRole("dialog", { name: "Commands" });
	const search = palette.getByRole("textbox", { name: "Search commands" });
	await search.fill("Save active tab");
	const save = palette.getByRole("button", { name: /Save active tab/ });
	await expect(save).toBeEnabled();
	await expect(save).toHaveAttribute("aria-pressed", "true");

	await page.keyboard.press("Control+S");
	await expect(save).toBeDisabled();
	await expect(save).toHaveAttribute("aria-pressed", "false");
	await expect.poll(() => search.getAttribute("aria-activedescendant")).toBeNull();
	await page.keyboard.press("Enter");
	await expect(palette).toBeVisible();
});

test("disabled and empty results stay safe, and clicking still routes Help", async ({ page }) => {
	await page.goto("/");
	const header = page.locator(".app-header");
	await expect(header.getByRole("button", { name: "Help and shortcuts" })).toBeVisible();
	await expect(header.getByRole("button", { name: "Preferences" })).toBeVisible();
	await page.getByRole("button", { name: "Commands" }).click();
	const palette = page.getByRole("dialog", { name: "Commands" });
	const search = palette.getByRole("textbox", { name: "Search commands" });
	await search.fill("New ");
	const disabledResults = palette.getByRole("button", { name: /New (AMX file|CSS file|folder)/ });
	await expect(disabledResults).toHaveCount(3);
	const disabled = palette.getByRole("button", { name: /New AMX file/ });
	await expect(disabled).toBeDisabled();
	await expect(disabled).toHaveAttribute("aria-disabled", "true");
	await expect(disabled).toHaveAttribute("aria-pressed", "false");
	await expect(disabled).toContainText("Open a project first");
	await expect.poll(() => search.getAttribute("aria-activedescendant")).toBeNull();
	await page.keyboard.press("Enter");
	await expect(palette).toBeVisible();
	await expect(await jobRequests(page)).toHaveLength(0);

	await search.fill("no command matches this");
	await expect(palette.getByText("No matching commands.")).toBeVisible();
	await search.fill("Help and shortcuts");
	await palette.getByRole("button", { name: /Help and shortcuts/ }).click();
	await expect(palette).toBeHidden();
	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toBeVisible();
});