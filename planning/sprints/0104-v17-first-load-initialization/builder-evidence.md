# Sprint 104 Builder Evidence: V0.17 First-Load Initialization

## Status

Architect-prepared evidence template. Sprint 104 implementation and
verification have not started under this preparation.

**Builder recommendation:** PENDING authorized execution.
**Separate acceptance disposition:** PENDING.

## Preconditions and Baseline

- Sprint 102 is recorded ACCEPTED/CLOSED; its Resizable technical gate remains
  OPEN and is owned by Sprint 107.
- Sprint 103 is recorded ACCEPTED/CLOSED on 2026-10-25 with verification
  residuals. Its runtime panel extraction preserved the shell boundary; no
  activation changes were made.
- Sprints 100 and 101 are recorded ACCEPTED/CLOSED in Sprint 103's evidence.
- Current source baseline: normal file/tab selection uses `activate()` to
  initialize AMX static analysis and schedule preview. Project open, recent
  restore, and recovery restore assign or load the active document through
  separate paths and do not consistently use that shared behavior.
- Existing browser harness tracks preview starts/completions but does not yet
  expose initial `analyzeBuffer` call counts or complete restore/recovery
  scenarios.
- S103 residuals to preserve accurately: the Hutch-wrapped desktop typecheck
  did not complete; direct `bunx vue-tsc --noEmit` completed; the combined
  preview/workbench/diagram run had two unrelated diagram time-text assertion
  failures and one native WebView skip. Sprint 103 was separately accepted
  with those residuals; they are not Sprint 104 regressions by default.

## Approved Execution Plan

Pending separate authorization. Record the exact approved source, test,
output, and evidence paths here before implementation edits.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory | NOT RUN. |
| Active-document transition audit | NOT RUN. |
| Focused `initial-active-document.pw.ts` | NOT RUN. |
| `preview-freshness.pw.ts` | NOT RUN. |
| Desktop typecheck | NOT RUN. |
| RPC-contract check, if required by an approved schema change | NOT RUN. |
| `git diff --check` and exact path inventory | NOT RUN. |

## Scope and Residuals

- No source or test files were changed during Architect preparation.
- The S102 Resizable gate and S105 folder operation disposition are unrelated
  to Sprint 104 and remain with their owner sprints.
- Record unrun or unavailable checks as NOT RUN/BLOCKED with exact reasons;
  do not infer PASS from the contract or mock-harness result.
- No release, publication, package/version change, platform certification,
  or downstream sprint execution is authorized by this document package.