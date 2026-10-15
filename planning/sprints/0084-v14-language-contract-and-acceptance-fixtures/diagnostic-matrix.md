# Sprint 084 V0.14 Diagnostic Matrix

## Status

This is an Architect-prepared matrix with Builder evidence and
Lead Developer/product-owner diagnostic allocations recorded below.
`V14-DIAG-*` are planning-only row identifiers, **not AMX diagnostic codes**.
Do not use those row identifiers in production code.

The category table below is the Architect's initial coverage proposal.
`Builder Review and Current Disposition` supersedes its candidate allocation
text with the user-approved exact identities/messages and source ranges.

## Source-Location Convention

Locations refer to the complete original AMX document, including front
matter, narrative, and executable-fence lines. Lines and columns are 1-based;
columns count UTF-16 code units; diagnostic ends are exclusive. Tests must
cover LF and CRLF. A valid `is` mismatch has no diagnostic.

## Candidate Diagnostic Cases

| Planning ID | Fixture IDs | Condition and expected phase | Candidate primary location | Required disposition |
| --- | --- | --- | --- | --- |
| V14-DIAG-01 | `IS-SYNTAX-*` | Missing or malformed type target after `is`; parse/type diagnostic, never a runtime `false` | First unexpected token or `is` target position according to parser convention | Reuse the established syntax diagnostic if exact; otherwise allocate a new identity |
| V14-DIAG-02 | `IS-TARGET-UNKNOWN-*` | Unknown or invisible target type | Unknown target name | Resolve against type namespace and existing source-order/import rules; exact code/message required |
| V14-DIAG-03 | `IS-TARGET-INVALID-*` | Resolved name is not an allowed target type or suffix form | Invalid target name or suffix token | Distinguish invalid target from a valid target that returns `false` |
| V14-DIAG-04 | `MATH-ARITY-*` | Missing or extra arguments to a new math function | Function call | Reuse an existing arity diagnostic only if its message and source range remain accurate |
| V14-DIAG-05 | `MATH-TYPE-*` | Wrong primitive/Measurement type or dimensioned Measurement passed to a dimensionless math function | Offending argument or call, to be locked consistently | Exact type/dimension message and code required |
| V14-DIAG-06 | `MATH-DOMAIN-*` | Argument outside the function's mathematical domain | Function call or offending argument, to be locked | Explicit AMX diagnostic; never return `NaN` or infinity |
| V14-DIAG-07 | `MATH-FINITE-*` | Non-finite input or computed result | Function call | Explicit AMX diagnostic; cover overflow and non-finite propagation |
| V14-DIAG-08 | `MEAS-COMPAT-*` | Incompatible dimensions in a Measurement-aware aggregate/function | Incompatible argument/list element | Exact rejection behavior and source range required |
| V14-DIAG-09 | `TEXT-ARITY-TYPE-*` | Invalid arity or non-string/list argument to text functions | Call or offending argument | Reuse existing diagnostics only when exact semantics match |
| V14-DIAG-10 | `TEXT-COUNT-*` | Negative, non-integral, non-finite, or invalid `left`/`right` count | Count expression | Distinguish zero and oversized valid counts from invalid values |
| V14-DIAG-11 | `FORMAT-ARITY-TYPE-*` | Invalid `format` arity or a value other than Number/Measurement | Call or offending argument | Exact code/message required |
| V14-DIAG-12 | `FORMAT-PATTERN-*` | Malformed, invalid, or unsupported format pattern | Pattern argument | No fallback to another pattern or locale |
| V14-DIAG-13 | `FORMAT-LOCALE-*` | Invalid or unsupported locale identifier | Locale argument | Invalid syntax and well-formed-but-unsupported locale behavior must be explicit |
| V14-DIAG-14 | `FORMAT-FINITE-*` | Non-finite value formatted as a number/Measurement | Value argument | Explicit failure; no `"NaN"`/`"Infinity"` success-shaped output |

## Lock Requirements for Every Row

For each applicable case, replace the planning ID-only state with:

- Stable fixture ID and exact complete AMX source.
- Exact AMX diagnostic identity and message, including interpolation rules.
- Parse, static-analysis, or runtime failure phase.
- Primary and any useful secondary source range, verified against original
  LF and CRLF documents.
- Expected CLI/editor diagnostic representation where applicable.
- Expected non-diagnostic result for the nearest valid boundary case.
- Later owning sprint and focused regression test destination.

Do not create a new code merely to fill a table cell. Reuse an existing code
only if its established behavior, message, and location semantics are a
correct fit. If the product decision changes the confirmed master-plan
contract, record that decision separately before implementation.

## Builder Review and Current Disposition

