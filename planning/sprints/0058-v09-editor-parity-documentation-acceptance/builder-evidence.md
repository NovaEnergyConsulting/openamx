# Sprint 058 Builder Evidence

## Status

Builder implementation and available-host verification are recorded below. **Lead Developer disposition (2026-10-07): COMPLETE / APPROVED**, with the Hutch wrapper stall and unavailable TextMate-tokenizer run retained as unpassed verification residuals. Historical Windows findings remain distinct and unpassed; see below.

## Capability Matrix

| Capability | Surface and evidence | Result |
|---|---|---|
| V0.9 syntax, diagnostics, and original locations | Shared parser/editor; `tests/parser.test.ts`, `tests/editor.test.ts`, plus LF/CRLF provider tests | Existing behavior retained; focused regressions pass. No semantic or diagnostic allocation changes. |
| Formatting | Shared formatter and VS Code formatting provider; formatter covers valid multiline records, measurements, indexed reads, and list mutation | Meaning-preserving/idempotent formatting verified; invalid record constructor colons remain rejected. |
| Completion | Shared completion facts feed VS Code and desktop; added `dimension` and `unit` V0.9 keywords; editor and Extension Host tests | Corrected omission; draft completion verified. |
| Coloring | Shared AST highlighting recognizes dimension/unit declarations and measurement references; VS Code grammar now includes both declaration keywords | Corrected grammar rule and checked executable/inert fence grammar structure. Actual TextMate tokenization was unavailable on this host and is not claimed as passed. |
| Symbols and navigation | Shared facts and VS Code providers; imported dimension/unit definition, hover, references, source ranges, and rename are covered | Imported unit/dimension uses resolve to their declaring module; VS Code rename edits cover the entry and library. |
| Desktop editor | `CodeEditor.vue` consumes shared highlights, diagnostics, symbols, completion, and rename over the existing RPC boundary; RPC contract and Help UI checks pass | No client-specific parser or capability was added. Dedicated native-editor interaction was not run. |
| Docs, migration, examples, help | README/spec cross-links, three-section migration test, runnable imported JSON measurement/report example, bundled-help JSON/search/UI tests | Focused checks pass. Example covers module-owned units/types, JSON input/output, conversion, narrative interpolation, table, and chart. |

## Changed Files

- `README.md`
- `docs/language-spec-v0.9.md`
- `docs/migrating-to-v0.9.md` (new)
- `examples/libraries/travel-measurements.amx` (new)
- `examples/v09-measurement-report.amx` (new)
- `examples/v09-trips.json` (new)
- `src/editor/completion.ts`
- `src/editor/refactoring.ts`
- `tests/editor.test.ts`
- `tests/examples.test.ts`
- `tests/formatter.test.ts`
- `vscode-extension/amx.tmGrammar.json`
- `vscode-extension/src/test/providers.host.ts`
- `desktop-app/src/mainview/components/help-content.json`
- `desktop-app/tests/ui/help-center.pw.ts`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/sprints/0058-v09-editor-parity-documentation-acceptance/acceptance.md`
- `planning/sprints/0058-v09-editor-parity-documentation-acceptance/builder-evidence.md`

No parser, checker, evaluator, report, or data semantics were changed. Negative tests were retained.

## Verification

Host: Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`; Bun `1.4.2`; Node `v24.14.1`; VS Code Extension Development Host `1.85.0`.

| Command/check | Result |
|---|---|
| Focused root tests: parser, formatter, editor, modules, examples, measurement data, input/output data, renderer, PDF, and DOCX | 154 passed, 0 failed. |
| `bun run build && bun test` | TypeScript build passed. Root tests: 377 passed, 2 skipped (Windows shim tests), 0 failed; 1,875 expectations across 31 files. |
| `bun run --cwd vscode-extension test` | Extension compile passed; test compile passed; Linux Extension Development Host 22 passed, 0 failed. Added completion, grammar-structure, and imported unit/dimension navigation/rename cases all pass. |
| `bun run --cwd desktop-app test` | Desktop RPC/workflow contract check passed, including typed webview boundary, session/workflow assertions, and `Final active resources: []`. |
| `bun run --cwd desktop-app typecheck` | Wrapper stalled in `hutch electrobun prepare` before `vue-tsc`; the idle Hutch process was stopped after 7m47s. The direct equivalent, `./node_modules/.bin/vue-tsc --noEmit` from `desktop-app/`, passed. |
| `bun run --cwd desktop-app build:web` | Wrapper also requires the stalled Hutch prepare step and was not reported as passed. Direct steps passed: `./node_modules/.bin/vite build` (3,272 modules; existing >500 kB chunk warning), `bun build src/bun/jobWorker.ts --target=bun --outfile=dist/jobWorker.js`, `bun run scripts/copy-sharp-runtime.ts`, and `bun run scripts/copy-pdfmake-fonts.ts`. |
| `bun run test:ui -- tests/ui/help-center.pw.ts` from `desktop-app/` | 2 passed, 0 failed; local Help search/content, preserved actions/offline behavior, and viewport layout verified. |
| `bun test` from `desktop-app/` | 28 passed, 0 failed across 8 files. |
| `bun test tests/release.test.ts --test-name-pattern 'isolates two fixture versions'` | The fixture that timed out in an earlier full run passed alone (1 passed, 54 filtered, 0 failed, 75.09 ms). The final full root run passed. No release code was changed. |
| CLI example run/render using `examples/v09-measurement-report.amx` and `examples/v09-trips.json` | Both completed; JSON output retains value/unit forms and HTML shows converted measurement values, unit-aware table cells, and chart output. The same paths are asserted in `tests/examples.test.ts`. |
| `git diff --check` on owned tracked files; trailing-whitespace scan on new files | Passed. |
| `get_errors` on modified TypeScript test/provider files | No errors found. |

## Grammar Test Boundary

The workspace has no `vscode-textmate` dependency, and none is available in the installed Extension Development Host module tree. The host regression separately inspects the grammar keyword rule and executable/inert fence definitions, but this is not equivalent to running the TextMate tokenizer. No dependency was added solely for this sprint. A tokenizer-backed coloring result remains unverified and is submitted for Lead Developer disposition.

## Platform Residuals

Historical findings are retained separately and remain unpassed:

- Sprint 053 Windows Extension Development Host: 13 passed / 6 failed (five `EBUSY` cleanup failures and one drive-letter case assertion).
- Sprint 054 Windows desktop RPC path-separator assertion failed; Windows Extension Development Host: 15 passed / 5 failed (four `EBUSY` cleanup failures and one drive-letter case assertion).
- Sprint 057 Windows desktop RPC path-separator assertion failed; Windows Extension Development Host: 15 passed / 5 failed (four `EBUSY` cleanup failures and one drive-letter case assertion).

This run was on Linux; those Windows results were not rerun or relabeled. Native Electrobun desktop interaction and Windows/macOS host certification were not performed. The available-host Hutch prepare stall and the tokenizer boundary above are Sprint 058 verification residuals, not passes.

## Disposition Request

The Lead Developer accepted Sprint 058 as **COMPLETE / APPROVED** on 2026-10-07 with the recorded TextMate-tokenizer and Hutch-wrapper residuals. These remain unpassed checks, not waived passes. Sprint closeout does not claim final V0.9 acceptance, native/platform certification, or publication.
