# Sprint 041 Builder Handover

## Current State

- Branch: `feat/create-v0.6`.
- Updated Sprint 041 artifacts authorize production integration of `vxe-table@4.22.3` and `json-editor-vue@0.19.2` backed by `vanilla-jsoneditor@3.13.0`. The Lead Developer explicitly selected these candidates after the isolated proof and reports all steps in the original manual candidate checklist passed. Exact host OS/session, input method, and per-check timings were not supplied; do not infer them or ask for the whole checklist again.
- English VXE locale is a requirement. The isolated proof registers `vxe-pc-ui/lib/language/en-US` before mount. The visible empty-grid label was confirmed as `No data yet`, with no Han characters in visible page text. The vendor English locale has remaining Chinese strings in unused modules, so audit any extra controls enabled in production.
- **The current production editor source is damaged and is the immediate recovery task.** `desktop-app/src/mainview/components/DataEditorPane.vue` has literal leading `+` characters from a malformed auto-corrected patch, including in the `<script setup>` tail, template and styles. It also contains malformed timing/load fragments. A prior typecheck reported syntax errors around lines 401-424; `get_errors` may not reliably report this untracked Vue file. Inspect the file and restore a coherent component before other integration work. The last known working version is recoverable from earlier conversation/tool history, but reconstructing it cleanly is also reasonable.
- No production editor acceptance is claimed yet. Candidate selection is resolved, implementation and Sprint 041 acceptance remain open.

## Preserve Existing Work

The worktree is already dirty. Do not revert or overwrite these user edits:

- `examples/hello-world.amx`
- `examples/typed-asset-analysis.amx`

The prior full root suite had two example failures while those sources were being edited. Re-run after the user edits settle and report the observed results. Planning documents and Sprint 041 artifacts are also modified as part of this sprint.

## Integrated Changes Present

- `desktop-app/package.json` and `desktop-app/bun.lock` contain exact pins for `buffer@6.0.3`, `json-editor-vue@0.19.2`, `vanilla-jsoneditor@3.13.0`, `vxe-pc-ui@4.18.21`, `vxe-table@4.22.3`, and `xe-utils@4.1.2`. Published licenses recorded in `builder-evidence.md`: MIT except `vanilla-jsoneditor` ISC.
- `desktop-app/src/mainview/main.ts` registers VXE's official `en-US` locale and both VXE plugins/styles. It imports the JSON editor dark stylesheet; the component supplies shell CSS variables for its surfaces.
- `desktop-app/src/mainview/App.vue` mounts `DataEditorPane` for CSV/JSON/external-data tabs, uses the existing `updateText` -> `updateBuffer` path, disables AMX-only commands for data tabs, stores data-editor schema context, polls `validate-data`, and offers inspector navigation.
- `desktop-app/src/shared/rpc.ts` adds only optional, path-safe external metadata (`external`, opaque URI `path`, logical `label`/`inputName`, and `dataFormat`) and mapped-data schema/diagnostics on `openMappedInput`.
- `desktop-app/src/bun/desktopService.ts` has an internal external-tab map and canonical private paths; public responses use opaque `openamx-external:<logical-name>:<uuid>` URIs and labels. Mapped private inputs are opened only through the declared-input mapping route, not a general picker. Save/autosave/conflict checks include open external tabs; recent/recovery state excludes external paths/content. `validate-data` can inspect an external data tab against its owner AMX module graph, carries owner revision checks, and returns bounded schema/diagnostics.
- `src/runtime/dataText.ts` extracts the existing strict duplicate-key JSON and RFC 4180 CSV parser into a browser-safe module. `src/runtime/inputData.ts` delegates to it; `src/runtime/csvTextSerialization.ts` contains browser-safe CSV serialization. `desktop-app/src/mainview/components/dataText.worker.ts` installs the pinned Buffer polyfill before dynamically loading `csv-parse`, and returns bounded worker results.
- `desktop-app/src/bun/desktopDataEditor.test.ts` covers private path/session redaction, external autosave of invalid text, conflict no-write behavior, schema worker privacy, and a >2 MB / 100k-row contained CSV save.
- `desktop-app/spikes/sprint041-data-editor-proof/production.html` and `src/ProductionHarness.vue` mount the actual production component for browser measurements. The spike Vite config allows reading production source files.

## Last Verified Results

These passed before the current component file was corrupted or during earlier working revisions; rerun them after repair before relying on them as current:

- Root `bun test tests/inputData.test.ts tests/outputData.test.ts`: **15 passed, 68 assertions**.
- Desktop `bun test src/bun/desktopDataEditor.test.ts`: **4 passed, 26 expectations**.
- Desktop `bun run tests/rpc-contract-check.ts`: all authority/session/job/conflict groups passed; `Final active resources: []`.
- Desktop `bunx vue-tsc --noEmit`: passed before the last component rewrite.
- Desktop `bunx vite build`: passed with no Node `path` externalization warning; last recorded bundle was `2,654.08 kB` JS / `825.84 kB gzip`, `631.82 kB` CSS / `107.48 kB gzip`, plus a `35.21 kB` parser worker. Vite emitted its >500 kB chunk warning.
- Production-component browser baseline before progressive loading: 100k CSV reached row 100000 with 12 rendered rows; total ready about `684-775 ms`, but VXE `reloadData` caused an approximately `485-518 ms` long task. This did **not** satisfy the <100 ms UI task goal.
- Root build passed in the earlier run. Full root suite last reported **228 passed, 2 failed** due the in-progress user example edits above; rerun when stable.
- English locale browser check passed in the isolated production component harness. The original candidate-host manual report remains Lead Developer reported, not independently reproducible native acceptance.

## Immediate Recovery and Finish Plan

1. Repair `DataEditorPane.vue`. The attempted VXE chunk-ingestion edit was interrupted by an auto-corrected patch that inserted patch markers; do not assume it is implemented. Reconstruct a small, type-safe component first. Keep raw text authoritative, use the parser worker's actual compact response (`issue`, `csvHeaders`, `csvRowsJson`, `rowCount`, or `jsonValue`), preserve invalid text, and keep editor edits on the existing `updateBuffer` path.
2. Typecheck immediately: `env -C /home/cgamez/Programming/openamx/desktop-app bunx vue-tsc --noEmit`. Then build: `env -C /home/cgamez/Programming/openamx/desktop-app bunx vite build`.
3. Rerun `env -C /home/cgamez/Programming/openamx/desktop-app bun test src/bun/desktopDataEditor.test.ts` and `env -C /home/cgamez/Programming/openamx/desktop-app bun run tests/rpc-contract-check.ts`. Add regressions for mapped owner edits superseding data validation, tab close/autosave behavior for external tabs, path-free diagnostics, and failed/stale worker no-write behavior.
4. Reopen `http://127.0.0.1:4175/production.html` using a Vite dev server from the spike directory. Verify CSV cell edit commits, VXE undo/redo, search/sort without source mutation, add/remove/reorder, JSON tree edit/history, array-of-record grid, invalid raw preservation, and English visible text. The existing harness currently expects a `ready` event and includes CSV/JSON fixture buttons.
5. Resolve the measured VXE load long task. The last plan attempted `loadData(first 5k)` then `insertAt` 5k chunks across animation frames, emitting separate viewport/complete timings. That patch became the source corruption; reimplement only after the component is repaired. Use VXE APIs, never custom virtualization. Measure first usable viewport, total load, edit/scroll latency, DOM row count, browser heap, and long tasks separately.
6. Add a 100k JSON array-of-record measurement, 100001-row raw fallback check that proves exact original source retention, and repeated cancellation/supersession measurements. Core parser speed is not viewport evidence.
7. Audit the service for remaining `tabs.values()/tabs.get()` sites. Keep project-only operations (move/trash/list/recovery) restricted to contained tabs; include external tabs in save/quit/project-transition and autosave/conflict paths; never serialize their real paths or text into general RPC, recents, recovery, logs, or diagnostics.
8. Run root focused input/output tests, root build/full tests after example edits settle, desktop RPC tests, `vue-tsc`, Vite build, production-component browser checks, and `git diff --check`. Update state/decisions/questions/evidence and leave Sprint 041 `COMPLETE`, `COMPLETE WITH RECORDED EXCEPTIONS`, or `BLOCKED` according to observed acceptance, never inferred behavior.

## Commands

```sh
cd desktop-app
bun install
bun run tests/rpc-contract-check.ts
bun test src/bun/desktopDataEditor.test.ts
bunx vue-tsc --noEmit
bunx vite build
```

```sh
cd desktop-app/spikes/sprint041-data-editor-proof
bun run dev -- --port 4175
```

The browser proof server was running on port 4175 in the previous session and may need to be restarted. The standalone Electrobun candidate host was manually tested by the Lead Developer; do not rerun it unless specifically needed. Its earlier launcher printed `X11 Error: GLXBadWindow` despite the user reporting successful interaction.
