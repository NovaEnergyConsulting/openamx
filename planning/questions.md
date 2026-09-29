# Planning Questions (Sprint 002)

## Assumptions Made (clearly marked per builder rules)

- **Expression placeholder for lets in Sprint 002**: The requirements state "capture identifier name and the raw expression text (or a minimal ExpressionNode placeholder)". Full expression parsing is explicitly out of scope (Sprint 003). 
  - Assumption: We will implement minimal scaffolding in `parseExpression.ts` supporting only atomic cases (number literals, string literals, boolean literals, simple identifiers). 
  - For any RHS that is not a simple atomic (e.g. contains operators like `a + b`), during Sprint 002 the splitter will produce an `IdentifierNode` whose `name` holds the raw RHS text as a placeholder. This satisfies the `expression: ExpressionNode` type contract on `VariableDeclarationNode` without implementing any operator/Pratt logic.
  - This placeholder approach will be replaced in Sprint 003; no tests in this sprint rely on complex expressions being correctly structured.
  - Recorded here so future sprints know this was temporary scaffolding.

- **Malformed let lines**: If a line starts with `let ` but does not match `let <valid-id> = <expr>`, the statement splitter will throw a descriptive Error (e.g. "Malformed let declaration..."). This fulfills "do not silently ignore". Full AMX error codes + diagnostics objects are out of scope for this sprint (only basic error handling for front matter is called out in acceptance). Tests for this sprint focus on happy paths + front matter errors.

- **SourceLocation granularity**: Per blueprint, "Column precision can be basic." We set `column: 1` for all nodes in this sprint. Line numbers are accurate.

- **parseDocument API**: It reads from disk (per requirements) so it is `async`. Lower level `parseFrontMatter(content: string)` and `parseStatements(body: string)` are pure and used directly by tests to avoid temp files for most cases.

- **Narrative whitespace**: Empty lines and paragraph structure inside narrative are preserved exactly (by collecting original lines). Only `let ...` lines are omitted.

- **Front matter edge cases**: We handle absent, empty `---\n---`, simple key/values. Complex YAML (anchors, tags) not required for v0.1. Malformed YAML throws Error with message (tests expect clear indication).

- **Identifier rules**: Strictly case-sensitive. Regex: starts with letter, followed by letter/digit/_ . Matches spec examples.

No other ambiguities found in the sprint artifacts. If new questions arise during implementation they will be appended here before proceeding.

## Open Questions (none currently blocking)

## V0.2 Sprint 007 Clarifications

- Resolved the master-plan question about newline/semicolon behavior: newlines are the only statement and match-arm separators; semicolons do not separate either construct.
- Resolved match-arm syntax and placement: `case <literal> => <expression>` and exactly one `default => <expression>`; default is fallback and may appear at any position; cases are evaluated in source order.
- Resolved fence and source-location rules in `planning/decisions.md` and Sprint 007 requirements. No blocking language-contract questions remain for the Builder handoff.
- The remaining implementation details belong to their assigned later sprints; do not treat them as open requirements for Sprint 007.
- Sprint 007 input check: `.agents/main.md` and all requested planning/sprint inputs were present. `docs/language-spec-v0.2.md` was created as the requested sprint deliverable; there were no missing referenced inputs to carry forward.
- Verification deviation: existing evaluator and renderer test helpers used `parseStatements` as a mixed bare-let/narrative document splitter. Once it became the declaration-only code-block parser, those helpers failed. Their test-only fixture construction now builds the same lower-level AST directly; production parsing remains fenced-only, and runtime/renderer code is unchanged.

## V0.2 Sprint 008 Clarifications

