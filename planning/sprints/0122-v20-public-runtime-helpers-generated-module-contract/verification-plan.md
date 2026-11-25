# Sprint 122 Verification Plan

## Status

Execution authorized by the product owner on 2026-11-25 for the exact baseline,
paths, commands, fixture/oracle sources, isolated build worktree, artifact
root, retry limit, and cleanup policy recorded here. No S122 build, test, or
consumer probe was run outside the approved roots. The approved focused suite,
isolated build, strict external compile, and AMX oracle have now completed;
see Run-01 Results and `builder-evidence.md`.

## Preservation and Baseline

- Approved baseline: clean `feat/create-V0.20.0` at
  `70f7e52aca9b82407183ec3ebf9e51fabb54d8da`; Windows PowerShell 5.1; Bun
  1.4.5; TypeScript 5.9.3; Git 2.56.1.windows.1; package version `0.19.0`;
  tracked lockfile `bun.lock`.
- Root `dist/` had 196 files / 1,661,955 bytes. The exact pre/post
  path/count/length/SHA-256 manifests match; both manifest hashes are
  `7da40657368407a6fb534e925a4a2c63bf2a94067cfd5816a253dc7108b6e7fa`.
- Build only in the newly created detached worktree
  `C:\Users\gamez\Programming\openamx-s122-build-70f7e52` at the approved
  commit. Link that worktree's `node_modules` to the existing root
  `node_modules` with a junction. Copy only approved S122 changes and fixture
  sources into it. If the exact worktree or junction path already exists,
  stop without overwriting or removing it.
- Store new S122 logs, external fixture source, oracle results, manifests, and
  compile outputs under
  `planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/artifacts/run-01/`.
  Preserve S121 probe artifacts unchanged.
- After the isolated build and consumer checks, hash root `dist/` again and
  require identical paths, count, lengths, and hashes. Never move, overwrite,
  restore, or clean the shared root `dist/` tree.
- No release/version/publication/deployment/installer/registry/certification
  command is run.

## Approved Changed-Path Set

- Primary helper implementation: `src/transpilerRuntime.ts`.
- Shared evaluator seam, only to make existing evaluator execution delegate to
  the same operator/builtin behavior: `src/runtime/evaluateExpression.ts`.
- Focused tests: `tests/modules.test.ts`, `tests/evaluator.test.ts`,
  `tests/measurements.test.ts`, `tests/inputData.test.ts`,
  `tests/measurementData.test.ts`.
- Separately authored consumer and AMX oracle:
  `planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/artifacts/run-01/fixtures/main.ts`
  and `oracle.ts`.
- Evidence files: this `verification-plan.md` and `builder-evidence.md`.
- Approved lifecycle/contract reconciliation paths: S121 `acceptance.md` and
  `builder-evidence.md`; S122 `blueprint.md`, `runtime-api-contract.md`,
  `input-validation-contract.md`, `view-dto-contract.md`, and `acceptance.md`;
  `planning/decisions.md`, `planning/state.md`, `planning/STATUS.json`, and
  `planning/ARCHITECT_BRIEFING.md`.
- `package.json` is read-only for export verification unless a separately
  approved package-map defect amendment names an exact change. Package version
  changes remain out of scope.
- The standalone TS fixture, oracle results, logs, manifests, and generated
  outputs are confined to the separately approved S122 artifact root. The
  build regenerated `src/renderer/diagramBrowserRuntime.ts` only in the
  isolated worktree; it was not copied into the primary worktree and will be
  removed with the isolated worktree, which is now removed. Root
  `node_modules` and expected package directories remain present. No unrelated
  primary path was changed.

## Approved Focused Checks

The following exact approved root checks ran from
`C:\Users\gamez\Programming\openamx`:

```text
bun --version
bunx tsc --version
git --version
bun test tests/modules.test.ts tests/evaluator.test.ts tests/measurements.test.ts tests/inputData.test.ts tests/measurementData.test.ts
bunx tsc --noEmit
git diff --check
```

`bun run build` and the external fixture checks ran only with
`C:\Users\gamez\Programming\openamx-s122-build-70f7e52` as CWD. No full root
suite, desktop/VS Code suite, release gate, or unrelated test command ran.

## Built-Package Consumer Check

The consumer imports only `openamx/transpiler-runtime`; the separate oracle
imports `loadEntryModule` as the AMX reference.

```text
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/artifacts/run-01/fixtures/main.ts planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/artifacts/run-01/fixtures/oracle.ts
bun run planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/artifacts/run-01/fixtures/oracle.ts
```

The fixture must import `openamx/transpiler-runtime` and relative `.ts` files
only from the consumer, while the reference oracle uses the separately
authorized AMX loader. Bun resolves the package against the isolated build;
compared values/errors/views and hashes are preserved in run-01 artifacts.
Do not claim generic Node or third-party runner compatibility from a Bun run.

## Run-01 Results

| Check | CWD | Raw status and result |
| --- | --- | --- |
| Focused tests | Repository root | PASS; 206 tests, 0 failures, 1,107 assertions across the five approved files. |
| Root no-emit typecheck | Repository root | PASS; `bunx tsc --noEmit`, exit 0. |
| Isolated package build | Detached worktree | PASS; `bun run build`, exit 0. No primary `dist/` path was written. |
| Strict consumer compile | Detached worktree | PASS; exact ES2022/ESNext/bundler/strict command above, exit 0. |
| Consumer/oracle execution | Detached worktree | PASS; exports, table/chart/diagram views and ordering match; 3 enum input errors, 2 top-level input errors, fresh result state, and affine diagnostic match. |
| Enum-default oracle subcase | Detached worktree | BLOCKED/UNAVAILABLE by product-owner disposition; existing AMX checker rejects enum-valued field defaults. No semantics changed. |
| Public declaration audit | Detached worktree | PASS; no `any` or private engine type leaks. |
| Root `dist` preservation | Repository root | PASS; exact 196-file path/length/hash manifests match before and after. |
| `git diff --check` | Repository root | PASS; no whitespace errors. |

Artifacts: `dist-before.csv`, `dist-after.csv`, `dist-after-final-r03.csv`,
`built-dist-manifest-final-r03.csv`, `oracle-result-final-r03.json`, raw final
test/oracle logs, and the separately authored fixture sources are in the
approved `artifacts/run-01/` root. Final hashes are recorded in
`builder-evidence.md`.

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
- At most two focused repair attempts are authorized per validation failure.
  Each retry reruns only the same gate; stop after the second failed repair or
  immediately when an AMX semantic mismatch is found.
- Root tests/build, package resolution, fixture compilation, fixture runtime,
  AMX parity, and preservation checks are distinct evidence rows.
- A V0.20-specific helper test does not imply full root/desktop/VS Code/native
  acceptance. No multi-file output rollback result is claimed in S122.