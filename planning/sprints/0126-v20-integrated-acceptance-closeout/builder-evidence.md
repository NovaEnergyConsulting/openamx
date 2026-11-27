# Sprint 126 Builder Evidence: V0.20 Integrated Acceptance and Closeout

## Status

S126 execution was separately authorized on 2026-11-27 after reconciling the
S124 and S125 Product Owner dispositions into the canonical lifecycle ledgers.
Verification stopped after the retained Measurement probe reproduced a
generated type-identity compile failure. No product behavior or historical
S125 raw evidence was changed.

**Builder recommendation:** BLOCKED/OPEN. The Asset example path passed, but
the Measurement failure and incomplete G123 coverage prevent integrated V0.20
acceptance.

**Separate Product Owner disposition:** PENDING.

The tables below record final S126 results. `NOT RUN` means no S126 run was
authorized/performed; carried S125 raw failures and blocked rows are listed
separately and are not promoted.

## Final Execution Record

### Baseline and Host

- Primary baseline: clean `feat/create-V0.20.0` at
  `08fbfa3592bc815e1a6617d3c003a468bd8da9a0`. Before S126 ledger edits the
  primary worktree was clean; afterward the four authorized lifecycle files
  were the only non-artifact paths modified.
- Validation CWD: `C:\Users\gamez\Programming\openamx-s126-validation-08fbfa3`;
  detached at the same commit, with root and desktop `node_modules` junctions
  to the existing dependency trees. No dependencies were installed or updated.
- Host: Windows 10.0.26300, AMD64, PowerShell 5.1.26100.9818, Bun 1.4.5,
  Node.js 24.13.1, Git 2.56.1.windows.1, TypeScript 5.9.3, Vite 6.4.3,
  Playwright 1.64.1, Chromium 156.0.8078.4, vue-tsc 2.2.12. Hutch 0.28.2 is
  carried from S125 evidence; its wrapper was not selected for S126.
- Root and desktop package versions remain `0.19.0`; `bun.lock` is unchanged.
  Release/package/version/publication/deployment/platform workflows were not
  run.
- Five retries per gate after the initial attempt were authorized. No cap
  extension occurred. Stop on a confirmed product defect; no source or
  behavior change is authorized.

### Exact Command Ledger

