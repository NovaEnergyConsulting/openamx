# Sprint 088 Builder Evidence: Editor, Examples, and Documentation

## Status

**SPRINT 088 ACCEPTED AND CLOSED.**

- Sprint 084 contract disposition: ACCEPTED by user on 2026-10-15.
- Sprint 085 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 086 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 087 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 087 focused direct Bun result: 141 passed, 0 failed across six
  files; core build, generated runtime inspection, and `git diff --check`
  passed.
- Full root, extension, desktop integrated acceptance and V0.14 closeout:
  NOT RUN; assigned to Sprint 089.
- Sprint 088 execution authorization: APPROVED by the user on 2026-10-16.
- Exact file-by-file implementation/evidence plan: APPROVED by the user on
  2026-10-16 and recorded below before implementation edits.
- Starting worktree: clean on branch `feat/create-v0.14`.
- Desktop native CDP/launch path: not supplied. The configured Playwright UI
  suite runs the Vite workflow harness; its UI results will be labeled as
  harness evidence, not native Electrobun-host evidence.
- Sprint 088 implementation and focused verification: COMPLETE within the
  approved plan.
- Builder recommendation: ACCEPT.
- Separate Lead Developer/product-owner disposition: ACCEPTED by the user
  on 2026-10-16 after local build/deployment validation of both editor
  clients.
- The user closed the former E-02 FAIL and E-14 BLOCKED/UNAVAILABLE
  dispositions as PASS; exact user confirmation is recorded below.

## Approved File-by-File Plan

| File | Approved change |
| --- | --- |
| `src/editor/completion.ts` | Add completion discoverability for `is`, `PI`, `E`, the approved math functions, and the text/format functions while preserving source-order visibility and existing incomplete-document behavior. |
| `src/editor/highlighting.ts` | Add parser-proven highlighting for the `is` operator and its type-reference target; preserve original-document offsets, inert content, and existing tokens. |
| `src/editor/symbols.ts` | Emit the `is` target as an existing type-reference occurrence so current navigation/hover/reference providers can use it; do not add new provider capabilities. |
| `tests/editor.test.ts` | Cover shared V0.14 completion, highlighting, type-target navigation facts, diagnostics, complete/incomplete source, CRLF/UTF-16 ranges, and existing behavior. |
| `vscode-extension/amx.tmGrammar.json` | Tokenize `is`, `PI`/`E`, and the approved built-in function names using current grammar scopes. |
| `vscode-extension/src/test/providers.host.ts` | Add Extension Development Host checks for V0.14 scopes, completion, accepted/invalid source diagnostics and ranges, formatting, and type-target navigation. |
| `vscode-extension/README.md` | Link the additive V0.14 specification and runnable examples without release/acceptance claims. |
| `desktop-app/src/mainview/components/help-content.json` | Add the unique searchable `language-v0.14` topic with contract-bounded content. |
| `desktop-app/tests/ui/help-center.pw.ts` | Assert the V0.14 topic ID, search terms, and visible content. |
| `desktop-app/tests/ui/v14-language-editor.pw.ts` | Add focused visible CodeMirror UI checks for V0.14 highlighting, completion, diagnostics/ranges, formatting idempotence, and Help discoverability through the existing Playwright harness. |
| `docs/language-spec-v0.14.md` | Add an accurate V0.14 specification grounded in accepted Sprint 084 artifacts and Sprints 085-087; state exclusions and non-acceptance/non-release status. |
| `README.md` | Link the V0.14 specification and examples additively and without overstating status. |
| `examples/v0.14-runtime-type-checks.amx` | Add a standalone runnable example of representative runtime `is` checks. |
| `examples/v0.14-math-and-measurements.amx` | Add a standalone runnable example of approved math functions/constants and Measurement behavior. |
| `examples/v0.14-text-and-formatting.amx` | Add a standalone runnable example of Unicode-aware text functions and supported numeric formatting/locales. |
| `tests/examples.test.ts` | Test specification/README/extension links, searchable Help, example analysis and execution with expected bindings, formatting idempotence, and approved diagnostic/source-range behavior. |
| `planning/sprints/0088-v14-editor-examples-documentation/builder-evidence.md` | Record this authorization and plan before implementation, then exact surface evidence, commands/results/counts, failures/retries, residuals, and disposition request. |
| `planning/state.md` | Record authorization, approved scope, execution status, evidence, and residuals. |
| `planning/decisions.md` | Record authorization, plan, scope boundaries, and any separately approved amendments/disposition. |
| `planning/questions.md` | Resolve the entry gate; track any implementation blocker, unavailable native-host path, or residual. |
| `planning/STATUS.json` | Set Sprint 088 to `building` after authorization; update only at close without implying Sprint 089 or release authority. |
| `planning/ARCHITECT_BRIEFING.md` | Add the Sprint 088 execution focus and refresh it when evidence and disposition request are complete. |

