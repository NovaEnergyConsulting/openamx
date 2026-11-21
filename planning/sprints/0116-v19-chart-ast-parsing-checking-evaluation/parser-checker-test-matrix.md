# Sprint 116 Parser, Checker, Evaluation, Formatter, and Model Matrix

## Status and Scope

Architect-prepared execution matrix. `NOT RUN` is the preparation status; no
row claims current production support. Sprint 116 implementation evidence must
retain the stable Sprint 115 CHT IDs and add the S116-internal IDs below where
an internal layer needs an independent assertion.

Actual output-omission cases CHT-HTML-01, CHT-PDF-01, CHT-DOCX-01,
CHT-OUTPUT-OMISSION-01, and CHT-OUTPUT-TRUE-01 belong to S119. They are included
only as the accepted downstream boundary and must not be reported PASS by S116.

## Core Positive and Negative Cases

| Case ID | Input/condition | Parser expected | Checker expected | Evaluation/model expected | Owner test |
| --- | --- | --- | --- | --- | --- |
| CHT-AST-01 | Valid option in all chart kinds | One `chartShowTableOption` per chart with expression/source | Ordinary chart passes | Emission/model Boolean value | parser + model |
| CHT-ORDER-01 | Option placed between title and series | AST preserves exact option source order | Existing title/description/series checks unchanged | No data/model reorder | parser/model |
| CHT-OMIT-01 | Chart omits option | No new AST option | Chart passes | Emission/model `showTable === false` | evaluator/model |
| CHT-FALSE-01 | `showTable false` | Boolean literal AST | Boolean type passes | Emission/model exact false | parser/evaluator/model |
| CHT-TRUE-01 | `showTable true` | Boolean literal AST | Boolean type passes | Emission/model exact true | parser/evaluator/model |
| CHT-EXPR-01 | `showTable threshold >= 10 and enabled` | Ordinary binary Boolean AST; source starts at `threshold` | Boolean expression passes | One evaluation at `show`; exact result in emission/model | parser/evaluator/model |
| CHT-ENV-01 | Binding changes between two `show` statements | Same declaration AST | Name/type valid at declaration check | First and second emissions reflect current Boolean independently | evaluator |
| CHT-KIND-01 | Bar, column, line, scatter use option | Accepted chart-only option in every kind | All chart-shape checks unchanged | Four emissions/models retain expected Boolean | parser/checker/evaluator/model |
| CHT-TYPE-01 | Number/String/list/record/nullable Boolean/Measurement expression | Expression AST parses | `AMX3002` at expression; no coercion | Not evaluated after failed check | checker |
| CHT-DUP-01 | Two valid options | Both nodes retained in source order | `AMX3005` at second option; `Repeated 'showTable' option` | No emission created | parser/checker |
| CHT-PARSE-01 | Missing expression | Reject before AST completion | N/A | No evaluation | parser |
| CHT-PARSE-02 | `showTable: true` | Reject as malformed chart option | N/A; accepted parse-family behavior | No evaluation | parser |
| CHT-PARSE-03 | Trailing malformed syntax | Ordinary parse error | N/A | No evaluation | parser |
| CHT-TABLE-01 | Option in table block | Recognized or existing invalid table path | `AMX3003` at option | No emission/model | parser/checker |
| CHT-NAME-01 | Unknown/not-yet-visible identifier | Expression identifier AST | Preserve `AMX3001` at identifier | No evaluation | parser/checker |
| CHT-CALL-01 | Valid ordinary call returning Boolean and invalid call variant | Ordinary call AST | Return type/arity use existing behavior | Valid call evaluated once; invalid fails ordinarily | checker/evaluator |
| CHT-DEFAULT-REG-01 | Existing chart omits option and emits table-model data | Parse unchanged | Check unchanged | `showTable false`; table/plot/series data unchanged inside S116 model | model/evaluator regression |
| CHT-SOURCE-01 | Indented option and Unicode/CRLF expression envelope | Exact option/expression UTF-16 columns retained | Diagnostic/range mapping verified | Emission unaffected; source retained in declaration | parser/checker |
| CHT-FORMAT-01 | Chart option with compound expression/parentheses | Parse before/after format | Both semantic ASTs equal | Boolean snapshot unchanged after format | formatter |
| CHT-IMMUTABLE-01 | Emission and model captured after evaluation | N/A | N/A | Resolved fields are immutable/frozen with existing snapshot | evaluator/model |

## Formatter and Round-Trip Matrix

