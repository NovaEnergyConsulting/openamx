# Sprint 084 V0.14 Grammar and Acceptance Examples

## Status

**Architect-prepared draft.** This is a contract proposal for Sprint 084
review, not an approved V0.14 specification and not evidence that the current
parser accepts these examples. Sprint 084 must verify syntax against the
existing AMX grammar, finalize complete canonical fixture documents, assign
stable source ranges, and obtain the required contract disposition.

The V0.14 master plan remains the scope authority. No example in this file
may reduce or silently extend its confirmed semantics.

| Item | Status |
| --- | --- |
| Confirmed scope in the V0.14 master plan | APPROVED |
| Sprint 084 execution and the file-by-file artifact/evidence plan | APPROVED by user, 2026-10-15 |
| Details beyond the master plan | APPROVED by the user on 2026-10-15, as marked |
| V0.14 implementation and runtime acceptance | NOT RUN; out of scope |
| Contract disposition and Sprint 085 readiness | Contract ACCEPTED by user, 2026-10-15; Sprint 085 READY FOR SEPARATE EXECUTION AUTHORIZATION |

Execution approval authorizes this contract work only. It does not approve
candidate semantics, allocate diagnostic identities, approve release, or
authorize Sprint 085.

## Approved `is` Grammar

Use the existing AMX type-reference notation and declaration visibility rules:

```ebnf
IsExpression ::= Expression "is" TargetType
TargetType   ::= VisibleTypeName TypeSuffix*
TypeSuffix   ::= "[]" | "?"
```

`VisibleTypeName` is resolved in the type/declaration environment, not
evaluated as a runtime value. The target may refer to a supported primitive,
record, enum, list, optional, or declared dimension/Measurement type. Suffix
order follows existing type annotations (for example, `Number?[]` and
`Number[]?` describe different types). The user approved exact reuse of the
existing simple-name/`[]`/`?` grammar and exclusion of qualified names on
2026-10-15.

### Approved precedence and associativity

Place `is` in the existing comparison precedence group: below arithmetic and
Measurement conversion, above logical `and`/`or`, with left associativity for
same-tier comparisons and `is`. This was approved by the user on 2026-10-15.
Unparenthesized chains are parsed left-associatively and then checked by the
ordinary type checker; no dedicated chain form or error is added.

| Relative precedence | Operators/constructs |
| --- | --- |
| Higher | Parentheses, calls, unary operators, `^`, `*` `/` `%`, `+` `-`, Measurement conversion `in` |
| Comparison | Existing comparison operators and `is` |
| Lower | `and`, `or`, conditional `if` expression |

Approved disambiguation cases:

```amx
let arithmeticFirst: Boolean = 1 + 2 * 3 is Number
let explicitTarget: Boolean = (1 + 2) is Number
let logicalLast: Boolean = (1 + 2 is Number) and true
```

Expected grouping: arithmetic before `is`, and `and` after the type predicate.
`IS-PREC-01` and `IS-CHAIN-01` record the complete approved parse shapes.

## Runtime Contract Reference Sketches

The following are short references to behavior; canonical complete fixture
documents and expected bindings appear later in this file.

### `IS-PRIMITIVE-01` and `IS-NONMATCH-01`

```amx
let numberMatch: Boolean = 42 is Number
let stringMismatch: Boolean = 42 is String
```

Expected results: `true`, then `false`; a valid mismatch raises no diagnostic.
`Number` checks the AMX Number runtime value, not a Number-shaped Measurement.

### `IS-RECORD-01` and `IS-RECORD-NESTED-01`

```amx
type Point {
  x: Number
}

type DetailedPoint {
  x: Number
  y: Number
  label: String
}

let detailed: DetailedPoint = DetailedPoint { x = 1, y = 2, label = "P" }
let hasPointShape: Boolean = detailed is Point
```

Expected result: `true`. Record matching is structural; extra runtime fields
are allowed. The locked fixture set must also prove that a missing required
target field or a recursively incompatible nested field returns `false`.

### `IS-OPTIONAL-01`

```amx
type Note {
  text?: String?
}

let absent: Note = Note {}
let absentFieldMatches: Boolean = absent is Note
let nullMatches: Boolean = null is String?
let nullDoesNotMatch: Boolean = null is String
```

Expected results: `true`, `true`, `false`. The fixture set must distinguish
the optional-field presence marker (`field?: T`) from nullable type syntax
(`T?`), including a present null and an absent field where each is valid.

### `IS-LIST-01` and `IS-LIST-EMPTY-01`

```amx
let values: Number[] = [1, 2, 3]
let allNumbers: Boolean = values is Number[]
let empty: Number[] = []
let emptyHasAnyElementType: Boolean = empty is String[]
```

Expected results: `true`, `true`. Every element is checked recursively; an
empty list matches any target list element type. Add a runtime-harness case
for a nonconforming nested element if ordinary typed source cannot express
one without violating existing static checks.

### `IS-ENUM-01` and `IS-ENUM-OVERLAP-01`

```amx
enum State = {
  READY = 1,
  CLOSED = 2
}

let rawValue: Number = 1
let declaredMember: Boolean = rawValue is State
```

Expected result: `true`. The fixture set must include an undeclared primitive
value (`false`) and two distinct enums with a shared underlying member value;
the shared value matches membership in either enum. No nominal enum identity
is introduced.

