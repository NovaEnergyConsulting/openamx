# 004 Blueprint: Comparisons, Logical, Conditionals, Stdlib, Lists

## Approach

- Follow the master plan (planning/plan-openamxV01MasterSprintPlan.md) Phase 3 – Expression Completeness exactly for Sprint 004.
- Use the 0000-sprint-template as the source and customize all four files for this sprint.
- Focus on completing the full expression layer: comparisons, logicals, single-line conditionals, list literals, function calls, and the standard library.
- Extend the existing recursive descent + Pratt parser (from Sprint 003) to recognize new tokens, operators, and constructs while preserving correct precedence and associativity.
- Extend evaluateExpression to handle the new node types and delegate stdlib calls.
- Implement standardLibrary.ts with the 8 required functions; ensure they accept evaluated list values and scalars as appropriate.
- Add clear but minimal error handling for type/argument errors (reuse/extend AmxError patterns).
- Write comprehensive evaluator tests covering all new operators, conditionals, lists, and every stdlib function. Extend parser tests for AST shape validation where helpful.
- Explicitly do NOT implement chained else-if; document the single-line limitation.
- Update planning/state.md and planning/decisions.md as required.
- Keep the build and test suite green at every step.
- All code must remain general-purpose; no Asset Management domain logic in parser, runtime, or diagnostics.

## Files to Create or Update

**Primary implementation targets (Sprint 004 scope)**
- src/parser/parseExpression.ts — extend tokenizer and parser for:
  - Comparison tokens (== != > >= < <=)
  - Logical keywords (and, or, not)
  - Conditional keywords (if, then, else) for single-line form
  - List literal syntax [ ... ]
  - Function call syntax name(...)
  - Full precedence table including new levels
  - Produce correct BinaryExpressionNode (new ops), UnaryExpressionNode ('not'), ConditionalExpressionNode, ListLiteralNode, FunctionCallNode
- src/runtime/evaluateExpression.ts — add cases for:
  - Comparison and logical binary operators
  - Unary 'not'
  - ConditionalExpressionNode (evaluate test, select branch)
  - ListLiteralNode (evaluate elements into array)
  - FunctionCallNode (lookup in standard library and invoke)
- src/runtime/standardLibrary.ts — replace placeholder with real implementations:
  - sum, min, max, mean (operate on arrays)
  - round, abs, sqrt, pow (scalar or as appropriate)
  - Basic argument validation and clear errors
- src/runtime/environment.ts — only if minor adjustments needed for list storage (prefer none)
- src/diagnostics/errors.ts — extend with any new error helpers if useful for type/arg errors (keep minimal)

**Tests**
- tests/evaluator.test.ts — major expansion:
  - Comparisons (all 6 operators, numeric and mixed)
  - Logicals (and, or, not; basic short-circuit if natural)
  - Single-line conditionals (true/false branches)
  - List literals (construction, use in expressions)
  - All 8 stdlib functions with lists, variables, literals, edge cases
  - Type/argument errors for invalid calls
  - Precedence mixing old + new operators
  - Full document evaluation combining features
- tests/parser.test.ts — additions to verify AST node shapes for new constructs (Binary with comparison, Conditional, List, Call)

**Planning artifacts**
- planning/state.md — update current status, sprint history, and next steps (mark Sprint 004 prepared / in progress / complete as Builder executes).
- planning/decisions.md — record any new decisions (e.g., list element evaluation strategy, error code choices for type errors, treatment of empty lists for aggregates, boolean coercion rules).
- planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/requirements.md (already created)
- planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/blueprint.md (this file)
- planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/acceptance.md
- planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/handoff-prompt.md

**No changes to**
- package.json, tsconfig.json, .gitignore
- parseFrontMatter.ts, parseDocument.ts, parseStatements.ts (beyond any incidental delegation that already works)
- renderer/ (renderHtml.ts stays untouched)
- cli.ts, index.ts (beyond existing exports)
- examples/ content (stubs remain)
- renderer.test.ts (stays as skeleton)
- No implementation of inline substitution, rendering, CLI commands, or full example population

## Notes

- Keep laser-focused on completing the expression model. Do not begin renderer, CLI, or example content work.
- Parser must produce proper tree nodes for all new forms. The arithmetic-only trees from Sprint 003 are now a subset.
- Precedence must match the spec (comparisons below arithmetic; and/or below comparisons; conditional lowest).
- ^ remains right-associative; new operators follow conventional left-associativity unless specified.
- Conditionals are strictly single-line `if E then E else E`. Chained else-if is a documented v0.1 limitation only.
- Lists are simple arrays of evaluated primitive values (number | string | boolean). No list indexing or mutation in v0.1.
- Stdlib functions must accept both list literals and variables holding lists.
- Evaluation remains strictly sequential in source order; forward references still produce AMX1004.
- Environment and existing arithmetic paths must continue to work unchanged.
- After this sprint the repository will have a complete parse → evaluate pipeline for all v0.1 expression features, ready for rendering in Sprint 005.
- Verify at the end: `bun install && bun run build && bun test`.
