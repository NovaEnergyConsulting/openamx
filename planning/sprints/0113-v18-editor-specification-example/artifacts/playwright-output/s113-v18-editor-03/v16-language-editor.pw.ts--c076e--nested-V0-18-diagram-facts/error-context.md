# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v16-language-editor.pw.ts >> desktop CodeMirror renders parser-proven nested V0.18 diagram facts
- Location: tests\ui\v16-language-editor.pw.ts:151:1

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
  101 | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  102 | 
  103 | 	await clickLastTextOccurrence(page, "return loopLocal");
  104 | 	await editor.press("Home");
  105 | 	await editor.press("ArrowUp");
  106 | 	await editor.press("Home");
  107 | 	await page.keyboard.press("Control+Space");
  108 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  109 | 		completions: expect.arrayContaining(["value", "values", "total", "branchOnly", "shadow", "loopLocal"])
  110 | 	});
  111 | 	const loopCompletions = page.locator(".cm-tooltip-autocomplete");
  112 | 	for (const label of ["value", "values", "total", "loopLocal"]) await expect(loopCompletions).toContainText(label);
  113 | 	for (const absent of ["caller", "later"]) await expect(loopCompletions).not.toContainText(absent);
  114 | 
  115 | 	await page.keyboard.press("Escape");
  116 | 	await page.getByRole("button", { name: "Show outline" }).click();
  117 | 	const outline = page.getByRole("navigation", { name: "Document outline" });
  118 | 	await expect(outline).toContainText("choose");
  119 | 	await expect(outline).toContainText("value");
  120 | 	await expect(outline).toContainText("total");
  121 | 	await expect(outline).toContainText("loopLocal");
  122 | 	await outline.getByRole("button", { name: "Go to binding total" }).click();
  123 | 	await expect.poll(() => selectedLine(page)).toContain("let total = value");
  124 | 
  125 | 	await clickLastTextOccurrence(page, "value");
  126 | 	await expect.poll(() => selectedLine(page)).toContain("let later = value");
  127 | 	await page.keyboard.press("F12");
  128 | 	await expect.poll(() => selectedLine(page)).toContain("fn choose(value: Number, values: Number[]): Number {");
  129 | 
  130 | 	const invalid = [
  131 | 		"😀 narrative",
  132 | 		"```amx",
  133 | 		"fn maybe(value: Number): Number {",
  134 | 		"  if value > 0 {",
  135 | 		"    return value",
  136 | 		"  }",
  137 | 		"}",
  138 | 		"```",
  139 | 		""
  140 | 	].join("\r\n");
  141 | 	await editor.fill(invalid);
  142 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
  143 | 		diagnostics: [{ code: "AMXF4001", line: 7, column: 1 }]
  144 | 	});
  145 | 	const diagnostic = page.locator(".amx-diagnostic");
  146 | 	await expect(diagnostic).toHaveCount(1);
  147 | 	await expect(diagnostic).toHaveText("}");
  148 | 	await expect.poll(() => diagnostic.evaluate(mark => mark.closest(".cm-line")?.textContent ?? "")).toBe("}");
  149 | });
  150 | 
  151 | test("desktop CodeMirror renders parser-proven nested V0.18 diagram facts", async ({ page }) => {
  152 | 	const source = [
  153 | 		"```amx",
  154 | 		"let rowOffset: Number = 2",
  155 | 		"diagram generatedTrace {",
  156 | 			'title: "Generated trace"',
  157 | 			'description: "Nested generated points."',
  158 | 			"width: 100",
  159 | 			"height: 80",
  160 | 			"time t from 0 to 1 duration 2",
  161 | 			"  for sample in [0, 1] {",
  162 | 			"    if sample > 0 {",
  163 | 			"      circle tracePoint {",
  164 | 			"        cx: sample + t",
  165 | 			"        cy: sample * 2",
  166 | 			"        r: 2",
  167 | 			'        stroke: "#263238"',
  168 | 			'        fill: "#F3B64B"',
  169 | 			"        lineWidth: 1",
  170 | 			"      }",
  171 | 			"    } else {",
  172 | 			"      rectangle skippedPoint {",
  173 | 			"        x: sample",
  174 | 			"        y: 1",
  175 | 			"        width: 2",
  176 | 			"        height: 2",
  177 | 			'        stroke: "#263238"',
  178 | 			"        lineWidth: 1",
  179 | 			"      }",
  180 | 			"    }",
  181 | 			"  }",
  182 | 			"  if rowOffset > 0 {",
  183 | 			"    for row in [1] {",
  184 | 			"      text nestedLabel {",
  185 | 			"        x: row",
  186 | 			"        y: 1",
  187 | 				'value: "row"',
  188 | 				'fill: "#263238"',
  189 | 			"      }",
  190 | 			"    }",
  191 | 			"  }",
  192 | 		"}",
  193 | 		"```",
  194 | 		"",
  195 | 	].join("\n");
  196 | 	await page.goto("/");
  197 | 	await page.getByRole("button", { name: "Open project" }).click();
  198 | 	const editor = sourceEditor(page);
  199 | 	await editor.fill(source);
  200 | 	const loopOffset = source.indexOf("for sample in");
> 201 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({
      |                                              ^ Error: expect(received).toMatchObject(expected)
  202 | 		diagnostics: [],
  203 | 		highlights: expect.arrayContaining([expect.objectContaining({
  204 | 			from: loopOffset, to: loopOffset + "for".length, kind: "keyword"
  205 | 		})])
  206 | 	});
  207 | 	for (const keyword of ["for", "in", "if", "else"]) {
  208 | 		await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain(keyword);
  209 | 	}
  210 | 	for (const declaration of ["sample", "row", "tracePoint", "skippedPoint", "nestedLabel"]) {
  211 | 		await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain(declaration);
  212 | 	}
  213 | 	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);
  214 | 
  215 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  216 | 	const formatted = await page.locator(".cm-content").innerText();
  217 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  218 | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  219 | });
  220 | 
  221 | test("standalone Example 08 playback keeps generated membership fixed while properties animate", async ({ page }) => {
  222 | 	const htmlPath = resolve("..", "planning/sprints/0113-v18-editor-specification-example/artifacts/outputs/example-08.html");
  223 | 	const browserErrors: string[] = [];
  224 | 	page.on("pageerror", error => browserErrors.push(error.message));
  225 | 	page.on("console", message => { if (message.type() === "error") browserErrors.push(message.text()); });
  226 | 	await page.goto(pathToFileURL(htmlPath).href);
  227 | 
  228 | 	const diagram = page.locator('[data-openamx-diagram="openamx-diagram-0"]');
  229 | 	const tracePoints = diagram.locator('[data-diagram-element="tracePoint"]');
  230 | 	const time = diagram.locator("[data-diagram-time]");
  231 | 	await expect(diagram.getByRole("img", { name: "Crank-slider mechanism" })).toBeVisible();
  232 | 	await expect(time).toHaveText("0.000");
  233 | 	await expect(tracePoints).toHaveCount(3);
  234 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
  235 | 		.toEqual(["40", "44", "48"]);
  236 | 
  237 | 	const scrubber = diagram.getByRole("slider", { name: "Time for Crank-slider mechanism" });
  238 | 	await scrubber.evaluate(element => {
  239 | 		const input = element as HTMLInputElement;
  240 | 		input.value = "0.5";
  241 | 		input.dispatchEvent(new Event("input", { bubbles: true }));
  242 | 	});
  243 | 	await expect(time).toHaveText("0.500");
  244 | 	await expect(tracePoints).toHaveCount(3);
  245 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cx"))))
  246 | 		.toEqual(["74", "78", "82"]);
  247 | 	await expect.poll(() => tracePoints.evaluateAll(elements => elements.map(element => element.getAttribute("cy"))))
  248 | 		.toEqual(["134", "134", "134"]);
  249 | 
  250 | 	const play = diagram.getByRole("button", { name: "Play Crank-slider mechanism" });
  251 | 	await play.click();
  252 | 	const pause = diagram.getByRole("button", { name: "Pause Crank-slider mechanism" });
  253 | 	await expect(pause).toHaveText("Pause");
  254 | 	await expect.poll(() => time.textContent()).not.toBe("0.500");
  255 | 	await pause.click();
  256 | 	await expect(diagram.getByRole("button", { name: "Play Crank-slider mechanism" })).toHaveText("Play");
  257 | 	await expect(tracePoints).toHaveCount(3);
  258 | 	expect(browserErrors).toEqual([]);
  259 | });
  260 | 
```