| Run ID | CWD | Exact command/action | Raw result and evidence |
| --- | --- | --- | --- |
| S126-ROOT-ALL-01 | Validation root | `bun test` | FAIL: 737/1, 5,603 expectations, 51 files; V0.16 numbered-guide CLI child could not find `dist/cli.js`. `artifacts/run-01/logs/S126-ROOT-ALL-01.log`. |
| S126-ROOT-BUILD-01 | Validation root | `bun run build` | Tool reported exit 1 with PowerShell `NativeCommandError` for Bun's script banner. `logs/S126-ROOT-BUILD-01.log`; follow-up build attempt recorded separately. |
| S126-ROOT-BUILD-02 | Validation root | `bun run build 2>$null | Tee-Object -FilePath <S126 log>` | BLOCKED/UNAVAILABLE: terminal returned a truncated path fragment and created no log/result. `logs/S126-ROOT-BUILD-02-NO-RESULT.log`. |
| S126-ROOT-BUILD-03 | Validation root | `Start-Process bun.exe -ArgumentList run,build ... -Wait` with separate stream paths | BLOCKED/UNAVAILABLE: stdout empty; stderr only the Bun script banner; terminal did not expose exit. Separate output files are preserved. |
| S126-ROOT-BUILD-04 | Validation root | `bun run build` with stdout/stderr redirected to separate S126 logs | PASS; Bun exit 0. Built helper `transpilerRuntime.js` SHA-256 `D942C580796D52B4C190ED3D06CDC31EAC5EEBC8350EAA7CB3AAACC89B08A8B1`; `.d.ts` SHA-256 `DD921796854E94E5AC1D998F53DC61B66DE85F9A94D30194E0E5B06CF39C0E33`. |
| S126-ROOT-ALL-02 | Validation root | `bun test` | PASS: 738 passed, 0 failed, 5,668 expectations, 51 files. `logs/S126-ROOT-ALL-02.stdout.log` and `.stderr.log`. |
| S126-ROOT-TYPE-01 | Validation root | `bunx tsc --noEmit` | PASS; exit 0, no diagnostics. |
| S126-EXAMPLE-AMX-01 | Validation root | `bun run src/cli.ts run examples/16_TypeScript_Transpilation.amx --input asset=examples/data/asset.json` | PASS; explicit export `North Pump 01`, table/chart scores 4 and 8. |
| S126-EXAMPLE-CLI-01 | Validation root | `bun run src/cli.ts transpile examples/16_TypeScript_Transpilation.amx --out-dir planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/example-16/generated-supported` | PASS; two modules and expected nested library path. |
| S126-EXAMPLE-GENERATED-TYPE-01 | Validation root | `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/example-16/oracle.ts planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/example-16/generated-supported/16_TypeScript_Transpilation.ts` | PASS; TypeScript 5.9.3, no diagnostics. |
| S126-EXAMPLE-ORACLE-01 | Validation root | `bun run planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/example-16/oracle.ts` | PASS; exports, table/chart values/order, and structured-v2 diagram DTO equal AMX. `oracle-result.json` SHA-256 `DBBCC1EEF5D980C94AB24367D32000B9A1705E65D010D35CE1783AE3661203DD`. |
| S126-CLI-DESKTOP-GRAPH-01 | Validation root | `bun run planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/example-16/compare-desktop-cli.ts` | PASS; relative paths/imports and bytes match. Entry SHA-256 `9574F5BF12D142C83F15F8C38E9601864F574E8B8868F0192F18BA80EB4B5CD8`; library SHA-256 `B8D4438DC330BCB8E818234B629B9A22302AAE0BE56B12A9B54B010D4F2EF126`. |
| S126-DESKTOP-UI-01 | Validation `desktop-app/` | `bun run test:ui -- tests/ui/typescript-export.pw.ts --output=../planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/playwright` | FAIL before tests: configured POSIX webServer command `./node_modules/.bin/vite` is not recognized on Windows. Raw logs preserved. |
| S126-VITE-START-01 | Primary repo root (incorrect CWD) | `bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort` | FAIL: `Script not found "vite"`. `logs/S126-VITE-START-01.log`. |
| S126-VITE-START-02 | Validation `desktop-app/` | Same `bun run vite ... --port 4183 --strictPort` command | PASS; Vite 6.4.3 ready on port 4183; server stopped after use. |
| S126-DESKTOP-UI-02 | Validation `desktop-app/` | Same `bun run test:ui ... --output=../planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/playwright` command | PASS; 9/9 in 11.2 seconds; Playwright 1.64.1, Chromium 156.0.8078.4. Harness-only; no native claim. |
| S126-MEASUREMENT-AMX-01 | Validation `desktop-app/` (incorrect CWD) | `bun run src/cli.ts run ...` | FAIL: `Module not found "src/cli.ts"`; no source change. |
| S126-MEASUREMENT-AMX-02 | Validation root | `bun run src/cli.ts run planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/measurement-probe/source/16_TypeScript_Transpilation.amx --input asset=examples/data/asset.json` | PASS; AMX reference is 45 `kilometer_per_hour`. |
| S126-MEASUREMENT-CLI-01 | Validation root | `bun run src/cli.ts transpile planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/measurement-probe/source/16_TypeScript_Transpilation.amx --out-dir planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/measurement-probe/generated-measurement` | PASS; three modules. |
| S126-MEASUREMENT-COMPILE-01 | Validation root | Strict TS 5.9.3 compile of `.../measurement-probe/generated-measurement/16_TypeScript_Transpilation.ts` | FAIL, exit 2, TS2345 Measurement identity mismatch. Raw log SHA-256 `EFDEA1BE1C67C114F29B4A9A30B2948F7B7A059E0412B84114502DAD0B05819A`. No generated Measurement oracle ran after this failure. |
| S126-DOCS-AUDIT-01 | Primary root | `git diff --exit-code HEAD -- 'docs/language-spec-v0.*' README.md examples/16_TypeScript_Transpilation.amx` plus source/API review | PASS; historical docs/example unchanged and V0.20 claims agree with inspected APIs. |
| S126-PRESERVE-PRIMARY | Primary root | `capture-preservation.ps1` before/after | PASS; 3,648 files / 155,891,502 bytes, identical manifest SHA-256 `2FE31BEDB0BA0C3E750FA53C025F7D46211BEEB239930B23D1AE0FB642C11A98`. |
| S126-PRESERVE-VALIDATION | Validation root | `capture-preservation.ps1` before/after and manifest comparison | 244 changed rows in the disposable validation copy: generated `dist`/renderer and S123 `run-01/fixtures` outputs. No such changes exist in the primary worktree; delta retained at `preservation-validation-delta.csv`. |
| S126-ARTIFACT-MANIFEST | Primary S126 artifact root | `write-artifact-manifest.ps1` | 62 files / 2,251,499 bytes; manifest SHA-256 `834731015C8DFD0102AF9942183F28FD937BCE9E7088BDC661B125899A3D657A`. |

