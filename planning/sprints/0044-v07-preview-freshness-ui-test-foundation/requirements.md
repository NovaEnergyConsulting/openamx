# Sprint 044 Requirements: Preview Freshness and UI-Test Foundation

## Goal

Reproduce and resolve the reported desktop preview freshness failure without weakening the active-document, project, input/settings, or job identity guards. Establish a repeatable regression test for the delayed preview-after-autosave sequence and prove whether the existing workflow harness can support maintained browser/UI tests.

## Inputs

- `planning/plan-openamxV07MasterSprintPlan.md`, Sprint 044
- `planning/ideas/desktop-app-features.md`, especially the Preview Panel observations
- `planning/plan-openamxV06MasterSprintPlan.md` and the V0.6 preview/debounce contract
- Sprint 042 live-preview/runtime-drawer requirements, acceptance, and Builder evidence
- Sprint 043 final state and V0.7 carry-forward scope
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/bun/desktopService.ts`, and related desktop preview tests
- `desktop-app/spikes/sprint042-workflow-harness/`, `desktop-app/package.json`, and desktop test scripts

## In Scope

- Reproduce the reported workflow: edit an AMX document, wait beyond the 400 ms debounce, observe computation complete, and inspect preview output/status for stale content.
- Trace preview scheduling, autosave, captured revisions/hashes, result acceptance, freshness checks, and iframe rendering through the owning UI and service code.
- Before selecting a production fix, use a deterministic delayed-worker regression to confirm or falsify the hypothesis that autosave changes a captured disk hash and rejects a still-current active-buffer result.
- If a defect is confirmed, make the smallest production correction that preserves all other freshness and ownership checks. If falsified, record the evidence and identify the actual controlling condition before changing code.
- Add source-dependent delayed-preview coverage proving current output reaches the rendered iframe after autosave.
- Cover automatic pause/resume, manual refresh while paused, genuinely obsolete result rejection, and last-good preview retention for invalid or stale input.
- Assess the Sprint 042 workflow harness with a bounded compatibility proof for browser automation. Reuse it if maintainable; add a maintained browser dependency scoped to desktop tests only when the proof shows it is required.
- Record exact reproduction steps, test commands/results, harness decision, remaining limitations, and any changed behavior in Sprint 044 evidence and planning records.

## Out of Scope

- Sprint 045 viewport/scrolling, editor wrapping/indentation, and runtime-drawer contrast work.
- Sprint 046 Help Center JSON migration, dialog layout, or integrated acceptance beyond evidence directly needed by Sprint 044.
- Unrelated V0.7 carry-forward backlog, AMX/CLI semantics, VS Code behavior, native-platform certification, formal accessibility certification, and release engineering.
- Changing the native window dimensions/resizability or expanding preview behavior beyond the existing active-document contract.

## Constraints

- The disk-hash/autosave race is an unconfirmed hypothesis. Do not choose or implement a freshness fix until a deterministic delayed-worker regression confirms or falsifies it.
- Preserve project generation, canonical document identity, document revision/text, input/settings revision, job identity, cancellation, and stale-result rejection. Autosave must not legitimize a result for any genuinely outdated owner or request.
- Preserve last-good preview behavior when current source/input/settings are invalid or a current result cannot be accepted.
- Pause suppresses automatic refresh; resume restores automatic refresh; explicit manual refresh remains available while paused.
- Keep the 400 ms default preview debounce unless direct evidence supports a change, and never exceed the existing 500 ms maximum.
- Do not add a browser dependency to the production application. Any new browser automation package must be maintained, justified by the bounded proof, and limited to desktop test tooling.
- Browser/component evidence is not native Electrobun or cross-platform certification.