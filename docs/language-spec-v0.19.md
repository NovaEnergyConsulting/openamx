# OpenAMX V0.19 Chart Table Visibility and Affine Units

V0.19 adds resolved chart data-table visibility and affine/offset unit
declarations to the OpenAMX language and output adapters. This specification is
additive. It does not replace the [V0.18 diagram specification](language-spec-v0.18.md),
[V0.16 function specification](language-spec-v0.16.md),
[V0.14 specification](language-spec-v0.14.md),
[V0.13 diagram specification](language-spec-v0.13.md), or earlier contracts.
See the [project README](../README.md),
[Measurements and Units](../examples/05_Measurements_and_Units.amx), and
[Tables, Charts, and Named Outputs](../examples/07_Tables_Charts_and_Named_Outputs.amx).

## 1. Chart Table Visibility

Every bar, column, line, and scatter chart accepts an optional property:

```ebnf
ChartShowTableOption ::= "showTable" Expression
```

There is no colon between `showTable` and its expression. The expression uses
the chart declaration's ordinary lexical environment and may be a literal,
identifier, call, comparison, or other Boolean-typed expression.

```amx
let retainTable: Boolean = true
let threshold: Number = 2

chart scores = column(values) {
  title: "Scores"
  description: "Calculated scores"
  showTable retainTable and threshold >= 2
  series "Score"
}
```

The option is checked as `Boolean`. A malformed option uses the existing AMX
parse family. A non-Boolean expression is diagnosed at the expression, an
unknown name retains ordinary identifier diagnostics, and a duplicate option
is diagnosed at the second `showTable`. A table declaration does not accept the
option.

The expression is evaluated once for each `show` emission, after the normal
chart declaration checking and at the same snapshot point as other chart data.
Reassigning a visible Boolean and showing the same declaration again may produce
different resolved values. Renderers consume that resolved Boolean; they do not
parse or evaluate the source expression again.

Omitting `showTable` resolves to `false` in V0.19. This is an intentional
breaking migration from V0.18, where chart data tables were always emitted.

## 2. Output Behavior

A chart with a resolved false value keeps its plot, title, description, axes,
series, legend, zoom controls, null/empty state, units, tooltip behavior, and
normalized plotted data. Its chart-associated data table is omitted from:

- interactive and preview HTML;
- PDF;
- DOCX native-chart and fallback paths.

False output means actual omission. It does not use a CSS-hidden table,
offscreen markup, print-only duplication, screen-reader-only duplication,
alternate table payload, or hidden JSON reconstruction. Browser JSON for false
visibility contains no `table`, table rows, headings, caption, or table ID. It
may retain a minimal row-ID-to-label map required by category axes and tooltips.

False accessibility output describes the chart using its title, description,
source-row count, plotted-point count, and any applicable DateTime note. It does
not refer to a table caption or table identity and does not claim omitted or
unplottable values are available in a complete table.

A resolved true value preserves the existing complete table behavior, including
headings, source order, null display, measurement units, table-linked
accessibility, PDF table structure, and DOCX native/fallback alternatives.
Ordinary `table` views are independent of chart `showTable` and continue to
render normally.

## 3. Affine Unit Formula

Every unit has a scale and an offset over its dimension's canonical base unit:

$$
p = v \times scale + offset
$$

Here $p$ is the canonical physical value and $v$ is the displayed numeric value.
The scale is positive and finite; the offset is finite. Linear units retain an
offset of zero. A declared alias inherits the same scale and offset as its
referenced unit.

```amx
dimension ThermodynamicTemperature
unit kelvin: ThermodynamicTemperature
unit celsius = kelvin + 273.15
unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
unit degC = celsius
unit degF = fahrenheit
```

These declarations satisfy the physical invariant:

$$
0\,C = 32\,F = 273.15\,K
$$

Unit declaration arithmetic retains ordinary `*`, `/`, and signed integer `^`
precedence. Addition and subtraction may combine one compatible affine unit
term with a dimensionless scalar offset. The resulting declaration must have one
finite positive scale and one finite compatible offset. Scalar-only declaration
expressions remain invalid because a unit declaration must resolve to unit
metadata.

The built-in constants `PI` and `E` resolve statically to their existing numeric
standard-library values inside unit declaration expressions:

```amx
unit piKelvin = PI * kelvin
unit shiftedKelvin = kelvin + E
```

User bindings, imported constants, arbitrary function calls, forward references,
and a general declaration-time evaluator are not allowed to replace this narrow
constant allowlist. Aliases, explicit imports/exports, cycles, incompatible
dimensions, non-finite values, and invalid effective scales retain the accepted
declaration diagnostics.

## 4. Conversion and Comparison

Measurement attachment and `in` conversion apply the same scale and offset
formula. Conversion preserves the physical dimension, the selected display unit,
and the external Measurement display value.

Equality and ordering compare canonical physical values. Compatible affine
measurements may therefore compare across Celsius, Fahrenheit, and Kelvin
without requiring pairwise conversion declarations.

Subtracting compatible affine measurements subtracts their physical values,
divides the resulting difference by the left operand's scale, and returns a
Measurement in the left operand's display unit:

