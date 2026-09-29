# 008 Handoff Prompt

You are the Builder for `openamx` Sprint 008.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo’s documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV02MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/requirements.md`
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/acceptance.md`
- `planning/sprints/0008-mutable-bindings-ranges-loops/requirements.md`
- `planning/sprints/0008-mutable-bindings-ranges-loops/blueprint.md`
- `planning/sprints/0008-mutable-bindings-ranges-loops/acceptance.md`

Execute only the documented Sprint 008 scope. Do not invent business rules or redefine the V0.2 language contract. If a genuinely blocking ambiguity appears, record it in `planning/questions.md` before proceeding and do not silently change the contract.

Sprint 007 is complete. The document parser recognizes executable `amx` fences and stores their declaration statements in code-block AST nodes; bare V0.1 declarations are narrative. The V0.2 specification is authoritative. This sprint adds mutation, ranges, and simple loops to the parser/runtime; it does not implement `match` or document-wide block rendering.

## Task Contract

**objective**: Implement mutable/redeclared bindings, `=` and `+=`, inclusive integer ranges, statement-form and expression-form `for` loops, and the acceptance coverage in `planning/sprints/0008-mutable-bindings-ranges-loops/acceptance.md`.

**owns**:
- `docs/language-spec-v0.2.md` (minimal grammar clarification for expression-form loops, matching the approved requirements/decisions)
- `src/ast/types.ts`
- `src/parser/parseExpression.ts`
- `src/parser/parseStatements.ts` and narrowly required parser support modules
- `src/runtime/environment.ts`
- `src/runtime/evaluateExpression.ts` and any narrowly scoped statement evaluator module
- `src/diagnostics/errors.ts`
- `tests/parser.test.ts`
- `tests/evaluator.test.ts`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- The four files in `planning/sprints/0008-mutable-bindings-ranges-loops/` only when a factual clarification is needed; record deviations explicitly.

**must_not**:
- Implement `match` parsing/evaluation; it is Sprint 009.
- Implement document-wide execution of multiple code blocks, final-environment inline interpolation, executable-source formatting, renderer integration, or HTML changes; those are Sprint 010.
- Add nested loops, `break`, `continue`, general early-exit returns, conditional loop-body control flow, range steps, or non-integer range semantics.
- Execute bare V0.1 declarations outside `amx` blocks or weaken Sprint 007’s migration/fence/location behavior.
- Add Asset Management core syntax/libraries, dependencies, a new parser framework, extension features, or V0.3 candidates.
- Change CLI/examples or perform unrelated refactors.

**acceptance**:
- Meet every item in `planning/sprints/0008-mutable-bindings-ranges-loops/acceptance.md`.
- Repeated `let` updates the existing binding; assignment and `+=` require a declared binding. Undefined references and assignment targets use clear AMX1004 diagnostics with source location.
- Inclusive ranges support ascending, descending, and equal finite-integer endpoints; list literals remain distinct and unchanged.
- Statement loops iterate for side effects without returns. Expression loops are parsed in expression context, require exactly one `return expression`, collect one result per iteration, continue after return for side effects, and return `[]` for empty input.
- Only the iterator is loop-scoped and is restored after the loop, including when evaluation fails. Other changes use the shared supplied environment.
- Returns are invalid outside expression loops; nested loops, `break`, and `continue` remain unsupported.
- `match` and multi-block document orchestration remain deferred.

**verification**:

1. After the first implementation edit, run focused parser/evaluator tests covering one mutation path, one range path, one loop path, and the Sprint 007 fenced-block boundary.
2. Run `bun run build`.
3. Run `bun test`.
4. Confirm tests cover all acceptance boundaries, particularly empty expression loops, iterator shadow restoration, return cardinality/context, and invalid range bounds.
5. Update planning status and record the actual verification results/deviations. Mark Sprint 008 complete only after all acceptance criteria pass.
