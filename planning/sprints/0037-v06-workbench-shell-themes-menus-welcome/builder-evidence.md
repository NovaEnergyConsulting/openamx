# Sprint 037 Builder Evidence

## Disposition

**COMPLETE WITH RECORDED EXCEPTIONS.** The desktop webview now presents a componentized V0.6 shell with a welcome route, typed command registry/palette/shortcut path, project explorer, tabs, AMX/editor and non-AMX file-kind shells, direct bounded dividers, focus modes, local theme/drawer preferences, and a dockable runtime drawer. Sprint 036 typed RPC, current-document identity, job polling/cancellation, source overlay, and main-process authority remain unchanged.

## Delivered Shell

- Added focused `CommandPalette`, `ProjectExplorer`, `WorkbenchTabs`, and `WelcomeView` components plus typed `ShellCommand`, focus, theme, and drawer models. `App.vue` retains only the existing RPC/job orchestration and composes the visible shell.
- Replaced the crowded workflow strip, pane selectors, plus/minus resizing, and visible three-format action buttons. Export remains reachable only as registered commands and retains the existing typed main-process path.
- Added pointer-draggable explorer/context dividers with the existing bounded RPC persistence, source/preview focus restoration, bottom/right runtime drawer docking, and machine-local system/light/dark preference storage.
- AMX tabs render CodeMirror plus sandboxed preview; CSV, JSON, settings, external-data, and generated-output document kinds render an honest identity-preserving shell rather than editable feature placeholders scheduled for later sprints.
- Welcome presents validated recents, Open Project, a disabled Create Project control with its Sprint 038 reason, Help entry, and truthful recovery/release-note indicators. It does not implement lifecycle, creation, recovery, or onboarding behavior.

## Verification

Host: Omarchy Linux x86_64, Bun 1.4.2, Vue 3.5.41, Vite 6.4.3.

- `cd desktop-app && bunx vue-tsc --noEmit`: passed.
- `cd desktop-app && bunx vite build`: passed; 47 modules; JS 712.73 kB / 247.04 kB gzip; CSS 37.96 kB / 8.00 kB gzip. Existing Vite >500 kB chunk warning remains.
- `cd desktop-app && bun run test`: passed. Typed RPC/webview boundary, active identity, stale/cancel/no-write job paths, session/tab guards, and final active-resource cleanup all remain green.
- Browser-only Vite inspection could not mount the production `main.ts` directly because it requires the Electrobun `Electroview` bridge. The page had no DOM and returned expected bridge-related 404s. No browser/shim screenshot, native-host menu, native dialog, native window, or native focus result is claimed from this run.

## Exceptions and Sprint 038 Entry

- Native File/Edit/View/Help menu installation and native-host verification remain **UNAVAILABLE** pending direct SDK-enabled host evidence from the Lead Developer. Browser evidence cannot close this gate.
- A bridge-backed component/browser fixture is still needed for deterministic populated/empty screenshots at 1024x720 and larger, reduced-motion and focus-restoration interaction checks. Owner: Sprint 043 acceptance harness / Lead Developer host setup.
- Create Project, project file lifecycle, recovery behavior, trash, and autosave remain Sprint 038. Sprint 038 may proceed because the shell keeps those routes visibly unavailable and preserves the Sprint 036 state/authority boundary.