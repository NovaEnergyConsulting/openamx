# Sprint 087 Builder Evidence: Text and Numeric Formatting

## Status

**IMPLEMENTED; FOCUSED EVIDENCE PASS; SEPARATE DISPOSITION PENDING.**

- Sprint 084 contract disposition: ACCEPTED by user on 2026-10-15.
- Sprint 085 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 086 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 086 focused direct Bun result: 123 passed, 0 failed across five
  files; core build and `git diff --check` passed.
- Sprint 086 full root suite: NOT RUN; assigned to Sprint 089.
- Sprint 087 execution authorization and exact file-by-file plan: APPROVED
  by the user on 2026-10-16 before implementation edits.
- Sprint 087 focused direct Bun run: 141 passed, 0 failed, 1,024
  expectations across six files.
- Sprint 087 core build and `git diff --check`: PASS.
- Approved generated `src/renderer/diagramBrowserRuntime.ts`: regenerated,
  inspected for the approved formatter diagnostics, and retained.
- Sprint 087 Builder recommendation: ACCEPT.
- Separate Sprint 087 Lead Developer/product-owner disposition: ACCEPTED by
  the user on 2026-10-16.
- Sprint 087 fixture-source amendments: user-approved on 2026-10-16:
  direct-call `TEXT-COUNT-NONFINITE-01` and `FORMAT-FINITE-01`, preserving
  finite Number-binding behavior and the existing `AMXSL003`/`AMXSL006`
  diagnostic expectations.
- Starting worktree: clean on branch `feat/create-v0.14`.
- Sprint 087 disposition: ACCEPTED separately by the user on 2026-10-16.

## Approved File-by-File Plan

