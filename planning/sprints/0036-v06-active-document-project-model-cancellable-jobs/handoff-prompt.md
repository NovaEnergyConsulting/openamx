# Sprint 036 Handoff Prompt

You are the Builder for OpenAMX Sprint 036.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/requirements.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/acceptance.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/builder-evidence.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/requirements.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/blueprint.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/acceptance.md`
- `src/runtime/moduleLoader.ts`, `src/runtime/inputData.ts`, `src/runtime/outputData.ts`, and focused root tests
- `desktop-app/src/shared/rpc.ts`, trusted Bun services, current workbench state, workers/spikes, and direct desktop tests

## Task Contract

**objective**: Deliver the active-document/project operation foundation, contained unsaved-module overlay integration, cancellable trusted job boundary, in-memory strict data APIs, and typed RPC/direct evidence required by Sprint 037.

**owns**: Active-document/tab operation state, request identity, project-generation and revision guards, source-overlay production integration, trusted job manager/worker protocol, cancellation/supersession/cleanup, in-memory JSON/CSV validation/schema/export APIs, typed RPC contracts, stale/no-write/authority tests, and measured evidence.

**must_not**: Implement the Sprint 037 workbench shell, themes, menus, welcome, project lifecycle, autosave, trash, recovery, settings UI, structured data editor UI, editor intelligence, onboarding, or final preview/export UX; change AMX semantics or existing CLI/VS Code behavior; install an unproved grid; grant webview authority; or claim native/platform/release/accessibility proof unavailable on the current host.

**decision gates**: Use the Lead Developer-accepted active identity, source-overlay, and worker approach from Sprint 035. If implementation exposes a necessary change to those boundaries, stop at the local evidence and record the decision in `planning/questions.md` and `planning/decisions.md`. Sprint 037 requires a stable typed operation/RPC boundary and recorded stale/cancellation evidence.

**acceptance**: Meet every item in `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/acceptance.md`. Final status must distinguish implemented behavior from cooperative/experimental cancellation limits and unavailable generated-host checks.

**verification**:

1. Run focused root module/input/output tests and direct RPC/job tests after each foundation slice; prove invalid, stale, cancelled, superseded, and cross-project work cannot publish or write.
2. Run representative real pipeline jobs, not only synthetic busy loops. Record cancellation acknowledgement, cleanup, memory, payload bounds, redaction, and any uninterruptible phase.
3. Run root build/full tests, unchanged CLI/example tests, desktop direct contract tests, typecheck/Vite checks when `.hutch/devkit` is available, and VS Code regressions if shared APIs are touched. Preserve exact baseline failures.
4. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a builder evidence record with commands, versions, counts, artifacts, limitations, and Sprint 037 handoff conditions.
