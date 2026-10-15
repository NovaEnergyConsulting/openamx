# Sprint 084 V0.14 Diagnostic Matrix

## Status

This is an Architect-prepared candidate matrix. The `V14-DIAG-*` values below
are planning-only row identifiers, **not AMX diagnostic codes**. Sprint 084
must verify reuse opportunities, allocate any necessary identities, finalize
exact messages and source ranges, and obtain contract approval. Do not use
these row identifiers in production code.

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
