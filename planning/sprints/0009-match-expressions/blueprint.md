# 009 Blueprint: Match Expressions

## Approach

Use the existing `MatchExpressionNode` and `MatchCaseNode` shapes where they fit, and add any source metadata needed to report diagnostics at original-document coordinates. Extend tokenization/Pratt expression parsing with the `match` keyword and a braced arm parser. Keep ordinary expression parsing for the scrutinee and branch values so matches compose with V0.1 expressions, Sprint 008 ranges, and expression-form loops.

Parse each arm on its own logical line. Preserve case order in the AST; represent the single default separately as the current AST does. Validate that there is exactly one default, accepting a match with only a default. Case patterns are only numeric, string, or boolean literals; negative numeric literals may use unary `-`. Arms require `=>` and a non-empty expression. A semicolon is not a separator. Reject malformed braces, arm syntax, multiple defaults, missing defaults, and non-literal patterns with clear source-located parse errors.

At runtime, evaluate the scrutinee once. Compare its result to literal case values using strict type-and-value equality, checking cases in source order. Evaluate only the first matching branch; if none matches, evaluate default. Preserve first-match behavior when duplicate case literals occur. No coercion, implicit fallthrough, guard evaluation, or eager evaluation of branch expressions is introduced.

Exercise nesting and composition through `parseExpression` / evaluator-level tests rather than modifying document rendering. The Sprint 010 renderer will reuse the now match-capable expression parser and evaluator for inline interpolation after document execution is integrated.

## Files to Update

- `docs/language-spec-v0.2.md` — finalize match semantics, case syntax, strict equality, default-only validity, and diagnostics expectations.
- `src/ast/types.ts` — adjust `MatchExpressionNode` / `MatchCaseNode` only if arm locations or V0.2 expression types require it.
- `src/parser/parseExpression.ts` and a narrowly scoped match parser helper if useful — tokenize `match`, parse the braced arm list, validate case literals/default cardinality, and preserve locations.
- `src/runtime/evaluateExpression.ts` — evaluate scrutinee once and select/evaluate one branch only.
- `src/diagnostics/errors.ts` — add clear source-located parse/runtime diagnostic helpers only where the existing errors API requires them.
- `tests/parser.test.ts` and `tests/evaluator.test.ts` — add explicit match syntax, AST/location, selection, typing, non-selected branch, and integration assertions.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` — record Sprint 009 completion, final decisions, verification, and any real deviations.

## Notes

- The existing V0.2 spec already commits to exactly one default, first source-order match, number/string/boolean literal cases, and newline arm separators. This sprint makes those rules executable and adds only the implementation detail of strict primitive equality (consistent with existing `==`/`!=`).
- A default-only match is valid: exactly one fallback is mandatory, but no minimum number of case arms is specified by the master plan.
- Keep source order for all `case` arms even though the default expression is stored separately in the existing AST.
- Do not implement guard syntax, richer patterns, or match statements.
- Do not edit renderer, CLI, examples, extension files, or runtime document orchestration.
