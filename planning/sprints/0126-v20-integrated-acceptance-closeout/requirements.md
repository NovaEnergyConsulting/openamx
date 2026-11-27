# Sprint 126 Requirements: V0.20 Integrated Acceptance and Closeout

## Document Status

Architect-prepared S126 package. Sprint 126 is a cross-surface verification and
closeout gate, not a feature implementation sprint. It requires separate
explicit Product Owner authorization for exact baseline, commands, worktree,
outputs, preservation and retry plan. Preparation grants no implementation,
release, package/version, publication, deployment, distribution, or platform
certification authority.

## Goal

Establish reproducible V0.20 evidence from AMX source through the core graph
emitter, generated TypeScript/helper runtime, CLI output, desktop graph export,
and additive documentation/example. Reconcile all S121-S125 dispositions and
residuals, compare generated exports/views with AMX runtime for accepted source
forms, verify graph/output safety, and submit an evidence-based V0.20 closeout
recommendation with raw PASS/FAIL/BLOCKED/NOT RUN rows preserved.

Acceptance of S126 with residuals must not be described as complete feature
coverage where source or parity cases remain unresolved.

## Authority and Inputs

- Confirmed V0.20 scope and S126 sequence:
  [`plan-openamxV20MasterSprintPlan.md`](../../plan-openamxV20MasterSprintPlan.md).
- S121 final feasibility closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-11-25. D121-18 multi-file rollback is best-effort and not crash-atomic.
- S122: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25. Preserve
  D122-15: no AMX parity claim for enum-valued record defaults that current
  AMX source cannot express; preserve the accepted S122 retry/stop-process
  residual.
- S123: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-26. Preserve
  `S123-RETRY-STOP-01` raw FAIL and every G123/E123
  `BLOCKED/UNAVAILABLE`/`NOT RUN` row. In particular,
  `S125-MEASUREMENT-PROBE-01` later recorded a generated Measurement type-
  identity compile FAIL; do not silently relabel G123 measurement parity PASS.
- S124: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-26. Preserve
  `S124-RETRY-STOP-01` raw FAIL, `G124-PUBLISH-CANCEL-01` and
  `G124-PUBLISH-CRASH-BOUNDARY-01` NOT RUN, and D121-18.
- S125: Builder evidence records ACCEPTED/CLOSED WITH RECORDED RESIDUALS by
  the Product Owner on 2026-11-27. Preserve raw full desktop `bun run test`
  FAIL on the existing timing-sensitive report-export RPC poll; configured
  Hutch typecheck wrapper BLOCKED/UNAVAILABLE despite the direct pinned
  vue-tsc check PASS; native WebView/cross-platform BLOCKED/UNAVAILABLE; and
  `S125-MEASUREMENT-PROBE-01` raw FAIL. The evidence says the owner disposition
  is separate, but `planning/state.md`, `planning/decisions.md`,
  `planning/STATUS.json`, and `planning/ARCHITECT_BRIEFING.md` currently lag at
  S123. Reconcile those canonical ledgers under explicit approval before S126
  execution; do not rewrite S125 raw evidence.
- Main implementation: `src/transpiler/`, `src/transpilerRuntime.ts`,
  `src/transpiler/filesystemGraph.ts`, `src/transpiler/outputWriter.ts`, and
  `src/cli.ts`; desktop graph export in `desktop-app/src/shared/rpc.ts`,
  `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`,
  `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/index.ts`,
  and `desktop-app/src/mainview/App.vue`.
- User-facing contract/example: `docs/language-spec-v0.20.md`, `README.md`,
  `examples/16_TypeScript_Transpilation.amx`, and existing
  `examples/libraries/asset-management.amx` / `examples/data/asset.json`.

## Entry Conditions

- Verify S121-S125 accepted dispositions and residuals from each sprint's
  Builder evidence and owner records. Preserve all raw aggregate failures,
  incomplete G123 rows, and unavailable native/platform checks.
