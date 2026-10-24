# Sprint 103 Acceptance Criteria

Sprint 103 is complete only when clear panel presentation/local state
boundaries reduce shell responsibility while preserving existing workbench
behavior. Sprint 103 adds no explorer, command-palette, activation, resize, or
runtime-docking functionality.

## Ownership and Refactor

- `App.vue` remains the shell and owner of project/RPC orchestration, active
  document and preview identity, cancellation/freshness, navigation, and
  cross-panel workflows.
- `RuntimePanel.vue` is extracted with local Details disclosure state and
  typed props/events. It has no RPC client or filesystem authority.
- The contextual pane wrapper is extracted only if its controlled state,
  slots, and typed events preserve `App.vue` ownership of the iframe bridge
  and active-document reset. If it is not extracted, `builder-evidence.md`
  records the reason; no broad wrapper is added just to reduce markup.
- Existing components (`ProjectExplorer`, `WorkbenchTabs`, `CommandPalette`,
  `InputsPanel`, `DataEditorPane`, `CodeEditor`, and dialogs) retain their
  current roles and public behavior.
- Editor/data editor refs and the preview bridge remain operational without
  wide or untyped forwarding APIs.

## Behavior Preservation

- Header, Welcome, explorer search/listing/actions, tabs, editor controls,
  context tabs/actions, palette, Help, Preferences, and active-document
  workflows behave as before.
- Runtime run/cancel, status/stage/progress, cleanup, export/output actions,
  diagnostics/results, and Details behavior are preserved.
- Runtime Bottom/Right controls, preference, state, and layout are unchanged
  until Sprint 107. Existing custom resize bars and persistence are unchanged.
- First-load activation remains assigned to Sprint 104; no duplicate or
  partial activation behavior is introduced by the refactor.
- No new behavior is added for explorer operations, command keyboard
  navigation, resizing, or runtime relocation.
- CSS classes/accessibility labels and responsive scrolling remain compatible
  with current styles and focused UI tests at 1024x720 and 1440x900.

## Verification and Boundaries

- `behavior-preservation-matrix.md` cases map to focused component/UI checks
  and relevant existing tests.
- Desktop typecheck passes; the focused component-boundary Playwright test
  passes; relevant existing preview/workbench UI tests pass. If a test cannot
  run, record its exact status and reason.
- Run the RPC contract test only if a boundary change affects RPC-facing
  wiring; no RPC/service behavior changes are expected.
- Build outputs and Playwright artifacts remain within separately approved
  paths. `git diff --check` and an exact path inventory pass.
- No changes are made to dependencies, language behavior, release/version
  files, status ledgers, or historical sprint artifacts.
- Builder evidence records exact commands, counts, failures, artifacts,
  residuals, and recommendation. A separate product-owner disposition is
  required; no downstream sprint or release authorization is inferred.