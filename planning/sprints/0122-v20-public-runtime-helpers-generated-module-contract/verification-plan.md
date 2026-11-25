# Sprint 122 Verification Plan

## Status

Architect-prepared candidate workflow. These commands do not authorize
execution. Before running any build/test/probe, obtain separate approval for
the exact worktree/baseline, changed files, fixture source, `dist` preservation,
output roots, retries, and cleanup policy.

## Preservation and Baseline

- Record branch, commit, dirty state, Windows/Bun/TypeScript versions, package
  lock state, `package.json` export map, and current `dist` file/hash manifest.
- Prefer an isolated worktree with an isolated `dist` tree. If the approved
  command writes to an existing `dist`, preserve and hash the tree first and
  restore it only under explicit approval; verify every original hash after
  restoration. Never clean shared output directories.
- Store new S122 logs, external fixture source, oracle results, manifests, and
  compile outputs under the approved S122 artifact root. Preserve S121 probe
  artifacts unchanged.
- No release/version/publication/deployment/installer/registry/certification
  command is run.

## Candidate Changed-Path Set

- Primary helper implementation: `src/transpilerRuntime.ts`.
- Potential shared-runtime refactor only by approved amendment:
  `src/runtime/measurement.ts`, `src/runtime/evaluateExpression.ts`,
  `src/runtime/standardLibrary.ts`, `src/runtime/inputData.ts`.
- Focused tests: `tests/modules.test.ts`, `tests/evaluator.test.ts`,
  `tests/measurements.test.ts`, `tests/inputData.test.ts`,
  `tests/measurementData.test.ts`.
- `package.json` is read-only for export verification unless a separately
  approved package-map defect amendment names an exact change. Package version
  changes remain out of scope.
- The standalone TS fixture, oracle, logs, manifests, and generated outputs are
  confined to separately approved S122 roots. No unrelated file is added to
  the changed-path set without amendment.

## Candidate Focused Checks

Run only the exact authorized subset, recording CWD and raw output for every
command. Candidate root checks:

```text
bun test tests/modules.test.ts tests/evaluator.test.ts tests/measurements.test.ts tests/inputData.test.ts tests/measurementData.test.ts
bunx tsc --noEmit
bun run build
git diff --check
```

The authorized selection may be narrower or add one directly relevant test
file. Do not silently run the full suite or unrelated desktop/release gates.

## Built-Package Consumer Check

After the approved isolated build, compile the separately authored consumer
fixture. Candidate command based on the S121 proof:

```text
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun <approved-fixture-entry.ts> <approved-fixture-oracle.ts>
bun run <approved-fixture-oracle.ts>
```

The fixture must import `openamx/transpiler-runtime` and relative `.ts` files
only as separately authorized. Record whether Bun resolves the package against
the isolated build, every compared value/error/view, and artifact hashes.
Do not claim generic Node or third-party runner compatibility from a Bun run.

## Package and Type Surface

- Inspect the built export target and `.d.ts` resolution using the same
  consumer fixture; assert `package.json` `bin.openamx` and wildcard fallback
  remain unchanged.
- Compile a strict type-only consumer that exercises every public type and
  helper overload. Record compiler version, flags, and diagnostics.
- Check declaration output for imports from private `src/runtime` modules or
  AST/checker/evaluator types. Any leaked private type blocks acceptance.
- Compare test and fixture IDs against `fixture-matrix.md`; record exact,
  approximate, and error comparisons separately.

## Raw Result Rules

- Raw statuses are only `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
- Preserve the first failure and every retry as a distinct run. Never replace
  a failed log with a later successful result.
- Root tests/build, package resolution, fixture compilation, fixture runtime,
  AMX parity, and preservation checks are distinct evidence rows.
- A V0.20-specific helper test does not imply full root/desktop/VS Code/native
  acceptance. No multi-file output rollback result is claimed in S122.