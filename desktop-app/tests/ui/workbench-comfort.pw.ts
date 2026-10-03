import { expect, test, type Page, type TestInfo } from "@playwright/test";

async function openWorkbench(page: Page, width: number, height: number) {
	await page.setViewportSize({ width, height });
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	await page.getByRole("button", { name: "Pause live preview" }).click();
	await page.getByRole("button", { name: "Details" }).click();
	await page.locator(".explorer").evaluate(element => {
		for (let index = 0; index < 120; index++) {
			const row = document.createElement("p");
			row.textContent = `long explorer item ${index}`;
			element.append(row);
		}
	});
	await page.getByRole("textbox", { name: "OpenAMX source" }).fill(`${"long editor line ".repeat(24)}\n`.repeat(100));
	await page.locator("iframe[title='OpenAMX live HTML preview']").evaluate(element => {
		(element as HTMLIFrameElement).srcdoc = `<body>${"<p>long preview row</p>".repeat(160)}</body>`;
	});
	await page.locator(".runtime-details").evaluate(element => {
		for (let index = 0; index < 120; index++) {
			const row = document.createElement("p");
			row.textContent = `long runtime diagnostic ${index} ${"unbroken-diagnostic-content-".repeat(12)}`;
			element.append(row);
		}
	});
}

async function addRuntimeReviewStates(page: Page) {
	await page.locator(".runtime-details").evaluate(element => {
		for (const state of ["idle", "running", "success", "failure", "stale", "cancelled"]) {
			const label = document.createElement("span");
			label.className = `state state-${state}`;
			label.textContent = state;
			element.append(label);
		}
		const stage = document.createElement("span");
		stage.className = "drawer-stage";
		stage.textContent = "Rendering";
		element.append(stage);
		const diagnostic = document.createElement("button");
		diagnostic.className = "diagnostic-link";
		diagnostic.textContent = "AMX3001: example diagnostic";
		element.append(diagnostic);
		const muted = document.createElement("p");
		muted.className = "muted";
		muted.textContent = "Muted runtime copy";
		element.append(muted);
		const code = document.createElement("code");
		code.textContent = "let result = 1";
		element.append(code);
	});
}

async function captureViewport(page: Page, testInfo: TestInfo, filename: string) {
	await page.screenshot({ path: testInfo.outputPath(filename), animations: "disabled", style: "#fail-next-preview { display: none !important; }" });
}

async function currentSource(page: Page) {
	return page.evaluate(() => (window as unknown as Window & { __openamxHarnessSnapshot: () => { currentText: string } }).__openamxHarnessSnapshot().currentText);
}

test("long workbench panes stay bounded and scroll independently", async ({ page }, testInfo) => {
	const viewports = [
		{ width: 1024, height: 720, name: "1024x720" },
		{ width: 1440, height: 900, name: "1440x900" },
		{ width: 820, height: 720, name: "820x720-adaptive" }
	];
	for (const [index, viewport] of viewports.entries()) {
		await openWorkbench(page, viewport.width, viewport.height);
		const dimensions = await page.evaluate(() => ({
			viewport: window.innerHeight,
			document: document.documentElement.scrollHeight,
			documentWidth: document.documentElement.scrollWidth,
			viewportWidth: document.documentElement.clientWidth,
			panes: [".explorer", ".cm-scroller", ".runtime-drawer"].map(selector => {
				const element = document.querySelector(selector) as HTMLElement;
				return { selector, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight };
			})
		}));
		expect(dimensions.document, viewport.name).toBeLessThanOrEqual(dimensions.viewport + 1);
		expect(dimensions.documentWidth, viewport.name).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
		for (const pane of dimensions.panes) expect(pane.scrollHeight, `${viewport.name} ${pane.selector}`).toBeGreaterThan(pane.clientHeight);
		const frameDimensions = await page.frameLocator("iframe[title='OpenAMX live HTML preview']").locator("body").evaluate(element => ({
			scrollHeight: element.ownerDocument.documentElement.scrollHeight,
			clientHeight: element.ownerDocument.documentElement.clientHeight
		}));
		expect(frameDimensions.scrollHeight).toBeGreaterThan(frameDimensions.clientHeight);

		const scrollPositions = await page.evaluate(() => {
			const explorer = document.querySelector(".explorer") as HTMLElement;
			const editor = document.querySelector(".cm-scroller") as HTMLElement;
			const runtime = document.querySelector(".runtime-drawer") as HTMLElement;
			explorer.scrollTop = 0;
			editor.scrollTop = 0;
			runtime.scrollTop = 0;
			explorer.scrollTop = 120;
			const afterExplorer = [explorer.scrollTop, editor.scrollTop, runtime.scrollTop];
			editor.scrollTop = 160;
			const afterEditor = [explorer.scrollTop, editor.scrollTop, runtime.scrollTop];
			runtime.scrollTop = 100;
			return { afterExplorer, afterEditor, explorerTop: explorer.scrollTop, editorTop: editor.scrollTop, runtimeTop: runtime.scrollTop };
		});
		const previewScrollTop = await page.frameLocator("iframe[title='OpenAMX live HTML preview']").locator("body").evaluate(element => {
			window.scrollTo(0, 180);
			return window.scrollY;
		});
		expect(scrollPositions.afterExplorer[0]).toBeGreaterThan(0);
		expect(scrollPositions.afterExplorer.slice(1)).toEqual([0, 0]);
		expect(scrollPositions.afterEditor[0]).toBe(scrollPositions.afterExplorer[0]);
		expect(scrollPositions.afterEditor[1]).toBeGreaterThan(0);
		expect(scrollPositions.afterEditor[2]).toBe(0);
		expect(previewScrollTop).toBeGreaterThan(0);
		expect(scrollPositions.explorerTop).toBe(scrollPositions.afterEditor[0]);
		expect(scrollPositions.editorTop).toBe(scrollPositions.afterEditor[1]);
		expect(scrollPositions.runtimeTop).toBeGreaterThan(0);
		if (viewport.name === "820x720-adaptive") {
			await page.getByRole("button", { name: "Right" }).click();
			const drawerBounds = await page.locator(".runtime-drawer").evaluate(element => {
				const { left, right, top, bottom } = element.getBoundingClientRect();
				return { left, right, top, bottom };
			});
			expect(drawerBounds.left).toBeGreaterThanOrEqual(0);
			expect(drawerBounds.right).toBeLessThanOrEqual(viewport.width);
			expect(drawerBounds.bottom).toBeLessThanOrEqual(viewport.height);
		}
		await captureViewport(page, testInfo, `sprint045-${viewport.name}-light.png`);
		if (index < viewports.length - 1) await page.goto("about:blank");
	}

	console.log(`Visual evidence: Chromium ${page.context().browser()?.version()}; host ${process.platform}/${process.arch}; viewports 1024x720, 1440x900, and 820x720 adaptive.`);
});

