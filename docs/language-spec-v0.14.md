# OpenAMX V0.14 Language Specification

V0.14 adds runtime type predicates, mathematical and text functions, and
bounded numeric formatting to the existing OpenAMX language. This document is
additive: it does not replace the [V0.13 specification](language-spec-v0.13.md),
the [V0.12 specification](language-spec-v0.12.md), the
[V0.9 specification](language-spec-v0.9.md), or earlier contracts. See the
[project README](../README.md) for runnable examples and project guidance.

The V0.14 contract and implementation increments in Sprints 084-087 were
accepted separately. Sprint 088 editor, examples, and documentation
integration and Sprint 089 integrated acceptance remain distinct. This
specification does not claim integrated milestone acceptance, release,
publication, or platform certification.

## 1. Compatibility and Source Rules

Existing syntax, type checking, source-order visibility, imports, Measurements,
and Markdown behavior remain in effect except for the additions below. Only
exact, case-sensitive `amx` fences execute; narrative and other code fences
remain inert. Record constructor fields use `=`.

Diagnostics and editor facts refer to original-document coordinates,
including front matter and fence lines. Lines and columns are 1-based,
columns count UTF-16 code units, and diagnostic end positions are exclusive.
LF and CRLF documents retain their original source mapping.

## 2. Runtime Type Predicates

The `is` operator checks a runtime value against a visible AMX type reference:

```ebnf
IsExpression ::= Expression "is" TypeReference
TypeReference ::= VisibleSimpleTypeName ("[]" | "?")*
```

The target is resolved in the type namespace using declaration order and
explicit import visibility; it is not evaluated as a value. Qualified names
are not part of the target syntax. `is` has the existing comparison
precedence: below arithmetic and Measurement conversion, above `and`/`or`.
Same-level comparisons and type tests associate left-to-right.

A valid target that does not match returns `false`; it is not a diagnostic.
Matching rules are:

- Primitive targets match their corresponding runtime representation. A
  Number is distinct from a dimensionless Measurement.
- Record matching is structural and recursive. Every required target field
  must exist and match; extra value fields are allowed. Optional target fields
  may be absent, while present values must conform to the declared field type.
- Lists recursively check every element. An empty list matches any target
  element type.
- `null` matches a nullable target such as `String?`, not its non-nullable
  type.
- Enum targets test whether the value equals a declared underlying primitive
  member value. Enum identity is not nominal; equal primitive values can match
  more than one enum.
- Measurement targets compare physical dimension vectors, independent of unit
  name or scale.

Unknown, invisible, or non-type targets are errors. `is` does not narrow the
static type in either conditional branch.

```amx
type Point {
  x: Number
}

let candidate: Number = 4
let isNumber = candidate is Number
let isPoint = candidate is Point
```

The results are `true` and `false`. The latter remains a successful predicate
evaluation.

## 3. Mathematical Functions and Measurements

`PI` and `E` are Number constants with the runtime IEEE-754 values for π and e.
The following unary functions have the signature `Number -> Number`; they also
accept dimensionless Measurements, normalized using `value * unit.scale`, and
return an ordinary unitless Number:

