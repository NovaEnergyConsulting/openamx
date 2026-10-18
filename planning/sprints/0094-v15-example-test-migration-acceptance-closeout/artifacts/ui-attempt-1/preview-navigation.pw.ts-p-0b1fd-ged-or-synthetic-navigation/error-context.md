# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: preview-navigation.pw.ts >> preview links require a trusted frame click and never accept forged or synthetic navigation
- Location: tests\ui\preview-navigation.pw.ts:8:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 91

- Array []
+ Array [
+   "http://127.0.0.1:4194/",
+   "http://127.0.0.1:4194/@vite/client",
+   "http://127.0.0.1:4194/src/main.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/app.css",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/App.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/vxe-pc-ui.js?v=bd9c0d71",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/vxe-pc-ui_lib_language_en-US.js?v=b76397e4",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/vxe-table.js?v=c3d34704",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vxe-pc-ui/lib/style.css",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vxe-table/lib/style.css",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vanilla-jsoneditor/themes/jse-theme-dark.css",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/vue.js?v=e94a8770",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/HelpCenterDialog.vue",
+   "http://127.0.0.1:4194/src/mockRpc.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vite/dist/client/env.mjs",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@lucide_vue.js?v=e270646f",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/package.json?import",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/CodeEditor.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/CommandPalette.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/DataEditorPane.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/ExportDialog.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/InputsPanel.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/PreferencesDialog.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/ProjectExplorer.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/ReportSettingsDialog.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/WelcomeView.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/WorkbenchTabs.vue",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/diagnosticSummary.ts",
+   "http://127.0.0.1:4194/@id/__x00__plugin-vue:export-helper",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-G3PMV62Z.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/starterExamples.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/help-content.json?import",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WO2XEGAN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/completion.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/highlighting.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/symbols.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/formatter/formatAmx.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseDocument.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/typechecker/checkDocument.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/codemirror.js?v=0589ff01",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_commands.js?v=713b949b",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_autocomplete.js?v=86717dc5",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_lang-markdown.js?v=1da43dab",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_lang-css.js?v=e2982f6b",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_language.js?v=8248f26a",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@lezer_highlight.js?v=99507a73",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_state.js?v=b7cf234e",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_view.js?v=c8545ac5",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/@codemirror_search.js?v=a631f71a",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/CodeEditor.vue?vue&type=style&index=0&scoped=8f976c36&lang.css",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/json-editor-vue.js?v=36e12a91",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/vanilla-jsoneditor.js?v=661f558c",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/runtime/csvTextSerialization.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/DataEditorPane.vue?vue&type=style&index=0&lang.css",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseFrontMatter.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/sourceRanges.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/stringScanner.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseStatements.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-IWNKSCBH.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-5IRJQBBQ.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Q6W3NZIS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-QFY4DJNP.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Y2AJZL35.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-CFTU6MB5.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-P3XLUZYX.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-KWXOICCO.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-7AHOZ5VT.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/diagnostics/errors.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/typechecker/declarationRegistry.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WJMGLFIR.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-665WQGGS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-TTP7GFKN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/yaml.js?v=bbf77726",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseExpression.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseFor.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseIf.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff",
+   "http://127.0.0.1:4194/",
+   "http://127.0.0.1:4194/@vite/client",
+   "http://127.0.0.1:4194/src/main.ts",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Fail next preview" [ref=e4] [cursor=pointer]
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: OpenAMX - V0.14.0
      - generic [ref=e8]: /sprint042-browser-fixture
      - button "Help and shortcuts" [ref=e9] [cursor=pointer]
      - button "Preferences" [ref=e13] [cursor=pointer]
      - button "Commands" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - complementary "Project explorer" [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: PROJECT
          - generic [ref=e22]: "2"
        - generic [ref=e23]:
          - button "New AMX" [ref=e24] [cursor=pointer]
          - button "New CSS" [ref=e25] [cursor=pointer]
          - button "New folder" [ref=e26] [cursor=pointer]
          - button "Move / rename" [ref=e27] [cursor=pointer]
        - textbox "Search project files" [ref=e28]:
          - /placeholder: Search files
        - generic [ref=e29]:
          - paragraph [ref=e30]: /sprint042-browser-fixture
          - button "report.amx amx" [ref=e31] [cursor=pointer]:
            - generic [ref=e32]: report.amx
            - generic [ref=e33]: amx
          - button "second.amx amx" [ref=e34] [cursor=pointer]:
            - generic [ref=e35]: second.amx
            - generic [ref=e36]: amx
      - separator "Resize explorer" [ref=e37]
      - region "Document editor" [ref=e38]:
        - navigation "Open tabs" [ref=e39]:
          - generic [ref=e40]:
            - button "report.amx" [ref=e41] [cursor=pointer]
            - button "Close report.amx" [ref=e42] [cursor=pointer]: x
        - generic [ref=e43]:
          - strong [ref=e44]: /sprint042-browser-fixture/report.amx
          - generic [ref=e45]: Unsaved
          - generic [ref=e46]:
            - button "Find" [ref=e47] [cursor=pointer]
            - button "Format" [ref=e48] [cursor=pointer]
            - button "Save" [ref=e49] [cursor=pointer]
        - button "Show outline" [ref=e50] [cursor=pointer]
        - generic "OpenAMX source editor" [ref=e52]:
          - generic [ref=e54]:
            - generic [aria-hidden] [ref=e55]:
              - generic [ref=e56]:
                - generic [ref=e57]: "1"
                - generic [ref=e58]: "2"
                - generic [ref=e59]: "3"
                - generic [ref=e60]: "4"
                - generic [ref=e61]: "5"
                - generic [ref=e62]: "6"
                - generic [ref=e63]: "7"
                - generic [ref=e64]: "8"
              - generic [ref=e65]: ⌄
            - textbox "OpenAMX source" [ref=e68]:
              - generic [ref=e69]: "# Preview navigation fixture"
              - generic [ref=e71]: "[Open external link](https://example.invalid/report)"
              - generic [ref=e73]: "[Internal anchor](#inside)"
              - generic [ref=e75]: "## Inside"
      - separator "Resize contextual pane" [ref=e77]
      - region "Active document context" [ref=e78]:
        - generic [ref=e79]:
          - tablist "Context view" [ref=e80]:
            - tab "Preview" [selected] [ref=e81] [cursor=pointer]
            - tab "Inputs" [ref=e85] [cursor=pointer]
          - generic [ref=e90]: success
          - generic [ref=e91]:
            - button "Pause live preview" [ref=e92] [cursor=pointer]
            - button "Refresh preview" [ref=e96] [cursor=pointer]
            - button "Export active document" [ref=e102] [cursor=pointer]: Export
            - button "Report settings" [ref=e106] [cursor=pointer]
        - iframe [active] [ref=e108]:
          - generic [ref=f4e1]:
            - heading "Current preview" [level=1] [ref=f4e2]
            - paragraph [ref=f4e3]: unknown
            - heading "Inside" [level=2] [ref=f4e4]
            - link "Open external link" [active] [ref=f4e5] [cursor=pointer]:
              - /url: "#"
            - link "Internal anchor" [ref=f4e6] [cursor=pointer]:
              - /url: "#inside"
      - region "Runtime drawer" [ref=e109]:
        - generic [ref=e110]:
          - strong [ref=e111]: RUNTIME
          - generic [ref=e112]: idle
          - button "Run active document" [ref=e113] [cursor=pointer]
          - button "Details" [ref=e116] [cursor=pointer]
          - button "Bottom" [pressed] [ref=e117] [cursor=pointer]
          - button "Right" [ref=e118] [cursor=pointer]
        - status [ref=e119]: Opened the confirmed preview link.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const sourceEditor = (page: import("@playwright/test").Page) => page.getByRole("textbox", { name: "OpenAMX source" });
  4  | const snapshot = (page: import("@playwright/test").Page) => page.evaluate(() =>
  5  | 	(window as Window & { __openamxHarnessSnapshot: () => { previewNavigationCalls: Array<{ targetId: string; previewToken: string }> } }).__openamxHarnessSnapshot()
  6  | );
  7  | 
  8  | test("preview links require a trusted frame click and never accept forged or synthetic navigation", async ({ page }) => {
  9  | 	const outbound: string[] = [];
  10 | 	page.on("request", request => {
  11 | 		if (!request.url().startsWith("http://127.0.0.1:4183/")) outbound.push(request.url());
  12 | 	});
  13 | 	await page.goto("/");
  14 | 	await page.getByRole("button", { name: "Open project" }).click();
  15 | 	const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]');
  16 | 	await page.getByRole("button", { name: "Refresh preview" }).click();
  17 | 	await expect(frame.locator("body")).toContainText("3");
  18 | 
  19 | 	await sourceEditor(page).fill("# Preview navigation fixture\n\n[Open external link](https://example.invalid/report)\n\n[Internal anchor](#inside)\n\n## Inside\n");
  20 | 	await page.getByRole("button", { name: "Refresh preview" }).click();
  21 | 	await expect(frame.getByRole("link", { name: "Open external link" })).toBeVisible();
  22 | 	await expect(frame.getByRole("heading", { name: "Inside" })).toBeVisible();
  23 | 	const previewFrame = page.locator('iframe[title="OpenAMX live HTML preview"]').last();
  24 | 	await expect(previewFrame).toHaveAttribute("sandbox", "allow-scripts");
  25 | 	const embeddedHtml = await previewFrame.evaluate(element => (element as HTMLIFrameElement).srcdoc);
  26 | 	expect(embeddedHtml).not.toContain("https://example.invalid/report");
  27 | 	expect(embeddedHtml).not.toContain("allow-same-origin");
  28 | 	expect(embeddedHtml).toContain('data-openamx-target="eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"');
  29 | 
  30 | 	await frame.getByRole("link", { name: "Internal anchor" }).click();
  31 | 	await expect.poll(async () => (await snapshot(page)).previewNavigationCalls.length).toBe(0);
  32 | 	await expect(frame.locator("body")).toContainText("Inside");
  33 | 
  34 | 	await frame.getByRole("link", { name: "Open external link" }).click();
  35 | 	await expect.poll(async () => (await snapshot(page)).previewNavigationCalls.length).toBe(1);
  36 | 	const accepted = (await snapshot(page)).previewNavigationCalls[0];
  37 | 	expect(accepted.targetId).toBe("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
  38 | 	expect(accepted.previewToken).toMatch(/^[a-f0-9]{64}$/);
  39 | 
  40 | 	await frame.getByRole("link", { name: "Open external link" }).evaluate(element => {
  41 | 		element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  42 | 	});
  43 | 	await previewFrame.evaluate(element => {
  44 | 		const child = (element as HTMLIFrameElement).contentWindow!;
  45 | 		child.postMessage({
  46 | 			version: 1, type: "navigate", targetId: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  47 | 			previewToken: "0".repeat(64), href: "https://attacker.invalid/forged"
  48 | 		}, "*");
  49 | 	});
  50 | 	await page.waitForTimeout(100);
  51 | 	expect((await snapshot(page)).previewNavigationCalls).toHaveLength(1);
> 52 | 	expect(outbound).toEqual([]);
     |                   ^ Error: expect(received).toEqual(expected) // deep equality
  53 | });
  54 | 
  55 | test("a preview link to an AMX file activates its workbench tab", async ({ page }) => {
  56 | 	await page.goto("/");
  57 | 	await page.getByRole("button", { name: "Open project" }).click();
  58 | 	await sourceEditor(page).fill("# Preview AMX link fixture\n");
  59 | 	await page.getByRole("button", { name: "Refresh preview" }).click();
  60 | 	const frame = page.frameLocator('iframe[title="OpenAMX live HTML preview"]');
  61 | 	await frame.getByRole("link", { name: "Open related AMX" }).click();
  62 | 
  63 | 	const linkedTab = page.getByRole("button", { name: "linked.amx", exact: true });
  64 | 	await expect(linkedTab).toHaveAttribute("aria-current", "page");
  65 | 	await expect.poll(async () => (await snapshot(page)).lastOpenedPath).toBe("/sprint042-browser-fixture/linked.amx");
  66 | });
  67 | 
```