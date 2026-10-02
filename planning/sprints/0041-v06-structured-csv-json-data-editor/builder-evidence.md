# Sprint 041 Builder Evidence

## Disposition

**BLOCKED BEFORE PRODUCTION ADOPTION (2026-10-02).** The candidate gate was exercised in an isolated Vue/Vite proof. `vxe-table` showed promising 100,000-row viewport, edit, and history behavior; `json-editor-vue` showed tree editing and undo. Neither candidate is selected, and neither was added to `desktop-app/package.json`. Native IME and actual Electrobun-host compatibility were not demonstrated. The combined proof bundle is large and candidate-specific production deltas were not isolated. No production CSV/JSON editor, mapped schema UI, external-input editing, or autosave integration is claimed.

Do not hand-roll virtualization or lower the gate. Resume only after native keyboard/IME and Electrobun proof, separate candidate bundle measurements, and the remaining raw-fallback/JSON-scale checks are recorded. The current generic data-file shell and Sprint 039 path-redacted refusal for private external mapped files remain unchanged.

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

The packages were installed only in the proof directory with Bun 1.4.2. The desktop production dependency graph is unchanged. This records direct candidate metadata and the locked graph, not an independent legal audit of every transitive package.

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

- Added `hutch.config.ts` pinned to Electrobun `2.0.1`, a separate `electrobun.config.ts` with app identifier `dev.openamx.sprint041-data-editor-proof`, and a minimal `BrowserWindow` entry. Candidate dependencies remain under this spike only.
- From the proof directory, `bun install` passed; `bun run host:prepare` generated its own `.hutch/devkit`; `bun run host:build` passed and produced `build/dev-linux-x64`.
- Verified one-command launch: `bun run host:run` from the proof directory. It rebuilt the Vite view, prepared the pinned SDK, built the isolated app, and started the launcher with unique proof identifier. Bun main process PID `264723` reported `GTK EVENT LOOP STARTED` and then `X11 Error: GLXBadWindow`; a process check showed it remained alive. `wmctrl` and `xdotool` are unavailable here, so the app window's visual contents were not directly confirmed in this Builder run.
- **Lead Developer manual result:** reports completing all checks in [MANUAL-TEST.md](../../../../desktop-app/spikes/sprint041-data-editor-proof/MANUAL-TEST.md); CSV and JSON editors worked as expected. Exact OS/session details, input method, per-check outcomes and viewport timing were not recorded. This is user-reported host evidence; the Builder does not claim independent reproduction or cross-platform certification. The earlier GLX warning is a Builder launcher observation and does not supersede the user's reported interaction result.

## English Locale

- The pinned `vxe-pc-ui@4.18.21` package ships `lib/language/en-US`; it includes the `vxe.table.emptyText` value `No data yet`. The pinned VXE UI Core API provides `setI18n` and `setLanguage`.
- `src/main.ts` registers the official `en-US` locale with `VxeUIBase.setI18n` and selects it using `setLanguage` before mounting the app. The pinned table and UI `en-US` dictionaries have the same message structure at these versions.
- Vite browser verification showed “No data yet” instead of the prior Chinese empty-table label; scanning visible `document.body.innerText` returned zero Han characters. Both Vite and isolated Electrobun dev builds passed after the change.
- The vendor `en-US` dictionaries contain Chinese strings in unrelated, unused controls. Production integration must audit the controls actually enabled in the CSV grid and override or replace every visible non-English label; selecting `en-US` alone is not a global guarantee for every VXE module.

## Core Compatibility

- `bun test tests/inputData.test.ts tests/outputData.test.ts`: **14 tests passed, 0 failed, 61 assertions**. Existing strict JSON duplicate-key behavior, nested/type/default/null/DateTime handling, RFC 4180 quoting/newlines/headers/row widths, and deterministic serializers remain unchanged.
- `env -C desktop-app bun run tests/rpc-contract-check.ts`: passed typed RPC/webview boundary and Sprint 036-040 groups; worker cleanup ended with `Final active resources: []`.
- `env -C desktop-app bunx vue-tsc --noEmit`: passed (no diagnostics).
- `env -C desktop-app bunx vite build`: passed, Vite 6.4.3, 1,918 modules, production desktop JavaScript `743.85 kB` / `255.94 kB gzip`; existing `>500 kB` warning remains.
- `env -C /home/cgamez/Programming/openamx bun run build`: passed.
- `env -C /home/cgamez/Programming/openamx bun test`: **228 passed, 2 failed, 966 assertions across 22 files** while example sources were being edited in the shared worktree. The hello-world failure occurred as `examples/hello-world.amx` lost import/input declarations and its ordinary-fence marker changed. The typed render captured an additional paragraph absent from `examples/typed-asset-analysis.html`; the current concurrent diff removes that paragraph from `examples/typed-asset-analysis.amx`. These failures are unrelated to the isolated proof, and no example or fixture was modified by this task. Re-run the full suite after those shared edits settle.
- `git diff --check`: passed for tracked changes. The newly added proof/evidence files were separately scanned for trailing whitespace.

## Resume Conditions and Residuals

1. Record the Lead Developer-reported manual host pass with OS/session, input method and observed timing details if available; do not infer other platforms or formal accessibility.
2. Build each candidate separately in the production Vue/Bun/Vite/Electrobun path and record candidate-specific minified/gzip bundle deltas and dependency/license findings.
3. Prove a 100,000-row JSON array-of-record workflow, schema mapping/navigation and relevant source/data diagnostics; distinguish it from core parser timings.
4. Demonstrate larger/unsupported raw fallback while proving exact original data preservation, autosave/conflict behavior, and stale/cancelled job no-write semantics through trusted services.
5. Keep user-visible grid labels English in production: register the official VXE `en-US` locale before mount and audit enabled controls for untranslated vendor strings.
6. Until all gates pass and a candidate is explicitly selected, do not add production dependencies or claim Sprint 041 feature acceptance. Sprint 042 must not assume a data editor, external mapped-data editing, schema navigation, or 100k production behavior.