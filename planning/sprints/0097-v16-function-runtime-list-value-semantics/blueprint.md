# Sprint 097 Blueprint: V0.16 Function Runtime and List Value Semantics

## Approach

1. Resolve the blocking prerequisite before any implementation: obtain an
   explicit D-095-13 allocation for the defensive function-fallthrough
   diagnostic (code, exact message, category/phase, and source anchor), then
   obtain separate Sprint 097 execution authorization and approval of the
   concrete source/test/evidence path plan. Preserve the initial worktree and
   Sprint 095/096 evidence.
2. Read the accepted Sprint 095 contract and Sprint 096 AST/evidence. Treat
   their statements about return propagation, lexical scope, list copying,
   expression-loop behavior, and diagnostics as locked.
3. Add a dedicated runtime return signal carrying the evaluated result and
   function-body source. Throw it from a function-body `returnStatement`
   when the current evaluation is inside a statement-body call. Catch it only
   around evaluation of that function's statement body in `evalFunctionCall`.
   Do not use `ConditionalValueReturn` or `ForExpressionReturn` for function
   exit.
4. Preserve the existing expression-body branch exactly. For statement
   bodies, execute their statements in the existing isolated call frame.
   Let the function signal pass through `evaluateScopedStatements`,
   `evalBracedIfStatement`, and `withLoopBinding` so their `finally` cleanup
   executes, then catch it at the call boundary. Validate/return the result
   consistently with the existing function-result runtime boundary where
   available; static return compatibility is Sprint 098.
5. After D-095-13 allocation, if statement-body evaluation completes without
   a return signal, raise the allocated diagnostic at the AST's closing-brace
   source. Do not return `undefined`, `null`, or another success-shaped value.
6. Implement a private recursive list-value copy at parameter binding:
   - For an array, return a new array with each item passed recursively to the
     same helper.
   - For a non-array value, return the value unchanged.
   - Apply the helper independently for each parameter whose declared type is
     a list (including nested lists). Repeated caller arguments are copied
     separately, not deduplicated by identity.
   - Decide nullable-list handling from the accepted type representation:
     preserve `null`; copy a non-null array if the nullable type denotes a
     list. If that interpretation is not explicit in the accepted contract,
     request product-owner confirmation before treating it as locked.
7. Fix runtime lexical scope at statement-block boundaries without losing
   assignments to existing outer locals. A scoped block must restore prior
   values for names it declares/shadows and delete names introduced only in
   that block. Do not restore unrelated outer bindings mutated by assignment.
   For loop iterations, scope body locals per iteration and restore the
   iterator/any shadowed value even when a function return signal escapes.
8. Use the focused matrix in `runtime-test-matrix.md`. Since
   `evaluateDocument` type-checks first, create test helpers that parse source,
   seed an `Environment`, and execute AST statements with the exported
   `evaluateStatements` path. Keep this test-only bypass out of production
   paths. Run expression-body regressions through the standard path as well.
9. Run focused runtime tests and a no-output TypeScript check. Record every
   exact command, outcome, changed path, residual, and not-run gate in
   `builder-evidence.md`. Do not claim Sprint 098 acceptance.

## Runtime Control-Flow Invariants

- A statement-body function return is a non-local exit to the nearest
  function call, not merely to the current if, loop, or `evaluateStatements`
  iteration.
- The return expression is evaluated exactly once before the signal is
  raised. Its value is delivered directly as the call result.
- A statement-loop return exits before the next iteration. The loop's
  iterator restoration and scoped local cleanup still run.
- A function return is rethrown by expression-loop and braced-if expression
  handlers unless it is their own established return signal. Those existing
  mechanisms must not collect or consume a function result.
- A return-like statement inside a braced-if expression remains a value
  return for that expression; subsequent function-body statements may run.
- A direct function return after an unconditional earlier return is not
  evaluated at runtime; Sprint 098 will still type-check it statically.

## List-Copy Invariants

| Input value at a list parameter | Local parameter value |
| --- | --- |
| `[]` | New empty array. |
| Flat array of primitives | New outer array; primitive elements unchanged. |
| Nested arrays | New arrays at every array depth. |
| Array containing record/Measurement/object values | New array structure; each non-array element is the original value. |
| Same array supplied to two list parameters | Two independently copied array trees. |
| Nullable list with `null` | Preserve `null`; do not manufacture an array. |
| Non-list parameter | Existing value semantics, unchanged. |

Do not use `structuredClone`, JSON serialization, or a generic object clone:
those would violate the approved opaque-element boundary and can change
Measurement/record representations.

## Expected Files and Surfaces

- Primary runtime: `src/runtime/evaluateExpression.ts` and, only if necessary,
  `src/runtime/environment.ts`.
- Focused tests: `tests/evaluator.test.ts`; add a test file only if the
  repository's established test organization requires it and the approved
  file plan names it.
- Diagnostic registration/factory edits only after exact D-095-13 allocation;
  the allocated code/message must be documented before any such edit.
- Avoid production changes to `src/typechecker/checkDocument.ts` in this
  sprint except a separately approved runtime integration dependency; normal
  return checking remains Sprint 098.

## Verification

- Focused runtime: run the relevant `tests/evaluator.test.ts` cases and the
  whole focused evaluator file if practical.
- Typecheck: `bunx tsc --noEmit`.
- Repository-wide tests are not required for Sprint 097 unless the approved
  plan or observed blast radius requires them. If run, preserve exact raw
  failures and do not alter unrelated tests.
- Use `git diff --check` and `git status --short --branch`; verify no Sprint
  095/096 artifacts or generated outputs were altered.

## Notes

Sprint 098 may proceed in parallel after Sprint 096 under the master plan,
but Sprint 097 itself cannot begin until the D-095-13 diagnostic allocation
and its separate execution gates are recorded.