### `IS-MEASUREMENT-01`

```amx
dimension Length
unit meter: Length
unit centimeter: Length = 0.01 * meter

let longDistance: Length = 1 meter
let shortDistance: Length = 100 centimeter
let matchingDimension: Boolean = shortDistance is Length
```

Expected result: `true`. Add cases for an incompatible dimension and for
equivalent physical dimensions represented with different unit scales. The
comparison uses physical dimension vectors, not unit names or scale.

The contract must also define a valid, expressible dimensionless Measurement
fixture for the math functions. If current dimension algebra cannot represent
one in an ordinary AMX document, record the exact required fixture mechanism
and request a product decision rather than substituting a plain Number.

## Candidate Mathematical Cases

The implementation matrix must individually cover all functions, not just a
representative of each family:

`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`,
`asinh`, `acosh`, `atanh`, `ln`, `log`, and `exp`.

```amx
let halfTurnQuarterSine: Number = sin(PI / 2)
let naturalLog: Number = ln(E)
let commonLog: Number = log(100)
let exponential: Number = exp(1)
```

Expected values are approximately `1`, `1`, `2`, and `E`. `PI` and `E` are
numeric constants corresponding to the runtime's IEEE-754 Number values.
Trigonometric inputs and inverse-trigonometric outputs use radians; `ln` is
natural logarithm and `log` is base 10.

Required invalid-domain cases include `asin(2)`, `acos(-2)`, `acosh(0)`,
`atanh(1)`, `ln(0)`, and `log(-1)`. Also cover a non-finite result (for
example, exponential overflow), non-finite input propagation, wrong
dimensioned Measurement input, and a valid dimensionless Measurement input.
Each error must be explicit and source-located; it must not return `NaN`,
infinity, or a success-shaped fallback.

For Measurement extensions, the final examples must cover compatible and
incompatible dimensions, unit conversion, and result units for each affected
existing function. The master-plan rules are: compatible Measurements may be
converted; aggregates use the first Measurement's unit; `min` and `max`
return the selected Measurement in its original unit; established
dimension-preserving and dimension-transforming behavior is retained.

## Candidate Text Cases

```amx
let codePoints: Number = len("A🙂B")
let listLength: Number = len([1, 2, 3])
let trimmed: String = trim("  AMX\t")
let firstTwo: String = left("A🙂B", 2)
let lastTwo: String = right("A🙂B", 2)
let defaultLeft: String = left("AMX")
let emptyRight: String = right("AMX", 0)
```

Expected values: `3`, `3`, `"AMX"`, `"A🙂"`, `"🙂B"`, `"A"`, and `""`.
String length and slicing count Unicode code points, not UTF-16 code units or
grapheme clusters; a combining sequence counts by its constituent code
points. `left`/`right` default the count to `1`; counts must be finite,
non-negative integers. `trim` uses the approved Unicode 15.1 `White_Space`
set, listed exactly below.

## Approved Numeric Formatting Examples

These outputs illustrate the user-approved numeric subset using the default
`en-US` locale.

| Expression | Approved output |
| --- | --- |
| `format(1234.5, "#,##0.00")` | `"1,234.50"` |
| `format(-1234.5, "#,##0.00")` | `"-1,234.50"` |
| `format(0.125, "0.0%")` | `"12.5%"` |
| `format(1234.5, "$#,##0.00")` | `"$1,234.50"` |
| `format(1.25 meter, "0.00")` | `"1.25 meter"` |

The approved subset is finite. Date/time and text patterns, colors, and
conditional sections are excluded. The exact grammar, locales, separators,
rounding/tie behavior, currency literals, negative zero, Measurement suffix,
and unsupported-pattern/locale diagnostics are recorded below.

## Fixture Completion Rules

- Convert every sketch into a complete canonical source fixture with a stable
  ID and exact expected value or diagnostic.
- Record source ranges against the complete document, including front matter
  and executable fences. Use 1-based lines/columns, UTF-16 code-unit columns,
  and exclusive diagnostic ends.
- Link each fixture ID to `diagnostic-matrix.md` and
  `requirement-test-matrix.md`; do not duplicate or drift expected outcomes.
- Mark whether a fixture is valid against the approved V0.14 contract,
  currently accepted by production, or requires a runtime harness. These are
  separate facts.

## Builder Contract Recommendation and Accepted Product Decisions

This section records confirmed master-plan/V0.9 scope and the additional
product decisions explicitly approved by the user on 2026-10-15. It is not
the separate final Sprint 084 contract disposition.

### `is`

