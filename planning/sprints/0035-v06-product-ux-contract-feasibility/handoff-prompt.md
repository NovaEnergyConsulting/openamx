# Sprint 035 Handoff Prompt

You are the Builder for OpenAMX Sprint 035.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/requirements.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/blueprint.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/acceptance.md`
- Relevant V0.2-V0.5 specifications and prior sprint outcomes
- Current desktop RPC/main-process/runtime/provider owners and focused tests
- `planning/v06-design-inputs/` when present

## Task Contract

**objective**: Ratify the V0.6 product/UX contract and deliver reviewable design, host, architecture, editor, data-editor, cancellation, test-harness, and performance feasibility evidence for the dependent sprints.

**owns**: Contract traceability and amendments, screen/state/flow documentation, low-fidelity frames, design-reference dispositions, isolated source-overlay and cancellation proofs, native API feasibility, shared editor-analysis proof, data-editor candidate comparison, component/browser harness, performance measurements, and planning evidence.

**must_not**: Implement the V0.6 workbench, project lifecycle, structured data editor, language intelligence, settings, preview, export, onboarding, or recovery product features; change AMX semantics or existing CLI/VS Code behavior; create a second parser; grant webview filesystem/evaluator authority; claim unavailable native/platform/viewer evidence; or hide a failed proof.

**decision gates**: The Lead Developer must accept the contract and each selected technical approach, or record an explicit exception with owner, impact, fallback, and dependent sprint. A failed proof blocks the affected dependency. Sprint 036 cannot begin until the active-document request identity, source-overlay boundary, and cancellable-job approach are accepted.

**acceptance**: Meet every item in `planning/sprints/0035-v06-product-ux-contract-feasibility/acceptance.md`. Mark the final sprint status `ACCEPTED`, `ACCEPTED WITH RECORDED EXCEPTIONS`, or `BLOCKED`; do not infer acceptance from a successful build alone.

**verification**:

1. Run focused proof tests and inspect generated frames/diagrams first; record exact commands, versions, assertions, screenshots/artifact paths, and fixture sizes.
2. Run root regression/build checks after shared probes, plus desktop direct RPC/typecheck/Vite checks and any applicable VS Code checks. Keep feasibility spikes isolated from production behavior.
3. Run performance fixtures on the available host and record timing/memory methodology. Compare results to the contract targets without converting them into native release claims.
4. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with evidence, decisions, blockers, residuals, and owners. If a host or viewer is unavailable, record `BLOCKED` or `UNAVAILABLE`, never `PASS`.
