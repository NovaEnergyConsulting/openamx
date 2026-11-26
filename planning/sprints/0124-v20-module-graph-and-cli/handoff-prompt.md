# Sprint 124 Handoff Prompt

You are the Builder for OpenAMX Sprint 124: Module Graph and CLI.

## Read First

- Repository instructions and user changes; branch, dirty worktree, baseline,
  existing `dist`/renderer/test outputs, and preservation state.
- `planning/plan-openamxV20MasterSprintPlan.md`, S121/S122/S123 dispositions,
  and all three Builder evidence/parity records.
- Every document in
  `planning/sprints/0124-v20-module-graph-and-cli/`.
- `src/transpiler/types.ts`, `src/transpiler/graph.ts`,
  `src/transpiler/index.ts`, `src/transpiler/source.ts`,
  `src/runtime/moduleLoader.ts`, `src/cli.ts`, and current focused tests.

## Authority and Entry Gate

- S121 and S122 are accepted with recorded residuals. S123 was accepted and
  closed with recorded residuals on 2026-11-26. Preserve S123's raw retry-cap
  process `FAIL` and all incomplete G123 `BLOCKED/UNAVAILABLE`/`NOT RUN` rows.
- D121-18 is authoritative: multi-file rollback is best-effort and not
  crash-atomic. D122-15 no-parity for unsupported enum defaults and the S122
  retry residual remain unchanged.
- This package is planning, not execution authorization. Obtain exact approval
  for baseline/worktree, paths, commands, output/temp roots, overwrite policy,
  failure-injection method, retry/stop cap, artifacts, and cleanup.
- Never call `loadEntryModule` for graph discovery; it evaluates AMX. Keep
  parse/check/resolution separate from execution and never run generated code
  during CLI transpile.

## Task Contract

- Recursively resolve local relative `.amx` imports as a parse-only operation.
  Retain canonical identities and original source text, validate root
  containment/cycles/visibility, then build exact S123 graph input.
- Add the CLI command and output writer exactly within dispositioned D124
  behavior. Preflight every target, stage the successful graph, and implement
  per-path best-effort rollback reporting under D121-18.
- Add focused graph/CLI/destination/failure tests for every `G124-*` row or
  record a blocker with raw status and owner.
- Carry every S123 incomplete G123 row forward unchanged. Do not broaden S124
  to finish AST features without explicit scope approval.
- Complete `verification-plan.md` and `builder-evidence.md` with commands,
  CWDs, versions, raw outcomes, artifacts/hashes, first failures/retries,
  preservation, changed paths, residuals, and separate owner disposition.

## Mandatory Boundaries

- Do not add S125 desktop UI/RPC/jobs, docs/spec/example, renderer, or S126
  integrated acceptance work.
- Do not change AMX syntax/semantics, S123 lowering, S122 helper contracts,
  package exports/version, release files, or D121-18.
- No default output directory, silent overwrite, generated-code execution,
  CLI rendering, or hidden cleanup of existing output.
- Do not claim crash-atomic multi-file publication, full AST/helper/parity
  coverage, release readiness, native/platform support, or package-root export.
- Preserve S121/S122/S123 artifacts, first failures, retry history, generated
  build outputs, and user changes.

## Completion

Meet `acceptance.md`, reconcile the full graph/CLI/output matrix and carried
S123 residuals, then submit an evidence-based Builder recommendation for
separate Product Owner disposition. S125/S126 and all release/platform work
remain independently gated.