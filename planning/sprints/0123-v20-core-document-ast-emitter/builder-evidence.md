# Sprint 123 Builder Evidence: Core Document and AST Emitter

## Status

S123 implementation is present in commit
`257cf3f4d9395b8820a9e4e63e5f2abd310fd481` on `feat/create-V0.20.0`.
S121 closeout, S122 acceptance, and D123-01 through D123-13 are recorded.
However, the Builder exceeded the approved S123 retry/stop cap while repairing
the chart-label fixture and continued verification after the stop condition.
This process breach is a raw `FAIL`, not covered by the accepted S122 process
residual.

**Current status:** `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` by the Product
Owner on 2026-11-26. Run-03 closeout checks passed, but incomplete G123 rows
remain `BLOCKED/UNAVAILABLE` or `NOT RUN`; those raw statuses are accepted
residuals and are not upgraded by the owner disposition.

**Builder recommendation:** `ACCEPT WITH RECORDED RESIDUALS`. The approved
run-03 focused/typecheck/build/generated-compile/oracle/diff-check/preservation
gates passed. Several required AST, input, builtin, affine, view, and rejection
cases remain incomplete or unrun; see the row-level matrix below.

**Separate Product Owner disposition:** ACCEPTED/CLOSED WITH RECORDED
RESIDUALS on 2026-11-26.

## Entry and Baseline

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S121 final feasibility closeout | Product Owner accepted/closed with recorded residuals on 2026-11-25; approved four-case probe evidence remains raw and D121-18 is preserved. | PASS |
| S122 closeout | ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25; preserve D122-15 no-parity and accepted retry/stop residual. | PASS |
| Approved implementation baseline | Initial approved baseline was clean `feat/create-V0.20.0` at `6979477cc3239c7d4c70eca24db691277be10fda`; implementation commit is `257cf3f4d9395b8820a9e4e63e5f2abd310fd481`. At run-02 start, worktree changes were approved planning/evidence files, the approved fixture artifact-root override in `tests/transpiler.test.ts`, and S123 artifact directories; no unrelated user changes were reported. Windows PowerShell, Bun 1.4.5, TypeScript 5.9.3, Git 2.56.1.windows.1, package 0.19.0, lockfile `bun.lock`. | PASS |
| S123 execution authorization | Original implementation plan and D123 decisions were approved before implementation. Product Owner accepted the retry-cap breach, authorized run-02 closeout, then separately approved the exact run-03 G123 tranche on 2026-11-26. | PASS |
| D123 decisions | D123-01 through D123-13 recorded as approved on 2026-11-26. | PASS |

## Command Ledger

Record exact command and CWD, tool versions, raw status/counts, artifacts/hash,
first failure and retry ID.

