# Plan: OpenAMX V0.7 Desktop UX Follow-Up

Improve the existing OpenAMX desktop workbench by resolving the concrete usability observations gathered in `planning/ideas/desktop-app-features.md`. Keep V0.7 a focused desktop quality cycle rather than taking on unrelated new functionality or the broader carry-forward backlog in `planning/requirements-openamxV07.md`. Continue sprint numbering at 044. There is no fixed sprint/date budget; all selected observations are in scope and required for V0.7 acceptance.

## Recommended Approach

- Organize implementation into three proposed sprints: preview freshness and UI-test foundation; workbench viewport, editor, and runtime readability; Help Center data/layout and integrated acceptance.
- Confirm the reported preview failure before selecting a fix. A leading hypothesis is that autosave changes a captured disk hash while a preview job is running, causing a result for the unchanged active buffer to be rejected. Treat this as unconfirmed and preserve all project/document/input/settings/job freshness guards.
- Keep the current 400 ms preview debounce unless evidence supports a change; do not exceed the V0.6 contract's 500 ms maximum. Pause must stop automatic refresh, while manual refresh remains available.
- Keep the native window user-resizable. Constrain app content to its current viewport and make the explorer, editor, and preview independently scrollable, including the adaptive layout.
- Default editor wrapping on and provide a persistent global preference. Tab and Shift+Tab use editor indentation behavior only while the editor has focus; normal focus navigation remains unchanged elsewhere.
- Correct all runtime-drawer foreground states for light and dark themes. Move static content owned by the Help Center into bundled JSON, retaining Vue for rendering and interactions and the command registry as the source of shortcut metadata.
- Establish repeatable automated browser/UI coverage for these behaviors. The existing workflow fixture is a spike harness; validate its suitability and add a maintained desktop-test-only browser dependency only if needed after a bounded compatibility proof.
- Keep scope to the desktop observations and verification directly needed to accept them. Do not expand into unrelated V0.7 backlog requirements, AMX/CLI semantics, VS Code features, native platform certification, formal accessibility certification, or release engineering.

## Steps

### Phase 1 - Preview Freshness and UI-Test Foundation

#### Sprint 044: Preview Freshness and UI-Test Foundation (depends on nothing)

- Reproduce the reported sequence: edit an AMX document, wait beyond the 400 ms debounce, observe computation complete, and confirm whether the preview still shows old output with a `STALE` status.
- Trace scheduling, result acceptance, freshness checks, autosave, and iframe rendering through `desktop-app/src/mainview/App.vue` and `desktop-app/src/bun/desktopService.ts`.
- Test the hypothesis that autosave changes a captured disk hash after a preview starts, superseding a valid result even though the active tab's current revision/text is unchanged. Confirm or falsify it with a deterministic delayed-worker regression before choosing a production change.
- Preserve rejection of genuinely outdated jobs, the last-good preview behavior for invalid/stale input, and project/document/input/settings/job identity guarantees.
- Add a delayed, source-dependent preview test that verifies current output reaches the rendered iframe after autosave. Cover pause, resume, manual refresh, and stale-result rejection.
- Extend the real-App workflow harness if suitable. Prove browser-automation compatibility; add a maintained dependency scoped to desktop tests only if required.
- Retain the 400 ms default unless evidence warrants an adjustment; stay within the existing 500 ms contract maximum.

### Phase 2 - Workbench Viewport, Editor, and Runtime Readability

#### Sprint 045: Workbench Viewport and Editor Comfort (depends on Sprint 044 test approach; feature slices may proceed independently)

- Bound the workbench layout to the current native window viewport without disabling native window resizing or changing its dimensions. Long documents must not grow the application page beyond that viewport.
- Give the explorer, editor, and preview independent vertical scrolling. Preserve the behavior in the adaptive/narrow layout; preview report content scrolls within its pane.
- Add CodeMirror line wrapping, enabled by default, and a discoverable persistent global wrap preference.
- Bind Tab to the editor's configured indentation behavior and Shift+Tab to unindent while CodeMirror has focus. Preserve normal keyboard focus navigation when it does not.
- Replace low-contrast hard-coded runtime-drawer foregrounds with theme-appropriate colors/tokens for status, stage, diagnostics, links, muted text, and code text.
- Add focused automated checks for viewport and pane scrolling, wrap preference, editor keyboard behavior, and theme states. Capture manual visual evidence at 1024x720 and a larger desktop viewport.

### Phase 3 - Help Center and Integrated Acceptance

#### Sprint 046: Help Center and Integrated Acceptance (depends on Sprints 044-045)

