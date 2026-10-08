# Sprint 062 Blueprint: V0.10 Offline Interactive HTML and Desktop Preview

## Approach

1. Confirm Sprint 061's **COMPLETE / APPROVED WITH RECORDED RESIDUALS** disposition and inspect `builder-evidence.md`, the actual `createChartViewModel` API, the current worktree, `renderHtml.ts`, both `App.vue` preview iframe sites, the worker build, and existing Playwright preview tests.
2. Start with the security blocker, not iframe permissions. Reproduce Sprint 060's external link and meta-refresh navigation from the current renderer/sandbox. Inventory all report-controlled HTML and URL-bearing contexts produced by Markdown, frontmatter/logo, chart model text, JSON payloads, table markup, ECharts tooltip/axis/legend formatters, and CSS/SVG.
3. Choose a maintained allow-list sanitizer or structured rendering policy that runs in the actual Bun report-preparation/render path. Specify allowed elements/attributes/protocols and the treatment of raw HTML, links, images, styles, and malformed markup. Record exact package/version/notice and compatibility. External and relative links become visible text without active destinations; only fragment-only links may remain if tests prove harmless. Strip refresh/base/form/frame/object/embed/script/event-handler and all uncontrolled remote resource mechanisms.
4. Keep both desktop iframes at `sandbox=""` during remediation. Add hostile-content and network-observation tests first. Cover click/keyboard activation of external links, meta refresh, raw HTML, `javascript:`/`data:` URLs, images/styles/fonts, SVG references, forms, target attributes, injected event handlers/scripts, `</script>` payloads, ECharts formatter inputs, and navigation races. CSP is defense in depth; do not rely on `navigate-to` support.
5. Once the report sanitizer/policy and standalone output pass the no-network tests, change both preview iframe sandbox values to exactly `allow-scripts` (opaque origin retained). Re-run hostile tests in the actual application frames and assert parent/bridge/local-state denial. If the security gate does not pass, do not enable scripts; stop with a clear blocked result and request direction.
6. Refactor the shared HTML chart render path to create stable markup for each chart model (container, title/description, explicit accessible summary/table relation, complete full-data table, print alternative, empty state). Use the existing `createChartViewModel(emission, identity)` without re-extracting rows or units. The complete ordered table is emitted independently of ECharts plot data.
7. Embed ECharts `6.1.0` browser runtime and fixed application-owned initializer into standalone HTML. Use a fresh nonce and restrictive CSP appropriate for generated inline runtime/style; no external origins/resources. Place serialized chart model data in safely escaped non-executable JSON or an equivalently safe encoding, and consume it only as data. Verify CSP/resource behavior on local `file://` and `srcdoc`; no `unsafe-eval` or report-authored script allowance unless the Lead Developer explicitly approves a scope/security change.
8. Configure each chart from the shared model, adding only interactive destination behavior: tooltips, multi-series/group legend toggles, numeric/time line and scatter zoom/pan with a labeled reset, responsive resize, accessible title/description/table linkage, and empty state. Do not expose author configuration or let presentation state filter/mutate the table or emission. Tooltip strings use safe text/escaping, never trusted HTML from report values.
9. Dispose chart instances and resize/listener resources when the document is replaced/unloaded; handle multiple charts and repeated initialization independently. Preserve desktop preview freshness/cancellation, output bounds, and existing document/export workflows.
10. Validate standalone HTML as an actual local file with networking disabled; test CLI and HTML export paths. Validate both desktop iframe instances through existing Vite/Playwright fixture(s), then build/package the actual Electrobun app if supported on the host. Inspect package worker/resources rather than extrapolating from a source bundle.
11. Test print and complete data alternatives; responsive 720x360 model sizing at representative wide/narrow viewports; resize, tooltip, legend, zoom/pan/reset; title/description/table association; all kinds, mixed units, null/empty data; untrusted payloads; and old-instance cleanup. Capture screenshots/nonblank canvas assertions for real chart output.
12. Keep PDF chart output untouched; it remains Sprint 063. Existing output-size caps remain unchanged. Run focused renderer/desktop tests, root build/full tests, desktop RPC/typecheck/build/UI checks where available, and representative CLI standalone HTML. Record commands, versions, host, results, artifacts, status boundaries, residuals, and changed files in Builder evidence; request separate Lead Developer disposition.

## Security Gate: Required Design and Proof

The Sprint 060 probe showed that `sandbox="allow-scripts"`, opaque origin, CSP, `navigate-to 'none'`, and blocked DNS did **not** prevent a report-authored link or meta refresh from initiating navigation. Sprint 062 must demonstrate prevention, not only a failed request after the host blocks DNS.

Required proof:

- Before the iframe is script-enabled, sanitize/report-render all document-controlled content with a strict allow-list. No raw narrative markup, frontmatter value, chart text, table content, ECharts tooltip data, or serialized payload may create executable code, navigation, or a network-capable resource.
- Remove active non-fragment link destinations. Preserve visible text. Remove meta refresh, base, forms, iframes, object/embed, event handlers, scripts, CSS imports/URLs, remote/data-HTML images, SVG external references, and uncontrolled resource attributes. Permit only explicitly reviewed application-generated resources (the self-contained browser bundle and, if needed, a known rasterized embedded logo).
- Add restrictive CSP for scripts, styles, images, fonts, connections, forms, objects, frames, workers and base URI. CSP complements sanitization; it is not the sole navigation defense and `navigate-to` cannot be treated as a portable guarantee.
- Exercise actual resulting standalone HTML and both application preview frames. Spy on browser requests/navigation; assert zero external request/redirect attempts for mouse, keyboard, refresh, load, hover/tooltips, resize, print, and malicious payload cases. A `net::ERR_NAME_NOT_RESOLVED` or blocked response is a failure if navigation/request was initiated.
- Only after all tests pass, use `sandbox="allow-scripts"` with no same-origin or other capability tokens. Assert parent/window/opener/bridge/local app access is denied and trusted chart runtime still functions.
- If a sanitization library is unsuitable or requires capability/scope expansion, keep iframe scripts disabled and request explicit direction.

