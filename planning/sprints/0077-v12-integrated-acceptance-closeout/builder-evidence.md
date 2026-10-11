# Sprint 077 Builder Evidence: V0.12 Integrated Acceptance and Closeout

## Authorization, Scope, and Environment

The Lead Developer explicitly authorized Sprint 077 and approved the concrete file-by-file verification/evidence plan before test or planning-file edits. Sprint 077 was kept verification-only: no language semantics, production parser/runtime/formatter/editor behavior, diagnostic identities/ranges, filesystem policy, or security boundary was changed.

The only test-surface changes were:

- `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts` — the existing browser harness now feeds the real workbench from the shared parser, type checker, highlighting, completion, and symbol services for a single in-memory document. It uses the browser-compatible `checkDocument` path rather than importing Node `path`/`fs` through module analysis.
- `desktop-app/tests/ui/v12-language-editor.pw.ts` — direct Playwright coverage for the real `App.vue`/`CodeEditor.vue` CodeMirror workbench: syntax decorations, a visible diagnostic at its source location, enum-member completion, and definition navigation.

No production file was changed. The Playwright workflow harness uses mock desktop RPC and is not a launch/certification test of the packaged native application.

Environment observed during verification: Windows x64; Bun 1.4.2; Node v24.13.1; VS Code Development Host 1.85.0; Vite 6.4.3. Git branch at entry: `feat/create-v0.12`; entry worktree was clean.

## Sprint 076 Comparison Baseline

| Surface | Sprint 076 baseline |
|---|---|
| Root focused tests/build | Focused suites: 208 passed, 1 inherited failure (`tests/editor.test.ts:73`); root build passed. |
| Root full suite | Retry: 460 passed, 1 failed across 461 tests / 35 files; imported dimension/unit symbol identity at `tests/editor.test.ts:73`. An earlier full run also had one timing-sensitive worker timeout, which passed in isolation and on the retry. |
| VS Code | Latest Development Host run: 16 passed, 7 failed; five Windows `EBUSY` temp-directory cleanups and two path-case comparisons. V0.12-specific host test passed. |
| Desktop | Typecheck, web build, and Help UI passed. RPC runner stopped at the inherited sandbox assertion (expected two `sandbox="allow-scripts"` matches, found one); preceding V0.12 RPC assertions completed. No user-visible V0.12 CodeMirror editor test was recorded. |

## Integrated Master-Plan-to-Evidence Matrix

Every listed outcome is surface-specific. A root/shared-service or RPC result is not treated as proof of VS Code or user-visible desktop behavior.

