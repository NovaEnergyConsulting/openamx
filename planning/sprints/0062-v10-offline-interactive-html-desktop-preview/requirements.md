# Sprint 062 Requirements: V0.10 Offline Interactive HTML and Desktop Preview

## Goal

Replace the custom HTML chart SVG path with offline interactive ECharts charts driven by Sprint 061's shared chart model, and integrate that output into both existing desktop live-preview iframe locations. Preserve report content, complete accessible data tables, print output, preview freshness, and output limits while proving that untrusted report content cannot execute code, escape to the network, or access privileged desktop/application state.

## Dependencies and Entry Gate

- Sprint 061 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by separate Lead Developer disposition dated 2026-10-07.
- Consume `createChartViewModel` and its table, axes, unit, tooltip, accessibility, empty-state, and theme fields from `src/renderer/chartModel.ts`. Do not independently reconstruct chart rows/units or bypass the shared model.
- Root production dependency is exactly `echarts@6.1.0`; there is no desktop-only ECharts dependency. Sprint 061's real `ChartMeasurementDescriptor` is captured immutably with existing normalized values.
- Sprint 060's external-link/meta-refresh navigation escape remains a failed security gate. Sprint 061 did not test or fix it. Sprint 062 owns remediation and adversarial re-verification; it is not permission to enable iframe scripts first.
- Actual Electrobun packaged-resource resolution remains unavailable from Sprint 060. Sprint 062 must verify the real desktop worker/build/package path where the host permits and report unavailable results without treating the temporary Bun bundle as package evidence.
- Preserve all remaining Sprint 060 residuals and their evidence status: raw ECharts SVG generated IDs vary; cross-surface visual tolerance and >5,000-point end-to-end performance remain unmeasured; pointer/keyboard/touch and public chart-render failure diagnostics remain unverified. PDF chart rendering is Sprint 063 scope.
- Inspect the worktree and current report/desktop changes before editing; preserve user changes.

## Inputs

- `planning/plan-openamxV10MasterSprintPlan.md`, Sprint 062 and confirmed offline/security/interaction requirements
- Sprint 060 approved contract, `builder-evidence.md`, and Lead Developer disposition
- Sprint 061 `builder-evidence.md`, `src/renderer/chartModel.ts`, and its focused tests
- `src/renderer/renderHtml.ts`, `src/renderer/reportPreparation.ts`, and existing renderer/presentation/CLI tests
- `desktop-app/src/mainview/App.vue` (both live-preview iframe locations), desktop worker/bundling/resource configuration, and preview freshness/cancellation behavior
- Existing `desktop-app/tests/ui/preview-freshness.pw.ts`, Playwright fixtures/config, and RPC/worker tests

## In Scope

- Replace chart-only custom SVG generation in shared HTML rendering with ECharts browser rendering from `createChartViewModel`; keep CLI standalone HTML, desktop live preview, and desktop HTML export on the same HTML renderer/model/theme path.
- Embed all required browser ECharts runtime code and chart-specific bootstrap in the standalone HTML document. A local report opened with `file://` must work without CDN, network access, sibling runtime files, or service installation.
- Serialize model data safely into the generated document. Keep executable code fixed/trusted and separate from report data; safely encode titles, descriptions, headings, labels, categories, groups, units, values, and hostile strings including `</script>` and markup-like content.
- Sprint 061's ECharts option includes function-valued formatters and cannot be directly JSON-serialized. Define a serializable projection for model data/metadata and reattach only fixed application-owned formatter callbacks from a closed allow-list in the trusted browser bootstrap. Never serialize functions as source, call `eval`/`new Function`, or derive executable code from report data.
- Render one independent ECharts instance per chart from its shared model; implement approved tooltip content, multi-series/group legend toggles, numeric/DateTime line and scatter zoom/pan, reset to the full captured extent, responsive resize, and deterministic cleanup when a preview document is replaced.
- Make applicable controls operable and understandable with keyboard, pointer, and touch input; provide visible, labeled reset/zoom controls where chart gestures are not discoverable or operable accessibly. Test supported input methods explicitly.
- Preserve truthful accessible title/description metadata and the complete ordered table alternative. Do not use ECharts-generated ARIA summaries; Sprint 061 disables them because they misstate null and DateTime values. Legend and zoom changes must not filter the complete data table or mutate emissions.
- Preserve print behavior: hide transient chart controls and show chart identity/description plus the complete data alternative without clipped/blank chart content. Print output is independent of current legend/zoom state.
- Integrate trusted chart scripts into both existing desktop `srcdoc` iframe call sites with the least-privilege sandbox. Only `allow-scripts` may be added after the hostile-content/navigation gate passes; never add `allow-same-origin`, top navigation, popups, forms, downloads, or arbitrary report-authored script permission.
- Remediate dangerous report-authored markup/URLs before enabling preview scripts. Use an established, maintained allow-list sanitizer or an equivalently reviewable structured Markdown/rendering policy; record package/version and test policy. At minimum:
  - Strip/reject scripts, event-handler attributes, meta refresh, base, form, frame, object/embed, executable/data-HTML URLs, and resource-bearing markup not explicitly generated by the application.
  - Remove active external and relative navigation targets from report-authored links; preserve visible link text. Only inert same-document fragment references may remain if proven not to trigger network or parent navigation.
  - Disallow report-authored network resources, including remote images/styles/fonts/media, CSS imports/URLs, SVG external references, and refresh/navigation tricks. Preserve only known application-generated embedded raster logo data if applicable.
  - Escape all report-derived text in DOM and ECharts tooltip/label paths; do not use report values as HTML, executable JavaScript, element attributes, script sources, or navigation destinations.
