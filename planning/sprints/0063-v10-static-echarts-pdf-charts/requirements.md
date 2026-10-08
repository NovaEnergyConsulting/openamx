# Sprint 063 Requirements: V0.10 Static ECharts PDF Charts

## Goal

Replace the custom chart SVG builder in the existing pdfmake report adapter with static ECharts SVG generated from Sprint 061's shared chart model. Preserve PDF report structure, searchable narrative/data, identity, page flow, complete chart tables, destination validation, and atomic writes while making chart kinds, units, nulls, and appearance faithful to the approved chart contract.

## Dependencies and Entry Gate

- Sprint 061 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by separate Lead Developer disposition dated 2026-10-07. It owns the stable chart model and exact root ECharts `6.1.0` dependency.
- Sprint 063 depends on Sprint 061, not Sprint 062. The V10 plan allows it to proceed independently; final cross-surface acceptance still requires both Sprints 062 and 063 through Sprint 064.
- Sprint 062 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS** (2026-10-08). Its no-network sanitizer and preview sandbox evidence does not establish PDF behavior. Do not change its HTML/desktop code in this sprint.
- Consume `createChartViewModel(emission, report.identity)` from `src/renderer/chartModel.ts`; it is the sole source of chart meaning, values/order, axis/unit metadata, complete table, theme, and empty state. Do not create another data adapter in the PDF renderer.
- Sprint 060's isolated ECharts `6.1.0` Bun SSR + pdfmake `0.3.11` probe passed for five fixture SVGs and actual PDF visual inspection, but only for the tested SVG subset and Linux host. It is feasibility evidence, not production integration or platform certification.
- Preserve residuals and exact boundaries from Sprint 060/062: raw ECharts SVG identifiers vary across renders; cross-surface visual tolerance and >5,000-point end-to-end bounds remain unmeasured; native Electrobun window/install/launch and other browser/OS results remain unavailable; public chart-render failure diagnostics remain unverified.
- Inspect and preserve current worktree changes before editing.

## Inputs

- `planning/plan-openamxV10MasterSprintPlan.md`, Sprint 063 and cross-surface acceptance scope
- Sprint 060 approved contract, `builder-evidence.md`, tested SVG subset, and disposition
- Sprint 061 `builder-evidence.md`, `src/renderer/chartModel.ts`, and focused model tests
- Sprint 062 Builder evidence/disposition for current shared HTML/theme and explicit residuals; no HTML/desktop changes are authorized here
- `src/renderer/reportPdf.ts`, `src/runtime/pdfDestination.ts`, CLI/desktop PDF callers, PDF fonts/resources, and existing PDF/presentation/atomicity tests

## In Scope

- Replace the custom PDF `chartSvg`/independent chart-row interpretation with static ECharts server-side SVG generated from the shared chart model and the exact ECharts `6.1.0` dependency.
- Use the Bun-compatible ECharts SSR SVG API empirically tested in Sprint 060 (SVG renderer, SSR mode, explicit dimensions, static/no-animation configuration); dispose each instance on success or failure.
- Render all existing kinds faithfully: horizontal bar, vertical column, line, and scatter; preserve scalar/record inputs, mappings, multiple series/groups, first-seen order, duplicates, negative/zero values, DateTime, and independently named unit axes.
- Preserve line null gaps and scatter omission of null-coordinate plotted points while retaining every captured source row and all existing headings in the searchable PDF data table. Empty/all-null charts use the shared `No data` state without fabricated values or units.
- Use the model's title, description, theme, axes, units, identities, dimensions, and table rows/headings. Static PDF must render the full captured data independently of browser legend/zoom state; do not reuse or serialize interactive presentation state.
- Integrate the static SVG into the existing pdfmake document definition while preserving searchable narrative, source, report identity, metadata, footer, tables, page breaks, page margins, and pagination behavior.
- Fit chart SVG to the existing available report content width and page flow without clipping labels/legends, overlapping other report content, or distorting chart proportions. Use the approved model dimensions and Sprint 060 PDF sizing proposal as the baseline; document any necessary destination-specific geometry explicitly.
- Preserve existing Roboto font/resource handling and offline generation. Test actual text/axis/legend appearance and PDF raster output; successful ECharts serialization or pdfmake byte generation alone is insufficient.
- Preserve PDF destination validation, no-symlink/regular-file checks, input conflict checks, and atomic destination replacement. Any chart-render failure must surface an error and leave an existing destination byte-identical with no temp-file residue.
- Establish a focused test seam for a valid chart-render failure and user-facing error behavior if feasible within the existing module design. Do not silently substitute a blank chart or success-looking fallback. If a new diagnostic code/API is needed, obtain Lead Developer direction before changing public diagnostic semantics.
- Extend existing PDF renderer, CLI PDF, presentation, and desktop worker/RPC tests for chart fidelity, searchable content, static/empty states, visual rendering, and failure atomicity. DOCX tests are unchanged baseline regressions only.
- Record the actual supported SVG elements/features emitted by the production shared model and any pdfmake restrictions observed. Keep generated SVG inside the empirically tested safe subset or request direction before adding new rendering technology.

## Out of Scope

- HTML chart rendering, browser runtime embedding, desktop preview, sanitizer/CSP/sandbox changes, interaction or offline HTML work; Sprint 062 owns these and is already dispositioned.
- New PDF engine, browser-based PDF, canvas/raster-only replacement, report redesign, or pagination rewrite.
- DOCX chart rendering or improvements; DOCX remains explicitly excluded and is only an unchanged baseline regression.
- Changes to AMX syntax/evaluation/chart validation, chart model/theme meaning, measurement normalization, data ordering, report preparation, table semantics, or source snapshots.
- New chart kinds, author-facing ECharts options/theme controls, external resources, remote fonts, or network access.
- Increasing HTML/worker output limits, general performance optimization, legal/distribution determinations, release publication, installer/native certification, or cross-platform claims.
- Broad accessibility audit or the final visual parity disposition; provide static PDF evidence for Sprint 064 without claiming its integrated acceptance.

## Constraints

- Call the shared model using the prepared report identity/accent; do not duplicate extraction of chart rows, axes, groups, measurements, or table headings.
- Use actual ECharts server-side SVG, not custom SVG and not HTML/browser interaction state. PDF has static complete captured data and no widgets.
- Do not mutate the shared model, emission, option arrays, measurements, report, or table to prepare PDF options. Apply renderer-specific static settings in a non-mutating manner.
- No network/URL asset access. Keep pdfmake's existing URL-access denial and local-font allow-list in force.
- Respect the tested SVG subset: path/rect/circle/text/defs/clipPath/generated styles/matrix transforms. Do not assume gradients, filters, patterns, images, or other features are supported by evidence; detect and report any production output requiring them.
- Raw ECharts `zrN` identifiers make serialized SVG/PDF bytes differ across runs. Do not assert byte-identical SVG/PDF unless a deterministic, structurally safe solution is demonstrated. Compare normalized semantics/rendered pages; do not rewrite XML identifiers with ad-hoc regex.
- Chart-rendering and pdfmake errors must not become a successful placeholder. Keep atomic writing unchanged and prove pre-commit failure does not replace existing output.
- Report exact commands, host/runtime/tool versions, SVG/PDF artifacts, raster inspection, test counts, warnings, and unavailable host checks. A Linux worker/RPC test is not native desktop launch or cross-platform certification.