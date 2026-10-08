# Sprint 062 Builder Evidence

Date: 2026-10-08  
Status: **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by separate Lead Developer disposition (2026-10-08). Sprint 061 entry gate was COMPLETE / APPROVED WITH RECORDED RESIDUALS.
Host: Arch Linux x86_64, Omarchy kernel `7.2.5-3-omarchy`. Bun `1.4.2`; Node `v24.14.1`; Hutch `0.27.1`; Playwright `1.63.0`; Chromium `/usr/bin/chromium` `152.0.7977.82`. Desktop Playwright's Vite server reported Chromium `153.0.8010.12` for existing theme/workbench specs; the focused security test launched the system Chromium explicitly.

## Implementation

- Added exact root production dependency `sanitize-html@2.17.0` and exact dev dependency `@types/sanitize-html@2.16.0`. License/notice path: `node_modules/sanitize-html/LICENSE` (MIT). The policy allows reviewed Markdown formatting/table tags only, no author attributes/resources/styles, no URL schemes or protocol-relative links, transforms anchors to inert `span` while preserving visible text, and discards active/disallowed tags. Both `renderHtml` and `renderPreparedHtml` use the same policy.
- Replaced HTML's custom chart SVG path with `createChartViewModel` from Sprint 061. The model remains the only source for chart meaning, data order, axes/units, tooltip/accessibility metadata, theme, empty state, and complete ordered table.
- Browser payload projection accepts only JSON values and throws on unexpected functions/non-finite values. It records the exact approved formatter paths (tooltip, category axis labels, UTC DateTime labels/pointers), then the fixed application bootstrap reattaches trusted callbacks. No callback source is serialized; no `eval`, `new Function`, `unsafe-eval`, or report-authored executable path was added by OpenAMX. The exact vendor ECharts distribution contains dormant GeoJSON `new Function` code in its unused `parseGeoJSON` API; no report input reaches/invokes that API, and CSP has no `unsafe-eval`.
- Embedded ECharts browser distribution is imported as text from root ECharts `6.1.0`; standalone HTML is one file with nonce-protected ECharts/runtime/bootstrap/style, restrictive CSP, no remote runtime assets, and safe `<`, `>`, `&` JSON escaping. Text-only HTML gets deterministic deny-all script/style CSP. Reports with views use nonce-only scripts/styles plus `style-src-attr 'unsafe-inline'` for ECharts-generated inline style attributes; `connect-src`, frames, objects, base URI, forms, workers, media and other external origins remain denied.
- Added shared-model chart markup, accessible title/description/summary/table association, full-data table independent of legend/zoom, HTML-native legend and labeled zoom/reset controls, responsive chart container, print styles, ResizeObserver, MutationObserver removal cleanup, and pagehide disposal. DateTime tooltips use model UTC ISO metadata.
- Both declared `App.vue` preview iframe occurrences use exactly `sandbox="allow-scripts"`; no same-origin, top-navigation, popup, form, download, or other token. Opaque origin remains. One occurrence is in the fully commented legacy Sprint 036 template; the active runtime has one iframe site shared by its alternate context route. The RPC source contract asserts both declarations, and Playwright exercises the active runtime iframe.
- Desktop RPC contract now enforces the only sandbox token permitted. HTML preview/export equality normalizes only per-render nonce values. Legacy text-only example comparisons ignore only the CSP meta line. Empty-state presentation regression now checks the shared model's `No data` metadata; PDF/DOCX assertions remain unchanged.

## Security Reproduction And Gate