The existing desktop `CodeEditor.vue`, `App.vue`, and desktop service/provider
files are not approved for edits: they already consume the shared authoring
facts. The existing browser test harness will be reported explicitly as a
harness; no native-host result will be inferred. If a planned test demonstrates
that an additional production file is necessary, stop and request a prior
scope amendment. Any accepted-contract/implementation conflict is also a stop
condition; no parser, AST, type-checker, evaluator, standard-library,
diagnostic, or runtime behavior change is authorized.

### Generated outputs from approved verification only

The following output locations are approved only for normal output from the
listed verification commands. Preserve existing artifacts and do not clean
these locations:

- `src/renderer/diagramBrowserRuntime.ts` and root `dist/` from `bun run build`.
- `vscode-extension/dist/`, `vscode-extension/out/`, and
  `vscode-extension/.vscode-test/` from `bun run test`.
- `desktop-app/dist/` and `desktop-app/build/` from `bun run build:web`;
  `desktop-app/test-results/` from the focused Playwright tests.

No other generated output is approved. Inspect any tracked generated change;
if it is unexpected or outside these locations, stop before retaining or
editing it and request an amendment.

### Approved verification target

From the repository root:

```powershell
bun test tests\editor.test.ts tests\examples.test.ts tests\isTypeChecking.test.ts tests\v14MathLibrary.test.ts tests\v14TextFormatting.test.ts
bun run build
bun run dist\cli.js run examples\v0.14-runtime-type-checks.amx
bun run dist\cli.js run examples\v0.14-math-and-measurements.amx
bun run dist\cli.js run examples\v0.14-text-and-formatting.amx
git diff --check
```

From `vscode-extension`:

```powershell
bun run test
```

This runs the Extension Development Host. Compare inherited Windows
temporary-directory/path-case failures with recorded baselines; do not weaken
assertions or suppress first attempts.

From `desktop-app`:

```powershell
bun run typecheck
bun run build:web
bun run test:ui -- tests/ui/v14-language-editor.pw.ts tests/ui/help-center.pw.ts
```

The current Playwright configuration starts the Vite workflow harness. Record
whether each result exercises that harness or a real workbench/native host.
No native CDP path was supplied for this plan. The desktop RPC contract test
is not part of the focused target; its inherited sandbox-occurrence residual
remains separate and sandbox policy must not change. Full root/extension/
desktop integrated acceptance remains Sprint 089.

## Surface Evidence Matrix

| ID | Requirement/capability | Surface | Exact action / command / artifact | Result (`PASS` / `FAIL` / `BLOCKED/UNAVAILABLE` / `NOT RUN`) | Evidence location | Residual owner |
| --- | --- | --- | --- | --- | --- | --- |
| E-00 | Separate execution authorization and approved exact file/evidence plan | Sprint gate | User approved both separately on 2026-10-16; plan recorded above before implementation edits. | PASS | This file; `planning/state.md`; `planning/decisions.md` | Builder |
| E-01 | Shared services recognize `is`, constants, and functions | Root editor services | Approved focused Bun suite | PASS | 66 passed, 0 failed, 875 expectations across five files; `tests/editor.test.ts`: 25/0, 262 expectations. | Sprint 088 Builder |
| E-02 | Host-visible syntax, completion, diagnostics, ranges, formatting | VS Code Extension Development Host and locally deployed extension | `bun run test`; supplemental user local build/deployment test | PASS (automated aggregate failure disposition closed by user validation) | V0.14 host assertions passed; the 17/8 automated aggregate remains recorded below as historical output. User confirmed local deployed functionality on 2026-10-16. | Closed by Lead Developer / product owner |
| E-03 | Host-visible syntax, completion, diagnostics, formatting, Help | Desktop CodeMirror/workbench Vite harness | `bun run test:ui -- tests/ui/v14-language-editor.pw.ts tests/ui/help-center.pw.ts` | PASS (harness, not native Electrobun host) | Final retry: 3 passed; screenshot path recorded below. | Sprint 088 Builder |
| E-04 | V0.14 language contract accuracy | `docs/language-spec-v0.14.md` | Root V0.14 documentation regression | PASS | `tests/examples.test.ts` checks contract, status, math/text functions, Unicode set, pattern grammar, locales, rounding, units, and diagnostics. | Sprint 088 Builder |
| E-05 | User discoverability/links | Root README and VS Code guide | Root V0.14 documentation regression | PASS | `README.md`, `vscode-extension/README.md`, and all three runnable examples. | Sprint 088 Builder |
| E-06 | Searchable V0.14 language Help | Desktop Help | Root regression and focused Help UI test | PASS | Unique `language-v0.14` topic; local search/content assertions. | Sprint 088 Builder |
| E-07 | Runtime type-check example | Example analysis and execution | Root regression and direct CLI run | PASS | Structural, primitive, optional, list, enum, and Measurement result bindings. | Sprint 088 Builder |
| E-08 | Math/Measurement example | Example analysis and execution | Root regression and direct CLI run | PASS | All 15 functions, constants, scaled dimensionless Measurement, Measurement-aware operations, expected values/units. | Sprint 088 Builder |
| E-09 | Text/numeric formatting example | Example analysis and execution | Root regression and direct CLI run | PASS | Code-point length/slicing, trim, locales, patterns, currency, and displayed Measurement units. | Sprint 088 Builder |
| E-10 | Formatting idempotence and diagnostic/source ranges | Root and host tests | Root examples/editor tests, Extension Development Host, desktop UI harness | PASS | Formatter fixed point; exact `AMXSL004` original range; `AMX3001` type-target coordinates; visible UI range checks. | Sprint 088 Builder |
| E-11 | Root/editor regression and builds | Root, VS Code, desktop | Focused Bun suite, core build, desktop typecheck/web build, focused UI suite, `git diff --check` | PASS with E-02 residual | Root 66/0; core build, desktop typecheck/web build, desktop UI, and patch hygiene pass. | Sprint 088 Builder |
| E-12 | Scope review and separate disposition | All approved files/surfaces | `git status --short --branch`; evidence matrix; separate user disposition | PASS; Sprint 088 accepted | Only approved tracked files changed; no parser/type-checker/runtime/standard-library/diagnostic changes. | Closed |
| E-13 | V0.14-specific VS Code host behavior | VS Code Extension Development Host | V0.14 provider and actual TextMate grammar tests | PASS | New host test and V0.9-V0.14 grammar test pass on VS Code 1.85.0. | Sprint 088 Builder |
| E-14 | Native Electrobun desktop host | Locally deployed desktop app | Supplemental user confirmation of local build/deployment and functional testing on 2026-10-16 | PASS | Native run was not exercised by the Builder harness; user directly confirmed desktop functionality. No separate log or CDP artifact was supplied. | Closed by Lead Developer / product owner |

