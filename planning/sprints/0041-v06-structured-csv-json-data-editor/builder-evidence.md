# Sprint 041 Builder Evidence

## Production Builder Outcome (2026-10-02)

**Disposition: COMPLETE WITH RECORDED EXCEPTIONS by explicit user direction (2026-10-02); Sprint 042 may proceed.** The selected `vxe-table@4.22.3` CSV grid and `json-editor-vue@0.19.2` / `vanilla-jsoneditor@3.13.0` JSON editor are integrated in production. Behavior, privacy and compatibility checks pass. The 100,000-row responsiveness target remains unmet and is carried to Sprint 043; this is not a performance pass or a target change. The Lead Developer reports the manual candidate-host checklist passed; exact host OS/session, input method and timings remain unavailable. The Builder's browser was VS Code integrated Chromium, not the Electrobun host.

- Final production Vite build: Vite 6.4.3, 3,263 modules; main JS `2,658.18 kB` / `827.60 kB gzip`, CSS `632.25 kB` / `107.54 kB gzip`, parser worker `29.07 kB`, shared parser `34.64 kB`. Existing `>500 kB` main-chunk warning remains; candidate-specific bundle deltas were not isolated.
- Proof harness build: Vite 6.4.3, 1,366 modules; JS `2,364.63 kB` / `724.48 kB gzip`, CSS `584.76 kB` / `99.46 kB gzip`; existing chunk warning remains. It reports source bytes, viewport, completion and long tasks for selectable CSV/JSON fixtures.
- Host/runtime: Linux x86_64, kernel `7.2.5-3-omarchy`; Bun 1.4.2, Node 24.14.1, Vue 3.5.41, Vite 6.4.3. Browser is the VS Code integrated Chromium recorded as Chrome 150 / Electron 43; this is not a standalone Electrobun app test.
- 100k CSV fixture (`2,469,859` bytes), with VXE `rowConfig.keyField='__editorRowId'` and `useKey=true`: first viewport `681 ms`, complete `686 ms`, 11 rendered body rows, observed setup long task `434 ms`. VXE virtual inner-scroll extent was `4,800,012 px`; scrolling reached rows `99,990` through `100,000` with 11 rendered rows.
- 100k JSON array-of-record fixture (`5,569,842` bytes), with the same stable row-key config: first viewport `631 ms`, complete `639 ms` (parse `287.7 ms`, materialize `36.8 ms`, grid `314.1 ms`), 11 rendered rows, browser-wide heap estimate about `109.8 MB`, and observed setup long task `572 ms`.
- One cell edit in the 100k JSON grid took about `1,205 ms`; the edit trace included an `862 ms` task. CSV/JSON grid cell edit/undo/redo, JSON tree edit/history, row add/remove/reorder, field reorder, explicit sort/search without source mutation, and JSON-array grid rendering were exercised.
- Oversized CSV fallback: `100,001` rows and `2,469,882` ASCII source characters. Raw textarea length matched fixture bytes; the header, first row, final row (`ASSET-100001,Active,30`) and all `100,001` data lines were preserved. Malformed JSON `{"items":[,broken` remained exact and showed pointer `/items/0`. Visible page text contained no Han characters.
- Replacing a pending large CSV with `asset,status,value\nLATEST,Active,9\n` preserved the exact latest buffer and showed only that row. This is a browser buffer-preservation probe, not native cancellation timing. Service tests separately prove owner-edit validation is superseded without a result/write.
- No measurement met the `<100 ms` UI-task target. Parser speed is not viewport or edit latency. By explicit user direction Sprint 041 is complete with this exception; Sprint 043 owns remeasurement/remediation or an explicit performance disposition. Do not hand-roll virtualization.
- Final automated verification: desktop `bunx vue-tsc --noEmit` passed; `bunx vite build` passed with the warning/bundle sizes above; `bun test src/bun/desktopDataEditor.test.ts` passed **7 tests / 43 expectations**; `bun run tests/rpc-contract-check.ts` passed all groups and ended `Final active resources: []`; root `bun run build` passed; focused root input/output tests passed **15 tests / 68 assertions**; full root `bun test` passed **238 tests / 1,039 assertions across 23 files**; proof harness Vite build passed with its >500 kB warning.
- The desktop tests also cover opaque external identities, invalid-text autosave, conflict no-write, path/content-free diagnostics, external close/discard timer cancellation, save-on-close, stale owner-revision supersession, and a 100k-row CSV service save. No example files were changed by this Builder task.

## Candidate Selection Snapshot (Pre-Integration)

**Production integration authorized by Lead Developer direction (2026-10-02); implementation and acceptance remain in progress.** Select `vxe-table@4.22.3` for the production CSV grid and `json-editor-vue@0.19.2` backed by `vanilla-jsoneditor@3.13.0` for the production JSON editor. The Lead Developer reports completing the isolated-host manual checklist successfully and both editors working as expected. The OS/session type, input method, and individual timing details were not recorded and are **unavailable**; do not infer them or claim cross-platform/formal accessibility acceptance. Candidate-specific production bundle deltas, JSON array-of-record scale, and raw-fallback/service proof remain implementation acceptance work. No production editor or mapped schema UI is claimed until implemented and verified.

