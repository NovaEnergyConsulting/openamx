# Sprint 115 Contract: Chart `showTable` and Rendering

## Status

Architect-prepared candidate contract. Confirmed V0.19 master-plan decisions are
fixed scope. The parser-shape, evaluation-point, model, diagnostic, and output
refinements below are pending the separate Sprint 115 disposition.

## Syntax

`showTable` is an optional chart-block option:

```ebnf
ChartOption ::= ExistingChartOption | ShowTableOption
ShowTableOption ::= "showTable" ChartExpression
ChartExpression ::= one nonempty expression written on the option line
```

Examples:

```amx
chart omitted = column(values) {
  title: "Existing V0.18 table behavior is changed by omission"
  series value as "Value"
}

chart explicitFalse = column(values) {
  showTable false
  title: "No table"
  series value as "Value"
}

chart explicitTrue = column(values) {
  showTable true
  title: "Table retained"
  series value as "Value"
}

chart expressionControlled = column(values) {
  showTable threshold >= 10 and enabled
  title: "Dynamic table visibility"
  series value as "Value"
}
```

- `showTable:` is invalid; V0.19 intentionally does not reuse title/description
  colon syntax.
- The expression starts after the `showTable` keyword and extends through the
  end of the option line. Leading/trailing whitespace is insignificant.
- The normal AMX expression grammar applies, including identifiers, calls,
  comparisons, Boolean operators, conditionals, and parentheses allowed in an
  existing expression context.
- The parser retains the expression AST and source locations for the option,
  expression, and any expression-local diagnostics.
- The option is accepted by bar, column, line, and scatter charts. It is not a
  table-declaration option.

## Typing and Environment

- A present expression must have static type exactly `Boolean`. Nullable
  `Boolean?`, Number, String, lists, records, enums, and Measurement values do
  not satisfy the contract, including cases where a runtime value happens to
  be truthy/falsey.
- Names resolve in the chart declaration's ordinary visible environment using
  established declaration order and module/import rules. There is no chart-only
  scope, literal-only evaluator, hidden closure, or separate constant system.
- A call or compound expression follows ordinary purity/type behavior and may
  fail with the ordinary expression diagnostic. Chart-specific checking does
  not erase or replace that diagnostic.
- A duplicate `showTable` option is a static chart-option error. The second
  occurrence is the primary source anchor.
- Omitted `showTable` has resolved value `false`. A present expression is never
  inferred from truthiness or from an existing data/rendering condition.

## Evaluation Timing

Current chart declarations are registered as definitions, then a chart
emission is created at an existing `show` statement. Sprint 115 adopts that
normal snapshot point as evaluation timing:

1. Resolve the chart binding and normalize its data exactly as today.
2. Evaluate the present `showTable` expression exactly once in the environment
   current at that `show` point.
3. Store the resolved Boolean in the chart emission.
4. Copy the Boolean into the shared chart view model.
5. Let interactive HTML/preview, PDF, and DOCX consume that same field.

Showing the same declaration twice can therefore produce a distinct visibility
result if an intervening legal reassignment changed an expression binding.
Renderers do not evaluate the AST again, and each output surface must agree for
one prepared report snapshot.

## Shared Model Contract

The runtime `ChartViewEmission` and shared chart view model shall each carry a
resolved, read-only `showTable: boolean` field. Candidate downstream names:

```text
ChartViewEmission.showTable: boolean
ChartViewModel.showTable: boolean
```

Names may be adjusted during implementation if a neighboring convention is
clearer, but there must remain one resolved Boolean from emission to renderer.
The existing source-data, measurement descriptors, chart options, plot model,
headings, rows, and table contents are not recomputed differently for hidden
tables.

The internal table model may still be constructed for model consistency and
future consumers, but output surfaces must consult `showTable` before emitting
markup/content or table-specific serialized metadata. False is an output
omission rule, not a reason to skip chart normalization or silently alter
plotted data. The browser chart payload may retain the plotted `option` needed
by ECharts, but it must omit `table`, `tableId`, table caption/headings/rows,
and any added alternate table representation when visibility is false.

The accessibility model carries `tableId` only while a table is emitted. Its
summary names a complete-data table only in that state. When the table is
omitted, accessibility describes the chart and its row/point counts without a
reference to nonexistent table content.

## Output Omission

When resolved `showTable` is `false` or omitted:

- Interactive HTML and preview emit the chart visualization but no table
  element, caption, heading row, body row, table link, CSS-hidden table, or
  serialized table property in chart JSON.
- PDF and DOCX emit the chart visualization but no corresponding chart data
  table, repeated heading, caption, or alternate table image.
- No screen-reader-only table, visually hidden duplicate, alternate data JSON,
  embedded table image, or serialized fallback is added for the hidden table.
- Chart source data still exists in the runtime/model for plotting and normal
  diagnostics; “emit no table” does not erase the source value. Data required by
  the plot itself is not a table fallback.
- Accessibility metadata must describe the chart without `tableId`, table
  caption text, or a reference to a table that is absent. When `showTable` is
  true, the existing table-linked accessibility behavior is preserved.

When resolved `showTable` is `true`, chart plot and existing table contents,
headings, null behavior, source order, measurement display, title, and
caption are preserved. The V0.19 intentional breaking change is only the
omitted default: V0.18 charts that relied on an implicit table must add
`showTable true` during migration.

## Diagnostics

The detailed code/anchor policy is in `diagnostic-matrix.md`. Minimum cases:

- malformed/missing expression: parse-time option diagnostic at the offending
  token or option source;
- non-Boolean expression: existing AMX type-mismatch family at the expression;
- duplicate option: existing repeated-option identity at the second option;
- option on a table: existing invalid-option diagnostic at the option;
- unknown identifier or invalid ordinary expression: preserve the ordinary
  expression diagnostic and source, without wrapping it as a chart-only code.

## Compatibility and Exclusions

- Chart kinds, required field options, series order, table row/headings/null
  behavior, plotted data, axes, and measurement normalization remain unchanged
  except where affine conversion changes physical values in later sprints.
- The default change is intentional and does not depend on output format.
- CSS-hidden tables, alternate table markup, and new accessibility data
  formats are excluded.
- This contract does not authorize parser, checker, evaluator, renderer,
  editor, specification, example, release, or package work.
