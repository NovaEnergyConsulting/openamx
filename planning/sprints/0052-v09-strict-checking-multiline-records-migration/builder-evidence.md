# Sprint 052 Builder Evidence

Date: 2026-10-06

## Outcome and Disposition

The Sprint 052 implementation scope is complete and the acceptance evidence is recorded below. The separate Lead Developer disposition is **ACCEPTED WITH RECORDED RESIDUALS** (2026-10-06), following review of this evidence. The VS Code Extension Development Host suite retains five failures on this Windows host; those failures remain visible as accepted residuals rather than passing checks.

The implementation stays within unconditional static checking, canonical multiline record literals, and the related fixture/test migrations. It does not claim completion of V0.9 or any downstream sprint.

## Implementation and Cross-Surface Audit

| Surface / entry point | Check behavior | Regression evidence |
| --- | --- | --- |
| Direct and non-file-backed document evaluation | `evaluateDocument` calls `checkDocument` before creating/evaluating the runtime environment, without a checking-mode conditional. | `tests/evaluator.test.ts`: valid inference, invalid untyped rejection before evaluation, and direct execution coverage. |
| File-backed modules and imports | `loadEntryModule` checks each visited module before its execution. The prior options/imports-based gate is removed; graph ordering, containment, and single evaluation remain in the loader. | `tests/modules.test.ts`: invalid untyped imported module rejection and file-backed `AMX3006` preservation. |
| CLI | Run/render/report commands route through `loadEntryModule`; no CLI checking opt-out was found. | `tests/outputCli.test.ts`, `tests/modules.test.ts`, and affected report tests. |
| Shared editor analysis and completion | `analyzeEditorModules` checks entry and imported documents unconditionally. Completion consumes the shared analysis path. Parser syntax errors retain their code and source position and now gain the entry path when available. | `tests/editor.test.ts`; migrated host fixtures in `vscode-extension/src/test/providers.host.ts`. |
| Desktop worker | Worker execution routes through `loadEntryModule` and cannot bypass static checking. | `desktop-app/src/bun/jobWorker.test.ts`: invalid untyped program is rejected without a run result. |
| Desktop service | Diagnostics/completion and related analysis operations use shared `analyzeEditorModules`; the service no longer has a `checkingActivated` gate. | Desktop typecheck and the desktop test suite; shared analysis regressions in `tests/editor.test.ts`. |
| Checker activation helper | `checkingActivated` is retained for compatibility and now always returns `true`; no supported product caller uses it to skip checks. The only remaining gated caller is `desktop-app/spikes/sprint035-feasibility/editor-analysis.ts`, a feasibility spike, not a product entry point. | `tests/evaluator.test.ts` asserts the helper is always active; repository search confirmed the remaining spike-only use. |

`src/typechecker/checkDocument.ts` uses the approved `AMX3007` allocation for incompatible operator operands. Existing declaration, annotation, and record type-checking behavior is retained. Legacy record-constructor colons produce `AMX3006`, and that syntax diagnostic is preserved through module loading and editor analysis.

The parser collects balanced multiline expressions while ignoring structural delimiters inside strings. It supports nested records, existing list literals and parenthesized expressions, required commas and optional trailing commas. Statement parsing retains original LF/CRLF line and column positions. Formatting remains idempotent for valid forms and refuses invalid constructor syntax; the indentation adjustment fixes leading closing-brace accounting.

## Fixture and Test Migrations

Only repository-owned positive content or tests affected by strict checking or the approved constructor delimiter change were migrated:

| File(s) | Migration rationale |
| --- | --- |
| `examples/kitchen-sink.amx` | Replaced constructor field colons with `=` across nested records, computed values, and snapshots. Invalid extra/duplicate/missing-field examples remain intentionally invalid, but use canonical separators so they continue testing field validation rather than failing at the syntax layer. |
| `examples/typed-asset-analysis.amx`, `examples/typed-asset-analysis.html` | Updated the positive summary and result-row constructors in the source example and its generated HTML snapshot; declaration/annotation colons remain unchanged. |
| `examples/v05-asset-screening.amx` | Updated the result record constructor to the approved `=` form while preserving the screening example's intent. |
| `vscode-extension/src/test/providers.host.ts` | Migrated five positive host-test constructor examples so editor navigation/completion/diagnostic tests exercise valid source under the new syntax. |
| `tests/evaluator.test.ts`, `tests/modules.test.ts`, `tests/outputCli.test.ts`, `tests/renderer.test.ts`, `tests/reportDocx.test.ts`, `tests/reportPdf.test.ts` | Updated affected positive fixtures/expectations to remain type-valid or use canonical records under unconditional checking. Invalid cases were retained and continue to assert rejection at the correct static or runtime boundary. |
| `desktop-app/src/bun/jobWorker.test.ts` | Added rejection coverage proving an invalid untyped worker program does not produce a successful run result. |
| `tests/parser.test.ts`, `tests/formatter.test.ts`, `tests/editor.test.ts`, `tests/modules.test.ts` | Added or updated positive parsing/formatting coverage and explicit rejection/source-location tests for constructor-colon syntax, malformed separators, nesting, and LF/CRLF behavior. |

