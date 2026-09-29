# 008 Requirements: Mutable Bindings, Ranges & Loops

## Goal

Implement V0.2 mutable bindings, assignment statements, inclusive integer ranges, and simple list/range loops. Extend parsing and evaluation for statements inside executable `amx` blocks while preserving the V0.1 expression operators and the V0.2 source-location contract. Loop expressions collect exactly one explicit return value per iteration; statement loops perform side effects without producing a value.

## Inputs

- Approved master plan: `planning/plan-openamxV02MasterSprintPlan.md`, Sprint 008.
- Authoritative language contract: `docs/language-spec-v0.2.md`.
- Sprint 007 output: `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/` and its completion notes in `planning/state.md` / `planning/questions.md`.
- Current parser, AST, environment, evaluator, diagnostics, and tests under `src/` and `tests/`.
- V0.2 decisions in `planning/decisions.md` and the Sprint 008 pack.

## In Scope

- Parse and evaluate mutable `let` declarations inside executable blocks. A first `let name = expression` introduces the name; repeated `let` updates the existing binding.
- Parse assignment `name = expression` and compound addition `name += expression`. Both require an existing binding; undefined reads and writes produce a clear, source-located error (use AMX1004 for an undefined identifier, consistent with the existing runtime).
- Preserve V0.1 expression forms and add inclusive integer range expressions `[start to end]`. Evaluate both bounds as finite integer numbers and produce every integer from start through end, ascending or descending by one. Equal bounds produce a one-element range. Explicit list literals remain unchanged.
- Parse and evaluate `for item in values { ... }` over lists and ranges. Loop bodies are braced and line-oriented per the language spec; nested loops, `break`, and `continue` are errors/out of scope.
- Support statement-form loops in statement position with no `return`. Effects of body assignments and declarations use the caller-provided/shared document `Environment`; only the iterator binding is scoped to the loop. Restore any prior binding shadowed by the iterator when the loop exits. A loop variable can be read or assigned within its iteration; the next iteration binds the next input value.
- Support expression-form loops wherever an expression is accepted, including a `let` initializer. An expression-form loop has exactly one `return expression` in its body; evaluate it once per iteration, append its value, and continue executing any remaining body statements. It is not an early exit. An empty iterable yields `[]`.
- Define expression-vs-statement loop use by syntactic context: a `for` used as an expression requires exactly one return; a `for` used as a statement must not contain `return`. A `return` outside an expression-form loop is invalid. Do not treat `return` as a general-purpose early-exit statement.
- Update the AST and source-located parser/runtime diagnostics as needed. Provide a statement-list evaluation entry point that uses a caller-supplied `Environment`, so loops and mutation can be tested in one block without implementing document-wide executable-block orchestration.
- Add focused parser/evaluator tests for mutation, re-declaration, ranges, loop forms and scoping, return collection, empty loops, and invalid/undefined cases.
- Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with Sprint 008 status, semantics, verification, and any actual deviations.

## Out of Scope

- `match` parsing, evaluation, or tests; that belongs to Sprint 009.
- Executing multiple code blocks in document order, creating the document-wide shared environment, evaluating inline `{{ }}` against the final environment, or rendering executable source; that belongs to Sprint 010. Sprint 008 may expose/evaluate a single statement list with a supplied environment.
- Nested loops, `break`, `continue`, conditional loop-body control flow, multi-dimensional ranges, explicit range steps, or loop `return` as early exit.
- Formatting, renderer changes, CLI changes, VS Code extension, asset-domain functionality, or V0.3 candidates.

## Constraints

- Keep TypeScript/Bun and the hand-written parser. Do not add dependencies or reorganize the project.
- Preserve the V0.2 breaking migration: declarations outside executable blocks remain narrative and are never executed as a compatibility mode.
- Preserve document-relative 1-based UTF-16 source locations, including locations on nested statements and expressions.
- `+=` must use the existing V0.1 `+` operator semantics; do not introduce a separate coercion rule.
- Re-declaration updates the existing binding rather than creating a new shadow. The loop iterator is the sole loop-scoped binding; other new declarations and outer mutations remain in the shared environment after the loop.
- Existing V0.1 expression and renderer/parser behavior must not be weakened. Keep core modules domain-neutral.
- Do not implement `match` merely because its AST scaffold exists; its parsing/evaluation remains Sprint 009.
- Run focused parser/evaluator tests after the first implementation slice, then `bun run build` and the full `bun test` suite.
