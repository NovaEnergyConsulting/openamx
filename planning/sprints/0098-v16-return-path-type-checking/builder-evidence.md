# Sprint 098 Builder Evidence: Return-Path and Type Checking

## Status

**NOT STARTED.** Architect-prepared evidence template. Sprint 096 and Sprint
097 are accepted, but Sprint 098 execution authorization and the concrete
checker/test/evidence file plan are not recorded here.

- Sprint 096 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24.
- Sprint 097 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`,
  2026-10-24.
- D-095-13 runtime-fallthrough allocation: RESOLVED in Sprint 097 as
  `AMXF4002: Function finished without returning a valid expression`;
  do not reuse `AMX1007`.
- Static missing-return diagnostic: accepted allocation
  `AMXF4001: Missing return value from function`; registration/checking
  implementation is Sprint 098 work.
- Sprint 098 execution authorization: PENDING.
- Approved Sprint 098 source/test/evidence file plan: PENDING.
- Starting branch/worktree and preservation boundary: NOT RECORDED.
- Sprint 098 disposition: PENDING.
- Runtime/parser implementation, formatter/editor/docs/examples, release,
  and publication: NOT RUN / OUT OF SCOPE for this sprint.

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Entry authorization and approved file plan | PENDING | NOT RUN | PENDING | Lead Developer/product owner |
| E-02 | Expression-body compatibility | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-03 | Explicit return type validation | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-04 | Sequence/if/else all-path analysis | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-05 | Zero-iteration loop and later-return analysis | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-06 | Unreachable statement/return checking | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-07 | Lexical scope and module compatibility | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-08 | AMXF4001 exact diagnostic/source locations | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-09 | AMXF4002 runtime and AMX3021 expression regressions | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-10 | Focused tests and TypeScript check | PENDING | NOT RUN | PENDING | Sprint 098 Builder |
| E-11 | Formatter/editor/docs/release integration | Out of Sprint 098 scope. | NOT RUN by design | Sprint 098 acceptance | Sprints 099-101 |

## Changed-Path Ledger

Record the approved paths, any separately approved expansion, and the reason
for each edit. Preserve accepted Sprint 095-097 evidence.

| Path | Approved purpose | Change/evidence |
| --- | --- | --- |
| PENDING | PENDING | PENDING |

## Decisions and Residuals

Do not reopen accepted decisions or silently change diagnostic identities.
If implementation discovers an ambiguity, stop at the affected contract
boundary and request explicit disposition before changing expected behavior.

| ID | Residual | Status | Owner | Impact |
| --- | --- | --- | --- | --- |
| R-098-01 | Sprint 098 execution authorization/file plan | PENDING | Lead Developer/product owner | No implementation before approval. |

Builder recommendation: **PENDING.** Complete after focused evidence and a
separate Lead Developer/product-owner Sprint 098 disposition.