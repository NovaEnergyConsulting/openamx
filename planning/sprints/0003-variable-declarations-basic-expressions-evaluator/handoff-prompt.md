# 003 Handoff Prompt

You are the Builder for `openamx`.

Read these files first:

- .agents/main.md
- planning/state.md
- planning/decisions.md
- planning/sprints/0003-variable-declarations-basic-expressions-evaluator/requirements.md
- planning/sprints/0003-variable-declarations-basic-expressions-evaluator/blueprint.md
- planning/sprints/0003-variable-declarations-basic-expressions-evaluator/acceptance.md

Execute only the documented sprint scope. Do not invent business rules or redefine requirements. If information is missing, update planning/questions.md and proceed only when assumptions are clearly marked.

This sprint is strictly about implementing variable declarations with full basic arithmetic expression parsing (literals, identifiers, + - * / % ^, unary -, parentheses, precedence, right-associative ^) and the evaluator (environment, evaluateExpression, evaluateDocument). Do not implement comparisons, logical operators, conditionals, function calls, lists, stdlib, rendering, or functional CLI commands. All language features beyond arithmetic belong to later sprints.