| Topic | Recommendation | Status |
| --- | --- | --- |
| Result and mismatch | Boolean result; a well-formed target mismatch, including `null` against a non-nullable target, returns `false`. | APPROVED by master plan |
| Target namespace | Resolve a type reference, not a value expression, using established declaration order and import visibility. Unknown/invisible/non-type names diagnose. | APPROVED by master plan |
| Target spelling | Reuse `parseTypeReference` forms: one visible simple type name followed by existing `[]` and `?` suffixes; preserve suffix order and do not add qualified names. | APPROVED by user, 2026-10-15 |
| Precedence | Add `is` to the existing comparison precedence level (currently `==`, `!=`, `<`, `<=`, `>`, `>=` at precedence 2), below `in` conversion (2.5) and arithmetic, above `and`/`or`; make same-level comparisons left-associative. | APPROVED by user, 2026-10-15 |
| Comparison chains | Parse unparenthesized same-tier operators left-associatively and apply ordinary type checking; do not add a dedicated chain syntax/error. | APPROVED by user, 2026-10-15 |
| Record match | Structural recursive match: all required target fields must be present and conform; extra runtime fields are allowed; optional target fields may be absent; a present value must conform to the field type. | APPROVED by master plan |
| Lists and enums | Check every list element recursively; empty lists match any element target. Enum matching tests the underlying primitive against declared member values, never nominal enum identity. | APPROVED by master plan |
| Measurements | Compare dimension vectors, not unit names or scale. A well-formed different dimension returns `false`. | APPROVED by master plan |
| Flow narrowing | `is` does not refine the static type in either branch. | APPROVED by master plan |
| `Number` versus dimensionless Measurement | Treat the runtime Number and a Measurement with an empty dimension vector as distinct representations; the former does not match a Measurement target. | APPROVED by user, 2026-10-15 |

The current parser's type-reference parser accepts a simple ASCII identifier
plus repeated `[]`/`?` suffixes, and current type resolution follows
source-order/import registries. These observations establish compatibility
constraints; the user separately approved reusing that grammar.

### Math and Measurement

All 15 new functions are approved as unary `Number -> Number` functions,
accepting a dimensionless Measurement as an additional input and returning an
ordinary unitless Number. `PI` and `E` are ordinary Number constants equal to
the runtime IEEE-754 values for π and e. Radians, `ln` as
natural logarithm, `log` as base 10, and explicit failures for invalid domains
or non-finite inputs/results are APPROVED by the master plan.

| Function(s) | Mathematical input domain | Boundary / finite notes | Status |
| --- | --- | --- | --- |
| `sin`, `cos`, `tan` | Finite real inputs | Use IEEE-754 evaluation; no epsilon pole check for `tan`; fail only for a non-finite result. | APPROVED by user, 2026-10-15 |
| `asin`, `acos` | `[-1, 1]` | Endpoints are valid. | APPROVED by user, 2026-10-15 |
| `atan` | All finite reals | Output in radians. | APPROVED by user, 2026-10-15 |
| `sinh`, `cosh`, `tanh`, `asinh` | All finite reals | Overflow/non-finite results are errors, not values. | APPROVED by user, 2026-10-15 |
| `acosh` | Finite `x >= 1` | `1` is valid. | APPROVED by user, 2026-10-15 |
| `atanh` | Finite `-1 < x < 1` | Endpoints are invalid. | APPROVED by user, 2026-10-15 |
| `ln`, `log` | Finite `x > 0` | Zero and negatives are invalid. | APPROVED by user, 2026-10-15 |
| `exp` | All finite reals | An infinite result is an error. | APPROVED by user, 2026-10-15 |

Approved expected-value comparison is
`abs(actual - expected) <= max(1e-12, abs(expected) * 1e-12)`. The tolerance
and tangent pole policy were approved by the user on 2026-10-15.

| Binding in `MATH-TEXT-FORMAT-VALID-01` | Approved expected value |
| --- | --- |
| `sine`, `cosine`, `tangent` | `1`, `1`, `0` |
| `tangentPoleApproximation` | Finite IEEE-754 approximation; no epsilon-based pole diagnostic |
| `arcSine`, `arcCosine`, `arcTangent` | `PI / 2`, `0`, `PI / 4` |
| `hyperbolicSine`, `hyperbolicCosine`, `hyperbolicTangent` | `0`, `1`, `0` |
| `inverseHyperbolicSine`, `inverseHyperbolicCosine`, `inverseHyperbolicTangent` | `0`, `0`, `0` |
| `naturalLog`, `commonLog`, `exponential` | `1`, `2`, `E` |
| `dimensionlessMeasurementSine` | `sin(2)` |
| `PI`, `E` | `3.141592653589793`, `2.718281828459045` |

Each function takes exactly one required Number argument, with the
dimensionless Measurement input exception stated above; each returns Number.
New math function type and arity errors use the approved existing `AMX3002`
and `AMX3004` categories/messages recorded in `diagnostic-matrix.md`.

| Existing function | V0.9-compatible Measurement disposition |
| --- | --- |
| `sum`, `mean` | Require compatible dimensions; convert to the first element's unit; preserve that unit. Existing empty-list behavior remains: typed Measurement `sum` uses its canonical base-unit expression; `mean` errors. |
| `min`, `max` | Require compatible dimensions, compare physical values, and return the selected Measurement in its original unit. Empty lists continue to error. |
| `abs`, `round` | Preserve the Measurement unit; `round` operates on the displayed numeric value. Preserve the existing exact behavior: omitted digits are 0, fractional digits are truncated toward zero, and `Math.round` determines ties. |
| `sqrt` | Preserve established dimensional-square-root rules; reject negative domains and non-integral resulting dimension exponents. |
| `pow` | Preserve the V0.9 integer-literal exponent rule for Measurement bases, including dimension and unit transformation. |

These are APPROVED compatibility requirements from the V0.9 contract/master
plan. `round`'s exact existing tie/digit behavior was separately approved by
the user on 2026-10-15. Existing focused regression source is in
`tests/measurements.test.ts`; it is not V0.14 implementation evidence.

