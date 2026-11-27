# Sprint 126 Builder Evidence: V0.20 Integrated Acceptance and Closeout

## Status

Architect-prepared evidence scaffold. S126 execution is not authorized by
preparing this package. The S125 accepted disposition is recorded in its
Builder evidence, while canonical lifecycle ledgers still require separately
authorized reconciliation before S126 execution.

**Builder recommendation:** PENDING.

**Separate Product Owner disposition:** PENDING.

## Entry and Baseline

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S121 disposition | Accepted/closed with residuals; D121-18 preserved. | NOT RUN |
| S122 disposition | Accepted/closed with residuals; D122-15 and S122 retry residual preserved. | NOT RUN |
| S123 disposition | Accepted/closed with residuals; S123 process FAIL and all incomplete G123 rows preserved. | NOT RUN |
| S124 disposition | Accepted/closed with residuals; S124 process FAIL, G124 cancellation/crash NOT RUN, D121-18 preserved. | NOT RUN |
| S125 disposition | Verify S125 Builder evidence ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27; preserve full desktop FAIL, typecheck wrapper no-result, native-unavailable, Measurement probe FAIL. | NOT RUN |
| Canonical lifecycle reconciliation | Record separate authorization/result for state/decisions/STATUS/briefing; do not rewrite historical raw evidence. | BLOCKED/UNAVAILABLE until approved |
| Baseline/worktree | Branch, commit, dirty state, user changes, OS/tool versions, package/lock, root/desktop output manifests. | NOT RUN |
| S126 authorization | Exact files, commands, worktree, outputs, retries, preservation/cleanup and disposition owner. | NOT RUN |

## Command and Host Ledger

Record exact command/action, CWD, tool versions, exit/result counts/assertions,
artifact/hash, retry ID and raw status.

| Run ID | Required gate | Command/action | Result/artifact/hash | Raw status |
| --- | --- | --- | --- | --- |
| S126-ROOT-FOCUSED | Approved integrated focused suite | PENDING | PENDING | NOT RUN |
| S126-ROOT-ALL | Full root `bun test` | PENDING | PENDING | NOT RUN |
| S126-ROOT-TYPE | `bunx tsc --noEmit` | PENDING | PENDING | NOT RUN |
| S126-ROOT-BUILD | Isolated/preserved root build | PENDING | PENDING | NOT RUN |
| S126-CLI-GRAPH | Example 16 and nested graph CLI | PENDING | PENDING | NOT RUN |
| S126-GENERATED-COMPILE | Strict generated graph compile | PENDING | PENDING | NOT RUN |
| S126-GENERATED-RUN | Generated `run(inputs)` oracle | PENDING | PENDING | NOT RUN |
| S126-MEASUREMENT-PROBE | Re-run S125 imported Measurement probe if authorized | PENDING | PENDING | FAIL (carried S125 raw status until new run) |
| S126-DESKTOP-TYPE-WRAPPER | `bun run typecheck` | PENDING | PENDING | NOT RUN |
| S126-DESKTOP-TYPE-PINNED | Direct pinned vue-tsc fallback | PENDING | PENDING | NOT RUN |
| S126-DESKTOP-FULL | `bun run test` | PENDING | PENDING | FAIL (carried S125 raw status until new run) |
| S126-DESKTOP-RPC | RPC contract harness | PENDING | PENDING | NOT RUN |
| S126-DESKTOP-UI | Vite UI harness | PENDING | PENDING | NOT RUN |
| S126-NATIVE | Native WebView/platform route | PENDING | PENDING | BLOCKED/UNAVAILABLE (carried) |
| S126-DIFF-CHECK | `git diff --check` | PENDING | PENDING | NOT RUN |
| S126-PRESERVE | root/desktop/generated/prior artifact hash audit | PENDING | PENDING | NOT RUN |

## Integrated Evidence Reconciliation

| Evidence group | Required reconciliation | Result / missing rows | Raw status |
| --- | --- | --- | --- |
| S126-ENTRY | All S121-S125 decisions/dispositions and residuals | PENDING | NOT RUN |
| S126-G123 | All AST emitter G123/E123 rows, each exact raw status | PENDING | NOT RUN |
| S126-EXAMPLE | Example 16 AMX/CLI/compile/generated-run/view parity | PENDING | NOT RUN |
| S126-GRAPH | CLI/desktop path/content equivalence and S124 safety matrix | PENDING | NOT RUN |
| S126-DESKTOP | RPC/full unit/type/UI/native classifications | PENDING | NOT RUN |
| S126-DOCS | V0.20 spec/README/examples and historical spec immutability | PENDING | NOT RUN |
| S126-RESIDUALS | S123/S124/S125 process, measurement, desktop, G123/G124 rows | PENDING | NOT RUN |
| S126-SCOPE | No fixes/release/package/platform changes; preserve outputs | PENDING | NOT RUN |

## Failures, Limitations and Residuals

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S122-RETRY-LIMIT-DEVIATION | FAIL | Preserve from S122 Builder evidence. | Process residual. | Accepted 2026-11-25. |
| S123-RETRY-STOP-01 | FAIL | Preserve from S123 Builder evidence. | Process residual. | Accepted 2026-11-26. |
| S124-RETRY-STOP-01 | FAIL | Preserve from S124 Builder evidence. | Process residual. | Accepted 2026-11-26. |
| S125-MEASUREMENT-PROBE-01 | FAIL | S125 generated Measurement type identity TS2339/TS2322. | Emitter/runtime coverage. | Pending S126 authorized rerun; no S126 fix. |
| S125-DESKTOP-TEST-01 | FAIL | Existing report-export RPC poll timed out with `currentPdf.status === "running"`. | Desktop unrelated timing residual. | Preserve unless direct separate disposition. |
| S125-DESKTOP-TYPE-SCRIPT-01 | BLOCKED/UNAVAILABLE | Hutch wrapper prompt/no completion; direct pinned vue-tsc passed separately. | Host wrapper. | Preserve as two distinct rows. |
| S125-NATIVE-01 / PLATFORM | BLOCKED/UNAVAILABLE | No direct native WebView/cross-platform route. | Platform qualification. | No certification claim. |
| G124-PUBLISH-CANCEL-01 / CRASH | NOT RUN | CLI cancel is noninteractive; crash/power loss not tested. | Graph output safety. | D121-18 remains accepted non-crash-atomic. |

## Recommendation and Disposition

- **Builder recommendation:** PENDING; cite complete/incomplete V0.20 matrix,
  exact aggregate results, residuals, and no-release boundary.
- **Product Owner disposition:** PENDING; record separately with date, scope
  and named residual owners.
- **Release/package/platform authority:** NONE.