---
name: amx
description: "Create, edit, or review OpenAMX .amx computable documents, starting from a blank project. Use for AMX syntax, reports, calculations, typed inputs, local modules, diagrams, or runtime/rendering issues."
argument-hint: "[document request or .amx path]"
---

# OpenAMX Document Authoring

Create readable, executable OpenAMX documents that preserve the user's
intended analysis. This skill is self-contained: it applies even when the
project starts empty and has no OpenAMX repository, examples, or configuration
files.

## Current language and runtime

The current repository contract is OpenAMX V0.18 (package version 0.18.0).
V0.18 adds loops and conditionals inside diagrams to generate primitives;
previous additions include statement-bodied functions (V0.16), runtime type
predicates, math and text functions, and numeric formatting (V0.14), as well
as records, enums, measurements, and report views. Use only features supported
by the installed runtime: check `openamx --version` when available. If a
project provides a newer specification or runtime, verify its contract before
using newer syntax. Do not treat plans or examples from another language as
evidence that a construct is supported.

OpenAMX is domain-neutral. The author defines the domain's types, calculations,
units, and interpretation. Do not present included demonstrations or
user-supplied calculations as certified methods, and do not invent missing
domain rules.

## Start from a blank project

1. Establish the document's audience, purpose, required results, data sources,
   units, assumptions, and desired output formats. Ask for missing domain rules
   rather than guessing; mark explicitly illustrative values as illustrative.
2. Create a project folder and a primary `.amx` file. No project manifest is
   required for a basic CLI document. Add companion folders only as needed:

   ```text
   project/
     analysis.amx
     data/       # optional local JSON or CSV inputs
     modules/    # optional reusable .amx files
   ```

3. Begin with a small document, then add typed inputs, modules, or report
   views only when the request needs them:

   ````markdown
   # Analysis

   The calculated result is {{ result }}.

   ```amx
   let quantity: Number = 10
   let result: Number = quantity * 2
   ```
   ````

4. Keep relative imports and local input files inside the project. OpenAMX
   does not resolve remote packages or remote data. A local `.amx` module is
   imported by a relative path ending in `.amx`; modules expose only explicitly
   exported declarations.
5. If the CLI is not installed, the supported CLI uses Bun 1.0 or newer:
   install Bun using its official instructions, then install OpenAMX with
   `bun add -g @nova-energy/openamx`. Do not assume Node.js or Deno can run it.
   The desktop app bundles its runtime and does not require Bun. The VS Code
   extension provides editor analysis, not document execution or input
   validation.

## Document and language essentials

An `.amx` file is Markdown plus executable AMX blocks. Only exact,
case-sensitive fences labeled `amx` execute; ordinary Markdown and other code
fences are inert. Use `{{ expression }}` to insert evaluated values into
narrative. Keep explanation understandable on its own and separate supplied
facts, assumptions, and computed results.

AMX is case-sensitive, source-ordered, and statically checked before execution.
Declare a name before referring to it; imports must precede uses. Do not assume
JavaScript, Python, or another language's syntax or coercion rules. Statements
are newline-separated, not semicolon-separated.

## Syntax quick reference

Use the forms below as the language's syntax, not as pseudocode. AMX has no
implicit numeric/string/Boolean coercion. In a checked document, a type error
is rejected before evaluation. Each executable block shares the entry module's
source order and environment; a declaration in one `amx` fence can be used by
a later fence, but not before its declaration. Imports come first, then entry
module inputs, then other declarations and statements.

### Declarations, types, and expressions

```amx
let count: Number = 3
let label: String = "Pump"
let enabled: Boolean = true
let reviewedAt: DateTime = "2026-09-29T12:00:00Z"
let maybeCount: Number? = null
let values: Number[] = [1, 2, 3]
let levels: Number[] = [1 to 3]

let total = values[1] + values[2] * 2
let firstLabel = "Item ${values[1]}"
let hasThree = total >= 3 and enabled
```

The built-in types are `Number`, `String`, `Boolean`, and `DateTime`. A
`DateTime` is an RFC 3339 string with seconds and a timezone, accepted as a
DateTime only in a context that expects that type. Types can be user-declared
record or enum names, or imported names. Type suffixes apply left to right:
`Asset?[]` is a list of nullable assets; `Asset[]?` is a nullable list of
non-null assets. Empty lists need an expected list type, for example
`let none: Number[] = []`.

