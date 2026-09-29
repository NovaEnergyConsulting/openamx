# 009 Acceptance Criteria

009 is complete when:

- `match expression { ... }` parses as a V0.2 value expression and works in a declaration initializer and other ordinary expression positions, including as a nested scrutinee/branch expression where valid.
- The scrutinee is parsed as a full expression; parser/evaluator tests cover a compound boolean/logical scrutinee.
- Case arms accept number, string, and boolean literals. Negative numeric cases are supported. Non-literal patterns, missing arm expressions/arrows, malformed braces, and semicolon separators are rejected with clear source-located errors.
- A match requires exactly one `default` arm, which may occur at any position. A default-only match is valid. Missing or duplicate defaults are rejected with a clear error at a useful match/arm location.
- Cases are retained/evaluated in source order. The scrutinee is evaluated once; strict type-and-value equality is used without coercion; the first matching case wins, including when duplicate literal cases exist; otherwise default is selected.
- Only the selected branch expression is evaluated. Tests prove undefined identifiers/errors in non-selected case/default expressions are not raised.
- AST match and arm/value expressions preserve original-document 1-based UTF-16 source locations, including when nested inside executable-block statements or loop expressions.
- Tests cover number/string/boolean matches, negative/decimal numeric cases, all supported default positions, default-only/missing/duplicate defaults, duplicate matching cases, strict type distinctions, selected/default results, non-selected branches, compound scrutinee, nesting/composition with existing expressions, and malformed syntax.
- `bun run build` and the full `bun test` suite pass; Sprint 007 fence/migration and Sprint 008 mutation/range/loop behavior remain covered and passing.
- No renderer/document-block orchestration, final-environment interpolation, formatting, CLI, extension, Asset Management, guard, destructuring, or V0.3 feature is implemented.
- Planning status records Sprint 009 complete only after verification and names Sprint 010 as the next sprint; decisions/questions record the settled semantics and any actual deviations.
