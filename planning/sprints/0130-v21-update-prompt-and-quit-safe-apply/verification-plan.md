# Sprint 130 Verification Plan

## Status and Authorization

Architect-prepared candidate. S129 was ACCEPTED/CLOSED WITH RECORDED
RESIDUALS on 2026-11-27, satisfying the S130 dependency. S130 remains
unexecuted and separately gated. This document authorizes no source changes,
build, or test command.

Before execution, obtain explicit Product Owner authorization for the exact
baseline commit, detached validation worktree, changed-file allowlist,
command/CWD matrix, evidence/output roots, preservation and cleanup
boundaries, retry/stop policy, and residual disposition process. The exact
S129 accepted source baseline must be selected at authorization time; do not
infer a commit from this planning document.

## Isolation and Preservation

- Use a new detached validation worktree at the authorized S129 implementation
  baseline. Do not use the primary worktree for mutating checks unless
  expressly authorized.
- Capture baseline status and hashes for S129 changed files, existing
  `desktop-app/.hutch/`, `desktop-app/build/`, `desktop-app/artifacts/`,
  `desktop-app/dist/`, `desktop-app/test-results/`, `releases/`, and S121-S129
  evidence. Preserve existing outputs; do not clean or overwrite them.
- Keep all new S130 logs and artifacts in
  `planning/sprints/0130-v21-update-prompt-and-quit-safe-apply/artifacts/run-01/`.
- Automated tests use injected updater APIs, mock RPC, and the local Vite
  harness only. Do not contact `releases/latest/download` or any public host.
- Do not run stable packaging, release assembly/publication, or native
  installed-app updates in this sprint's candidate matrix.

## Candidate Commands

Run only after authorization. From `desktop-app/`:

```powershell
bun test src/bun/updater.test.ts
bun test src/bun/updateApply.test.ts
bun run tests/rpc-contract-check.ts
bun run typecheck
bun run test
bun run test:ui -- tests/ui/update-workflow.pw.ts
```

The Playwright configuration starts the sprint workflow Vite harness on port
4183. Confirm that port is free or allocate an explicitly approved alternate
port and update the test base URL/configuration in the authorized worktree;
do not kill or reuse an unrelated process. From the repository root:

```powershell
git diff --check
```

Commands are candidates only. Adjust test file names if the authorized
implementation chooses a different isolated apply-handshake module; record
exact commands, cwd, exit status, and complete raw output.

## Behavior Matrix

| Case | Expected raw result |
| --- | --- |
| Manual check, up-to-date | No modal/alert; one check, no download |
| Manual/startup check, update available | Version offer appears once; no download before choice |
| Later, Escape, or offer close | Offer dismissed; zero download calls |
| Update consent | One download/preparation; clear busy state; no fabricated percent |
| Download failure | Contextual error, app remains open, safe retry available |
| Preparation ready | Apply requested only after ready state |
| Save All | Guard completes successfully before native apply; then handoff authorized |
| Discard All | Apply proceeds only after explicit discard confirmation |
| Cancel | No apply; staged update retained; persistent Restart to update action |
| Save failure/conflict | No apply; app remains open; retry action remains available |
| Restart action | Same guard is re-run; no bypass while state is not ready |
| Apply failure/rejection | Permit cleared, app usable, error visible; ready retry retained when valid |
| Duplicate check/download/apply | No duplicate native operations or inconsistent prompt |
| Startup result delayed beyond mount | UI observes local state without starting another host check |
| Unsupported build/check error | Quiet state; no public request from unsupported build |
| Native quit/close events | Synchronous callbacks allow only the pre-approved apply handoff |

Use deterministic deferred promises and call counters in unit/UI mocks. Keep
UI workflow results separate from main-process approval tests. Do not infer
native installation/relaunch from mocks or Chromium.

## Raw Results and Stop Rules

Record statuses as `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`.
Preserve every first failure and retry; no retry cap is set, but a confirmed
quit-guard bypass, unintended download/apply, inability to constrain the
handoff approval, public-host request, or need for an out-of-scope edit is a
stop condition requiring a separate replan/authorization before continuing.

Builder recommendation and Product Owner disposition remain separate. S130
acceptance does not establish installed-app behavior, Windows/macOS/Linux
cross-platform behavior, release asset publication, or release authority;
S132 owns integrated acceptance.
