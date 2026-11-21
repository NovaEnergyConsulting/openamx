# Sprint 117 Diagnostics and Gates

## Diagnostic Contract

Sprint 117 adds no stable diagnostic code. Affine declaration failures use
`AMX3008`. Existing parse/module-cycle/import/export errors remain owned by their
current phases and identities. Exact final messages below are the accepted S115
policy translated to S117 fixtures and must be source-range verified during
execution.

| Case ID | Invalid condition | Phase | Primary anchor | Policy / message target |
| --- | --- | --- | --- | --- |
| AFF-LINEAR-01 | Existing valid linear declaration | Static declaration | N/A | Accepted; offset 0 |
| AFF-USER-CONST-01 | User value identifier appears in unit expression | Declaration check | Identifier source | `AMX3008 Unknown or not-yet-declared unit '<name>'` |
| AFF-IMPORTED-CONST-01 | Imported ordinary value appears as declaration identifier | Declaration check | Identifier source | Same AMX3008 unknown-unit policy; do not fold binding |
| AFF-FORWARD-01 | Later local unit referenced | Declaration check | Unit identifier source | Existing AMX3008 unknown/not-yet-declared unit |
| AFF-CALL-01 | Function call/unsupported AST in declaration expression | Declaration check | Call/unsupported node or operator | `AMX3008 Unit expressions may use only ...` updated to accepted allowed set |
| AFF-TWO-UNIT-ADD-01 | Unit `+/-` unit | Declaration check | `+` or `-` operator | `AMX3008 Unit declaration addition and subtraction require one affine unit term and one dimensionless scalar` |
| AFF-REVERSE-SUB-01 | Scalar `-` unit | Declaration check | `-` operator | `AMX3008 Unit declaration subtraction requires the unit term on the left` |
| AFF-SCALE-ZERO-01 | Unit effective scale evaluates to 0 | Declaration check | Scale-producing operator/operand | `AMX3008 Unit scale must be finite and greater than zero` |
| AFF-SCALE-NEG-01 | Unit effective scale is negative | Declaration check | Scale-producing operator/operand | Same AMX3008 scale message |
| AFF-SCALE-INF-01 | Unit scale overflows/non-finite | Declaration check | Scale-producing operator | Same AMX3008 scale message |
| S117-SCALAR-NONFINITE-01 | Scalar intermediate/final is NaN/Infinity or divisor is zero | Declaration check | Operator/operand producing failure | AMX3008; exact `Unit expression scalar must be finite` or denominator-specific wording must be recorded once in S117 execution |
| AFF-OFFSET-INF-01 | Unit effective offset is non-finite | Declaration check | Offset-producing operator | `AMX3008 Unit offset must be finite` |
| AFF-COMPOUND-01 | Nonzero-offset unit in unit multiplication/division or non-identity power | Declaration check | Combining operator | `AMX3008 Affine units may not be multiplied, divided, or raised to non-identity powers in declarations` |
| AFF-DIM-01 | Incompatible dimension composition where operation cannot represent the accepted unit model | Declaration check | Combining operator | AMX3008 dimension/unit expression family; record exact existing mismatch message |
| S117-SCALAR-ONLY-01 | Final declaration contains no visible unit | Declaration check | Full unit expression | Existing `AMX3008 A derived unit must reference at least one visible unit` |
| S117-POWER-01 | Non-integer/unsupported exponent or dimension overflow | Declaration check | Exponent/operator | Preserve existing `AMX3008 Unit powers must be signed integer literals` or dimension exponent-range message |
| AFF-CYCLE-01 | Unit/import cycle reached | Module/declaration | Import path/declaration opening cycle | Preserve existing AMX5003 cycle diagnostic; S117 does not create a new unit-cycle code |

## Source-Location Rules

- Unknown/forward identifier errors anchor on the identifier node.
- `+`, `-`, affine compound, and reverse-subtraction eligibility errors anchor
  on the binary operator source.
- Scale/offset finite errors anchor at the operator/operand producing the
  invalid number. If one precise operator exists, do not fall back to the unit
  name.
- Identity power 1 succeeds and retains all metadata; unsupported affine powers
  anchor at `^`.
- Scalar-only errors anchor at the complete declaration expression.
- Base-unit relationship and declaration-name conflicts preserve current
  declaration/secondary source locations.
- Module import/re-export/cycle errors preserve their module-loader/editor source
  and path behavior; do not move them into resolver source coordinates.
- Complete-document fixtures assert 1-based lines/columns, UTF-16 columns, and
  exclusive ends under existing diagnostic conventions, including LF/CRLF as
  supported by the test scope.

## Validation Gates

- Never validate a scalar zero/negative value as an affine scale simply because
  it is an intermediate. The gate is applied when the scalar becomes a
  multiplier/divisor/scale or the declaration's final unit scale.
- Every scalar result is finite. A non-finite scalar cannot become an offset,
  scale, exponent result, or hidden fallback.
- A nonzero-offset affine power is valid only for exponent 1. Do not silently
  canonicalize the offset away or treat the value as a scale-only compound.
- PI/E are scalar constants, not ordinary user declarations. They do not allow
  a user binding or imported value of the same concept to be folded.
- No runtime conversion/site should consume the new offset in S117. Registry
  assertions, not measurement arithmetic, qualify the implementation.
- Existing linear unit declarations and the SI library inventory must produce
  the same declarations, scales, vectors, aliases, and identities, now with
  offset 0; changing `libraries/si.amx` is out of scope.

## Stop Conditions

- A needed parser change broadens ordinary AMX syntax beyond accepted unit
  expression behavior; stop for product-owner decision.
- Any need to add offset to `MeasurementUnit`, evaluate conversion, or alter
  runtime arithmetic before S118 is a scope violation.
- A new diagnostic condition cannot be represented under AMX3008 without an
  exact allocator decision; no guessed code is permitted.
- Import/editor metadata differs from runtime registry metadata; stop to add an
  exact approved compatibility file plan, do not paper over the loss.
- A base-unit, module-cycle, or import visibility regression cannot be waived as
  a V0.19 change unless separately authorized; preserve prior behavior.
