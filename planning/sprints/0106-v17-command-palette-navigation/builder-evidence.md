# Sprint 106 Builder Evidence: V0.17 Command-Palette Navigation

## Status

Implementation and focused verification completed under separate Sprint 106
authorization on 2026-10-25. Final results and residuals are recorded below.

**Builder recommendation:** IMPLEMENTED; request separate acceptance disposition.
**Separate acceptance disposition:** PENDING.

## Preconditions and Baseline

- Sprint 105 is ACCEPTED/CLOSED on 2026-10-25 against the amended file-only
  explorer scope. Folder duplicate/move/tree drag/trash/restore were deferred
  from V0.17; no target version was committed.
- The accepted S105 residual assigned to Sprint 106 is limited to the Trash
  dialog hiding the list while showing a failed Restore alert. The item remains
  stored and reappears after reopening.
- Starting `CommandPalette.vue` filtered labels, focused search on open,
  guarded disabled commands, executed clicks through `run(command)`, and
  emitted dismissal. It had no selected-command state or keyboard navigation.
- `App.vue` records the palette invoker and restores focus on dismiss. Its
  window key handler also contains global Run/Preview shortcuts; palette
  handling must prevent accidental double execution.
- Current Trash restore stores the RPC error in `trashError` while leaving
  `trashItems` intact. The template uses mutually exclusive error/list
  branches, causing the list to disappear until reopening.

## Approved Execution Plan

Separate authorization approved the following exact scope:

- Sources: `desktop-app/src/mainview/components/CommandPalette.vue`,
  `desktop-app/src/mainview/App.vue`, and `desktop-app/src/mainview/app.css`.
- Tests: add `desktop-app/tests/ui/command-palette.pw.ts`; extend only the
  Trash restore case in `desktop-app/tests/ui/project-explorer-workflows.pw.ts`.
- Test harness: `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`
  only, for deterministic restore retry and dirty-state behavior. No RPC or
  service changes.
- Harness: existing Playwright/Vite configuration; do not change package or
  test configuration.
- Outputs: fresh files only under
  `planning/sprints/0106-v17-command-palette-navigation/outputs/`, separated
  into `command-palette-playwright/` and `trash-restore-playwright/`.
- Evidence: this `builder-evidence.md` only. No command registry, new shortcut,
  folder operation, resizer/runtime, release, publication, version,
  certification, or Sprint 107/108 work.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory | PASS: `git status --short --untracked-files=all` was empty before implementation. |
| Command palette focused Playwright | PASS: 4/4. From `desktop-app/`, `bunx playwright test tests/ui/command-palette.pw.ts --output ..\planning\sprints\0106-v17-command-palette-navigation\outputs\command-palette-playwright\final-4`. Log: `outputs/command-palette-final-4.log`; artifacts: `outputs/command-palette-playwright/final-4/`. |
| Trash restore/explorer Playwright | PASS: 5/5. From `desktop-app/`, `bunx playwright test tests/ui/project-explorer-workflows.pw.ts --output ..\planning\sprints\0106-v17-command-palette-navigation\outputs\trash-restore-playwright\final-2`. Log: `outputs/command-palette-trash-final-2.log`; artifacts: `outputs/trash-restore-playwright/final-2/`. |
| Help command routing regression | PASS: 2/2. From `desktop-app/`, `bunx playwright test tests/ui/help-center.pw.ts --output ..\planning\sprints\0106-v17-command-palette-navigation\outputs\command-palette-playwright\help-regression-final-2`. Log: `outputs/command-palette-help-regression-final-2.log`; artifacts: `outputs/command-palette-playwright/help-regression-final-2/`. |
| Direct desktop typecheck | PASS: `bunx vue-tsc --noEmit`, exit code 0 with no diagnostics. Log: `outputs/typecheck-final.log`. |
| Focused editor diagnostics | PASS: no errors reported for the changed Vue, CSS, harness, or UI test files. |
| `git diff --check` and exact path/output inventory | PASS: `git diff --check` exit code 0 after the evidence update. Final worktree changes are the five approved implementation/test paths, this evidence file, and generated artifacts/logs only under the approved Sprint 106 `outputs/` root. Shared `desktop-app/test-results/` was not used. |

## Scope and Residuals

- The implementation retains the Commands button, Ctrl/Cmd+Shift+P handler,
  filter policy, disabled reasons, command IDs/handlers, Help/Preferences
  controls, click runner, and opener focus restoration. Selection is keyed by
  command ID, resets to the first enabled filtered result, skips disabled rows,
  does not wrap, is exposed with `aria-pressed`/active-descendant state, and
  Enter uses the click runner while stopping propagation to global Run/Preview.
- The Trash error remains visible alongside the retained item list. The
  existing UI test now restores another item in the same dialog and retries
  the rejected item successfully. The harness rejection happens once per
  designated item; Trash RPC/service behavior and folder scope are unchanged.
- The expected pre-implementation palette baseline is retained at
  `outputs/command-palette-baseline.log` (3 tests failed on missing selection
  and keyboard behavior). Intermediate failed Playwright contexts/logs are
  retained under approved Sprint 106 output directories; final focused suites
  listed above pass.
- `S106-TRASH-04` was not exercised: the existing harness has no deterministic
  `listTrash` or `emptyTrash` failure control, and adding one was outside the
  approved narrow harness change. No service behavior was changed.
- The shortcut test ran on Windows/Chromium with Ctrl+Shift+P; Cmd behavior was
  not separately exercised on a macOS host. Browser-harness results do not
  imply native-host or platform certification.
- Folder-operation deferral, S102 Resizable OPEN status, and S104/105
  verification residuals are not Sprint 106 scope unless directly required
  by an approved test path.
- Record unavailable checks exactly; do not infer platform or native-host
  certification from browser-harness results.
- No release, publication, package/version change, platform certification,
  or Sprint 107/108 execution is authorized by this document package.