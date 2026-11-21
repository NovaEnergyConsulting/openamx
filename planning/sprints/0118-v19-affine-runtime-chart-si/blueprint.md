# Sprint 118 Blueprint: V0.19 Affine Runtime, Charts, External Data, and SI

## Approach

1. Recheck accepted S115 D115-06/08/09, accepted S117 registry metadata and no
   residual, exact S118 baseline/worktree, generated-artifact preservation, and
   separate execution authorization before source/SI/test edits.
2. Add a required `offset` field to runtime `MeasurementUnit`. Copy metadata in
   `unitFromMetadata`; set 0 on unitless, composed scale-only, powered scale-only,
   and canonical units. Preserve immutable/frozen construction.
3. Add shared helpers in the measurement layer for physical value, inverse
   conversion, affine detection, compatible-vector checks where useful, and
   finite validation. Do not add repeated inline formulas across evaluator and
   input/chart paths.
4. Update checker literal-constant physical checks to use scale plus offset.
   Preserve dimension type checks; runtime offset-based operation eligibility is
   required because a checked Measurement type intentionally does not encode a
   specific display unit or offset.
5. Update attachment/conversion/comparisons/subtraction/aggregates/math paths in
   `evaluateExpression`. Reuse physical helpers, reject unsupported affine
   operations before unit composition/power, and preserve existing linear
   behavior and diagnostics.
6. Update chart normalization to convert each compatible measurement physically
   into the first non-null selected display unit, retaining its unit descriptor
   and labels. Do not add offset to public chart descriptors/renderers unless a
   concrete consumer needs it; normalized values are already display-unit values.
7. Update external-unit composition so a nonzero-offset atom may stand alone but
   cannot participate in `*`, `/`, or `^`; preserve `{ value, unit }` input/output
   shape and unit text. Review output finite validation for affine physicality.
8. Add `celsius`, `fahrenheit`, `degC`, and `degF` to `libraries/si.amx` after
   Kelvin using accepted declaration formulas. Update the exact SI inventory test
   without rewriting historical V0.9 planning authority.
9. Add focused runtime, aggregate, diagnostics, chart, data, SI-import, output,
   typecheck, and source-range tests. Run generated runtime build through the
   existing script only if authorized; never hand-edit generated output.
10. Complete evidence, changed-path/scope audit, S118 case reconciliation, and
    request a separate product-owner disposition. S119 remains separately gated.

## Implementation Decisions

| ID | Topic | Proposed S118 disposition |
| --- | --- | --- |
| D118-01 | Runtime unit metadata | `MeasurementUnit.offset` is required. `unitFromMetadata` copies finite offset; unitless/canonical/composed linear units use offset 0. |
| D118-02 | Canonical helpers | One exported/internal physical-value helper computes $v\times scale+offset$ and one inverse helper computes $(p-offset)/scale$. All consumers use them. |
| D118-03 | Affine eligibility | A runtime unit is affine for operation restrictions when `offset !== 0`. Display identity or name alone must not control eligibility. |
| D118-04 | Static versus runtime | Static checker verifies dimensions and constant finite physical values. Runtime verifies unit-specific affine eligibility because CheckedType carries only dimension vector. Unsupported operations report at operator/call source with AMX3007. |
| D118-05 | Arithmetic | Direct `+` rejects if either unit affine; compatible `-` always subtracts canonical physical values and returns left display unit, including mixed affine/linear units. |
| D118-06 | Composition | Multiplication/division/powers, `pow`, and `sqrt` reject any nonzero-offset operand/base. `composeUnits`/`powerUnit` produce offset 0 only for already-eligible linear units. |
| D118-07 | Aggregates | `sum`/`mean` aggregate physical values then inverse-convert to first unit. `min`/`max` compare physical values and return selected original measurement. Empty-list behavior remains unchanged. |
| D118-08 | Unary display operations | `abs`, `round`, and unary minus operate on display value and preserve unit. Mathematical Number functions on dimensioned Measurement remain under existing dimensional behavior. |
| D118-09 | External units | Atomic affine units and affine aliases are valid external unit text. If an affine atom participates in any product/division/power expression, reject with AMX4004 before composition. |
| D118-10 | Chart descriptor | Chart normalized data and retained display descriptors remain existing shape unless implementation proves a consumer needs offset. No renderer recomputes from raw physical values. |
| D118-11 | SI declarations | Use `celsius = kelvin + 273.15`, `fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)`, `degC = celsius`, `degF = fahrenheit`. |

## Source Baseline To Verify

- S117 added finite offset to checked `UnitMetadata`; S118 runtime
  `MeasurementUnit` is still scale-only.
- Attachment, conversion, comparisons, subtraction/addition, multiplication,
  powers, aggregates, chart normalization, validation, and checker finite checks
  currently use `value * scale` only.
- `ChartViewEmission` normalizes measurement data into the first display unit and
  stores unit descriptor `text`, scale, vector, factors. Renderer paths consume
  those already-normalized numeric values and labels.
- External parsing accepts visible atoms, `1`, parentheses, `*`, `/`, signed
  integer powers, and currently composes units without offset eligibility.
- Output JSON/CSV serializes display `value` plus `unit.text` and must remain so.
- SI library contains 16 dimensions and 46 unit exports, including Kelvin and
  no Celsius/Fahrenheit.
- `scripts/build-diagram-runtime.ts` regenerates a tracked browser runtime bundle;
  no generated file should be manually edited.

## Candidate File Plan

Core production candidates:

- `src/runtime/measurement.ts`
- `src/runtime/evaluateExpression.ts`
- `src/typechecker/checkDocument.ts`
- `src/runtime/externalUnits.ts`
- `libraries/si.amx`

Conditional compatibility candidates, only on demonstrated need:

- `src/runtime/inputData.ts`
- `src/runtime/outputData.ts`
- `src/runtime/environment.ts`
- `src/renderer/chartModel.ts`
- generated `src/renderer/diagramBrowserRuntime.ts` through `scripts/build-diagram-runtime.ts`
- `tests/dimensions.test.ts`

Primary test candidates:

- `tests/measurements.test.ts`
- `tests/measurementData.test.ts`
- `tests/chartModel.test.ts`
- `tests/evaluator.test.ts`
- `tests/dimensions.test.ts`

No S119 renderer/accessibility/editor/spec/example/migration, package, release,
or certification path is approved.

## Verification Candidates

```text
bun test tests/measurements.test.ts tests/measurementData.test.ts tests/chartModel.test.ts tests/evaluator.test.ts tests/dimensions.test.ts
bunx tsc --noEmit
bun run scripts/build-diagram-runtime.ts   # only if generated-output plan authorizes it
bun run build                              # only if full approved build required
git diff --check
git status --short
```

Verify accepted S118 AFF cases, external shape, SI import aliases, exact display
units, linear regressions, source locations, generated runtime equality, and no
hand-edited generated content. Broader suites, renderer/editor/platform checks,
and publication are not substitutes for focused runtime evidence.

## Stop Conditions

- A second independent conversion formula appears without using the shared
  helper; return to implementation review before acceptance.
- A runtime unit lacks offset/undefined, or external serialization exposes it;
  this violates D118-01 and D115-08.
- An unsupported affine operation returns a value, NaN, Infinity, or silently
  drops offset instead of producing an accepted diagnostic.
- A new diagnostic identity is required; D115-09 does not allocate one.
- `libraries/si.amx` additions fail the updated 16-dimension/50-unit invariant or
  alter historical declarations.
- Renderer/editor/spec/example/migration or generated-runtime hand edits enter
  scope without an exact amendment.
