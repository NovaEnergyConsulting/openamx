# Sprint 095 Requirement-to-Test Matrix

## Status

The product owner accepted this traceability matrix with the Sprint 095
contract disposition on 2026-10-23. Fixture behavior remains unimplemented and
is owned by the downstream sprints listed below.

| Requirement ID | Requirement | Contract fixtures | Later owner / surface | Expected evidence |
| --- | --- | --- | --- | --- |
| `V16-FN-01` | Preserve expression-body syntax and behavior. | `V16-FN-EXPR-01` | 096 parser; 097 runtime; 098 checker; 099 formatter | Existing regression plus new declaration-shape checks. |
| `V16-FN-02` | Parse brace-delimited statement bodies with source locations. | `V16-FN-FLOW-01`, `V16-FN-PARSE-01`, `V16-FN-PARSE-02` | 096 parser | Parse tree/source-location assertions for nested braces and malformed bodies. Brace-body acceptance is **NOT RUN** in Sprint 095 because the feature is not implemented. |
| `V16-FN-03` | Permit only approved statement forms; reject module/document actions. | Positive forms: `V16-FN-FLOW-01`, `V16-FN-SCOPE-01`, `V16-FN-LIST-03`; prohibited fixtures: `V16-FN-PARSE-03` and `03a` through `03l` | 096 parser | Positive/negative parser fixtures; all prohibited body statements use the approved AMX3006 message template. |
| `V16-FN-04` | Return exits function from direct/nested function statements. | `V16-FN-FLOW-01`, `V16-FN-FLOW-04`, `V16-FN-FLOW-06`, `V16-FN-FLOW-07`, `V16-FN-FLOW-10`, `V16-FN-FLOW-12`; distinction fixture `V16-FN-FLOW-11` | 097 runtime; 098 checker | Exact call result and proof later statements/iterations do not execute; all explicit returns and unreachable statements are checked; braced-if expression return is not a statement-level function exit. |
| `V16-FN-05` | Preserve expression-loop return collection. | `V16-FN-FLOW-09`; approved placement decision D-095-15 | 097 runtime; 098 checker | Expression-loop returns continue to collect one value per iteration; expression-form loops remain prohibited inside functions. |
| `V16-FN-06` | Require compatible returns on all reachable paths. | `V16-FN-FLOW-01` through `V16-FN-FLOW-06`; `V16-FN-FLOW-08`; `V16-FN-FLOW-10`; aliases `V16-FN-TYPE-01/02` | 098 type checker | Positive/negative path matrix. Missing-return identity is allocated as `AMXF4001`; `AMX3021` remains reserved for if expressions. |
| `V16-FN-07` | Loops that may execute zero times do not guarantee a function result. | `V16-FN-FLOW-05`, `V16-FN-FLOW-06` | 098 type checker; 097 runtime | Empty/nonempty list cases and fallthrough analysis. |
| `V16-FN-08` | Keep parameters/locals in isolated lexical call scope. | `V16-FN-SCOPE-01` through `V16-FN-SCOPE-06`; `V16-FN-TYPE-03`, `V16-FN-TYPE-04` | 096 parser; 097 runtime; 098 checker; 099 editor facts | Caller unchanged; block locals stay local; assignment updates visible local; loop iterator restores; same-scope `let` updates and nested shadowing follow D-095-14. |
| `V16-FN-09` | Deep-copy list parameters independently, including repeated/nested inputs. | `V16-FN-LIST-01`, `V16-FN-LIST-02` | 097 runtime | Caller, sibling parameter, and nested value assertions. |
| `V16-FN-10` | Permit local list mutation and return the resulting list. | `V16-FN-LIST-03`; approved value boundary `V16-FN-LIST-04` | 097 runtime; 098 checker | Exact returned sequence and caller-isolation assertions. Arrays are copied recursively; non-list aggregate values are opaque and are not cloned. |
| `V16-FN-11` | Preserve visibility, declaration order, and no recursion/forward refs/closures. | `V16-FN-COMPAT-01` through `V16-FN-COMPAT-05` | 096 parser; 098 checker; modules in 101 | Earlier function accepted; exported braced function remains importable; forward reference and recursion rejected as `AMX3004`; document capture rejected at the unknown identifier. |
| `V16-FN-12` | Diagnostics are stable and source-grounded. | `V16-FN-PARSE-01`, `V16-FN-PARSE-02`, `V16-FN-PARSE-03a` through `03l`; `V16-FN-TYPE-01/02` aliases; `V16-FN-TYPE-03`, `V16-FN-TYPE-04`, `V16-FN-TYPE-05`; `V16-FN-FLOW-12`; `V16-FN-COMPAT-02`, `V16-FN-COMPAT-03`, `V16-FN-COMPAT-04`; `V16-FN-RUNTIME-01` harness case | 096/098 parser/checker; 097 runtime guard | Exact approved code/message/phase/point locations are in `diagnostic-matrix.md`; current LF/CRLF and UTF-16 conventions were tested. Feature-path location behavior is **NOT RUN**. Only defensive runtime-fallthrough identity remains **UNALLOCATED**. |
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

## Builder Cross-Check (2026-10-23)

- Fixture IDs are stable and unique except intentional aliases
  `V16-FN-TYPE-01` -> `V16-FN-FLOW-02` and
  `V16-FN-TYPE-02` -> `V16-FN-FLOW-08`; aliases are not separate tests.
- `V16-FN-PARSE-03a` through `03l` are complete independent negative source
  envelopes; each uses the approved parse-phase AMX3006 template.
- Every confirmed master-plan requirement `V16-FN-01` through `V16-FN-14`
  maps to at least one fixture or an explicit later-surface evidence method.
- Product-approved choices D-095-01 through D-095-12 and D-095-14/15 are
  recorded in `function-body-contract.md`. The only remaining residual is
  D-095-13, whose diagnostic allocation blocks Sprint 097.
- Expression-loop return collection is mapped only to
  `V16-FN-FLOW-09`; it is not subsumed by function-return fixtures.
- Approved diagnostic messages and source anchors are recorded in
  `diagnostic-matrix.md`; feature-path behavior and source mapping remain
  **NOT RUN** because this syntax is intentionally unimplemented.