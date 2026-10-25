# Sprint 108 Builder Evidence: V0.17 Integrated Acceptance and Closeout

## Status

Sprint 108 verification was separately authorized by the product owner on
2026-10-25 for the exact source commit, detached worktree, commands, artifact
roots, and evidence paths recorded in `verification-plan.md`. Supplemental
corrective authorization allowed a single UI test file to use the current
explorer menu controls. Final focused UI and root test gates pass; the
isolated desktop web build remains blocked in Hutch preparation, which also
prevents full Playwright collection.

**Builder recommendation:** BLOCKED / OPEN pending a supported, repeatable
isolated `build:web` completion and full desktop UI suite. Focused UI suites,
desktop package/RPC tests, direct typecheck, and root tests pass after their
approved retries. The Builder does not recommend acceptance on the available
verification evidence; the product owner separately accepted V0.17 with the
build/full-suite gap recorded as residuals below.
**Separate V0.17 product-owner disposition:** ACCEPTED/CLOSED WITH RECORDED
RESIDUALS on 2026-10-25, within the amended file-only V0.17 scope. The
disposition accepts the documented Hutch build/full-suite and native/platform
gaps as residuals; it does not turn their raw statuses into PASS.

## Preconditions and Baseline

- Sprint 102 UX contract is ACCEPTED/CLOSED. Sprint 107 closed its resizer
  implementation gap with a technical GO for installed Reka UI 2.10.5 and
  local wrappers; the historical S102 technical-gate document remains
  unchanged.
- Sprint 103 is ACCEPTED/CLOSED with recorded verification residuals: Hutch
  desktop typecheck did not complete; direct `vue-tsc` passed; the combined
  test command had two diagram time-text assertion failures and one native
  WebView skip.
- Sprint 104 is ACCEPTED/CLOSED with recorded wrapper/harness/reload residuals.
- Sprint 105 is ACCEPTED/CLOSED only against the amended file-only V0.17
  scope. Folder duplicate/move/tree drag/trash/restore are deferred from
  V0.17; no future target version is committed.
- Sprint 106 implementation/focused verification completed. The product owner
  separately ACCEPTED/CLOSED Sprint 106 with recorded residuals on
  2026-10-25. S106-TRASH-04 and macOS Cmd+Shift+P were not exercised.
- Sprint 107 is ACCEPTED/CLOSED. Installed Reka API, real service A/B
  persistence, bounds, keyboard/focus, responsive workbench, and bottom-only
  runtime checks passed. No standalone production build or native Electrobun
  host test was run.
- Sprint 108 execution authorization is recorded in `verification-plan.md`.
  No release, publication, package/version change, certification, or V0.18
  work is authorized.

## Approved Execution Plan

