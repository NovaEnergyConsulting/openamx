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
