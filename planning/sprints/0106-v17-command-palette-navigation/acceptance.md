# Sprint 106 Acceptance Criteria

Sprint 106 is complete when the existing command palette supports accessible
keyboard selection/navigation/execution and the assigned Trash restore error
no longer hides the retained list.

## Command Palette

- The Commands button and Ctrl/Cmd+Shift+P open the existing searchable
  palette and focus the search field.
- On open and every filter change, the first enabled filtered command is
  selected. When none is enabled, no selection exists.
- Up/Down traverses enabled results, skips disabled commands, stops at both
  ends, and never wraps.
- The selected row is visually clear and exposes an accessible selected state.
- Enter/Return executes the selected enabled command through the same runner
  as a click. Disabled or stale commands cannot execute.
- No matches preserve the existing empty state; all-disabled matches expose
  reasons but cannot be selected or executed.
- Dynamic command availability keeps the selected ID valid or resets it to
  the first enabled command/none.
- Escape, backdrop dismissal, and command execution preserve the existing
  focus restoration/opening behavior. Global shortcuts do not also fire for
  keys consumed by the palette.
- Click execution, Help and Preferences controls, filtering, availability,
  disabled reasons, and shortcut labels remain unchanged.

## Trash Restore Follow-Up

- On failed Restore, keep the same Trash dialog open and show the error alert
  alongside the unchanged item list.
- Other trash entries remain visible and actionable without closing/reopening
  the dialog. A successful restore removes only the restored item and updates
  the explorer.
- Retry/error clearing behavior is deterministic. Failed Empty Trash/list
  refresh does not hide or discard the current list.
- No Trash service/RPC, confirmation, file-operation, or folder scope changes
  are made.

## Verification and Boundaries

- `acceptance-test-matrix.md` cases are covered by focused Playwright tests;
  keyboard execution is verified against observable command side effects,
  not only button state.
- Focused direct desktop typecheck passes. If the Hutch wrapper is run and
  stalls, record it separately from the direct `vue-tsc` result.
- Focused command palette, Trash follow-up, Help command routing, and any
  required existing tests pass; outputs are isolated under Sprint 106.
- `git diff --check` and exact changed-path/output inventory pass.
- No new command, global shortcut, RPC/service behavior, folder operation,
  resizer/runtime behavior, package/version change, release, publication, or
  certification is included.
- `builder-evidence.md` records exact checks, counts, failures, residuals, and
  recommendation. A separate product-owner disposition is required; no
  Sprint 107/108 or release authority is inferred.