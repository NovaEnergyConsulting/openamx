# Sprint 116 Blueprint: V0.19 Chart AST, Parsing, Checking, and Evaluation

## Approach

1. Recheck the accepted Sprint 115 disposition and the individual accepted
   decisions D115-01, D115-02, D115-03, and D115-09, plus the exact execution
   commit, worktree state, output roots, and preservation baseline. Obtain
   separate Sprint 116 authorization and an exact source/test file plan before
   the first production edit.
2. Add one expression-bearing chart option node to `src/ast/types.ts`. Follow
   the existing visualization-option union and retain the option, expression,
   and any keyword/expression source needed by downstream diagnostics.
3. Extend `parseVisualization` with an option-specific `showTable` branch before
   its generic invalid-option failure. Recognize the keyword only in chart
   blocks, require nonempty same-line text after whitespace, and pass the
   remainder to the ordinary expression parser with its original line/column.
4. Extend `checkChart` in one place before any numeric/record/scatter branch
   returns. Allow the new option only for charts, detect a second occurrence
   with existing `oneOption` behavior, and infer/require exactly `Boolean`.
5. Preserve ordinary expression typing and diagnostics. Do not duplicate
   identifier/call/operator validation or reinterpret nullable Boolean/Number as
   Boolean.
6. Extend `snapshotView` to resolve the option at the existing `show` snapshot
   point. Omitted means false; a present expression is evaluated exactly once,
   verified as a runtime Boolean, and stored in the frozen chart emission.
7. Add a required resolved Boolean to `ChartViewEmission` and `ChartViewModel`.
   `createChartViewModel` copies the emission value; it does not retain/evaluate
   the AST expression and does not alter table/accessibility construction.
8. Add focused parser/checker/evaluator/formatter/model regressions. Include
   literal, omitted, identifier, computed, dynamic reassignment, malformed,
   invalid type, table misuse, and duplicate cases. Assert the renderer staging
   boundary: internal table data still exists in S116 when resolved visibility
   is false.
9. Run the separately approved focused test selection, no-emit typecheck, and
   `git diff --check`; inspect changed paths and record all retries/unavailable
   checks. Request a separate Sprint 116 disposition.

## Implementation Decisions

| ID | Topic | S116 technical disposition |
| --- | --- | --- |
| D116-01 | AST shape | Add `ChartShowTableOptionNode` with discriminant `chartShowTableOption`, `expression: V02ExpressionNode`, and `source`; the expression owns its own expression start source. |
| D116-02 | Parser source | Keyword branch uses the remainder of its source line. Expression column is the 1-based column of the first non-whitespace character after `showTable`; trailing whitespace is excluded from parsed expression text. |
| D116-03 | Duplicate phase | Parser retains all recognized `chartShowTableOption` nodes in source order. `checkChart` rejects the second with `AMX3005`, preserving the accepted S115 phase and anchor. |
| D116-04 | Runtime exactness | Evaluation result must be `typeof value === 'boolean'`. A non-Boolean value at runtime is an AMX3002 mismatch rather than truthiness; ordinary static checking should catch source cases first. |
| D116-05 | Emission/model default | `ChartViewEmission.showTable` and `ChartViewModel.showTable` are required Boolean fields. Omission resolves to false before emission; downstream consumers never see an optional/undefined field. |
| D116-06 | Staging boundary | `createChartViewModel` still builds and exposes the table plus existing accessibility table reference in S116 even for false. S119 alone controls renderer/output omission. |
| D116-07 | Formatter | Existing generic line formatter is expected to preserve `showTable` expression text after indentation; modify formatter production only if a focused test demonstrates a real failure. |

## Source Baseline To Verify

- The current `VisualizationOptionNode` union contains title, description,
  table-column, chart-field, and chart-series nodes; `showTable` is absent.
- `parseVisualization` processes chart options line by line and currently
  reports unknown/malformed lines through the invalid visualization-option
  path. `parseExpression` is already the shared expression parser.
- `checkChart` validates common options before data-shape branches and uses
  `oneOption`, `optionsOf`, and `AMX3005` duplicate behavior.
- A `showStatement` snapshots a registered view through `snapshotView`; that is
  the correct point to evaluate a declaration expression against the current
  environment.
- `ChartViewEmission` currently lacks visibility metadata;
  `createChartViewModel` always builds a table and accessibility table link.
- The formatter canonicalizes indentation as line text rather than rebuilding
  visualization declarations; accepted `showTable` syntax should remain
  stable without new formatter architecture.

These observations constrain implementation but do not reopen accepted S115
product decisions.

## Candidate File Plan

Production candidates, subject to separate execution approval:

- `src/ast/types.ts`
- `src/parser/parseStatements.ts`
- `src/typechecker/checkDocument.ts`
- `src/runtime/environment.ts`
- `src/runtime/evaluateExpression.ts`
- `src/renderer/chartModel.ts`
- `src/formatter/formatAmx.ts` only on demonstrated failure

Focused test candidates:

- `tests/parser.test.ts`
- `tests/evaluator.test.ts`
- `tests/formatter.test.ts`
- `tests/chartModel.test.ts`

No renderer, editor, example, specification, SI, affine, package, or release
path is approved by this package.

## Verification Candidates

Run only commands approved in the Sprint 116 execution plan. The expected
focused selection is a subset/combination of:

```text
bun test tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/chartModel.test.ts
bunx tsc --noEmit
git diff --check
git status --short
```

Verify complete AMX documents, exact diagnostic codes/messages, expression
and option source ranges, repeated `show` snapshots, formatter round trips,
and unchanged plot/table internal model behavior. Do not use broader renderer,
editor, build, release, or platform commands as a substitute for focused S116
acceptance.

## Stop Conditions

- Any ambiguity that changes the accepted `showTable` syntax, Boolean typing,
  evaluation timing, omitted default, or output ownership requires a new Lead
  Developer/product-owner decision before implementation continues.
- A required renderer/accessibility change is a scope amendment or S119 work;
  it is not a local fix for Sprint 116.
- A need to evaluate the AST in `chartModel` or a renderer violates the shared
  resolved-value boundary and must stop for contract review.
- A missing expression diagnostic cannot be assigned a guessed code/message;
  follow the accepted existing parser family and allocator policy.
- Any additional production/test path outside the approved execution plan
  requires explicit scope amendment before editing.
