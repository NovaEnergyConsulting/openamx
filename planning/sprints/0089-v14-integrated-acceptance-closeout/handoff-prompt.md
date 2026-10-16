# Sprint 089 Handoff Prompt

You are the Builder for OpenAMX Sprint 089: V0.14 Integrated Acceptance and
Closeout.

## Read First

- Project agent instructions and current worktree status. Preserve all
  existing source, user changes, test output, screenshots, logs, and
  generated artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV14MasterSprintPlan.md`.
- Sprint 089 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `builder-evidence.md`, and this handoff.
- All Sprint 084 contract artifacts and Sprints 085-088 requirements,
  acceptance, and Builder evidence, including exact raw failures, retries,
  user dispositions, environments, and residual owners.
- Current V0.14 specification and examples; core tests/build; VS Code host
  tests; desktop Help/UI, RPC, typecheck, web build, and native/package
  workflows.

## Entry Gate

- Sprints 084-088 are separately accepted. Their evidence is input and
  baseline, not integrated Sprint 089 acceptance.
- Obtain separate explicit Sprint 089 execution authorization and approval
  of the concrete verification/evidence file plan before running the
  authorized integrated workflow or changing evidence/ledger files.
- Record current environment, branch/worktree, and output preservation
  plan. Do not clean or overwrite historical artifacts outside the approved
  scope.
- Sprint 089 is verification/closeout only. Isolate any product defect and
  request separate corrective authorization; do not expand this sprint into
  feature implementation.

## Task Contract

- Complete the requirement-to-evidence matrix for all applicable Sprint 084
  IDs and all 44 canonical fixtures.
- Re-run core positive/negative fixtures, exact diagnostics/source ranges,
  measurement/unit results, library domains/finite behavior, editor and
  example acceptance, and full root/VS Code/desktop workflows.
- Directly test relevant user-visible VS Code and desktop surfaces; preserve
  separate host/harness/native statuses.
- Compare all results against Sprint 085-088 baselines. Preserve first-run
  failures, retries, and separate user acceptance dispositions without
  erasing raw outcomes.
- Record all PASS/FAIL/BLOCKED/UNAVAILABLE/NOT RUN statuses, exact commands,
  versions, counts, artifacts, residual owners, and follow-up.
- Submit a Builder closeout recommendation and request a separate Lead
  Developer/product-owner V0.14 disposition.

## Mandatory Boundaries

- Sprint 084's approved contract is behavior authority; accepted
  implementation details from Sprint 085-088 do not authorize semantic
  changes.
- No code fixes, test weakening, assertion/path/sandbox/security changes,
  output-bound changes, new product scope, dependencies, or release work.
- Report VS Code Windows path/cleanup failures and desktop RPC sandbox
  failures as actually observed. Do not treat user-reported local deployment
  confirmation, a Vite harness, a build, or a focused test as another
  surface's direct test.
- If native/package testing cannot be run, record
  BLOCKED/UNAVAILABLE and why; do not infer a pass.
- Sprint 089 closeout does not authorize release, publication, version
  change, package release, or platform certification.

## Completion

Meet every criterion in `acceptance.md`, finish the integrated evidence
matrix, submit the recommendation, and obtain a separate Lead
Developer/product-owner disposition. If disposition is pending, leave V0.14
closeout explicitly pending; do not self-accept the milestone.
