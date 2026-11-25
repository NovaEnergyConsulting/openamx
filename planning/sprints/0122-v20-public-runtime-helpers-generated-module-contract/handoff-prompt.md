# Sprint 122 Handoff Prompt

You are the Builder for OpenAMX Sprint 122: Public Runtime Helpers and
Generated-Module Contract.

## Read First

- Repository instructions and user changes; current branch, dirty worktree,
  baseline, `dist` contents, package lock, and preservation policy.
- `planning/plan-openamxV20MasterSprintPlan.md`, S121 `state.md`/`decisions.md`,
  S121 Builder evidence, and the complete S121 helper/API contract.
- Every document in
  `planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/`.
- `src/transpilerRuntime.ts`, `src/runtime/measurement.ts`,
  `src/runtime/evaluateExpression.ts`, `src/runtime/standardLibrary.ts`,
  `src/runtime/inputData.ts`, `src/runtime/environment.ts`,
  `src/runtime/diagramModel.ts`, and their focused tests.

## Authority and Entry Gate

- S121 was ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25, as recorded
  in canonical ledgers and Builder evidence. The S121 `acceptance.md` and the
  ending of `builder-evidence.md` contain stale pending-disposition language.
  Reconcile those statements under explicit approval before S122 execution;
  do not rewrite any raw S121 test/probe result.
- Preserve S121's distinction: the helper boundary passed its approved probe,
  while full helper coverage and direct enum-helper parity remain S122 work.
- Carry D121-18 forward: multi-file rollback is best-effort and not
  crash-atomic. S122 does not implement or resolve that residual.
- This package is planning, not implementation authorization. Obtain exact
  approval for baseline/worktree, changed files, commands, fixture/oracle
  sources, `dist` handling, artifact roots, retries, and cleanup before work.

## Task Contract

- Implement only the approved public helper/type/API surface in
  `runtime-api-contract.md`, `input-validation-contract.md`, and
  `view-dto-contract.md`.
- Reuse existing evaluator, measurement, standard-library, and input-validation
  semantics where practical. Do not create a parallel evaluator or export
  private engine modules to make the fixture compile.
- Extend focused helper/input tests and cover every applicable `RT122-*` case.
- Compile and execute the separately authored consumer fixture against the
  built `openamx/transpiler-runtime` package. Compare outputs/errors/views to
  the AMX oracle, including string/numeric enum and recursive input cases.
- Complete `verification-plan.md` and `builder-evidence.md` with raw statuses,
  counts, exact commands/CWDs, tool versions, first failures/retries, hashes,
  limits, and changed-path/preservation audit.

## Mandatory Boundaries

- Do not implement the AST transpiler, `src/index.ts` public transpile API,
  CLI command, desktop export, docs/specification/example, graph publisher, or
  renderer output.
- Do not add package version changes, release/publish/deploy/installer/
  distribution/registry/certification actions.
- Preserve existing `dist` and S121 artifacts. Use only separately approved
  isolated build and artifact roots; never clean shared outputs.
- Preserve current AMX behavior. A semantic mismatch requires a blocking
  decision or separately approved scope amendment; do not silently change the
  interpreter contract.
- Do not claim enum parity from only Number input, helper parity from only
  typechecking, or public package compatibility from direct `src/` imports.
- Do not claim graph rollback is crash-atomic or test multi-file publication
  as if it were part of S122.

## Completion

Meet `acceptance.md`, reconcile the full fixture matrix, and submit an
evidence-based Builder recommendation for separate product-owner disposition.
S123 and S121 final feasibility closeout remain separately gated and
authorized.