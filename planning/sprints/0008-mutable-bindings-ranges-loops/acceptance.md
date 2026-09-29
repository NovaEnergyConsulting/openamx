# 008 Acceptance Criteria

008 is complete when:

- `docs/language-spec-v0.2.md` explicitly includes `ForExpression` in expression grammar and clearly distinguishes it from statement-form loops. It states that expression loops require exactly one return expression, statement loops contain none, later body statements still execute, and empty expression loops yield `[]`.
- `let` creates a binding and repeated `let` updates it. `name = expression` updates an existing binding; `name += expression` adds using existing `+` semantics. Reads or writes to undeclared names produce clear source-located errors; undefined identifier behavior uses AMX1004.
- `[start to end]` evaluates to an inclusive integer sequence in either direction, including a one-value sequence for equal bounds. Non-finite or non-integer bounds produce a clear source-located error. Explicit list literals continue to parse and evaluate as before.
- Statement-form `for item in values { ... }` iterates over lists and ranges; side effects from body statements persist in the supplied/shared environment.
- Expression-form loops work wherever expressions are allowed, including a declaration initializer; one return expression is collected for each iteration into a list. Return does not exit early, and an empty list/range produces `[]`.
- The iteration identifier is scoped to its loop. It shadows and then restores any existing same-named binding; each iteration receives the next iterable value. Mutations to other existing bindings persist, and declarations other than the iterator follow the shared environment.
- A statement loop with no return parses and evaluates. Missing/multiple returns in an expression loop, a return in statement context, a return outside a loop, a non-list/non-range iterable, and nested loops are rejected clearly with source locations. `break` and `continue` are not accepted as V0.2 statements.
- Parser and runtime AST nodes retain original-document 1-based UTF-16 source locations through nested loop bodies and range expressions.
- Evaluator tests cover mutation, redeclaration, assignment failures, ascending/descending/equal ranges, invalid range bounds, explicit lists, list/range iteration, outer mutation, iterator scope/shadow restoration, per-iteration collection, continued execution after return, and empty expression loops.
- The implementation exposes statement-list evaluation over a supplied `Environment` (or equivalent), but does not implement document-wide executable-block orchestration, renderer integration, or final-environment interpolation.
- `match` parsing/evaluation remains unimplemented and untouched in behavior; it is reserved for Sprint 009.
- `bun run build` and `bun test` pass; existing V0.1/V0.2 parser, evaluator, and renderer coverage is preserved.
- Planning state identifies Sprint 008 complete only after verification and Sprint 009 as the next sprint; decisions/questions record final scope/semantics and any real deviation.
- No unrelated runtime, renderer, CLI, extension, domain-specific, or V0.3 work is included.