Execution of the artifact plan and product disposition decisions were
provided by the user on 2026-10-15. `AMXSL001`–`AMXSL006` were explicitly
allocated by the user with the messages below; the allocation was not inferred
from code gaps. Candidate row names (`V14-DIAG-*`) remain planning-only.
Existing codes below are retained only where their established use was verified in
`src/diagnostics/errors.ts`, `src/typechecker/checkDocument.ts`,
`src/runtime/standardLibrary.ts`, and the focused tests. Newly required
identities have not been added to production. A read-only repository search
found no existing `AMXSL001`–`AMXSL006` use; downstream implementation remains
NOT RUN.

All ranges reference the complete proposed documents in
`grammar-examples.md`; line and column are 1-based and end columns exclusive.
Current candidate source ranges are:

| Fixture ID | Condition | Established identity/message or disposition | Candidate primary range |
| --- | --- | --- | --- |
| `IS-SYNTAX-01` | Missing type after `is` | `AMX3006`, `Expected target type after 'is'` | `L5:C18`, zero-width cursor |
| `IS-SYNTAX-SUFFIX-01` | Invalid repeated nullable suffix | `AMX3006`, `Invalid type suffix in 'is' target` | `L5:C27-28` |
| `IS-TARGET-UNKNOWN-01` | Unknown target type | `AMX3001`, `Unknown type 'Missing'` | `L5:C19-26` |
| `IS-TARGET-NONTYPE-01` | Value binding used as target type | `AMX3001`, `Unknown type 'candidate'` | `L6:C19-28` |
| `IS-TARGET-FORWARD-01` | Type declared after target use | `AMX3001`, `Unknown type 'Later'` | `L5:C19-24` |
| `IS-TARGET-UNICODE-UTF16-01` | Unknown target after supplementary character | `AMX3001`, `Unknown type 'Missing'` | `L5:C22-29` using UTF-16 columns |
| `IS-NARROW-01` | Nullable value remains nullable inside true branch | `AMX3002`, `Expected String, got String?` | `L7:C23-28` |
| `MATH-ARITY-01` | Missing `sin` argument | `AMX3004`, `Invalid arity for 'sin'` is the existing checker message shape | `L5:C14-19` |
| `MATH-DOM-ASIN-01` | `asin(2)` | `AMXSL001`, `Invalid input for mathematical function` | `L5:C14-21` |
| `MATH-DOM-ACOS-01` | `acos(-2)` | `AMXSL001`, `Invalid input for mathematical function` | `L5:C14-22` |
| `MATH-DOM-ACOSH-01` | `acosh(0)` | `AMXSL001`, `Invalid input for mathematical function` | `L5:C14-22` |
| `MATH-DOM-ATANH-01` | `atanh(1)` | `AMXSL001`, `Invalid input for mathematical function` | `L5:C14-22` |
| `MATH-DOM-LN-01` | `ln(0)` | `AMXSL001`, `Invalid input for mathematical function` | `L5:C14-19` |
| `MATH-DOM-LOG-01` | `log(-1)` | `AMXSL001`, `Invalid input for mathematical function` | `L5:C14-21` |
| `MATH-FINITE-01` | `exp(10000)` produces a non-finite result | `AMXSL002`, `Function evaluation results in infinite result` | `L5:C14-24` |
| `MATH-NONFINITE-INPUT-01` | `sin(infinite)` | `AMXSL001`, `Invalid input for mathematical function` | `L6:C14-27` |
| `MATH-TYPE-01` | String passed to `sin` | `AMX3002`, `Expected Number or dimensionless Measurement, got String` | `L5:C18-21` |
| `MATH-MEASUREMENT-DIM-01` | Dimensioned Measurement passed to `sin` | `AMX3007`, `'<function>' requires a Number or dimensionless Measurement` (`sin` substituted) | `L7:C18-25` |
| `MEAS-COMPAT-01` | Mixed-dimension list passed to `sum` | `AMX3007`, `List elements have incompatible types` (existing checker path) | `L9:C28-36` |
| `MATH-SQRT-REGRESSION-01` | Negative Number square root | `AMX2005`, `sqrt of negative value` | `L5:C14-22` |
| `MATH-SQRT-MEAS-REGRESSION-01` | Negative Measurement square root | `AMX3010`, `sqrt of a negative measurement value` | `L8:C14-35` |
| `MEAS-EMPTY-MEAN-01` | Empty Measurement `mean` | `AMX2004`, `mean of empty list` | `L8:C14-25` |
| `MEAS-EMPTY-MIN-01` | Empty Measurement `min` | `AMX2004`, `min of empty list` | `L8:C14-24` |
| `MEAS-EMPTY-MAX-01` | Empty Measurement `max` | `AMX2004`, `max of empty list` | `L8:C14-24` |
| `TEXT-COUNT-NEG-01` | Negative count | `AMXSL003`, `Invalid text slice count` | `L5:C24-26` |
| `TEXT-COUNT-FRACTION-01` | Fractional count | `AMXSL003`, `Invalid text slice count` | `L5:C24-27` |
| `TEXT-COUNT-NONFINITE-01` | Non-finite count | `AMXSL003`, `Invalid text slice count` | `L6:C25-33` |
| `TEXT-COUNT-TYPE-01` | String passed as slice count | `AMXSL003`, `Invalid text slice count` | `L5:C24-29` |
| `TEXT-ARITY-01` | Missing `len` argument | `AMX3004`, `Invalid arity for 'len'` | `L5:C14-19` |
| `TEXT-TYPE-01` | Number passed to `len` | `AMX3002`, `len requires a String or list, got Number` | `L5:C18-19` |
| `FORMAT-ARITY-01` | Missing format arguments | `AMX3004`, `Invalid arity for 'format'` | `L5:C14-23` |
| `FORMAT-TYPE-01` | String where Number/Measurement is required | `AMX3002`, `format expects a Number or Measurement, got String` | `L5:C21-27` |
| `FORMAT-MALFORMED-01` | Malformed numeric pattern | `AMXSL004`, `Incorrect formatting pattern` | `L5:C24-31` |
| `FORMAT-UNSUPPORTED-01` | Unsupported date pattern | `AMXSL004`, `Incorrect formatting pattern` | `L5:C24-36` |
| `FORMAT-PRECISION-OVERFLOW-01` | Seven mandatory fractional digits exceed the six-digit limit | `AMXSL004`, `Incorrect formatting pattern` | `L5:C31-42` |
| `FORMAT-LOCALE-UNSUPPORTED-01` | Unsupported locale `zz-ZZ` | `AMXSL005`, `Formatting locale is malformed or unsupported` | `L5:C29-36` |
| `FORMAT-FINITE-01` | Non-finite Number format input | `AMXSL006`, `Input is non-finite` | `L6:C21-29` |
| `FORMAT-LOCALE-INVALID-01` | Malformed locale identifier | `AMXSL005`, `Formatting locale is malformed or unsupported` | `L5:C29-43` |

