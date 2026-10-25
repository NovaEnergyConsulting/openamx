# Sprint 106 Blueprint: V0.17 Command-Palette Navigation

## Approach

1. Obtain separate Sprint 106 implementation authorization and approval of
   exact source/test/output paths. Confirm Sprint 105's file-only amended
   disposition and accepted Trash residual; do not reopen deferred folder
   scope.
2. Inspect `CommandPalette.vue`, the parent command registry and global
   shortcuts in `App.vue`, palette CSS, current shell command types, and
   existing Help/command and S105 explorer UI tests.
3. Implement selection inside `CommandPalette.vue` keyed by stable command
   ID. On open and query change, choose the first enabled filtered command.
   Synchronize after `commands` changes; preserve the current selection only
   while it remains present and enabled, otherwise choose the first enabled
   result or clear selection.
4. Add Up/Down handling that skips disabled results and clamps at first/last
   enabled rows. Add a visible selected style and accessible selected state
   without changing existing disabled reasons or click affordances.
5. Make Enter/Return use the existing `run(command)` helper. Consume handled
   palette keys so window-level shortcuts do not also run. Preserve click
   execution, dismiss-before-run ordering, Escape/outside dismissal, search
   focus on open, and restoration to the invoker.
6. Keep the existing no-match message and ensure zero enabled results means
   there is no selection and Enter is a no-op. Do not rewrite the command
   registry or matching policy.
7. Fix the assigned Trash residual in the same narrow sprint scope. Render
   `trashError` as a role=alert adjacent to the current list/loading/empty
   state rather than as a mutually exclusive branch. A failed restore keeps
   the same `trashItems`; the user can see the retained item and restore
   another item without reopening the dialog.
8. Add a focused `command-palette.pw.ts` test under the existing workflow
   harness and extend the existing Trash restore case narrowly. Test both
   mouse and keyboard paths, stable command selection across filter/availability
   changes, and no accidental global Run/Preview shortcut.
9. Run the focused command-palette and Trash UI tests, existing Help command
   routing, direct desktop typecheck, and `git diff --check`. Preserve fresh
   Playwright output under Sprint 106-specific directories. RPC/service tests
   are not expected.
10. Record exact commands, outcomes, counts, residuals, and recommendation in
    `builder-evidence.md`; request separate product-owner acceptance.

## Candidate File Plan

Expected implementation paths, subject to separate approval:

- `desktop-app/src/mainview/components/CommandPalette.vue` — selection,
  keyboard navigation, visual/accessibility state, and shared execute path.
- `desktop-app/src/mainview/app.css` — selected command styling only.
- `desktop-app/src/mainview/App.vue` — only if the palette needs a narrowly
  scoped global-keyboard guard or Trash list/error rendering adjustment.
- `desktop-app/tests/ui/command-palette.pw.ts` — new focused palette tests.
- `desktop-app/tests/ui/project-explorer-workflows.pw.ts` — narrow assertion
  update for retained Trash list on restore failure.
- `planning/sprints/0106-v17-command-palette-navigation/builder-evidence.md`
  — implementation evidence.

Do not modify the command registry, shared RPC/service, explorer operation
behavior, package/config/version files, or global planning ledgers.

## Proposed Verification

From `desktop-app/`, subject to approved output isolation:

- `bunx vue-tsc --noEmit` (record the Hutch wrapper separately if it is also
  authorized and completes).
- `bunx playwright test tests/ui/command-palette.pw.ts --output ..\planning\sprints\0106-v17-command-palette-navigation\outputs\command-palette`.
- `bunx playwright test tests/ui/project-explorer-workflows.pw.ts --grep "Trash restore" --output ..\planning\sprints\0106-v17-command-palette-navigation\outputs\trash-restore`.
- `bunx playwright test tests/ui/help-center.pw.ts --output ..\planning\sprints\0106-v17-command-palette-navigation\outputs\help-commands`.
- `git diff --check` and exact changed-path/output inventory.

The Vite workflow harness may require direct `bunx vite` startup under
Windows PowerShell; use only the approved existing config/port and record the
exact command. Do not edit the harness config to make startup convenient.

## Notes

Sprint 106 does not change the command registry or add new command semantics.
The Trash presentation correction is limited to the accepted S105 residual.
No S107, release, publication, version, or certification authority follows.