# Sprint 060 Handoff Prompt

You are the Builder for OpenAMX Sprint 060.

## Read First

- Applicable repository instructions and `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV10MasterSprintPlan.md`
- Sprint 060 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Existing `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, `src/renderer/reportPreparation.ts`, chart emission/type definitions, and focused renderer/PDF/presentation tests
- `desktop-app/src/mainview/App.vue`, desktop worker/build/resource configuration, current iframe sandbox usage, and existing HTML/worker size limits
- Only relevant existing chart behavior and unchanged DOCX baseline as needed to resolve this sprint's contract

## Entry and Authority

Sprint 060 has no sprint dependency. The V0.10 master plan is the authority for business scope and boundaries. Sprint 060 is a contract and feasibility gate only. Do not assume any ECharts version, implementation detail, or architecture alternative has already been approved.

## Task Contract

**owns**: Complete the testable chart behavior/security/visual contract; isolate and run feasibility probes for offline browser rendering, Bun static SVG, pdfmake/actual PDF, and desktop packaged resource resolution; record licensing, size, performance, limits, compatibility, failure, and residual evidence; request an explicit Lead Developer gate disposition.

**must_not**: Replace production chart renderers; change production iframe sandbox permissions; add runtime dependencies; change chart semantics, measurements, reports, worker limits, or exports; implement DOCX ECharts output; substitute a browser PDF architecture; claim unsupported targets passed; or begin Sprint 061 without approval.

## Execution Rules

1. Inspect current local code and worktree before creating probe artifacts. Preserve user changes; do not overwrite or clean unknown files.
2. Fill the blueprint's contract matrix and decision register with specific cases, expected outcomes, test/experiment, evidence status, and unresolved owner decision. Identify accepted current behavior separately from any proposed detail.
3. Use an isolated, disposable harness for experiments. Do not add dependencies to application manifests or alter production lockfiles. If direct package placement or packaging needs a manifest change, stop and document the minimum proposed change for approval.
4. Name exact versions and host/toolchain. Demonstrate local-file HTML with network disabled, Bun SVG generation, pdfmake serialization plus actual visual PDF inspection, and desktop packaged-resource resolution. Distinguish each surface's result; do not extrapolate one result to another.
5. Exercise every matrix case with executable assertions or captured rendering evidence. Include mixed display units, DateTime/measurement axes where already supported, null/empty cases, duplicate/order cases, hostile payloads, repeated rendering, size/timing, and chart failure/atomicity.
6. For security, propose and test only the least-privilege model from the master plan. Do not enable same-origin access, application/bridge access, report-authored scripts, or unapproved network. If safe interaction requires a broader capability, stop and request approval.
7. Record ECharts/transitive license and notice evidence, font/resource needs, SVG subset, bundle/output sizes, and worker-limit implications. No legal assumptions or limit changes are authorized.
8. Mark each result passed, failed, blocked/unavailable, inconclusive, or not run. Give exact commands, environment, artifacts, and limitations. A failed/inconclusive compatibility gate requires an option analysis and Lead Developer decision, not an unapproved architecture switch.
9. Update only the Sprint 060 artifacts and the planning state/decision/question logs. No production behavior change is authorized in this sprint.
10. Request a separate Lead Developer decision that explicitly approves, approves with named residuals and authorizes Sprint 061, or leaves the gate blocked. Do not self-approve or report implementation completion.

## Closeout

Provide Builder evidence in the Sprint 060 folder with exact findings, commands, versions, hosts, screenshots/output artifacts, status by acceptance criterion, residuals, and proposed decisions. Keep Sprint 061 blocked until its dependency is explicitly approved. Sprint 060 completion is not V0.10 implementation, final acceptance, platform certification, or release readiness.