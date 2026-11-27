# Sprint 126 Handoff Prompt

You are the Builder for OpenAMX Sprint 126: Integrated Acceptance and V0.20
Closeout.

## Read First

- Repository instructions and user changes; current branch, dirty worktree,
  implementation commits, user-authored files, and preservation state.
- V20 master plan and all Sprint 121-125 requirements, accepted decisions,
  Builder evidence, fixture/parity matrices, residuals, and Product Owner
  dispositions.
- Every document in
  `planning/sprints/0126-v20-integrated-acceptance-closeout/`.
- `src/transpiler/`, `src/transpilerRuntime.ts`, `src/cli.ts`, S124 graph/
  writer files, desktop graph export paths, S125 V0.20 spec/README/example,
  and every focused test referenced by the integrated evidence matrix.

## Authority and Entry Gate

- S121-S124 dispositions are recorded. S125 Builder evidence records the
  Product Owner ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27, but the
  canonical lifecycle ledgers still identify S123 as current. Obtain separate
  explicit approval to reconcile `planning/state.md`, `planning/decisions.md`,
  `planning/STATUS.json`, and `planning/ARCHITECT_BRIEFING.md` before S126
  execution. Do not edit historical S125 raw evidence.
- Obtain exact S126 authorization for baseline/worktree, command matrix,
  outputs/artifact roots, `dist`/renderer/desktop preservation, retry/stop cap,
  cleanup, and residual disposition process before running commands.
- Preserve raw S123/S124/S125 process FAILs, S125 desktop full-suite timing
  FAIL, Hutch wrapper no-result, native/platform unavailable rows, S125
  Measurement probe FAIL, every incomplete G123 row, G124 cancel/crash NOT
  RUN, D122-15, and D121-18.
- S126 is verification/closeout only. Do not interpret a previous accepted
  sprint with residuals as evidence that the full V0.20 feature matrix passes.

## Task Contract

- Reconcile every S121-S125 dependency/disposition/residual against canonical
  records and the original evidence. Keep raw status separate from owner
  disposition.
- Run only separately authorized root focused/full/build/typecheck, CLI,
  generated compile/run, desktop, docs/example, preservation, and output-safety
  checks from `verification-plan.md`.
- Reconcile every G123 row, D122-15, S124 G124 cancellation/crash row, S125
  measurement probe, full desktop test result, wrapper/direct typecheck and
  native/platform availability.
- Compare CLI and desktop graphs for identical input source: module paths,
  generated code bytes, import specifiers and entry result. Verify the Example
  16 generated `run(inputs)` outputs/views against AMX where an accepted AMX
  source form exists.
- Inspect S125 V0.20 spec, README navigation and Example 16 against actual
  APIs/behavior. Historical specifications remain unchanged.
- Complete `integrated-evidence-matrix.md`, `closeout-contract.md`, and
  `builder-evidence.md` with commands/CWDs, tool versions, counts, artifacts/
  hashes, first failures/retries, unavailable checks, residual owners,
  recommendation, and separate owner disposition.

## Mandatory Boundaries

- Do not fix or alter source, tests, helper/emitter/CLI/desktop behavior, docs,
  or examples inside integrated acceptance. On a defect, stop and request a
  separately authorized corrective scope and fresh acceptance cycle.
- Do not change retry caps or continue after a stop condition without explicit
  replan approval. Preserve every first failure and retry.
- Do not claim complete AST/helper/measurement/input/view parity while any
  applicable G123 row remains BLOCKED/UNAVAILABLE or NOT RUN.
- Do not upgrade the S125 full desktop test aggregate because focused RPC/UI
  tests pass. Do not call Vite harness evidence native WebView evidence.
- Do not claim D121-18 crash atomicity from injected rollback cases. Preserve
  the best-effort/non-crash-atomic limitation.
- Do not run release, package/version, publication, deployment, distribution,
  installer, Marketplace/registry, native certification, or cross-platform
  certification workflows.

## Completion

Meet `acceptance.md`, reconcile the full V20 integrated matrix, and submit an
evidence-based Builder recommendation for separate Product Owner disposition.
An accepted closeout does not authorize release, package/platform work, or
rewrite raw failures/unavailable evidence.