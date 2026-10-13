# Sprint 079 Handoff Prompt

You are the Builder for OpenAMX Sprint 079: Diagram Language and Shared Scene
Model.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user
  changes and test artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV13MasterSprintPlan.md`.
- All Sprint 079 artifacts: `requirements.md`, `blueprint.md`,
  `acceptance.md`, and this handoff.
- All approved Sprint 078 contract/evidence artifacts:
  `grammar-examples.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, and `feasibility-report.md`.
- Relevant existing parser, AST, type checker, runtime, formatter, model, and
  focused test code referenced in the blueprint.

## Authority and Entry Gate

- Sprint 078 is closed with a Lead Developer GO for Sprint 079 readiness and
  recorded implementation residuals. Its grammar, diagnostic allocations,
  source-location contract, fixture set, and resource limits are authoritative.
- Readiness is not execution authorization. Before changing source or tests,
  obtain explicit Sprint 079 execution authorization and approval of the
  concrete file-by-file plan.
- Use the exact approved contract. Do not reinterpret or broaden it to simplify
  implementation.

## Task Contract

- Implement the diagram language and shared typed model through the core AST,
  parser, type checker, runtime evaluation, and formatter.
- Add focused tests for positive fixtures `D-CRANK-01` and `D-BATTERY-01`,
  invalid fixtures `D-NEG-01`–`D-NEG-24`, existing AMX semantic/context
  preservation, source locations, formatter stability, and model immutability.
- Preserve full existing AMX expression/function behavior at arbitrary times;
  broaden typed-context tests beyond the Sprint 078 probe and report limits
  honestly.
- Enforce the approved 16-diagram/512-semantic-element limits. Obtain
  Lead Developer approval for their failure diagnostic before assigning a
  code/message; no diagnostic reuse or invented text.
- Stop and return explicit source-located evaluation failures for invalid
  frames to the caller. The actual desktop/HTML error lifecycle is Sprint 080.
- Run focused tests and the root build, and create `builder-evidence.md` with
  exact results, changed files, residuals, and remaining blocked coverage.

## Mandatory Boundaries

- Do not add trigonometric or other standard-library functions, coercions,
  expression semantics, placement mechanisms, or mutable simulation state.
- Do not change unrelated runtime behavior, including the recorded AMX1004
  behavior for an imported function directly referencing an enum identifier.
- Do not use generated JavaScript, `eval`, `new Function`, report-authored
  active code, remote assets, or a weakened desktop security model.
- Do not edit production HTML/desktop preview, PDF/DOCX, editor clients,
  specification/examples, or release/version files in this sprint.
- Preserve every original source location and exact approved diagnostic.
  Record unresolved diagnostics or semantics as BLOCKED and seek disposition;
  do not provide success-shaped fallbacks.
- Sprint 079 execution does not authorize Sprint 080-083 work, release,
  publication, or platform certification.

## Completion

Meet all criteria in `acceptance.md`. Update the planning ledgers with exact
execution status and residuals. Report the implementation as the Sprint 079
language/model increment only; do not claim end-to-end diagram feature
acceptance.