The Lead Developer also confirms the planned tests were completed and the behavior works as intended. Exact commands, counts, and outputs were not included with this disposition; preserve the recorded Builder test results below as the auditable evidence and do not invent additional test totals.

Do not hand-roll virtualization or lower the gate. Integrate the selected dependencies while completing production bundle, raw-fidelity/JSON-scale, privacy, schema, persistence, and stale-job checks. The Sprint 039 path-redacted refusal for private external mapped files remains until the bounded production route is implemented.

## Candidate Metadata

All direct proof dependencies are exactly pinned in `desktop-app/spikes/sprint041-data-editor-proof/package.json`; the Bun lock contains 100 installed packages and has SHA-256 `bcabeb5ba0783ab4a0fe6ca9b88621b626f180d18604cbaffb86966109af7e38`.

| Package | Pin | Published license | Proof role |
| --- | --- | --- | --- |
| `vxe-table` | `4.22.3` | MIT | Vue 3 editable virtual grid |
| `vxe-pc-ui` | `4.18.21` | MIT | VXE input renderer and UI plugin; depends on `@vxe-ui/core` `^4.4.24` |
| `xe-utils` | `4.1.2` | MIT | VXE companion utility package |
| `json-editor-vue` | `0.19.2` | MIT | Vue 2/3 adapter exposing text/tree/table modes |
| `vanilla-jsoneditor` | `3.13.0` | ISC | JSON editor implementation; includes CodeMirror, Svelte 5 and JSON query/validation dependencies |
| `vue` | `3.5.41` | MIT | Existing desktop framework version |
| `vite` | `6.4.3` | MIT | Existing desktop build version |
| `@vitejs/plugin-vue` | `5.2.4` | MIT | Vue SFC build |

The isolated candidate proof used Bun 1.4.2; the exact candidates are now also pinned in the desktop production package. This records direct package metadata and lockfile evidence, not an independent legal audit of every transitive package.

## Environment and Build

