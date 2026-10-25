# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: initial-active-document.pw.ts >> mapped data opens its schema context and validates without AMX analysis or preview
- Location: tests\ui\initial-active-document.pw.ts:141:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.preview-pane .state').last()
Expected: "success"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" locator('.preview-pane .state').last() with timeout 5000ms
  - waiting for locator('.preview-pane .state').last()
    5 × locator resolved to <span class="state state-idle">idle</span>
      - unexpected value "idle"

```

```yaml
- button "Fail next preview"
- main:
  - text: OpenAMX - V0.16.1 Welcome
  - button "Help and shortcuts"
  - button "Preferences"
  - button "Commands"
  - region "Welcome to OpenAMX":
    - paragraph: OPENAMX WORKBENCH
    - heading "Open or create a project" [level=1]
    - paragraph: Create a project in an empty folder, open an existing project or choose a recent project from the list below.
    - button "Open project"
    - button "Create project"
    - status: Open a project and an .amx file to begin.
    - region "Recent projects":
      - text: RECENT PROJECTS
      - paragraph: No validated recent projects.
    - text: "Recovery: no snapshots to restore"
    - button "Help and shortcuts"
    - button "Release notes"
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | type HarnessIdentity = {
  4   | 	canonicalActiveUri: string;
  5   | 	projectGeneration: number;
  6   | 	documentRevision: number;
  7   | 	inputSettingsRevision: number;
  8   | };
  9   | 
  10  | type HarnessSnapshot = {
  11  | 	currentText: string;
  12  | 	savedText: string;
  13  | 	activePath: string | null;
  14  | 	projectRoot: string;
  15  | 	generation: number;
  16  | 	documentRevision: number;
  17  | 	analysisRequests: Array<{ path: string; revision: number; cursorOffsetProvided: boolean; identity: HarnessIdentity }>;
  18  | 	analysisCompletionLog: Array<{ path: string; revision: number; diagnosticCount: number; currentPath: string | null }>;
  19  | 	jobRequests: Array<{ operation: string; identity: HarnessIdentity }>;
  20  | 	bufferWrites: Array<{ path: string; text: string }>;
  21  | 	previewCompletionLog: Array<{ identity: HarnessIdentity; status: string; currentPath: string | null }>;
  22  | };
  23  | 
  24  | const snapshot = (page: import("@playwright/test").Page) => page.evaluate(() =>
  25  | 	(window as Window & { __openamxHarnessSnapshot: () => HarnessSnapshot }).__openamxHarnessSnapshot()
  26  | );
  27  | 
  28  | async function gotoHarness(page: import("@playwright/test").Page, url: string) {
  29  | 	await page.goto(url);
  30  | 	await page.waitForFunction(() => typeof (window as Window & { __openamxHarnessSnapshot?: unknown }).__openamxHarnessSnapshot === "function");
  31  | }
  32  | 
  33  | async function openProject(page: import("@playwright/test").Page, scenario = "") {
  34  | 	await gotoHarness(page, scenario ? `/?scenario=${scenario}` : "/");
  35  | 	await page.getByRole("button", { name: "Open project" }).click();
  36  | }
  37  | 
  38  | async function expectInitializedIdentity(page: import("@playwright/test").Page, path: string, value: string) {
> 39  | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
      |                                                            ^ Error: expect(locator).toHaveText(expected) failed
  40  | 	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText(value);
  41  | 	const facts = await snapshot(page);
  42  | 	const analysis = facts.analysisRequests.filter(request => request.path === path && !request.cursorOffsetProvided);
  43  | 	const previews = facts.jobRequests.filter(request => request.operation === "preview" && request.identity.canonicalActiveUri === `file://${path}`);
  44  | 	expect(analysis).toHaveLength(1);
  45  | 	expect(previews).toHaveLength(1);
  46  | 	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
  47  | 	expect(analysis[0]!.identity).toMatchObject({
  48  | 		canonicalActiveUri: `file://${path}`,
  49  | 		projectGeneration: facts.generation,
  50  | 		documentRevision: facts.documentRevision,
  51  | 		inputSettingsRevision: previews[0]!.identity.inputSettingsRevision
  52  | 	});
  53  | 	expect(previews[0]!.identity).toMatchObject({
  54  | 		projectGeneration: facts.generation,
  55  | 		documentRevision: facts.documentRevision
  56  | 	});
  57  | 	return facts;
  58  | }
  59  | 
  60  | test("project open and recent restore initialize the active AMX identity once", async ({ page }) => {
  61  | 	await openProject(page);
  62  | 	const opened = await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
  63  | 	expect(opened.activePath).toBe("/sprint042-browser-fixture/report.amx");
  64  | 	await page.getByRole("button", { name: "Commands" }).click();
  65  | 	await page.getByRole("textbox", { name: "Search commands" }).fill("Open project");
  66  | 	await page.getByRole("button", { name: "Open project" }).click();
  67  | 	const reopened = await snapshot(page);
  68  | 	expect(reopened.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
  69  | 	expect(reopened.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
  70  | 
  71  | 	await gotoHarness(page, "/?scenario=recent");
  72  | 	await page.getByRole("button", { name: "/sprint042-recent-fixture" }).click();
  73  | 	const restored = await expectInitializedIdentity(page, "/sprint042-recent-fixture/report.amx", "23");
  74  | 	expect(restored.projectRoot).toBe("/sprint042-recent-fixture");
  75  | });
  76  | 
  77  | test("recovery initializes unsaved source without writing it, and empty projects stay idle", async ({ page }) => {
  78  | 	await gotoHarness(page, "/?scenario=recovery");
  79  | 	await page.getByRole("button", { name: "Restore" }).click();
  80  | 	const recovered = await expectInitializedIdentity(page, "/sprint042-recovery-fixture/report.amx", "41");
  81  | 	expect(recovered.currentText).toContain("result: Number = 41");
  82  | 	expect(recovered.savedText).toBe("# Saved recovery fixture version\n");
  83  | 	expect(recovered.bufferWrites).toHaveLength(0);
  84  | 
  85  | 	await gotoHarness(page, "/?scenario=recovery-empty");
  86  | 	await page.getByRole("button", { name: "Restore" }).click();
  87  | 	await expect(page.locator(".pane-header strong").first()).toHaveText("No document");
  88  | 	let facts = await snapshot(page);
  89  | 	expect(facts.activePath).toBeNull();
  90  | 	expect(facts.analysisRequests).toHaveLength(0);
  91  | 	expect(facts.jobRequests.filter(request => request.operation === "preview" || request.operation === "run")).toHaveLength(0);
  92  | 
  93  | 	await openProject(page, "empty");
  94  | 	await expect(page.locator(".pane-header strong").first()).toHaveText("No document");
  95  | 	const empty = await snapshot(page);
  96  | 	expect(empty.activePath).toBeNull();
  97  | 	expect(empty.analysisRequests).toHaveLength(0);
  98  | 	expect(empty.jobRequests.filter(request => request.operation === "preview" || request.operation === "run")).toHaveLength(0);
  99  | 
  100 | 	await gotoHarness(page, "/?scenario=empty-recent");
  101 | 	await page.getByRole("button", { name: "/sprint042-recent-fixture" }).click();
  102 | 	await expect(page.locator(".pane-header strong").first()).toHaveText("No document");
  103 | 	facts = await snapshot(page);
  104 | 	expect(facts.activePath).toBeNull();
  105 | 	expect(facts.analysisRequests).toHaveLength(0);
  106 | 	expect(facts.jobRequests.filter(request => request.operation === "preview" || request.operation === "run")).toHaveLength(0);
  107 | });
  108 | 
  109 | test("paused activation analyzes without preview, resumes once, and non-AMX files skip AMX work", async ({ page }) => {
  110 | 	await openProject(page);
  111 | 	await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
  112 | 	await page.locator(".explorer").getByRole("button", { name: /report\.amx/ }).click();
  113 | 	let facts = await snapshot(page);
  114 | 	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
  115 | 	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
  116 | 	await page.getByRole("button", { name: "Pause live preview" }).click();
  117 | 	await page.locator(".explorer").getByRole("button", { name: /second\.amx/ }).click();
  118 | 	await expect.poll(async () => (await snapshot(page)).analysisRequests.filter(request => request.path.endsWith("/second.amx") && !request.cursorOffsetProvided).length).toBe(1);
  119 | 	await page.waitForTimeout(500);
  120 | 	facts = await snapshot(page);
  121 | 	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
  122 | 	await page.getByRole("button", { name: "Resume live preview" }).click();
  123 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  124 | 	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText("5");
  125 | 	facts = await snapshot(page);
  126 | 	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(2);
  127 | 	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(2);
  128 | 
  129 | 	for (const fileName of ["styles.css", "data.csv", "data.json"]) {
  130 | 		facts = await snapshot(page);
  131 | 		const analysisCount = facts.analysisRequests.filter(request => !request.cursorOffsetProvided).length;
  132 | 		const previewCount = facts.jobRequests.filter(request => request.operation === "preview").length;
  133 | 		await page.locator(".explorer").getByRole("button", { name: new RegExp(fileName.replace(".", "\\.")) }).click();
  134 | 		await expect.poll(async () => (await snapshot(page)).activePath).toContain(fileName);
  135 | 		facts = await snapshot(page);
  136 | 		expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(analysisCount);
  137 | 		expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(previewCount);
  138 | 	}
  139 | });
```