The approved source-language fixture for a dimensionless Measurement is
`unit ratio = meter / meter` followed by `2 ratio`. Read-only type-checker
inspection confirms derived units may normalize to an empty vector while a
direct attachment retains Measurement type. The user approved this fixture
form on 2026-10-15. Do not substitute `Number` or an injected runtime object.

### Text

| Topic | Recommendation | Status |
| --- | --- | --- |
| `len` | `len(String) -> Number`; `len(List<T>) -> Number`; count Unicode code points for strings and elements for lists. | APPROVED by master plan |
| `left`/`right` | `left(text: String, count?: Number) -> String` and `right(text: String, count?: Number) -> String`; omitted count is 1; zero returns `""`; count greater than the code-point length returns the whole string; negative, non-integral, non-finite, or non-Number counts diagnose. | APPROVED by user, 2026-10-15 |
| Unicode unit | Count/slice Unicode code points, not UTF-16 code units or grapheme clusters; combining sequences count as multiple code points. | APPROVED by master plan |
| `trim` whitespace | Use exactly Unicode 15.1 `White_Space` at either end; preserve internal characters. | APPROVED by user, 2026-10-15 |

The approved Unicode 15.1 `White_Space` set is:
U+0009–U+000D, U+0020, U+0085, U+00A0, U+1680, U+2000–U+200A,
U+2028–U+2029, U+202F, U+205F, and U+3000. U+FEFF and U+180E are excluded.

### Numeric `format`

The following bounded pattern grammar and output rules were approved by the
user on 2026-10-15.

```ebnf
FormatPattern ::= [CurrencyPrefix] IntegerPattern [DecimalPart] [Percent]
CurrencyPrefix ::= "$" | "€" | "£"
IntegerPattern ::= "0" | "#,##0"
DecimalPart ::= "." "0"{1,6}
Percent ::= "%"
```

Approved behavior: only the listed prefix literals are supported; grouping
uses groups of three; percent scales the displayed numeric value by 100;
fraction digits are mandatory and limited to six; other characters, quoted
text, scientific notation, multiple sections, dates, and text patterns are
rejected. Supported locales are exactly `en-US`, `de-DE`, and `fr-FR`, with fixed
`en-US` default and no fallback; locale affects decimal/group separators,
while currency prefixes remain literal pattern characters. Round decimal
ties half away from zero based on the Number's shortest round-trippable
decimal spelling; place a minus sign before any currency prefix; render
negative zero as positive zero. Apply the same numeric pattern to a
Measurement's displayed numeric value, then append one ASCII space and its
display unit text.

| Locale | Decimal separator | Group separator | Approved example for `format(1234.5, "#,##0.00", locale)` |
| --- | --- | --- | --- |
| `en-US` | `.` | `,` | `"1,234.50"` |
| `de-DE` | `,` | `.` | `"1.234,50"` |
| `fr-FR` | `,` | U+202F narrow no-break space | `"1 234,50"` |

Approved en-US boundary outputs are `format(0.125, "0.0%")` =
`"12.5%"`, `format(-1234.5, "$#,##0.00")` = `"-$1,234.50"`, and
`format(-0, "0.00")` = `"0.00"`. For Measurements,
`format(1.25 meter, "0.00", "en-US")` outputs `"1.25 meter"`.

The exact grammar, locale allowlist/separators, rounding, `-0`, currency
prefix interpretation, percent/currency behavior for Measurements, and
Measurement suffix rule were approved by the user on 2026-10-15. No locale
fallback is permitted.

## Source-Range Status

The 37 ASCII and one non-BMP UTF-16 candidate diagnostic spans against
complete fixture envelopes were checked by a one-off coordinate assertion
and matched. The CRLF variant retained the expected line/column location.
Two existing focused tests also passed for editor UTF-16/CRLF range mapping
and parser LF/CRLF diagnostics. This does not test V0.14 parser/runtime
diagnostics, which remain NOT RUN; no current implementation result is
claimed as V0.14 feature evidence.

## Canonical Fixture Documents

Every `text` block below is one complete source fixture document. The outer
four-backtick fence is presentation only; the inner front matter and `amx`
fence are part of the fixture source. Coordinates are 1-based, and the
half-open end column is exclusive. These are contract fixtures, not claims
that the current parser/runtime accepts or implements V0.14.

### `IS-VALID-01` — Structural and primitive matches

Expected bindings: `primitiveMatch=true`, `primitiveMismatch=false`,
`recordMatch=true`, `missingRequiredField=false`, `nullableNull=true`,
`nonNullableNull=false`, `absentFieldMatch=true`, `presentNullMatches=true`,
`allNumbers=true`, `emptyAnyList=true`, `nestedListMismatch=false`,
`enumMember=true`, `enumNonMember=false`, `enumOverlap=true`,
`nestedRecordMismatch=false`, `measurementMatch=true`, and
`measurementMismatch=false`. `dimensionlessMatches=true` while
`numberDoesNotMatchDimensionless=false`. The record case permits extra
runtime fields.

