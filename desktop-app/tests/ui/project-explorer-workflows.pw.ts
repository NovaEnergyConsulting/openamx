import { expect, test } from "@playwright/test";

type ExplorerCall = { operation: string; source?: string; destination?: string; path?: string; action?: "open" | "reveal"; confirmOutboundImports?: boolean };
type ExplorerHarnessWindow = Window & {
	__openamxHarnessSnapshot: () => { explorerCalls: ExplorerCall[]; activePath: string | null };
};

async function openWorkflowFixture(page: import("@playwright/test").Page) {
	await page.goto("/?scenario=project-explorer-workflows");
	await page.getByRole("button", { name: "Open project" }).click();
}

async function explorerCalls(page: import("@playwright/test").Page): Promise<ExplorerCall[]> {
	return page.evaluate(() => (window as ExplorerHarnessWindow).__openamxHarnessSnapshot().explorerCalls);
}

async function activePath(page: import("@playwright/test").Page): Promise<string | null> {
	return page.evaluate(() => (window as ExplorerHarnessWindow).__openamxHarnessSnapshot().activePath);
}

async function acceptPrompt(page: import("@playwright/test").Page, action: () => Promise<void>, value: string) {
	const dialogHandled = page.waitForEvent("dialog").then(dialog => dialog.accept(value));
	await action();
	await dialogHandled;
}

test("explorer counts, menus, and project-scoped native actions", async ({ page }) => {
	await openWorkflowFixture(page);
	const explorer = page.locator(".explorer");
	const count = explorer.locator(".section-heading span").nth(1);
	await expect(count).toHaveText("2/4");
	await expect(count).toHaveAttribute("aria-label", "2 folders, 4 files");

	const search = explorer.getByRole("textbox", { name: "Search project files" });
	await search.fill("preview");
	await expect(explorer.locator(".folder")).toContainText(["reports"]);
	await expect(count).toHaveText("2/4");
	await search.fill("");

	await explorer.getByRole("button", { name: "Project actions" }).click();
	const actionsMenu = page.getByRole("menu", { name: "Project actions" });
	await expect(actionsMenu.getByRole("menuitem", { name: "Manage Trash" })).toBeVisible();
	await actionsMenu.getByRole("menuitem", { name: "New", exact: true }).click();
	const newMenu = page.getByRole("menu", { name: "New project item" });
	await expect(newMenu.getByRole("menuitem", { name: "CSV file" })).toBeVisible();
	await expect(newMenu.getByRole("menuitem", { name: "JSON file" })).toBeVisible();
	await page.keyboard.press("Escape");

	const report = explorer.locator(".file").filter({ hasText: "report.amx" });
	await report.click({ button: "right" });
	const reportMenu = page.getByRole("menu", { name: "report.amx actions" });
	await expect(reportMenu.getByRole("menuitem", { name: "Duplicate" })).toBeVisible();
	await expect(reportMenu.getByRole("menuitem", { name: "Delete to Trash" })).toBeVisible();
	await page.keyboard.press("Escape");
	await report.focus();
	await page.keyboard.press("Shift+F10");
	await expect(reportMenu.getByRole("menuitem", { name: "Open" })).toBeFocused();
	await page.keyboard.press("ArrowDown");
	await expect(reportMenu.getByRole("menuitem", { name: "Duplicate" })).toBeFocused();
	await page.keyboard.press("Escape");

	const folder = explorer.getByRole("button", { name: "libraries, folder actions" });
	await folder.click({ button: "right" });
	const folderMenu = page.getByRole("menu", { name: "libraries actions" });
	await expect(folderMenu.getByRole("menuitem", { name: "New AMX file" })).toBeVisible();
	await expect(folderMenu.getByRole("menuitem", { name: "Reveal in system file manager" })).toBeVisible();
	await expect(folderMenu.getByRole("menuitem", { name: "Duplicate" })).toHaveCount(0);
	await expect(folderMenu.getByRole("menuitem", { name: "Rename / Move" })).toHaveCount(0);
	await expect(folderMenu.getByRole("menuitem", { name: "Delete to Trash" })).toHaveCount(0);
	await folderMenu.getByRole("menuitem", { name: "Reveal in system file manager" }).click();
	await expect.poll(async () => (await explorerCalls(page)).at(-1)).toEqual({ operation: "openProjectItem", path: "libraries", action: "reveal" });

	const output = explorer.locator(".file").filter({ hasText: "preview.html" });
	await output.click({ button: "right" });
	const outputMenu = page.getByRole("menu", { name: "reports\\preview.html actions" });
	await expect(outputMenu.getByRole("menuitem", { name: "Open externally" })).toBeVisible();
	await expect(outputMenu.getByRole("menuitem", { name: "Duplicate" })).toHaveCount(0);
	await outputMenu.getByRole("menuitem", { name: "Open externally" }).click();
	await expect.poll(async () => (await explorerCalls(page)).at(-1)).toEqual({ operation: "openProjectItem", path: "reports\\preview.html", action: "open" });
});

