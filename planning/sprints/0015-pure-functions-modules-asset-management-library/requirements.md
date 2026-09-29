# Sprint 015 Requirements: Pure Functions, Modules, and Asset Management Library

## Goal

Implement the V0.3 reusable-code layer defined by `docs/language-spec-v0.3.md`: typed pure functions, local `.amx` module imports/exports, deterministic module linking/evaluation, and the separate opt-in Asset Management library. Preserve Sprint 014 record/checker behavior and V0.2 compatibility.

## Inputs

- Authoritative contract: `docs/language-spec-v0.3.md`, especially sections 5-8 and 13
- Sprint 014 completed implementation and verification record in `planning/state.md`
- Existing AST/parser/runtime/type-checker/diagnostics/tests under `src/` and `tests/`

## In Scope

- Parse and retain locations for `fn`, `import { ... } from "path"`, and `export` declarations; enforce their top-level/order placement rules.
- Extend static checking for typed function signatures/bodies/calls, unique parameter names, no captures/recursion/forward calls/for-expressions, and exported/imported symbol visibility.
- Evaluate user functions through call frames containing parameters only, with standard-library, earlier local, and imported function visibility as specified; no shared-environment mutation.
- Implement local module resolution/loading from the CLI entry file: exact relative `.amx` paths, canonical containment under the entry directory, explicit named imports/exports, source-order DFS loading, one evaluation per module, isolated environments, collisions, and cycles.
- Add `AMX5001`-`AMX5003` source-located module diagnostics and use existing AMX3 diagnostics for function/type errors.
- Add `libraries/asset-management.amx` exporting the six approved initial structural schemas only.
- Add focused parser/checker/runtime/module tests and update planning logs with actual verification.

## Out of Scope

- `input`, `--input`, JSON/CSV loading, aggregate/fail-fast validation, and input diagnostics (Sprint 016).
- `--output`, serialization, output files, or CLI output selection (Sprint 017).
- V0.3 editor support, examples/release documentation, remote packages, package manager, inheritance/methods, or domain calculations/constraints.

## Constraints

- Keep paths and filesystem reads inside the module loader/CLI boundary; AMX expressions and function bodies never receive path/file values.
- Modules without inputs execute their own blocks in source order exactly once and expose only explicit exports. Imported values are immutable in importers.
- Function bodies may reference only parameters, standard-library functions, earlier same-module functions, and imported functions. Do not loosen purity through closures or loop expressions.
- The library remains opt-in and data-only. Do not add its names to core parser/runtime defaults or infer any domain validation from its shapes.
- Keep dependencies unchanged and preserve V0.2-only no-option behavior.
