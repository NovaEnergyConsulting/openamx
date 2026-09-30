# Sprint 029 Blueprint: Desktop Workbench Shell and Project Workflow

## Approach

1. Treat `docs/language-spec-v0.5.md` section 5 as the state/authority contract. Start with the existing single-current-document `desktopService.ts` and typed `rpc.ts`, and extend the owning service to a project-scoped tab map keyed by canonical paths with independent active/entry identities, per-tab disk hash/text/dirty/conflict/revision. Keep the existing analysis/loader/export calls in the main process. Define request responses that bind to project generation, entry URI and revision; late UI responses must not attach to a different project/tab.
2. Wire native dialogs in the Bun/Electrobun main process through bounded typed RPC requests. Separate selection intents from validated open/save/export operations; cancellation changes nothing. Reuse the current desktop destination validator/atomic writers and root containment checks after selection. Verify close/quit/project-switch confirmations across the typed boundary, including a failed save leaving every dirty tab intact.
3. Build a contained project-file enumeration and filtering boundary on the service side: skip forbidden dot/generated trees, symlinks and nonregular files, reject ignored explicit opens, sort relative paths; build hierarchy and case-insensitive display-path search from only the returned bounded listing. Keep an empty state and no-match state. A module open switches active tab, not entry.
4. Implement tab transitions in small testable steps: open/switch and unsaved persistence; designate entry; guarded save/reload/close and conflict detection per file; dirty dependency barrier before run/preview/export; project switch/quit with Save/Discard/Cancel. Existing imports still use saved modules; never inject dirty module contents into the loader in this sprint. Explicitly label which entry buffer powers each report action.
5. Store only bounded recent roots and optional relative active/entry filenames/panel sizes locally; do not write session data to `.openamx` or shared config. On restore validate directories, files and containment before opening, drop stale records, and never auto-run or recover unsaved text. Add clear-history action and test privacy, missing files and symlink substitution.
6. Reshape `App.vue`/`app.css` into a technical-IDE shell respecting the approved colors/type/focus states. Make explorer/editor/preview/diagnostics/results/inputs/export areas reachable via bounded resize/collapse/tabs at 1280x720 and 800x600; focused modes preserve state. Keep the current basic text editor and static diagnostics as placeholders for the Sprint 030 component, without introducing a second parser or exposing file handles in the webview.
7. Add one shared command registry for toolbar/palette/shortcut dispatch with disabled reasons and accessible names; respect editor shortcut precedence and platform key mapping. Escape dismisses transient UI and restores focus. Export always uses an explicit dialog/command, never an overwriting shortcut. Document the actual shortcuts available in the desktop help/README only if verified during this sprint.
8. Expand `desktop-app/tests/rpc-contract-check.ts` and nearby desktop UI tests for independent tabs, safe dialogs, explorer containment, privacy, commands and layout/focus states. Run focused tests first, then direct typecheck/Vite and root regressions as applicable. Attempt package/native checks only where available; report Hutch/native gaps separately rather than substituting WSL2 evidence. Record exact commands/outcomes in planning logs.

## Files to Update

- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`, and the owning Bun dialog/application startup wiring
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`, and existing local UI components when suitable
- `desktop-app/tests/rpc-contract-check.ts` and focused desktop UI tests using the current test setup
- `desktop-app/README.md` for implemented commands/shortcuts if needed; `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for actual results and deviations

## Notes

- Maintain the trusted boundary: no webview direct disk, input/module loading, evaluator, native dialog, or export adapter access. A native dialog returning a path is never evidence that the path is permitted.
- Sprint 029 owns workflow and layout, not Sprint 030's editor choice or new diagnostics/completion behavior. Sprint 031 owns branded reports; Sprint 033 may proceed in parallel after the accepted Sprint 028 contract.
- Scope changes to approved contract policy, privacy, identity or inherited release gates require a recorded Lead Developer decision. Sprint 034 performs final visual sign-off; do not mark it passed from shell screenshots alone.
