# Sprint 091 Handoff Prompt

You are the Builder for OpenAMX Sprint 091: V0.15 Numbered Guide, Index, and
Core Learning Path.

## Read First

- Project instructions and current worktree status. Preserve unrelated user
  changes, generated files, test results, screenshots and logs.
- `planning/plan-openamxV15MasterSprintPlan.md`.
- Sprint 091 `requirements.md`, `blueprint.md`, `acceptance.md`, and this
  handoff.
- Sprint 090 `builder-evidence-and-closeout.md`,
  `corpus-inventory-and-reference-trace.md`, and
  `final-information-architecture-and-feature-matrix.md`.
- Applicable language specifications and current examples/tests for any
  syntax used in the guide.
- Direct path consumers identified for each source/support file you intend
  to move, rewrite, or retain.

## Mandatory Entry Gates

- Sprint 090's current Builder record says `BLOCKED/OPEN` because the
  structured `ACCEPTED/CLOSED` selection conflicted with approval text that
  withheld architecture approval. Do not interpret “Builder finished Sprint
  090,” this handoff, or the existence of a proposal as architecture
  approval.
- Before implementation, obtain an unambiguous dated Lead
  Developer/product-owner Sprint 090 disposition and confirm the final
  00-07 architecture decisions needed for your file plan.
- Obtain separate explicit Sprint 091 execution authorization and approval
  of a concrete change/test/output plan. Record the branch, initial worktree
  state, protected outputs and files in scope.
- If either gate is missing or ambiguous, do not edit examples, tests,
  outputs or product files. Report the blocker and leave Sprint 091
  `BLOCKED/OPEN`.

## Task Contract

- Deliver `00_Table_of_Contents.amx` and the approved lessons 01-07:
  first document; expressions/decisions; collections/functions; typed
  records/enums/modules; Measurements/units; mapped data/validation; and
  tables/charts/named outputs.
- Follow the approved Sprint 090 filenames, objectives, feature matrix,
  dependency closure, link rules, and output policy. A conflicting finding
  requires a documented decision and an approved file-plan amendment before
  proceeding.
- Keep lessons 01-03 input-free and import-free. Introduce required module
  and data dependencies only after the guide teaches their use. Assert
  Measurement values with units and label invalid fixtures as intentional
  failures.
- Provide consistent objectives, prerequisites, desktop-first open/run/
  preview instructions, expected outcomes, explicit inputs and safe
  previous/index/next navigation. No broken links to future chapters.
- Update focused tests for new lessons and any directly changed paths so this
  sprint does not leave known broken tests/references. Do not perform the
  broad test/reference migration or package integration owned by later
  sprints.
- Record exact commands, inputs, results, changed paths, evidence artifacts,
  residuals and their owners. Distinguish focused test evidence from
  unexecuted full-corpus, packaging or native acceptance.
- Submit a Builder recommendation and request a separate Lead
  Developer/product-owner closeout disposition.

## Boundaries

- No Sprint 091 implementation before both entry gates pass.
- Do not create guide files 08-14, a full report, desktop resource staging,
  or Welcome/Starter Examples integration. Those are later-sprint work.
- Do not change language semantics, local-link security/confirmation,
  renderer/export capabilities, remote dependency behavior, or platform
  claims.
- Do not overwrite checked-in generated output. Use temporary output
  destinations. Preserve `examples/kitchen-sink.pdf` unchanged.
- Do not rewrite README, Help, VS Code guidance, authoring references, release
  paths, package configuration, historical sprint evidence, or
  `planning/STATUS.json` unless a separately approved plan explicitly
  includes a narrowly necessary file.
- Keep current legacy sources when removing them would break an unapproved
  consumer. Record the transition plan and owner rather than leaving a
  dangling path.

## Completion

Meet all criteria in `acceptance.md`, provide Builder evidence with
acceptance statuses and residual owners, and obtain a separate disposition.
If Sprint 090 architecture approval or Sprint 091 authorization is unresolved,
or Sprint 091 closeout is pending, leave this sprint explicitly
`BLOCKED/OPEN` and do not start the next sprint.
