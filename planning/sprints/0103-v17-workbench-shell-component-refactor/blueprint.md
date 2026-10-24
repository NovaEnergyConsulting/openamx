# Sprint 103 Blueprint: V0.17 Workbench Shell and Component Refactor

## Approach

1. Obtain separate Sprint 103 implementation authorization and approval of
   the exact file, test, and output plan. Confirm V0.16 Sprints 100 and 101
   are closed and Sprint 102 is separately dispositioned before editing.
2. Record the starting worktree and inspect the current `App.vue`, candidate
   child components, style selectors, and focused Playwright/RPC tests. Do not
   assume that Sprint 102 preparation or its prototype changed product code.
3. Preserve `App.vue` as the shell. Before moving markup, document ownership
   of each state value, RPC call, imperative editor/preview ref, and action
   handler in `component-boundaries.md`.
4. Extract `RuntimePanel.vue` first. Move only its presentation and local
   Details-expanded state. Keep Run/Cancel, output Open/Reveal, diagnostic
   navigation, input-diagnostic navigation, status/result data, and current
   Bottom/Right selection as shell-provided props and typed events. Do not
   give the child an RPC client.
5. Evaluate the contextual-pane frame extraction described in
   `component-boundaries.md`. If the controlled view prop and slots preserve
   the preview iframe ref/load bridge, existing `contextView` activation
   reset, and CSS selectors simply, implement it. Otherwise keep the markup
   in `App.vue` and record the concrete coupling that makes extraction
   unhelpful; do not force a wrapper.
6. Leave the editor composition and all RPC/cross-panel workflows in the
   shell. `CodeEditor` and `DataEditorPane` remain their own focused
   components; preserve the imperative refs used for focus, selection,
   replacement, and data-location navigation.
7. Add focused UI regression coverage using the existing Playwright/Vite
   harness. Verify component rendering, typed event wiring, active-document
   controls, runtime details and actions, and the unchanged explorer,
   command, preview, editor, and responsive workflows. Do not assert future
   Sprint 104-107 behavior.
8. Run the focused desktop typecheck, targeted UI test, relevant RPC contract
   check if any wiring boundary touches it, and the desktop web build if
   included in the approved file/output plan. Capture visual evidence at
   1024x720 and 1440x900 where the test harness permits.
9. Record exact files, checks, outcomes, residuals, and recommendation in
   `builder-evidence.md`. Request separate acceptance; do not update global
   planning status or infer downstream authorization.

## Candidate File Plan

Expected implementation files, subject to separately approved execution
scope:

- `desktop-app/src/mainview/App.vue` — shell wiring and removal of extracted
  presentation only; project/RPC orchestration remains here.
- `desktop-app/src/mainview/components/RuntimePanel.vue` — new runtime
  presentation and local Details state.
- `desktop-app/src/mainview/components/DocumentContextPanel.vue` — optional
  presentation frame for contextual tabs/actions if the slot boundary proves
  simpler than the current template.
- `desktop-app/src/mainview/app.css` — only selector/style adjustments needed
  to preserve current appearance and responsive behavior.
- `desktop-app/tests/ui/shell-components.pw.ts` — new focused component
  integration/regression coverage, or an approved extension of the nearest
  existing UI test.
- `planning/sprints/0103-v17-workbench-shell-component-refactor/builder-evidence.md`
  — approved execution evidence.

No new RPC API, service behavior, package, dependency, or test framework is
expected. If the final file plan differs, obtain approval before editing.

## Verification Commands

Proposed from `desktop-app/`, subject to the execution approval's exact output
and worktree isolation plan:

- `bun run typecheck`
- `bun run test:ui -- tests/ui/shell-components.pw.ts`
- Relevant existing UI tests, such as `tests/ui/workbench-comfort.pw.ts`,
  `tests/ui/preview-freshness.pw.ts`, and `tests/ui/diagram-playback.pw.ts`,
  when the extracted presentation touches their selectors or callback paths.
- `bun run test` if RPC-contract wiring is affected.
- `bun run build:web` only if included in the approved validation plan; it
  generates build/runtime outputs that must be isolated or specifically
  approved.
- `git diff --check` and an exact path inventory.

## Notes

Sprint 103 is a behavior-preserving refactor. It does not close the
first-load, explorer, command-palette, resize, or runtime-docking requirements
owned by Sprints 104-107. No release or publication authority follows.