# Sprint 098 Blueprint: V0.16 Return-Path and Type Checking

## Approach

1. Obtain separate Sprint 098 execution authorization and approval of the
   concrete checker/test/evidence file plan. Preserve the starting worktree
   and all accepted Sprint 095-097 records.
2. Read the accepted function-body contract and fixtures first. Confirm the
   two resolved diagnostic authorities: static missing return is
   `AMXF4001: Missing return value from function`; defensive runtime
   fallthrough is `AMXF4002: Function finished without returning a valid
   expression`. The later Sprint 097 disposition resolves the D-095-13
   residual recorded in earlier Sprint 095 documents; do not rewrite those
   historical records.
3. Preserve the expression-bodied function checking branch in
   `checkDocument.ts`. Add a distinct branch for
   `FunctionBodyNode.kind === 'statements'`; do not infer body form from
   source text or share statement-flow semantics with expression-bodied
   functions.
4. Introduce a function statement-checking routine that carries:
   - the declared return type;
   - a flow summary indicating whether at least one reachable continuation
     can fall through;
   - the existing type-binding environment and lexical scope behavior.
   Keep type checking and flow summarization explicit and independently
   understandable.
  Handle `returnStatement` directly in this function-aware walker (or pass
  an explicit return context into a shared helper). The generic
  `checkStatement` path currently treats a return as valid only inside an
  expression loop; do not let its existing `loopDepth` condition reject a
  valid function return or accidentally treat every loop return as a
  function return.
5. Use the accepted flow composition rules:
   - A return expression is inferred with the declared return type as its
     expected type; the statement terminates its reachable path.
   - A statement sequence checks every child in source order. Once all paths
     are terminated, later children are unreachable for flow, but are still
     type-checked. Their flow result cannot restore reachability.
   - An if without else always has a possible false-path fallthrough. With an
     else, it terminates only if both branch summaries terminate.
   - A statement for-loop always may fall through because it can run zero
     iterations. Check its body under the iterator's element type and loop
     scope, but do not treat its returns as expression-loop collected values.
   - Nested if/else inside a loop or branch uses the same function-flow rules.
   - The function walker checks each statement-form if branch in an isolated
     binding scope and each statement-form loop body in an iterator scope.
     Do not use `checkIfExpressionBranch` for statement functions: that helper
     returns a merged expression type and emits `AMX3021`, whose contract is
     specific to braced-if expressions.
6. Reuse or narrowly generalize existing binding-scope helpers. A branch
   scope starts from visible bindings, allows same-scope let update and
   nested shadowing, then restores the prior environment. Loop iterators
   shadow/restore the prior type. Assignment/`+=` validates an existing
   visible name and its type. Sibling branch declarations never leak.
7. Ensure all expressions/statements are checked, even when unreachable.
   Return expressions in a braced-if expression continue through
   `checkIfExpressionBranch` and `AMX3021`; they are not function flow returns.
   Expression-form loops continue through `checkLoop`'s collection logic and
   the accepted function-placement prohibition remains in force.
8. Add `AMXF4001` to the static diagnostic type/factory and emit it using the
   AST's `closingSource`. Keep runtime `AMXF4002` in its runtime diagnostic
   factory and preserve its existing evaluator test.
9. Use `type-check-test-matrix.md`, preferably in one focused
   `tests/functionBodyTypeChecking.test.ts` file unless the approved plan
   selects an existing suitable type-check test file. Include the accepted
   runtime/parser regression tests as guards; do not reimplement their
   behavior.
10. Run the focused type-check tests, parser/evaluator compatibility tests,
    and `bunx tsc --noEmit`. Record exact commands/results/changed paths in
    `builder-evidence.md`; do not claim editor or version closeout.

## Flow Summary Model

Recommended representation: one Boolean meaning “a reachable path can
continue past this statement sequence.” Avoid a Boolean named `returns`
unless its meaning across loops and partial branches is unambiguous.

| Statement | Possible fallthrough summary |
| --- | --- |
| Ordinary local declaration/assignment/list mutation | `true` |
| `return expression` | `false` after checking expression type |
| If without else | `true` (the condition may be false), regardless of consequent summary |
| If with else | `consequentFallsThrough OR alternateFallsThrough` |
| Statement-form loop | `true` (zero iterations remain possible), after checking body |
| Sequence | Start `true`; while reachable, use child summary; once false, keep false but still check later children |

The function is valid only if the final sequence summary is `false`. An
expression-form loop is not a statement-flow node and keeps its existing
separate return collection/type behavior.

## Source and Diagnostic Rules

- Missing return: `AMXF4001`, exact message `Missing return value from
  function`, at `FunctionBodyNode.closingSource`.
- Incompatible explicit return: `AMX3002`, exact message produced by
  existing type mismatch helper (fixture: `Expected Number, got String`),
  primary source at the return expression.
- Unknown/out-of-scope binding: existing `AMX3001` at the identifier/target,
  including unreachable statements.
- Unknown/forward/recursive function: existing `AMX3004` at the call,
  including unreachable expressions that are still checked.
- Runtime fallthrough remains `AMXF4002`, `Function finished without
  returning a valid expression`, at the closing-brace source. Static checking
  should prevent valid source from reaching it.
- Preserve raw fixture source anchors from Sprint 095 and the repository's
  1-based line/column, LF/CRLF, and UTF-16 conventions.

## Expected Files and Surfaces

- Primary checker/diagnostic: `src/typechecker/checkDocument.ts`,
  `src/diagnostics/errors.ts`.
- Primary focused test: proposed `tests/functionBodyTypeChecking.test.ts` or
  an approved existing type-check test surface.
- Existing compatibility tests: `tests/evaluator.test.ts`,
  `tests/parser.test.ts`, `tests/modules.test.ts`, and focused type-check
  suites as required by the accepted fixtures.
- Do not edit parser/runtime implementation or editor hosts unless a concrete
  checker integration defect cannot be corrected within the approved paths;
  seek separate path-plan approval before expanding.

## Verification

- `bun test tests/functionBodyTypeChecking.test.ts` (or approved focused
  target), plus focused parser/evaluator/module compatibility suites.
- `bunx tsc --noEmit`.
- Run `git diff --check` and inspect final changed paths. No release/build
  generation is required; if any command writes generated artifacts, inspect
  and approve its output boundary first.

## Notes

Sprint 098 depends on Sprint 096 and is parallel with Sprint 097 in the
master plan. Both are now accepted. This sprint does not close V0.16; Sprints
099-101 remain independently gated.