# Sprint 104 Builder Evidence: V0.17 First-Load Initialization

## Status

Sprint 104 execution authorized on 2026-10-25. Implementation and verification
are complete. The user separately ACCEPTED/CLOSED Sprint 104 on 2026-10-25
with the verification residuals recorded below.

**Builder recommendation:** RECOMMEND ACCEPTANCE.
**Separate product-owner disposition:** ACCEPTED/CLOSED WITH RECORDED
VERIFICATION RESIDUALS, 2026-10-25.

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

Authorized execution paths:

- Source: `desktop-app/src/mainview/App.vue`.
- Test harness: `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`.
- Focused test: `desktop-app/tests/ui/initial-active-document.pw.ts`.
- Evidence: `planning/sprints/0104-v17-first-load-initialization/builder-evidence.md`.
- Isolated Playwright outputs: `desktop-app/test-results/sprint104-first-load/`
  and `desktop-app/test-results/sprint104-preview-freshness/`.
- No other source, test, package, shared RPC/service, planning-ledger, or
  generated build paths are approved for edits. If implementation requires an
  additional path, stop and request a scope amendment before editing it.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory | PASS. Worktree was clean before execution; final changed paths match the approved list below. |
| Active-document transition audit | PASS. Project open, recent/recovery restore, selection, reload helper, and create/duplicate/move assignment paths were reviewed. |
| Focused `initial-active-document.pw.ts` | PASS, 7/7. Output: `desktop-app/test-results/sprint104-first-load/`. |
| `preview-freshness.pw.ts` | PASS, 1/1. Output: `desktop-app/test-results/sprint104-preview-freshness/`. |
| Preview navigation regression | PASS, 2/2. Output: `desktop-app/test-results/sprint104-first-load/`. |
| `bun run typecheck` | BLOCKED. `hutch electrobun prepare && vue-tsc --noEmit` produced no output or completion after repeated checks and was stopped. |
| Direct `bunx vue-tsc --noEmit` fallback | PASS. Run from `desktop-app/`; completed without diagnostics. |
| RPC-contract check | NOT REQUIRED. No shared RPC schema or desktop service change was made. |
| `git diff --check` and exact path inventory | PASS. Final modified paths: `desktop-app/src/mainview/App.vue`, `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`, `desktop-app/tests/ui/initial-active-document.pw.ts`, and this evidence file. |

## Scope and Residuals

- The Playwright webServer's configured `./node_modules/.bin/vite` command
  failed to launch in Windows PowerShell (`'.' is not recognized`). The
  approved harness was started directly with `bunx vite --config
  spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port
  4183 --strictPort`; the listed UI checks then passed.
- The existing private `reload()` helper has no current UI call site. It now
  forces the shared initializer, but no new product control was introduced;
  reload-specific UI behavior is therefore not independently exercisable in
  this sprint's existing workflow.
- No shared RPC/service contract, package/version, generated build, release,
  or downstream sprint path was changed.
- The S102 Resizable gate and S105 folder operation disposition are unrelated
  to Sprint 104 and remain with their owner sprints.
- Sprint 103's recorded typecheck, diagram-time assertions, and native WebView
  residuals remain as stated in Preconditions and Baseline; they were not
  treated as Sprint 104 regressions.
- No release, publication, package/version change, platform certification,
  or downstream sprint execution is authorized by this document package.

**Disposition:** Sprint 104 is ACCEPTED/CLOSED on 2026-10-25 with the Hutch
typecheck wrapper and unavailable reload UI-callsite residuals stated above.
This disposition closes Sprint 104 only; it does not authorize Sprint 105 or
any other downstream sprint, release, publication, package/version change, or
platform certification.