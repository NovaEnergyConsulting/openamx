# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: help-center.pw.ts >> bundled help keeps stable topics, local search, registry shortcuts, routing, and app-owned actions
- Location: tests\ui\help-center.pw.ts:41:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 346

- Array []
+ Array [
+   "http://127.0.0.1:4194/",
+   "http://127.0.0.1:4194/@vite/client",
+   "http://127.0.0.1:4194/src/main.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vite/dist/client/env.mjs",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-G3PMV62Z.js?v=0fbff185",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WO2XEGAN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/starterExamples.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/help-content.json?import",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/completion.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/highlighting.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/symbols.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/formatter/formatAmx.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseDocument.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/typechecker/checkDocument.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-IWNKSCBH.js?v=0fbff185",
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
+   "http://127.0.0.1:4194/?help-section=language",
+   "http://127.0.0.1:4194/@vite/client",
+   "http://127.0.0.1:4194/src/main.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vite/dist/client/env.mjs",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-IWNKSCBH.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WO2XEGAN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-G3PMV62Z.js?v=0fbff185",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/starterExamples.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/help-content.json?import",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-5IRJQBBQ.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Q6W3NZIS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-QFY4DJNP.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Y2AJZL35.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-CFTU6MB5.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-P3XLUZYX.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-KWXOICCO.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-7AHOZ5VT.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WJMGLFIR.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-665WQGGS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-TTP7GFKN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseFrontMatter.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/sourceRanges.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/stringScanner.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseStatements.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/diagnostics/errors.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/typechecker/declarationRegistry.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/yaml.js?v=bbf77726",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseExpression.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseFor.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseIf.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff",
+   "http://127.0.0.1:4194/?help-section=not-a-topic",
+   "http://127.0.0.1:4194/@vite/client",
+   "http://127.0.0.1:4194/src/main.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vite/dist/client/env.mjs",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-IWNKSCBH.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WO2XEGAN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-G3PMV62Z.js?v=0fbff185",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/starterExamples.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/help-content.json?import",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-5IRJQBBQ.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Q6W3NZIS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-QFY4DJNP.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Y2AJZL35.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-CFTU6MB5.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-P3XLUZYX.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-KWXOICCO.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-7AHOZ5VT.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WJMGLFIR.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-665WQGGS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/json-editor-vue.js?v=36e12a91",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/vanilla-jsoneditor.js?v=661f558c",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/runtime/csvTextSerialization.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/DataEditorPane.vue?vue&type=style&index=0&lang.css",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-TTP7GFKN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseFrontMatter.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/sourceRanges.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/stringScanner.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseStatements.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/diagnostics/errors.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/typechecker/declarationRegistry.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/yaml.js?v=bbf77726",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseExpression.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseFor.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseIf.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff",
+   "http://127.0.0.1:4194/",
+   "http://127.0.0.1:4194/@vite/client",
+   "http://127.0.0.1:4194/src/main.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/Programming/openamx/desktop-app/node_modules/vite/dist/client/env.mjs",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-IWNKSCBH.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WO2XEGAN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-G3PMV62Z.js?v=0fbff185",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/starterExamples.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/src/mainview/components/help-content.json?import",
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
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-5IRJQBBQ.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Q6W3NZIS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-QFY4DJNP.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-Y2AJZL35.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-CFTU6MB5.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-P3XLUZYX.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-KWXOICCO.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-7AHOZ5VT.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-WJMGLFIR.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-665WQGGS.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/desktop-app/node_modules/.vite/deps/chunk-TTP7GFKN.js?v=0fbff185",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseFrontMatter.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/editor/sourceRanges.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/stringScanner.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/parser/parseStatements.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/diagnostics/errors.ts",
+   "http://127.0.0.1:4194/@fs/C:/Users/gamez/AppData/Local/Temp/openamx-sprint094-validation/src/typechecker/declarationRegistry.ts",
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
+ ]
```

# Page snapshot

```yaml
- generic [ref=f3e3]:
  - button "Fail next preview" [ref=f3e4] [cursor=pointer]
  - main [ref=f3e5]:
    - generic [ref=f3e6]:
      - generic [ref=f3e7]: OpenAMX - V0.14.0
      - generic [ref=f3e8]: /sprint042-browser-fixture
      - button "Help and shortcuts" [ref=f3e9] [cursor=pointer]
      - button "Preferences" [ref=f3e13] [cursor=pointer]
      - button "Commands" [ref=f3e17] [cursor=pointer]
    - generic [ref=f3e18]:
      - complementary "Project explorer" [ref=f3e19]:
        - generic [ref=f3e20]:
          - generic [ref=f3e21]: PROJECT
          - generic [ref=f3e22]: "2"
        - generic [ref=f3e23]:
          - button "New AMX" [ref=f3e24] [cursor=pointer]
          - button "New CSS" [ref=f3e25] [cursor=pointer]
          - button "New folder" [ref=f3e26] [cursor=pointer]
          - button "Move / rename" [ref=f3e27] [cursor=pointer]
        - textbox "Search project files" [ref=f3e28]:
          - /placeholder: Search files
        - generic [ref=f3e29]:
          - paragraph [ref=f3e30]: /sprint042-browser-fixture
          - button "report.amx amx" [ref=f3e31] [cursor=pointer]:
            - generic [ref=f3e32]: report.amx
            - generic [ref=f3e33]: amx
          - button "second.amx amx" [ref=f3e34] [cursor=pointer]:
            - generic [ref=f3e35]: second.amx
            - generic [ref=f3e36]: amx
      - separator "Resize explorer" [ref=f3e37]
      - region "Document editor" [ref=f3e38]:
        - navigation "Open tabs" [ref=f3e39]:
          - generic [ref=f3e40]:
            - button "report.amx" [ref=f3e41] [cursor=pointer]
            - button "Close report.amx" [ref=f3e42] [cursor=pointer]: x
        - generic [ref=f3e43]:
          - strong [ref=f3e44]: /sprint042-browser-fixture/report.amx
          - generic [ref=f3e45]: Unsaved
          - generic [ref=f3e46]:
            - button "Find" [ref=f3e47] [cursor=pointer]
            - button "Format" [ref=f3e48] [cursor=pointer]
            - button "Save" [ref=f3e49] [cursor=pointer]
        - button "Show outline" [ref=f3e50] [cursor=pointer]
        - generic "OpenAMX source editor" [ref=f3e52]:
          - generic [ref=f3e54]:
            - generic [aria-hidden] [ref=f3e55]:
              - generic [ref=f3e56]:
                - generic [ref=f3e57]: "1"
                - generic [ref=f3e58]: "2"
                - generic [ref=f3e59]: "3"
                - generic [ref=f3e60]: "4"
                - generic [ref=f3e61]: "5"
                - generic [ref=f3e62]: "6"
                - generic [ref=f3e63]: "7"
                - generic [ref=f3e64]: "8"
                - generic [ref=f3e65]: "9"
                - generic [ref=f3e66]: "10"
                - generic [ref=f3e67]: "11"
              - generic [ref=f3e68]:
                - generic [ref=f3e69]: ⌄
                - generic [ref=f3e70]: ⌄
            - textbox "OpenAMX source" [ref=f3e71]:
              - generic [ref=f3e72]: "# Hello OpenAMX"
              - generic [ref=f3e74]: "```amx"
              - generic [ref=f3e75]: let assetName = "Transformer TX-001"
              - generic [ref=f3e76]: let riskScore = 15
              - generic [ref=f3e77]: "```"
              - generic [ref=f3e79]: "The asset under review is {{ assetName }}."
              - generic [ref=f3e81]: "The illustrative score is {{ riskScore }}."
      - separator "Resize contextual pane" [ref=f3e83]
      - region "Active document context" [ref=f3e84]:
        - generic [ref=f3e85]:
          - tablist "Context view" [ref=f3e86]:
            - tab "Preview" [selected] [ref=f3e87] [cursor=pointer]
            - tab "Inputs" [ref=f3e91] [cursor=pointer]
          - generic [ref=f3e96]: running
          - generic [ref=f3e97]:
            - button "Pause live preview" [ref=f3e98] [cursor=pointer]
            - button "Refresh preview" [ref=f3e102] [cursor=pointer]
            - button "Export active document" [ref=f3e108] [cursor=pointer]: Export
            - button "Report settings" [ref=f3e112] [cursor=pointer]
        - iframe [ref=f3e114]
      - region "Runtime drawer" [ref=f3e115]:
        - generic [ref=f3e116]:
          - strong [ref=f3e117]: RUNTIME
          - generic [ref=f3e118]: idle
          - button "Run active document" [ref=f3e119] [cursor=pointer]
          - button "Details" [ref=f3e122] [cursor=pointer]
          - button "Bottom" [pressed] [ref=f3e123] [cursor=pointer]
          - button "Right" [ref=f3e124] [cursor=pointer]
        - status [ref=f3e125]: Downloaded a diagnostic summary without paths, messages, source, or input values.
    - dialog [ref=f3e127]:
      - generic [ref=f3e128]:
        - generic [ref=f3e129]:
          - paragraph [ref=f3e130]: OPENAMX FIELD GUIDE
          - heading "Help and shortcuts" [level=2] [ref=f3e131]
        - button "Close help" [ref=f3e132] [cursor=pointer]: ×
      - generic [ref=f3e133]:
        - generic [ref=f3e134]: Search help and commands
        - searchbox "Search help and commands" [ref=f3e135]
      - generic [ref=f3e136]:
        - navigation "Help topics" [ref=f3e137]:
          - button "Start a project Create a local workspace and open a report." [ref=f3e138] [cursor=pointer]:
            - strong [ref=f3e139]: Start a project
            - generic [ref=f3e140]: Create a local workspace and open a report.
          - button "Starter examples Choose an input-free report starter or create the offline numbered learning guide." [ref=f3e141] [cursor=pointer]:
            - strong [ref=f3e142]: Starter examples
            - generic [ref=f3e143]: Choose an input-free report starter or create the offline numbered learning guide.
          - button "AMX language essentials Understand executable fences, imports, and typed inputs." [ref=f3e144] [cursor=pointer]:
            - strong [ref=f3e145]: AMX language essentials
            - generic [ref=f3e146]: Understand executable fences, imports, and typed inputs.
          - button "V0.12 language features Use inherited records, enums, and braced conditionals." [ref=f3e147] [cursor=pointer]:
            - strong [ref=f3e148]: V0.12 language features
            - generic [ref=f3e149]: Use inherited records, enums, and braced conditionals.
          - button "V0.13 animated diagrams Author formula-driven 2D diagrams with a local time variable." [ref=f3e150] [cursor=pointer]:
            - strong [ref=f3e151]: V0.13 animated diagrams
            - generic [ref=f3e152]: Author formula-driven 2D diagrams with a local time variable.
          - button "V0.14 language features Check runtime types and use math, text, and numeric formatting functions." [ref=f3e153] [cursor=pointer]:
            - strong [ref=f3e154]: V0.14 language features
            - generic [ref=f3e155]: Check runtime types and use math, text, and numeric formatting functions.
          - button "V0.9 language features Review V0.9 syntax and its compatibility changes." [ref=f3e156] [cursor=pointer]:
            - strong [ref=f3e157]: V0.9 language features
            - generic [ref=f3e158]: Review V0.9 syntax and its compatibility changes.
          - button "Documents and imports Work with the active report and unsaved modules." [ref=f3e159] [cursor=pointer]:
            - strong [ref=f3e160]: Documents and imports
            - generic [ref=f3e161]: Work with the active report and unsaved modules.
          - button "Inputs and data editing Map logical inputs and edit structured files." [ref=f3e162] [cursor=pointer]:
            - strong [ref=f3e163]: Inputs and data editing
            - generic [ref=f3e164]: Map logical inputs and edit structured files.
          - button "Preview and export Keep results tied to the current document state." [ref=f3e165] [cursor=pointer]:
            - strong [ref=f3e166]: Preview and export
            - generic [ref=f3e167]: Keep results tied to the current document state.
          - button "Conflicts and recovery Resolve external edits and recover unsaved work safely." [ref=f3e168] [cursor=pointer]:
            - strong [ref=f3e169]: Conflicts and recovery
            - generic [ref=f3e170]: Resolve external edits and recover unsaved work safely.
          - button "Diagnostic export privacy Download a bounded diagnostic summary for support." [ref=f3e171] [cursor=pointer]:
            - strong [ref=f3e172]: Diagnostic export privacy
            - generic [ref=f3e173]: Download a bounded diagnostic summary for support.
          - button "Release notes V0.10.0 - First public release" [ref=f3e174] [cursor=pointer]:
            - strong [ref=f3e175]: Release notes
            - generic [ref=f3e176]: V0.10.0 - First public release
        - article [ref=f3e177]:
          - heading "Diagnostic export privacy" [level=3] [ref=f3e178]
          - paragraph [ref=f3e179]: Download a bounded diagnostic summary for support.
          - list [ref=f3e180]:
            - listitem [ref=f3e181]: The summary contains the app label, export time, coarse workbench state, and diagnostic-code counts.
            - listitem [ref=f3e182]: It omits project and file paths, diagnostic messages, document/source text, input values, recovery data, and credentials.
            - listitem [ref=f3e183]: The export stays on this device until you choose to share the downloaded file.
          - button "Download diagnostic summary" [active] [ref=f3e185] [cursor=pointer]
        - region "Keyboard shortcuts" [ref=f3e186]:
          - heading "Keyboard shortcuts" [level=3] [ref=f3e187]
          - generic [ref=f3e188]:
            - term [ref=f3e189]: Open project
            - definition [ref=f3e190]: Ctrl/Cmd+O
            - term [ref=f3e191]: Open file
            - definition [ref=f3e192]: Ctrl/Cmd+Shift+O
            - term [ref=f3e193]: Next tab
            - definition [ref=f3e194]: Ctrl/Cmd+Alt+Right
            - term [ref=f3e195]: Previous tab
            - definition [ref=f3e196]: Ctrl/Cmd+Alt+Left
            - term [ref=f3e197]: Save active tab
            - definition [ref=f3e198]: Ctrl/Cmd+S
            - term [ref=f3e199]: Run active document
            - definition [ref=f3e200]: Ctrl/Cmd+Enter
            - term [ref=f3e201]: Refresh preview
            - definition [ref=f3e202]: Ctrl/Cmd+Shift+Enter
            - term [ref=f3e203]: Search project
            - definition [ref=f3e204]: Ctrl/Cmd+Shift+F
          - generic [ref=f3e205]:
            - heading "Release notes · V0.10" [level=3] [ref=f3e206]
            - paragraph [ref=f3e207]: "First public release: cross-platform desktop workbench, command-line interface, and VS Code extension."
            - paragraph [ref=f3e208]: Computable documents support typed records and functions, local modules, units of measure, tables, charts, and validated JSON/CSV inputs.
            - paragraph [ref=f3e209]: Preview and export reports as HTML, PDF, or DOCX; export eligible data as JSON or CSV.
      - generic [ref=f3e210]:
        - generic [ref=f3e211]: Search is local. No telemetry is sent.
        - button "Close" [ref=f3e212] [cursor=pointer]
