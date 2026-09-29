# Sprint 017 Requirements: CSV/JSON Output

## Goal

Implement V0.3 named export selection and deterministic JSON/CSV file output through repeated CLI `--output name=path` mappings. Outputs are serialized only after parsing, module loading, checking, input validation, and evaluation all succeed.

## Inputs

- Authoritative V0.3 contract: `docs/language-spec-v0.3.md`, especially sections 11, 12, and 14
- Sprint 016 completed loader/validated-entry baseline and verification record in `planning/state.md`
- Existing CLI, module loader, environment type/export metadata, record values, input validation, diagnostics, and tests

## In Scope

- Add repeated `--output name=path` options to `run` and `render`, splitting only at the first `=` and resolving paths from the process working directory.
- Select only explicitly exported entry-module `let` values; reject types/functions/private/imported/missing names, duplicate output names, duplicate resolved destinations, and unsupported extensions.
- Serialize supported typed values deterministically to exact lowercase `.json` or `.csv` destinations, with AMX6001 selection/shape diagnostics and AMX6002 serialization/write diagnostics.
- JSON: support finite scalars, `null`, records, and lists recursively; UTF-8, two-space indent, one final LF, declaration-order record fields, and preserved DateTime strings.
- CSV: support only a declared list of one record type with scalar/nullable-scalar fields; declaration-order header/rows, LF records/final LF, RFC 4180 quoting, correct null and empty-string behavior.
- Ensure every selected output is fully serialized before any write. For `render`, resolve and serialize HTML plus exports before writing; write HTML first, then export files in CLI option order.
- Add focused CLI/serializer tests, supported-shape round trips against Sprint 016 input behavior, stable byte assertions, and planning verification records.

## Out of Scope

- New input syntax, JSON/CSV input conversion/validation semantics, functions/modules/library changes, or data validation rules from Sprint 016.
- VS Code V0.3 support, end-to-end release examples/documentation, Marketplace publication, remote output targets, streaming, transactions, or archive formats.
- Output of private/imported values, functions/types, nested/list CSV values, scalar CSV values, or automatic export of final context.

## Constraints

- Existing `run` still prints its final entry context; existing `render` still writes standalone HTML. `--output` adds files and must not replace either behavior.
- Output selection is entry-export-only and must retain declared type metadata. Do not infer record shape solely from JavaScript object keys.
- Do not write any output when parsing/linking/checking/input validation/evaluation/serialization fails. A later filesystem write failure may leave earlier destinations written; do not claim transactionality.
- When `render --out` and `--output` resolve to the same path, reject before writing. Preserve CLI mapping order for exports.
- Keep filesystem paths at the CLI/serializer boundary; AMX values and expressions do not receive path capabilities.
