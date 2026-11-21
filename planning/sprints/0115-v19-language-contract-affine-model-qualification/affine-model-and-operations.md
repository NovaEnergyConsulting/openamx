# Sprint 115 Contract: Affine Unit Model and Operations

## Status

Architect-prepared candidate contract. Confirmed V0.19 behavior is locked by
the master plan. Declaration-composition and compound-external-unit
refinements are proposed for the separate Sprint 115 disposition.

## Canonical Representation

A unit retains its existing dimension identity and gains an offset relative to
the canonical base unit. For displayed value $v$:

$$
p = v \times scale + offset
$$

where:

- `scale` is finite and strictly greater than zero;
- `offset` is finite and may be positive, zero, or negative;
- `vector` and unit/module identity retain existing semantics;
- the canonical base unit has `scale = 1` and `offset = 0`;
- every existing scale-only unit has `offset = 0`;
- aliases preserve the same vector, scale, offset, and canonical identity;
- external measurements remain `{ value, unit }`; scale and offset are internal
  registry/runtime metadata, not persisted fields in that public shape.

Conversion from source displayed value $v_s$ to target displayed value $v_t$:

$$
v_t = \frac{v_s \times scale_s + offset_s - offset_t}{scale_t}
$$

The canonical physical value and the inverse formula must be used from one
shared conversion helper; renderers and external-data consumers must not apply
a second independent conversion implementation.

## Declaration Grammar and Precedence

Existing unit declarations remain:

```ebnf
UnitDeclaration ::= "unit" Name ":" DimensionName
                  | "unit" Name "=" UnitExpression
UnitExpression ::= SumExpression
ScalarExpression ::= DimensionlessExpression
```

Reuse ordinary declaration-expression precedence:

1. parentheses, numeric literals, visible unit identifiers, `PI`, `E`;
2. signed integer power `^`;
3. `*` and `/` from left to right;
4. `+` and `-` from left to right, with the affine offset rules below.

`DimensionlessExpression` permits numeric literals, `PI`, `E`, parentheses,
unary numeric signs, and `+`, `-`, `*`, `/`, and signed integer `^` while the
intermediate and final values remain finite. It permits zero as an intermediate
scalar operand and may therefore produce a positive, zero, or negative offset;
it does not permit a declaration to finish as scalar-only. User/imported
values, calls, forward names, record access, and arbitrary Boolean or string
expressions remain excluded. Division by zero and non-finite intermediate or
final scalar values are declaration errors.

Candidate Sprint 115 refinement D115-04:

- `+` and `-` require exactly one dimension-bearing affine expression and one
  statically evaluable dimensionless scalar expression.
- A unit expression plus a scalar adds the scalar to offset. A unit expression
  minus a scalar subtracts the scalar from offset. The scalar may appear on the
  left only for `+`; reversing subtraction or producing a non-positive scale
  is rejected.
- Two dimension-bearing terms cannot be joined with declaration `+` or `-`.
  This is intentionally narrower than runtime measurement subtraction and
  prevents declaration algebra from inventing a unit as the sum of two
  already-scaled absolute units.
- A derived declaration must ultimately contain at least one visible unit.
  A scalar-only declaration remains invalid.

A unit identifier resolves to its complete affine pair $(scale, offset)$. A
numeric expression resolves as a scalar only when used in an existing
scale-factor or offset position.

## Affine Composition

Let an affine expression have transformation $A(v)=sv+o$.

- Multiply a unit-bearing affine expression by finite positive scalar $k$:
  $(s,o) \rightarrow (ks,ko)$.
- Divide a unit-bearing affine expression by finite positive scalar $k$:
  $(s,o) \rightarrow (s/k,o/k)$. The affine expression must be the numerator;
  `scalar / affineUnit` is rejected for a nonzero-offset affine transform.
- For declaration `unit + k` or `scalar + unit`:
  $(s,o) \rightarrow (s,o+k)$.
- For declaration `unit - k`: $(s,o) \rightarrow (s,o-k)$.
- Unit multiplication/division is permitted only when both resulting compound
  dimensions are representable and every involved offset is zero, except a
  dimensionless scalar factor. This preserves all existing compound units.
- A power is permitted only for an offset-zero transform. Exponent 1 is the
  identity for any affine transform; all other exponents on a nonzero offset
  are rejected.
- Composed output scale must remain finite and strictly positive. Offset and
  intermediate physical values used to qualify a fixture must remain finite.
- Cycles, unresolved/not-yet-visible names, zero/negative scales, non-finite
  scale/offset, and incompatible dimensions are declaration errors.

An alias `unit alias = original` copies complete metadata, including a nonzero
offset. Module identity remains the original named dimension-unit identity and
explicit import/export behavior does not infer new aliases.

## Constants in Unit Declarations

Only `PI` and `E` receive declaration-time numeric meaning in derived unit
expressions. Their values are `Math.PI` and `Math.E`, identical to runtime
standard-library constants.

Examples:

```amx
unit halfTurn = 2 * PI * radian
unit exponentialLength = E * meter
```

They are allowed in scale or offset scalar expressions. They do not introduce
ordinary constant folding: user declarations, imported constants, function
calls, forward identifiers, object access, and arbitrary expression side
effects remain excluded. Normal runtime `PI` and `E` identifier behavior is
otherwise unchanged.

## Derived Temperature Units

The approved invariant is:

$$
0\,C = 32\,F = 273.15\,K
$$

Canonical internal declarations:

```amx
export unit celsius = kelvin + 273.15
export unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
export unit degC = celsius
export unit degF = fahrenheit
```

Derived transforms:

| Unit | Scale in K | Offset in K | Physical formula |
| --- | ---: | ---: | --- |
| `kelvin`, `K` | 1 | 0 | $p=v$ |
| `celsius`, `degC` | 1 | 273.15 | $p=v+273.15$ |
| `fahrenheit`, `degF` | $5/9$ | $273.15-160/9$ | $p=(5/9)v+273.15-160/9$ |

Thus `fahrenheit` has offset $255.3722222222222$ in the host's ordinary
IEEE-754 evaluation. Contract tests compare expected physical values with an
explicit floating tolerance for composed results; zero/scale validation does
not become decimal/exact arithmetic.

## Operation Matrix

| Operation | Linear unit behavior | Affine unit behavior | Result unit |
| --- | --- | --- | --- |
| Attachment `v unit` | Display value retained | Compute physical value with scale and offset for finite validation; retain display value | Attached unit |
| Conversion `x in target` | $(p)/target.scale$ | $(p_s-offset_t)/scale_t$ | Target unit |
| Equality/order | Compare physical values | Compare canonical physical values | Boolean |
| Measurement `+` | Existing direct addition, compatible dimensions | Reject when either operand has nonzero offset | N/A |
| Measurement `-` | Existing compatible subtraction | $(p_l-p_r)/scale_l$ | Left display unit |
| Measurement `*` or `/` by Number | Existing supported behavior | Reject when the measurement has nonzero offset; a linear unit path remains supported | Existing composed/display rule only for permitted linear path |
| Measurement `^` / `pow` | Existing supported dimensional behavior | Reject nonzero-offset base; linear behavior unchanged | Existing rule |
| `sqrt` | Existing linear behavior | Reject nonzero-offset operand | Existing rule |
| `sum(list)` | Physical aggregate in existing scale model, first unit | Sum canonical physical values, then inverse-convert to first unit | First element unit |
| `mean(list)` | Physical mean in existing scale model | Mean canonical physical values, then inverse-convert to first unit | First element unit |
| `min` / `max` | Select by physical comparison | Select by canonical physical comparison | Selected original unit |
| `abs` / `round` | Transform displayed numeric value, preserve display unit | Same display-value transformation and same selected unit | Selected unit |
| unary `-` | Negate displayed value | Negate displayed value and preserve unit | Operand unit |
| Remainder `%` | Reject for measurement | Reject | N/A |
| Chart normalization | Convert selected values to first unit's displayed values | Use affine physical conversion, retaining the first observed display unit and label | First display unit |
| Scalar/table display | Display stored value and unit | Display the selected display value; do not append raw physical value | Stored display unit |
| External measurement attachment | Parse `{ value, unit }`, retain display value | Same shape and display value; affine unit metadata supplies physical conversion when needed | Parsed unit |

For `20 celsius - 10 celsius`:

$$
\frac{(20+273.15)-(10+273.15)}{1}=10\,celsius
$$

For `sum([10 celsius, 20 celsius])`:

$$
\frac{(10+273.15)+(20+273.15)-273.15}{1}=303.15\,celsius
$$

This exceptional aggregate deliberately differs from rejected direct affine
addition. For `mean`, divide the physical aggregate by list length before
inverse conversion.

## Empty and Invalid Aggregate Cases

- Existing empty-list behavior for `sum`, `mean`, `min`, and `max` remains.
- Empty typed Measurement `sum` uses the existing canonical-unit result path;
  implementation must prove affine offset does not create an unintended
  display value or inconsistent canonical unit.
- Mixed incompatible dimensions are rejected by the existing dimensional
  family at the aggregate argument/source.
- Homogeneous Number aggregates remain Number behavior and are outside affine
  conversion.

## Chart and External Data Contract

- In a selected measurement column, compatible affine values normalize by
  converting canonical physical values to the first non-null value's display
  unit. Labels/headings use that retained unit.
- Mixed Celsius/Fahrenheit/Kelvin values are compatible by vector and may be
  normalized; Number/non-measurement mixing remains an error.
- The selected display unit and external `{ value, unit }` shape do not become
  canonical physical serialization. Consumers that request physical comparison
  use internal scale/offset metadata.
- Atomic external text `celsius`, `fahrenheit`, imported aliases, and existing
  scale-only compound expressions are accepted according to visible registry
  rules. Candidate D115-05 rejects a nonzero-offset unit inside compound
  multiplication/division/power text because applying dimension algebra after
  an absolute offset would be ambiguous.

## Finite and Source Rules

- Literal and computed declaration scales/offsets must be finite. IEEE-754
  overflow, division by zero, zero/negative effective scale, and unsupported
  affine composition fail during static unit declaration checking.
- Runtime attachment, conversion, arithmetic, aggregate, and chart physical
  values must be finite. Existing runtime measurement domain-error handling
  remains the owner for dynamic non-finite values.
- Diagnostics anchor on the declaration operator/operand or runtime operator
  responsible for the invalid transformation, with declaration source as
  secondary context where supported.

## Required Fixture Invariants

The Sprint 115 case inventory must independently prove:

- all identity aliases and $0\,C=32\,F=273.15\,K$;
- forward/reverse conversion round trips at positive, zero, negative, and
  fractional display values;
- Fahrenheit and Celsius subtraction in mixed and same-unit forms;
- direct affine addition and affine `*`, `/`, `^`, `pow`, and `sqrt`
  rejection;
- exact `sum`/`mean` inverse-conversion behavior and physical `min`/`max`;
- `abs`, `round`, and unary minus display-unit retention;
- PI/E declaration acceptance and user/imported constant rejection;
- chart normalization and unchanged external shape;
- aliases/imports retaining offset metadata.
