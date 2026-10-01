# Sprint 036 Handoff Prompt

You are the Builder for OpenAMX Sprint 036.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0036-active-document-project-model-cancellable-jobs/requirements.md`
- `planning/sprints/0036-active-document-project-model-cancellable-jobs/blueprint.md`
- `planning/sprints/0036-active-document-project-model-cancellable-jobs/acceptance.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/builder-evidence.md`
- Relevant V0.2-V0.5 specs, current desktop/RPC/runtime/input/report owners, and focused tests

## Task Contract

**objective**: Implement the accepted active-document request identity, reusable contained unsaved-module overlay, cancellable trusted job boundary, and in-memory typed data validation foundations for V0.6.

**accepted decisions**: The Lead Developer ratified the product/UX contract and accepted `{ canonicalActiveUri, projectGeneration, documentRevision, inputSettingsRevision, jobId }`, optional canonical contained source overlay, and trusted Bun workers with main-process-only final writes on 2026-10-01. Reuse these decisions; do not reopen them without evidence and an explicit new decision.

**must_not**: Change AMX semantics or existing CLI/VS Code behavior; add a second parser; grant webview filesystem/evaluator/process/export authority; commit output from cancelled or stale work; implement the complete data editor, project lifecycle, report settings, onboarding, or a product redesign; claim unavailable native/platform behavior.

**verification**:

1. Run focused loader, in-memory input, job manager, and RPC proof tests first. Exercise cancel/supersede during actual core phases and record limits/cleanup.
2. Run root build and full root tests; desktop direct RPC, direct Vue typecheck, and Vite checks. Run VS Code compile/host tests if shared core changes.
3. Prove late/cancelled jobs cannot publish to a different active URI/generation/revision or replace an existing destination; prove all writes remain in main process.
4. Record exact commands, versions, assertions, payload bounds, fixture sizes, measurements, screenshots if UI state changed, and unavailable checks.
5. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Do not begin dependent UI/data-editor work outside this sprint.

Sprint 036 is authorized. Native API evidence remains a recorded exception assigned to native-dependent sprints; the data-editor candidate/100k-row proof remains a Sprint 041 entry gate.