Unselected S126 groups: the separate root-focused suite; desktop worker/RPC,
configured and direct typechecks, and full desktop suite; native/platform
routes. They remain `NOT RUN` or at their prior carried raw status.

## Entry and Baseline

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S121 disposition | Accepted/closed with residuals; D121-18 preserved. | PASS |
| S122 disposition | Accepted/closed with residuals; D122-15 and S122 retry residual preserved. | PASS |
| S123 disposition | Accepted/closed with residuals; S123 process FAIL and all incomplete G123 rows preserved. | PASS |
| S124 disposition | Accepted/closed with residuals; S124 process FAIL, G124 cancellation/crash NOT RUN, D121-18 preserved. | PASS |
| S125 disposition | Builder evidence ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27; full desktop FAIL, Hutch wrapper no-result, native-unavailable, Measurement probe FAIL preserved. | PASS |
| Canonical lifecycle reconciliation | Reconciled state/decisions/STATUS/briefing under separate authorization; historical raw evidence untouched. | PASS |
| Baseline/worktree | Clean `feat/create-V0.20.0` at `08fbfa3592bc815e1a6617d3c003a468bd8da9a0`; host/tool versions and preservation manifests recorded below. | PASS |
| S126 authorization | Exact selected groups, detached worktree, artifact root, preservation, five-retry cap, cleanup and disposition boundary approved. | PASS |

## Command and Host Ledger

Record exact command/action, CWD, tool versions, exit/result counts/assertions,
artifact/hash, retry ID and raw status.

