import { expect, test } from "@playwright/test";

test("runtime panel preserves details, job, output and bottom-only layout", async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 720 });
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();

	const details = page.getByRole("button", { name: "Details", exact: true });
	await expect(details).toHaveAttribute("aria-expanded", "false");
	await expect(page.locator(".runtime-details")).toHaveCount(0);
	await page.getByRole("button", { name: "Run active document" }).click();
	await expect(page.locator(".runtime-drawer .drawer-heading .state")).toHaveText("success");

	await details.focus();
	await page.keyboard.press("Space");
	const hideDetails = page.getByRole("button", { name: "Hide details" });
	await expect(hideDetails).toHaveAttribute("aria-expanded", "true");
	await expect(page.locator(".runtime-details")).toContainText("result");
	await expect(page.locator(".runtime-details")).toContainText("3");
	await hideDetails.click();
	await expect(page.locator(".runtime-details")).toHaveCount(0);

	await expect(page.locator(".runtime-drawer")).toHaveCSS("grid-row", "2");
	await expect(page.getByRole("button", { name: /^(Bottom|Right)$/ })).toHaveCount(0);
	await page.getByRole("button", { name: "Preferences" }).click();
	await expect(page.getByText("Runtime drawer", { exact: true })).toHaveCount(0);
	const appearance = page.getByLabel("Appearance");
	const autosave = page.getByLabel("Autosave editable files");
	const autosaveDelay = page.getByLabel(/Autosave delay/);
	const wrapping = page.getByLabel("Wrap long editor lines");
	await expect(appearance).toHaveValue("system");
	await expect(autosave).toBeChecked();
	await expect(autosaveDelay).toHaveValue("500");
	await expect(wrapping).toBeVisible();
	await appearance.selectOption("dark");
	await autosaveDelay.fill("700");
	await autosave.uncheck();
	await page.getByRole("button", { name: "Save preferences" }).click();
	await expect(page.locator("main")).toHaveClass(/theme-dark/);
	await page.getByRole("button", { name: "Preferences" }).click();
	await expect(page.getByLabel("Appearance")).toHaveValue("dark");
	await expect(page.getByLabel("Autosave editable files")).not.toBeChecked();
	await expect(page.getByLabel(/Autosave delay/)).toHaveValue("700");
	await page.getByRole("button", { name: "Cancel" }).click();

	await page.getByRole("button", { name: "Refresh preview" }).click();
	const cancel = page.getByRole("button", { name: "Cancel current job" });
	await expect(cancel).toBeVisible();
	await cancel.click();
	await expect(cancel).toHaveCount(0);

	await page.getByRole("button", { name: "Export active document" }).click();
	await page.getByRole("dialog", { name: "Export" }).getByRole("button", { name: /Choose destination/ }).click();
	await expect(page.locator(".runtime-drawer .export-status")).toContainText("Saved report.html");
	await page.getByRole("button", { name: "Open exported file" }).click();
	await expect(page.locator(".runtime-drawer .runtime-status").first()).toContainText("Opened report.html");
	await page.getByRole("button", { name: "Reveal exported file" }).click();
	await expect(page.locator(".runtime-drawer .runtime-status").first()).toContainText("Revealed report.html");
});