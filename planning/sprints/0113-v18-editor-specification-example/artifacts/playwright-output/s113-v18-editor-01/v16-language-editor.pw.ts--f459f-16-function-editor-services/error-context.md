# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v16-language-editor.pw.ts >> desktop CodeMirror exposes V0.16 function editor services
- Location: tests\ui\v16-language-editor.pw.ts:55:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: "return"
Received array: ["k", "```", "mx"]

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
  2   | 
  3   | const sourceEditor = (page: Page) => page.getByRole("textbox", { name: "OpenAMX source" });
  4   | const lastAnalysis = (page: Page) => page.evaluate(() => {
  5   | 	const snapshot: unknown = Reflect.get(window, "__openamxHarnessSnapshot");
  6   | 	if (typeof snapshot !== "function") return undefined;
  7   | 	const result: unknown = snapshot();
  8   | 	return typeof result === "object" && result !== null && "lastAnalysis" in result
  9   | 		? result.lastAnalysis
  10  | 		: undefined;
  11  | });
  12  | 
  13  | async function clickLastTextOccurrence(page: Page, value: string) {
  14  | 	const point = await page.locator(".cm-content").evaluate((content, search) => {
  15  | 		const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  16  | 		const nodes: Text[] = [];
  17  | 		let combined = "";
  18  | 		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
  19  | 			if (!(node instanceof Text)) continue;
  20  | 			nodes.push(node);
  21  | 			combined += node.data;
  22  | 		}
  23  | 		const from = combined.lastIndexOf(search);
  24  | 		if (from < 0) throw new Error(`Could not find ${search} in the editor.`);
  25  | 		const to = from + search.length;
  26  | 		let offset = 0;
  27  | 		let start: { node: Text; offset: number } | undefined;
  28  | 		let end: { node: Text; offset: number } | undefined;
  29  | 		for (const node of nodes) {
  30  | 			const next = offset + node.data.length;
  31  | 			if (!start && from >= offset && from < next) start = { node, offset: from - offset };
  32  | 			if (to > offset && to <= next) { end = { node, offset: to - offset }; break; }
  33  | 			offset = next;
  34  | 		}
  35  | 		if (!start || !end) throw new Error(`Could not locate ${search} in the editor text nodes.`);
  36  | 		const range = document.createRange();
  37  | 		range.setStart(start.node, start.offset);
  38  | 		range.setEnd(end.node, end.offset);
  39  | 		start.node.parentElement?.closest(".cm-line")?.scrollIntoView({ block: "center", inline: "nearest" });
  40  | 		const bounds = range.getBoundingClientRect();
  41  | 		return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  42  | 	}, value);
  43  | 	await page.mouse.click(point.x, point.y);
  44  | }
  45  | 
  46  | async function selectedLine(page: Page) {
  47  | 	return page.evaluate(() => {
  48  | 		const selection = window.getSelection();
  49  | 		const anchor = selection?.anchorNode;
  50  | 		const element = anchor instanceof Element ? anchor : anchor?.parentElement;
  51  | 		return element?.closest(".cm-line")?.textContent ?? "";
  52  | 	});
  53  | }
  54  | 
  55  | test("desktop CodeMirror exposes V0.16 function editor services", async ({ page }) => {
  56  | 	const source = [
  57  | 		"# V0.16 function editor check",
  58  | 		"",
  59  | 		"```amx",
  60  | 		"let caller: Number = 9",
  61  | 		"fn double(value: Number): Number = value*2",
  62  | 		"fn choose(value: Number, values: Number[]): Number {",
  63  | 		"let total = value",
  64  | 		"if value > 0 {",
  65  | 		"  let branchOnly = total",
  66  | 		"  let shadow = value",
  67  | 		"  for value in values {",
  68  | 		"    let loopLocal = value",
  69  | 		"    ",
  70  | 		"    return loopLocal",
  71  | 		"  }",
  72  | 		"  let afterLoop = value",
  73  | 		"}",
  74  | 		"return value",
  75  | 		"let later = value",
  76  | 		"}",
  77  | 		"```",
  78  | 		""
  79  | 	].join("\n");
  80  | 	await page.goto("/");
  81  | 	await page.getByRole("button", { name: "Open project" }).click();
  82  | 	const editor = sourceEditor(page);
  83  | 	await editor.fill(source);
  84  | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [] });
