import { expect, test } from "@playwright/test";

async function openWorkbench(page: import("@playwright/test").Page, width: number, height: number) {
	await page.setViewportSize({ width, height });
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
}

async function panelGeometry(page: import("@playwright/test").Page) {
	return page.evaluate(() => {
		const group = document.querySelector<HTMLElement>(".workbench-panel-group");
	const selectors = [".workbench-explorer-panel", ".workbench-editor-panel", ".workbench-context-panel"];
	const panels = selectors.map(selector => {
		const element = document.querySelector<HTMLElement>(selector);
		const bounds = element?.getBoundingClientRect();
		return { width: bounds?.width ?? 0, height: bounds?.height ?? 0 };
	});
	return {
		groupWidth: group?.clientWidth ?? 0,
		panelTrackWidth: panels.reduce((total, panel) => total + panel.width, 0),
		panels
	};
	});
}

test("App.vue splitters preserve bounded three-panel geometry and keyboard operation", async ({ page }) => {
	const invalidLayoutWarnings: string[] = [];
	page.on("console", message => {
		if (message.type() === "warning" && message.text().includes("Invalid layout total size")) invalidLayoutWarnings.push(message.text());
	});
	await openWorkbench(page, 1024, 720);
	const handles = page.getByRole("separator");
	await expect(handles).toHaveCount(2);
	const explorerHandleElement = page.locator(".resizable-handle").first();
	const explorerHandle = page.getByRole("separator", { name: "Resize explorer" });
	const contextHandle = page.getByRole("separator", { name: "Resize editor and contextual pane" });
	await expect(explorerHandle).toHaveAttribute("aria-orientation", "vertical");
	await expect(contextHandle).toHaveAttribute("aria-orientation", "vertical");
	await expect(explorerHandle).toHaveAttribute("aria-controls", "explorer-panel");
	await expect(explorerHandle).toHaveAttribute("aria-valuetext", "220 pixels");
	const explorerAriaMinimum = Number(await explorerHandle.getAttribute("aria-valuemin"));
	const explorerAriaMaximum = Number(await explorerHandle.getAttribute("aria-valuemax"));
	await expect(contextHandle).toHaveAttribute("aria-valuemin", /2[5-9]|[3-6][0-9]/);
	expect(Number(await contextHandle.getAttribute("aria-valuemax"))).toBeLessThanOrEqual(65);
	await expect(page.locator(".resizable-handle-track").first()).toBeVisible();

	let geometry = await panelGeometry(page);
	expect(geometry.panels).toHaveLength(3);
	expect(geometry.panels[0]!.width).toBeGreaterThanOrEqual(160);
	expect(geometry.panels[0]!.width).toBeLessThanOrEqual(400);
	expect(geometry.panels[1]!.width).toBeGreaterThanOrEqual(260);
	expect(geometry.panels[2]!.width).toBeGreaterThanOrEqual(260);
	expect(geometry.panels[2]!.width / geometry.panelTrackWidth * 100).toBeGreaterThanOrEqual(25);
	expect(geometry.panels[2]!.width / geometry.panelTrackWidth * 100).toBeLessThanOrEqual(65);
	await expect(contextHandle).toHaveAttribute("aria-valuetext", `${Math.round(geometry.panels[1]!.width / geometry.panelTrackWidth * 100)} percent editor width`);

	await page.getByRole("button", { name: "Project actions" }).focus();
	let explorerHandleReached = false;
	for (let index = 0; index < 20 && !explorerHandleReached; index++) {
		await page.keyboard.press("Tab");
		explorerHandleReached = await explorerHandle.evaluate(element => element === document.activeElement);
	}
	expect(explorerHandleReached).toBe(true);
	await expect(explorerHandle).toBeFocused();
	await expect(page.locator(".resizable-handle-track").first()).toHaveCSS("outline-style", "solid");
	await page.keyboard.press("Home");
	await expect(explorerHandle).toHaveAttribute("aria-valuetext", "160 pixels");
	await expect(explorerHandle).toHaveAttribute("aria-valuenow", String(explorerAriaMinimum));
	await page.keyboard.press("End");
	await expect(explorerHandle).toHaveAttribute("aria-valuetext", "400 pixels");
	await expect(explorerHandle).toHaveAttribute("aria-valuenow", String(explorerAriaMaximum));

	await contextHandle.focus();
	await page.keyboard.press("Home");
	geometry = await panelGeometry(page);
	expect(geometry.panels[1]!.width).toBeGreaterThanOrEqual(260);
	expect(geometry.panels[2]!.width / geometry.panelTrackWidth * 100).toBeLessThanOrEqual(65);
	await page.keyboard.press("End");
	await page.keyboard.press("ArrowLeft");
	await expect(contextHandle).toHaveAttribute("aria-valuenow", /\d+/);
	geometry = await panelGeometry(page);
	expect(geometry.panels[1]!.width).toBeGreaterThanOrEqual(260);
	expect(geometry.panels[2]!.width).toBeGreaterThanOrEqual(260);
	expect(geometry.panels[2]!.width / geometry.panelTrackWidth * 100).toBeGreaterThanOrEqual(25);
	expect(geometry.panels[2]!.width / geometry.panelTrackWidth * 100).toBeLessThanOrEqual(65);
	const handleBounds = await explorerHandleElement.boundingBox();
	expect(handleBounds).not.toBeNull();
	if (!handleBounds) throw new Error("Explorer resize handle has no browser bounds.");
	const beforePointerResize = Number((await explorerHandle.getAttribute("aria-valuetext"))?.match(/\d+/)?.[0]);
	await page.mouse.move(handleBounds.x + 1, handleBounds.y + handleBounds.height / 2);
	await page.mouse.down();
	await page.mouse.move(handleBounds.x + 31, handleBounds.y + handleBounds.height / 2, { steps: 4 });
	await page.mouse.up();
	await expect.poll(async () => Number((await explorerHandle.getAttribute("aria-valuetext"))?.match(/\d+/)?.[0])).toBeGreaterThan(beforePointerResize);
	const beforeContextPointerResize = Number(await contextHandle.getAttribute("aria-valuenow"));
	const contextHandleBounds = await contextHandle.boundingBox();
	expect(contextHandleBounds).not.toBeNull();
	if (!contextHandleBounds) throw new Error("Editor/context resize handle has no browser bounds.");
	await page.mouse.move(contextHandleBounds.x + 1, contextHandleBounds.y + contextHandleBounds.height / 2);
	await page.mouse.down();
	await page.mouse.move(contextHandleBounds.x + 31, contextHandleBounds.y + contextHandleBounds.height / 2, { steps: 4 });
	await page.mouse.up();
	await expect.poll(async () => Number(await contextHandle.getAttribute("aria-valuenow"))).toBeGreaterThan(beforeContextPointerResize);
	const previewTab = page.getByRole("tab", { name: "Preview" });
	await previewTab.focus();
	await page.keyboard.press("Shift+Tab");
	await expect(contextHandle).toBeFocused();
	await page.keyboard.press("Tab");
	await expect(contextHandle).not.toBeFocused();

	await page.getByRole("button", { name: "Commands" }).click();
	await page.getByRole("button", { name: "Focus editor" }).click();
	await expect(explorerHandleElement).toHaveCSS("display", "none");
	await page.getByRole("button", { name: "Commands" }).click();
	await page.getByRole("button", { name: "Focus editor" }).click();
	await expect(explorerHandleElement).toHaveCSS("display", "block");
	await page.getByRole("button", { name: "Commands" }).click();
	await page.getByRole("button", { name: "Focus preview" }).click();
	await expect(page.locator(".workbench-editor-panel")).toHaveCSS("display", "none");
	await expect(page.locator(".workbench-context-panel")).toHaveCSS("display", "block");
	await page.getByRole("button", { name: "Commands" }).click();
	await page.getByRole("button", { name: "Focus preview" }).click();
	await expect(page.locator(".workbench-editor-panel")).toHaveCSS("display", "block");

	await page.setViewportSize({ width: 1440, height: 900 });
	geometry = await panelGeometry(page);
	expect(geometry.panels[0]!.width).toBeGreaterThanOrEqual(160);
	expect(geometry.panels[1]!.width).toBeGreaterThanOrEqual(260);
	expect(geometry.panels[2]!.width).toBeGreaterThanOrEqual(260);
	await expect(handles).toHaveCount(2);

	await page.setViewportSize({ width: 820, height: 720 });
	await expect(explorerHandleElement).toHaveCSS("display", "none");
	await expect(page.locator(".explorer")).toBeVisible();
	await expect(page.locator(".editor-pane")).toBeVisible();
	await expect(page.locator(".preview-pane")).toBeVisible();
	await expect(page.locator(".runtime-drawer")).toBeVisible();
	const responsive = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
	expect(responsive.document).toBeLessThanOrEqual(responsive.viewport + 1);
	expect(invalidLayoutWarnings).toEqual([]);
});

test("App.vue restores a recent project with its workbench and bottom runtime", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/?scenario=recent");
	const recentProject = page.getByRole("button", { name: "/sprint042-recent-fixture", exact: true });
	await expect(recentProject).toBeVisible();
	await recentProject.click();
	await expect(page.locator(".project-label")).toHaveText("/sprint042-recent-fixture");
	await expect(page.getByRole("textbox", { name: "OpenAMX source" })).toBeVisible();
	await expect(page.locator(".workbench-panel-group")).toBeVisible();
	await expect(page.getByRole("separator")).toHaveCount(2);
	await expect(page.locator(".runtime-drawer")).toHaveCSS("grid-row", "2");
});