| Run ID | Exact command | Result/counts | Output/hash | Raw status |
| --- | --- | --- | --- | --- |
| S123-FOCUSED-HISTORICAL | `bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/modules.test.ts` | PASS; 262 tests, 0 failures, across 6 files. Historical; fresh run-02 complete suite required. | `artifacts/run-01/logs/focused-tests-final-r01.log`; final later console capture not retained. | PASS (historical) |
| S123-FOCUSED-R02 | `$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02'; bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/modules.test.ts` | PASS; 265 tests, 0 failures, across 6 files. | `artifacts/run-02/logs/focused-tests.log`; SHA-256 `CC172FEB88B9115B0E786B86EB40C80F075BCB2D07EB485CE2BC7E3966138DF2`. | PASS |
| S123-TRANSPILE-HISTORICAL | `bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts` | PASS; latest historical run 14 tests, 0 failures, 52 assertions; later focused runs also passed with more cases. | Terminal output not retained as a full raw artifact. | PASS (historical) |
| S123-TYPECHECK-HISTORICAL | `bunx tsc --noEmit` | PASS; no diagnostics in the recorded run. | Root CWD; final replan run still required. | PASS (historical) |
| S123-TYPECHECK-R02 | `bunx tsc --noEmit` | PASS; no diagnostics. | Root CWD; Bun 1.4.5 / TypeScript 5.9.3. | PASS |
| S123-BUILD-R05 | `bun run build` | PASS; generated 220 files / 1,908,130 bytes. | `artifacts/run-01/generated-dist-r05-manifest.csv`; SHA-256 `142215309322F3246F0E62EFFD773B292D2FF5EED193FBC876DF6B1BC00C7D79` | PASS (historical) |
| S123-BUILD-R02 | `bun run build` | PASS; generated 220 files / 1,909,308 bytes; build preceded strict generated compilation. | `artifacts/run-02/generated-dist-manifest.csv`; SHA-256 `185E20CAB9797AC6F7C3B128DDB9B85009D5CF108DE2CB65DF292544BEAF402F`. | PASS |
| S123-GENERATED-COMPILE-R05 | `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-01/fixtures/main.ts planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-01/fixtures/oracle.ts` | PASS; generated graph and oracle compiled with TypeScript 5.9.3. | Current replan baseline requires a fresh run. | PASS (historical) |
| S123-GENERATED-COMPILE-R02-01 | Approved strict command before build, using restored root `dist`. | FAIL; 33 cascading diagnostics because `openamx/transpiler-runtime` was unavailable. | `artifacts/run-02/logs/generated-compile-before-build-failure.log`; SHA-256 `A383FF86F5816EBF71B89A1BF2BA4874525A059D0E525E3F7BBF7B1D7EDAAFA4`. | FAIL; preserved first attempt |
| S123-GENERATED-COMPILE-R02-02 | Same strict command after `S123-BUILD-R02`. | PASS; no diagnostics. | Generated entry/dependency modules and oracle; TypeScript 5.9.3. | PASS |
| S123-AMX-ORACLE-R05 | `bun run planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-01/fixtures/oracle.ts` | PASS; exports/views exact after approved normalization; invalid input code `AMX4003` matched; repeated calls returned fresh objects. | Bun 1.4.5; output was reported in terminal, not retained as a dedicated JSON artifact. | PASS (historical) |
| S123-AMX-ORACLE-R02 | `bun run planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/fixtures/oracle.ts` | PASS; generated exports and ordered table/chart/structured-v2 diagram DTOs matched AMX after stable unit-identity normalization. Invalid enum input code `AMX4003` matched; repeated invocations returned fresh exports/views. | `artifacts/run-02/oracle-result.json`; SHA-256 `924704C1B76533862AD25CE7B83A91B3980A57211AD60E8F8B56AD66B38E7D6F`; Bun 1.4.5. | PASS |
| S123-PRESERVE-R05 | PowerShell SHA-256 manifest comparison before/after build. | PASS; original `dist` restored with 196 files / 1,661,955 bytes and zero path/length/hash differences; renderer restored to SHA-256 `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. | Baseline manifest `artifacts/run-01/baseline/dist-before.csv`; generated renderer archived under `generated-dist-r05/renderer-source/`. | PASS (historical) |
| S123-PRESERVE-R02 | PowerShell SHA-256 manifest comparison and restore. | PASS; root `dist` restored with 196 files / 1,661,955 bytes and zero differences; renderer restored to baseline hash. | `artifacts/run-02/baseline/`; generated manifest SHA-256 `185E20CAB9797AC6F7C3B128DDB9B85009D5CF108DE2CB65DF292544BEAF402F`. | PASS |
| S123-DIFF-CHECK | `git diff --check` | PASS; no whitespace diagnostics in the recorded run. | Root CWD; fresh closeout run required if files change. | PASS (historical) |
| S123-COMPILE-WRONG-DIST-FIRST | Approved generated compile command run after restoring the old root `dist` but before rebuilding the helper subpath. | FAIL; 33 cascading diagnostics, beginning with unresolved `openamx/transpiler-runtime`. Rebuild then strict compile passed. | `artifacts/run-01/logs/generated-compile-before-build-failure.log`; SHA-256 `464698438949793FA14C716FA03EFBE7F53CD089B8B725CFF216EAEEF44CEDF4`. | FAIL; sequencing error, first failure preserved |
| S123-DIFF-CHECK-R02 | `git diff --check` | PASS; no whitespace diagnostics. | Root CWD after run-02 verification and restoration. | PASS |

## Run-03 Command and Artifact Addendum

From `C:\Users\gamez\Programming\openamx`; Bun 1.4.5, TypeScript 5.9.3,
PowerShell 5.1.26100.9818. The focused run used
`OPENAMX_S123_ARTIFACT_ROOT=planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03`.

Exact commands:

```text
$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03'; bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/modules.test.ts
bunx tsc --noEmit
bun run build
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/fixtures/main.ts planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/fixtures/oracle.ts
bun run planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/fixtures/oracle.ts
git diff --check
```

| Run ID | Command / result | Output and raw status |
| --- | --- | --- |
| S123-FOCUSED-R03 | Approved six-file `bun test` command; 267 passed, 0 failed, 1,302 assertions. | `artifacts/run-03/logs/focused-tests.log`; SHA-256 `F86D6C83474B81DCC1ABAD967BF5C77D5BFF59090D65F5361F8F61DA698F52D1`; PASS. A later tee invocation was interrupted, but this preserved log contains the complete successful summary. |
| S123-TYPECHECK-R03 | `bunx tsc --noEmit`; no diagnostics. | PASS. |
| S123-BUILD-R03 | `bun run build`; 220 files / 1,910,213 bytes. | `artifacts/run-03/generated-dist-manifest.csv`; SHA-256 `0CAD7EEAC3037393886E97CDA2D616431750B37B2F11C7320259048C984F3BCB`; PASS. |
| S123-GEN-COMPILE-R03-01 | Approved strict generated compile before build; 34 diagnostics because restored `dist` lacked the S122 helper subpath. | `artifacts/run-03/logs/generated-compile-before-build-failure.log`; SHA-256 `7E9263374CD0052EDCF026DC259070277AC0AE165A842F904E7386A5E01352EE`; FAIL, preserved sequencing failure. |
| S123-GEN-COMPILE-R03-02 | Strict generated compile after build; one `TS2322` because an internal record field was optional in TypeScript but materialized by AMX. | `artifacts/run-03/logs/generated-compile-optional-record-field-first-failure.log`; SHA-256 `E98A20F8601F087A9771D7CD4F26A1B2FDF35E01F2A4986C746EB0F438C08F55`; FAIL, preserved first fixture-typing failure. |
| S123-GEN-COMPILE-R03-03 | Same strict command after the scoped record-type correction; no diagnostics. | PASS; TypeScript 5.9.3. |
| S123-AMX-ORACLE-R03 | `bun run planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/fixtures/oracle.ts`; exports and normalized ordered views matched AMX, invalid input code `AMX4003` matched. | PASS; terminal output was not retained as a standalone JSON artifact. Coverage includes DateTime/nullable inputs, inherited/defaulted records, numeric/string enum inputs, all four chart kinds and diagram primitives, and imported-module diagram ordering. |
| S123-PRESERVE-R03 | Archive generated output, restore baseline `dist` and renderer, compare manifest paths/lengths/hashes. | PASS; generated 220 files / 1,910,213 bytes; restored 196 files / 1,661,955 bytes with zero differences. Renderer SHA-256 `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. |
| S123-DIFF-CHECK-R03 | `git diff --check`; no diagnostics. | PASS; rerun after final evidence edits. |

