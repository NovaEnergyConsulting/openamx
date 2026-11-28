import { expect, test, type Page } from "@playwright/test";

type UpdateHarnessSnapshot = {
	updateStateReads: number;
	updateCheckCalls: number;
	updateDownloadCalls: number;
	updateApplyCalls: number;
	mockUpdaterState: { status: string };
	completeUpdateDownload: () => void;
	completeUpdateApply: () => void;
};

type UpdateHarnessWindow = Window & {
	__openamxHarnessSnapshot: () => UpdateHarnessSnapshot;
};

function trackExternalRequests(page: Page) {
	const requests: string[] = [];
	page.on("request", request => {
		if (new URL(request.url()).origin !== "http://127.0.0.1:4183") requests.push(request.url());
	});
	return requests;
}

async function snapshot(page: Page) {
	return page.evaluate(() => (window as UpdateHarnessWindow).__openamxHarnessSnapshot());
}

async function hidePreviewHarnessControl(page: Page) {
	await page.addStyleTag({ content: "#fail-next-preview { display: none !important; }" });
}

async function openUpdateOffer(page: Page, scenario = "update-available") {
	await page.goto(`/?scenario=${scenario}`);
	await hidePreviewHarnessControl(page);
	await expect(page.getByRole("dialog", { name: /Version 0\.21\.1 is available/ })).toBeVisible();
}

async function runCheckCommand(page: Page) {
	await hidePreviewHarnessControl(page);
	await page.getByRole("button", { name: "Commands" }).click();
	const palette = page.getByRole("dialog", { name: "Commands" });
	await palette.getByRole("textbox", { name: "Search commands" }).fill("Check for updates");
	await palette.getByRole("button", { name: "Check for updates" }).click();
}

async function stageUpdate(page: Page, scenario: string) {
	await openUpdateOffer(page, scenario);
	await page.getByRole("button", { name: "Update", exact: true }).click();
	await expect(page.getByRole("button", { name: "Restart to update" })).toBeVisible();
}

test("Check for updates is searchable and an up-to-date result stays quiet", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await page.goto("/?scenario=manual-no-update");
	await runCheckCommand(page);
	await expect.poll(async () => (await snapshot(page)).updateCheckCalls).toBe(1);
	await expect(page.getByRole("dialog", { name: /Version/ })).toHaveCount(0);
	await expect(page.locator(".update-chrome [role='alert']")).toHaveCount(0);
	expect((await snapshot(page)).updateDownloadCalls).toBe(0);
	expect(externalRequests).toEqual([]);
});

test("routine check failures stay quiet", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await page.goto("/?scenario=manual-check-failure");
	await runCheckCommand(page);
	await expect.poll(async () => (await snapshot(page)).updateCheckCalls).toBe(1);
	await expect(page.getByRole("dialog", { name: /Version/ })).toHaveCount(0);
	await expect(page.locator(".update-chrome [role='alert']")).toHaveCount(0);
	expect((await snapshot(page)).updateDownloadCalls).toBe(0);
	expect(externalRequests).toEqual([]);
});

test("a delayed startup result appears from local state without another host check", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await openUpdateOffer(page, "startup-delayed");
	const result = await snapshot(page);
	expect(result.updateStateReads).toBeGreaterThanOrEqual(2);
	expect(result.updateCheckCalls).toBe(0);
	expect(result.updateDownloadCalls).toBe(0);
	expect(externalRequests).toEqual([]);
});

test("Later, Escape, and close dismiss the offer without downloading", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await openUpdateOffer(page);
	await page.getByRole("button", { name: "Later", exact: true }).click();
	await expect(page.getByRole("dialog", { name: /Version/ })).toHaveCount(0);
	await runCheckCommand(page);
	await expect(page.getByRole("dialog", { name: /Version 0\.21\.1 is available/ })).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("dialog", { name: /Version/ })).toHaveCount(0);
	await runCheckCommand(page);
	const offer = page.getByRole("dialog", { name: /Version 0\.21\.1 is available/ });
	await expect(offer).toBeVisible();
	await offer.getByRole("button", { name: "Close update offer" }).click();
	await expect(offer).toHaveCount(0);
	const result = await snapshot(page);
	expect(result.updateCheckCalls).toBe(2);
	expect(result.updateDownloadCalls).toBe(0);
	expect(externalRequests).toEqual([]);
});

