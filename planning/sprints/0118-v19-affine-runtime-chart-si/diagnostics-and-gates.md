# Sprint 118 Diagnostics and Gates

## Diagnostic Contract

Sprint 118 allocates no new stable diagnostic code. Existing phase-specific
families remain authoritative. Unsupported affine operations are AMX3007 even
when detected at runtime because they are semantic dimensional-operation
failures; finite/domain/division failures use the existing static/dynamic split.

| Case ID | Invalid/valid boundary | Phase | Primary anchor | Diagnostic policy |
| --- | --- | --- | --- | --- |
| AFF-CONV-REVERSE-01 / AFF-ROUNDTRIP-01 | Valid finite conversion or round trip | Static/runtime | Conversion expression | No diagnostic when finite; preserve output unit |
| AFF-INCOMPAT-01 | Conversion/comparison/arithmetic/aggregate dimensions differ | Static where dimension known; runtime aggregation validation where values are concrete | Operator/call source | AMX3007 existing incompatible dimension family |
| AFF-ADD-01 | Direct affine addition with either affine operand | Runtime semantic gate | `+` operator source | AMX3007, exact accepted message such as `Direct addition of affine measurements is not supported` |
| AFF-MUL-01 / AFF-DIV-01 | Affine measurement multiplication/division | Runtime semantic gate, after dimension/type check | `*` or `/` operator source | AMX3007, operation-specific affine multiplication/division rejection |
| AFF-POW-01 | Affine binary power or standard-library `pow` | Runtime semantic gate | `^`, `pow` call source | AMX3007, affine measurement power rejection |
| AFF-SQRT-01 | Affine operand to `sqrt` | Runtime semantic gate where runtime reached; existing dimensional/domain gate may precede for incompatible exponent shape | `sqrt` call or argument | AMX3007, do not turn into AMX1009 physical square-root result |
| AFF-FINITE-01 | Literal attachment/physical constant is non-finite | Static checker | Expression/operator producing physical value | AMX3010 `Measurement physical value must be finite` or existing finite result message |
| AFF-FINITE-01 | Runtime attachment/conversion/subtraction/aggregate/chart inverse result is non-finite | Runtime/evaluation | Producing operator/call/argument source | AMX1009 measurement-domain finite diagnostic except chart normalization's accepted AMX3007 path |
| AFF-FINITE-01 | Division by dynamic zero after affine/linear eligibility | Runtime | `/` operator | AMX1009 existing `Measurement division by zero` |
| AFF-CHART-FAIL-01 | Compatible affine chart value cannot normalize finitely | Chart evaluation | Selected field option plus declaration context | AMX3007 existing `Chart ... measurement cannot be normalized` policy |
| AFF-EXTERNAL-COMPOUND-01 | Affine unit participates in external `*`, `/`, or `^` | Input unit parsing | Unit string/data path and field/decl source | AMX4004 invalid external unit expression; `unknownUnit` false |
| AFF-EXTERNAL-SHAPE-01 | External JSON/CSV shape changes or extra/missing field | Input validation | Input object/data path | AMX4005 exact `{ value, unit }` shape failure |

## Static/Runtime Gate Reasoning

`CheckedType` for a Measurement carries a dimension vector, not a specific unit,
offset, scale, or display identity. A value of type `Temperature` may therefore
be Kelvin at one path and Celsius at another. S118 cannot reliably reject an
affine operation statically for arbitrary variable expressions.

The checker remains responsible for:

- dimension compatibility and ordinary operator types;
- statically-known literal physical finite checks, now offset-aware;
- existing integer exponent/type/domain checks;
- declaration/import/external syntax checks that occur before evaluation.

The runtime remains responsible for:

- `unit.offset !== 0` eligibility for direct `+`, `*`, `/`, `^`, `pow`, `sqrt`;
- physical-value conversion/comparison/subtraction/aggregates;
- dynamic zero/non-finite measurement-domain outcomes;
- chart and input values whose display units are known only at evaluation.

A literal affine operation may still reach runtime and fail AMX3007 at source;
that is accepted evidence. Do not broaden CheckedType or invent unit-dependent
static types solely to move the failure earlier.

## Diagnostic Priority

1. Existing parser/unknown-name/unit/type and dimension compatibility errors.
2. Static literal finite/exponent/domain errors.
3. Runtime affine eligibility error at the combining operator/call.
4. Runtime dynamic finite/division/domain error at the producing operator.

For an affine addition, the direct affine-addition AMX3007 is expected after
compatible dimensions are established. For affine division by zero, the affine
eligibility restriction takes precedence over constructing a division; the
exact Builder fixture must avoid ambiguity if a diagnostic priority is not
explicitly accepted.

## Source and Data Rules

- Operator diagnostics use the exact operator source for `+`, `-`, `*`, `/`,
  and `^`.
- `pow`/`sqrt`/aggregates use the call or first offending argument source under
  the current evaluator convention.
- Chart diagnostics preserve declaration, selected field, and data context.
- External parser diagnostics include existing data path, input/file, record,
  column, declaration, and field context.
- Exact 1-based line/column and UTF-16 exclusive-end conventions apply to complete
  document fixtures. JSON/CSV paths remain their established data-path values.

## Operation Gates

- `abs`, `round`, and unary minus must not trigger affine rejection; they act on
  displayed values and preserve unit.
- `min` and `max` must not reject affine because they select, not add or compose.
- `sum` and `mean` must not call direct addition for each pair; they are the
  explicit physical-aggregate exception.
- Subtraction of compatible linear/affine pairs is valid. It is not classified as
  direct affine addition and must not be blocked by the `+` rule.
- Atomic external affine units are valid. The AMX4004 compound rule applies only
  after a parser sees a composition operation.

## Stop Conditions

- Any runtime unsupported case produces a success value, NaN/Infinity, hidden
  fallback, or name-based exception.
- Any helper throws a generic uncaught plain Error for user input instead of a
  mapped AMX diagnostic/input error.
- Any new stable code is proposed without Lead Developer allocation.
- Any chart/data output exposes `offset` or canonical physical value in the
  public `{ value, unit }` shape.
- Any renderer/editor/SI inventory test failure is fixed by broadening S118 into
  S119 rather than recording a blocking scope issue.
