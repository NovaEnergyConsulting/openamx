# Sprint 108 Blueprint: V0.17 Integrated Acceptance and Closeout

## Approach

1. Obtain separate explicit Sprint 108 execution authorization and approval
   of the exact verification commands, validation worktree, changed files,
   generated-output paths, Playwright outputs, and evidence destinations.
   Confirm Sprints 104-107 dispositions and resolve S106's pending separate
   acceptance before claiming integrated acceptance.
2. Record the starting branch/commit/status, OS/architecture, Bun/Node/
   Playwright versions, installed desktop runtime, and inventory/hashes for
   any approved existing generated outputs. Preserve all prior Sprint 102-107
   evidence and artifacts.
3. Create a fresh isolated validation copy/worktree with dependencies reused
   only under the approved strategy. Do not build into the shared source tree:
   desktop web build can generate `src/renderer/diagramBrowserRuntime.ts`,
   `desktop-app/dist/`, and other staged resources.
4. Complete `integrated-evidence-matrix.md` from the accepted scope and
   current evidence. Give each feature and verification surface its own raw
   status, exact command/action, expected/actual result, count, artifact,
   residual owner, and separate owner disposition.
5. Run focused feature checks in dependency order:
   - S103 shell/component preservation and runtime panel wiring;
   - S104 initial active-AMX open/reopen/recovery/selection, exactly-once,
     pause/non-AMX, identity, cancellation, and freshness;
   - S105 amended file-scoped explorer and RPC workflows; mark folder
     mutations explicitly deferred/not run;
   - S106 command-palette keyboard/mouse/focus behavior and Trash restore
     retry/list-retention residual; record S106-TRASH-04 and Cmd host gaps;
   - S107 Reka UI resize bounds, actual A/B service persistence, keyboard,
     responsive/focus-mode behavior, and bottom-only runtime preservation.
6. Run focused desktop typecheck, desktop package tests/RPC contract, and the
   full applicable desktop UI suite with fresh output paths. Run the approved
   desktop web build in the isolated workspace. Do not infer full repository
   core/VS Code behavior is needed for this desktop-only change unless the
   approved repository gate specifically requires it.
7. Run the integrated desktop repository gate agreed in the execution plan.
   If root/core tests are included, isolate their `dist/` and generated
   outputs too. Record native Electrobun launch/package/other-platform routes
   as `BLOCKED/UNAVAILABLE` when no approved supported test route exists.
8. Preserve all initial failures and retries. Do not fix product code, amend
   tests, or clean output trees under a verification-only authorization. If a
   defect or path collision requires a change, stop and request a separate
   corrective scope and exact file plan.
9. Reconcile remaining residuals, including S103 diagram/UI residuals, S104
   wrapper/reload residuals, S105 deferred folder actions, S106 acceptance and
   untested cases, and S107 native/build gaps. Record what remains open,
   accepted, deferred, blocked, or not run.
10. Complete `builder-evidence.md`, run final `git diff --check` and
    changed-path/output inventory, and submit a closeout recommendation.
    Obtain separate product-owner V0.17 disposition. Do not authorize release,
    publication, version changes, or certification.

## Artifact Set

- `integrated-evidence-matrix.md` — source of truth for feature-level raw
  statuses, evidence, artifacts, residual owners, and dispositions.
- `verification-plan.md` — proposed commands, isolated output plan, and
  preservation requirements approved before execution.
- `acceptance.md` — closeout criteria, deferred scope, and disposition gates.
- `builder-evidence.md` — exact execution log and closeout recommendation.
- `requirements.md` — scope, baselines, residuals, and gates.
- `handoff-prompt.md` — bounded Builder instructions.

## Proposed Verification Commands

Exact commands and working directories must be approved before execution.
The proposed inventory is in `verification-plan.md`; do not treat it as
execution authorization.

## Notes

Sprint 108 closes integrated V0.17 acceptance only within the separately
accepted scope amendment. It does not close deferred folder operations or
authorize release, publication, version changes, installer distribution,
platform certification, or V0.18 work.