```

# Test source

```ts
  34  | 	});
  35  | }
  36  | 
  37  | async function captureHelp(page: Page, testInfo: TestInfo, name: string) {
  38  | 	await page.screenshot({ path: testInfo.outputPath(name), animations: "disabled", style: "#fail-next-preview { display: none !important; }" });
  39  | }
  40  | 
  41  | test("bundled help keeps stable topics, local search, registry shortcuts, routing, and app-owned actions", async ({ page }) => {
  42  | 	const externalRequests: string[] = [];
  43  | 	page.on("request", request => {
  44  | 		if (new URL(request.url()).origin !== "http://127.0.0.1:4183") externalRequests.push(request.url());
  45  | 	});
  46  | 	await openHelp(page, 1440, 900);
  47  | 	const topicButtons = page.locator(".help-topics [data-topic-id]");
  48  | 	await expect(topicButtons).toHaveCount(expectedTopicIds.length);
  49  | 	await expect(topicButtons.evaluateAll(elements => elements.map(element => element.getAttribute("data-topic-id")))).resolves.toEqual(expectedTopicIds);
  50  | 
  51  | 	const search = page.getByRole("searchbox", { name: "Search help and commands" });
  52  | 	await search.fill("imports");
  53  | 	await expect(page.locator(".help-topics [data-topic-id='language']")).toBeVisible();
  54  | 	await expect(page.locator(".help-topics [data-topic-id='documents']")).toBeVisible();
  55  | 	for (const [id, terms] of expectedSearchTerms) {
  56  | 		await search.fill(terms);
  57  | 		await expect(page.locator(`.help-topics [data-topic-id='${id}']`), `${id} search terms`).toBeVisible();
  58  | 	}
  59  | 	await search.fill("offline");
  60  | 	const previewTopic = page.locator(".help-topics [data-topic-id='preview-export']");
  61  | 	await previewTopic.click();
  62  | 	await expect(page.locator(".help-content")).toContainText("PDF charts are static");
  63  | 	await expect(page.locator(".help-content")).toContainText("PDF charts are static with complete data tables");
  64  | 	await search.fill("measurement conversion");
  65  | 	const v09Topic = page.locator(".help-topics [data-topic-id='language-v0.9']");
  66  | 	const v012Topic = page.locator(".help-topics [data-topic-id='language-v0.12']");
  67  | 	await search.fill("effective fields");
  68  | 	await expect(v012Topic).toBeVisible();
  69  | 	await v012Topic.click();
  70  | 	await expect(page.locator(".help-content")).toContainText("does not make the child assignable to its parent");
  71  | 	await expect(page.locator(".help-content")).toContainText("numbering starts at 1");
  72  | 	await expect(page.locator(".help-content")).toContainText("explicit value return on every path");
  73  | 	await expect(page.locator(".help-content")).toContainText("Branch declarations stay local");
  74  | 	await search.fill("loop");
  75  | 	const v013Topic = page.locator(".help-topics [data-topic-id='language-v0.13']");
  76  | 	await expect(v013Topic).toBeVisible();
  77  | 	await v013Topic.click();
  78  | 	await expect(page.locator(".help-content")).toContainText("start paused at the interval's lower bound");
  79  | 	await expect(page.locator(".help-content")).toContainText("PDF titles and descriptions are visible and searchable");
  80  | 	await expect(page.locator(".help-content")).toContainText("no screen-reader, minimum-host, or cross-platform qualification");
  81  | 	await search.fill("code points");
  82  | 	const v014Topic = page.locator(".help-topics [data-topic-id='language-v0.14']");
  83  | 	await expect(v014Topic).toBeVisible();
  84  | 	await v014Topic.click();
  85  | 	await expect(page.locator(".help-content")).toContainText("A valid mismatch returns false");
  86  | 	await expect(page.locator(".help-content")).toContainText("dimensionless Measurements");
  87  | 	await expect(page.locator(".help-content")).toContainText("Unicode 15.1 White_Space");
  88  | 	await expect(page.locator(".help-content")).toContainText("Integrated acceptance, release, and publication remain separate");
  89  | 	await search.fill("measurement conversion");
  90  | 	await expect(v09Topic).toBeVisible();
  91  | 	await v09Topic.click();
  92  | 	await expect(page.locator(".help-content")).toContainText("Record constructor fields use =");
  93  | 	await expect(page.locator(".help-content")).toContainText("List indexes are 1-based");
  94  | 	await search.fill("Ctrl/Cmd+S");
  95  | 	await expect(page.locator(".help-shortcuts")).toContainText("Save active tab");
  96  | 	await expect(page.locator(".help-shortcuts")).toContainText("Ctrl/Cmd+S");
  97  | 	await expect(search).toHaveValue("Ctrl/Cmd+S");
  98  | 	await search.fill("");
  99  | 	await page.keyboard.press("Escape");
  100 | 
  101 | 	await page.keyboard.press("Control+Shift+P");
  102 | 	await page.getByRole("textbox", { name: "Search commands" }).fill("Release notes");
  103 | 	await page.getByRole("dialog", { name: "Commands" }).getByRole("button", { name: "Release notes" }).click();
  104 | 	await expect(page.locator(".help-topics [data-topic-id='release-notes']")).toHaveAttribute("aria-current", "page");
  105 | 
  106 | 	await page.goto("/?help-section=language");
  107 | 	await expect(page.locator(".help-topics [data-topic-id='language']")).toHaveAttribute("aria-current", "page");
  108 | 	await page.goto("/?help-section=not-a-topic");
  109 | 	await expect(page.locator(".help-topics [data-topic-id='getting-started']")).toHaveAttribute("aria-current", "page");
  110 | 
  111 | 	await page.goto("/");
  112 | 	await page.locator("button[aria-label='Help and shortcuts']").click();
  113 | 	await page.getByRole("button", { name: "Create a project with Hello OpenAMX" }).click();
  114 | 	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toHaveCount(0);
  115 | 	await expect(page.getByRole("status")).toContainText("Created a starter project");
  116 | 
  117 | 	await page.locator("button[aria-label='Help and shortcuts']").click();
  118 | 	const startersTopic = page.locator(".help-topics [data-topic-id='starters']");
  119 | 	await startersTopic.click();
  120 | 	const starterItems = page.locator(".starter-list .starter-item");
  121 | 	await expect(starterItems).toHaveCount(3);
  122 | 	await expect(starterItems.nth(0)).toContainText("Hello OpenAMX");
  123 | 	await expect(starterItems.nth(1)).toContainText("Operations note");
  124 | 	await expect(starterItems.nth(2)).toContainText("OpenAMX learning guide");
  125 | 	await expect(starterItems.nth(2).getByRole("button", { name: "Create guided project" })).toBeVisible();
  126 | 	await page.keyboard.press("Escape");
  127 | 
  128 | 	await page.locator("button[aria-label='Help and shortcuts']").click();
  129 | 	await page.locator(".help-topics [data-topic-id='diagnostics']").click();
  130 | 	const downloadPromise = page.waitForEvent("download");
  131 | 	await page.getByRole("button", { name: "Download diagnostic summary" }).click();
  132 | 	const download = await downloadPromise;
  133 | 	expect(download.suggestedFilename()).toBe("openamx-diagnostic-summary.json");
> 134 | 	expect(externalRequests).toEqual([]);
      |                           ^ Error: expect(received).toEqual(expected) // deep equality
  135 | });
  136 | 
  137 | test("help frame stays viewport-bounded with fixed chrome and a scrollable body", async ({ page }, testInfo) => {
  138 | 	for (const viewport of [
  139 | 		{ width: 1024, height: 720, name: "1024x720" },
  140 | 		{ width: 1440, height: 900, name: "1440x900" }
  141 | 	]) {
  142 | 		await openHelp(page, viewport.width, viewport.height);
  143 | 		const dialog = page.locator(".help-dialog");
  144 | 		const initial = await dialogBounds(page);
  145 | 		expect(initial.x).toBeGreaterThanOrEqual(0);
  146 | 		expect(initial.y).toBeGreaterThanOrEqual(0);
  147 | 		expect(initial.x + initial.width).toBeLessThanOrEqual(viewport.width);
  148 | 		expect(initial.y + initial.height).toBeLessThanOrEqual(viewport.height);
  149 | 		expect(initial.width).toBeGreaterThanOrEqual(viewport.width * 0.75);
  150 | 		expect(initial.width).toBeLessThanOrEqual(viewport.width * 0.81);
  151 | 		expect(initial.height).toBeGreaterThanOrEqual(viewport.height * 0.75);
  152 | 		expect(initial.height).toBeLessThanOrEqual(viewport.height * 0.81);
  153 | 
  154 | 		const header = await page.locator(".help-header").boundingBox();
  155 | 		const search = await page.locator(".help-search").boundingBox();
  156 | 		const footer = await page.locator(".help-footer").boundingBox();
  157 | 		const body = page.locator(".help-layout");
  158 | 		const scrollMetrics = await body.evaluate(element => ({ scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }));
  159 | 		expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
  160 | 		await captureHelp(page, testInfo, `sprint046-help-${viewport.name}.png`);
  161 | 		await body.evaluate(element => { element.scrollTop = element.scrollHeight; });
  162 | 		await expect.poll(() => body.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  163 | 		const chromeBounds = async () => Promise.all([".help-header", ".help-search", ".help-footer"].map(selector => page.locator(selector).boundingBox()));
  164 | 		const originalChrome = [header, search, footer];
  165 | 		for (const [index, bounds] of (await chromeBounds()).entries()) expect(Math.abs(bounds!.y - originalChrome[index]!.y)).toBeLessThanOrEqual(1);
  166 | 
  167 | 		const query = page.getByRole("searchbox", { name: "Search help and commands" });
  168 | 		for (const term of ["recovery", "preview", "no-such-help-topic"]) {
  169 | 			await query.fill(term);
  170 | 			expect(await dialogBounds(page), `${viewport.name} after ${term}`).toEqual(initial);
  171 | 			for (const [index, bounds] of (await chromeBounds()).entries()) expect(Math.abs(bounds!.y - originalChrome[index]!.y), `${viewport.name} chrome ${index} after ${term}`).toBeLessThanOrEqual(1);
  172 | 		}
  173 | 		if (viewport.name === "1024x720") console.log(`Help visual: ${viewport.name}; fixed frame ${Math.round(initial.width)}x${Math.round(initial.height)}; body ${scrollMetrics.clientHeight}px viewport / ${scrollMetrics.scrollHeight}px content.`);
  174 | 		await page.goto("about:blank");
  175 | 	}
  176 | });
  177 | 
```