# Sprint 036 Blueprint: Active-Document Project Model and Cancellable Jobs

## Approach

1. Establish the service contract. Convert the old designated-entry state into typed active-document state while preserving independent per-tab buffers, revisions, conflicts, and project generation. Define file kinds and operation identities in the shared RPC types first.
2. Bind operations to identity. The main process allocates a monotonically increasing job ID and captures canonical active URI, project generation, document revision, and input/settings revision. Revalidate identity before publishing results and immediately before any destination commit.
3. Feed the active module graph. Traverse imports with the existing parser and canonical containment rules. Build an overlay from all currently open unsaved reachable AMX tabs; the loader consumes that overlay without changing its no-overlay CLI path. Remove the old “save dirty dependency first” behavior only for modules whose validated in-memory source is supplied to the loader.
4. Add the worker protocol. Implement a trusted Bun job manager and worker request/response union with bounded operation payloads, progress/state, job identity, structured diagnostics, cancellation, termination, and guaranteed listener/temp-resource cleanup. Workers prepare/serialize only; main process owns destination validation and writes.
5. Add in-memory input APIs. Refactor existing strict JSON and CSV parsing/conversion so a trusted caller can validate text against a declared type and receive the same values/diagnostics as the file-backed path. Keep file reading in its current authority boundary and preserve CLI semantics/order.
6. Integrate typed RPC and minimal workbench state. Add start/get/cancel/result job operations as needed; update the workbench to identify the active tab and display job identity/state without redesigning the full shell. Prevent late results from changing a newly active tab/project or appearing as current success.
7. Prove failure behavior. Add direct worker/job/service tests for supersession, cancel during parse/evaluation/serialization, project/tab changes, redaction, bounds, cleanup, current-result publication, output preservation, and final main-process-only atomic commit.
8. Run focused tests first, then root build/tests, desktop direct RPC/type checks/Vite when SDK dependencies are available, and VS Code compile/host tests for shared changes. Update planning state/decisions/questions with exact commands and any unavailable host result.

## Files to Update

- `src/runtime/moduleLoader.ts` and `tests/modules.test.ts` for the accepted contained source overlay.
- `src/runtime/inputData.ts` and focused input tests for in-memory strict parse/validate APIs.
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`, and new focused trusted job/worker modules.
- `desktop-app/src/mainview/App.vue` and minimal related state styles only as required to submit identity-bound active-document work and represent pending/cancelled/stale results.
- `desktop-app/tests/rpc-contract-check.ts` and focused service/job/input tests.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.

## Notes

The Sprint 035 Worker proof is synthetic and the Bun Worker termination API is documented experimental. Sprint 036 must validate actual OpenAMX work phases and cleanup on the available host. It may record a specific operation as cooperatively cancellable or blocked if termination is unsafe; it must never claim a worker stopped when only its response was ignored.