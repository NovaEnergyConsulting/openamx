# Sprint 127 Builder Evidence: V0.20 Measurement Type Identity Correction

## Status

S127 implementation and verification were authorized by the Product Owner in
this conversation. The narrow graph-wide Measurement identity correction and
its focused acceptance checks are complete. S125/S126 raw Measurement failures
and all unrelated residuals remain unchanged.

**Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for the approved
S127 Measurement identity correction. The retained imported `averageSpeed`
graph strictly compiles and matches AMX for its exports, value, and display
unit. The adjacent alias cases also pass.

**Separate Product Owner disposition:** ACCEPTED/CLOSED WITH RECORDED
RESIDUALS on 2026-11-27.

## Baseline and Authorization

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S126 disposition | `BLOCKED/OPEN`; S126 Measurement `TS2345` and all residuals preserved. | PASS |
| Approved code baseline | Source baseline `08fbfa3592bc815e1a6617d3c003a468bd8da9a0` on `feat/create-V0.20.0`. Active clean checkout was `34c906c8ff87549c4bce03f320610ca05e03be1b`, which adds only S126 evidence and S127 planning since the code baseline; no source/test paths differed before S127 edits. | PASS |
| Primary/validation worktree | Commands ran from `C:\Users\gamez\Programming\openamx`, repository root. No detached validation worktree was used; S126 planning/evidence and historical artifacts were preserved. | PASS |
| Changed-path allowlist | `src/transpiler/emit.ts`, `src/transpiler/index.ts`, `tests/transpiler.test.ts`, and S127 `artifacts/run-01/` plus this evidence file only. | PASS |
| Host/tool versions | Windows PowerShell 5.1; Bun 1.4.5; TypeScript 5.9.3. | PASS |
| Artifact/output roots | Generated tests and command logs are under S127 `artifacts/run-01/`. `OPENAMX_S123_ARTIFACT_ROOT` was set to S127 `generated-fixtures/`. | PASS |
| Preservation | Root `dist` baseline was 228 files with manifest SHA-256 `02451B909FE58603D8550141F0D8D87065DC53C28C5A9A03A6C781DB0FB3E1E3`; restored manifest hash is identical and both restore deltas are 0. Renderer baseline/restored SHA-256 is `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. Desktop outputs and S121-S126 artifacts were not modified. | PASS |
| Retry, cleanup, and disposition | No retry cap; failures/retries retained. Only build outputs in `dist` and the generated renderer were restored from S127 backups. No S127 artifacts or historical paths were cleaned. Product Owner disposition remains separate and pending. | PASS |

## Implementation

- `measurementVectorKey` sorts vector entries before serialization.
- The core facade gathers prepared `DimensionMetadata` and chooses a
  deterministic representative by output-relative `moduleIdentity`, then
  `declarationName`. The canonical brand serializes that representative;
  emitter fallback remains deterministic when no graph dimension matches.
- Every module emitter receives the same graph-wide mapping. Equal-vector
  aliases therefore share a generated brand, while distinct vectors remain
  distinct. Generated identities contain no absolute checkout root and do not
  depend on module traversal order.
- No S122 helper/API, checker semantics, CLI, desktop, package, docs, or example
  source was changed.

## Command Ledger

| Run ID | Exact command/action and CWD | Result / artifact / hash | Raw status |
| --- | --- | --- | --- |
| S127-TRANSPILER-01 | `bun test tests/transpiler.test.ts`; repository root, S127 fixture override. | First run: 11 passed / 3 failed. Exposed a still-used `sameVector` helper and invalid absolute-root fixture comparison. Raw output: `logs/S127-ROOT-FOCUSED-01-FIRST-FAILURE.log`. | FAIL; retained |
| S127-TRANSPILER-02 | Same focused command after local repair; repository root. | 13 passed / 1 failed. Existing test expected the old name-only brand; updated to the canonical output-relative module/declaration identity. Raw output: `logs/S127-ROOT-FOCUSED-02-FIRST-FAILURE.log`. | FAIL; retained |
| S127-TRANSPILER-03 | Same focused command after assertion repair; repository root. | 14 passed / 0 failed, 65 expectations. Final focused run below also covers this slice. | PASS |
| S127-ROOT-FOCUSED-01 | Approved ten-file `bun test` selection; repository root. | 330 passed / 0 failed across 10 files. Raw output: `logs/S127-ROOT-FOCUSED-01.log`. | PASS |
| S127-TRANSPILER-04 | `bun test tests/transpiler.test.ts`; repository root, S127 fixture override. | 15 passed / 0 failed. Captures: `logs/S127-TRANSPILER-04.stdout.log` and `.stderr.log`. | PASS |
| S127-ROOT-FOCUSED-02 | Approved ten-file `bun test` selection after retained graph fixture; repository root. | 331 passed / 0 failed across 10 files. Captures: `logs/S127-ROOT-FOCUSED-02.stdout.log` and `.stderr.log`. | PASS |
| S127-ROOT-TYPE-01 / 02 | `bunx tsc --noEmit`; repository root, before/after retained fixture. | Both exited 0. Final captures: `logs/S127-ROOT-TYPE-02.*.log`. | PASS |
| S127-ROOT-BUILD-01 | `bun run build`; repository root, PowerShell pipeline capture. | PowerShell returned exit 1 on Bun's stderr/script banner. Raw first attempt: `logs/S127-ROOT-BUILD-01.log`. | FAIL; retained |
| S127-ROOT-BUILD-02 / 03 | `bun run build` with stdout/stderr redirected separately; repository root. | Both exited 0. Build 03 supplied helper package for retained graph compile. Captures: `logs/S127-ROOT-BUILD-02.*.log`, `logs/S127-ROOT-BUILD-03.*.log`. | PASS |
| S127-GENERATED-COMPILE-01 | Strict TS 5.9.3 compile of alias fixture and separate oracle using ES2022, ESNext, bundler resolution, strict mode, `allowImportingTsExtensions`, Bun types. | Exit 0; `measurement-identity/` graph compiled. Captures: `logs/S127-GENERATED-COMPILE-01.*.log`. | PASS |
| S127-GENERATED-ORACLE-01 | `bun run .../measurement-identity/oracle.ts`; repository root. | Exit 0; both generated exports matched AMX: 45 `kilometer_per_hour` and 45 `kilometer_per_hour_alias`. Captures: `logs/S127-GENERATED-ORACLE-01.*.log`. | PASS |
| S127-GENERATED-COMPILE-02 | Same strict compile settings for retained three-module S125 probe and separate oracle. | Exit 0; retained `measurement-identity-retained/` graph compiled. Captures: `logs/S127-GENERATED-COMPILE-02.*.log`. | PASS |
| S127-GENERATED-ORACLE-02 | `bun run .../measurement-identity-retained/oracle.ts`; repository root. | Exit 0; AMX parity for exports, asset `North Pump 01`, Measurement value 45, display unit `kilometer_per_hour`. Raw JSON: `logs/S127-GENERATED-ORACLE-02.stdout.log`. | PASS |
| S127-DIFF-CHECK | `git diff --check`; repository root. | No whitespace errors. | PASS |
| S127-PRESERVE-01 / 02 | SHA-256 manifest and backup/restore for root `dist` and renderer; repository root. | Baseline `dist`: 228 files. Build changed 14 manifest entries; both restore deltas were 0. Renderer restored to SHA-256 `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. Evidence: `artifacts/run-01/preservation/`. | PASS |

