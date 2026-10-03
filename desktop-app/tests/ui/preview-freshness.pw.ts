import { expect, test } from "@playwright/test";

const sourceEditor = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const snapshot = (page: import("@playwright/test").Page) => page.evaluate(() =>
	(window as Window & { __openamxHarnessSnapshot: () => { currentText: string; savedText: string; previewCompletions: number; previewStartedAt: number[]; previewAutosavedAtCompletion: boolean[] } }).__openamxHarnessSnapshot()
);

test("live preview preserves freshness across autosave, pause, refresh, resume and invalid output", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]');
	await page.getByRole("button", { name: "Refresh preview" }).click();
	await expect(frame.locator("body")).toContainText("3");
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");

	await page.getByRole("button", { name: "Pause live preview" }).click();
	const completionsBeforeEdit = (await snapshot(page)).previewCompletions;
	await sourceEditor(page).fill("# Sprint 042 report\n\n```amx\nexport let result: Number = 17\n```\n");
	await expect.poll(async () => (await snapshot(page)).savedText).toContain("= 17");
	await page.waitForTimeout(300);
	await expect.poll(async () => (await snapshot(page)).previewCompletions).toBe(completionsBeforeEdit);
	await expect(frame.locator("body")).toContainText("3");

	await page.getByRole("button", { name: "Refresh preview" }).click();
	await expect(frame.locator("body")).toContainText("17");
	await expect(page.locator(".preview-pane .state").last()).toHaveText("paused");

	await page.getByRole("button", { name: "Resume live preview" }).click();
	const previewCountBeforeResumeEdit = (await snapshot(page)).previewStartedAt.length;
	const editStartedAt = await page.evaluate(() => performance.now());
	await sourceEditor(page).fill("# Sprint 042 report\n\n```amx\nexport let result: Number = 19\n```\n");
	await expect(frame.locator("body")).toContainText("19", { timeout: 3000 });
	const resumedSnapshot = await snapshot(page);
	expect(resumedSnapshot.previewStartedAt.length).toBeGreaterThan(previewCountBeforeResumeEdit);
	expect(resumedSnapshot.previewStartedAt.at(-1)! - editStartedAt).toBeGreaterThanOrEqual(380);
	expect(resumedSnapshot.previewStartedAt.at(-1)! - editStartedAt).toBeLessThan(600);
	await expect.poll(async () => (await snapshot(page)).previewAutosavedAtCompletion.at(-1)).toBe(true);
	console.log(`Automatic preview started ${(resumedSnapshot.previewStartedAt.at(-1)! - editStartedAt).toFixed(1)} ms after edit; autosave preceded result publication.`);
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");

	await page.getByRole("button", { name: "Fail next preview" }).click();
	await page.getByRole("button", { name: "Refresh preview" }).click();
	await expect(page.locator(".preview-pane .state").last()).toHaveText("stale");
	await expect(frame.locator("body")).toContainText("19");
});