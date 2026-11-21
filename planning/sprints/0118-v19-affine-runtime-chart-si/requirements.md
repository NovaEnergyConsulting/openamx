# Sprint 118 Requirements: V0.19 Affine Runtime, Charts, External Data, and SI Library

## Document Status and Entry Gate

Architect-prepared Sprint 118 planning package. Sprint 117 is separately
ACCEPTED/CLOSED by the product owner on 2026-11-21 with 159 focused tests,
1,233 assertions, no-emit typecheck, and patch-integrity passing and no residual.
Checked units now carry required finite `(scale, offset)` metadata, and that
result is the entry authority for this sprint.

Sprint 115 remains the product/language authority for runtime behavior.
D115-06, D115-08, and D115-09 are applied here together with S117's verified
registry result. This package authorizes planning only. Obtain separate Sprint
118 execution authorization and exact baseline/file/command/evidence approval
before production, SI-library, or test edits.

Sprint 118 may begin only when:

- affine declaration metadata from S117 is available and the accepted Sprint 115
  physical-value and operation matrices are treated as authoritative;
- the execution plan centralizes physical-value/inverse-conversion helpers
  instead of adding offset formulas independently at each consumer;
- runtime `MeasurementUnit` gains offset without changing the external
  measurement shape `{ value, unit }`;
- direct affine addition and unsupported affine multiplication/division/powers
  reject rather than silently discarding offsets;
- `sum` and `mean` use physical aggregation as the approved exception, while
  `min`/`max`, `abs`, `round`, unary minus, subtraction, charts, data, and
  display preserve the accepted display-unit rules;
- the four SI exports are added only after their runtime paths can execute.

## Goal

Make affine measurements executable end to end. Propagate offset into runtime
measurement units, apply one canonical physical conversion model to attachment,
conversion, comparison, subtraction, aggregates, chart normalization, input
validation, and finite checks, reject unsupported affine operations, and add
Celsius/Fahrenheit plus aliases to the SI library.

Sprint 118 delivers runtime and registry/library behavior. It does not implement
chart table omission/editor/specification/migration rendering work; Sprint 119
remains separately gated.

## Accepted Sprint 115 Decisions Applied Here

- **D115-06:** direct affine addition and unsupported affine multiplication,
  division, powers, `pow`, and `sqrt` reject. Compatible measurement subtraction
  uses canonical physical values and returns a value in the left display unit.
  `sum`/`mean` aggregate physical values and inverse-convert to the first display
  unit; `min`/`max` compare physically and retain the selected original unit;
  `abs`, `round`, and unary minus preserve display value/unit behavior.
- **D115-08:** the public external measurement shape remains exactly
  `{ value, unit }`. Atomic affine/alias unit text is accepted. A nonzero-offset
  unit used in external multiplication/division/power composition is rejected.
- **D115-09:** static declaration/operation mismatches use accepted AMX3007/
  AMX3008/AMX3010 families; dynamic measurement-domain finite/division failures
  use AMX1009; malformed/unknown external unit text remains AMX4004 and invalid
  measurement shape remains AMX4005. No new stable code is allocated here.

## In Scope

- Add required finite `offset: number` to runtime `MeasurementUnit` and copy it
  in `unitFromMetadata`; set offset 0 on unitless and canonical composed/base
  runtime units.
- Add shared helpers for canonical physical value, inverse display conversion,
  and affine/linear eligibility. Use them from checker constant finite checks,
  runtime attachment/conversion, operation checks, aggregates, validation, and
  chart normalization.
- Update measurement attachment and `in` conversion to use
  $p=v\times scale+offset$ and inverse conversion without changing displayed
  value intent or external shape.
- Update equality/order to compare canonical physical values. Update compatible
  subtraction to subtract physical values, divide by the left scale, and return
  the left unit. Reject direct affine addition using dimensional-operation
  diagnostics.
- Reject affine measurement multiplication/division and powers/`pow`/`sqrt`.
  Preserve existing offset-zero linear behavior, composition, dimensionless
  cancellation, and finite diagnostics.
- Update `sum` and `mean` to aggregate canonical physical values and convert the
  aggregate to the first element's display unit. Update `min`/`max` to select by
  physical comparison. Preserve `abs`, `round`, and unary minus display-unit
  behavior.
- Update chart selected-column normalization to convert through physical values
  into the first non-null display unit while preserving selected unit label,
  headings, axes, table values, nulls, and source order.
