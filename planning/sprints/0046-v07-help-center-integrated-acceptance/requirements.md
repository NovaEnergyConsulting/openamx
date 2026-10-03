# Sprint 046 Requirements: Help Center and Integrated Acceptance

## Goal

Make the Help Center content maintainable by moving its static topics, prose, and search data into a bundled JSON resource while preserving Vue-owned interaction and command-registry shortcut metadata. Stabilize the dialog to the available viewport, keep its chrome fixed while content scrolls, and complete evidence-based integrated acceptance of V0.7.

## Dependencies and Entry Gate

- Sprint 044 established and verified the delayed-preview regression and Playwright/Vite UI-test approach. Its Builder verification is complete; Lead Developer disposition is pending.
- Sprint 045 Builder implementation and verification are complete, with browser evidence recorded. Lead Developer disposition is pending; native window resizing, actual app restart, and formal accessibility were not verified.
- This Sprint 046 preparation does not change either prior disposition. Before Builder implementation begins, record the Lead Developer disposition for Sprints 044 and 045, or record explicit authorization to proceed with the dependency exceptions. Do not treat Builder completion as acceptance.

## Inputs

- `planning/plan-openamxV07MasterSprintPlan.md`, Sprint 046 and its V0.7 boundaries
- `planning/ideas/desktop-app-features.md`, Help Center Dialog observation
- Sprint 044/045 requirements, acceptance, Builder evidence, and browser-test approach
- `desktop-app/src/mainview/components/HelpCenterDialog.vue`
- `desktop-app/src/mainview/App.vue` command registry, Help Center routing, starter examples, and interactive action handlers
- `desktop-app/src/mainview/app.css` Help Center layout and responsive rules
- `desktop-app/tests/ui/` and `desktop-app/playwright.config.ts`

## In Scope

- Move static Help Center content into a bundled JSON resource: topic IDs, titles, summaries, search terms, steps/body copy, and static release-note/help copy currently owned by the component.
- Keep Vue responsible for rendering, search/filtering, topic navigation, initial-section routing, and interactive actions such as creating a project from a starter or downloading a diagnostic summary.
- Preserve all existing stable topic IDs, search terms and effective searchable content, default topic, and supported initial-section routing. Keep the resource available offline in the built desktop app.
- Keep keyboard shortcut metadata sourced from the existing command registry passed to the Help Center. Do not duplicate labels or shortcut values in JSON.
- Size the Help Center to approximately 80% of the current app window width and height, bounded by available viewport dimensions and usable at the minimum supported viewport.
- Keep the header, search field, and footer fixed within the dialog. Put Help Center body/topic content in the scrollable region so filtering/search does not resize the dialog; long content remains reachable by scrolling.
- Add focused Playwright UI coverage for bundled JSON loading, stable topic/search/initial-section behavior, shortcut source ownership, dialog viewport bounds, filtering without dialog resize, and body scrolling at minimum and larger viewports.
- Run integrated manual acceptance of the Sprint 044 preview behavior, Sprint 045 workbench/editor/runtime behavior, and Sprint 046 Help Center behavior. Record exact commands, outcomes, visual evidence, and residuals in planning records and Sprint 046 evidence.

## Out of Scope

- Reworking Help Center information architecture, authoring a new documentation corpus, or changing product/help claims beyond the scope needed to move current static content and preserve its behavior.
- Changes to command definitions/shortcut policy, starter-example content or execution semantics, diagnostics privacy, preview freshness, viewport/editor behavior, AMX/CLI semantics, or VS Code behavior.
- Unrelated V0.7 carry-forward backlog, native-platform certification, formal accessibility certification, release engineering, and unrelated app redesign.

## Constraints

- Treat Sprints 044 and 045 as dependencies. Builder verification is evidence, not a substitute for Lead Developer disposition. Resolve the entry gate above before implementation or record explicit authorization and accepted residuals.
- JSON is a bundled static data resource, not fetched from the network or filesystem at runtime. Preserve offline behavior and use the project's normal structured JSON import/resource pattern.
- Stable topic IDs, search terms, initial-section routing, and existing useful search matches must not regress during extraction.
- Shortcut labels/values remain sourced from the existing command registry. Starter templates and diagnostic export actions remain wired through their existing application callbacks; JSON must not become an executable/action authority.
- The dialog must remain within the current viewport. Header/search/footer stay fixed while the body scrolls; changing result count through search must not change the dialog's measured bounds.
- Use the Sprint 044 Playwright/Vite fixture and test-only browser tooling. Browser/UI evidence supplements but does not imply native Electrobun, cross-platform, or formal accessibility acceptance.
- Keep scope to the desktop feature observations and acceptance evidence in the V0.7 master plan.