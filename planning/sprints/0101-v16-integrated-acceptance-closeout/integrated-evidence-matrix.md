# Sprint 101 Integrated Evidence Matrix

## Status and Evidence Rules

This matrix records Sprint 101 raw verification results. Sprint 100 is
`ACCEPTED/CLOSED` (2026-10-24); Sprints 095-099 are accepted with the
residuals recorded in their evidence. Sprint 101 execution and the verification,
test-file, evidence-file, and isolated-output plan were explicitly approved by
the user on 2026-10-24. The prior `BLOCKED/OPEN` owner disposition preceded
the corrective follow-ups; the fresh Lead Developer/product-owner disposition
is `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, 2026-10-24. Raw results and
owner dispositions remain separate.

Allowed result states: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, `NOT RUN`.
Record owner disposition in a separate column; it never rewrites the raw
result. Fill in exact commands, counts, tool versions, paths, expected/actual
results, and artifact locations.

## Command Register

`C-ROOT-FOCUSED` ran from `/tmp/openamx-sprint101-0k8S5A/workspace` using Bun
1.4.4 on Linux x86_64:

```sh
bun test tests/parser.test.ts tests/evaluator.test.ts tests/functionBodyTypeChecking.test.ts tests/isTypeChecking.test.ts tests/formatter.test.ts tests/editor.test.ts tests/modules.test.ts tests/examples.test.ts tests/numbered-guide.test.ts
```

The first attempt and post-build retry are both preserved in
`/tmp/openamx-sprint101-0k8S5A/artifacts/`.

## Contract and Core Tests

| Evidence ID | Requirement/fixture family | Exact command/action and environment | Expected vs actual, count, artifact | Raw status | Residual owner | Separate disposition |
| --- | --- | --- | --- | --- | --- |
| `INT101-PARSE-01` | `V16-FN-EXPR-01`, `V16-FN-FLOW-01`, `V16-FN-PARSE-01/02` | `C-ROOT-FOCUSED`; Bun 1.4.4, Linux x86_64 | Both AST forms and exact malformed/unclosed/body locations exercised. 60/60 parser tests passed in aggregate; raw log `artifacts/root-focused-after-build.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |
| `INT101-PARSE-02` | `V16-FN-PARSE-03a-l`, return context, strings/braces, LF/CRLF/UTF-16 | `C-ROOT-FOCUSED`; Bun 1.4.4, Linux x86_64 | AMX3006 prohibited cases, boundaries and coordinates covered by parser suite; 60/60 passed. Raw log `artifacts/root-focused-after-build.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |
| `INT101-RUNTIME-01` | `V16-FN-FLOW-01/04/06/07/10/11`, scope and list fixtures | `C-ROOT-FOCUSED`; Bun 1.4.4, Linux x86_64 | Nested/direct/loop returns, scope, caller isolation, list copies and returned lists; 104/104 evaluator tests passed. Raw log `artifacts/root-focused-after-build.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |
| `INT101-RUNTIME-02` | `V16-FN-RUNTIME-01`, D-095-13 | `C-ROOT-FOCUSED`; Bun 1.4.4 | Runtime guard remains `AMXF4002` with accepted exact message/source assertion; evaluator suite 104/104 passed. Raw log `artifacts/root-focused-after-build.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |
| `INT101-TYPE-01` | `V16-FN-FLOW-01-12`, type/scope fixtures | `C-ROOT-FOCUSED` plus `bunx tsc --noEmit`; Bun 1.4.4 | Return typing/flow, `AMXF4001`, AMX3001/3002 and `AMX3021` compatibility tests: 19 + 11 tests passed. Typecheck passed. Raw logs `artifacts/root-focused-after-build.log`, `artifacts/root-typecheck.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |
| `INT101-MODULE-01` | Expression and braced function export/import | New focused test: `bun test tests/modules.test.ts --test-name-pattern 'exported statement-bodied function'`; then full focused command; Bun 1.4.4 | New braced import returns 5 from input 4; source test 1/1 passed, full module suite 42/42 passed including existing expression export/import. Logs `artifacts/source-module-regression.log`, `artifacts/root-focused-after-build.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |
| `INT101-FORMAT-01` | Expression/statement bodies, blocks, strings, CRLF | Focused command includes `tests/formatter.test.ts`; Bun 1.4.4 | Idempotence, preservation and evaluation-parity assertions; 20/20 formatter tests passed. Raw log `artifacts/root-focused-after-build.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |
| `INT101-EDITOR-01` | Parameters/locals/iterators, shadows, navigation/rename, diagnostics | Focused command includes `tests/editor.test.ts`; Bun 1.4.4 | Shared facts/ranges and diagnostics; 29/29 editor tests passed. Raw log `artifacts/root-focused-after-build.log`. | PASS | Sprint 101 Builder | PENDING owner disposition |

