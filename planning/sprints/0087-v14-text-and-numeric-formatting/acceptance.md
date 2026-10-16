# Sprint 087 Acceptance Criteria

Sprint 087 is complete when the approved text functions and bounded numeric
formatter work as specified by the accepted Sprint 084 contract, every
applicable fixture has direct evidence, and existing behavior remains
covered. Sprint 087 does not implement editor/documentation integration or
authorize release or publication.

## Text Functions

- `len` accepts strings and lists and returns their lengths as a Number.
  String length counts Unicode code points, not UTF-16 code units or
  grapheme clusters; list length counts elements.
- `trim` strips only the approved Unicode 15.1 `White_Space` set from the
  beginning and end of the string, preserves internal characters, and does
  not strip excluded U+FEFF or U+180E.
- `left` and `right`:
  - Default omitted count to 1.
  - Slice by Unicode code point.
  - Return `""` for count 0 and the whole string when count exceeds its
    code-point length.
  - Reject negative, fractional, non-finite, and non-Number counts with
    `AMXSL003`, `Invalid text slice count`.
- Valid outputs match `MATH-TEXT-FORMAT-VALID-01`, including string/list
  lengths `3`, `3`, combining sequence length `2`; `"A🙂"`, `"🙂B"`, `"A"`,
  `""`, and full-string oversized slice; and the approved trimmed `"AMX"`
  results.
- Arity and type errors match `TEXT-ARITY-01` and `TEXT-TYPE-01` with
  `AMX3004` and `AMX3002` respectively.

## Numeric Formatting

- `format(value, pattern, locale?)` supports Number and Measurement inputs;
  omitted locale defaults to deterministic `en-US`.
- The parser accepts only the approved grammar:
  optional `$`/`€`/`£` currency prefix, integer pattern `0` or `#,##0`,
  optional decimal point followed by one through six mandatory zero digits,
  and optional trailing `%`.
- Grouping uses groups of three. Decimal/group separators are exactly:
  `en-US` `.`/`,`, `de-DE` `,`/`.`, `fr-FR` `,`/U+202F. The locale allowlist
  is exactly those three values and no fallback occurs.
- Percent scales the displayed value by 100 and appends `%`. Currency
  prefixes are literal pattern characters and remain unchanged by locale.
- Decimal ties round half away from zero using the Number's shortest
  round-trippable decimal spelling. The minus sign precedes a currency
  prefix. Negative zero formats as positive zero.
- Measurement formatting uses the displayed numeric value with the same
  pattern and then adds one ASCII space plus its displayed unit text. It
  does not normalize the Measurement by unit scale.
- All expected outputs in `MATH-TEXT-FORMAT-VALID-01` match exactly,
  including:
  - `"1,234.50"`, `"1.234,50"`, `"1 234,50"`, `"12.5%"`.
  - `"$1,234.50"`, `"€1.00"`, `"£1.00"`, `"-$1,234.50"`.
  - `"1.13"`, `"-1.13"`, and `"0.00"` for the tie/negative-zero cases.
  - `"1.25 meter"`, `"125.0% meter"`, `"$1.25 meter"`, and
    `"100.00 centimeter"`.
- Invalid patterns, unsupported constructs, or precision over six digits
  produce `AMXSL004`, `Incorrect formatting pattern`.
- Malformed and unsupported locales produce `AMXSL005`,
  `Formatting locale is malformed or unsupported`.
- Non-finite formatted input produces `AMXSL006`, `Input is non-finite`.
  `FORMAT-FINITE-01` passes `1 / 0` directly to `format` so the formatter
  diagnostic is reached without changing existing Number-binding behavior.
- Format arity/type errors match `FORMAT-ARITY-01` and `FORMAT-TYPE-01`
  using their approved `AMX3004` and `AMX3002` diagnostics.
- Date/time, text, scientific, quoted-literal, multiple-section, color, and
  conditional patterns are rejected explicitly. No locale fallback or
  success-shaped output is produced.

## Approved Non-Finite Fixture Amendments

- `TEXT-COUNT-NONFINITE-01` passes `1 / 0` directly to `right`; it reports
  `AMXSL003` at the approved line 5, columns 25-30.
- `FORMAT-FINITE-01` passes `1 / 0` directly to `format`; it reports
  `AMXSL006` at the approved line 5, columns 21-26.
- The local Number-binding finite-value invariant and both diagnostic
  identities/messages remain unchanged.
- The internal malformed-Measurement `AMXSL006` guard is either exercised
  through a safe runtime-only test without weakening valid-source rules, or
  explicitly recorded as NOT RUN with its residual.

## Regression, Evidence, and Boundaries

- Focused tests cover all Sprint 084 text and formatter fixtures, exact
  outputs, diagnostic IDs/messages, and source ranges. Initial failures and
  retries are preserved separately.
- The core build and patch hygiene check pass. Exact commands, test counts,
  generated outputs, environment, and residuals are recorded in
  `builder-evidence.md`.
- Math and Measurement behavior from Sprint 086 remains unchanged; text and
  format assertions in the shared positive fixture are not used to
  retroactively claim Sprint 086 results.
- No editor integration, user-facing specification/help, production example,
  unrelated cleanup, package/version change, release, or publication occurs.
- A separate Lead Developer/product-owner records Sprint 087 disposition.
  Builder recommendation alone does not authorize Sprint 088.
