# Sprint 056 Acceptance Criteria

Sprint 056 is complete when:

- Measurement attachment parses only for approved operand forms and visible declared units. Arbitrary juxtaposition and compound suffixes are rejected; conversion target syntax is a declared visible unit name.
- Parsing/typing follows the exact Sprint 051 precedence and grouping rules, including unary/power behavior, conversion vs arithmetic, indexing precedence where it exists, and loop-header `in`.
- Measurement values carry both physical meaning and display-unit metadata. Sprint 055's base identities/vectors/unit scales are reused; independent same-name dimensions remain incompatible.
- Addition/subtraction accept only compatible measurements and preserve the left operand's display unit. Comparison/equality use normalized physical values and reject incompatible or Number-mixed operands.
- Multiplication/division correctly compose dimension vectors and numeric scales. Number operands are allowed for multiplication/division. Full dimension cancellation returns an ordinary Number with the correctly composed scale ratio.
- Unary minus preserves units. Dimensional powers accept only approved signed integer-literal exponents, including zero and negative exponents. `sqrt` succeeds only when resulting exponents remain integers and numeric-domain checks pass.
- `measurement in unit` returns a measurement in the requested compatible display unit, preserving physical value and dimension; it never returns a bare Number.
- `sum`/`mean` use the first element's display unit; `min`/`max` return the selected element with its own unit; `abs` preserves unit; `round` rounds in the current display unit; `pow` and `sqrt` meet the approved semantics.
- A statically typed empty measurement list sums to zero in its canonical base-unit expression. Empty `min`/`max`/`mean` retain the existing error behavior.
- Measurement type/metadata survives inferred and annotated variables, assignment, typed functions/returns, record fields/defaults, lists, and nullable values without unit erasure.
- Sprint 053 interpolated strings accept measurements and format them as the current displayed number followed by the selected unit text. String/Number/Boolean/null formatting, single-quote behavior, escapes, source mapping, narrative interpolation, and inert-fence boundaries remain unchanged. Collection interpolation remains rejected.
- Static checking follows the approved syntax-directed boundary. Statically provable invalid dimensions/operators/domains are rejected with approved codes; dynamic divide-by-zero/non-finite measurement arithmetic fails explicitly at runtime. No arbitrary program execution is added to static checking.
- Approved diagnostics are used consistently: `AMX3007` for static incompatible/unsupported dimensional operations, `AMX3008` for invalid/invisible declarations/units as applicable, `AMX3010` for statically provable numeric/unit-domain faults, and `AMX1009` for dynamic measurement arithmetic domain failures. Original source locations are preserved.
- External JSON/CSV measurement loading, serialization, tables/charts, report generation, and broad editor parity are not claimed; they remain Sprint 057/058 work.
- Focused tests assert exact parse grouping, values, types, scales, display units, and errors. Root build/tests and affected desktop/extension checks are reported accurately; failed/unavailable Windows residuals remain unpassed. `git diff --check` passes.
- Builder evidence and planning status/decisions/questions document actual implementation, Sprint 053 measurement interpolation integration, commands/results, residuals, and a separate Lead Developer disposition request.

## Required Regression Set

1. Attach units to numeric literals, numeric identifiers, and parenthesized arithmetic; reject unsupported juxtaposition/targets.
2. Verify every approved precedence/grouping case from Sprint 051 and loop-vs-conversion parsing.
3. Convert compatible values without changing physical value/dimension; reject incompatible targets.
4. Test addition/subtraction left display unit and comparisons by normalized physical value.
5. Test multiplication/division, Number operands, correct scale in cancellation, and incompatible operations.
6. Test unary minus, positive/zero/negative literal powers, invalid non-literal dimensional powers, and valid/invalid `sqrt`.
7. Test exact aggregate/math behavior, typed empty sum canonical unit, and empty aggregate errors.
8. Test metadata through function calls/results, records/defaults, assignments, lists, and nullables.
9. Test measurement interpolation text and ensure existing scalar interpolation/narrative behavior remains stable.
10. Test statically provable and dynamic division/non-finite failures with approved diagnostics and source locations.

Sprint acceptance does not establish external data/reporting or integrated V0.9 completion.
