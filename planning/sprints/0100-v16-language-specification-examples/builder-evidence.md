# Sprint 100 Builder Evidence: Language Specification and Examples

## Status

**NOT STARTED.** Architect-prepared evidence template. Sprints 095-099 are
accepted, but Sprint 100 execution authorization and its exact file/evidence
plan are not recorded here.

- Sprint 095 contract: `ACCEPTED/CLOSED`, 2026-10-23.
- Sprint 096: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, 2026-10-24.
- Sprint 097: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, 2026-10-24;
  D-095-13 resolved as runtime `AMXF4002`.
- Sprint 098: `ACCEPTED/CLOSED`, 2026-10-24; static missing return is
  `AMXF4001` at function closing brace.
- Sprint 099: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, 2026-10-24.
- Sprint 100 execution authorization: PENDING.
- Approved Sprint 100 file/evidence plan: PENDING.
- Starting branch/worktree and preservation boundary: NOT RECORDED.
- Sprint 100 disposition: PENDING.
- Release, publication, version changes, and integrated V0.16 closeout: NOT
  RUN / NOT AUTHORIZED.

## Evidence Log

| ID | Acceptance area | Exact action/artifact | Result | Evidence location | Residual/owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Execution authorization and file plan | PENDING | NOT RUN | PENDING | Lead Developer/product owner |
| E-02 | V0.16 specification contract coverage | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-03 | Valid reference and expression-body compatibility | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-04 | Nested/loop return, scope, and list-copy values | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-05 | Negative missing-return diagnostic fixture | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-06 | Index/README/Help/extension discoverability | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-07 | Desktop offline guide allowlist/parity/materialization | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-08 | Focused root and desktop tests | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-09 | Preservation/output boundary and whitespace | PENDING | NOT RUN | PENDING | Sprint 100 Builder |
| E-10 | Integrated V0.16 closeout/release/publication | Out of Sprint 100 scope. | NOT RUN by design | Sprint 100 acceptance | Sprint 101 / separate release authorization |

## Changed-Path Ledger

Record only the paths in the separately approved Sprint 100 plan. The
proposed list below is a planning checklist, not authorization.

| Path | Purpose | Change/evidence |
| --- | --- | --- |
| `docs/language-spec-v0.16.md` | Additive user-facing contract. | PENDING |
| `examples/15_Function_Bodies.amx` | Proposed standalone authoring reference. | PENDING |
| `examples/fixtures/invalid/missing-function-return.amx` | Negative-only example fixture. | PENDING |
| `examples/00_Table_of_Contents.amx`, `examples/03_Collections_and_Functions.amx` | Index/reference discoverability; preserve existing outcomes. | PENDING |
| `README.md`, `vscode-extension/README.md` | Language/example discovery. | PENDING |
| `desktop-app/src/mainview/components/help-content.json` | Searchable V0.16 Help topic. | PENDING |
| `tests/examples.test.ts`, `tests/numbered-guide.test.ts`, desktop guide resource/Help tests | Spec/example/link/allowlist evidence. | PENDING |
| `desktop-app/src/bun/guideResources.ts` | Explicit offline resource allowlist, if approved. | PENDING |

## Decisions and Residuals

| ID | Item | Status | Owner | Impact |
| --- | --- | --- | --- | --- |
| R-100-01 | Sprint 100 authorization and exact file plan | PENDING | Lead Developer/product owner | No edits beyond this planning package before approval. |
| R-100-02 | Confirm `15_Function_Bodies.amx` standalone-reference role | PROPOSED | Lead Developer/product owner | Must be confirmed in the approved path/content plan; do not renumber 00-14. |
| R-100-03 | Desktop guide allowlist expansion for the new reference and negative fixture | PROPOSED | Lead Developer/product owner | Requires parity/materialization tests; do not edit packaging resources without approval. |

Builder recommendation: **PENDING.** Record exact test outputs, unsupported
platform routes, and separate Sprint 100 disposition before marking this
sprint complete.