# Sprint 036 Blueprint: Active-Document Project Model and Cancellable Jobs

## Approach

1. Establish the implementation baseline. Read the accepted Sprint 035 evidence and decisions, current desktop state/RPC/service boundaries, runtime loader/input/output APIs, and focused tests. Record the active implementation assumptions and keep all Sprint 035 exceptions visible.
2. Define the typed model first. Introduce document kinds, tab/explorer state, active-document operation context, project generation, revision counters, and the single request identity. Remove desktop decisions that depend on a designated entry while preserving CLI entry-file semantics.
3. Integrate source overlays at the existing loader boundary. Map open unsaved buffers to canonical contained paths, validate containment and bounded size/count, prefer overlays for reachable imports, preserve entry text and disk fallback, and test cycles, explicit exports, source locations, evaluation order, and no-overlay callers.
4. Add the trusted job boundary. Implement a main-process job manager and worker protocol for preview/run, input parse/validation, and report preparation/serialization. Define typed lifecycle/progress/result/error/cancel messages, job identity checks, supersession, cleanup, bounded payloads, redaction, and a main-process-only commit phase.
5. Add in-memory data APIs. Refactor only enough of existing strict JSON/CSV loading to expose parse/validate/schema/export metadata from text or bounded buffers without changing runtime materialization, diagnostics, duplicate-key/RFC 4180 behavior, or existing file-loading APIs.
6. Update RPC contracts before UI consumers. Add narrow requests/events for active-document context, job lifecycle, data validation/schema metadata, cancellation, and result publication. Test malformed/oversized payloads, stale identities, tab/project switches, cancellation, and output preservation directly at the contract boundary.
7. Connect the smallest production call paths needed to prove the foundation. Keep the existing workbench surface otherwise intact; do not begin the Sprint 037 component decomposition. Ensure current callers either supply the identity or remain on a documented compatibility adapter.
8. Measure the real boundary. Run representative AMX/module, input, and report-preparation jobs, measure cancellation acknowledgement, cleanup/resource release, stale-result rejection, memory, payload sizes, and any webview task duration. Record phases where worker termination is the only guarantee or where cancellation is cooperative.
9. Verify compatibility and hand off. Run focused root/desktop/VS Code suites, unchanged CLI examples, type/build checks where the generated host permits, and `git diff --check`. Update state, decisions, questions, and evidence with exact commands/results, limitations, and Sprint 037 entry conditions.

## Files to Update

- `src/runtime/moduleLoader.ts`, `src/runtime/inputData.ts`, `src/runtime/outputData.ts`, and focused root tests
- `desktop-app/src/shared/rpc.ts`, trusted Bun services/job modules, worker modules, and focused desktop contract tests
- Existing desktop state/service adapters only where required to establish active-document and job identity; leave Sprint 037 UI decomposition for Sprint 037
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 036 builder-evidence record

## Notes

The controlling risk is late work publishing after a tab, project, input/settings revision, or job has changed. Every async path must make identity checking and main-process authority visible in code and tests. A successful synthetic worker termination from Sprint 035 is only a primitive; Sprint 036 must test the real selected pipeline and document cleanup limitations instead of hiding them behind a generic cancel flag.
