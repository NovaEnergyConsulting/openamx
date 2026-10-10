# Sprint 075 Handoff Prompt

You are the Builder for OpenAMX Sprint 075: V0.12 Braced `if` Expressions and Statements.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV12MasterSprintPlan.md`.
- All Sprint 075 artifacts: `requirements.md`, `blueprint.md`, `acceptance.md`, and this handoff.
- Sprint 072 `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`.
- Sprint 073 and 074 implementation records and `builder-evidence.md`; preserve their approved behaviors and compare suite results to their recorded baselines.
- Current AST/parser, loop/return, type-checker, evaluator/environment, diagnostic, formatter, and focused test paths listed in the blueprint.

## Authority and Entry Gates

- The V0.12 master plan and Sprint 072 `if` fixtures are the semantic authority.
- Before code or test edits, obtain explicit Sprint 075 authorization and approval of the concrete file-by-file plan.
- Before implementing the missing-return diagnostic or exact-code assertion for IF-I02, obtain explicit Lead Developer approval of its diagnostic identity/message. It remains unallocated in Sprint 072. Do not guess a code/message or silently reuse an unrelated diagnostic.

## Task Contract

- Implement both braced forms: expression form with required `else` and value returns on every possible path; statement form with optional `else`.
- Add fixture-derived parser/evaluator tests, preserve the legacy expression regression, and verify branch scoping, persistent outer assignments, local expression returns, and selected-branch-only execution.
- Preserve current loop behavior and return restrictions outside the new expression-local return context.
- Keep completed record-inheritance and enum features intact.
- Do not implement editor/formatter integration, publish the language specification, update examples/help, or perform release work.

## Mandatory Boundaries

- The expression return supplies only that conditional expression's result. It must not return from an enclosing loop or execution context.
- Every possible expression path must explicitly return a value; no fallthrough/default value is inferred.
- Branch-local declarations do not leak. Mutations to existing outer bindings remain visible.
- Keep Boolean condition checks and existing branch type-compatibility semantics.
- IF-I02 cannot be claimed as passing until its diagnostic allocation and fixture-derived assertion are approved and implemented.
- Run focused parser/evaluator/formatter/module tests, the root build, and the full root suite specified in the blueprint. Record exact results and retries without masking inherited failures.

## Completion

Meet every criterion in `acceptance.md` and record evidence in `builder-evidence.md`. If the IF-I02 diagnostic gate or any return-path, scope, or legacy-regression requirement remains incomplete, do not report Sprint 075 complete.
