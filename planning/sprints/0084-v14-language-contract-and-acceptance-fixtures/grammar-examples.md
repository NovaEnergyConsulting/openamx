# Sprint 084 V0.14 Grammar and Acceptance Examples

## Status

**Architect-prepared draft.** This is a contract proposal for Sprint 084
review, not an approved V0.14 specification and not evidence that the current
parser accepts these examples. Sprint 084 must verify syntax against the
existing AMX grammar, finalize complete canonical fixture documents, assign
stable source ranges, and obtain the required contract disposition.

The V0.14 master plan remains the scope authority. No example in this file
may reduce or silently extend its confirmed semantics.

## Candidate `is` Grammar

Use the existing AMX type notation and declaration visibility rules:

```ebnf
IsExpression ::= Expression "is" TargetType
TargetType   ::= VisibleTypeName TypeSuffix*
TypeSuffix   ::= "[]" | "?"
```

`VisibleTypeName` is resolved in the type/declaration environment, not
evaluated as a runtime value. The target may refer to a supported primitive,
record, enum, list, optional, or declared dimension/Measurement type. Suffix
order follows existing type annotations (for example, `Number?[]` and
`Number[]?` describe different types). The Builder must confirm the exact
qualified-name and suffix grammar against the parser/type checker before
locking this outline.

### Proposed precedence

The initial recommendation is to place `is` in the existing comparison
precedence group: below arithmetic and Measurement conversion, above logical
`and`/`or`, with the existing comparison associativity. Parentheses are
recommended where multiple comparisons would otherwise be ambiguous. Sprint
084 must lock and test this explicitly.

| Relative precedence | Operators/constructs |
| --- | --- |
| Higher | Parentheses, calls, unary operators, `^`, `*` `/` `%`, `+` `-`, Measurement conversion `in` |
| Comparison | Existing comparison operators and proposed `is` |
| Lower | `and`, `or`, conditional `if` expression |

Candidate disambiguation cases:

```amx
let arithmeticFirst: Boolean = 1 + 2 * 3 is Number
let explicitTarget: Boolean = (1 + 2) is Number
let logicalLast: Boolean = (1 + 2 is Number) and true
```

Expected behavior under the proposal: arithmetic groups before `is`, and
`and` groups after the type predicate. The final fixture must also include
any supported comparison-chain cases and assert their parse/diagnostic
outcome.

## Candidate Runtime Contract Cases

The following examples are source sketches. Sprint 084 must place exact,
complete source in the canonical fixtures and verify constructors, imports,
and type annotations against the established grammar.

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
non-negative integers. Sprint 084 must lock the exact whitespace set used by
`trim` and include representative tabs, line terminators, non-breaking space,
and em space.

## Candidate Numeric Formatting Cases

The following candidate outputs assume an `en-US` locale and the proposed
numeric subset. The final pattern grammar, locale allowlist, rounding, and
literal/currency rules require Sprint 084 review.

| Expression | Candidate output |
| --- | --- |
| `format(1234.5, "#,##0.00")` | `"1,234.50"` |
| `format(-1234.5, "#,##0.00")` | `"-1,234.50"` |
| `format(0.125, "0.0%")` | `"12.5%"` |
| `format(1234.5, "$#,##0.00")` | `"$1,234.50"` |
| `format(1.25 meter, "0.00")` | `"1.25 meter"` |

The subset must be finite and documented: decimal precision, grouping,
percent, currency, and negative values are required. Date/time and text
patterns, colors, and conditional sections are excluded. The final contract
must define locale identifiers and separators, required/optional digit
placeholders, rounding/tie behavior, currency-token interpretation, negative
zero behavior, Measurement suffix spacing, and explicit invalid-pattern,
unsupported-pattern, invalid-locale, and unsupported-locale diagnostics.

## Fixture Completion Rules

- Convert every sketch into a complete canonical source fixture with a stable
  ID and exact expected value or diagnostic.
- Record source ranges against the complete document, including front matter
  and executable fences. Use 1-based lines/columns, UTF-16 code-unit columns,
  and exclusive diagnostic ends.
- Link each fixture ID to `diagnostic-matrix.md` and
  `requirement-test-matrix.md`; do not duplicate or drift expected outcomes.
- Mark whether a fixture is valid against the proposed V0.14 contract,
  currently accepted by production, or requires a runtime harness. These are
  separate facts.
