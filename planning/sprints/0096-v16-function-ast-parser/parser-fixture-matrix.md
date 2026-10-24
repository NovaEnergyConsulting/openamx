# Sprint 096 Parser Fixture Matrix

## Status and Fixture Authority

Sprint 095 is `ACCEPTED/CLOSED` (2026-10-23). Its fixture envelopes,
diagnostic messages, source anchors, and product decisions are authoritative.
This matrix assigns parser-owned tests; it does not alter fixture semantics.
Feature-path parser evidence is pending Sprint 096 execution.

Use `tests/parser.test.ts` unless the approved file plan justifies a focused
new parser test file. Keep fixtures inline and complete, or link to the
accepted Sprint 095 envelope without copying it with changed syntax.

## Required Cases

| Case ID | Contract fixture(s) | Parser assertion | Expected diagnostic/location | Test focus |
| --- | --- | --- | --- | --- |
| `P096-AST-01` | `V16-FN-EXPR-01` | Existing `=` form retains expression payload and source-order declaration. | Existing success behavior. | Backward compatibility. |
| `P096-AST-02` | `V16-FN-FLOW-01` | Braced body is discriminated as statements; nested if/else nodes and returns are in order. | AST stores function opening/closing sources. | Positive AST shape. |
| `P096-BODY-01` | `V16-FN-SCOPE-01`, `V16-FN-LIST-03` | Initialized let, assignment, add/remove, and direct return parse in one function body. | No type/runtime success claim. | Approved statement list. |
| `P096-BODY-02` | `V16-FN-FLOW-04`, `V16-FN-FLOW-06` | Return nodes parse through nested statement-if and statement-for contexts. | Return AST source points to keyword. | Context propagation. |
| `P096-BODY-03` | `V16-FN-FLOW-09`, `V16-FN-FLOW-11` plus parser-only function expression-loop source | Expression-loop and braced-if expression returns remain distinct from statement-function returns. | Parser builds the existing expression AST; no type-check success is asserted. The existing prohibition on expression-form loops inside either function form remains checker-owned. | Context non-leakage. |
| `P096-BOUNDARY-01` | `V16-FN-PARSE-01` | Malformed function-body statement is rejected. | `AMX3006`, `Invalid syntax in function body`, line 2 column 7. | Exact diagnostic. |
| `P096-BOUNDARY-02` | `V16-FN-PARSE-02` | Missing close is detected at EOF. | `AMX3006`, `Unclosed function body`, line 1 column 34. | Exact anchor. |
| `P096-PROHIBITED-01` | `V16-FN-PARSE-03a` through `03l` | Every prohibited declaration/action is rejected at its own keyword. | `AMX3006`, approved `{keyword}` template; exact per-case anchors in Sprint 095 matrix. | Prohibited statement inventory. |
| `P096-PROHIBITED-02` | Sprint-096-local nested-function parser source; not a new Sprint 095 fixture ID | Nested `fn` declaration is rejected as outside the body statement set. | `AMX3006`, `The 'fn' statement is not allowed in a function body.` | Function-declaration boundary. |
| `P096-LOOP-01` | `V16-FN-FLOW-05`, `V16-FN-SCOPE-04` | Function return is parsed in statement loop; nested loop remains rejected. | Nested-loop diagnostic preserves current behavior. | Loop context. |
| `P096-RETURN-01` | `V16-FN-TYPE-05` | Top-level return is rejected; expression-loop return remains accepted. | `AMX3006`, `Return is only valid inside a function or expression-form loop`, at line 1 column 1. | Return context. |
| `P096-DELIMITER-01` | Accepted D-095-01 | Semicolons do not separate function statements. | `AMX3006`, `Invalid syntax in function body`, at offending token. | Statement separators. |
| `P096-DELIMITER-02` | Parser-owned malformed suffix | Tokens after matching function close are not silently ignored. | `AMX3006`, malformed-body diagnostic at trailing token. | No source truncation. |
| `P096-STRING-01` | Parser-owned positive source | Braces in single/double-quoted strings do not alter function-body nesting. | Successful parse; following declaration remains separate. | String-aware scanning. |
| `P096-STRING-02` | Parser-owned positive source | Escaped quote/string scanner behavior follows `stringScanner.ts`; braces after the quote are counted correctly. | Successful parse or existing string diagnostic, with stable location. | Scanner reuse. |
| `P096-LOCATION-01` | `V16-FN-PARSE-01/02`, `V16-FN-PARSE-03a-l` | Parse same complete AMX document with LF and CRLF. | Identical 1-based line/column anchors. | Line-ending stability. |
| `P096-LOCATION-02` | Parser-owned fenced document | Offsets include original document and executable fence positions. | Exact function/statement location in document. | Document mapping. |

## AST Assertions

For every AST positive case, assert only parser-owned facts:

- Function form is explicitly distinguishable without inspecting source text.
- Expression body retains its established `V02ExpressionNode` shape.
- Statement body contains expected statement discriminants, nesting, and
  source order.
- Function declaration source, body opening/closing source, and nested
  statement/expression sources map to the complete source document.
- Parser does not claim type validity, all-path return completeness, runtime
  result, or list isolation.

## Compatibility Assertions

- Existing parser test for typed expression-bodied functions still passes.
- Existing expression-loop return AST/value tests still pass unchanged. A
  function expression-body containing a `for` expression may parse to its
  existing AST, but the established prohibition remains a static-check rule;
  parser acceptance is not type-check acceptance.
- Existing braced-if expression return parsing remains unchanged.
- Existing statement-loop nesting, `break`, and `continue` restrictions
  remain in effect.
- No test uses a current-parser rejection of statement bodies as evidence
  against the accepted Sprint 095 contract.