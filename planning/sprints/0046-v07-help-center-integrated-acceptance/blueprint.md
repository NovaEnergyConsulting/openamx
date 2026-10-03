# Sprint 046 Blueprint: Help Center and Integrated Acceptance

## Approach

1. Resolve the dependency gate before production work. Review Sprint 044 and 045 Builder evidence and record Lead Developer dispositions, or explicitly record authorization to proceed with their stated residuals. Do not infer acceptance from implementation completion.
2. Inventory the Help Center's static data and interaction contract. Capture every current topic ID/title/summary/search term/step, default and routed section IDs, release-note copy, shortcut presentation source, starter callbacks, and diagnostic-export action. Add focused baseline assertions before extraction where practical.
3. Define a small typed JSON shape for static topic/help content and bundle it through the existing Vite desktop build. Keep topic data declarative only; retain filtering, active selection, initial-section routing, shortcut derivation, and all action handlers in Vue/application code.
4. Extract the content without changing stable IDs, search terms, ordering unless explicitly required, or current search matches. Preserve the command registry as the sole authority for shortcut labels and values; do not serialize a second shortcut table into JSON. Confirm built output contains the resource and the Help Center works without network access.
5. Rebuild the dialog layout around a fixed bounded frame: target roughly 80% of app viewport dimensions, constrained by viewport padding/minimum usable size. Keep header, search, and footer outside the body scroll container. Ensure topic navigation and topic/shortcut/release content remain reachable within the scrollable body at the minimum and larger viewports.
6. Extend the production-App Playwright fixture. Verify bundled content and offline availability, topic ID/routing and representative search terms, registry-derived shortcuts, fixed dialog bounds before/after filtering, fixed header/search/footer geometry, and body scroll extent/position at the minimum supported and larger viewport sizes.
7. Run integrated acceptance over Sprint 044 preview freshness/pause/manual behavior, Sprint 045 viewport/scroll/wrapping/indentation/theme behavior, and Sprint 046 help behavior. Use the existing focused suites and record exactly which browser/manual/native observations were performed. Do not call browser evidence native acceptance.
8. Capture visual evidence at minimum and larger viewports; identify host/browser/runtime and hashes where practical. Record exact commands/results, warnings, artifacts, and residuals in Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
9. Run focused Playwright checks first, then desktop contracts/tests, typecheck, production web build, and `git diff --check`. Keep all changes within the approved V0.7 observation scope.

## Files to Update

- `desktop-app/src/mainview/components/HelpCenterDialog.vue` for data loading and retained Vue interactions
- A bundled static JSON resource under the desktop mainview/resource tree, using the repository's existing Vite JSON import convention
- `desktop-app/src/mainview/app.css` for viewport-bounded dialog dimensions and fixed-chrome/scroll-body layout
- `desktop-app/src/mainview/App.vue` only if needed to preserve existing command-registry, initial-section, or interactive callback ownership
- Focused UI tests under `desktop-app/tests/ui/` and existing Playwright configuration/fixture as needed
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 046 Builder evidence and visual artifacts

## Notes

Keep content/data separate from behavior. The Help Center's shortcut list comes from the existing app command registry, starter actions use the existing bundled examples, and diagnostic export remains an app-owned callback. Search must only change filtered content, never modal sizing; the header, search, and footer retain stable positions while the body scrolls.