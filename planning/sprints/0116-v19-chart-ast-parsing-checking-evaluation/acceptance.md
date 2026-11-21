# Sprint 116 Acceptance Criteria

Sprint 116 is complete only when `showTable` flows from source AST through
checking and one-time emission evaluation into the shared chart model, all
approved focused cases execute, and a separate product-owner disposition is
recorded. The sprint must preserve renderer behavior for S119 staging.

## Entry and Authority

- Sprint 115 is verified ACCEPTED/CLOSED on 2026-11-21; D115-01, D115-02,
  D115-03, and D115-09 are applied without reopening language decisions.
- Separate Sprint 116 execution authorization records the exact baseline,
  approved files, commands, generated-output preservation, and evidence roots.
- No production/test file outside the approved plan is changed without an exact
  scope amendment.

## AST and Parsing

- Bar, column, line, and scatter charts accept `showTable <expression>`.
- The AST retains a typed `chartShowTableOption` with the ordinary expression and
  complete option/expression source locations.
- The expression is the nonempty remainder of one line; `showTable:` and
  missing/malformed tails reject through the accepted parse family.
- Table declarations do not accept the option; all existing visualization
  options remain valid and source ordered.

## Checking and Diagnostics

- Duplicate options use `AMX3005` at the second option.
- A present expression must infer exactly `Boolean`; Number, String, nullable
  Boolean, record/list, and Measurement inputs produce `AMX3002` at the
  expression.
- Unknown names and ordinary expression/operator/call diagnostics retain their
  existing identities and narrow source ranges.
- Omission is valid and defaults to false without requiring an AST mutation or
  user-authored literal.
- Existing chart shape, field, series, and table-option behavior remains
  unchanged.

## Evaluation and Emission

- A present expression is evaluated exactly once per chart emission at the
  existing `show` snapshot point.
- Two `show` statements over one declaration may resolve to different values
  after a legal binding reassignment.
- The runtime defensively requires a Boolean result and does not apply
  truthiness coercion.
- `ChartViewEmission.showTable` is a required Boolean with omitted syntax
  represented as false.
- Emission data, labels, headings, measurement descriptors, document/statement
  indexes, immutability, and frozen snapshots remain unchanged except for the
  resolved field.

## Shared Model

- `ChartViewModel.showTable` is a required Boolean copied from the emission.
- Shared model construction does not evaluate or parse the AST expression.
- Plot option, series, axes, table, tooltip, plotted-point count, accessibility,
  measurement display, and frozen behavior remain unchanged in S116.
- When resolved false, the S116 model still has the existing internal table and
  `accessibility.tableId`; any expectation of output omission is deferred.

## Formatter and Regressions

- Focused parse-format-parse fixtures preserve the option, expression shape,
  option order, indentation, LF/CRLF style, and exact text required by the
  core formatter contract.
- Focused parser, checker, evaluator, formatter, chart-model, and relevant
  no-emit typecheck selection passes as recorded by the approved plan.
- No unexplained test skip, retry, changed baseline, broadened scope, or raw
  failure is converted to PASS.

## Boundaries and Closeout

- No HTML/PDF/DOCX/browser JSON/accessibility-output omission change occurs.
- No VS Code/desktop editor integration, V0.19 specification/example/migration,
  SI library, affine runtime, package/version, release, or certification work
  occurs.
- Every S115 CHT case assigned to S116 maps to evidence in the test matrix;
  S119-only rows remain explicit NOT RUN/OUT OF SCOPE.
- `builder-evidence.md` records exact baseline, commands, raw outcomes,
  changed-path inventory, diagnostic source ranges, limitations, and residuals.
- A separate product-owner disposition accepts/closes or blocks/opens S116.
  The Builder recommendation alone does not authorize S119 or release work.
