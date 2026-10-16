# Sprint 086 Blueprint: V0.14 Mathematical Standard Library

## Approach

1. Obtain explicit Sprint 086 execution authorization and approval of the
   concrete file-by-file implementation/evidence plan. Record worktree
   state, preserve existing changes, and do not infer authority from Sprint
   085 acceptance.
2. Read the accepted V0.14 contract and Sprint 085 evidence. Inspect current
   standard-library evaluation, function signature/type metadata, expression
   evaluation, Measurement arithmetic/conversion, finite-value checks, and
   focused tests. Record the exact existing extension points and baseline
   behavior in `builder-evidence.md`.
3. Implement the constants and function signatures in the existing shared
   standard-library/type-checking path. Ensure all 15 functions are
   recognized for type checking and evaluation and `PI`/`E` resolve as
   ordinary Number constants. Preserve source locations on call/type/runtime
   failures.
4. Implement the unary mathematical behavior using IEEE-754 functions.
   Normalize dimensionless Measurement arguments with `value * unit.scale`.
   Return an ordinary Number. Reject dimensioned Measurements with the
   approved measurement-type diagnostic. Do not add new angle or unit
   conversion behavior.
5. Add explicit finite/domain guards around math evaluation:
   - Validate the input before evaluating the function.
   - Apply the approved domain exactly, including inclusive/exclusive
     endpoints.
   - Validate the result before returning.
   - Emit `AMXSL001` for invalid/non-finite inputs or domain errors and
     `AMXSL002` for non-finite results.
   - Keep IEEE-754 `tan` behavior; a finite large approximation at a
     mathematical pole is not itself an error.
6. Extend the existing Number/list library operations for Measurement
   values only where the accepted contract permits:
   - Aggregate compatibility and first-element unit conversion for `sum`
     and `mean`.
   - Physical comparison and selected-original-unit result for `min`/`max`.
   - Unit preservation for `abs` and `round`.
   - Existing square-root dimensional rules and power exponent restrictions.
   Preserve Number behavior, error codes, empty-list behavior, and typed
   empty Measurement sum.
7. Implement tests from the accepted fixtures. Test every math function,
   constants, approved tolerance, scaled dimensionless input, dimensioned
   input rejection, all domain edges and error diagnostics, finite overflow,
   and every Measurement library result/unit/error. Keep math verification
   separate from text/format assertions in the shared positive fixture.
8. Verify regressions, run focused test suites for the touched runtime,
   Measurement, and type-checking areas, then run the core build. Inspect
   build-generated artifacts and keep them only if they are included in the
   approved plan. Record exact commands, counts, failures/retries, and any
   `runTests` versus direct Bun discrepancy in evidence.
9. Review changed files against the approved scope, update planning ledgers
   with implementation evidence and residuals, and request a separate
   Sprint 086 disposition. Sprint 087 remains a separate authorization gate.

## Expected Files to Plan

The exact list must be reviewed and approved before edits. Expected
implementation areas, subject to repository inspection:

- `src/runtime/standardLibrary.ts`
- `src/runtime/evaluateExpression.ts`
- Existing standard-library function-signature/type metadata and
  `src/typechecker/checkDocument.ts` as required
- Measurement helpers or type metadata only as required to preserve accepted
  units/dimensions
- Focused tests under `tests/`, likely including a dedicated
  `tests/v14MathLibrary.test.ts` plus existing evaluator, Measurement, and
  dimension regression tests
- `planning/sprints/0086-v14-mathematical-standard-library/builder-evidence.md`
- Planning-ledger updates in `planning/decisions.md` and
  `planning/questions.md`
- Any generated output that the approved build demonstrably changes, listed
  explicitly in the approved file plan

Do not edit `src/parser/parseExpression.ts` or `src/ast/types.ts` for
standard-library additions unless inspection proves a specific parser/AST
change is necessary and a narrow plan amendment is approved. Do not modify
editor, user-documentation, example, package, or release files.

## Verification

From the repository root, after implementation:

1. Run the focused V0.14 math and Measurement test file plus relevant existing
   suites, expected to include `tests\evaluator.test.ts`,
   `tests\measurements.test.ts`, `tests\dimensions.test.ts`, and any
   approved new test file. Include focused `tests\isTypeChecking.test.ts`
   only if shared checker/evaluator behavior is touched.
2. Assert every math binding in `MATH-TEXT-FORMAT-VALID-01` against the
   accepted tolerance, including `PI`, `E`, all 15 functions,
   dimensionless Measurement normalization, and the approved finite
   tangent-pole approximation. Ignore only the text/format bindings, which
   Sprint 087 owns.
3. Run all approved negative fixtures:
   `MATH-ARITY-01`, `MATH-TYPE-01`, `MATH-DOM-ASIN-01`,
   `MATH-DOM-ACOS-01`, `MATH-DOM-ACOSH-01`, `MATH-DOM-ATANH-01`,
   `MATH-DOM-LN-01`, `MATH-DOM-LOG-01`, `MATH-FINITE-01`,
   `MATH-NONFINITE-INPUT-01`, and `MATH-MEASUREMENT-DIM-01`.
   Assert exact diagnostic identity/message and source location.
4. Run Measurement fixtures and regression cases:
   `MEAS-STDLIB-VALID-01`, `MEAS-COMPAT-01`,
   `MEAS-EMPTY-MEAN-01`, `MEAS-EMPTY-MIN-01`,
   `MEAS-EMPTY-MAX-01`, `MATH-SQRT-REGRESSION-01`, and
   `MATH-SQRT-MEAS-REGRESSION-01`. Assert numeric value, runtime type,
   displayed unit, and error behavior.
5. Run `bun run build` and `git diff --check`. Capture generated outputs
   and initial failures/retries separately. The full root, extension, and
   desktop integrated acceptance suite remains owned by Sprint 089 unless
   separately authorized.

## Notes

Sprint 086 extends existing shared runtime/type-checking behavior and
Measurement support. It does not take ownership of `is` maintenance or any
text, formatting, editor, example, or release feature.
