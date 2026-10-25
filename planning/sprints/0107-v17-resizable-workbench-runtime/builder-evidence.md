# Sprint 107 Builder Evidence: V0.17 Resizable Workbench and Runtime Panel

## Status

Sprint 107 implementation and focused verification are complete under the
approved source/test/output plan.

**S102 resizer gate:** OPEN at preparation time.
**Sprint 107 technical gate:** GO for installed Reka UI 2.10.5 with local wrappers.
**Builder recommendation:** IMPLEMENTED; ACCEPTED/CLOSED by the user on 2026-10-25.
**Separate acceptance disposition:** ACCEPTED/CLOSED by the user on 2026-10-25.

## Preconditions and Baseline

- Sprint 106 implementation and focused tests are complete; its evidence
  still says separate product-owner acceptance is PENDING. Focused palette,
  Trash, Help, and direct desktop typecheck passed. S106-TRASH-04 (failed
  Empty Trash/list refresh) was not exercised because the authorized harness
  lacked deterministic failure controls. Cmd+Shift+P was not separately run
  on macOS; no native certification is claimed.
- The live layout now uses local wrappers over installed Reka splitter
  exports, mounted by `App.vue`. Explorer bounds remain 160-400 px, context
  remains 25-65%, and editor/context minimum tracks remain 260 px.
- Per-project sizes persist only through the existing `setPanelSizes`
  service/RPC. No Reka `autoSaveId` or global local-storage size authority is
  enabled. Hidden focus/responsive layouts do not save dimensions.
- Bottom/Right controls, `DrawerDock`, its preference/local-storage wiring,
  and obsolete right-docking layout/CSS have been removed. Runtime ownership,
  actions, content, theme styles, and scrolling remain in `RuntimePanel.vue`.
- The historical S102 technical-gate document was not modified. Sprint 107
  closes its implementation gap with installed API, real service A/B, and
  actual App.vue evidence.
- S105 is ACCEPTED/CLOSED against file-only explorer scope; folder mutation
  work was deferred and is unrelated to Sprint 107.

## Approved Execution Plan

Approved plan executed:

- Source: `desktop-app/src/mainview/App.vue`,
  `desktop-app/src/mainview/app.css`, `desktop-app/src/mainview/shell.ts`,
  `desktop-app/src/mainview/components/RuntimePanel.vue`,
  `desktop-app/src/mainview/components/PreferencesDialog.vue`,
  `desktop-app/src/mainview/components/ui/resizable/ResizablePanelGroup.vue`,
  `desktop-app/src/mainview/components/ui/resizable/ResizablePanel.vue`, and
  `desktop-app/src/mainview/components/ui/resizable/ResizableHandle.vue`.
- Tests: `desktop-app/tests/rpc-contract-check.ts`,
  `tests/ui/resizable-runtime.pw.ts`, `tests/ui/workbench-comfort.pw.ts`, and
  `tests/ui/shell-components.pw.ts`.
- Evidence: this file, `technical-gate.md`, and
  `acceptance-test-matrix.md`.
- Browser output root:
  `planning/sprints/0107-v17-resizable-workbench-runtime/artifacts/playwright/`.
- No build, release, publication, version change, certification, or Sprint
  108 work was run.

## Verification Log

| Check | Exact command/surface | Result |
| --- | --- | --- |
| Starting worktree/path inventory | `git status --short` | PASS; clean before implementation. |
| Installed splitter exports | `Push-Location desktop-app; @' import * as Reka from "reka-ui"; console.log(Object.keys(Reka).filter(key => /splitter|panel/i.test(key)).sort()); '@ | bun run -; Pop-Location` | PASS; `SplitterGroup`, `SplitterPanel`, `SplitterResizeHandle`, and `injectSplitterGroupContext` exported. |
| Installed splitter types | `Push-Location desktop-app; bunx vue-tsc --noEmit; Pop-Location` | PASS; wrappers and App.vue compile against installed declarations. |
| Actual service A/B persistence | `Push-Location desktop-app; bun run tests/rpc-contract-check.ts; Pop-Location` | PASS; 14 new assertions cover two roots, saved values after service restart, A/B restore independence, and invalid-bound rejection. |
| Actual App.vue integration | Included in focused Playwright command below; harness imports production `src/mainview/App.vue`. | PASS; recent-project restore, active document, focus modes, splitter panels, context, and runtime row exercised. Harness RPC is mocked; service persistence is separately exercised above. |
| Focused UI acceptance | `Push-Location desktop-app; bunx playwright test tests/ui/resizable-runtime.pw.ts tests/ui/shell-components.pw.ts tests/ui/workbench-comfort.pw.ts --output ../planning/sprints/0107-v17-resizable-workbench-runtime/artifacts/playwright/sprint107-focused; Pop-Location` | PASS; 6/6 tests. Chromium 156.0.8078.4, win32/x64; 1024x720, 1440x900, 820x720. Screenshots are under `sprint107-focused/workbench-comfort.pw.ts-lo-083a4-lorer-and-runtime-scrolling/`. |
| Desktop unit/RPC suite | `Push-Location desktop-app; bun run test; Pop-Location` | PASS; 9 Bun tests, 109 `expect()` calls, RPC/workflow contract script complete, 14 new panel-size assertions. |
| Direct desktop typecheck | `Push-Location desktop-app; bunx vue-tsc --noEmit; Pop-Location` | PASS; no diagnostics. |
| Source cleanup | Search `desktop-app/src/**` and `desktop-app/tests/**` for `DrawerDock`, `drawer-dock`, `drawerDock`, `drawer-right`, and docking labels. | PASS; no active matches. Legacy user local-storage values were not deleted. |
| Whitespace/path check | `git diff --check`; `git status --short` | PASS; no whitespace errors; only approved source, tests, Sprint 107 evidence, and Sprint 107 Playwright artifacts changed. |