`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `asinh`,
`acosh`, `atanh`, `ln`, `log`, and `exp`.

Trigonometric inputs and inverse-trigonometric outputs use radians. `ln` is the
natural logarithm; `log` is base 10. V0.14 adds no angle dimension, degree or
radian unit, or angle conversion. Dimensioned Measurements are not accepted by
these functions.

| Function | Valid input |
| --- | --- |
| `sin`, `cos`, `tan`, `atan`, `sinh`, `cosh`, `tanh`, `asinh`, `exp` | Any finite real Number or dimensionless Measurement |
| `asin`, `acos` | Finite values in `[-1, 1]`, inclusive |
| `acosh` | Finite values `>= 1` |
| `atanh` | Finite values strictly between `-1` and `1` |
| `ln`, `log` | Finite values greater than `0` |

The functions use IEEE-754 evaluation; `tan` has no epsilon-based pole check.
Invalid domains and non-finite math inputs report `AMXSL001: Invalid input for
mathematical function`. Non-finite results report `AMXSL002: Function
evaluation results in infinite result`. Invalid arity and argument types use
the existing `AMX3004` and `AMX3002` diagnostic categories.

Existing Number/list standard-library functions preserve their Measurement
compatibility:

| Functions | Measurement behavior |
| --- | --- |
| `sum`, `mean` | Require compatible dimensions, convert to the first element's unit, and preserve that unit. Typed empty Measurement `sum` uses its canonical base unit; empty `mean` errors. |
| `min`, `max` | Require compatible dimensions, compare physical values, and return the selected Measurement in its original unit. Empty lists error. |
| `abs`, `round` | Preserve the Measurement unit; `round` operates on its displayed value. Existing omitted-digit, truncation, and tie behavior is unchanged. |
| `sqrt` | Preserve the existing dimensional-square-root rules; negative values and non-integral resulting dimension exponents remain errors. |
| `pow` | Preserve the existing integer-literal exponent rule for Measurement bases and its dimension/unit transformation. |

## 4. Text Functions

- `len(text: String) -> Number` counts Unicode code points, not UTF-16 code
  units or grapheme clusters. Combining sequences count as multiple code
  points. `len(list: List<T>) -> Number` counts elements.
- `trim(text: String) -> String` removes only surrounding characters in the
  Unicode 15.1 `White_Space` set; internal characters are unchanged. The set is
  U+0009–U+000D, U+0020, U+0085, U+00A0, U+1680, U+2000–U+200A,
  U+2028–U+2029, U+202F, U+205F, and U+3000. U+FEFF and U+180E are excluded.
- `left(text: String, count?: Number) -> String` and
  `right(text: String, count?: Number) -> String` take and return Unicode code
  points. The omitted count is `1`; zero returns an empty string, and counts
  greater than the string length return the whole string. Negative,
  fractional, non-finite, and non-Number counts report
  `AMXSL003: Invalid text slice count`.

## 5. Numeric Formatting

`format(value: Number | Measurement, pattern: String, locale?: String) ->
String` supports this finite numeric pattern grammar:

```ebnf
FormatPattern ::= [CurrencyPrefix] IntegerPattern [DecimalPart] [Percent]
CurrencyPrefix ::= "$" | "€" | "£"
IntegerPattern ::= "0" | "#,##0"
DecimalPart ::= "." "0"{1,6}
Percent ::= "%"
```

The locale defaults to fixed `en-US`. The only supported locales are
`en-US`, `de-DE`, and `fr-FR`; there is no fallback. Locale changes decimal
and grouping separators, while currency prefixes are literal pattern
characters. Grouping uses groups of three. Percent scales the displayed value
by 100. Fraction digits are mandatory and limited to six when present.
Quoted text, other pattern characters, scientific notation, multiple
sections, dates, text patterns, colors, and conditional sections are
unsupported.

| Locale | Decimal separator | Group separator | `format(1234.5, "#,##0.00", locale)` |
| --- | --- | --- | --- |
| `en-US` | `.` | `,` | `"1,234.50"` |
| `de-DE` | `,` | `.` | `"1.234,50"` |
| `fr-FR` | `,` | U+202F narrow no-break space | `"1 234,50"` |

Decimal ties round half away from zero based on the Number's shortest
round-trippable decimal spelling. A minus sign precedes a currency prefix;
negative zero formats as positive zero. For a Measurement, formatting uses its
displayed numeric value and appends one ASCII space followed by the displayed
unit text. It does not convert the Measurement to another unit.

Malformed or unsupported patterns report `AMXSL004: Incorrect formatting
pattern`. Malformed or unsupported locales report `AMXSL005: Formatting locale
is malformed or unsupported`. Non-finite values report `AMXSL006: Input is
non-finite`.

## 6. Examples and Limits

Runnable examples demonstrate
[runtime type checks](../examples/09_Runtime_Type_Checks.amx),
[mathematics and Measurements](../examples/10_Mathematics_and_Measurement_Operations.amx),
and [text and formatting](../examples/11_Text_and_Numeric_Formatting.amx).

V0.14 does not add flow-sensitive type narrowing, nominal enum identity,
angle units, additional locales, non-numeric format patterns, or new editor
capabilities beyond the existing clients. This additive contract and its
examples do not imply integrated acceptance, a release, publication, or
platform qualification.
