# Sprint 086 Acceptance Criteria

Sprint 086 is complete when the accepted mathematical and
Measurement-aware standard-library contract is implemented, every applicable
Sprint 084 fixture has direct test evidence, and existing math/Measurement
behavior remains covered. Sprint 086 adds no text/format/editor integration
and does not authorize release or publication.

## Mathematical Functions and Constants

- The standard library and type checker recognize `PI`, `E` and all 15
  approved unary Number-returning functions:
  `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`,
  `asinh`, `acosh`, `atanh`, `ln`, `log`, and `exp`.
- Each function takes exactly one argument. The accepted type contract is
  Number or dimensionless Measurement, returning an ordinary Number.
  Wrong arity/type diagnostics match Sprint 084's exact
  `AMX3004`/`AMX3002` behavior; dimensioned Measurement rejection matches
  `AMX3007`.
- Trigonometric inputs and inverse-trigonometric outputs use radians;
  `ln` is natural logarithm and `log` is base 10. `PI` and `E` equal
  `3.141592653589793` and `2.718281828459045`.
- For a dimensionless Measurement input, evaluate its normalized
  dimensionless value `measurement.value * measurement.unit.scale` before
  calling the math function. The function result is a unitless Number.
  Include both the approved scale-1 `ratio` fixture and a dimensionless unit
  with non-unit scale; prove that they produce the corresponding normalized
  results.
- Values in `MATH-TEXT-FORMAT-VALID-01` match within
  `abs(actual - expected) <= max(1e-12, abs(expected) * 1e-12)`.
- Domain behavior matches the approved contract: `asin`/`acos` accept
  `[-1,1]`; `acosh` accepts finite `x >= 1`; `atanh` accepts finite
  `-1 < x < 1`; `ln`/`log` accept finite `x > 0`; the remaining functions
  accept finite real inputs, subject to a finite result.
- Invalid domains and non-finite inputs produce `AMXSL001`,
  `Invalid input for mathematical function`. Non-finite computed results
  produce `AMXSL002`,
  `Function evaluation results in infinite result`. No math call returns
  NaN, infinity, or a success-shaped fallback.
- `tan` follows IEEE-754 evaluation without epsilon-based pole detection.
  The approved `tan(PI / 2)` fixture is accepted when its result is finite;
  it must not receive a special pole diagnostic merely for being large.

## Measurement-Aware Existing Standard Library

- `sum`, `mean`, `min`, `max`, `abs`, `round`, `sqrt`, and `pow` support
  Measurement inputs/lists according to the accepted V0.9/V0.14 contract;
  existing Number semantics remain unchanged.
- Compatible elements in `sum` and `mean` are converted to the first
  Measurement's display unit; results use that unit. Incompatible dimensions
  are rejected with the approved existing diagnostic. `MEAS-COMPAT-01`
  verifies the invalid case.
- `min`/`max` compare physical values and return the selected original
  Measurement and unit; they do not convert the selected result into the
  first unit.
- A typed empty Measurement `sum` returns zero in its canonical base unit.
  Empty `mean`, `min`, and `max` retain their existing function-specific
  `AMX2004` errors.
- `abs` preserves the input Measurement unit.
- `round` preserves its Measurement unit and rounds the displayed numeric
  value. Omitted digits default to zero, fractional digits truncate toward
  zero, and existing `Math.round` tie behavior is preserved.
- `sqrt` preserves the established dimension-root rules, rejects negative
  values and non-integral resulting dimension exponents, and retains
  `AMX2005` for negative Number input, `AMX3010` static Measurement-domain
  behavior, and `AMX1009` dynamic Measurement-domain behavior as applicable.
- `pow` preserves the Measurement integer-literal exponent rule, including
  positive, zero, and negative exponents and established dimension/unit
  transformations.
- All expected values and units in `MEAS-STDLIB-VALID-01` are verified,
  including typed empty sum `0 meter`.

## Regression and Evidence

- The approved math and Measurement fixture set is tested directly:
  `MATH-TEXT-FORMAT-VALID-01` math bindings,
  `MATH-ARITY-01`, `MATH-TYPE-01`, all approved math-domain and finite
  fixtures, `MATH-MEASUREMENT-DIM-01`, `MEAS-STDLIB-VALID-01`,
  `MEAS-COMPAT-01`, empty Measurement aggregate fixtures, and both `sqrt`
  regression fixtures.
- Relevant existing evaluator, type-checker, Measurement, dimension, and
  math tests pass or have each failure recorded against a concrete baseline.
  No existing assertion is weakened to obtain a pass.
- The core build passes. Exact commands, Bun counts, environment, first-run
  failures/retries, generated-file outcomes, and residuals are recorded in
  `builder-evidence.md`. A build alone is not runtime evidence.
- Any generated browser/runtime bundle is retained only if it is part of the
  separately approved file plan and the output is inspected.
- No `is` semantic change, text/format implementation, editor/doc/example
  integration, unrelated cleanup, package/version change, release, or
  publication occurs.
- A separate Lead Developer/product-owner records the Sprint 086
  implementation disposition. Sprint 087 is not authorized by a Builder
  recommendation or completion alone.
