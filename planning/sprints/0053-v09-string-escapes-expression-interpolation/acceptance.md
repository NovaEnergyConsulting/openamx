# Sprint 053 Acceptance Criteria

Sprint 053 is complete when:

- Double-quoted strings parse and evaluate full AMX expressions inside `${...}` using existing language semantics, including static checking. No host-language evaluation is used.
- Single-quoted strings do not interpolate; `${...}` remains literal content there.
- Both quote styles decode exactly `\"`, `\'`, `\\`, `\n`, `\r`, `\t`, and `\${`. Unknown escapes, trailing backslashes, and incomplete strings/interpolations fail explicitly with approved syntax diagnostic `AMX3006`.
- Raw source strings remain single-line. Decoded newline/carriage-return characters are produced only by escapes.
- Interpolation scanning handles nested braces/delimiters and quotes/escapes inside embedded expressions. The parser does not terminate at a quoted `}` or merge multiple expressions incorrectly.
- Embedded expression source ranges and diagnostics map to original document offsets, with correct one-based line/column for LF and CRLF and incomplete editor input.
- Pure-expression restrictions remain in force. Interpolations that are syntactically or statically invalid are rejected before runtime; collections are not implicitly stringified and invalid conversion/type cases use `AMX3007` where approved.
- Scalar conversion is exact and deterministic: String contributes decoded contents, Number is locale-independent, Boolean is `true`/`false`, and null is `null`. Measurement text is integrated/tested with Sprint 056 when measurement values exist; Sprint 053 does not invent measurement behavior.
- Existing narrative interpolation continues to use its established final-environment semantics. String interpolation does not alter narrative timing, show-time snapshots, executable-fence boundaries, or inert fences.
- Formatting valid strings preserves decoded meaning and is idempotent. Incomplete/invalid strings are reported rather than silently repaired or returned as successful output.
- Directly affected editor behavior is wired to shared syntax/diagnostics and validated in VS Code and desktop paths where available. UI syntax/diagnostics do not leak into narrative or inert fences.
- Positive backslash literals affected by the intentional escape change are migrated only as needed to preserve their intended values; migration rationale is documented. Negative tests remain intact.
- Scope remains limited to strings and directly necessary integrations. No list operations, measurement implementation, broad documentation/help work, or unrelated UI changes are included.
- Focused and applicable root, desktop, and extension checks are recorded accurately; all executed required checks pass or exact failures/unavailable checks are identified as residuals. `git diff --check` passes.
- Builder evidence and planning state/decisions/questions record exact changes, commands/results, test totals, migration rationale, and residuals, and a separate Lead Developer disposition is requested.

## Required Regression Set

1. Double-quoted interpolation of arithmetic, identifiers, nested expression delimiters, and adjacent literal text.
2. Single-quoted `${...}` remains literal and does not evaluate.
3. Each approved escape in both quote styles, including escaped quote of either kind, backslash, `\n`, `\r`, `\t`, and literal `\${`.
4. Unknown escape, trailing backslash, missing close quote, missing interpolation brace, and nested malformed expression.
5. Strings/quotes/braces inside interpolation and interpolation-like text inside quoted embedded expressions.
6. Static invalid expression and list/record interpolation rejection with source diagnostics.
7. Deterministic Number/Boolean/null output; string value uses decoded content.
8. LF/CRLF and incomplete source-range parity; narrative/inert-fence isolation; formatter meaning/idempotence.
9. Measurement-to-string regression coordinated with Sprint 056 when the measurement runtime is available.

Sprint acceptance does not certify remaining V0.9 feature groups.
