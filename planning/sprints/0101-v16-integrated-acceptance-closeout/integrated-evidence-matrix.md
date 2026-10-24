# Sprint 101 Integrated Evidence Matrix

## Status and Evidence Rules

This matrix is a planning template for integrated V0.16 acceptance. Sprint
100 is `ACCEPTED/CLOSED` (2026-10-24); Sprints 095-099 are accepted with the
residuals recorded in their evidence. Sprint 101 still requires separate
execution authorization and an approved output/evidence plan.

Allowed result states: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, `NOT RUN`.
Record owner disposition in a separate column; it never rewrites the raw
result. Fill in exact commands, counts, tool versions, paths, expected/actual
results, and artifact locations.

## Contract and Core Tests

| Evidence ID | Requirement/fixture family | Direct test/action | Expected evidence | Status | Residual owner/disposition |
| --- | --- | --- | --- | --- | --- |
| `INT101-PARSE-01` | `V16-FN-EXPR-01`, `V16-FN-FLOW-01`, `V16-FN-PARSE-01/02` | `tests/parser.test.ts` | Both AST variants; exact malformed/unclosed errors and body locations. | NOT RUN | PENDING |
| `INT101-PARSE-02` | `V16-FN-PARSE-03a-l`, function return context, strings/braces, LF/CRLF/UTF-16 | Parser test suite | Approved AMX3006 cases, following statements preserved, source coordinates stable. | NOT RUN | PENDING |
| `INT101-RUNTIME-01` | `V16-FN-FLOW-01/04/06/07/10/11`, scope and list fixtures | `tests/evaluator.test.ts` | Nested returns, return order, cleanup, caller isolation, nested/repeated copies, direct list results. | NOT RUN | PENDING |
| `INT101-RUNTIME-02` | `V16-FN-RUNTIME-01`, D-095-13 | Evaluator harness | Runtime AMXF4002 exact code/message/source remains defensive. | NOT RUN | PENDING |
| `INT101-TYPE-01` | `V16-FN-FLOW-01-12`, `V16-FN-TYPE-01/02/03/04`, scope fixtures | `tests/functionBodyTypeChecking.test.ts` | Every return checked; all-path outcomes; AMXF4001 closing brace; AMX3001/3002; AMX3021 separation. | NOT RUN | PENDING |
| `INT101-MODULE-01` | Existing expression module fixtures and braced function export/import | `tests/modules.test.ts` | Fresh imported module returns expected values from both function forms; source order/visibility preserved. | NOT RUN | PENDING |
| `INT101-FORMAT-01` | Expression and statement forms, nested blocks, strings, CRLF | `tests/formatter.test.ts` | Idempotence, spelling/text preservation, evaluation parity. | NOT RUN | PENDING |
| `INT101-EDITOR-01` | Parameters/locals/iterators, shadows, definitions/references/rename, diagnostics | `tests/editor.test.ts` | Shared facts and source ranges match accepted scopes. | NOT RUN | PENDING |

## User-Facing and Host Tests

| Evidence ID | Surface | Direct test/action | Expected evidence | Status | Residual owner/disposition |
| --- | --- | --- | --- | --- | --- |
| `INT101-DOC-01` | V0.16 spec, root/extension README, Help topic | Docs assertions in `tests/examples.test.ts`; Help UI test | Links/terms/syntax/diagnostic claims match accepted contract; no status overclaims. | NOT RUN | PENDING |
| `INT101-EXAMPLE-01` | Reference 15, lesson 03, invalid fixture | `tests/examples.test.ts`, `tests/numbered-guide.test.ts`; fresh source/built CLI | Positive values exact; expression body unchanged; invalid fixture separately AMXF4001 at line 11 column 1. | NOT RUN | PENDING |
| `INT101-GUIDE-01` | Offline guide project | `guideResources.test.ts`, starter example tests | Exact allowlist/parity/materialization; valid reference executable; invalid fixture copied but not run as success. | NOT RUN | PENDING |
| `INT101-VSCODE-01` | Actual grammar and Extension Development Host | VS Code compile/tests + actual host executable | TextMate scopes, completion, formatting, navigation/rename, diagnostics; record default 1.85.0 failure and installed 1.143.1 run separately. | NOT RUN | R-099-01 tooling owner |
| `INT101-DESKTOP-01` | Desktop typecheck/web/RPC | `bun run typecheck`, `bun run build:web`, `bun run test` in isolated copy | Type/web pass/fail raw; desktop sandbox-count mismatch recorded without policy/assertion changes. | NOT RUN | Desktop RPC/security owner |
| `INT101-DESKTOP-02` | Desktop CodeMirror/Help UI | Focused V16 editor and Help Playwright tests in new output dir | Visible completion/format/navigation/diagnostic/help behavior; Vite harness only. | NOT RUN | Desktop/platform owner |
| `INT101-PLATFORM-01` | Native/package/other platform route | Inspect/attempt only under separately approved plan | Direct host evidence, or exact `BLOCKED/UNAVAILABLE`; no certification inference. | NOT RUN | Lead Developer/platform owner |

## Repository Verification and Preservation

| Evidence ID | Gate | Direct action | Required record | Status | Residual owner/disposition |
| --- | --- | --- | --- | --- | --- |
| `INT101-ROOT-01` | Fresh build | `bun run build` in isolated validation copy/output tree. | Build result; confirm fresh `dist/cli.js`; preserve root `dist/` and generated browser-runtime source. | NOT RUN | PENDING |
| `INT101-ROOT-02` | Full root test suite | `bun test` in isolated validation copy. | Complete test/file/assertion counts; all failures/retries; stale-dist dependency checks. | NOT RUN | PENDING |
| `INT101-ROOT-03` | Focused root tests/typecheck | Focused suites and `bunx tsc --noEmit`. | Exact per-surface counts; no inference from focused to full. | NOT RUN | PENDING |
| `INT101-PRESERVE-01` | Output and accepted records | Before/after inventory/hash per approved plan; `git diff --check`. | Existing dist/build/test-results/screenshots/evidence untouched; only approved files changed. | NOT RUN | PENDING |

## Accepted Residual Baseline to Carry Forward

| Residual ID | Accepted prior result | Sprint 101 treatment |
| --- | --- | --- |
| `R-099-01` | Default VS Code `bun run test` runner pins 1.85.0 below extension engine; compiled suite passed 26/26 on installed 1.143.1. | Re-run/report default and explicit installed host separately; do not change runner/version metadata to force green. |
| `R-099-02` | Linux Playwright used Ubuntu 24.04 fallback Chromium; native Electrobun and other OS/architectures untested. | Preserve Vite harness result; native/package route is separately tested or unavailable. |
| `R-099-03` | VS Code editor language-service reports Mocha ambient globals although configured compile-tests pass. | Preserve as tooling-only unless directly changed; no unrelated tsconfig edit. |
| `R-100-01` | Root full suite not run in Sprint 100; repository `dist/cli.js` intentionally stale/preserved. | Fresh isolated build and full suite required for Sprint 101; do not overwrite existing bundle. |
| `R-100-02` | Release/publication/integrated closeout not run. | Remains separate; Sprint 101 is not release authority. |
| `BASELINE-DESKTOP-RPC` | Prior desktop RPC test expects two sandbox attributes while current app has one; historical raw failure was separately accepted for V0.15. | Run current test; report outcome; never change sandbox/CSP/assertion solely to pass. |