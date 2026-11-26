# Sprint 125 Handoff Prompt

You are the Builder for OpenAMX Sprint 125: Desktop TypeScript Export and
Documentation.

## Read First

- Repository instructions and user changes; current worktree/commit, generated
  output roots, and desktop test/harness availability.
- V20 master plan and S121-S124 canonical dispositions, Builder evidence, and
  residual matrices. Preserve S123 G123 incompletes and S123/S124 process
  FAILs.
- Every document in
  `planning/sprints/0125-v20-desktop-export-and-documentation/`.
- Current desktop patterns in shared RPC, job protocol/worker, service,
  `DesktopPicker`, `ExportDialog`, `App.vue`, `desktopWorkflow`, and current RPC/
  UI tests.
- Current S123 `transpileDocument` graph API, S124 `resolveTranspileGraph` and
  `writeTranspiledGraph` contracts, plus `docs/`, README, example index and
  existing module/library example.

## Authority and Entry Gate

- S121-S124 are accepted with recorded residuals. Preserve S123/S124 raw
  retry-process FAILs, all incomplete S123 G123 statuses, S124 cancellation/
  crash `NOT RUN`, D122-15 and D121-18. Do not upgrade any row by implication.
- This package is planning, not implementation authorization. Obtain exact
  Product Owner approval for baseline, changed files, worker result/payload
  limit, directory/overwrite behavior, commands, UI/native routes, artifact
  roots, `dist` preservation, retries/stop cap, and cleanup.
- Reconcile the exact S124 output-writer API and plan/commit handoff before
  coding. If an inspect/commit extension is necessary, name the exact API
  change and obtain approval before modifying it.

## Task Contract

- Add one dedicated TypeScript graph job through RPC, worker, service and UI.
  Capture active unsaved entry/dependency overlays and revisions; do not invoke
  the CLI as a subprocess or execute generated TypeScript.
- Select a graph output directory, prepare graph in worker, then have the
  service revalidate active/source/destination identity, confirm exact graph
  overwrite conflicts once, and commit using S124's writer.
- Keep cancellation before commit safe; once publication begins, show
  `committing` and report S124 per-path rollback outcomes without claiming
  crash atomicity.
- Add RPC/UI tests for success, cancel, stale source/dependency, overwrite,
  disk conflicts, output mutation, writer errors, multi-file output and
  open/reveal identity.
- Add `docs/language-spec-v0.20.md`, README navigation and a standalone
  runnable transpilation example. Keep historical specifications unchanged
  and exclude unsupported D122-15 enum-default parity.
- Complete verification/evidence matrices with raw status, failures/retries,
  artifacts, host classification, S123 residual carry and changed paths.

## Mandatory Boundaries

- No AMX syntax/runtime semantic change, emitter/helper implementation,
  S124 CLI/output-writer redesign, S126 integrated acceptance, rendering,
  release, package/version, publication, deployment, distribution, or
  certification work.
- Do not claim Vite UI harness evidence as native WebView acceptance. Record
  unavailable native/cross-platform routes explicitly.
- Do not overwrite output or existing test artifacts outside approved roots.
  Do not remove unrelated files or previous S121-S124 evidence.
- Do not promise graph crash atomicity; D121-18 remains in force.

## Completion

Meet `acceptance.md`, reconcile every `DX125-*` row and carried residual, and
submit an evidence-based Builder recommendation for separate Product Owner
disposition. S126 and all release/platform tasks remain independently gated.