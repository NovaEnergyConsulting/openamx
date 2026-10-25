# Sprint 106 Handoff Prompt

You are executing Sprint 106, V0.17 Command-Palette Navigation. Do not edit
until separate Sprint 106 authorization and an exact source/test/harness/
output plan are approved. Preserve the current worktree and unrelated user
changes.

Implement the accepted palette contract in `command-palette-contract.md`.
Keep the current Commands button, Ctrl/Cmd+Shift+P, filter behavior, disabled
reasons, click execution, command IDs/handlers, Help/Preferences controls,
and focus restoration. Add selected-command state keyed by ID, first enabled
selection after open/filter changes, non-wrapping Up/Down navigation that
skips disabled commands, visible/accessibly selected styling, and Enter/Return
execution through the same command runner as clicks. Ensure palette-handled
keys do not also trigger global Run/Preview shortcuts.

Also close only the accepted Sprint 105 Trash restore-error residual: keep the
inline alert and current Trash item list visible together after a failed
Restore, preserve the stored item, and allow another item to be restored in
the same dialog. Do not change Trash RPC/service behavior or folder scope.

Use `acceptance-test-matrix.md`; add a focused
`desktop-app/tests/ui/command-palette.pw.ts` and narrowly extend the existing
Trash restore test. Use the existing Playwright/Vite harness. Keep fresh
outputs under approved Sprint 106 paths. Record exact results and residuals in
`builder-evidence.md`. This sprint authorizes no new command, shortcut,
folder operation, resizer/runtime change, release, publication, version
change, certification, or Sprint 107/108 work.