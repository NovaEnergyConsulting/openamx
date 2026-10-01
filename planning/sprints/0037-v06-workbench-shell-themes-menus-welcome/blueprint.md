# Sprint 037 Blueprint: Workbench Shell, Themes, Menus, and Welcome

## Approach

1. Establish the shell boundary. Inventory the current `App.vue` state, RPC calls, CSS/layout assumptions, and Sprint 036 active-document/job contracts. Define the typed store/composables boundary before moving visual code.
2. Build the component frame. Split the monolith into focused components for explorer, tabs, source/preview content, contextual pane, runtime drawer, status, palette, welcome, and dialogs. Keep existing behavior reachable while the shell migrates; do not duplicate authority or loader logic in Vue.
3. Implement layout and focus modes. Add the explorer/source/context split, bounded draggable dividers, bottom/right drawer docking, source/preview focus modes, adaptive 1024x720 layout, persisted local layout, and focus restoration. Test active tab, selection, scroll, pane sizes, and keyboard focus through transitions.
4. Create the command registry. Define stable command IDs, labels/icons, shortcuts, predicates, disabled reasons, handlers, and context. Use the same registry for palette, shortcuts, contextual actions, and native menu wiring where the host exposes it. Do not claim native menu behavior without a host test.
5. Apply the visual system. Encode system/light/dark tokens for surfaces, source/editor, data shells, preview, drawers, dialogs, focus, status, contrast, and reduced motion. Add non-color status cues and verify dense/error states at both viewport classes.
6. Add welcome and tab shells. Route Open/Create actions to typed service commands without implementing Sprint 038 file lifecycle. Render validated recents, starter examples, guided entry, recovery/release-note/help indicators, and file-kind-specific shells with honest empty/loading/error states.
7. Test the shell. Add deterministic component/browser checks for populated and empty workbenches, pane resizing/docking, palette/shortcut execution, disabled reasons, theme switching, focus restoration, reduced motion, and 1024x720/larger screenshots. Include the existing 36-frame contract matrix where useful, but distinguish production RPC from harness fixtures.
8. Verify and hand off. Run focused desktop tests, Vue typecheck, Vite build, relevant RPC contract checks, root regressions if shared code changed, and `git diff --check`. Record bundle changes, unavailable native evidence, visual exceptions, and Sprint 038 entry conditions.

## Files to Update

- `desktop-app/src/mainview/App.vue`, `app.css`, `CodeEditor.vue`, and focused new components/composables/store files
- `desktop-app/src/shared/rpc.ts` only for narrow shell/command/layout contracts required by the existing authority boundary
- `desktop-app/tests/` and focused component/browser harness/tests
- `desktop-app/README.md` or help references only for verified shell behavior
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 037 builder-evidence record

## Notes

This sprint owns the shell's information architecture and interaction grammar, not every feature inside it. Keep later feature work visible as honest states and typed routes. Native host absence from Sprint 035 is a release/acceptance residual, not permission to replace native behavior with a path field or browser-only claim.
