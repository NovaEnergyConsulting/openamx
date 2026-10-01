# Sprint 036 Requirements: Active-Document Project Model and Cancellable Jobs

## Goal

Implement the trusted foundation for V0.6 active-document operations and cancellable work. Replace desktop designated-entry operation state with one current active document, bind every asynchronous result to a complete request identity, reuse the shared module loader with open unsaved module overlays, and add a trusted worker/job boundary for expensive preview/run/input/report work. Preserve existing AMX, CLI, V0.2-V0.5 report/data, and VS Code behavior.

## Inputs

- Ratified `planning/openamxV06ProductUXContract.md`.
- Approved roadmap in `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 036.
- Lead Developer decision in `planning/decisions.md`: active-document identity, contained source overlay, and cancellable-job approach accepted 2026-10-01.
- `planning/sprints/0035-v06-product-ux-contract-feasibility/builder-evidence.md` and the recorded Sprint 035 exceptions.
- Current owners: `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`, `desktop-app/src/mainview/App.vue`, `src/runtime/moduleLoader.ts`, `src/runtime/inputData.ts`, and their focused tests.
- V0.2-V0.5 specifications and regression suites.

## In Scope

- Replace `WorkbenchState.entry` and entry-specific operations with typed current active-document state. A current active AMX document owns analysis, run, preview, and export requests. Preserve project generation and independent tab content/revisions/conflicts.
- Generalize typed project-file/tab metadata for AMX, CSV, JSON, project settings, external mapped data, and generated HTML/PDF/DOCX outputs. This sprint adds the trusted model and bounded RPC; feature-specific editors/settings/lifecycle workflows remain later sprints.
- Define and enforce request identity `{ canonicalActiveUri, projectGeneration, documentRevision, inputSettingsRevision, jobId }`. A result is current only when every identity component matches. Generate monotonically increasing job IDs in the trusted main process.
- Pass all relevant open unsaved AMX modules through the accepted optional contained source overlay. Unsaved reachable modules take precedence over disk; unopened modules use the existing canonical filesystem path. Retain import containment, cycles, explicit exports, original source locations, evaluation order, and entry-only input behavior.
- Add a trusted job manager and Bun Worker boundary for preview/run, input reading/validation, and report preparation/serialization. Support start, progress/state, cancel, supersede, bounded messages, cleanup, and stale-result rejection.
- Keep project path validation, private-path redaction, destination conflict/overwrite checks, and final atomic output writes in the main process. Cancelled, failed, or superseded work must not replace an existing destination.
- Extract narrow in-memory strict JSON/CSV parse-and-validate APIs from existing runtime rules. Preserve duplicate-key rejection, RFC 4180 parsing, diagnostic ordering/codes/locations, declared-type materialization, and CLI file semantics. Return bounded schema/export metadata needed by the desktop without exposing arbitrary evaluated values.
- Update typed RPC contracts and direct tests before integrating operation identity into the workbench. Keep webview authority limited to bounded requests/responses; no filesystem, input loader, evaluator, process, or export adapter reaches the webview.

## Out of Scope

- Workbench redesign, native menus, native Open/Reveal/save-panel implementation, project creation/rename/trash/recovery, autosave, report settings, or complete Inputs UX.
- The structured CSV/JSON editing components and selection/performance acceptance; Sprint 041 remains gated on its component proof.
- Full AMX language intelligence, CodeMirror token highlighting, rename/refactor, onboarding/help, or export workflow redesign.
- AMX syntax/semantics or CLI/VS Code user-facing behavior changes.
- Claiming native packaging/release, Hutch, accessibility certification, Office compatibility, or unavailable host behavior.

## Constraints

- Use the Lead Developer-accepted identity and worker boundary. Do not weaken it without a new recorded decision.
- Keep filesystem, module/input resolution, evaluation, report preparation, native dialogs, and final writes in trusted Bun/main/worker code.
- Worker inputs/results are typed, bounded, and path-redacted. Do not transfer raw private paths, credentials, or unbounded evaluated objects to the webview.
- Superseding/cancelling a worker is not permission to skip main-process identity/destination checks. Only the matching current job may publish status or commit output.
- A worker that cannot be safely interrupted must document its cooperative points and cleanup behavior; do not claim hard cancellation beyond measured evidence.
- Shared loader/input API additions remain backward-compatible. Existing no-overlay CLI and VS Code tests must remain green.
- Native SDK files may be absent on the Builder host; mark direct typecheck/package/native checks `UNAVAILABLE` if the generated SDK cannot be produced. Do not substitute browser or mock proof.