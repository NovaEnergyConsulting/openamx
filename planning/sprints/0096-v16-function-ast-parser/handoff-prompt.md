# Sprint 096 Handoff Prompt

You are the Builder for OpenAMX Sprint 096: V0.16 Function AST and Parser.

## Read First

- Project instructions and current branch/worktree status. Preserve all
  user changes, Sprint 095 accepted evidence, test outputs, generated files,
  and unrelated artifacts.
- `planning/plan-openamxV16MasterSprintPlan.md`, Sprint 096.
- Accepted Sprint 095 artifacts:
  `requirements.md`, `function-body-contract.md`,
  `control-flow-fixtures.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, `builder-evidence.md`.
- Sprint 096 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `parser-fixture-matrix.md`, `builder-evidence.md`, and this handoff.
- Current AST/parser/diagnostic/source-location implementation and existing
  tests named in the Sprint 096 blueprint. Inspect additional AST consumers
  only when the compiler or focused parser tests show they need adaptation.

## Authority and Entry Gate

- Sprint 095's separate product-owner `ACCEPTED/CLOSED` disposition is the
  behavior gate and is recorded on 2026-10-23.
- Obtain separate explicit Sprint 096 execution authorization and approval
  of the concrete source/test/evidence file plan before making source/test
  changes. Contract disposition is not execution authorization.
- The V0.16 master plan and accepted Sprint 095 contract control scope and
  behavior. Do not revise Sprint 095 records as an implementation shortcut.
- Keep Sprint 096 changes within its approved source/test paths. Any required
  expansion must be surfaced with exact paths and reason before editing.

## Task Contract

- Add an explicit discriminated AST representation for expression versus
  statement function bodies. Preserve the expression-body AST payload and
  parsing behavior.
- Parse braced bodies via the approved statement grammar, retaining source
  order and original source locations, including body opening/closing braces.
- Support statement-function returns directly and through statement-form
  if/else and for contexts. Keep this permission separate from expression
  loop collection and braced-if expression branch returns.
- Reuse the existing parser for legal local declarations, assignments,
  `+=`, if/else, statement loops, list mutation, and return statements.
- Preserve exact accepted diagnostics:
  - malformed body: `AMX3006: Invalid syntax in function body`;
  - unclosed body: `AMX3006: Unclosed function body` at opening brace;
  - prohibited statement: `AMX3006: The '{keyword}' statement is not allowed in a function body.`;
  - invalid return context: `AMX3006: Return is only valid inside a function or expression-form loop`.
- Preserve newline separators, semicolon rejection, nested-loop prohibition,
  and `break`/`continue` rejection.
- Add and run parser tests using `parser-fixture-matrix.md`. Update AST
  consumers only as needed for compilation; do not implement later-sprint
  semantics.
- Record every changed path, exact command and outcome, diagnostic range,
  residual, and unrun check in `builder-evidence.md`.

## Explicit Non-Goals

- Do not execute statement-body functions or propagate runtime returns.
- Do not implement return compatibility/all-path checking or register
  `AMXF4001`; Sprint 098 owns those tasks.
- Do not implement list-copy semantics or choose a diagnostic for defensive
  runtime fallthrough. D-095-13 remains a Sprint 097 blocker.
- Do not add formatter/editor features, user-facing specifications/examples,
  release/version changes, publication, or platform-certification claims.
- Parser acceptance is not evidence that a function body type-checks or runs.

## Completion

Meet all criteria in `acceptance.md`, complete the parser fixture matrix, and
submit exact evidence and residuals for a separate Sprint 096 disposition.
Do not mark Sprints 097/098 authorized or ready from this handoff alone; each
requires its own scope/authorization gates and S097 remains blocked on
D-095-13 allocation.