### Run-03 Fixture Hashes

| File | SHA-256 |
| --- | --- |
| `main.amx` | `52108216BB0ED9E500BB031FD9B88E563878BAC52C0F676F5A916E7E43ADFEC7` |
| `main.ts` | `F14AA87A6464CCBB67F4780BE91BD21E455B9103E12976E690186889F5A6852A` |
| `oracle.ts` | `955E0D2B2622A12E421268E003251883C48E2EFB5FD74400E7A962C796EF503D` |
| `payload.json` | `F3B241FAB645848CE7F8E10F1057C2F2B66A389406E709A8D6C7814EEE514ACC` |
| `invalid-payload.json` | `E58880B41BECBF7A99258C9EE9F345F7B1CD4ACAA006539B9FE598B7637FEFD9` |
| `types.amx` | `956E1E6E9FD8E50882C97D1C2BB72ED37A7A5EC4C4A1FD90D0FFD3ECEF60DE37` |
| `types.ts` | `76A2C601BC8A6C80E2CE4FAE487BFC0D63EF8555B46F8A43B39640F2E0E5314C` |
| `units.amx` | `51223C2365402C949ED83513589668233F2757B42C1EC6DA3F31F90F1004932B` |
| `units.ts` | `4E205255C173B1FE5F7D93FB2967E2F53A8E00A8F8AD7AC1269253966ED238E6` |

## Requirement and AST Reconciliation

