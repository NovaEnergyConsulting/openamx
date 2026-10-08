# Sprint 063 Acceptance Criteria

Sprint 063 is complete when:

- PDF charts are generated as static ECharts SVG using exact root `echarts@6.1.0` server-side SVG rendering and the shared `createChartViewModel`. The independent custom PDF chart-row/SVG builder is removed from the chart path.
- Shared chart meaning, theme, unit descriptors, axes, labels, group/series order, empty-state metadata and full data table are not independently reinterpreted by PDF code. The prepared report identity/accent is passed to the shared model.
- Every existing kind (`bar`, `column`, `line`, `scatter`) is visually correct and represented with the approved orientation, source order, duplicate preservation, series/groups, negative/zero values, DateTime UTC labels, separate measurement axes, null gaps and scatter null-coordinate omission.
- Complete chart source rows and headings remain searchable in the PDF table, including source rows omitted from plotted scatter points. Empty/all-null charts show the approved `No data` treatment without fabricated units/points and keep data-table headings.
- ECharts SVG is generated with explicit static dimensions, animation disabled, no remote assets, and only the empirically supported subset. Every ECharts instance is disposed on successful rendering and all error paths; multiple charts do not leak or share state.
- Static PDF output is independent of any browser legend toggle/zoom state. It contains no interactive controls/widgets and does not depend on Sprint 062 browser runtime or iframe configuration.
- The existing pdfmake report structure is preserved: searchable narrative/titles/descriptions, report identity/footer, source ordering, view ordering, table content, page breaks, A4 margins and pagination behavior. Existing font resources remain offline and expected fonts are embedded/usable.
- Actual representative PDFs are generated and rasterized/visually inspected at A4 dimensions. Charts are nonblank, legible, unclipped, correctly labeled, and do not overlap text/tables or break page flow. Byte generation and text extraction alone are not sufficient visual evidence.
- The final SVG set stays within the Sprint 060 tested pdfmake SVG feature subset, or any unsupported feature is explicitly resolved with evidence/approval before it enters production. No browser-PDF architecture, remote image/font, or new PDF engine is introduced.
- Repeated/multiple rendering yields stable chart meaning and rendered appearance. Raw SVG/PDF byte identity is not asserted while ECharts-generated identifiers vary; any identifier normalization uses structural XML handling and proves reference integrity, not broad regex rewriting.
- Chart rendering/serialization errors are surfaced without a blank/success-looking fallback. A valid chart-render failure is injected through a narrow seam if feasible; otherwise the evidence names the residual and requests explicit disposition. In every tested failure, an existing PDF destination remains byte-identical and temporary files are removed.
- Existing PDF destination validation and atomic commit semantics remain intact. CLI and desktop worker/RPC PDF exports use the shared adapter and require no network.
- Focused PDF/CLI/presentation/model regressions, root build and full tests are run as available; exact host, tool versions, commands, test totals/skips, warnings, screenshots/raster artifacts, PDF metadata/fonts, and residuals are recorded in `builder-evidence.md`.
- Sprint 062's approved HTML/desktop output, sanitizer, sandbox, interactions, and preview behavior are untouched; DOCX implementation is untouched and only baseline regression tested.
- Separate Lead Developer disposition closes Sprint 063 with recorded residuals; this does not claim Sprint 064 cross-surface acceptance, V0.10 completion, platform certification, release readiness, or publication.

## Required Regression Set

1. Production shared-model-to-PDF SSR integration for every chart kind and supported data forms.
2. Measurement axes/units, DateTime, source ordering, duplicate labels/coordinates, negative/zero, null gaps, and empty/all-null states.
3. Complete/searchable table and narrative content, identity/footer, order/page-break/header behavior.
4. Actual PDF raster inspection, labels/legends/font availability, page fit, no clipping/overlap.
5. Multiple/repeated ECharts SSR instance disposal and stable visual semantics despite raw generated-ID variance.
6. Render/serialization failure diagnostics and existing destination atomicity.
7. CLI and desktop worker/RPC PDF path; no external resource use.
8. DOCX unchanged baseline and root build/full test results.

## Lead Developer Disposition

**COMPLETE / APPROVED WITH RECORDED RESIDUALS (2026-10-08).** The Lead Developer accepts Sprint 063 and closes it. The desktop data-editor timeout in the full root suite remains unpassed as recorded in `builder-evidence.md`. This closeout does not claim Sprint 064 integrated acceptance, V0.10 completion, native desktop launch, platform certification, release readiness, or publication.