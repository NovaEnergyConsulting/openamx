# Sprint 046 Handoff Prompt

You are the Builder for OpenAMX Sprint 046.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV07MasterSprintPlan.md`
- `planning/ideas/desktop-app-features.md`
- Sprint 044 and Sprint 045 requirements, acceptance, Builder evidence, and current Lead Developer dispositions
- `planning/sprints/0046-v07-help-center-integrated-acceptance/requirements.md`
- `planning/sprints/0046-v07-help-center-integrated-acceptance/blueprint.md`
- `planning/sprints/0046-v07-help-center-integrated-acceptance/acceptance.md`
- `desktop-app/src/mainview/components/HelpCenterDialog.vue`
- `desktop-app/src/mainview/App.vue`, especially the `commands` registry, `openHelp` routing, starter actions, and diagnostic-export callback
- `desktop-app/src/mainview/app.css`, desktop UI tests, and Playwright/Vite fixture/configuration

## Task Contract

**objective**: Move static Help Center content into bundled offline JSON while retaining Vue-owned behavior and command-registry shortcut metadata; bound the dialog to approximately 80% of the app viewport with fixed header/search/footer and scrollable content; complete integrated V0.7 acceptance evidence.

**owns**: Dependency-disposition gate; Help Center data extraction and bundled loading; stable topic/search/routing behavior; fixed dialog layout; focused browser coverage; integrated Sprint 044-046 acceptance; visual/evidence and planning records.

**must_not**: Begin implementation before recording Sprint 044/045 Lead Developer dispositions or explicit authorization to proceed with their residuals; duplicate shortcuts in JSON; move executable callbacks/action authority into JSON; change starter semantics or command definitions; make Help Center require network/filesystem access; change preview/editor/AMX/CLI/VS Code behavior; or claim browser results as native or formal accessibility certification. Do not expand into unrelated V0.7 backlog.

**decision gates**: Preserve existing topic IDs, search terms, initial-section routing, and offline behavior. Keep shortcuts sourced from the current command registry. Keep starter examples and diagnostic export wired through current app callbacks. Target approximately 80% viewport dimensions within strict viewport bounds; header/search/footer do not scroll with the content and search does not resize the dialog. Record any dependency residual or unavailable acceptance in planning rather than assuming it is closed.

**acceptance**: Meet every item in `planning/sprints/0046-v07-help-center-integrated-acceptance/acceptance.md`.

**verification**:

1. Resolve/record Sprint 044 and Sprint 045 Lead Developer dispositions or explicit sequencing authorization before implementation.
2. Verify all static help text/search data is bundled JSON, is present in the built desktop app, and works offline. Verify stable IDs, search matches, default/initial routing, and unknown-section fallback.
3. Verify keyboard shortcuts still derive from the app command registry and interactive starter/diagnostic actions remain Vue/application-owned.
4. At minimum and larger viewports, verify dialog bounds, fixed header/search/footer geometry, content scrolling, and unchanged dialog bounds across search/filter result counts.
5. Run integrated UI acceptance for Sprint 044 preview behavior, Sprint 045 layout/editor/runtime behavior, and Sprint 046 help behavior; capture exact commands, visual evidence, browser/host/runtime, and limitations.
6. Run focused Playwright checks first, then desktop contracts/tests, typecheck, production web build, and `git diff --check`. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 046 Builder evidence. Do not report unperformed checks as passed.