# Sprint 045 Handoff Prompt

You are the Builder for OpenAMX Sprint 045.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV07MasterSprintPlan.md`
- `planning/ideas/desktop-app-features.md`
- `planning/sprints/0045-v07-workbench-viewport-editor-comfort/requirements.md`
- `planning/sprints/0045-v07-workbench-viewport-editor-comfort/blueprint.md`
- `planning/sprints/0045-v07-workbench-viewport-editor-comfort/acceptance.md`
- Sprint 044 requirements, acceptance, and Builder evidence, especially the Playwright/Vite harness and its native-evidence limitation
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`, `desktop-app/src/mainview/CodeEditor.vue`, and `desktop-app/src/mainview/components/PreferencesDialog.vue`
- `desktop-app/tests/ui/preview-freshness.pw.ts`, `desktop-app/playwright.config.ts`, and current desktop scripts

## Task Contract

**objective**: Bound the workbench to the current window viewport with independently scrolling explorer/editor/preview panes, add default-on persistent global editor wrapping and editor-only Tab/Shift+Tab indentation, and correct runtime drawer text contrast for light/dark themes.

**owns**: Workbench/app viewport and pane layout; CodeMirror wrapping and indentation keymaps; device-local global wrap preference; runtime drawer foreground tokens; focused automated browser checks; visual evidence at required viewports; exact evidence and Sprint 045 disposition.

**must_not**: Disable native window resizing or alter window dimensions; allow long content to expand the app page; solve layout by clipping or page-level scrolling; capture Tab outside CodeMirror; store wrap settings in project/source data; alter AMX/CLI/parser/evaluator/VS Code semantics or RPC authority; or claim browser checks as native certification. Do not implement Sprint 046 Help Center work or unrelated V0.7 backlog.

**decision gates**: Use the Sprint 044 Playwright/Vite test approach and keep dependencies test-only. Wrapping defaults on and persists globally on the local device. Preserve ordinary focus navigation outside the editor. Verify all runtime drawer text categories/states against light and dark surfaces; do not treat this review as formal accessibility certification. Sprint 044 Builder verification is complete, but its Lead Developer disposition is pending; consume its evidenced test approach without upgrading its native evidence status.

**acceptance**: Meet every item in `planning/sprints/0045-v07-workbench-viewport-editor-comfort/acceptance.md`, including the 1024x720 and larger viewport checks and independent scrolling in both desktop and adaptive layouts.

**verification**:

1. Use long content in explorer, editor, preview, and runtime drawer at 1024x720 and a larger viewport; assert bounded page dimensions and independent pane scrolling in desktop and adaptive layouts.
2. Verify default-on wrapping, preference persistence across reload/restart, global application to AMX editors, Tab/Shift+Tab indentation while focused, and ordinary focus traversal outside the editor.
3. Review runtime status, stage, diagnostics, links, muted copy, and code across light/dark themes and available operation states.
4. Capture visual evidence with browser/runtime/host identified; do not claim native Electrobun, cross-platform, or formal accessibility acceptance from browser evidence.
5. Run focused Playwright/UI checks first, then desktop tests, typecheck, production web build, and `git diff --check`. Record exact commands/results, screenshots/artifacts, warnings, and unavailable checks.
6. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 045 Builder evidence. Do not report unperformed checks as passes.