### Product-approved new diagnostic allocations

The user allocated these identities/messages on 2026-10-15. A repository
collision search is recorded in `builder-evidence.md`; allocation here is
planning authority only and does not add production diagnostics.

| Code | Exact message | Cases |
| --- | --- | --- |
| `AMXSL001` | `Invalid input for mathematical function` | Invalid math domain and non-finite math input |
| `AMXSL002` | `Function evaluation results in infinite result` | Non-finite math result |
| `AMXSL003` | `Invalid text slice count` | Negative, fractional, non-finite, or non-Number count |
| `AMXSL004` | `Incorrect formatting pattern` | Malformed or unsupported pattern |
| `AMXSL005` | `Formatting locale is malformed or unsupported` | Malformed or unsupported locale |
| `AMXSL006` | `Input is non-finite` | Non-finite Number/Measurement passed to `format` |

`FORMAT-FINITE-01` supplies a source-level non-finite Number. Under the V0.9
finite Measurement invariant, a valid AMX source cannot construct a
non-finite Measurement. `AMXSL006` still applies defensively to a malformed
internal Measurement value; a downstream runtime harness may exercise that
guard only if the runtime can construct such a value without weakening the
language contract. That internal case is NOT RUN in Sprint 084.

`AMX3001` is the existing unknown type/name category; `AMX3002` is the
established general type mismatch; `AMX3004` is the function arity/unknown
function category; `AMX3006` is the syntax category; `AMX3007` is the
Measurement mismatch category. They are not blanket codes for any new
failure. In particular, `AMX1009` is emitted by the Measurement-domain error
path and `AMX3010`/`AMX2005` have established Measurement/`sqrt` meanings;
neither has been repurposed for new math or formatter failures.

### Compatibility diagnostics pinned by current evidence

| Fixture family | Verified existing behavior | Status |
| --- | --- | --- |
| Negative Number `sqrt` | Runtime `AMX2005`, message `sqrt of negative value` | APPROVED regression |
| Negative Measurement `sqrt` | Static `AMX3010`, `sqrt of a negative measurement value`; dynamic `AMX1009` with the same text | APPROVED regression |
| Measurement divide-by-zero/non-finite arithmetic | Static `AMX3010`; dynamic `AMX1009`, with established Measurement-specific messages | APPROVED regression |
| Empty `min`/`max`/`mean` | Runtime `AMX2004` and function-specific `... of empty list` messages | APPROVED regression |
| Wrong function arity | Static `AMX3004`, `Invalid arity for '<function>'` | APPROVED existing category |

The source code exposes point diagnostics (`line`, `column`) through
`AmxDiagnostic`; end-exclusive spans in this matrix are the acceptance
fixture contract. The read-only code-collision search passed; candidate
source-coordinate checks passed for the listed spans, and two existing
focused location tests passed. V0.14 runtime diagnostics are not implemented
or tested. The user accepted the Sprint 084 contract on 2026-10-15; Sprint
085 is READY FOR SEPARATE EXECUTION AUTHORIZATION and is not authorized to
start by this disposition.