test("global wrapping defaults on, persists, and editor indentation stays focus-scoped", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	const editor = page.getByRole("textbox", { name: "OpenAMX source" });
	await expect(page.locator(".cm-content")).toHaveClass(/cm-lineWrapping/);
	await page.getByRole("button", { name: "second.amx" }).click();
	await expect(page.locator(".cm-content")).toHaveClass(/cm-lineWrapping/);
	await page.getByRole("button", { name: "report.amx" }).click();
	await editor.fill("alpha\nbeta");
	await editor.press("Home");
	await editor.press("Tab");
	await expect.poll(() => currentSource(page)).toBe("alpha\n  beta");
	await expect(page.locator(".cm-editor.cm-focused")).toHaveCount(1);
	await editor.press("Shift+Tab");
	await expect.poll(() => currentSource(page)).toBe("alpha\nbeta");

	await page.getByRole("button", { name: "Preferences" }).click();
	const wrapping = page.getByRole("checkbox", { name: "Wrap long editor lines" });
	await expect(wrapping).toBeChecked();
	const sourceBeforePreferenceSave = await currentSource(page);
	await wrapping.uncheck();
	await page.getByRole("button", { name: "Save preferences" }).click();
	await expect(page.locator(".cm-content")).not.toHaveClass(/cm-lineWrapping/);
	await expect.poll(() => currentSource(page)).toBe(sourceBeforePreferenceSave);
	await page.getByRole("button", { name: "second.amx" }).click();
	await expect(page.locator(".cm-content")).not.toHaveClass(/cm-lineWrapping/);
	await page.reload();
	await page.getByRole("button", { name: "Open project" }).click();
	await expect(page.locator(".cm-content")).not.toHaveClass(/cm-lineWrapping/);
	await page.getByRole("button", { name: "Preferences" }).click();
	await expect(page.getByRole("checkbox", { name: "Wrap long editor lines" })).not.toBeChecked();

	await page.getByRole("button", { name: "Cancel" }).click();
	const explorerSearch = page.getByRole("textbox", { name: "Search project files" });
	await explorerSearch.focus();
	const originalText = await editor.textContent();
	await page.keyboard.press("Tab");
	await expect(explorerSearch).not.toBeFocused();
	await expect(page.locator(".cm-editor.cm-focused")).toHaveCount(0);
	await expect(editor).toHaveText(originalText ?? "");
});

test("runtime drawer text foregrounds resolve in light and dark themes", async ({ page }, testInfo) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/");
	await page.getByRole("button", { name: "Open project" }).click();
	await page.getByRole("button", { name: "Details" }).click();
	await addRuntimeReviewStates(page);
	const textCategories = [".runtime-status", ".drawer-stage", ".diagnostic-link", ".muted", ".runtime-details code"];
	for (const theme of ["light", "dark"] as const) {
		await page.locator("main").evaluate((element, selectedTheme) => {
			document.documentElement.dataset.theme = selectedTheme;
			element.setAttribute("class", `theme-${selectedTheme}`);
		}, theme);
		const contrasts = await page.evaluate(selectors => {
			const luminance = (rgb: string) => {
				const channels = rgb.match(/[\d.]+/g)!.slice(0, 3).map(value => Number(value) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
				return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
			};
			const surface = getComputedStyle(document.querySelector(".runtime-drawer")!).backgroundColor;
			return Object.fromEntries(selectors.map(selector => {
				const color = getComputedStyle(document.querySelector(selector)!).color;
				const values = [luminance(color), luminance(surface)].sort((left, right) => right - left);
				return [selector, (values[0]! + 0.05) / (values[1]! + 0.05)];
			}));
		}, [...textCategories, ...["idle", "running", "success", "failure", "stale", "cancelled"].map(state => `.runtime-details .state-${state}`)]);
		for (const [selector, contrast] of Object.entries(contrasts)) expect(contrast, `${theme} ${selector}`).toBeGreaterThanOrEqual(4.5);
		await captureViewport(page, testInfo, `sprint045-1440x900-${theme}-runtime.png`);
	}
});