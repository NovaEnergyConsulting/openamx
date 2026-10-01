# Sprint 036 Builder Evidence

## Disposition

**COMPLETE WITH RECORDED EXCEPTIONS.** The active-document identity, contained source overlay, trusted worker/job boundary, strict in-memory input inspection, typed RPC result, stale suppression, no-write, and worker-close evidence are implemented and verified on this host. Sprint 037 may consume the stable job/RPC identity and schema contracts. This is not acceptance of a redesigned workbench, native platform behavior, a data-grid candidate, packaging/release readiness, or formal accessibility.

No amendment to the Lead Developer-accepted Sprint 035 identity, overlay, or worker approach was required. The implementation keeps destination validation and final atomic replacement in the Bun main process. No AMX semantics, CLI behavior, VS Code behavior, or webview authority changed.

## Host and Versions

- OS/architecture: Omarchy Linux x86_64; kernel `7.2.5-3-omarchy`.
- Bun: `1.4.2`; Node CLI: `v24.14.1`; Electrobun generated devkit: `2.0.1`.
- CPU/memory: 16 logical CPUs; 66,977,034,240 bytes total RAM at sampling.
- Desktop web stack: Vite `6.4.3`, Vue `3.5.41`; VS Code Extension Development Host `1.85.0`.
- Generated `.hutch/devkit` was present. No Hutch prepare/package/native launch command was run.

## Implementation and Direct Evidence

- `loadEntryModule` now has an opt-in `inputInspection` path. It resolves the existing canonical contained module graph, honors the unsaved source overlay, derives the input schema from imported and local types, validates supplied JSON/CSV text using the existing strict validator, and returns schema plus diagnostics without evaluating AMX or writing data. The default loader path remains unchanged.
- `describeOutputSchemas` exposes only explicitly exported bindings and only JSON/CSV formats accepted by the existing serializers. It does not add another serializer or alter output wire semantics.
- The typed desktop `validate-data` worker job carries the accepted active identity and monotonically assigned job ID. It accepts bounded name/format/text, returns input schema, supported exported-output metadata, validity, and capped diagnostics; it never returns the materialized input value or external mapped-data path.
- Job snapshots expose `cleanupPending`. Cancellation/supersession acknowledgement no longer drops the worker reference; the flag clears on the worker `close` event. Final writes remain guarded by current identity, destination/conflict validation, and the existing atomic writers in the main process.
- Direct tests cover unsaved imported schema precedence, saved overlay source preservation, no evaluation, valid and invalid in-memory JSON, duplicate-key/diagnostic compatibility in focused core tests, payload redaction, export schema eligibility, document-revision staleness, tab-switch staleness, project-generation staleness, cancellation, close cleanup, and preservation of a pre-existing PDF after project switch/cancel/failure.
- The existing direct desktop suite also exercises actual preview/report preparation and HTML/PDF/DOCX serialization. The webview source-boundary assertion still rejects filesystem, process, loader, evaluator, and export imports.

## Measurements

Latest available direct RPC run (Linux x86_64, Bun 1.4.2):

| Operation | Elapsed | Output size |
| --- | ---: | ---: |
| Real preview, including worker startup | 340.0 ms | 380 HTML characters |
| HTML preparation/export | 276.7 ms | 380 bytes |
| PDF preparation/serialization/export | 410.0 ms | 15,037 bytes |
| DOCX preparation/serialization/export | 380.6 ms | 9,714 bytes |
| 250,000-row in-memory JSON validation cancellation acknowledgement | 0.72 ms | 3,250,001 input characters |
| Process RSS delta across cancellation exercise | -17,141,760 to +22,085,632 bytes across repeated runs | Process-wide estimate, not isolated worker heap |

The worker close event was observed, `cleanupPending` cleared, and the direct test ended with `Final active resources: []`. The ordinary input-validation result stayed below 4,096 serialized characters; a separate 501-field/101-export fixture returned at most 500 fields and 100 exports with truncation markers and stayed below 200,000 serialized characters. Neither the invalid-value sentinel nor external data directory appeared in validation diagnostics. Timing includes runtime/worker initialization where stated; repeated RSS deltas varied from negative to positive and are noisy process-wide samples, not a worker memory guarantee. These are host samples, not contractual cross-platform guarantees.

## Verification

- `bun test ./tests/modules.test.ts ./tests/inputData.test.ts ./tests/outputData.test.ts`: **48 passed, 0 failed; 172 assertions**.
- `bun run build && bun test`: root TypeScript build passed; **210 passed, 0 failed across 19 files**. This includes CLI, examples, and existing input/output behavior.
- `cd desktop-app && bun run tests/rpc-contract-check.ts`: passed typed RPC/webview authority, active identity, overlay, real worker jobs, data schema/privacy, stale tab/project, cancellation/close cleanup, and existing HTML/PDF/DOCX no-write assertions.
- `cd desktop-app && bunx vue-tsc --noEmit`: passed.
- `cd desktop-app && bunx vite build`: passed; Vite `6.4.3`, 650 modules, JS 745.79 kB / 257.12 kB gzip. Existing >500 kB chunk warning remains.
- `cd vscode-extension && bun run test`: compile and Extension Development Host passed **18 tests** on VS Code `1.85.0`. Host emitted existing Fontconfig warnings and an unrelated `ms-python` API proposal warning.
- `bun test ./src/bun/jobWorker.test.ts`: passed, 1 test / 5 assertions for the worker run protocol.
- `git diff --check`: passed before the final evidence edits; rerun at close.

## Cancellation and Authority Limits

Bun Worker termination remains experimental. The implemented cancellation guarantee is termination of the worker while its job is `running`, immediate stale/cancelled result rejection, and observable eventual `close`; it is not cooperative `AbortSignal` cancellation inside parser, validation, or serializer phases. The measured acknowledgement is only the `cancelJob` RPC response after a running job was observed, not worker startup or end-to-end time-to-progress. Once a trusted main-process atomic rename has begun, it is not cancellable; identity and conflict checks run before commit, and existing files are preserved on invalid/stale/pre-commit failure.

No native Electrobun menus/dialog/window lifecycle or target-platform evidence was attempted. The 100,000-row grid/JSON editor viewport remains a Sprint 041 candidate gate; no grid was installed. No Office, Marketplace/license, Hutch package/launch, native release, or formal accessibility claim is made.

## Sprint 037 Handoff Conditions

- Use `WorkbenchState.requestIdentity` and the typed `startJob`/`getJob`/`cancelJob` contract. Treat `cleanupPending` as worker-close state, not cancellation acknowledgement.
- Active operation identity is canonical active URI, project generation, document revision, input/settings revision, plus the main-process-assigned job ID. Never publish terminal results unless identity still matches.
- Use `validate-data` with bounded raw text; consume only typed schema, output eligibility, validity, and diagnostics. Do not send returned parsed values or private paths to the webview.
- Keep destination validation, conflict/overwrite checks, and atomic writes in the trusted main process. Do not start Sprint 037 UI/product scope in this foundation record.
- Preserve the recorded experimental termination and host-relative performance limitations. Native behavior and the Sprint 041 grid selection remain separate gates.
