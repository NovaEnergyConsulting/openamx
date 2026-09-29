# Sprint 015 Blueprint: Pure Functions, Modules, and Asset Management Library

## Approach

- Extend the AST/parser with explicit function/import/export nodes rather than encoding module syntax as ordinary values. Preserve original locations for declarations, imported names, and paths.
- Extend the existing type checker to use a function-symbol table and an imported-symbol table. Check complete reachable modules before evaluation, preserving dependency and source ordering from the contract.
- Represent a user function as a typed callable definition, not a JavaScript closure over `Environment`. Evaluate calls with a fresh parameter-only frame plus permitted callable tables, guaranteeing no access to mutable document bindings.
- Add one module-loader boundary that canonicalizes paths, enforces entry-root containment after symlink resolution, performs DFS in import source order, detects back edges, and returns parsed/checked module artifacts.
- Evaluate a dependency once before its importer, each in an isolated environment. Copy only explicitly exported types, values, and callable functions into the importing module's import table; prohibit imported-name mutation and collisions.
- Package the six contract-defined schemas as a local library document at `libraries/asset-management.amx`; do not add calculations or domain constraints.

## Files to Update

- `src/ast/types.ts`
- `src/parser/parseDocument.ts`, `src/parser/parseStatements.ts`, `src/parser/parseExpression.ts`, and focused parser helpers
- `src/typechecker/checkDocument.ts` and focused type-checker support
- `src/runtime/environment.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`, and focused function/module runtime support
- `src/diagnostics/errors.ts`
- `libraries/asset-management.amx`
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, and focused function/module tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`

## Notes

- A module is resolved only from a CLI entry path; `parseDocumentText` stays pure and does not perform module I/O.
- Imported types must participate in nominal checking, while imported values/functions are visible only by explicit names and only after the import.
- Do not introduce inputs into imported modules. Input parsing/CLI options remain Sprint 016.
- Do not promise serialization or output selection for exported values. Exports in this sprint exist for module visibility; Sprint 017 owns CLI output use.
