# Sprint 100 Builder Evidence: Language Specification and Examples

## Status

**ACCEPTED/CLOSED** by the user on 2026-10-24. The implementation and
acceptance evidence below remain bounded to Sprint 100; this disposition does
not claim integrated V0.16 acceptance or authorize release/publication.
Sprints 095-099 remain accepted with their recorded residuals. The user
separately authorized Sprint 100 execution and approved the exact path plan on
2026-10-24 before product-facing or test edits.

- Sprint 095 contract: `ACCEPTED/CLOSED`, 2026-10-23.
- Sprint 096: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, 2026-10-24.
- Sprint 097: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, 2026-10-24;
  D-095-13 resolved as runtime `AMXF4002`.
- Sprint 098: `ACCEPTED/CLOSED`, 2026-10-24; static missing return is
  `AMXF4001` at function closing brace.
- Sprint 099: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, 2026-10-24.
- Sprint 100 execution authorization: APPROVED, 2026-10-24.
- Approved Sprint 100 file/evidence plan: APPROVED, 2026-10-24; exact paths
  are listed below.
- Starting branch/worktree: `feat/create-v0.16`, clean
  (`git status --short --branch` showed only the branch line).
- Preservation boundary: accepted Sprint 095-099 evidence and existing
  generated outputs were not edited; the pre-existing `dist/` bundle was not
  rebuilt or overwritten.
- Sprint 100 disposition: ACCEPTED/CLOSED, user, 2026-10-24.
- Release, publication, version changes, and integrated V0.16 closeout: NOT
  RUN / NOT AUTHORIZED.

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Execution authorization and exact file plan | User separately authorized Sprint 100 and approved all 16 paths below before product/test edits, 2026-10-24. | PASS | This evidence file and session approval. | None |
| E-02 | V0.16 specification contract coverage | Added an additive specification covering both forms, statement grammar, returns/typing, lexical scope, list-copy boundaries, diagnostics, compatibility, and exclusions. | PASS: link/contract assertions in `tests/examples.test.ts`. | `docs/language-spec-v0.16.md`; root test output. | Sprint 100 Builder |
| E-03 | Valid reference and expression-body compatibility | Ran `examples/15_Function_Bodies.amx` through the source CLI and asserted its complete result object; lesson 03 retains its expected values. | PASS: expression 12; statement 14; nested outcomes, empty fallback, local scope, list-copy and return values exact. | `tests/examples.test.ts`; `tests/numbered-guide.test.ts`; root test output. | None |
| E-04 | Nested/loop return, scope, and list-copy values | Reference covers nested conditional returns, loop return/fallback, branch-local shadowing, parameter rebinding/iterator restoration, local-list return, nested arrays, and repeated arguments. | PASS: exact values asserted by root and desktop guide materialization tests. | `examples/15_Function_Bodies.amx`; focused tests. | None |
| E-05 | Negative missing-return diagnostic fixture | Ran only the invalid fixture and asserted code, message, file, line 11, column 1, and closing-brace token. | PASS: `AMXF4001: Missing return value from function`; never included in valid example execution. | `examples/fixtures/invalid/missing-function-return.amx`; `tests/examples.test.ts`; CLI output. | None |
| E-06 | Index/README/Help/extension discoverability | Added reference 15 under standalone references only; retained lessons 01-12 and references 13/14; updated README, desktop Help/search/UI, extension README, and stale desktop 00-14 guide copy. | PASS: root documentation/guide tests and Help UI test. | `examples/00_Table_of_Contents.amx`; READMEs; desktop Help/starter; tests. | None |
| E-07 | Desktop offline guide allowlist/parity/materialization | Explicitly allowlisted both additions; tested canonical/package parity, staging, offline materialization, and execution of only the valid reference in the materialized project. | PASS: `bun test src/bun/guideResources.test.ts src/mainview/starterExamples.test.ts`, 9 tests, 0 failures, 107 assertions. | Desktop terminal output; test output used temporary directories. | No packaged/native certification claimed. |
| E-08 | Focused root and desktop tests | `bun test tests/examples.test.ts tests/numbered-guide.test.ts`; from `desktop-app/`, `bun test src/bun/guideResources.test.ts src/mainview/starterExamples.test.ts`; `bun run test:ui -- tests/ui/help-center.pw.ts --output=test-results/sprint100-help-final`. | PASS: root 19 tests/700 assertions; desktop 9 tests/107 assertions; Help UI 2/2. | Terminal output; final Playwright output at `desktop-app/test-results/sprint100-help-final/`. | No repository-wide test suite run. |
| E-09 | Static checks, preservation, and whitespace | `bunx tsc --noEmit`; from `desktop-app/`, `bunx vue-tsc --noEmit`; `git diff --check`; `git status --short --branch`. | PASS: both typechecks emitted no output; no whitespace errors; exactly the 16 approved paths are changed on `feat/create-v0.16`. | Terminal output. | `dist/` intentionally unchanged; numbered-guide test uses source CLI for new reference because existing bundle is stale. |
| E-10 | Integrated V0.16 closeout/release/publication | Explicitly outside Sprint 100 scope. | NOT RUN by design. | Sprint 100 acceptance. | Sprint 101 / separate release authorization |
| E-11 | Separate Sprint 100 disposition | User reviewed the completed evidence and closed Sprint 100. | ACCEPTED/CLOSED, 2026-10-24. | User disposition in this session. | Sprint 101 integrated acceptance remains required. |

## Changed-Path Ledger

Record only the paths in the separately approved Sprint 100 plan. The
proposed list below is a planning checklist, not authorization.

