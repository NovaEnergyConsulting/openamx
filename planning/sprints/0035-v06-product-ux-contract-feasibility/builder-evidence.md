# Sprint 035 Builder Evidence

## Disposition

**Sprint 035: ACCEPTED WITH RECORDED EXCEPTIONS by explicit Lead Developer direction (2026-10-01).** The Lead Developer ratified the contract without amendment, accepted the active-document request identity, source-overlay, and cancellable-job approaches, and authorized Sprint 036. Native Electrobun behavior and data-editor candidate performance could not be proved on this host; these remain explicit downstream exceptions, not inferred passes.

The authoritative contract was not amended. No production workbench, project lifecycle, settings, structured data editor, preview, export, onboarding, or recovery feature was implemented. The only root runtime edit is an optional bounded loader proof hook; legacy callers and CLI call sites continue to omit it.

## Host and Tools

- OS: Omarchy 4.0.4, Linux x86_64; kernel `7.2.5-3-omarchy`.
- Host tools: Bun 1.4.2, Node CLI 24.14.1, Hutch 0.26.0, `/usr/bin/code` present.
- Bun process compatibility reports `process.versions.node` 26.3.0; this is not the installed Node CLI version.
- CPU/memory: 16 logical CPUs; 66,977,034,240 total bytes; 56,629,575,680 free bytes at sampling.
- `zenity`, `yad`, and `Xvfb` are absent. `desktop-app/.hutch` and `desktop-app/node_modules/electrobun` are absent. No native Electrobun window or dialog was launched.
- Vite used for the isolated UI proof: 6.4.3. The integrated browser exposed an accessible page and Playwright-style interaction API, but did not expose its browser-engine version.

## Source Overlay

Changed `src/runtime/moduleLoader.ts` to accept optional `sourceOverlay: ReadonlyMap<string, string>`. The loader validates at most 100 overlay paths; every key must be an existing canonical absolute path below the canonical entry directory. `entryText` retains its existing precedence for the entry; a matching overlay is used for reachable imported modules; all other dependencies retain disk loading. Overlay text passes through the same parser/checker/evaluator and import traversal. It has no write path.

Focused command: `bun test tests/modules.test.ts` (run from repository root): **33 tests, 108 assertions, 0 failures**. New tests prove unsaved import precedence, saved dependency fallback, unchanged dependency bytes, and rejection of an outside-root overlay. Existing tests in the same file cover import cycles, path containment, source locations, and unchanged CLI run/render behavior. This is an isolated backward-compatible API proof, not production desktop integration or Lead Developer acceptance.

## Cancellation and Worker Boundary

Focused command: `bun test ./spikes/sprint035-feasibility/cancellation.test.ts` (from `desktop-app`): **1 test, 5 assertions, 0 failures**. Bun 1.4.2 terminated a non-yielding worker and observed its `close` event in **1.71 ms** on the focused run; a concurrent full-suite run observed **1.178 ms**. Both are below the 250 ms target. The result protocol carries a job ID and source character count only, stays under 512 serialized characters (64 characters observed), contains no private path, and emitted no prepared/commit message after termination.

