# Sprint 095 Builder Evidence: Function Body Contract Gate

## Status

**ACCEPTED/CLOSED WITH RECORDED RESIDUAL** (2026-10-23). The product owner
separately authorized Sprint 095 planning-only work, approved the five-file
plan, resolved the contract decisions, allocated `AMXF4001`, and selected
`ACCEPTED/CLOSED`. No V0.16 syntax implementation or runtime acceptance is
claimed.

- Starting branch/worktree: `feat/create-v0.16`; clean before review.
- Approved edit boundary: this Sprint 095 planning folder only.
- Files edited: `function-body-contract.md`, `control-flow-fixtures.md`,
  `diagnostic-matrix.md`, `requirement-test-matrix.md`, and this file.
- Contract decision status: **ACCEPTED/CLOSED**; D-095-01 through D-095-12
  and D-095-14/15 were approved on 2026-10-23.
- Diagnostic allocation status: `AMXF4001` allocated; defensive runtime
  fallthrough diagnostic remains unallocated as D-095-13.
- Sprint 096 implementation: **NOT AUTHORIZED by this handoff**. Contract
  disposition does not grant downstream sprint execution authorization.
- Sprint 097: **BLOCKED** until D-095-13 is allocated.
- Production implementation/tests, user-facing specs/examples, release,
  publication, and package/version changes: **NOT RUN / NOT AUTHORIZED**.

## Evidence Log

| ID | Contract area | Exact action/artifact | Result | Evidence location | Decision/residual owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Syntax and expression-body compatibility | Read V0.2/V0.3 function grammar and compatibility clauses; inspected `FunctionDeclarationNode`, current parser declaration path, and existing expression-function parser test. Ran `bun test tests/parser.test.ts tests/listSemantics.test.ts tests/evaluator.test.ts --test-name-pattern 'parses a source-located function declaration with typed parameters and an expression body|parses only named-list statement targets and forbids mutations in expression loops|keeps conditional returns local inside expression loops'`. | **PASS**: 3 focused tests, 144 filtered, 0 failed. Existing function AST/parser currently stores/parses an expression body only; braced-body rejection is expected and not a contract failure. | Master plan; V0.2/V0.3 specs; `src/ast/types.ts`; `src/parser/parseStatements.ts`; test output in session. | Sprint 096; compatibility preserved. |
| E-02 | Legal body statements and prohibited declarations/actions | Read existing statement parser dispatch and V0.2/V0.3/V0.4 placement rules; inventoried master-plan scope; added complete source envelopes `V16-FN-PARSE-03a` through `03l`. | **APPROVED:** prohibited body statements fail parse with the exact AMX3006 template; nested loops remain prohibited. Feature parser behavior is **NOT RUN**. | `function-body-contract.md`; `control-flow-fixtures.md`; `diagnostic-matrix.md`; `src/parser/parseStatements.ts`; V0.2/V0.3/V0.4 specs. | Product owner approved 2026-10-23; Sprint 096 verifies implementation. |
| E-03 | Return propagation and expression-loop distinction | Ran focused parser/evaluator probes for expression-loop collection and `evaluates IF-V01 through IF-V06 with local expression returns and scoped branches`; reviewed V0.2/V0.3 semantics. | **APPROVED CONTRACT; implementation NOT RUN.** Existing loop collection and braced-if expression semantics passed focused checks. Expression loops remain prohibited inside functions. | Test outputs in session; `docs/language-spec-v0.2.md`; `docs/language-spec-v0.3.md`; fixtures FLOW-01/04/06/07/09/11. | Product owner approved D-095-15; downstream tests in 096-098. |
| E-04 | All-path analysis and zero-iteration loops | Compared approved sequence/if/loop model with master plan and existing V0.12 checker. | **APPROVED CONTRACT; V0.16 checker NOT RUN.** All statements, including unreachable ones, are checked; explicit returns are checked; all-path fallthrough uses `AMXF4001`. | `function-body-contract.md`; FLOW-01 through FLOW-08 and FLOW-10/12; `src/typechecker/checkDocument.ts`; V0.12 spec. | Product owner approved D-095-04/10/12; implementation verification in 098. |
| E-05 | Lexical scope and parameter isolation | Read V0.3 no-capture/source-order contract, V0.12 branch scope, `Environment.createCallFrame`, evaluator branch cleanup, and type-check branch/loop scoping. | **APPROVED CONTRACT; V0.16 runtime/checker NOT RUN.** Same-scope `let` updates; nested blocks may shadow; block bindings do not escape. | `function-body-contract.md`; SCOPE-01 through SCOPE-06; `src/runtime/environment.ts`; `src/runtime/evaluateExpression.ts`; `src/typechecker/checkDocument.ts`. | Product owner approved D-095-03/14; implementation verification in 096-098. |
| E-06 | Recursive/repeated list argument copying and list results | Read function call argument binding and current list/record runtime representation. | **APPROVED CONTRACT; implementation NOT RUN.** Each list parameter gets an independent recursive array copy; non-list elements are opaque; returned local list is direct result. Current call binding passes objects by reference and does not implement this contract. | Master plan; `src/runtime/evaluateExpression.ts`; `src/runtime/environment.ts`; LIST-01 through LIST-04. | Product owner approved D-095-06/07/11; implementation verification in 097. |
| E-07 | Diagnostic identities/messages/source ranges | Read diagnostics, type-check helpers and source-range mapping; ran editor UTF-16/CRLF tests (2 pass), parser AMX3006/LF-CRLF tests (2 pass), type-check AMX3001/3002 tests (2 pass); repository search found no prior `AMXF4001`. | **APPROVED PLANNING IDENTITIES; feature-path behavior NOT RUN.** `AMXF4001` is allocated for missing returns. The only unallocated identity is the defensive runtime-fallthrough residual; `AMX3021`/`AMX1007` are not reused. | `diagnostic-matrix.md`; focused tests in `tests/isTypeChecking.test.ts`, `tests/editor.test.ts`, `tests/parser.test.ts`; repository search output. | Product owner approved D-095-05/08/12; diagnostic owner for D-095-13, blocks 097. |
| E-08 | Fixture/matrix consistency and requirement coverage | Ran the final Node read-only audit over fixture, requirement, and diagnostic matrices; expanded requirement ranges and checked aliases, subcases, source anchors, duplicates, and cross-references. | **PASS:** 37 unique primary fixture headings; 45 AMX source blocks; 12/12 prohibited subcases; 14/14 unique requirement rows; 13 unique diagnostic rows; 23/23 source anchors match; no duplicate IDs, missing requirements, unmapped non-alias headings, or stale references. `V16-FN-COMPAT-05` contains separate library and entry module envelopes. FLOW-02/08 remain TYPE-01/02 aliases; LIST-04 is a non-executable boundary; RUNTIME-01 is a harness case. | `control-flow-fixtures.md`; `diagnostic-matrix.md`; `requirement-test-matrix.md`; final command output in session. | Sprint 095 Builder; only D-095-13 remains a Sprint 097 residual. |
| E-09 | Approved planning-file boundary and artifact integrity | Verified clean starting branch/worktree with `git status --short --branch`; obtained separate user authorization and exact file-plan approval; ran final `git diff --check -- <five approved planning paths>` and final `git status --short --branch`. | **PASS:** exactly the five approved Sprint 095 planning files are modified; combined diff check is clean. No product source, tests, specs, examples, manifests, release files, state/decision records, or historical sprint records changed. | Final command output in session; current Sprint 095 planning folder. | Sprint 095 Builder. |
| E-10 | Production implementation/runtime verification | Not part of Sprint 095. | **NOT RUN BY DESIGN / NOT AUTHORIZED.** Proposed fixtures are not evidence of working V0.16 behavior. | Sprint 095 acceptance and approved file plan. | Sprints 096-101. |

