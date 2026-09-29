# Sprint 016 Acceptance Criteria

Sprint 016 is complete when:

- Parser/AST/type checker support located `input name: Type` declarations only in the entry module after imports and before other executable items; duplicate/colliding/invalid placement is rejected.
- `run` and `render` accept repeated `--input name=path` plus `--validation aggregate|fail-fast`, while unchanged V0.2/V0.3 no-option commands retain their existing behavior.
- CLI mapping rules are exact: split at the first `=`, non-empty name/path, one mapping per declared input, paths relative to working directory, lowercase `.json`/`.csv` selection, and errors for unknown/missing/duplicate/unsupported mappings.
- JSON input validates UTF-8 parseability, duplicate keys, exact root shape, recursive lists/records, nominal type rules, field/default/null semantics, finite numbers, exact primitive types, and RFC 3339 DateTime values.
- CSV input validates UTF-8/RFC 4180 records, BOM handling, CRLF/LF, header uniqueness/names, row widths, scalar-only `RecordType[]` limitation, exact conversion rules, quoted-empty versus blank-null behavior, and data-row numbering.
- Validation materializes values in type declaration order, copies defaults, and validates computed typed record boundaries without introducing domain constraints.
- Aggregate mode returns deterministic independent input diagnostics in contract order and performs no evaluation/writes; fail-fast returns exactly the first equivalent diagnostic.
- `AMX4001`, `AMX4002`, and `AMX4003` diagnostics distinguish mapping/read, malformed document, and shape/conversion failures and include all contract-required source/data context where available.
- Validated input bindings are immutable and available only to the entry module before evaluation. Imported modules cannot declare inputs, and AMX expressions/functions do not receive file paths.
- Focused tests cover JSON nested success/failures, duplicate keys, DateTime/null/defaults, CSV quoting/newlines/headers/conversions/nulls, aggregate/fail-fast order, mapping overrides, evaluation prevention, and V0.2/module regression.
- No output selection/serialization/files, examples/release work, editor work, or unrelated module/function changes are implemented; `bun run build` and `bun test` pass.
