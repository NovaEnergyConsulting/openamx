# 003 Requirements: Variable Declarations + Basic Expressions + Evaluator

## Goal

Complete the core parsing and evaluation pipeline for variable declarations and basic expressions. Implement a full expression parser (recursive descent + Pratt) for literals, identifiers, arithmetic operators (+ - * / % ^), unary minus, and parentheses with correct precedence and associativity. Implement the runtime environment and evaluators that process documents in source order. Support clear, location-aware errors for undefined variables (AMX1004 style). Add comprehensive evaluator tests covering lets, arithmetic, precedence, parentheses, variable references, and error cases. This sprint enables the parse → evaluate path for arithmetic-only expressions. Comparisons, logical operators, conditionals, function calls, lists, and stdlib are explicitly deferred to Sprint 004.

## Inputs

- Project brief / authoritative spec: .agents/language-spec-v0.1.md (sections 3.4 Variable Declarations, 3.5 Expression Evaluation (arithmetic subset only), 5 Architecture, 6 AST Design, 7 Parser Requirements, 8 Expression Parser (precedence for arithmetic), 9 Evaluation Requirements, 12 Tests (evaluator subset for arithmetic), 13 Examples (structure))
- Master plan: .agents/planning/plan-openamxV01MasterSprintPlan.md (Sprint 003 details under Phase 2 – Parsing & Model)
- Operating model: .agents/main.md (120x Architect/Builder, sprint workflow, builder rules)
- Template: planning/sprints/0000-sprint-template/
- Current project state after Sprint 002: package.json, tsconfig.json, full AST in src/ast/types.ts, working parseFrontMatter / parseStatements / parseDocument, minimal parseExpression.ts (atoms + placeholder), placeholder runtime and diagnostics modules, parser tests passing, examples as stubs, planning/state.md / decisions.md / questions.md
- Existing modules that will be implemented or extended: src/parser/parseExpression.ts, src/runtime/*, src/diagnostics/errors.ts, tests/evaluator.test.ts

## In Scope

- Full "let Identifier = Expression" parsing (case-sensitive identifiers per spec 3.4 rules).
- Expression parser in parseExpression.ts:
  - Recursive descent for top-level structure + Pratt parser (or equivalent precedence climbing) for expressions.
  - Supported:
    - Literals: number (int/decimal, optional leading -), string ("..."), boolean (true/false)
    - Identifiers (case-sensitive, Letter (Letter|Digit|_)* )
    - Binary operators: + - * / % ^
    - Unary: - (minus)
    - Grouping: ( )
  - Operator precedence (highest to lowest for this sprint):
    - parentheses
    - unary -
    - ^ (power, right-associative per decisions)
    - * / %
    - + -
  - Correct associativity for ^ (right).
  - Produce proper ExpressionNode trees (no more raw placeholder IdentifierNodes for arithmetic).
- Update parseStatements.ts (and/or parseDocument) to delegate to the real parseExpression for let RHS (remove Sprint 002 placeholder fallback where possible).
- Runtime implementation:
  - environment.ts: Environment class or interface supporting set(name, value), get(name) → throws clear error or returns sentinel for undefined, reset/clear.
  - evaluateExpression.ts: recursive evaluation of ExpressionNode against environment; produce primitive values (number | string | boolean).
  - evaluateDocument.ts: walk DocumentNode[] in source order; for each VariableDeclaration evaluate its expression and store in environment; return final context map (all declared variables with their values). Narrative nodes are ignored for evaluation.
- Diagnostics:
  - src/diagnostics/errors.ts: define error shape (code, message, file?, line?, column?) and at minimum AMX1004 "Undefined identifier 'X'" with location when available. Use from evaluator.
- Tests (primarily tests/evaluator.test.ts, with possible parser.test.ts additions):
  - Evaluate number/string/boolean literals.
  - Evaluate simple arithmetic (+ - * / % ^).
  - Respect operator precedence (e.g. 10 + 5 * 2 === 20).
  - Parentheses override precedence (e.g. (10 + 5) * 2 === 30).
  - Variable references to previously declared variables.
  - Forward references (use of later-declared variable) produce undefined error.
  - Undefined variable produces clear AMX1004-style error including file/line/column when location available.
  - Basic error propagation from expression evaluation.
- Parser tests may be extended to assert correct AST structure for arithmetic lets (e.g. BinaryExpressionNode trees) now that full parsing exists.
- Update planning/state.md to mark Sprint 003 active / in progress and record completion when done.
- Record any new decisions or clarifications in planning/decisions.md.
- Keep `bun run build && bun test` green throughout.
- All modules remain general-purpose (no Asset Management domain concepts).

## Out of Scope

- Comparison operators (== != > >= < <=) — Sprint 004.
- Logical operators (and / or / not) — Sprint 004.
- Conditional expressions (if E then E else E) — Sprint 004.
- Function calls and standard library (sum, min, max, mean, round, abs, sqrt, pow) — Sprint 004.
- List literals [ ... ] — Sprint 004.
- Inline {{ expression }} substitution or renderer (renderHtml.ts) — Sprint 005.
- CLI command implementation (beyond existing stub) — Sprint 006.
- Populating full content of example .amx files (full versions in Sprint 006).
- Complete diagnostics beyond basic undefined + location for this sprint.
- Any items listed in language-spec-v0.1.md section 4.
- Changes to package.json, tsconfig, or project layout.
- Renderer tests or snapshot testing.
- Chained conditionals or advanced expression features.

## Constraints

- Strictly follow the 120x process and builder rules in .agents/main.md. Execute only the documented sprint scope.
- Use bun for all commands and verification.
- Architecture must stay simple, modular, and general-purpose.
- Source order must be strictly preserved (evaluation follows declaration order).
- Identifiers are case-sensitive.
- ^ must be right-associative.
- Errors for undefined must be clear and include location (file/line/col) when the AST carries SourceLocation.
- Do not implement or test comparisons, logicals, conditionals, calls, lists, or stdlib.
- If any information is missing or ambiguous, record it in planning/questions.md with clear assumptions before proceeding.
- At the end of the sprint the project must support `bun install && bun run build && bun test` cleanly, with new evaluator tests passing.
- No scope creep into Sprint 004 (comparisons + logicals + conditionals + stdlib + lists).
- Forward references must error (variables are not hoisted; evaluation is strictly in source order).
