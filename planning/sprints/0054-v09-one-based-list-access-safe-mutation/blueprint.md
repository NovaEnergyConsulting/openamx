# Sprint 054 Blueprint: 1-Based List Access and Safe Shared Mutation

## Approach

1. Confirm Sprint 052's **ACCEPTED WITH RECORDED RESIDUALS** disposition and read its evidence. Sprint 053 is accepted but is not a dependency; preserve its Windows VS Code host result of 13 pass/6 fail as unpassed and do not conflate it with Sprint 054 results.
2. Read the approved language contract and Sprint 051 list conformance/diagnostic/static-boundary contracts. Audit AST expression and statement unions, expression and statement/loop parsing, type checking, runtime list storage/aliasing, import immutability, pure contexts, formatter, editor analysis, diagnostics, and view snapshot creation.
3. Define the implementation/test matrix before editing:
   - 1-based literal/computed read, element type, chaining, and boundaries.
   - Append/insert positions and element typing.
   - Removal with `at`, removal without `at` (validate positive count but remove exactly one), and empty-list behavior.
   - Static-provable versus dynamic validation, explicit diagnostics, and original source locations.
   - Alias sharing, imported/nested alias immutability, mutation atomicity, pure-function restrictions, loop snapshots, and emitted-view isolation.
4. Extend the AST/parser for postfix index reads and statement-form `add`/`remove`. Preserve existing expression precedence and loop parsing. Restrict mutation grammar to a named list binding, with optional `at` index expression, and reject expression-call or arbitrary field/index mutation forms.
5. Extend static type checking for index receiver/type and element result, mutation target/list/value types, positive constants where the approved syntax-directed evaluator can prove them, and statically known literal bounds. Use `AMX3009` only for statically provable bounds/interval errors; leave dynamic values for runtime.
6. Implement runtime indexing and mutations with 1-based-to-host indexing conversion at the boundary. Validate types, integer/finite constraints, index/count, current length, complete removal interval, import mutability, and element compatibility before changing storage. Fail with `AMX1008` for dynamic invalid positions/counts or immutable mutation. Guarantee no partial mutation on any failure.
7. Preserve mutable local list identity so aliases see committed changes. Track/protect immutability through nested imported lists and aliases, including attempted indirect mutation. Do not change the behavior of unrelated values.
8. In statement-form list loops, iterate a snapshot of original values. Test that removing the current/other item or appending while looping does not skip/revisit/add loop iterations; preserve order and original element values.
9. Verify view emission snapshots list contents at emission time. Mutating the live source afterward must not mutate previously emitted views or report output.
10. Add directly relevant formatter/editor support for bracket reads and `add`/`remove` statements, stable diagnostics, completions/highlighting only where supported by existing client patterns, and no coloring/diagnostics in narrative or inert fences.
11. Add focused parser/typechecker/runtime/module/formatter/editor/CLI/desktop regressions. Cover LF/CRLF source locations, dynamic runtime failures, alias/import safety, no partial mutation, loop snapshots, and view isolation. Preserve existing list/range behavior outside the approved changes.
12. Run focused tests, root `bun run build` and relevant root suites, plus affected desktop/extension checks as available; explicitly report host failures/unavailable checks and the Sprint 052/053 Windows Extension Development Host residuals without marking those suites green. Run `git diff --check`.
13. Update Sprint 054 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with exact implementation/test results, migration, remaining issues, and a requested Lead Developer disposition. Do not self-accept.

## Files to Update

- AST/parser, type checker, runtime/evaluator/environment, diagnostics, formatter, and shared/editor surfaces as directly required
- Focused tests and only relevant positive fixtures/examples
- `planning/sprints/0054-v09-one-based-list-access-safe-mutation/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

Do not implement dimensions/units or other Sprint 055-058 work.

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| 1-based read | `[10, 20][1]` is `10`, `[10, 20][2]` is `20`, and element type is preserved. |
| Computed/chained read | Expression-computed indexes and valid field/index chains return the correct typed value. |
| Invalid read | Zero, negative, fractional, non-finite, wrong-type, and out-of-range indexes fail statically only when safely provable; otherwise fail at runtime. |
| Append/insert | `add value to xs` appends; `add value to xs at i` inserts before 1-based `i`; `length + 1` appends. |
| Remove with `at` | Remove the requested positive count from the starting 1-based position; validate the complete interval before mutation. |
| Remove without `at` | Validate a positive integer count, then remove exactly one final element regardless of magnitude. |
| Atomicity | Invalid operation leaves the original list unchanged, including aliases. |
| Alias visibility | Successful local mutation is visible through local aliases. |
| Import safety | Direct/nested/aliased imported list mutation is rejected without changes. |
| Loop snapshot | Iteration visits the original elements exactly once and in original order despite live-list mutations. |
| View snapshots | Emitted view/report data does not change after later mutation of the source list. |
| Editor/formatter | New syntax and diagnostics work on executable AMX; invalid forms have accurate source ranges; formatting remains stable. |

## Verification

- Focused parser, checker, evaluator, module, formatter, editor, CLI, and affected desktop tests.
- Root `bun run build` and relevant root test suites.
- Relevant desktop and extension compile/test/typecheck suites where affected; retain explicit failure status for Windows Development Host runs.
- Test the exact thresholds/boundaries and list outputs above, not only successful command exit.
- `git diff --check`.

Record exact commands, totals, source locations, environment, failed/skipped checks, and residuals in Builder evidence.

## Notes

- Approved static/runtime split: syntax-directed side-effect-free constants may be checked statically. Identifiers and dynamic list lengths/values are runtime-validated; no arbitrary program execution during checking.
- Approved codes: `AMX3009` for statically provable invalid 1-based index/insertion/removal interval; `AMX1008` for dynamic list operation faults and immutable-import mutation.
- No dependency on Sprint 053. Sprint 055 also depends on Sprint 052 and does not require Sprint 053/054; avoid touching its dimension/unit slice.