Expressions include literals, names, lists, ranges `[start to end]`, calls,
record constructors, field access (`record.field`), list reads (`list[index]`),
parentheses, unary `-` and `not`, arithmetic `+ - * / % ^`, comparisons
`== != < <= > >=`, Boolean `and`/`or`, `if`, `match`, and function calls.
`^` is right-associative. Arithmetic binds more tightly than comparisons;
comparisons bind more tightly than `and`, which binds more tightly than `or`.
Use parentheses whenever mixed operators could be unclear. Lists and ranges
are 1-based when indexed: `values[1]` is the first element. There is no
zero-based indexing, slicing, index assignment, or record-field assignment.

Use `=` to initialize a `let` or assign an existing binding, and `+=` for an
existing numeric binding. Repeating `let` for an existing local updates it;
its type remains fixed. Inputs and imported values are immutable. Newlines
separate statements; semicolons are not valid separators.

### Decisions, matching, and loops

There are three distinct conditional forms. The compact expression returns
one of two expressions:

```amx
let band: String = if score >= 10 then "high" else "low"
```

A braced conditional used as an expression requires `else`, and every branch
must explicitly `return` its value. These returns supply the conditional's
value; they do not return from an enclosing function:

```amx
let band: String = if score >= 10 {
  return "high"
} else {
  return "low"
}
```

A standalone braced `if` is a statement and may omit `else`:

```amx
if score >= 10 {
  status = "high"
} else {
  status = "low"
}
```

`match` is an expression over a non-null `Number`, `String`, or `Boolean`.
Cases are literal values and exactly one `default` arm is required:

```amx
let labelForStatus: String = match statusCode {
  case 1 => "Open"
  case 2 => "Closed"
  default => "Unknown"
}
```

The two `for` forms are also distinct. A statement loop performs work and has
no `return`; an expression loop collects exactly one returned value per
iteration into a list:

```amx
let total: Number = 0
for value in values {
  total += value
}

let doubled: Number[] = for value in values {
  return value * 2
}
```

An expression-loop `return` contributes that iteration's value; it is not an
early exit. Loop iterables are lists or ranges. Ordinary AMX loops cannot be
nested; `break` and `continue` are unsupported. A `for` inside a function is
statement-form only and may not be nested.

### Lists and mutation

List reads use positive, 1-based integer indexes. Mutations are statements on
a named local list, not expressions and not bracket assignments:

```amx
let names: String[] = ["Ada", "Bo"]
add "Cy" to names
add "Zed" to names at 2
remove 1 from names
remove 2 from names at 1
```

`add value to list` appends; `add value to list at index` inserts before that
1-based index (`length + 1` appends). `remove count from list` removes one
final item; `remove count from list at index` removes `count` consecutive
items beginning at the index. Indexes and counts must be positive integers.
Use `len(list)` for its element count; there is no `.length` property.

### Records, enums, strings, and modules

Record field declarations use `:`; record constructor values use `=` and
comma-separated fields. A trailing comma is allowed. The optional marker
`?` controls omission, while a nullable type suffix separately allows `null`:

```amx
type Review {
  id: String
  note?: String? = null
  score: Number = 0
}

let review: Review = Review {
  id = "R-1",
  score = 4,
}
```

Defaults must be literal values (including literal lists or records); they
cannot refer to bindings or function calls. Record types are nominal. In
inheritance, list every parent after `extends` and mark each replacing field
with `override`. Enums are declared as `enum Status = { OPEN, CLOSED }`;
implicit numeric members start at `1`. If one member has an explicit value,
all must have unique literal values of the same primitive type.

Double-quoted strings interpolate `${expression}`; single-quoted strings do
not. Supported escapes are `\\`, `\"`, `\'`, `\n`, `\r`, `\t`, and `\${`.
Narrative interpolation uses the separate `{{ expression }}` form outside the
AMX fence.

An entry module starts with imports, then inputs, then other items. Imports
are explicit and relative; modules expose only explicit exports. The export
forms are `export type Name { ... }`, `export fn name(...): Type = ...`, and
`export let name: Type = expression`. Imported modules cannot declare inputs
or report views. Example module and importer:

`modules/geometry.amx`:

```amx
export type Point {
  x: Number
  y: Number
}
```

Entry document:

```amx
import { Point } from "./modules/geometry.amx"
let origin: Point = Point { x = 0, y = 0 }
```

The comment line above is a Markdown label, not AMX syntax: do not copy it
into the fenced module. Imports must use `/`, start with `./` or `../`, end in
`.amx`, and remain within the host's project/entry root. There is no package
resolver, URL import, implicit global, or import alias.