## Prior-Sprint Context and Baselines

Sprint 087 focused tests/build are prior-sprint evidence only. The full root
suite remains NOT RUN and assigned to Sprint 089. The Sprint 083 host record
shows seven inherited VS Code failures (five temporary-directory `EBUSY`
cleanup failures and two Windows drive-letter case comparisons). Sprint 088
retry showed the same path-case failures and six cleanup `EBUSY` errors; the
additional cycle-test cleanup error was intermittent. The desktop RPC
sandbox-occurrence residual (`2` expected, `1` actual at
`tests/rpc-contract-check.ts:152`) remains the Sprint 082/083 baseline and was
not rerun. No paths, assertions, or sandbox policy were weakened.

## Sprint 088 Evidence Log

### Shared services, examples, and root build

- Environment: Bun 1.4.2; Node.js v24.13.1.
- `bun test tests\editor.test.ts` — PASS, 25 tests, 0 failures, 262
  expectations. New cases cover completion in incomplete `is` expressions,
  operator/type highlighting, type-target symbol identity, valid target
  non-diagnostics, and `AMX3001` coordinates in CRLF text with preceding
  non-BMP text.
- Final focused command:
  `bun test tests\editor.test.ts tests\examples.test.ts tests\isTypeChecking.test.ts tests\v14MathLibrary.test.ts tests\v14TextFormatting.test.ts`
  — PASS, 66 tests, 0 failures, 875 expectations across five files.
- `tests/examples.test.ts` — PASS, 14 tests, 0 failures, 230 expectations.
  All three examples were analyzed and evaluated, compared with deterministic
  expected bindings, run through the CLI, and checked for formatter
  idempotence. The malformed-pattern fixture retained `AMXSL004`,
  `Incorrect formatting pattern`, line 5, column 24, covering `"0..00"`.
- `bun run build` — PASS. The generated
  `src/renderer/diagramBrowserRuntime.ts` remained unchanged; root `dist/`
  contains normal build output. `git diff --check` passed, with Git's
  autocrlf warning that the generated file's LF will be replaced by CRLF the
  next time Git touches it.
- Direct CLI commands from the approved plan all exited 0:
  `bun run dist\cli.js run examples\v0.14-runtime-type-checks.amx`,
  `bun run dist\cli.js run examples\v0.14-math-and-measurements.amx`, and
  `bun run dist\cli.js run examples\v0.14-text-and-formatting.amx`. Output
  bindings matched the assertions, including Measurement value/unit and
  locale/text results.

Root test attempts:

1. First combined run: 63 passed, 3 failed, 848 expectations. The
   documentation assertion assumed every function name was isolated in
   backticks; the example test also expected a simplified Measurement JSON
   shape and omitted the `parseDocumentText` import. These were test issues;
   no runtime contract was changed.