> 85  | 	await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain("return");
      |                                                                                ^ Error: expect(received).toContain(expected) // indexOf
  86  | 	await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain("value");
  87  | 	await expect.poll(() => page.locator(".amx-token-type").allTextContents()).toContain("Number");
  88  | 	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);
  89  | 
  90  | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  91  | 	const formatted = await page.locator(".cm-content").innerText();
  92  | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  93  | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  94  | 
  95  | 	await clickLastTextOccurrence(page, "return loopLocal");
  96  | 	await editor.press("Home");
  97  | 	await editor.press("ArrowUp");
  98  | 	await editor.press("Home");
  99  | 	await page.keyboard.press("Control+Space");
  100 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  101 | 		completions: expect.arrayContaining(["value", "values", "total", "branchOnly", "shadow", "loopLocal"])
  102 | 	});
  103 | 	const loopCompletions = page.locator(".cm-tooltip-autocomplete");
  104 | 	for (const label of ["value", "values", "total", "loopLocal"]) await expect(loopCompletions).toContainText(label);
  105 | 	for (const absent of ["caller", "later"]) await expect(loopCompletions).not.toContainText(absent);
  106 | 
  107 | 	await page.keyboard.press("Escape");
  108 | 	await page.getByRole("button", { name: "Show outline" }).click();
  109 | 	const outline = page.getByRole("navigation", { name: "Document outline" });
  110 | 	await expect(outline).toContainText("choose");
  111 | 	await expect(outline).toContainText("value");
  112 | 	await expect(outline).toContainText("total");
  113 | 	await expect(outline).toContainText("loopLocal");
  114 | 	await outline.getByRole("button", { name: "Go to binding total" }).click();
  115 | 	await expect.poll(() => selectedLine(page)).toContain("let total = value");
  116 | 
  117 | 	await clickLastTextOccurrence(page, "value");
  118 | 	await expect.poll(() => selectedLine(page)).toContain("let later = value");
  119 | 	await page.keyboard.press("F12");
  120 | 	await expect.poll(() => selectedLine(page)).toContain("fn choose(value: Number, values: Number[]): Number {");
  121 | 
  122 | 	const invalid = [
  123 | 		"😀 narrative",
  124 | 		"```amx",
  125 | 		"fn maybe(value: Number): Number {",
  126 | 		"  if value > 0 {",
  127 | 		"    return value",
  128 | 		"  }",
  129 | 		"}",
  130 | 		"```",
  131 | 		""
  132 | 	].join("\r\n");
  133 | 	await editor.fill(invalid);
  134 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  135 | 		diagnostics: [{ code: "AMXF4001", line: 7, column: 1 }]
  136 | 	});
  137 | 	const diagnostic = page.locator(".amx-diagnostic");
  138 | 	await expect(diagnostic).toHaveCount(1);
  139 | 	await expect(diagnostic).toHaveText("}");
  140 | 	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? "")).toBe("}");
  141 | });
  142 | 
  143 | test("desktop CodeMirror renders parser-proven nested V0.18 diagram facts", async ({ page }) => {
  144 | 	const source = [
  145 | 		"```amx",
  146 | 		"let rowOffset: Number = 2",
  147 | 		"diagram generatedTrace {",
  148 | 			'title: "Generated trace"',
  149 | 			'description: "Nested generated points."',
  150 | 			"width: 100",
  151 | 			"height: 80",
  152 | 			"time t from 0 to 1 duration 2",
  153 | 			"  for sample in [0, 1] {",
  154 | 			"    if sample > 0 {",
  155 | 			"      circle tracePoint {",
  156 | 			"        cx: sample + t",
  157 | 			"        cy: sample * 2",
  158 | 			"        r: 2",
  159 | 			'        stroke: "#263238"',
  160 | 			'        fill: "#F3B64B"',
  161 | 			"        lineWidth: 1",
  162 | 			"      }",
  163 | 			"    } else {",
  164 | 			"      rectangle skippedPoint {",
  165 | 			"        x: sample",
  166 | 			"        y: 1",
  167 | 			"        width: 2",
  168 | 			"        height: 2",
  169 | 			'        stroke: "#263238"',
  170 | 			"        lineWidth: 1",
  171 | 			"      }",
  172 | 			"    }",
  173 | 			"  }",
  174 | 			"  if rowOffset > 0 {",
  175 | 			"    for row in [1] {",
  176 | 			"      text nestedLabel {",
  177 | 			"        x: row",
  178 | 			"        y: 1",
  179 | 				'value: "row"',
  180 | 				'fill: "#263238"',
  181 | 			"      }",
  182 | 			"    }",
  183 | 			"  }",
  184 | 		"}",
  185 | 		"```",
```