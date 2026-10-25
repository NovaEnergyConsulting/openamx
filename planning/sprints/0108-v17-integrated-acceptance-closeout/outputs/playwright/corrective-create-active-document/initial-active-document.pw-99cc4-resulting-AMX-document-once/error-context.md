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
  - waiting for locator('.explorer').getByRole('button', { name: 'Move / rename' })

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
      - button "Commands" [active] [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e20]:
        - complementary "Project explorer" [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: PROJECT
            - generic "0 folders, 7 files" [ref=e25]: 0/7
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
            - button "created.amx amx" [ref=e46] [cursor=pointer]:
              - generic [ref=e47]: created.amx
              - generic [ref=e48]: amx
            - button "duplicate.amx amx" [ref=e49] [cursor=pointer]:
              - generic [ref=e50]: duplicate.amx
              - generic [ref=e51]: amx
        - separator "Resize explorer" [ref=e52]
        - region "Document editor" [ref=e54]:
          - navigation "Open tabs" [ref=e55]:
            - generic [ref=e56]:
              - button "duplicate.amx" [ref=e57] [cursor=pointer]
              - button "Close duplicate.amx" [ref=e58] [cursor=pointer]: x
          - generic [ref=e59]:
            - strong [ref=e60]: /sprint042-browser-fixture/duplicate.amx
            - generic [ref=e61]: Unsaved
            - generic [ref=e62]:
              - button "Find" [ref=e63] [cursor=pointer]
              - button "Format" [ref=e64] [cursor=pointer]
              - button "Save" [ref=e65] [cursor=pointer]
          - button "Show outline" [ref=e66] [cursor=pointer]
          - generic "OpenAMX source editor" [ref=e68]:
            - generic [ref=e70]:
              - generic [ref=e72]:
                - generic [ref=e73]: "1"
                - generic [ref=e74]: "2"
              - textbox "OpenAMX source" [ref=e77]:
                - generic [ref=e78]: "# New AMX fixture"
        - separator "Resize editor and contextual pane" [ref=e80]
        - region "Active document context" [ref=e82]:
          - generic [ref=e83]:
            - tablist "Context view" [ref=e84]:
              - tab "Preview" [selected] [ref=e85] [cursor=pointer]
              - tab "Inputs" [ref=e89] [cursor=pointer]
            - generic [ref=e94]: success
            - generic [ref=e95]:
              - button "Pause live preview" [ref=e96] [cursor=pointer]
              - button "Refresh preview" [ref=e100] [cursor=pointer]
              - button "Export active document" [ref=e106] [cursor=pointer]: Export
              - button "Report settings" [ref=e110] [cursor=pointer]
          - iframe [ref=e112]:
            - generic [ref=f6e1]:
              - heading "Current preview" [level=1] [ref=f6e2]
              - paragraph [ref=f6e3]: unknown
      - region "Runtime drawer" [ref=e113]:
        - generic [ref=e114]:
          - strong [ref=e115]: RUNTIME
          - generic [ref=e116]: idle
          - button "Run active document" [ref=e117] [cursor=pointer]
          - button "Details" [ref=e120] [cursor=pointer]
        - status [ref=e121]: Preview reflects the current buffer.
```

# Test source

```ts
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
  179 | 	await page.locator(".explorer").getByRole("button", { name: "Project actions" }).click();
  180 | 	await page.getByRole("menu", { name: "Project actions" }).getByRole("menuitem", { name: "New", exact: true }).click();
  181 | 	page.once("dialog", dialog => dialog.accept("created.amx"));
  182 | 	await page.getByRole("menu", { name: "New project item" }).getByRole("menuitem", { name: "AMX file" }).click();
  183 | 	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/created.amx");
  184 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  185 | 
  186 | 	await page.getByRole("button", { name: "Commands" }).click();
  187 | 	await page.getByRole("textbox", { name: "Search commands" }).fill("Duplicate active file");
  188 | 	page.once("dialog", dialog => dialog.accept("duplicate.amx"));
  189 | 	await page.getByRole("button", { name: /Duplicate active file/ }).click();
  190 | 	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/duplicate.amx");
  191 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  192 | 
  193 | 	page.once("dialog", dialog => dialog.accept("moved.amx"));
> 194 | 	await page.locator(".explorer").getByRole("button", { name: "Move / rename" }).click();
      |                                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  195 | 	await expect.poll(async () => (await snapshot(page)).activePath).toBe("/sprint042-browser-fixture/moved.amx");
  196 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("success");
  197 | 
  198 | 	const facts = await snapshot(page);
  199 | 	for (const fileName of ["created.amx", "duplicate.amx", "moved.amx"]) {
  200 | 		const path = `/sprint042-browser-fixture/${fileName}`;
  201 | 		expect(facts.analysisRequests.filter(request => request.path === path && !request.cursorOffsetProvided)).toHaveLength(1);
  202 | 		expect(facts.jobRequests.filter(request => request.operation === "preview" && request.identity.canonicalActiveUri === `file://${path}`)).toHaveLength(1);
  203 | 	}
  204 | 	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
  205 | });
  206 | 
  207 | test("an initial preview failure is recorded once without an automatic retry", async ({ page }) => {
  208 | 	await openProject(page, "initial-failure");
  209 | 	await expect(page.locator(".preview-pane .state").last()).toHaveText("failure");
  210 | 	await expect.poll(async () => (await snapshot(page)).previewCompletionLog.length).toBe(1);
  211 | 	await page.waitForTimeout(500);
  212 | 	const facts = await snapshot(page);
  213 | 	expect(facts.analysisRequests.filter(request => !request.cursorOffsetProvided)).toHaveLength(1);
  214 | 	expect(facts.jobRequests.filter(request => request.operation === "preview")).toHaveLength(1);
  215 | 	expect(facts.jobRequests.filter(request => request.operation === "run")).toHaveLength(0);
  216 | });
```