````text
---
fixture: IS-VALID-01
---
```amx
type Point {
  x: Number
}
type DetailedPoint {
  x: Number
  y: Number
}
type Note {
  text?: String?
}
type TextChild {
  label: String
}
type NumericChild {
  label: Number
}
type TextTree {
  child: TextChild
}
type NumericTree {
  child: NumericChild
}
enum State = {
  READY = 1,
  CLOSED = 2
}
enum OtherState = {
  STARTED = 1
}
dimension Length
dimension Time
dimension Dimensionless = Length / Length
unit meter: Length
unit centimeter = 0.01 * meter
unit second: Time
unit ratio = meter / meter
let primitiveMatch = 42 is Number
let primitiveMismatch = 42 is String
let detailed: DetailedPoint = DetailedPoint { x = 1, y = 2 }
let recordMatch = detailed is Point
let minimal: Point = Point { x = 1 }
let missingRequiredField = minimal is DetailedPoint
let absentNote: Note = Note {}
let absentFieldMatch = absentNote is Note
let presentNull: Note = Note { text = null }
let presentNullMatches = presentNull is Note
let nullableNull = null is String?
let nonNullableNull = null is String
let values: Number[] = [1, 2]
let allNumbers = values is Number[]
let nestedStrings: String[][] = [["x"]]
let nestedListMismatch = nestedStrings is Number[][]
let empty: Number[] = []
let emptyAnyList = empty is String[]
let enumMember = 1 is State
let enumNonMember = 9 is State
let enumOverlap = 1 is State and 1 is OtherState
let nestedTextTree: TextTree = TextTree { child = TextChild { label = "x" } }
let nestedRecordMismatch = nestedTextTree is NumericTree
let longDistance: Length = 1 meter
let shortDistance: Length = 100 centimeter
let measurementMatch = shortDistance is Length
let measurementMismatch = shortDistance is Time
let dimensionlessMeasurement = 2 ratio
let dimensionlessMatches = dimensionlessMeasurement is Dimensionless
let numberDoesNotMatchDimensionless = 2 is Dimensionless
```
````

`IS-VALID-01` covers overlapping enum values, nested lists/records,
present-null optional fields, primitive mismatch, and dimensionless
Measurement distinction. `IS-TARGET-IMPORT-01`, `IS-TARGET-FORWARD-01`, and
`IS-NARROW-01` are separate complete fixtures.

### `MATH-TEXT-FORMAT-VALID-01` — Representative positive values

Expected math values use the approved tolerance above. The `ratio` unit is
the product-approved source fixture form for a dimensionless Measurement;
runtime acceptance remains NOT RUN.
Expected text outputs are `3`, `3`, `"A🙂"`, `"🙂B"`, `"A"`, `""`, and
`"AMX"`; the combining sequence `"é"` has length `2`; oversized slices
return the complete source string; escaped tab/newline/carriage return and
the approved non-ASCII edge whitespace trim to `"AMX"`. Formatter outputs
follow the approved numeric grammar/locale policy and expected values below.

````text
---
fixture: MATH-TEXT-FORMAT-VALID-01
---
```amx
dimension Length
unit meter: Length
unit ratio = meter / meter
let ratioValue = 2 ratio
let sine = sin(PI / 2)
let cosine = cos(0)
let tangent = tan(0)
let tangentPoleApproximation = tan(PI / 2)
let arcSine = asin(1)
let arcCosine = acos(1)
let arcTangent = atan(1)
let hyperbolicSine = sinh(0)
let hyperbolicCosine = cosh(0)
let hyperbolicTangent = tanh(0)
let inverseHyperbolicSine = asinh(0)
let inverseHyperbolicCosine = acosh(1)
let inverseHyperbolicTangent = atanh(0)
let naturalLog = ln(E)
let commonLog = log(100)
let exponential = exp(1)
let dimensionlessMeasurementSine = sin(ratioValue)
let stringLength = len("A🙂B")
let listLength = len([1, 2, 3])
let firstTwo = left("A🙂B", 2)
let lastTwo = right("A🙂B", 2)
let defaultLeft = left("AMX")
let emptyRight = right("AMX", 0)
let oversizedLeft = left("A🙂B", 99)
let combiningLength = len("é")
let controlTrim = trim("\t\nAMX\r")
let trimmed = trim(" AMX ")
let grouped = format(1234.5, "#,##0.00", "en-US")
let defaultLocale = format(1234.5, "#,##0.00")
let maxPrecision = format(1.234567, "0.000000", "en-US")
let groupedGerman = format(1234.5, "#,##0.00", "de-DE")
let groupedFrench = format(1234.5, "#,##0.00", "fr-FR")
let percent = format(0.125, "0.0%", "en-US")
let currency = format(1234.5, "$#,##0.00", "en-US")
let currencyMeasurement = format(1.25 meter, "$0.00", "en-US")
let euroPrefix = format(1, "€0.00", "en-US")
let poundPrefix = format(1, "£0.00", "en-US")
let negativeCurrency = format(-1234.5, "$#,##0.00", "en-US")
let roundedTie = format(1.125, "0.00", "en-US")
let negativeTie = format(-1.125, "0.00", "en-US")
let negativeZero = format(-0, "0.00", "en-US")
let formattedMeasurement = format(1.25 meter, "0.00", "en-US")
let percentMeasurement = format(1.25 meter, "0.0%", "en-US")
let scaledMeasurement = format(100 centimeter, "0.00", "en-US")
```
````

