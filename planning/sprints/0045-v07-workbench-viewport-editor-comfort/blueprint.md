# Sprint 045 Blueprint: Workbench Viewport and Editor Comfort

## Approach

1. Establish the layout baseline using the Sprint 044 browser harness at 1024x720 and a larger viewport. Exercise long explorer contents, long AMX source, long preview output, runtime details, bottom/right drawer modes, and the adaptive breakpoint. Record page dimensions and each pane's scroll extent/position.
2. Correct the layout from the outer shell inward. Bound the app/workbench against the available viewport, ensure flex/grid ancestors can shrink (`min-height: 0` where required), and assign vertical overflow to the explorer, editor scroller, and preview/iframe content. Verify stacked panes do not reintroduce page growth and each remains reachable/scrollable. Do not alter native window configuration.
3. Extend `CodeEditor.vue` with CodeMirror line wrapping enabled by default and indentation bindings for Tab/Shift+Tab. Keep the bindings inside the editor extension so application controls and ordinary focus traversal are unaffected.
4. Add a global wrap control to the existing Preferences flow. Persist it using the established device-local preferences pattern, initialize a missing value to enabled, apply changes to all open AMX editor states, and verify persistence after reload without changing project/document source.
5. Replace hard-coded runtime drawer foregrounds with shell/theme tokens. Audit each state and text class: status, stage, diagnostic copy and links, muted content, and code. Review actual rendered surfaces in light and dark (including system mode resolving to either palette) rather than checking declarations alone.
6. Add focused Playwright coverage against the production workbench/editor components. Assert the document/page stays within the viewport, the relevant pane scroll positions change independently, wrap defaults/persists/toggles, Tab/Shift+Tab change editor text while focus remains in CodeMirror, outside-editor Tab navigation remains normal, and runtime states use legible theme-aware styling.
7. Capture and record visual evidence at 1024x720 and a larger desktop viewport, including adaptive layout and light/dark runtime-drawer states. Identify the browser/runtime; do not imply native Electrobun or formal accessibility certification.
8. Run focused UI tests first, then desktop tests, typecheck, production web build, and `git diff --check`. Record exact commands, results, browser versions, screenshots/artifacts, warnings, and residuals.
9. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with the Sprint 045 outcome and remaining evidence boundaries. Leave Sprint 046 and unrelated V0.7 requirements untouched.

## Files to Update

- `desktop-app/src/mainview/app.css` and `desktop-app/src/mainview/App.vue` for viewport/pane layout and theme-aware runtime text
- `desktop-app/src/mainview/CodeEditor.vue` for wrapping and editor-only indentation key behavior
- `desktop-app/src/mainview/components/PreferencesDialog.vue` and its `App.vue` persistence path for the global wrap setting
- Existing desktop Playwright/UI coverage and test configuration under `desktop-app/tests/ui/` and `desktop-app/playwright.config.ts`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 045 Builder evidence and visual artifacts

## Notes

The layout must be tested as a whole: a pane can have `overflow: auto` and still fail if an ancestor expands with its contents. In the adaptive layout, retain a bounded workbench viewport and give the active/stacked panes explicit shrinkable tracks and independent scrolling. Keep wrapping enabled initially, and make persistence global and local to the device. Verify CodeMirror owns Tab behavior only while focused; do not capture Tab at the application shell.