# Sprint 099 Builder Evidence: Formatter and Editor Integration

## Status

**ACCEPTED/CLOSED WITH RECORDED RESIDUALS BY THE USER ON 2026-10-24.** Sprint
099 execution and its exact changed-path/host/evidence plan were separately
authorized before implementation. The builder recommendation was
`ACCEPT WITH RECORDED RESIDUALS`.

- Sprint 096 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24.
- Sprint 097 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24; runtime guard `AMXF4002` is accepted.
- Sprint 098 disposition: `ACCEPTED/CLOSED`, 2026-10-24; checker emits
  `AMXF4001` at the function closing brace.
- Sprint 099 execution authorization: APPROVED, 2026-10-24.
- Approved paths: `src/editor/completion.ts`, `src/editor/highlighting.ts`,
  `src/editor/symbols.ts`, `src/parser/parseStatements.ts`,
  `tests/editor.test.ts`, `tests/formatter.test.ts`, `tests/parser.test.ts`,
  `vscode-extension/amx.tmGrammar.json`,
  `vscode-extension/src/test/providers.host.ts`,
  `desktop-app/tests/ui/v16-language-editor.pw.ts`, and this evidence file.
- Starting branch/worktree: `feat/create-v0.16`, clean before implementation.
- Final tracked/untracked paths match the approved plan. No accepted Sprint
  095-098 record, runtime, type checker, desktop production integration,
  package/version/release file, or unrelated file changed.
- Existing generated outputs and test artifacts were preserved. The final
  desktop Playwright run wrote to a new output directory.
- Sprint 099 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, user,
  2026-10-24.
- Specification/examples, release, publication, and integrated V0.16
  closeout: NOT RUN / OUT OF SCOPE for Sprint 099.

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Entry authorization and approved file plan | User authorized execution and approved exact paths/hosts/evidence on 2026-10-24. | PASS | This status and changed-path ledger. | None |
| E-02 | Formatter function-body/idempotence behavior | Added direct/nested function and statement-loop formatting coverage, brace-containing strings, CRLF, expression-body spelling, Markdown/inert-fence preservation, idempotence, and evaluation parity. | PASS; existing `src/formatter/formatAmx.ts` needed no implementation change. | `tests/formatter.test.ts`; final shared run. | None |
| E-03 | Shared highlighting facts | Parameter/type/result-type ranges, statement keywords/expressions, assignment/list targets, locals, and iterators use AST-backed positions; narrative/inert fences remain excluded. | PASS. | `src/editor/highlighting.ts`; `tests/editor.test.ts`. | None |
| E-04 | Scoped completion | Braced and expression-bodied functions cover parameters, prior locals/functions/types, active iterators, nested branches, source order, shadowing, and caller/later/local exclusion. | PASS in shared tests and both host surfaces. | `src/editor/completion.ts`; `tests/editor.test.ts`; host tests. | None |
| E-05 | Local/parameter symbols and navigation | Parameter/local/iterator definition, references, rename identity, nested shadow separation, same-scope repeated-let updates, and iterator repeated-let identity covered. | PASS. | `src/editor/symbols.ts`; `tests/editor.test.ts`; VS Code host test. | None |
| E-06 | Function-body diagnostics/source mapping | Preserved `AMXF4001`, `AMX3002`, and `AMX3006`, including LF/CRLF and original closing-brace/return positions. | PASS in shared tests, VS Code host, and desktop UI harness. | `tests/editor.test.ts`; `providers.host.ts`; desktop UI test. | Desktop decoration retains the existing point/one-character contract. |
| E-07 | VS Code TextMate/provider host | Actual TextMate/Oniguruma tokenization covers function names, parameters/types, statements, strings, Markdown and inert-fence boundaries. Host providers cover scoped completion, formatting, parameter/shadow definition/references/rename, and diagnostics. | PASS: 26 tests on VS Code 1.143.1. | Grammar and host test; command below. | Default runner pins incompatible VS Code 1.85.0; see R-099-01. |
| E-08 | Desktop CodeMirror/Playwright host | Focused harness test proves shared highlights, scoped completion, format idempotence, function/parameter outline, local outline navigation, F12 parameter definition, and missing-return decoration. | PASS: 1 test. | `desktop-app/tests/ui/v16-language-editor.pw.ts`; final Playwright output directory. | Not native packaging/platform certification; see R-099-02. |
| E-09 | Focused shared tests/typechecks | Parser, formatter/editor suites; root TypeScript; desktop Vue typecheck; VS Code compile and test compile; whitespace check. | PASS: 109 tests, 0 failures, 615 assertions; typechecks pass; `git diff --check` clean. | Commands below. | VS Code editor diagnostics for Mocha globals are separate from configured `compile-tests`; see R-099-03. |
| E-10 | Specs/examples/release/integrated acceptance | Out of Sprint 099 scope. | NOT RUN by design | Sprint 099 acceptance | Sprints 100-101 |
| E-11 | Exact parameter/type source anchors | Corrected parameter-name, parameter-annotation, and function-result-type locations from offsets in the parsed signature; assertions cover CRLF and a non-BMP document prefix. | PASS: parser suite 60 tests/239 assertions; editor range assertions pass. | `src/parser/parseStatements.ts`; `tests/parser.test.ts`; `tests/editor.test.ts`. | None |

## Commands and Outcomes