### Function forms and built-ins

An expression-bodied function has one expression. A statement-bodied function
uses the allowed local statement forms and must return a compatible value on
every reachable path:

```amx
fn triple(value: Number): Number = value * 3

fn firstOrDefault(values: Number[]): Number {
  for value in values {
    return value
  }
  return 0
}
```

Functions are pure: they cannot capture document bindings, call themselves,
call a later function, declare inputs/views, or perform document-level
effects. Statement bodies may use initialized `let`, assignment/`+=`,
standalone `if`, statement-form `for`, `return`, and named-list `add`/`remove`.
They may not contain nested loops, expression-form loops, `break`, or
`continue`. A function's `return` exits that function; this differs from
`return` in a braced `if` expression or an expression-form loop.

Common standard-library signatures are `sum`, `mean`, `min`, and `max` on
lists; `abs`, `round(value, digits?)`, `sqrt`, and `pow(base, exponent)`;
`len`, `trim`, `left(text, count?)`, `right(text, count?)`; and
`format(value, pattern, locale?)`. For math, constants `PI` and `E` and
`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `asinh`,
`acosh`, `atanh`, `ln`, `log`, `exp` are available. Trigonometry uses radians;
`ln` is natural log and `log` is base 10. `is` tests a runtime value against
a visible type but does not narrow its static type. These are functions, not
methods: use `len(values)`, not `values.len()`.

`format` accepts only numeric patterns of the form `0` or `#,##0`, optionally
followed by `.` and one to six zeroes, optionally prefixed by `$`, `€`, or
`£`, and optionally suffixed by `%`. Supported locales are `en-US` (default),
`de-DE`, and `fr-FR`; it is not a general date formatter.

### Measurements and units

Declare dimensions and units before use. `:` declares a base unit's dimension;
`=` defines a scaled or compound unit. Attach a unit by juxtaposition to a
number, numeric identifier, or parenthesized numeric expression; convert with
`in`:

```amx
dimension Length
dimension Time
dimension Speed = Length / Time
unit meter: Length
unit kilometer = 1000 * meter
unit second: Time
unit meter_per_second = meter / second

let distance: Length = 1250 meter
let travelTime: Time = 2 second
let speed: Speed = distance / travelTime
let distanceInKm: Length = distance in kilometer
let adjusted: Length = (3 + 2) meter
```

Measurements are not plain Numbers. Add/compare only compatible dimensions;
`in` changes the displayed unit, not the physical value. Do not invent units
or silently assign units to external bare numbers. For compound expressions,
declare a named unit or use explicit Measurement arithmetic.

### Tables, charts, and named outputs

Tables and charts are private report declarations; `show` emits a declared
view. A table source must be a list of records, and each column names one
direct scalar field:

```amx
type Observation {
  assetId: String
  elapsed: Number
  output: Number
  station: String
}

let rows: Observation[] = [
  Observation { assetId = "A-1", elapsed = 0, output = 4, station = "North" },
  Observation { assetId = "A-2", elapsed = 1, output = 7, station = "South" },
]

table register = table(rows) {
  title: "Register"
  column assetId as "Asset ID"
  column output as "Output"
}

chart scores = bar(rows) {
  title: "Output by asset"
  description: "Observed output for each asset"
  category: assetId
  series output as "Output"
}

chart trend = line(rows) {
  title: "Output over time"
  description: "Observed output in input order"
  x: elapsed
  series output as "Output"
}

chart correlation = scatter(rows) {
  title: "Output by elapsed time"
  description: "Points grouped by station"
  x: elapsed
  y: output
  group: station
}

show register
show scores
show trend
show correlation
```

For `bar`/`column` charts with record rows, specify `category: field` and one
or more `series field as "Label"`. For `line` charts with record rows,
specify `x: field` and one or more series. `scatter` requires record rows with
`x: field` and `y: field`, and may have `group: stringField`; it has no
`series` option. For a `Number[]` source, bar/column/line use exactly one
`series "Label"`; optional `labels: stringList` must have the same length.
Every chart requires a quoted `title` and `description`; do not add options
that do not apply to its source shape or chart kind.

Named data outputs are separate from report views. Export a top-level value
explicitly and map its name to a destination when running:

```amx
type Summary {
  total: Number
}

let total: Number = 4
export let summary: Summary = Summary { total = total }
```

```sh
openamx run analysis.amx --output summary=out/summary.json
```

