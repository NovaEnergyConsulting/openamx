# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v16-language-editor.pw.ts >> desktop CodeMirror renders parser-proven nested V0.18 diagram facts
- Location: tests\ui\v16-language-editor.pw.ts:170:1

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
  206 | 				'value: "row"',
  207 | 				'fill: "#263238"',
  208 | 			"      }",
  209 | 			"    }",
  210 | 			"  }",
  211 | 		"}",
  212 | 		"```",
  213 | 		"",
  214 | 	].join("\n");
  215 | 	await page.goto("/");
  216 | 	await page.getByRole("button", { name: "Open project" }).click();
  217 | 	const editor = sourceEditor(page);
  218 | 	const initialAnalysisRequests = await harnessAnalysisRequestCount(page);
  219 | 	await editor.fill(source);
  220 | 	await page.keyboard.press("Control+Space");
  221 | 	await expect.poll(() => harnessCurrentText(page)).toBe(source);
  222 | 	await expect.poll(() => harnessAnalysisRequestCount(page)).toBeGreaterThan(initialAnalysisRequests);
  223 | 	const loopOffset = source.indexOf("for sample in");
> 224 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
      |                                              ^ Error: expect(received).toMatchObject(expected)
  225 | 		diagnostics: [],
  226 | 		highlights: expect.arrayContaining([expect.objectContaining({
  227 | 			from: loopOffset, to: loopOffset + "for".length, kind: "keyword"
  228 | 		})])
  229 | 	});
  230 | 	await page.keyboard.press("Escape");
  231 | 	for (const keyword of ["for", "in", "if", "else"]) {
  232 | 		await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain(keyword);
  233 | 	}
  234 | 	for (const declaration of ["sample", "row", "tracePoint", "skippedPoint", "nestedLabel"]) {
  235 | 		await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain(declaration);
  236 | 	}
  237 | 	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);
  238 | 
  239 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  240 | 	const formatted = await page.locator(".cm-content").innerText();
  241 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  242 | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  243 | });
  244 | 
  245 | test("standalone Example 08 playback keeps generated membership fixed while properties animate", async ({ page }) => {
  246 | 	const htmlPath = resolve("..", "planning/sprints/0113-v18-editor-specification-example/artifacts/outputs/example-08.html");
  247 | 	const browserErrors: string[] = [];
  248 | 	page.on("pageerror", error => browserErrors.push(error.message));
  249 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  250 | 	await page.goto(pathToFileURL(htmlPath).href);
  251 | 
  252 | 	const diagram = page.locator('[data-openamx-diagram="openamx-diagram-0"]');
  253 | 	const tracePoints = diagram.locator('[data-diagram-element="tracePoint"]');
  254 | 	const time = diagram.locator("[data-diagram-time]");
  255 | 	await expect(diagram.getByRole("img", { name: "Crank-slider mechanism" })).toBeVisible();
  256 | 	await expect(time).toHaveText("0.000");
  257 | 	await expect(tracePoints).toHaveCount(3);
  258 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
  259 | 		.toEqual(["40", "44", "48"]);
  260 | 
  261 | 	const scrubber = diagram.getByRole("slider", { name: "Time for Crank-slider mechanism" });
  262 | 	await scrubber.evaluate(element => {
  263 | 		const input = element as HTMLInputElement;
  264 | 		input.value = "0.5";
  265 | 		input.dispatchEvent(new Event("input", { bubbles: true }));
  266 | 	});
  267 | 	await expect(time).toHaveText("0.500");
  268 | 	await expect(tracePoints).toHaveCount(3);
  269 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
  270 | 		.toEqual(["74", "78", "82"]);
  271 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cy"))))
  272 | 		.toEqual(["134", "134", "134"]);
  273 | 
  274 | 	const play = diagram.getByRole("button", { name: "Play Crank-slider mechanism" });
  275 | 	await play.click();
  276 | 	const pause = diagram.getByRole("button", { name: "Pause Crank-slider mechanism" });
  277 | 	await expect(pause).toHaveText("Pause");
  278 | 	await expect.poll(() => time.textContent()).not.toBe("0.500");
  279 | 	await pause.click();
  280 | 	await expect(diagram.getByRole("button", { name: "Play Crank-slider mechanism" })).toHaveText("Play");
  281 | 	await expect(tracePoints).toHaveCount(3);
  282 | 	expect(browserErrors).toEqual([]);
  283 | });
  284 | 
```