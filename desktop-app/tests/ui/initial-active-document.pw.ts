import { expect, test } from "@playwright/test";

type HarnessIdentity = {
	canonicalActiveUri: string;
	projectGeneration: number;
	documentRevision: number;
	inputSettingsRevision: number;
};

type HarnessSnapshot = {
	currentText: string;
	savedText: string;
	activePath: string | null;
	projectRoot: string;
	generation: number;
	documentRevision: number;
	analysisRequests: Array<{ path: string; revision: number; cursorOffsetProvided: boolean; identity: HarnessIdentity }>;
	analysisCompletionLog: Array<{ path: string; revision: number; diagnosticCount: number; currentPath: string | null }>;
	jobRequests: Array<{ operation: string; identity: HarnessIdentity }>;
	bufferWrites: Array<{ path: string; text: string }>;
	previewCompletionLog: Array<{ identity: HarnessIdentity; status: string; currentPath: string | null }>;
};

const snapshot = (page: import("@playwright/test").Page) => page.evaluate(() =>
	(window as Window & { __openamxHarnessSnapshot: () => HarnessSnapshot }).__openamxHarnessSnapshot()
);

async function gotoHarness(page: import("@playwright/test").Page, url: string) {
	await page.goto(url);
	await page.waitForFunction(() => typeof (window as Window & { __openamxHarnessSnapshot?: unknown }).__openamxHarnessSnapshot === "function");
}

async function openProject(page: import("@playwright/test").Page, scenario = "") {
	await gotoHarness(page, scenario ? `/?scenario=${scenario}` : "/");
	await page.getByRole("button", { name: "Open project" }).click();
}

async function expectInitializedIdentity(page: import("@playwright/test").Page, path: string, value: string) {
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText(value);
	const facts = await snapshot(page);
	const analysis = facts.analysisRequests.filter(request => request.path === path && !request.cursorOffsetProvided);
	const previews = facts.jobRequests.filter(request => request.operation === "preview" && request.identity.canonicalActiveUri === `file://${path}`);
	expect(analysis).toHaveLength(1);
	expect(previews).toHaveLength(1);
	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
	expect(analysis[0]!.identity).toMatchObject({
		canonicalActiveUri: `file://${path}`,
		projectGeneration: facts.generation,
		documentRevision: facts.documentRevision,
		inputSettingsRevision: previews[0]!.identity.inputSettingsRevision
	});
	expect(previews[0]!.identity).toMatchObject({
		projectGeneration: facts.generation,
		documentRevision: facts.documentRevision
	});
	return facts;
}

