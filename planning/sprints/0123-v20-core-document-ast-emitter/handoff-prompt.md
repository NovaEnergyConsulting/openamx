# Sprint 123 Handoff Prompt

You are the Builder for OpenAMX Sprint 123: Core Document and AST Emitter.

## Read First

- Repository instructions and user changes; branch, dirty worktree, baseline,
  `dist`, generated renderer runtime, and artifact preservation state.
- `planning/plan-openamxV20MasterSprintPlan.md`, S121/S122 dispositions and
  Builder evidence, S121 accepted helper/API contract, S122 public API
  contract, and every S123 package document.
- Current AST/parser/checker sources and S122 `src/transpilerRuntime.ts` plus
  its public declaration output and focused tests. Reconcile actual helpers;
  do not rely on an earlier proposal where final S122 decisions differ.

## Authority and Entry Gate

- S122 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25. Preserve
  D122-15 no-parity for enum-valued defaults current AMX cannot express, and
  the accepted retry/stop-protocol process residual.
- S121 final feasibility closeout was accepted by the Product Owner on
  2026-11-25 with recorded residuals. Do not begin S123 implementation until
  applicable D123 decisions and the exact S123 execution plan are separately
  approved.
- This package is planning, not execution authority. Obtain exact approval for
  baseline/worktree, source/test files, commands, generated fixtures/oracle,
  output roots, build and `dist` preservation, retries/stop protocol, and
  cleanup before implementation or test execution.
- D121-18 remains best-effort rollback/non-crash-atomic and belongs to S124/
  S125. Do not modify or retest it as S123 work.

## Task Contract

- Implement the typed source/core API through `src/index.ts` only after D123
  API decisions are dispositioned. Preserve the difference between source
  entry exposure and a package-root `.` export; do not modify package exports
  or version without explicit approval.
- Reconcile all current AST discriminants against `ast-lowering-contract.md`.
  Lower every supported node, preserve comments/frontmatter from original
  source text, and fail closed for unmapped nodes.
- Generate strict typed TypeScript using the actual S122 public helper names.
  Preserve evaluation order, input validation, explicit export behavior,
  table/chart snapshots, and structured-v2 declaration-time diagrams.
- Keep one-module emission distinct from S124 recursive graph loading,
  filesystem publication and CLI. Emit import specifiers only from approved
  resolved context; do not touch files during core transpilation.
- Complete every `G123-*` golden/parity row or record an explicit blocker.
  Strictly compile and execute generated fixtures against AMX runtime and
  record exact/tolerance comparisons.
- Complete `verification-plan.md` and `builder-evidence.md` with raw statuses,
  exact commands/CWDs, host versions, artifacts/hashes, first failures,
  retries, limitations, and changed-path/preservation audit.

## Mandatory Boundaries

- No S124 CLI/graph writer, S125 desktop/docs/example, renderer, or release
  work in S123.
- No generated TypeScript execution during transpilation; no HTML/PDF/DOCX
  rendering from generated modules.
- Do not import private engine modules in generated output or expose them
  through the S122 helper package.
- Do not evaluate `{{ expression }}` in narrative. Preserve literal text in
  inert comments, including raw frontmatter lines and Unicode line separators.
- Do not claim AMX parity for D122-15 enum defaults current syntax cannot
  express, or change AMX checker/runtime behavior to manufacture a fixture.
- Do not claim graph-wide atomicity, release readiness, native/platform
  support, package-root export, or cross-runner `.ts` compatibility without
  separately approved direct evidence.

## Completion

Meet `acceptance.md`, reconcile the full AST and master-plan matrix, and submit
an evidence-based Builder recommendation for separate Product Owner
disposition. S124 graph/CLI and S125 desktop/documentation remain separately
gated.