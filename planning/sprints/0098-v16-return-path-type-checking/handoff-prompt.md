# Sprint 098 Handoff Prompt

You are the Builder for OpenAMX Sprint 098: V0.16 Return-Path and Type
Checking.

## Read First

- Project instructions and current worktree state. Preserve user changes and
  accepted Sprint 095-097 artifacts.
- `planning/plan-openamxV16MasterSprintPlan.md`, Sprint 098.
- Accepted Sprint 095 `function-body-contract.md`,
  `control-flow-fixtures.md`, `diagnostic-matrix.md`, and
  `requirement-test-matrix.md`.
- Accepted Sprint 096 `builder-evidence.md` and current
  `FunctionBodyNode` in `src/ast/types.ts`.
- Accepted Sprint 097 `builder-evidence.md` and runtime `AMXF4002` diagnostic
  registration/test. The later Sprint 097 decision resolves D-095-13; do not
  rewrite the earlier Sprint 095 record.
- Sprint 098 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `type-check-test-matrix.md`, `builder-evidence.md`, and this handoff.
- Current checker flow helpers/function declaration case and focused
  type-check, evaluator, parser, and module tests.

## Entry Gate

- Sprint 096 and Sprint 097 are separately accepted/closed, satisfying the
  master plan's prerequisite/parallel gates.
- Obtain separate explicit Sprint 098 execution authorization and approval
  of the concrete checker/test/evidence file plan before edits. This prepared
  package is not implementation authorization.
- The accepted Sprint 095 contract is authoritative. The Sprint 097 evidence
  is the later disposition for D-095-13 and confirms
  `AMXF4002: Function finished without returning a valid expression` as the
  runtime guard. Preserve both historical records; do not reallocate codes.

## Task Contract

- Keep expression-body checking unchanged; type-check statement bodies in a
  dedicated function scope using the declared return type.
- Validate every explicit return expression, including nested and
  unreachable returns.
- Track reachable fallthrough through sequences, if/else branches, and
  possibly empty statement loops. A loop never guarantees function return;
  later returns can close the path.
- Check all statements even after a terminating return, without adding an
  unreachable-code warning or allowing unreachable flow to reopen the path.
- Preserve branch/loop lexical scopes, parameter visibility, nested
  shadowing, same-scope repeated-let behavior, assignments, iterator
  restoration, declaration order, and no-capture/no-recursion rules.
- Preserve expression-loop returns and braced-if-expression return semantics.
  Do not count expression-local returns as function statement returns.
- Register and emit `AMXF4001: Missing return value from function` at the
  function closing brace. Keep runtime `AMXF4002` distinct; preserve
  `AMX3021` for braced-if expressions.
- Use the test matrix and record exact evidence and residuals.

## Mandatory Boundaries

- Do not change parser/runtime behavior, except for a separately approved
  integration defect that cannot be fixed in the checker/test plan.
- Do not remove the runtime AMXF4002 guard or treat it as a static error.
- Do not rework standard expression inference, Measurement rules, modules, or
  diagnostics beyond what is necessary to support the accepted function
  contract.
- No formatter/editor/docs/examples, release/version changes, publication,
  or platform certification.
- Do not claim V0.16 integrated acceptance; Sprint 101 owns closeout.

## Completion

Meet all acceptance criteria, run the focused type-check/runtime/parser/module
regression gates in the approved plan, record exact results in
`builder-evidence.md`, and request a separate Sprint 098 disposition.