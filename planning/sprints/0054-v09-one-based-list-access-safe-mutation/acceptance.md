# Sprint 054 Acceptance Criteria

Sprint 054 is complete when:

- List reads use 1-based positive-integer indices, return the statically known element type, and support expression-computed indexes and valid field/index chaining.
- Out-of-range, zero, negative, fractional, non-finite, and wrong-type reads fail explicitly. Static bounds errors are reported only when the approved safe constant rules prove them; dynamic cases are checked at runtime.
- `add value to list` appends and `add value to list at index` inserts before the 1-based position, including `length + 1` as append. Mutation targets are named list bindings and inserted values satisfy the element type.
- `remove count from list at index` removes the requested consecutive interval beginning at the 1-based position. The entire interval is validated before any mutation.
- `remove count from list` validates `count` as a positive integer, then removes exactly one final element regardless of count magnitude. Empty-list removal fails.
- Wrong operation types, invalid indexes/counts, insertion/removal overruns, non-finite/fractional values, and empty removal produce explicit diagnostics with meaningful source locations. Statically provable bounds errors use `AMX3009`; dynamic list faults and immutable mutation use `AMX1008`.
- Every operation validates fully before writing. Any failed add/remove leaves the list and all aliases byte/value-equivalent to their pre-operation contents.
- Successful local mutations preserve shared list identity; local aliases observe updated contents.
- Imported values remain immutable, including nested lists and aliases derived from imports. Indirect mutation cannot bypass protection, and failures do not partially change imported data.
- Existing pure-function restrictions remain intact.
- A statement-form loop over a mutable local list iterates a snapshot of the original elements exactly once, in original order, even when the live list is mutated during the loop.
- Views/report snapshots already emitted remain unchanged by later list mutations.
- Parser, checker, runtime, formatter, and directly affected editor paths have focused regression coverage. New syntax/diagnostics do not leak into narrative or inert fences.
- Existing non-list behavior and valid list/range behavior remain unchanged. Indexed replacement, slicing, new loop forms, and list-returning add/remove expressions are not added.
- Sprint 053 string behavior remains outside scope; its Windows host suite remains an unpassed residual. Sprint 054 does not claim completion of Sprint 053 host checks.
- Focused and applicable root, desktop, and extension checks are reported exactly. Required checks pass or exact failures/unavailable results are documented; `git diff --check` passes.
- Builder evidence and planning state/decision/question records document implementation, exact tested boundaries, outcomes, residuals, and request a separate Lead Developer disposition.

## Required Regression Set

1. First/last 1-based reads, computed reads, chained record/list reads, and inferred element type.
2. Static known invalid literal bounds and dynamic invalid bounds with correct diagnostic family/location.
3. Append; insert at first/middle/last; append via `length + 1`; reject invalid insertion point/type.
4. Removal at start/middle/end; validate full interval; test no-`at` count `1` and count `>1` each remove exactly one last item after positive-integer validation.
5. Reject wrong type, zero, negative, fractional, non-finite, overrun, and empty removal cases.
6. Prove failure atomicity and local alias visibility on successful mutation.
7. Prove imported and nested-import aliases cannot mutate values.
8. Prove loop iteration snapshots and emitted-view snapshots.
9. Preserve pure-function constraints and accurate LF/CRLF source locations.

Sprint acceptance does not certify completion of V0.9 or downstream measurement/data/reporting work.
