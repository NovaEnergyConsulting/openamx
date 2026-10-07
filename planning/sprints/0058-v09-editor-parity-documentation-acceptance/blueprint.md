# Sprint 058 Blueprint: Editor Parity, Documentation, and V0.9 Acceptance

## Approach

1. Verify the entry gate from planning records: Sprints 053, 054, and 057 are **COMPLETE / APPROVED**. Read their evidence and preserve their distinct unpassed Windows RPC/Extension Development Host results as residuals, not passes.
2. Read the V0.9 language contract and approved Sprint 051 appendix before changing editor code or user docs. Use the approved conformance/migration matrix as the semantic checklist; do not reopen language design.
3. Audit each feature in shared editor analysis/formatter (`src/editor/`, `src/formatter/formatAmx.ts`), VS Code providers and grammar (`vscode-extension/src/providers/`, `vscode-extension/amx.tmGrammar.json`), and desktop editor/worker/RPC (`desktop-app/src/mainview/`, `desktop-app/src/bun/`, `desktop-app/src/shared/`). Track capability-by-capability status and only patch verified gaps.
4. Add focused shared-editor and client tests for all applicable V0.9 syntax and symbols: `=`, escaped/interpolated strings, indexes and mutation statements, dimensions/units/measurements, imported declarations, diagnostics, completion, hover/type facts, definition/references/rename, outline, and formatting. Verify invalid/incomplete drafts, LF/CRLF original-document ranges, executable versus inert fences, and imported identity. Exercise TextMate grammar separately from AST-backed analysis.
5. Preserve architecture boundaries: shared facts remain derived from the existing parser/module analysis; client providers transport/display those facts. Do not duplicate parsing or let a client's grammar accept syntax rejected by the shared checker. Keep missing capability N/A where a client does not expose it rather than adding a new feature.
6. Update `docs/language-spec-v0.9.md` and `README.md` for accurate discoverability only. Add `docs/migrating-to-v0.9.md` with concise before/after examples for the three approved compatibility shifts: record-constructor delimiters, escaped backslashes/finite escapes, and strict checking. Explicitly retain annotation colons and explain that formatting neither repairs old syntax nor migrates projects.
7. Add or update representative `.amx` examples using current syntax and imports, including measurements/data/reporting where appropriate. Execute every changed example through existing `tests/examples.test.ts` mechanisms. Keep historical specs and intentional negative fixtures unchanged.
8. Update `desktop-app/src/mainview/components/help-content.json` with local-searchable, concise V0.9 syntax/migration topics. Preserve its JSON schema, unique IDs, offline behavior, existing action wiring, and command-registry shortcut ownership; add or extend UI tests for discoverability and exact contract statements.
9. Run focused parser/formatter/evaluator/module/data/report/editor tests; root `bun run build` and `bun test`; VS Code `bun run --cwd vscode-extension test`; desktop RPC checks, typecheck/build, and focused Playwright checks. Run only relevant checks where platform limitations make a command unavailable, recording exact outcomes. Check `git diff --check` on owned paths and record full-tree failures without touching unrelated files.
10. Perform integrated acceptance using representative V0.9 documents and examples through shared analysis, VS Code, desktop, and CLI/report paths. Compare parser/checker diagnostics and source positions, formatting meaning/idempotence, emitted values/report output, and docs/help statements against the contract. Record the exact host, commands, totals, artifacts, and residuals in `builder-evidence.md`.
11. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with scope completed, evidence, any narrowly unresolved questions, residuals, and a separate Lead Developer disposition request. Do not self-accept Sprint 058 or claim integrated V0.9 completion before that disposition.

## Files to Update

- Shared editor analysis, formatter, VS Code providers/grammar, and desktop editor/worker/RPC only where a reproducible V0.9 parity defect is found
- Focused `tests/editor.test.ts`, `tests/formatter.test.ts`, related parser/module tests, VS Code host/grammar tests, and desktop editor/help UI tests as directly needed
- `docs/language-spec-v0.9.md`, `README.md`, new `docs/migrating-to-v0.9.md`, representative examples, and bundled `help-content.json`
- `planning/sprints/0058-v09-editor-parity-documentation-acceptance/builder-evidence.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

Do not modify previous sprint dispositions or unrelated historical planning/specification files.

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| Cross-feature analysis | Shared analysis and each applicable client recognize all delivered V0.9 features and return consistent diagnostics/types/symbol facts. |
| VS Code coloring | TextMate tokenization agrees with AST-derived behavior for feature syntax, malformed/incomplete drafts, strings, imports, and executable/inert fences. |
| Navigation and symbols | Definitions, references, rename, outline/symbols, completion, hover/type information, and ranges handle dimensions/units, imported identity, fields, indexes, and functions wherever supported. |
| Formatting | Valid V0.9 source formats idempotently without changing meaning; invalid record-colon syntax is rejected, not repaired. |
| Locations | LF and CRLF variants preserve original-document 1-based locations and editor offsets across narrative/fences/imported files. |
| Documentation and migration | README links to the current spec; migration guidance accurately explains only approved breaking changes and preserves annotation-colon syntax. |
| Examples and help | Changed examples execute; bundled help accurately explains V0.9, is discoverable through local search, and retains current UI actions/shortcuts. |
| Integrated workflow | Representative V0.9 documents pass available CLI, shared editor, VS Code, desktop, input/output, and report checks without contradictory client behavior. |
| Evidence and residuals | Exact validation results and each platform residual are reported distinctly; no failed/unavailable check is labeled passed. |

## Verification

- Focused root tests: parser, formatter, editor, modules, examples, input/output, measurement/report tests implicated by changes.
- Root gates: `bun run build`, `bun test`.
- VS Code: `bun run --cwd vscode-extension test` (compilation, test compilation, and host results recorded separately).
- Desktop: `bun run --cwd desktop-app test`, `bun run --cwd desktop-app typecheck`, `bun run --cwd desktop-app build:web`, and focused `bun run --cwd desktop-app test:ui -- ...` where supported.
- For docs/help/examples, assert link targets and exact user-facing behavior through repository tests or focused validation; execute each changed example.
- Run `git diff --check` on owned paths. If full-worktree validation finds unrelated content, record it without modifying that content.

Record exact commands, counts, platform/host, changed files, example outputs/screenshots when applicable, failures, and residuals in Builder evidence.

## Notes

- The approved master-plan dependencies are Sprint 053, Sprint 054, and Sprint 057. Sprint 056 and Sprint 055 rules are consumed through their approved implementation and registry.
- The master plan remains the authority on scope. This sprint completes parity/documentation/integration work; it is not a release, platform certification, or automatic acceptance of prior residuals.