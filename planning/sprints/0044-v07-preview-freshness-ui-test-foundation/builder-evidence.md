# Sprint 044 Builder Evidence

## Disposition

**Builder verification complete; Lead Developer disposition pending.** The reported autosave/preview freshness defect was confirmed and corrected after the required delayed-result regression failed against the pre-fix service. The correction preserves active-document, project, settings/input, job, cancellation, dirty-overlay, and last-good behavior. No AMX, CLI, or VS Code behavior changed.

Native Electrobun window/IPC behavior was not exercised. The direct service regression and browser workbench test validate separate production boundaries; neither is native-host certification.

## Reproduction and Trace

Host: Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`; Bun `1.4.2`; Node `v24.14.1`; Vue `3.5.41`; Vite `6.4.3`.

The deterministic reproduction used the following sequence:

1. Create a project with `report.amx` on disk containing `let value: Number = 1`.
2. Open it, enable autosave at `100 ms`, update the active buffer to `let value: Number = 42`, and start a preview using the current workbench identity.
3. Hold the worker-completion message. The test worker derives its HTML from the exact `entryText` request, so the held result contains `42`.
4. Wait until the conflict-checked autosave has replaced the on-disk source with the edited buffer, without changing document revision or active request identity.
5. Release the result and poll the same job.

Before the fix, the job became `superseded`. The job retained its captured active-source disk hash from before autosave, while disk contained the saved `42` buffer. The canonical document identity, project generation, document revision (`1`), input/settings revision (`0`), and job identity did not change. This isolates the actual rejection to the unconditional captured disk-hash comparison in `jobIsCurrent()`.

The UI uses the existing `400 ms` debounce. On the reported failure path, the current result was rejected after computation and the existing last-good preview remained displayed as stale; the native integrated UI was not available to observe the original report directly. The deterministic service regression reproduced the rejection at the controlling result-acceptance boundary before a production change.

## Correction and Guard Coverage

For a source represented by an open, clean AMX document, `jobIsCurrent()` now compares disk bytes against that document's current trusted `diskHash`; it still requires the captured document revision to match. `diskHash` advances only after the existing conflict-checked atomic save succeeds. Dirty AMX source overlays, closed AMX sources, and non-AMX mapped inputs continue using their job-captured disk hashes. An external disk change therefore remains rejected, and an unsaved AMX overlay cannot be accepted under a different tab revision.

The corrected delayed-worker regression passes and asserts the published HTML contains `42`. The existing direct RPC contract also passes cases that reject superseded document revisions, imported-source revisions, input/settings revisions, project generations, active-tab changes, and cancelled work. Mapped CSV/JSON input freshness remains bound to captured input hash/revision. Last-good HTML remains owned by the UI and invalid output does not replace it.

The existing desktop UI code retains the `400 ms` timer and pause/manual controls; no debounce or product behavior was changed.

## Browser/UI Feasibility

The Sprint 042 Vite fixture successfully mounted production `App.vue` and its CodeMirror editor, runtime state, contextual pane, and sandboxed iframe in the integrated browser. The original mock returned constant synchronous preview output and did not model autosave or delayed source-dependent output, so it was insufficient for maintained regression coverage. It was extended with a controlled autosave timer, source-derived delayed preview result, failure injection, and test-only timing snapshot.

Added `@playwright/test` `1.63.0` to `desktop-app` devDependencies only. The pinned Playwright Chromium was Google Chrome for Testing `153.0.8010.12` (Chromium build `1243`). Installation warned that this Omarchy OS is not officially supported by Playwright and used the Ubuntu 24.04 x64 fallback browser build. The earlier interactive harness compatibility probe used VS Code integrated Chromium `150.0.7871.250` in Electron `43.6.0` (VS Code `1.139.1`); this is a separate browser runtime, not the test runner's browser.

The repeatable UI test covers:

- Initial current iframe output and `success` state.
- Editing while paused, autosave completion, and no automatic preview completion after an observation window beyond the `400 ms` debounce.
- Manual refresh while paused, with the iframe updated but paused status retained.
- Resume followed by automatic current output; the test asserts preview start between `380` and `600 ms` after the edit and verifies autosave preceded result publication.
- Invalid preview result retains the prior iframe output and displays `stale`.

A separate interactive browser measurement observed automatic preview start `412.9 ms` after edit, one preview run, autosave completed before result publication, and rendered iframe output `27` with `success` state. This is harness/browser evidence, not native evidence.

## Commands and Results

- `env -C /home/cgamez/Programming/openamx/desktop-app bun run test`: passed. The full direct desktop RPC contract completed with `Final active resources: []`; includes the delayed current-preview-after-autosave regression and obsolete-job/cancellation assertions.
- `env -C /home/cgamez/Programming/openamx/desktop-app bun run test:ui`: **1 passed, 0 failed** in about 4 seconds. Playwright printed the measured debounce and autosave-before-publication observation.
- `env -C /home/cgamez/Programming/openamx bun test`: **245 passed, 0 failed, 1,104 expectations across 25 files**. The first root run exposed Bun auto-discovering Playwright's `*.spec.ts` file and reporting `Playwright Test did not expect test() to be called here`; the UI spec now uses the `.pw.ts` suffix and Playwright config explicitly matches `**/*.pw.ts`, so root Bun discovery and the dedicated Playwright runner are separated.
- `env -C /home/cgamez/Programming/openamx/desktop-app bun install --frozen-lockfile`: passed; 68 installs across 100 packages, no changes.
- `env -C /home/cgamez/Programming/openamx/desktop-app bun run typecheck`: passed (`hutch electrobun prepare && vue-tsc --noEmit`).
- `env -C /home/cgamez/Programming/openamx/desktop-app bun run build:web`: passed; Vite `6.4.3`, 3,271 modules, app JS `2,688.15 kB` (`835.84 kB gzip`), CSS `639.21 kB` (`108.91 kB gzip`), worker bundle `4.13 MB`. Vite emitted its existing warning for chunks larger than `500 kB`.
- `env -C /home/cgamez/Programming/openamx/desktop-app bunx playwright --version`: `Version 1.63.0`.
- `env -C /home/cgamez/Programming/openamx/desktop-app bunx playwright install chromium`: passed; downloaded Chromium `153.0.8010.12`, with the unsupported-OS Ubuntu 24.04 fallback warning described above.
- `git diff --check`: passed after implementation, planning, and evidence edits. Playwright's generated `test-results/` and `playwright-report/` directories are ignored desktop test artifacts.

No root build was run; the root test suite was run as recorded above. No screenshot artifact was persisted. No Hutch package/run, direct native Electrobun check, target-platform certification, or accessibility certification is claimed.

## Artifacts and Remaining Boundary

The regression is in `desktop-app/tests/rpc-contract-check.ts`; production comparison is in `desktop-app/src/bun/desktopService.ts`. The repeatable UI spec is `desktop-app/tests/ui/preview-freshness.pw.ts`, using `desktop-app/playwright.config.ts` and the Vite fixture under `desktop-app/spikes/sprint042-workflow-harness/`.

Lead Developer/native acceptance remains the owner for any required observation of the corrected sequence through the native Electrobun host. Browser evidence does not substitute for that observation or establish native platform, accessibility, or release certification.