| File | Approved change |
| --- | --- |
| `src/runtime/standardLibrary.ts` | Implement `len`, `trim`, `left`, `right`, and bounded numeric `format`; use Unicode code points and the exact approved Unicode 15.1 `White_Space` set; implement the approved pattern grammar, locales, rounding, Measurement display suffix, and `AMXSL003`–`AMXSL006` runtime diagnostics alongside exact arity/type behavior. |
| `src/runtime/evaluateExpression.ts` | Forward argument source locations for text/format runtime failures so counts, values, patterns, and locales diagnose at the accepted argument location; preserve direct-expression evaluation and finite Number-binding behavior. |
| `src/typechecker/checkDocument.ts` | Register the text/format built-ins, exact arities and approved argument types, and String/Number result types where applicable; do not change existing math or Measurement rules. |
| `tests/v14TextFormatting.test.ts` | Add focused coverage for all applicable Sprint 084 text/format fixtures, exact outputs and diagnostics/source locations, Unicode and count boundaries, formatter grammar/locale/rounding boundaries, Measurement displayed-value suffix behavior, and a safe runtime-only malformed-Measurement guard test if directly constructible without changing source validation. |
| `tests/v14MathLibrary.test.ts`, `tests/evaluator.test.ts`, `tests/formatter.test.ts`, `tests/measurements.test.ts`, `tests/dimensions.test.ts` | No planned edits; run as focused compatibility regressions. |
| Sprint 084 `grammar-examples.md`, `diagnostic-matrix.md`, `builder-evidence.md` | Verify the already-approved direct-call `TEXT-COUNT-NONFINITE-01` and `FORMAT-FINITE-01` source/range amendments and their recorded decisions. Current content matches; leave unchanged unless a concrete inconsistency is found, and then stop for a narrow plan amendment before editing. |
| Sprint 087 `builder-evidence.md` | Record the approved plan before implementation edits, then exact fixture/test/build results, first failures/retries, generated output, residuals, and separate disposition request. |
| `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, `planning/STATUS.json`, `planning/ARCHITECT_BRIEFING.md` | Record authorization, plan, execution status, evidence, residuals, and disposition request without implying Sprint 087 acceptance or Sprint 088/release authority. |
| `src/renderer/diagramBrowserRuntime.ts` | The user approved retaining this one generated output only if `bun run build` regenerates it and inspection confirms it contains the intended Sprint 087 changes. No other generated output is approved. |

No editor, user-facing specification/help, production example, formatter/editor implementation, Measurement implementation, diagnostics catalog, dependency/manifest/version, release, publication, or unrelated file is approved. If source inspection demonstrates that another file is necessary, stop and obtain a plan amendment before editing it.

### Approved verification target

```powershell
bun test tests\v14TextFormatting.test.ts tests\v14MathLibrary.test.ts tests\evaluator.test.ts tests\formatter.test.ts tests\measurements.test.ts tests\dimensions.test.ts
bun run build
git diff --check
```

The full root suite remains assigned to Sprint 089 and is not included.

## Evidence Log

| ID | Area | Exact action / command | Result (`PASS` / `FAIL` / `BLOCKED/UNAVAILABLE` / `NOT RUN`) | Evidence | Residual owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Entry authorization and file plan | User separately authorized Sprint 087 and approved this exact file-by-file plan on 2026-10-16 before source/test edits. | PASS | Approval and complete file list above; starting worktree clean on `feat/create-v0.14`. | Builder |
| E-02 | Text function signatures and code-point behavior | Implemented and exercised with the approved positive fixture, nested/empty list cases, supplementary characters, and combining sequence. | PASS | `tests/v14TextFormatting.test.ts`; final focused Bun run below. | Builder |
| E-03 | Unicode 15.1 trim set and slice count boundaries | All approved whitespace code points, U+FEFF/U+180E exclusions, internal whitespace, defaults, zero/oversized counts, and invalid counts exercised. | PASS | `tests/v14TextFormatting.test.ts`; direct whitespace-set assertion plus accepted fixture cases. | Builder |
| E-04 | Numeric pattern grammar and deterministic rounding | Accepted pattern subset, unsupported syntax, precision bound, and positive/negative shortest-decimal ties exercised. | PASS | `tests/v14TextFormatting.test.ts`; accepted fixture outputs and explicit boundary cases. | Builder |
| E-05 | Locale, percent, currency, and negative formatting | Exact `en-US`, `de-DE`, and `fr-FR` separators, literal currency prefixes, percent scaling, negatives, and negative zero exercised. | PASS | `tests/v14TextFormatting.test.ts`; accepted fixture outputs and unsupported-locale cases. | Builder |
| E-06 | Measurement displayed-value formatting and unit suffix | Displayed numeric value is formatted without scale normalization; exact one-space suffix is asserted for meter and centimeter. | PASS | `tests/v14TextFormatting.test.ts`; `formattedMeasurement`, `percentMeasurement`, `currencyMeasurement`, and `scaledMeasurement`. | Builder |
| E-07 | Diagnostics, direct-call fixtures, and source locations | All accepted text/format invalid fixtures, exact identities/messages/start locations, CRLF plus non-BMP source position, and defensive non-finite Measurement guard exercised. | PASS | `tests/v14TextFormatting.test.ts`; `TEXT-COUNT-NONFINITE-01` and `FORMAT-FINITE-01` use direct expressions. | Builder |
| E-08 | Focused tests, build, generated output inspection | Final focused direct Bun run: 141 passed, 0 failed, 1,024 expectations across six files; `bun run build`; `git diff --check`; inspected and retained the approved generated runtime. | PASS | Commands/results and first attempts recorded below; generated runtime contains `AMXSL003`–`AMXSL006` formatter paths. | Builder |
| E-09 | Scope review and separate disposition | Changed files match the approved source/test/evidence/lifecycle plan; Builder recommended ACCEPT and the user separately accepted Sprint 087. | PASS | `git status --short`; Sprint 087 evidence and planning ledgers. | Builder / Lead Developer |

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

### Focused test attempts

- Attempt 1 — exact command:
  `bun test tests\v14TextFormatting.test.ts tests\v14MathLibrary.test.ts tests\evaluator.test.ts tests\formatter.test.ts tests\measurements.test.ts tests\dimensions.test.ts`
  Result: **FAIL**, 135 passed, 4 failed, 865 expectations across 6 files.
  The new tests initially had an untyped nested empty list, an Error assertion
  helper that did not inspect non-enumerable message properties, and a quoted
  pattern string that needed AMX escaping. Corrected in the test file; no
  existing compatibility-suite failure was reported.
- Attempt 2 — same command: **FAIL**, 136 passed, 3 failed, 892 expectations.
  Runtime text/format failures still used the call-start location because
  argument sources were not yet wired through the common evaluator dispatch.
- Attempt 3 — same command: **FAIL**, 137 passed, 2 failed, 983 expectations.
  The common dispatch passed argument sources, but unary/binary expression
  nodes carry the enclosing call's source as their node source. The evaluator
  now derives the diagnostic start from the expression operands/operator,
  preserving original UTF-16 columns.
- Final run — same command: **PASS**, 141 passed, 0 failed, 1,024 expectations
  across 6 files. The final run includes the approved CRLF/non-BMP location
  case and safe direct runtime guard cases for malformed internal Measurements
  and percent overflow.

### Final build and hygiene

- `bun run build` — **PASS**; the diagram browser runtime generator and
  TypeScript compiler completed successfully.
- Generated `src/renderer/diagramBrowserRuntime.ts` — **INSPECTED and
  RETAINED** under the explicit approval. It contains the new formatter
  runtime and the `AMXSL003`–`AMXSL006` diagnostics, including percent
  overflow handling.
- `git diff --check` — **PASS**. Git emitted only the line-ending warning
  that the generated runtime's LF will be replaced by CRLF on the next Git
  touch; no whitespace errors were reported.
- Patch-hygiene retry: the first post-closeout-ledger `git diff --check`
  found trailing Markdown hard-break spaces in
  `planning/ARCHITECT_BRIEFING.md`. Those spaces were removed, and the final
  `git diff --check` passed with only the generated-runtime line-ending
  warning above.

The defensive non-finite Measurement guard was tested by directly invoking
the exported runtime library with an internally constructed Measurement;
this does not weaken or bypass source validation. Full root, editor, desktop,
and release verification remain out of scope and assigned to later work.

## Builder Recommendation and Disposition

**Builder recommendation: ACCEPT.** The user separately ACCEPTED Sprint 087
on 2026-10-16 after reviewing the evidence. Fixture-level results, exact
test/build commands and counts, failures/retries, and generated-output
inspection are recorded above. Sprint 088 remains unauthorized by this
disposition.
