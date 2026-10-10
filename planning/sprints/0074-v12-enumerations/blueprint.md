# Sprint 074 Blueprint: V0.12 Enumerations

## Approach

1. Confirm the Sprint 072 enum fixtures and current worktree. Review the existing declaration AST/parser, field/member-access expression path, type-checking registries, runtime evaluation, import/export loading, diagnostics catalog, and focused tests before editing.
2. Obtain the diagnostic-catalog decision for EN-I01–EN-I06 before implementing those enum-specific errors or exact-code assertions. Preserve the existing expected identities for EN-I07–EN-I09.
3. Extend the existing AST and statement parser for `enum Name = { ... }`, preserving member names, optional literal values, declaration/member source locations, and export information. Reuse the existing parser/diagnostic conventions; do not add parallel grammar or test infrastructure.
4. Register enum declarations in the existing source-order and module visibility flow. Ensure enum names and members do not become record types or nominal value types. Exported enums are importable under existing module rules; private enums remain inaccessible across modules.
5. Validate each enum at declaration time:
   - Empty member lists are rejected.
   - Member names are unique within the declaration.
   - If no member has an explicit value, assign `Number` values 1..N in source order.
   - If any member has an explicit value, every member must have a literal `Number` or `String` value, all values must share one primitive type, and values must be unique.
   - Reject expression-valued members and partial explicit assignments.
6. Make `EnumName.Member` resolve to the exact primitive value. Type-check access as `Number` or `String`, evaluate it as that primitive, and verify it composes with existing primitive-typed bindings/expressions without enum-specific coercion.
7. Cover valid and invalid fixture cases:
   - `tests/parser.test.ts`: enum grammar, locations, and malformed declaration syntax.
   - `tests/evaluator.test.ts`: implicit/explicit values, uniqueness, primitive type compatibility, and runtime values.
   - `tests/modules.test.ts`: exported/imported enum access, private enum rejection, and forward-reference behavior.
   - Add a String duplicate-value case next to EN-I03; the Sprint 072 fixture demonstrates the Number duplicate case.
8. Keep record inheritance intact. Avoid changing generic field access or module semantics except where enum resolution must integrate with them. Defer formatter and editor-specific integration to Sprint 076.
9. Run focused parser/evaluator/module tests and the root build, then the full root suite. Compare the full-suite failures with the Sprint 073 baseline and record exact results without masking inherited failures.

## Files to Update

- AST and parser: `src/ast/types.ts`, `src/parser/parseStatements.ts`, and expression parsing only if the existing member-access representation requires a focused adjustment
- Type checking and diagnostics: `src/typechecker/checkDocument.ts`, any directly required declaration registry/module-export types, and `src/diagnostics/errors.ts` only after diagnostic allocation is approved
- Runtime and modules: `src/runtime/evaluateExpression.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/moduleLoader.ts`
- Focused existing tests: `tests/parser.test.ts`, `tests/evaluator.test.ts`, and `tests/modules.test.ts`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` only for accurate status, approved diagnostic allocation, or a newly discovered decision
- Sprint 074 `builder-evidence.md` with exact changes, diagnostic allocation, test results, and residuals

Do not edit editor clients, language specifications, examples, formatting behavior, dependency manifests, or unrelated runtime/module surfaces.

## Risks and Stop Conditions

- If implementation requires enum aliases, flags, nominal typing, mixed types, expression values, or partial explicit values, stop and request a product decision; these are explicitly excluded.
- If diagnostic approval is unavailable, do not invent or reuse identities for EN-I01–EN-I06. Mark those cases blocked and do not report Sprint 074 complete.
- If `EnumName.Member` is implemented as a nominal enum value or changes existing primitive compatibility, stop and restore the approved primitive semantics.
- If enum imports alter existing source-order or module visibility behavior, stop and investigate the specific regression before acceptance.
- Do not claim editor, formatter, language-specification, or release readiness from this sprint.

## Verification

1. `bun test tests\\parser.test.ts tests\\evaluator.test.ts tests\\modules.test.ts`
2. `bun run build`
3. `bun test`

Record each command's exact outcome and compare full-suite failures with the recorded Sprint 073 baseline.
