# Sprint 125 Builder Evidence: Desktop TypeScript Export and Documentation

## Status

Architect-prepared evidence scaffold. S125 implementation and verification
have not been authorized or performed by preparing these documents.

**Builder recommendation:** PENDING.

**Separate Product Owner disposition:** PENDING.

## Entry and Baseline

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S121 disposition/residual | Verify accepted closeout and D121-18 best-effort/non-crash-atomic behavior. | NOT RUN |
| S122 disposition/residuals | Verify accepted closeout; preserve D122-15 no-parity and retry residual. | NOT RUN |
| S123 disposition/residuals | Verify accepted closeout; preserve retry process FAIL and all incomplete G123 rows. | NOT RUN |
| S124 disposition/residuals | Verify accepted closeout; preserve retry process FAIL, cancellation/crash NOT RUN, D121-18. | NOT RUN |
| Baseline/worktree | Branch, commit, dirty state, tool versions, package/lock, generated outputs and desktop artifacts. | NOT RUN |
| S125 authorization | Exact paths, commands, UI harness/native route, staging/output roots, limits, retries, preservation/cleanup. | NOT RUN |

## Command and Host Ledger

| Run ID | Required gate | Exact command/action, CWD and version | Result/artifact/hash | Raw status |
| --- | --- | --- | --- | --- |
| S125-ROOT-FOCUSED | Graph/example/helper selection | PENDING | PENDING | NOT RUN |
| S125-DESKTOP-TYPE | Desktop typecheck | PENDING | PENDING | NOT RUN |
| S125-RPC | Shared RPC contract tests | PENDING | PENDING | NOT RUN |
| S125-UI-HARNESS | TypeScript export Playwright/Vite flow | PENDING | PENDING | NOT RUN |
| S125-NATIVE | Native WebView export flow, if route is available and authorized | PENDING | PENDING | BLOCKED/UNAVAILABLE |
| S125-EXAMPLE-AMX | Parse/check/format/run Example 16 | PENDING | PENDING | NOT RUN |
| S125-EXAMPLE-TRANSPILE | CLI transpile full graph | PENDING | PENDING | NOT RUN |
| S125-EXAMPLE-COMPILE | Strict generated graph compile | PENDING | PENDING | NOT RUN |
| S125-EXAMPLE-RUN | Generated `run(inputs)` and AMX comparison | PENDING | PENDING | NOT RUN |
| S125-OUTPUT-SAFETY | Overwrite/cancel/stale/failure/rollback matrix | PENDING | PENDING | NOT RUN |
| S125-PRESERVE | `dist`, renderer, outputs and prior artifacts hash audit | PENDING | PENDING | NOT RUN |
| S125-DIFF-CHECK | `git diff --check` | PENDING | PENDING | NOT RUN |

## Requirement and Residual Reconciliation

| Evidence ID | Required reconciliation | Result / missing IDs | Raw status |
| --- | --- | --- | --- |
| E125-ENTRY-01 | S121-S124 dispositions and all entering residuals reconciled. | PENDING | NOT RUN |
| E125-RPC-01 | Operation/destination/result schemas and worker bounds tested. | PENDING | NOT RUN |
| E125-ID-01 | Active/dependency revisions, project generation, stale and cancel paths tested. | PENDING | NOT RUN |
| E125-WRITE-01 | Directory graph preflight, overwrite confirmation, writer rollback report and unrelated-file preservation. | PENDING | NOT RUN |
| E125-DOC-01 | V0.20 spec and README navigation match accepted API and graph/desktop behavior. | PENDING | NOT RUN |
| E125-EXAMPLE-01 | Example source, import graph, generated compile/run and view parity. | PENDING | NOT RUN |
| E125-G123-01 | Incomplete S123 rows remain raw and are not upgraded by desktop/example tests. | PENDING | NOT RUN |
| E125-SCOPE-01 | Changed paths exclude S126/release/package/platform work. | PENDING | NOT RUN |

## Carried Residuals

| Residual | Entering raw status | S125 treatment |
| --- | --- | --- |
| S123-RETRY-STOP-01 | FAIL; owner accepted as process residual. | Preserve raw FAIL/disposition. |
| S123 incomplete E123/G123 rows | BLOCKED/UNAVAILABLE or NOT RUN. | Preserve each row; desktop/example success is not full emitter coverage. |
| S124-RETRY-STOP-01 | FAIL; owner accepted as process residual. | Preserve raw FAIL/disposition. |
| G124-PUBLISH-CANCEL-01 | NOT RUN for noninteractive CLI. | S125 desktop cancellation is separate evidence; do not relabel S124 row. |
| G124-PUBLISH-CRASH-BOUNDARY-01 / D121-18 | NOT RUN / accepted non-crash-atomic residual. | Preserve; report best-effort writer outcome only. |
| D122-15 | Accepted enum-default no-parity residual. | No AMX semantic changes or unsupported parity claims. |

## Failures and Disposition

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| PENDING | NOT RUN | PENDING | PENDING | PENDING |

- **Builder recommendation:** PENDING; cite desktop/RPC/UI/native, output
  safety, docs/example, and carried S123/S124 rows.
- **Product Owner disposition:** PENDING; record separately with date/scope.
- **S126 readiness:** PENDING on S125 accepted scope and separate S126
  integrated acceptance authorization.
- **Release/package/platform authority:** NONE.