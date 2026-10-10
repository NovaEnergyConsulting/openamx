# Sprint 075 Acceptance Criteria

Sprint 075 is complete only when the braced expression and statement forms satisfy every Sprint 072 fixture and preserve existing conditional, loop, scope, and return behavior. Any unapproved or untested missing-return diagnostic remains a blocker.

## Syntax and Conditional Semantics

- IF-V01's existing `if condition then value else value` form retains its current parse, type-check, evaluation, and formatter behavior.
- IF-V02 parses a braced expression with a required `else`; an explicit value return on each branch supplies the selected result, and execution proceeds after the expression.
- IF-V04 verifies nested braced expressions and explicit returns on every nested and outer path.
- IF-V05 evaluates only the selected expression branch; the unselected runtime-error branch is not evaluated.
- IF-V03 and IF-V06 parse and evaluate standalone braced statements with, respectively, no `else` and an `else`.
- Conditions are Boolean-checked. Expression branch return values use existing conditional-expression type compatibility.

## Return Paths and Scope

- Braced expression blocks are rejected if any possible path fails to return an explicit value.
- A return used to produce a conditional expression's value is local to that expression and does not escape to an enclosing execution context.
- A `let` declared within a branch is unavailable after the block and in a sibling branch.
- Assignments to existing outer bindings persist after the selected branch executes; only the selected statement branch runs.
- Current expression-loop return behavior and restrictions on return outside supported contexts remain unchanged. No new loop or function-return semantics are introduced.

## Diagnostics and Source Locations

- IF-I01 uses AMX3006 for the missing expression `else`.
- IF-I03 uses AMX3001 for the out-of-scope binding; IF-I04 and IF-I05 use AMX3002 for the established type errors.
- Before implementing the missing-return diagnostic or exact-code assertions for IF-I02, the Lead Developer has approved its identity/message and the allocation is recorded in `planning/decisions.md`.
- All invalid fixtures report at the Sprint 072 source coordinates using original-document, 1-based UTF-16 locations. If IF-I02 allocation remains pending, it is marked BLOCKED and Sprint 075 is not reported complete.

## Regression, Tests, and Scope

- Fixture-derived tests cover IF-V01–IF-V06 and IF-I01–IF-I05. The formatter test covers legacy IF-V01; new braced-syntax formatter behavior is deferred to Sprint 076.
- Focused parser/evaluator/formatter/module suites pass; the root build passes; the full root suite is run and exact outcomes are recorded against the Sprint 074 retry baseline.
- Existing Sprint 073 record inheritance and Sprint 074 enums remain passing in focused/full regression coverage.
- Changes are limited to braced `if` expressions/statements and directly coupled parsing, type checking, evaluation, scope, diagnostics, and tests. No loop redesign, editor integration, language specification, examples/help, or release work is included.
- `builder-evidence.md` records exact changed files, approved diagnostic allocation, validation commands/results, full-suite residuals, and any blocked acceptance item.
