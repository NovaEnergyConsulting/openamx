# Sprint 045 Requirements: Workbench Viewport and Editor Comfort

## Goal

Keep the desktop workbench contained within the current native window viewport while improving long-document editing and runtime-drawer readability. The explorer, editor, and preview must remain independently usable and vertically scrollable at desktop and adaptive/narrow layouts.

## Inputs

- `planning/plan-openamxV07MasterSprintPlan.md`, Sprint 045
- `planning/ideas/desktop-app-features.md`, Main Application Window, Code Editor, and Runtime Drawer observations
- Sprint 044 requirements, acceptance, and Builder evidence; use its established Playwright/Vite workflow harness for repeatable UI tests
- `desktop-app/src/mainview/App.vue` and `desktop-app/src/mainview/app.css`
- `desktop-app/src/mainview/CodeEditor.vue` and `desktop-app/src/mainview/components/PreferencesDialog.vue`
- Existing desktop UI tests and package scripts, including `desktop-app/tests/ui/preview-freshness.pw.ts`
- Existing local preference and shell-theme behavior; V0.5 product/UX constraints where applicable

## In Scope

- Bound the app/workbench content to the current viewport so long source, explorer trees, preview reports, runtime details, and stacked adaptive panes cannot grow the application page beyond the window.
- Preserve native window user-resizability and do not change native window dimensions or impose a fixed OS window size.
- Make the explorer, editor, and preview independently vertically scrollable. Preserve independent scrolling when the adaptive/narrow layout stacks or changes panes; preview report content must scroll within the preview pane.
- Enable CodeMirror line wrapping by default and expose a discoverable global preference that persists locally on the device across app restarts and applies consistently to AMX documents.
- Make Tab indent and Shift+Tab unindent using the editor's configured indentation behavior only while CodeMirror has focus. Preserve ordinary application/browser focus navigation when the editor is not focused.
- Replace runtime-drawer hard-coded low-contrast foreground colors with theme-appropriate tokens for operation status, stage, diagnostics, links, muted text, and code text in light and dark themes.
- Add focused automated UI coverage for viewport containment, independent pane scrolling in desktop and adaptive layouts, wrap default/persistence/toggle behavior, editor Tab/Shift+Tab focus behavior, and runtime text themes/states.
- Capture visual evidence at 1024x720 and a larger desktop viewport. Record the browser/host used and do not represent browser evidence as native-platform or formal accessibility certification.

## Out of Scope

- Sprint 046 Help Center JSON/content migration, dialog sizing, or integrated acceptance.
- Further preview freshness changes, debounce changes, or changes to Sprint 044 job/request identity behavior.
- AMX language/CLI semantics, VS Code extension behavior, native window resizing policy, native-platform certification, formal accessibility certification, or release engineering.
- Unrelated V0.7 carry-forward backlog beyond observations and verification directly needed for this sprint.

## Constraints

- The native window remains user-resizable. Constrain app content to its current viewport rather than changing window dimensions or disabling resizing.
- Do not solve long content by clipping or making the entire page scroll. Each requested workbench pane owns its vertical scrolling, including adaptive/narrow presentation.
- Wrapping defaults on; the global preference is persistent and device-local, not per-document or project configuration. Preserve all other existing preferences and defaults.
- Tab and Shift+Tab override focus navigation only while the CodeMirror editor has focus; controls outside it retain normal focus navigation.
- Runtime text colors must respond correctly to the active light/dark theme and remain distinguishable for all listed states. Browser contrast review is not formal accessibility certification.
- Use the Sprint 044 Playwright test approach where suitable. Any browser evidence supplements rather than replaces direct native-host evidence.
- Keep the implementation focused on the existing Vue/CSS/CodeMirror ownership boundaries; do not change parser, evaluator, RPC authority, or desktop native-window behavior.