test("consent starts one preparation and displays no fabricated progress", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await openUpdateOffer(page, "download-pending");
	await page.getByRole("button", { name: "Update", exact: true }).click();
	await expect(page.getByRole("dialog", { name: /Version/ })).toHaveCount(0);
	await expect(page.locator(".update-chrome [role='status']")).toHaveText("Preparing version 0.21.1…");
	await expect(page.getByRole("progressbar")).toHaveCount(0);
	expect((await snapshot(page)).updateDownloadCalls).toBe(1);
	await page.evaluate(() => (window as UpdateHarnessWindow).__openamxHarnessSnapshot().completeUpdateDownload());
	await expect(page.getByRole("button", { name: "Restart to update" })).toBeVisible();
	await expect(page.locator(".update-chrome [role='status']")).toContainText("ready to install");
	expect(externalRequests).toEqual([]);
});

test("download failure is contextual and offers an explicit check-again path", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await openUpdateOffer(page, "download-failure");
	await page.getByRole("button", { name: "Update", exact: true }).click();
	await expect(page.locator(".update-chrome [role='alert']")).toContainText("could not be prepared");
	await page.getByRole("button", { name: "Check again" }).click();
	await expect(page.getByRole("dialog", { name: /Version 0\.21\.1 is available/ })).toBeVisible();
	const result = await snapshot(page);
	expect(result.updateDownloadCalls).toBe(1);
	expect(result.updateCheckCalls).toBe(1);
	expect(externalRequests).toEqual([]);
});

test("successful Save All and Discard All guard outcomes use the same restart action", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	for (const scenario of ["apply-save", "apply-discard"]) {
		await stageUpdate(page, scenario);
		await page.getByRole("button", { name: "Restart to update" }).click();
		await expect(page.locator(".update-chrome [role='status']")).toContainText("Restarting to apply version 0.21.1");
		expect((await snapshot(page)).updateApplyCalls).toBe(1);
	}
	expect(externalRequests).toEqual([]);
});

test("Cancel keeps the staged update visible and a retry reruns the guarded apply", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await stageUpdate(page, "apply-cancel");
	await page.getByRole("button", { name: "Restart to update" }).click();
	await expect(page.getByRole("button", { name: "Restart to update" })).toBeVisible();
	expect((await snapshot(page)).mockUpdaterState.status).toBe("ready");
	expect((await snapshot(page)).updateApplyCalls).toBe(1);
	await page.getByRole("button", { name: "Restart to update" }).click();
	await expect(page.locator(".update-chrome [role='status']")).toContainText("Restarting to apply version 0.21.1");
	expect((await snapshot(page)).updateApplyCalls).toBe(2);
	expect((await snapshot(page)).updateDownloadCalls).toBe(1);
	expect(externalRequests).toEqual([]);
});

test("save/conflict failure keeps a persistent restart retry", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await stageUpdate(page, "apply-save-failure-retry");
	await page.getByRole("button", { name: "Restart to update" }).click();
	await expect(page.locator(".update-chrome [role='alert']")).toContainText("tab could not be saved");
	await expect(page.getByRole("button", { name: "Restart to update" })).toBeVisible();
	await page.getByRole("button", { name: "Restart to update" }).click();
	await expect(page.locator(".update-chrome [role='status']")).toContainText("Restarting to apply version 0.21.1");
	expect((await snapshot(page)).updateApplyCalls).toBe(2);
	expect(externalRequests).toEqual([]);
});

test("duplicate apply interaction stays disabled while the guard/apply request is pending", async ({ page }) => {
	const externalRequests = trackExternalRequests(page);
	await stageUpdate(page, "apply-pending");
	const restart = page.getByRole("button", { name: "Restart to update" });
	await restart.click();
	await expect(restart).toBeDisabled();
	expect((await snapshot(page)).updateApplyCalls).toBe(1);
	await page.evaluate(() => (window as UpdateHarnessWindow).__openamxHarnessSnapshot().completeUpdateApply());
	await expect(page.locator(".update-chrome [role='status']")).toContainText("Restarting to apply version 0.21.1");
	expect((await snapshot(page)).updateApplyCalls).toBe(1);
	expect(externalRequests).toEqual([]);
});