Historical documentation in `docs/language-spec-v0.3.md` and the V0.9 spec's explicitly invalid example were not migrated. Intentionally negative fixtures and tests were not deleted or weakened.

## Changed File List

Production implementation:

- `src/diagnostics/errors.ts`
- `src/editor/completion.ts`
- `src/editor/moduleAnalysis.ts`
- `src/formatter/formatAmx.ts`
- `src/parser/parseExpression.ts`
- `src/parser/parseStatements.ts`
- `src/runtime/evaluateDocument.ts`
- `src/runtime/moduleLoader.ts`
- `src/typechecker/checkDocument.ts`
- `desktop-app/src/bun/desktopService.ts`

Tests and positive fixtures:

- `tests/editor.test.ts`
- `tests/evaluator.test.ts`
- `tests/formatter.test.ts`
- `tests/modules.test.ts`
- `tests/outputCli.test.ts`
- `tests/parser.test.ts`
- `tests/renderer.test.ts`
- `tests/reportDocx.test.ts`
- `tests/reportPdf.test.ts`
- `desktop-app/src/bun/jobWorker.test.ts`
- `vscode-extension/src/test/providers.host.ts`
- `examples/kitchen-sink.amx`
- `examples/typed-asset-analysis.amx`
- `examples/typed-asset-analysis.html`
- `examples/v05-asset-screening.amx`

Planning/evidence:

- `planning/sprints/0052-v09-strict-checking-multiline-records-migration/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

The complete changed-file list contains 29 files: 25 implementation/test/fixture files and these four planning/evidence files. No dependency manifests were changed.

## Verification Results

| Command | Result |
| --- | --- |
| `bun test tests/parser.test.ts tests/formatter.test.ts tests/evaluator.test.ts tests/modules.test.ts tests/editor.test.ts tests/outputCli.test.ts tests/reportDocx.test.ts tests/reportPdf.test.ts tests/renderer.test.ts` | Pass: 194 tests, 0 failures, 730 expectations across 9 files. |
| `bun run build` | Pass; root TypeScript build (`tsc`). |
| `bun test` | Pass: 322 tests, 0 failures, 1,345 expectations across 27 files. |
| `bun test tests/release.test.ts -t "rejects inconsistent versions on a clean committed source tree"` | Pass: 1 test, 0 failures, 2 expectations. |
| `Set-Location desktop-app; bun test src/bun/jobWorker.test.ts src/bun/configuration.test.ts src/bun/desktopDataEditor.test.ts src/bun/desktopSettings.test.ts src/mainview/diagnosticSummary.test.ts src/mainview/starterExamples.test.ts` | Pass: 24 tests, 0 failures, 126 expectations across 6 files. |
| `Set-Location desktop-app; bun run typecheck` | Pass; Hutch prepare and `vue-tsc --noEmit`. |
| `Set-Location vscode-extension; bun run test` | Compile and test compilation pass. Extension Development Host: 14 pass, 5 fail. Repeated independently with the same outcome: four `EBUSY` temporary-directory removal failures and one Windows path-case assertion (`c:\...` versus `C:\...`) in navigation. These are recorded as an unresolved host-suite residual, not as a passing check. VS Code also logged a Python extension API proposal warning and Node's shell-argument deprecation warning. |
| `git diff --check` | Pass after final implementation, evidence, and planning edits. |

The first focused test run exposed that entry-document `AMX3006` parser errors from shared editor analysis had a source line/column but no file path. `locatedError` now fills a missing path without altering the error code or source location; focused and full root suites pass with the regression asserting the path, line, and column.

## Residuals and Lead Developer Request

- The VS Code host test command is not fully green on this Windows host; the five failures and exact observed causes are listed above. Compilation and test compilation succeed. The extension host suite must not be represented as passing.
- Lead Developer disposition: **ACCEPTED WITH RECORDED RESIDUALS**. Accepted residual: the Windows VS Code Development Host suite has 14 passes and 5 failures as detailed above. Compilation and test compilation pass, but the host suite is not green.
- No Sprint 053–058 feature work is claimed.
