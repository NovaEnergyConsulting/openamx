# Sprint 075 Blueprint: V0.12 Braced `if` Expressions and Statements

## Approach

1. Confirm the Sprint 072 `if` fixtures and current worktree. Review the AST statement/expression unions, parser handling for braced constructs and expression-form loops, type-checker return contexts, runtime statement execution, environment binding behavior, and focused tests before editing.
2. Obtain the diagnostic-catalog decision for IF-I02 before implementing its missing-return diagnostic or exact-code assertion. Preserve the established identities for IF-I01 and IF-I03–IF-I05.
3. Extend the AST/parser for two distinct forms:
   - A standalone `if condition { ... }` statement with an optional `else { ... }`.
   - A value-producing `if condition { ... } else { ... }` expression whose branch blocks contain explicit value returns.
   Preserve current expression parsing, source positions, nested block parsing, and all existing syntax.
4. Type-check each condition as `Boolean`. Type-check returned expression values under the existing conditional-expression compatibility rules.
5. Add expression-path analysis that rejects an expression if any possible branch path lacks an explicit value return. Nested braced expressions must be analyzed as their own value-producing scopes. Do not add loop or function-return guarantees.
6. Give each branch a lexical binding scope. A `let` introduced in a branch must not be visible outside it or in an unrelated sibling branch; assignments to bindings that already exist outside the branch remain visible after execution.
7. Evaluate only the selected branch. Capture a return that supplies the current conditional expression's value locally; do not let it terminate an enclosing loop, document, or other context. Preserve existing expression-loop return behavior outside that conditional-expression boundary.
8. Add fixture-derived coverage:
   - `tests/parser.test.ts`: IF-V01–IF-V06 parsing, nesting, required/optional `else`, and source-located invalid forms.
   - `tests/evaluator.test.ts`: branch values, all-path behavior, local return, lexical scope, outer assignments, and selected-branch-only execution.
   - `tests/formatter.test.ts`: unchanged IF-V01 legacy formatting only; defer braced-form formatting assertions to Sprint 076.
   - `tests/modules.test.ts`: run as regression coverage for completed V0.12 features; add no new module semantics.
9. Preserve the completed Sprint 073 and 074 fixtures/behaviors while making parser/type-checker/evaluator changes. Do not refactor their implementations unless a proven Sprint 075 regression requires a narrow correction.
10. Run focused parser/evaluator/formatter/module suites and the root build, then the full root suite. Compare results with Sprint 074's retry baseline and record exact outcomes, including retries for timing-sensitive failures.

## Files to Update

- AST/parser: `src/ast/types.ts`, `src/parser/parseStatements.ts`, and `src/parser/parseExpression.ts`
- Type checking: `src/typechecker/checkDocument.ts`
- Runtime scope/evaluation: `src/runtime/evaluateExpression.ts`, and `src/runtime/environment.ts` only if required for branch-local bindings
- Diagnostics: `src/diagnostics/errors.ts` only after IF-I02 diagnostic allocation is approved
- Focused existing tests: `tests/parser.test.ts`, `tests/evaluator.test.ts`, `tests/formatter.test.ts`, and regression coverage in `tests/modules.test.ts`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` only for accurate execution status, approved diagnostic allocation, or a newly discovered decision
- Sprint 075 `builder-evidence.md` with exact changes, diagnostic allocation, tests, results, and residuals

Do not edit editor clients, language specifications, examples, formatter implementation, dependency manifests, or unrelated loop/runtime behavior.

## Risks and Stop Conditions

- If the parser cannot distinguish the two braced forms without changing existing syntax, stop and request a product decision rather than altering the legacy expression.
- If any expression path can fall through without an explicit return, reject it; do not infer a value or silently treat it as a statement.
- If a return from an expression block escapes into an enclosing context, the expression implementation is incorrect.
- If branch locals leak or writes to existing outer bindings are lost, the scope/evaluator implementation is incomplete.
- If IF-I02 diagnostic approval is unavailable, do not invent/reuse a code; mark IF-I02 blocked and do not report Sprint 075 complete.
- Do not add function returns, new loop behavior, or editor/formatter integration as a shortcut.

## Verification

1. `bun test tests\\parser.test.ts tests\\evaluator.test.ts tests\\formatter.test.ts tests\\modules.test.ts`
2. `bun run build`
3. `bun test`

Record every command's exact outcome. Compare full-suite results with the Sprint 074 retry baseline; do not mask failures by reporting only a successful isolated retry.
