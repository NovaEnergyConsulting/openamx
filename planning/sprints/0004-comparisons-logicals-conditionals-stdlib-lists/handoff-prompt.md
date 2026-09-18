# 004 Handoff Prompt

You are the Builder for `openamx`.

Read these files first:

- .agents/main.md
- planning/state.md
- planning/decisions.md
- planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/requirements.md
- planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/blueprint.md
- planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/acceptance.md

Execute only the documented sprint scope. Do not invent business rules or redefine requirements. If information is missing, update planning/questions.md and proceed only when assumptions are clearly marked.

This sprint is strictly about completing the expression layer for v0.1: adding comparison operators (== != > >= < <=), logical operators (and / or / not), single-line conditional expressions (if E then E else E), list literals [ ... ], function calls, and implementing the full standard library (sum, min, max, mean, round, abs, sqrt, pow) with evaluation support. 

Do NOT implement chained else-if conditionals (document the single-line limitation only). 
Do NOT start renderer work (inline {{ }} substitution or renderHtml.ts). 
Do NOT implement or exercise CLI commands beyond existing stubs. 
Do NOT populate full example .amx content.

All language features beyond the expression model (rendering, CLI, full examples) belong to later sprints. Keep the build and tests green. All modules must remain general-purpose.
