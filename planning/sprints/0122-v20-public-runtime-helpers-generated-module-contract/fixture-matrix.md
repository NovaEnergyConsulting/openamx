# Sprint 122 Helper Fixture and Parity Matrix

## Status and Comparison Rules

Approved fixtures for the S122 public helper contract. Execution results are
recorded in `builder-evidence.md`. Keep every `RT122-*` ID stable through tests
and Builder evidence; D122-15 explicitly scopes enum-default AMX parity to
source forms the current language can express.

For AMX parity, run identical values through the current AMX runtime and the
separately authored TypeScript consumer. Compare values, unit identity/display,
list/record contents, view discriminants/order, error code/message/context, and
snapshot immutability. Use exact comparisons unless an affine/IEEE-754 case
has a specific approved absolute and relative tolerance. Never compare
renderer output.

## Public Package and Type Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| RT122-PKG-01 | Import value and type from `openamx/transpiler-runtime` after the approved build. | Public JS and `.d.ts` resolve from package export map; no `src/` import. |
| RT122-PKG-02 | Import existing S121 names: `AMXInputError`, primitive/enum/list/record/measurement guards, measurement helpers, and view constructors. | Existing signatures/behavior remain compatible. |
| RT122-PKG-03 | Inspect declaration closure and runtime dependency graph. | No parser/checker/evaluator/renderer/filesystem internal is re-exported or leaked through a public signature. |
| RT122-TYPE-01 | Strict consumer creates typed `AMXRunResult<Exports>`, measurements, descriptors, and all view DTO kinds. | No implicit or explicit `any`; public generics preserve entry export type. |
| RT122-ERR-01 | Trigger one range, list, measurement, builtin, and input error with source context. | Accepted AMX code and source/input context survive; new codes are allocated before use. |

## Operation and List Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| RT122-OP-NUM-01 | Numeric `+ - * / % ^`, unary minus, and precedence | Exact Number results and left-to-right single evaluation match AMX. |
| RT122-OP-CMP-01 | Equality, inequality, ordering, Boolean conversion, `and`/`or`/`not` | Accepted coercion/evaluation and comparison behavior matches AMX. |
| RT122-OP-MEASURE-01 | Compatible linear measurement arithmetic/comparison | Dimensions and computed values match AMX; display-unit rules are exact. |
| RT122-OP-AFFINE-01 | Celsius/Fahrenheit/Kelvin conversion, subtraction, direct addition, multiply/divide/power/root rejection | Accepted affine values/units match; rejected cases preserve error code and source. |
| RT122-LIST-GET-01 | First, last, nested, and invalid 1-based index | Correct element or accepted bounds error; no zero-based leakage. |
| RT122-LIST-ADD-01 | Append and insertion at first/last positions; invalid positions; immutable target | Exact mutated list and AMX1008 behavior. |
| RT122-LIST-REMOVE-01 | Pop, remove interval, zero/negative/out-of-bounds count/index | Exact mutation and accepted error behavior. |
| RT122-LIST-RANGE-01 | Ascending, descending, singleton, invalid fractional/nonfinite bounds | Inclusive ordered sequence or AMX1005. |
| RT122-LIST-ITER-01 | Loop order, empty loop, binding restoration, non-list iterable | Values and AMX1006 behavior match evaluator. |
| RT122-LIST-COPY-01 | Function-like argument boundary with nested/repeated list references | Recursive copy and alias isolation match existing AMX function calls. |
| RT122-UNARY-01 | Unary minus on number/measurement and `not` on supported values | Display-unit retention and Boolean conversion match AMX. |

## Builtin Fixtures

| ID | Names / cases | Expected result |
| --- | --- | --- |
| RT122-BI-AGG-01 | `sum`, `min`, `max`, `mean` on numbers, empty/nonempty lists, and compatible measurements | Existing result/empty-list errors; physical affine aggregate and display-unit selection match AMX. |
| RT122-BI-ROUND-01 | `round`, `abs`, `sqrt`, `pow` on numbers and allowed measurements | Values/units match AMX; affine and invalid-domain failures retain code/context. |
| RT122-BI-MATH-01 | `sin`, `cos`, `tan`, inverse/hyperbolic variants, `ln`, `log`, `exp` | Domain/range/finite behavior matches the standard library exactly. |
| RT122-BI-TEXT-01 | `len`, `trim`, `left`, `right` including Unicode code points and invalid counts | Results and AMXSL003/arity errors match current behavior. |
| RT122-BI-FORMAT-01 | `format` patterns, locale, percentage, measurement display | Output string/unit and AMXSL006/domain errors match. |
| RT122-BI-ERROR-01 | Unknown builtin and invalid arity/type for every builtin family | Existing diagnostic identity/message/source anchor; no swallowed exception. |