- Reconcile the stale canonical lifecycle ledgers for S124 and S125 before
  S126 execution, with explicit Product Owner authorization and no edits to
  historical Builder evidence/artifacts.
- Record exact S126 baseline/worktree, changed paths, command/CWD matrix,
  isolated build and artifact roots, `dist`/renderer/desktop output manifests,
  retry/stop limit, preservation and cleanup before execution.
- Product-source, tests, docs, example, renderer, desktop and CLI fixes are
  outside S126 closeout. If a defect blocks acceptance, preserve the failure
  and request a separately authorized corrective sprint/replan.

## In Scope

- Reconcile every S121-S125 master-plan requirement, owner disposition,
  Builder recommendation, raw status, residual and downstream dependency.
- Run focused root transpiler/parser/checker/runtime/measurement/list/builtin/
  input/view suites, generated-output tests, CLI graph tests, example tests,
  and the broader root regression suite if authorized.
- Build the root package and strict-typecheck source; record generated
  renderer/helper hashes and restore or preserve existing `dist` exactly.
- Run Example 16 through AMX parse/check/format/runtime, CLI transpile, strict
  generated-TypeScript compile and generated `run(inputs)` execution; compare
  exports and structured table/chart/diagram views with AMX where representable.
- Exercise S124 filesystem graph discovery and CLI for nested imports,
  invalid/missing/private/cyclic/escaping modules, stable path mapping,
  deterministic graph output, collisions, overwrite refusal/acceptance and
  failure reporting.
- Exercise S125 desktop graph export for active/unsaved entry and dependencies,
  directory selection, cancellation, stale identity/source changes, exact
  overwrite confirmation, output mutation, safe commit, rollback reporting,
  open/reveal and multi-file output.
- Run desktop typecheck, unit/RPC suite, focused Vite UI harness, and any
  explicitly approved native route. Classify each host independently.
- Verify additive V0.20 spec/README/example links and claims; preserve all
  historical specification content.
- Produce integrated requirement/evidence matrix, output/artifact hashes,
  host/tool versions, raw results, retries, residual owners, Builder
  recommendation and separate Product Owner disposition.

## Out of Scope

- Any product/source/test/docs/example fix discovered during verification.
  Stop and request a separately approved corrective plan and new evidence
  cycle; do not patch inside S126.
- Changing S121-S125 raw outcomes, retry history, owner dispositions or
  residual wording; changing D122-15, D121-18, S123 measurement semantics, or
  accepted APIs without separate approval.
- New AMX syntax, helper/emitter/CLI/desktop feature work, UI redesign,
  documentation restructuring, source maps, or report rendering from generated
  TypeScript.
- Release prep/publication, package/version changes, deployment, installers,
  distribution, Marketplace/registry, native certification, or cross-platform
  claims not directly evidenced and authorized.

## Evidence Rules

- Raw statuses are exactly `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and
  `NOT RUN`. Owner acceptance never changes a raw status.
- A V0.20-specific helper/parser row does not upgrade the full root/desktop
  aggregate. A Vite harness pass is not native desktop evidence.
- Passing the Asset example does not close the known Measurement compile probe
  or all G123 AST/helper/parity rows.
- A CLI transpile pass does not prove generated TypeScript compile/run parity;
  a desktop UI pass does not prove CLI output equivalence.
- D121-18 remains best-effort/non-crash-atomic even if injected writer rollback
  tests pass. No process/power-loss guarantee is inferred.
- S122 D122-15 remains: no AMX parity claim for enum-valued record defaults
  current source syntax cannot express.

## Completion Outputs

- Verified S121-S125 entry/dependency/disposition reconciliation and residual
  carry matrix.
- Completed `integrated-evidence-matrix.md` and `closeout-contract.md` with
  every required V0.20 stream, command, host, artifact/hash, raw status,
  retry, residual owner, and separate disposition.
- Builder evidence with final recommendation; separate Product Owner
  disposition for S126.
- Exact changed-path and preservation audit proving no unapproved product fix,
  release, package/version, or platform action occurred.
- No release/package/platform authority follows S126 closeout.