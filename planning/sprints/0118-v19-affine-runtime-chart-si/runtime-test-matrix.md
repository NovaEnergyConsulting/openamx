# Sprint 118 Runtime, Chart, External Data, and SI Test Matrix

## Status and Scope

Architect-prepared execution matrix. All rows are NOT RUN during preparation.
The 29 Sprint 115 AFF cases after S117 declaration ownership retain their stable
IDs. S118-specific IDs cover helper, SI inventory, staging, generated-runtime,
and public-shape assertions.

## Conversion, Comparison, and Arithmetic Cases

| Case ID | Input/assertion | Expected S118 result | Owner |
| --- | --- | --- | --- |
| AFF-CONV-INVARIANT-01 | `0 C`, `32 F`, `273.15 K` to physical/Kelvin | All physical values are 273.15; exact selected display units | runtime |
| AFF-CONV-REVERSE-01 | Forward/reverse K/C/F conversions | Inverse formulas preserve expected display values and target unit | runtime |
| AFF-ROUNDTRIP-01 | C->F->C and C->K->C at -40, 0, 20, 21.25 C | Within stated fixture tolerance; final unit C | runtime |
| AFF-EQUAL-01 | Equivalent C/F/K with all equality/order operators | Canonical physical comparisons; exact Boolean outcomes | runtime |
| AFF-SUB-SAME-01 | `20 celsius - 10 celsius` | `10 celsius` in left display unit | runtime |
| AFF-SUB-MIX-01 | `32 fahrenheit - 20 celsius` | `-36 fahrenheit`; mixed linear/affine subtraction cases also pass | runtime |
| AFF-ADD-01 | `10 celsius + 20 celsius`, C + K, or K + C | AMX3007 direct affine addition rejection | runtime diagnostic |
| AFF-MUL-01 | `2 * 10 celsius`, `10 celsius * 2`, affine-affine product | AMX3007 affine multiplication rejection | runtime diagnostic |
| AFF-DIV-01 | `10 celsius / 2`, `2 / 10 celsius`, affine divisor/product path | AMX3007 affine division rejection; no composition | runtime diagnostic |
| AFF-POW-01 | `10 celsius ^ 2` and `pow(10 celsius, 2)` | AMX3007 affine power rejection | runtime diagnostic |
| AFF-SQRT-01 | `sqrt(10 celsius)` | Rejected under affine/dimensional policy, no physical root result | runtime diagnostic |
| AFF-NUMBER-REG-01 | Number-only and existing linear measurement arithmetic | Existing behavior/scales/units unchanged | regression |

## Aggregate and Unary Cases

| Case ID | Input/assertion | Expected S118 result | Owner |
| --- | --- | --- | --- |
| AFF-SUM-01 | `sum([10 celsius, 20 celsius])` | `303.15 celsius` | runtime aggregate |
| AFF-SUM-MIX-01 | Sum mixed C/F/K compatible values | Physical sum inverse-converted to first display unit | runtime aggregate |
| AFF-MEAN-01 | Mean mixed C/F/K values | Physical mean inverse-converted to first display unit | runtime aggregate |
| AFF-MINMAX-01 | Mixed C/F/K `min` and `max` | Physical selection returns selected original display unit/value | runtime aggregate |
| AFF-ABSROUND-01 | `abs(-10 celsius)`, `round(10.24 celsius, 1)` | Display values 10/10.2; Celsius unit preserved | runtime unary |
| AFF-NEG-01 | `-10 celsius` | Display value -10; Celsius preserved | runtime unary |
| AFF-FINITE-01 | Literal/runtime attachment, conversion, aggregate, or chart result becomes non-finite | Existing AMX3010/AMX1009/AMX3007 phase-specific failure; no value leak | checker/runtime |

## Compatibility, Chart, Display, and External Cases

| Case ID | Input/assertion | Expected S118 result | Owner |
| --- | --- | --- | --- |
| AFF-INCOMPAT-01 | Temperature and Length conversion/operation/aggregate | Existing AMX3007 incompatible dimensions | checker/runtime |
| AFF-CHART-01 | One series has C/F/K values with Celsius first | Normalized physical values retain Celsius heading/unit | chart |
| AFF-CHART-NULL-01 | Mixed affine series includes nulls | Null placement/order preserved; non-null values normalize | chart |
| AFF-CHART-FIRST-01 | First non-null selected value is Fahrenheit | Output values/headings/descriptors use Fahrenheit display unit | chart |
| AFF-CHART-FAIL-01 | Selected value cannot normalize finitely | AMX3007 chart source/context; no partial output | chart diagnostic |
| AFF-DISPLAY-01 | Scalar/table/narrative display after C/F conversion | Selected display value and unit text; no canonical physical leak | runtime/display |
| AFF-EXTERNAL-01 | JSON/CSV atomic `{ value, unit }` Celsius/Fahrenheit | Exact display number retained; runtime unit includes offset internally | input data |
| AFF-EXTERNAL-ALIAS-01 | External `degC`/`degF` | Alias unit accepted with copied affine metadata | input data |
| AFF-EXTERNAL-COMPOUND-01 | External `celsius / second`, `celsius * meter`, `celsius ^ 1/2` | AMX4004 invalid affine compound expression | external parser diagnostic |
| AFF-EXTERNAL-SHAPE-01 | Extra/missing `value`/`unit`, added `offset`/`scale` | AMX4005 exact shape failure; unchanged output schema | data shape |

