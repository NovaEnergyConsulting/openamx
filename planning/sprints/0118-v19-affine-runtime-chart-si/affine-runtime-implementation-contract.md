# Sprint 118 Runtime Contract: Affine Measurements

## Runtime Unit Representation

Extend the immutable runtime unit:

```ts
export interface MeasurementUnit {
  scale: number;
  offset: number;
  vector: Readonly<Record<string, number>>;
  factors: readonly MeasurementUnitFactor[];
  text: string;
}
```

`scale` is finite positive; `offset` is finite. `unitFromMetadata` copies both
values. Unitless, canonical, and permitted composed linear units use offset 0.
No optional offset may leak into runtime values after S118 construction.

## Shared Conversion Helpers

Define one physical helper equivalent to:

```ts
function physicalValue(measurement: MeasurementValue): number {
  return measurement.value * measurement.unit.scale + measurement.unit.offset;
}

function displayValue(physical: number, unit: MeasurementUnit): number {
  return (physical - unit.offset) / unit.scale;
}
```

The implementation may use value+unit arguments instead, but it must expose one
pair of shared formulas. Attachment, runtime value validation, conversion,
subtraction, comparison, aggregates, chart normalization, math finite handling,
and checker constant evaluation use the same semantic formulas.

All physical and display intermediate/final values must be finite. A helper may
return a value only after finite validation or callers must validate with one
consistent measurement-domain path.

## Eligibility

```ts
function isAffineUnit(unit: MeasurementUnit): boolean {
  return unit.offset !== 0;
}
```

Eligibility is offset-based, not based on unit name, text, alias, factor count,
or SI identity. This correctly handles aliases and any future affine declaration.
A unit whose mathematical offset rounds to exactly 0 is linear for this runtime
rule; declaration metadata remains the source of truth.

## Attachment and Conversion

- Attachment `v unit` preserves displayed `v` and creates the unit from metadata
  including offset. It validates the canonical physical result as finite.
- Conversion `m in target` validates compatible vector, computes `physical(m)`,
  then computes `displayValue(physical, targetUnit)`. It returns a measurement
  in the exact target display unit.
- Checker constant finite validation uses the same physical formula for a literal
  attachment. A finite displayed value with non-finite affine physical value is
  rejected under the accepted static finite family.

## Binary Operations

### Addition

If either operand is a Measurement and either involved `MeasurementUnit` is
nonzero offset, reject with AMX3007 at `+`. Offset-zero compatible measurement
addition retains existing physical scale behavior and returns the left display
unit.

### Subtraction

For compatible measurement dimensions, always compute:

$$
result = \frac{physical(left)-physical(right)}{left.scale}
$$

Return a measurement in the exact left display unit. This supports linear-linear,
affine-affine, affine-linear, and linear-affine compatible pairs. Direct affine
addition is still rejected; subtraction is not modeled as addition to the
negated right measurement.

Examples:

- `20 C - 10 C -> 10 C`;
- `32 F - 20 C -> -36 F`;
- `273.15 K - 0 C -> 0 K`.

### Multiplication and Division

If either Measurement operand has nonzero offset, reject AMX3007 at the
operator before composing units, taking a quotient, or performing dimension
cancellation. If all Measurement operands are offset zero, retain current
behavior for Number/Measurement combinations and Number fallback for dimension
cancellation.

Division-by-zero remains AMX3010 for statically known Number/linear values and
AMX1009 for dynamic runtime values. An affine-eligibility failure takes
precedence when an affine operand makes the operation unsupported.

### Powers and Roots

- Binary `^` rejects a nonzero-offset base with AMX3007.
- Standard-library `pow` rejects a nonzero-offset measurement base with AMX3007.
- `sqrt` rejects a nonzero-offset operand with AMX3007 when reached before
  existing dimension/domain behavior; no affine physical square root is
  substituted.
- Offset-zero behavior, integer-literal exponent diagnostics, zero negative
  power, vector changes, and finite result rules remain unchanged.
- Runtime `composeUnits`/`powerUnit` are valid only for already-eligible units;
  they construct offset 0. Defensive misuse should fail explicitly rather than
  returning a misleading transform.

## Comparison

For compatible Measurement dimensions:

- equality/inequality and ordering compare `physicalValue(left)` and
  `physicalValue(right)`;
- incompatible dimensions keep existing AMX3007 behavior;
- equality of `0 celsius`, `32 fahrenheit`, and `273.15 kelvin` is true.

The operation remains exact IEEE-754 comparison under existing OpenAMX Number
semantics; no tolerance is applied by language operators. Tolerance belongs only
to fixture assertions where composed arithmetic is inherently inexact.

## Aggregates

For a nonempty homogeneous compatible Measurement list:

- `sum`: add all physical values. Convert that physical aggregate to the first
  measurement unit via inverse helper.
- `mean`: divide summed physical values by list length, then inverse-convert to
  the first unit.
- `min`/`max`: compare physical values and return the selected original
  measurement unchanged, including its display unit and value.

`sum([10 C,20 C])` yields `303.15 C`; this explicit physical aggregation is an
approved exception to direct addition rejection. `mean` is not a display-value
average unless all offsets are zero or units identical by equivalent physical
reasoning.

Empty list behavior remains: `sum(empty typed Measurement[])` returns zero in
existing canonical unit behavior; `mean`, `min`, and `max` retain existing
AMX2004 empty-list failure. A nonempty single-element sum/mean returns a value
in that element's display unit after physical inverse conversion.

## Unary and Math Display Rules

- Unary `-` negates display value and preserves unit, including a nonzero
  offset.
- `abs` applies to displayed value and preserves unit.
- `round` applies to displayed value and preserves unit/digits semantics.
- These operations do not transform physical offsets.
- Existing dimensionless Measurement math input behavior remains; mathematical
  functions continue to consume a linear dimensionless physical value according
  to prior V0.14 semantics. Affine dimensioned uses remain rejected by existing
  dimensional rules before a physical transform is applied.

## Runtime Validation and Finite Rules

`validateRuntimeValue` and attachment/conversion/aggregate/chart paths validate
`physicalValue` as finite with offset included. Public display `value` remains
finite under existing rules. A value may be finite but produce non-finite
physical multiplication or inverse conversion; that case fails rather than
serializing/exporting Infinity/NaN.

- Static literal physical finite checks use AMX3010.
- Dynamic evaluator domain/finite/division failures use AMX1009.
- Static dimensional incompatibilities and unsupported affine operations use
  AMX3007.
- No fallback converts NaN/Infinity to string, null, or a success-shaped value.

## Immutable and Display-Unit Rules

All returned units/measurements remain frozen. `sum`/`mean`, conversion, and
subtraction return new measurements with exact selected/target unit; they do
not mutate a source measurement's value/unit object. `min`/`max` may return the
selected immutable measurement itself under existing behavior.

Display text continues to serialize display `value` plus `unit.text`.
Measurement unit offset is internal runtime metadata, not emitted in narrative,
JSON, CSV, chart descriptors, or public schema objects unless a later contract
explicitly changes that contract.
