# Sprint 086 Requirements: V0.14 Mathematical Standard Library

## Status and Authority

Sprint 086 implements the accepted V0.14 math and Measurement-library
contract. Sprint 084's contract disposition and Sprint 085's `is`
implementation disposition are ACCEPTED. This preparation does not authorize
Sprint 086 execution. Obtain separate execution authorization and approval
of the concrete file-by-file implementation/evidence plan before changing
production code, tests, or other files.

Behavior authority:

- [`plan-openamxV14MasterSprintPlan.md`](../../plan-openamxV14MasterSprintPlan.md)
- Accepted Sprint 084
  [`grammar-examples.md`](../0084-v14-language-contract-and-acceptance-fixtures/grammar-examples.md)
- Accepted Sprint 084
  [`diagnostic-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/diagnostic-matrix.md)
- Accepted Sprint 084
  [`requirement-test-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/requirement-test-matrix.md)
- Sprint 085
  [`builder-evidence.md`](../0085-v14-runtime-is-type-checking/builder-evidence.md)
- Existing V0.9 Measurement contract in
  [`language-spec-v0.9.md`](../../../docs/language-spec-v0.9.md)

The user separately clarified on 2026-10-16 that dimensionless Measurement
inputs to math functions are normalized by their unit scale: evaluate
`measurement.value * measurement.unit.scale`. Sprint 084's scale-1 `ratio`
fixture remains valid; Sprint 086 must add a non-unit-scale case to make this
decision observable.

## Goal

Add the approved mathematical constants and functions to the existing
standard-library and type-checking/evaluation paths. Extend existing numeric
standard-library operations to Measurements where approved, preserving
dimension checks, unit conversions, result units, and established errors.
Demonstrate exact contract behavior with focused tests and compatibility
evidence.

## In Scope

### Mathematical Functions and Constants

- Add `PI` and `E` as ordinary Number constants equal to their IEEE-754
  values: `3.141592653589793` and `2.718281828459045`.
- Add these unary functions, each accepting exactly one argument and
  returning an ordinary Number:
  `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`,
  `asinh`, `acosh`, `atanh`, `ln`, `log`, and `exp`.
- Accept a Number or dimensionless Measurement as each function's input.
  Normalize a Measurement to its canonical dimensionless numeric value by
  multiplying the displayed value by the unit scale. Reject dimensioned
  Measurements; do not add angle units or degree conversion.
- Use radians for trigonometric inputs and inverse-trigonometric results.
  `ln` is natural logarithm; `log` is base 10.
- Implement the approved domain and finite behavior:
  - `sin`, `cos`, `tan`: any finite real; use IEEE-754 evaluation and do not
    add an epsilon-based tangent-pole check. Diagnose a non-finite result.
  - `asin`, `acos`: closed interval `[-1, 1]`.
  - `atan`, `sinh`, `cosh`, `tanh`, `asinh`, `exp`: any finite real;
    diagnose non-finite results.
  - `acosh`: finite `x >= 1`.
  - `atanh`: finite `-1 < x < 1`.
  - `ln`, `log`: finite `x > 0`.
  - Diagnose invalid/non-finite input and domain failure with
    `AMXSL001`, `Invalid input for mathematical function`.
    Diagnose a non-finite math result with `AMXSL002`,
    `Function evaluation results in infinite result`.
- Preserve the approved function arity/type diagnostics:
  `AMX3004`, `Invalid arity for '<function>'`;
  `AMX3002`, `Expected Number or dimensionless Measurement, got <type>`;
  and `AMX3007`, `'<function>' requires a Number or dimensionless
  Measurement` for a dimensioned Measurement.
- Validate math outputs against
  `abs(actual - expected) <= max(1e-12, abs(expected) * 1e-12)`.

### Measurement-Aware Existing Standard Library

- Extend the existing functions where approved: `sum`, `mean`, `min`,
  `max`, `abs`, `round`, `sqrt`, and `pow`.
- `sum` and `mean` require compatible dimensions, convert values to the
  first Measurement's unit, and preserve that unit in the result.
  A typed empty Measurement `sum` remains zero in its canonical base-unit
  expression; empty `mean` retains its error.
- `min` and `max` compare physical values of compatible Measurements and
  return the selected Measurement in its original unit. Empty-list behavior
  remains an error.
- `abs` preserves the Measurement's unit.
- `round` preserves the Measurement's unit and rounds the displayed numeric
  value. Preserve existing behavior: omitted digits default to zero,
  fractional digits are truncated toward zero, and `Math.round` determines
  ties.
- `sqrt` preserves established dimension-vector root rules. Reject negative
  values and results whose dimension exponents are not integral; preserve
  existing Number and Measurement diagnostics.
- `pow` preserves the V0.9 integer-literal exponent rule for Measurement
  bases, including dimension and unit transformations. Do not broaden
  exponent semantics.
- Preserve existing Number behavior and all approved empty-list, error,
  conversion, and unit semantics. Incompatible dimensions are rejected, not
  coerced.

## Out of Scope

- Runtime `is` behavior or unrelated amendments to Sprint 085 implementation.
- Text functions (`len`, `trim`, `left`, `right`) and numeric `format`;
  these belong to Sprint 087.
- Shared editor services, VS Code/desktop authoring support, user-facing
  language specification/help, and production examples; these belong to
  Sprint 088.
- Angle dimensions/units, degrees, implicit unit coercion, altered
  Measurement algebra, arbitrary decimal/exact arithmetic, or changes to the
  V0.9 Measurement contract.
- Changes to accepted domain boundaries, tolerance, diagnostics, or
  dimensionless Measurement normalization without a separate product
  decision and approved plan amendment.
- Unrelated language, report, desktop, package, release, or version work.

## Constraints and Gates

- Preserve the accepted Sprint 084 decisions and user clarification exactly.
  A dimensionless Measurement input is normalized by its unit scale before
  the math function; the result is a Number with no unit.
- A finite `tan(PI / 2)` implementation result is accepted even when large;
  do not infer an epsilon pole error. Only a non-finite result errors.
- No math path may leak `NaN`, positive/negative infinity, or a success-shaped
  fallback. Check both inputs and outputs for finiteness.
- Preserve exact existing `sqrt`, Measurement, aggregate, rounding, and
  dimensional-power behavior outside the approved changes.
- Use the existing standard-library/type-metadata and Measurement helpers;
  do not create a parallel library subsystem.
- Tests must exercise the accepted Sprint 084 fixtures and exact diagnostics.
  Do not infer correctness from a build alone.
- Obtain separate Sprint 086 execution authorization and approve the
  concrete file-by-file plan before editing. If the build regenerates
  browser/runtime bundles or other generated files, list and approve those
  files in that plan before retaining changes.
- Sprint 085 was accepted with focused evidence (241 passed / 0 failed,
  core build passed); the full root suite and integration remain assigned to
  Sprint 089. Do not represent those unrun checks as Sprint 086 passes.
