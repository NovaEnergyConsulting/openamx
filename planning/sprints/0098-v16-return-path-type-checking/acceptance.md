# Sprint 098 Acceptance Criteria

Sprint 098 is complete when statement-body function returns are type-checked
and every reachable function path is proven to return, in accordance with the
accepted Sprint 095 contract and accepted Sprint 096/097 implementations.

## Return Types and Diagnostics

- Every explicit return expression in a statement-body function is checked
  against the declared return type, including nested statement branches,
  statement loops, and unreachable returns.
- A compatible function passes. An incompatible explicit return fails with
  existing `AMX3002` wording at the return expression.
- Any function with a reachable fallthrough path fails with
  `AMXF4001: Missing return value from function` at the function body's
  closing brace.
- Register `AMXF4001` in the static diagnostic code/type path without
  changing `AMXF4002`, the runtime defensive fallthrough error.
- Do not reuse `AMX3021`; it remains specific to braced-if expressions.
- Unknown/out-of-scope identifiers and unknown functions in unreachable
  statements continue to produce established `AMX3001`/`AMX3004` diagnostics.

## Control-Flow Analysis

- Direct return terminates the reachable continuation.
- An if without else is incomplete even when its consequent always returns.
- An if/else is complete only if both branches terminate.
- A partially returning branch can be completed by a later reachable return.
- A statement loop never proves completion by itself because it may run zero
  times. A later return can complete its fallthrough path.
- Nested statement conditionals/loops use the same path rules.
- Statements and explicit returns after an unconditional return are still
  fully type-checked, but do not change the sequence's already-terminated
  reachability result.
- A `return` used within a braced-if expression is checked as the expression's
  branch value and does not count as a function statement return.
- Expression-form loop return collection and the existing prohibition on
  expression-form loops inside functions remain unchanged.

## Scope and Compatibility

- Function parameter scope is isolated from document bindings; no captures,
  recursion, forward references, or visibility changes are introduced.
- Same-scope repeated `let`, nested shadowing, assignment, `+=`, sibling
  branch isolation, and loop iterator scope follow the accepted contract.
- Existing expression-bodied function type checking is unchanged.
- Existing AMX3021 behavior, module export/import checks, parser diagnostics,
  runtime AMXF4002 behavior, and V0.15 tests remain passing.

## Evidence and Boundaries

- `type-check-test-matrix.md` cases pass with exact diagnostic code/message/
  line/column assertions where applicable.
- Focused type-check, parser/evaluator/module compatibility suites and
  `bunx tsc --noEmit` pass. Broader verification, if required by the approved
  plan, is recorded with raw outcomes.
- `builder-evidence.md` records authorization, changed paths, commands,
  results, residuals, and not-run checks. Sprint 095-097 accepted evidence is
  unchanged.
- No runtime redesign, formatter/editor, user-facing documentation/examples,
  release/version change, publication, or platform certification occurs.
- A separate Sprint 098 disposition is recorded. This does not authorize
  Sprints 099-101 or release.