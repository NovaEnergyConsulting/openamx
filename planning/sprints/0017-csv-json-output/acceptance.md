# Sprint 017 Acceptance Criteria

Sprint 017 is complete when:

- `run` and `render` accept repeated `--output name=path` without changing their established context/HTML behavior when output options are absent.
- Mapping syntax is split at the first `=` with non-empty name/path, resolves from the process working directory, selects exact lowercase `.json`/`.csv`, and rejects unsupported/missing/duplicate names or destinations with AMX6001.
- Only an explicitly exported entry-module `let` can be selected. Private/imported values, types, functions, nonexistent names, and duplicate destinations are rejected before serialization/writing.
- JSON output supports declared finite scalars, `null`, records, and lists recursively; is UTF-8/two-space/final-LF; emits fields in declaration order; and preserves validated DateTime wire strings.
- CSV output supports exactly a typed `RecordType[]` with scalar or nullable-scalar fields, including an empty list; emits declaration-order headers, RFC 4180 cells, LF/final LF, empty unquoted nulls, and quoted empty strings.
- Scalar CSV, nested record/list CSV fields, untyped/indeterminate values, and non-finite JSON numbers are rejected with actionable AMX6001 diagnostics.
- Every requested export serializes successfully before any destination is written. Parsing/linking/checking/input-validation/evaluation/serialization errors create no output files.
- `render --out` destination conflicts with `--output` destinations are rejected. After serialization, render writes HTML first and export files in option order; a write failure is AMX6002 and may leave earlier writes intact.
- Tests assert exact JSON/CSV bytes, exported-value selection/visibility, mapping/path conflicts, unsupported shapes, serialization/write failures, deterministic repeated output, supported JSON/CSV round trips through declared Sprint 016 inputs, and V0.2/no-option regressions.
- No input-validation, module/function/library, extension, or unrelated feature work is included; `bun run build` and `bun test` pass.
