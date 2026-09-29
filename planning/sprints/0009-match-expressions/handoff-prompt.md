# 009 Handoff Prompt

You are the Builder for `openamx` Sprint 009.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo’s documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV02MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/acceptance.md`
- `planning/sprints/0008-mutable-bindings-ranges-loops/acceptance.md`
- `planning/sprints/0009-match-expressions/requirements.md`
- `planning/sprints/0009-match-expressions/blueprint.md`
- `planning/sprints/0009-match-expressions/acceptance.md`

Execute only Sprint 009 scope. Do not invent business rules or silently redefine the V0.2 language contract. If a genuinely blocking ambiguity appears, record it in `planning/questions.md` before implementation and resolve it with the Architect.

Sprint 007 established executable `amx` blocks and original-document locations. Sprint 008 delivered mutation, assignment, inclusive ranges, and statement/expression loops. This sprint adds only `match` expression parsing and evaluation. Sprint 010 remains responsible for document-wide block execution, final-environment inline interpolation, formatting, and rendering integration.

## Task Contract

**objective**: Implement braced V0.2 `match` value expressions with number/string/boolean literal cases, exactly one default, source-order first-match selection, strict primitive equality, useful source-located errors, and focused parser/evaluator coverage.

**owns**:
- `docs/language-spec-v0.2.md` (small clarification edits that align the finalized match contract)
- `src/ast/types.ts`
- `src/parser/parseExpression.ts` and narrowly scoped parser helper modules
- `src/runtime/evaluateExpression.ts`
- `src/diagnostics/errors.ts`
- `tests/parser.test.ts`
- `tests/evaluator.test.ts`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- The four files in `planning/sprints/0009-match-expressions/` only to correct factual errors or record an approved clarification

**must_not**:
- Implement guards, wildcard/identifier patterns, destructuring, range/list patterns, fallthrough, match statements, or any syntax beyond the documented case/default arms.
- Modify renderer or CLI, execute document code blocks in source order, wire interpolation to the final environment, format displayed code, or implement Sprint 010.
- Change existing operator precedence or equality semantics. Match cases use strict type-and-value equality and evaluate no branch other than the selected one.
- Modify loop, range, mutation, or fence behavior beyond fixing a directly blocking regression; report such a blocker and keep the repair minimal.
- Add dependencies, switch parser framework, add domain-specific concepts, or implement V0.3 candidates.
- Weaken/remove existing passing tests or make unrelated refactors.

**acceptance**:
- Meet every item in `planning/sprints/0009-match-expressions/acceptance.md`.
- Accept zero or more case arms and exactly one default; default may be located anywhere, including a default-only match.
- Case values are number, string, or boolean literals; allow an optional unary minus for numeric literals. No coercion is applied during selection.
- Evaluate scrutinee once; evaluate case arms in source order; select the first strict match or fallback; evaluate only the selected branch expression.
- Keep case ordering and original-document source locations in the AST/diagnostics.
- Prove match composition in parser/evaluator tests. Do not add renderer integration or document orchestration.

**verification**:

1. After the first implementation edit, run focused parser/evaluator tests for a matching case, default fallback, strict type mismatch, and source location.
2. Run `bun run build`.
3. Run `bun test`.
4. Confirm focused coverage includes invalid/missing/duplicate defaults, default-only match, first duplicate case, unselected-branch laziness, compound scrutinee, and nesting/composition.
5. Record actual verification and deviations in planning artifacts. Mark Sprint 009 complete only once all acceptance criteria pass.
