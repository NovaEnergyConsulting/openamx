# Sprint 087 Builder Evidence: Text and Numeric Formatting

## Status

**PREPARED; EXECUTION NOT AUTHORIZED OR STARTED.**

- Sprint 084 contract disposition: ACCEPTED by user on 2026-10-15.
- Sprint 085 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 086 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 086 focused direct Bun result: 123 passed, 0 failed across five
  files; core build and `git diff --check` passed.
- Sprint 086 full root suite: NOT RUN; assigned to Sprint 089.
- Sprint 087 fixture-source amendments: user-approved on 2026-10-16:
  direct-call `TEXT-COUNT-NONFINITE-01` and `FORMAT-FINITE-01`, preserving
  finite Number-binding behavior and the existing `AMXSL003`/`AMXSL006`
  diagnostic expectations.
- Sprint 087 execution authorization: NOT RECORDED.
- Approved file-by-file implementation/evidence plan: NOT RECORDED.
- Sprint 087 tests/build/result: NOT RUN.
- Sprint 087 disposition: PENDING.

## Evidence Log

| ID | Area | Exact action / command | Result (`PASS` / `FAIL` / `BLOCKED/UNAVAILABLE` / `NOT RUN`) | Evidence | Residual owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Entry authorization and file plan | Not started | NOT RUN | Not recorded | Lead Developer / Builder |
| E-02 | Text function signatures and code-point behavior | Not started | NOT RUN | Not recorded | Sprint 087 Builder |
| E-03 | Unicode 15.1 trim set and slice count boundaries | Not started | NOT RUN | Not recorded | Sprint 087 Builder |
| E-04 | Numeric pattern grammar and deterministic rounding | Not started | NOT RUN | Not recorded | Sprint 087 Builder |
| E-05 | Locale, percent, currency, and negative formatting | Not started | NOT RUN | Not recorded | Sprint 087 Builder |
| E-06 | Measurement displayed-value formatting and unit suffix | Not started | NOT RUN | Not recorded | Sprint 087 Builder |
| E-07 | Diagnostics, direct-call fixtures, and source locations | Not started | NOT RUN | Not recorded | Sprint 087 Builder |
| E-08 | Focused tests, build, generated output inspection | Not started | NOT RUN | Not recorded | Sprint 087 Builder |
| E-09 | Scope review and separate disposition request | Not started | NOT RUN | Not recorded | Sprint 087 Builder / Lead Developer |

## Contract Fixture Reference

- Positive text/format bindings: `MATH-TEXT-FORMAT-VALID-01` (assert only
  Sprint 087-owned text and format bindings here).
- Text invalid cases: `TEXT-COUNT-NEG-01`,
  `TEXT-COUNT-FRACTION-01`, `TEXT-COUNT-NONFINITE-01`,
  `TEXT-COUNT-TYPE-01`, `TEXT-ARITY-01`, and `TEXT-TYPE-01`.
- Format invalid cases: `FORMAT-ARITY-01`, `FORMAT-TYPE-01`,
  `FORMAT-MALFORMED-01`, `FORMAT-UNSUPPORTED-01`,
  `FORMAT-PRECISION-OVERFLOW-01`, `FORMAT-LOCALE-INVALID-01`,
  `FORMAT-LOCALE-UNSUPPORTED-01`, and `FORMAT-FINITE-01`.

Exact source and expected values are in Sprint 084
`grammar-examples.md`; exact diagnostic identities, messages, and ranges
are in Sprint 084 `diagnostic-matrix.md`.

## Decisions, Failures, and Residuals

The finite-input fixture source corrections preserve existing Number-binding
behavior and the accepted function diagnostics. The user approved both
direct-call changes on 2026-10-16; the Sprint 084 artifacts record the
updated source and ranges.

No Sprint 087 implementation result is recorded. Preserve first-run
failures and retries separately. If the malformed internal non-finite
Measurement guard cannot be tested without weakening valid-source
invariants, retain it as NOT RUN with an owner and follow-up.

## Builder Recommendation and Disposition

PENDING. At completion, report fixture-level evidence, exact test/build
commands and counts, failures/retries, generated outputs, and residuals.
Request a separate Lead Developer/product-owner disposition. Sprint 088 is
not authorized by a Builder recommendation.
