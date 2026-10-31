# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v16-language-editor.pw.ts >> desktop CodeMirror renders parser-proven nested V0.18 diagram facts
- Location: tests\ui\v16-language-editor.pw.ts:143:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: "for"
Received array: [" = 2", "d", "agr"]

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
  186 | 		"",
  187 | 	].join("\n");
  188 | 	await page.goto("/");
  189 | 	await page.getByRole("button", { name: "Open project" }).click();
  190 | 	const editor = sourceEditor(page);
  191 | 	await editor.fill(source);
  192 | 	await expect.poll(() => lastAnalysis(page)).toMatchObject({ diagnostics: [] });
  193 | 	for (const keyword of ["for", "in", "if", "else"]) {
> 194 | 		await expect.poll(() => page.locator(".amx-token-keyword").allTextContents()).toContain(keyword);
      |                                                                                 ^ Error: expect(received).toContain(expected) // indexOf
  195 | 	}
  196 | 	for (const declaration of ["sample", "row", "tracePoint", "skippedPoint", "nestedLabel"]) {
  197 | 		await expect.poll(() => page.locator(".amx-token-declaration").allTextContents()).toContain(declaration);
  198 | 	}
  199 | 	await expect(page.locator(".amx-diagnostic")).toHaveCount(0);
  200 | 
  201 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  202 | 	const formatted = await page.locator(".cm-content").innerText();
  203 | 	await page.getByRole("button", { name: "Format", exact: true }).click();
  204 | 	await expect.poll(() => page.locator(".cm-content").innerText()).toBe(formatted);
  205 | });
  206 | 
```