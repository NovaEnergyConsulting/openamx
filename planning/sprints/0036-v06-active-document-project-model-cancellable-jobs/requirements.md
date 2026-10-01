# Sprint 036 Requirements: Active-Document Project Model and Cancellable Jobs

## Goal

Replace the desktop designated-entry model with an active-document operation model and establish the trusted, revision-safe job/data foundation required by the V0.6 workbench. Preserve all V0.2-V0.5 language, CLI, data, report, export, and VS Code behavior while making unsaved desktop module graphs, cancellation, stale-result rejection, and typed data services reliable.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 036
- `planning/openamxV06ProductUXContract.md`
- Sprint 035 accepted requirements, acceptance, builder evidence, contract evidence, decisions, questions, and state
- `src/runtime/moduleLoader.ts`, `src/runtime/inputData.ts`, `src/runtime/outputData.ts`, AST/checker/evaluator and existing root tests
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/index.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`, current desktop tests, and existing workbench state
- Existing CLI, report preparation/export, input/output wire contracts, and VS Code regression suites

## In Scope

- Replace `WorkbenchState.entry` and entry-specific operation logic with typed active-document state. Generalize tab/explorer document kinds for AMX, CSV, JSON, configuration/settings, external mapped data, and generated outputs.
- Define and propagate one request identity: canonical active URI, project generation, document revision, input/settings revision, and monotonically increasing job ID. Only the matching current identity may publish preview, results, diagnostics, progress completion, or export status.
- Integrate the accepted optional contained source overlay into desktop analysis. Open unsaved AMX buffers take precedence throughout the reachable graph; unopened dependencies retain canonical disk loading.
- Preserve containment, explicit exports, cycle detection, source locations, input-entry semantics, evaluation order, and no-overlay CLI behavior. Add root regressions for unsaved imports and unchanged CLI behavior.
- Implement a trusted desktop job manager and selected worker boundary for preview/run, input loading/validation, and report preparation/serialization. Support start, progress, cancel, supersede, completion, failure, cleanup, and bounded typed payloads.
- Keep private paths and sensitive contents out of webview/shared payloads. Keep destination validation, conflict/overwrite checks, and final atomic writes in the trusted main process.
- Add narrowly scoped in-memory strict JSON/CSV parsing and validation APIs plus declared schema/export metadata needed by desktop workflows. Preserve V0.3 wire semantics, duplicate-key behavior, RFC 4180 behavior, diagnostic order, and runtime materialization.
- Update typed RPC contracts and focused direct tests before changing production workbench callers. Prove late and cancelled jobs cannot update a new tab/project or write an output.
- Measure real operation cleanup/cancellation and record supported versus unsupported guarantees, resource cleanup, latency, memory, and webview responsiveness where the current host permits.

## Out of Scope

- Workbench decomposition, themes, menus, welcome, project lifecycle, autosave, trash, recovery, settings UI, structured data editing UI, editor intelligence, onboarding, or final live-preview UX.
- Native menu/dialog/window acceptance; the host remains unavailable from Sprint 035 and is owned by later native-dependent work.
- Selecting or installing a virtual grid/JSON tree candidate, 100,000-row viewport acceptance, or hand-rolled virtualization.
- New AMX syntax/semantics, changes to CLI behavior, report identity semantics, export format semantics, or VS Code provider behavior.
- Arbitrary webview filesystem/process/evaluator authority, private-path logging, network paths, telemetry, cloud, or remote assets.

## Constraints

- Use the accepted Sprint 035 identity, overlay, and worker boundary. Any change requires a recorded Lead Developer decision before implementation proceeds.
- The source overlay is optional and contained; no-overlay callers, especially CLI callers, must retain existing behavior and results.
- Main process owns authority for canonical paths, project generation/revisions, output destinations, conflict/overwrite checks, and final atomic replacement. Workers receive bounded typed jobs and cannot commit files.
- Cancellation must be honest: distinguish cooperative cancellation, worker termination, supersession, and acknowledgement from full cleanup. Do not claim a phase is cancellable if it cannot be interrupted or safely discarded.
- Raw invalid JSON/CSV text must remain preservable for future editor work; validation failure must not mutate source or partially write output.
- Do not weaken diagnostic locations/order, strict duplicate-key handling, CSV semantics, input precedence, explicit export rules, containment, or compatibility tests.
- Keep probes and fixtures private/temporary where appropriate. Do not commit source text, input contents, private paths, credentials, or generated outputs.
