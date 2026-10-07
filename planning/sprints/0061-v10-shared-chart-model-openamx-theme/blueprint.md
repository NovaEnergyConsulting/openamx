# Sprint 061 Blueprint: V0.10 Shared Chart Model and OpenAMX Theme

## Approach

1. Confirm the clean/dirty worktree and Sprint 060 **COMPLETE / APPROVED WITH RECORDED RESIDUALS** disposition. Read its completed contract matrix and exact evidence statuses. Do not repeat or upgrade its browser/PDF/package/security probe outcomes.
2. Trace the actual `ChartViewEmission` shape from `src/runtime/environment.ts`, chart option AST types, chart snapshot creation, and measurement representation. Keep the adapter downstream of evaluation and normalization; do not alter runtime contracts.
3. Add the approved exact `echarts@6.1.0` root production dependency and define one shared chart model module (proposed path: `src/renderer/chartModel.ts`). Keep this API internal to rendering. It should provide a pure conversion from immutable emission plus resolved report identity/context into:
   - chart-kind-specific typed ECharts option data;
   - complete ordered tabular rows/headings and stable series/group identities;
   - axis/series unit metadata and value transforms already normalized by the runtime;
   - title/description/accessibility metadata and empty-state metadata;
   - shared dimensions, grid/axis/legend defaults, theme palette, and deterministic rendering defaults.
4. Implement a single model path for each existing chart form. Use structured option objects, not interpolated HTML/SVG or runtime code generation. Define destination mode only as a narrow typed setting where it changes static versus interactive ECharts behavior; do not duplicate data extraction or theme logic for HTML/PDF.
5. Apply the approved behavior exactly:
   - Bar: horizontal axis configuration; reverse the category-axis display if required so source row one appears at top; preserve values and duplicate categories.
   - Column: vertical categories, source order and null gaps.
   - Line: numeric or DateTime x, source order rather than timestamp sorting, duplicate x values, null y gaps; DateTime visible formatting uses UTC ISO while retaining original source value.
   - Measurement series: consume already-normalized display values; use separately named axes for independently normalized units; retain unit identity/text for title/axis/tooltip/accessibility consumers. Scatter x/y units remain independent.
   - Scatter: one series per first-seen group, preserving group and point order/duplicates; exclude null-coordinate points from plotted data while retaining all rows in the table model.
   - Empty/all-null: no invented values or axes units; retain headings and complete data; return the approved empty-state metadata/text.
6. Define stable palette and theme tokens using the current renderer palette as the starting series palette (`#146C94`, `#D97706`, `#15803D`, `#B42318`) and the resolved report accent as a restrained highlight. For additional series/groups, extend deterministically with colors that remain distinguishable; cover the chosen extension and contrast/fallback behavior with tests. Keep fonts as system/browser-safe defaults for options; PDF's existing Roboto integration is not owned here.
7. Add focused model tests using actual captured emissions where feasible. Cover every kind/input form, labels/mappings, multiple series/groups, captured order, duplicates, mixed unit axes, null/empty data, numeric/DateTime axes and options, non-mutation, repeated stable options, accessibility/empty metadata, and accent/color assignment. Use existing renderer/presentation tests for unchanged HTML/PDF/DOCX baselines; do not add browser or PDF adapter tests in this sprint.
8. Do not wire the model into `renderHtml.ts`, `reportPdf.ts`, desktop preview, or package resources. The existing custom outputs remain until their owning sprints. Do not enable scripts in either production iframe. The Sprint 060 external-link/meta-refresh navigation failure remains a security prerequisite for Sprint 062, not a bypassable Sprint 061 detail.
9. Record exact dependency/lock changes, tests, residuals, and changed files in Sprint 061 `builder-evidence.md`; update planning state, decisions, and questions with implementation status and any newly discovered contract conflict. Request separate Lead Developer disposition; do not self-accept.

## Proposed Shared Model Boundary

The following is an implementation boundary, not a public API requirement. Adjust names to local style while preserving responsibilities:

- **Input:** immutable `ChartViewEmission`; resolved report accent/identity; optional narrowly typed render mode if static/interactivity needs a default difference.
- **Output:** typed ECharts `option`; stable chart kind/series/group identifiers; ordered complete data rows/headings; resolved title/description; explicit axis-unit metadata; accessible summary inputs; empty-state metadata.
- **Pure behavior:** no filesystem, network, DOM, ECharts instance creation, browser globals, PDF serialization, or mutation. No HTML/JavaScript construction and no invocation of report-authored code.
- **Consumers:** Sprint 062 browser HTML/desktop adapters and Sprint 063 static PDF adapter consume this single meaning/theme model. Surface-specific geometry/animation or interaction configuration is an explicit adapter concern, never a second interpretation of source data.

Avoid a generic intermediate-chart framework. Add only the minimum typed structures needed to remove existing duplicated extraction and make approved data/unit/accessibility invariants testable.

## Focused Test Matrix

| Input/case | Required model assertions |
|---|---|
| Scalar list for each applicable kind | One-based fallback labels, exact values, order, chart orientation/type |
| Record category with mapped fields | Field mapping, labels/headings, multiple series order, duplicate categories preserved |
| Line numeric x and DateTime x | Exact source order and duplicate x retained; numeric/time axis types; UTC ISO visible-format metadata |
| Measurement-valued rows/series | Already-normalized numeric data; unit metadata preserved; distinct named axes for different display units; no false common unit |
| Scatter with groups | First-seen group series order; point order and duplicate coordinates retained; null x/y excluded from plot only |
| Null/empty/all-null/mixed series | Line null gaps; no coercion; empty metadata; no fabricated point/unit; full table rows/headings remain |
| Negative and zero values | Exact values retained; value axis includes zero-crossing behavior as required; no clamp to positive-only scale |
| Captured emissions | Frozen source object is not mutated; repeated conversion is stable; interaction-only options cannot mutate data |
| Theme and identity | Stable color by series/group order; report accent applied only in approved restrained role; deterministic typography/layout defaults |
| Accessibility metadata | Title/description and full-table association data are explicit; never adopt inaccurate library-generated null/DateTime summary |

## Files to Update

- `package.json` and `bun.lock` for exact root `echarts@6.1.0` dependency
- New `src/renderer/chartModel.ts` (or a locally justified equivalent) for the shared option/model/theme adapter
- Focused tests, preferably a dedicated `tests/chartModel.test.ts` for the new owning module plus only necessary regression additions to existing renderer/presentation tests
- `planning/sprints/0061-v10-shared-chart-model-openamx-theme/builder-evidence.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Do not modify production HTML/PDF renderers, `App.vue`, desktop sandbox/build resources, AST/runtime/typechecker, DOCX renderer, or product limits in this sprint

## Verification

- Run focused chart model tests.
- Run focused existing `tests/renderer.test.ts`, `tests/reportPdf.test.ts`, `tests/reportPresentation.test.ts`, and relevant measurement/chart tests to ensure the not-yet-integrated baseline is unchanged.
- Run `bun run build` and full root `bun test` as required by repository gate/availability; report totals and skips precisely.
- Verify the lockfile resolves the exact `echarts@6.1.0` graph and package/license files; report package/notice paths without making legal conclusions.
- Review `git diff --check` for owned paths and report all changed production/test/dependency files.
- No browser, desktop packaged, security, PDF-ECharts, offline-export, or release result is implied by these model tests. Carry those tests into Sprint 062/063/064.

## Notes

- Sprint 060's approved `6.1.0` baseline authorizes implementation evaluation and root dependency placement; it does not establish package/native integration or legal clearance.
- Sprint 060's opaque-origin navigation escape means no production script permission is authorized. A later integration sprint must prove navigation containment before enabling preview scripts.
- ECharts generated ARIA for null/DateTime is known inaccurate. The shared model must provide truthful summary inputs; later surface adapters must use them rather than default ARIA text.
- Raw SVG generated identifier variance, large-end performance, cross-surface tolerance, real Electrobun packaging, input-method behavior and public render-failure diagnostics remain open evidence boundaries.
- Sprint 061 approval does not authorize HTML/desktop or PDF renderer replacement; those are owned by Sprints 062 and 063.