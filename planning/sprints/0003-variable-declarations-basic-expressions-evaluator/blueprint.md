# 003 Blueprint: Variable Declarations + Basic Expressions + Evaluator

## Approach

- Follow the master plan (plan-openamxV01MasterSprintPlan.md) Phase 2 – Parsing & Model exactly for Sprint 003.
- Use the 0000-sprint-template as the source and customize all four files for this sprint.
- Focus on completing the expression parsing layer (full arithmetic support) and the first real evaluation layer.
- Replace the Sprint 002 placeholder expression handling with a proper recursive descent + Pratt (or precedence-climbing) parser.
- Implement Environment, evaluateExpression, and evaluateDocument so that documents with arithmetic lets can be fully evaluated in source order.
- Introduce clear, location-aware diagnostics for undefined identifiers (AMX1004).
- Write focused evaluator tests that validate literals, arithmetic, precedence, parentheses, variable references, and error cases.
- Extend parser tests only where needed to assert correct AST shapes for arithmetic expressions.
- Update planning/state.md and planning/decisions.md as required.
- Keep the build and test suite green at every step.
- All code must remain general-purpose; no Asset Management domain logic in parser, runtime, or diagnostics.

## Files to Create or Update

**Primary implementation targets (Sprint 003 scope)**
- src/parser/parseExpression.ts — replace minimal scaffolding with full expression parser supporting literals, identifiers, arithmetic operators, unary minus, parentheses, correct precedence, and right-associative ^.
- src/parser/parseStatements.ts — ensure it delegates to the real parseExpression for let RHS (remove or minimize placeholder fallback).
- src/runtime/environment.ts — implement Environment supporting set/get with clear undefined handling.
- src/runtime/evaluateExpression.ts — implement recursive evaluation of ExpressionNode trees to primitive values.
- src/runtime/evaluateDocument.ts — implement document-order evaluation of VariableDeclarationNodes into environment; produce final context map.
- src/diagnostics/errors.ts — define error shape and at minimum the AMX1004 undefined identifier error with optional file/line/column.

**Tests**
- tests/evaluator.test.ts — replace skeleton with real tests for arithmetic evaluation, precedence, references, and errors.
- tests/parser.test.ts — optional additions to assert BinaryExpressionNode / UnaryExpressionNode structure for arithmetic lets (keep minimal).

**Planning artifacts**
- planning/state.md — update current status, sprint history, and next steps.
- planning/decisions.md — record any new decisions (e.g., error code assignment, how undefined is represented internally, associativity confirmation, evaluation strategy for forward refs).
- planning/sprints/0003-variable-declarations-basic-expressions-evaluator/requirements.md (already created)
- planning/sprints/0003-variable-declarations-basic-expressions-evaluator/blueprint.md (this file)
- planning/sprints/0003-variable-declarations-basic-expressions-evaluator/acceptance.md
- planning/sprints/0003-variable-declarations-basic-expressions-evaluator/handoff-prompt.md

**No changes to**
- package.json, tsconfig.json, .gitignore
- parseFrontMatter.ts, parseDocument.ts (beyond any minor delegation tweaks)
- renderer/, cli.ts (beyond existing stubs), index.ts (beyond existing exports)
- examples/ content (stubs remain)
- renderer.test.ts (stays as skeleton)
- No implementation of comparisons, logicals, conditionals, calls, lists, or stdlib

## Notes

- Keep laser-focused on arithmetic expressions + evaluation. Do not begin comparisons, logicals, conditionals, function calls, lists, stdlib, or rendering.
- Expression parser must produce proper tree nodes (BinaryExpressionNode, UnaryExpressionNode, literals, identifiers). The Sprint 002 "raw placeholder IdentifierNode" approach is replaced for arithmetic cases.
- ^ is right-associative (per master plan decisions).
- Evaluation is strictly sequential in source order; forward references must produce a clear undefined error.
- Environment should throw or surface a well-formed diagnostic for undefined (AMX1004) rather than returning undefined/NaN silently.
- SourceLocation from AST should be propagated into error objects when available.
- After this sprint the repository will have a working parse → evaluate pipeline for all arithmetic expressions and lets, ready for comparisons/logicals/conditionals in Sprint 004.
- Verify at the end: `bun install && bun run build && bun test`.
