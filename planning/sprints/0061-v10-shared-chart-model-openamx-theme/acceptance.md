# Sprint 061 Acceptance Criteria

Sprint 061 is complete when:

- The root application resolves the exact approved `echarts@6.1.0` dependency from the updated root manifest and lockfile. There is no duplicate desktop-only ECharts dependency and no legal/distribution conclusion beyond recorded license/notice inventory.
- A single pure shared chart-model adapter converts captured immutable `ChartViewEmission` data into typed ECharts options and accompanying complete data/metadata for every existing chart kind: `bar`, `column`, `line`, and `scatter`.
- Scalar-list and record-list data, declared/fallback labels, field mappings, multiple series, scatter grouping, titles/descriptions, headings, and chart data are represented without changing the AST/runtime contract or exposing raw ECharts configuration to AMX.
- Captured row/emission order is preserved. Duplicate categories, DateTime/numeric x coordinates, scatter coordinates, and records remain distinct; no sorting, aggregation, deduplication, or source mutation occurs.
- `bar` options render horizontal categories with the first source row at the top; `column` renders vertical categories. Negative and zero values are retained. Null values are not coerced to zero.
- Line charts retain numeric/DateTime x order and duplicate timestamps; null y values remain gaps. DateTime presentation metadata specifies UTC ISO values while retaining the captured timestamp/source representation.
- Measurement charts use already-normalized display values and retain per-series unit identity/text and dimensional metadata. Different normalized units receive separately named axes; scatter x/y units are independently represented. No title/legend/axis implies a false common unit.
- Scatter charts produce series in first-seen group order, preserve point order/duplicates, omit null-coordinate points only from plotted series, and retain their source rows in complete table data.
- Empty, all-null, and partially populated cases retain headings and full source data, provide the approved `No data` state where appropriate, and fabricate no value, unit, axis semantics, or plotted point.
- The model carries complete ordered table rows/headings independently of plot filtering, legend state, or viewport state. Converting the same frozen emission repeatedly is stable and does not mutate the emission or nested data.
- Shared defaults define the approved dimensions/layout basis, axes, grid, typography fallback, deterministic palette/color assignment, restrained resolved-report-accent usage, and static-compatible animation defaults. Tests cover repeatability, at least the existing palette entries and deterministic extension behavior, and accent fallback/contrast constraints.
- The model provides truthful title/description/accessibility metadata and complete-table linkage inputs; it does not expose ECharts' inaccurate generated ARIA summary for null or DateTime as the accessible description.
- Focused tests assert generated options/data rather than relying solely on text snapshots. Relevant existing HTML/PDF/presentation/DOCX baseline tests pass without production renderer integration in this sprint.
- `bun run build`, focused tests, relevant regression tests, and full `bun test` are run when available; exact results, skips/failures, versions, and changed files are recorded in Sprint 061 Builder evidence. Any unavailable gate remains explicit.
- Production HTML/PDF output adapters, desktop preview/sandbox, iframe permissions, report preparation, measurement normalization, worker/output limits, AMX semantics, and DOCX implementation remain unchanged. The Sprint 060 navigation, packaging, accessibility, and performance residuals remain unpassed unless directly resolved by authorized evidence in their owning scope.
- Builder evidence and planning records request a separate Lead Developer disposition. The Builder does not self-accept Sprint 061 or claim HTML/PDF/desktop integration, V0.10 acceptance, platform certification, or release readiness.

## Required Regression Set

1. All four chart kinds, scalar/record forms, labels/mappings, multi-series/grouped data, and title/description metadata.
2. Source-order and duplicate preservation for category, numeric/time, and scatter data.
3. Numeric and DateTime line axes, UTC ISO presentation metadata, normalized mixed-unit axes, and scatter x/y units.
4. Negative/zero values, null line gaps, omitted plotted scatter null coordinates with complete table retention, empty/all-null/partially empty data.
5. Frozen-emission immutability and deterministic model/theme output.
6. Existing HTML/PDF/presentation and DOCX baseline regression checks; no ECharts surface integration is inferred.
7. Root build and full test result with exact host/tool versions and residuals.

Production iframe scripts remain disabled. This sprint cannot waive the Sprint 060 no-unapproved-network failure.