| Run ID | Required gate | Command/action | Result/artifact/hash | Raw status |
| --- | --- | --- | --- | --- |
| S126-ROOT-FOCUSED | Ten-file focused selection | Not selected by Product Owner. | Full root aggregate ran separately. | NOT RUN |
| S126-ROOT-ALL | `bun test` from validation root | Attempt 01: 737/1, 5,603 assertions, missing `dist/cli.js`; attempt 02: 738/0, 5,668 assertions, 51 files. Logs under `artifacts/run-01/logs/`. | PASS (attempt 02); attempt 01 FAIL retained |
| S126-ROOT-TYPE | `bunx tsc --noEmit` from validation root | Exit 0, no diagnostics; stdout/stderr logs under S126 artifacts. | PASS |
| S126-ROOT-BUILD | `bun run build` in validation root | Attempts 01-03 exposed PowerShell stderr/no-result wrappers; attempt 04 captured Bun exit 0. Helper JS SHA `D942C580...9B1`; `.d.ts` SHA `DD921796...0E33`. | PASS (attempt 04); earlier outcomes retained |
| S126-CLI-GRAPH | Example 16 AMX and CLI graph | AMX run exit 0, `assetName=North Pump 01`; CLI output contains entry plus `libraries/asset-management.ts`. | PASS |
| S126-CLI-DESKTOP-EQUIV | Desktop service/worker vs CLI, identical Example 16 source bytes | Exact paths and code bytes match; hashes in `example-16/cli-desktop-equivalence.json`. | PASS |
| S126-GENERATED-COMPILE | Strict TypeScript 5.9.3 Example 16 graph/oracle compile | ES2022/ESNext/bundler/strict compile exit 0, public helper path and `.ts` import resolve in isolated built package. | PASS |
| S126-GENERATED-RUN | Generated `run(inputs)` AMX oracle | Exact Asset export, ordered table/chart values, and structured-v2 diagram DTO match. | PASS |
| S126-MEASUREMENT-PROBE | Retained S125 imported Measurement graph | AMX/CLI reference gives 45 `kilometer_per_hour`; strict generated compile exits 2 with TS2345 type-identity mismatch. Measurement oracle NOT RUN after compile failure. | FAIL |
| S126-DESKTOP-TYPE-WRAPPER | `bun run typecheck` | Not selected; preserve S125 Hutch wrapper no-result as BLOCKED/UNAVAILABLE. | NOT RUN |
| S126-DESKTOP-TYPE-PINNED | Direct pinned vue-tsc fallback | Not selected; preserve S125 direct pinned vue-tsc PASS separately. | NOT RUN |
| S126-DESKTOP-FULL | `bun run test` from desktop-app | Not selected; preserve S125 aggregate FAIL on report-export RPC timing poll. | NOT RUN |
| S126-DESKTOP-RPC | RPC contract harness | Not selected. The narrow desktop service/worker graph path is covered only by S126 CLI/desktop equivalence. | NOT RUN |
| S126-DESKTOP-UI | Vite UI harness from desktop-app | Final Playwright run 9/9 in 11.2 seconds; port 4183, Vite 6.4.3, Playwright 1.64.1, Chromium 156.0.8078.4. | PASS (harness only) |
| S126-NATIVE | Native WebView/platform route | No direct native or macOS/Linux route was authorized/available. | BLOCKED/UNAVAILABLE |
| S126-DOCS-AUDIT | V0.20 spec/README/Example 16 and historical specs | API/behavior audit PASS; full root V0.20 example navigation test PASS; historical docs diff clean. | PASS |
| S126-DIFF-CHECK | `git diff --check` from primary root | No whitespace errors after final evidence edits (final run recorded below). | PASS |
| S126-PRESERVE | Root/desktop/generated/prior artifact hash audit | Primary pre/post manifests identical: 3,648 files / 155,891,502 bytes, hash `2FE31BED...C11A98`. Isolated delta is retained separately. | PASS |

## Integrated Evidence Reconciliation

| Evidence group | Required reconciliation | Result / missing rows | Raw status |
| --- | --- | --- | --- |
| S126-ENTRY | All S121-S125 decisions/dispositions and residuals | S124/S125 canonical dispositions reconciled; original evidence immutable. | PASS |
| S126-G123 | All AST emitter G123/E123 rows, each exact raw status | Row-by-row statuses retained; incomplete rows remain blocked/unavailable or not run. | BLOCKED/UNAVAILABLE |
| S126-EXAMPLE | Example 16 AMX/CLI/compile/generated-run/view parity | Accepted Asset source form passes; Measurement probe compile fails with TS2345. | FAIL |
| S126-GRAPH | CLI/desktop path/content equivalence and S124 safety matrix | Example 16 desktop service/worker and CLI module paths/bytes/imports match; graph safety suite passes in root aggregate; G124 cancel/crash remain NOT RUN. | PASS |
| S126-DESKTOP | RPC/full unit/type/UI/native classifications | Vite UI harness passes; full desktop suite/typechecks/RPC not selected; S125 full-suite FAIL and Hutch/native residuals remain. | BLOCKED/UNAVAILABLE |
| S126-DOCS | V0.20 spec/README/examples and historical spec immutability | API/behavior audit and README/example test pass; historical specs unchanged. | PASS |
| S126-RESIDUALS | S123/S124/S125 process, measurement, desktop, G123/G124 rows | Raw process FAILs, Measurement FAIL, desktop FAIL, G123 gaps, G124 NOT RUN and D121-18/D122-15 preserved. | FAIL |
| S126-SCOPE | No fixes/release/package/platform changes; preserve outputs | Primary worktree has no product changes; protected manifests match exactly; no release/platform workflow ran. | PASS |

