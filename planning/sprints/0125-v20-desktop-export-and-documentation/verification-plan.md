# Sprint 125 Verification Plan

## Status and Authorization

Product Owner authorized the exact S125 implementation and verification scope
on 2026-11-26. The approved decisions, changed-path allowlist, output/payload
limits, commands, artifact root, preservation, cleanup, and no-retry-cap policy
are recorded in `builder-evidence.md`. This plan records S125 only; S126 and
all release/platform tasks remain independently gated.

## Entry Reconciliation

- S121/S122/S123/S124 accepted dispositions and residuals verified from
  canonical state, decisions, parity matrices, and Builder evidence.
- `S122-RETRY-LIMIT-DEVIATION`, `S123-RETRY-STOP-01`, and
  `S124-RETRY-STOP-01` remain raw process FAILs with their accepted owner
  dispositions; no raw row is upgraded.
- Every G123 raw status is carried individually in Builder Evidence. G124
  `PUBLISH-CANCEL` and `PUBLISH-CRASH-BOUNDARY` remain NOT RUN. D121-18 and
  D122-15 remain unchanged.
- Actual S123/S124 APIs were reconciled. S125's approved exact extensions are
  `ResolveTranspileGraphOptions.entryText/sourceOverlay`,
  `inspectTranspiledGraphWrite`, and writer `expectedPlan` revalidation; no
  S124 CLI behavior was redesigned.

## Preservation and Baseline

- Baseline: clean `feat/create-V0.20.0` at
  `778504b50c1d8e8cf183e6920f95ad7b047f6069`; Windows PowerShell
  5.1.26100.9818; Bun 1.4.5; TypeScript 5.9.3; vue-tsc 2.2.12; Git
  2.56.1.windows.1; Node.js 24.13.1; package 0.19.0; lock `bun.lock`.
- Root `dist` baseline was 196 files / 1,661,955 bytes; desktop `dist` was 75
  files / 33,519,303 bytes. Generated renderer baseline SHA-256 is
  `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`.
- Use only `planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/`
  for new S125 artifacts. Preserve S121-S124 evidence and pre-existing
  `desktop-app/dist`, `desktop-app/artifacts`, and `desktop-app/test-results`.
  Final root/desktop dist manifests have zero differences; renderer is
  hash-identical to baseline.
- Graph output tests use unique temp projects and selected output roots. Record
  original target hashes and unrelated files before overwrite/failure tests.
- Store new S125 logs, screenshots, example transpile graphs, generated compile
  outputs and hash manifests only in the approved S125 artifact root.
- No release/package-version/publication/deployment/installer/registry/
  certification workflow is run.

## Executed Focused Checks

```text
root: `bun test tests/transpilerGraph.test.ts tests/transpileCli.test.ts tests/examples.test.ts`
root: `bunx tsc --noEmit`
root: `bun run build` (generated dist archived, then baseline restored)
root: `bun run src/cli.ts transpile examples/16_TypeScript_Transpilation.amx --out-dir planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/generated-supported`
root: `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/oracle.ts planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/generated-supported/16_TypeScript_Transpilation.ts`
root: `bun run planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/oracle.ts`
desktop-app: `bun test src/bun/jobWorker.test.ts`
desktop-app: `bun run tests/rpc-contract-check.ts`
desktop-app: pinned `vue-tsc` 2.2.12 direct entrypoint with `desktop-app/tsconfig.json`
desktop-app: `bun run test:ui -- tests/ui/typescript-export.pw.ts --output=../planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/playwright`
root: `git --no-pager diff --check`
```

The configured `bun run typecheck` wrapper blocked at Hutch's update prompt;
the directly invoked pinned typechecker passed. The full desktop `bun run
test` unit portion passed, but its unrelated report-export RPC poll repeatedly
failed when `currentPdf` remained `running` beyond the existing polling
window. The final focused S125 RPC suite passed independently. The final
Playwright suite is Vite/browser-harness evidence only; native WebView and
cross-platform routes are `BLOCKED/UNAVAILABLE`.

## Desktop Graph Workflow Evidence

- RPC schema compatibility, worker request bounds, graph result exact-size
  validation and failure diagnostics: PASS in worker/RPC suites.
- Active source overlay includes unsaved entry and imported dependency text;
  no temporary source writes occur.
- Job identity checks cover active URI/revision, project generation, input
  settings revision, imported source revisions/disk hashes, active/dependency
  staleness, cancellation, supersession, malformed worker results, and output
  destination mutation.
- Directory picker cancellation, graph-wide overwrite/refusal, unrelated file
  preservation, changed destination after approval, safe output-root
  validation and exact module output paths.
- S124 writer stage/publish/rollback injected failures compare original
  targets and unrelated files; S125 service reports staged/restored and
  unrecovered states without success-shaped results.
- Output IDs open/reveal only registered graph output; stale/unknown ID rejects.
- Native desktop/WebView route is `BLOCKED/UNAVAILABLE` unless direct
  authorized native evidence exists. Do not equate Vite/UI harness pass with
  native platform acceptance.

## Docs and Example Evidence

- Validate V0.20 README/spec/example links; historical specs are unchanged.
  Cross-check contract statements against accepted decisions and actual CLI/
  helper APIs.
- Run Example 16 through AMX parse/check/format/runtime, CLI transpile, strict
  generated TypeScript compile, and generated `run(inputs)` execution using
  the documented typed `Asset` value.
- Compare exports and structured views with AMX runtime only for accepted
  expressible source behavior. Do not assert D122-15 enum-default parity.
- Verify generated comment fidelity for prose, fences, frontmatter and literal
  interpolation; include all relevant E123 source-fidelity residual statuses.

## Raw Result Rules

- Use only `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` for raw rows.
- No retry cap was authorized. Preserve every first failure and rerun outcome;
  do not suppress a failure because a later rerun passed.
- Distinguish root/helper tests, RPC contract, desktop typecheck, Vite UI,
  native desktop, documentation, example transpile/compile/run, output safety,
  and preservation evidence.
- No S125 evidence closes S126 integrated acceptance or release/platform work.