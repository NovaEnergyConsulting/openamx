# Sprint 096 Builder Evidence: Function AST and Parser

## Status

**ACCEPTED/CLOSED WITH RECORDED RESIDUALS** by the product owner on
2026-10-24. Sprint 095's contract is accepted. Sprint 096 execution was
separately authorized on 2026-10-24, and the initial six-path
implementation/evidence plan was approved. Four compiler-identified AST
consumers and one stale evaluator-test assertion were added only after
separate explicit approval.

- Sprint 095 contract disposition: `ACCEPTED/CLOSED`, 2026-10-23.
- Sprint 096 execution authorization: APPROVED, 2026-10-24.
- Initial approved paths: `src/ast/types.ts`, `src/parser/parseStatements.ts`,
  `src/parser/parseIf.ts`, `src/parser/parseFor.ts`, `tests/parser.test.ts`,
  and this evidence file.
- Approved compiler-driven expansion: `src/editor/highlighting.ts`,
  `src/editor/symbols.ts`, `src/runtime/evaluateExpression.ts`, and
  `src/typechecker/checkDocument.ts`, limited to form narrowing and explicit
  deferral of statement-body semantics.
- Approved stale-assertion expansion: `tests/evaluator.test.ts`, one expected
  diagnostic message only.
- Starting branch/worktree: `feat/create-v0.16`, clean
  (`git status --short --branch` showed only the branch line).
- Preservation boundary: Sprint 095 accepted files, generated artifacts, and
  unrelated files were not edited.
- Sprint 096 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  product owner, 2026-10-24.
- Runtime execution, type checking, formatter/editor behavior, user docs,
  examples, release, and publication: NOT RUN / NOT AUTHORIZED by Sprint 096.
- Sprint 097 remains blocked by D-095-13 until its defensive runtime-
  fallthrough diagnostic identity/message is allocated.

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Discriminated function-body AST | Added `FunctionBodyNode` with `expression` and `statements` variants; expression payload remains the existing `V02ExpressionNode`. | Implemented; parser assertions confirm both variants. | `src/ast/types.ts`; `tests/parser.test.ts` | Runtime/checker semantics remain deferred. |
| E-02 | Expression-body compatibility | Existing expression parser path retained; function-body parser test now asserts the discriminated wrapper and original expression node. | PASS in final parser suite; compatibility suite also passes. | `tests/parser.test.ts` | Existing expression behavior preserved. |
| E-03 | Statement-body grammar and function returns | Reused statement parser for `let`, assignment, `+=`, statement if/else, statement for, list add/remove, and return. Added independent `allowFunctionReturn`; it propagates through statement if/for but not expression contexts. | PASS: positive AST/source-order tests and nested direct/if/for return tests. | `src/parser/parseStatements.ts`, `src/parser/parseIf.ts`, `src/parser/parseFor.ts`, `tests/parser.test.ts` | No runtime propagation or return analysis implemented. |
| E-04 | Return-context isolation | Parser tests distinguish expression-loop returns and braced-if expression branch returns from statement-function returns. Existing expression-loop collection tests remain passing. | PASS in final parser and compatibility suites. | `tests/parser.test.ts`, `tests/evaluator.test.ts` | Function-local expression-loop placement remains checker-owned; no new checker behavior claimed for statement bodies. |
| E-05 | Prohibited syntax and loop control | Tests cover all 12 accepted prohibited statement/action categories plus nested `fn`; all reported starts are line 2, column 3. Half-open keyword spans are `import`/`export` `[3,9)`, `type`/`enum`/`unit`/`show` `[3,7)`, `dimension` `[3,12)`, `input`/`table` `[3,8)`, `chart` `[3,8)`, `diagram` `[3,10)`, and nested `fn` `[3,5)`. Nested loops, `break`, and `continue` remain rejected. | PASS. | `src/parser/parseStatements.ts`, `tests/parser.test.ts` | Existing nested-loop/control-flow rejection messages are retained. |
| E-06 | Malformed, unclosed, separator, suffix, and invalid-return diagnostics | Tests assert malformed `=` at line 2, column 7 (half-open token span `[7,8)`); unclosed opening `{` at line 1, column 34 (`[34,35)`); same-line trailing `trailing` at line 1, column 33 (`[33,41)`); semicolon at line 2, column 16 (`[16,17)`). Invalid-context `return` anchors are direct line 1, column 1 (`[1,7)`); statement-if line 2, column 3 (`[3,9)`); and statement-for line 2, column 1 (`[1,7)`). Diagnostics expose the approved 1-based start point; spans are fixture token spans with exclusive ends. | PASS in final parser suite. | `src/parser/parseStatements.ts`, `src/parser/parseFor.ts`, `tests/parser.test.ts` | No semicolon is accepted as a statement separator. |
| E-07 | Body boundary and original source locations | Matching braces use string-aware scanning, preserve following top-level statements, and store opening/closing locations. Tests cover single/double quotes, escaped quotes, adjacent close braces, LF/CRLF fenced documents, and a non-BMP UTF-16 prefix. | PASS in final parser suite. | `src/parser/parseStatements.ts`, `tests/parser.test.ts` | Positions are 1-based; diagnostic API remains point-only. |
| E-08 | Focused parser suite | `bun test tests/parser.test.ts` | **PASS:** 58 tests, 0 failures, 231 assertions in the final run. | Terminal output in this session. | None for parser acceptance. |
| E-09 | Runtime/checker/editor compatibility | `bun test tests/evaluator.test.ts tests/isTypeChecking.test.ts tests/editor.test.ts` | **PASS:** 122 tests, 0 failures, 674 assertions after updating one stale diagnostic expectation. | Terminal output in this session. | Statement-body execution/checking/editor features remain deferred. |
| E-10 | TypeScript and combined focused gate | `bunx tsc --noEmit`; `bun test tests/parser.test.ts tests/evaluator.test.ts tests/isTypeChecking.test.ts tests/editor.test.ts` | **PASS:** TypeScript emitted no output; combined suite passed 180 tests, 0 failures, 905 assertions. | Terminal output in this session. | Full repository suite not run. |
| E-11 | Intermediate validation and correction | Initial typecheck identified seven errors in the four approved consumer paths; after approval and narrowing adapters, it passed. Initial compatibility run found one stale old-message assertion; after approval/update, 122 tests passed. Focused checks exposed and fixed semicolon and same-line source offsets, statement-loop invalid-return context, and expression-loop permission leakage into statement loops. | Resolved; no known failing focused check remains. | Compiler/test outputs in this session. | None. |
| E-12 | Runtime/type checker/editor feature acceptance and later work | Statement-body functions are not executed, return compatibility/all-path checking is not implemented, no editor features are added, and docs/examples/release work is untouched. | NOT RUN by design / out of scope. | Sprint 096 acceptance. | Sprints 097-100; Sprint 097 remains blocked on D-095-13. |
| E-13 | Final whitespace and path-boundary audit | `git diff --check`; `git status --short --branch`; `git diff --name-only` | **PASS:** no whitespace errors; exactly 11 modified paths, all listed below; no Sprint 095 accepted artifact or unrelated file changed. Branch remains `feat/create-v0.16`. | Final terminal output in this session. | Worktree changes remain uncommitted. |
| E-14 | VS Code file diagnostics | `get_errors` on all changed source and test paths | **PASS for changed source files.** Test files additionally report missing editor-visible `bun:test`/`Bun` typings and the existing `ViewEmission.labels` union access in `tests/evaluator.test.ts` line 473. Bun execution and `bunx tsc --noEmit` pass. | Editor diagnostics in this session; evaluator line 473 is outside the edited assertion. | Existing test-language-service/config discrepancy; not changed in this sprint. |