| Requirement / fixtures | Surface | Exact verification and direct evidence | Status | Residual owner / follow-up |
|---|---|---|---|---|
| Single, multiple, and transitive inheritance; deterministic effective fields; complete child construction; complete override replacement; no subtyping (`RI-V01`–`RI-V03`, `RI-I08`, `RI-I09`) | Core | `bun test tests\parser.test.ts tests\evaluator.test.ts tests\formatter.test.ts tests\editor.test.ts tests\modules.test.ts tests\examples.test.ts`; evaluator cases for `RI-V01`–`RI-V03`, effective order, overrides, and construction passed; invalid assignment/missing inherited field cases passed. | PASS | None. |
| Exported/imported parent and private-parent/source-order behavior (`RI-V04`, `RI-I04`–`RI-I07`, `RI-I10`) | Core/modules | Same focused root command; `tests\modules.test.ts` imported/exported parent cases and evaluator fixture diagnostics passed. | PASS | None. |
| Inheritance collisions, override errors/cycles, established type and module categories, and original fixture locations (`RI-I01`–`RI-I10`) | Core diagnostics | Same focused root command; approved `AMX3011`–`AMX3014` and established diagnostic cases passed at fixture locations. | PASS | None. |
| Implicit enum values from 1; homogeneous explicit primitive values; member access remains primitive; import/export (`EN-V01`–`EN-V04`) | Core/runtime/modules | Same focused root command; evaluator cases for implicit/explicit values and `tests\modules.test.ts` imported enum case passed. | PASS | None. |
| Empty/duplicate/mixed/partial/expression enum rejection; malformed/forward/private cases; numeric and duplicate String values (`EN-I01`–`EN-I09` plus String duplicate) | Core diagnostics | Same focused root command; evaluator/parser/module fixture tests passed with approved `AMX3015`–`AMX3020` and established categories/locations. | PASS | None. |
| Retained legacy conditional; braced expressions/statements, all-path returns, nesting, local return, scopes, outer assignment, selected-branch evaluation (`IF-V01`–`IF-V06`) | Core/runtime | Same focused root command; parser and evaluator fixture groups passed, including legacy behavior and selected-branch-only evaluation. | PASS | None. |
| Missing `else`, missing return, branch-local escape, non-Boolean condition, incompatible branch values (`IF-I01`–`IF-I05`) | Core diagnostics | Same focused root command; fixture diagnostics passed, including `AMX3021` at the approved fallthrough closing brace. | PASS | None. |
| Approved `AMX3011`–`AMX3021` identities and source locations; established `AMX3001`, `AMX3002`, `AMX3006`, `AMX5002`; LF/CRLF editor/source coordinate mapping | Core/shared editor | Focused root run plus final `bun test`; V0.12 diagnostic-identity/original-position and LF/CRLF cases passed. The imported dimension/unit identity test also passes after making its fixture paths platform-native. | PASS | None. |
| Formatter idempotence, parse-format-parse acceptance, and evaluated meaning for inheritance, overrides, enums, braced/nested conditionals, and legacy `if` | Core formatter | Same focused root command; V0.12 formatter case in `tests/formatter.test.ts` passed. | PASS | None. |
| V0.12 language specification, README links, and both runnable examples match the accepted contract | Documentation/examples | Read-only comparison of `docs/language-spec-v0.12.md`, `README.md`, and `examples/v0.12-records-and-enums.amx` / `examples/v0.12-braced-if.amx`; the `tests/examples.test.ts` V0.12 link-and-execution test passed in the focused root command. | PASS | None. |
| Searchable V0.12 desktop Help and preserved V0.9 topic | Desktop Help UI | `bun run test:ui -- "help-center|v12-language-editor"` from `desktop-app`; both `help-center.pw.ts` tests passed. | PASS | None. |
| Shared editor facts for new syntax, inherited fields, enums, completion, symbols, and nested `if` | Core/shared editor | Focused root run plus final `bun test`; V0.12 fact test and imported dimension/unit declaration identity test passed. | PASS | None. |
| Actual TextMate scopes, formatting, diagnostics/ranges, completion, outline, and navigation for representative V0.12 fixtures | VS Code Development Host | `bun run test` from `vscode-extension`; `tokenizes V0.9 and V0.12 syntax...` and `provides V0.12 completion, outline, navigation, formatting, and diagnostic ranges` passed on both runs. | PASS | No V0.12-specific host failure. The complete runner is not green (see next row). |
| Full VS Code Development Host outcome | VS Code aggregate | First `bun run test`: 16 passed / 7 failed. Retry: 17 passed / 6 failed. First-run failures were five `EBUSY` temp-directory cleanup errors and two case-sensitive path comparisons (`c:\...` vs `C:\...`). Retry retained four `EBUSY` errors and the same two path-case comparisons. No path or cleanup behavior was broadened. | FAIL | VS Code test/Windows host owners; disposition the inherited temp cleanup and path-case residuals. |
| V0.12 syntax and references visibly highlighted, with a valid member navigation target in shared analysis | Desktop CodeMirror UI | The focused browser workbench test checks `.amx-token-keyword`, `.amx-token-declaration`, `.amx-token-field`, `.amx-token-reference`, and confirms shared symbol facts include the enum member use. | PASS | Navigation action outcome is separately FAIL; shared facts do not imply user-visible navigation. |
| V0.12 duplicate enum diagnostic displayed on the offending member | Desktop CodeMirror UI | The same UI suite checks the shared payload `AMX3016`, line 4, column 3, then asserts the rendered `.amx-diagnostic` mark is `A` on the `  ACTIVE` line. | PASS | None for this representative UI diagnostic. |
| Completion of an enum member in the desktop CodeMirror editor | Desktop CodeMirror UI | The focused test places the cursor after `Status.` and invokes `Control+Space`; the visible `.cm-tooltip-autocomplete` contains `ACTIVE`. | PASS | None for this representative completion. |
| Definition navigation from a V0.12 enum-member reference | Desktop CodeMirror UI | Automated Playwright action in `v12-language-editor.pw.ts` did not observe navigation to the declaration; this automated failure remains recorded. On 2026-10-11, the Lead Developer reported separately checking the behavior and confirmed it works as expected; no detailed action log or artifact was supplied. | FAIL (automated); PASS (Lead Developer follow-up confirmation) | No closeout follow-up required per Lead Developer disposition. The automated result is not erased or relabeled. |
| V0.12 desktop shared-analysis RPC facts, completion/symbol/highlight output, and `AMX3021` source location | Desktop RPC | `bun run test` from `desktop-app`; V0.12 RPC assertions in `tests/rpc-contract-check.ts` (including `ACTIVE`, inherited `id`, highlighting/symbol facts, and `AMX3021` line 6, column 1) completed before the later assertion at line 152. | PASS (V0.12 assertions only) | This does not promote the complete RPC runner to PASS. |
| Complete desktop RPC contract runner, including inherited sandbox/CSP contract | Desktop RPC aggregate | `bun run test` from `desktop-app`; failed at `tests/rpc-contract-check.ts:152`: expected two `sandbox="allow-scripts"` matches, found one. No sandbox/CSP change was made. | FAIL | Desktop RPC/security-boundary owners; disposition the inherited assertion without relaxing sandbox/CSP. |
| Desktop TypeScript and web workbench build | Desktop build | `bun run typecheck` and `bun run build:web` from `desktop-app`; both exit 0. Vite emitted only the existing large-chunk advisory. | PASS | None. |
| Focused root semantic/editor/docs suite aggregate | Root aggregate | Initial focused run: 222 passed, 1 failed, 1,051 expectations across six files. The failure was due to fixture paths using inconsistent Windows path forms. The test fixture now uses `resolve()` for entry and imported module paths; the targeted editor test file then passed all 19 tests. | PASS (after test fixture correction) | None. |
| Root TypeScript build | Root build | `bun run build`; `tsc` exit 0. | PASS | None. |
| Full root suite | Root aggregate | Before the test fixture correction: 460 passed, 1 failed, 2,630 expectations across 461 tests / 35 files; the failure was `tests/editor.test.ts:73`. Final rerun after correction: `bun test`, 461 passed, 0 failed, 2,635 expectations across 461 tests / 35 files. No worker timeout occurred. | PASS (final rerun) | None. |

