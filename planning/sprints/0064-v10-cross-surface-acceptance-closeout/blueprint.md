# Sprint 064 Blueprint: V0.10 Cross-Surface Acceptance and Closeout

## Approach

1. Verify Sprint 062 and 063 are each **COMPLETE / APPROVED WITH RECORDED RESIDUALS** and read their full evidence, plus Sprint 060's approved contract and Sprint 061's shared-model implementation. Keep prior pass/fail/unavailable results attributed to their original runs.
2. Record the initial worktree and current package/manifest versions. Preserve user changes, existing release artifacts, and ignored desktop build outputs. Select disposable output directories for acceptance exports.
3. Create one traceability matrix from the V0.10 master-plan acceptance/verification list and Sprint 060-063 acceptance matrices. Map each requirement to owning test/command/artifact/surface and result. Include exact residual ownership; do not invent a global green status from separate surface passes.
4. Run focused integrated chart fixtures through the real AMX loader/preparer and every final destination: standalone HTML/desktop preview/export and static CLI/desktop-worker PDF. Include all four kinds, scalar/record forms, mixed measurement units, DateTime, null/empty, grouped/multiple charts, duplicate/order, negatives/zero, titles/descriptions, source tables and no-data cases. Check charts visually, not only option/HTML/PDF text.
5. Compare matched HTML/desktop/PDF chart crops at representative logical dimensions. Record the crop-generation method, dimensions, browser/Poppler versions and metric. Apply the approved target SSIM >= 0.97 and label/plot bounds within 2 CSS px where pixel comparison is meaningful; also require no clipped/overlapping labels and equivalent chart meaning. If rasterization differences make a metric inapplicable, submit the evidence and proposed alternative tolerance to the Lead Developer rather than waiving it.
6. Re-run the standalone local-file/offline report and actual desktop preview hostile-content tests. Confirm zero attempted external requests, no active authored links/resources/scripts, opaque origin with only `allow-scripts`, and parent/bridge/application access denial. Verify complete table and print remain independent of legend/zoom. Capture screenshots and request/navigation logs.
7. Review accessibility using existing automated DOM/browser checks and a focused manual review of accessible names/descriptions, table reading, keyboard/pointer/touch controls, focus/reset operability and print. State explicitly that this is not a formal certification unless a formal audit was actually performed.
8. Run actual representative CLI HTML/PDF commands using `examples/kitchen-sink.amx` and `examples/v09-measurement-report.amx` plus its input fixture. Inspect output offline, text content, PDF page/font metadata, and raster pages. Re-run extracted/packaged worker chart preview smoke if available. Attempt native app launch only with an existing authorized artifact/host; otherwise report unavailable, never infer it from worker/package results.
9. Establish a bounded end-to-end workload profile based on observed examples, Sprint 060's 5,000 points, current HTML/worker caps, and a larger useful test dataset. Record chart/row/point counts, sizes, timings and rendered outcomes. Do not change limits or call the largest tested count a supported maximum.
10. Run root build, full root suite, scoped renderer/model/PDF/CLI tests, desktop RPC/worker/UI, typecheck/build, Help UI checks and relevant packaged-resource checks. The Sprint 063 full-suite data-editor timeout is a known unrelated residual: reproduce/record it, do not patch unrelated code without authorization. Report parallel and serial results separately and keep exact totals/skips.
11. Update current user-facing report documentation and bundled searchable Help. Review representative existing examples and generated outputs; update only those needed to accurately show interactive HTML/desktop versus static PDF and complete tables/offline use. Use no new AMX rules and make no DOCX improvement claim. Add focused documentation/help assertions if the content contract changes.
12. Prepare a Builder evidence file with criterion-by-criterion outcome, exact commands/tool versions/host, test counts, screenshots/PDF rasters, package artifacts, security request logs, docs/example changes, and residuals. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` and request an explicit Lead Developer final V0.10 disposition. Do not self-accept or publish.

## Integrated Acceptance Matrix

| Area | Required evidence | Known evidence boundary to retain |
|---|---|---|
| Shared chart meaning | All four chart kinds, labels/mappings, groups/series, units, source order/duplicates, null/empty, full tables on each destination | Do not infer parity from model unit tests alone |
| HTML/offline/security | Standalone `file://`, desktop preview/export, embedded runtime, zero attempted external requests, hostile payloads, `allow-scripts`-only opaque frame | Sanitizer/navigation pass from Sprint 062 is exact Chromium/Linux evidence, not all browsers/hosts |
| PDF/static output | CLI and worker PDF, searchable text, A4/page flow, fonts, all chart kinds/units/empty states, raster inspection | Sprint 063's direct data-editor timeout remains separate; no native app window launch |
| Visual parity | Matched chart crops, measured SSIM/geometry, no clip/overlap, same series/unit meaning | Raw SVG/PDF bytes differ from generated ECharts IDs; byte equality is not the test |
| Accessibility/print | Names/descriptions, complete table, truthful null/DateTime, input methods, print behavior | Formal accessibility audit remains unverified unless performed in this sprint |
| Package/runtime | Actual Linux bundle/worker resources and offline resolution; native GUI attempt only if available | Linux archive/worker does not imply native launch or other platforms |
| Limits/workload | Current caps and end-to-end sizes/timings at an agreed evidence envelope | 5,000 points is prior evidence, not a product maximum; no caps change |
| Regression/docs | Root/desktop/focused checks, existing examples and current README/help accuracy, DOCX unchanged baseline | Do not repair unrelated timeout without authorization; no DOCX claims |

