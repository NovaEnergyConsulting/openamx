# Sprint 116 Builder Evidence: V0.19 Chart AST, Parsing, Checking, and Evaluation

## Status

**Architect preparation only.** Sprint 116 implementation has not been
separately authorized or performed. This template must be completed during the
approved execution; planning status below is not product evidence.

**Builder recommendation:** NOT READY FOR IMPLEMENTATION UNTIL SEPARATELY
AUTHORIZED. Sprint 115 is accepted, but its disposition does not execute S116.

**Separate product-owner disposition:** PENDING; no S116 implementation or S119
entry authority follows this preparation.

## Entry and Baseline

| Evidence item | Status | Record required during execution |
| --- | --- | --- |
| Sprint 115 contract gate | VERIFIED | ACCEPTED/CLOSED on 2026-11-21; D115-01/02/03/09 authoritative |
| Sprint 116 execution authorization | NOT RUN | Approver, date, exact file/command/evidence/output plan |
| Repository baseline | NOT RECORDED | Branch, commit, clean/dirty inventory, worktree preservation |
| Existing generated/shared artifacts | NOT RECORDED | Hash/status of files the plan must preserve |
| Host/tool versions | NOT RECORDED | OS, architecture, Bun/Node/PowerShell/Git as relevant |
| Approved changed paths | NOT RECORDED | Final list reconciled with execution plan and amendments |

## Proposed Focused Verification

| Check | Candidate command | Status |
| --- | --- | --- |
| Parser/checker/evaluator/formatter/model suite | `bun test tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/chartModel.test.ts` | NOT RUN; exact approved selection required |
| Root no-emit typecheck | `bunx tsc --noEmit` | NOT RUN |
| Patch integrity | `git diff --check` | NOT RUN for implementation |
| Changed-path scope audit | `git status --short` / approved diff inventory | NOT RUN |

Commands are candidates from planning, not authorization. Record exact output,
pass/fail counts, assertions, retries, duration/resource notes where relevant,
and unavailable checks separately.

## Requirement Evidence Ledger

| Requirement | Case IDs | Status | Exact evidence/command |
| --- | --- | --- | --- |
| AST and source locations | CHT-AST-01, CHT-ORDER-01, CHT-SOURCE-01 | NOT RUN | Record focused parser result and ranges |
| Parser all kinds/malformed | CHT-KIND-01, CHT-PARSE-01/02/03, CHT-TABLE-01 | NOT RUN | Record complete fixture outcomes |
| Boolean/duplicates/names | CHT-TYPE-01, CHT-DUP-01, CHT-NAME-01, CHT-CALL-01 | NOT RUN | Record codes/messages/locations |
| Omitted/false/true/dynamic | CHT-OMIT-01, CHT-FALSE-01, CHT-TRUE-01, CHT-EXPR-01, CHT-ENV-01 | NOT RUN | Record emission values per show |
| Formatter round trip | FMT-S116-01/02/03/04, CHT-FORMAT-01 | NOT RUN | Record parse-format-parse and newline evidence |
| Emission shared model | MOD-S116-01/02/03/04/05, CHT-DEFAULT-REG-01 | NOT RUN | Record equality/immutability/internal-table boundary |
| Renderer omission | CHT-HTML-01, CHT-PDF-01, CHT-DOCX-01, CHT-OUTPUT-OMISSION-01 | OUT OF SCOPE / NOT RUN | S119 owns; do not upgrade |
| Migration/spec/editor/SI/affine | CHT-DEFAULT-MIGRATION-01 and S117-S119 rows | OUT OF SCOPE / NOT RUN | No cross-sprint execution claimed |

## Diagnostics and Source Ranges

During execution, complete every implemented negative case:

| Case | Expected | Actual code/message/source | Status |
| --- | --- | --- | --- |
| CHT-TYPE-01 | AMX3002 at expression | NOT RECORDED | NOT RUN |
| CHT-DUP-01 | AMX3005 at second option | NOT RECORDED | NOT RUN |
| CHT-PARSE-01/02/03 | AMX3006 existing parse family | NOT RECORDED | NOT RUN |
| CHT-TABLE-01 | AMX3003 at option | NOT RECORDED | NOT RUN |
| CHT-NAME-01 | AMX3001 at identifier | NOT RECORDED | NOT RUN |
| S116-RUNTIME-TYPE-01 | AMX3002 defensive mismatch only if exercised by harness | NOT RECORDED | NOT RUN / optional harness |

No new stable diagnostic identity may be guessed. Any discovered need for one is
a blocking allocator decision and exact scope amendment record.

## Scope and Boundary Audit

Record the following at closeout:

- Production files changed: NOT RECORDED.
- Test files changed: NOT RECORDED.
- Renderer HTML/PDF/DOCX/browser JSON/accessibility output: MUST REMAIN UNCHANGED.
- Editor, spec/example/migration, SI library, affine metadata/runtime, package,
  release, publication, deployment, certification: MUST REMAIN UNCHANGED.
- Existing internal table/accessibility model for false visibility: MUST REMAIN
  CONSTRUCTED in S116 under the accepted staging boundary.
- Any added out-of-plan path: record exact approval and reason; otherwise this
  is a scope failure.

## Reconciliation and Limitations

During execution, report:

- every CHT ID assigned to S116 and its exact evidence location;
- missing, duplicate, renamed, or intentionally out-of-scope IDs;
- all requested test commands, raw pass/fail counts, failed retries, skipped or
  unavailable checks;
- source-coordinate checks for LF/CRLF and UTF-16 columns;
- any compiler/type errors or integration hazards found in AST union consumers;
- residuals with owner and downstream sprint impact;
- confirmation that a false model Boolean did not trigger output omission work.

## Final Recommendation and Disposition

At authorized execution completion, replace this section with:

- Builder recommendation: ACCEPT/CLOSED, ACCEPT WITH RECORDED RESIDUALS, or
  BLOCKED/OPEN;
- exact focused test/type/format outcomes and scope audit;
- unresolved residuals and their owners;
- separate product-owner disposition, date, and Sprint 119 gate;
- explicit statement that no renderer, release, publication, package/version,
  deployment, or certification work is authorized by the disposition.
