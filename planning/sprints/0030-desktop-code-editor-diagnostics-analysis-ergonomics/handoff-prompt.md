# Sprint 030 Handoff Prompt

You are the Builder for OpenAMX Sprint 030.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV05MasterSprintPlan.md`
- `docs/language-spec-v0.5.md`, especially sections 4-5
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md`
- `planning/sprints/0029-desktop-workbench-shell-project-workflow/acceptance.md`
- `planning/sprints/0030-desktop-code-editor-diagnostics-analysis-ergonomics/requirements.md`
- `planning/sprints/0030-desktop-code-editor-diagnostics-analysis-ergonomics/blueprint.md`
- `planning/sprints/0030-desktop-code-editor-diagnostics-analysis-ergonomics/acceptance.md`
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`, `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/tests/rpc-contract-check.ts`

## Task Contract

**entry gate**: Sprint 029 is still recorded OPEN. Before implementing Sprint 030, obtain a recorded Lead Developer acceptance of Sprint 029 or an explicit dependency disposition. The prior approval of Sprint 029 changes does not waive native save-picker and close/quit verification; do not label those passed based on editor work. Preparation and candidate research may proceed without claiming full Sprint 030 authorization.

**objective**: After the gate is resolved, prove and integrate a maintained accessible editor; deliver pure source-aware formatting/completion/diagnostics and correct current-buffer run/preview/export feedback across the workbench's independent tabs.

**owns**: Editor proof/selection and integration, desktop static-analysis/diagnostic/navigation UX, bounded typed editor RPC changes, current-revision feedback, focused desktop coverage and planning outcomes.

**must_not**: Replace the parser with an ad hoc grammar, evaluate or load data for editor assistance, grant webview direct filesystem/dialog/loader/evaluator/export access, use dirty dependencies from stale disk, weaken no-write guarantees, silently waive Sprint 029 native residuals, or claim native platform/Office/Marketplace gates without evidence.

**acceptance**: Meet every item in `planning/sprints/0030-desktop-code-editor-diagnostics-analysis-ergonomics/acceptance.md`. If the component proof fails or Sprint 029 gate remains unresolved, document the blocker and options; do not report Sprint 030 complete.

**verification**:

1. Record the Sprint 029 gate disposition, then execute the editor proof (keyboard, IME, selection/undo, screen reader, license/bundle, direct build/available host) before installing or replacing the textarea.
2. Validate the smallest editor integration against active-tab unsaved text and source-located formatting/diagnostics, then run focused desktop tests for navigation, imports, request staleness and failure/no-write states after each substantive slice.
3. Run desktop `bun run test`, direct `bunx vue-tsc --noEmit` and `bunx vite build`, root `bun run build` and `bun test`, available native/package checks, and `git diff --check`. Record exact tool/OS versions, counts and unavailable checks; WSL2/browser evidence is not a native release-owner check.
4. Update planning logs with implementation evidence, gate status and Sprint 034 visual-review follow-up without merging Sprint 029 residuals into Sprint 030 acceptance.
