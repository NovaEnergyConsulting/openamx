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

```amx
diagram marker {
  title: "Moving marker"
  description: "A point moves across the canvas."
  width: 160
  height: 80
  time t from 0 to 1 duration 2
  circle point {
    cx: 10 + 120 * t
    cy: 40
    r: 5
    stroke: "#263238"
    fill: "#F3B64B"
    lineWidth: 1
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