## User-Facing and Host Tests

| Evidence ID | Surface | Exact command/action and environment | Expected vs actual, count, artifact | Raw status | Residual owner | Separate disposition |
| --- | --- | --- | --- | --- | --- |
| `INT101-DOC-01` | V0.16 spec, root/extension README, Help topic | Focused root examples tests plus Help UI; Bun 1.4.4 / Playwright 1.64.1, Linux | README/spec/Help link assertions passed within 17/17 examples tests; Help UI 2/2 passed. Logs `artifacts/root-focused-after-build.log`, `artifacts/desktop-ui.log`. | PASS | Sprint 101 Builder | `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; individual residual-owner decisions as listed below |
| `INT101-EXAMPLE-01` | Reference 15, lesson 03, negative fixture | `C-ROOT-FOCUSED` after build; source CLI invalid fixture command; Bun 1.4.4 | Examples 17/17 and numbered guide 2/2 passed. Reference assertions include `expressionResult: 12`, `statementResult: 14`, scoped/fallback/list outcomes. Negative exits 1 with exact `AMXF4001`, line 11, column 1. Logs `artifacts/root-focused-after-build.log`, `artifacts/invalid-fixture.log`. Initial pre-build guide attempt: 303 pass/1 fail; see E-02. | PASS | Sprint 101 Builder | `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; individual residual-owner decisions as listed below |
| `INT101-GUIDE-01` | Offline guide project | Desktop guide resource/starter tests; `bun run test` also reran them; Bun 1.4.4 | Allowlist/parity/materialization and valid starter/reference checks: 9/9, 107 assertions; negative fixture remains separately tested. Logs `artifacts/desktop-guide-focused.log`, `artifacts/desktop-test-after-correction.log`. | PASS | Sprint 101 Builder | `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; individual residual-owner decisions as listed below |
| `INT101-VSCODE-01` | Actual grammar and Extension Development Host | Initial configured 1.85.0 run, followed by user-authorized pin update and `bun run test` in isolated copy; source-tree `bunx tsc --noEmit -p tsconfig.test.json`; Bun 1.4.4, VS Code 1.143.1 | Initial 1.85.0 route failed before cases because extension requires `^1.140.0`; historical log retained. Updated default pin to 1.143.1; configured script passes 26/26. Source runner no-emit typecheck passes without touching `out/`. Logs `artifacts/vscode-runner-correction.log`, `artifacts/vscode-default-runner.log`. | PASS | VS Code test-tooling owner (R-099-01) | Correction implemented; fresh sprint disposition pending |
| `INT101-DESKTOP-01` | Desktop typecheck/web/RPC | Initial package run failed at stale count; after user-authorized correction, reran `bun run test` in isolated copy and from source tree; Bun 1.4.4, Linux | Initial assertion expected 2 occurrences; actual is the single `sandbox="allow-scripts"` preview iframe. Changed only the test count from 2 to 1; app markup/CSP unchanged. Guide tests 9/9 and RPC/workflow contract pass in both reruns. Logs `artifacts/desktop-test-after-correction.log`, `artifacts/desktop-test-source-after-correction.log`; prior fail `artifacts/desktop-test-rpc.log`. | PASS | Desktop RPC/security owner | Correction implemented; fresh sprint disposition pending |
| `INT101-DESKTOP-02` | Desktop CodeMirror/Help UI | Approved focused Playwright command; Playwright 1.64.1, Linux Vite harness | 3/3 tests pass (editor 1, Help 2); output `workspace/desktop-app/test-results/sprint101-v16-ui-0k8S5A`; raw log `artifacts/desktop-ui.log`. No native launch claim. | PASS | Desktop/platform owner | Fresh V0.16 disposition pending; native routes remain unavailable |
| `INT101-PLATFORM-01` | Native/package/other platform route | Not attempted; handoff excludes release/package work and no native launch route was authorized | Native package/launch and non-Linux OS/architectures unverified. No certification inferred. | BLOCKED/UNAVAILABLE | Lead Developer/platform owner | Product owner selected recording routes unavailable; no broader platform claim |

## Repository Verification and Preservation

| Evidence ID | Gate | Exact command/action and environment | Expected vs actual, count, artifact | Raw status | Residual owner | Separate disposition |
| --- | --- | --- | --- | --- | --- |
| `INT101-ROOT-01` | Fresh build | `bun run build` in `/tmp/openamx-sprint101-0k8S5A/workspace`; Bun 1.4.4, Linux x86_64 | PASS; `dist/cli.js` and generated diagram runtime built in isolated snapshot. Log `artifacts/root-build.log`. Shared root `dist/` not intentionally used. | PASS | Sprint 101 Builder | `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; individual residual-owner decisions as listed below |
| `INT101-ROOT-02` | Full root test suite | `bun test` in isolated snapshot; Bun 1.4.4 | 601 pass, 2 skip, 0 fail; 4,362 assertions; 603 tests / 46 files. Two skipped tests are Windows-only release-preflight cases. Log `artifacts/root-full-suite.log`. | PASS | Sprint 101 Builder | `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; individual residual-owner decisions as listed below |
| `INT101-ROOT-03` | Focused root tests/typecheck | Focused nine-file `bun test` command plus `bunx tsc --noEmit`; Bun 1.4.4 | After build: 304 pass, 0 fail, 1,943 assertions across 9 files; typecheck no output. Before build: 303 pass, 1 fail, 1,878 assertions because the clean archive omitted ignored `dist/cli.js`; same command passed after build. Logs `artifacts/root-focused*.log`, `artifacts/root-typecheck.log`. | PASS | Sprint 101 Builder | `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; individual residual-owner decisions as listed below |
| `INT101-PRESERVE-01` | Output and accepted records | Initial source status/hash audit, followed by user-authorized backup and `git restore --source=1248fa1605a46f545c91bb90be563a22ce8b8cf2 -- src/renderer/diagramBrowserRuntime.ts`; verified `git diff --quiet` against entry commit | Initial audit FAIL is retained in Builder E-01. Recovery PASS: current file SHA-256 is entry hash `d9e8cbdef2b3a06c038a46b58c9323b605ea2aac076b464d741c71fc707c2bd3`; pre-restore generated bytes are backed up at `/tmp/openamx-sprint101-0k8S5A/artifacts/diagramBrowserRuntime.before-restore.ts` with SHA-256 `6a39ecbc9367abf60c5284da8d02edf683f2798bf1bf6ebb403bdabc5e2edad9`. All build outputs were directed to the isolated snapshot; ignored source output directories were not targeted. | PASS | Sprint 101 Builder | `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; initial audit failure retained in history |

## Accepted Residual Baseline to Carry Forward

| Residual ID | Accepted prior result | Sprint 101 treatment |
| --- | --- | --- |
| `R-099-01` | Default VS Code `bun run test` runner pinned 1.85.0 below extension engine; installed 1.143.1 host passed 26/26. | User authorized runner maintenance. Default test host now pins 1.143.1, compatible with `^1.140.0`; configured `bun run test` passes 26/26. Initial 1.85.0 failure remains in history. |
| `R-099-02` | Linux Playwright used Ubuntu 24.04 fallback Chromium; native Electrobun and other OS/architectures untested. | Product owner selected recording native/other-platform routes unavailable. Current Vite harness passed 3/3 on Linux; it is not native packaging/launch evidence. No broader platform claim. |
| `R-099-03` | VS Code editor language-service reports Mocha ambient globals although configured compile-tests pass. | Current `get_errors` also reports `bun:test`/`Bun` unresolved in the root module test file; configured VS Code `compile-tests`, focused Bun tests, and root `bunx tsc --noEmit` pass. Tooling-only; no unrelated tsconfig edit. Fresh residual-owner disposition pending. |
| `R-100-01` | Root full suite not run in Sprint 100; repository `dist/cli.js` intentionally stale/preserved. | Fresh isolated build and full suite pass. Shared bundle was not intentionally used. The generated-runtime diff found during final audit was backed up and restored to the entry commit; initial raw preservation failure remains in Builder E-01. |
| `R-100-02` | Release/publication/integrated closeout not run. | Remains separate; Sprint 101 is not release authority. |
| `BASELINE-DESKTOP-RPC` | Prior desktop RPC test expected two sandbox attributes while current app has one; historical raw failure was separately accepted for V0.15. | User authorized the narrow test correction: assert exactly one `sandbox="allow-scripts"` occurrence. App markup/CSP are unchanged. Full desktop package tests now pass; initial raw failure remains in history. |