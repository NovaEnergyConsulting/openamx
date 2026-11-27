# Sprint 127 Verification Plan

## Status and Authorization

Architect-prepared candidate. The Product Owner approved the corrective plan
decisions on 2026-11-27, not implementation or command execution. Obtain
separate exact S127 execution authorization before the first edit or command.

## Baseline and Preservation Proposal

- Baseline commit: `08fbfa3592bc815e1a6617d3c003a468bd8da9a0` on
  `feat/create-V0.20.0`. The primary worktree contains authorized S126 planning
  and evidence changes; do not reset or discard them.
- Proposed validation worktree:
  `C:\Users\gamez\Programming\openamx-s127-validation-08fbfa3`, detached at
  the baseline and linked to existing root/desktop dependencies only under
  explicit approval.
- New evidence root:
  `planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/`.
- Capture full status, package/lock hashes, root `dist`, generated renderer,
  desktop `dist`, desktop `artifacts`/`test-results`, S121-S126 artifact
  hashes, and the S126 Measurement failure before execution.
- Preserve S126 raw evidence and `artifacts/run-01/` byte-for-byte. Preserve
  root `dist`, `src/renderer/diagramBrowserRuntime.ts`, desktop outputs, and
  all prior sprint evidence. Clean only uniquely created S127 roots after
  ownership and hashes are verified.

## Candidate Root Commands

Root CWD: repository root or the separately approved validation worktree.
Route generated fixture outputs through the S127 artifact root so the test
does not write into S123 artifacts:

```powershell
$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/generated-fixtures'
bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/transpilerGraph.test.ts tests/transpileCli.test.ts tests/examples.test.ts tests/modules.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/measurementData.test.ts
bunx tsc --noEmit
bun run build
git diff --check
```

The full root `bun test` aggregate is not part of the selected S127 matrix.
Any additional aggregate requires explicit approval.

## Generated Measurement Compile and Oracle

After the approved build, strictly compile the generated entry/dependencies
and separately authored oracle with TypeScript 5.9.3, ES2022, ESNext, strict
mode, bundler resolution, and `allowImportingTsExtensions`:

```text
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun <S127-artifact-root>/fixtures/oracle.ts <S127-artifact-root>/fixtures/generated/16_TypeScript_Transpilation.ts
bun run <S127-artifact-root>/fixtures/oracle.ts
```

The oracle must compare the same source graph and input through AMX and
generated `run(inputs)`, including the `averageSpeedResult` value, unit text,
and exported values. Generated code is not executed by CLI transpilation.
Compile failure is a raw `FAIL`; do not run the oracle after a failed compile
unless that separate action is explicitly included in the authorized plan.

## Expected Focused Evidence

- The exact S125/S126 imported `averageSpeed` graph strictly compiles.
- A unit imported without its base dimension name resolves to the same
  canonical vector-class brand as the dependency function signature.
- A derived dimension and equal-vector alias remain deterministic and
  compatible according to current AMX `sameVector` semantics.
- Generated oracle matches AMX for `45 kilometer_per_hour` and the selected
  exports. No generic full-G123 measurement claim is inferred.
- Existing transpiler golden, graph, CLI, runtime, measurement and
  measurement-data regressions pass in the approved focused selection.

## Raw Result and Stop Rules

- Raw statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
- No retry cap is set, per the Product Owner's sprint preference. Preserve
  every first failure and retry. Stop on a confirmed semantic defect, a
  failure of the canonical alias rule, or a need to change scope/API.
- A stop requires separate corrective/scope approval and a fresh acceptance
  cycle. It does not authorize continuing against the stop condition.
- Product Owner acceptance never changes historical raw statuses.
- No release, package/version, publication, deployment, distribution,
  installer, Marketplace/registry, native, or cross-platform certification
  command is run.