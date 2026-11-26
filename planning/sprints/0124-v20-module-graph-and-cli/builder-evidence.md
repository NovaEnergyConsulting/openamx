# Sprint 124 Builder Evidence: Module Graph and CLI

## Status

Architect-prepared evidence scaffold. S124 implementation and execution have
not been authorized or performed by preparing these documents.

**Builder recommendation:** PENDING.

**Separate Product Owner disposition:** PENDING.

## Entry and Baseline

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S121 disposition/residual | Verify accepted/closed with residuals; preserve D121-18 best-effort/non-crash-atomic rollback. | NOT RUN |
| S122 disposition/residuals | Verify accepted/closed with residuals; preserve D122-15 no enum-default parity and retry residual. | NOT RUN |
| S123 disposition/residuals | Verify accepted/closed with residuals; preserve S123 retry-stop raw FAIL and incomplete G123 statuses. | NOT RUN |
| Baseline/worktree | Branch, commit, dirty state, host/tool versions, package/lock, existing outputs/manifests. | NOT RUN |
| S124 authorization | Exact files, commands, roots, overwrite/failure injection, retry, preservation and cleanup. | NOT RUN |

## Graph and CLI Command Ledger

Record exact command/action, CWD, tool versions, exit status/counts, artifacts,
hashes, first failure and retry ID.

| Run ID | Required gate | Command/action and outcome | Artifact/hash | Raw status |
| --- | --- | --- | --- | --- |
| S124-GRAPH-FOCUSED | Resolver/module tests | PENDING | PENDING | NOT RUN |
| S124-CLI-SUCCESS | Nested graph transpile | PENDING | PENDING | NOT RUN |
| S124-CLI-INVALID | Parse/type/import/cycle/containment failures | PENDING | PENDING | NOT RUN |
| S124-CLI-DESTINATION | Collision/default refusal/overwrite/cancel | PENDING | PENDING | NOT RUN |
| S124-PUBLISH-FAILURE | Stage/publish/rollback injected failure | PENDING | PENDING | NOT RUN |
| S124-GENERATED-COMPILE | Strict compile of successful generated graph | PENDING | PENDING | NOT RUN |
| S124-TYPECHECK | Root no-emit typecheck | PENDING | PENDING | NOT RUN |
| S124-BUILD | Isolated root build | PENDING | PENDING | NOT RUN |
| S124-PRESERVE | `dist`, renderer, outputs and prior artifacts hash audit | PENDING | PENDING | NOT RUN |
| S124-DIFF-CHECK | `git diff --check` | PENDING | PENDING | NOT RUN |

## Requirement and Residual Reconciliation

| Evidence ID | Required reconciliation | Result / missing IDs | Raw status |
| --- | --- | --- | --- |
| E124-ENTRY-01 | S121/S122/S123 dispositions and residuals preserved. | PENDING | NOT RUN |
| E124-GRAPH-01 | Filesystem source graph matches exact S123 in-memory graph input. | PENDING | NOT RUN |
| E124-PATH-01 | Output paths/import specifiers deterministic and collision-free. | PENDING | NOT RUN |
| E124-CLI-01 | Help, argument validation, success/failure status and diagnostics. | PENDING | NOT RUN |
| E124-SAFE-01 | No-write preflight failures, overwrite isolation and best-effort rollback per-path results. | PENDING | NOT RUN |
| E124-COMPILE-01 | Generated nested graph compiles with public S122 helper package. | PENDING | NOT RUN |
| E124-S123-RESIDUAL-01 | Every incomplete G123 row and S123 process FAIL remains separately classified. | PENDING | NOT RUN |
| E124-SCOPE-01 | Changed paths exclude S125/S126/release/package/platform work. | PENDING | NOT RUN |

## Incomplete S123 Coverage Carry-Forward

| S123 item | Entering raw status | S124 treatment/result |
| --- | --- | --- |
| E123-AST-01 full AST fixture reconciliation | BLOCKED/UNAVAILABLE | PENDING; do not upgrade from graph cases. |
| E123-HELPER-01 full helper audit | BLOCKED/UNAVAILABLE | PENDING; use only public API; no broad helper PASS claim. |
| E123-SOURCE-01 arbitrary non-ASCII emitter case | BLOCKED/UNAVAILABLE | PENDING; graph path Unicode tests are distinct. |
| E123-PARITY-01 complete affine/builtin/input/view parity | BLOCKED/UNAVAILABLE | PENDING; graph success does not prove runtime parity. |
| E123-REJECT-01 unknown lowering case | BLOCKED/UNAVAILABLE | PENDING; module/CLI rejection rows are distinct. |
| S123-RETRY-STOP-01 retry cap exceeded | FAIL, owner accepted as process residual | Preserve raw FAIL/disposition; S124 follows its own cap. |

## Failures, Limitations and Residuals

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| PENDING | NOT RUN | PENDING | PENDING | PENDING |

Keep raw outcomes distinct from Builder recommendation and Product Owner
disposition. D121-18's crash-atomicity limitation remains even if all injected
rollback tests pass.

## Recommendation and Disposition

- **Builder recommendation:** PENDING; cite graph/CLI rows, output safety,
  rollback residuals, carried G123 statuses and changed-path audit.
- **Product Owner disposition:** PENDING; separately record accepted scope/date.
- **S125 readiness:** PENDING on S124 disposition and separate authorization.
- **Release/package/platform authority:** NONE.