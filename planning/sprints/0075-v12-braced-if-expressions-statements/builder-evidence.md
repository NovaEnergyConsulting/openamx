# Sprint 075 Builder Evidence: V0.12 Braced `if` Expressions and Statements

## Authorization and Diagnostic Allocation

The Lead Developer explicitly authorized Sprint 075 and approved the concrete file-by-file plan before source or test edits.

The Lead Developer approved IF-I02 as **AMX3021**, with the exact message `Every possible path in an if expression must return a value`. The diagnostic is reported at the closing brace of the value-producing branch with a possible fallthrough path. The approval and allocation are recorded in `planning/decisions.md`.

## Files Changed

- `src/ast/types.ts` — distinct braced expression and statement nodes.
- `src/parser/parseIf.ts` — nested braced-block extraction, optional statement `else`, required expression `else`, branch statement parsing, and source locations.
- `src/parser/parseExpression.ts` and `src/parser/parseStatements.ts` — expression/statement dispatch while retaining the legacy `then/else` grammar.
- `src/typechecker/checkDocument.ts` — Boolean conditions, existing conditional-result compatibility, branch-local bindings, and explicit-return path analysis using AMX3021.
- `src/diagnostics/errors.ts` — registration of approved AMX3021.
- `src/runtime/evaluateExpression.ts` — selected-branch execution, cleanup of branch-local bindings, local expression-return capture, and preservation of expression-loop return collection.
- `tests/parser.test.ts` — fixture-derived IF-V01–IF-V06 AST coverage and IF-I01 source location.
- `tests/evaluator.test.ts` — fixture-derived IF-V01–IF-I05 evaluation, diagnostic, scope, outer-assignment, selected-branch, post-expression, and expression-loop checks.
- `tests/formatter.test.ts` — legacy IF-V01 formatting regression only.
- `planning/decisions.md`, `planning/questions.md`, and `planning/state.md` — approval, allocation, resolved gate, and execution status.

`tests/modules.test.ts` was run unchanged as regression coverage. No formatter implementation, environment implementation, module semantics, editor clients, language specification, examples/help, dependency manifests, or release surfaces were changed.

## Verification

| Command | Result |
|---|---|
| Initial `bun run build` | PASS — `tsc` completed successfully. |
| Initial `bun test tests\parser.test.ts tests\evaluator.test.ts` | 134 passed, 1 failed, 540 expectations. The failure exposed braced-if detection misclassifying a legacy `if ... then match ... else ...` expression; detection was corrected to exclude top-level `then`. |
| `bun test tests\parser.test.ts tests\evaluator.test.ts` after correction | PASS — 135 passed, 0 failed, 541 expectations across 2 files. |
| Final `bun test tests\parser.test.ts tests\evaluator.test.ts tests\formatter.test.ts tests\modules.test.ts` | PASS — 194 passed, 0 failed, 719 expectations across 4 files. |
| VS Code focused test runner on the same four files | PASS summary — 189 passed, 0 failed. Its count differs from Bun's; the required Bun command above is the authoritative suite result. |
| Final `bun run build` | PASS — `tsc` completed successfully. |
| First full root `bun test` | 454 passed, 2 failed, 2,487 expectations across 456 tests / 35 files. Both failures match the recorded Sprint 073–074 baseline. |
| Final full root `bun test` | 454 passed, 2 failed, 2,489 expectations across 456 tests / 35 files. Both failures match the recorded Sprint 073–074 baseline. |

Sprint 074's full-suite retry baseline was 447 passed, 2 failed, 2,441 expectations across 449 tests / 35 files. The final Sprint 075 run adds seven tests and 48 expectations; the two existing failures remain unchanged:

- `tests/editor.test.ts:73` — imported dimension/unit symbol identity assertion.
- `tests/examples.test.ts:43` — README/specification/help documentation assertion.

The initial Sprint 075 parser/evaluator failure was caused by the first braced-`if` detector treating a legacy `then match` expression's match braces as an `if` block. The detector now requires that the candidate condition contain no top-level `then`; the focused suites and final full-suite rerun pass apart from the two inherited failures above. No failure is omitted or represented as a pass.

## Acceptance Evidence and Residuals

- IF-V01 legacy parsing, evaluation, and formatting are retained.
- IF-V02 and IF-V04 cover braced expression values, nested expression returns, explicit returns on each path, expression-local scope, and execution of statements after the expression.
- IF-V05 verifies the unselected `sqrt(-1)` runtime-error branch is not evaluated.
- IF-V03 and IF-V06 cover statement forms with and without `else`, branch-local declarations, persistent outer assignments, and selected-branch-only mutation.
- IF-I01 uses AMX3006 at the fixture's `if` token; IF-I02 uses approved AMX3021 at the fallthrough branch's closing brace; IF-I03 uses AMX3001 for the escaped branch local; IF-I04 uses AMX3002 for a non-Boolean condition; and IF-I05 uses AMX3002 for incompatible conditional branch values. Tests assert the fixture line and column values.
- Expression-local returns are captured by the conditional expression; an expression-loop regression verifies they do not terminate the enclosing loop. Existing expression-loop behavior remains covered by the focused evaluator suite.
- Sprint 073 record inheritance and Sprint 074 enumerations pass in the required focused and full-suite regression runs.
- No Sprint 075 acceptance item remains blocked. The full root suite retains only the two inherited failures listed above.