## Input and Enum Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| RT122-IN-PRIM-01 | Number/String/Boolean/DateTime valid and invalid values | Correct normalized type; Number finite; DateTime valid RFC 3339 string. |
| RT122-IN-ENUM-01 | String and numeric enum member/nonmember/type mismatch | Only exact resolved values accepted; error path and AMX4003 exact. |
| RT122-IN-RECURSE-01 | Enum nested in list, record, nullable field, and generated default factory | Valid/invalid recursive members, nullable and list/record paths, and helper default factories pass. Under D122-15, no AMX parity claim is made for enum-valued record defaults because current AMX cannot express them. |
| RT122-IN-FIELD-01 | Missing required, omitted optional, defaulted field, explicit null, unknown key | Current S121 presence/default semantics are exact and distinct. |
| RT122-IN-MEASURE-01 | Exact `{value,unit}` linear/affine measure and alias | Correct display unit/value and dimension; no scale/offset serialized. |
| RT122-IN-INVALID-01 | Extra/missing measurement key, unknown unit, wrong vector, nonfinite value/result | Reject before evaluation with exact `AMXInputError` fields. |
| RT122-IN-FILE-JSON-01 | File-backed JSON record containing imported string/numeric enum | Existing validator accepts member, rejects nonmember, preserves nested path. |
| RT122-IN-FILE-CSV-01 | File-backed CSV record with imported string/numeric enum columns, defaults, and null cases | Existing validator accepts exact string/numeric members and rejects nonmembers with AMX4003 paths. |

## View and Result Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| RT122-VIEW-TABLE-01 | Table with selected/reordered columns, nulls, nested values, two snapshots around mutation | Ordered detached rows; each snapshot preserves its own values. |
| RT122-VIEW-CHART-01 | Bar/column/line/scatter with labels, headings, series, `showTable`, mixed measurements | Normalized data and measurement descriptors match AMX `ChartViewEmission`; no renderer model. |
| RT122-VIEW-DIAGRAM-01 | Declaration-time line/rectangle/circle/text elements, timeline, empty diagram | Distinct diagram DTO with accepted complete initial-frame scene data. |
| RT122-VIEW-COPY-01 | Mutate original arrays/records after DTO construction and attempt to mutate returned DTO | Original remains unfrozen; DTO is detached and recursively frozen. |
| RT122-VIEW-ORDER-01 | Imported diagram plus entry table/chart shows and repeated show after reassignment | Module/source/evaluation ordering and event kinds match D121-15. |
| RT122-VIEW-INVALID-01 | Cyclic object or unsupported value passed into view constructor | Documented typed AMX error; no stack overflow or partial DTO. |
| RT122-RESULT-01 | Generic result has explicit exports and readonly table/chart/diagram views | Strict consumer can read result; non-exported values are absent. |

## Separately Authored Consumer Fixture

The external fixture is authored directly in TypeScript, not emitted from AMX.
It imports runtime symbols only from `openamx/transpiler-runtime`. It should:

- Define generated-style `AMXRunInputs`/`AMXRunExports` and a typed synchronous
  `run(inputs): AMXRunResult<AMXRunExports>`.
- Validate finite Number, string/numeric enum, nested record/list defaults,
  and a `{ value, unit }` measurement.
- Exercise list/index/range helpers, one arithmetic/builtin path, one affine
  operation/rejection, and all three view DTO discriminants.
- Compare normalized exports/views/errors to a small AMX oracle using
  `loadEntryModule`; the oracle path stays outside the public consumer imports.
- Be typechecked strictly using the accepted TS 5.9.3/ES2022/ESNext/bundler
  baseline and executed with Bun 1.4.5. Record exact fixture and command hashes.

The helper import resolution proof and runtime assertions are separate rows;
successful compilation alone is not semantic parity.

## Master-Plan Traceability

| Requirement ID | Sprint 122 master-plan requirement | Fixture / contract coverage | Builder result |
| --- | --- | --- | --- |
| V20-S122-01 | Provide a stable public helper subpath without exposing unrelated internals. | RT122-PKG-01 through RT122-PKG-03; `runtime-api-contract.md` | PASS |
| V20-S122-02 | Provide only helpers needed for AMX calculation semantics and typed caller input validation; reuse runtime behavior. | All rows in Operation and List Fixtures, Builtin Fixtures, and Input and Enum Fixtures; `runtime-api-contract.md`, `input-validation-contract.md` | PASS for applicable behavior |
| V20-S122-03 | Complete the separately authorized enum-input validation prerequisite before claiming enum parity. | RT122-IN-ENUM-01, applicable RT122-IN-RECURSE-01 cases, RT122-IN-FILE-JSON-01, RT122-IN-FILE-CSV-01; D122-15 enum-default residual | PASS for member parity; no enum-default AMX parity claim |
| V20-S122-04 | Define generated types and `run(inputs)` contracts for exports and structured views, including declaration-time diagrams. | RT122-TYPE-01, RT122-RESULT-01, all rows in View and Result Fixtures; `view-dto-contract.md` | PASS |
| V20-S122-05 | Compile and run a separately authored TS fixture importing the helper entry point; verify module compatibility and runtime behavior. | RT122-PKG-01, `Separately Authored Consumer Fixture`, applicable parity rows | PASS |

The S121 four-case probe remains separate evidence. Passing RT122 consumer
fixtures does not replace S121 final feasibility closeout or authorize S123.