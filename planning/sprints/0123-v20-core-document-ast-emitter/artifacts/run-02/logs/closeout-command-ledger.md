# S123 Run-02 Command Ledger

**Date:** 2026-11-26  
**CWD:** `C:\Users\gamez\Programming\openamx`  
**Baseline commit:** `257cf3f4d9395b8820a9e4e63e5f2abd310fd481`  
**Branch:** `feat/create-V0.20.0`  
**Host/tools:** Windows PowerShell 5.1.26100.9818; Bun 1.4.5; TypeScript 5.9.3; Git 2.56.1.windows.1; package 0.19.0; lockfile `bun.lock`.

| Run ID | Exact command | Result | Raw status / artifact |
| --- | --- | --- | --- |
| S123-FOCUSED-R02 | `$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02'; bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/modules.test.ts` | 265 tests, 0 failures, 6 files. Generated fixture files appear under `run-02/fixtures`; `run-01` was not targeted. | PASS; `focused-tests.log`, SHA-256 `CC172FEB88B9115B0E786B86EB40C80F075BCB2D07EB485CE2BC7E3966138DF2`. |
| S123-TYPECHECK-R02 | `bunx tsc --noEmit` | No diagnostics. | PASS; no stdout. |
| S123-GEN-COMPILE-R02-01 | `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/fixtures/main.ts planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/fixtures/oracle.ts` | FAIL; 33 cascading diagnostics because the deliberately restored pre-S122 root `dist` did not expose `openamx/transpiler-runtime`. | FAIL; `generated-compile-before-build-failure.log`, SHA-256 `A383FF86F5816EBF71B89A1BF2BA4874525A059D0E525E3F7BBF7B1D7EDAAFA4`. |
| S123-BUILD-R02 | `bun run build` | PASS; build completed and produced the helper declaration/runtime. Build was run before the successful generated compile. | PASS; 220 generated files, 1,909,308 bytes; `generated-dist-manifest.csv`, SHA-256 `185E20CAB9797AC6F7C3B128DDB9B85009D5CF108DE2CB65DF292544BEAF402F`. |
| S123-GEN-COMPILE-R02-02 | Same strict command as `S123-GEN-COMPILE-R02-01`, after `S123-BUILD-R02`. | No diagnostics. | PASS; no stdout. |
| S123-AMX-ORACLE-R02 | `bun run planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/fixtures/oracle.ts` | PASS; generated exports and ordered table/chart/structured-v2 diagram views matched AMX after the recorded identity normalization. Invalid enum input code matched `AMX4003`; repeated invocations returned distinct exports/views objects. | PASS; normalized stdout summary in `oracle-result.json`. |
| S123-PRESERVE-R02 | PowerShell recursive SHA-256/path/length manifest comparison and restore. | PASS; restored 196 original `dist` files / 1,661,955 bytes with zero differences; renderer restored to baseline hash. | PASS; baseline `dist-before.csv`, SHA-256 `BC57785491D1E5D541207F4A5DCF5F0E6372844BB4C9B8870EA53D406E069E83`; renderer `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. Final generated renderer archived under `generated-dist/renderer-source/`, SHA-256 `3985C1C9CB456BA67B307805556769FE2F732E64DF11E1D059ADC71827C4C5E3`. |
| S123-DIFF-CHECK-R02 | `git diff --check` | No whitespace diagnostics. | PASS; no stdout. |

**Generated fixture manifest:** `fixture-manifest.csv`, SHA-256 `980E79F46CD777C76D5E675F51E725D5EFA379CE078270415E6AB64B4BF908BF`; 9 files / 43,955 bytes at capture.  
**Oracle result artifact:** `oracle-result.json`, SHA-256 `924704C1B76533862AD25CE7B83A91B3980A57211AD60E8F8B56AD66B38E7D6F`.  
**Baseline metadata:** `baseline/baseline.json`; root `dist` pre-build 196 files / 1,661,955 bytes; renderer pre-build SHA-256 `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`.  
**Final generated build:** 220 files / 1,909,308 bytes; manifest SHA-256 `185E20CAB9797AC6F7C3B128DDB9B85009D5CF108DE2CB65DF292544BEAF402F`; renderer build output SHA-256 `3985C1C9CB456BA67B307805556769FE2F732E64DF11E1D059ADC71827C4C5E3`.  
**Restore result:** `DistRestored=True`, zero path/length/hash differences; 196 files / 1,661,955 bytes; renderer restored to the pre-build hash.  
**Fixture manifest:** 9 files / 43,955 bytes; SHA-256 `980E79F46CD777C76D5E675F51E725D5EFA379CE078270415E6AB64B4BF908BF`.

S123-RETRY-STOP-01 remains an accepted process residual. It does not imply S123 acceptance. D121-18 and D122-15 remain unchanged.