- The authoritative V0.2 grammar had `for` only as a statement despite defining expression-form loops in prose. Resolved by adding `ForExpression` to the grammar: expression-context loops require exactly one `return expression`; statement-context loops contain none.
- The return may appear among ordinary loop-body statements; statements after it still execute. It records this iteration's result and never exits the loop early.
- Only the iterator is loop-scoped. It shadows and restores an outer binding, including on evaluation failure; other declarations and mutations use and persist in the caller-provided shared environment.
- No blocking questions remain for the Sprint 008 Builder handoff. `match` remains reserved for Sprint 009; whole-document multi-block evaluation/rendering remains Sprint 010.

## V0.2 Sprint 008 Builder Completion

- No blocking ambiguities or contract deviations arose during implementation. The grammar clarification for expression-form loops remains consistent with the approved Sprint 008 requirements and decisions.
- Acceptance coverage includes both undefined assignment operators, ascending/descending/equal and invalid ranges, list/range statement loops, nested expression-loop use, exactly-one-return validation, empty expression loops, continued side effects after return, iterator restoration after success and failure, shared loop-body declarations/mutations, invalid iterables, and the Sprint 007 executable-fence boundary.
- Verification: focused `bun test tests/parser.test.ts tests/evaluator.test.ts` passed (70 tests); `bun run build` passed; full `bun test` passed (81 tests, 198 assertions). No implementation deviation to carry forward.
- `match` remains Sprint 009, and document-wide multi-block execution/rendering remains Sprint 010.

## V0.2 Sprint 009 Clarifications

- Resolved match cardinality: exactly one default is required; case arms are optional, making a default-only match valid. The default may occur at any arm position.
- Match selection uses strict type-and-value equality, evaluates the scrutinee once, checks cases in source order, selects the first match (including duplicate literal cases), and evaluates only the selected branch.
- Negative numeric literal patterns are accepted; guards, destructuring, non-literal patterns, and match statements remain deferred/out of scope.
- No blocking questions remain for the Sprint 009 Builder handoff. Sprint 010 still owns document-wide execution, rendering, and final-environment interpolation integration.

## V0.2 Sprint 009 Builder Completion

- No blocking ambiguities or deviations arose. Default-only, default placement, strict typing, duplicate first-match selection, non-selected branch laziness, nested expression/loop composition, malformed arms, and original-document match/arm coordinates are covered.
- Verification: initial case/fallback/strict/location probe passed; focused parser/evaluator suites passed (78 tests); `bun run build` passed; final full `bun test` passed (89 tests, 244 assertions), including the strengthened scrutinee-once assertion. Sprint 010 remains responsible for rendering and document-wide execution.

## V0.2 Sprint 010 Clarifications

- Formatter scope is explicitly layout-only because the parser AST does not retain original token spans/string quoting. It canonicalizes line endings, indentation, blank-line edges, and trailing whitespace while preserving intra-line expression/source text; this keeps formatting semantics-preserving and avoids introducing a second expression printer.
- Document execution is a first pass over executable blocks only, sharing one environment. Rendering is a second pass in document order; all narrative interpolation observes final state, including later mutations.
- Executable source is rendered as HTML-escaped formatted code without fence delimiters, Markdown parsing, or inline interpolation. Ordinary Markdown fences and bare declarations remain non-executable.
- No blocking questions remain for the Sprint 010 Builder handoff. Sprint 011 extension work remains out of scope.

## V0.2 Sprint 010 Builder Completion

- No blocking ambiguities or contract deviations arose. Formatter idempotence, parser-valid formatted output, nested indentation, and quoted brace handling passed focused tests.
- Verification: focused evaluator/renderer tests passed (70 tests); `bun run build` passed; final `bun test` passed (96 tests, 261 assertions). Output determinism, final-environment interpolation, once-only execution, and escaped executable code are covered.
- Sprint 010 is complete. Sprint 011 extension work remains out of scope for this handoff.

## V0.2 Sprint 011 Clarifications

