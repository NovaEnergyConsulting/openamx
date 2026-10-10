# Sprint 076 Builder Evidence: V0.12 Editor and Language Documentation Integration

## Authorization and Contract

The Lead Developer explicitly authorized Sprint 076 execution and approved the concrete file-by-file implementation plan before any production, test, example, README, Help, or language-specification changes.

No language semantics, diagnostic identities/messages/locations, effective-field ordering, module/source-order rules, or legacy conditional behavior were changed. Sprint 072 fixtures and approved Sprints 073-075 decisions remain authoritative.

## Files Changed

### Documentation, examples, and Help

- `docs/language-spec-v0.12.md` — additive specification for record inheritance, approved effective-field ordering and overrides, enums, both braced `if` forms, the retained legacy conditional, diagnostics AMX3011-AMX3021, module/source-order behavior, and exclusions.
- `README.md` — links the current V0.12 specification and both examples; preserves V0.9 and earlier specifications as historical references.
- `examples/v0.12-records-and-enums.amx` — runnable inheritance, enum, primitive member access, and constructor example.
- `examples/v0.12-braced-if.amx` — runnable braced expression and statement example.
- `desktop-app/src/mainview/components/help-content.json` — unique, searchable `language-v0.12` topic; retained searchable V0.9 topic without removing its migration contract.
- `tests/examples.test.ts` — README/spec links and parser/evaluator result assertions for both V0.12 examples.
- `desktop-app/tests/ui/help-center.pw.ts` — unique topic ordering, searchable terms, and rendered-contract assertions for V0.12 and V0.9 Help.

### Shared editor and VS Code

- `src/editor/highlighting.ts` — AST-proven enum/member, inheritance/override, braced-if/return, parent-reference and nested-block token facts.
- `src/editor/completion.ts` — source-ordered local/imported enums and members, V0.12 keywords, inherited effective fields, and branch-local completion context.
- `src/editor/moduleAnalysis.ts` — exported/imported enum visibility in the existing shared module graph.
- `src/editor/symbols.ts` — enum member declarations/usages and parent/member/nested-if reference traversal through existing identity-bearing symbol facts.
- `src/editor/sourceRanges.ts` and `src/editor/refactoring.ts` — enum declaration name ranges and reservation of V0.12 syntax keywords for safe rename.
- `vscode-extension/amx.tmGrammar.json` — V0.12 keyword and enum/member TextMate scopes, preserving Markdown/inert-fence/interpolation grammar.
- `vscode-extension/src/providers/navigation.ts` — enum and member outline kinds through existing navigation providers.
- `tests/editor.test.ts` — V0.12 local/imported enum completion and symbol identity, inherited type/field behavior, nested branch analysis, diagnostic identity coverage AMX3011-AMX3021, LF/CRLF source-coordinate parity, and reserved rename names.
- `vscode-extension/src/test/providers.host.ts` — actual TextMate token scopes; V0.12 completion, inherited field completion, outline/member navigation, formatting/idempotence, diagnostics and AMX3021 source location.
- `desktop-app/tests/rpc-contract-check.ts` — shared desktop V0.12 highlight/completion/symbol facts and AMX3021 location through the existing RPC surface.

No changes were needed in `desktop-app/src/mainview/CodeEditor.vue`, provider implementations beyond navigation, or `src/formatter/formatAmx.ts`. The existing generic formatter already handles the new balanced block syntax without rewriting expressions.

### Formatter tests

- `tests/formatter.test.ts` — verifies two-space indentation and idempotence across inherited types, `override`, enums, braced expression/statement and nested branch bodies; parse acceptance; evaluated meaning preservation; and unchanged legacy `if ... then ... else ...`.

## Acceptance Evidence Matrix

| Requirement | Evidence | Result |
|---|---|---|
| Current V0.12 specification and README links | `docs/language-spec-v0.12.md`; `tests/examples.test.ts` README/spec assertions | PASS |
| Two runnable examples and expected results | `tests/examples.test.ts` parses/evaluates records/enums to `Status.ACTIVE = 2` and braced `if` to `description = "high"`, `adjustedPriority = 8` | PASS |
| Searchable desktop language Help while retaining V0.9 topic | `help-content.json`; focused `help-center.pw.ts` search and rendered-text assertions | PASS |
| Formatter determinism, parseability, meaning and legacy conditional | focused `tests/formatter.test.ts` V0.12 case | PASS |
| Shared AST-derived editor facts, completion, symbol/navigation and branches | focused `tests/editor.test.ts` V0.12 cases, including imported enum and inherited field checks | PASS |
| Diagnostic identities and line endings | focused editor test covers AMX3011-AMX3021 and verifies LF/CRLF line/column parity | PASS |
| VS Code TextMate, providers and formatter | Development Host run: V0.12 grammar/token/provider test cases passed; exact aggregate and inherited failures below | PARTIAL (suite residuals) |
| Desktop shared editor RPC behavior | V0.12 assertions execute before the existing RPC contract sandbox-count assertion; exact status below | PARTIAL (inherited residual) |
| Desktop Help UI | focused `bun run test:ui -- tests/ui/help-center.pw.ts` | PASS |
| Root focused suites/build/full suite | exact commands and residuals below | PARTIAL (pre-existing and transient failures) |
| V0.12 integrated closeout | Sprint 077 gate | NOT CLAIMED / deferred |