Approved source snapshot: clean `feat/create-V0.17` at
`8c55827d1726190ff165c89388ee26a2ee6b811b`. Validation worktree:
`C:\Users\gamez\AppData\Local\Temp\openamx-s108-validation-8c55827`, detached
at the same commit. Host: Windows 11 Home 10.0.26300 x64, PowerShell
5.1.26100.9711, Bun 1.4.4, Node 24.13.1, Playwright 1.64.1, Vite 6.4.3,
Hutch 0.28.1, Chromium 156.0.8078.4.
Frozen root and desktop dependency installs completed in the isolated
worktree (80 and 582 packages). Full commands and environment inventory are
under `outputs/logs/`; all Playwright artifacts are under `outputs/playwright/`.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory and output hashes | PASS for approved baseline. Source tree was clean before S106/S108 record edits. Detached worktree is at the authorized commit. Baseline OS/tool versions, `src/renderer/diagramBrowserRuntime.ts` SHA-256, and absent `desktop-app/dist`/`build` are logged in `outputs/logs/environment-and-worktree.log`. Initial Git checkout failed on long historical artifact paths; the same approved destination succeeded with one-command `git -c core.longpaths=true`. Status/diff with the option was clean. No historical artifacts changed. |
| Sprint 102-107 acceptance/disposition reconciliation | PASS. S102 contract ACCEPTED/CLOSED; S103-105/107 dispositions retained; S105 only amended file scope; folder duplicate/move/tree drag/trash/restore deferred with no target version; S106 separately ACCEPTED/CLOSED by owner on 2026-10-25 with S106-TRASH-04 and macOS shortcut residuals; S107 Reka technical GO supported by actual service A/B and App.vue evidence. Historical S102 technical-gate document unchanged. |
| Direct desktop typecheck | PASS on approved retry. Initial attempts before Hutch SDK preparation exited 2 with unresolved `electrobun/main` and `electrobun/view`; after the isolated `build:web` attempts generated `.hutch/devkit` API files, `bunx vue-tsc --noEmit` passed with exit 0 and no diagnostics. Logs: `outputs/logs/typecheck.log`, `outputs/logs/typecheck-retry-02.log`. |
| Desktop package/RPC tests | PASS. `bun run test` from isolated `desktop-app`: 9 tests passed, 0 failed, 109 `expect()` calls; RPC/workflow contract scripts completed. Actual `setPanelSizes` service A/B persistence passed with 14 assertions, including A/B independence after service recreation and invalid-bound rejection. `outputs/logs/desktop-test.log`. |
| Isolated desktop web build | BLOCKED/UNAVAILABLE after two attempts. `bun run build:web` from isolated `desktop-app` stalled at `hutch electrobun prepare`; the supplemental retry timed out after 180 seconds with no log progress or `desktop-app/dist`, then no Hutch/Bun process remained. Logs: `outputs/logs/build-web.log`, `outputs/logs/build-web-retry-02.log`. No shared generated outputs changed. |
| Configured Playwright webServer attempt | FAIL as expected on Windows. `bunx playwright test tests/ui/initial-active-document.pw.ts --output <approved configured-shim-probe path>` from isolated `desktop-app` failed because `.` is not recognized by the configured Unix Vite shim; no test ran. `outputs/logs/playwright-configured-shim.log`. Playwright configuration was not edited. |
| Direct Vite harness | PASS. `bunx vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort` from isolated `desktop-app`; Vite 6.4.3 listened on `127.0.0.1:4183`. Startup logs: `outputs/logs/vite-direct-server.log` and the visible restart output in the corrective run. Server stopped after focused suites. Browser harness only; not native Electrobun evidence. |
| Focused activation/preview UI | PASS, final 10/10 using the approved three-file Playwright command. Initial attempt passed 8/10: mapped activation and create/duplicate/move cases failed; isolated mapped rerun passed 1/1, and the test was corrected to use current Project actions > New > AMX file and Rename / Move active file menu controls. Corrected full group passed 10/10, covering project open/recent restore/recovery, pause/non-AMX/no implicit Run, identity/freshness/cancellation, preview navigation/freshness, and initialization after create/duplicate/move. Logs/artifacts: `outputs/logs/playwright-activation.log`, `outputs/logs/corrective-mapped-retry-02.log`, `outputs/logs/corrective-create-active-document.log`, `outputs/logs/corrective-create-active-document-retry-02.log`, `outputs/logs/playwright-activation-retry-02.log`; outputs under corresponding `outputs/playwright/activation*` and `corrective-*` directories. |
| Focused explorer UI | PASS, final 6/6. Initial attempt passed 5/6 with the file-drop test losing the harness snapshot; the isolated file-drop diagnostic passed 1/1 and the complete retry passed 6/6. Search/count/menu, file create/duplicate/move/drop, native open/reveal, file safeguards, and Trash workflows passed. Logs/artifacts: `outputs/logs/playwright-explorer.log`, `outputs/logs/corrective-file-drop-retry-02.log`, `outputs/logs/playwright-explorer-retry-02.log`; outputs under `outputs/playwright/explorer*` and `corrective-file-drop*`. |
| Command palette/Help UI | PASS, 6/6. `command-palette.pw.ts` and `help-center.pw.ts` passed selection/navigation, dynamic availability, disabled/no-result, Help routing, focus restoration, shortcut behavior, and layout checks. Log: `outputs/logs/playwright-commands.log`; artifacts: `outputs/playwright/commands/`. |
| S106 Trash follow-up UI | PASS in the S108 explorer group. Failed restore alert and retained list stayed visible; another item restored, then the failed item retry succeeded in the same dialog. The separate S106-TRASH-04 failed list/empty operation remains untested, and macOS Cmd+Shift+P remains unavailable on this host. |
| Resizer/runtime/shell focused UI | PASS, 6/6. `resizable-runtime.pw.ts`, `shell-components.pw.ts`, and `workbench-comfort.pw.ts` passed bounds, keyboard/focus, recent project restore, bottom-only runtime, independent scrolling, and theme checks. Chromium 156.0.8078.4 on Windows x64 at 1024x720, 1440x900, and 820x720. Log `outputs/logs/playwright-layout-runtime.log`; artifacts `outputs/playwright/layout-runtime/`. Actual service A/B persistence separately passed 14 assertions in `bun run test`. |
| Full applicable desktop UI suite | BLOCKED/UNAVAILABLE. `bunx playwright test --output <approved full-desktop path>` failed test collection because `theme.pw.ts` requires `desktop-app/dist/assets`, which the Hutch-stalled isolated web build did not produce. No full-suite tests ran. The supplemental retry was conditional on a successful desktop build and was therefore not run. Logs: `outputs/logs/playwright-full-desktop.log`; approved full-suite result directory preserved. |
| Root repository `bun test` | PASS on retry. Initial `bun test` from validation root failed 1/604 because `dist/cli.js` was absent. Separately approved `bun run build` succeeded inside validation worktree, generated `dist/cli.js`, and retry passed 604/604 tests across 46 files. Logs: `outputs/logs/root-bun-test.log`, `outputs/logs/root-build.log`, `outputs/logs/root-bun-test-retry-02.log`. No VS Code suite or release gate was run. |
| Native Electrobun/package/other-OS route | BLOCKED/UNAVAILABLE. No approved supported direct route was available. No native, package, cross-platform, or certification claim is made. |
| Final `git diff --check` and preservation/path inventory | PASS. `git -c core.longpaths=true diff --check` exited 0 in both source and validation worktrees. Source contains only the separately authorized S104 UI test selector correction, S106 disposition, S108 records, and approved S108 outputs. Validation worktree contains that test correction, two root-test-generated `.keep` markers, and isolated generated `dist/cli.js`; no shared outputs were touched. S102 historical gate blob matches HEAD; no other S102-S107 tracked paths changed except the authorized S106 disposition. Shared `desktop-app/test-results/` is untouched; generated diagram runtime SHA-256 is unchanged; isolated `desktop-app/dist` remains absent; port 4183 is closed. Output file sizes and SHA-256 are in `outputs/logs/final-audit.log`. |

