# Sprint 086 Handoff Prompt

You are the Builder for OpenAMX Sprint 086: V0.14 Mathematical Standard
Library.

## Read First

- Project agent instructions and current worktree status. Preserve all
  existing changes and generated artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV14MasterSprintPlan.md`.
- Sprint 086 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `builder-evidence.md`, and this handoff.
- Accepted Sprint 084 `grammar-examples.md`, `diagnostic-matrix.md`, and
  `requirement-test-matrix.md`.
- Accepted Sprint 085 `builder-evidence.md` and implementation/tests,
  particularly the explicit remaining full-root-suite gap.
- V0.9 Measurement contract and existing standard-library, evaluator,
  type-checker, unit/dimension, and focused test implementations.

## Entry Gate

- Sprint 084's contract and Sprint 085's `is` implementation are accepted.
  Sprint 085's direct focused Bun run passed 241/0 and its core build passed;
  its full root suite was not run and remains assigned to Sprint 089. The
  `runTests` wrapper count discrepancy is documented and is not an aggregate
  pass.
- Obtain separate explicit Sprint 086 execution authorization and approval
  of the concrete file-by-file implementation/evidence plan before editing
  source, tests, generated artifacts, or planning ledgers.
- Record any source-inspection amendment before making changes to files not
  in the approved plan. Retain only approved generated build outputs.

## Task Contract

- Add `PI`, `E`, all 15 math functions, approved type signatures, domain and
  finite validation, and exact diagnostics.
- Normalize dimensionless Measurement inputs to `value * unit.scale` before
  math evaluation; return ordinary unitless Numbers. Reject dimensioned
  Measurements.
- Extend only the accepted existing standard-library Measurement operations,
  preserving conversions, units, empty-list behavior, square-root rules,
  rounding semantics, and integer-literal exponent restrictions.
- Test all applicable Sprint 084 fixtures and exact expected values,
  diagnostics, source locations, and units.
- Record exact commands/outcomes and request a separate Sprint 086
  disposition.

## Mandatory Boundaries

- Do not change accepted math domains, tolerance, tangent behavior, unit
  normalization, or diagnostics without a separate product decision and
  approved scope amendment.
- Do not return non-finite values or silently substitute a fallback.
- Preserve V0.9 Measurement algebra and existing Number behavior. Do not add
  degrees, angle units, implicit conversions, or new decimal arithmetic.
- Sprint 087 owns text and numeric formatting; Sprint 088 owns editors,
  specification/help, and examples. Do not implement those features here.
- No release, publication, version change, or platform-certification
  authority follows from Sprint 086.

## Completion

Meet every criterion in `acceptance.md`, complete the evidence record, and
request a separate Lead Developer/product-owner disposition. Sprint 087
requires its own execution authorization.
