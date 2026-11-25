# Sprint 121 Handoff Prompt

You are the Builder for OpenAMX Sprint 121: V0.20 Transpiler Contract and
Feasibility Gate.

## Read First

- Repository instructions and user changes; current branch, baseline, dirty
  worktree, and preservation requirements.
- `planning/plan-openamxV20MasterSprintPlan.md` and the complete Sprint 120
  closeout package, especially `builder-evidence.md` and
  `integrated-evidence-matrix.md`.
- `planning/sprints/0121-v20-transpiler-contract-feasibility-gate/requirements.md`,
  `blueprint.md`, `acceptance.md`, `ast-typescript-mapping.md`,
  `generated-runtime-contract.md`, `module-graph-and-diagnostics.md`,
  `golden-fixtures.md`, `parity-matrix.md`, and this handoff.
- The source surfaces named in the V0.20 master plan and S121 requirements.
  Verify source facts at the recorded baseline. Product-owner contract
  decisions D121-01 through D121-18 were recorded on 2026-11-25; do not treat
  contract disposition as execution or final sprint acceptance.

## Authority and Entry Gate

- This package is planning, not execution authorization. Obtain explicit
  approval for the exact baseline/worktree, changed files, commands, isolated
  probe contents, output/artifact roots, preservation, retries, and cleanup
  before running execution or changing evidence.
- Verify Sprint 120's separate `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`
  disposition. Preserve its raw VS Code aggregate 21/8, passing V0.19-specific
  rows, and native/platform `BLOCKED/UNAVAILABLE` status.
- The four lifecycle ledgers were reconciled on 2026-11-25 under
  product-owner approval. Do not rewrite S120 historical evidence or its raw
  residuals.
- Preserve the accepted product clarifications: raw frontmatter is passed in
  the module source envelope; `result.views` includes shown table/chart
  snapshots and distinct declaration-time diagram DTOs without adding `show`
  for diagrams; D121-16 enum type/input validation is implemented and
  focused-tested (the public-helper oracle does not separately claim enum
  parity); and multi-file publication uses best-effort rollback with a
  no-crash-atomicity residual.

## Task Contract

- Inventory every current AST union member and reconcile it to
  `ast-typescript-mapping.md`. Add a row, fixture, owner, or explicit blocker
  for every discrepancy.
- Finalize comment encoding, TypeScript mapping, generated `run(inputs)` and
  result types, input validation, helper surface/package subpath, compiler
  baseline, module graph/path rules, diagnostics, and overwrite/cancellation
  behavior.
- Reconcile every golden case to the parity matrix and every S121 master-plan
  bullet. Keep exact values and floating tolerances explicit.
- The run-01 helper-boundary proof used the actual public subpath under the
  separately approved minimal helper slice. Preserve its raw results and
  limitations; do not infer full S122 or emitter acceptance from the probe.
- Complete `builder-evidence.md` with baseline, exact commands and outputs,
  raw statuses, retries, limitations, residual owners, recommendation, and a
  separate owner-disposition field.

## Mandatory Boundaries

- Do not implement the production transpiler, helper package, CLI, desktop
  export, or unrelated product behavior in S121.
- Do not edit historical language specifications, V0.19 source/evidence,
  package manifests, generated runtime, examples, README, release files, or
  shared output roots unless an exact additional scope is separately approved.
- An isolated feasibility probe is not permission to change tracked product
  files. Keep probe artifacts only under the approved S121 root and preserve
  every first result/retry.
- Do not emit partial output for invalid documents or use `any`, silent node
  skipping, private engine imports, or renderer internals to make a probe pass.
- Do not run release, package/version, publication, deployment, installer,
  distribution, Marketplace/registry, or certification commands.
- Do not claim full emitter, CLI/desktop, rendered report, native, platform,
  or release acceptance from a helper-boundary probe.

## Completion

Meet `acceptance.md`, reconcile the full AST and requirement inventory, finish
the fixtures and parity matrix, and submit an evidence-based Builder
recommendation. Only a separate product-owner disposition closes Sprint 121.
Sprint 122 helper implementation and Sprint 123 emitter implementation each
remain independently gated and authorized. S122 may begin after the
dispositioned S121 helper/API checkpoint; S121 final closeout resumes after the
real helper-boundary proof. S123 remains blocked until S121 final acceptance
and S122 helper acceptance.