```amx
let difference = 20 celsius - 10 celsius
```

`difference` is `10 celsius`. Mixed compatible units follow the same physical
rule while retaining the left unit.

## 5. Supported and Rejected Operations

The following affine operations are supported:

- attachment, conversion, equality, and ordering;
- compatible subtraction with the left-unit rule;
- `sum` and `mean` through physical aggregation;
- `min` and `max` through physical comparison;
- `abs`, `round`, and unary minus on display values with the selected unit;
- display through tables, narrative interpolation, charts, and external output.

Physical aggregation first converts all compatible values to canonical physical
values, performs the aggregate, and converts the result to the first list
element's display unit. `sum` is an explicit exception to direct affine addition:

```amx
let total = sum([10 celsius, 20 celsius])
let average = mean([10 celsius, 20 celsius])
```

`total` is `303.15 celsius`; `average` is `15 celsius`. `min` and `max` select
an original source Measurement after physical comparison rather than synthesizing
a new canonical value.

Direct addition of two affine Measurements, affine Measurement multiplication
or division, binary powers, `pow`, and `sqrt` remain rejected. These operations
cannot silently discard or misapply an offset. The existing unit-declaration and
Measurement diagnostics identify the operator or call without adding an output-specific error.

## 6. Standard Temperature Library

The standard SI library exports four V0.19 temperature names in addition to its
existing Kelvin units:

- `celsius`;
- `fahrenheit`;
- `degC`, an alias of `celsius`;
- `degF`, an alias of `fahrenheit`.

They use the declarations in section 3 and preserve the invariant
$0\,C = 32\,F = 273.15\,K$. Historical linear SI rows and dimensions remain
unchanged.

## 7. Charts, Tables, and Display Intent

When selected compatible affine chart values contain mixed display units, chart
normalization converts all non-null values physically to the first selected
display unit. Source order, null placement, headings, unit labels, no-data
state, and first-unit display intent remain intact. This normalization is the
same for HTML, PDF, and DOCX chart model construction.

The internal chart model retains a complete table for plot construction even
when `showTable` is false. The output adapters alone gate table markup, PDF table
objects, DOCX tables, table-shaped browser JSON, and table-linked accessibility.
This internal staging object is not a public alternate fallback.

Scalar display, ordinary tables, and narrative interpolation keep the selected
unit and display value. They do not expose canonical physical values.

## 8. External Measurement Shape

External JSON and CSV Measurement values retain the existing shape:

```json
{ "value": 20, "unit": "celsius" }
```

The public shape does not add `scale`, `offset`, factors, dimension vectors, or
canonical physical values. Atomic visible affine units and their aliases are
accepted when their exact unit identity is visible to the input boundary.
Affine compound external-unit text is rejected. Existing extra/missing-field and
invalid-unit diagnostics remain authoritative.

## 9. Diagnostics

V0.19 allocates no new stable diagnostic code. Relevant existing families retain
their accepted phase, message, and source ownership:

| Condition | Diagnostic family |
| --- | --- |
| Unknown chart expression identifier | `AMX3001` |
| Non-Boolean `showTable` | `AMX3002` at the expression |
| Duplicate `showTable` | `AMX3005` at the second option |
| Malformed chart option | `AMX3006` parse family |
| Unsupported affine operation | `AMX3007` at the operator/call |
| Invalid affine declaration | `AMX3008` declaration family |
| Static/dynamic physical non-finite value | `AMX3010` / `AMX1009` |
| External shape/unit mismatch | `AMX4004` / `AMX4005` |

Editor highlighting, completion, formatting, and diagnostics preserve these
identities and parser-proven ranges. V0.19 does not translate them into
editor-specific errors.

## 10. Compatibility and Exclusions

Existing multiplication-only units preserve their meaning. Charts that use
`showTable true` retain existing table contents. V0.19 does not add:

- exact decimal arithmetic;
- interval or delta-unit types;
- arbitrary affine composition, addition, scaling, division, powers, or roots;
- implicit external shape fields;
- arbitrary user/imported declaration constants;
- new chart kinds, editor products, package resolution, or report features;
- CSS-hidden, screen-reader-only, offscreen, or alternate chart tables;
- package/version, release, publication, deployment, installer, distribution,
  or platform certification authority.

Native desktop, cross-platform, extension-publication, and integrated V0.19
acceptance evidence remain separately gated. Historical language
specifications are links, not rewritten V0.19 sections.

## 11. Migration

V0.18 charts emitted their data table implicitly. In V0.19, omission resolves to
false. Audit chart declarations whose table is intentionally retained and add:

```amx
showTable true
```

or another Boolean expression that resolves true. Dynamic expressions are
resolved independently at each `show`; they are not renderer-local settings.
There is no automatic source migration.

Review temperature and affine-unit operations against the supported matrix.
Use conversion for display changes, subtraction for compatible affine
differences, and `sum`/`mean` for the approved physical aggregate behavior.
Do not replace removed false tables with hidden HTML, another JSON payload, a
PDF alternate table, or a DOCX fallback table.