| Binding | Approved expected output |
| --- | --- |
| `stringLength`, `listLength`, `combiningLength` | `3`, `3`, `2` |
| `firstTwo`, `lastTwo`, `defaultLeft`, `emptyRight`, `oversizedLeft` | `"A🙂"`, `"🙂B"`, `"A"`, `""`, `"A🙂B"` |
| `controlTrim`, `trimmed` | `"AMX"`, `"AMX"` |
| `grouped`, `defaultLocale`, `groupedGerman`, `groupedFrench` | `"1,234.50"`, `"1,234.50"`, `"1.234,50"`, `"1 234,50"` |
| `maxPrecision` | `"1.234567"` |
| `percent`, `currency`, `euroPrefix`, `poundPrefix` | `"12.5%"`, `"$1,234.50"`, `"€1.00"`, `"£1.00"` |
| `negativeCurrency`, `roundedTie`, `negativeTie`, `negativeZero` | `"-$1,234.50"`, `"1.13"`, `"-1.13"`, `"0.00"` |
| `formattedMeasurement`, `percentMeasurement`, `currencyMeasurement`, `scaledMeasurement` | `"1.25 meter"`, `"125.0% meter"`, `"$1.25 meter"`, `"100.00 centimeter"` |

### `MEAS-STDLIB-VALID-01` — V0.9-compatible Measurement standard library

This fixture restates the approved V0.9 Measurement rules and the V0.14
standard-library compatibility requirement. It does not claim any runtime
test has been run in Sprint 084.

````text
---
fixture: MEAS-STDLIB-VALID-01
---
```amx
dimension Length
unit meter: Length
unit kilometer = 1000 * meter
unit square_meter = meter ^ 2
let distances: Length[] = [1 kilometer, 500 meter]
let total = sum(distances)
let average = mean(distances)
let minimum = min(distances)
let maximum = max(distances)
let absolute = abs(-2 kilometer)
let rounded = round(1.236 kilometer, 2)
let areaRoot = sqrt(9 square_meter)
let areaPower = pow(2 meter, 2)
let reciprocal = pow(2 meter, -1)
let empty: Length[] = []
let emptyTotal = sum(empty)
```
````

| Binding | Approved expected value/unit |
| --- | --- |
| `total`, `average` | `1.5 kilometer`, `0.75 kilometer` |
| `minimum`, `maximum` | `500 meter`, `1 kilometer` (selected original units) |
| `absolute`, `rounded` | `2 kilometer`, `1.24 kilometer` |
| `areaRoot`, `areaPower`, `reciprocal` | `3 meter`, `4 meter ^ 2`, `0.5 1 / meter` |
| `emptyTotal` | `0 meter` (typed empty Measurement sum in canonical base unit) |

## Invalid Fixture Documents and Primary Ranges

The ranges below are exact against each complete fixture document.
`diagnostic-matrix.md` records the matching identity/message. The user
allocated `AMXSL001` through `AMXSL006` on 2026-10-15; those new identities
must still pass the recorded collision check and are not implemented here.

### `IS-SYNTAX-01` — Missing target after `is`

Candidate primary location: line 5, column 18, zero-width cursor position.

````text
---
fixture: IS-SYNTAX-01
---
```amx
let result = 1 is
```
````

### `IS-TARGET-UNKNOWN-01` — Unknown type

Candidate primary range: line 5, columns 19-26 (`Missing`).

````text
---
fixture: IS-TARGET-UNKNOWN-01
---
```amx
let result = 1 is Missing
```
````

### `IS-TARGET-NONTYPE-01` — Value name used as a type

Candidate primary range: line 6, columns 19-28 (`candidate`).

````text
---
fixture: IS-TARGET-NONTYPE-01
---
```amx
let candidate = 1
let result = 1 is candidate
```
````

### `MATH-ARITY-01` — Missing argument

Candidate primary range: line 5, columns 14-19 (`sin()`).

````text
---
fixture: MATH-ARITY-01
---
```amx
let result = sin()
```
````

### Math domain boundary fixtures

Each case is an invalid-domain fixture. The primary range is the complete
call on line 5. All use the approved `AMXSL001` math-domain diagnostic.

````text
---
fixture: MATH-DOM-ASIN-01
---
```amx
let result = asin(2)
```
````

`MATH-DOM-ASIN-01`: line 5, columns 14-21 (`asin(2)`).

````text
---
fixture: MATH-DOM-ACOS-01
---
```amx
let result = acos(-2)
```
````

`MATH-DOM-ACOS-01`: line 5, columns 14-22 (`acos(-2)`).

````text
---
fixture: MATH-DOM-ACOSH-01
---
```amx
let result = acosh(0)
```
````

`MATH-DOM-ACOSH-01`: line 5, columns 14-22 (`acosh(0)`).

````text
---
fixture: MATH-DOM-ATANH-01
---
```amx
let result = atanh(1)
```
````

`MATH-DOM-ATANH-01`: line 5, columns 14-22 (`atanh(1)`).

````text
---
fixture: MATH-DOM-LN-01
---
```amx
let result = ln(0)
```
````

`MATH-DOM-LN-01`: line 5, columns 14-19 (`ln(0)`).

````text
---
fixture: MATH-DOM-LOG-01
---
```amx
let result = log(-1)
```
````