test("project open and recent restore initialize the active AMX identity once", async ({ page }) => {
	await openProject(page);
	const opened = await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
	expect(opened.activePath).toBe("/sprint042-browser-fixture/report.amx");
	await page.getByRole("button", { name: "Commands" }).click();
	await page.getByRole("textbox", { name: "Search commands" }).fill("Open project");
	await page.getByRole("button", { name: "Open project" }).click();
	const reopened = await snapshot(page);
	expect(reopened.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
	expect(reopened.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);

	await gotoHarness(page, "/?scenario=recent");
	await page.getByRole("button", { name: "/sprint042-recent-fixture" }).click();
	const restored = await expectInitializedIdentity(page, "/sprint042-recent-fixture/report.amx", "23");
	expect(restored.projectRoot).toBe("/sprint042-recent-fixture");
});

test("recovery initializes unsaved source without writing it, and empty projects stay idle", async ({ page }) => {
	await gotoHarness(page, "/?scenario=recovery");
	await page.getByRole("button", { name: "Restore" }).click();
	const recovered = await expectInitializedIdentity(page, "/sprint042-recovery-fixture/report.amx", "41");
	expect(recovered.currentText).toContain("result: Number = 41");
	expect(recovered.savedText).toBe("# Saved recovery fixture version\n");
	expect(recovered.bufferWrites).toHaveLength(0);

	await gotoHarness(page, "/?scenario=recovery-empty");
	await page.getByRole("button", { name: "Restore" }).click();
	await expect(page.locator(".pane-header strong").first()).toHaveText("No document");
	let facts = await snapshot(page);
	expect(facts.activePath).toBeNull();
	expect(facts.analysisRequests).toHaveLength(0);
	expect(facts.jobRequests.filter(request => request.operation === "preview" || request.operation === "run")).toHaveLength(0);

	await openProject(page, "empty");
	await expect(page.locator(".pane-header strong").first()).toHaveText("No document");
	const empty = await snapshot(page);
	expect(empty.activePath).toBeNull();
	expect(empty.analysisRequests).toHaveLength(0);
	expect(empty.jobRequests.filter(request => request.operation === "preview" || request.operation === "run")).toHaveLength(0);

	await gotoHarness(page, "/?scenario=empty-recent");
	await page.getByRole("button", { name: "/sprint042-recent-fixture" }).click();
	await expect(page.locator(".pane-header strong").first()).toHaveText("No document");
	facts = await snapshot(page);
	expect(facts.activePath).toBeNull();
	expect(facts.analysisRequests).toHaveLength(0);
	expect(facts.jobRequests.filter(request => request.operation === "preview" || request.operation === "run")).toHaveLength(0);
});

test("paused activation analyzes without preview, resumes once, and non-AMX files skip AMX work", async ({ page }) => {
	await openProject(page);
	await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
	await page.locator(".explorer").getByRole("button", { name: /report\.amx/ }).click();
	let facts = await snapshot(page);
	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
	await page.getByRole("button", { name: "Pause live preview" }).click();
	await page.locator(".explorer").getByRole("button", { name: /second\.amx/ }).click();
	await expect.poll(async () => (await snapshot(page)).analysisRequests.filter(request => request.path.endsWith("/second.amx") && !request.cursorOffsetProvided).length).toBe(1);
	await page.waitForTimeout(500);
	facts = await snapshot(page);
	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
	await page.getByRole("button", { name: "Resume live preview" }).click();
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText("5");
	facts = await snapshot(page);
	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(2);
	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(2);

	for (const fileName of ["styles.css", "data.csv", "data.json"]) {
		facts = await snapshot(page);
		const analysisCount = facts.analysisRequests.filter(request => !request.cursorOffsetProvided).length;
		const previewCount = facts.jobRequests.filter(request => request.operation === "preview").length;
		await page.locator(".explorer").getByRole("button", { name: new RegExp(fileName.replace(".", "\\.")) }).click();
		await expect.poll(async () => (await snapshot(page)).activePath).toContain(fileName);
		facts = await snapshot(page);
		expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(analysisCount);
		expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(previewCount);
	}
});

test("mapped data opens its schema context and validates without AMX analysis or preview", async ({ page }) => {
	await openProject(page, "mapped");
	await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
	await page.getByRole("tab", { name: /Inputs/ }).click();
	await page.getByRole("button", { name: "Open in Data Editor" }).click();
	await expect(page.locator(".data-inspector")).toContainText("DataRecord");
	await expect.poll(async () => (await snapshot(page)).jobRequests.filter(request => request.operation === "validate-data").length).toBe(1);
	const facts = await snapshot(page);
	expect(facts.activePath).toBe("/sprint042-browser-fixture/mapped-data.json");
	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
	expect(facts.jobRequests.find(request => request.operation === "validate-data")?.identity.canonicalActiveUri).toBe("file:///sprint042-browser-fixture/mapped-data.json");
});

test("late analysis and cancelled preview cannot replace a newer active document; Run stays explicit", async ({ page }) => {
	await openProject(page, "stale");
	await expect.poll(async () => (await snapshot(page)).jobRequests.filter(request => request.operation === "preview").length).toBe(1);
	await page.locator(".explorer").getByRole("button", { name: /second\.amx/ }).click();
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText("5");
	await expect.poll(async () => (await snapshot(page)).previewCompletionLog.some(item => item.identity.canonicalActiveUri.endsWith("/report.amx") && item.status === "cancelled")).toBe(true);
	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText("5");
	let facts = await snapshot(page);
	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided && request.path.endsWith("/report.amx"))).toHaveLength(1);
	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided && request.path.endsWith("/second.amx"))).toHaveLength(1);
	await expect.poll(async () => (await snapshot(page)).analysisCompletionLog.some(item => item.path.endsWith("/report.amx") && item.diagnosticCount > 0)).toBe(true);
	expect(await page.locator(".code-editor .amx-diagnostic").count()).toBe(0);
	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
	await page.keyboard.press("Control+Enter");
	await expect.poll(async () => (await snapshot(page)).jobRequests.filter(request => request.operation === "run").length).toBe(1);
	facts = await snapshot(page);
	expect(facts.jobRequests.filter(request => request.operation === "run")[0]!.identity.canonicalActiveUri.endsWith("/second.amx")).toBe(true);
});

test("create, duplicate, and move operations initialize each resulting AMX document once", async ({ page }) => {
	await openProject(page);
	await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
	await page.locator(".explorer").getByRole("button", { name: "Project actions" }).click();
	await page.getByRole("menu", { name: "Project actions" }).getByRole("menuitem", { name: "New", exact: true }).click();
	page.once("dialog", dialog => dialog.accept("created.amx"));
	await page.getByRole("menu", { name: "New project item" }).getByRole("menuitem", { name: "AMX file" }).click();
	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/created.amx");
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");

	await page.getByRole("button", { name: "Commands" }).click();
	await page.getByRole("textbox", { name: "Search commands" }).fill("Duplicate active file");
	page.once("dialog", dialog => dialog.accept("duplicate.amx"));
	await page.getByRole("button", { name: /Duplicate active file/ }).click();
	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/duplicate.amx");
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");

	await page.locator(".explorer").getByRole("button", { name: "Project actions" }).click();
	page.once("dialog", dialog => dialog.accept("moved.amx"));
	await page.getByRole("menu", { name: "Project actions" }).getByRole("menuitem", { name: "Rename / Move active file" }).click();
	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/moved.amx");
	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");

	const facts = await snapshot(page);
	for (const fileName of ["created.amx", "duplicate.amx", "moved.amx"]) {
		const path = `/sprint042-browser-fixture/${fileName}`;
		expect(facts.analysisRequests.filter(request => request.path === path && !request.cursorOffsetProvided)).toHaveLength(1);
		expect(facts.jobRequests.filter(request => request.operation === "preview" && request.identity.canonicalActiveUri === `file://${path}`)).toHaveLength(1);
	}
	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
});

test("an initial preview failure is recorded once without an automatic retry", async ({ page }) => {
	await openProject(page, "initial-failure");
	await expect(page.locator(".preview-pane .state").last()).toHaveText("failure");
	await expect.poll(async () => (await snapshot(page)).previewCompletionLog.length).toBe(1);
	await page.waitForTimeout(500);
	const facts = await snapshot(page);
	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
});