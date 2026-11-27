# Sprint 126 Verification Plan

## Status and Authorization

Architect-prepared candidate workflow. It does not authorize execution. S126
requires separate Product Owner approval of baseline/worktree, exact commands,
output roots, artifact preservation, retry/stop policy, and any ledger
reconciliation before the first verification command.

## Entry Reconciliation

- Verify accepted S121-S124 dispositions and residuals from canonical ledgers
  and Builder evidence.
- S125 Builder evidence records the Product Owner disposition
  ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27, but canonical
  `state.md`, `decisions.md`, `STATUS.json`, and `ARCHITECT_BRIEFING.md` still
  identify S123 as current. Obtain/record explicit authorization to reconcile
  lifecycle ledgers before S126 execution. Preserve S125 evidence/artifacts.
- Carry S123/S124 process raw FAILs, every G123 incomplete status, G124 cancel/
  crash NOT RUN, S125 full desktop test FAIL, Hutch wrapper
  BLOCKED/UNAVAILABLE vs direct pinned check PASS, native/cross-platform
  BLOCKED/UNAVAILABLE, and Measurement probe FAIL as separate rows.
- Verify package/lock/version remains unchanged and S126 has no release,
  deployment or platform certification authority.

## Baseline and Preservation

Before running commands record:

- branch, commit, full dirty/untracked inventory, S125 implementation commit,
  user changes, and authorized worktree;
- OS/architecture, PowerShell, Bun, Node, Git, TypeScript, vue-tsc, Vite,
  Playwright/Chromium, Hutch and VS Code versions actually available;
- package manifests/lockfile/version, root `dist` manifest, generated renderer
  hash, desktop `dist`, desktop `artifacts`/`test-results`, S121-S125 artifact
  hashes and current G123/G124/G125 residual statuses;
- fresh S126 artifacts under
  `planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/` only.

Use an isolated worktree for commands that mutate generated/root/desktop
outputs, or preserve and restore under explicit approval. Do not clean existing
directories. Verify every restored path/size/hash. Preserve all first failures
and retries; no source/test/docs fixes are authorized by closeout.

## Candidate Root Checks

CWD: repository root. Execute only the separately approved set.

Focused integrated selection candidate:

```text
bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/transpilerGraph.test.ts tests/transpileCli.test.ts tests/examples.test.ts tests/modules.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/measurementData.test.ts
```

Additional gates, if approved:

```text
bun test
bunx tsc --noEmit
bun run build
git diff --check
```

Record exact pass/fail/assertion/file counts. A narrow suite does not replace
the full root aggregate. A discovered product defect stops closeout; preserve
the raw failure and request separate corrective scope.

## Example 16 and Generated Runtime

After the approved root build and only in the approved S126 artifact output:

```text
bun run src/cli.ts run examples/16_TypeScript_Transpilation.amx --input asset=examples/data/asset.json
bun run src/cli.ts transpile examples/16_TypeScript_Transpilation.amx --out-dir <S126-artifact-root>/example-16/generated
```

Then strictly compile generated entry/dependencies with TypeScript 5.9.3,
ES2022, ESNext, bundler resolution, `strict`, and approved
`allowImportingTsExtensions` settings; execute a separately authored oracle
fixture. Compare explicit exports and structured views against AMX runtime:
Asset/enum/input values, table/chart snapshots, diagram structured-v2 DTO,
event order, fresh run state, comments/frontmatter and helper imports.

Rerun the S125 Measurement probe from its retained source/output under a fresh
S126 artifact path only if that exact read-only compile/oracle check is
separately approved. Record the known TS2339/TS2322 failure unchanged if it
reproduces. No measurement emitter/runtime repair is allowed in S126.

Never execute generated TypeScript as part of CLI transpilation. Compile/run
checks are a separate acceptance harness.

## CLI and Graph Output

- Run nested module graph success and compare output-relative paths/bytes with
  the graph returned by S123 and desktop graph result for identical source.
- Verify malformed/type-invalid/missing/private/cyclic/escaping imports produce
  source diagnostics, nonzero exit, and no output files.
- Verify determinism, path/case/NFC collision, source-root alias, existing
  targets, `--overwrite`, unrelated-file preservation and compile of successful
  output graph.
- Inject stage/publish/rollback failures under unique temp roots; record each
  target's staged/published/restored/unrecovered status and hashes. Preserve
  D121-18 no-crash-atomicity limitation.

## Desktop Gates

CWD: `desktop-app`. Candidate commands, only if authorized:

```text
bun run typecheck
bun run test
bun run test:ui -- tests/ui/typescript-export.pw.ts --output=<S126-artifact-root>/playwright
```

S125’s `bun run typecheck` Hutch wrapper paused without a completion result;
its direct pinned `vue-tsc 2.2.12 --noEmit -p desktop-app/tsconfig.json`
passed. If the wrapper blocks again, record it as BLOCKED/UNAVAILABLE and keep
the direct check as a separate PASS.

S125’s full desktop `bun run test` failed on an unrelated report-export RPC
poll where `currentPdf.status` remained `running`. Rerun the exact suite and
retain the aggregate raw status; do not change unrelated timeouts/assertions.
The focused S125 worker/RPC suites passed independently.

The S125 Playwright Vite workflow harness passed 9 tests. It is not native
WebView evidence. Native WebView and macOS/Linux routes remain
BLOCKED/UNAVAILABLE unless a direct supported route is separately authorized
and proven.

## Docs, Host, and Aggregate Matrix

- Verify `docs/language-spec-v0.20.md`, README links and Example 16 against
  accepted S121-S125 decisions. Historical specs must be unchanged.
- Verify no package/version, CLI command contract, helper API, emitter, desktop
  source or spec drift appeared between approved commits other than S126
  evidence/ledger paths.
- Run every approved row from `integrated-evidence-matrix.md`; keep root tests,
  generated compile/run, CLI, desktop RPC, Vite UI, direct typecheck, configured
  typecheck, native/platform and artifact preservation distinct.
- Report source and measurement probe coverage holes as blockers/residuals; do
  not use acceptance disposition to upgrade raw statuses.

## Raw Result Rules

- Raw statuses are exactly `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and
  `NOT RUN`.
- Every retry has a new run ID and preserves the original output. Follow the
  approved retry/stop cap; stop at the cap and request a replan.
- Do not delete first failures, interrupted runs, S125 desktop failures,
  native-unavailable rows, incomplete G123 rows or output hashes.
- A Product Owner may accept/close with residuals only by naming them; this
  disposition never changes raw evidence.
- No release, package/version, deployment, distribution, installer,
  registry, native support or certification command is run.