| Path | Purpose | Change/evidence |
| --- | --- | --- |
| `docs/language-spec-v0.16.md` | Additive V0.16 contract. | Added; linked and contract assertions pass. |
| `examples/15_Function_Bodies.amx` | Approved input-free standalone reference. | Added; source CLI, formatting, and exact values pass. |
| `examples/fixtures/invalid/missing-function-return.amx` | Negative-only missing-return source. | Added; exact `AMXF4001` and closing-brace location pass. |
| `examples/00_Table_of_Contents.amx` | List reference 15 outside guided prerequisites. | Updated; guide index/navigation test passes; 00-14 names/roles retained. |
| `examples/03_Collections_and_Functions.amx` | Add non-sequential link to the reference. | Added cross-link only; original AMX and expected results pass unchanged. |
| `README.md` | V0.16 feature/spec/reference discovery. | Updated; link assertions pass. |
| `vscode-extension/README.md` | Current guide/spec/reference discovery. | Updated; link assertions pass. |
| `desktop-app/src/mainview/components/help-content.json` | Searchable V0.16 Help topic and 00-15 guide description. | Updated; topic IDs/search/content tests pass. |
| `desktop-app/tests/ui/help-center.pw.ts` | V0.16 Help search/content and guide description assertions. | Updated; 2 Playwright tests pass. |
| `desktop-app/src/mainview/starterExamples.ts` | Remove stale 00-14 guide description. | Updated to 00-15. |
| `desktop-app/src/mainview/starterExamples.test.ts` | Assert guide version copy. | Updated; included in passing desktop suite. |
| `desktop-app/src/bun/guideResources.ts` | Explicitly allowlist valid reference and invalid fixture. | Updated. |
| `desktop-app/src/bun/guideResources.test.ts` | Parity, staging, offline materialization, valid-reference execution. | Updated; included in passing desktop suite. |
| `tests/examples.test.ts` | Spec/help links, runtime values, expression compatibility, negative diagnostic. | Updated; focused root test passes. |
| `tests/numbered-guide.test.ts` | Reference classification/navigation and execution. | Updated; existing guided order retained; focused root test passes. |
| `planning/sprints/0100-v16-language-specification-examples/builder-evidence.md` | Record authorization, exact paths, tests, residuals, and disposition request. | Updated. |

## Decisions and Residuals

| ID | Item | Status | Owner | Impact |
| --- | --- | --- | --- | --- |
| R-100-01 | Sprint 100 authorization and exact file plan | RESOLVED: explicitly authorized and 16 paths approved, 2026-10-24. | User / Lead Developer | Gate satisfied before edits. |
| R-100-02 | Confirm `15_Function_Bodies.amx` standalone-reference role | RESOLVED: approved as a separate standalone reference, 2026-10-24. | User / Lead Developer | Existing 00-14 guide names and roles preserved. |
| R-100-03 | Desktop guide allowlist expansion for the new reference and negative fixture | RESOLVED: both paths approved and covered by parity/materialization tests. | User / Lead Developer | Invalid fixture is packaged but not executed as a valid example. |

Disposition: **ACCEPTED/CLOSED** by the user on 2026-10-24. The repository-wide
suite, packaged/native desktop certification, release, publication, and
integrated V0.16 closeout were not run and are not claimed. Sprint 101 remains
responsible for integrated acceptance.

## Exact Verification Record

- `bun run src/cli.ts run examples/15_Function_Bodies.amx` — PASS. The CLI
  returned the exact results asserted in `tests/examples.test.ts`, including
  `expressionResult: 12`, `statementResult: 14`, `scopedResult: 5`,
  `emptyFallback: 0`, `nestedInput: [[1], [2]]`,
  `nestedResult: [[1, 9], [2, 9]]`, and unchanged repeated-argument values
  `repeatedInput: [3]`, `repeatedResult: [3]`.
- `bun run src/cli.ts run examples/fixtures/invalid/missing-function-return.amx`
  — expected failure PASS: `AMXF4001: Missing return value from function`,
  file `examples/fixtures/invalid/missing-function-return.amx`, line 11,
  column 1 (function closing brace). This source is not in a valid-example
  execution loop.
- `bun test tests/examples.test.ts tests/numbered-guide.test.ts` — PASS, 19
  tests, 0 failures, 700 assertions.
- `bun test ./tests/numbered-guide.test.ts` — PASS, 2 tests, 0 failures, 443
  assertions, including explicit 01-12 guided / 13-15 standalone section
  assertions.
- `cd desktop-app && bun test src/bun/guideResources.test.ts src/mainview/starterExamples.test.ts`
  — PASS, 9 tests, 0 failures, 107 assertions. Staging/materialization
  destinations are temporary; the valid reference runs from the staged
  project and the invalid fixture is only copied/parity-checked.
- `cd desktop-app && bun run test:ui -- tests/ui/help-center.pw.ts --output=test-results/sprint100-help-final`
  — PASS, 2 Playwright tests. The output path is new and unique to this run.
- `bunx tsc --noEmit` — PASS, no output.
- `cd desktop-app && bunx vue-tsc --noEmit` — PASS, no output; no generated
  preparation/build step was run.
- `git diff --check` — PASS, no whitespace errors.
- `git status --short --branch` — branch `feat/create-v0.16`; exactly 16
  approved product/test/evidence paths changed. No Sprint 095-099 evidence,
  generated `dist/` output, version, release, publication, or status file was
  changed.

The existing `dist/cli.js` does not contain the accepted V0.16 function-body
parser. It was not rebuilt because the approved preservation boundary forbids
overwriting generated outputs. The new numbered-guide test therefore uses
`src/cli.ts` for reference 15; existing 00-14 numbered examples retain their
previous CLI route. Sprint 101 may validate a rebuilt integrated artifact.