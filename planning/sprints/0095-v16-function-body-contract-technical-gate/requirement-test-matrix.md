# Sprint 095 Draft: Requirement-to-Test Matrix

## Status

Rows below establish minimum traceability. Sprint 095 must reconcile them
against the final contract, add any omitted requirement/fixture, and verify
all IDs and expected outcomes before disposition. Sprint ownership is aligned
with the V0.16 master plan.

| Requirement ID | Requirement | Contract fixtures | Later owner / surface | Expected evidence |
| --- | --- | --- | --- | --- |
| `V16-FN-01` | Preserve expression-body syntax and behavior. | `V16-FN-EXPR-01` | 096 parser; 097 runtime; 098 checker; 099 formatter | Existing regression plus new declaration-shape checks. |
| `V16-FN-02` | Parse brace-delimited statement bodies with source locations. | `V16-FN-FLOW-01`, `V16-FN-PARSE-01`, `V16-FN-PARSE-02` | 096 parser | Parse tree/source-location assertions for nested braces and malformed bodies. |
| `V16-FN-03` | Permit only approved statement forms; reject module/document actions. | `V16-FN-PARSE-02`, `V16-FN-PARSE-03` | 096 parser; 098 checker | Positive/negative parser and type-check fixtures. |
| `V16-FN-04` | Return exits function from direct/nested function statements. | `V16-FN-FLOW-01`, `V16-FN-FLOW-04`, `V16-FN-FLOW-06`, `V16-FN-FLOW-07` | 097 runtime | Exact call result and proof later statements/iterations do not execute. |
| `V16-FN-05` | Preserve expression-loop return collection. | `V16-FN-FLOW-09` | 097 runtime; 098 checker | Existing expected list result and no function-return propagation. |
| `V16-FN-06` | Require compatible returns on all reachable paths. | `V16-FN-FLOW-01` through `V16-FN-FLOW-06`; `V16-FN-TYPE-01/02` | 098 type checker | Positive/negative path matrix with exact diagnostics. |
| `V16-FN-07` | Loops that may execute zero times do not guarantee a function result. | `V16-FN-FLOW-05`, `V16-FN-FLOW-06` | 098 type checker; 097 runtime | Empty/nonempty list cases and fallthrough analysis. |
| `V16-FN-08` | Keep parameters/locals in isolated lexical call scope. | `V16-FN-SCOPE-01`, `V16-FN-SCOPE-02`, `V16-FN-TYPE-03`, `V16-FN-TYPE-04` | 097 runtime; 098 checker; 099 editor facts | Caller unchanged; block local not visible outside; invalid assignment target diagnosed at source. |
| `V16-FN-09` | Deep-copy list parameters independently, including repeated/nested inputs. | `V16-FN-LIST-01`, `V16-FN-LIST-02` | 097 runtime | Caller, sibling parameter, and nested value assertions. |
| `V16-FN-10` | Permit local list mutation and return the resulting list. | `V16-FN-LIST-03` | 097 runtime; 098 checker | Exact returned sequence and caller-isolation assertions. |
| `V16-FN-11` | Preserve visibility, declaration order, and no recursion/forward refs/closures. | Sprint 095 must add locked positive/negative fixtures after source inventory. | 096 parser; 097 runtime; 098 checker; modules in 101 | Same-module order, import/export, recursion, forward-ref, and capture tests. |
| `V16-FN-12` | Diagnostics are stable and source-grounded. | `diagnostic-matrix.md` IDs | 096/098 parser/checker; 097 runtime guard | Exact diagnostic code/message/phase/range; LF/CRLF and UTF-16 checks as applicable. |
| `V16-FN-13` | Formatter/editor work receives stable semantics and identifiers. | All accepted function/scope/error fixtures | 099 shared, VS Code, desktop | Reused fixtures for formatting, highlighting, completion, navigation, diagnostics. |
| `V16-FN-14` | Specification/examples expose approved syntax and semantics. | All accepted valid fixtures | 100 docs/examples/help | Runnable examples validated after runtime/type-check implementation. |

## Matrix Completion Rules

- No confirmed master-plan requirement may be omitted. Add stable IDs for
  gaps discovered during review; do not renumber an ID already used in this
  package without recording the mapping.
- Each fixture maps to at least one requirement and one later owner. Each
  requirement maps to one or more fixtures and an evidence method.
- Contract-only evidence must not be described as parser/runtime/type-checker
  acceptance. Later implementation sprints own those results.
- Module/export compatibility remains in the acceptance matrix even though
  implementation behavior is not changed by Sprint 095.