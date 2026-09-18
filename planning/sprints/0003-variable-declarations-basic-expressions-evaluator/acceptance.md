# 003 Acceptance Criteria

003 is complete when:

- The sprint directory planning/sprints/0003-variable-declarations-basic-expressions-evaluator/ exists with four customized files: requirements.md, blueprint.md, acceptance.md, and handoff-prompt.md.
- planning/state.md has been updated to reflect that Sprint 003 (Variable Declarations + Basic Expressions + Evaluator) is active or complete.
- planning/decisions.md has been reviewed/updated if any new decisions or clarifications arose during implementation.
- src/parser/parseExpression.ts implements a full expression parser:
  - Supports number, string, boolean literals and identifiers.
  - Supports binary operators + - * / % ^ with correct precedence.
  - Supports unary minus.
  - Supports parentheses for grouping.
  - ^ is right-associative.
  - Produces proper ExpressionNode trees (BinaryExpressionNode, UnaryExpressionNode, literals, identifiers).
  - Replaces the Sprint 002 placeholder fallback for arithmetic expressions.
- parseStatements.ts (and/or parseDocument) delegates to the real parseExpression for let RHS, producing correct AST for arithmetic lets.
- src/runtime/environment.ts implements an Environment supporting set(name, value) and get(name) with clear handling for undefined identifiers.
- src/runtime/evaluateExpression.ts implements recursive evaluation of ExpressionNode to primitive values (number | string | boolean).
- src/runtime/evaluateDocument.ts walks DocumentNode[] in source order, evaluates VariableDeclarationNodes, stores results in environment, and returns the final context map of all declared variables.
- src/diagnostics/errors.ts defines error shape and at minimum the AMX1004 "Undefined identifier" error including file/line/column when SourceLocation is available.
- Evaluator tests in tests/evaluator.test.ts cover at minimum:
  - Evaluation of number, string, and boolean literals.
  - Simple arithmetic (+ - * / % ^).
  - Operator precedence (e.g., 10 + 5 * 2 === 20).
  - Parentheses overriding precedence (e.g., (10 + 5) * 2 === 30).
  - Variable references to previously declared variables.
  - Forward references produce a clear undefined error.
  - Undefined variable produces AMX1004-style error with location when available.
- Parser tests may include assertions for correct arithmetic AST structure (Binary/Unary nodes) where relevant.
- All new and existing tests pass: `bun test`.
- The project builds cleanly: `bun run build`.
- No implementation work has started on comparisons, logical operators, conditionals, function calls, lists, stdlib, rendering, or CLI execution.
- All modules remain general-purpose with no Asset Management domain concepts.
- Any assumptions or open questions encountered were recorded in planning/questions.md.
- The handoff-prompt.md in this sprint folder correctly references .agents/main.md, the current sprint directory, and "openamx".
