# Sprint 063 Handoff Prompt

You are the Builder for OpenAMX Sprint 063.

## Read First

- Applicable repository instructions and `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV10MasterSprintPlan.md`
- Sprint 063 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Sprint 060 approved contract, `builder-evidence.md`, tested SVG subset, and Lead Developer disposition
- Sprint 061 `builder-evidence.md`, `src/renderer/chartModel.ts`, `createChartViewModel`, and Lead Developer disposition
- Sprint 062 `builder-evidence.md` and disposition only for current theme/security status; do not make its preview changes part of Sprint 063
- `src/renderer/reportPdf.ts`, `src/runtime/pdfDestination.ts`, PDF CLI/worker call sites, existing PDF fonts/resource copy, and `tests/reportPdf.test.ts`, `tests/pdfCli.test.ts`, `tests/reportPresentation.test.ts`

## Entry Gate and Approved Baseline

Sprint 061 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS**; its shared `createChartViewModel` and exact ECharts `6.1.0` root dependency are the implementation baseline. Sprint 063 depends on Sprint 061 and may proceed independently of Sprint 062 per the master plan. Sprint 062 is now separately **COMPLETE / APPROVED WITH RECORDED RESIDUALS**, but its browser/desktop evidence does not establish PDF behavior.

Use the existing pdfmake pipeline and empirical ECharts SSR/PDF subset from Sprint 060. Keep PDF static, offline, searchable, and atomic. Do not edit HTML/desktop or DOCX paths.

## Task Contract

**owns**: Replace the PDF custom chart builder with shared-model ECharts SSR SVG; preserve report structure/tables/identity/pagination/atomicity; verify actual chart visuals/fonts; exercise PDF failure/atomic behavior; record Builder evidence and request separate disposition.

**must_not**: Reinterpret chart rows/units; change AMX/chart/runtime semantics; add browser interactions or iframe permissions; change PDF engine; implement DOCX charts; add network/remote assets; alter worker/output limits; claim package/native/platform/visual-parity results not tested; or self-accept.

## Implementation Rules

1. Inspect the worktree and existing PDF destination/error path. Preserve concurrent user changes. Confirm no upstream Sprint 063 implementation has already changed the renderer.
2. Use `createChartViewModel(emission, report.identity)` as the sole source for ECharts options, units, series/groups/order, theme, empty state and complete rows/headings. Do not keep a parallel `chartRows` or custom `chartSvg` path for charts.
3. Use actual ECharts `6.1.0` Bun SSR with SVG renderer, explicit dimensions, static animation disabled, and `renderToSVGString()`. Dispose every chart in `finally`; use no browser, network, external font/image, or HTML interaction state.
4. The in-memory shared option contains function-valued formatter callbacks. Do not JSON-round-trip it or drop/rebuild callbacks from content. Pass trusted callbacks directly to SSR; change only static destination settings in a non-mutating derived option.
5. Preserve approved orientation, captured order, duplicate labels/coordinates, mixed-unit axes, DateTime UTC ISO display, null gaps, scatter omitted plot points/full table rows, negative/zero values and empty state. Never synthesize values or units.
6. Insert static SVG at the existing content position and preserve searchable report text, complete table, report identity/footer, source/view order, page breaks, A4 width/margins, page flow and current Roboto resource policy. Fit width without distortion, clipping, overlap or success-looking placeholder.
7. Validate actual serialized PDF pages by rasterizing and inspecting. Assert PDF text/labels separately. Check generated SVG tags/features against Sprint 060's tested subset; do not assume unsupported features are safe.
8. Preserve atomic output writes. Add narrow fault injection for a valid chart-render failure if practical; make errors visible and ensure existing target bytes survive and temp files are removed. Do not invent a public diagnostic code; request Lead Developer direction if one is necessary.
9. ECharts-generated SVG IDs vary across runs. Do not require raw PDF/SVG byte equality. Compare model semantics and rasterized appearance. Do not normalize identifiers with regex; any structural normalization needs a proper XML mechanism and reference-integrity tests.
10. Keep Sprint 062 and DOCX source untouched. Exercise existing DOCX tests only as unchanged baseline; PDF failures/residuals remain separate from HTML security acceptance.
11. Run focused PDF/CLI/presentation/model tests, root build/full tests, and desktop RPC/worker PDF tests where available. Record exact commands, host/runtime versions, totals/skips, pdfinfo/pdffonts/raster artifacts, package/worker results, warnings, and residuals.
12. Add `builder-evidence.md`, update state/decision/question logs, and request a separate Lead Developer disposition. Do not claim Sprint 064, V0.10 integrated acceptance, platform certification, release readiness or publication.

## Closeout

Evidence must distinguish production PDF SSR integration from Sprint 060's isolated probe, byte generation from actual visual inspection, CLI/worker from native desktop launch, and PDF chart completion from Sprint 064 cross-surface acceptance. Sprint 063 completion does not close the V0.10 cycle.