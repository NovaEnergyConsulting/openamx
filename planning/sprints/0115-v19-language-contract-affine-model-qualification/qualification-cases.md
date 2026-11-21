# Sprint 115 Qualification Cases

## Status

These are Architect-prepared golden cases for contract review. They are not
accepted by the current parser/runtime and no production result below is a
claim of implementation. Stable IDs are downstream traceability anchors.

Use normal repository test envelopes in the owning implementation sprint.
Floating affine physical-value assertions use a stated tolerance, while exact
string, unit identity, display-unit, omission, and diagnostic-code assertions
remain exact.

## Chart Contract Cases

| ID | Shape | Expected result | Owner |
| --- | --- | --- | --- |
| CHT-OMIT-01 | Chart omits `showTable` | Resolved `showTable` is false; no table output | S116/S119 |
| CHT-FALSE-01 | `showTable false` | False; no table output | S116/S119 |
| CHT-TRUE-01 | `showTable true` | True; existing table content/order/headings retained | S116/S119 |
| CHT-EXPR-01 | `showTable threshold >= 10 and enabled` | Expression typechecks as Boolean, evaluates once at `show`, result controls output | S116 |
| CHT-ENV-01 | A referenced binding is reassigned between two `show` statements | Each emission snapshots its current Boolean result; no renderer reevaluation | S116 |
| CHT-KIND-01 | Bar, column, line, and scatter each use `showTable true` | Option accepted for all four kinds with unchanged plot/table behavior | S116/S119 |
| CHT-TYPE-01 | `showTable 1`, String, list, record, nullable Boolean, or Measurement | Static Boolean mismatch at expression | S116 |
| CHT-DUP-01 | Two `showTable` options in one chart | Second occurrence rejected as duplicate | S116 |
| CHT-PARSE-01 | Missing expression, `showTable: true`, or trailing invalid syntax | Parse failure at the option's first offending token | S116 |
| CHT-TABLE-01 | `showTable true` appears in a table declaration | Existing invalid-option behavior | S116 |
| CHT-NAME-01 | Expression refers to unknown/not-yet-visible name | Ordinary unknown-identifier diagnostic preserved | S116 |
| CHT-HTML-01 | False/omitted chart prepared for interactive HTML and preview | Plot emitted; table markup/data caption and table-specific browser JSON are absent; accessibility has no table reference | S119 |
| CHT-PDF-01 | False/omitted chart prepared for PDF | Plot emitted; no chart data table | S119 |
| CHT-DOCX-01 | False/omitted chart prepared for DOCX | Plot emitted; no chart data table | S119 |
| CHT-OUTPUT-OMISSION-01 | Any false/omitted renderer still emits table markup/content or table-linked accessibility output | Acceptance failure with artifact-level evidence; no table hiding fallback is accepted | S119/S120 |
| CHT-OUTPUT-TRUE-01 | True/dynamic-true chart in HTML/PDF/DOCX | Existing table contents, headings, rows, null behavior, and caption retained | S119 |
| CHT-DEFAULT-MIGRATION-01 | Existing V0.18 chart omitted option after V0.19 migration | Plot remains; implicit table removed until `showTable true` is added | S119/S120 |

## Affine Declaration Cases