## Verification Results and First-Run / Retry Record

| Command / action | First result | Retry / final result |
|---|---|---|
| Root focused: `bun test tests\parser.test.ts tests\evaluator.test.ts tests\formatter.test.ts tests\editor.test.ts tests\modules.test.ts tests\examples.test.ts` | FAIL — 222 passed, 1 failed, 1,051 expectations / 223 tests / 6 files. Only the imported dimension/unit symbol identity check at `tests/editor.test.ts:73` failed. | Corrected the test fixture to use `resolve()` paths; `runTests` on `tests/editor.test.ts` reported 19 passed / 0 failed. Final `bun test` below passed. |
| Root build: `bun run build` | PASS — `tsc`, exit 0. | N/A. |
| Root full suite: `bun test` | FAIL — 460 passed, 1 failed, 2,630 expectations / 461 tests / 35 files. The sole failure was the same `tests/editor.test.ts:73` assertion. | Not retried: result exactly matched Sprint 076's retry baseline. Sprint 076's separate initial worker timeout is retained in the baseline; it did not occur here. |
| VS Code: `bun run test` from `vscode-extension` | FAIL — 16 passed, 7 failed. Five Windows `EBUSY` cleanup failures and two path-case comparisons. V0.12 TextMate/provider tests passed. | FAIL — 17 passed, 6 failed; same two path-case failures and four `EBUSY` cleanup failures. Retry does not erase first result. |
| Desktop typecheck: `bun run typecheck` from `desktop-app` | PASS — `hutch electrobun prepare` and `vue-tsc --noEmit`. | N/A. |
| Desktop web build: `bun run build:web` from `desktop-app` | PASS — Vite build, worker bundle, Sharp runtime and PDF font copy completed; one large-chunk advisory. | N/A. |
| Desktop RPC: `bun run test` from `desktop-app` | FAIL — V0.12 checks completed; then line 152 sandbox count failed, expected 2 / actual 1. | Not retried: matches the exact inherited Sprint 076 assertion and is not altered. |
| Desktop UI: `bun run test:ui -- "help-center|v12-language-editor"` from `desktop-app` | FAIL — 4 passed, 1 failed; navigation did not move from use to definition. Help (2 tests), completion, and visible diagnostic passed. | FAIL — same 4 passed / 1 failed and same navigation behavior. |
| Desktop UI server setup | Initial root-directory invocation failed with `Script not found "test:ui"`. Correct-directory invocation failed because configured `./node_modules/.bin/vite` was not executable by the Windows shell; backslash file-path regexes then selected no tests. | Used the Sprint 076 Node Vite workaround (`node .\node_modules\vite\bin\vite.js ...`); verified `http://127.0.0.1:4183/` returned HTTP 200 before Playwright. Playwright path selection used the `help-center|v12-language-editor` filename regex. Temporary server was stopped afterward. |
| Test-harness iteration | An early browser harness attempt imported shared module analysis that uses `node:path`; Vite externalized it for browser compatibility. Early completion attempts also placed the cursor outside the incomplete expression. | Reused browser-compatible `parseDocumentText`/`checkDocument` and the existing shared editor facts. Final completion and diagnostic tests pass; automated navigation remained failing. The Lead Developer subsequently reported direct verification that behavior works as expected. |