- Use `vscode-extension/` as the focused package; leave the root project layout and root TypeScript build configuration intact.
- Providers must parse unsaved buffers through a pure core text API. Path-based `parseDocument` remains compatible and delegates to the shared text parser; extension runtime code is Node-based and must not call Bun APIs.
- Completion scope means variables declared in preceding executable blocks or before the cursor in the current block, plus the active loop iterator. Later-only and narrative-only names are excluded.
- Publisher is `EngineersTools`. Package and locally install a VSIX, but do not publish it. Provider checks run in an Extension Development Host.
- No blocking questions remain for the Sprint 011 Builder handoff. Marketplace publication and LSP remain explicitly out of scope.

## V0.2 Sprint 011 Builder Completion

- No blocking language or provider ambiguities arose. Formatting, completion scope, parser-only diagnostics, diagnostic clearing, pure text parsing, host behavior, packaging, and local installation were verified.
- The Extension Development Host ran on VS Code 1.85.0. `xvfb-run` was unavailable, but the active `DISPLAY=:0` allowed the host to run. The host emitted environment/built-in extension DBus/API warnings; all OpenAMX tests passed.
- `vsce` warned that the repository has no license file. This did not prevent a local VSIX from being built and installed; choosing and adding the project license remains necessary before any Marketplace publication.
- Exact verification: root `bun run build && bun test` passed (97 tests, 265 assertions); extension `bun run test` passed (3 tests); installed-artifact run with `OPENAMX_EXTENSION_PATH=/home/cgamez/.vscode-server/extensions/engineerstools.openamx-vscode-0.2.0 bun run test` passed (3 tests); `CI=1 bun run package` produced the 6-file `vscode-extension/openamx-vscode-0.2.0.vsix` (61.67 KB); `bun run install-local` succeeded; `code --list-extensions --show-versions` reported `engineerstools.openamx-vscode@0.2.0`. Nothing was published or uploaded.

## V0.2 Sprint 012 Clarifications

- The transformer-strategy example will become the Power Transformer Failure Mode Analysis, and `examples/asset-fleet-risk-analysis.amx` will be the second end-to-end Risk Analysis document. Both examples collectively cover the V0.2 acceptance surface without adding domain-specific core features.
- Expected computed values must be stated in tests and checked against parsing/evaluation of the real example source; checked-in HTML is regenerated through the CLI.
- The ordered V0.3 roadmap is recorded in `planning/decisions.md` and remains explicitly unimplemented.
- The repository has no license file. Do not select or add one during Sprint 012; record that Marketplace publication remains deferred until the project makes an explicit license decision. Local VSIX packaging/install is still a Sprint 012 verification requirement.
- No blocking questions remain for the Sprint 012 Builder handoff. V0.2 must not be marked complete if a required core, example, extension-host, packaging, or local-install check is blocked or unverified.

## V0.2 Sprint 012 Builder Completion

- No blocking questions arose. The actual-file tests exposed one concrete renderer defect: interpolated markup-significant characters were not escaped before Markdown conversion. The narrow fix and regression are recorded in decisions and the V0.2 spec; no other language/extension change was needed.
- Root build and full test suite passed (100 tests, 294 assertions), all example renders and both domain CLI run outputs passed, and checked-in HTML matches renderer output. Extension host tests passed on VS Code 1.85.0 (3 from source, 3 from installed VSIX). Packaging yielded `openamx-vscode-0.2.0.vsix` (6 files, 61.74 KB); local install and installed extension listing succeeded.
- Nonblocking environmental warnings: VS Code host DBus portal/built-in Python extension API warnings; `vsce` reports a newer version and a 297.03 KB bundled JS file. `vsce` prompted to continue without a license file despite `CI=1`; local packaging required and received confirmation. The project license selection/file remains an unresolved publication prerequisite for the Lead Developer, not a Sprint 012 language or acceptance blocker. Marketplace publication was not attempted.
- Ordered V0.3 candidates, unimplemented: (1) tables/charts; (2) units/currency; (3) reusable/imported `.amx`; (4) Asset Management domain libraries; (5) data imports; (6) Word/PDF export; (7) multi-file workflows; (8) richer validation; (9) AI-assisted authoring.
