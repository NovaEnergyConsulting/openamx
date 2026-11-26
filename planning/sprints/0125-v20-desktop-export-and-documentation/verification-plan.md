# Sprint 125 Verification Plan

## Status and Authorization

Architect-prepared candidate workflow. It does not authorize implementation
or execution. Obtain separate approval for exact baseline/worktree, changed
paths, commands, desktop harness, native host availability, output/staging
roots, destination/overwrite/failure-injection tests, retry cap, preservation,
and cleanup before running checks.

## Entry Reconciliation

- Verify accepted S121-S124 closeouts in canonical state/decision records and
  their Builder evidence.
- Preserve S123-RETRY-STOP-01 and S124-RETRY-STOP-01 as raw process FAILs with
  accepted residual dispositions.
- Preserve incomplete S123 G123 statuses; preserve S124 cancellation and
  crash-boundary NOT RUN; preserve D121-18, D122-15 and S122 retry residual.
- Verify actual S124 writer/graph API, current S123 core API, package exports,
  and active-buffer source overlay behavior at the authorized baseline.

## Preservation and Baseline

- Record branch/commit/dirty status, user changes, Windows/Bun/TypeScript/Git
  versions, package version/lock, root `dist` manifest, renderer generated
  source hash, desktop test output roots and existing UI/build artifacts.
- Use approved isolated build/output roots. Preserve S121-S124 artifacts and
  pre-existing desktop/Playwright outputs. Never clean shared directories.
- Graph output tests use unique temp projects and selected output roots. Record
  original target hashes and unrelated files before overwrite/failure tests.
- Store new S125 logs, screenshots, example transpile graphs, generated compile
  outputs and hash manifests only in the approved S125 artifact root.
- No release/package-version/publication/deployment/installer/registry/
  certification workflow is run.

## Candidate Focused Checks

Run only the exact separately approved selection. Candidate commands:

```text
root: bun test tests/transpilerGraph.test.ts tests/transpileCli.test.ts tests/examples.test.ts
desktop-app: bun run typecheck
desktop-app: bun run test
desktop-app: bun run test:ui -- tests/ui/typescript-export.pw.ts --output=<approved S125 root>
root: bunx tsc --noEmit
root: bun run build
git diff --check
```

Use actual scripts/package names after read-only audit; commands above are
candidates, not authorization. Run the existing RPC contract harness using
its configured script and label Vite workflow-harness UI separately from
native WebView evidence.

## Desktop Graph Workflow Evidence

- RPC schema compatibility, worker request bounds, graph result bounds and
  failure diagnostics.
- Active source overlay includes unsaved entry and imported dependency text;
  no temporary source writes occur.
- Job identity checks cover active URI/revision, project generation, input
  settings revision, imported source revisions/disk hashes, cancellation,
  supersession and destination change.
- Directory picker cancellation, graph-wide overwrite/refusal, unrelated file
  preservation, changed destination after approval, safe output-root
  validation and exact module output paths.
- S124 writer stage/publish/rollback injected failures; compare every original
  target/unrelated-file hash and assert the S125 result reports exact
  staged/published/restored/unrecovered states.
- Output IDs open/reveal only registered graph output; stale/unknown ID rejects.
- Native desktop/WebView route is `BLOCKED/UNAVAILABLE` unless direct
  authorized native evidence exists. Do not equate Vite/UI harness pass with
  native platform acceptance.

## Docs and Example Evidence

- Validate all README/spec/example relative links; historical specs are
  unchanged. Check S125 spec claims against accepted decisions and actual CLI/
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
- Preserve first failures, all retries and retry-cap stops. Follow the exact
  approved cap; reaching it stops execution pending replan.
- Distinguish root/helper tests, RPC contract, desktop typecheck, Vite UI,
  native desktop, documentation, example transpile/compile/run, output safety,
  and preservation evidence.
- No S125 evidence closes S126 integrated acceptance or release/platform work.