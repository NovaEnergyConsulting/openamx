# 014 Handoff Prompt

You are the Builder for `openamx` Sprint 014.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo's documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV03MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `docs/language-spec-v0.3.md`
- `planning/sprints/0013-v03-language-data-contract/acceptance.md`
- `planning/sprints/0014-structure-ast-runtime-values-static-type-checker/requirements.md`
- `planning/sprints/0014-structure-ast-runtime-values-static-type-checker/blueprint.md`
- `planning/sprints/0014-structure-ast-runtime-values-static-type-checker/acceptance.md`

Execute only Sprint 014 scope. The later complete V0.3 contract text is authoritative. Correct the duplicated obsolete leading draft in `docs/language-spec-v0.3.md` before relying on it, without changing the approved semantics. Do not invent type-system rules; record a genuinely blocking ambiguity in `planning/questions.md` before implementation.

Sprint 013 completed the V0.3 contract. This sprint establishes records, runtime record values, and full static checking; Sprint 015 owns functions/modules/the opt-in library, Sprint 016 owns inputs/validation, and Sprint 017 owns exports/output.

## Task Contract

**objective**: Implement source-located V0.3 records and type annotations plus an activated, deterministic checker that covers every existing V0.2 expression/statement form before evaluation, while preserving V0.2-only behavior.

**owns**:

- `docs/language-spec-v0.3.md` only to remove the duplicated obsolete draft or record an approved factual clarification
- `src/ast/types.ts`
- `src/parser/parseStatements.ts`, `src/parser/parseExpression.ts`, and narrowly required parser helpers
- `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`, and focused record-value support
- `src/typechecker/` or focused equivalent checker modules
- `src/diagnostics/errors.ts`
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, and focused checker tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 014 artifacts only for factual clarifications/deviations

**must_not**:

- Implement `fn`, `import`, `export`, user functions, modules, inputs, CSV/JSON, validation modes, outputs, serializers, or the Asset Management library.
- Add filesystem access to AMX, CLI input/output flags, dependencies, a parser framework, domain-specific core behavior, or extension changes.
- Change V0.2-only runtime truthiness/mixed-list behavior, executable-fence rules, renderer/formatter/CLI output, or source-location conventions.
- Add coercions, `any`, structural record conversion, recursive records, field mutation, methods, inheritance, or computed fields.
- Weaken or remove passing V0.2 coverage, or refactor unrelated code.

**acceptance**:

- Meet every item in `planning/sprints/0014-structure-ast-runtime-values-static-type-checker/acceptance.md`.
- Parse/materialize typed closed records and field access with correct defaults/nullability/source locations.
- Type-check all V0.2 and Sprint 014 forms when activation occurs, emitting deterministic AMX3 diagnostics before any evaluation.
- Prove V0.2-only documents retain legacy evaluation behavior and V0.3 static failures prevent evaluation/rendering.

**verification**:

1. Before implementation, remove the duplicate obsolete leading V0.3 specification draft and run Markdown diagnostics for the corrected specification and Sprint 014 artifacts.
2. After the first AST/parser edit, run focused parser tests for type declarations, annotations, constructors, access, `null`, locations, and the executable-fence boundary.
3. After checker integration, run focused checker/evaluator tests for each V0.2 expression/statement category plus records, nullability/defaults, DateTime, and error-before-evaluation behavior.
4. Run `bun run build` and `bun test`.
5. Record exact commands/results, test counts, contract clarifications, and deviations. Mark Sprint 014 complete only when all acceptance criteria pass.
