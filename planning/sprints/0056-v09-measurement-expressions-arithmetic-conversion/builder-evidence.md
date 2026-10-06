# Sprint 056 Builder Evidence

Date: 2026-10-06

## Outcome

Implemented measurement values, attachment/conversion, static typing, scale-aware operations and math, data-independent metadata propagation, and Sprint 053 measurement interpolation using Sprint 055's approved declaration metadata and registry. The Lead Developer accepted Sprint 056 as **COMPLETE / APPROVED** on 2026-10-06. This disposition applies to Sprint 056 only; it does not claim Sprint 057/058 or integrated V0.9 completion.

## Implementation

- Added measurement attachment and conversion AST nodes. Attachment is parsed from a Number literal, identifier, or parenthesized expression; conversion takes a direct identifier target. The parser preserves the approved unary/power/arithmetic/comparison precedence, keeps loop-header `in` separate, and records unit/operator source locations.
- Added a frozen runtime measurement representation containing a displayed numeric value and a unit descriptor (scale, Sprint 055 dimension vector, declared/compound factors, and display text). Physical value is `value * unit.scale`; no Sprint 055 identity, unit scale, SI entry, or visibility rule was redefined.
- Measurement types are normalized vectors keyed by Sprint 055 base identity. Annotations, inference, assignment, function parameters/results, record fields/defaults, lists, nullables, and conditionals preserve vector meaning. Incompatible dimensional operations and unsupported Number mixing are rejected with `AMX3007`; unknown/invisible units use `AMX3008`.
- Addition/subtraction convert through physical values and preserve the left display unit. Comparisons use physical values. Multiplication/division compose unit scales, factors, and vectors; cancellation returns Number with the correctly scaled result. Unary minus retains the unit. Measurement powers and `pow` require signed integer-literal exponents; `sqrt` requires even dimension exponents.
- Added `AMX3010` for statically provable measurement arithmetic/domain faults and `AMX1009` for runtime measurement domain faults, including original operator/call locations. Unsupported runtime measurements do not get converted into successful scalar values.
- `sum`/`mean` use the first element's unit, `min`/`max` return the selected measurement, `abs`/`round` preserve the current unit, and typed empty measurement `sum` uses Sprint 055's canonical independent base units. Empty `min`/`max`/`mean` retain `AMX2004`.
- Sprint 053 string interpolation accepts a measurement and emits displayed numeric text followed by the selected unit expression; String/Number/Boolean/null behavior and narrative interpolation were not changed.
- Added expression traversal for measurement nodes in shared editor symbols, highlighting, completion, and VS Code navigation type text. No broad editor parity work was undertaken.
- External JSON/CSV measurement serialization/loading, tables/charts/reports, offset/arbitrary units, and broad Sprint 058 parity remain out of scope.

## Changed Files

- `src/ast/types.ts`
- `src/diagnostics/errors.ts`
- `src/editor/completion.ts`
- `src/editor/highlighting.ts`
- `src/editor/symbols.ts`
- `src/parser/parseExpression.ts`
- `src/runtime/environment.ts`
- `src/runtime/evaluateDocument.ts`
- `src/runtime/evaluateExpression.ts`
- `src/runtime/measurement.ts`
- `src/runtime/moduleLoader.ts`
- `src/runtime/outputData.ts` (measurement type description only; serialization is not implemented)
- `src/typechecker/checkDocument.ts`
- `src/typechecker/dimensionTypes.ts`
- `tests/measurements.test.ts`
- `vscode-extension/src/providers/navigation.ts`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/sprints/0056-v09-measurement-expressions-arithmetic-conversion/builder-evidence.md`

## Verification

| Command | Result |
| --- | --- |
| `bun run build` | Pass; TypeScript root build. |
| `bun test tests/measurements.test.ts tests/parser.test.ts tests/evaluator.test.ts tests/dimensions.test.ts tests/modules.test.ts tests/editor.test.ts` | Pass: 188 tests, 0 failures, 892 expectations across 6 files. |
| `bun test` | Pass: 364 tests, 0 failures, 1,752 expectations across 30 files. |
| `Set-Location desktop-app; bun test; if ($?) { bun run typecheck }` | Pass: 27 tests, 0 failures, 143 expectations; desktop typecheck passes. |
| `Set-Location vscode-extension; bun run test` | Extension compilation and test compilation pass. Windows Extension Development Host: 15 pass, 5 fail (four `EBUSY` temporary-directory cleanup failures and one drive-letter casing assertion). This remains an unpassed host result, matching the Sprint 055 residual; it is not a pass. |
| `git diff --check` on Sprint 056-owned paths | Pass. |
| Full-worktree `git diff --check` | Reports an extra blank line at EOF in unrelated, concurrently modified `writing/2026-10-03_Computable_Documents.md`. That user change was not modified or reverted. |

Sprint 055 remains **COMPLETE / APPROVED**. Its 15/5 Windows Extension Development Host result remains unpassed and is not upgraded by this sprint's run.

A combined desktop/extension verification invocation also observed 14 pass / 6 fail in the host suite (five `EBUSY` cleanup failures and the same drive-letter casing assertion). The isolated final rerun returned 15/5; neither host result is described as passing.

## Lead Developer Disposition

**2026-10-06: COMPLETE / APPROVED.** The Lead Developer accepted this sprint and approved it as complete. The Windows host residual and unrelated full-worktree whitespace finding remain accurately recorded; approval does not represent those checks as passing.