- Reproduced current renderer behavior before editing with actual `renderHtml` output and Playwright routing. Clicking an authored Markdown `[external link](https://openamx-sprint062.invalid/link)` generated an intercepted request to that URL. No DNS/failed-response outcome was counted as containment.
- Confirmed Sprint 060's meta-refresh finding was injected into an opaque sandboxed `srcdoc` frame and generated an intercepted `https://example.invalid/meta-refresh` request there. A refresh tag placed in the body of a standalone full document did not reproduce in this Chromium, so the test covers the original `srcdoc` context and sanitizer policy rather than claiming that standalone body placement reproduced.
- Added `desktop-app/tests/ui/html-chart-security.pw.ts`, generating report HTML through the production module loader/preparation/renderer path using `examples/kitchen-sink.amx`. It covers external and relative links, `javascript:` and `data:text/html`, click/keyboard activation, meta refresh, scripts/event handlers, CSS `@import`, remote images, forms, iframe/object/embed, SVG references, `</script>` chart title/series strings, tooltip data, and attempted request observation.
- Security gate sequence was respected. Tests first passed in standalone and the active App preview with sandbox empty; a dedicated opaque `allow-scripts` probe then demonstrated the sanitized real report renders 10 charts and no external request attempts before changing App.vue. After permission change, the active App iframe has exactly `allow-scripts`, renders all 10 canvases, and observed zero external request/navigation attempts during load and authored link activations. The second declared source occurrence is legacy-commented and is source-asserted to carry the same sole token, not described as a second runtime instance. Browser does not rely on blocked DNS/network for this result.
- The opaque script-enabled probe verified parent document, parent bridge property, app state property, and localStorage access denial. The active production preview frame also proved opaque-origin document access denial. The App iframe's sandbox is never combined with same-origin.
- Final test-only generated-output measurements and screenshots are emitted under ignored `desktop-app/test-results/html-chart-security.pw.ts--6e393-without-authored-navigation/`: `sprint062-standalone-wide.png`, `sprint062-standalone-narrow.png`, `sprint062-standalone-print.png`, and `sprint062-desktop-preview.png`. Screenshots were visually inspected.

## Browser And Interaction Evidence

- Final standalone report: `bun run src/cli.ts render examples/kitchen-sink.amx --out /tmp/openamx-sprint062-final.html`; opened as `file:///tmp/openamx-sprint062-final.html` in system Chromium 152 with `--disable-background-networking --host-resolver-rules=MAP * ~NOTFOUND`. Result: 10 chart instances, 10 canvases, all four model kinds (`bar`, `column`, `line`, `scatter`), 189 full-table body rows, 1,255,407-character outer document, zero outbound request attempts, zero JS/CSP console errors. No adjacent runtime/service was used.
- Focused UI test observes click and keyboard link activation plus request/navigation events, wide/narrow viewports and canvas counts, hostile tooltip/label payload behavior, complete table invariance, keyboard zoom, pointer wheel zoom, pointer drag pan, touch zoom, reset, legend toggle, print controls/table/plot, and ECharts disposal after chart DOM removal.
- Focused preview test passes both request freshness and security: `preview-freshness.pw.ts` still verifies autosave before publication, pause/resume/manual refresh, stale last-good output; the security test uses the actual active App iframe. No app bridge/parent access is exposed.
- UI command: from `desktop-app`, `./node_modules/.bin/playwright test`. Final result: **13 passed**. One earlier full run had a transient screenshot protocol failure in an unrelated theme test; its focused retry passed and the subsequent complete 13-test run passed.

## Desktop Build And Package Evidence

- `bun run typecheck` from `desktop-app`: passed (`hutch electrobun prepare && vue-tsc --noEmit`).
- `bun run build` from `desktop-app`: passed. Vite `6.4.3` built 3,272 modules; Bun worker bundle was 5,816,238 bytes in the final build; sharp Linux x64 runtime and four Roboto fonts copied. Hutch `0.27.1` completed stable Linux x64 build at `desktop-app/build/stable-linux-x64`.
- Warnings: Vite reports the existing >500 kB main application chunk (2,691.01 kB minified); Hutch reports missing configured Linux icon `desktop-app/assets/icon.png` and skips delta patch without `release.baseUrl`. Build still completed. No warning was suppressed.
- Final archive `desktop-app/build/stable-linux-x64/OpenAMXDesktop/Resources/1ntn6aanzw366.tar.zst` was inspected. It contains `OpenAMXDesktop/Resources/app/bun/jobWorker.js`, `bun/node_modules/@img/sharp-linux-x64` native addon, `sharp-libvips-linux-x64`, and all four `bun/pdfmake-fonts/Roboto-*.ttf` resources. Exact ECharts `6.1.0` and ZRender `6.1.0` markers were confirmed in the worker bundle. The HTML browser runtime is embedded in generated report output, not fetched from package paths.
- Packaged worker smoke extracted the actual final archive tree to a temporary directory, ran that archive's worker with its packaged sharp binding present, and requested preview of an executable AMX `scatter` chart. **Passed:** chart model/runtime present, ECharts 6.1.0 marker present, x/y dataZoom indexes both equal 0, HTML length 1,134,348 (< existing 8,000,000 limit), worker 5,816,292 bytes. This is packaged worker/resource execution evidence; a native Electrobun window/install/launch/IPC run was not performed and is not claimed.
- `bun run tests/rpc-contract-check.ts` from `desktop-app`: passed. It exercised preview freshness/cancellation, HTML/PDF/DOCX workflow/atomic safety, session contracts, RPC boundary and worker mapping. Existing `desktop-app/src/bun/jobWorker.test.ts`: 3 passed.