## Validation Commands and Results

### Root

| Command | Result |
|---|---|
| `bun test tests\\parser.test.ts tests\\evaluator.test.ts tests\\formatter.test.ts tests\\editor.test.ts tests\\modules.test.ts tests\\examples.test.ts` | 208 passed, 1 failed. The only failure is the pre-existing `tests/editor.test.ts` imported dimension/unit declaration identity assertion at line 73, also recorded in prior sprint baselines. |
| Targeted `runTests` selection: V0.12 editor facts, imported enum completion/symbols, AMX3011-AMX3021 locations, formatter, README/spec and runnable example cases | 6 passed, 0 failed (153 expectations). |
| `bun run build` | PASS — root TypeScript compilation completed. |
| First `bun test` | 459 passed, 2 failed, 2,624 expectations across 461 tests / 35 files. The imported-dimension identity failure is inherited. A timing-sensitive mapped-data worker test timed out at its existing poll limit (`running` rather than `succeeded`). |
| `bun test desktop-app\\src\\bun\\desktopDataEditor.test.ts -t "inspects visible measurement units before evaluation on an in-memory data path"` | PASS — 1 passed, 0 failed; confirms the additional full-suite timeout was intermittent. |
| Retry `bun test` | 460 passed, 1 failed, 2,630 expectations across 461 tests / 35 files. Only the inherited imported dimension/unit symbol identity assertion remains. |

Sprint 075's full root result was 454 passed / 2 failed across 456 tests / 35 files. Its two failures were the imported dimension/unit identity assertion and the README/specification/help assertion at `tests/examples.test.ts:43`. This sprint fixes the latter by delivering the requested V0.12 README/specification/Help contract; its test now passes. The current residual editor identity failure remains unchanged. The mapped-data timeout was isolated and passed on retry and is not treated as a new persistent failure.

### VS Code

Commands from `vscode-extension`:

- `bun install --frozen-lockfile` — restored the two already-declared missing test dependencies (`vscode-oniguruma` and `vscode-textmate`); no manifests or lockfiles were changed.
- `bun run test` — compilation and Development Host launch succeeded. Latest run: 16 passed, 7 failed. The new V0.12 TextMate/provider integration test passes, including V0.12 scopes, completion, outline/navigation, formatting/idempotence, and AMX3021 range.

The seven remaining failures are existing Windows Development Host test limitations: five `EBUSY` temporary-directory cleanup errors and two path-case comparisons (`c:\...` compared to `C:\...`); one cleanup failure is tied to the pre-existing cyclic-target test. An earlier retry showed the same failure family (15 passed, 8 failed, including an additional temporary-directory lock). No failure is attributed to the V0.12 assertions.

### Desktop

Commands from `desktop-app`:

- `bun run typecheck` — PASS (`vue-tsc --noEmit`).
- `bun run build:web` — PASS (Vite workbench and Bun worker builds completed; existing large-chunk advisory only).
- `bun run test` — FAIL at existing `desktop-app/tests/rpc-contract-check.ts:152`: sandbox count expects 2 `sandbox="allow-scripts"` matches but finds 1. This is the same inherited residual recorded in project history. The newly added V0.12 RPC checks run before this assertion and complete, covering diagnostics, symbol facts, highlighting, enum completion, inherited-field completion, and AMX3021 at line 6, column 1.
- `bun run test:ui -- tests/ui/help-center.pw.ts` — PASS, 2 passed, 0 failed. Confirms stable topic IDs/order, local search for V0.12 and V0.9, and rendered guidance.

The Playwright config's webServer command (`./node_modules/.bin/vite ...`) is not executable by the Windows shell. For validation, the same configured Vite server was started via `node .\node_modules\vite\bin\vite.js ...`; an HTTP 200 response was verified before running the focused UI suite.

## Residuals and Boundaries

- The inherited root imported dimension/unit symbol identity assertion remains. No unrelated refactoring was attempted.
- The root mapped-data worker timeout passed in isolation and on the full-suite retry; retained as intermittent evidence.
- The VS Code suite remains partially blocked by Windows temp-directory locks and case-sensitive path expectations; V0.12 tests and compilation passed.
- The desktop RPC runner retains its pre-existing sandbox-count assertion failure; V0.12 RPC assertions execute before that line.
- No approved diagnostic identities/messages/ranges or feature semantics were changed.
- No package/extension version, release, publication, migration guide, platform certification, or Sprint 077 closeout claim is included.