## S118 Internal and Integration Cases

| Case ID | Assertion | Expected result | Owner |
| --- | --- | --- | --- |
| S118-UNIT-OFFSET-01 | `unitFromMetadata` for linear/affine/base units | Runtime unit has required finite offset 0 or metadata value and is frozen | unit helper |
| S118-PHYSICAL-01 | Shared physical/inverse helper at edge values | $v*s+o$ and $(p-o)/s$ match golden transforms and reject non-finite results | helper |
| S118-COMPOSE-01 | `composeUnits`/`powerUnit` receive offset-zero linear units | Existing scale/vector/factor/text behavior retained; result offset 0 | helper regression |
| S118-EMPTY-SUM-01 | Empty typed Temperature list `sum` | Existing canonical-unit zero result remains; offset not fabricated | runtime aggregate |
| S118-SI-01 | `libraries/si.amx` unit inventory | 16 dimensions, 50 exported units, four exact additive exports | SI/registry |
| S118-SI-IMPORT-01 | Import `{ ThermodynamicTemperature, kelvin, celsius, fahrenheit, degC, degF }` | Values convert/equality/subtraction use accepted metadata and runtime units | module/runtime |
| S118-OUTPUT-SHAPE-01 | JSON/CSV affine output | Exactly display `value` plus `unit`; no `offset`, `scale`, physical value, or factor metadata | output data |
| S118-CHECKER-FINITE-01 | Literal affine physical overflow | AMX3010 uses `value*scale+offset`, not scale-only | checker |
| S118-GENERATED-RUNTIME-01 | Authorized runtime source build | Generator updates tracked browser runtime if content changes; no hand edit; build/typecheck passes | build audit |
| S118-SHOWTABLE-STAGE-01 | S116 visibility field in runtime chart | Affine normalization does not change `showTable` emission/model value; false table still renders in S118 | scope regression |

## Complete Runtime Envelope

````text
# Sprint 118 affine runtime fixture

```amx
import {
  ThermodynamicTemperature,
  kelvin,
  celsius,
  fahrenheit,
  degC,
  degF
} from "./libraries/si.amx"

let c: ThermodynamicTemperature = 0 celsius
let f: ThermodynamicTemperature = 32 fahrenheit
let k: ThermodynamicTemperature = 273.15 kelvin
let equal: Boolean = c == f and f == k
let delta: ThermodynamicTemperature = 20 celsius - 10 celsius
let mixedDelta: ThermodynamicTemperature = 32 fahrenheit - 20 celsius
let total: ThermodynamicTemperature = sum([10 celsius, 20 celsius])
let inF: ThermodynamicTemperature = c in fahrenheit
```
````

Expected: `equal` true; `delta` 10 C; `mixedDelta` -36 F; `total` 303.15 C;
`inF` 32 F. All bindings retain exact display units.

## Complete Chart Envelope

```amx
type Reading {
  label: String
  temperature: ThermodynamicTemperature
}
let readings: Reading[] = [
  Reading { label = "A", temperature = 0 celsius },
  Reading { label = "B", temperature = 32 fahrenheit },
  Reading { label = "C", temperature = 273.15 kelvin }
]
chart temperatures = column(readings) {
  title: "Temperatures"
  description: "Mixed display units"
  category: label
  series temperature as "Temperature"
}
show temperatures
```

Expected normalized series data `[0, 0, 0]`; headings contain
`Temperature (celsius)` and selected descriptor text `celsius`. Null/order
variants are separate AFF-CHART cases.

## Complete External/SI Fixture

- SI imports expose four new unit names with metadata scales/offsets.
- JSON `{ "value": 20, "unit": "celsius" }` validates and serializes unchanged.
- External `celsius / second` fails AMX4004.
- External `{ "value": 20, "unit": "celsius", "offset": 273.15 }` fails AMX4005.

## Master-Plan Traceability

| Sprint 118 master-plan bullet | Cases | Required status |
| --- | --- | --- |
| Runtime attachment/conversion/arithmetic physical model | AFF-CONV-*, AFF-SUB-*, AFF-EQUAL-01, S118-PHYSICAL-01, S118-CHECKER-FINITE-01 | Focused runtime/checker evidence |
| Reject affine addition/unsupported multiplication/division/powers | AFF-ADD-01, AFF-MUL-01, AFF-DIV-01, AFF-POW-01, AFF-SQRT-01 | Exact AMX3007 evidence |
| Aggregates, unary operations | AFF-SUM-*, AFF-MEAN-01, AFF-MINMAX-01, AFF-ABSROUND-01, AFF-NEG-01, S118-EMPTY-SUM-01 | Runtime evidence and unit retention |
| Chart normalization | AFF-CHART-01, AFF-CHART-NULL-01, AFF-CHART-FIRST-01, AFF-CHART-FAIL-01 | Focused chart/model evidence |
| SI exports | S118-SI-01, S118-SI-IMPORT-01 | Exact 50-unit inventory and conversions |
| External/import/output compatibility | AFF-EXTERNAL-*, S118-OUTPUT-SHAPE-01 | JSON/CSV/import evidence |
| Linear regression and finite behavior | AFF-NUMBER-REG-01, AFF-FINITE-01, AFF-INCOMPAT-01, S118-COMPOSE-01 | Focused checker/runtime regressions |
