# Sprint 107 Requirements: V0.17 Resizable Workbench and Runtime Panel

## Document Status

Sprint 107 was implemented and verified under separate authorization, then
ACCEPTED/CLOSED by the user on 2026-10-25. The accepted product contract,
technical gate result, and verification evidence are recorded in this sprint
package.

Sprint 106's separate product-owner acceptance remains PENDING in its own
evidence. Sprint 102's historical Resizable gate remains OPEN because its
prototype used mock per-project persistence; Sprint 107 closed the production
path decision with actual service A/B persistence and App.vue integration.
Sprint 107's Reka technical gate is GO; see `technical-gate.md` and
`builder-evidence.md`.

## Goal

Provide accessible, bounded, keyboard-adjustable resizing for the explorer,
editor, and contextual pane while preserving per-project dimensions,
focus modes, and responsive layout. Keep the runtime panel fixed at the
bottom, remove its Bottom/Right relocation controls and state, and preserve
all existing runtime functionality and content.

## Authority and Inputs

- Scope and sequencing authority:
  [`plan-openamxV17MasterSprintPlan.md`](../../plan-openamxV17MasterSprintPlan.md),
  Sprint 107.
- Accepted UX/sizing constraints:
  [`desktop-ux-contract.md`](../0102-v17-desktop-ux-contract-technical-gate/desktop-ux-contract.md),
  especially `S102-SIZE-01` through `S102-SIZE-05` and `S102-RUN-01` through
  `S102-RUN-04`.
- Open technical gate and prior prototype residuals:
  [`resizable-technical-gate.md`](../0102-v17-desktop-ux-contract-technical-gate/resizable-technical-gate.md)
  and
  [`builder-evidence.md`](../0102-v17-desktop-ux-contract-technical-gate/builder-evidence.md).
- Sprint 103 component boundary:
  [`component-boundaries.md`](../0103-v17-workbench-shell-component-refactor/component-boundaries.md).
- Sprint 106 implementation status:
  [`builder-evidence.md`](../0106-v17-command-palette-navigation/builder-evidence.md).
- Current desktop surfaces: `desktop-app/src/mainview/App.vue`,
  `desktop-app/src/mainview/app.css`, `desktop-app/src/mainview/shell.ts`,
  `desktop-app/src/mainview/components/RuntimePanel.vue`,
  `desktop-app/src/mainview/components/PreferencesDialog.vue`,
  `desktop-app/src/shared/rpc.ts`, and
  `desktop-app/src/bun/desktopService.ts`.
- Relevant tests: `desktop-app/tests/ui/workbench-comfort.pw.ts`,
  `desktop-app/tests/ui/shell-components.pw.ts`, desktop RPC contract tests,
  and the existing Vite workflow harness.
- Sprint 107 artifacts: `blueprint.md`, `implementation-contract.md`,
  `technical-gate.md`, `acceptance-test-matrix.md`, `acceptance.md`,
  `builder-evidence.md`, and `handoff-prompt.md`.

## In Scope

- Close the Sprint 102 Resizable technical gate with actual installed API,
  App.vue/layout integration, and real per-project service/RPC persistence
  evidence before selecting the production path.
- If the candidate passes, use local shadcn-vue-style wrappers backed by the
  already-installed Reka UI splitter primitives. If it fails any required
  behavior, use an equivalent accessible implementation that satisfies the
  same contract; do not silently relax bounds or persistence.
- Replace the two custom desktop divider interactions with two accessible
  vertical splitters controlling explorer/editor/context widths, preserving
  the existing three-panel workbench and responsive stack.
- Preserve useful minimum sizes, explorer 160-400 px, contextual width
  25-65%, editor/context minimum tracks, per-project persistence through the
  desktop service, keyboard operation, focus modes, and responsive behavior.
- Keep runtime at the bottom. Remove Bottom/Right controls, docking
  relocation, the `DrawerDock` type/state, the `openamx.drawer-dock`
  preference wiring, and obsolete right-docking layout/CSS.
- Preserve all runtime actions/content and existing `RuntimePanel.vue`
  ownership. Keep Details disclosure local to the runtime component.
- Add focused UI/RPC tests for resizing, bounds, keyboard, persistence,
  responsive/focus modes, bottom-only runtime, and retained runtime behavior.

## Out of Scope

- Project explorer workflows and deferred folder mutations (Sprint 105 scope
  was amended to file-only and is closed).
- Command-palette navigation and Trash restore error presentation (Sprint
  106 implementation is complete; its separate product-owner disposition is
  still pending in its evidence).
- First-load initialization (Sprint 104), AMX language behavior, CLI/VS Code,
  new workbench modes, broad visual redesign, new packages/dependencies,
  release engineering, publication, package/version changes, or platform
  certification.
- Deleting or rewriting legacy local-storage values in user profiles. Stop
  reading/writing the obsolete docking key; do not perform unrelated user
  data cleanup.

## Constraints and Gates

- Do not select Reka/shadcn-vue for production based only on library
  documentation or the S102 mock-persistence prototype. The actual
  `setPanelSizes` RPC round-trip and App.vue integration must be tested.
- The group must preserve explorer 160-400 px, 260 px editor/context minimum
  tracks, contextual-pane 25-65% constraints, and a usable layout at 1024x720
  and a larger desktop viewport. Any adjustment requires explicit product
  disposition.
- Persist dimensions per recent project through the existing service/RPC
  authority. Do not use global `autoSaveId`/local-storage persistence as the
  source of truth.
- Focus modes and responsive layouts may hide or unmount panels; such changes
  must not save bogus dimensions or overwrite a project's last desktop
  layout.
- Splitters require visible focus, accessible splitter semantics, predictable
  keyboard adjustment, and hard stops at bounds. If the library path fails,
  implement an accessible equivalent rather than retaining pointer-only
  dividers.
- Runtime remains bottom-only at desktop and narrow widths. Removing docking
  may not remove/relocate the preview/context pane or alter job authority.
- Preserve runtime Run, Cancel, Details, status/stage/progress, cleanup,
  diagnostics/results, export status, and output Open/Reveal actions.
- Any generated build/test output requires an exact approved path. Preserve
  existing S102/S103/S106 artifacts and unrelated worktree changes.