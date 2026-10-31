# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v16-language-editor.pw.ts >> desktop CodeMirror exposes V0.16 function editor services
- Location: tests\ui\v16-language-editor.pw.ts:57:1

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
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { resolve } from "node:path";
  3   | import { pathToFileURL } from "node:url";
  4   | 
  5   | const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
  6   | const lastAnalysis = (page: Page) => page.evaluate(() => {
  7   | 	const snapshot: unknown = Reflect.get(window, "__openamxHarnessSnapshot");
  8   | 	if (typeof snapshot !== "function") return undefined;
  9   | 	const result: unknown = snapshot();
  10  | 	return typeof result === "object" && result !== null && "lastAnalysis" in result
  11  | 		? result.lastAnalysis
  12  | 		: undefined;
  13  | });
  14  | 
  15  | async function clickLastTextOccurrence(page: Page, value: string) {
  16  | 	const point = await page.locator(".cm-content").evaluate((content, search) => {
  17  | 		const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  18  | 		const nodes: Text[] = [];
  19  | 		let combined = "";
  20  | 		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
  21  | 			if (!(node instanceof Text)) continue;
  22  | 			nodes.push(node);
  23  | 			combined += node.data;
  24  | 		}
  25  | 		const from = combined.lastIndexOf(search);
  26  | 		if (from < 0) throw new Error(`Could not find ${search} in the editor.`);
  27  | 		const to = from + search.length;
  28  | 		let offset = 0;
  29  | 		let start: { node: Text; offset: number } | undefined;
  30  | 		let end: { node: Text; offset: number } | undefined;
  31  | 		for (const node of nodes) {
  32  | 			const next = offset + node.data.length;
  33  | 			if (!start && from >= offset && from < next) start = { node, offset: from - offset };
  34  | 			if (to > offset && to <= next) { end = { node, offset: to - offset }; break; }
  35  | 			offset = next;
  36  | 		}
  37  | 		if (!start || !end) throw new Error(`Could not locate ${search} in the editor text nodes.`);
  38  | 		const range = document.createRange();
  39  | 		range.setStart(start.node, start.offset);
  40  | 		range.setEnd(end.node, end.offset);
  41  | 		start.node.parentElement?.closest(".cm-line")?.scrollIntoView({ block: "center", inline: "nearest" });
  42  | 		const bounds = range.getBoundingClientRect();
  43  | 		return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  44  | 	}, value);
  45  | 	await page.mouse.click(point.x, point.y);
  46  | }
  47  | 
  48  | async function selectedLine(page: Page) {
  49  | 	return page.evaluate(() => {
  50  | 		const selection = window.getSelection();
  51  | 		const anchor = selection?.anchorNode;
  52  | 		const element = anchor instanceof Element ? anchor : anchor?.parentElement;
  53  | 		return element?.closest(".cm-line")?.textContent ?? "";
  54  | 	});
  55  | }
  56  | 
  57  | test("desktop CodeMirror exposes V0.16 function editor services", async ({ page }) => {
  58  | 	const source = [
  59  | 		"# V0.16 function editor check",
  60  | 		"",
  61  | 		"```amx",
  62  | 		"let caller: Number = 9",
  63  | 		"fn double(value: Number): Number = value*2",
  64  | 		"fn choose(value: Number, values: Number[]): Number {",
  65  | 		"let total = value",
  66  | 		"if value > 0 {",
  67  | 		"  let branchOnly = total",
  68  | 		"  let shadow = value",
  69  | 		"  for value in values {",
  70  | 		"    let loopLocal = value",
  71  | 		"    ",
  72  | 		"    return loopLocal",
  73  | 		"  }",
  74  | 		"  let afterLoop = value",
  75  | 		"}",
  76  | 		"return value",
  77  | 		"let later = value",
  78  | 		"}",
  79  | 		"```",
  80  | 		""
  81  | 	].join("\n");
  82  | 	await page.goto("/");
  83  | 	await page.getByRole("button", { name: "Open project" }).click();
  84  | 	const editor = sourceEditor(page);
  85  | 	await editor.fill(source);
  86  | 	await page.keyboard.press("Control+Space");
  87  | 	const returnOffset = source.indexOf("return loopLocal");
> 88  | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
      |                                              ^ Error: expect(received).toMatchObject(expected)
  89  | 		diagnostics: [],
  90  | 		highlights: expect.arrayContaining([expect.objectContaining({
  91  | 			from: returnOffset, to: returnOffset + "return".length, kind: "keyword"
  92  | 		})])
  93  | 	});
  94  | 	await page.keyboard.press("Escape");
  95  | 	await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain("return");
  96  | 	await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain("value");
  97  | 	await expect.poll(() => page.locator(".amx-token-type").allTextContents()).toContain("Number");
  98  | 	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);
  99  | 
  100 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  101 | 	const formatted = await page.locator(".cm-content").innerText();
  102 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  103 | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  104 | 
  105 | 	await clickLastTextOccurrence(page, "return loopLocal");
  106 | 	await editor.press("Home");
  107 | 	await editor.press("ArrowUp");
  108 | 	await editor.press("Home");
  109 | 	await page.keyboard.press("Control+Space");
  110 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  111 | 		completions: expect.arrayContaining(["value", "values", "total", "branchOnly", "shadow", "loopLocal"])
  112 | 	});
  113 | 	const loopCompletions = page.locator(".cm-tooltip-autocomplete");
  114 | 	for (const label of ["value", "values", "total", "loopLocal"]) await expect(loopCompletions).toContainText(label);
  115 | 	for (const absent of ["caller", "later"]) await expect(loopCompletions).not.toContainText(absent);
  116 | 
  117 | 	await page.keyboard.press("Escape");
  118 | 	await page.getByRole("button", { name: "Show outline" }).click();
  119 | 	const outline = page.getByRole("navigation", { name: "Document outline" });
  120 | 	await expect(outline).toContainText("choose");
  121 | 	await expect(outline).toContainText("value");
  122 | 	await expect(outline).toContainText("total");
  123 | 	await expect(outline).toContainText("loopLocal");
  124 | 	await outline.getByRole("button", { name: "Go to binding total" }).click();
  125 | 	await expect.poll(() => selectedLine(page)).toContain("let total = value");
  126 | 
  127 | 	await clickLastTextOccurrence(page, "value");
  128 | 	await expect.poll(() => selectedLine(page)).toContain("let later = value");
  129 | 	await page.keyboard.press("F12");
  130 | 	await expect.poll(() => selectedLine(page)).toContain("fn choose(value: Number, values: Number[]): Number {");
  131 | 
  132 | 	const invalid = [
  133 | 		"😀 narrative",
  134 | 		"```amx",
  135 | 		"fn maybe(value: Number): Number {",
  136 | 		"  if value > 0 {",
  137 | 		"    return value",
  138 | 		"  }",
  139 | 		"}",
  140 | 		"```",
  141 | 		""
  142 | 	].join("\r\n");
  143 | 	await editor.fill(invalid);
  144 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  145 | 		diagnostics: [{ code: "AMXF4001", line: 7, column: 1 }]
  146 | 	});
  147 | 	const diagnostic = page.locator(".amx-diagnostic");
  148 | 	await expect(diagnostic).toHaveCount(1);
  149 | 	await expect(diagnostic).toHaveText("}");
  150 | 	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? "")).toBe("}");
  151 | });
  152 | 
  153 | test("desktop CodeMirror renders parser-proven nested V0.18 diagram facts", async ({ page }) => {
  154 | 	const source = [
  155 | 		"```amx",
  156 | 		"let rowOffset: Number = 2",
  157 | 		"diagram generatedTrace {",
  158 | 			'title: "Generated trace"',
  159 | 			'description: "Nested generated points."',
  160 | 			"width: 100",
  161 | 			"height: 80",
  162 | 			"time t from 0 to 1 duration 2",
  163 | 			"  for sample in [0, 1] {",
  164 | 			"    if sample > 0 {",
  165 | 			"      circle tracePoint {",
  166 | 			"        cx: sample + t",
  167 | 			"        cy: sample * 2",
  168 | 			"        r: 2",
  169 | 			'        stroke: "#263238"',
  170 | 			'        fill: "#F3B64B"',
  171 | 			"        lineWidth: 1",
  172 | 			"      }",
  173 | 			"    } else {",
  174 | 			"      rectangle skippedPoint {",
  175 | 			"        x: sample",
  176 | 			"        y: 1",
  177 | 			"        width: 2",
  178 | 			"        height: 2",
  179 | 			'        stroke: "#263238"',
  180 | 			"        lineWidth: 1",
  181 | 			"      }",
  182 | 			"    }",
  183 | 			"  }",
  184 | 			"  if rowOffset > 0 {",
  185 | 			"    for row in [1] {",
  186 | 			"      text nestedLabel {",
  187 | 			"        x: row",
  188 | 			"        y: 1",
```