## Root Verification

- `bun run build`: passed (`tsc`).
- Focused renderer/model/presentation set: `bun test ./tests/renderer.test.ts ./tests/chartModel.test.ts ./tests/reportPresentation.test.ts`: **33 passed**, 0 failed, 194 expectations. CLI paths were exercised by `tests/examples.test.ts` and the desktop RPC workflow test.
- Canonical examples focused: `bun test ./tests/examples.test.ts`: **8 passed**, 0 failed, 136 expectations.
- Final full suite: `bun test`: **398 passed, 2 skipped, 0 failed**, 1,989 expectations, 32 files. Both skips are the existing Windows-only release-preflight cases.
- `git diff --check`: passed.
- Actual PDF chart rendering remains Sprint 063 and was not edited. PDF/DOCX paths ran as RPC/presentation regressions only; no PDF ECharts chart integration is claimed. DOCX renderer source is unchanged.

## Changed Files

- `package.json`, `bun.lock`
- `src/renderer/renderHtml.ts`, `src/types/echarts-runtime.d.ts`
- `tests/renderer.test.ts`, `tests/reportPresentation.test.ts`, `tests/examples.test.ts`
- `desktop-app/src/mainview/App.vue`, `desktop-app/tests/rpc-contract-check.ts`, `desktop-app/tests/ui/html-chart-security.pw.ts`
- This evidence plus `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

## Residuals And Disposition Request

- The Lead Developer accepted this evidence and closed Sprint 062 as COMPLETE / APPROVED WITH RECORDED RESIDUALS. Residuals below remain unpassed; the disposition does not waive or promote them.
- Actual Electrobun stable package/resource build and packaged worker preview were verified on Linux x86_64; no native Electrobun application window/install/launch, WebKit/native host, or other OS/architecture was exercised. Do not promote package bundle evidence to native launch/platform certification.
- No browser engine other than Chromium was tested. The focused test's browser was Chromium 152; existing desktop suite reports its Playwright browser as 153. No cross-browser certification is claimed.
- Sprint 060 residuals retain exact status: SVG generated ID variance, cross-surface visual tolerance and >5,000-point end-to-end bounds, formal accessibility audit, and public chart-render failure injection remain unmeasured/unavailable. Pointer/keyboard/touch interaction behavior now has focused browser evidence for tested chart controls, not certification for every device/browser.
- ECharts `6.1.0` vendor source includes an unused GeoJSON parsing code path using `new Function`; application code does not call it or feed it report content. Current CSP explicitly omits `unsafe-eval`; normal chart rendering is proven under that CSP. If future support adds map/GeoJSON, revisit this constraint first.
- Standalone and preview network tests require zero attempted requests and passed; restrictive CSP is defense in depth. CSP includes `style-src-attr 'unsafe-inline'` because ECharts emits inline style attributes. Authored HTML/CSS/resources are removed by the sanitizer before insertion.
- No HTML/PDF architecture change, AMX/chart meaning/normalization change, output cap change, DOCX edit, release/platform expansion, or V0.10/integrated acceptance claim.
