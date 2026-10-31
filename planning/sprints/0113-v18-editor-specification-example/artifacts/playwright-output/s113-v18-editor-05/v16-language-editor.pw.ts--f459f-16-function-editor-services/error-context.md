# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v16-language-editor.pw.ts >> desktop CodeMirror exposes V0.16 function editor services
- Location: tests\ui\v16-language-editor.pw.ts:71:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  -  4
+ Received  + 24

  Object {
    "diagnostics": Array [],
-   "highlights": ArrayContaining [
-     ObjectContaining {
-       "from": 295,
+   "highlights": Array [
+     Object {
+       "from": 28,
        "kind": "keyword",
-       "to": 301,
+       "to": 34,
+     },
+     Object {
+       "from": 35,
+       "kind": "keyword",
+       "to": 38,
+     },
+     Object {
+       "from": 39,
+       "kind": "declaration",
+       "to": 45,
+     },
+     Object {
+       "from": 47,
+       "kind": "type",
+       "to": 53,
+     },
+     Object {
+       "from": 56,
+       "kind": "literal",
+       "to": 57,
      },
    ],
  }

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Fail next preview" [ref=e4] [cursor=pointer]
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: OpenAMX - V0.17.0
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
              - button "report.amxUnsaved changes" [ref=e51] [cursor=pointer]: report.amx *
              - button "Close report.amx" [ref=e52] [cursor=pointer]: x
          - generic [ref=e53]:
            - strong [ref=e54]: /sprint042-browser-fixture/report.amx
            - generic [ref=e55]: Unsaved
            - generic [ref=e56]:
              - button "Find" [ref=e57] [cursor=pointer]
              - button "Format" [ref=e58] [cursor=pointer]
              - button "Save" [ref=e59] [cursor=pointer]
          - button "Show outline" [ref=e60] [cursor=pointer]
          - generic "OpenAMX source editor" [ref=e62]:
            - generic [ref=e64]:
              - generic [aria-hidden] [ref=e65]:
                - generic [ref=e66]:
                  - generic [ref=e67]: "1"
                  - generic [ref=e68]: "2"
                  - generic [ref=e69]: "3"
                  - generic [ref=e70]: "4"
                  - generic [ref=e71]: "5"
                  - generic [ref=e72]: "6"
                  - generic [ref=e73]: "7"
                  - generic [ref=e74]: "8"
                  - generic [ref=e75]: "9"
                  - generic [ref=e76]: "10"
                  - generic [ref=e77]: "11"
                  - generic [ref=e78]: "12"
                  - generic [ref=e79]: "13"
                  - generic [ref=e80]: "14"
                  - generic [ref=e81]: "15"
                  - generic [ref=e82]: "16"
                  - generic [ref=e83]: "17"
                  - generic [ref=e84]: "18"
                  - generic [ref=e85]: "19"
                  - generic [ref=e86]: "20"
                  - generic [ref=e87]: "21"
                  - generic [ref=e88]: "22"
                - generic [ref=e89]:
                  - generic [ref=e90]: ⌄
                  - generic [ref=e91]: ⌄
              - textbox "OpenAMX source" [active] [ref=e93]:
                - generic [ref=e94]:
                  - text: "# V0.16 function editor chec"
                  - generic [ref=e95]: k
                - generic [ref=e97]: "```amx"
                - generic [ref=e98]: "let caller: Number = 9"
                - generic [ref=e99]: "fn double(value: Number): Number = value*2"
                - generic [ref=e100]: "fn choose(value: Number, values: Number[]): Number {"
                - generic [ref=e101]: let total = value
                - generic [ref=e102]: "if value > 0 {"
                - generic [ref=e103]: let branchOnly = total
                - generic [ref=e104]: let shadow = value
                - generic [ref=e105]: "for value in values {"
                - generic [ref=e106]: let loopLocal = value
                - generic [ref=e108]: return loopLocal
                - generic [ref=e109]: "}"
                - generic [ref=e110]: let afterLoop = value
                - generic [ref=e111]: "}"
                - generic [ref=e112]: return value
                - generic [ref=e113]: let later = value
                - generic [ref=e114]: "}"
                - generic [ref=e115]: "```"
        - separator "Resize editor and contextual pane" [ref=e117]
        - region "Active document context" [ref=e119]:
          - generic [ref=e120]:
            - tablist "Context view" [ref=e121]:
              - tab "Preview" [selected] [ref=e122] [cursor=pointer]
              - tab "Inputs" [ref=e126] [cursor=pointer]
            - generic [ref=e131]: success
            - generic [ref=e132]:
              - button "Pause live preview" [ref=e133] [cursor=pointer]
              - button "Refresh preview" [ref=e137] [cursor=pointer]
              - button "Export active document" [ref=e143] [cursor=pointer]: Export
              - button "Report settings" [ref=e147] [cursor=pointer]
          - iframe [ref=e149]:
            - generic [ref=f2e1]:
              - heading "Current preview" [level=1] [ref=f2e2]
              - paragraph [ref=f2e3]: unknown
      - region "Runtime drawer" [ref=e150]:
        - generic [ref=e151]:
          - strong [ref=e152]: RUNTIME
          - generic [ref=e153]: idle
          - button "Run active document" [ref=e154] [cursor=pointer]
          - button "Details" [ref=e157] [cursor=pointer]
        - status [ref=e158]: Preview reflects the current buffer.
```

# Test source

```ts
  5   | const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
  6   | const harnessSnapshot = (page: Page) => page.evaluate(() => {
  7   | 	const snapshot: unknown = Reflect.get(window, "__openamxHarnessSnapshot");
  8   | 	return typeof snapshot === "function" ? snapshot() as unknown : undefined;
  9   | });
  10  | const lastAnalysis = (page: Page) => page.evaluate(() => {
  11  | 	const snapshot: unknown = Reflect.get(window, "__openamxHarnessSnapshot");
  12  | 	if (typeof snapshot !== "function") return undefined;
  13  | 	const result: unknown = snapshot();
  14  | 	return typeof result === "object" && result !== null && "lastAnalysis" in result
  15  | 		? result.lastAnalysis
  16  | 		: undefined;
  17  | });
  18  | const harnessAnalysisRequestCount = async (page: Page) => {
  19  | 	const snapshot = await harnessSnapshot(page);
  20  | 	return typeof snapshot === "object" && snapshot !== null && "analysisRequests" in snapshot
  21  | 		&& Array.isArray(snapshot.analysisRequests) ? snapshot.analysisRequests.length : 0;
  22  | };
  23  | const harnessCurrentText = async (page: Page) => {
  24  | 	const snapshot = await harnessSnapshot(page);
  25  | 	return typeof snapshot === "object" && snapshot !== null && "currentText" in snapshot
  26  | 		&& typeof snapshot.currentText === "string" ? snapshot.currentText : undefined;
  27  | };
  28  | 
  29  | async function clickLastTextOccurrence(page: Page, value: string) {
  30  | 	const point = await page.locator(".cm-content").evaluate((content, search) => {
  31  | 		const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  32  | 		const nodes: Text[] = [];
  33  | 		let combined = "";
  34  | 		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
  35  | 			if (!(node instanceof Text)) continue;
  36  | 			nodes.push(node);
  37  | 			combined += node.data;
  38  | 		}
  39  | 		const from = combined.lastIndexOf(search);
  40  | 		if (from < 0) throw new Error(`Could not find ${search} in the editor.`);
  41  | 		const to = from + search.length;
  42  | 		let offset = 0;
  43  | 		let start: { node: Text; offset: number } | undefined;
  44  | 		let end: { node: Text; offset: number } | undefined;
  45  | 		for (const node of nodes) {
  46  | 			const next = offset + node.data.length;
  47  | 			if (!start && from >= offset && from < next) start = { node, offset: from - offset };
  48  | 			if (to > offset && to <= next) { end = { node, offset: to - offset }; break; }
  49  | 			offset = next;
  50  | 		}
  51  | 		if (!start || !end) throw new Error(`Could not locate ${search} in the editor text nodes.`);
  52  | 		const range = document.createRange();
  53  | 		range.setStart(start.node, start.offset);
  54  | 		range.setEnd(end.node, end.offset);
  55  | 		start.node.parentElement?.closest(".cm-line")?.scrollIntoView({ block: "center", inline: "nearest" });
  56  | 		const bounds = range.getBoundingClientRect();
  57  | 		return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  58  | 	}, value);
  59  | 	await page.mouse.click(point.x, point.y);
  60  | }
  61  | 
  62  | async function selectedLine(page: Page) {
  63  | 	return page.evaluate(() => {
  64  | 		const selection = window.getSelection();
  65  | 		const anchor = selection?.anchorNode;
  66  | 		const element = anchor instanceof Element ? anchor : anchor?.parentElement;
  67  | 		return element?.closest(".cm-line")?.textContent ?? "";
  68  | 	});
  69  | }
  70  | 
  71  | test("desktop CodeMirror exposes V0.16 function editor services", async ({ page }) => {
  72  | 	const source = [
  73  | 		"# V0.16 function editor check",
  74  | 		"",
  75  | 		"```amx",
  76  | 		"let caller: Number = 9",
  77  | 		"fn double(value: Number): Number = value*2",
  78  | 		"fn choose(value: Number, values: Number[]): Number {",
  79  | 		"let total = value",
  80  | 		"if value > 0 {",
  81  | 		"  let branchOnly = total",
  82  | 		"  let shadow = value",
  83  | 		"  for value in values {",
  84  | 		"    let loopLocal = value",
  85  | 		"    ",
  86  | 		"    return loopLocal",
  87  | 		"  }",
  88  | 		"  let afterLoop = value",
  89  | 		"}",
  90  | 		"return value",
  91  | 		"let later = value",
  92  | 		"}",
  93  | 		"```",
  94  | 		""
  95  | 	].join("\n");
  96  | 	await page.goto("/");
  97  | 	await page.getByRole("button", { name: "Open project" }).click();
  98  | 	const editor = sourceEditor(page);
  99  | 	const initialAnalysisRequests = await harnessAnalysisRequestCount(page);
  100 | 	await editor.fill(source);
  101 | 	await page.keyboard.press("Control+Space");
  102 | 	await expect.poll(() => harnessCurrentText(page)).toBe(source);
  103 | 	await expect.poll(() => harnessAnalysisRequestCount(page)).toBeGreaterThan(initialAnalysisRequests);
  104 | 	const returnOffset = source.indexOf("return loopLocal");
> 105 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
      |                                              ^ Error: expect(received).toMatchObject(expected)
  106 | 		diagnostics: [],
  107 | 		highlights: expect.arrayContaining([expect.objectContaining({
  108 | 			from: returnOffset, to: returnOffset + "return".length, kind: "keyword"
  109 | 		})])
  110 | 	});
  111 | 	await page.keyboard.press("Escape");
  112 | 	await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain("return");
  113 | 	await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain("value");
  114 | 	await expect.poll(() => page.locator(".amx-token-type").allTextContents()).toContain("Number");
  115 | 	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);
  116 | 
  117 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  118 | 	const formatted = await page.locator(".cm-content").innerText();
  119 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  120 | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  121 | 
  122 | 	await clickLastTextOccurrence(page, "return loopLocal");
  123 | 	await editor.press("Home");
  124 | 	await editor.press("ArrowUp");
  125 | 	await editor.press("Home");
  126 | 	await page.keyboard.press("Control+Space");
  127 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  128 | 		completions: expect.arrayContaining(["value", "values", "total", "branchOnly", "shadow", "loopLocal"])
  129 | 	});
  130 | 	const loopCompletions = page.locator(".cm-tooltip-autocomplete");
  131 | 	for (const label of ["value", "values", "total", "loopLocal"]) await expect(loopCompletions).toContainText(label);
  132 | 	for (const absent of ["caller", "later"]) await expect(loopCompletions).not.toContainText(absent);
  133 | 
  134 | 	await page.keyboard.press("Escape");
  135 | 	await page.getByRole("button", { name: "Show outline" }).click();
  136 | 	const outline = page.getByRole("navigation", { name: "Document outline" });
  137 | 	await expect(outline).toContainText("choose");
  138 | 	await expect(outline).toContainText("value");
  139 | 	await expect(outline).toContainText("total");
  140 | 	await expect(outline).toContainText("loopLocal");
  141 | 	await outline.getByRole("button", { name: "Go to binding total" }).click();
  142 | 	await expect.poll(() => selectedLine(page)).toContain("let total = value");
  143 | 
  144 | 	await clickLastTextOccurrence(page, "value");
  145 | 	await expect.poll(() => selectedLine(page)).toContain("let later = value");
  146 | 	await page.keyboard.press("F12");
  147 | 	await expect.poll(() => selectedLine(page)).toContain("fn choose(value: Number, values: Number[]): Number {");
  148 | 
  149 | 	const invalid = [
  150 | 		"😀 narrative",
  151 | 		"```amx",
  152 | 		"fn maybe(value: Number): Number {",
  153 | 		"  if value > 0 {",
  154 | 		"    return value",
  155 | 		"  }",
  156 | 		"}",
  157 | 		"```",
  158 | 		""
  159 | 	].join("\r\n");
  160 | 	await editor.fill(invalid);
  161 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  162 | 		diagnostics: [{ code: "AMXF4001", line: 7, column: 1 }]
  163 | 	});
  164 | 	const diagnostic = page.locator(".amx-diagnostic");
  165 | 	await expect(diagnostic).toHaveCount(1);
  166 | 	await expect(diagnostic).toHaveText("}");
  167 | 	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? "")).toBe("}");
  168 | });
  169 | 
  170 | test("desktop CodeMirror renders parser-proven nested V0.18 diagram facts", async ({ page }) => {
  171 | 	const source = [
  172 | 		"```amx",
  173 | 		"let rowOffset: Number = 2",
  174 | 		"diagram generatedTrace {",
  175 | 			'title: "Generated trace"',
  176 | 			'description: "Nested generated points."',
  177 | 			"width: 100",
  178 | 			"height: 80",
  179 | 			"time t from 0 to 1 duration 2",
  180 | 			"  for sample in [0, 1] {",
  181 | 			"    if sample > 0 {",
  182 | 			"      circle tracePoint {",
  183 | 			"        cx: sample + t",
  184 | 			"        cy: sample * 2",
  185 | 			"        r: 2",
  186 | 			'        stroke: "#263238"',
  187 | 			'        fill: "#F3B64B"',
  188 | 			"        lineWidth: 1",
  189 | 			"      }",
  190 | 			"    } else {",
  191 | 			"      rectangle skippedPoint {",
  192 | 			"        x: sample",
  193 | 			"        y: 1",
  194 | 			"        width: 2",
  195 | 			"        height: 2",
  196 | 			'        stroke: "#263238"',
  197 | 			"        lineWidth: 1",
  198 | 			"      }",
  199 | 			"    }",
  200 | 			"  }",
  201 | 			"  if rowOffset > 0 {",
  202 | 			"    for row in [1] {",
  203 | 			"      text nestedLabel {",
  204 | 			"        x: row",
  205 | 			"        y: 1",
```