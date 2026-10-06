# Sprint 057 Requirements: Measurement Data and Reporting Integration

## Goal

Integrate Sprint 056 measurement values and Sprint 055 unit registries into external JSON/CSV input and output, schema inspection, desktop data-editor surfaces, tables, charts, and HTML/PDF/DOCX reports. Preserve dimensions, display units, canonical compound-unit round trips, exact diagnostics/data locations, report/view snapshot identity, and existing renderer policies for empty/null data.

Sprint 057 owns data, schema, and reporting integration. Broad cross-feature editor parity, documentation/help/migration guidance, and integrated V0.9 acceptance remain Sprint 058.

## Dependencies and Entry Gate

- Sprint 057 depends on Sprint 056, which is **COMPLETE / APPROVED** by Lead Developer disposition dated 2026-10-06.
- Sprint 056 delivers immutable measurement values with display value/unit descriptor, physical scale, Sprint 055 dimension vectors, unit factors/text, and measurement interpolation. Use this implementation and `LoadedEntryModule.registry`; do not invent another measurement representation or re-resolve identity inconsistently.
- Sprint 055 is COMPLETE / APPROVED and provides the declaration registry and exact finite SI inventory. Its Windows Extension Development Host suite result (15 pass/5 fail) remains unpassed.
- Sprint 056's Windows Extension Development Host suite result (15 pass/5 fail) and unrelated full-worktree `git diff --check` finding in `writing/2026-10-03_Computable_Documents.md` remain recorded, unpassed residuals. Do not claim those as passing or alter the unrelated file.
- Sprints 053/054 are accepted/approved but not direct dependencies. Preserve their host/RPC residuals as historical evidence without turning them into Sprint 057 gates unless a concrete integration blocker is found.
- `docs/language-spec-v0.9.md`, the approved Sprint 051 technical contract, and the master sprint plan are authoritative for data shapes, unit expression grammar, diagnostics, and rendering. Record any conflict in `planning/questions.md` and obtain Lead Developer direction before changing behavior.
- Inspect current worktree and preserve unrelated/user-owned changes.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Sprint 057 scope and dependency sequence
- `docs/language-spec-v0.9.md`, especially external data, JSON/CSV shapes, unit-expression validation, table/chart behavior, and renderer policies
- Approved Sprint 051 contract appendix: canonical unit expression rules, diagnostics/source locations, schema/registry requirements, chart normalization/labels, empty/all-null outputs, and cross-surface audit
- Sprint 055/056 requirements, blueprints, acceptance criteria, Builder evidence, SI library/registry, and Lead Developer dispositions
- Existing runtime input/output/schema code, module registry entry path, desktop inspection and data-editor schema/worker/RPC paths, report preparation, HTML/PDF/DOCX renderers, chart/table code, and relevant tests

## In Scope

