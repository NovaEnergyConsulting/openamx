# Sprint 125 Requirements: V0.20 Desktop TypeScript Export and Documentation

## Document Status

Architect-prepared Sprint 125 package. It scopes the desktop export workflow,
additive V0.20 language specification, README navigation, and focused example
over the accepted core emitter, helper package, and S124 graph/CLI writer.
Preparing these documents does not authorize implementation, release,
publication, package/version changes, deployment, or platform certification.

## Goal

Make the accepted AMX-to-TypeScript graph export available from the active
desktop document with destination selection, job cancellation, stale-document
protection, overwrite confirmation, and safe multi-file output. Document the
V0.20 calculation/data contract additively and provide a focused runnable
example covering narrative comments, fences, imports, inputs, exports, and
structured shown views.

S125 adds no AMX syntax, CLI module graph behavior, report renderer, package
version, or release workflow.

## Authority and Inputs

- Confirmed V0.20 scope and S125 dependency:
  [`plan-openamxV20MasterSprintPlan.md`](../../plan-openamxV20MasterSprintPlan.md).
- S121 final feasibility closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-11-25; preserve D121-18 best-effort/non-crash-atomic multi-file rollback.
- S122 closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25;
  preserve D122-15 enum-default no-parity and S122 retry/stop-process residual.
- S123 closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-26.
  Preserve raw `S123-RETRY-STOP-01` process FAIL and all remaining G123
  `BLOCKED/UNAVAILABLE`/`NOT RUN` rows; desktop export and a runnable example
  do not upgrade full AST/helper/parity coverage.
- S124 closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-26 for
  graph resolution, safe output publication, and CLI. Preserve
  `S124-RETRY-STOP-01` raw FAIL; `G124-PUBLISH-CANCEL-01` and
  `G124-PUBLISH-CRASH-BOUNDARY-01` remain NOT RUN; D121-18 remains
  non-crash-atomic. Preserve S123 residuals carried through S124.
- Core API/graph output: `src/index.ts`, `src/transpiler/types.ts`,
  `src/transpiler/index.ts`, `src/transpiler/filesystemGraph.ts`, and
  `src/transpiler/outputWriter.ts`. CLI graph/output behavior is in
  `src/cli.ts` and S124 tests.
- Desktop patterns to reuse: `desktop-app/src/shared/rpc.ts`,
  `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`,
  `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`,
  `desktop-app/src/bun/index.ts`, and `desktop-app/src/mainview/App.vue`.
  Current destination picker is file-export oriented; job identity, source
  overlays/revisions, cancellation, stale-job invalidation, and guarded commit
  already exist.
- Documentation patterns: root `README.md`, `docs/language-spec-v0.19.md`,
  numbered/standalone `examples/`, and `desktop-app/README.md`.
- Package/helper contract: exact public runtime helper subpath is
  `openamx/transpiler-runtime`; package root `.` export was not added by S123.
  TypeScript 5.9.3 / ESM / ES2022 / ESNext / bundler and Bun 1.4.5 are the
  recorded implementation baseline; reverify at S125 execution.

## Entry Conditions

- Verify accepted S121-S124 dispositions and preserve every recorded residual
  and raw evidence status before implementation.
- Verify S123's actual `transpileDocument(TranspileGraphInput)` and S124's
  `resolveTranspileGraph`/`writeTranspiledGraph` API at the approved baseline.
  Do not depend on unreconciled draft signatures.
- Obtain separate Product Owner authorization for exact desktop/shared/source,
  documentation/example, test, artifact, output, and preservation paths,
  commands, retry/stop cap, destination behavior, and overwrite/cancel policy.
- Keep V0.20 product behavior fixed. Any semantic gap discovered in the
  incomplete S123 matrix is a blocker or separately authorized amendment, not
  a desktop workaround.

## In Scope

- Add a desktop `transpile`/TypeScript graph export job using the S124 parse-only
  graph resolver, S123 core API, and S124 safe graph writer.
- Add a directory destination selection and multi-file overwrite confirmation
  flow. Preserve native picker cancellation and ensure existing/unrelated
  files are not changed without explicit approval.
- Carry active document text plus open unsaved dependency overlays and source
  revisions into the job. Revalidate active identity, source revisions,
  project generation, disk conflicts, and destination state before commit.
- Add cancellation/superseded/failure states, progress, per-path writer
  diagnostics, success result with entry/output graph summary, and open/reveal
  behavior for the generated entry or output directory.
- Extend shared RPC/job protocol, worker validation/execution, service job
  lifecycle/commit, workbench action/menu/command entry, and focused RPC/UI
  tests according to approved paths.
- Add `docs/language-spec-v0.20.md` as an additive contract and link it from
  README navigation. Document typed inputs, exports, view DTOs including
  declaration-time diagrams, helper package requirement, ESM/compiler
  assumptions, source comments/frontmatter, graph paths, and no-rendering scope.
- Add one focused runnable example demonstrating narrative and executable
  fences, a local module import, caller-supplied inputs, explicit exports, and
  shown structured table/chart views plus declaration-time diagram data.
- Update desktop guide/help only where needed to explain the new export action
  and generated graph destination/runtime requirements.

## Out of Scope

- New AMX syntax, core emitter/helper semantics, S124 CLI/graph writer changes,
  report rendering from generated TypeScript, source maps, or desktop-native
  platform certification.
- Silently upgrading incomplete S123 G123 statuses or changing D122-15
  enum-default no-parity behavior.
- Strengthening D121-18 or S124's writer to crash-atomic multi-file
  publication. UI must report best-effort rollback states accurately.
- Package version, package-root `.` export, CLI release, publication,
  deployment, installer/distribution, Marketplace/registry, or certification.
- Historical specification rewrites or unrelated desktop cleanup.

## Contract Rules

- The desktop operation uses S124's complete graph input and S123 emitter; it
  does not invoke the CLI as a subprocess and does not execute generated code.
- Worker preparation and filesystem publication are distinct. A worker
  result is not success until the DesktopService revalidates current job and
  source identity and the safe graph writer completes.
- Destination is a graph root, not an individual `.ts` file. Module-relative
  paths returned by S123 are preserved below that root.
- Existing target overwrite is explicit. Confirmation covers the complete
  graph and target count/paths; no independent partial-file confirmation loop.
- Cancellation before the writer starts leaves destinations unchanged.
  Once synchronous multi-file publication begins, cancellation may be too
  late; preserve D121-18 best-effort rollback semantics and surface committing
  state rather than promising interruption.
- Active document and every source-overlay module are revision-checked. A
  stale job cannot publish. Recheck destination state after confirmation and
  before publication; a changed target fails closed.
- `result.exports`/`views` are data only. No HTML/PDF/DOCX rendering occurs.
- S123/S124 residuals remain separately recorded. Raw evidence statuses are
  not changed by S125 acceptance.

## Completion Outputs

- Desktop TypeScript export accessible from the active `.amx` workbench and
  command/menu entry, with tested success/cancel/stale/failure/overwrite flows.
- Shared RPC/job contract, worker, service writer integration, and UI tests
  with exact output graph evidence and per-path rollback result coverage.
- Additive `docs/language-spec-v0.20.md`, README navigation, and runnable
  example with only necessary support module/data files.
- Builder evidence with exact baseline/commands, raw results, artifacts/hashes,
  limitations, carried residuals, changed paths, and separate owner
  disposition.
- S126 integrated acceptance and all release/package/platform work remain
  separate. No such authority follows S125.