- `bun test tests/parser.test.ts tests/formatter.test.ts tests/editor.test.ts` — PASS, 109 tests, 0 failures, 615 assertions.
- `bunx tsc --noEmit` — PASS, no output.
- An initial bare `bun run test` was inadvertently run at repository root while intending the VS Code package; it ran the root suite and reported 595 passed, 2 skipped, 1 failed on a then-incorrect symbol-test cursor. That test assertion was corrected; the final focused shared suites above pass. This intermediate run is not claimed as a full-suite acceptance gate.
- `cd vscode-extension && bun run compile && bun run compile-tests` — PASS.
- VS Code host — PASS, 26 tests: run `node -e 'const path = require("node:path"); const { runTests } = require("@vscode/test-electron"); runTests({ vscodeExecutablePath: "/usr/share/code/code", extensionDevelopmentPath: process.cwd(), extensionTestsPath: path.resolve("out/vscode-extension/src/test/suite/index.js"), launchArgs: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] }).catch(error => { console.error(error); process.exitCode = 1; });'` from `vscode-extension/`. Host is installed VS Code 1.143.1; actual TextMate tokenization passed.
- `cd desktop-app && bun run typecheck` — PASS; Electrobun prepare and `vue-tsc --noEmit` completed.
- `bun run test:ui -- tests/ui/v16-language-editor.pw.ts --output=test-results/sprint099-v16-ui-final5` from `desktop-app/` — PASS, 1 test.
- `git diff --check` — PASS, no whitespace errors.
- `bun run test` from `vscode-extension/` — compile steps passed; Extension Development Host failed before cases because its runner pins VS Code 1.85.0, below the extension's `^1.140.0` engine. The same compiled suite passed using installed VS Code 1.143.1 as recorded above. No runner or version metadata was changed.
- Playwright initially lacked its managed Chromium binary. `bunx playwright install chromium` installed Chromium/headless-shell v1248 in the user cache; Playwright used its Ubuntu 24.04 fallback build for this Linux OS. Focused acceptance then passed. Earlier test-result directories were preserved; final run used a new output path.

## Changed-Path Ledger

List only paths in the separately approved Sprint 099 plan. Record any
compiler/test-driven expansion and the separate approval before editing.

| Path | Approved purpose | Change/evidence |
| --- | --- | --- |
| `src/parser/parseStatements.ts` | Correct exact parameter-name, parameter-annotation, and function-result-type signature source anchors. | Changed; focused parser tests pass with CRLF and original document mapping. |
| `src/editor/highlighting.ts` | Walk function parameter and statement-body AST facts; expose parameter/local/iterator declarations and assignment targets. | Changed; shared highlighting tests pass. |
| `src/editor/completion.ts` | Provide cursor-sensitive completion for braced and expression functions without caller/document-binding capture. | Changed; shared, VS Code, and desktop acceptance pass. |
| `src/editor/symbols.ts` | Build parameter/local/iterator identities and resolve body references by lexical scope. | Changed; shadows and repeated-binding identity pass. |
| `tests/parser.test.ts` | Assert exact signature token locations. | Changed; parser suite PASS. |
| `tests/formatter.test.ts` | Assert statement-function/loop indentation, token spelling, boundaries, idempotence, and evaluation parity. | Changed; formatter suite PASS. |
| `tests/editor.test.ts` | Cover highlighting, completion, symbol/rename identity, and diagnostics. | Changed; shared editor suite PASS. |
| `vscode-extension/amx.tmGrammar.json` | Add function signature, parameter, and annotation TextMate scopes. | Changed; actual tokenizer test PASS. |
| `vscode-extension/src/test/providers.host.ts` | Test tokenizer and VS Code completion, formatting, navigation, rename, and diagnostics. | Changed; 26/26 Extension Development Host tests PASS on VS Code 1.143.1. |
| `desktop-app/tests/ui/v16-language-editor.pw.ts` | Focused CodeMirror acceptance through shared analysis. | Added; 1/1 Playwright test PASS. |
| `planning/sprints/0099-v16-formatter-editor-integration/builder-evidence.md` | Record authorization, exact paths, commands/results, and residuals. | Updated. |

## Residuals and Recommendation

Record every unavailable host/platform run, test failure, source-location
limitation, and owner. Do not infer full parity from one host's passing tests.

| ID | Residual | Status | Owner | Impact |
| --- | --- | --- | --- | --- |
| R-099-01 | Default VS Code test script pins 1.85.0, below the extension's `^1.140.0` engine, so the pinned run cannot load the extension. | OPEN, NON-BLOCKING | VS Code test-tooling owner | Compiled Extension Development Host suite passed 26/26 on installed VS Code 1.143.1 via explicit executable path; no runner/version metadata was changed. |
| R-099-02 | Playwright reports Linux unsupported and uses its Ubuntu 24.04 fallback Chromium build. Native Electrobun packaging and other OS/architectures were not tested. | RECORDED, NON-BLOCKING | Sprint 101 / platform acceptance owner | Focused CodeMirror harness test passed. No platform certification or native launch claim is made. |
| R-099-03 | VS Code editor diagnostics do not resolve ambient Mocha globals in `providers.host.ts`. After removing the test-only `Window` cast, the editor diagnostic cache continued reporting the removed cast verbatim; the source now uses runtime narrowing and Playwright passes. | OPEN, TOOLING-ONLY | Editor language-service/config owner | Configured VS Code `compile-tests`, desktop typecheck, and Playwright pass. No unrelated tsconfig or test contract was changed. |
| R-099-04 | Separate Sprint 099 disposition. | RESOLVED: user ACCEPTED/CLOSED Sprint 099 with recorded residuals on 2026-10-24. | User / Lead Developer | Sprint 100/101, integrated V0.16 closeout, release, publication, version changes, and platform certification remain independently gated. |

Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS.** User disposition:
**ACCEPTED/CLOSED WITH RECORDED RESIDUALS**, 2026-10-24. This evidence does not
authorize Sprint 100/101, integrated V0.16 closeout, release, publication,
version changes, or platform certification.