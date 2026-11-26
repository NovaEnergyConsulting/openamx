# Sprint 124 Verification Plan

## Status and Authorization

Product Owner authorized the S124 scope, paths, commands, roots, overwrite
policy, failure-injection method, artifact root, and `dist` preservation on
2026-11-26. Baseline was the clean `feat/create-V0.20.0` worktree at
`e93c78daf8676eb6dbd7a536552c58a7bac9a747`.

The initial authorization specified two retries per failing slice. On
2026-11-26, the Product Owner removed that retry cap and authorized continued
sprint development as needed. Preserve the raw history: the writer-test slice
had three repair reruns before passing, exceeding the earlier cap by one. The
amendment does not erase the first failures, retry history, or process event.

## Entry Reconciliation

- Verified S121 final accepted/closed-with-residuals disposition and D121-18.
- Verified S122 accepted/closed-with-residuals disposition, D122-15, and its
  retry/stop-protocol residual.
- Verified S123 accepted/closed-with-residuals disposition, raw retry-cap FAIL,
  and every incomplete G123 status from the parity matrix/Builder evidence.
- Rechecked actual implementation commit, clean starting state, current S123
  API, package export map, and CLI entry before execution.

## Preservation and Host

- Windows, PowerShell 5.1.26100.9818, Bun 1.4.5, TypeScript 5.9.3,
  Git 2.56.1.windows.1; package version `0.19.0`, lockfile `bun.lock`.
- Baseline branch/commit: clean `feat/create-V0.20.0` at
  `e93c78daf8676eb6dbd7a536552c58a7bac9a747`. The worktree was clean before
  S124 artifacts and implementation changes were created.
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
- Approved S124 artifact root:
  `planning/sprints/0124-v20-module-graph-and-cli/artifacts/run-01/`.
  Focused tests created and removed only their uniquely named
  `%TEMP%\openamx-s124-graph-*` and `%TEMP%\openamx-s124-cli-*` trees.

## Approved Focused Checks

The focused command set and actual generated-graph compile were:

```text
bun test tests/transpilerGraph.test.ts tests/transpileCli.test.ts
bunx tsc --noEmit
bun run build
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0124-v20-module-graph-and-cli/artifacts/run-01/generated/main.ts
git diff --check
```

No full root/desktop/VS Code suite was run. The strict generated graph compile
is separate acceptance evidence; the CLI itself never compiles or executes
generated TypeScript.

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
  separate run rows. The Product Owner removed the S124 retry cap on
  2026-11-26; keep the prior capped-slice event and its raw history visible.
- A no-write test must compare destination manifests before and after; a
  rollback claim must compare each original target hash and list any
  unrecovered path.
- S124 cannot establish release, package, native/platform, desktop, S125 docs,
  or S126 integrated acceptance.

## Run-01 Results

Commands ran from `C:\Users\gamez\Programming\openamx`. Logs, generated
sources and build archives are under the approved `artifacts/run-01/` root.

| Run | Command / outcome | Raw status and artifact |
| --- | --- | --- |
| S124-TOOLS | `bun --version`; `bunx tsc --version`; `git --version` | PASS; Bun 1.4.5, TypeScript 5.9.3, Git 2.56.1.windows.1. |
| S124-FOCUSED-01 | `bun test tests/transpilerGraph.test.ts tests/transpileCli.test.ts` | PASS; 27 tests, 0 failures, 116 assertions. `logs/focused-tests-final.log`, SHA-256 `15FFA0E7F6BEC5C64026FF4A7158F67AAA65E9FB87C65DC03A2BF9EA900FB8A9`. |
| S124-TYPECHECK-01 | `bunx tsc --noEmit` | PASS; exit 0. `logs/typecheck-final.log`, SHA-256 `78E1EEFDD5B61C51D0683723752D200301095922E4BB612EA6DD3EA448D410BF`. |
| S124-CLI-SUCCESS-01 | `bun run src/cli.ts transpile planning/sprints/0124-v20-module-graph-and-cli/artifacts/run-01/fixtures/main.amx --out-dir planning/sprints/0124-v20-module-graph-and-cli/artifacts/run-01/generated --overwrite` | PASS; 2 modules, exit 0. `logs/cli-success-final.log`, SHA-256 `3BDF76F6D9E376EF4A306703CDDD7F70AA50263E1C3A8A3F5820C80127002916`. |
| S124-BUILD-02 | `bun run build` | PASS; exit 0, 228 files / 1,971,496 bytes. `logs/build-r02.log`, SHA-256 `C84063DBB1D69469C08FE0DB508903C5083F2F41ED3B917189D6141B4F73BB10`. |
| S124-GENERATED-COMPILE-01 | Strict compile command above, after root `dist` restoration | FAIL; exit 2 because `openamx/transpiler-runtime` was absent from the restored baseline. Preserved at `logs/generated-compile-final.log`, SHA-256 `ED7C9ECFBB301FA4D44358CA634AFFD1E91B6C5C7221F5A4CE329192EBDE9D56`. |
| S124-GENERATED-COMPILE-02 | Same strict command after `S124-BUILD-02`, before restoring root `dist` | PASS; exit 0, no diagnostics. `logs/generated-compile-r02.log`, SHA-256 `78E1EEFDD5B61C51D0683723752D200301095922E4BB612EA6DD3EA448D410BF`. |
| S124-PRESERVE-02 | Restore root `dist` and renderer; compare path/length/SHA-256 manifests | PASS; root `dist` restored to 196 files / 1,661,955 bytes; before/after manifest hashes both `8A1E6895D53DA16345C2FDC28C5BDF466EC35A8399A777B010B1BC30CF0E06A3`; renderer restored to `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. |
| S124-DIFF-CHECK | `git diff --check` | PASS; exit 0 with no diagnostics after final evidence edits. |

The run-01 artifact manifest contains 673 files and has SHA-256
`F1EA18D42001DBFBE378D44B7A65B30460B4F0500CAE3254F21B9B3352E898CF`.
It excludes itself. The `generated-dist/` and `generated-dist-r02/`
manifests match (SHA-256
`8422232CB6CE099FADACFF99A3E1A861DBD709C0DF6CB0DDC3FD3870C8F0284E`).