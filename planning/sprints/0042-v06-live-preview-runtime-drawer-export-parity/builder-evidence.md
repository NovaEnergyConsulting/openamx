# Sprint 042 Builder Evidence

## Disposition

**Sprint status: COMPLETE by explicit Lead Developer acceptance (2026-10-03).** The Lead Developer reports testing all Sprint 042 functionality and confirms every requirement is met. Active-document preview/Run, identity-bound cancellation, runtime drawer state, unified five-format export, private native destination selection, overwrite protection, atomic replacement, and focused no-write evidence are implemented. No AMX, CLI, report, input, data, visualization, or VS Code semantics were changed.

Native Save/Open/Reveal were not exercised through a direct Electrobun host by the Builder. Browser/component and injected-service results are not native-host evidence. The Lead Developer's final acceptance is user-reported; the acceptance direction did not include OS/session details or a per-check matrix, so none is inferred. Sprint 041's measured 100,000-row responsiveness exception remains owned by Sprint 043; this sprint did not measure or waive it.

## Delivered Boundaries

- Live preview is debounced at 400 ms, pausable/resumable, manually refreshable, and uses the active document plus current contained unsaved import overlay. The UI retains per-tab last-good HTML bound to project generation, document revision, and settings revision. Any AMX/data/settings edit conservatively marks open-tab preview caches stale, covering imported-module and mapped-input dependencies. Explicit Run remains available from the runtime drawer and command palette.
- Worker progress, terminal state, cleanup-pending, and the committing phase are represented separately. Cancellation terminates workers through serialization and temp-file preparation. Bun marks `committing` only in the final pre-rename guard; an atomic rename already begun is non-interruptible.
- Output eligibility is derived from the existing checker/serializer metadata. A new opt-in `outputInspection` loader mode returns explicit JSON/CSV schemas without evaluating AMX or loading input values. Normal loader calls do not compute or return this metadata.
- HTML, PDF, DOCX, JSON, and CSV use one Export dialog. Named data exports accept one selected explicitly exported binding and format, then reuse `prepareOutputs`/`serializeOutputs`; imports, private values, untyped values, and incompatible formats are not offered.
- Webview export requests no longer accept destination paths. The trusted picker stores a one-use selection ID, canonical path, extension, active identity, and existence/SHA-256 snapshot in Bun. Responses include only the selection ID and basename. Existing files require a trusted Replace confirmation. Before rename, Bun rechecks identity, source/data revisions, disk conflicts, and the selected destination snapshot.
- Destination SHA-256 is streamed in 64 KiB chunks. HTML/PDF/DOCX/JSON/CSV are fully prepared in a worker, written to same-directory temporary files, synced, then atomically renamed by Bun. Private paths and serialized data do not enter job results; successful results expose an opaque output ID and basename. Open and Reveal resolve that ID through trusted native callbacks.
- The contextual runtime drawer exposes progress, stage, cancellation, cleanup-pending, expandable source/input/runtime diagnostics, and path-free Open/Reveal actions. The Export modal is keyboard-dismissible and invalidates late replies. Explorer actions wrap at compact widths.

## Verification