test("create, duplicate, and move menu actions reconcile success and failure", async ({ page }) => {
	await openWorkflowFixture(page);
	const explorer = page.locator(".explorer");
	const actions = async () => {
		await explorer.getByRole("button", { name: "Project actions" }).click();
		return page.getByRole("menu", { name: "Project actions" });
	};

	const csvMenu = await actions();
	await csvMenu.getByRole("menuitem", { name: "New", exact: true }).click();
	await acceptPrompt(page, () => page.getByRole("menu", { name: "New project item" }).getByRole("menuitem", { name: "CSV file" }).click(), "created.csv");
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "createProjectFile")).toHaveLength(1);
	await expect(explorer.locator(".file").filter({ hasText: "created.csv" })).toBeVisible();
	await expect.poll(() => activePath(page)).toMatch(/\/created\.csv$/);

	const libraries = explorer.getByRole("button", { name: "libraries, folder actions" });
	await libraries.click({ button: "right" });
	await acceptPrompt(page, () => page.getByRole("menu", { name: "libraries actions" }).getByRole("menuitem", { name: "New folder" }).click(), "libraries/new-folder");
	await expect(explorer.getByRole("button", { name: "libraries/new-folder, folder actions" })).toBeVisible();

	await explorer.getByRole("button", { name: "libraries, folder actions" }).click({ button: "right" });
	await acceptPrompt(page, () => page.getByRole("menu", { name: "libraries actions" }).getByRole("menuitem", { name: "New folder" }).click(), "libraries/reject-folder");
	await expect(page.locator("body")).toContainText("Simulated folder creation rejection.");
	await expect(explorer.getByRole("button", { name: /reject-folder/ })).toHaveCount(0);

	const failedJsonMenu = await actions();
	await failedJsonMenu.getByRole("menuitem", { name: "New", exact: true }).click();
	await acceptPrompt(page, () => page.getByRole("menu", { name: "New project item" }).getByRole("menuitem", { name: "JSON file" }).click(), "reject.json");
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "createProjectFile")).toHaveLength(2);
	await expect(page.locator("body")).toContainText("Simulated file creation rejection.");
	await expect(explorer.locator(".file").filter({ hasText: "reject.json" })).toHaveCount(0);

	const report = explorer.locator(".file").filter({ hasText: "report.amx" });
	await report.click({ button: "right" });
	await acceptPrompt(page, () => page.getByRole("menu", { name: "report.amx actions" }).getByRole("menuitem", { name: "Duplicate" }).click(), "report-copy.amx");
	await expect(explorer.locator(".file").filter({ hasText: "report-copy.amx" })).toBeVisible();
	await expect.poll(() => activePath(page)).toMatch(/\/report-copy\.amx$/);

	await report.click({ button: "right" });
	await acceptPrompt(page, () => page.getByRole("menu", { name: "report.amx actions" }).getByRole("menuitem", { name: "Duplicate" }).click(), "reject-copy.amx");
	await expect(page.locator("body")).toContainText("Simulated duplicate rejection.");
	await expect(explorer.locator(".file").filter({ hasText: "reject-copy.amx" })).toHaveCount(0);
	await expect.poll(() => activePath(page)).toMatch(/\/report-copy\.amx$/);

	await report.click({ button: "right" });
	await acceptPrompt(page, () => page.getByRole("menu", { name: "report.amx actions" }).getByRole("menuitem", { name: "Rename / Move" }).click(), "libraries/renamed.amx");
	await expect(explorer.locator(".file").filter({ hasText: "renamed.amx" })).toBeVisible();
	await expect(report).toHaveCount(0);
	await expect.poll(() => activePath(page)).toMatch(/\/libraries\/renamed\.amx$/);

	const renamed = explorer.locator(".file").filter({ hasText: "renamed.amx" });
	await renamed.click({ button: "right" });
	await acceptPrompt(page, () => page.getByRole("menu", { name: "libraries\\renamed.amx actions" }).getByRole("menuitem", { name: "Rename / Move" }).click(), "reports/collision.amx");
	await expect(page.locator("body")).toContainText("Simulated destination collision.");
	await expect(renamed).toBeVisible();
	await expect(explorer.locator(".file").filter({ hasText: "collision.amx" })).toHaveCount(0);
	await expect.poll(() => activePath(page)).toMatch(/\/libraries\/renamed\.amx$/);
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "moveProjectFile")).toHaveLength(2);
});

test("file drop shares move RPC and invalid file drops do not mutate", async ({ page }) => {
	await openWorkflowFixture(page);
	const explorer = page.locator(".explorer");
	const report = explorer.locator(".file").filter({ hasText: "report.amx" });
	const otherFile = explorer.locator(".file").filter({ hasText: "data.csv" });
	const folder = explorer.getByRole("button", { name: "libraries, folder actions" });

	await report.dragTo(otherFile);
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "moveProjectFile")).toHaveLength(0);
	await expect(page.getByText("Drop a project file onto a folder, not another file.")).toBeVisible();

	await report.dragTo(folder);
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "moveProjectFile")).toHaveLength(1);
	await expect.poll(async () => (await explorerCalls(page)).at(-1)).toEqual({ operation: "moveProjectFile", source: "report.amx", destination: "libraries/report.amx" });
});