| ID | Shape | Expected result | Owner |
| --- | --- | --- | --- |
| AFF-LINEAR-01 | Existing scale-only declaration such as `centimeter = 0.01 * meter` | Scale, vector, identity, and runtime behavior unchanged; offset 0 | S117 regression |
| AFF-DECL-CEL-01 | `unit celsius = kelvin + 273.15` | Scale 1, offset 273.15, ThermodynamicTemperature vector | S117 |
| AFF-DECL-FHR-01 | Canonical Fahrenheit declaration from the contract | Scale $5/9$, offset $273.15-160/9$ | S117 |
| AFF-ALIAS-01 | `degC = celsius`, `degF = fahrenheit` | Aliases retain full affine metadata and displayed alias name | S117 |
| AFF-IMPORT-01 | Imported/exported Celsius and Fahrenheit units | Offset/scale and unit identity survive registry/import composition | S117 |
| AFF-PRECEDENCE-01 | `2 * kelvin / 4 + PI` and parenthesized equivalent | `^`, then `*`/`/`, then offset `+`; expected scale 0.5 and offset PI | S117 |
| AFF-PI-01 | Derived unit scale includes `PI` | Resolves to `Math.PI`; no runtime environment dependency | S117 |
| AFF-E-01 | Derived unit offset includes `E` | Resolves to `Math.E`; finite positive scale retained | S117 |
| AFF-USER-CONST-01 | User value identifier used in unit declaration | Unknown/not-yet-visible unit declaration error; no constant folding | S117 |
| AFF-IMPORTED-CONST-01 | Imported ordinary value named in unit declaration | Rejected even if statically immutable/known; only PI/E allowed | S117 |
| AFF-FORWARD-01 | Unit declaration refers to a later unit | Existing source-order/not-yet-declared error | S117 |
| AFF-CALL-01 | Function call appears in unit expression | Unsupported expression diagnostic; no compile-time execution | S117 |
| AFF-TWO-UNIT-ADD-01 | `meter + second` or `kelvin + celsius` | Declaration `+` with two dimensioned terms rejected | S117 |
| AFF-REVERSE-SUB-01 | `273.15 - kelvin` | Rejected because offset subtraction cannot reverse/negate the unit scale | S117 |
| AFF-SCALE-ZERO-01 | Computed scale zero | Rejected: scale must be greater than zero | S117 |
| AFF-SCALE-NEG-01 | Computed scale negative | Rejected: scale must be greater than zero | S117 |
| AFF-SCALE-INF-01 | Overflowing scale expression | Rejected as non-finite | S117 |
| AFF-OFFSET-INF-01 | Overflowing offset expression | Rejected as non-finite | S117 |
| AFF-CYCLE-01 | Cyclic imported/visible unit graph | Rejected through source-order/import validation; no recursion | S117 |
| AFF-DIM-01 | Offset composition combines an incompatible dimension term | Rejected as incompatible unit declaration | S117 |
| AFF-COMPOUND-01 | `celsius / second` or `celsius ^ 2` | Rejected affine compound power/division as D115-05 | S117 |
| AFF-POWER-IDENTITY-01 | `celsius ^ 1` | Preserves affine metadata; identity power is allowed | S117 |

## Conversion and Operation Cases

| ID | Shape | Expected result | Owner |
| --- | --- | --- | --- |
| AFF-CONV-INVARIANT-01 | `0 celsius`, `32 fahrenheit`, `273.15 kelvin` converted to Kelvin | Canonical physical values equal 273.15 K | S118 |
| AFF-CONV-REVERSE-01 | Convert K/C/F in both directions at multiple values | Inverse formula retains expected display value and unit | S118 |
| AFF-ROUNDTRIP-01 | C to F to C and C to K to C for positive, zero, negative, fractional values | Round trips are within the explicit floating tolerance and preserve requested final display unit | S118 |
| AFF-EQUAL-01 | Equivalent values in C/F/K compared with `==`, `!=`, `<`, `<=`, `>`, `>=` | All comparisons use canonical physical values | S118 |
| AFF-SUB-SAME-01 | `20 celsius - 10 celsius` | `10 celsius` in left display unit | S118 |
| AFF-SUB-MIX-01 | `32 fahrenheit - 20 celsius` | Physical difference converted to left Fahrenheit unit: $-36$ F | S118 |
| AFF-ADD-01 | `10 celsius + 20 celsius` | Rejected as direct affine addition | S118 |
| AFF-MUL-01 | `2 * 10 celsius` or affine product | Rejected for nonzero-offset affine measurement | S118 |
| AFF-DIV-01 | `10 celsius / 2` or affine divisor path | Rejected for nonzero-offset affine measurement | S118 |
| AFF-POW-01 | `10 celsius ^ 2`, `pow(10 celsius, 2)` | Rejected | S118 |
| AFF-SQRT-01 | `sqrt(10 celsius)` | Rejected | S118 |
| AFF-SUM-01 | `sum([10 celsius, 20 celsius])` | `303.15 celsius` through physical aggregation exception | S118 |
| AFF-SUM-MIX-01 | Sum mixed C/F/K values | Physical aggregate converted to first element's display unit | S118 |
| AFF-MEAN-01 | Mean mixed C/F/K values | Mean physical value converted to first element's display unit | S118 |
| AFF-MINMAX-01 | Mixed C/F/K `min` and `max` | Select by physical comparison and return selected original unit | S118 |
| AFF-ABSROUND-01 | `abs(-10 celsius)`, `round(10.24 celsius, 1)` | Transform displayed value; unit remains Celsius | S118 |
| AFF-NEG-01 | `-10 celsius` | Displayed value becomes -10; unit remains Celsius | S118 |
| AFF-FINITE-01 | Runtime input/conversion/arithmetic produces non-finite physical or displayed result | Existing finite measurement domain error; no Infinity/NaN output | S118 |
| AFF-INCOMPAT-01 | Temperature and Length operations/aggregate | Existing incompatible-dimension diagnostic | S118 |
| AFF-NUMBER-REG-01 | Number-only arithmetic/aggregates and linear measurements | Existing behavior unchanged | S118 regression |