Host: Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`; Intel Core Ultra 9 285H, 16 logical CPUs, 65,407,260 kB RAM. Bun `1.4.2`; Node `v24.14.1`; Vue `3.5.41`; Vite `6.4.3`.

- Focused root suites via `runTests` for `tests/modules.test.ts`, `tests/inputData.test.ts`, `tests/outputData.test.ts`, `tests/renderer.test.ts`, `tests/reportPreparation.test.ts`, and `tests/reportIdentityCli.test.ts`: **73 passed, 0 failed**.
- `env -C /home/cgamez/Programming/openamx bun run build && env -C /home/cgamez/Programming/openamx bun test && git -C /home/cgamez/Programming/openamx diff --check`: passed; **240 tests, 0 failures, 1,044 expectations across 23 files**.
- `env -C /home/cgamez/Programming/openamx/desktop-app bun run test`: passed. Direct assertions cover typed RPC authority, source/data/settings identity supersession, unsaved imports, all five formats, path-free output IDs, mocked Open/Reveal, invalid source/input/settings, destination overwrite cancellation/races, outside-project native selection, cancellation/cleanup, and injected pre-commit failures for every atomic writer. Final active resources: `[]`.
- `env -C /home/cgamez/Programming/openamx/desktop-app ./node_modules/.bin/vue-tsc --noEmit`: passed.
- `env -C /home/cgamez/Programming/openamx/desktop-app ./node_modules/.bin/vite build`: passed; 3,265 modules; final JS `2,670.96 kB` / `831.08 kB gzip`; CSS `635.00 kB` / `108.12 kB gzip`; parser worker `29.07 kB`; shared parser `34.64 kB`. Existing Vite `>500 kB` chunk warning remains.
- The first `bunx vue-tsc --noEmit` in the combined chain resolved a temporary latest `vue-tsc` and failed with `ERR_PACKAGE_PATH_NOT_EXPORTED` against TypeScript. The package-pinned `./node_modules/.bin/vue-tsc` command above passed; Vite and direct RPC verification then passed independently.
- `env -C /home/cgamez/Programming/openamx/desktop-app ./node_modules/.bin/vite build --config spikes/sprint042-workflow-harness/vite.config.ts --outDir /tmp/openamx-sprint042-workflow-harness-build`: passed; 3,263 modules; JS `2,664.80 kB` / `829.49 kB gzip`; CSS `623.80 kB` / `106.18 kB gzip`; existing chunk warning remains.
- `git diff --check`: passed after the final source/test edits. Re-run after this evidence/planning update for the complete worktree.
- Lead Developer follow-up rerun (2026-10-03): `env -C /home/cgamez/Programming/openamx/desktop-app bun run test`, package-pinned Vue typecheck, and direct Vite build all passed after replacing the external dialog adapter. The direct contract confirmed the picker receives `directory: true` and the editable basename; traversal/invalid suffixes are rejected before invoking it. `rg` found no subprocess dialog references in desktop source or tests.
- `env -C /home/cgamez/Programming/openamx/desktop-app bun run build:web && env -C /home/cgamez/Programming/openamx/desktop-app hutch electrobun build --env=dev`: passed; Electrobun prepare completed, Vite built 3,265 modules, Bun bundled `jobWorker.js` at 4.13 MB, and the development app build completed. The rebuilt `Resources/app/bun/index.js` contains the filename validation and no `zenity`, `saveDialogCommand`, or `chooseSaveDestination` references. The native window was not launched.
- Worker-close race follow-up (2026-10-03): `ActiveJob` records `workerResultReceived` before handling complete/failed messages; post-result worker close/error no longer fails an in-progress atomic export commit. A direct RPC regression uses a deterministic fake worker that posts a valid HTML result and immediately closes while the async writer is still preparing, then asserts the job succeeds and output bytes match. `env -C /home/cgamez/Programming/openamx/desktop-app bun run test`, pinned Vue typecheck, and the development resource build passed after this fix. The native window was not launched.

## Five-Format and Safety Evidence

A direct service fixture ran the active `report.amx` with an unsaved imported module (`base=30`) and project-mapped JSON/CSV inputs. Report narrative rendered `35`; JSON output contained the two-row binding with `amount`; CSV output retained the core serializer's `amount\n2\n` format. HTML, PDF, and DOCX outputs were structurally verified (`%PDF`, `PK` signatures). Multiple exported bindings were discovered; a private non-exported value was absent.

Latest direct service sample: named JSON serialization `133.6 ms`, CSV `133.2 ms`, HTML `133.1 ms`; PDF `17,096 bytes`; DOCX `9,739 bytes`. Existing report pipeline sample: preview `132.6 ms / 380 chars`, HTML `148.0 ms / 380 bytes`, PDF `155.5 ms / 15,037 bytes`, DOCX `145.3 ms / 9,715 bytes`. These are host samples including worker startup and not cross-platform guarantees.

No-write checks preserved pre-existing targets on invalid AMX source, invalid mapped input in all five formats, invalid report settings for HTML/PDF/DOCX, canceled overwrite, changed destination after confirmation, stale active selection, cancellation during real PDF serialization, and injected pre-rename failure in each format-specific atomic writer. Temporary files were absent after injected failures. A symlink destination was rejected. Outside-project output was accepted only through an explicit injected native selection and its path did not enter RPC results.

Cancellation sample during PDF `serializing`: acknowledgement `0.46 ms`, worker close observed, process RSS delta `+17,563,648 bytes`; destination sentinel remained unchanged. The 3,250,001-character / 250,000-row JSON validation sample acknowledged in `0.02 ms`, worker close observed; process RSS delta `+14,848,000 bytes`. RSS is process-wide/noisy, not isolated worker memory. The direct RPC run ended with `Final active resources: []`.

## Browser/Component Evidence

An isolated Vite harness mounted production `App.vue` against a bounded fake RPC. It verified active-tab preview, last-good iframe retention with unmistakable `STALE` after an injected diagnostic, recovery to `SUCCESS`, pause/resume, output discovery, PDF export success, and mocked Open/Reveal. At 1024×720 the body measured exactly 1024×720; explorer action buttons occupied separate `96×30`, `96×30`, and `196×30` boxes after the compact-layout fix. The Export modal centered and showed only eligible JSON formats for the scalar fixture.

Measured edit-to-stale time was `286 ms` including CodeMirror typing; stale-to-success was `401 ms`, consistent with the configured 400 ms debounce plus the fake RPC response. `performance.getEntriesByType('longtask')` returned no entries in this small browser sample; Chromium logged that this entry type query is deprecated. This does not establish absence of long tasks under real parsing, export, or 100k data-editor load. No screenshot artifact was persisted in the repository; browser screenshots were captured interactively during this pass.

## Artifact Hashes

- Desktop JS `index-NfyyP5qf.js`: `f2d19e1eadeec2695e06cf62d934e11e0637ca1163129be7c9c1cd478f389c17`
- Desktop CSS `index-BkNmRf0B.css`: `62bce5082fdac73b642d73a7a1a1d050ee9b9b70671d1b83c5039c5d4d212ac2`
- Harness JS `index-CPN6NMzM.js`: `54abe35be596aa0d771a0ef5585b8762f8c6b3f427e62f263f56c04fd6e8841f`
- Harness CSS `index-SNN88HPl.css`: `e014fe7e6d79af1a958aa4ce13a95a0abd8074cfa89817eeb3ee785bdcb37fd3`

## Exceptions and Sprint 043 Handoff

- **Lead Developer bug follow-up (2026-10-03):** removed the `zenity`/AppleScript/PowerShell Save subprocess adapter. Export now invokes Electrobun's built-in native directory chooser and combines the selected directory in Bun with the editable basename shown in the modal. No separately installed OS dialog executable/package is required; full paths remain private and existing validation/overwrite/atomic-write checks remain in Bun.
- **Native direct-host acceptance unavailable in this run:** no Electrobun window was launched/interacted with. Directory selection and overwrite tests use injected pickers; Open/Reveal tests use injected callbacks. Native folder-picker interaction, real OS overwrite prompt, Explorer refresh on the actual host, and native dialog focus restoration remain for Lead Developer/native acceptance. Do not treat browser or service results as native proof.
- Native target-platform certification, Hutch packaging/release, Office, license/Marketplace, and formal accessibility remain separate release residuals.
- Sprint 041's 100k CSV/JSON viewport/edit long tasks remain above 100 ms and are not addressed here. Sprint 043 must remeasure the integrated 100k workflow, preserve the existing target, and either remediate or explicitly disposition it without hand-rolling virtualization.
- Sprint 043 integrated acceptance should verify multiple active tabs and dependency/data/settings transitions; native Save/overwrite/cancel/Open/Reveal; destination races; output refresh/delete; real browser/Electrobun long tasks and memory; and the five-format workflow on the chosen host. This Builder did not capture a native screenshot or run Hutch packaging.

## Lead Developer Acceptance (2026-10-03)

- The Lead Developer explicitly states that all functionality built in Sprint 042 was tested and all requirements are met; Sprint 042 is closed as **COMPLETE**.
- This closes Sprint 042 feature acceptance by Lead Developer direction. It does not add missing environment metadata to the Builder record or imply cross-platform release readiness, Hutch packaging acceptance, Office certification, or formal accessibility certification.
- Sprint 041's 100k responsiveness exception remains an explicit Sprint 043 requirement; Sprint 042 did not measure or waive it.
