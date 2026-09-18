# 004 Requirements: Comparisons, Logical, Conditionals, Stdlib, Lists

## Goal

Extend the expression parser and evaluator to support the remaining expression features required for v0.1: comparison operators, logical operators, single-line conditional expressions (if/then/else), list literals, function calls, and the full standard library (sum, min, max, mean, round, abs, sqrt, pow). Implement parsing and evaluation for these constructs, produce correct AST nodes, handle basic type errors, and add comprehensive tests. Document the explicit v0.1 limitation that chained else-if conditionals are not supported. This sprint completes the full expression model and runtime for the parse → evaluate pipeline. Rendering, CLI, and example population remain for later sprints.

## Inputs

- Project brief / authoritative spec: .agents/language-spec-v0.1.md (sections 3.5 Expression Evaluation (full: comparisons, logicals, conditionals), 3.7 Basic Standard Library, 5 Architecture, 6 AST Design, 8 Expression Parser (full precedence), 9 Evaluation Requirements, 12 Tests (evaluator cases for comparisons/logicals/conditionals/lists/stdlib), 13 Examples (structure))
- Master plan: planning/plan-openamxV01MasterSprintPlan.md (Sprint 004 details under Phase 3 – Expression Completeness)
- Operating model: .agents/main.md (120x Architect/Builder, sprint workflow, builder rules)
- Template: planning/sprints/0000-sprint-template/
- Current project state after Sprint 003: package.json, tsconfig.json, full AST (including comparison/logical/conditional/list/call nodes), working arithmetic parser + evaluator, Environment, AMX1004 diagnostics, parser + evaluator tests (30+), examples as stubs, planning/state.md / decisions.md / questions.md
- Existing modules that will be extended: src/parser/parseExpression.ts, src/runtime/evaluateExpression.ts, src/runtime/standardLibrary.ts, src/runtime/environment.ts (minor), tests/evaluator.test.ts (and possibly parser.test.ts)

## In Scope

- Extend expression parser in parseExpression.ts (recursive descent + Pratt / precedence climbing):
  - Comparison operators: == != > >= < <= (binary)
  - Logical operators: and, or (binary, keyword style), not (unary)
  - Conditional: single-line `if E then E else E` → ConditionalExpressionNode
  - List literals: [ expr, expr, ... ] (elements: literals, identifiers, sub-expressions; num/str/bool supported) → ListLiteralNode
  - Function calls: Identifier ( arg, arg, ... ) → FunctionCallNode (callee as string name)
  - Full operator precedence (highest to lowest):
    - parentheses
    - function calls
    - unary: - not
    - power: ^ (right-associative)
    - * / %
    - + -
    - comparison: == != > >= < <=
    - logical and
    - logical or
    - conditional if/then/else
  - Tokenize additional symbols/keywords: ==, !=, >=, <=, and, or, not, if, then, else, [, ], ,
  - Correct AST construction for all new node types.
- Extend evaluator:
  - evaluateExpression.ts: handle new BinaryExpression operators (comparisons, and/or), Unary 'not', ConditionalExpressionNode, ListLiteralNode, FunctionCallNode.
  - Delegate stdlib function execution to standardLibrary.ts.
  - Environment may need minor enhancements if required for list/func semantics (keep minimal).
- Implement standardLibrary.ts:
  - sum(values): sum of list elements (numbers)
  - min(values), max(values), mean(values)
  - round(value, digits?)
  - abs(value), sqrt(value), pow(value, exponent)
  - Handle lists (arrays) and scalars appropriately; produce clear errors for invalid usage.
- Diagnostics / errors:
  - Extend or reuse AmxError patterns for type errors, wrong argument counts, non-list passed to aggregate, etc. (use clear messages; AMX codes optional beyond existing 1004 if not already defined).
- Tests (primarily tests/evaluator.test.ts, parser.test.ts additions as needed):
  - All comparison operators with numbers, mixed types where sensible, truthy behavior.
  - Logical and / or / not (short-circuit semantics acceptable if simple; document).
  - Single-line conditionals: if true/false then ... else ...
  - List literals in lets and expressions; nested lists if natural.
  - All 8 stdlib functions: basic usage, with list literals, with variables, edge cases (empty list for min/max/mean/sum?).
  - Type errors: e.g. sum on non-list, arithmetic on incompatible types if enforced, wrong arg count for functions.
  - Precedence involving new operators (e.g. comparisons lower than arithmetic; and/or lower than comparisons).
  - Integration: full document evaluation mixing arithmetic + new features.
- Parser tests: assert correct AST shapes for new constructs (e.g. Binary with '==', ConditionalExpressionNode, ListLiteralNode, FunctionCallNode).
- Update planning/state.md to mark Sprint 004 prepared / active and record completion when Builder finishes.
- Record any new decisions or clarifications in planning/decisions.md.
- Keep `bun run build && bun test` green throughout.
- All modules remain general-purpose (no Asset Management domain concepts).

## Out of Scope

- Chained / multi-branch conditionals (else if) — explicitly document as v0.1 limitation only.
- Inline {{ }} substitution or any renderer work (renderHtml.ts) — Sprint 005.
- CLI command implementation or execution (beyond existing stubs) — Sprint 006.
- Populating full realistic content of example .amx files (full versions + expected outputs in Sprint 006).
- Complete / polished diagnostics beyond what is needed for correct operation and test coverage.
- Any items listed in language-spec-v0.1.md section 4.
- Changes to package.json, tsconfig, or project layout.
- Renderer tests or HTML output.
- Advanced list features (list comprehensions, indexing/slicing, mutation).
- Imports or multi-file support.
- Any work on Markdown rendering or frontmatter usage beyond what already exists.

## Constraints

- Strictly follow the 120x process and builder rules in .agents/main.md. Execute only the documented sprint scope.
- Use bun for all commands and verification.
- Architecture must stay simple, modular, and general-purpose.
- Source order must be strictly preserved (evaluation follows declaration order).
- Identifiers remain case-sensitive.
- ^ remains right-associative.
- Conditionals are single-line only: `if E then E else E`. Chained else-if must not be implemented; record the limitation.
- List literals support literal and expression elements; elements evaluated before passing to functions.
- Stdlib functions must work with list literals and with variables holding lists.
- Errors for undefined, type mismatches, and invalid calls must be clear (propagate AmxError where appropriate; include location when available).
- Do not implement or test rendering, CLI, or full examples.
- If any information is missing or ambiguous, record it in planning/questions.md with clear assumptions before proceeding.
- At the end of the sprint the project must support `bun install && bun run build && bun test` cleanly, with expanded evaluator + parser tests passing.
- No scope creep into Sprint 005 (renderer) or 006 (CLI + examples + full acceptance).
- Forward references continue to error (no hoisting).
