# Sprint 129 Verification Plan

## Status and Authorization

Architect-prepared candidate. S128 was accepted/closed with recorded
residuals on 2026-11-27, which satisfies the S129 dependency. S129 remains
unexecuted and separately gated. This document authorizes no source changes
or verification command.

Before execution, obtain Product Owner authorization for the exact baseline
commit, validation worktree, changed-file allowlist, commands and working
directories, evidence root, preservation/cleanup boundaries, retry/stop rule,
and residual disposition procedure. Select the baseline from the reviewed
S128 implementation state at authorization time; do not assume the S128
pre-implementation baseline is the S129 baseline.

## Isolation and Preservation

- Use a new detached validation worktree at the authorized S128 implementation
  baseline. Do not build or test in the primary worktree unless expressly
  authorized.
- Capture baseline `git status`, relevant file hashes, Hutch/Electrobun pins,
  and the current desktop outputs. Preserve `desktop-app/.hutch/`,
  `desktop-app/build/`, `desktop-app/artifacts/`, `desktop-app/dist/`,
  `desktop-app/test-results/`, `releases/`, and S121-S128 evidence.
- Keep new S129 logs and fixture artifacts only under
  `planning/sprints/0129-v21-main-process-updater-integration/artifacts/run-01/`.
- Automated tests use injected updater adapters or local fixtures only. Do
  not query GitHub, the public `releases/latest/download` URL, or any other
  external update host.
- Do not run stable packaging, release assembly, publication, installed-app
  update, or cross-platform workflows under this sprint authorization.

## Candidate Commands

These are proposed commands for authorization and must be adjusted only if the
selected worktree or repository scripts require it. Run from `desktop-app/`
unless noted:

```powershell
bun test src/bun/updater.test.ts
bun run tests/rpc-contract-check.ts
bun run typecheck
bun run test
```

Then from the repository root:

```powershell
git diff --check
```

If the first focused test is blocked by dependency or type-generation state,
record the exact failure and request authorization before installing tools,
preparing Hutch state, or broadening commands. Do not conceal failed attempts.

## Behavior Matrix

| Case | Expected raw result |
| --- | --- |
| Packaged stable check, no update | Typed up-to-date state; one check, no download/apply |
| Packaged stable check, update available | Typed available version; no download until explicit operation |
| Check/network error | Typed failure; no dialog, retry loop, schedule, or process exit |
| Explicit download succeeds | Ready-to-apply state; no apply/restart |
| Explicit download fails | Typed actionable failure; running app remains available |
| Development/non-stable/unsupported configuration | Unsupported/disabled state; zero production host requests |
| Startup plus overlapping explicit check | One in-flight check and deterministic shared result |
| Duplicate download request | One in-flight download; deterministic shared result |
| RPC contract check | New typed methods are declared and handlers are wired consistently |
| Quit protection | Existing save/conflict behavior unchanged; no updater apply handler added |

Use a fake adapter with per-call counters, controllable promises, and injected
responses/errors so concurrency and no-silent-download behavior are
observable. Keep test outcomes separate for the coordinator and RPC contract.

## Result Recording and Stop Rules

Record raw statuses as `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`.
Preserve the first failure and every retry; there is no retry cap, but a
confirmed updater defect or a need to exceed the authorized file/command scope
requires a stop and replan. Stop if S128 pins/configuration are inconsistent,
if any test would reach a public host, or if implementing the contract requires
renderer, release, identity, or quit/apply changes.

Builder recommendation, S129 Product Owner disposition, and V0.21 closeout
remain separate. Passing injected tests is not native installed-app update
acceptance or platform certification.
