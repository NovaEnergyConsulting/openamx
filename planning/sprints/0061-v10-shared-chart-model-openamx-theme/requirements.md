# Sprint 061 Requirements: V0.10 Shared Chart Model and OpenAMX Theme

## Goal

Implement the shared adapter from captured `ChartViewEmission` data to typed ECharts options and stable OpenAMX visual defaults. Preserve existing chart meaning, ordering, normalization, null behavior, and immutable snapshots so Sprints 062 and 063 can consume one chart model without independently reinterpreting AMX data.

This sprint implements the shared model and its focused regression tests. It does not replace HTML or PDF renderers and does not enable ECharts in the desktop preview.

## Dependencies and Entry Gate

- Sprint 060 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by Lead Developer disposition dated 2026-10-07. Sprint 061 is explicitly authorized.
- Use the approved ECharts `6.1.0` implementation baseline and proposed shared root production dependency placement. Add the exact dependency to root metadata/lockfile only as required to implement and type-check this shared model. Do not install a second desktop-only ECharts copy.
- The approved Sprint 060 contract is recorded in `planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/blueprint.md`; Builder evidence and residual statuses are in `builder-evidence.md`.
- The V0.10 master plan remains authoritative. Do not alter AMX syntax, chart evaluation/validation, measurement behavior, report preparation, captured data, or view emission ordering.
- Sprint 060's no-unapproved-network gate failed because hostile links and meta refresh initiated navigation from the opaque script-enabled fixture. **Production preview iframe scripts must remain disabled.** Sprint 061 must not edit iframe sandbox attributes, add a trusted script bootstrap, or claim this security residual is resolved.
- The unavailable Electrobun package test, inaccurate ECharts generated ARIA for null/DateTime, raw SVG generated-ID variance, unmeasured cross-surface visual tolerance, 5,000-point-only performance envelope, untested pointer/keyboard/touch behavior, and unavailable public chart-render failure injection remain residuals. This sprint does not recast them as passes or take over their owning integration/acceptance work.

## Inputs

