# Sprint 085 Handoff Prompt

You are the Builder for OpenAMX Sprint 085: V0.14 Runtime `is` Type Checking.

## Read First

- Project agent instructions and the current worktree status. Preserve all
  existing changes and artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV14MasterSprintPlan.md`.
- The Sprint 085 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `builder-evidence.md`, and this handoff.
- The complete accepted Sprint 084 contract:
  `grammar-examples.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, and `builder-evidence.md`.
- Existing parser/AST/type-checker/declaration resolution/runtime,
  record/enum/optional/list/Measurement, and source-range implementations
  needed to follow repository patterns.

## Entry Gate

- Sprint 084's V0.14 contract is ACCEPTED. Sprint 084 did not implement or
  runtime-test V0.14 features.
- Obtain separate explicit Sprint 085 execution authorization and approval
  of the concrete file-by-file implementation/evidence plan before editing
  source, tests, ledgers, or other artifacts.
- Record the approved files and any source-inspection-driven amendment before
  implementation. Do not treat the preparation documents or acceptance of
  the Sprint 084 contract as execution authorization.

## Task Contract

- Implement `value is TargetType` across AST, parser, type checker, and
  runtime, following the accepted Sprint 084 grammar and exact fixtures.
- Implement all type cases and runtime semantics: primitive, structural
  record, enum member, list/nested list, optional/null, and
  dimension/Measurement checks.
- Preserve approved precedence, left associativity, type-source visibility,
  Boolean result typing, non-match-as-false behavior, diagnostic identities,
  and original source locations.
- Preserve the distinction between Number and dimensionless Measurement.
  Do not introduce nominal enum identity or flow-sensitive narrowing.
- Add focused tests and record the actual commands/results in
  `builder-evidence.md`; request a separate Lead Developer/product-owner
  disposition at completion.

## Mandatory Boundaries

- Sprint 086 owns math and Measurement-aware library extension; Sprint 087
  owns text and numeric formatting; Sprint 088 owns editor integration,
  examples, and user-facing documentation. Do not implement those here.
- Do not change any accepted Sprint 084 behavior without a separate product
  decision and approved plan amendment.
- Do not treat valid type mismatches as static errors, runtime exceptions,
  or diagnostics.
- Do not add code paths that silently narrow a value after `is`.
- Do not change unrelated behavior, weaken tests, or modify package/release
  files.
- No release, publication, version change, or platform-certification
  authority follows from Sprint 085.

## Completion

Meet every criterion in `acceptance.md`, finish the evidence record, and
submit a separate disposition request. Sprint 086 is not authorized by
completion of Sprint 085 alone.