- Carry offset through runtime validation and external attachment. Atomic
  Celsius/Fahrenheit/aliases and existing linear compounds remain accepted;
  affine compound product/division/power unit text rejects as AMX4004.
- Preserve JSON/CSV output as `{ value, unit }` and scalar/table display as the
  selected display value/unit text. Do not serialize scale or offset.
- Add `celsius`, `fahrenheit`, `degC`, and `degF` exports to `libraries/si.amx`
  using the accepted canonical declarations and update exact SI inventory tests
  from 46 to 50 exported units.
- Add focused parser/checker/runtime/measurement/aggregate/chart/external/SI/
  source-location tests, including linear regression and generated-browser
  runtime build/type validation when required by the approved build plan.

## Out of Scope

- `showTable` renderer omission, chart/browser JSON table output,
  output-facing accessibility, HTML/PDF/DOCX rendering changes, VS Code and
  desktop editor grammar/UI work.
- Published V0.19 language specification, README navigation, migration note,
  examples, documentation, release, publication, package/version, deployment,
  installer, distribution, or certification.
- New chart kinds, display-unit selection changes, alternate measurement data
  shape, delta/interval unit type, arbitrary affine compound units, general
  constant evaluation, declaration grammar changes, or additional temperature
  units.
- Generated browser runtime hand edits. If a generator updates tracked output,
  that must occur through the existing `bun run build`/source generator command
  and be reviewed, never manually patched.

## Candidate Source and Test Surfaces

The exact execution plan should prefer these paths:

- `src/runtime/measurement.ts`: offset-bearing runtime unit and shared physical/
  inverse-conversion/eligibility helpers.
- `src/runtime/evaluateExpression.ts`: attachment, conversion, finite validation,
  operators, aggregates, unary/math paths, and chart normalization.
- `src/typechecker/checkDocument.ts`: affine-aware physical finite constant checks
  and any precise source-level diagnostic gate still compatible with existing
  type information.
- `src/runtime/externalUnits.ts`: reject affine factors in product/division/power
  external unit expressions while allowing atomic affine units.
- `src/runtime/inputData.ts`: preserve `{ value, unit }` and use offset-aware
  runtime measurements without changing data paths.
- `src/runtime/outputData.ts`: review/verify display shape; change only if finite
  validation or serialization needs offset-aware physical validation.
- `src/renderer/chartModel.ts` and environment descriptor types: review only;
  normalized affine values should not require renderer offset recomputation.
- `libraries/si.amx`: four additive exports after Kelvin.
- `tests/measurements.test.ts`: conversions, comparisons, subtraction,
  operations, aggregates, display, SI import, diagnostics.
- `tests/evaluator.test.ts`: checker/runtime integration and source locations.
- `tests/chartModel.test.ts` and `tests/measurementData.test.ts`: affine chart,
  external input, output-shape, and compound-unit regressions.
- `tests/dimensions.test.ts`: exact additive SI inventory and metadata imports.

Potential generated path: `src/renderer/diagramBrowserRuntime.ts` is generated by
`scripts/build-diagram-runtime.ts`; it is not hand-edit authority. Desktop or
extension outputs are not required unless the exact approved build command
updates a tracked generated artifact.

## Required Invariants

- $0\,C$, $32\,F$, and $273.15\,K$ convert to the same physical value.
- `20 celsius - 10 celsius = 10 celsius`.
- `32 fahrenheit - 20 celsius = -36 fahrenheit` under the left-unit rule.
- `sum([10 celsius, 20 celsius]) = 303.15 celsius`; `mean` uses the physical
  mean before inverse conversion.
- Direct affine addition, multiplication/division, powers, `pow`, and `sqrt`
  reject without NaN/Infinity or a success-shaped value.
- `min`/`max` select by physical value and return the selected original display
  unit; `abs`/`round`/unary minus preserve selected display unit.
- Mixed C/F/K chart values normalize physically to the first display unit while
  keeping existing labels, rows, nulls, and source order.
- JSON/CSV external data retain the display `value` and unit text; no scale or
  offset field appears in serialized public data.

## Completion Outputs

- An authorized runtime/SI/external implementation and focused evidence package.
- `builder-evidence.md` with exact commands, raw outcomes, 29 S118 AFF-case
  reconciliation, SI inventory, generated-output audit, failures/retries,
  residuals, and recommendation.
- No renderer/editor/spec/example/migration/package/release/certification work.
- Separate product-owner disposition. Sprint 119 remains gated on accepted S118
  runtime results and accepted S116 shared chart-model visibility; Sprint 118
  recommendation alone does not authorize it.