`MATH-DOM-LOG-01`: line 5, columns 14-21 (`log(-1)`).

### `MATH-FINITE-01` — Non-finite result

Candidate primary range: line 5, columns 14-24 (`exp(10000)`).

````text
---
fixture: MATH-FINITE-01
---
```amx
let result = exp(10000)
```
````

### `MATH-NONFINITE-INPUT-01` — Non-finite input

Candidate primary range: line 6, columns 14-27 (`sin(infinite)`).

````text
---
fixture: MATH-NONFINITE-INPUT-01
---
```amx
let infinite = 1 / 0
let result = sin(infinite)
```
````

### `MATH-MEASUREMENT-DIM-01` — Dimensioned Measurement input

Candidate primary range: line 7, columns 18-25 (`1 meter`).

````text
---
fixture: MATH-MEASUREMENT-DIM-01
---
```amx
dimension Length
unit meter: Length
let result = sin(1 meter)
```
````

### `MEAS-COMPAT-01` — Incompatible Measurement list elements

Candidate primary range: line 9, columns 28-36 (`1 second`).

````text
---
fixture: MEAS-COMPAT-01
---
```amx
dimension Length
dimension Time
unit meter: Length
unit second: Time
let result = sum([1 meter, 1 second])
```
````

### Text count fixtures

The primary range is the count expression. These fixtures use the approved
`AMXSL003: Invalid text slice count` diagnostic.

````text
---
fixture: TEXT-COUNT-NEG-01
---
```amx
let result = left("A", -1)
```
````

`TEXT-COUNT-NEG-01`: line 5, columns 24-26 (`-1`).

````text
---
fixture: TEXT-COUNT-FRACTION-01
---
```amx
let result = left("A", 1.5)
```
````

`TEXT-COUNT-FRACTION-01`: line 5, columns 24-27 (`1.5`).

````text
---
fixture: TEXT-COUNT-NONFINITE-01
---
```amx
let infinite = 1 / 0
let result = right("A", infinite)
```
````

`TEXT-COUNT-NONFINITE-01`: line 6, columns 25-33 (`infinite`).

### Format failure fixtures

Ranges identify the complete function call or argument token. New format
pattern, locale, and finite-input diagnostics are recorded with exact
messages in `diagnostic-matrix.md`.

````text
---
fixture: FORMAT-ARITY-01
---
```amx
let result = format(1)
```
````

`FORMAT-ARITY-01`: line 5, columns 14-23 (`format(1)`).

````text
---
fixture: FORMAT-TYPE-01
---
```amx
let result = format("text", "0")
```
````

`FORMAT-TYPE-01`: line 5, columns 21-27 (`"text"`).

````text
---
fixture: FORMAT-MALFORMED-01
---
```amx
let result = format(1, "0.0.0")
```
````

`FORMAT-MALFORMED-01`: line 5, columns 24-31 (`"0.0.0"`).

````text
---
fixture: FORMAT-UNSUPPORTED-01
---
```amx
let result = format(1, "yyyy-mm-dd")
```
````

`FORMAT-UNSUPPORTED-01`: line 5, columns 24-36 (`"yyyy-mm-dd"`).

````text
---
fixture: FORMAT-LOCALE-UNSUPPORTED-01
---
```amx
let result = format(1, "0", "zz-ZZ")
```
````

`FORMAT-LOCALE-UNSUPPORTED-01`: line 5, columns 29-36 (`"zz-ZZ"`).

````text
---
fixture: FORMAT-FINITE-01
---
```amx
let infinite = 1 / 0
let result = format(infinite, "0")
```
````

`FORMAT-FINITE-01`: line 6, columns 21-29 (`infinite`).

The source fixtures cover the approved precedence/chain, import and
source-order resolution, nested record/list/enum matching, Unicode
code-point operations, approved locale outputs, formatter boundaries,
Measurement units/results, and identified diagnostic categories. They remain
contract fixtures only: V0.14 runtime, formatter, diagnostic, and end-to-end
implementation acceptance is NOT RUN and belongs to authorized downstream
sprints.

### Additional invalid fixtures required by the diagnostic matrix

The following source documents separate malformed syntax from resolved-type
failures, ordinary type/arity errors, and malformed versus unsupported locale
values. Their identities/messages remain subject to the dispositions in
`diagnostic-matrix.md`.

````text
---
fixture: IS-SYNTAX-SUFFIX-01
---
```amx
let result = 42 is Number??
```
````

Candidate primary range: line 5, columns 27-28 (second `?`).

````text
---
fixture: MATH-TYPE-01
---
```amx
let result = sin("x")
```
````

Candidate primary range: line 5, columns 18-21 (`"x"`).

````text
---
fixture: TEXT-TYPE-01
---
```amx
let result = len(1)
```
````

Candidate primary range: line 5, columns 18-19 (`1`).

````text
---
fixture: FORMAT-LOCALE-INVALID-01
---
```amx
let result = format(1, "0", "not a locale")
```
````

Candidate primary range: line 5, columns 29-43 (`"not a locale"`).

````text
---
fixture: TEXT-ARITY-01
---
```amx
let result = len()
```
````

Candidate primary range: line 5, columns 14-19 (`len()`).