## Exact Command/CWD Matrix

Every command below ran from `C:\Users\gamez\Programming\openamx` (repository root). Bun was 1.4.5 and TypeScript was 5.9.3.

```powershell
$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/generated-fixtures'; bun test tests/transpiler.test.ts
$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/generated-fixtures'; bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/transpilerGraph.test.ts tests/transpileCli.test.ts tests/examples.test.ts tests/modules.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/measurementData.test.ts
bunx tsc --noEmit
bun run build *>&1 | Tee-Object -FilePath 'planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/logs/S127-ROOT-BUILD-01.log'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
bun run build > 'planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/logs/S127-ROOT-BUILD-02.stdout.log' 2> 'planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/logs/S127-ROOT-BUILD-02.stderr.log'; $buildExit=$LASTEXITCODE; if ($buildExit -ne 0) { exit $buildExit }
bun run build > 'planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/logs/S127-ROOT-BUILD-03.stdout.log' 2> 'planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/logs/S127-ROOT-BUILD-03.stderr.log'; $buildExit=$LASTEXITCODE; if ($buildExit -ne 0) { exit $buildExit }
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/generated-fixtures/measurement-identity-retained/oracle.ts planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/generated-fixtures/measurement-identity-retained/generated/16_TypeScript_Transpilation.ts
bun run planning/sprints/0127-v20-measurement-type-identity-correction/artifacts/run-01/generated-fixtures/measurement-identity-retained/oracle.ts
git diff --check
```

