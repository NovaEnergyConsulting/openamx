# Sprint 124 Verification Plan

## Status and Authorization

Architect-prepared candidate workflow. It does not authorize implementation or
execution. Before running any build, test, CLI workflow or failure injection,
obtain explicit Product Owner approval for baseline/worktree, changed paths,
exact commands, import/output/temp roots, overwrite policy, retry cap,
rollback injection, artifact roots, `dist` preservation and cleanup.

## Entry Reconciliation

- Verify S121 final accepted/closed-with-residuals disposition and D121-18.
- Verify S122 accepted/closed-with-residuals disposition, D122-15, and its
  retry/stop-protocol residual.
- Verify S123 accepted/closed-with-residuals disposition, raw retry-cap FAIL,
  and every incomplete G123 status from the parity matrix/Builder evidence.
- Recheck actual implementation commit, dirty state, current S123 API, package
  export map, and CLI entry before execution.

## Preservation and Host

- Record OS/host, PowerShell/Bun/TypeScript/Node/Git versions, branch/commit,
  clean/dirty state, package version/lock status, and changed-path inventory.
- Prefer isolated build/worktree roots. Preserve root `dist`, generated
  renderer runtime `src/renderer/diagramBrowserRuntime.ts`, existing test output
  directories, and all S121-S123 artifacts. Any build that may regenerate
  renderer or `dist` requires pre/post path/length/SHA-256 manifests and
  explicit restore approval.
- Use a unique temporary filesystem root for graph/CLI tests. Delete only
  paths created by the approved test and verify exact path ownership before
  cleanup. Preserve first failures and each retry.
- Store test graphs, output graphs, stage/backup logs, manifests and raw command
  output under the approved S124 artifact root.

## Candidate Focused Checks

Exact authorized set may differ after repository test audit. Candidates:

```text
bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/modules.test.ts tests/transpileCli.test.ts
bunx tsc --noEmit
bun run build
<strict TypeScript compile of a successful generated graph using TS 5.9.3 and approved .ts import settings>
git diff --check
```

Do not silently run the full root/desktop/VS Code suites. Do not execute
generated TypeScript from the CLI command; generated graph compilation is an
explicit test-only step.

## Graph/CLI Evidence

- Verify parse-only graph construction returns the exact S123
  `TranspileGraphInput` mappings and dependency order.
- Verify existing AMX module path rules: canonical realpath, default/explicit
  import root, containment, symlink escape, relative syntax, import ordering,
  cycles, entry-only inputs, duplicate/local collisions, and export visibility.
- Verify stable `.amx` -> `.ts` mirroring, relative import specifiers,
  deterministic module IDs/output manifest, normalized/case-fold collisions,
  output root escape, file/directory conflicts and source alias rejection.
- Verify `--out-dir` required, default refusal on existing targets,
  `--overwrite` exact graph-only replacement, unrelated file preservation,
  cancellation, no writes for invalid graph/preflight, and nonzero error exit.
- Inject staging/publish/rollback failures under approved temp roots. Record
  raw failure, per-path staged/published/restored/unrecovered state, hashes,
  and cleanup. Do not claim crash-atomicity under D121-18.
- Compile a successful nested graph with the accepted compiler and verify the
  public helper package resolves. Record generated-code TypeScript compile
  separately from CLI transpile.
- Carry all S123 incomplete G123 statuses and S123-RETRY-STOP-01 as separate
  evidence; do not mark them PASS from S124 coverage.

## Raw Result Rules

- Use only `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
- Preserve every first failure, retry and interrupted/unavailable command as
  separate run rows. Follow the separately approved retry/stop cap.
- A no-write test must compare destination manifests before and after; a
  rollback claim must compare each original target hash and list any
  unrecovered path.
- S124 cannot establish release, package, native/platform, desktop, S125 docs,
  or S126 integrated acceptance.