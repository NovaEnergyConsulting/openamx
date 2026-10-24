import { expect, test } from "@playwright/test";

test("runtime panel preserves details, job, output and docking workflows", async ({ page }) => {
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

	await page.getByRole("button", { name: "Right", exact: true }).click();
	await expect(page.locator(".workbench")).toHaveClass(/drawer-right/);
	await page.getByRole("button", { name: "Bottom", exact: true }).click();
	await expect(page.locator(".workbench")).toHaveClass(/drawer-bottom/);

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