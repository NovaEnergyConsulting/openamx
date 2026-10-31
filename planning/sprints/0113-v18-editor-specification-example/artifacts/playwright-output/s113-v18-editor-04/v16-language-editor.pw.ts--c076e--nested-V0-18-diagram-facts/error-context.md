# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v16-language-editor.pw.ts >> desktop CodeMirror renders parser-proven nested V0.18 diagram facts
- Location: tests\ui\v16-language-editor.pw.ts:153:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  -  4
+ Received  + 24

  Object {
    "diagnostics": Array [],
-   "highlights": ArrayContaining [
-     ObjectContaining {
-       "from": 177,
+   "highlights": Array [
+     Object {
+       "from": 28,
        "kind": "keyword",
-       "to": 180,
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
                  - generic [ref=e89]: "23"
                  - generic [ref=e90]: "24"
                  - generic [ref=e91]: "25"
                  - generic [ref=e92]: "26"
                  - generic [ref=e93]: "27"
                  - generic [ref=e94]: "28"
                  - generic [ref=e95]: "29"
                  - generic [ref=e96]: "30"
                  - generic [ref=e97]: "31"
                  - generic [ref=e98]: "32"
                  - generic [ref=e99]: "33"
                  - generic [ref=e100]: "34"
                  - generic [ref=e101]: "35"
                  - generic [ref=e102]: "36"
                  - generic [ref=e103]: "37"
                  - generic [ref=e104]: "38"
                  - generic [ref=e105]: "39"
                  - generic [ref=e106]: "40"
                  - generic [ref=e107]: "41"
                  - generic [ref=e108]: "42"
                - generic [ref=e109]: ⌄
              - textbox "OpenAMX source" [active] [ref=e112]:
                - generic [ref=e113]: "```amx"
                - generic [ref=e114]: "let rowOffset: Number = 2"
                - generic [ref=e115]: "diagram generatedTrace {"
                - generic [ref=e116]: "title: \"Generated trace\""
                - generic [ref=e117]: "description: \"Nested generated points.\""
                - generic [ref=e118]: "width: 100"
                - generic [ref=e119]: "height: 80"
                - generic [ref=e120]: time t from 0 to 1 duration 2
                - generic [ref=e121]: "for sample in [0, 1] {"
                - generic [ref=e122]: "if sample > 0 {"
                - generic [ref=e123]: "circle tracePoint {"
                - generic [ref=e124]: "cx: sample + t"
                - generic [ref=e125]: "cy: sample * 2"
                - generic [ref=e126]: "r: 2"
                - generic [ref=e127]: "stroke: \"#263238\""
                - generic [ref=e128]: "fill: \"#F3B64B\""
                - generic [ref=e129]: "lineWidth: 1"
                - generic [ref=e130]: "}"
                - generic [ref=e131]: "} else {"
                - generic [ref=e132]: "rectangle skippedPoint {"
                - generic [ref=e133]: "x: sample"
                - generic [ref=e134]: "y: 1"
                - generic [ref=e135]: "width: 2"
                - generic [ref=e136]: "height: 2"
                - generic [ref=e137]: "stroke: \"#263238\""
                - generic [ref=e138]: "lineWidth: 1"
                - generic [ref=e139]: "}"
                - generic [ref=e140]: "}"
                - generic [ref=e141]: "}"
                - generic [ref=e142]: "if rowOffset > 0 {"
                - generic [ref=e143]: "for row in [1] {"
                - generic [ref=e144]: "text nestedLabel {"
                - generic [ref=e145]: "x: row"
                - generic [ref=e146]: "y: 1"
                - generic [ref=e147]: "value: \"row\""
                - generic [ref=e148]: "fill: \"#263238\""
                - generic [ref=e149]: "}"
                - generic [ref=e150]: "}"
                - generic [ref=e151]: "}"
                - generic [ref=e152]: "}"
                - generic [ref=e153]: "```"
        - separator "Resize editor and contextual pane" [ref=e155]
        - region "Active document context" [ref=e157]:
          - generic [ref=e158]:
            - tablist "Context view" [ref=e159]:
              - tab "Preview" [selected] [ref=e160] [cursor=pointer]
              - tab "Inputs" [ref=e164] [cursor=pointer]
            - generic [ref=e169]: success
            - generic [ref=e170]:
              - button "Pause live preview" [ref=e171] [cursor=pointer]
              - button "Refresh preview" [ref=e175] [cursor=pointer]
              - button "Export active document" [ref=e181] [cursor=pointer]: Export
              - button "Report settings" [ref=e185] [cursor=pointer]
          - iframe [ref=e187]:
            - generic [ref=f2e1]:
              - heading "Current preview" [level=1] [ref=f2e2]
              - paragraph [ref=f2e3]: unknown
      - region "Runtime drawer" [ref=e188]:
        - generic [ref=e189]:
          - strong [ref=e190]: RUNTIME
          - generic [ref=e191]: idle
          - button "Run active document" [ref=e192] [cursor=pointer]
          - button "Details" [ref=e195] [cursor=pointer]
        - status [ref=e196]: Preview reflects the current buffer.
```

# Test source

```ts
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
  189 | 				'value: "row"',
  190 | 				'fill: "#263238"',
  191 | 			"      }",
  192 | 			"    }",
  193 | 			"  }",
  194 | 		"}",
  195 | 		"```",
  196 | 		"",
  197 | 	].join("\n");
  198 | 	await page.goto("/");
  199 | 	await page.getByRole("button", { name: "Open project" }).click();
  200 | 	const editor = sourceEditor(page);
  201 | 	await editor.fill(source);
  202 | 	await page.keyboard.press("Control+Space");
  203 | 	const loopOffset = source.indexOf("for sample in");
> 204 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
      |                                              ^ Error: expect(received).toMatchObject(expected)
  205 | 		diagnostics: [],
  206 | 		highlights: expect.arrayContaining([expect.objectContaining({
  207 | 			from: loopOffset, to: loopOffset + "for".length, kind: "keyword"
  208 | 		})])
  209 | 	});
  210 | 	await page.keyboard.press("Escape");
  211 | 	for (const keyword of ["for", "in", "if", "else"]) {
  212 | 		await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain(keyword);
  213 | 	}
  214 | 	for (const declaration of ["sample", "row", "tracePoint", "skippedPoint", "nestedLabel"]) {
  215 | 		await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain(declaration);
  216 | 	}
  217 | 	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);
  218 | 
  219 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  220 | 	const formatted = await page.locator(".cm-content").innerText();
  221 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  222 | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  223 | });
  224 | 
  225 | test("standalone Example 08 playback keeps generated membership fixed while properties animate", async ({ page }) => {
  226 | 	const htmlPath = resolve("..", "planning/sprints/0113-v18-editor-specification-example/artifacts/outputs/example-08.html");
  227 | 	const browserErrors: string[] = [];
  228 | 	page.on("pageerror", error => browserErrors.push(error.message));
  229 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  230 | 	await page.goto(pathToFileURL(htmlPath).href);
  231 | 
  232 | 	const diagram = page.locator('[data-openamx-diagram="openamx-diagram-0"]');
  233 | 	const tracePoints = diagram.locator('[data-diagram-element="tracePoint"]');
  234 | 	const time = diagram.locator("[data-diagram-time]");
  235 | 	await expect(diagram.getByRole("img", { name: "Crank-slider mechanism" })).toBeVisible();
  236 | 	await expect(time).toHaveText("0.000");
  237 | 	await expect(tracePoints).toHaveCount(3);
  238 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
  239 | 		.toEqual(["40", "44", "48"]);
  240 | 
  241 | 	const scrubber = diagram.getByRole("slider", { name: "Time for Crank-slider mechanism" });
  242 | 	await scrubber.evaluate(element => {
  243 | 		const input = element as HTMLInputElement;
  244 | 		input.value = "0.5";
  245 | 		input.dispatchEvent(new Event("input", { bubbles: true }));
  246 | 	});
  247 | 	await expect(time).toHaveText("0.500");
  248 | 	await expect(tracePoints).toHaveCount(3);
  249 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
  250 | 		.toEqual(["74", "78", "82"]);
  251 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cy"))))
  252 | 		.toEqual(["134", "134", "134"]);
  253 | 
  254 | 	const play = diagram.getByRole("button", { name: "Play Crank-slider mechanism" });
  255 | 	await play.click();
  256 | 	const pause = diagram.getByRole("button", { name: "Pause Crank-slider mechanism" });
  257 | 	await expect(pause).toHaveText("Pause");
  258 | 	await expect.poll(() => time.textContent()).not.toBe("0.500");
  259 | 	await pause.click();
  260 | 	await expect(diagram.getByRole("button", { name: "Play Crank-slider mechanism" })).toHaveText("Play");
  261 | 	await expect(tracePoints).toHaveCount(3);
  262 | 	expect(browserErrors).toEqual([]);
  263 | });
  264 | 
```