test("file delete requires impact confirmation and Trash stays recoverable", async ({ page }) => {
	await openWorkflowFixture(page);
	const explorer = page.locator(".explorer");
	const report = explorer.locator(".file").filter({ hasText: "report.amx" });
	page.once("dialog", dialog => dialog.dismiss());
	await report.click({ button: "right" });
	await page.getByRole("menuitem", { name: "Delete to Trash" }).click();
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "deleteProjectFile")).toEqual([
		{ operation: "deleteProjectFile", path: "report.amx", confirmOutboundImports: false }
	]);

	page.once("dialog", dialog => dialog.accept());
	await report.click({ button: "right" });
	await page.getByRole("menuitem", { name: "Delete to Trash" }).click();
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "deleteProjectFile")).toEqual([
		{ operation: "deleteProjectFile", path: "report.amx", confirmOutboundImports: false },
		{ operation: "deleteProjectFile", path: "report.amx", confirmOutboundImports: false },
		{ operation: "deleteProjectFile", path: "report.amx", confirmOutboundImports: true }
	]);

	await explorer.getByRole("button", { name: "Project actions" }).click();
	await page.getByRole("menuitem", { name: "Manage Trash" }).click();
	const trash = page.getByRole("dialog", { name: "Manage Trash" });
	await expect(trash.getByText("report.amx")).toBeVisible();
	page.once("dialog", dialog => dialog.dismiss());
	await trash.getByRole("button", { name: "Empty Trash" }).click();
	await expect(trash.getByText("report.amx")).toBeVisible();
	await expect((await explorerCalls(page)).filter(call => call.operation === "emptyTrash")).toHaveLength(0);

	page.once("dialog", dialog => dialog.accept());
	await trash.getByRole("button", { name: "Empty Trash" }).click();
	await expect(trash.getByText("Trash is empty.")).toBeVisible();
	await expect.poll(async () => (await explorerCalls(page)).filter(call => call.operation === "emptyTrash")).toHaveLength(1);
});

test("Trash restore reconciles successful and rejected items", async ({ page }) => {
	await openWorkflowFixture(page);
	const explorer = page.locator(".explorer");
	const data = explorer.locator(".file").filter({ hasText: "data.csv" });
	await data.click({ button: "right" });
	await page.getByRole("menu", { name: "data.csv actions" }).getByRole("menuitem", { name: "Delete to Trash" }).click();
	await expect(data).toHaveCount(0);

	const projectActions = explorer.getByRole("button", { name: "Project actions" });
	await projectActions.click();
	await page.getByRole("menu", { name: "Project actions" }).getByRole("menuitem", { name: "New", exact: true }).click();
	await acceptPrompt(page, () => page.getByRole("menu", { name: "New project item" }).getByRole("menuitem", { name: "CSV file" }).click(), "restore-fail.csv");
	await expect(explorer.locator(".file").filter({ hasText: "restore-fail.csv" })).toBeVisible();
	const failFile = explorer.locator(".file").filter({ hasText: "restore-fail.csv" });
	await failFile.click({ button: "right" });
	await page.getByRole("menu", { name: "restore-fail.csv actions" }).getByRole("menuitem", { name: "Delete to Trash" }).click();
	await expect(failFile).toHaveCount(0);

	await projectActions.click();
	await page.getByRole("menu", { name: "Project actions" }).getByRole("menuitem", { name: "Manage Trash" }).click();
	const trash = page.getByRole("dialog", { name: "Manage Trash" });
	const failedRestoreItem = trash.locator(".trash-items li").filter({ hasText: "restore-fail.csv" });
	await failedRestoreItem.getByRole("button", { name: "Restore" }).click();
	await expect(trash.getByRole("alert")).toHaveText("Simulated restore rejection.");
	await expect(explorer.locator(".file").filter({ hasText: "restore-fail.csv" })).toHaveCount(0);
	await trash.getByRole("button", { name: "Close", exact: true }).click();
	await projectActions.click();
	await page.getByRole("menu", { name: "Project actions" }).getByRole("menuitem", { name: "Manage Trash" }).click();
	const reopenedTrash = page.getByRole("dialog", { name: "Manage Trash" });
	const retainedFailure = reopenedTrash.locator(".trash-items li").filter({ hasText: "restore-fail.csv" });
	await expect(retainedFailure).toBeVisible();

	const restorableItem = reopenedTrash.locator(".trash-items li").filter({ hasText: "data.csv" });
	await restorableItem.getByRole("button", { name: "Restore" }).click();
	await expect(explorer.locator(".file").filter({ hasText: "data.csv" })).toBeVisible();
	await expect(reopenedTrash.locator(".trash-items li").filter({ hasText: "data.csv" })).toHaveCount(0);
	await expect(retainedFailure).toBeVisible();
});