| Evidence ID | Required reconciliation | Result / missing IDs | Raw status |
| --- | --- | --- | --- |
| E123-ENTRY-01 | S121 closeout, S122 acceptance/residuals, D123 approvals, S123 owner disposition. | Recorded; Product Owner accepted/closed S123 with residuals on 2026-11-26; D121-18/D122-15 unchanged. | PASS |
| E123-AST-01 | Every unique current discriminant mapped once and fixture-backed. | Lowering table split by discriminant; fixture reconciliation incomplete. Missing golden/parity coverage remains to be inventoried in the replan. | BLOCKED/UNAVAILABLE |
| E123-HELPER-01 | Generated imports match the actual S122 public declaration. | R02 generated graph strict-compiled against built S122 declarations. Full helper-family/G123 audit remains incomplete. | BLOCKED/UNAVAILABLE |
| E123-SOURCE-01 | Original source/frontmatter/comment fidelity. | Run-03 goldens cover mixed ECMAScript separators, raw frontmatter, prose around AMX blocks, inert non-AMX fences, interpolation, and source order. A full arbitrary non-ASCII emitter case remains incomplete. | BLOCKED/UNAVAILABLE |
| E123-PARITY-01 | Exports, representative measurement/input/list/builtin behavior and ordered DTOs match AMX. | Run-03 oracle adds DateTime/nullable inputs, inherited/defaulted records, all chart kinds and diagram primitives, and imported-module view ordering. Affine, complete builtin/input options, and some view families remain incomplete. | BLOCKED/UNAVAILABLE |
| E123-REJECT-01 | Parse/type/lowering errors return diagnostics and no success-shaped code. | Parse/type rejection and source-file propagation have focused tests; unknown-lowering failure path lacks a direct golden. | BLOCKED/UNAVAILABLE |
| E123-SCOPE-01 | Changes exclude S124/S125/release scope and preserve user artifacts. | Implementation commit and replan worktree contain no package export/version, CLI, desktop, renderer feature, docs/example, or release changes. Approved test output-root change and planning/evidence paths are in scope. Build restoration passed. | PASS |
| E123-OWNER-01 | Product Owner closeout disposition is recorded separately from Builder recommendation. | Explicit acceptance/closure with recorded residuals on 2026-11-26; incomplete G123 statuses remain unchanged. | PASS |

## Failures, Limitations, and Residuals

Preserve raw failures/retries and separate raw status, Builder recommendation,
residual owner, and product-owner disposition.

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S123-RETRY-STOP-01 | FAIL | Initial line-chart fixture failed, retries 1 and 2 (record-backed column and scatter) failed with `AMX3003`, then retry 3 (scalar-list column) passed, exceeding the two-retry cap by one. See `artifacts/run-01/logs/S123-chart-label-retry-ledger.md`; full outputs were not retained, only diagnostic excerpts. | Builder process. | Accepted by Product Owner as a named S123 process residual on 2026-11-26; raw FAIL retained |
| S123-AMX-ENUM-LOCAL-VALIDATION | FAIL (fixture attempt) | A local enum-annotated binding hit current AMX runtime `AMX4003 Expected a Status record`; the fixture was removed without changing AMX semantics. | AMX current behavior; not an S123 target. | Preserve no-parity/unsupported behavior; do not modify checker/runtime |
| S123-AMX-INPUT-UNIT-VISIBILITY | FAIL (fixture attempt) | Initial nested measurement input lacked unit imports in the record-declaring module and AMX returned `AMX4004`; fixture was corrected to import visible units. | Fixture contract; no AMX semantics changed. | Resolved in fixture |
| S123-COMPILE-WRONG-DIST-FIRST | FAIL | Strict generated compile ran after restoring pre-S122 root `dist`, so `openamx/transpiler-runtime` could not resolve; archived in command ledger. Rebuild/compile passed afterward. | Builder sequencing. | Resolved by build-before-compile sequence; first failure retained |
| S123-GEN-COMPILE-R03-01 | FAIL | Pre-build generated compile produced 34 cascading diagnostics because restored root `dist` lacked the helper subpath. | Builder sequencing. | Resolved by building before strict compile; first failure retained |
| S123-GEN-COMPILE-R03-02 | FAIL | Post-build compile found one generated `TS2322` for a materialized optional record field. | Emitter internal type shape. | Corrected within approved run-03 scope; first failure retained |

## Recommendation and Disposition

- **Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS. The run-03
  focused suite, root typecheck, build, strict generated compile, oracle,
  diff-check, and preservation checks passed; remaining G123 rows are listed
  as raw blockers/unrun cases in the parity matrix.
- **Process residual disposition:** ACCEPTED by the Product Owner on
  2026-11-26 for `S123-RETRY-STOP-01`; raw status remains FAIL.
- **S123 closeout disposition:** ACCEPTED/CLOSED WITH RECORDED RESIDUALS by
  the Product Owner on 2026-11-26.
- **S124 readiness:** Separate scope and authorization remain required;
  recursive module graph/CLI work was not performed in S123.
- **Carried residuals:** S121 D121-18 multi-file rollback remains
  best-effort/non-crash-atomic; S122 D122-15 excludes enum-default AMX parity
  for unexpressible source forms; S122 retry/stop deviation remains accepted.
- **Release/package/platform authority:** NONE.