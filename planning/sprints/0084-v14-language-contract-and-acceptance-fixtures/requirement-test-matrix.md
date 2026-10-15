# Sprint 084 V0.14 Requirement-to-Test Matrix

## Status and Usage

Architect-prepared draft mapping from the V0.14 master plan to contract
fixtures and downstream verification. Replace candidate fixture groups with
the final stable IDs and exact source before Sprint 084 closes. This matrix
does not claim implementation or test results.

`grammar-examples.md` owns candidate source and expected language outcomes.
`diagnostic-matrix.md` owns exact invalid-case diagnostics and source ranges.
This file owns end-to-end requirement traceability and later test ownership.

| Requirement ID | Confirmed requirement / acceptance assertion | Candidate fixture IDs | Sprint 084 contract evidence | Implementation owner |
| --- | --- | --- | --- | --- |
| V14-CON-01 | `value is TargetType` is a Boolean expression; target is an AMX type reference, not a runtime value | `IS-SYNTAX-*`, `IS-PRIMITIVE-01` | Grammar, AST/parse expectations, and result type fixed | 085 |
| V14-CON-02 | `is` precedence and associativity are explicit and tested against existing operators | `IS-PREC-*` | Parse-shape fixtures for arithmetic, conversion, comparisons, logic, conditional | 084 locks; 085 implements |
| V14-CON-03 | Target types resolve under established visibility/source-order rules; invalid targets diagnose | `IS-TARGET-*` | Positive local/import and negative unknown/invisible/non-target cases | 085 |
| V14-IS-01 | Primitive target match/mismatch behavior is explicit | `IS-PRIMITIVE-*` | True/false expected values and non-diagnostic mismatch | 085 |
| V14-IS-02 | Record matching is structural; required fields recurse; extra runtime fields are allowed | `IS-RECORD-*` | Missing/extra/nested field cases with expected Boolean | 085 |
| V14-IS-03 | Optional target fields may be absent; nullable type and optional field marker remain distinct | `IS-OPTIONAL-*` | Absent/present/null cases | 085 |
| V14-IS-04 | Lists recursively check every element; empty lists match any element type | `IS-LIST-*` | Empty, all-match, and nested/nonmatching runtime-element cases | 085 |
| V14-IS-05 | Enum checks use declared underlying primitive membership, not nominal identity | `IS-ENUM-*` | Declared/undeclared values and cross-enum overlap | 085 |
| V14-IS-06 | Measurement checks compare physical dimension vectors independent of unit scale | `IS-MEASUREMENT-*` | Same-vector/different-scale and incompatible-vector cases | 085 |
| V14-IS-07 | `is` adds no flow-sensitive narrowing | `IS-NARROW-*` | Positive and negative branch type-check cases | 085 |
| V14-MATH-01 | Add all 15 specified math functions with exact signatures and numeric outputs | `MATH-SIG-*`, `MATH-VALUES-*` | One or more explicit expected-value cases per function | 086 |
| V14-MATH-02 | Trigonometric inputs and inverse-trigonometric outputs are radians | `MATH-RADIANS-*` | Boundary and representative-value cases | 086 |
| V14-MATH-03 | `ln` is natural log; `log` is base 10; `PI` and `E` are Number constants | `MATH-LOG-*`, `MATH-CONST-*` | Exact definitions and numeric tolerance | 086 |
| V14-MATH-04 | Math accepts Numbers and dimensionless Measurements; returns unitless Numbers; rejects dimensioned Measurements | `MATH-MEAS-*` | Valid dimensionless and invalid dimensioned cases, with explicit conversion semantics | 086 |
| V14-MATH-05 | Domain failures and non-finite inputs/results produce explicit AMX diagnostics | `MATH-DOMAIN-*`, `MATH-FINITE-*` | Full domain boundaries, exact diagnostic IDs/messages/ranges | 086 |
| V14-MATH-06 | Existing `sqrt` negative-domain behavior is preserved | `MATH-SQRT-REGRESSION-*` | Existing diagnostic and boundary behavior retained | 086 |
| V14-MEAS-01 | Number/list-of-Number library functions gain Measurement support where approved as meaningful | `MEAS-STDLIB-*` | Complete function applicability and result-unit table | 086 |
| V14-MEAS-02 | Combined Measurements require compatible dimensions; unit conversion/result units remain stable | `MEAS-UNITS-*` | Mixed scales, incompatible dimensions, aggregate first-unit, selected min/max unit | 086 |
| V14-TEXT-01 | `len` accepts strings and lists; string count uses Unicode code points | `TEXT-LEN-*` | ASCII, supplementary code point, combining sequence, and list cases | 087 |
| V14-TEXT-02 | `trim` removes exactly the approved surrounding whitespace | `TEXT-TRIM-*` | Whitespace table and internal-whitespace preservation | 087 |
| V14-TEXT-03 | `left`/`right` default to one code point and use code-point slicing | `TEXT-SLICE-*` | Zero/default/oversized/supplementary/combining-sequence cases | 087 |
| V14-TEXT-04 | Invalid slice counts are explicitly diagnosed | `TEXT-COUNT-*` | Negative, non-integer, non-finite, wrong-type cases and exact ranges | 087 |
| V14-FMT-01 | `format` handles Number and Measurement using a bounded numeric pattern subset | `FORMAT-VALID-*` | Final pattern grammar and positive examples | 087 |
| V14-FMT-02 | Decimal precision, grouping, percent, currency, and negative formatting are deterministic | `FORMAT-DECIMAL-*`, `FORMAT-GROUP-*`, `FORMAT-PERCENT-*`, `FORMAT-CURRENCY-*`, `FORMAT-NEGATIVE-*` | Exact output table including rounding/tie/negative-zero cases | 087 |
| V14-FMT-03 | Default locale is fixed `en-US`; supported/unsupported locales are explicit and offline | `FORMAT-LOCALE-*` | Locale allowlist and exact decimal/group/currency outputs | 087 |
| V14-FMT-04 | Formatting a Measurement appends its displayed unit | `FORMAT-MEAS-*` | Exact value/unit separator, scale, and suffix output | 087 |
| V14-FMT-05 | Invalid/unsupported patterns/locales fail explicitly | `FORMAT-INVALID-*` | Exact diagnostics, source ranges, no fallback | 087 |
| V14-COMP-01 | Existing syntax, type checking, diagnostics, editor behavior, and runtime behavior remain unchanged outside additions | `REGRESSION-*` | Baseline contract assertions, no unrelated behavior changes | 085-089 |
| V14-TRACE-01 | Each confirmed requirement has contract fixture(s) and later evidence ownership | All final fixture IDs | This matrix cross-checked against the master plan and artifacts | 084 |

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
