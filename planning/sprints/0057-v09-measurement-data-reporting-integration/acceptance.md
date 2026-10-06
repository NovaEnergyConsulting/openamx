# Sprint 057 Acceptance Criteria

Sprint 057 is complete when:

- JSON input/output uses exactly `{ "value": finiteNumber, "unit": "visible-unit-or-restricted-expression" }` for measurements. Nested measurements work in supported records, lists, and nullable fields. Bare external numbers are rejected with `AMX4005`.
- CSV input/output supports measurement scalar text such as `10 meter` and approved compound expressions, while retaining the existing flat-record-list CSV structure.
- External unit text accepts only explicitly visible unit identifiers, `*`, `/`, parentheses, and signed integer powers. It is parsed as restricted unit syntax and never executed as AMX.
- Input validation checks finite values, exact shape, visibility, dimension compatibility, fields, and existing JSON/CSV constraints. Invalid unit text uses `AMX4004`; invalid measurement value/shape/dimension uses `AMX4005`; unrelated input diagnostics retain their existing meanings.
- Output round trips preserve physical value, dimension identity/vector, scale, and declared display meaning. Compound values preserve declared factor spelling where lossless; otherwise the approved canonical base-unit value/text is used.
- Aggregate and fail-fast input diagnostic modes are retained. JSON errors include the precise data pointer (e.g. `/0/length/unit`); CSV errors include record/field/header and row/column where available; relevant `dataFile`, `inputName`, declaration/field source, and original AMX location are retained.
- Output schema and input inspection use Sprint 055/056 metadata. Desktop schema/data-editor functionality is verified on non-file-backed inspection paths as well as file-backed runtime loading; registry discovery neither executes module bodies nor evaluates a module twice.
- Tables display each measurement in its own chosen display unit and preserve authored labels, row order, null rendering behavior, report identity, and show-time snapshots.
- Charts normalize compatible measurements to the first non-null unit independently for each axis/series. Bar/column/line labels append `(unit)`; scatter axes append `(unit)` to axis headings. Plot and chart-data-table values match normalized values and retain row/order/category identity.
- Incompatible chart dimensions reject explicitly with meaningful source locations. Empty and all-null data preserve the exact approved renderer-specific behavior and never fabricate a unit or unit label.
- HTML, PDF, and DOCX report output retains measurement meaning without dropping units or changing snapshot ordering, identity/source order, null/empty policies, or export atomicity.
- Focused tests cover nested JSON, CSV text, compound unit expressions, round-trip shapes/scales/vectors, schema/data-editor inspection, diagnostic locations, tables/charts, normalization/labels, empty/null behavior, and all report formats.
- Sprint 056 measurement expression behavior and Sprint 055 identity/registry behavior are consumed without redefining them. Broad Sprint 058 documentation/help and editor parity remain unclaimed.
- Root and relevant desktop/extension verification is recorded accurately. Sprint 056's Windows extension host result (15 pass/5 fail) remains unpassed, and the unrelated full-worktree whitespace finding is not modified or represented as passing. `git diff --check` passes for Sprint 057-owned paths; repository-wide findings are transparently recorded.
- Builder evidence and planning state/decision/question records document exact output shapes, commands/results, changed files, residuals, and a separate Lead Developer disposition request.

## Required Regression Set

1. Valid JSON measurement and rejection of bare number, malformed object, non-finite value, unknown/invisible unit, and incompatible dimension.
2. Nested JSON measurements across supported records/lists/nullables.
3. Valid CSV unit cells and compound expressions; malformed/unknown/invisible unit and invalid number locations.
4. Canonical/lossless compound-unit serialization and round-trip physical value/dimension/scale.
5. JSON pointer and CSV row/record/field/column diagnostics in aggregate and fail-fast modes.
6. Desktop input/output schema and data-editor inspection before loading, on non-file-backed paths, without duplicate module execution.
7. Table cells preserve individual units; null/empty behavior in HTML/PDF/DOCX matches approved policy.
8. Chart first-non-null normalization, exact labels/values, category/row order, dimension mismatch, and empty/all-null behavior.
9. HTML/PDF/DOCX measurement text and chart/table output preserve report snapshots and source ordering.

Sprint acceptance does not establish broad editor parity or integrated V0.9 completion.
