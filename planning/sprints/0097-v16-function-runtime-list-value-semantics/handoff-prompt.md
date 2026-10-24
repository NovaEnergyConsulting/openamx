# Sprint 097 Handoff Prompt

You are the Builder for OpenAMX Sprint 097: V0.16 Function Runtime and List
Value Semantics.

## Read First

- Project instructions and current branch/worktree status. Preserve all user
  changes, generated artifacts, and accepted Sprint 095/096 evidence.
- `planning/plan-openamxV16MasterSprintPlan.md`, Sprint 097.
- Accepted Sprint 095 `function-body-contract.md`,
  `control-flow-fixtures.md`, `diagnostic-matrix.md`, and `builder-evidence.md`.
- Accepted Sprint 096 `requirements.md`, `acceptance.md`, and
  `builder-evidence.md`.
- Sprint 097 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `runtime-test-matrix.md`, `builder-evidence.md`, and this handoff.
- Current `src/runtime/evaluateExpression.ts`, `src/runtime/environment.ts`,
  runtime diagnostic definitions, and focused evaluator tests.

## Blocking Entry Gates

- **Do not begin implementation until D-095-13 is resolved.** Obtain the
  Lead Developer/product owner's exact diagnostic code, message, category,
  and source-anchor disposition for defensive statement-function fallthrough.
  The accepted record explicitly forbids reusing `AMX1007`.
- Separately obtain explicit Sprint 097 execution authorization and approval
  of the concrete source/test/evidence file plan. Sprint 096 acceptance and
  this prepared documentation do not authorize implementation.
- If the diagnostic allocation is still pending, keep this sprint
  `BLOCKED/OPEN`; do not edit source/tests as a probe. Record the decision
  request and wait for disposition.

## Task Contract After the Gates Close

- Evaluate statement-body functions in isolated call frames.
- Propagate a dedicated function-return signal through nested statement
  if/else and for blocks and catch it only at the function call boundary.
  Preserve existing expression-body, braced-if expression, and expression-
  loop return semantics.
- Restore lexical shadow bindings and loop iterators on normal completion and
  return unwinding while keeping assignments to existing outer locals visible
  within the function call.
- Deep-copy arrays recursively at each list-parameter boundary, independently
  for each parameter, including repeated arguments. Keep non-array elements
  opaque; return mutated local lists directly.
- Implement the allocated defensive fallthrough error at the closing-brace
  source. Do not return a fabricated value.
- Use `runtime-test-matrix.md`; bypass `checkDocument` only in a test helper
  because statement-body type checking belongs to Sprint 098.
- Record exact paths, commands, outcomes, residuals, and non-run checks in
  `builder-evidence.md`.

## Mandatory Boundaries

- Do not implement `AMXF4001`, explicit-return static typing, all-path
  checking, or other Sprint 098 behavior.
- Do not clone records/Measurements or introduce generic deep-clone behavior.
- Do not change expression-loop return collection or use its return signals
  for function exit.
- Do not expand into formatter/editor, examples/spec/README/help, release,
  publication, or unrelated runtime cleanup.
- Do not change Sprint 095/096 accepted records to erase a blocker or make
  evidence appear complete.

## Completion

Meet all applicable criteria in `acceptance.md`, including the allocated
fallthrough diagnostic, exact runtime fixtures, focused tests, and a separate
Sprint 097 disposition. If D-095-13 is unresolved, no implementation has
started and Sprint 097 stays `BLOCKED/OPEN`.