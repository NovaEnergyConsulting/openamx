# Sprint 097 Builder Evidence: Function Runtime and List Value Semantics

## Status

**ACCEPTED/CLOSED WITH RECORDED RESIDUALS.** The Lead Developer/product owner
recorded the separate Sprint 097 disposition on 2026-10-24. Sprint 096 is
accepted. D-095-13 was allocated and Sprint 097 execution and the exact
four-path plan were separately authorized before implementation.

- Sprint 096 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24.
- D-095-13 allocation: approved by Lead Developer/product owner during this
    handoff. Code `AMXF4002`; exact message `Function finished without returning
    a valid expression`; category/phase `Runtime`; primary source anchor is the
    function body's existing closing brace; `AMX1007` is not reused.
- Sprint 097 execution authorization: explicitly approved conditionally on
    the diagnostic allocation, before implementation.
- Approved paths: `src/runtime/evaluateExpression.ts`,
    `src/diagnostics/errors.ts`, `tests/evaluator.test.ts`, and this evidence
    file. No `src/runtime/environment.ts` change was needed.
- Starting branch/worktree: `feat/create-v0.16`, clean before implementation.
- Sprint 097 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
    Lead Developer/product owner, 2026-10-24.
- Runtime implementation/tests: IMPLEMENTED; focused and evaluator checks pass.
- Return-path/type checking (`AMXF4001`), formatting, editor, docs/examples,
  release, and publication: NOT RUN / OUT OF SCOPE for Sprint 097.

## Diagnostic Allocation Record

Do not fill from inference or current runtime behavior. Complete only after a
separate Lead Developer/product-owner decision.

| Field | Approved value |
| --- | --- |
| D-095-13 disposition date/approver | 2026-10-24; Lead Developer/product owner via handoff decision. |
| Diagnostic code | `AMXF4002` |
| Exact message | `Function finished without returning a valid expression` |
| Diagnostic category/phase | Runtime |
| Primary source anchor | Existing closing brace of the statement function body. |
| Confirmation that `AMX1007` is not reused | Explicitly confirmed. |

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | D-095-13 allocation and entry authorization | Allocated; conditional execution authorization and four-path plan approved before edits. | PASS / gate closed before implementation. | This decision record and changed-path ledger. | Lead Developer/product owner |
| E-02 | Isolated call-frame execution | Statement-body calls execute in `Environment.createCallFrame`; caller bindings remain unchanged. | PASS: focused assignment/caller-isolation test. | `tests/evaluator.test.ts`; evaluator output. | Sprint 097 Builder |
| E-03 | Direct/nested/loop return propagation | Dedicated `FunctionBodyReturn` is caught only at the statement-function call boundary; nested branch/loop tests cover unwind and fallback. | PASS: focused matrix, 15 tests. | `src/runtime/evaluateExpression.ts`; `tests/evaluator.test.ts`. | Sprint 097 Builder |
| E-04 | Expression-body and expression-return regressions | Existing checked expression-body test, expression-loop collection and braced-if value-return tests remain passing. | PASS: complete evaluator suite. | `tests/evaluator.test.ts`; command output. | Sprint 097 Builder |
| E-05 | Lexical scope/shadow/iterator cleanup | Declaration-time snapshots restore shadowed values; assignments to visible outer locals remain; loop cleanup runs through `finally`. | PASS: focused shadow/iterator tests and full evaluator suite. | `src/runtime/evaluateExpression.ts`; `tests/evaluator.test.ts`. | Sprint 097 Builder |
| E-06 | Recursive and repeated list argument copies | Array trees are copied recursively and independently at each list parameter boundary; nullable list decision preserves null and copies non-null arrays; non-array values retain identity. | PASS: nested, repeated, nullable, and opaque-element assertions. | `src/runtime/evaluateExpression.ts`; `tests/evaluator.test.ts`. | Sprint 097 Builder; nullable semantics approved during handoff. |
| E-07 | Local list mutation and returned list values | Local mutation result is returned directly; post-return mutation does not execute. | PASS: focused list tests. | `tests/evaluator.test.ts`; command output. | Sprint 097 Builder |
| E-08 | Defensive runtime fallthrough diagnostic | Throws allocated `AMXF4002` with exact message at `closingSource`; no fabricated return value. | PASS: exact diagnostic, file, line, and column asserted. | `src/diagnostics/errors.ts`; `src/runtime/evaluateExpression.ts`; `tests/evaluator.test.ts`. | Sprint 097 Builder |
| E-09 | Focused runtime tests and TypeScript check | `bun test tests/evaluator.test.ts --test-name-pattern "Sprint 097 statement-body functions"`; `bun test tests/evaluator.test.ts`; `bunx tsc --noEmit`. | PASS: 17 focused tests / 27 assertions; 104 evaluator tests / 393 assertions; typecheck has no output. | Final command output in session. | Sprint 097 Builder |
| E-10 | Static return checking, editor, docs/examples, release | Excluded by Sprint 097. | NOT RUN by design. | Sprint 097 acceptance. | Sprints 098-101 |
| E-11 | Final path and whitespace audit | `git diff --check`; `git status --short --branch`; `git diff --name-only`. | PASS: no whitespace errors; branch `feat/create-v0.16`; exactly the four approved paths listed below are modified. | Final command output in session. | Sprint 097 Builder |

