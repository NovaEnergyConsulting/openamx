# Sprint 095 Handoff Prompt

You are the Builder for OpenAMX Sprint 095: V0.16 Function Body Contract and
Technical Gate.

## Read First

- Project instructions and current worktree status. Preserve all existing
  changes, user data, test output, and generated artifacts.
- `planning/plan-openamxV16MasterSprintPlan.md`.
- Sprint 095 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `function-body-contract.md`, `control-flow-fixtures.md`,
  `diagnostic-matrix.md`, `requirement-test-matrix.md`,
  `builder-evidence.md`, and this handoff.
- `docs/language-spec-v0.3.md`, `docs/language-spec-v0.2.md`, and later
  specifications relevant to the behavior being preserved.
- Focused AST/parser, runtime/environment, type-checker, formatter, editor,
  diagnostic, and test code listed in the V0.16 master plan. Read only what is
  needed to prove existing contracts and source-location conventions.

## Authority and Entry Gate

- The V0.16 master plan is the confirmed scope authority. Sprint 095 artifacts
  are candidate contract details until reviewed and explicitly dispositioned.
- Obtain separate Sprint 095 execution authorization and approval of the
  concrete file-by-file review/probe/evidence plan before changes beyond this
  preparation package.
- Keep Sprint 095 changes in its planning folder unless an expanded plan is
  separately approved. Do not edit product source, tests, user-facing specs,
  examples, manifests, release files, or historical sprint records.
- Do not begin Sprint 096 unless Sprint 095 is separately accepted/closed and
  required decisions are resolved.

## Task Contract

- Finalize both function forms, legal body statements, statement nesting,
  lexical scope, visibility, and expression-body compatibility.
- Define the all-path return analysis and exact runtime propagation behavior.
  Cover conditionals, loops that may execute zero times, statements following
  returns, and every explicit return's type check.
- Preserve expression-form loop semantics: its return contributes one value
  per iteration rather than exiting the enclosing function.
- Finalize deep recursive list-copy behavior, isolation for each parameter
  when an argument is repeated, mutation boundaries, and returned-list
  behavior. Do not infer broader object-copy or mutation semantics.
- Complete the stable fixture set, diagnostic matrix, and requirement/test
  traceability. Verify diagnostic identities/messages and exact locations;
  request explicit allocation for any new code rather than inventing one.
- Label facts, confirmed requirements, proposals, approved choices,
  unresolved decisions, blocked items, and not-run checks distinctly.
- Complete `builder-evidence.md` with exact evidence and residual owners, then
  request a separate contract disposition.

## Mandatory Boundaries

- No implementation, implementation-test migration, new runtime capability,
  release, publication, package/version change, or certification claim is
  authorized by this sprint.
- Do not let the current implementation silently define behavior where the
  master plan establishes a different requirement, especially return exit,
  lexical scope, and list value isolation.
- Do not treat current parser rejection of brace-bodied functions as a
  contract failure. Do not treat a proposed fixture as evidence of working
  runtime behavior.
- Do not change established expression-form loop return collection while
  specifying function returns.
- If nested loops, aggregate deep-copy treatment, unreachable-code checking,
  or any other edge cannot be concluded from confirmed scope, record a
  specific decision request and downstream blocker rather than guessing.

## Completion

Meet every criterion in `acceptance.md`, cross-check all fixture and
requirement IDs, and submit a traceable Builder recommendation. The
Lead Developer/product owner must separately record `ACCEPTED/CLOSED` or
`BLOCKED/OPEN`. Pending disposition means Sprint 096 is not ready; this
handoff does not authorize any implementation sprint.