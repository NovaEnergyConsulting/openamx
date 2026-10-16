# Sprint 087 Blueprint: V0.14 Text and Numeric Formatting

## Approach

1. Obtain separate explicit Sprint 087 execution authorization and approval
   of the concrete file-by-file implementation/evidence plan. Record the
   starting worktree and preserve all existing changes and generated files.
2. Read the accepted Sprint 084 contract and diagnostics, Sprint 086
   implementation evidence, and current standard-library, evaluator,
   type-checker, Measurement display, formatter/editor, and source-location
   implementations. Identify existing reusable Unicode and formatting
   helpers before adding code.
3. Include the approved source corrections to the Sprint 084 artifacts in
   the approved plan:
   - `TEXT-COUNT-NONFINITE-01` calls `right("A", 1 / 0)` directly and keeps
     `AMXSL003`, line 5, columns 25-30.
   - `FORMAT-FINITE-01` calls `format(1 / 0, "0")` directly and keeps
     `AMXSL006`, line 5, columns 21-26.
   - Update the complete fixture source, corresponding diagnostic rows and
     Sprint 084 evidence note consistently. Preserve finite Number-binding
     behavior.
4. Add text function signatures and runtime evaluation using existing
   standard-library conventions:
   - Count strings with Unicode code points, not JS UTF-16 length or grapheme
     segmentation; count list elements.
   - Implement the exact Unicode 15.1 `White_Space` set for both ends of
     `trim`, preserving interior text and excluding U+FEFF/U+180E.
   - Implement optional `left`/`right` count default, code-point slicing,
     zero/oversized boundaries, and exact errors for negative, fractional,
     non-finite, or non-Number counts.
5. Implement `format` with a small deterministic parser for the accepted
   numeric pattern grammar. Avoid broad Excel/LibreOffice compatibility
   claims; support only the approved precision, grouping, percent, currency,
   negative, and locale behavior.
6. Format Measurement values using their displayed numeric value. Apply
   pattern rounding/locale formatting, then append one ASCII space and the
   displayed unit text. Do not convert or normalize the Measurement.
7. Implement exact diagnostics:
   - `AMXSL003` for invalid text counts.
   - `AMXSL004` for malformed/unsupported patterns.
   - `AMXSL005` for malformed/unsupported locales.
   - `AMXSL006` for non-finite Number/Measurement values passed to format.
   - Existing `AMX3004`/`AMX3002` arity/type cases as specified.
   Preserve source positions of argument/pattern/locale failures.
8. Add fixture-driven focused tests for all text and formatting bindings in
   `MATH-TEXT-FORMAT-VALID-01` and every applicable text/format invalid
   fixture. Test exact Unicode code points/separators (including U+202F),
   rounding ties, negative zero, Measurement suffixes, and original source
   ranges.
9. Run focused text/format and relevant existing core tests, then the core
   build and patch hygiene check. Inspect and retain any generated browser
   runtime output only if included in the approved plan. Record exact
   commands, counts, initial failures/retries, and unavailable checks.
10. Review scope and artifact consistency; update `builder-evidence.md` and
    planning ledgers; request a separate Sprint 087 disposition. Sprint 088
    remains a distinct authorization gate.

## Files to Include in the Approved Plan

The exact file list must be reviewed and approved before execution. Expected
files:

- `src/runtime/standardLibrary.ts`
- `src/runtime/evaluateExpression.ts`
- `src/typechecker/checkDocument.ts` and existing built-in function/type
  metadata only where required
- Any minimal shared text/numeric formatter helper, only if existing patterns
  warrant one and the file is approved
- New focused tests such as `tests/v14TextFormatting.test.ts`; modify
  existing tests only where directly required by the approved feature
- Sprint 087 `builder-evidence.md`
- Approved Sprint 084 fixture corrections in
  `grammar-examples.md`, `diagnostic-matrix.md`, and `builder-evidence.md`
- `planning/decisions.md`, `planning/questions.md`, and the existing sprint
  lifecycle status/briefing files only as required and explicitly approved
- `src/renderer/diagramBrowserRuntime.ts` or other generated output only if
  produced by the approved build and explicitly listed after inspection

No editor, user-facing language specification/help, production examples,
package/version, release, or unrelated implementation files are in the
default scope. Any additional required file needs a narrow approved plan
amendment before editing.

## Verification

From the repository root, after implementation:

1. Run the focused Sprint 087 test file and relevant existing tests, expected
   to include `tests\evaluator.test.ts`, `tests\formatter.test.ts`,
   `tests\measurements.test.ts`, and `tests\dimensions.test.ts`. Add other
   suites only when they directly cover an affected shared surface.
2. Assert all approved text bindings in `MATH-TEXT-FORMAT-VALID-01`:
   string/list and combining-mark lengths, supplementary-code-point
   left/right slicing, defaults, zero/oversized counts, and trimming for
   approved edge whitespace while preserving excluded/interior characters.
3. Assert all approved formatting bindings in
   `MATH-TEXT-FORMAT-VALID-01`: all locales, default locale, maximum
   precision, grouping, percent, currency prefixes, negative currency,
   positive/negative ties, negative zero, and Number/Measurement outputs.
4. Run the approved invalid fixture set:
   `TEXT-COUNT-NEG-01`, `TEXT-COUNT-FRACTION-01`,
   `TEXT-COUNT-NONFINITE-01`, `TEXT-COUNT-TYPE-01`,
   `TEXT-ARITY-01`, `TEXT-TYPE-01`, `FORMAT-ARITY-01`,
   `FORMAT-TYPE-01`, `FORMAT-MALFORMED-01`,
   `FORMAT-UNSUPPORTED-01`, `FORMAT-PRECISION-OVERFLOW-01`,
   `FORMAT-LOCALE-INVALID-01`, `FORMAT-LOCALE-UNSUPPORTED-01`, and
   `FORMAT-FINITE-01`. Assert exact diagnostic identity, message, and
   source location.
5. For any malformed internal non-finite Measurement test, record the
   construction path and prove it does not weaken or bypass valid-source
   finite-value validation. If that guard cannot be tested safely, mark it
   NOT RUN and retain the residual.
6. Run `bun run build` and `git diff --check`. Record first attempts and
   retries separately. Full root/extension/desktop integration remains
   Sprint 089 work unless separately authorized.

## Notes

Sprint 087 implements text and numeric formatting only. It does not publish
user-facing documentation or editor integrations; Sprint 088 owns those
surfaces.
