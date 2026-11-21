# Sprint 119 Contract: Chart Table Output Omission

## Shared State

S116 provides a resolved Boolean through both `ChartViewEmission.showTable` and
`ChartViewModel.showTable`. S119 output code must consume that Boolean directly.
It must not parse `ChartDeclarationNode.options`, infer truthiness, evaluate an
expression, or establish a renderer-specific default. Omitted source syntax has
already resolved to false.

S119 does not remove the internal `ChartViewModel.table`. Plot construction,
normalized source values, chart option data, headings, and existing true-table
behavior continue to use it. The internal table is not permission to emit table
markup or table-specific data when false.

## HTML and Preview

For a chart with `showTable: true`:

- preserve the chart figure, plot, title, description, summary, controls, legend,
  existing `<table class="openamx-chart-data">`, caption, headings, body rows,
  table ID, and table-accessibility reference;
- preserve the existing browser JSON fields, including table data required by
  current chart formatting, plus `showTable: true` if the browser model exposes
  it.

For a chart with `showTable: false`:

- omit the entire chart table element, caption, heading/body rows, table CSS class,
  table ID, and table-only print markup;
- omit the `table` object and any rows/headings/caption from the serialized
  chart browser JSON;
- preserve only the plot data already required for ECharts and, if needed for
  category/date formatter reconstruction, a minimal `rowLabels` or equivalent
  ID-to-display-label map. This map is plot metadata, not an alternate table;
- omit table references from the plot's `aria-describedby` string, the
  accessibility summary, and the serialized output-facing accessibility object;
- preserve title, description, chart summary, axes, series, nulls, tooltip units,
  legend/zoom controls, empty-state content, plot data, and existing source data
  normalization;
- do not satisfy this by CSS `display:none`, `sr-only`, an offscreen table, a
  visually hidden duplicate, or a second JSON/data fallback.

The browser bootstrap must tolerate a false model with no `table` object. Its
category/axis formatter lookup uses `rowLabels` when table data is absent. The
browser must not lazily reconstruct a DOM or semantic table.

A candidate output shape is:

```ts
interface BrowserChartModel {
  showTable: boolean;
  table?: ChartViewModel['table'];
  rowLabels?: Readonly<Record<string, string>>;
  accessibility: Omit<ChartViewModel['accessibility'], 'tableId'>
    | ChartViewModel['accessibility'];
  // existing non-table fields
}
```

The exact TypeScript shape may use a discriminated union for true/false instead
of optional fields, provided false cannot serialize table data and true remains
backward compatible.

## PDF

- `showTable: true` retains the existing chart stack plus complete data table,
  headers, row values, widths, layout, null display, and measurement text.
- `showTable: false` omits the table object entirely after the chart SVG stack.
  Title, description, SVG, empty-state output, static chart ordering, and report
  narrative remain.
- Tests inspect the prepared PDF definition, not only rendered text, to prove
  that no chart table object survives false visibility.

A report may contain ordinary `table` views; they are unaffected. Tests must
distinguish view tables from chart-associated data tables.

## DOCX

For true, preserve all existing native chart and table behavior by chart kind:
scatter, numeric line, DateTime line, category line, bar, column, and fallback
paths.

For false, every chart path has no `addChartTable` call or equivalent Word table:

- plotted scatter;
- plotted numeric line;
- plotted DateTime line;
- plotted bar/column/category line;
- zero plotted points fallback;
- unsupported multiple-axis/series fallback;
- scatter group with no plottable points fallback;
- numeric line omitted-series fallback.

A false fallback still emits its heading/description/notice and no table. It may
emit a chart where Word supports one. A notice must not say data is “shown only
in the complete table.” Wording must describe omitted/unrepresentable data
without promising a nonexistent table.

Chart alt text for false uses the chart's title/description/summary/details but
must not use `model.accessibility.tableId` as chart alt name or reference a
nonexistent table. True retains the existing table-linked alt/accessibility
behavior.

DOCX evidence inspects package XML and relationships: native chart parts may
exist independently of `<w:tbl>`; embedded workbooks are chart data for the
native editable chart and are not the report data-table fallback. False tests
must not misclassify a native chart workbook as a visible Word data table.

## Shared Accessibility Model

The internal model table and identifier may remain available for stable chart
construction and true output. S119 output-facing accessibility construction
must branch on `showTable`:

- true summary includes `${rows} source rows; ${points} plotted points. Complete
  chart data is in table <id>.`;
- false summary includes source/plot counts and any existing DateTime/order note,
  but no table phrase or ID.

A false serialized accessibility object and DOCX/HTML alt text must contain no
table property/reference. Keeping an internal `tableId` only on the TypeScript
model is acceptable if no output adapter exposes it; the preferred contract is a
conditional output projection rather than an unnecessary mutation of the model.

## True Behavior and Regression

True output must be byte-/structure-compatible where existing tests rely on it,
except for an explicit `showTable: true` JSON field or other harmless additive
metadata if necessary. Specifically preserve:

- table caption/headings/rows/value formatting;
- null display and source order;
- measurement display and normalized values;
- chart title, description, axes, series, units, and plot data;
- existing static/native/fallback chart behavior;
- ordinary `table` declaration views, independent of chart visibility.

## Output Acceptance Fixtures

Every output adapter must include omitted, explicit false, literal true, and a
Boolean expression evaluating true/false. The same prepared chart should be
inspected across HTML, PDF, and DOCX where possible. False checks assert
absence, not CSS style, and true checks assert exact table contents.