CSV output is limited to lists of flat records with scalar fields; use JSON
for nested records/lists.

### Values, records, and collections

- Common types are `Number`, `String`, `Boolean`, and `DateTime`. Use `T[]`
  for lists and `T?` for nullable values. Record types define named fields.
- `let name: Type = expression` declares a value; type annotations may be
  omitted when inference is clear. Use named intermediate values for
  nontrivial calculations.
- Record constructors use `=` between field names and values, not `:`:

  ```amx
  type Point {
    x: Number
    y: Number
  }

  let origin: Point = Point { x = 0, y = 0 }
  ```

- Fields can be optional or have defaults. For example,
  `note?: String? = null` allows the field to be absent or explicitly null.
  Record inheritance uses `extends` and requires `override` when replacing an
  inherited field; a child record is still not assignable to its parent.
- Enums evaluate to their underlying primitive values, not a distinct nominal
  type. Implicit numeric members start at `1`; explicit members must all have
  unique literals of the same primitive type.
- Lists use 1-based positive integer indexes, not zero-based indexes.
  Expression-form loops collect each returned value into a list:

  ```amx
  let doubled: Number[] = for value in [2, 4, 6] {
    return value * 2
  }
  ```

  Statement-form loops and `add`/`remove` can update a named local list.
- A `match` expression uses `case` arms and a `default`. Conditional
  expressions can use `if condition then value else other`; braced `if`
  expressions require an `else` and an explicit `return` value in every
  branch. A standalone braced `if` is a statement.

### Functions and modules

Pure functions can use an expression body or a statement body:

```amx
fn triple(value: Number): Number = value * 3

fn adjusted(value: Number): Number {
  let result = value + 2
  return result
}
```

Statement-bodied functions must return a compatible value on every reachable
path. Parameters and locals are call-local; functions do not capture document
bindings. Functions cannot call themselves or a later function declaration.
Do not put document-level effects such as `input`, `show`, `export`, or a
diagram inside a function.

Reusable types and functions belong in local `.amx` modules. Export each
declaration the importing document needs, and import it explicitly:

```amx
import { Point } from "./modules/geometry.amx"
```

Imports resolve relative to the importing module and are restricted to the
host's project/entry root. Do not use absolute paths, parent traversal to
escape the project, package names, or implicit globals.

### Measurements, functions, and formatting

Declare dimensions and units before attaching them to values. Unit conversions
preserve the physical dimension:

```amx
dimension Length
unit meter: Length
unit kilometer = 1000 * meter
let distance: Length = 1250 meter
let distanceInKilometers: Length = distance in kilometer
```

Measurements are not plain Numbers. Addition and comparison require compatible
dimensions; multiplication and division compose dimensions. Do not silently
drop units or assume an external bare number has a unit. JSON measurements
use `{"value": 10, "unit": "meter"}`; CSV measurement fields use text such as
`10 meter`.

The current library includes `PI`, `E`, trigonometric and logarithmic math
functions, Measurement-aware collection/math operations, and text helpers
`len`, `trim`, `left`, and `right`. `len` counts Unicode code points in text
and elements in a list. Double-quoted strings support `${expression}`;
single-quoted strings do not interpolate. `format(value, pattern, locale)`
supports a bounded numeric pattern grammar and the `en-US`, `de-DE`, and
`fr-FR` locales; it is not a general date or formatting engine. The `is`
operator tests runtime values against visible types but does not narrow the
value's static type.

### Tables, charts, and diagrams

Use tables and charts to present calculated data; declare them in AMX and use
`show` to include them in the report. Named data outputs are explicitly
exported, separately from report views:

```amx
type TotalRow {
  value: Number
}

let rows: TotalRow[] = [
  TotalRow { value = 1 },
  TotalRow { value = 2 },
  TotalRow { value = 3 }
]
table totalTable = table(rows) {
  title: "Totals"
  column value as "Value"
}
show totalTable

let scores: Number[] = [1, 2, 3]
chart scoreChart = bar(scores) {
  title: "Scores"
  description: "Example values"
  series "Score"
}
show scoreChart
```

Use `export let name = value` for a named data output; `run` and `render`
accept `--output name=path` to serialize exported values as JSON or CSV.

