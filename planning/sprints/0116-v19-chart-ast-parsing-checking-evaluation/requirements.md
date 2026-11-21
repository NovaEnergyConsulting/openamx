# Sprint 116 Requirements: V0.19 Chart AST, Parsing, Checking, and Evaluation

## Document Status and Entry Gate

Architect-prepared Sprint 116 planning package. Sprint 115 is separately
ACCEPTED/CLOSED by the product owner on 2026-11-21. Accepted decisions
D115-01 through D115-09 are the authority for this sprint; their raw
qualification boundaries and NOT RUN production results remain unchanged.

This package authorizes planning only. Obtain separate Sprint 116 execution
authorization and approval of the concrete file, command, and evidence plan
before editing production source or tests. The authorization must identify the
exact baseline commit/worktree and preservation plan.

Sprint 116 is ready for implementation only when all of the following are
true:

- the accepted Sprint 115 `language-and-rendering-contract.md`,
  `affine-model-and-operations.md`, diagnostic policy, and 68-case fixture
  inventory are treated as authoritative;
- the approved syntax remains single-line `showTable <expression>` with no
  colon, exactly one expression, and Boolean static typing;
- the execution plan accepts the S116 staging boundary: a resolved Boolean is
  carried through emission and shared model, but existing HTML/PDF/DOCX
  renderers continue to render their current tables until Sprint 119;
- no new chart-option diagnostic identity is required beyond the accepted
  existing-code policy;
- the Builder's exact source/test file plan is separately approved before
  writes begin.

## Goal

Represent `showTable` in the chart AST, parse and validate its expression,
evaluate it once for each emitted chart at the existing `show` snapshot point,
and propagate the resolved Boolean through runtime emission into the shared
chart view model. Preserve every existing chart behavior outside this new
resolved visibility field.

Sprint 116 establishes the shared chart-option contract. It does not omit chart
tables from interactive HTML, preview, PDF, or DOCX; that output work belongs
to Sprint 119.

## Accepted Sprint 115 Decisions Applied Here

- **D115-01:** `showTable` is a single-line chart option. The expression is
  the remainder of the line after the keyword; `showTable:` is invalid.
- **D115-02:** typechecking uses the chart declaration's ordinary environment;
  evaluation occurs exactly once for each emitted chart at the existing
  `show` snapshot point.
- **D115-03:** both `ChartViewEmission` and the shared chart model carry a
  resolved Boolean. Output omission and no-table accessibility behavior are
  deferred to S119; S116 does not change renderer consumption.
- **D115-09:** preserve ordinary expression diagnostics and reuse existing
  chart/type diagnostic families. `AMX3006` covers malformed syntax,
  `AMX3001` unknown names, `AMX3002` non-Boolean types, `AMX3003` table/shape
  invalid-option behavior, and `AMX3005` duplicate options. No new code is
  allocated.

## In Scope

- Add a chart-option AST node that retains a `V02ExpressionNode`, the option
  source, and expression source locations. Include it in
  `VisualizationOptionNode` so existing chart option iteration remains typed.
- Extend `parseVisualization` to recognize `showTable <expression>` for bar,
  column, line, and scatter charts. Parse the expression with the ordinary
  expression parser and preserve the expression's exact start source.
- Reject a missing expression, colon form, malformed expression tail, or use
  in a table block through the accepted parser/checker diagnostic behavior.
- Extend `checkChart` so `showTable` is an allowed chart option, is optional,
  is rejected on duplicate at the second option, and requires exactly Boolean
  static type.
- Preserve normal expression diagnostics for unknown identifiers, invalid calls,
  operators, nullable values, and other ordinary checker failures. Do not wrap
  them in a showTable-only diagnostic.
- Apply omitted default `false` and evaluate a present expression once in the
  current environment when `snapshotView` creates each chart emission.
- Add a required `showTable: boolean` field to `ChartViewEmission` and
  `ChartViewModel`; shared model construction reads the resolved emission
  field and never evaluates the AST expression itself.
