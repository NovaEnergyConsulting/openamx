# Sprint 037 Requirements: Workbench Shell, Themes, Menus, and Welcome

## Goal

Turn the existing desktop prototype into the approved V0.6 workbench shell: a focused active-document workspace with explorer, tabs, source/preview content, contextual pane, runtime drawer, native/command controls, themes, responsive layout, and welcome experience. Consume Sprint 036's typed active-document and job/RPC foundation without implementing later project lifecycle or feature-specific editing.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 037
- `planning/openamxV06ProductUXContract.md`
- Sprint 035 contract/frame evidence and Sprint 036 accepted builder evidence, decisions, questions, and state
- `desktop-app/src/mainview/App.vue`, `app.css`, `CodeEditor.vue`, current desktop components/services/state and `desktop-app/src/shared/rpc.ts`
- Sprint 036 active-document/job contracts and direct tests
- Existing V0.5 desktop acceptance residuals and available frame/harness evidence

## In Scope

- Decompose `desktop-app/src/mainview/App.vue` into focused workbench, explorer, tabs, content panes, contextual pane, runtime drawer, command palette, welcome, status, and dialog components with an explicit typed state/composables boundary.
- Replace crowded header/workflow strips, designated-entry controls, dead wide-window selectors, separate format buttons, and plus/minus pane controls with functional workbench navigation and commands.
- Implement the approved explorer/source/context split, directly draggable bounded dividers, bottom/right runtime drawer docking, source-only and preview-only focus modes, persisted local layout, and adaptive behavior at 1024x720.
- Implement one shared command registry consumed by native menu integration where available, command palette, shortcuts, and contextual controls. Commands require stable IDs, enabled/disabled reasons, accessible names, and icon tooltips.
- Deliver system/light/dark tokens for workbench surfaces, CodeMirror, data shells, preview, drawers, dialogs, focus, status, and contrast. Respect reduced motion and avoid color-only status.
- Implement the welcome view with Open Project and Create Project routing hooks, validated recents presentation, starter examples, guided-first-project entry, recovery/release-note indicators, help search entry, and concise empty/error states. Project creation/lifecycle behavior remains Sprint 038.
- Add file-type-specific tab shells for AMX source/preview, CSV/JSON data/inspector, settings, and generated-output actions. Feature-specific editing remains later sprint scope.
- Add focused component/browser checks and deterministic screenshots for layout, pane interaction, commands, keyboard focus/restoration, themes, and empty/loading/error states at required viewports.

## Out of Scope

- Project creation, enumeration, rename/move, duplicate, delete/trash/restore, autosave, disk conflicts, crash recovery, or external-file lifecycle; these belong to Sprint 038.
- Inputs panel behavior and report-settings editing; these belong to Sprint 039.
- AMX token highlighting/intelligence/refactoring; these belong to Sprint 040.
- CSV/JSON structured editing, grid/tree selection, and 100,000-row viewport acceptance; these belong to Sprint 041.
- Debounced live preview, runtime execution UX, complete export workflow, and final cancellation/performance acceptance; these belong to Sprint 042.
- Onboarding/help content completion, migration, release notes, and integrated acceptance; these belong to Sprint 043.
- Native platform/release certification, Hutch packaging, broad Office, licensing/Marketplace, formal accessibility certification, or claiming unavailable native APIs as passed.

## Constraints

- Preserve Sprint 036 active-document identity, project generation/revision guards, job lifecycle, bounded RPC payloads, source overlay, and webview authority boundary.
- Use the approved Sprint 035 visual direction and frame evidence as input, but do not treat low-fidelity frames as a license to change contract behavior. Record any required contract amendment before implementing it.
- Every control must work, be keyboard reachable, have an accessible name, and expose a reason when disabled. Do not add placeholder controls or dead format/menu buttons.
- Persist only bounded machine-local layout/preferences; never put source text, input contents, private paths, recovery data, or credentials in shared project configuration.
- Keep 1024x720 usable without clipping primary workflows; use drawers/tabs/adaptive collapse rather than shrinking content to zero. Preserve focus and active-document context across mode/drawer changes.
- Browser/shim evidence proves webview behavior only. Native menu, dialog, window lifecycle, and host focus acceptance remains unavailable until direct SDK-enabled host evidence exists.
