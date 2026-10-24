# Sprint 097 Runtime Test Matrix

## Status and Gate

This matrix is planning-only and inherits the accepted Sprint 095 fixtures.
Sprint 097 implementation is **BLOCKED** until D-095-13 receives an exact
diagnostic allocation and separate execution authorization is recorded.

Use `tests/evaluator.test.ts` and the existing test conventions. Because
`evaluateDocument` calls `checkDocument` and statement-body checking belongs
to Sprint 098, use a test-only helper around `parseDocumentText`,
`Environment`, and exported `evaluateStatements` for runtime-specific
statement-body cases. Do not weaken production static checking to enable
these tests.

## Control Flow

| Case | Sprint 095 fixture | Expected runtime behavior | Required assertion |
| --- | --- | --- | --- |
| `R097-FLOW-01` | `V16-FN-EXPR-01` | Existing expression function returns the same value. | Result `12`; standard checked path remains passing. |
| `R097-FLOW-02` | `V16-FN-FLOW-01` | Selected if/else branch returns its expression value from the call. | `choose(3) = 3`; `choose(0) = 0`. |
| `R097-FLOW-03` | `V16-FN-FLOW-04` | Nested statement-if return exits the function. | `select(4) = 4`; no later path runs. |
| `R097-FLOW-04` | `V16-FN-FLOW-05/06` | Return inside statement loop exits at first item; fallback return runs only for empty list. | Nonempty result `7`; empty result `0` for FLOW-06. |
| `R097-FLOW-05` | `V16-FN-FLOW-06` | Return signal unwinds iterator and block cleanup. | Iterator's prior binding remains intact after the call. |
| `R097-FLOW-06` | `V16-FN-FLOW-07` | Statement after return is not executed. | Mutated local is not returned; function result is `5`. |
| `R097-FLOW-07` | `V16-FN-FLOW-10` | Runtime exits at first return; later return is not evaluated. | Result `5`; static error for second return remains Sprint 098. |
| `R097-FLOW-08` | `V16-FN-FLOW-11` | Braced-if expression branch return is consumed by the expression, not function call. | `choose(1) = 11`. |
| `R097-FLOW-09` | `V16-FN-FLOW-09` | Expression-form loop keeps collecting values. | Result `[4, 6]`; no function return signal is generated. |
| `R097-FLOW-10` | `V16-FN-RUNTIME-01` | Invalid statement-body fallthrough raises allocated D-095-13 diagnostic. | Exact code/message and closing-brace location. **BLOCKED until allocation.** |

## Scope

| Case | Sprint 095 fixture | Expected runtime behavior | Required assertion |
| --- | --- | --- | --- |
| `R097-SCOPE-01` | `V16-FN-SCOPE-01` | Parameter assignment is call-local. | Result `5`; caller binding remains `4`. |
| `R097-SCOPE-02` | `V16-FN-SCOPE-02` | Branch locals do not escape; sibling branches may use same local name. | Function returns `1`; local absent after branch/call as appropriate. |
| `R097-SCOPE-03` | `V16-FN-SCOPE-03` | Assignment and `+=` to visible outer local survive branch exit within call. | Function result `3`. |
| `R097-SCOPE-04` | `V16-FN-SCOPE-04` | Loop iterator shadows then restores parameter/local. | Function result `2` after iteration. |
| `R097-SCOPE-05` | `V16-FN-SCOPE-05` | Same-scope repeated `let` updates binding. | Function result `5`. |
| `R097-SCOPE-06` | `V16-FN-SCOPE-06` | Nested `let` shadows parameter only for the block. | Function result `2`. |
| `R097-SCOPE-07` | `V16-FN-FLOW-04/06` | Scope and iterator restoration still occur on non-local function return. | Outer parameter/local values are restored before result delivery. |

## List Arguments and Results

| Case | Sprint 095 fixture | Expected runtime behavior | Required assertion |
| --- | --- | --- | --- |
| `R097-LIST-01` | `V16-FN-LIST-01` | Nested arrays are copied recursively before nested row mutations. | Caller `[[1],[2]]`; result `[[1,9],[2,9]]`. |
| `R097-LIST-02` | `V16-FN-LIST-02` | Repeated argument receives independent per-parameter copies. | Mutating `first` leaves `second` and caller as `[1]`. |
| `R097-LIST-03` | `V16-FN-LIST-03` | Local array mutation and return produce the call result directly. | Result `[1]`; caller-independent local. |
| `R097-LIST-04` | `V16-FN-LIST-04` | Array copy does not clone non-array elements. | A focused helper assertion may verify opaque element identity; no source-level record mutation is introduced. |
| `R097-LIST-05` | Accepted contract, nullable-list clarification | Null remains null; a non-null array under nullable-list annotation is copied if the approved interpretation includes it. | Exact case is gated on explicit disposition if not covered by D-095-06/11. |
| `R097-LIST-06` | Contract boundary | Non-list parameters and expression-body calls retain prior behavior. | Existing regression cases pass unchanged. |

## Test Harness and Isolation Checks

- Parse the fixture through the real parser. Construct the minimum test
  `Environment` with existing record/function/unit metadata as needed, then
  invoke exported `evaluateStatements` on parsed statement nodes.
- Ensure function declarations are registered by the normal evaluator path
  before evaluating the call expression. Do not create a second production
  function-call implementation for tests.
- Use a standard `evaluateDocument` test for expression-body compatibility.
- If tests must directly invoke an expression, use the existing exported
  evaluator API; otherwise put the call in a top-level `variableDeclaration`
  and inspect the resulting environment.
- Assert cleanup after both normal return and thrown runtime diagnostics.
- Keep any test helper in the approved test file and do not edit
  `checkDocument.ts` to accept incomplete function-body type checking.