# Sprint 118 Handoff Prompt

You are the Builder for OpenAMX Sprint 118: V0.19 Affine Runtime, Charts,
External Data, and SI Library.

## Read First

- Project instructions, current worktree, all user changes, accepted Sprint 115
  affine model/diagnostics/qualification cases, accepted Sprint 117 declaration
  builder evidence, and every Sprint 118 package document.
- Current post-S117 runtime measurement, evaluator, checker, external-unit/data,
  chart normalization/model, output serialization, SI library, dimensions
  tests, and existing generated-runtime build script.
- The V0.19 master plan and accepted S116/S117 disposition boundaries.

## Authority and Entry Gate

- This package is planning, not execution authorization. Obtain separate exact
  Sprint 118 authorization for baseline, worktree/generated artifact
  preservation, production/test/SI/generated paths, commands, output/evidence
  roots, and scope amendments before the first edit.
- S117 acceptance establishes registry metadata only. It does not authorize
  runtime/SI behavior, renderer omission, S119 editor/docs, or release work.
- If the approved plan needs a conditional path not named in `requirements.md`,
  record exact file-level amendment before editing it.

## Task Contract

- Add required immutable runtime `MeasurementUnit.offset` and copy checked
  metadata. Centralize physical $v\times scale+offset$ and inverse conversion;
  use the helpers everywhere rather than duplicating formulas.
- Keep checker literal physical finite checks offset-aware. Use runtime
  offset-based eligibility for unit-specific unsupported operations because
  CheckedType carries only dimension vector.
- Update attachment, `in`, equality/order, compatible subtraction, sum/mean,
  min/max, finite validation, chart normalization, and display-preserving
  abs/round/unary minus.
- Reject direct affine addition, affine multiplication/division, binary powers,
  `pow`, and `sqrt` with existing diagnostics. Preserve linear behavior and
  dimension cancellation.
- Preserve external `{ value, unit }`; accept atomic affine/alias unit text and
  reject affine factors in external product/division/power expressions.
- Add exactly `celsius`, `fahrenheit`, `degC`, and `degF` to `libraries/si.amx`.
  Keep all historical declarations and update the exact inventory test from 46
  to 50 units.
- Add focused tests for all 29 remaining S115 AFF cases plus S118 helper/SI/
  generated/output staging IDs. Verify exact unit identity, display values,
  source ranges, input paths, and linear regressions.

## Mandatory Boundaries

- Do not implement `showTable` table omission, HTML/PDF/DOCX renderer changes,
  browser table JSON removal, output accessibility changes, editor grammar/UI,
  V0.19 specification, examples, README, migration note, package/version,
  release, publication, deployment, installer, or certification.
- Do not alter the external JSON/CSV measurement shape or serialize offset,
  scale, factors, or physical value.
- Do not rewrite generated `src/renderer/diagramBrowserRuntime.ts` by hand. Use
  `scripts/build-diagram-runtime.ts`/approved build command and review the
  generated diff/hash.
- Do not allocate a new diagnostic code. Reuse AMX3007, AMX3010, AMX1009,
  AMX4004, and AMX4005 under the accepted phase policy; stop for allocation if
  an actual condition cannot be represented.
- Do not add arbitrary constants, exact arithmetic, extra units, or a different
  unit-expression grammar.
- A false `showTable` model may still render tables in S118; do not turn S119
  output omission into an S118 fix.

## Verification

Use only approved focused commands. Candidates:

```text
bun test tests/measurements.test.ts tests/measurementData.test.ts tests/chartModel.test.ts tests/evaluator.test.ts tests/dimensions.test.ts
bunx tsc --noEmit
bun run scripts/build-diagram-runtime.ts   # if approved
bun run build                              # if approved
git diff --check
git status --short
```

Verify exact physical golden values, operation diagnostics/source ranges,
selected display units, null/order behavior, external data paths/shapes, 16/50
SI inventory, output shape, linear regressions, immutable unit values, and
generated-file provenance. Record raw pass/fail/assertion counts, retries,
unavailable checks, hashes, and changed paths.

## Completion

Meet `acceptance.md`, reconcile all 29 post-S117 S115 AFF cases and S118
internal IDs, and populate `builder-evidence.md` with reproducible exact output.
Submit a separate Builder recommendation for product-owner ACCEPTED/CLOSED or
BLOCKED/OPEN disposition. Only that disposition closes S118; S119 and release
work remain separately authorized.
