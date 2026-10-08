# Sprint 062 Handoff Prompt

You are the Builder for OpenAMX Sprint 062.

## Read First

- Applicable repository instructions and `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV10MasterSprintPlan.md`
- Sprint 062 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Sprint 060 `builder-evidence.md`, approved contract matrix, and Lead Developer disposition
- Sprint 061 `builder-evidence.md`, `src/renderer/chartModel.ts`, captured measurement descriptors, tests, and Lead Developer disposition
- `src/renderer/renderHtml.ts`, `src/renderer/reportPreparation.ts`, renderer/presentation/CLI tests
- `desktop-app/src/mainview/App.vue` (both preview iframes), desktop worker/resource config and scripts, `desktop-app/tests/ui/preview-freshness.pw.ts`, relevant Playwright configs and desktop RPC/worker tests

## Entry Gate and Approved Baseline

Sprint 061 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS** and Sprint 062 may proceed. Consume the root ECharts `6.1.0` dependency and `createChartViewModel` shared model. Do not duplicate chart extraction, unit normalization, theme, table data, or accessibility metadata.

The Sprint 060 report-authored link and meta-refresh navigation escape remains a failed security finding. Scripts are currently disabled in both preview iframes. You must remediate and prove containment before adding `allow-scripts`; neither opaque-origin isolation nor CSP alone was sufficient. Sprint 061 did not test or fix this issue.

## Task Contract

**owns**: Shared HTML chart adapter and embedded browser runtime; offline standalone HTML; tooltip/legend/zoom/pan/reset/resize/lifecycle behavior; safe serialization and allow-list sanitization of untrusted report content; security-gated script permission in both desktop previews; complete accessible table and print alternatives; desktop package/resource and preview regressions; evidence and separate disposition request.

**must_not**: Change chart meaning or measurement normalization; add AMX/ECharts authoring options; enable same-origin or privileged iframe access; ship before navigation containment; make HTML/PDF architecture changes outside approved shared rendering; implement PDF charts (Sprint 063); modify DOCX, output caps, release/platform scope, or claim unavailable package/security/browser results passed.

## Execution Rules

1. Inspect and preserve current worktree changes. Verify exact dependency/model implementation and existing iframe, HTML renderer, and worker paths before editing.
2. Reproduce the Sprint 060 external link and meta-refresh finding using current output. Inventory raw Markdown HTML, URL-bearing fields, images, CSS/SVG, report identity assets, chart labels/tooltips, and serialized chart data.
3. Implement a strict, maintained allow-list content policy or a demonstrably equivalent structured Markdown/rendering restriction. Preserve visible narrative text, but do not preserve active external/relative destinations or fetchable resources. Record the exact package/policy and license/notice path if a sanitizer dependency is added.
4. Keep both iframe sandbox attributes empty while implementing and testing containment. Include click and keyboard link activation, meta refresh, script/event handlers, `javascript:`/`data:` URLs, forms, target attributes, images, CSS, SVG references, report text, hostile JSON terminators, and ECharts tooltip/label data. Observe attempted navigation/request events; blocked DNS or failed response is still a failed test.
5. Apply restrictive CSP as defense in depth. Do not depend on `navigate-to`, empty sandbox alone, CSP alone, or network-disabled test environment to prove navigation cannot be initiated.
6. Only after standalone and both preview paths pass the security gate, change each iframe sandbox to exactly `allow-scripts`. Keep the opaque origin. Do not add `allow-same-origin`, popups, top navigation, forms, downloads, or other tokens. Verify no parent, application, bridge, filesystem, or privileged capability is reachable.
7. `createChartViewModel().option` contains formatter functions and cannot be serialized directly. Build a serializable projection for chart data/model metadata, then reattach only fixed trusted callback implementations from the application bootstrap using approved model metadata. Never serialize function source or use `eval`, `new Function`, or content-derived code; do not require `unsafe-eval` in CSP.
8. Use `createChartViewModel` for the chart payload and common meaning/theme. Embed exact ECharts runtime plus fixed trusted bootstrap into one HTML file. Safely serialize chart data separately from executable code; report-derived strings must never enter a script or HTML context unsafely.
9. Build charts for all four kinds and implement the approved interaction matrix, with keyboard, pointer, and touch coverage for applicable controls/gestures. Keep the full table independent of legend, zoom, and pan. Add truthful title/description/table accessibility linkage; disable library-generated inaccurate ARIA. Keep print behavior full-data and independent of interaction state.
10. Dispose instances and listeners when preview content is replaced/unloaded. Preserve request freshness, cancellation, last-good output, HTML export behavior, and output caps. Do not edit PDF chart output or DOCX.
11. Test the real local-file HTML with networking disabled, actual desktop preview, both iframe call sites, generated package/worker resources where available, and wide/narrow viewport screenshots plus canvas/DOM nonblank assertions.
12. If any security test fails, keep the sandbox empty and do not claim interactive desktop preview complete. Record a minimal reproduction and request Lead Developer direction; do not weaken policy or treat blocked network resolution as success.
13. Run focused security/renderer/UI checks before broader root/desktop checks. Record exact commands, host/tool versions, attempted request logs, screenshots, package evidence, test totals/skips, and residuals in `builder-evidence.md`; update planning logs and request separate disposition.

## Closeout

Sprint 062 evidence must distinguish standalone browser, desktop preview, actual packaged desktop, and PDF (not in scope) results. Sprint 062 completion does not imply PDF chart integration or integrated V0.10 acceptance; Sprint 063 and Sprint 064 remain separate.