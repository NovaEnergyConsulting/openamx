# Sprint 098 Builder Evidence: Return-Path and Type Checking

## Status

**IMPLEMENTED; BUILDER RECOMMENDATION: ACCEPT, PENDING SEPARATE DISPOSITION.**
Sprint 098 execution was explicitly authorized and the exact
checker/test/evidence file plan was approved by the user on 2026-10-24 before
edits.

- Sprint 096 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24.
- Sprint 097 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24.
- D-095-13 runtime-fallthrough allocation: RESOLVED in Sprint 097 as
  `AMXF4002: Function finished without returning a valid expression`;
  do not reuse `AMX1007`.
- Static missing-return diagnostic: accepted allocation
  `AMXF4001: Missing return value from function`; registered and emitted by
  the Sprint 098 checker at the function closing brace.
- Sprint 098 execution authorization: APPROVED, 2026-10-24.
- Approved paths: `src/typechecker/checkDocument.ts`,
  `src/diagnostics/errors.ts`, new `tests/functionBodyTypeChecking.test.ts`,
  and this evidence file. After the initial module blocker was separately
  dispositioned, the user explicitly approved a narrow parser follow-up on
  2026-10-24: `src/parser/parseStatements.ts` and `tests/parser.test.ts`, with
  the existing module suite used as the integration gate. Runtime and
  accepted Sprint 095-097 artifacts remained outside scope.
- Starting branch/worktree: `feat/create-v0.16`, clean before implementation.
- Sprint 095 accepted contract and Sprint 096/097 accepted implementations
  were preserved. Sprint 095 historical D-095-13 text was not rewritten.
- Sprint 098 disposition: ACCEPTED/CLOSED by the user on 2026-10-24 after the
  parser follow-up resolved R-098-02 and the final focused gates passed.
- Runtime/parser implementation, formatter/editor/docs/examples, release,
  and publication: NOT RUN / OUT OF SCOPE for this sprint.

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Entry authorization and approved file plan | User explicitly authorized Sprint 098 and approved the exact four-path plan before edits. | PASS | This evidence file; approval in session | None |
| E-02 | Expression-body compatibility | Statement-body dispatch was added as a separate branch; expression-body checking remains on its existing path. New expression-body regression passes. | PASS | `tests/functionBodyTypeChecking.test.ts` | None |
| E-03 | Explicit return type validation | Compatible scalar, nullable, list, and measurement returns pass; incompatible scalar, measurement, and unreachable returns assert exact code/message/source. | PASS: 19 focused tests, 55 assertions | `bun test tests/functionBodyTypeChecking.test.ts` | None |
| E-04 | Sequence/if/else all-path analysis | Direct return, complete nested branches, missing alternate, nested partial branch, and later fallback cases pass. | PASS | Focused test output | None |
| E-05 | Zero-iteration loop and later-return analysis | Loop-only return reports missing return; later fallback closes the path. Iterator type is restored after its scope. | PASS | Focused test output | None |
| E-06 | Unreachable statement/return checking | Unreachable incompatible return and unknown assignment are diagnosed; a valid unreachable mutation does not reopen flow or warn. | PASS | Focused test output | None |
| E-07 | Lexical scope and module compatibility | Branch-local escape, nested shadow, repeated `let`, assignment/`+=`, parameter isolation, forward references, recursion, and captures covered. Imported expression-body module case passes after the parser boundary fix. | PASS: module suite included in 100-test parser/module run | `tests/functionBodyTypeChecking.test.ts`; `tests/modules.test.ts` | None |
| E-08 | AMXF4001 exact diagnostic/source locations | Exact code/message and closing-brace line/column asserted for LF and CRLF; incompatible-return point asserted for LF and CRLF. | PASS | Focused test output | None |
| E-09 | AMXF4002 runtime and AMX3021 expression regressions | Evaluator suite passes, including Sprint 097 runtime fallthrough and existing braced-if-expression behavior. | PASS: 104 tests, 393 assertions | `bun test tests/evaluator.test.ts` | None |
| E-10 | Focused tests and TypeScript check | Combined checker/type-check/evaluator/parser gate passes; initial TS iterator narrowing error was fixed and the final check is clean. | PASS: 193 tests/0 failures; `bunx tsc --noEmit` emits no output | Terminal and editor diagnostics in this session | None |
| E-11 | Parser/module regression and blocker resolution | Added regression for an exported expression-bodied function followed by a record constructor. `findFunctionEnd` now stops after a complete one-line expression body; multiline braced expressions retain the existing scan path. The imported module case now passes. | PASS: parser/module suites 100/100; combined parser gate also passes | `src/parser/parseStatements.ts`; `tests/parser.test.ts`; `tests/modules.test.ts` | None |
| E-12 | Formatter/editor/docs/release integration | Out of Sprint 098 scope. | NOT RUN by design | Sprint 098 acceptance | Sprints 099-101 |
| E-13 | Initial Sprint 098 disposition | User initially chose `BLOCKED/OPEN` while R-098-02 remained unresolved. The parser follow-up was later separately authorized and resolved the blocker; final disposition is pending. | HISTORICAL, 2026-10-24 | User disposition and subsequent scope amendment | None |
| E-14 | Parser scope amendment and blocker resolution | User separately approved the parser source/test expansion before edits. The regression now passes and the module gate is green; the earlier block basis is cleared. | PASS | This evidence file and final verification below | None |
| E-15 | Separate Sprint 098 disposition | User separately ACCEPTED/CLOSED Sprint 098 after reviewing the completed evidence. | ACCEPTED/CLOSED, 2026-10-24 | User disposition in this session | None |

