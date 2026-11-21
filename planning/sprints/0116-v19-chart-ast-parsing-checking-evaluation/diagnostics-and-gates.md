# Sprint 116 Diagnostics and Gates

## Diagnostic Contract

Sprint 116 adds no stable diagnostic code. The following accepted Sprint 115
mapping is authoritative. Exact messages and source ranges must be verified
against complete AMX documents during execution.

| Case | Condition | Phase | Primary anchor | Accepted policy |
| --- | --- | --- | --- | --- |
| CHT-EXPR-01 | Parsed Boolean expression succeeds | Parse/check/evaluate | Expression subtree | No diagnostic |
| CHT-OMIT-01 | No option | Contract default | N/A | Resolve false; no diagnostic |
| CHT-FALSE-01 / CHT-TRUE-01 | Literal Boolean | Check/evaluate | Expression | Exact Boolean accepted |
| CHT-TYPE-01 | Result is Number, String, list, record, Measurement, or nullable Boolean | Static check | Expression source | Reuse `AMX3002` expected `Boolean`/actual type |
| CHT-DUP-01 | More than one option | Static check | Second option source | Reuse `AMX3005`; `Repeated 'showTable' option` candidate accepted message |
| CHT-PARSE-01 | Missing expression, colon form, or malformed tail | Parse | First offending token; option source when no tail exists | Reuse `AMX3006`; invalid chart option/expression message under existing family |
| CHT-TABLE-01 | Option appears in table declaration | Static check | Option source | Reuse `AMX3003`; `Option is not valid for a table` |
| CHT-NAME-01 | Unknown/not-yet-visible expression identifier | Static check | Identifier source | Preserve ordinary `AMX3001` |
| S116-EXPR-CALL-01 | Invalid ordinary call/type/operator inside expression | Static check | Ordinary offending source | Preserve existing diagnostic, not a showTable wrapper |
| S116-RUNTIME-TYPE-01 | A bypassed/unchecked path produces a non-Boolean runtime value | Runtime defensive guard | Expression source | `AMX3002` exact-type mismatch; no truthiness fallback |

## Source-Location Rules

- Option source is 1-based line/column at the first non-whitespace character of
  `showTable` in the complete original document.
- Expression source is 1-based line/column at the first expression token.
- `end` positions, where supplied, are exclusive and preserve UTF-16 code-unit
  columns under established repository conventions.
- Duplicate diagnostics anchor at the second valid option, not the chart
  declaration or first occurrence.
- Type errors anchor at the expression/type-bearing ordinary AST source, not at
  the keyword, unless existing inference has no narrower node.
- Formatter and parser round-trip tests must retain LF/CRLF document mapping and
  original chart-option source order.
- A parser error for `showTable` with no expression must provide a source at or
  immediately after the keyword; it may not silently accept empty text.

## Type and Environment Gates

- The static type must equal `Boolean`, not `Boolean?` and not a type accepted
  by truthiness. AMX has no implicit Boolean coercion.
- Binding resolution uses the normal declaration environment; the expression
  cannot introduce a variable or use a later declaration.
- Function calls use established purity and return-type rules. S116 must not
  build a chart-only whitelist or constant folder.
- The evaluator reads the then-current values at each `show`; it must not cache
  the first result in the chart declaration.

## S116/S119 Boundary Gate

A false resolved value is a successful Sprint 116 result even though the
existing renderer may continue producing a table. The sprint verifies only:

- emission Boolean;
- model Boolean;
- one evaluation at each snapshot;
- unchanged plot/table construction.

It does not pass or fail S119's actual HTML/PDF/DOCX omission requirement. The
Builder evidence must label table omission tests as OUT OF SCOPE/NOT RUN, not
PASS.

## Stop Conditions

- Any proposed change to `AMX` diagnostic identities or a need for a new stable
  code requires Lead Developer allocation and a scope/contract amendment.
- Any parser strategy that creates a chart-specific expression evaluator,
  multiline showTable form, colon syntax, or literal-only behavior blocks the
  sprint and must return to the product owner.
- Any implementation that evaluates in `checkChart`, chart-model construction,
  or a renderer instead of `snapshotView` violates accepted D115-02.
- Any implementation that changes renderer/accessibility output in S116 is out
  of scope and requires a separate S119 amendment/authorization.
- Any `undefined`/optional `showTable` field leaking from S116 emission/model is
  a contract failure; omitted syntax must resolve to an explicit false.
