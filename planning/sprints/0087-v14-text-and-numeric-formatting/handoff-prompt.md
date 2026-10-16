# Sprint 087 Handoff Prompt

You are the Builder for OpenAMX Sprint 087: V0.14 Text and Numeric
Formatting.

## Read First

- Project agent instructions and current worktree status. Preserve all
  existing changes and generated artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV14MasterSprintPlan.md`.
- Sprint 087 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `builder-evidence.md`, and this handoff.
- Accepted Sprint 084 contract artifacts:
  `grammar-examples.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, and `builder-evidence.md`.
- Sprint 086 `builder-evidence.md`, particularly the accepted
  direct-expression approach for non-finite function arguments and its
  preserved Number-binding behavior.
- Existing standard-library, evaluator, type-checker, formatter/editor,
  Measurement display, Unicode, and focused test implementations.

## Entry Gate

- Sprint 084 contract, Sprint 085 `is` implementation, and Sprint 086 math
  and Measurement implementation are accepted.
- Obtain separate explicit Sprint 087 execution authorization and approval
  of the concrete file-by-file source/test/evidence plan before editing
  production code or tests.
- Include the approved Sprint 084 source amendments for
  `TEXT-COUNT-NONFINITE-01` and `FORMAT-FINITE-01` in the file plan.
  Preserve their IDs and diagnostic expectations; do not alter finite
  Number-binding behavior.
- Record any source-inspection amendment before editing files not listed in
  the approved plan. Inspect and retain generated build outputs only as
  explicitly approved.

## Task Contract

- Implement `len`, `trim`, `left`, and `right` with the approved
  Unicode/code-point/whitespace/count behavior.
- Implement `format` only for the bounded numeric pattern grammar and exact
  supported locales/outputs.
- Apply Measurement formatting to its displayed numeric value, then append
  the exact one-space display-unit suffix.
- Preserve exact diagnostics, failure ranges, offline behavior, and existing
  core behavior. Direct-call non-finite fixtures must reach `AMXSL003` and
  `AMXSL006` without changing Number-binding validation.
- Run every applicable accepted fixture, focused regressions, and the core
  build. Record exact outcomes and request a separate Sprint 087
  disposition.

## Mandatory Boundaries

- Do not add locale fallback, broad spreadsheet-format support, or date,
  text, scientific, quoted, section, color, or conditional patterns.
- Do not replace the explicit Unicode 15.1 `White_Space` set with host
  `trim()` semantics unless verified identical for the full approved set
  and exclusions.
- Do not use UTF-16 slicing or grapheme segmentation for functions defined
  on code points.
- Do not alter Sprint 086 math or Measurement semantics, finite Number
  binding behavior, or V0.9 Measurement behavior.
- Sprint 088 owns user-facing specification/help, editor clients, and
  examples. No release, publication, version change, or platform
  certification follows from Sprint 087.

## Completion

Meet all criteria in `acceptance.md`, complete the evidence record, and
request a separate Lead Developer/product-owner disposition. Sprint 088
requires its own execution authorization.
