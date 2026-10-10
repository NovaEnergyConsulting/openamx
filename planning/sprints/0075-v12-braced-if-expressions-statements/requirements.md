# Sprint 075 Requirements: V0.12 Braced `if` Expressions and Statements

## Goal

Implement braced `if` expressions and statements from the Sprint 072 fixture contract. Expression blocks must produce a value through an explicit return on every possible path; statement blocks provide control flow with lexical branch scope. Preserve the existing single-line conditional expression and all current loop/return restrictions.

## Dependencies and Entry Gates

- Sprint 072 Builder execution is recorded complete. Its `if` grammar examples, diagnostic matrix, and requirement-to-test matrix are the acceptance contract.
- Sprint 073 record inheritance and Sprint 074 enumerations are recorded complete. Preserve both behaviors and their existing diagnostic allocations.
- Before implementing the missing-return diagnostic or exact-code assertion for IF-I02, obtain Lead Developer approval of its diagnostic identity/message. It remains unallocated in Sprint 072. Do not guess a code/message or broaden an existing category. Other work may proceed, but this case and sprint acceptance remain blocked until approved.
- Obtain explicit Sprint 075 execution authorization and approval of the concrete file-by-file plan before code or test edits.

## Inputs

- `planning/plan-openamxV12MasterSprintPlan.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 072 `requirements.md`, `acceptance.md`, `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`
- Sprint 073 and 074 implementation records and `builder-evidence.md`, for regression context
- Existing AST/parser, expression/statement type-checker, runtime evaluator, environment/scope, loop/return, diagnostic, and formatter conventions
- Existing parser, evaluator, formatter, and module test suites

## In Scope

- Parse standalone braced `if` statements with an optional `else` block.
- Parse braced `if` expressions with a required `else`; require an explicit `return expression` on every possible path in both value-producing branches.
- Treat those branch returns as local value-producing exits for the conditional expression. They must not return from an enclosing execution context.
- Boolean-check conditions and apply the existing conditional-expression branch type-compatibility rules to returned values.
- Evaluate only the selected branch.
- Keep declarations introduced inside a branch local to that block while preserving assignments to existing outer bindings.
- Preserve nesting and existing statement-context restrictions, especially current `return` and loop semantics.
- Add fixture-derived executable tests for IF-V01–IF-V06 and IF-I01–IF-I05 in the existing parser/evaluator suites, with a formatter regression for IF-V01.

## Out of Scope

- Record inheritance and enum behavior changes (Sprints 073 and 074).
- New loop, `break`, `continue`, or function-return semantics; a general control-flow or scope redesign.
- Editor-specific syntax/highlighting/completion/navigation work, V0.12 language specification, examples, and editor help (Sprint 076).
- Formatting support for the new braced syntax; new formatter/editor integration remains Sprint 076 scope. Preserve and test the existing legacy conditional-expression formatting.
- New test infrastructure, unrelated runtime changes, release engineering, release, or publication.

## Constraints

- The V0.12 master plan and Sprint 072 fixtures are the semantic authority. Do not change the expression/statement distinction or weaken all-path return requirements.
- Preserve `if condition then value else value` behavior, existing Boolean/type rules, and current return restrictions outside the new value-producing expression context.
- A return that supplies a braced expression's value is local to that expression and must not be caught as an outer loop return or escape an enclosing context.
- Branch scoping must hide branch-local declarations after the block but retain mutations to existing outer bindings.
- IF-I02's diagnostic identity/message requires explicit approval before implementation. Existing codes for IF-I01 and IF-I03–IF-I05 remain as specified by Sprint 072.
- Keep source locations aligned with the original-document, 1-based UTF-16 convention.