- Move static help content currently owned by the Help Center, including topic text and search data, into a bundled JSON resource. Keep Vue responsible for rendering, filtering, navigation, and interactive actions. Preserve stable topic IDs, search terms, initial-section routing, and offline behavior.
- Keep shortcut metadata sourced from the shared command registry rather than duplicating it in JSON.
- Size the Help Center to approximately 80% of the app window width and height, bounded by the viewport. Keep header, search, and footer fixed while the help content scrolls, so search filtering does not resize the modal.
- Add UI coverage for bundled help loading, dialog bounds, filtering without resize, and content scrolling at the minimum and larger viewports.
- Run integrated manual acceptance for the requested behaviors. Record exact commands, outcomes, visual evidence, and residuals in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` as appropriate.

## Relevant Files

- `planning/ideas/desktop-app-features.md` - exclusive source for V0.7 feature scope.
- `planning/requirements-openamxV07.md` - inherited broader backlog, explicitly not included except where it overlaps directly with the requested observations.
- `planning/plan-openamxV06MasterSprintPlan.md` - master-plan conventions and V0.6 product constraints.
- `planning/sprints/0000-sprint-template/` - requirements, blueprint, acceptance, and handoff-prompt artifact templates for implementation sprints.
- `desktop-app/src/mainview/App.vue` and `desktop-app/src/mainview/app.css` - preview status/rendering, workbench layout, and runtime-drawer styles.
- `desktop-app/src/mainview/CodeEditor.vue` - CodeMirror wrapping and keyboard behavior.
- `desktop-app/src/mainview/components/HelpCenterDialog.vue` - Help Center content, filtering, dimensions, and scroll structure.
- `desktop-app/src/bun/desktopService.ts` - autosave, job identity, and freshness checks implicated in the preview report.
- `desktop-app/spikes/sprint042-workflow-harness/` and `desktop-app/package.json` - existing real-App fixture and desktop test scripts/dependencies to assess for browser automation.
- `desktop-app/tests/` - focused desktop service and UI regression coverage.

## Verification

1. Reproduce and automate the delayed preview result after autosave. Assert that current output updates the iframe and reaches success, while genuinely obsolete results remain rejected. Verify pause, resume, manual refresh, and stale-last-good behavior.
2. At 1024x720 and a larger viewport, verify long content does not grow the application page and the explorer, editor, and preview scroll independently, including the adaptive layout.
3. Verify wrapping defaults on, the global preference persists, Tab/Shift+Tab indent only while the editor has focus, and normal focus navigation remains outside it.
4. Review all runtime-drawer text states in light and dark themes for legibility.
5. Verify Help Center JSON is bundled and available offline; search/filtering must not resize the dialog, and fixed chrome/content scrolling must work at minimum and larger viewports.
6. Run focused browser/service checks, desktop test/typecheck/build scripts, and `git diff --check`. Record manual interaction and visual evidence. Browser evidence does not establish native-platform or formal accessibility certification.

## Decisions

- The native window remains user-resizable; app content is constrained to its current viewport and panes own their scrolling.
- Keep 400 ms as the default preview debounce, subject to root-cause evidence, and preserve the 500 ms maximum.
- Editor wrapping defaults on, with a persistent global preference. Tab indents and Shift+Tab unindents in the focused editor.
- Runtime contrast work covers all drawer text states in light and dark themes.
- Static Help Center content is bundled JSON; Vue retains interactive behavior and the shared command registry remains authoritative for shortcut metadata.
- The Help Center is approximately 80% of app width and height within viewport constraints; header/search/footer stay fixed while its content scrolls.
- Only observations in `planning/ideas/desktop-app-features.md` and their acceptance evidence are in scope. No unrelated backlog, language/CLI, VS Code, platform certification, formal accessibility certification, or release-engineering work is authorized by this plan.
- No fixed sprint/date budget; all selected observations are must-haves. Sprint numbering continues at 044. A browser automation dependency may be added only if feasibility work confirms it is needed.

## Further Considerations

1. The preview stale-result cause is not yet confirmed. Disk-hash invalidation after autosave is a testable hypothesis, not a preselected implementation. Sprint 044 must retain other active-identity checks.
2. The existing workflow harness is a spike fixture and does not currently provide browser automation. Its maintainability and compatibility must be proven before it becomes the regression-test boundary.
3. Available-browser visual checks supplement, but do not imply, native OS verification or formal accessibility certification.

## Next Actions

- Review and approve this master plan.
- Once approved, prepare Sprint 044 using the four artifacts in `planning/sprints/0000-sprint-template/` and record active status in `planning/state.md`.
- Hand off Sprint 044 for the reproduction, freshness investigation, deterministic regression, and browser-automation feasibility proof. Do not choose a freshness fix until the race hypothesis is confirmed or rejected with evidence.