- Host: Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`; Intel Core Ultra 9 285H, 16 logical CPUs, 65,407,260 kB reported RAM.
- Runtime/toolchain: Bun `1.4.2`, Node CLI `v24.14.1`, Vue `3.5.41`, Vite `6.4.3`.
- Browser: VS Code integrated browser user agent reports Chrome `150.0.7871.250`, Electron `43.6.0`; this is not an OpenAMX Electrobun app host.
- Command: `env -C desktop-app/spikes/sprint041-data-editor-proof bun install` installed 100 packages; `env -C desktop-app/spikes/sprint041-data-editor-proof bun run build` passed (Vite 6.4.3, 1,363 modules).
- Combined proof output after locale registration: JavaScript `2,364.63 kB` / `724.48 kB gzip`; CSS `584.76 kB` / `99.46 kB gzip`; Vite emitted its `>500 kB` JavaScript chunk warning. This includes both candidates and the harness. It is not an isolated candidate delta or comparable production desktop measurement.
- `.hutch/devkit` exists, but no Electrobun package/launch was attempted: candidates have not passed the pre-adoption interaction gate and are not installed in the desktop package.

## Browser Candidate Results

The proof generated 100,000 flat object rows with asset/status/value fields. Equivalent deterministic fixture sizes were measured as CSV `2,469,859` bytes and JSON `5,569,841` bytes; these are fixture-size calculations, not parser timing. The existing strict core input/output tests are recorded separately below.

| Check | Result | Evidence limit |
| --- | --- | --- |
| VXE 100k first viewport | `1,132.5`, `1,157.7`, and `1,492.1 ms` on documented `loadData` runs; 10 rendered body rows | Browser/Vite candidate proof, not production shell or native host |
| 100k scrolling | Virtual scroll extent about `4,800,000 px`; visible rows reached `99,991` through `100,000` | Flat record fixture; no JSON nested-tree 100k test |
| Browser heap | `79.2-102.9 MB` across observed runs using Chromium's nonstandard `performance.memory.usedJSHeapSize` | Browser-wide estimate, no forced GC or isolated component heap |
| CSV grid edit/history | Keyboard text entry and Enter changed a cell; VXE `undo()` restored the prior first-row value and `redo()` restored the edited value | Undo/redo was invoked through proof controls; Ctrl+Z/Ctrl+Y behavior was not reliably verified |
| JSON tree/raw | Tree boolean edit updated raw JSON; JSON editor Ctrl+Z restored the value. Malformed raw string `{"items":[,broken` remained byte-for-byte in the textarea and hid the tree | Proof wrapper held raw source separately and disabled structured mode on parse failure; not production serialization/recovery |
| Larger data | At 100,001 rows the harness showed a bounded raw-mode notice and rendered zero grid rows | Guard behavior only; it did not prove production retention of the original large CSV text |
| Cancellation | Synthetic non-yielding Web Worker terminated after its start signal in `24.4`, `24.6`, and `25.3 ms` (another run: `40.4 ms`) | Candidate primitive only; not cancellation of parsing, grid loading, validation or production jobs, and no worker-close cleanup measurement |
| Composition | Two synthetic composition events were observed | Native IME, OS input method, and composition during grid editing were not exercised; gate remains open |

The browser proof had no measured webview long-task trace. It does not prove native keyboard, accessibility, or 100k behavior on other hosts.

## Isolated Electrobun Host

- Added `hutch.config.ts` pinned to Electrobun `2.0.1`, a separate `electrobun.config.ts` with app identifier `dev.openamx.sprint041-data-editor-proof`, and a minimal `BrowserWindow` entry. The native proof remains separately identified; selected editor dependencies are also pinned in the production desktop package.
- From the proof directory, `bun install` passed; `bun run host:prepare` generated its own `.hutch/devkit`; `bun run host:build` passed and produced `build/dev-linux-x64`.
- Verified one-command launch: `bun run host:run` from the proof directory. It rebuilt the Vite view, prepared the pinned SDK, built the isolated app, and started the launcher with unique proof identifier. Bun main process PID `264723` reported `GTK EVENT LOOP STARTED` and then `X11 Error: GLXBadWindow`; a process check showed it remained alive. `wmctrl` and `xdotool` are unavailable here, so the app window's visual contents were not directly confirmed in this Builder run.
- **Lead Developer manual result:** reports completing all checks in [MANUAL-TEST.md](../../../../desktop-app/spikes/sprint041-data-editor-proof/MANUAL-TEST.md); CSV and JSON editors worked as expected. Exact OS/session details, input method, per-check outcomes and viewport timing were not recorded. This is user-reported host evidence; the Builder does not claim independent reproduction or cross-platform certification. The earlier GLX warning is a Builder launcher observation and does not supersede the user's reported interaction result.

## English Locale

- The pinned `vxe-pc-ui@4.18.21` package ships `lib/language/en-US`; it includes the `vxe.table.emptyText` value `No data yet`. The pinned VXE UI Core API provides `setI18n` and `setLanguage`.
- `desktop-app/src/mainview/main.ts` registers the official `en-US` locale with `VxeUIBase.setI18n` and selects it using `setLanguage` before mounting the app. The pinned table and UI `en-US` dictionaries have the same message structure at these versions.
- Vite browser verification showed “No data yet” instead of the prior Chinese empty-table label; scanning visible `document.body.innerText` returned zero Han characters. Both Vite and isolated Electrobun dev builds passed after the change.
- The vendor `en-US` dictionaries contain Chinese strings in unrelated modules. The production proof observed the enabled grid controls and visible page text in English with no Han characters; adding other VXE modules still requires a fresh visible-label audit.

## Pre-Integration Verification Snapshot

- `bun test tests/inputData.test.ts tests/outputData.test.ts`: **14 tests passed, 0 failed, 61 assertions**. Existing strict JSON duplicate-key behavior, nested/type/default/null/DateTime handling, RFC 4180 quoting/newlines/headers/row widths, and deterministic serializers remain unchanged.
- `env -C desktop-app bun run tests/rpc-contract-check.ts`: passed typed RPC/webview boundary and Sprint 036-040 groups; worker cleanup ended with `Final active resources: []`.
- `env -C desktop-app bunx vue-tsc --noEmit`: passed (no diagnostics).
- `env -C desktop-app bunx vite build`: passed, Vite 6.4.3, 1,918 modules, production desktop JavaScript `743.85 kB` / `255.94 kB gzip`; existing `>500 kB` warning remains.
- `env -C /home/cgamez/Programming/openamx bun run build`: passed.
- `env -C /home/cgamez/Programming/openamx bun test`: **228 passed, 2 failed, 966 assertions across 22 files** while example sources were being edited in the shared worktree. The hello-world failure occurred as `examples/hello-world.amx` lost import/input declarations and its ordinary-fence marker changed. The typed render captured an additional paragraph absent from `examples/typed-asset-analysis.html`; the current concurrent diff removes that paragraph from `examples/typed-asset-analysis.amx`. These failures are unrelated to the isolated proof, and no example or fixture was modified by this task. Re-run the full suite after those shared edits settle.
- `git diff --check`: passed for tracked changes. The newly added proof/evidence files were separately scanned for trailing whitespace.

## Candidate-Selection Residuals (Pre-Integration)

1. Manual host checklist: reported successful by Lead Developer. OS/session, input method and observed timing details are unavailable; do not infer other platforms or formal accessibility.
2. Build each candidate separately in the production Vue/Bun/Vite/Electrobun path and record candidate-specific minified/gzip bundle deltas and dependency/license findings.
3. Prove a 100,000-row JSON array-of-record workflow, schema mapping/navigation and relevant source/data diagnostics; distinguish it from core parser timings.
4. Demonstrate larger/unsupported raw fallback while proving exact original data preservation, autosave/conflict behavior, and stale/cancelled job no-write semantics through trusted services.
5. Keep user-visible grid labels English in production: register the official VXE `en-US` locale before mount and audit enabled controls for untranslated vendor strings.
6. Candidate selection is resolved, but Sprint 041 feature acceptance remains open until production integration and all required data-editor gates pass. Sprint 042 must not assume unverified external mapped-data editing, schema navigation, raw-fidelity, or 100k production behavior.