### Exact Commands

Installed API probe (PowerShell):

```powershell
Push-Location desktop-app; @'
import * as Reka from "reka-ui";
console.log(Object.keys(Reka).filter(key => /splitter|panel/i.test(key)).sort());
'@ | bun run -; Pop-Location
```

Windows-compatible Vite harness:

```powershell
Push-Location desktop-app; bunx vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort; Pop-Location
```

Final focused UI run:

```powershell
Push-Location desktop-app; bunx playwright test tests/ui/resizable-runtime.pw.ts tests/ui/shell-components.pw.ts tests/ui/workbench-comfort.pw.ts --output ../planning/sprints/0107-v17-resizable-workbench-runtime/artifacts/playwright/sprint107-focused; Pop-Location
```

### Failures and Retries

- Initial Playwright webServer launch failed because the existing config uses
  the Unix `./node_modules/.bin/vite` shim on Windows. Started the same Vite
  harness with `bunx vite` on `127.0.0.1:4183`; the final focused suite passed.
- The first App.vue browser probe found explorer content expanding beyond its
  track. Added explicit panel-height containment; the rerun passed 3/3.
- The first combined UI run still expected the removed Right control. Replaced
  that assertion with bottom-row bounds; final suite passed 6/6.
- Early splitter test iterations corrected assertions to match installed
  Reka behavior: mixed pixel/percentage layout values, percentage separator
  ARIA values, and pointer direction from the minimum bound. The initial
  zero-width separators were later replaced with real 8 px hit areas. No
  sizing constraint was relaxed; final focused tests passed.
- A final keyboard smoke-check found custom numeric ARIA values could conflict
  with Reka's dynamic percentage range after resizing. Removed those overrides,
  retained user-readable pixel/percentage value text, and added Home/End range
  assertions; final focused UI suite passed 6/6.
- Runtime reproduction of the reported warnings showed the 220 px explorer
  was converted to a percentage while the editor still had a zero-measurement
  fallback; live `onLayout` values also fed back into default sizes and
  constraints. The group now mounts after measurement, uses percentages for
  all three panels, and keeps requested project sizes separate from live
  sizes. `elementFromPoint` also showed the second zero-width separator landed
  on the Preview iframe. Both handles now occupy real 8 px tracks, excluded
  from pixel/percentage conversion. A 1440/1920/1280/1024 stress sequence
  produced 0 normalization warnings and 8/8 successful pointer drags.
- The first Preferences save test attempted to edit the delay after disabling
  Autosave. Reordered the test to save delay first; final runtime test passed.
- An initial PowerShell inline `bun -e` probe lost quotes. Retried with a
  PowerShell here-string piped to `bun run -`; installed exports were verified.

## Scope and Residuals

- Browser integration uses the approved Vite workflow harness, not the native
  Electrobun host. Native host lifecycle/platform behavior remains unverified.
- No standalone production build was run; the direct desktop typecheck and
  focused browser/runtime/RPC checks passed.
- The App.vue UI harness has a mock RPC; its pointer/keyboard path is covered
  there, while real per-project persistence is covered directly against
  `createDesktopService.request`. No native end-to-end bridge is claimed.
- Preserve all runtime content/actions and leave legacy local-storage values
  inert rather than deleting user data.
- Sprint 107 was ACCEPTED/CLOSED by the user on 2026-10-25. No release,
  publication, package/version change, platform certification, or Sprint 108
  execution is authorized or claimed.