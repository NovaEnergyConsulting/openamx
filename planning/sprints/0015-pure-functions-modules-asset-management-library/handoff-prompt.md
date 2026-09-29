# 015 Handoff Prompt

You are the Builder for `openamx` Sprint 015.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo's documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV03MasterSprintPlan.md`
- `docs/language-spec-v0.3.md`
- `planning/sprints/0014-structure-ast-runtime-values-static-type-checker/acceptance.md`
- `planning/sprints/0015-pure-functions-modules-asset-management-library/requirements.md`
- `planning/sprints/0015-pure-functions-modules-asset-management-library/blueprint.md`
- `planning/sprints/0015-pure-functions-modules-asset-management-library/acceptance.md`

Execute only Sprint 015 scope. The V0.3 contract is authoritative. Do not invent module, purity, or domain rules; record a genuinely blocking ambiguity in `planning/questions.md` before implementation.

Sprint 014 delivered records and static checking. This sprint adds pure functions, local modules, and the opt-in Asset Management library. Sprint 016 owns logical inputs and validation; Sprint 017 owns named output and serialization.

## Task Contract

**objective**: Implement typed pure functions, local explicit imports/exports with deterministic isolated module evaluation, and the six-schema opt-in Asset Management library.

**owns**:

- `src/ast/types.ts`
- `src/parser/parseDocument.ts`, `src/parser/parseStatements.ts`, `src/parser/parseExpression.ts`, and focused parser helpers
- `src/typechecker/checkDocument.ts` and focused type-checker support
- `src/runtime/environment.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`, and focused function/module runtime support
- `src/diagnostics/errors.ts`
- `libraries/asset-management.amx`
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, and focused function/module test files
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 015 artifacts only for factual clarifications/deviations

**must_not**:

- Implement `input`, `--input`, CSV/JSON loading, validation modes, data diagnostics, `--output`, serializers, or output writes.
- Add remote packages, a package manager, filesystem APIs to AMX values/expressions/functions, CLI data options, or extension work.
- Permit function captures, recursion, forward calls, for-expression bodies, mutation of imported values, implicit re-exports, or module paths outside the entry root.
- Add Asset Management calculations, constraints, built-in types, or names to the core defaults.
- Change V0.2 compatibility, Sprint 014 type rules, record semantics, no-option CLI behavior, or unrelated parser/runtime/renderer behavior.

**acceptance**:

- Meet every item in `planning/sprints/0015-pure-functions-modules-asset-management-library/acceptance.md`.
- Prove function call/return typing and mechanically enforced purity.
- Prove named import/export visibility, module isolation, deterministic DFS/evaluate-once behavior, collision/path/cycle diagnostics, and explicit opt-in library use.
- Preserve passing Sprint 014 and V0.2 behavior without starting any data-exchange feature.

**verification**:

1. After the first parser/AST edit, run focused parser tests for functions, imports, exports, ordering, and original locations.
2. After checker/runtime integration, run focused tests for typed calls, illegal captures/recursion/forward calls, imported functions/types/values, and immutable imports.
3. Run focused module tests for source-order DFS, evaluate-once isolation, missing/colliding exports, path escape rejection, and cycles.
4. Verify the library imports explicitly and its six types are otherwise absent from the core environment.
5. Run `bun run build` and `bun test`, then record exact results/deviations before marking the sprint complete.
