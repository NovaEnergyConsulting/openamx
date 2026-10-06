# Sprint 056 Blueprint: Measurement Expressions, Arithmetic, and Conversion

## Approach

1. Confirm Sprint 055 **COMPLETE / APPROVED** and read its evidence and public registry interface. Verify actual declaration/unit metadata is consumable through the module graph; preserve its Windows VS Code host residual as unpassed. Review Sprint 053/054 evidence for integration context only; neither is a Sprint 056 dependency.
2. Read the approved measurement and precedence contracts in the V0.9 spec and Sprint 051 blueprint. Inventory current AST expressions/types, runtime value representation, numeric operator implementation, standard-library functions, type inference/assignment/function/record/list handling, formatter, interpolation AST/evaluator from Sprint 053, and editor analysis.
3. Define a measurement runtime value that preserves (a) numeric value in the chosen display unit, (b) unit scale/identity, and (c) dimension vector from Sprint 055. Keep the value immutable/snapshot-safe. Clearly separate normalized physical value from display value; do not store only a bare canonical number and lose the selected display unit.
4. Implement and test parsing using the approved grammar:
   - attachment is allowed only after numeric literal, numeric identifier, or parenthesized numeric expression and a declared unit name
   - no arbitrary juxtaposition or compound-unit suffix is introduced
   - `measurement in unitName` consumes a visible declared name and is conversion, while `for x in iterable` remains the existing loop construct
   - honor approved precedence examples, including `2 meter ^ 2`, `-2 meter`, `(2 ^ 2) meter`, `1 + 2 meter`, and parenthesized conversion.
5. Extend type checking using Sprint 055 dimension vectors and registered unit metadata. Support measurement annotations/inference and metadata through assignments, parameters/results, records/defaults, lists, and nullable values. Reject incompatible or unsupported operations with `AMX3007`; reject invalid visible unit/declaration use with `AMX3008`; do not silently erase measurement type.
6. Implement arithmetic using physical-value/scale-correct formulas:
   - addition/subtraction convert the right side to the left display unit and preserve that unit
   - comparisons normalize physical values after checking vector compatibility
   - multiplication/division compose scales and exponents; a zero vector returns a correctly scaled Number
   - unary minus preserves unit; powers accept only approved signed integer-literal exponents, including zero/negative
   - detect divide-by-zero/non-finite results; use approved `AMX1009` dynamically and `AMX3010` when statically provable under the approved checker boundary.
7. Implement `sum`, `mean`, `min`, `max`, `abs`, `round`, `sqrt`, and `pow` measurement behavior exactly. Preserve empty aggregate errors except typed empty measurement `sum`, which returns zero in the canonical independent base-unit expression. Verify first/selected/current display-unit rules directly.
8. Integrate measurement text conversion in the Sprint 053 interpolated-string evaluator/type checker. String, Number, Boolean, null conversion remains unchanged; measurement text uses displayed numeric value plus current unit expression. Reject lists/records. Preserve escaped/interpolation behavior, source ranges, pure-expression restrictions, narrative interpolation, and inert-fence boundaries.
9. Propagate measurement metadata through existing generic assignments/functions/records/lists/nullables and immutable view snapshots. Do not implement JSON/CSV, tables/charts, or report output beyond ensuring existing scalar text seams can represent the value as required for interpolation.
10. Add focused parser/AST/typechecker/evaluator/stdlib/interpolation/editor tests, including all approved Sprint 051 conformance rows and negative/error cases. Cover incompatible independent dimensions, scale cancellation, display units, domains, and metadata survival through each stated type/container.
11. Run Sprint 055/Sprint 053/Sprint 054 regression suites, focused measurement tests, root build and tests, and affected desktop/extension checks. Track actual Windows host/RPC statuses and do not relabel residual failures as passes. Run `git diff --check`.
12. Update Sprint 056 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with the design/representation actually implemented, tested formulas, commands/outcomes, residuals, and a request for separate Lead Developer disposition.

## Files to Update

- AST/parser/type checker/runtime values/evaluator/standard library as directly required
- Measurement display/interpolation integration in existing string type checker/evaluator
- Focused tests and minimal approved examples required for coverage
- `planning/sprints/0056-v09-measurement-expressions-arithmetic-conversion/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

Do not implement external data/reporting or broad editor/docs work assigned to Sprints 057-058.

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| Attachment | `10 meter`, `value meter`, and `(a + b) meter` attach only when target unit is visible and receiver form is approved. |
| Precedence | Approved Sprint 051 grouping cases parse exactly; loop `in` remains unchanged. |
| Conversion | `(1 kilometer + 500 meter) in meter` returns measurement `1500 meter`, same physical value/dimension. |
| Addition/subtraction | Compatible units preserve left display unit; incompatible dimension/Number mixing rejects. |
| Comparison | Compatible measurements compare normalized physical values; incompatible dimensions/Number reject. |
| Multiplication/division | Compose vectors/scales correctly; `10 meter / 2 meter` is Number 5; `1 kilometer / 500 meter` is Number 2. |
| Powers/roots | Signed literal powers work for zero/positive/negative integer exponents; `sqrt` only succeeds for integer resulting exponents. |
| Functions | Aggregates, `abs`, `round`, `sqrt`, `pow`, empty typed sum, and existing empty errors follow the exact approved display-unit rules. |
| Type/container metadata | Measurement meaning survives functions, assignments, record fields/defaults, lists, and nullables. |
| String interpolation | Sprint 053 interpolation displays a measurement as displayed numeric value plus its unit; scalar behavior and narrative semantics remain unchanged. |
| Numeric domains | Division by zero and non-finite results fail explicitly; static diagnostics are used only when provable. |

## Verification

- Focused measurement parser/typechecker/evaluator/stdlib/interpolation tests.
- Regression tests from Sprints 052-055 relevant to parser, module registry, strings, lists, and type checking.
- Root `bun run build` and appropriate root tests; affected desktop and extension checks where feasible.
- Exact physical/display values, vector compatibility, arithmetic scale conversion, and diagnostic codes/locations must be asserted.
- Record failed or unavailable Windows host/RPC suites as unpassed residuals; `git diff --check`.

## Notes

- Sprint 055 identity and unit metadata are authoritative; do not duplicate identity logic or broaden SI inventory.
- Sprint 053 implementation intentionally rejected measurements as interpolation values because measurement values did not yet exist. Sprint 056 now owns that integration/regression.
- Sprint 057 consumes the resulting value/type/registry surfaces for JSON/CSV, schemas, tables, charts, and reports. Avoid defining a competing serialization contract here.
