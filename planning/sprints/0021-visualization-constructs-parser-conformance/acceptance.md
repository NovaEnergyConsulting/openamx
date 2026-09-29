# Sprint 021 Acceptance Criteria

Sprint 021 is complete when:

- Sprint 020 acceptance or an explicit Lead Developer disposition of its remaining desktop tooling gate is recorded before production Sprint 021 edits begin; desktop must-have scope is not silently reduced.
- Parser tests prove exact V0.4 table/chart/show syntax in executable fences, original-document locations for declarations/options, source order across blocks, inert narrative/ordinary fences, and rejection of malformed/unsupported forms.
- A positive parser and activated-type-checker regression accepts a record constructor directly in a `match` arm; existing match default placement, first-match selection, lazy evaluation, and source coordinates remain intact.
- Static checking activates for any V0.4 construct and rejects unknown/late/duplicate view or binding names, exported/imported/loop-local view declarations, invalid `show`, missing/duplicate/irrelevant options, and incompatible data/field roles before any input load, evaluation, or output write.
- Typed `RecordType[]` table fields, bar/column/line record and `Number[]` scalar forms, scatter record-only form, nullable numeric series/coordinates, `String[]` scalar labels, series order, and first-seen scatter grouping conform to `docs/language-spec-v0.4.md`. Nested/dynamic/untyped/nullable-record-list inputs are rejected.
- Runtime results retain each `show` snapshot in executable-fence and statement order, with current values at emission and no retroactive changes from later mutation; repeated shows and empty data are deterministic. The existing plain-object evaluation/CLI output contract remains unchanged for V0.3-only programs.
- Runtime-only label/value length mismatches and typed-data validation failures stop HTML and named-output writes, with actionable source/data diagnostics; input/module path containment and import evaluate-once behavior remain unchanged.
- Focused parser/checker/evaluator/loader tests and V0.2/V0.3 regression tests pass; `bun run build`, `bun test`, and `git diff --check` pass. Record exact commands, counts, limitations, and any approved clarifications in planning logs.
- Production HTML table/chart interaction, static print rendering, PDF, desktop workflows, and editor provider work remain untouched and assigned to later sprints.