## Chart, Display, and External Cases

| ID | Shape | Expected result | Owner |
| --- | --- | --- | --- |
| AFF-CHART-01 | One chart series contains C/F/K measurements with Celsius first | Plot values normalized physically to Celsius; axis/table labels remain Celsius | S118/S120 |
| AFF-CHART-NULL-01 | Mixed affine measurement series includes null values | Null placement and source order preserved; non-null values normalize | S118 |
| AFF-CHART-FIRST-01 | First non-null selected value is Fahrenheit | All selected values display in Fahrenheit with Fahrenheit heading | S118 |
| AFF-CHART-FAIL-01 | Selected affine chart value cannot convert/normalize finitely to the retained display unit | Preserve source-local chart normalization diagnostic; no partial success-shaped output | S118 |
| AFF-DISPLAY-01 | Scalar/table displays `20 celsius` and converted `68 fahrenheit` | Display intent and unit text remain as selected; no raw canonical leak | S118/S119 |
| AFF-EXTERNAL-01 | Input object `{ "value": 20, "unit": "celsius" }` for temperature | Shape accepted; display value 20 Celsius retained; affine metadata available internally | S118 |
| AFF-EXTERNAL-ALIAS-01 | External input unit `degC` or `degF` | Explicit alias accepted and identity retained | S118 |
| AFF-EXTERNAL-COMPOUND-01 | External unit text attempts `celsius / second` | Rejected under affine-compound rule; no ambiguous physical conversion | S118 |
| AFF-EXTERNAL-SHAPE-01 | Input has a third field, missing `value`, or physical offset field | Existing exact `{ value, unit }` shape rejection remains | S118 regression |

## Complete Chart Source Envelope

````text
# Sprint 115 chart visibility fixture

```amx
let values: Number[] = [1, 2]
let enabled: Boolean = true
let threshold: Number = 2

chart visibility = column(values) {
  title: "Visibility contract"
  showTable threshold >= 2 and enabled
  series "Value"
}

show visibility
```
````

Expected contract: `showTable` resolves to `true`; HTML/PDF/DOCX retain the
existing two-row, one-series table. The corresponding omitted and literal
false variants retain the plot and omit every table representation.

## Complete Temperature Source Envelope

````text
# Sprint 115 affine temperature fixture

```amx
dimension ThermodynamicTemperature
unit kelvin: ThermodynamicTemperature
unit celsius = kelvin + 273.15
unit fahrenheit = (5 / 9) * kelvin + (273.15 - 160 / 9)
unit degC = celsius
unit degF = fahrenheit

let c: ThermodynamicTemperature = 0 celsius
let f: ThermodynamicTemperature = 32 fahrenheit
let k: ThermodynamicTemperature = 273.15 kelvin
let same: Boolean = c == f and f == k
let delta: ThermodynamicTemperature = 20 celsius - 10 celsius
let total: ThermodynamicTemperature = sum([10 celsius, 20 celsius])
let inF: ThermodynamicTemperature = c in fahrenheit
```
````

Expected bindings: `same` is true; `delta` is 10 Celsius; `total` is 303.15
Celsius; `inF` is 32 Fahrenheit. Direct affine addition, affine
multiplication/division/powers, and `sqrt` receive separate negative fixtures.

## Reconciliation Rule

The owning sprint must import these IDs without renaming them. Implementation
fixtures may be split into multiple tests, but every test must identify the
corresponding qualification ID in the test/evidence record. A duplicate case
ID is an error, and a master-plan requirement may not be represented only by a
prose row.
