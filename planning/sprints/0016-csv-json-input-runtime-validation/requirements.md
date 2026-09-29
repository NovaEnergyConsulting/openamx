# Sprint 016 Requirements: CSV/JSON Input and Runtime Validation

## Goal

Implement V0.3 logical inputs, repeated CLI `--input name=path` mappings, JSON/CSV conversion, and deterministic aggregate/fail-fast validation. Validated values enter only the entry-module environment before evaluation; AMX source never gains filesystem access.

## Inputs

- Authoritative V0.3 contract: `docs/language-spec-v0.3.md`, especially sections 9-11
- Sprint 015 loader/function/module baseline and completion notes in `planning/state.md`
- Existing CLI, module loader, type checker, record runtime, diagnostics, and tests

## In Scope

- Parse source-located entry-only `input name: Type` declarations after imports and before all other executable items; reject inputs in dependencies, loops, and invalid ordering/collisions.
- Add repeated `--input name=path` and `--validation aggregate|fail-fast` to `run` and `render` while preserving existing no-option behavior.
- Parse mappings at the first `=`, resolve input paths from the process working directory, select exact lowercase `.json`/`.csv`, and reject missing/unknown/duplicate mappings.
- Load UTF-8 JSON and RFC 4180 CSV at the CLI/data-loader boundary. JSON maps recursively to declared scalar/list/record/nullable types; CSV maps only to scalar-field `RecordType[]` as specified.
- Validate mappings, files, shapes, required/optional/default/nullability rules, DateTime wire values, scalar conversion, nested values, and computed typed record boundaries.
- Implement deterministic aggregate and fail-fast behavior plus `AMX4001`-`AMX4003` diagnostics containing logical input, data path, data location/path, expected/actual information, and declaration locations when available.
- Inject fully validated inputs into the entry environment before module/document evaluation; update planning logs and add focused parser/loader/CLI/data tests.

## Out of Scope

- `--output`, JSON/CSV serialization, export selection, output path writes, or round-trip export testing (Sprint 017).
- V0.3 editor features, release examples/documentation, remote packages, broad workflows, domain constraints, and Marketplace publication.
- Changes to pure function/module semantics, Asset Management schema fields, or V0.2 no-option behavior.

## Constraints

- Use a proven CSV parser/library for RFC 4180 behavior rather than ad hoc splitting; any dependency addition must be minimal and recorded.
- Detect JSON duplicate keys rather than silently accepting parser last-key-wins behavior.
- Input validation completes before any module evaluation or HTML/output write. Aggregate order follows input declaration, JSON array/index or CSV row, declaration-order fields, then depth-first nested values.
- Aggregate mode collects independent input failures without evaluation; fail-fast reports the first in the same order. An invalid computed record stops its evaluation path after its own deterministic field diagnostics.
- Preserve module-loader filesystem containment for modules; input paths intentionally resolve from CLI working directory and are never exposed as AMX values.
