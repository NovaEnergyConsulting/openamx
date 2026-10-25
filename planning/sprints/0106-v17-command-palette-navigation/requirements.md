# Sprint 106 Requirements: V0.17 Command-Palette Navigation

## Document Status

Architect-prepared Sprint 106 planning package. It defines the implementation
scope and verification contract; it does not authorize edits. Obtain separate
Sprint 106 execution authorization and approval of the exact source/test/
output plan before implementation.

Sprint 105 is ACCEPTED/CLOSED on 2026-10-25 against its amended file-only
scope. Folder mutations were deferred from V0.17 and are not part of Sprint
106. Sprint 105 explicitly assigned one Trash restore-error presentation
residual to Sprint 106; that narrow follow-up is included below.

## Goal

Add visible keyboard selection and Up/Down/Enter navigation to the existing
command palette while preserving its Commands button, Ctrl+Shift+P shortcut,
filtering, disabled reasons, mouse execution, Help/Preferences controls, and
focus restoration. Keep selection synchronized with filtered and enabled
commands, stop at list ends, and route keyboard execution through the same
command runner as clicks.

Also close the accepted Sprint 105 Trash restore-error residual by keeping the
Trash list visible alongside an inline error when a restore fails, so the user
can still see and act on retained trash items without closing/reopening the
dialog.

## Authority and Inputs

- Scope authority:
  [`plan-openamxV17MasterSprintPlan.md`](../../plan-openamxV17MasterSprintPlan.md),
  Sprint 106.
- Accepted command behavior:
  [`desktop-ux-contract.md`](../0102-v17-desktop-ux-contract-technical-gate/desktop-ux-contract.md),
  section 4 and `S102-CMD-01` through `S102-CMD-05`.
- Sprint 105 disposition and assigned residual:
  [`builder-evidence.md`](../0105-v17-project-explorer-workflows/builder-evidence.md)
  and
  [`acceptance.md`](../0105-v17-project-explorer-workflows/acceptance.md).
- Current command implementation: `desktop-app/src/mainview/components/CommandPalette.vue`,
  `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/shell.ts`,
  and `desktop-app/src/mainview/app.css`.
- Current Trash presentation/flow: `desktop-app/src/mainview/App.vue` and
  `desktop-app/tests/ui/project-explorer-workflows.pw.ts`.
- Existing UI harness: `desktop-app/spikes/sprint042-workflow-harness/`.
- Sprint 106 artifacts: `blueprint.md`, `command-palette-contract.md`,
  `acceptance-test-matrix.md`, `acceptance.md`, `builder-evidence.md`, and
  `handoff-prompt.md`.

## In Scope

- Keep opening from the Commands button and Ctrl+Shift+P.
- Focus the command search field on open and restore focus to the original
  invoker on Escape, backdrop dismissal, or command execution as the current
  interaction requires.
- Select the first enabled filtered command when the palette opens or its
  filter changes. Keep the selection synchronized if commands or enabled
  state change while the palette is open.
- Add visible selected styling and accessible selected state.
- Up/Down traverses enabled filtered commands only, stops at the first/last,
  and does not wrap.
- Enter/Return executes the currently selected enabled command through the
  same `run(command)` path as clicking its row. Disabled commands remain
  disabled and unexecutable.
- Preserve the existing empty-results state, disabled reasons, shortcuts,
  click behavior, command definitions, and Help/Preferences controls.
- Fix the S105 Trash restore-error presentation so the alert and unchanged
  Trash list remain visible together. Retained entries and other Restore
  actions remain available after the failed request settles.
- Add focused Playwright coverage for keyboard/mouse parity, availability,
  boundaries, filtering, empty results, shortcuts, focus restoration, and the
  Trash residual.

## Out of Scope

- New commands, command registry redesign, shortcut additions, native menu
  integration, command categories, fuzzy/ranked search, or Help/Preferences
  changes.
- Project explorer operations beyond the assigned Trash error presentation
  fix. Folder operations remain deferred from V0.17.
- First-load behavior (Sprint 104, closed), resizer/runtime changes (Sprint
  107), broad visual redesign, shell refactor, RPC/service changes, or AMX
  language/CLI/VS Code changes.
- Release, publication, package/version changes, platform certification, or
  updates to global status/decision ledgers.

## Constraints and Gates

- Preserve `ShellCommand` stable IDs, labels, enabled flags/reasons, and
  handlers. Do not create a separate keyboard-only command execution path.
- Selection is keyed by command ID, not array index, so filtering and dynamic
  availability cannot leave a stale row selected.
- Disabled commands may remain visible with their existing reason but cannot
  be selected, activated by Enter/Return, or run by click.
- If the selected command becomes filtered out or disabled while the palette
  is open, select the first enabled current result or clear selection when
  none exists.
- Palette-handled Up/Down and Enter/Return must not trigger unrelated global
  shortcuts. In particular, Enter from the palette must not accidentally
  invoke the shell's global Run/Preview shortcuts.
- The keyboard path uses the same dismissal and focus-restoration behavior as
  click execution. A command that opens a dialog/workflow must retain its
  existing focus behavior.
- Trash restore failure does not mutate `trashItems`; clear the previous
  error when a new restore/empty action begins, but do not conditionally hide
  the retained list merely because an error is present.
- Do not add a component-test framework or new RPC API; use the existing
  Playwright/Vite harness.