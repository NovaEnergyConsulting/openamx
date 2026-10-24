# Sprint 097 Builder Evidence: Function Runtime and List Value Semantics

## Status

**BLOCKED / NOT STARTED.** Architect-prepared evidence template. Sprint 096 is
accepted, but the accepted Sprint 095 residual D-095-13 remains unallocated
and blocks Sprint 097 implementation.

- Sprint 096 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24.
- D-095-13 exact diagnostic allocation: PENDING; do not reuse `AMX1007`.
- Sprint 097 execution authorization: PENDING.
- Approved Sprint 097 source/test/evidence file plan: PENDING.
- Starting branch/worktree and preservation boundary: NOT RECORDED.
- Sprint 097 disposition: PENDING.
- Runtime implementation/tests: NOT STARTED / BLOCKED.
- Return-path/type checking (`AMXF4001`), formatting, editor, docs/examples,
  release, and publication: NOT RUN / OUT OF SCOPE for Sprint 097.

## Diagnostic Allocation Record

Do not fill from inference or current runtime behavior. Complete only after a
separate Lead Developer/product-owner decision.

| Field | Approved value |
| --- | --- |
| D-095-13 disposition date/approver | PENDING |
| Diagnostic code | PENDING |
| Exact message | PENDING |
| Diagnostic category/phase | PENDING |
| Primary source anchor | Function body's accepted closing brace; confirm exact runtime diagnostic representation. |
| Confirmation that `AMX1007` is not reused | PENDING |

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | D-095-13 allocation and entry authorization | PENDING | BLOCKED / NOT RUN | PENDING | Lead Developer/product owner |
| E-02 | Isolated call-frame execution | PENDING | NOT RUN | PENDING | Sprint 097 Builder |
| E-03 | Direct/nested/loop return propagation | PENDING | NOT RUN | PENDING | Sprint 097 Builder |
| E-04 | Expression-body and expression-return regressions | PENDING | NOT RUN | PENDING | Sprint 097 Builder |
| E-05 | Lexical scope/shadow/iterator cleanup | PENDING | NOT RUN | PENDING | Sprint 097 Builder |
| E-06 | Recursive and repeated list argument copies | PENDING | NOT RUN | PENDING | Sprint 097 Builder |
| E-07 | Local list mutation and returned list values | PENDING | NOT RUN | PENDING | Sprint 097 Builder |
| E-08 | Defensive runtime fallthrough diagnostic | PENDING | BLOCKED | PENDING | Lead Developer/product owner, then Sprint 097 |
| E-09 | Focused runtime tests and TypeScript check | PENDING | NOT RUN | PENDING | Sprint 097 Builder |
| E-10 | Static return checking, editor, docs/examples, release | Out of Sprint 097 scope. | NOT RUN by design | Sprint 097 acceptance | Sprints 098-101 |

## Changed-Path Ledger

No edits are authorized while the D-095-13 blocker is open. After the gate,
record the approved paths and any separately approved expansion.

| Path | Approved purpose | Change/evidence |
| --- | --- | --- |
| PENDING | PENDING | PENDING |

## Residuals and Recommendation

| ID | Residual | Status | Owner | Downstream impact |
| --- | --- | --- | --- | --- |
| D-095-13 | Defensive runtime-fallthrough diagnostic code/message/category/source anchor unallocated. | OPEN / BLOCKING | Lead Developer/product owner | Sprint 097 cannot start. |
| R-097-01 | Nullable-list parameter copy interpretation should be confirmed if not explicit in the accepted contract. | PENDING REVIEW | Product owner | Gate any nullable-list-specific implementation/test. |

Builder recommendation: **PENDING / BLOCKED.** Do not recommend acceptance
until the diagnostic allocation, authorized implementation, required runtime
evidence, and separate disposition are complete.