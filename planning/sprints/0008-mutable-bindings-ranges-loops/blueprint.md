# 008 Blueprint: Mutable Bindings, Ranges & Loops

## Approach

Implement the V0.2 statement and range slice on top of Sprint 007’s `executableCodeBlock` AST and location-aware parser. Extend expression parsing with `[start to end]` while retaining list literal parsing, then implement assignment/repeated-declaration mutation against `Environment`. Add `for` parsing with the loop form selected by context: statement position allows a body without `return`; expression position requires one return expression and evaluates to a list.

Use one environment for ordinary loop-body declarations and assignments. Implement the iteration variable as a temporary scoped binding: it shadows any same-named outer binding during the loop, its value is refreshed per iteration, and the original outer binding is restored on completion or error. Loop-local names other than the iterator follow the shared environment and remain after the loop. Ensure nested loops are rejected and a `return` cannot escape its expression-loop context.

A range expression validates that each bound evaluates to a finite integer and produces an inclusive ascending or descending sequence with step one. Keep `[a, b]` as the existing explicit-list form. `+=` is equivalent to assigning the result of the existing `+` operation to an already-declared binding.

Expose statement-list evaluation against a supplied `Environment` (or a small equivalent API) so parsed code-block statements can be evaluated in isolation and sequentially share state in tests. Do not change `evaluateDocument` to orchestrate all executable blocks; Sprint 010 owns source-order document integration, final-environment interpolation, and rendering.

## Files to Update

- `docs/language-spec-v0.2.md` — make the existing expression-loop promise explicit in the grammar: add `ForExpression`, distinguish statement/expression context, and document exact return cardinality/position semantics.
- `src/ast/types.ts` — type declarations and assignment expressions with `V02ExpressionNode` as needed; represent both loop contexts, required return expressions, and statement bodies with source locations.
- `src/parser/parseExpression.ts` — parse inclusive ranges and for-expressions without regressing V0.1 precedence, explicit lists, or existing expression forms. Keep match parsing deferred.
- `src/parser/parseStatements.ts` and narrowly needed parser modules — parse repeated declarations, assignments, `+=`, statement loops, and loop bodies inside `amx` blocks; enforce contextual returns and reject nesting.
- `src/runtime/environment.ts` — provide correct mutation and temporary loop-binding scope semantics without losing caller state.
- `src/runtime/evaluateExpression.ts` and/or a focused statement evaluator module — evaluate range/for expressions and statements, mutations, and per-iteration returns using existing expression semantics.
- `src/diagnostics/errors.ts` — add clear source-located errors for invalid range bounds, invalid loop iterables/context/return shape, and undefined assignment targets as required. Undefined identifiers remain AMX1004.
- `tests/parser.test.ts`, `tests/evaluator.test.ts` — focused tests for the acceptance cases; preserve unrelated coverage.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` — record completion, final semantics, verification, and genuine deviations.

## Notes

- The language spec currently describes expression-form loops in prose but omits them from the grammar. Correct that mismatch before or with implementation; do not let the parser infer a different syntax.
- The return statement is valid only inside a `for` used as an expression. An expression loop contains exactly one return; statements after it still execute for side effects, and the next iteration always proceeds. A statement loop contains no return.
- No nested `for`, `break`, `continue`, match expression, or document-level multi-block execution is required.
- Test the iterator shadowing an existing document binding and verify restoration even if loop evaluation fails, so implementation does not corrupt the supplied environment.
- Keep parsing and evaluation statement-oriented; do not add renderer or CLI work.