## Changed-Path Ledger

Record the approved paths and any separately approved expansion. No Sprint
095/096 accepted records or unrelated paths were edited.

| Path | Approved purpose | Change/evidence |
| --- | --- | --- |
| `src/runtime/evaluateExpression.ts` | Statement-function return signal/call-boundary catch, call-local list copies, fallthrough source handling, scoped block and loop cleanup. | Changed; focused matrix and full evaluator suite pass. |
| `src/diagnostics/errors.ts` | Throw the allocated `AMXF4002` runtime diagnostic. | Changed; exact identity/message/source asserted. |
| `tests/evaluator.test.ts` | Test-only parser/Environment/`evaluateStatements` harness and Sprint 097 runtime matrix cases. | Changed; 17 focused cases pass. |
| `planning/sprints/0097-v16-function-runtime-list-value-semantics/builder-evidence.md` | Record authorization, diagnostic allocation, exact changed paths, commands/results, and residuals. | Changed. |

## Verification Boundaries

- The statement-body harness parses complete AMX code fences and calls
    exported `evaluateStatements` with a fresh `Environment`; it bypasses
    `checkDocument` only in tests because statement-body checking belongs to
    Sprint 098. Production evaluation/checking paths were not weakened.
- A first focused matrix run exposed comma-style `add` statements in the new
    tests; those test statements were corrected to the existing `add <value> to
    <list>` grammar. No parser source or accepted Sprint 095/096 record changed.
- The first TypeScript run exposed callback narrowing; the body was bound to a
    local discriminated value and the final `bunx tsc --noEmit` passed.
- The repository-wide test suite was not run; the approved plan requires the
    focused evaluator file and TypeScript check, both of which pass.
- No generated artifacts, Sprint 095/096 evidence, typechecker behavior,
    examples, specifications, release files, or publication paths were changed.

## Residuals and Recommendation

| ID | Residual | Status | Owner | Downstream impact |
| --- | --- | --- | --- | --- |
| D-095-13 | Defensive runtime-fallthrough diagnostic allocation. | RESOLVED before implementation: `AMXF4002`, `Function finished without returning a valid expression`, Runtime, function closing brace; do not reuse `AMX1007`. | Lead Developer/product owner | Gate closed. |
| R-097-01 | Nullable-list parameter copy interpretation. | RESOLVED before nullable-list test: preserve null; recursively copy non-null arrays. | Product owner | Covered by focused test. |
| R-097-02 | Separate Sprint 097 disposition. | RESOLVED: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, Lead Developer/product owner, 2026-10-24. | Lead Developer/product owner | Sprint 097 accepted with listed residuals. |
| R-097-03 | Repository-wide test suite not run. | RECORDED RESIDUAL; focused evaluator suite and TypeScript check pass; repository-wide tests were not required by the approved plan. | Lead Developer/product owner | No broader-suite claim. |

Builder recommendation: **ACCEPTED/CLOSED WITH RECORDED RESIDUALS** by the
Lead Developer/product owner on 2026-10-24. The repository-wide test suite was
not run; Sprint 098 behavior remains out of scope.