## Residual Register

Use `integrated-evidence-matrix.md` as the authoritative row-level register.
The initial S104 mapped-data and S105 file-drop failures passed in isolated
reruns; the S104 create/duplicate/move test was updated under separate
authorization to use the accepted menus and its corrected focused group passed
10/10. No product source defect remains evidenced by those first failures.
Residual owners: desktop build/tooling owner for the repeatable Hutch
`build:web` stall and missing `desktop-app/dist` needed by the full UI suite;
root build owner for the initial missing `dist/cli.js` (resolved by isolated
root build); platform/product owner for native Electrobun and non-Windows
routes. Carry forward S103 diagram/time-text and native WebView residuals,
S104 wrapper/reload residuals, S105 deferred folder operations, S106
S106-TRASH-04/macOS shortcut residuals, and S107 native-host residual. Raw
first-run failures remain preserved even where retries pass.

## Scope and Disposition

- Initial focused verification stopped at the S105 file-drop failure as
  required. Separate corrective authorization allowed diagnosis and a
  test-only S104 selector correction in
  `desktop-app/tests/ui/initial-active-document.pw.ts`. No product code,
  package, or test configuration was changed. Isolated reruns and final
  focused suites passed.
- The S105 folder-operation deferral remains explicit and is not implemented
  or marked PASS by S108.
- Sprint 106 is separately ACCEPTED/CLOSED with residuals, as recorded in its
  own evidence. Sprint 108 remains BLOCKED/OPEN because `build:web` and the
  full desktop UI suite could not complete; this remains the Builder's
  evidence-based recommendation. The product owner separately
  ACCEPTED/CLOSED V0.17 WITH RECORDED RESIDUALS on 2026-10-25 within the
  amended file-only scope. This does not certify the native host or other
  platforms and authorizes no release, publication, package/version change,
  installer distribution, platform certification, or V0.18 execution.