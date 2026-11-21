# Sprint 116 Implementation Contract: `showTable`

## Authority

The accepted Sprint 115 chart contract is the language/product authority. This
document records the precise S116 internal representation and flow; it does
not change the V0.19 user-language behavior.

## AST Contract

Add a chart-specific option node:

```ts
export interface ChartShowTableOptionNode {
  type: 'chartShowTableOption';
  expression: V02ExpressionNode;
  source?: SourceLocation;
}
```

`VisualizationOptionNode` includes the node. `ChartDeclarationNode.options`
therefore retains all showTable occurrences in source order alongside existing
chart options.

- The `expression` AST is the ordinary expression tree. No expression string,
  pre-evaluated literal, or chart-specific evaluator is stored.
- The option `source` begins at the first non-whitespace character of the
  `showTable` line.
- The expression's existing `source` begins at the first non-whitespace token
  after the keyword. Expression-local nodes keep ordinary source locations.
- The AST does not store a defaulted Boolean. Omission is resolved in S116
  evaluation, not parser/checker mutation of the declaration.

## Parser Contract

Accepted grammar:

```ebnf
ChartShowTableOption ::= "showTable" HorizontalWhitespace ChartExpression
ChartExpression      ::= nonempty ordinary expression on the same line
```

Implementation behavior:

1. On a line whose first keyword is `showTable`, use the recognized-option
   branch before chart-only field/series parsing. This is deliberately also
   parsed inside a table declaration so `checkTable` can reject it with the
   accepted `AMX3003`/CHT-TABLE-01 static diagnostic at the option source.
2. Require at least one horizontal-whitespace character after `showTable` and
   at least one non-whitespace expression character.
3. Exclude trailing horizontal whitespace from the expression text passed to
   `parseExpression`. Do not trim meaningful leading/trailing characters
   inside string literals or parentheses.
4. Compute the expression start from the original line, so tabs/spaces before
   the expression produce the correct 1-based UTF-16 column.
5. A missing expression, `showTable:`, or malformed expression tail follows the
   ordinary parse-error family. The primary diagnostic is the option/first
   offending token and no AST node is emitted for the invalid line.
6. Multiple valid lines each create an option node. The parser does not erase or
   collapse duplicates; checker ownership remains D116-03.

The syntax is line-oriented. Multiline continuation is not added for this
option, even where another AMX construct has a collection strategy.

## Checker Contract

At the start of `checkChart`, before data-shape-specific early returns:

1. Call `oneOption(view, 'chartShowTableOption', "'showTable'", false)`.
2. Add `chartShowTableOption` to the chart allowed-type set.
3. If one option exists, infer its expression using the normal chart declaration
   environment and require type `Boolean` at the expression source.
4. Preserve normal expression inference failures before or within the Boolean
   requirement. Do not replace `AMX3001`, invalid-call arity/type, or operator
   diagnostics with a chart-specific error.
5. Let duplicate detection use the second option's `source`; the accepted
   message is `Repeated 'showTable' option` if `oneOption` is supplied the
   quoted description consistently with existing tests.
6. `checkTable` continues to allow only title/column options. A recognized
   showTable option is rejected with `AMX3003: Option is not valid for a table`.

The chart declaration is checked only in its normal module/type/binding
environment. The option cannot reference a later declaration, and it does not
receive a separate literal-only or renderer environment.

## Runtime Contract

`ChartViewEmission` must include a required field:

```ts
readonly showTable: boolean;
```

`ChartViewModel` must include the same required field:

```ts
readonly showTable: boolean;
```

During `snapshotView` for a chart:

1. Find at most one `chartShowTableOption`; static checking guarantees this for
   checked production documents.
2. If absent, resolved value is `false`.
3. If present, call the ordinary `evaluateExpression` once against the same
   environment used for the current `show` snapshot.
4. Require exact runtime Boolean (`typeof value === 'boolean'`). Do not call a
   general truthiness conversion. A defensive mismatch uses `AMX3002` at the
   expression source; ordinary source should have failed static checking.
5. Freeze the Boolean in the returned chart emission along with normalized data
   and the existing metadata.

A second `show` of the same declaration reevaluates the expression against the
then-current environment. This is evaluation-per-emission, not evaluation when
the declaration is registered and not evaluation in the renderer.

## Model Contract

`createChartViewModel` copies `emission.showTable` into the returned model.
It does not search the declaration for an option, parse expression text, or
call the evaluator.

S116 model invariants:

- `model.showTable` equals `emission.showTable` for omitted, false, true, and
  computed cases.
- `model.table` is still constructed from source data in S116.
- `model.accessibility.tableId` and the current summary/table reference remain
  unchanged in S116, including when `model.showTable` is false.
- plot option, series, axes, headings, tooltip, plotted-point count, table
  rows, and immutability remain unchanged by the new field.

S119 will consume the field for actual output omission and will amend the
output-facing accessibility contract separately. S116 must not edit renderer
conditionals as a partial substitute for that work.

## Formatter Contract

The core formatter preserves executable-block source text and applies generic
indentation. The accepted option line must format to two spaces inside a chart
block and retain its exact expression text, including parentheses and ordinary
operator spacing as authored:

```amx
chart amounts = column(values) {
  title: "Amounts"
  description: "Values"
  showTable threshold >= 10 and enabled
  series "Value"
}
```

Parse-format-parse must produce semantically equal `chartShowTableOption`
expressions. No custom option ordering is introduced. The existing option
source order is retained; formatting must not move `showTable` relative to title,
description, fields, or series options.

## Compatibility Contract

- Existing chart declarations without the option receive emission/model value
  false. This changes only the new internal visibility metadata; their current
  rendered table behavior remains unchanged in S116.
- All four chart kinds share the parser/checker/evaluation path.
- Existing tables do not acquire the option.
- Existing chart option order, chart data, labels, measurements, axes, series,
  and output behavior remain unchanged during S116.
- No renderer or browser payload reads `showTable` in this sprint. A later
  renderer change belongs to S119 and must consume the already resolved model
  field rather than duplicating expression work.
