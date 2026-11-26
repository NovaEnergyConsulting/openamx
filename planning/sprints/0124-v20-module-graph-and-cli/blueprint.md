# Sprint 124 Blueprint: V0.20 Module Graph and CLI

## Approach

1. Reconcile S121/S122/S123 owner dispositions. Preserve D121-18 rollback
   limitation, D122-15 enum-default no-parity, S122 retry residual, S123
   retry-cap `FAIL`, and incomplete G123 statuses.
2. Record the exact baseline, worktree, changed paths, output/temp roots,
   commands, overwrite policy, retry limit, failure-injection method, and
   artifact preservation before execution.
3. Audit the current S123 graph input/result types and current `moduleLoader`
   import rules. Reuse shared path/diagnostic utilities if available; do not
   call `loadEntryModule` because it evaluates AMX.
4. Finalize `graph-resolution-contract.md`: canonical identities, import
   parsing, source text retention, containment/cycle/export/type ordering,
   entry/import root, stable module IDs, and S123 graph adaptation.
5. Finalize `output-safety-contract.md`: output-root validation, mirrored
   `.ts` paths, platform/case collisions, staging, explicit overwrite,
   cancellation, best-effort rollback and per-path reporting under D121-18.
6. Finalize `cli-contract.md`: command syntax/options, exit codes, diagnostics,
   output reporting, no-input/no-execution semantics, and help text.
7. Complete `fixture-matrix.md` and `verification-plan.md` with stable graph,
   CLI, collision, overwrite/cancel, rollback/failure, deterministic-output,
   and compile cases. Carry every S123 incomplete G123 row explicitly; do not
   silently mark it as passed by CLI success.
8. Implement graph discovery as parse-only filesystem work that returns the
   accepted `TranspileGraphInput`; call `transpileDocument` once for the
   complete graph and publish only a successful `TranspileResult`.
9. Add the CLI command using existing `cac`/diagnostic conventions. Preflight
   all targets, stage output, publish graph, and implement D121-18 bounded
   rollback reporting without a crash-atomicity claim.
10. Run only approved focused tests, no-emit typecheck/build, generated graph
    compile, CLI failures, and output preservation checks. Record first
    failures/retries and each raw row independently.
11. Complete `builder-evidence.md` and submit for separate product-owner
    disposition. S125 remains separately gated.

## Decision Register

Candidate decisions for review before S124 execution. Confirmed V0.20 and
S121-S123 product-owner decisions remain authoritative.

| ID | Topic | Candidate disposition | Blocking owner |
| --- | --- | --- | --- |
| D124-01 | CLI syntax | `openamx transpile <entry.amx> --out-dir <directory>`; destination is required; optional `--import-root` defaults to entry directory. Do not add runtime `--input` because transpile does not execute. | S124 contract gate |
| D124-02 | Parse-only resolver | Use `parseDocumentText`/source reads to discover imports recursively; never call `loadEntryModule` or evaluate statements. Preserve original text per module. | S124 contract gate |
| D124-03 | Identity and root | Canonical `realpath` is graph identity; default import root is entry directory; explicit root follows existing loader containment and symlink rules. | S124 contract gate |
| D124-04 | Import rules | Require relative `./`/`../`, forward slashes, exact `.amx`; imports precede executable items; preserve `AMX5001/5002/5003` semantics and export visibility. | S124 contract gate |
| D124-05 | Output mapping | `relative(importRoot, realPath)` with only `.amx` -> `.ts`; POSIX separators; reject traversal/absolute output paths and collisions. | S124 contract gate |
| D124-06 | Overwrite | Refuse existing destination files by default; `--overwrite` is the explicit CLI confirmation. Cancel/refusal leaves existing graph unchanged. | Product owner / S124 |
| D124-07 | Publication protocol | Preflight then stage complete graph; publish only after S123 returns success. On write failure, attempt rollback and report each staged/published/restored/unrecovered path. | S124 contract gate |
| D124-08 | Atomicity boundary | Preserve D121-18: best-effort rollback only; no crash/power-loss atomicity guarantee. Do not claim two-phase transactional safety. | Product owner accepted D121-18 |
| D124-09 | Output root safety | Resolve output root, reject target symlink escape and any output that aliases source `.amx`; avoid overwriting unrelated files. | S124 contract gate |
| D124-10 | Case/platform collisions | Preflight normalized output paths and case-folded collisions independent of current host behavior; report all colliding sources/targets. | S124 contract gate |
| D124-11 | Error/status protocol | Preserve source-oriented AMX diagnostics; nonzero exit on failure; no successful output path in failed result. Reuse `AMX5001`-`5003`, `AMX6001`/`6002` only when semantically exact; allocate new codes if needed. | Lead Developer allocator |
| D124-12 | S123 residual carry | Keep G123 `BLOCKED/UNAVAILABLE`/`NOT RUN`, S123 retry-cap raw `FAIL`, D122-15 and S121 D121-18 visible. S124 does not upgrade emitter coverage. | S124 evidence owner |

## Source-Grounded Constraints

- S123 `transpileDocument` accepts `entryModuleId` and all source modules with
  `moduleId`, `sourcePath`, `outputPath`, `sourceText`, and
  `resolvedImports[]`; it returns all generated modules or diagnostics.
- S123 `prepareGraph` already validates in-memory module identities, output
  relative path shape, resolved-import mappings, reachability, and cycles, and
  computes dependency order/import specifiers. S124 must feed it canonical
  source modules and must not fork these validations unnecessarily.
- Existing `loadEntryModule` is unsuitable for transpile discovery because it
  evaluates modules after resolving/checking them. S124 needs a parse-only
  source resolver or a carefully isolated shared resolver with no evaluator.
- Existing loader: entry-directory import root by default; realpath canonical
  identity; root containment; relative `.amx` import syntax; import-before-code;
  source-order depth-first dependencies; explicit exports; inputs only in entry.
- Existing `src/cli.ts` uses `cac`, `AmxError`/`reportAmxError`, and `process.exit(1)`
  for failures. The CLI currently has `export`, `render`, and `run`; S124 adds
  only `transpile`.
- The accepted D121-18 rule requires reporting best-effort rollback outcomes;
  it does not promise atomicity on crash/power loss.

## Required Sprint Artifacts

- `requirements.md`, `blueprint.md`, `acceptance.md`.
- `graph-resolution-contract.md`, `output-safety-contract.md`,
  `cli-contract.md`.
- `fixture-matrix.md`, `verification-plan.md`, `builder-evidence.md`,
  `handoff-prompt.md`.

## Boundaries

- S124 owns filesystem graph resolution, safe graph publication, and CLI only.
  S125 owns desktop export, docs/spec/example. S126 owns integrated closeout.
- Do not silently absorb incomplete S123 G123 rows as passed. If an incomplete
  emitter behavior blocks a required graph case, stop and request a separately
  approved corrective scope or record the S124 row blocked.
- No release, package/version, renderer, desktop, docs/example, deployment,
  publication, installer, registry, or platform certification work.