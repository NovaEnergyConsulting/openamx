import { expect, test, type Page } from "@playwright/test";

type TypeScriptExportHarnessWindow = Window & {
	__openamxHarnessSnapshot: () => {
		lastOpenedPath: string;
		jobRequests: Array<{ operation: string }>;
		jobStates: Array<{ operation: string; status: string; stage?: string; resultKind?: string }>;
	};
};

async function openProject(page: Page, scenario = "") {
	await page.goto(scenario ? `/?scenario=${scenario}` : "/");
	await page.getByRole("button", { name: "Open project" }).click();
	const pausePreview = page.getByRole("button", { name: "Pause live preview" });
	if (await pausePreview.count()) await pausePreview.click();
}

async function jobOperations(page: Page) {
	return page.evaluate(() => (window as TypeScriptExportHarnessWindow).__openamxHarnessSnapshot().jobRequests.map(job => job.operation));
}

test("active AMX can export a multi-module TypeScript graph and use registered output actions", async ({ page }) => {
	await openProject(page, "typescript-overwrite");
	await page.getByRole("button", { name: "Export TypeScript graph" }).click();
	const dialog = page.getByRole("dialog", { name: "Export TypeScript" });
	await expect(dialog).toBeVisible();
	await dialog.getByRole("button", { name: "Choose output directory…" }).click();
	await expect.poll(() => jobOperations(page)).toContain("transpile");
	await expect(dialog.getByText("2 modules")).toBeVisible();
	await expect(dialog.getByRole("region", { name: "Generated module paths" }).getByText("libraries/model.ts")).toBeVisible();
	await expect(dialog.getByRole("region", { name: "Generated module paths" }).getByText("report.ts", { exact: true })).toBeVisible();
	await expect(dialog.getByRole("region", { name: "Existing graph targets approved for replacement" })).toContainText("libraries/model.ts");
	await dialog.getByRole("button", { name: "Open entry" }).click();
	await expect.poll(() => page.evaluate(() => (window as TypeScriptExportHarnessWindow).__openamxHarnessSnapshot().lastOpenedPath))
		.toBe("/sprint042-browser-fixture/typescript-output/report.ts");
	await dialog.getByRole("button", { name: "Reveal folder" }).click();
	await expect.poll(() => page.evaluate(() => (window as TypeScriptExportHarnessWindow).__openamxHarnessSnapshot().lastOpenedPath))
		.toBe("/sprint042-browser-fixture/typescript-output");
});

test("directory picker cancellation does not start a TypeScript job", async ({ page }) => {
	await openProject(page, "typescript-picker-cancel");
	await page.getByRole("button", { name: "Export TypeScript graph" }).click();
	const dialog = page.getByRole("dialog", { name: "Export TypeScript" });
	await dialog.getByRole("button", { name: "Choose output directory…" }).click();
	await expect(dialog).toBeVisible();
	await expect.poll(() => jobOperations(page)).not.toContain("transpile");
});

test("worker preparation can be cancelled before graph publication", async ({ page }) => {
	await openProject(page, "typescript-preparing");
	await page.getByRole("button", { name: "Export TypeScript graph" }).click();
	const dialog = page.getByRole("dialog", { name: "Export TypeScript" });
	await dialog.getByRole("button", { name: "Choose output directory…" }).click();
	await expect(dialog.getByRole("button", { name: "Cancel preparation" })).toBeEnabled();
	await dialog.getByRole("button", { name: "Cancel preparation" }).click();
	await expect(dialog).toBeHidden();
	await expect.poll(() => page.evaluate(() => (window as TypeScriptExportHarnessWindow).__openamxHarnessSnapshot().jobStates.find(job => job.operation === "transpile")?.status))
		.toBe("cancelled");
});

test("writer failure shows rollback path outcomes in the graph dialog", async ({ page }) => {
	await openProject(page, "typescript-writer-error");
	await page.getByRole("button", { name: "Export TypeScript graph" }).click();
	const dialog = page.getByRole("dialog", { name: "Export TypeScript" });
	await dialog.getByRole("button", { name: "Choose output directory…" }).click();
	await expect(dialog.getByRole("alert")).toContainText("Graph publication failed");
	await expect(dialog.getByLabel("Writer path outcomes")).toContainText("libraries/model.ts");
	await expect(dialog.getByLabel("Writer path outcomes")).toContainText("unrecovered");
	await expect(dialog.getByRole("button", { name: "Open entry" })).toHaveCount(0);
});

test("graph publication reports its non-interruptible committing state", async ({ page }) => {
	await openProject(page, "typescript-committing");
	await page.getByRole("button", { name: "Export TypeScript graph" }).click();
	const dialog = page.getByRole("dialog", { name: "Export TypeScript" });
	await dialog.getByRole("button", { name: "Choose output directory…" }).click();
	await expect(dialog).toContainText("Publication cannot be interrupted.");
	await expect.poll(() => page.evaluate(() => (window as TypeScriptExportHarnessWindow).__openamxHarnessSnapshot().jobStates.find(job => job.operation === "transpile")))
		.toMatchObject({ status: "succeeded", resultKind: "typescript-graph" });
	await expect(dialog.getByRole("button", { name: "Open entry" })).toBeVisible();
});

test("command palette exposes TypeScript export only for the active AMX document", async ({ page }) => {
	await openProject(page);
	await page.getByRole("button", { name: "Commands" }).click();
	const palette = page.getByRole("dialog", { name: "Commands" });
	await palette.getByRole("textbox", { name: "Search commands" }).fill("Export TypeScript");
	await palette.getByRole("button", { name: /Export TypeScript/ }).click();
	await expect(page.getByRole("dialog", { name: "Export TypeScript" })).toBeVisible();
});

test("TypeScript export is absent without an active AMX document", async ({ page }) => {
	await openProject(page, "empty");
	await expect(page.getByRole("button", { name: "Export TypeScript graph" })).toHaveCount(0);
	await page.getByRole("button", { name: "Commands" }).click();
	const palette = page.getByRole("dialog", { name: "Commands" });
	await palette.getByRole("textbox", { name: "Search commands" }).fill("Export TypeScript");
	await expect(palette.getByRole("button", { name: /Export TypeScript/ })).toBeDisabled();
});

test("editing the active source cancels and closes an in-flight graph export", async ({ page }) => {
	await openProject(page, "typescript-stale");
	await page.getByRole("button", { name: "Export TypeScript graph" }).click();
	const dialog = page.getByRole("dialog", { name: "Export TypeScript" });
	await dialog.getByRole("button", { name: "Choose output directory…" }).click();
	await expect.poll(() => jobOperations(page)).toContain("transpile");
	await page.getByRole("textbox", { name: "OpenAMX source" }).fill("# Edited during graph export\n");
	await expect(dialog).toBeHidden();
	await expect.poll(() => page.evaluate(() => (window as TypeScriptExportHarnessWindow).__openamxHarnessSnapshot().jobStates.find(job => job.operation === "transpile")?.status))
		.toBe("cancelled");
});

test("Escape closes the graph dialog and restores focus to its invoking action", async ({ page }) => {
	await openProject(page);
	const opener = page.getByRole("button", { name: "Export TypeScript graph" });
	await opener.click();
	const dialog = page.getByRole("dialog", { name: "Export TypeScript" });
	await expect(dialog.getByRole("button", { name: "Close TypeScript export" })).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(dialog).toBeHidden();
	await expect(opener).toBeFocused();
});