## Documentation and Example Plan

- Review/update root `README.md` report/export summary and chart/offline/parity caveat only if existing text is inaccurate after V0.10.
- Review/update `desktop-app/README.md` preview/export section and `desktop-app/src/mainview/components/help-content.json` `preview-export` content/search terms to distinguish interactive offline HTML/desktop charts from static PDF charts.
- Reuse `examples/kitchen-sink.amx` for the four-kind chart workflow and `examples/v09-measurement-report.amx` with `examples/v09-trips.json` for unit-aware output. Update source/generated HTML only if needed to make the current approved behavior clear and reproducible; do not add syntax or assert DOCX chart improvements.
- Preserve historical language-spec text unless a specific current-facing reference must be corrected. Root V0.9 spec remains the data/language baseline, not a claim of ECharts implementation details.
- Record every documentation/example/help file changed and test the bundled Help search terms/UI where changed.

## Files to Update

- Current-facing report docs as needed: `README.md`, `desktop-app/README.md`
- Bundled searchable Help: `desktop-app/src/mainview/components/help-content.json` and focused Help test/search terms if required
- Representative existing examples or generated output only if necessary for documented behavior; no unrelated fixture churn
- Focused integrated acceptance test/fixture only where existing test seams do not cover the actual combined workflow
- `planning/sprints/0064-v10-cross-surface-acceptance-closeout/builder-evidence.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- No production feature changes without separate explicit Lead Developer authorization; no DOCX renderer changes, release manifest/version changes, or publication artifacts

## Verification

- Focused tests: `tests/chartModel.test.ts`, `tests/renderer.test.ts`, `tests/reportPdf.test.ts`, `tests/reportPresentation.test.ts`, `tests/pdfCli.test.ts`, `tests/examples.test.ts`; desktop worker/RPC and `tests/ui/html-chart-security.pw.ts`, preview freshness, Help UI.
- Root `bun run build` and `bun test`; preserve desktop data-editor polling timeout outcomes and existing Windows-only skips exactly.
- Desktop `bun run typecheck`, `bun run build`/`build:web` as appropriate, UI/RPC/worker checks; state wrapper outcomes separately from direct fallbacks. Use actual packaged worker extraction and smoke where possible; native UI remains a distinct check.
- Representative standalone `file://` HTML with network disabled; inspect all chart canvases and interaction/security request logs.
- Representative CLI HTML and PDF export; `pdfinfo`, `pdffonts`, `pdftoppm` (or equivalent) plus visual inspection and searchable text assertions.
- Cross-surface screenshot metric/geometry and larger bounded workload results with exact versions/sizes/timings.
- Bundled Help UI/search test and relevant documentation/example tests if content changed.
- `git diff --check` on owned paths; final changed-file/provenance/residual summary.

## Notes

- Sprint 064 adds no product features. A real functional defect is a finding, not permission to expand implementation; request Lead Developer direction before fixing.
- Sprint 063 PDF completion is accepted with a root-suite desktop data-editor polling timeout. Do not conceal it or conflate it with focused PDF regression results.
- Sprint 062 security passed in its tested environment and exactly scoped output; cross-browser, native application and formal accessibility residuals remain until directly verified.
- Final V0.10 acceptance belongs to the Lead Developer as a separate disposition after reviewing this evidence. Sprint 064 completion is not release/publication authorization.