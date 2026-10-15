# Sprint 084 V0.14 Requirement-to-Test Matrix

## Status and Usage

Builder-updated mapping from the V0.14 master plan to contract fixtures and
downstream verification. The product decisions recorded 2026-10-15 are
approved, but the separate contract disposition remains pending. This matrix
does not claim implementation or runtime test results.

**Builder execution status (2026-10-15):** execution/file plan APPROVED by
user. The master-plan requirements, product decisions, and separate Sprint 084
contract disposition were APPROVED by user on 2026-10-15. V0.14 implementation
evidence is NOT RUN. Sprint 085 is READY FOR SEPARATE EXECUTION AUTHORIZATION,
not authorized to start by this disposition.

Only IDs with a matching `fixture:` envelope in `grammar-examples.md` are
canonical source fixtures. All referenced IDs currently have envelopes and
all source IDs are traced by this matrix. The ID audit is a consistency pass,
not proof that every contract subcase has a complete range, independent
assertion, or runtime test.

`grammar-examples.md` owns approved/proposed source and expected language outcomes.
`diagnostic-matrix.md` owns exact invalid-case diagnostics and source ranges.
This file owns end-to-end requirement traceability and later test ownership.

| Requirement ID | Confirmed requirement / acceptance assertion | Stable fixture IDs | Sprint 084 status/evidence required | Implementation owner |
| --- | --- | --- | --- | --- |
| V14-CON-01 | `value is TargetType` is Boolean; target is a type reference, not a runtime value | `IS-VALID-01`, `IS-SYNTAX-01`, `IS-SYNTAX-SUFFIX-01`, `IS-TARGET-UNKNOWN-01`, `IS-TARGET-NONTYPE-01`, `IS-TARGET-UNICODE-UTF16-01` | APPROVED scope; syntax/type grammar details APPROVED; candidate source ranges recorded | 085 |
| V14-CON-02 | `is` precedence and associativity are explicit against existing operators | `IS-PREC-01`, `IS-CHAIN-01` | APPROVED by user; source fixtures exist; parse/runtime checks NOT RUN | 084 locks; 085 implements |
| V14-CON-03 | Target types obey source-order and import visibility; invalid references diagnose | `IS-TARGET-UNKNOWN-01`, `IS-TARGET-NONTYPE-01`, `IS-TARGET-FORWARD-01`, `IS-TARGET-IMPORT-01`, `IS-TARGET-UNICODE-UTF16-01` | APPROVED scope; source-coordinate checks and existing LF/CRLF/UTF-16 mapping tests PASS; V0.14 diagnostic translation NOT RUN | 085 |
| V14-IS-01 | Primitive target match and mismatch behavior | `IS-VALID-01` (`primitiveMatch`, `primitiveMismatch`) | APPROVED scope; complete source exists; runtime not implemented | 085 |
| V14-IS-02 | Structural record matching recurses, allows extra value fields, requires target fields | `IS-VALID-01` (`recordMatch`, `missingRequiredField`, `nestedRecordMismatch`) | APPROVED scope; nested case included; runtime not implemented | 085 |
| V14-IS-03 | Optional target fields may be absent; nullable type differs from optional-field marker | `IS-VALID-01` (`absentFieldMatch`, `presentNullMatches`, `nullableNull`, `nonNullableNull`) | APPROVED scope; absent/present-null and nullable primitive cases included; runtime not implemented | 085 |
| V14-IS-04 | Lists recurse over all elements; empty list matches any element type | `IS-VALID-01` (`allNumbers`, `emptyAnyList`, `nestedListMismatch`) | APPROVED scope; non-empty/empty/nested mismatch cases included; runtime not implemented | 085 |
| V14-IS-05 | Enum membership uses primitive values, not nominal identity | `IS-VALID-01` (`enumMember`, `enumNonMember`, `enumOverlap`) | APPROVED scope; shared-value cross-enum case included; runtime not implemented | 085 |
| V14-IS-06 | Measurements match by dimension vector independent of scale | `IS-VALID-01` (`measurementMatch`, `measurementMismatch`) | APPROVED scope; equivalent units/non-match are in source; source audit still pending | 085 |
| V14-IS-07 | No flow-sensitive narrowing | `IS-NARROW-01` | APPROVED scope; static-branch fixture and existing `AMX3002` message recorded; runtime/type-checker behavior NOT RUN | 085 |
| V14-MATH-01 | Add all 15 math functions with exact signatures/outputs | `MATH-TEXT-FORMAT-VALID-01` (all 15 named math bindings), `MATH-ARITY-01`, `MATH-TYPE-01` | APPROVED signatures/expected values/tolerance; implementation tests NOT RUN | 086 |
| V14-MATH-02 | Trig inputs and inverse-trig outputs are radians | `MATH-TEXT-FORMAT-VALID-01` (`sine`, `tangentPoleApproximation`, `arcSine`, `arcCosine`, `arcTangent`) | APPROVED radians, IEEE-754 tangent behavior, and `1e-12` tolerance; implementation tests NOT RUN | 086 |
| V14-MATH-03 | `ln` natural log, `log` base 10, `PI`/`E` Number constants | `MATH-TEXT-FORMAT-VALID-01` (`naturalLog`, `commonLog`, `exponential`) | APPROVED definitions, IEEE-754 constants, and tolerance; implementation tests NOT RUN | 086 |
| V14-MATH-04 | Accept Number/dimensionless Measurement, return Number, reject dimensioned Measurement | `MATH-TEXT-FORMAT-VALID-01` (`dimensionlessMeasurementSine`), `MATH-MEASUREMENT-DIM-01` | APPROVED source ratio-unit fixture and distinct Number/Measurement semantics; implementation tests NOT RUN | 086 |
| V14-MATH-05 | Invalid domains and non-finite inputs/results diagnose | `MATH-DOM-ASIN-01`, `MATH-DOM-ACOS-01`, `MATH-DOM-ACOSH-01`, `MATH-DOM-ATANH-01`, `MATH-DOM-LN-01`, `MATH-DOM-LOG-01`, `MATH-FINITE-01`, `MATH-NONFINITE-INPUT-01` | APPROVED domains and `AMXSL001`/`AMXSL002`; source collision check PASS; implementation tests NOT RUN | 086 |
| V14-MATH-06 | Existing `sqrt` negative-domain behavior is preserved | `MATH-SQRT-REGRESSION-01`, `MATH-SQRT-MEAS-REGRESSION-01`; existing focused tests in `tests/measurements.test.ts` and `tests/evaluator.test.ts` | APPROVED regression; source fixtures and existing code meanings inspected; execution NOT RUN | 086 |
| V14-MEAS-01 | Existing Number/list standard-library functions extend to meaningful Measurements | `MEAS-STDLIB-VALID-01`, `MEAS-EMPTY-MEAN-01`, `MEAS-EMPTY-MIN-01`, `MEAS-EMPTY-MAX-01`; focused test in `tests/measurements.test.ts` | APPROVED compatibility scope from V0.9/master plan; expected units/empty cases mapped; execution NOT RUN | 086 |
| V14-MEAS-02 | Compatible dimensions convert; result units remain stable | `MEAS-STDLIB-VALID-01`, `MEAS-COMPAT-01` | APPROVED first-unit aggregate, selected original min/max unit, and incompatible-dimension behavior; execution NOT RUN | 086 |
| V14-TEXT-01 | `len` accepts strings/lists and counts Unicode code points | `MATH-TEXT-FORMAT-VALID-01` (`stringLength`, `listLength`, `combiningLength`) | APPROVED scope; supplementary and combining code points included; execution NOT RUN | 087 |
| V14-TEXT-02 | `trim` removes approved surrounding whitespace | `MATH-TEXT-FORMAT-VALID-01` (`trimmed`, `controlTrim`) | APPROVED Unicode 15.1 `White_Space` set; execution NOT RUN | 087 |
| V14-TEXT-03 | `left`/`right` default to one code point and slice by code point | `MATH-TEXT-FORMAT-VALID-01` (`firstTwo`, `lastTwo`, `defaultLeft`, `emptyRight`, `oversizedLeft`) | APPROVED default/zero/oversized boundaries; execution NOT RUN | 087 |
| V14-TEXT-04 | Invalid slice counts diagnose | `TEXT-COUNT-NEG-01`, `TEXT-COUNT-FRACTION-01`, `TEXT-COUNT-NONFINITE-01`, `TEXT-COUNT-TYPE-01` | APPROVED behavior and `AMXSL003: Invalid text slice count`; source collision check PASS; execution NOT RUN | 087 |
| V14-TEXT-05 | Text function arity and argument types are checked | `TEXT-ARITY-01`, `TEXT-TYPE-01` | APPROVED `AMX3004` arity and `AMX3002` type messages; execution NOT RUN | 087 |
| V14-FMT-01 | `format` handles Number/Measurement with bounded numeric patterns and validates arity/value types | `MATH-TEXT-FORMAT-VALID-01` (`grouped`, `percent`, `currency`, `formattedMeasurement`), `FORMAT-ARITY-01`, `FORMAT-TYPE-01` | APPROVED pattern grammar and types; execution NOT RUN | 087 |
| V14-FMT-02 | Precision/grouping/percent/currency/negative outputs deterministic | `MATH-TEXT-FORMAT-VALID-01` (`grouped`, `maxPrecision`, `percent`, `currency`, `negativeCurrency`, `roundedTie`, `negativeTie`, `negativeZero`) | APPROVED grammar, outputs, rounding, currency, and negative-zero rules; execution NOT RUN | 087 |
| V14-FMT-03 | Default locale fixed `en-US`; supported/unsupported locales explicit/offline | `MATH-TEXT-FORMAT-VALID-01` (`defaultLocale`, `groupedGerman`, `groupedFrench`), `FORMAT-LOCALE-INVALID-01`, `FORMAT-LOCALE-UNSUPPORTED-01` | APPROVED exact allowlist/separators and no fallback; execution NOT RUN | 087 |
| V14-FMT-04 | Measurement formatting appends displayed unit | `MATH-TEXT-FORMAT-VALID-01` (`formattedMeasurement`, `percentMeasurement`, `currencyMeasurement`, `scaledMeasurement`) | APPROVED same-pattern/display-unit suffix contract; execution NOT RUN | 087 |
| V14-FMT-05 | Unsupported patterns/locales fail explicitly | `FORMAT-MALFORMED-01`, `FORMAT-UNSUPPORTED-01`, `FORMAT-PRECISION-OVERFLOW-01`, `FORMAT-LOCALE-INVALID-01`, `FORMAT-LOCALE-UNSUPPORTED-01`, `FORMAT-FINITE-01` | APPROVED `AMXSL004`/`AMXSL005`/`AMXSL006` exact messages; Number finite-failure fixture included; internal non-finite Measurement guard NOT RUN | 087 |
| V14-COMP-01 | Existing syntax/type checking/diagnostics/editor/runtime behavior remain unchanged outside additions | V0.12/V0.13/V0.9 contracts and existing focused parser/evaluator/Measurement tests | Required downstream evidence mapped; no implementation suite run for this contract gate | 085-089 |
| V14-TRACE-01 | Every confirmed master-plan requirement traces to fixture and later evidence | `IS-VALID-01`, `MATH-TEXT-FORMAT-VALID-01`, `MEAS-STDLIB-VALID-01`, `IS-SYNTAX-01`, `MATH-DOM-ASIN-01`, `MEAS-COMPAT-01`, `TEXT-COUNT-NEG-01`, `FORMAT-MALFORMED-01` | APPROVED traceability requirement; exact fixture IDs map; remaining range/runtime evidence is explicitly NOT RUN | 084 |

## Required Downstream Evidence

- **Sprint 085:** Parser/AST/type checker/runtime tests for `is`, including
  target resolution, recursive semantics, diagnostics, source ranges, and
  no-narrowing behavior.
- **Sprint 086:** Focused tests for math function signatures/values, all
  domains, finite-result errors, Measurement extensions/conversions, units,
  and pre-existing standard-library behavior.
- **Sprint 087:** Focused tests for Unicode text functions, numeric formatter
  outputs, locale behavior, invalid patterns/diagnostics, and Measurement
  suffixes.
- **Sprint 088:** Shared editor services and both editor clients recognize
  the operator, constants, and functions while preserving existing
  diagnostics/completion/navigation/highlighting behavior; examples and
  specification match the locked contract.
- **Sprint 089:** Integrated acceptance runs the approved fixtures and
  existing root, extension, and desktop workflows; unavailable checks and
  residuals remain distinct from passes.

Every final matrix row must include exact fixture IDs, expected behavior,
later test/surface, evidence artifact, and any known dependency or residual.