## Changed-Path Ledger

Record exact approved paths and the reason each was edited. List any
unexpected consumer path separately and record the authorization used before
editing it.

| Path | Approved purpose | Change/evidence |
| --- | --- | --- |
| `src/ast/types.ts` | Explicit expression-vs-statement body union with brace locations. | Changed; expression payload retained. |
| `src/parser/parseStatements.ts` | Braced function parsing, distinct return context, allowlist, boundary scan, source ranges, and exact AMX3006 diagnostics. | Changed; see E-03 through E-07. |
| `src/parser/parseIf.ts` | Pass independent function-return context through statement branches only. | Changed; expression parser path unchanged. |
| `src/parser/parseFor.ts` | Permit function returns in statement loops while preserving expression-loop return context and nested-loop restriction. | Changed; expression-form loop path unchanged. |
| `tests/parser.test.ts` | AST, grammar, diagnostics, boundaries, string handling, source locations, and context fixtures. | Changed; final parser suite PASS. |
| `src/editor/highlighting.ts` | Type-only body-form narrowing; expression highlighting unchanged. | Added after compiler errors and separate approval; no statement-body editor support. |
| `src/editor/symbols.ts` | Type-only body-form narrowing; expression symbol traversal unchanged. | Added after compiler errors and separate approval; no statement-body editor support. |
| `src/runtime/evaluateExpression.ts` | Keep expression evaluation unchanged and refuse statement-body execution explicitly. | Added after compiler errors and separate approval; no function-body runtime semantics. |
| `src/typechecker/checkDocument.ts` | Preserve existing expression-body check and narrow it explicitly. | Added after compiler errors and separate approval; no statement-body checker behavior. |
| `tests/evaluator.test.ts` | Replace superseded top-level-return message expectation only. | Added after failing compatibility test and separate approval. |
| `planning/sprints/0096-v16-function-ast-parser/builder-evidence.md` | Record authorization, changed paths, exact evidence, diagnostics, residuals, and unrun gates. | This file. |

## Decisions, Residuals, and Recommendation

Do not reopen accepted Sprint 095 contract decisions. Record any parser
implementation limitation, exact failing fixture, owner, and downstream
impact. Do not allocate the Sprint 097 runtime diagnostic here.

| ID | Residual | Status | Owner | Impact |
| --- | --- | --- | --- | --- |
| D-095-13 | Runtime fallthrough diagnostic remains unallocated. | OPEN | Lead Developer/product owner | Sprint 097 blocked. |

| R-096-01 | Statement-body runtime execution and return propagation are not implemented. | OUT OF SCOPE | Sprint 097 | Parsing/AST acceptance is not runtime evidence. |
| R-096-02 | Explicit return typing and all-path return analysis are not implemented. | OUT OF SCOPE | Sprint 098 | `AMXF4001` is not registered or emitted here. |
| R-096-03 | Formatter, editor feature support, language docs/examples, release, and full-repository tests were not run. | NOT RUN / OUT OF SCOPE | Sprints 099-101 | No readiness/disposition implied for later sprints. |
| R-096-04 | VS Code test-file language-service diagnostics differ from Bun/tsc: Bun globals are unresolved and an unrelated existing evaluator test union access is flagged. | OPEN, NOT BLOCKING | Repository test tooling owner | Focused Bun tests pass; no unrelated test/config change made. |

Product-owner disposition: **ACCEPTED/CLOSED WITH RECORDED RESIDUALS**,
2026-10-24. Passing parser tests do not authorize Sprint 097/098 or release;
Sprint 097 remains blocked by D-095-13.