# Sprint 125 Acceptance Criteria

Sprint 125 is complete only when the desktop can safely export the current
active AMX source graph to TypeScript through the accepted S123/S124 pipeline,
with tested identity/cancellation/overwrite behavior, and V0.20's additive
specification/navigation/example are complete. S125 does not close V0.20 or
authorize release.

## Entry and Authority

- S121/S122/S123/S124 accepted dispositions are verified. Preserve all raw
  residuals: S123-RETRY-STOP-01 and S124-RETRY-STOP-01 remain FAIL accepted as
  process residuals; incomplete G123 rows remain BLOCKED/UNAVAILABLE or NOT
  RUN; G124 cancellation and crash-boundary rows remain NOT RUN; D122-15 and
  D121-18 remain unchanged.
- Exact S125 implementation/verification files, baseline, source/output roots,
  commands, destination/overwrite policy, payload cap, test harness, retry
  limit, and artifact preservation are separately authorized.
- No S125 run rewrites S121-S124 historical artifacts or upgrades those raw
  statuses.

## Desktop Workflow

- Active `.amx` export action is available in the agreed command/menu/UI
  surface and disabled for non-AMX documents or absent project context.
- Job captures the active document identity, current unsaved entry text, all
  open dependency overlays/revisions and project generation. It uses
  `resolveTranspileGraph`/`transpileDocument`, not the CLI subprocess or
  evaluator.
- Worker protocol validates operation-specific fields, module count/graph
  size, path bounds and result kind. A malformed/oversized graph fails before
  destination writes.
- Destination selection is a graph output directory. The output-relative
  source path mapping is preserved; unsafe/source-root destinations fail under
  S124 writer policy.
- After graph preparation, the service checks active identity, all source
  revisions/disk hashes, project generation, source conflict state and
  destination state. Stale/superseded jobs cannot publish.
- Existing graph-owned files require one explicit graph-level overwrite
  confirmation. Refusal/cancel leaves all targets unchanged; unrelated files
  are preserved. Target changes after confirmation are detected and fail
  closed before commit.
- Success publishes every graph file through `writeTranspiledGraph`, records
  module count/bytes and output identity, and supports open/reveal of the
  generated entry or selected graph directory as dispositioned.
- Worker/picker/confirmation cancellation before commit yields `cancelled`
  without writes. Once synchronous publication starts, UI reports `committing`
  and follows current noninterruptible-commit behavior.
- On write failure, per-path staged/published/restored/unrecovered status is
  visible to the user/diagnostics; no false success is returned. No crash-
  atomicity claim is made.
- Unsaved source and dependency buffers are transpiled as captured. A later
  edit, save conflict, project switch, or stale identity supersedes the job
  and prevents output commit.

## RPC, Worker, Service, and UI Tests

- RPC schema and contract tests cover operation, directory selection,
  overwrite decision, result shape, errors, cancellation, and malformed
  request rejection.
- Worker tests cover valid and invalid graph input, import/source overlays,
  bounded payload, helper resolution, and no generated-code execution.
- Service tests cover destination validation, active/dependency identity,
  stale document before/during worker, disk conflicts, overwrite refusal and
  acceptance, destination mutation after confirmation, atomic/rollback result,
  and open/reveal output identity.
- UI Playwright/Vite tests cover action discoverability/enabled state,
  directory selection/cancel, overwrite confirmation/cancel, progress,
  committing state, success module count, failure diagnostics, stale job, and
  open/reveal. Label Vite harness vs native evidence accurately.
- Multi-file output test checks all expected generated paths and bytes, not
  only entry `.ts` existence. Existing unrelated output files remain intact.

## Specification, README, and Example

- `docs/language-spec-v0.20.md` is additive and accurately documents:
  supported source comment/frontmatter behavior, typed `run(inputs)`, explicit
  exports, structured view DTOs and declaration-time diagrams, S122 helper
  subpath dependency, TypeScript module baseline/`.ts` import caveat, module
  graph mapping, no-rendering boundary, and S123/S124 CLI output semantics.
- README navigation links V0.20 spec, V0.20 transpilation example, and
  existing tooling docs without changing or removing historical spec links.
- A focused runnable example demonstrates narrative, executable fences,
  imported exported schema/value, caller-supplied input, explicit exports,
  shown table/chart snapshots, and declaration-time diagram DTO. It transpiles
  to the documented module graph and generated code compiles/runs against the
  public helper package for accepted source forms.
- Example data/defaults do not depend on D122-15 unsupported enum-valued
  record defaults; no parity claim is made for those forms.
- Historical specifications remain unchanged. No HTML/PDF/DOCX renderer is
  implied for generated TypeScript.

## Scope, Residuals, and Disposition

- Changed paths are limited to approved desktop/shared RPC/worker/service,
  focused tests, V0.20 spec/README/example/support files, and S125 evidence.
  No CLI/graph-writer/helper/emitter fix or unrelated desktop cleanup occurs.
- S123 incomplete G123 rows remain raw and visible. Example/test success does
  not represent complete AST acceptance.
- D121-18 remains best-effort and not crash-atomic even if injected rollback
  tests pass. G124 cancellation/crash tests remain NOT RUN unless separately
  included in the approved evidence plan.
- Builder recommendation and separate Product Owner disposition are recorded
  independently. No release, package/version, publication, deployment,
  distribution, native/platform, or certification authority follows S125.