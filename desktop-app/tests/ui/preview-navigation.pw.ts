import { expect, test } from "@playwright/test";

const sourceEditor = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: "OpenAMX source" });
const snapshot = (page: import("@playwright/test").Page) => page.evaluate(() =>
	(window as Window & { __openamxHarnessSnapshot: () => { previewNavigationCalls: Array<{ targetId: string; previewToken: string }> } }).__openamxHarnessSnapshot()
);

test("preview links require a trusted frame click and never accept forged or synthetic navigation", async ({ page }) => {
	const outbound: string[] = [];
	page.on("request", request => {
		if (!request.url().startsWith("http://127.0.0.1:4183/")) outbound.push(request.url());
	});
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]');
	await page.getByRole("button", { name: "Refresh preview" }).click();
	await expect(frame.locator("body")).toContainText("3");

	await sourceEditor(page).fill("# Preview navigation fixture\n\n[Open external link](https://example.invalid/report)\n\n[Internal anchor](#inside)\n\n## Inside\n");
	await page.getByRole("button", { name: "Refresh preview" }).click();
	await expect(frame.getByRole("link", { name: "Open external link" })).toBeVisible();
	await expect(frame.getByRole("heading", { name: "Inside" })).toBeVisible();
	const previewFrame = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
	await expect(previewFrame).toHaveAttribute("sandbox", "allow-scripts");
	const embeddedHtml = await previewFrame.evaluate(element => (element as HTMLIFrameElement).srcdoc);
	expect(embeddedHtml).not.toContain("https://example.invalid/report");
	expect(embeddedHtml).not.toContain("allow-same-origin");
	expect(embeddedHtml).toContain('data-openamx-target="eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"');

	await frame.getByRole("link", { name: "Internal anchor" }).click();
	await expect.poll(async () => (await snapshot(page)).previewNavigationCalls.length).toBe(0);
	await expect(frame.locator("body")).toContainText("Inside");

	await frame.getByRole("link", { name: "Open external link" }).click();
	await expect.poll(async () => (await snapshot(page)).previewNavigationCalls.length).toBe(1);
	const accepted = (await snapshot(page)).previewNavigationCalls[0];
	expect(accepted.targetId).toBe("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
	expect(accepted.previewToken).toMatch(/^[a-f0-9]{64}$/);

	await frame.getByRole("link", { name: "Open external link" }).evaluate(element => {
		element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
	});
	await previewFrame.evaluate(element => {
		const child = (element as HTMLIFrameElement).contentWindow!;
		child.postMessage({
			version: 1, type: "navigate", targetId: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
			previewToken: "0".repeat(64), href: "https://attacker.invalid/forged"
		}, "*");
	});
	await page.waitForTimeout(100);
	expect((await snapshot(page)).previewNavigationCalls).toHaveLength(1);
	expect(outbound).toEqual([]);
});
