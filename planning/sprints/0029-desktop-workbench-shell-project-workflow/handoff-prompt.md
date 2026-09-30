# Sprint 029 Handoff Prompt

You are the Builder for OpenAMX Sprint 029.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV05MasterSprintPlan.md`
- `docs/language-spec-v0.5.md`, especially sections 4-5
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md`
- `planning/sprints/0029-desktop-workbench-shell-project-workflow/requirements.md`
- `planning/sprints/0029-desktop-workbench-shell-project-workflow/blueprint.md`
- `planning/sprints/0029-desktop-workbench-shell-project-workflow/acceptance.md`
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`, `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`, `desktop-app/tests/rpc-contract-check.ts`

## Task Contract

**objective**: Deliver the contract-approved desktop workbench shell and contained project workflow with safe native dialogs, searchable explorer, independent tabs and entry buffer, private recent/session restoration, accessible layout modes and command palette/shortcuts.

**owns**: Typed main-process desktop operations and state, workbench shell UI, focused desktop tests and evidence, implemented desktop help/shortcuts documentation, planning outcome records.

**must_not**: Introduce direct webview filesystem/dialog/evaluator/export authority; trust native picker output without validation; silently overwrite, drop unsaved text or run a dirty dependency from disk; redesign parser/exports or V0.2-V0.4 behavior; implement Sprint 030's full editor or Sprint 031 branding; claim native platform/Hutch/Office/license gates passed from WSL2/direct builds.

**acceptance**: Satisfy every item in `planning/sprints/0029-desktop-workbench-shell-project-workflow/acceptance.md` under the approved V0.5 contract. If an approved policy cannot be implemented safely, record a concrete blocker and options for Lead Developer review rather than relaxing it.

**verification**:

1. Extend the owning service/typed RPC with one narrowly testable tab/dialog/workflow operation, then run focused `desktop-app/tests/rpc-contract-check.ts` assertions before expanding UI. Prove current-buffer entry use and conflict-safe save, cancellation and destination no-write behavior.
2. Exercise multi-tab/entry/dirty-dependency/session/explorer/palette and layout/keyboard cases with focused direct and UI tests, including 800x600 and 1280x720 observations. Record actual evidence; final Lead Developer visual sign-off remains Sprint 034.
3. Run desktop `bun run test`, direct `bunx vue-tsc --noEmit` and `bunx vite build` where supported, root `bun run build` and `bun test`, package/native checks where available, and `git diff --check`. Report exact versions, counts, failures and unavailable platform/Hutch checks; do not substitute WSL2 for native Ubuntu/macOS/Windows.
4. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md` with actual results and any approved deviations. Hand off only the stable shell/tab boundary to Sprint 030; do not claim its editor behavior delivered.
