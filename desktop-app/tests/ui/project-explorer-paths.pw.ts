import { expect, test } from "@playwright/test";

test("Windows separators group nested project files and preserve RPC paths", async ({ page }) => {
	await page.goto("/");
	await page.evaluate(() => {
		(window as Window & { __setWindowsExplorerPathFixture: (enabled: boolean) => void }).__setWindowsExplorerPathFixture(true);
	});
	await page.getByRole("button", { name: "Open project" }).click();

	const explorer = page.locator(".explorer");
	const groups = page.locator(".explorer > div");
	const rootGroup = groups.filter({ hasText: "Root Folder" });
	const librariesGroup = groups.filter({ hasText: "libraries" });
	await expect(rootGroup).toHaveCount(1);
	await expect(librariesGroup).toHaveCount(1);
	await expect(librariesGroup.locator(".file span")).toHaveText(["asset-management.amx"]);
	expect(await rootGroup.locator(".file span").allTextContents()).not.toContain("libraries\\asset-management.amx");

	await librariesGroup.locator(".file").click();
	const snapshot = await page.evaluate(() =>
		(window as Window & { __openamxHarnessSnapshot: () => { lastOpenedPath: string } }).__openamxHarnessSnapshot()
	);
	expect(snapshot.lastOpenedPath).toBe("libraries\\asset-management.amx");
});