- `planning/plan-openamxV10MasterSprintPlan.md`, Phase 2 Sprint 061 and confirmed chart scope
- Sprint 060 `requirements.md`, `blueprint.md`, `acceptance.md`, `builder-evidence.md`, and Lead Developer disposition
- `src/runtime/environment.ts` (`ChartViewEmission` and `ViewDataValue`), `src/ast/types.ts` chart declarations/options, and `src/runtime/measurement.ts`
- Existing chart flattening and normalization references in `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, and `src/renderer/reportPreparation.ts`
- Existing renderer, PDF, presentation, CLI, and DOCX regression tests

## In Scope

- Add one production shared chart-model module that accepts immutable captured chart emissions and produces typed ECharts option/model data for all existing kinds: `bar`, `column`, `line`, and `scatter`.
- Support scalar-list and record-list data, declared labels, record field mappings, multiple series, scatter groups, titles/descriptions, headings, units, and stable row/series/group identities. Do not add raw ECharts configuration to AMX or expose arbitrary author-supplied options.
- Preserve source/emission order and duplicate category labels, timestamps, coordinates, rows, and points. Do not sort, aggregate, deduplicate, or mutate emissions.
- Implement the approved kind-specific behavior:
  - `bar` is horizontal, with first source row displayed at the top; retain zero and negative values.
  - `column` is vertical; retain category order and null gaps.
  - `line` retains numeric or DateTime x values in captured order, including duplicate/out-of-order timestamps; null y values remain gaps. Display DateTime labels/tooltips as UTC ISO values.
  - `scatter` preserves first-seen group order and duplicate coordinates; points with null x or y are omitted from plotted series while remaining in the complete source/table data model.
- Preserve existing per-series measurement normalization and dimensional metadata. Place independently normalized display-unit series on separately named value axes; scatter x/y units are identified independently. Axis names, series names, and model metadata must not imply a false shared unit.
- Define a structured chart model that retains the complete captured tabular data independently from plotted points, legend visibility, and viewport state. Empty/all-null data must not acquire fabricated values, points, or units; preserve headings and the approved `No data` presentation metadata.
- Define stable shared ECharts defaults: dimensions/viewBox basis, axes, grid/legend/label defaults, deterministic first-seen series/group color assignment, typography fallback, animation policy, and restrained report-accent usage. Use existing OpenAMX report identity accent and established renderer palette as the starting point; do not add author-facing theme settings.
- Supply custom accessibility metadata (title, description, and complete-data table linkage/summary inputs) suitable for later surface adapters. Do not use ECharts' inaccurate generated null/DateTime ARIA summary as the accessible description.
- Keep common chart meaning/theme separate from destination settings so Sprint 062 can add interactive browser behavior and Sprint 063 static PDF rendering without reinterpreting data.
- Add focused tests for chart model/options and preserve existing HTML/PDF/DOCX behavior in regression tests. Tests must prove immutability, ordering, normalization, null/empty semantics, duplicate preservation, and stable option/theme output.
- Add exact root production dependency `echarts@6.1.0` and update the root lockfile as needed. Record actual direct/transitive placement and third-party license/notice file locations; do not make legal conclusions. No desktop package/resource integration is claimed in this sprint.

## Out of Scope

- Replacing the custom chart renderer in HTML, PDF, or DOCX; embedding browser runtime/assets; desktop preview changes; or ECharts SVG/PDF serialization.
- Enabling scripts in either desktop iframe, changing CSP/sandbox settings, sanitizing navigation, or otherwise claiming the Sprint 060 network-navigation residual is fixed.
- Desktop package/resource resolution, packaged Electrobun/native verification, standalone HTML offline verification, cross-surface screenshots, browser interactions, or user-facing accessibility/print acceptance; these belong to later integration/acceptance sprints.
- Fixing the valid chart-render failure injection/diagnostic gap, SVG generated-ID byte variability, broad performance/size bounds, or platform certification.
- New chart kinds, AMX syntax/options, parser/typechecker/runtime changes, normalization changes, source-data mutation, new author styling controls, report redesign, or changes to tables/report preparation.
- DOCX chart work. Existing DOCX tests remain baseline regressions only.
- Changing existing HTML/worker output limits, PDF engine/architecture, atomic export semantics, or using a candidate other than the approved ECharts `6.1.0` baseline without renewed Lead Developer direction.

## Constraints

- Treat a captured `ChartViewEmission` as immutable input. Preserve emission/source order and exact values; chart presentation must be a derived model only.
- Keep the model typed against ECharts `6.1.0` options and internal OpenAMX chart contracts. Do not leak ECharts types into AMX AST/runtime APIs or author-facing syntax.
- Keep measurement-unit descriptors and full table/source values available alongside numeric plotted coordinates. Convert only as needed to the already-normalized display values; do not redo unit normalization in the adapter.
- Assign chart colors deterministically by first-seen series/group order, with restrained report accent as approved; maintain stable identity independent of interaction state. Use the existing report accent contrast validation and do not invent a new theme-control API.
- Represent ECharts rendering defaults and any per-destination differences explicitly. The model must not encode interactive legend/zoom state into captured data or static export meaning.
- Preserve complete data and headings when plotting omits null scatter coordinates. Lines preserve nulls as gaps; no null-to-zero coercion.
- Keep browser bootstrap, SVG rendering, iframe security, packaged resources, and output-size changes out of this sprint. Production iframe scripts remain disabled until the untrusted-navigation path is remediated and adversarially verified in its owning sprint.
- Run focused model tests, then required root build and relevant renderer/presentation regressions. Record any failure without changing approved behavior to force a pass.
- If actual emissions contradict the approved contract or implementing it requires a scope/semantic/architecture change, stop on that issue, record a minimal reproduction, and request Lead Developer direction.