## Trusted Bootstrap and Model Serialization

Sprint 061's `ChartViewModel.option` is an in-memory ECharts option and includes function-valued formatters. Do not pass it through `JSON.stringify` and assume it remains behaviorally complete: JSON serialization drops functions. Do not serialize callback source, build callbacks from report content, or use `eval`, `new Function`, or CSP `unsafe-eval`.

- Define an explicit serializable projection containing only chart option data and approved model metadata. Prefer a typed projection with a test that fails if unsupported function-bearing fields are added or silently discarded.
- In the fixed, nonce-protected application bootstrap, reattach a closed set of trusted callbacks for the approved UTC ISO DateTime labels/pointers, category labels, and safe tooltip presentation. Choose the callback by fixed chart/model metadata; all callback data remains untrusted text.
- Serialize payloads in a non-executable data container or safe equivalent, escaping script termination and markup boundaries. Render tooltip values as text, not report-controlled HTML.
- Verify that the exact standalone HTML works from `file://` and inside `srcdoc` under the intended CSP without external assets or `unsafe-eval`. A CSP conflict is a blocker, not permission to weaken policy silently.

## Required Browser/Preview Matrix

| Surface/case | Required evidence |
|---|---|
| CLI/report file | One self-contained HTML opened via local `file://` with network disabled; all chart runtime assets local/embedded; charts initialize without adjacent files |
| Chart forms | All four kinds, scalar/record inputs, groups, duplicate rows/coordinates, mixed units, DateTime, negative/zero, null gaps, empty/all-null |
| Interaction | Tooltip fields and unit text, legend toggle only for multi-series/groups, applicable zoom/pan and reset, no data/table mutation |
| Model serialization | Serializable projection retains data/metadata; trusted bootstrap reattaches only fixed formatters; no callback source serialization, `eval`, `new Function`, or `unsafe-eval` |
| Input methods | Applicable controls and gestures have explicit keyboard, pointer, and touch coverage; labeled reset remains available and complete table access is unaffected |
| Layout/lifecycle | Responsive wide/narrow resize; multiple independent charts; replace preview repeatedly and prove disposed instances/listeners |
| Accessibility/print | Model title/description association, truthful null/DateTime summary, complete table always available, print includes chart and all data without transient controls/clipping |
| Security | Hostile raw HTML, links, refresh, URL protocols, resource elements, CSS/SVG references, script terminators, chart/narrative text; zero navigation/network requests and no privileged access |
| Desktop build | Both existing iframe locations use same report HTML; script token only after security pass; actual packaged worker/runtime/resource lookup on available host or explicit blocked status |
| Stability/limits | Current 8,000,000-character HTML and 32,000,000-byte worker output caps respected; no limit change; stable repeated initialization and bounded handling |

## Files to Update

- `src/renderer/renderHtml.ts` and narrowly scoped HTML helper(s) for shared interactive charts, safe serialization, and report-content policy
- Root dependency/lockfile only if a sanitizer is needed and its package is justified; retain exact root ECharts `6.1.0`
- `desktop-app/src/mainview/App.vue` for both preview iframes, only after the security gate passes
- Focused `tests/renderer.test.ts` and/or existing report presentation tests; new sanitizer/HTML runtime tests only if no suitable current home exists
- Existing desktop preview Playwright coverage and a focused hostile-content/security UI test using current fixtures
- Desktop build/resource scripts only if actual bundle evidence requires a narrowly scoped fix; do not change output limits
- `planning/sprints/0062-v10-offline-interactive-html-desktop-preview/builder-evidence.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Do not modify `reportPdf.ts`/PDF chart paths, `reportDocx.ts`, AST/checker/evaluator semantics, chart model meaning, or the V0.10 master scope

## Verification

- Focused HTML model integration and malicious-content sanitizer tests.
- Open standalone generated reports from `file://` with network disabled; assert charts visibly render and exercise controls.
- Use browser request/navigation instrumentation to prove no attempted external requests, not merely no successful responses.
- Playwright both desktop preview iframe call sites, including opaque-origin parent/bridge denial after adding only `allow-scripts`.
- Focused desktop preview freshness and worker tests; desktop RPC tests; typecheck and `build:web`/actual package where available. Report Hutch wrapper and direct fallback commands separately.
- Root `bun run build`, relevant renderer/presentation regressions, and full `bun test`; preserve exact counts/skips.
- Check HTML byte length and worker output bytes at current caps; do not increase caps. Inspect packaged output/resources on host where possible.
- `git diff --check` on owned paths and exact changed-file summary.

## Notes

- Sprint 061's shared model owns chart meaning and theme; this sprint owns the browser adapter, standalone bundling, and desktop preview wiring.
- Sprint 063 owns static ECharts/PDF integration. Sprint 064 owns cross-surface integrated acceptance and documentation/help/example closeout.
- Sprint 062 security failure means no script-enabled preview until the exact navigation repros are contained and rerun. A scope-compliant partial implementation may leave iframe permissions unchanged, but then the interactive desktop preview requirement remains blocked and must be explicitly submitted for Lead Developer disposition.