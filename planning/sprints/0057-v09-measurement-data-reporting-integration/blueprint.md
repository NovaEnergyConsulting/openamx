# Sprint 057 Blueprint: Measurement Data and Reporting Integration

## Approach

1. Confirm Sprint 056 **COMPLETE / APPROVED** and review its evidence, runtime measurement descriptor and registry interfaces. Preserve its Windows extension-host result (15 pass/5 fail) and unrelated full-worktree whitespace finding as unpassed residuals; do not edit the unrelated writing file.
2. Read the approved external-data/report contract and Sprint 051 contract appendix. Audit JSON/CSV input parsing/validation, output serialization, data inspection/schema generation, desktop data editor/worker/RPC, report preparation/snapshots, tables/charts, HTML/PDF/DOCX adapters, error aggregation, and relevant tests.
3. Map runtime measurement data to external/schema data without dropping metadata. Define conversion helpers at existing IO boundaries that preserve displayed value, visible unit expression, unit scale, vector/base identity, and declared/compound factors. Keep serialization independent of a duplicated unit registry; use the checked entry-visible registry.
4. Implement JSON parsing for exact `{value, unit}` measurement objects, including existing supported nesting through records/lists/nullables. Reject numeric primitives for measurement-typed fields, malformed object shapes, unknown fields per existing schema rules, non-finite values, invisible units, and vector mismatch. Preserve existing file-backed input behavior and aggregate/fail-fast modes.
5. Implement CSV scalar parsing for measurement cells (`number unit-expression`) while retaining current flat record-list CSV shape and header/row diagnostics. Use the approved restricted unit-expression parser; do not evaluate AMX from the cell. Test signed values, whitespace, compound products/divisions, parentheses, integer powers, and malformed/unknown forms.
6. Implement serialization:
   - JSON always emits the exact `{ "value": n, "unit": "..." }` shape for measurements, including nested supported values.
   - CSV emits one scalar text cell with displayed value plus canonical/declared unit expression.
   - Preserve a lossless declared-factor spelling when available; otherwise use approved canonical base-unit spelling/value.
   - Test exact round-trip physical value, dimension identity, scale, and display meaning.
7. Extend schema building and external input/output inspection to expose measurement dimension/unit expectations from Sprint 055/056. Cover both file-backed runtime loading and direct/non-file-backed desktop inspection/data-editor paths. Ensure registry preparation does not execute source statements or load a module twice.
8. Extend tables so each measurement cell uses its own chosen display unit and meaningful scalar text. Preserve null behavior, authored labels, row order, source identity, and snapshot isolation.
9. Extend charts:
   - choose the first non-null unit independently for each compatible relevant axis/series
   - normalize all non-null values to that unit for rendering and chart-data tables
   - append `(unit)` to bar/column/line series labels and to scatter axis headings
   - retain row and point ordering and authored category/group labels
   - reject incompatible dimensions with the approved diagnostic/source location
   - for empty/all-null data, keep authored labels without a unit and preserve renderer-specific existing empty/null outputs; never invent a unit.
10. Extend HTML/PDF/DOCX table/chart rendering while preserving approved differences: empty tables/header-only behavior, empty-chart SVG/`No data` differences, HTML/PDF blank null cells, DOCX `(null)`, report ordering/identity, emitted snapshots, and export atomicity.
11. Test invalid JSON pointers and CSV row/field locations in aggregate and fail-fast modes; test visible-unit resolution, missing declarations, dimension mismatch, bare numeric input, corrupt shapes, round trips, schema visibility, chart normalization/labels, and all three report formats.
12. Run focused IO/schema/desktop data editor/report/chart tests, applicable Sprints 052-056 regressions, root build/tests, and affected desktop/extension checks. Record exact Windows host/RPC statuses, including known residuals, without calling failing suites passing. Run `git diff --check` on Sprint 057-owned paths; if repository-wide check flags the known unrelated writing-file whitespace, record it and leave that file untouched.
13. Update Sprint 057 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with implemented data shapes, tests/results, residuals, and a requested separate Lead Developer disposition.

## Files to Update

- Runtime input/output/schema inspection and external unit-text parsing, as directly required
- Desktop data editor, worker/service/RPC schema inspection paths as directly required
- Report preparation, chart/table presentation, HTML/PDF/DOCX renderers and adapters as directly required
- Focused tests and minimal fixtures for nested JSON, CSV cells, and report output
- `planning/sprints/0057-v09-measurement-data-reporting-integration/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

Do not implement broad Sprint 058 docs/help/editor parity.

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| JSON scalar measurement | `{ "value": 10, "unit": "meter" }` loads only when `meter` is visible and dimension-compatible. |
| Bare external number | Rejected for a measurement field with `AMX4005`; no implicit unit. |
| Nested JSON | Measurements round-trip inside supported records/lists/nullables without shape loss. |
| CSV measurement | `10 meter` and approved compound unit expressions parse as scalar cells in the existing flat record-list structure. |
| Restricted unit text | Only visible unit names, multiplication/division, parentheses, and signed integer powers parse; arbitrary AMX syntax is rejected. |
| Round trip | JSON/CSV output and re-input preserve physical value, dimension, scale, and unit expression meaning. |
| Diagnostic locations | JSON pointer or CSV row/record/field/line/column and declaration source are preserved in aggregate/fail-fast modes. |
| Data editor/schema | Measurement constraints are available during desktop/non-file-backed inspection as well as file-backed execution, with no duplicate module evaluation. |
| Table | Each cell retains its display unit and null/header policies remain renderer-specific. |
| Chart | Compatible values normalize to first non-null unit, labels include it, values/order match expected physical data; mismatch rejects. |
| Empty/all-null chart | Existing HTML/PDF/DOCX output differences are preserved and no unit is fabricated. |
| Reports | HTML/PDF/DOCX carry values/labels without losing units, identity/order, or snapshot immutability. |

## Verification

- Focused input/output/schema, desktop data editor, table/chart, report preparation, HTML/PDF/DOCX tests.
- Exact output-shape/round-trip assertions and diagnostic path/row/field/source assertions.
- Root `bun run build` and relevant root tests; affected desktop test/typecheck/build and extension compile/host checks where available.
- Run `git diff --check` on owned paths. For a full-tree check, report any unrelated pre-existing/concurrent finding without modifying that file.

Record exact commands, test totals, generated shapes/labels, platform environment, failures and residuals in Builder evidence.

## Notes

- Sprint 055 registry and Sprint 056 measurement descriptor are the sources of truth. This sprint adds transport/presentation integration, not a new unit identity model.
- The approved Sprint 051 contract explicitly defines surface-specific null/empty behavior; preserve it rather than standardizing renderers.
- Sprint 058 owns language docs/help/migration guidance and broad completion/navigation/refactoring parity.
