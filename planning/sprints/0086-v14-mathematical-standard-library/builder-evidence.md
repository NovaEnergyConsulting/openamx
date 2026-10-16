# Sprint 086 Builder Evidence: Mathematical Standard Library

## Status

**IMPLEMENTED; FOCUSED EVIDENCE PASS; ACCEPTED BY USER ON 2026-10-16.**

- Sprint 084 contract disposition: ACCEPTED by user on 2026-10-15.
- Sprint 085 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 085 focused direct Bun result: 241 passed, 0 failed across 8 files;
  core build and `git diff --check` passed.
- Sprint 085 full root suite: NOT RUN; assigned to Sprint 089.
- Sprint 085 test-wrapper discrepancy: `functions.runTests` retry reported
  182/0, while direct Bun reported 241/0 for the selected files. Direct Bun
  is the recorded focused acceptance result; discrepancy remains documented.
- Dimensionless Measurement math input decision: user selected normalized
  canonical value (`value * unit.scale`) on 2026-10-16.
- Sprint 086 execution authorization: APPROVED by the user on 2026-10-16.
- Approved file-by-file implementation/evidence plan: APPROVED by the user
  on 2026-10-16 and recorded below before implementation edits.
- Sprint 086 focused direct Bun run: 123 passed, 0 failed across five files.
- Sprint 086 core build: PASS; `git diff --check`: PASS.
- Generated `src/renderer/diagramBrowserRuntime.ts`: changed by the
  approved build, inspected for the new math diagnostics/signatures, and
  retained as the only generated artifact.
- Sprint 086 Builder recommendation: ACCEPT.
- Separate Sprint 086 Lead Developer/product-owner disposition: ACCEPTED by
  user on 2026-10-16.

## Approved File-by-File Plan

Starting worktree was clean on branch `feat/create-v0.14`
(`git status --short; git branch --show-current`).

| File | Approved change |
| --- | --- |
| `src/runtime/standardLibrary.ts` | Add IEEE-754 `PI`/`E` values and evaluation for the 15 approved unary math functions, with exact domain, finiteness, arity/runtime diagnostics and source locations. Preserve existing Number behavior. |
| `src/runtime/evaluateExpression.ts` | Resolve `PI`/`E`; route math calls through the existing evaluator; normalize dimensionless Measurement arguments as `value * unit.scale` and return Number; extend existing Measurement-aware operations only as specified, preserving unit, empty-list, sqrt and integer-literal `pow` semantics. |
| `src/typechecker/checkDocument.ts` | Register the new built-ins and signatures, type `PI`/`E` as Number, accept Number or dimensionless Measurement for math, and preserve the approved arity/type diagnostics and rejection of dimensioned Measurement. |
| `tests/v14MathLibrary.test.ts` | Add focused tests covering every applicable Sprint 084 fixture, all 15 math functions/constants, values within the approved tolerance, the scale-1 ratio and a non-unit-scale dimensionless unit, exact diagnostics/source locations, and Measurement values/units/errors. Existing tests remain unchanged. |
| `src/renderer/diagramBrowserRuntime.ts` | Retain only if the approved build regenerates it; inspect that generated output contains the intended evaluator changes. No other generated artifact is approved. |
| `planning/sprints/0086-v14-mathematical-standard-library/builder-evidence.md` | Record this approved plan before edits, then exact commands/outcomes, fixture evidence, failures/retries, generated-output outcome, residuals, and the separate disposition request. |
| `planning/state.md`, `planning/decisions.md`, `planning/questions.md` | Record the authorization/approved plan, execution evidence, residuals, and pending separate disposition without changing product decisions or scope. |
| `planning/STATUS.json`, `planning/ARCHITECT_BRIEFING.md` | Follow the prior builder lifecycle convention: mark Sprint 086 building after authorization and refresh status/briefing at close; do not imply acceptance, release, publication, version change, or certification. |
| `planning/sprints/0084-v14-language-contract-and-acceptance-fixtures/grammar-examples.md`, `diagnostic-matrix.md`, `builder-evidence.md` | Approved narrow amendment: update only `MATH-NONFINITE-INPUT-01` to use the direct expression `sin(1 / 0)`, update its exact source span, and record the 2026-10-16 product decision. Preserve the existing finite-Number-binding behavior. |