- Apply defense-in-depth CSP and restrictive iframe sandboxing, but do not rely on `navigate-to` or CSP alone to block navigations. Demonstrate the fix using actual click and refresh repros from Sprint 060 plus adversarial markup/URL/resource payloads.
- Bundle the browser runtime and any resources/fonts required by the desktop preview/export path. Verify the production worker bundle and actual Electrobun package/resource layout on available host(s); preserve existing preview worker and HTML/binary output limits.
- Preserve preview freshness, cancellable job behavior, bounded output handling, last-good preview behavior, and existing HTML export workflow. Replacing a preview must dispose instances and resize/event handlers.
- Extend existing renderer and desktop Playwright tests. Provide browser rendering evidence for standalone local-file HTML and desktop preview, including chart nonblank assertions, interactions, responsive resize, offline requests, print, accessibility/table access, malicious payloads, and lifecycle replacement.

## Out of Scope

- Static ECharts/PDF integration, pdfmake SVG serialization, PDF layout/visual parity, and PDF accessibility; Sprint 063 owns these.
- New AMX syntax, chart types/options, theme controls, chart validation, measurement normalization, report preparation/data ordering, or runtime emissions changes.
- DOCX chart output or DOCX styling changes; existing DOCX regression tests are baseline only.
- New in-app PDF viewing, replacement of preview architecture, broad report redesign, table-interaction redesign, output-limit increase, or general performance project.
- Arbitrary author-supplied ECharts config, scripts, HTML widgets, remote assets, or privileged bridge/application access.
- Claiming package/native/cross-platform evidence for targets not actually built and inspected; release/publication work.

## Constraints

- Use Sprint 061 `createChartViewModel` as the single source of chart meaning, unit metadata, data ordering, series/group identity, empty states, tooltip metadata, accessibility source metadata, dimensions, and theme.
- Browser-only interaction/presentation state is ephemeral. It must not mutate AMX emissions, the shared model's complete table, later previews, or static exports.
- Standalone HTML must remain one self-contained offline file. Do not add remote/CDN dependencies or require adjacent runtime assets.
- The preview's trust boundary is strict: generated chart code is trusted; all document content, frontmatter, chart data, descriptions, labels, and source are untrusted. No report-authored executable code or navigation/resource capability is allowed.
- Security gate is ordered: first implement sanitizer/structured render restrictions and hostile tests while both iframe sandboxes remain empty; only after tests prove no navigation/network escape may the sandbox be changed to `allow-scripts` alone. If containment cannot be demonstrated, leave both sandboxes unchanged, do not ship script-enabled preview, and request Lead Developer direction. A CSP header/meta policy or passing parent-access test alone is insufficient.
- Keep an opaque origin; never combine `allow-scripts` with `allow-same-origin`. Verify denial of parent document, desktop bridge, local app state, and privileged APIs after scripts are enabled.
- Do not permit script injection through inline handlers, JSON termination, tooltip formatter HTML, ECharts labels, link targets, meta refresh, CSS, SVG, or resource URLs. Test each applicable context.
- Avoid CSP `unsafe-eval`; executable browser functions must come only from fixed application-owned source protected by the generated nonce. Any ECharts/runtime CSP requirement that conflicts with this is a blocker requiring evidence and approval.
- Maintain existing HTML/worker bounds and cancellation/freshness semantics. Report output-size impacts; do not change limits without explicit approval.
- If any required security remediation requires relaxing network, navigation, origin, or scope constraints, stop and request approval rather than shipping an unsafe partial configuration.
- Record actual statuses and environment. Standalone browser success does not imply desktop package success; source bundling does not imply packaged resource resolution.