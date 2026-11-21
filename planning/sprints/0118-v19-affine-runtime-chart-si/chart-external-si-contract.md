# Sprint 118 Contract: Charts, External Data, and SI Temperature Units

## Chart Normalization

For each selected measurement column/axis, the first non-null Measurement value
still chooses the display unit. All subsequent non-null values must have a
compatible dimension. Conversion uses the shared canonical formulas:

$$
p = value\times source.scale + source.offset
$$

$$
displayed = \frac{p-target.offset}{target.scale}
$$

where `target` is the selected first non-null display unit.

The normalized chart emission must preserve:

- the first selected unit text and label;
- axis series headings such as `Temperature (celsius)`;
- existing selected measurement descriptor fields and frozen behavior;
- record field layout, source order, duplicate rows, and null positions;
- scalar-list order and labels;
- plotted point count and existing no-data/null semantics;
- no offset/physical-value leakage into public chart values.

Examples:

- `[0 C, 32 F, 273.15 K]` normalized to first C: `[0, 0, 0]`;
- `[10 C, 50 F, 300 K]` normalized to first C produces expected physical
  conversion values, with Celsius text;
- if Fahrenheit is first, the normalized unit/label is Fahrenheit and values are
  converted into Fahrenheit.

The shared model is not expected to recompute conversion. It consumes normalized
numbers and existing unit metadata. S116's `showTable` field is unchanged and S119
still owns actual table-output omission.

## External JSON and CSV Inputs

The public input and output measurement shapes remain unchanged:

```json
{ "value": 20, "unit": "celsius" }
```

```csv
20 celsius
```

- Exact JSON object keys remain `value` and `unit`; a third key, missing key,
  serialized `scale`, or serialized `offset` is still AMX4005.
- An atomic visible affine unit (`celsius`, `fahrenheit`, imported alias) creates
  a runtime `MeasurementUnit` with copied scale/offset.
- The displayed input number remains unchanged and unit text remains exactly as
  supplied under existing parenthesized/compound text behavior.
- Compatible dimension validation remains unchanged.
- Runtime physical finite validation uses offset-aware physical value. Invalid
  finite input number that overflows after offset/scale remains an AMX input or
  measurement finite diagnostic according to existing input/runtime phase.
- JSON/CSV output serializes only `{ value: displayValue, unit: unit.text }` or
  the equivalent CSV pair. `offset`, `scale`, canonical physical value, and
  internal factor metadata are never added to the public shape.

## External Compound Unit Restriction

D115-08 accepts an affine atom but rejects a nonzero-offset unit when it appears
in a compound external expression using `*`, `/`, or `^`.

Accepted:

```text
celsius
fahrenheit
degC
meter / second
kilometer / hour ^ 2
```

Rejected with AMX4004:

```text
celsius / second
2 / celsius
celsius * meter
celsius ^ 1
celsius ^ 2
```

The parser may detect affine participation before calling `composeUnits` or
`powerUnit`. It must produce `ExternalUnitTextError(unknownUnit: false)` so
`inputData` maps it to AMX4004 with existing data path/source context. A visible
affine atom alone is not rejected as “unknown”. Parentheses around one atomic
affine unit do not themselves create a compound operation and may be accepted;
parenthesized multiplication/division/power still reject.

## SI Library Contract

Add these exports after the Kelvin base/alias declarations in the additive SI
section:

```amx
export unit celsius = kelvin + 273.15
export unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
export unit degC = celsius
export unit degF = fahrenheit
```

The resulting library inventory is 16 dimensions and 50 exported units.
Historical declarations, ordering outside the additive temperature insert,
scale/vector values, aliases, and identities remain unchanged. The historical
V0.9 blueprint is a preservation baseline, not a complete V0.19 expected
inventory; tests must compare all old rows plus these four explicit V0.19 rows.

Approved metadata:

| Unit | Scale in K | Offset in K |
| --- | ---: | ---: |
| `celsius` | 1 | 273.15 |
| `fahrenheit` | $5/9$ | $273.15-160/9$ |
| `degC` | 1 | 273.15 |
| `degF` | $5/9$ | $273.15-160/9$ |

The declaration formulas use only S117-supported scalar/affine behavior. No new
SI dimension is introduced.

## Measurement Display and Output

- Narrative interpolation displays `value unit.text` and no offset.
- Table/scalar data uses display values and selected units as before.
- JSON/CSV outputs round-trip display intent; the public shape cannot contain a
  physical canonical substitute.
- A chart descriptor's scale is still used for identity/label consistency, but
  raw chart numbers have already been normalized and must not be reconverted by
  renderer/model code.
- An output validation pass that checks `isMeasurement` may validate physical
  finite value using the shared helper without changing serialization.

## S119 Boundary

Sprint 118 updates chart data normalization and runtime values. It does not:

- hide or omit a chart table from HTML/PDF/DOCX;
- remove table-specific browser JSON;
- change `showTable` rendering;
- alter output-facing accessibility/table references;
- update editor grammar/highlighting, specification, examples, README, or
  migration note.

A false `showTable` chart may still render its table during S118. That is a
S119 output concern, not an S118 normalization failure.