- Accept JSON measurements using exactly `{ "value": finiteNumber, "unit": "unit-or-restricted-expression" }`. Support measurements nested in existing supported records, lists, and nullable fields. Reject bare numeric values where a measurement is required; never infer/attach a unit silently.
- Accept CSV measurement cells as text such as `10 meter` or approved compound unit expressions. Extend the existing flat record-list CSV contract only; do not introduce nested CSV records.
- Parse external unit text using the approved restricted grammar only: explicitly visible unit identifiers, multiplication/division, parentheses, and signed integer powers. Never evaluate arbitrary AMX/source code from external values.
- Validate unit visibility against the checked entry-visible registry, dimension compatibility against field/type annotations, finite numeric values, object shape/field validity, and existing JSON/CSV schema constraints.
- Preserve serializer round-trip fidelity for display values and unit expression/scale/dimension. Compound measurements without a lossless declared-factor spelling serialize in the approved canonical base-unit representation/value; read-back must preserve the physical value and dimension.
- Preserve established aggregate/fail-fast input diagnostic modes. Use approved `AMX4004` for malformed/unknown/not-visible external unit text and `AMX4005` for invalid external measurement values/shapes/dimensions. Keep existing codes/behavior for unrelated input errors.
- Provide exact external locations and relevant source context: `dataFile`, JSON pointer such as `/0/length/unit`, CSV record/field/header and physical line/column where available, input name, and AMX declaration/field source. Preserve one-based AMX locations and original source offsets.
- Extend output inspection/schema generation and data-editor inspection/validation to expose measurement fields and unit constraints, including non-file-backed execution and UI inspection paths—not only runtime loading of file-backed input. Use the Sprint 055 registry without executing source modules twice or loading data during registry discovery.
- Render meaningful measurement values in tables and text/report surfaces while preserving each table cell's chosen display unit.
- Normalize compatible chart measurements to the first non-null unit for the relevant axis/series. Label bar/column/line series with the unit in parentheses; label scatter axes with their unit. Apply normalized values consistently to plots and tabular chart data without changing row order, source identity, or authored category/group labels.
- Reject incompatible measurement dimensions in the same relevant chart axis/series. Preserve the approved empty and all-null policies exactly: do not synthesize a unit or normalize to a fabricated display unit where no non-null value exists.
- Extend HTML, PDF, and DOCX renderers with measurement-aware table/chart values while retaining each renderer’s existing empty/null representation, report identity/source order, show-time snapshots, and export atomicity.
- Add focused tests for JSON/CSV input/output, nested shapes, unit expressions, schemas and data-editor inspection, diagnostic paths/locations, table cells, chart scaling/labels/order, empty/all-null outputs, snapshots, and HTML/PDF/DOCX surfaces.
- Record exact implementation and changed files, command/test results, artifact/output shapes, diagnostics and residuals in Sprint 057 Builder evidence and planning state/decision/question records.

## Out of Scope

- Measurement grammar, arithmetic, conversion, aggregates, runtime representation, or measurement text interpolation (Sprint 056 is complete; consume its value contract).
- Dimension/unit declaration changes, base identity/vector semantics, SI inventory changes, or new module/package resolution (Sprint 055 is complete).
- Offset/affine units, decimal/exact arithmetic, imperial/customary units, arbitrary SI prefixes, bare-number unit inference, or arbitrary code execution in external data.
- Nested CSV structures, a new general serialization format, or changing existing JSON/CSV schema behavior unrelated to measurements.
- Broad editor navigation/rename/references/outline/completion/coloring parity, compatibility/migration docs, bundled help, examples overhaul, or integrated V0.9 acceptance; Sprint 058 owns these.
- Renderer unification that changes approved surface-specific empty/null output; new chart types or unrelated visual redesign.
- Repairing accepted Windows host/RPC residuals or unrelated `writing/2026-10-03_Computable_Documents.md` whitespace. Do not alter unrelated user files to make full-worktree checks green.

## Constraints

- Use exactly the approved JSON measurement object shape and CSV scalar text form. Bare external numbers never acquire units implicitly.
- Unit expressions from data are a restricted parser input, not executable AMX. Only visible units and the approved operators/parentheses/signed integer powers are valid.
- Round-trip values must preserve physical meaning, dimension identity, scale, and selected display-unit spelling/factors according to the approved serializer rules.
- Unit/dimension visibility uses explicit imports and the checked entry-visible registry. Do not expose every library unit globally.
- Keep JSON nested shapes within existing supported data structures; preserve flat-record-list CSV semantics.
- Keep diagnostics explicit and location-rich. Aggregate mode returns every safely collectable input diagnostic; fail-fast returns the first. Do not return success-shaped fallback data for malformed measurements.
- Table cells preserve their own units. Chart normalization is per relevant axis/series and uses the first non-null display unit; an all-null/empty axis retains its authored label without a unit suffix.
- Preserve renderer-specific existing empty/null rules: HTML/PDF blank null cells, DOCX `(null)` text; empty-chart distinctions remain as approved in Sprint 051. No unit is fabricated.
- Preserve view/report snapshot ordering and immutable snapshot behavior; later mutation of source lists or values cannot rewrite an emitted view.
- Build/use schema metadata without duplicate module evaluation, arbitrary execution, or duplicate input loading. No exported/exposed measurement schema may silently drop dimension information.
- Report all extension/desktop host checks and existing residuals accurately. Do not mark the unrelated full-worktree diff-check issue as a Sprint 057 pass or fix it outside scope.
