# Sprint 117 Implementation Contract: Affine Declarations

## Authority and Boundary

The accepted Sprint 115 affine contract is authoritative. This document narrows
it to declaration-time metadata and registry behavior. It must not be read as
permission to implement runtime conversion or SI temperature exports.

## Metadata Contract

```ts
export interface UnitMetadata {
  name: string;
  moduleIdentity: string;
  declarationName: string;
  identity: string;
  vector: ReadonlyMap<string, number>;
  scale: number;
  offset: number;
  source?: SourceLocation;
}
```

- `scale` is finite and strictly positive.
- `offset` is finite and may be positive, zero, or negative.
- A base unit has `(scale, offset) = (1, 0)`.
- All existing scale-only units have offset 0.
- A derived unit stores its canonical transformation over base dimensions:
  $p = v \times scale + offset$.
- A local alias receives its own declared `name`, `declarationName`, `identity`,
  and source, while copying the source unit's vector, scale, and offset.
- Imported/re-exported units preserve their original module identity, unit
  identity, scale, offset, vector, and source metadata unless existing import
  rules deliberately retag only the visible local name through registry maps.

The S117 public registry shape adds a field to metadata but introduces no
serialized registry format. Runtime `MeasurementUnit` and external `{ value,
unit }` remain unchanged in this sprint.

## Resolver Result Contract

Use an internal representation equivalent to:

```ts
type UnitExpressionResult =
  | { kind: 'scalar'; value: number }
  | {
      kind: 'unit';
      vector: ReadonlyMap<string, number>;
      scale: number;
      offset: number;
    };
```

A discriminated representation is recommended. If the implementation retains
the existing `vector/scale/hasUnit` shape, scalar values must still be handled
through an explicit scalar branch and may not be passed through
`validateUnitScale` merely because they appear between operators.

Every branch validates finite values at the point it computes them. The
final `checkUnit` path rejects a scalar-only declaration.

## Scalar Expression Contract

Dimensionless scalars accept:

- finite numeric literals;
- `PI` and `E` built-in declaration constants;
- parentheses;
- existing unary minus;
- binary `+`, `-`, `*`, `/`;
- signed integer-literal power `^`.

Examples:

```amx
unit shifted = kelvin + (273.15 - 160 / 9)
unit scaled = (5 / 9) * kelvin
unit angularScale = PI * radian
unit exponentialScale = E * meter
unit negativeOffset = kelvin + (10 - 20)
```

Rules:

- Scalar `+/-/*` use ordinary IEEE-754 arithmetic and require a finite result.
- Scalar `/` rejects zero denominator and non-finite result.
- Scalar `^` uses a signed integer-literal exponent under the existing
  declaration exponent rule. The result must be finite; zero to a negative
  exponent is invalid.
- Scalar intermediate values may be zero or negative. For example,
  `273.15 - 300` is a valid scalar offset `-26.85`.
- Scalar-only derived declarations remain invalid; a visible unit must be part
  of the final expression.
- Unary plus is not added. This contract reuses current ordinary AMX expression
  syntax, which supports unary minus and does not define unary plus.

## PI/E Contract

Inside a derived unit expression, `PI` resolves to `Math.PI` and `E` to
`Math.E`, independent of runtime environment values. Their visibility is an
allowlist, not a general namespace fallback.

- `unit x = PI * meter` is accepted as a scalar-scaled unit.
- `unit x = meter + E` is accepted as an offset-shifted unit.
- `unit x = PI` is rejected as scalar-only.
- A declared/imported ordinary value, function result, forward unit, or record
  field expression is not evaluated as a declaration constant.
- Runtime PI/E expression resolution remains unchanged and is not used by the
  declaration resolver.

## Affine Addition and Subtraction

For a unit transform $A(v)=sv+o$ and scalar $k$:

- $A(v)+k \Rightarrow (s,o+k)$;
- $k+A(v) \Rightarrow (s,o+k)$;
- $A(v)-k \Rightarrow (s,o-k)$;
- $k-A(v)$ is rejected;
- unit `+/-` unit is rejected even when dimensions match;
- scalar `+/-` scalar computes scalar arithmetic and remains scalar.

These are declaration operators, not runtime measurement addition/subtraction.
The resulting unit keeps the original dimension vector. An offset shift cannot
introduce/remove a dimension.

## Affine Multiplication and Division

For finite scalar $k$:

- positive-scalar `unit * k` or `k * unit` transforms
  $(s,o) \rightarrow (ks,ko)$;
- `unit / k` transforms $(s,o) \rightarrow (s/k,o/k)$;
- the effective scale must remain finite and strictly positive;
- zero/negative scalar multipliers or divisors that make the unit scale invalid
  are rejected;
- `k / unit` remains compatible with existing linear units only when the unit
  offset is 0; it is rejected for a nonzero-offset unit;
- unit `*` unit and unit `/` unit remain valid only when all participating
  offsets are 0; combine existing vectors/scales with current semantics;
- scalar `*`, `/` scalar follows scalar rules and stays dimensionless.

A nonzero-offset unit cannot be made into an ordinary compound unit such as
`celsius / second`; this S117 declaration restriction is separate from any
later runtime measurement diagnostic.

## Power Contract

- A scalar base follows scalar signed-integer exponent behavior.
- A unit with offset 0 follows existing dimension and scale power behavior.
- A unit with offset not equal to 0 supports exponent 1 as the identity and
  rejects every other exponent, including 0, negative powers, and powers above 1.
- Dimension exponent overflow, invalid exponent type, and non-finite resulting
  scale retain declaration-error behavior at the exponent/operator source.

## Validation Order and Diagnostics

Validation order is selected to produce ordinary, narrow errors:

1. Resolve/validate child expressions.
2. Apply unsupported-form eligibility for the operator.
3. Compute finite scalar/scale/offset result.
4. Validate effective unit scale positive and offset finite.
5. In `checkUnit`, require `hasUnit`/unit-kind and store metadata.

This ensures a call/unknown identifier/forward unit failure keeps its ordinary
AMX3008 source, and an affine eligibility error is anchored at the combining
operator rather than the declaration name. Exact policy is in
`diagnostics-and-gates.md`.

## Base, Alias, and Import Behavior

- Base `unit name: Dimension` stores scale 1, offset 0, and becomes the
  canonical base unit under current uniqueness rules.
- Derived `unit alias = visibleUnit` is a complete affine alias: same vector,
  scale, and offset; it receives ordinary alias identity/name metadata.
- Explicit export, import, and re-export carry metadata without recomputing the
  affine expression or replacing offset with 0.
- Editor module analysis receives the same imported affine metadata as runtime
  module loading. A difference is a S117 integration failure.
- Import cycles remain the existing module/AMX5003 concern; source-order local
  references remain AMX3008 unknown/not-yet-declared unit failures.
- Imported ordinary bindings named `PI`, `E`, or another identifier are not
  declaration constants; if not a visible unit, they fail the unit-expression
  resolver rather than folding a runtime value.

## Staging Boundary

The registry may now expose `offset`, but S117 must not:

- add `offset` to `MeasurementUnit`;
- copy offset into runtime measurement values;
- compute physical conversion with offset;
- add or modify SI temperature declarations;
- modify external measurement parsing or external-unit compound behavior;
- implement affine arithmetic, aggregate, chart, or display behavior;
- change generated/runtime browser artifacts.

These consumers remain explicit Sprint 118 dependencies. A type error caused by
constructing `UnitMetadata` must be repaired with focused metadata-only changes;
it is not permission to broaden runtime behavior.