## Subsequent Verification and Lead Developer Disposition

After the initial closeout submission, the imported-symbol failure was traced to inconsistent fixture path forms on Windows and corrected in `tests/editor.test.ts` by using `resolve()` for both `entryFile` and `moduleFile`. This test-only correction does not change production path behavior.

| Follow-up verification | Result |
|---|---|
| `runTests` for `tests/editor.test.ts` after the fixture-path correction | PASS — 19 passed, 0 failed. |
| Final `bun test` after the fixture-path correction | PASS — 461 passed, 0 failed, 2,635 expectations across 461 tests / 35 files. |

The earlier focused/full root failures remain recorded as first-run evidence, but are resolved by the test fixture correction and passing full-suite rerun. This supersedes the earlier root residual status in the matrix.
The `Not retried` entry in the initial root-full-suite row is likewise superseded: the final `bun test` rerun after the fixture correction passed.

The automated Playwright definition-navigation check remains FAIL as recorded. Separately, on 2026-10-11, the Lead Developer reported checking the behavior and confirmed it works as expected. The manual confirmation is not an automated test artifact and does not erase the Playwright result.

**Lead Developer disposition (2026-10-11, 10:00 +08): ACCEPTED / CLOSED.** The Lead Developer approved and closed Sprint 077 and V0.12, accepting the named VS Code, desktop RPC, and automated desktop UI residuals for closeout. The Lead Developer states that V0.12 is ready for release. No software release, publication, package/version update, or platform certification was performed or authorized by Sprint 077.

## Residuals, Owners, and Boundaries

- **Root historical failure RESOLVED:** the initial `tests/editor.test.ts:73` imported dimension/unit identity failure was due to inconsistent fixture path forms. After replacing pseudo-absolute paths with `resolve()` and rerunning the full root suite, all 461 tests pass.
- **VS Code FAIL:** Windows `EBUSY` temp cleanup and path-case comparisons. Same failure family as Sprint 076; owner: extension test/Windows host owner.
- **Desktop RPC FAIL:** sandbox count (`expected 2, found 1`) at `desktop-app/tests/rpc-contract-check.ts:152`; V0.12 assertions precede it and passed. Owner: desktop RPC/security-boundary owner. Do not relax sandbox/CSP.
- **Desktop UI automated FAIL:** the Playwright definition-navigation action did not observe movement despite valid V0.12 symbol facts. The Lead Developer reports separately checking and confirming the behavior works as expected; the automated failure remains historical evidence accepted for closeout.
- **Intermittent worker timeout:** Sprint 076's first-run mapped-data worker timeout passed on isolation and full-suite retry. Sprint 077's full root run had no timeout. The earlier failed run remains part of the baseline record.
- One root-generated output directory, `openamx-output-test-1791652007171-xzs7tn9mu2/`, was retained rather than removed. Playwright failure contexts remain under the existing ignored `desktop-app/test-results/` location; no screenshot was captured for the new test.

No inherited VS Code, desktop RPC, or automated UI failure is relabeled as PASS. The root test failure was resolved by the test-only fixture path correction. No feature, production path policy, security boundary, package/version, release, publication, or certification behavior was changed.

## Closeout Recommendation and Disposition

**Builder recommendation at initial submission: BLOCKED / OPEN.** Core language, formatter/documentation, VS Code V0.12-specific host behavior, desktop Help, and desktop CodeMirror highlighting/diagnostic/completion had direct passing evidence. The complete VS Code and desktop RPC runners retained their inherited failures, the root suite had its imported-dimension identity fixture failure, and the automated desktop definition-navigation test failed on retry. This recommendation was superseded by the explicit Lead Developer disposition above.

The Lead Developer's ACCEPTED / CLOSED decision is the separate disposition; Builder evidence alone did not make that decision. Release readiness is recorded as the Lead Developer's assessment and does not represent that a release/publication operation occurred.