This is a cancellation primitive proof, not end-to-end preview/input/report cancellation. The worker is deliberately synthetic; it does not load the core, parse 100k data, serialize PDF/DOCX, or test memory cleanup after a real job. The official [Bun Workers documentation](https://bun.sh/docs/runtime/workers) labels the API experimental, particularly termination. Existing loader/input/report APIs have no accepted `AbortSignal` protocol. **Proposed but not accepted:** pair a trusted, terminable worker boundary for non-yielding CPU work with request identity/supersession checks; keep destination validation and final atomic writes in the main process. A full pipeline proof and Lead Developer decision are required before Sprint 036.

## Editor Analysis and Highlighting

Focused command: `bun test ./spikes/sprint035-feasibility/editor-analysis.test.ts` (from `desktop-app`): **2 tests, 12 assertions, 0 failures**. The isolated analyzer imports the core `parseDocumentText`, `checkDocument`, and `checkingActivated`; it does not import VS Code or add a grammar. It demonstrates exact declaration token ranges and URI/range identity after a CRLF/non-BMP prefix, source-order completion facts, and a core `AMX3002` diagnostic at original line 4, column 22.

Scope limitation: this proof covers one local document and top-level declaration facts, not imported/unsaved module graphs, references, rename/actions, or a VS Code host adapter. The existing VS Code `moduleAnalysis.ts` still owns VS Code document lookup and filesystem traversal; no extension code was changed.

Highlighting approaches:

| Approach | Evidence and disposition |
| --- | --- |
| Existing CodeMirror Markdown language | Desktop pins `codemirror@6.0.2` and `@codemirror/lang-markdown@6.5.2`; current `CodeEditor.vue` uses Markdown mode and does not provide AMX semantic highlighting. Keep Markdown narrative/ordinary fences inert. |
| Core parser/checker-derived CodeMirror decorations | **Preferred proof direction, not accepted.** Use shared AST/checker symbol and source-range facts to decorate executable `amx` spans. This avoids a second AMX grammar; incomplete-source fallback and token coverage still need a focused CodeMirror proof. |
| New StreamLanguage/Lezer AMX grammar | Rejected for this contract: it would duplicate AMX lexical/syntactic authority or create a second parser. |

The existing CodeMirror packages and desktop bundle are already part of prior V0.5 work; Sprint 035 did not alter their dependency or production integration. Exact bundle comparison for the AMX decoration approach remains unmeasured.

## Data Editor Candidates

Metadata was read from npm package pages on 2026-10-01; no dependency was installed.

| Candidate | Version/license/compatibility | Contract fit and gap |
| --- | --- | --- |
| `vxe-table` | 4.22.3, MIT; package documents Vue 3.x (v4.7+). `vxe-pc-ui` 4.18.21 and `xe-utils` 4.1.2 also report MIT. npm reports 14,934,695 unpacked bytes for `vxe-table`. | Documentation lists virtual scroll, keyboard navigation/editing, data validation, and undo/redo from v4.19; changelog mentions an IME keyboard fix. Strongest feature match among reviewed candidates. Bun/Vite install/build, actual 100k rows, bundle output, memory, and exact dependency pin compatibility were not tested. **No selection.** |
| `@revolist/vue3-datagrid` | 4.28.0, MIT, Vue 3 wrapper; package advertises virtual rendering beyond one million rows. | Virtualization, keyboard editing, and cell editors align well, but the project describes history/undo-redo as a RevoGrid Pro feature. Community no-cost scope therefore does not yet meet the required edit-history contract. **Not selected.** |
| `ag-grid-community` | 36.2.0, MIT; vendor documents Vue 3 support. | Mature virtualized editable community grid with filtering/sorting and keyboard support. This review did not establish undo/redo coverage, package/build compatibility in this repo, bundle impact, or 100k-row performance. **No selection.** |
| `json-editor-vue` | 0.19.2, MIT; Vue 2/3 and Vite; npm reports 1,576,650 unpacked bytes for wrapper. | Text/tree/table modes and two-way binding are attractive. Its documentation explicitly cautions that it is not performant for large JSON and invalid text can yield `undefined`, which conflicts with exact-invalid-source retention. **Not selected for the data editor.** |
| `vue-json-pretty` | 2.6.0, MIT; Vue 3; supports editable values and optional virtual scrolling. | Could serve as a nested JSON tree/inspector candidate, but raw-text synchronization, lossless invalid text, large-fixture editing and undo were not established. **No selection.** |

The required data-editor candidate gate remains **BLOCKED** until a pinned Vue/Bun/Vite proof measures raw/structured synchronization, keyboard/IME/edit undo, first usable 100k-row viewport, memory, and bundle output. The measured core CSV service below is not a substitute for virtual-grid performance.

## Electrobun and Native APIs

Current source inspection found `Utils.openFileDialog`, `Utils.showMessageBox`, `Electrobun.events` handlers for `before-quit`/`will-close`, `Utils.quit`, and `BrowserWindow` usage in `desktop-app/src/bun/index.ts`. Save selection is currently delegated to OS commands in `nativeSaveDialog.ts`: Linux `zenity`, macOS `osascript`, and Windows PowerShell `SaveFileDialog`. Direct RPC tests exercise command construction/cancel/error parsing, not a native dialog.

| Capability | Result on this host |
| --- | --- |
| Native File/Edit/View/Help menus | **UNAVAILABLE**: no generated Electrobun SDK/native host; current entry point does not register native menus. |
| Open Project/Open File | Source-boundary and mocked-service tests exist; native chooser behavior **UNAVAILABLE**. |
| Reveal in file manager | **UNAVAILABLE**: no implementation/API proof in the current entry point. |
| Save selection | Mocked command/cancel parsing is unit-tested; `zenity` absent and no native UI launched. **UNAVAILABLE**, not pass. |
| Focus restoration | Browser frame harness checks webview dialog/focus-mode restoration; no Electrobun host focus test. **BROWSER ONLY**. |
| Window lifecycle | `before-quit` and `will-close` handlers are source-wired; no native window was available to trigger either. **UNAVAILABLE**. |

Browser and mocked service evidence cannot close the native gate.

## Component/Browser Harness and Frames

Isolated harness: `desktop-app/spikes/sprint035-ui-harness/`. Build command from `desktop-app`: `bunx vite build spikes/sprint035-ui-harness --config spikes/sprint035-ui-harness/vite.config.ts --outDir spikes/sprint035-ui-harness/dist`. Final result: Vite 6.4.3, **11 modules**, JS 84.16 kB (32.43 kB gzip), CSS 22.68 kB (5.13 kB gzip); no dependencies added. Light divider contrast measured 7.42:1 against `#F5F7F7`; dark divider measured 3.26:1 against `#1A2A2E`; visible focus ring is 2 px.

Browser checks switched all **9 screens** and **10 explicit states**, both theme choices and both viewport choices; filtered the data rows to `TX-014`; opened Help, pressed Escape, and verified restored invocation by pressing Enter to reopen; entered/exited focus mode with Escape. Four representative frames were visually inspected. The final 36-frame matrix was regenerated after the contrast/focus correction. This proves the isolated frame viewer's deterministic selectors and representative interaction only; it is not a production component/RPC harness, native host test, accessibility audit, or proof of background-task responsiveness.

The browser viewport was explicitly set to 1120x780 CSS px for the 1024x720 artboard and 1540x1040 CSS px for the 1440x900 artboard. The 36 persisted 2x-raster frames are in [frames/](frames/) and follow `{screen}-{1024x720|1440x900}-{light|dark}.png` for each of `welcome`, `workbench`, `data`, `inputs`, `settings`, `export`, `runtime`, `recovery`, and `trash`. Representative files: [workbench light, 1024](frames/workbench-1024x720-light.png), [data error, dark 1024](frames/data-1024x720-dark.png), [settings light, 1440](frames/settings-1440x900-light.png), [recovery conflict, dark 1440](frames/recovery-1440x900-dark.png). The prior four preliminary images in this directory's parent were captured before the viewport correction; the `frames/` matrix is the authoritative set.

No files were present in `planning/v06-design-inputs/`; reference disposition is “none supplied.” The frames are low-fidelity review material derived from the written contract, not approved production design.

## Available-Host Performance

Command: `bun run ./spikes/sprint035-feasibility/performance.ts` from `desktop-app`. The runner creates and removes its fixture under `/tmp`; project fixture is 100 regular `.amx` files under ten directories. Data fixture is a deterministic 100,000-row, two-column CSV (1,388,899 bytes) declared as an imported `Record[]` input. Measurements use `performance.now()` around the desktop service listing and existing `loadEntryModule` input parse/validation. Heap delta is before/after `process.memoryUsage().heapUsed`, without forced GC; it is approximate and includes runtime/fixture objects.

| Measurement | Result | Contract comparison |
| --- | ---: | --- |
| 100-file contained project listing | 0.462 ms, 100 files | Below 1 s on this host; synthetic service fixture only. |
| 100k CSV parse + typed validation/materialization | 79.345 ms, 100,000 rows | Core service only; not first viewport or grid UI. |
| CSV size | 1,388,899 bytes | Fixture size. |
| Heap delta | 42,944,841 bytes | Approximate process heap delta; not a component-only memory profile. |
| Default preview debounce | Not measured | Product debounce/worker integration absent from this proof. |
| Cancellation acknowledgement | 1.71 ms worker-close sample | Primitive-only measurement; not a full UI-to-job acknowledgement. |
| Webview task <100 ms during background work | Not measured | No background core job is connected to this frame harness. |
| First usable 100k-row viewport <3 s | Not measured | No grid candidate installed or selected. |

Do not extrapolate these values to native macOS, Windows, Ubuntu, package builds, or a shipped virtual editor.

Proposed host-relative budgets remain the contract's initial thresholds pending complete measurements: project listing <=1,000 ms; first usable supported 100k-row viewport <=3,000 ms; preview debounce <=500 ms; cancellable-job acknowledgement <=250 ms; no webview background-analysis task >100 ms. Only the project-listing threshold and the synthetic worker-close primitive were measured. Treat first-viewport, debounce, end-to-end acknowledgement, and main-thread-timing budgets as **unverified proposals**, not final accepted budgets.

## Regression Matrix

- `cd /home/cgamez/Programming/openamx && bun run build`: **passed** (`tsc`, no diagnostics).
- `cd /home/cgamez/Programming/openamx && bun test`: **196 passed, 9 failed, 829 assertions across 18 files**. All nine failures are in `docxCli.test.ts`, `pdfCli.test.ts`, and `reportIdentityCli.test.ts`; their helpers use the nonexistent cwd `/home/cgamez/Programming/openamx`, so CLI subprocess spawn returns `ENOENT`. The test helper's absolute path is unrelated to this change and was not modified. `modules.test.ts` passed all 33 tests/108 assertions in both focused and full-suite runs.
- `cd desktop-app && bun run test`: **passed** (direct typed RPC, webview authority, project/session/workflow assertions).
- `cd desktop-app && bunx vue-tsc --noEmit`: **BLOCKED** by missing `electrobun/main` and `electrobun/view` declarations under the absent generated `.hutch/devkit`; no source diagnostics from this task were reported before those imports failed.
- `cd desktop-app && bunx vite build`: **BLOCKED** because `vite.config.ts` imports missing `./.hutch/devkit/api/config/electrobun-vite`.
- `cd vscode-extension && bun run test`: **passed, 18 Extension Development Host tests** on VS Code 1.85.0. Fontconfig configuration and an unrelated `ms-python` API-proposal warning were emitted.
- `git diff --check`: **passed**.

## Approval and Exceptions

- Contract ratification: **ACCEPTED** by Lead Developer on 2026-10-01, no amendment.
- Active-document request identity: **ACCEPTED** as `{ canonicalActiveUri, projectGeneration, documentRevision, inputSettingsRevision, jobId }`.
- Source overlay: **ACCEPTED** as an optional contained canonical-path map used only for reachable unsaved modules; current no-overlay CLI path stays unchanged.
- Cancellable jobs: **ACCEPTED** as trusted Bun workers for expensive operation phases plus identity/supersession rejection; path validation and final atomic writes stay in the main process. Real operation cleanup and latency must still be measured in Sprint 036/042.
- Native Electrobun checks: **UNAVAILABLE** on this host. Owner: Lead Developer. Impact: Sprints 037-039/042 native acceptance remains blocked. Fallback: require direct SDK-enabled host evidence before claiming native behavior.
- Data editor and first-viewport/memory/bundle proof: **BLOCKED** pending candidate proof. Owner: Lead Developer / Sprint 041 Builder. Impact: Sprint 041 cannot select/install or claim 100k-row acceptance. Fallback: run a pinned Vue/Bun/Vite proof before Sprint 041 implementation; no hand-rolled virtualization.
- Preview debounce/webview task and production worker cleanup measurements: **UNVERIFIED**. Owner: Sprint 036/042 Builder. Impact: live preview/export performance acceptance remains open. Fallback: retain initial contract budgets as proposals and block final acceptance for any unmeasured guarantee.
- Formal accessibility, native packaging/release, Hutch, Office, license/Marketplace, and native platform certification remain separate and unverified.

Sprint 036 is authorized by the Lead Developer decision recorded in `planning/decisions.md` and `planning/state.md`.