2. Second combined run: 65 passed, 1 failed, 860 expectations. The remaining
   assertion expected simplified Measurement serialization; it was corrected
   to assert the actual evaluator/CLI Measurement shape.
3. Final focused run: 66 passed, 0 failed, 875 expectations.

### VS Code Extension Development Host

- Environment: VS Code Extension Development Host 1.85.0. `bun run test`
  compiled the extension and host tests before launching the actual host.
- The V0.14 provider test passed: completion offers target types and
  constants/functions in an incomplete expression; a type target navigates
  and hovers at its declaration; formatting is idempotent; and an unknown
  target reports the expected source range.
- The actual TextMate grammar test passed for `is`, user type targets,
  `PI`/`E`, all 15 math functions, all five text/format functions, and inert
  Markdown.
- Attempt 1: 17 passed, 8 failed. The new grammar assertion incorrectly
  asked for `len` on the math-only sample line; other failures were five
  temporary-directory `EBUSY` cleanup errors and two case-sensitive Windows
  drive-letter comparisons.
- Retry after correcting only the grammar assertion: 17 passed, 8 failed.
  Both V0.14 tests passed; remaining failures were six temporary-directory
  `EBUSY` cleanup errors (one intermittent additional cycle-test cleanup
  error versus the earlier five-error baseline) and two drive-letter
  comparisons. No existing host behavior or assertions were changed to
  suppress them.

### Desktop CodeMirror/workbench UI and Help

- Environment: Playwright 1.63.0. The configured webServer command failed on
  Windows with `'.' is not recognized as an internal or external command`.
  Following the recorded workaround, the same Vite harness was started via
  Bun and returned HTTP 200 before Playwright was rerun.
- First harness run: 2 passed, 1 failed. The V0.14 CodeMirror test passed;
  the Help test used a non-contiguous search phrase that was not present as
  one searchable substring. The assertion was narrowed to `code points`.
- Final focused command:
  `bun run test:ui -- tests/ui/v14-language-editor.pw.ts tests/ui/help-center.pw.ts`
  — PASS, 3 tests, 0 failures. It covers visible `is`/type-target
  highlighting, incomplete-expression completion, `AMX3001` visible range,
  formatting idempotence, searchable Help content, and existing Help UI.
- These UI tests use the Vite workflow harness with the actual Vue/CodeMirror
  components and mocked RPC, not the packaged Electrobun host. The screenshot
  is
  `desktop-app/test-results/v14-language-editor.pw.ts--fc775--the-Vite-workbench-harness/v14-language-editor.png`.
- `bun run typecheck` — PASS. `bun run build:web` — PASS (3,273 modules
  transformed; worker bundle and native sharp/Roboto resource copies
  completed). Vite emitted its large-chunk advisory; the build exited 0.
- The Builder did not have a native desktop CDP/launch route, so this
  session's desktop UI test used the Vite harness. The user subsequently
  confirmed local build/deployment and functional testing of the desktop app;
  the native-host evidence disposition is closed as PASS. The desktop RPC
  security/sandbox test was not rerun, and its historical output is unchanged.

### Supplemental User Local-Deployment Validation

On 2026-10-16, the user reported building and deploying both the VS Code
Extension and desktop app locally and confirmed that the intended
functionality works. The user explicitly closed the prior E-02 FAIL and E-14
BLOCKED/UNAVAILABLE dispositions as PASS and approved Sprint 088 closure.
This is recorded as user-reported direct validation; no command transcript,
platform/version detail, or native-host artifact was supplied. The earlier
automated VS Code aggregate result (17 passed, 8 failed) remains accurately
recorded as a test-run result, but is no longer an open Sprint 088 residual.

### Scope and disposition

- Final `git status --short --branch` showed only files in the approved plan.
  The core generated browser runtime was unchanged. No parser, AST,
  type-checker, evaluator, standard-library, diagnostic, or runtime behavior
  files changed.
- Sprint 089 full root/extension/desktop integrated acceptance remains NOT
  RUN. No release, publication, version change, or platform certification
  occurred.

## Builder Recommendation and Disposition

**Builder recommendation: ACCEPT.** The focused
shared/root suite, builds, runnable examples, V0.14-specific VS Code host
checks, desktop Vite UI/Help checks, and user's local deployment validation
passed. The Extension Development Host aggregate's Windows cleanup/path
failures remain in the automated log but were closed by the user's direct
validation. These results do not establish Sprint 089 integrated acceptance.

**Separate Lead Developer/product-owner disposition: ACCEPTED**, approved by
the user on 2026-10-16 after local build/deployment validation of both
clients. Sprint 088 is closed. Sprint 089 integrated acceptance is not
inferred and requires its own authorization.
