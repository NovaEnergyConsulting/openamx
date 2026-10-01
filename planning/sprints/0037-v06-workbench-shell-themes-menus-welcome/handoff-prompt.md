# Sprint 037 Handoff Prompt

You are the Builder for OpenAMX Sprint 037.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/builder-evidence.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/requirements.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/blueprint.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/acceptance.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/builder-evidence.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/requirements.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/blueprint.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/acceptance.md`
- `desktop-app/src/mainview/App.vue`, `app.css`, `CodeEditor.vue`, current desktop tests, and the typed RPC contracts

## Task Contract

**objective**: Deliver the V0.6 workbench shell, themes, command registry, welcome experience, file-kind tab shells, responsive layout, and focused component/browser evidence on top of Sprint 036's active-document/job foundation.

**owns**: Focused Vue workbench components, typed shell state/composables, explorer/tabs/content/context/drawer layout, focus modes and restoration, command registry/palette/shortcut wiring, theme and accessibility tokens, welcome routing/presentation, file-kind shells, and deterministic shell tests/screenshots.

**must_not**: Implement project creation/lifecycle/autosave/trash/recovery, Inputs/report settings, AMX intelligence, structured data editing, final live preview/export UX, onboarding/help completion, or native/release certification; alter AMX/CLI/VS Code semantics; add dead controls; duplicate main-process authority; or claim browser/shim/native behavior interchangeably.

**decision gates**: Preserve the accepted Sprint 036 active-document identity, job/RPC contracts, overlay behavior, and webview authority. Any contract or authority change requires a recorded Lead Developer decision. Native menus/dialogs/window behavior remain blocked until direct SDK-enabled host evidence is available.

**acceptance**: Meet every item in `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/acceptance.md`. Final status must separate shell behavior proven in the browser/component harness from native-host behavior that remains unavailable.

**verification**:

1. Run focused component/browser checks after each shell slice: populated/empty states, divider/drawer/focus transitions, palette/shortcut commands, disabled reasons, themes, reduced motion, and both viewport classes.
2. Run the desktop RPC contract check, `bun run test`, `bunx vue-tsc --noEmit`, and direct `bunx vite build`; run root/VS Code checks if shared contracts or editor behavior change. Record exact outputs, bundle sizes, warnings, and missing-host blockers.
3. Inspect deterministic screenshots for system/light/dark themes, dense/error states, keyboard focus, 1024x720 and larger layouts. Do not mark native menu/save/window behavior passed from browser evidence.
4. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 037 builder-evidence record with residual owners and Sprint 038 entry conditions.
