# Sprint 087 Requirements: V0.14 Text and Numeric Formatting

## Status and Authority

Sprint 087 implements the accepted V0.14 text and numeric-formatting
contract. Sprint 084's contract disposition and Sprints 085 and 086
implementation dispositions are ACCEPTED. This preparation does not
authorize Sprint 087 execution. Obtain separate execution authorization and
approval of the concrete file-by-file implementation/evidence plan before
changing production code, tests, or other files.

Behavior authority:

- [`plan-openamxV14MasterSprintPlan.md`](../../plan-openamxV14MasterSprintPlan.md)
- Accepted Sprint 084
  [`grammar-examples.md`](../0084-v14-language-contract-and-acceptance-fixtures/grammar-examples.md)
- Accepted Sprint 084
  [`diagnostic-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/diagnostic-matrix.md)
- Accepted Sprint 084
  [`requirement-test-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/requirement-test-matrix.md)
- Sprint 086
  [`builder-evidence.md`](../0086-v14-mathematical-standard-library/builder-evidence.md)

The user approved two narrow Sprint 087 fixture-source corrections on
2026-10-16 to preserve existing finite-Number-binding behavior while
exercising the approved function diagnostics:

- `TEXT-COUNT-NONFINITE-01`: use `right("A", 1 / 0)` directly; expect
  `AMXSL003`, `Invalid text slice count`, at line 5, columns 25-30.
- `FORMAT-FINITE-01`: use `format(1 / 0, "0")` directly; expect
  `AMXSL006`, `Input is non-finite`, at line 5, columns 21-26.

These updates preserve fixture IDs, diagnostics, and runtime Number-binding
semantics. The source and range changes are recorded in the Sprint 084
contract artifacts and must be included in the Sprint 087 approved
file-by-file plan.

## Goal

Implement `len`, `trim`, `left`, `right`, and `format` using the existing AMX
standard-library and evaluation paths. Make string/list length and slicing
Unicode-code-point correct; make trimming match the approved Unicode 15.1
whitespace set; implement the bounded numeric format grammar, deterministic
locale behavior, Measurement suffix, and explicit diagnostics. Verify all
accepted fixtures without changing behavior outside this scope.

## In Scope

### Text Functions

- `len(value)` accepts a String or list and returns a Number:
  - Strings count Unicode code points, not UTF-16 code units or grapheme
    clusters.
  - Lists count elements, including nested and empty lists.
- `trim(text)` removes only surrounding characters in the approved Unicode
  15.1 `White_Space` set; it preserves internal whitespace and all
  non-member characters:
  - U+0009-U+000D, U+0020, U+0085, U+00A0, U+1680,
    U+2000-U+200A, U+2028-U+2029, U+202F, U+205F, U+3000.
  - U+FEFF and U+180E are excluded.
- `left(text, count?)` and `right(text, count?)`:
  - Require a String and optional Number count; the default count is 1.
  - Count and slice by Unicode code points. Combining sequences are not
    grapheme-cluster grouped.
  - Count zero returns `""`; count above string length returns the whole
    string.
  - Negative, fractional, non-finite, and non-Number counts produce
    `AMXSL003`, `Invalid text slice count`.
- Preserve exact approved arity/type diagnostics, including `AMX3004`,
  `Invalid arity for '<function>'`, and the recorded `AMX3002` text-type
  behavior.

### Numeric `format`

- Implement `format(value, pattern, locale?)` for Number and Measurement
  values. The default locale is fixed `en-US`.
- Accept exactly the approved pattern grammar:

  ```ebnf
  FormatPattern ::= [CurrencyPrefix] IntegerPattern [DecimalPart] [Percent]
  CurrencyPrefix ::= "$" | "€" | "£"
  IntegerPattern ::= "0" | "#,##0"
  DecimalPart ::= "." "0"{1,6}
  Percent ::= "%"
  ```

- Support decimal precision, grouping, percent, literal currency prefix,
  and negative-value formatting only:
  - Group digits in groups of three.
  - Locale affects decimal/group separators only.
  - Percent multiplies the displayed numeric value by 100 before formatting
    and appends `%`.
  - Currency prefixes remain literal pattern characters, regardless of
    locale.
  - Round decimal ties half away from zero based on the Number's shortest
    round-trippable decimal spelling.
  - Place the minus sign before any currency prefix.
  - Render negative zero as positive zero.
- Supported locales are exactly `en-US`, `de-DE`, and `fr-FR`; omitted
  locale means `en-US`. There is no fallback and no environment-dependent
  locale behavior:
  - `en-US`: decimal `.`, group `,`.
  - `de-DE`: decimal `,`, group `.`.
  - `fr-FR`: decimal `,`, group U+202F narrow no-break space.
- For a Measurement, apply the pattern to its displayed numeric value and
  append one ASCII space plus its displayed unit text. Do not normalize the
  displayed value by its unit scale for formatting.
- Reject malformed or unsupported patterns with `AMXSL004`,
  `Incorrect formatting pattern`. Reject malformed or unsupported locales
  with `AMXSL005`,
  `Formatting locale is malformed or unsupported`. Reject non-finite input
  with `AMXSL006`, `Input is non-finite`.
- Preserve exact approved arity/type diagnostics:
  `AMX3004`, `Invalid arity for 'format'`; and
  `AMX3002`, `format expects a Number or Measurement, got <type>`.
- Patterns with unsupported characters, quoted text, scientific notation,
  multiple sections, dates, text, colors, or conditional sections are
  errors. Mandatory fractional precision is limited to six digits.

## Out of Scope

- The math functions/constants and Measurement-aware library behavior
  implemented in Sprint 086, except for focused compatibility regressions
  if a shared path is changed.
- `is` semantics or any unrelated type-system/parser/runtime changes.
- Additional pattern types, locale identifiers, locale fallback, date/time,
  text patterns, scientific notation, colors, conditions, or multiple
  format sections.
- User-facing specification/help, editor integration, production examples,
  or release work; Sprint 088 owns those.
- Changes to finite Number binding behavior or to established Measurement
  storage/conversion semantics.
- Dependencies, package/version changes, unrelated cleanup, release,
  publication, or platform certification.

## Constraints and Gates

- Preserve the accepted Sprint 084 grammar, Unicode set, expected outputs,
  diagnostics, and the two user-approved direct-call fixture amendments.
- The `AMXSL003`/`AMXSL006` finite-expression fixtures must not be rewritten
  to bind a non-finite Number first; that binding correctly fails earlier
  with existing `AMX4003`.
- Keep formatting deterministic, offline, and independent of host locale or
  external services. Unsupported values/patterns/locales must fail
  explicitly; no fallback output.
- A malformed internal non-finite Measurement cannot be made from valid AMX
  source under the V0.9 finite-value invariant. Test the defensive
  `AMXSL006` Measurement guard only if it is directly exercisable without
  weakening that invariant; otherwise record it as NOT RUN with a residual.
- Preserve Measurement display units in formatting; unlike math functions,
  formatting applies to the displayed measurement value.
- Maintain original-document diagnostic locations, including LF/CRLF and
  UTF-16 behavior.
- Obtain separate Sprint 087 execution authorization and approval of the
  exact file-by-file plan. Include the approved Sprint 084 fixture artifact
  updates and any generated build outputs in that plan before retaining
  changes.
- Sprint 086 was accepted after 123 focused tests passed across five files,
  successful core build and `git diff --check`. The full root suite remains
  assigned to Sprint 089; do not report it as Sprint 087 evidence.