- Preserve existing chart data normalization, labels, measurement descriptors,
  axes, series, table model, and accessibility model. The S116 model may still
  include and reference the existing internal table even when `showTable` is
  false.
- Add focused parser, checker, evaluator, formatter, and chart-model tests for
  omitted, false, true, identifier-based, computed-Boolean, invalid, malformed,
  and duplicate cases, including expression/environment snapshot behavior.
- Add exact diagnostic and source-location assertions for newly covered
  parser/checker cases where the existing test infrastructure supports them.

## Out of Scope

- HTML, preview, PDF, DOCX, browser-chart JSON, CSS, accessibility output, or
  static table omission. Renderers may continue to ignore the S116 field and
  emit their V0.18 table behavior until S119.
- VS Code or desktop highlighting/completion/formatting integration beyond the
  core formatter regression, published V0.19 specification, README, examples,
  migration documentation, or SI library work.
- Affine unit metadata, conversions, measurement operations, `PI`/`E` declaration
  resolution, external affine data, or any Sprint 117/Sprint 118 behavior.
- New chart kinds, chart data rules, option order semantics, rendering/style
  semantics, alternate table markup, or a second chart-specific expression
  evaluator.
- Release, publication, package/version change, deployment, installer,
  distribution, or platform certification.

## Candidate Source and Test Surfaces

The separately approved execution plan should prefer the following existing
paths and must amend scope before adding another production file:

- `src/ast/types.ts`: `ShowTableOptionNode` and the visualization option union.
- `src/parser/parseStatements.ts`: `parseVisualization` chart-option parsing.
- `src/typechecker/checkDocument.ts`: `checkChart` allowed-option, duplicate,
  and Boolean checks.
- `src/runtime/environment.ts`: required resolved Boolean on
  `ChartViewEmission`.
- `src/runtime/evaluateExpression.ts`: `snapshotView` omitted/default/evaluation
  and propagation into frozen emission.
- `src/renderer/chartModel.ts`: resolved `showTable` on shared chart model.
- `src/formatter/formatAmx.ts`: normally no behavior change; update only if a
  concrete formatter test exposes an existing generic-line limitation.
- `tests/parser.test.ts`: AST shape, option placement, malformed syntax,
  duplicate retention, and source locations.
- `tests/evaluator.test.ts`: checking and emission/evaluation snapshots,
  including repeated `show` behavior.
- `tests/formatter.test.ts`: parse-format-parse stability and expression-text
  preservation.
- `tests/chartModel.test.ts`: shared model propagation and unchanged internal
  table/plot behavior.

The Builder must not add renderer tests for table omission in Sprint 116.
S119 owns those tests.

## Required Staging Assertions

- Omitted `showTable` produces `false` in the emission and shared model.
- Literal false and true produce exact corresponding Boolean values.
- A computed Boolean is not retained as source text in the emission; the
  expression is evaluated once and the Boolean result is stored.
- Two successive `show` statements can receive different resolved values from
  the same chart declaration after a legal binding reassignment.
- Chart tables, accessibility, HTML, PDF, and DOCX behavior are not changed in
  S116. The model may still construct `table` and `accessibility.tableId` while
  `model.showTable` is false.
- The AST expression remains available for formatter/source work, but no
  renderer re-parses or re-evaluates it.

## Completion Outputs

- A separately authorized production/test implementation with exact changed
  paths and focused commands.
- A completed `builder-evidence.md` with baseline, commands, test counts,
  failures/retries, diagnostics, source ranges, raw NOT RUN checks, residuals,
  and recommendation.
- A requirement/fixture matrix showing every S116 master-plan bullet and all
  applicable Sprint 115 CHT cases traced to focused evidence.
- No renderer, editor, specification/example, SI library, affine runtime,
  release, publication, package, or platform work.
- A separate product-owner disposition. Sprint 119 remains dependent on
  accepted S116 propagation; S116 recommendation alone does not authorize it.