````text
---
fixture: TEXT-COUNT-TYPE-01
---
```amx
let result = left("A", "one")
```
````

Candidate primary range: line 5, columns 24-29 (`"one"`).

### `IS-PREC-01` — Approved precedence against arithmetic, conversion, comparison, logic, and conditionals

Approved parse: arithmetic before `is`, conversion before `is`, comparison
operators and `is` at one left-associative level, logical operators below
them, and conditional expressions at the lowest level. Expected values:
`arithmetic`, `conversion`, `comparison`, `logical`, and `conditional` are
all `true`.

````text
---
fixture: IS-PREC-01
---
```amx
dimension Length
unit meter: Length
let arithmetic = 1 + 2 * 3 is Number
let conversion = 1 meter in meter is Length
let comparison = 1 + 2 * 3 > 6 is Boolean
let logical = 1 + 2 * 3 is Number and true
let conditional = if 1 + 2 * 3 is Number then true else false
```
````

### `IS-CHAIN-01` — Approved same-precedence associativity

Approved parse: `(1 is Number) == true`; expected value `true`. Unparenthesized
same-tier chains are left-associative and then type-checked normally.

````text
---
fixture: IS-CHAIN-01
---
```amx
let result = 1 is Number == true
```
````

### `IS-NARROW-01` — Predicate does not narrow a nullable value

Expected contract behavior: static type checking rejects assigning `maybe`
to non-nullable `String` inside the true branch; `is` does not narrow it.
Primary range is line 7, columns 23-28 (`maybe`); expected existing
`AMX3002` message is `Expected String, got String?`.

````text
---
fixture: IS-NARROW-01
---
```amx
let maybe: String? = null
if maybe is String {
  let value: String = maybe
}
```
````

### `IS-TARGET-FORWARD-01` — Forward target type

Expected static failure: `AMX3001`, `Unknown type 'Later'`. Primary range:
line 5, columns 19-24 (`Later`).

````text
---
fixture: IS-TARGET-FORWARD-01
---
```amx
let result = 1 is Later
type Later {
  value: Number
}
```
````

### `IS-TARGET-IMPORT-01` — Visible imported target type

Expected result: `true`. Both files are part of this fixture; the import
must expose the exported type before the expression uses it.

`entry.amx`:

````text
---
fixture: IS-TARGET-IMPORT-01
file: entry.amx
---
```amx
import { Point } from "./library.amx"
let value = Point { x = 1 }
let result = value is Point
```
````

`library.amx`:

````text
---
file: library.amx
---
```amx
export type Point {
  x: Number
}
```
````

### `IS-TARGET-UNICODE-UTF16-01` — Supplementary character before a diagnostic

Candidate primary range: line 5, columns 22-29 (`Missing`), counting the
supplementary emoji as two UTF-16 code units. A CRLF-encoded copy of
`IS-TARGET-UNKNOWN-01` must retain its line 5, columns 19-26 location.

````text
---
fixture: IS-TARGET-UNICODE-UTF16-01
---
```amx
let result = "🙂" is Missing
```
````

### `MATH-SQRT-REGRESSION-01` — Negative Number square root

Expected existing runtime diagnostic: `AMX2005`, `sqrt of negative value`.
Candidate primary range: line 5, columns 14-22 (`sqrt(-1)`).

````text
---
fixture: MATH-SQRT-REGRESSION-01
---
```amx
let result = sqrt(-1)
```
````

### `MATH-SQRT-MEAS-REGRESSION-01` — Negative Measurement square root

Expected existing static diagnostic: `AMX3010`,
`sqrt of a negative measurement value`. Candidate primary call range:
line 8, columns 14-35.

````text
---
fixture: MATH-SQRT-MEAS-REGRESSION-01
---
```amx
dimension Length
unit meter: Length
unit square_meter = meter ^ 2
let result = sqrt(-1 square_meter)
```
````

### Empty Measurement aggregate regression fixtures

Each fixture preserves the existing `AMX2004` runtime diagnostic and is
expected to fail at the call. Candidate primary ranges are on line 8.

````text
---
fixture: MEAS-EMPTY-MEAN-01
---
```amx
dimension Length
unit meter: Length
let empty: Length[] = []
let result = mean(empty)
```
````

`MEAS-EMPTY-MEAN-01`: `AMX2004`, `mean of empty list`, `L8:C14-25`.

````text
---
fixture: MEAS-EMPTY-MIN-01
---
```amx
dimension Length
unit meter: Length
let empty: Length[] = []
let result = min(empty)
```
````

`MEAS-EMPTY-MIN-01`: `AMX2004`, `min of empty list`, `L8:C14-24`.

````text
---
fixture: MEAS-EMPTY-MAX-01
---
```amx
dimension Length
unit meter: Length
let empty: Length[] = []
let result = max(empty)
```
````

`MEAS-EMPTY-MAX-01`: `AMX2004`, `max of empty list`, `L8:C14-24`.

### `FORMAT-PRECISION-OVERFLOW-01` — Too many mandatory fractional digits

Expected diagnostic: `AMXSL004`, `Incorrect formatting pattern`.
Candidate primary range: line 5, columns 31-42 (`"0.0000000"`).

````text
---
fixture: FORMAT-PRECISION-OVERFLOW-01
---
```amx
let result = format(1.234567, "0.0000000")
```
````
