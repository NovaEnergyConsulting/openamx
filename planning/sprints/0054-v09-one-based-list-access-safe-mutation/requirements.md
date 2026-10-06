# Sprint 054 Requirements: 1-Based List Access and Safe Shared Mutation

## Goal

Implement 1-based list reads and statement-form `add`/`remove` operations with correct element typing, explicit bounds/type validation, and atomic mutation. Preserve shared local-list alias behavior while protecting imported values, pure functions, original-element loop iteration, and already-emitted view snapshots. Integrate focused editor analysis and regression coverage.

Sprint 054 implements list behavior only. It does not depend on Sprint 053, and it does not claim completion of the remaining V0.9 feature groups.

## Dependencies and Entry Gate

- Sprint 054 depends on Sprint 052, which is **ACCEPTED WITH RECORDED RESIDUALS** by Lead Developer disposition dated 2026-10-06.
- Sprint 053 is **ACCEPTED** for closure, with its Windows VS Code Extension Development Host run remaining unpassed (13 pass, 6 fail). Sprint 054 does not depend on Sprint 053; preserve its residual in planning records and do not claim its host suite passed.
- Read the approved V0.9 contract in `docs/language-spec-v0.9.md` and the approved Sprint 051 contract/conformance matrix in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`.
- `planning/plan-openamxV09MasterSprintPlan.md` and the approved language/technical contract are authoritative. Record any discovered ambiguity or scope change in `planning/questions.md` and obtain Lead Developer direction before changing semantics.
- Inspect current working-tree state and preserve unrelated/user-owned changes.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Sprint 054 scope and dependency sequence
- `docs/language-spec-v0.9.md`, especially list reads, mutation semantics, safety, aliases, imports, loops, and snapshots
- Approved Sprint 051 Builder Contract Proposal: precedence, conformance cases, diagnostics, static/runtime boundary, and list cross-surface audit
- Sprint 052 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition
- Sprint 053 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition for context only; it is not a dependency
- `src/ast/types.ts`, expression/statement/loop parsers, type checker, runtime environment/evaluators, module/import immutability, formatter, diagnostics, shared editor analysis
- VS Code grammar/providers and desktop editor/worker/RPC paths directly affected by list syntax or diagnostics
- Existing list, evaluator, module, report/view snapshot, formatter, editor, CLI, desktop, and example tests/fixtures

## In Scope

- Implement 1-based list reads, including literal, identifier, and computed positive-integer indexes. Preserve the statically known element type, including nullable element types, and support valid field/index postfix chaining.
- Reject zero, negative, fractional, non-finite, wrong-type, and out-of-range indexes. Statically reject errors only when the receiver/index/length are safely provable under the approved Sprint 051 constant boundary; validate all dynamic cases at runtime.
- Implement `add value to list` as append and `add value to list at index` as insertion before the 1-based position. `length + 1` is valid and appends. Target only named list bindings.
- Implement `remove count from list at index` as removal of `count` consecutive elements starting at that 1-based index.
- Implement `remove count from list` without `at` as removal of exactly the final element, regardless of the positive count's magnitude. Evaluate and validate `count` as a positive integer first; do not ignore its type or validity.
- Enforce list element type compatibility for inserted values and list target typing. `add`/`remove` are statements, not expression-returning functions, and arbitrary field/index targets are not permitted.
- Validate the entire requested operation before any mutation. Failures must not partially mutate a list or return a success-shaped value. Use approved `AMX3009` for statically provable bounds errors and `AMX1008` for dynamic invalid index/count/position or immutable-import mutation.
- Preserve shared identity for mutable local lists: aliases observe successful mutations. Protect imported values, including nested lists and aliases, from mutation; aliasing cannot bypass import immutability.
- Preserve pure-function contracts. Do not make an impure mutation valid inside a context currently restricted to pure expressions/functions.
- Permit local-list mutation in statement-form loops while iterating a snapshot of the original elements. Appends/removals during iteration do not change which original items are visited or their order.
- Preserve report/view snapshot isolation: a mutation after a view is emitted cannot change the already-emitted view.
- Wire necessary parser, AST, checker, runtime, formatter, shared editor analysis/diagnostics, and directly affected VS Code/desktop behavior. Keep code coloring/diagnostics out of narrative and inert fences.
- Add focused positive, negative, boundary, alias/import, pure-function, loop, snapshot, formatter, source-location, and client regressions. Preserve existing negative tests.
- Record exact changed files, semantic test cases, commands/results, and residuals in Sprint 054 Builder evidence and planning state/decision/question records.

## Out of Scope

- String escapes/interpolation changes; Sprint 053 is independent and accepted. Do not adjust its semantics or claim its Windows Extension Development Host suite passed.
- Dimension/unit declarations, measurement values, SI library, conversion, measurement-specific list typing beyond preserving generic element types, or external measurement data; Sprints 055-057 own these.
- Indexed replacement, slicing, new loop forms, general-purpose list-returning add/remove calls, or mutation targets other than named list variables.
- Changing range semantics, pure-function rules, module resolution, imported-value semantics, narrative interpolation, report ordering, or unrelated editor/UI behavior.
- Broad editor parity, migration documentation, bundled help, and integrated V0.9 acceptance; Sprint 058 owns these.
- Broad refactoring or fixture changes unrelated to list syntax and required compatibility.

## Constraints

- Indexes/counts are positive integers. Reject non-finite numbers, fractions, zero, negatives, incorrect types, overrun, invalid insert positions, empty-list removal, and invalid removal intervals explicitly.
- Indexing is 1-based: the first item is `[1]`; append insertion is permitted at `length + 1`; ordinary reads and removal starts must address an existing element.
- Validate before mutation. For removal with `at`, validate the full interval; for insertion validate the insertion point and value type before changing the list.
- For removal without `at`, validate the count as a positive integer and remove exactly one final element, even when count exceeds one. Empty lists still error.
- Only statically provable constant cases may fail during checking; do not execute code, inspect identifier bindings by running them, or guess dynamic list lengths.
- Local aliases observe mutations, but imported lists and nested imported values remain immutable through every alias path.
- Mutating a list during statement-form iteration traverses a snapshot of the list as it existed when iteration began.
- Preserve prior emitted view contents and all runtime/source locations. Use approved diagnostics (`AMX3009`, `AMX1008`) without reassigning existing diagnostic meanings.
- Keep implementation consistent across direct runtime, CLI/module paths, editor analysis, VS Code, and desktop where applicable. Record unrun/failed checks as such, particularly the Windows VS Code host-suite residuals from Sprints 052/053.
