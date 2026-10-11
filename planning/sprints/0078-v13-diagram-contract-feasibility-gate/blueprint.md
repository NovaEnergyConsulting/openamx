# Sprint 078 Blueprint: V0.13 Diagram Contract and Feasibility Gate

## Approach

1. Confirm explicit Sprint 078 execution authorization and approval of the
   concrete file-by-file plan. Record the starting worktree and preserve all
   existing changes. Do not begin production implementation.
2. Read the V0.13 master plan and inspect only the existing language,
   serialization, rendering, preview-security, packaging, and test surfaces
   needed to make the contract and probes accurate. Record applicable existing
   behavior and limits in `feasibility-report.md`.
3. Prepare `grammar-examples.md` with stable IDs, a candidate declaration
   structure, valid and invalid examples, and clear separation of confirmed
   semantics from syntax proposals. Include representative static and
   time-varying geometry/labels and the crank-slider and battery-resistor
   cases. Freeze one exact candidate contract or explicitly mark the affected
   requirement blocked pending a product decision.
4. Prepare `diagnostic-matrix.md` from the examples. Specify validation
   category, expected failure behavior, primary/secondary source ranges, and
   exact diagnostic identity/message only where authorized by the existing
   catalog or a Lead Developer decision. Mark unallocated identities clearly;
   never invent codes or messages.
5. Prepare `requirement-test-matrix.md` mapping every applicable V0.13
   requirement and fixture to the contract assertion, probe/test surface,
   expected evidence, and owner for later implementation. Include negative,
   accessibility, offline, and resource-bound cases.
6. Use a disposable, isolated probe to evaluate the destination-neutral model
   and rendering candidates across standalone HTML, actual desktop preview,
   PDF, and DOCX. Keep runtime code application-owned and data separate. Test
   safe arbitrary-time evaluation, labels, invalid frames, hostile text,
   responsive sizing, resource packaging, and offline operation. Do not modify
   production paths or change security policy.
7. Inspect visible PDF/DOCX artifacts and desktop/HTML behavior. Capture exact
   commands/actions, environment, outputs, screenshots or equivalent evidence,
   sizes, timings, resource use, and limitations in `feasibility-report.md`.
   Record failed first attempts and retries without overwriting earlier
   outcomes.
8. Propose rendering-time, output-size, and preview-resource limits from
   representative measurements. Explain the sample set and uncertainty; do
   not claim a universal bound from a single probe.
9. Record each unresolved contract choice and its impact. If the safe
   expression/function contract or a required output path is not feasible
   without changing confirmed behavior, stop and request the specific product
   decision. Do not substitute a reduced feature or declare GO.
10. Finish with a traceable GO, NO-GO, or BLOCKED recommendation for Sprint
    079 readiness. The recommendation must distinguish demonstrated facts,
    unverified items, residual risks, and decisions still owned by the Lead
    Developer.

## Files to Update

- `planning/sprints/0078-v13-diagram-contract-feasibility-gate/grammar-examples.md`
- `planning/sprints/0078-v13-diagram-contract-feasibility-gate/diagnostic-matrix.md`
- `planning/sprints/0078-v13-diagram-contract-feasibility-gate/requirement-test-matrix.md`
- `planning/sprints/0078-v13-diagram-contract-feasibility-gate/feasibility-report.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Isolated probe sources/evidence only if necessary, stored under this sprint
  folder and listed in the approved file plan

No production source, ordinary feature test, language specification,
production example, editor, or renderer file is in scope.

## Verification

- Cross-check every master-plan requirement against all three contract
  artifacts; use the same fixture IDs and source text in each.
- Recalculate source locations against each complete fixture document using
  the repository's 1-based original-document, UTF-16-code-unit convention.
- Confirm the probes exercise all four destinations with the same validated
  model, and inspect actual desktop preview plus visible PDF/DOCX output.
- Confirm no report-authored executable code, `eval`, `new Function`, remote
  resource, network requirement, security-boundary relaxation, or
  success-shaped fallback is introduced by the probe.
- Record exact verification outcomes and limitations; do not describe the
  feature as implemented, verified, or approved for production.