## Changed-Path Ledger

Record the approved paths, any separately approved expansion, and the reason
for each edit. Preserve accepted Sprint 095-097 evidence.

| Path | Approved purpose | Change/evidence |
| --- | --- | --- |
| `src/typechecker/checkDocument.ts` | Dedicated statement-body function checker, return-flow summary, lexical branch/loop scopes, `AMXF4001` emission; expression-body path unchanged. | Implemented; focused and compatibility checks recorded above. |
| `src/diagnostics/errors.ts` | Add `AMXF4001` to the static diagnostic code type. Preserve runtime `AMXF4002`. | Implemented; TypeScript and evaluator regressions pass. |
| `tests/functionBodyTypeChecking.test.ts` | Focused return-flow, return type, source-location, scope, context-boundary, and compatibility matrix. | Added; 19 tests, 0 failures, 55 assertions. |
| `src/parser/parseStatements.ts` | Stop function-end scanning when a one-line expression body parses completely, preventing later record constructors from being absorbed. | Added in the separately approved parser follow-up; parser/module regressions pass. |
| `tests/parser.test.ts` | Cover exported expression function followed by an exported record constructor binding. | Added; regression passes and existing multiline braced-match coverage remains green. |
| `planning/sprints/0098-v16-return-path-type-checking/builder-evidence.md` | Record authorization, exact paths, verification, and residuals. | Updated. |

## Decisions and Residuals

Do not reopen accepted decisions or silently change diagnostic identities.
If implementation discovers an ambiguity, stop at the affected contract
boundary and request explicit disposition before changing expected behavior.

| ID | Residual | Status | Owner | Impact |
| --- | --- | --- | --- | --- |
| R-098-01 | Sprint 098 execution authorization/file plan | RESOLVED before edits; approved 2026-10-24. | Lead Developer/product owner | Gate satisfied. |
| R-098-02 | `findFunctionEnd` previously scanned beyond a valid one-line expression function and treated a later record-constructor brace as part of that function, causing the module loader's imported expression-function fixture to fail parsing. | RESOLVED by the separately approved parser follow-up; regression and module suites pass. | Sprint 098 Builder | No remaining parser/module blocker. |

Verification commands and exact outcomes:

- `bun test tests/functionBodyTypeChecking.test.ts` — PASS, 19 tests, 0
  failures, 55 assertions.
- `bun test tests/functionBodyTypeChecking.test.ts tests/isTypeChecking.test.ts tests/evaluator.test.ts tests/parser.test.ts` — PASS, 193 tests, 0
  failures across four files.
- `bun test tests/isTypeChecking.test.ts` — PASS, 11 tests, 0 failures, 47
  assertions.
- `bun test tests/evaluator.test.ts` — PASS, 104 tests, 0 failures, 393
  assertions.
- `bun test tests/parser.test.ts tests/modules.test.ts` — PASS, 100 tests, 0
  failures across two files.
- `bunx tsc --noEmit` — PASS, no output after fixing one local iterator
  narrowing error found on the first run.
- `get_errors` on the checker, diagnostics, and checker-test files — PASS, no
  errors before the parser follow-up; final `bunx tsc --noEmit` passes with
  parser changes included.
- `git diff --check` — PASS, no whitespace errors.

Builder recommendation: **ACCEPT**. User disposition: **ACCEPTED/CLOSED**,
2026-10-24. R-098-02 is resolved and all approved focused gates pass. This
does not claim V0.16 integrated acceptance or authorize release/publication.