The adjacent alias fixture compile/oracle pair is separately recorded as
`S127-GENERATED-COMPILE-01` / `S127-GENERATED-ORACLE-01`.
The recursive S127 artifact manifest excludes itself and records 282 files,
2,611,421 bytes, SHA-256
`0A7575229153AC66E387FF610A918D58FF2572BE31B10B34D15D4A924F9D5B2A`.

## Reconciliation

| Evidence group | Required result | Raw status |
| --- | --- | --- |
| S127-IDENTITY | One deterministic brand per checker-compatible Measurement vector class across modules; root and traversal-order comparison. | PASS |
| S127-REPRO | Retained imported `averageSpeed` graph strictly compiles. | PASS |
| S127-PARITY | Generated Measurement exports and display units match the separate AMX oracle. | PASS |
| S127-ADJACENT | Imported base dimensions omitted at call site, derived `Speed`, equal-vector `SpeedAlias`, unit alias, and distinct vector identities. | PASS |
| S127-RESIDUALS | S125/S126 raw Measurement failures and unrelated G123/G124 residuals remain unchanged. | PASS |
| S127-SCOPE | Changes limited to approved emitter/wiring/tests and S127 evidence/artifacts; no helper/API/checker/CLI/desktop/docs/example or release changes. | PASS |

## Failures, Limitations, and Residuals

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S125-MEASUREMENT-PROBE-01 | FAIL | Original S125 TS2339/TS2322 output remains unchanged. | Transpiler/emitter owner. | Accepted S125 residual; raw status preserved. |
| S126-MEASUREMENT-COMPILE-01 | FAIL | S126 TS2345 output remains unchanged. | Transpiler/emitter owner. | S126 remains BLOCKED/OPEN; raw status preserved. |
| S127-TRANSPILER-01 / 02 | FAIL; corrected locally | Initial test failures and passing follow-ups are recorded in the command ledger and `artifacts/run-01/logs/`. | Builder implementation/test slice. | No remaining failure after same-slice repairs. |
| S121-D121-18 | Accepted residual | Best-effort rollback is not crash-atomic. | Graph output owner. | Unchanged; outside S127. |
| S122-D122-15 | Accepted residual | No AMX parity claim for unexpressible enum-valued record defaults. | Product Owner. | Unchanged; outside S127. |
| G123/G124 residuals | BLOCKED/UNAVAILABLE or NOT RUN, individually as recorded by S123/S124/S126. | No broad Measurement, G123, G124, or V0.20 parity claim is made. | Existing residual owners. | Unchanged; outside S127. |
| S125 desktop/native residuals | S125 desktop aggregate FAIL; Hutch wrapper and native/platform statuses remain as recorded. | No desktop, native, or platform checks were run. | Existing residual owners. | Unchanged; outside S127. |

## Recommendation and Disposition

- **Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for the narrow
  S127 identity correction. The retained graph compiles and matches AMX; the
  remaining G123 and integrated V0.20 gaps are not closed by this work.
- **Product Owner disposition:** ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-11-27; the raw S125/S126 failures and all out-of-scope residuals remain
  unchanged.
- **V0.20 boundary:** S127 does not close V0.20 or complete the remaining G123
  matrix. S125/S126 failures remain historical raw FAILs. No release,
  package/version, publication, deployment, distribution, or platform
  authority follows.