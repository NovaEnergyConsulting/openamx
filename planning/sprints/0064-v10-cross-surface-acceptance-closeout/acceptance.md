# Sprint 064 Acceptance Criteria

Sprint 064 closeout is complete when every criterion is reconciled with direct evidence and a separate Lead Developer disposition records final V0.10 acceptance status:

- Entry evidence confirms Sprint 062 and Sprint 063 are each **COMPLETE / APPROVED WITH RECORDED RESIDUALS**, with their exact Builder evidence/dispositions reviewed. Sprint 061's shared chart model remains the common source; no earlier result is retroactively upgraded.
- An integrated traceability matrix maps every V0.10 master-plan requirement to a focused command/test/artifact, destination, host/tool version, outcome, and residual/owner.
- The actual shared model output is exercised through standalone HTML, desktop preview/HTML export, CLI PDF, and desktop worker/RPC PDF for `bar`, `column`, `line`, and `scatter`, including scalar/record, multi-series/grouped, measurement units, DateTime, order/duplicates, negative/zero, null/empty, tables, and multiple charts.
- Cross-surface chart meaning agrees: kind/orientation, series/group order and color assignment, axes/unit names, values/labels/titles/descriptions, null/empty behavior, and complete table data. No interactive state affects exported static PDF or full tables.
- Matched chart crops use the approved comparison target SSIM >= 0.97 and label/plot bounds within 2 CSS px where meaningful; visual inspection additionally confirms no blank charts, clipping, overlap, or unreadable labels. If the metric cannot be applied, the exact reason and alternative are submitted for Lead Developer decision, not silently waived.
- Standalone HTML opens as a self-contained local file with networking disabled. Desktop security regression observes zero attempted external requests/navigation for hostile content; both active preview contexts remain opaque-origin with exactly `allow-scripts`, deny parent/bridge/application privilege, and preserve sanitizer/CSP behavior.
- HTML/desktop interactions, responsive resize, repeated chart lifecycle cleanup, complete tables, truthful title/description/null/DateTime accessibility metadata, keyboard/pointer/touch coverage, and print output are rechecked in the integrated build. A focused manual accessibility review is documented; no formal certification is claimed unless actually performed.
- PDF reports are generated and raster-inspected at A4; searchable narrative/title/description/table text, report identity/footer, fonts, page breaks and flow are preserved. Static charts are offline, legible, nonblank and independent of browser presentation state. Existing PDF destination atomicity is verified for the chart-render failure seam.
- The actual Linux packaged worker/resources are verified if available. Native Electrobun GUI/install/launch, other operating systems/architectures, and other browser engines are each separately reported as passed, failed, unavailable, or not run; bundle, worker, RPC and Chromium results are never presented as substitutes.
- An end-to-end bounded-data profile records chart/point/row counts, HTML chars, worker bytes, timings and PDF pages/raster results, including a meaningful case beyond the existing 5,000-point probe if feasible. Existing 8,000,000-character HTML and 32,000,000-byte worker caps are unchanged; tested counts do not become product limits without approval.
- Root build, full root suite, focused renderer/PDF/CLI/model/example tests, desktop RPC/worker/UI/typecheck/build, Help UI and package checks are run where available with exact results. The Sprint 063 desktop data-editor timeout is reproduced/recorded accurately if it recurs; it is not reported passing and is not repaired as unrelated work without direction.
- Current report documentation and bundled searchable Help accurately describe interactive offline HTML/desktop charts, static PDF charts, complete data tables, and the verified compatibility boundaries. Representative current examples/outputs are runnable and aligned with docs. No new AMX syntax, DOCX chart claim, or platform/accessibility certification is introduced.
- DOCX implementation/output remains unchanged baseline regression only. No product feature scope, release/version/manifest, public package, native installer certification, or publication is added.
- Builder evidence contains exact commands, environment, test totals/skips, screenshots/raster/text/font/package artifacts, visual/size metrics, documentation changes, all residuals and unavailable checks. Planning state/decisions/questions request a separate Lead Developer final V0.10 disposition.
- The Lead Developer explicitly records V0.10 as accepted, accepted with named residuals, or still pending. Builder/Sprint completion alone does not self-accept V0.10 and does not authorize release/publication.

## Required Integrated Regression Set

1. Shared-model-to-HTML/desktop and shared-model-to-PDF integration for all four chart kinds and representative input forms.
2. Mixed units, DateTime, order/duplicates, negative/zero, null/empty/partial data, grouped series, all source rows/tables.
3. Offline standalone chart runtime and adversarial preview network/privilege regression.
4. HTML interactions, cleanup, print, accessible descriptions/table and desktop preview freshness.
5. PDF searchable text, A4 raster appearance, fonts, page flow, static state and atomic failure.
6. Matched cross-surface visual metric/inspection and bounded end-to-end workload.
7. Root/desktop/focused suites, package/worker evidence, documentation/help/example checks.
8. Existing unpassed timeouts, native-platform gaps, formal accessibility and other residuals retained with exact statuses.