## Decisions and Residuals

Record each decision with ID, exact approved wording, evidence, approver/date,
affected fixture IDs, and downstream owner. Record each unresolved item with
the decision owner and explicit Sprint 096 impact. Builder recommendation is
not a product disposition.

| ID | Decision/residual | Status | Owner | Downstream impact |
| --- | --- | --- | --- | --- |
| D-095-01 | Newline/semicolon and block statement separation. | APPROVED: newlines separate statements; semicolons are invalid. | Product owner; 2026-10-23 | Recorded in accepted contract. |
| D-095-02 / D-095-09 | Nested statement loops. | APPROVED: preserve the existing prohibition. | Product owner; 2026-10-23 | No parser expansion for nested loops in 096. |
| D-095-03 / D-095-14 | Lexical shadowing and repeated `let`. | APPROVED: same-scope `let` updates; nested lexical scopes may shadow visible names. | Product owner; 2026-10-23 | Implement/test in 096/098. |
| D-095-04 / D-095-10 | Static checking of unreachable statements. | APPROVED: type-check every statement and every explicit return; do not emit an unreachable warning. | Product owner; 2026-10-23 | Implement/test in 098. |
| D-095-05 | Exact missing-return source anchor. | APPROVED: closing function brace. | Product owner; 2026-10-23 | Implement/test with AMXF4001 in 098. |
| D-095-06 / D-095-11 | Deep copy of record/aggregate list elements. | APPROVED: recursively copy arrays only; non-list elements are opaque and not cloned. | Product owner; 2026-10-23 | Implement/test in 097. |
| D-095-07 | Returned-list transfer/copy. | APPROVED: return the local list directly, without another copy. | Product owner; 2026-10-23 | Implement/test in 097. |
| D-095-08 | Prohibited function-body statements and diagnostic mapping. | APPROVED: parse rejection with AMX3006 template `The '{keyword}' statement is not allowed in a function body.` | Product owner; 2026-10-23 | Implement/test in 096. |
| D-095-12 | Missing-function-return diagnostic allocation. | APPROVED: `AMXF4001: Missing return value from function`, at closing brace. | Product owner; 2026-10-23 | Register and implement in 098. |
| D-095-13 | Defensive runtime-fallthrough diagnostic allocation. | RESIDUAL: remains unallocated by explicit product-owner choice; do not reuse AMX1007. | Diagnostic owner (Lead Developer/product owner) | Sprint 097 blocked until exact identity/message is allocated. |
| D-095-15 | Expression-form loop placement inside braced function bodies. | APPROVED: remain prohibited inside functions; preserve per-iteration collection semantics elsewhere. | Product owner; 2026-10-23 | Preserve/test across 096-098. |

## Builder Recommendation

**ACCEPTED/CLOSED WITH RECORDED RESIDUAL** by the product owner on
2026-10-23. All contract decisions are resolved and `AMXF4001` is allocated.
D-095-13 remains an explicit Sprint 097 blocker because its runtime diagnostic
identity/message was left unallocated. Existing behavior probes establish
compatibility facts only; V0.16 implementation and exact feature-path
locations are **NOT RUN**. This disposition does not authorize Sprint 096 or
any implementation work.