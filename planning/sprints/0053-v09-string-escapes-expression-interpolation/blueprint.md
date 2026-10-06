# Sprint 053 Blueprint: String Escapes and Expression Interpolation

## Approach

1. Confirm Sprint 052's accepted-with-residuals disposition and read its Builder evidence. Preserve the five Windows Extension Development Host failures as a recorded residual, not a passing result or an assumed string blocker.
2. Read the approved V0.9 string contract and Sprint 051 contract proposal. Inventory string tokenization/scanning, AST representation, expression parsing, type checking, evaluation, formatting, diagnostics/source mapping, shared editor analysis, VS Code grammar/providers, desktop editor integration, and string fixtures.
3. Design string scanning as a stateful lexer/parser operation that retains raw source spans while producing decoded segments. Establish explicit states for quote kind, escape sequence, interpolation body, nested delimiters, and quoted strings within interpolation. Avoid scanning braces/quotes in decoded text or across executable/narrative boundaries.
4. Implement the exact escape table in both quote styles: escaped quote, backslash, newline, carriage return, tab, and escaped interpolation opener. Keep raw source strings single-line. Reject unknown and trailing/incomplete escapes with `AMX3006`.
5. Parse `${...}` only in double-quoted strings using the existing AMX expression parser. Balance nested braces/delimiters and quoted string content without evaluating host code. Preserve precise original-source ranges for embedded expression nodes and diagnostics.
6. Integrate interpolation expressions with static checking and runtime evaluation. Enforce the existing pure-expression restrictions. Reject list/record values rather than stringifying them; use `AMX3007` for invalid scalar conversion/type cases as specified by the approved contract.
7. Implement deterministic text conversion for currently supported values: String contents, Number formatting independent of locale, `true`/`false`, and `null`. Keep a narrowly defined extension point/test seam for measurements, but do not invent measurement runtime values; coordinate measurement display assertions with Sprint 056.
8. Preserve narrative interpolation by keeping its existing evaluation timing and implementation path distinct. Add regression coverage proving `${...}` changes only AMX double-quoted strings, does not affect single-quoted strings/narrative/inert fences, and does not alter final-environment narrative results.
9. Wire only directly relevant syntax and diagnostics into formatter and editor surfaces. Verify valid formatting preserves string meaning/idempotence; syntax coloring/diagnostics work in executable AMX in both clients without leaking into narrative/inert fences. Cover incomplete editing states and LF/CRLF source ranges.
10. Inventory backslash-bearing source fixtures affected by the intentional escape compatibility change. Update only repository-owned positive literals whose intended decoded value would change; preserve negative tests and explain each migration. Do not modify unrelated source content.
11. Add positive, negative, boundary, and source-location tests. Run focused parser/string/evaluator/formatter/editor/client tests, relevant root build/tests, and relevant desktop/extension checks. Keep any host-specific failures explicit, then run `git diff --check`.
12. Record implementation, migration rationale, exact commands/results, changed files, and unresolved residuals in Sprint 053 Builder evidence plus `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Request a separate Lead Developer disposition.

## Files to Update

- AST/parser/tokenizer, type checker, evaluator, diagnostics, formatter, and shared/editor clients only as directly required
- Focused tests and affected positive string fixtures
- `planning/sprints/0053-v09-string-escapes-expression-interpolation/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

Do not implement Sprint 054-058 features.

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| Double-quoted expression | `"Answer: ${1 + 2}"` evaluates to `Answer: 3`. |
| Single-quoted text | `'${value}'` stays literal and does not evaluate `value`. |
| Escapes in either quote | Each approved escape decodes exactly; `\${` yields literal `${`. |
| Unknown/trailing escape | Explicit `AMX3006` syntax diagnostic at the original source location. |
| Nested interpolation expression | Nested braces, delimiters, and quoted strings are parsed as AMX with correct source spans. |
| Incomplete interpolation/string | Explicit error; no partial success-shaped result. |
| Static type failure | Invalid expression or unsupported collection interpolation is rejected before evaluation (`AMX3007` where applicable). |
| Scalar formatting | String, Number, Boolean, and null produce deterministic expected text independent of locale. |
| Narrative/fence isolation | Existing narrative interpolation and inert-fence behavior are unchanged. |
| Formatter/editor | Valid strings retain meaning and stable formatting; executable code has correct syntax/diagnostics and source ranges in both clients. |
| Escape migration | Positive backslash fixtures retain intended decoded values; negative tests remain rejection tests. |

## Verification

- Focused string/parser/evaluator/type-checker/formatter/editor tests and any affected provider/desktop tests.
- Root `bun run build` and applicable root test suites.
- Relevant desktop and extension compile/typecheck/host checks. Record every host-test failure, including the accepted Sprint 052 residual if it reproduces; do not call a failing suite passing.
- `git diff --check`.

Report exact command lines, test totals, environment, changed files, and failure/residual status. Do not infer measurement interpolation support before Sprint 056 or integrated V0.9 completion from these checks.

## Notes

- Approved syntax/escape rules take precedence over implementation convenience. No host-language eval, general-purpose collection serialization, raw multiline strings, or single-quoted interpolation is allowed.
- Measurement interpolation is in the language contract but depends on measurement values implemented in Sprint 056. Coordinate a focused follow-up assertion there rather than implementing measurement semantics in Sprint 053.
- Sprint 053 depends only on Sprint 052, not Sprint 054. Sprint 054 may proceed in parallel after the Sprint 052 disposition; keep the two changesets independent where practical.
