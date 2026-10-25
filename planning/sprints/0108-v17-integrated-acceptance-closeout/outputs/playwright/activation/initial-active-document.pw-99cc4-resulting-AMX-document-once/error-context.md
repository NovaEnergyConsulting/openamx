# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: initial-active-document.pw.ts >> create, duplicate, and move operations initialize each resulting AMX document once
- Location: tests\ui\initial-active-document.pw.ts:176:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.explorer').getByRole('button', { name: 'New AMX' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Fail next preview" [ref=e4] [cursor=pointer]
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: OpenAMX - V0.16.1
      - generic [ref=e8]: /sprint042-browser-fixture
      - button "Help and shortcuts" [ref=e9] [cursor=pointer]
      - button "Preferences" [ref=e13] [cursor=pointer]
      - button "Commands" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e20]:
        - complementary "Project explorer" [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: PROJECT
            - generic "0 folders, 5 files" [ref=e25]: 0/5
          - button "Project actions" [ref=e27] [cursor=pointer]
          - textbox "Search project files" [ref=e28]:
            - /placeholder: Search files
          - generic [ref=e29]:
            - button "/sprint042-browser-fixture, folder actions" [ref=e30] [cursor=pointer]: /sprint042-browser-fixture
            - button "report.amx amx" [ref=e31] [cursor=pointer]:
              - generic [ref=e32]: report.amx
              - generic [ref=e33]: amx
            - button "second.amx amx" [ref=e34] [cursor=pointer]:
              - generic [ref=e35]: second.amx
              - generic [ref=e36]: amx
            - button "styles.css css" [ref=e37] [cursor=pointer]:
              - generic [ref=e38]: styles.css
              - generic [ref=e39]: css
            - button "data.csv csv" [ref=e40] [cursor=pointer]:
              - generic [ref=e41]: data.csv
              - generic [ref=e42]: csv
            - button "data.json json" [ref=e43] [cursor=pointer]:
              - generic [ref=e44]: data.json
              - generic [ref=e45]: json
        - separator "Resize explorer" [ref=e46]
        - region "Document editor" [ref=e48]:
          - navigation "Open tabs" [ref=e49]:
            - generic [ref=e50]:
              - button "report.amx" [ref=e51] [cursor=pointer]
              - button "Close report.amx" [ref=e52] [cursor=pointer]: x
          - generic [ref=e53]:
            - strong [ref=e54]: /sprint042-browser-fixture/report.amx
            - generic [ref=e55]:
              - button "Find" [ref=e56] [cursor=pointer]
              - button "Format" [ref=e57] [cursor=pointer]
              - button "Save" [disabled] [ref=e58]
          - button "Show outline" [ref=e59] [cursor=pointer]
          - generic "OpenAMX source editor" [ref=e61]:
            - generic [ref=e63]:
              - generic [aria-hidden] [ref=e64]:
                - generic [ref=e65]:
                  - generic [ref=e66]: "1"
                  - generic [ref=e67]: "2"
                  - generic [ref=e68]: "3"
                  - generic [ref=e69]: "4"
                  - generic [ref=e70]: "5"
                  - generic [ref=e71]: "6"
                - generic [ref=e72]:
                  - generic [ref=e73]: ⌄
                  - generic [ref=e74]: ⌄
              - textbox "OpenAMX source" [ref=e75]:
                - generic [ref=e76]: "# Sprint 042 report"
                - generic [ref=e78]: "```amx"
                - generic [ref=e79]: "export let result: Number = 3"
                - generic [ref=e80]: "```"
        - separator "Resize editor and contextual pane" [ref=e82]
        - region "Active document context" [ref=e84]:
          - generic [ref=e85]:
            - tablist "Context view" [ref=e86]:
              - tab "Preview" [selected] [ref=e87] [cursor=pointer]
              - tab "Inputs" [ref=e91] [cursor=pointer]
            - generic [ref=e96]: success
            - generic [ref=e97]:
              - button "Pause live preview" [ref=e98] [cursor=pointer]
              - button "Refresh preview" [ref=e102] [cursor=pointer]
              - button "Export active document" [ref=e108] [cursor=pointer]: Export
              - button "Report settings" [ref=e112] [cursor=pointer]
          - iframe [ref=e114]:
            - generic [ref=f2e1]:
              - heading "Current preview" [level=1] [ref=f2e2]
              - paragraph [ref=f2e3]: "3"
      - region "Runtime drawer" [ref=e115]:
        - generic [ref=e116]:
          - strong [ref=e117]: RUNTIME
          - generic [ref=e118]: idle
          - button "Run active document" [ref=e119] [cursor=pointer]
          - button "Details" [ref=e122] [cursor=pointer]
        - status [ref=e123]: Preview reflects the current buffer.
```

# Test source

```ts
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
  140 | 
  141 | test("mapped data opens its schema context and validates without AMX analysis or preview", async ({ page }) => {
  142 | 	await openProject(page, "mapped");
  143 | 	await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
  144 | 	await page.getByRole("tab", { name: /Inputs/ }).click();
  145 | 	await page.getByRole("button", { name: "Open in Data Editor" }).click();
  146 | 	await expect(page.locator(".data-inspector")).toContainText("DataRecord");
  147 | 	await expect.poll(async () => (await snapshot(page)).jobRequests.filter(request => request.operation === "validate-data").length).toBe(1);
  148 | 	const facts = await snapshot(page);
  149 | 	expect(facts.activePath).toBe("/sprint042-browser-fixture/mapped-data.json");
  150 | 	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
  151 | 	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
  152 | 	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
  153 | 	expect(facts.jobRequests.find(request => request.operation === "validate-data")?.identity.canonicalActiveUri).toBe("file:///sprint042-browser-fixture/mapped-data.json");
  154 | });
  155 | 
  156 | test("late analysis and cancelled preview cannot replace a newer active document; Run stays explicit", async ({ page }) => {
  157 | 	await openProject(page, "stale");
  158 | 	await expect.poll(async () => (await snapshot(page)).jobRequests.filter(request => request.operation === "preview").length).toBe(1);
  159 | 	await page.locator(".explorer").getByRole("button", { name: /second\.amx/ }).click();
  160 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  161 | 	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText("5");
  162 | 	await expect.poll(async () => (await snapshot(page)).previewCompletionLog.some(item => item.identity.canonicalActiveUri.endsWith("/report.amx") && item.status === "cancelled")).toBe(true);
  163 | 	await expect(page.frameLocator('iframe[title="OpenAMX live HTML preview"]').locator("body")).toContainText("5");
  164 | 	let facts = await snapshot(page);
  165 | 	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided && request.path.endsWith("/report.amx"))).toHaveLength(1);
  166 | 	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided && request.path.endsWith("/second.amx"))).toHaveLength(1);
  167 | 	await expect.poll(async () => (await snapshot(page)).analysisCompletionLog.some(item => item.path.endsWith("/report.amx") && item.diagnosticCount > 0)).toBe(true);
  168 | 	expect(await page.locator(".code-editor .amx-diagnostic").count()).toBe(0);
  169 | 	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
  170 | 	await page.keyboard.press("Control+Enter");
  171 | 	await expect.poll(async () => (await snapshot(page)).jobRequests.filter(request => request.operation === "run").length).toBe(1);
  172 | 	facts = await snapshot(page);
  173 | 	expect(facts.jobRequests.filter(request => request.operation === "run")[0]!.identity.canonicalActiveUri.endsWith("/second.amx")).toBe(true);
  174 | });
  175 | 
  176 | test("create, duplicate, and move operations initialize each resulting AMX document once", async ({ page }) => {
  177 | 	await openProject(page);
  178 | 	await expectInitializedIdentity(page, "/sprint042-browser-fixture/report.amx", "3");
  179 | 	page.once("dialog", dialog => dialog.accept("created.amx"));
> 180 | 	await page.locator(".explorer").getByRole("button", { name: "New AMX" }).click();
      |                                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  181 | 	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/created.amx");
  182 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  183 | 
  184 | 	await page.getByRole("button", { name: "Commands" }).click();
  185 | 	await page.getByRole("textbox", { name: "Search commands" }).fill("Duplicate active file");
  186 | 	page.once("dialog", dialog => dialog.accept("duplicate.amx"));
  187 | 	await page.getByRole("button", { name: /Duplicate active file/ }).click();
  188 | 	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/duplicate.amx");
  189 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  190 | 
  191 | 	page.once("dialog", dialog => dialog.accept("moved.amx"));
  192 | 	await page.locator(".explorer").getByRole("button", { name: "Move / rename" }).click();
  193 | 	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/moved.amx");
  194 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  195 | 
  196 | 	const facts = await snapshot(page);
  197 | 	for (const fileName of ["created.amx", "duplicate.amx", "moved.amx"]) {
  198 | 		const path = `/sprint042-browser-fixture/${fileName}`;
  199 | 		expect(facts.analysisRequests.filter(request => request.path === path && !request.cursorOffsetProvided)).toHaveLength(1);
  200 | 		expect(facts.jobRequests.filter(request => request.operation === "preview" && request.identity.canonicalActiveUri === `file://${path}`)).toHaveLength(1);
  201 | 	}
  202 | 	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
  203 | });
  204 | 
  205 | test("an initial preview failure is recorded once without an automatic retry", async ({ page }) => {
  206 | 	await openProject(page, "initial-failure");
  207 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("failure");
  208 | 	await expect.poll(async () => (await snapshot(page)).previewCompletionLog.length).toBe(1);
  209 | 	await page.waitForTimeout(500);
  210 | 	const facts = await snapshot(page);
  211 | 	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
  212 | 	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
  213 | 	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
  214 | });
```