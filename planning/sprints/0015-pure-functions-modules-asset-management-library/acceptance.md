# Sprint 015 Acceptance Criteria

Sprint 015 is complete when:

- AST/parser support source-located `fn`, named local imports, and allowed `export` declarations in executable `amx` blocks, enforcing the grammar/order restrictions.
- Functions require unique typed parameters and a typed return, check their expression body, check call arity/types, and reject captures, recursion, forward calls, `for` expressions, and invalid standard-library shadowing.
- A user-function call is deterministic and cannot read or mutate caller/module bindings; nested permitted function calls and standard-library calls work.
- Module paths obey the exact relative `.amx`, slash, entry-root-containment, and canonicalization rules. Invalid paths/unavailable modules use `AMX5001` with import location.
- Loader behavior is deterministic: depth-first import source order, complete parse/link/check before evaluation, one dependency evaluation before its importer, isolated module environments, and no evaluation on cycle/link/type failure.
- Explicit exports are the sole cross-module surface for types, values, and functions. Missing/duplicate exports, import duplicates, local/import collisions, imported-value mutation, and absent symbols use actionable `AMX5002` diagnostics.
- Import cycles use `AMX5003`, report the ordered cycle and relevant import locations, and perform no module evaluation.
- `libraries/asset-management.amx` exports exactly the six approved data-only structures: `FailureMode`, `Risk`, `Strategy`, `Asset`, `MaintenanceTask`, and `LifecycleCost`; its types are absent until explicitly imported.
- Focused tests cover function success/failures/purity, imported type/function/value visibility, module isolation, DFS/evaluate-once order, missing/colliding names, path rejection, cycles, and opt-in library use.
- Sprint 014 typing/records and V0.2 documents remain passing. No input/output/validation/serialization/extension feature is implemented.
- `bun run build` and `bun test` pass; planning logs record exact results and deviations before marking Sprint 015 complete.