### Approved Verification Target

Run the focused tests directly with Bun, then build and check patch hygiene:

```powershell
bun test tests\v14MathLibrary.test.ts tests\evaluator.test.ts tests\measurements.test.ts tests\dimensions.test.ts tests\isTypeChecking.test.ts
bun run build
git diff --check
```

The focused tests will assert accepted expected values, exact diagnostic
code/message/source span, and Measurement value/unit outcomes. The full root
suite remains assigned to Sprint 089 and is not included. No parser/AST,
Measurement helper, user-facing documentation, editor, example, package, or
release file is approved. If inspection demonstrates a necessary change
outside this list, stop and request a specific scope amendment before
editing that file.

### Approved Contract/Scope Amendment (2026-10-16)

The initial focused run showed that the accepted `MATH-NONFINITE-INPUT-01`
binding (`let infinite = 1 / 0`) triggers the existing runtime
`AMX4003`, `Expected a finite Number value`, before the math call. The user
approved preserving Number-binding behavior and amending this fixture to
evaluate `let result = sin(1 / 0)` directly. The same fixture ID and expected
`AMXSL001` diagnostic remain; the call source range is now line 5,
columns 14–24. Added to the approved file plan before editing:
`grammar-examples.md`, `diagnostic-matrix.md`, and Sprint 084
`builder-evidence.md`. The already-approved Sprint 086 test and evidence
files will record the amendment. No runtime Number-binding semantics change.

## Evidence Log

| ID | Area | Exact action / command | Result (`PASS` / `FAIL` / `BLOCKED/UNAVAILABLE` / `NOT RUN`) | Evidence | Residual owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Entry authorization and file plan | User authorized Sprint 086 and approved the exact file-by-file implementation/evidence plan on 2026-10-16; recorded above before implementation edits. | PASS | User approval; clean starting worktree on `feat/create-v0.14`; approved file list and verification target recorded above. | Builder |
| E-02 | Function/constant registration and type signatures | Focused fixture tests cover `PI`, `E`, all 15 unary functions, Number results, arity, type and dimension checks. | PASS | `tests/v14MathLibrary.test.ts`; approved direct Bun command below. | Sprint 086 Builder |
| E-03 | Math values, domains, and finite-result behavior | All accepted math bindings, tolerance, tangent approximation, approved domains, finite overflow and non-finite input exercised. | PASS | `MATH-TEXT-FORMAT-VALID-01` math bindings, domain fixtures, `MATH-FINITE-01`, amended `MATH-NONFINITE-INPUT-01`. | Sprint 086 Builder |
| E-04 | Dimensionless Measurement scaling and dimension rejection | Scale-1 ratio and non-unit-scale dimensionless Measurement normalize to physical scalar; dimensioned Measurement is rejected. | PASS | Math fixture tests assert Number result and expected value; exact `AMX3007` location asserted. | Sprint 086 Builder |
| E-05 | Measurement-aware existing library operations and units | Aggregate, extrema, abs, round, sqrt, pow, typed empty sum, incompatible dimensions, empty aggregates, and sqrt regressions exercised. | PASS | `MEAS-STDLIB-VALID-01`, `MEAS-COMPAT-01`, three empty aggregate fixtures, both sqrt regression fixtures; existing Measurement suite. | Sprint 086 Builder |
| E-06 | Diagnostics and source locations | Exact code/message/line/column asserted for all applicable math/type/domain/Measurement failures. | PASS | `tests/v14MathLibrary.test.ts`; source ranges follow the amended Sprint 084 fixture record. | Sprint 086 Builder |
| E-07 | Focused tests, build, generated output inspection | Final focused command, core build, `git diff --check`, and generated bundle inspection completed. | PASS | Final direct Bun run: 123/0 across 5 files; build and patch hygiene passed; generated runtime contains math code and diagnostic strings. | Sprint 086 Builder |
| E-08 | Scope review and separate disposition | Approved production/test/artifact scope retained; full root suite not run; separate disposition recorded below. | PASS | No out-of-plan files retained; full root suite remains assigned to Sprint 089. User accepted Sprint 086 on 2026-10-16. | Lead Developer / product owner |

### Initial Focused Test Attempt

Command:

```powershell
bun test tests\v14MathLibrary.test.ts tests\evaluator.test.ts tests\measurements.test.ts tests\dimensions.test.ts tests\isTypeChecking.test.ts
```

Result: **FAIL — 119 passed, 3 failed across 5 files, 751 expectations**.
The two test-expectation failures were corrected: the test now binds `PI`/`E`
to values before asserting them, and checks the existing `AMX2004` empty-list
message including its `at line 8` suffix. The third failure exposed the
contract conflict subsequently resolved by the approved Sprint 084 fixture
amendment below; runtime Number-binding behavior was preserved.

### Final Verification

| Command | Result |
| --- | --- |
| `bun test tests\v14MathLibrary.test.ts tests\evaluator.test.ts tests\measurements.test.ts tests\dimensions.test.ts tests\isTypeChecking.test.ts` | PASS — 123 passed, 0 failed, 838 expectations across 5 files. An intermediate corrected run passed 122/0 before the supplemental inverse-trig boundary and extra-arity assertions were added. |
| `bun run build` | PASS — generated browser runtime build and TypeScript compilation completed successfully. |
| `git diff --check` | PASS — no whitespace errors. Git emitted the existing worktree line-ending warning for `src/renderer/diagramBrowserRuntime.ts` (LF will be replaced by CRLF on a future Git write). |

The generated browser runtime was inspected for the new `AMXSL001` and
`AMXSL002` messages, the Number/dimensionless Measurement type diagnostic,
and the `Math.log10` implementation. It changed by one generated line and is
the only retained build output. The full root suite was not run; Sprint 089
owns that gap.

## Contract Fixture Reference

Primary Sprint 086 fixtures from accepted Sprint 084:

- Positive math and dimensionless Measurement: math bindings in
  `MATH-TEXT-FORMAT-VALID-01` (do not claim its text/format bindings here).
- Arity and types: `MATH-ARITY-01`, `MATH-TYPE-01`,
  `MATH-MEASUREMENT-DIM-01`.
- Domains and finite values:
  `MATH-DOM-ASIN-01`, `MATH-DOM-ACOS-01`,
  `MATH-DOM-ACOSH-01`, `MATH-DOM-ATANH-01`,
  `MATH-DOM-LN-01`, `MATH-DOM-LOG-01`,
  `MATH-FINITE-01`, and `MATH-NONFINITE-INPUT-01`.
- Measurement library and compatibility:
  `MEAS-STDLIB-VALID-01`, `MEAS-COMPAT-01`,
  `MEAS-EMPTY-MEAN-01`, `MEAS-EMPTY-MIN-01`,
  `MEAS-EMPTY-MAX-01`, `MATH-SQRT-REGRESSION-01`, and
  `MATH-SQRT-MEAS-REGRESSION-01`.

The accepted diagnostic identities/messages and source ranges are in Sprint
084 `diagnostic-matrix.md`; expected values and units are in
`grammar-examples.md`.

## Decisions, Failures, and Residuals

The dimensionless Measurement scale interpretation is resolved: normalize
as `value * unit.scale` before math evaluation, as selected by the user on
2026-10-16. The scale-1 and non-unit-scale cases both pass.

The user separately resolved the non-finite input fixture conflict on
2026-10-16: preserve finite Number-binding behavior and amend
`MATH-NONFINITE-INPUT-01` to call `sin(1 / 0)` directly. The fixture ID and
`AMXSL001` diagnostic are unchanged; updated source and diagnostic spans are
recorded in Sprint 084 artifacts. The amendment was approved and documented
before those artifacts were edited.

All scoped implementation/evidence checks passed. The full root suite is
not run and remains assigned to Sprint 089. No other blocker is outstanding.

## Builder Recommendation and Disposition

**BUILDER RECOMMENDATION: ACCEPT.** All Sprint 086 criteria were exercised
by the focused fixture suite and the core build; exact results, the initial
failure/retry history, approved fixture amendment, and generated artifact
inspection are recorded above. The full root suite remains assigned to
Sprint 089 and is not represented as passing here.

**SEPARATE LEAD DEVELOPER/PRODUCT-OWNER DISPOSITION: ACCEPTED BY USER ON
2026-10-16.** Sprint 087 still requires its own execution authorization. No
release, publication, version change, or platform-certification authority
follows from this disposition.