Formula-driven diagrams are declared inside an AMX block. Current primitive
types are `line`, `rectangle`, `circle`, and `text`. Geometry and text can
depend on AMX values and diagram-local time; colors and line widths follow the
diagram property rules. V0.18 permits diagram-local `for` and braced `if` /
`else` blocks to generate primitives. Content expands in source order when the
model is created; generated membership stays fixed during playback while
primitive properties can animate with time. The time identifier cannot be
used in loop iterables or conditional controls, and a diagram loop cannot be
nested inside another diagram loop. At most 64 generated primitives are
emitted per diagram; the separate authored limits are 16 diagrams and 512
primitive declarations per report.

Use the required property names below. Geometry and text `value` are
expressions; styles are static. `lineWidth` is a positive finite literal, not
an expression. Colors are `#RRGGBB` literals or `none` where allowed.

| Primitive | Required properties | Optional properties |
| --- | --- | --- |
| `line name` | `x1`, `y1`, `x2`, `y2`, `stroke`, `lineWidth` | `arrow: "none"`, `"start"`, `"end"`, or `"both"` |
| `rectangle name` | `x`, `y`, `width`, `height`, `stroke`, `lineWidth` | `fill` |
| `circle name` | `cx`, `cy`, `r`, `stroke`, `lineWidth` | `fill` |
| `text name` | `x`, `y`, `value`, `fill` | None |

```amx
diagram marker {
  title: "Moving marker"
  description: "Four primitive types and generated trace points."
  width: 160
  height: 80
  time t from 0 to 1 duration 2
  line axis {
    x1: 10
    y1: 12
    x2: 150
    y2: 12
    stroke: "#263238"
    lineWidth: 1
    arrow: "end"
  }
  rectangle body {
    x: 10
    y: 30
    width: 28
    height: 18
    stroke: "#263238"
    fill: "#DCE8F0"
    lineWidth: 1
  }
  circle point {
    cx: 10 + 120 * t
    cy: 54
    r: 5
    stroke: "#263238"
    fill: "#F3B64B"
    lineWidth: 1
  }
  text timeLabel {
    x: 10
    y: 68
    value: "t = ${round(t, 2)}"
    fill: "#263238"
  }
  for sample in [0, 1, 2] {
    if sample > 0 {
      circle tracePoint {
        cx: 10 + 20 * sample + 80 * t
        cy: 54
        r: 2
        stroke: "#263238"
        fill: "#D07A32"
        lineWidth: 1
      }
    }
  }
}
```

Diagrams are interactive in standalone HTML and desktop preview. PDF and DOCX
use a static frame at the lower time bound; DOCX diagrams are images, not
editable Word shapes. HTML charts are interactive; PDF charts are static with
their data retained in tables. DOCX charts are native editable charts when
they can be represented.

## Inputs and outputs

Declare each external input by logical name and type, then map it explicitly
to a local file when running. The mapping name must exactly match the `input`
declaration:

```amx
input readings: Number[]
```

```sh
openamx run analysis.amx --input readings=data/readings.json
```

Supply one `--input name=path` for every required input. Paths are resolved
from the command's working directory; use the intended project files. JSON
and CSV are validated against the declared types. Invalid data is a failure,
not a successful empty result.

To write exported values with `run` or `render`, map each export name to a
JSON or CSV destination with `--output name=path`. JSON supports structured
values; CSV is for flat scalar records. Create destination directories first
and never overwrite source, input, or user-owned files. Repeat all input
mappings for every command that evaluates the document.

## Validate and deliver

Use the available runtime to validate the actual document, not just its
syntax highlighting:

```sh
openamx --version
openamx run analysis.amx
openamx render analysis.amx --out preview.html
openamx export pdf analysis.amx --out report.pdf
openamx export docx analysis.amx --out report.docx
```

Add the same `--input` mappings to each relevant command and `--output`
mappings when producing named data files. Run is the primary check: resolve
all diagnostics and nonzero exits, inspect calculated bindings against
expected results, and test meaningful boundary cases. Render when narrative
substitution or presentation matters; inspect the HTML for missing values or
unintended content. Export PDF or DOCX only when requested. Do not overwrite
an existing file to create a preview.

If only the repository checkout is available, use its documented Bun build
and CLI workflow before running the document. The VS Code extension can
diagnose and format source but does not run documents or validate external
inputs. If no execution runtime is available, say clearly that runtime
validation was not performed; do not claim the document works.

Deliver the `.amx` file and any requested companion data or modules. Briefly
identify the contents, external mappings, assumptions that affect
interpretation, actual validation performed, and any limitation or failure.
Keep documents self-contained unless reuse or supplied project structure
justifies companion files.