## Failures, Limitations and Residuals

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S122-RETRY-LIMIT-DEVIATION | FAIL | Preserve from S122 Builder evidence; owner acceptance does not rewrite it. | Builder process. | Accepted by Product Owner 2026-11-25. |
| S123-RETRY-STOP-01 | FAIL | Preserve from S123 Builder evidence and retry ledger. | Builder process. | Accepted by Product Owner 2026-11-26. |
| S124-RETRY-STOP-01 | FAIL | Preserve from S124 Builder evidence and retry history. | Builder process. | Accepted by Product Owner 2026-11-26. |
| S125-MEASUREMENT-PROBE-01 | FAIL | Original generated Measurement identity compile TS2339/TS2322 remains unchanged. | Emitter/runtime owner. | S125 accepted with residuals; raw FAIL retained. |
| S126-MEASUREMENT-COMPILE-01 | FAIL | Retained probe AMX/CLI passes; generated strict compile fails TS2345 (`vector:[...Length]^1` vs `Length`). Measurement oracle not run. | Emitter/runtime owner. | Stop condition; request separate corrective scope and fresh acceptance cycle. |
| S125-DESKTOP-TEST-01 | FAIL | Existing report-export RPC poll timed out with `currentPdf.status === "running"`; not rerun in S126. | Desktop test owner. | S125 accepted with residuals; raw FAIL retained. |
| S125-DESKTOP-TYPE-SCRIPT-01 | BLOCKED/UNAVAILABLE | Hutch wrapper prompt/no completion; direct pinned vue-tsc passed separately; S126 desktop typechecks not selected. | Host tooling owner. | Preserve as two distinct raw rows. |
| S125-NATIVE-01 / PLATFORM | BLOCKED/UNAVAILABLE | No direct native WebView/cross-platform route; Vite harness is not native evidence. | Platform qualification owner. | No certification claim. |
| G124-PUBLISH-CANCEL-01 / CRASH | NOT RUN | CLI cancel is noninteractive; crash/power loss not tested. | Graph output safety owner. | D121-18 remains accepted non-crash-atomic. |
| S125-ROOT-ACCIDENTAL-TEST-01 | FAIL | Mis-CWD root test timed out; S125 approved recovery restored the exact S123 outputs and removed its unique output folder. | Builder command routing. | Preserve S125 raw FAIL and recovery evidence. |
| S126-ROOT-ALL-01 | FAIL | First full-suite attempt lacked built `dist/cli.js`; attempt 02 passed after isolated build. | Builder setup/ordering. | Preserve first failure and retry separately. |
| S126-DESKTOP-UI-01 / VITE-START-01 | FAIL | Windows Playwright webServer launcher failed; initial manual Vite attempt also used repository-root CWD. Correct same-port route then passed 9/9. | Builder host/command routing. | Raw failures retained; no native inference. |
| S126-EXAMPLE-COMBINED-TYPE-01/02 | FAIL | Optional combined harness compile pulled in missing Electrobun/pdfmake declarations; generated-only acceptance compile passed. | S126 artifact harness, not product acceptance. | Preserve raw diagnostics; no dependency/source change. |

## Recommendation and Disposition

- **Builder recommendation:** BLOCKED/OPEN. The reproduced Measurement
  type-identity compile FAIL blocks integrated V0.20 acceptance. Incomplete
  G123 rows, S125 desktop aggregate FAIL, unselected desktop type/RPC/full
  suite, and unavailable native/platform routes remain explicit.
- **Product Owner disposition:** PENDING; record separately with date, scope
  and named residual owners. The Builder does not accept or close S126.
- **Release/package/platform authority:** NONE.