| Case | Required assertion | Expected S116 result |
| --- | --- | --- |
| FMT-S116-01 | Indentation of a valid chart with showTable at source position | Option becomes/retains two spaces inside chart; expression text unchanged |
| FMT-S116-02 | `showTable (threshold >= 10) and enabled` | Parentheses/operator text preserved; no custom parenthesization introduced |
| FMT-S116-03 | Parse-format-parse | One chart showTable option before and after; equivalent expression shape and source-relative order |
| FMT-S116-04 | LF/CRLF document formatting | Existing newline style retained; complete-document option line/column remains valid |

Production formatter changes are not assumed. A row may pass through the
existing generic formatter; that is valid evidence if tests prove stability.

## Model and Staging Matrix

| Case | Required assertion | Expected S116 result |
| --- | --- | --- |
| MOD-S116-01 | `model.showTable` equals emission Boolean | True for all omitted/false/true/dynamic fixtures |
| MOD-S116-02 | False model still has existing table | Table headings/rows/accessibility table reference remain until S119 |
| MOD-S116-03 | Plot option/series/axes/table behavior unchanged | Deep semantic equality for fixtures differing only by showTable field |
| MOD-S116-04 | Model construction does not evaluate expression | Declaration AST remains expression; no evaluator call/path in `chartModel` |
| MOD-S116-05 | Emission/model objects remain immutable | New Boolean is retained in frozen structures; existing immutability tests still pass |

## Downstream Boundary Rows

| S115 case | S116 ownership | Required S116 status |
| --- | --- | --- |
| CHT-HTML-01 | None | NOT RUN / S119 |
| CHT-PDF-01 | None | NOT RUN / S119 |
| CHT-DOCX-01 | None | NOT RUN / S119 |
| CHT-OUTPUT-OMISSION-01 | None | NOT RUN / S119; S116 explicitly permits existing tables |
| CHT-OUTPUT-TRUE-01 | Data/model regression only | S116 may verify internal table retained; rendered true output remains S119 |
| CHT-DEFAULT-MIGRATION-01 | None | NOT RUN / S119 documentation/example migration |

## Complete Positive Snapshot Fixture

````text
# Sprint 116 dynamic visibility fixture

```amx
let values: Number[] = [1, 2]
let enabled: Boolean = true
let threshold: Number = 10
chart amounts = column(values) {
  title: "Amounts"
  description: "Dynamic visibility"
  showTable threshold >= 10 and enabled
  series "Value"
}
show amounts
enabled = false
show amounts
```
````

Expected S116 values: first emission `showTable` is true; second emission is
false. Both share the normalized plot/table data shape and frozen snapshots.
The existing renderer may still emit tables for both emissions in this sprint.

## Complete Diagnostic Envelopes

```amx
let values: Number[] = [1]
chart invalidType = column(values) {
  title: "Invalid"
  description: "Not Boolean"
  showTable 1
  series "Value"
}
```

Expected: `AMX3002` at the expression `1`.

```amx
let values: Number[] = [1]
chart duplicate = column(values) {
  title: "Duplicate"
  description: "Repeated visibility"
  showTable true
  showTable false
  series "Value"
}
```

Expected: `AMX3005` at the second `showTable` option.

Exact complete-document lines/columns are recorded by the Builder only after
production parser/checker execution. Planning examples do not claim final
source ranges.

## Master-Plan Traceability

| Sprint 116 master-plan bullet | Matrix evidence | Required status at closeout |
| --- | --- | --- |
| Extend chart option AST | CHT-AST-01, CHT-ORDER-01, CHT-SOURCE-01 | Executed focused parser/model evidence |
| Parse all chart kinds and malformed options | CHT-KIND-01, CHT-PARSE-01/02/03 | Executed parser evidence |
| Require Boolean, diagnostics/default | CHT-OMIT-01, CHT-TYPE-01, CHT-NAME-01, CHT-DUP-01 | Executed checker evidence |
| Evaluate expression and emit resolved value | CHT-EXPR-01, CHT-ENV-01, CHT-FALSE-01, CHT-TRUE-01 | Executed evaluator snapshot evidence |
| Propagate through shared chart model | MOD-S116-01/02/03/04/05 | Executed model evidence |
| Parser/checker/evaluator/formatter/model tests | All core, formatter, and model rows | Focused suite outcomes recorded |
| Leave rendering changes for S119 | Downstream boundary rows | Explicit NOT RUN/OUT OF SCOPE |
