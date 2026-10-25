# Sprint 106 Builder Evidence: V0.17 Command-Palette Navigation

## Status

Architect-prepared evidence template. Sprint 106 implementation and
verification have not started under this preparation.

**Builder recommendation:** PENDING authorized execution.
**Separate acceptance disposition:** PENDING.

## Preconditions and Baseline

- Sprint 105 is ACCEPTED/CLOSED on 2026-10-25 against the amended file-only
  explorer scope. Folder duplicate/move/tree drag/trash/restore were deferred
  from V0.17; no target version was committed.
- The accepted S105 residual assigned to Sprint 106 is limited to the Trash
  dialog hiding the list while showing a failed Restore alert. The item remains
  stored and reappears after reopening.
- Current `CommandPalette.vue` filters labels, focuses search on open,
  guards disabled commands, executes clicks through `run(command)`, and emits
  dismissal. It has no selected-command state or keyboard navigation.
- `App.vue` records the palette invoker and restores focus on dismiss. Its
  window key handler also contains global Run/Preview shortcuts; palette
  handling must prevent accidental double execution.
- Current Trash restore stores the RPC error in `trashError` while leaving
  `trashItems` intact. The template uses mutually exclusive error/list
  branches, causing the list to disappear until reopening.

## Approved Execution Plan

Pending separate authorization. Record exact approved source, test, harness,
output, and evidence paths here before implementation. Keep the Trash change
limited to the assigned presentation residual.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory | NOT RUN. |
| Command palette focused Playwright | NOT RUN. |
| Trash restore follow-up Playwright | NOT RUN. |
| Help command routing regression | NOT RUN. |
| Direct desktop typecheck | NOT RUN. |
| Hutch-wrapped desktop typecheck, if authorized | NOT RUN. |
| `git diff --check` and exact path/output inventory | NOT RUN. |

## Scope and Residuals

- No source or test files were changed during Architect preparation.
- Folder-operation deferral, S102 Resizable OPEN status, and S104/105
  verification residuals are not Sprint 106 scope unless directly required
  by an approved test path.
- Record unavailable checks exactly; do not infer platform or native-host
  certification from browser-harness results.
- No release, publication, package/version change, platform certification,
  or Sprint 107/108 execution is authorized by this document package.