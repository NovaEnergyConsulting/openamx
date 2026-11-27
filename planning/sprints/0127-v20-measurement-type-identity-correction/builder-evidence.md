# Sprint 127 Builder Evidence: V0.20 Measurement Type Identity Correction

## Status

Architect-prepared evidence scaffold. S127 implementation and verification
are not authorized by this document.

**Builder recommendation:** PENDING.

**Separate Product Owner disposition:** PENDING.

## Baseline and Authorization

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S126 disposition | `BLOCKED/OPEN`; S126 Measurement `TS2345` and all residuals preserved. | NOT RUN |
| Baseline/worktree | `feat/create-V0.20.0`, `08fbfa3592bc815e1a6617d3c003a468bd8da9a0`; exact worktree and dirty inventory. | NOT RUN |
| S127 authorization | Exact source/test allowlist, commands/CWDs, output roots, preservation, retry and cleanup decisions. | NOT RUN |
| Host/tool versions | Windows, PowerShell, Bun, Node, Git, TypeScript, and any used tool versions. | NOT RUN |
| Preservation | `dist`, renderer, desktop outputs, S121-S126 artifacts before/after hashes. | NOT RUN |

## Command Ledger

| Run ID | Exact command/action and CWD | Result / artifact / hash | Raw status |
| --- | --- | --- | --- |
| S127-ROOT-FOCUSED | Approved ten-file focused suite; repository root. | PENDING | NOT RUN |
| S127-ROOT-TYPE | `bunx tsc --noEmit`; repository root. | PENDING | NOT RUN |
| S127-ROOT-BUILD | `bun run build`; isolated/preserved output root. | PENDING | NOT RUN |
| S127-GENERATED-COMPILE | Strict TypeScript 5.9.3 compile; S127 fixtures. | PENDING | NOT RUN |
| S127-GENERATED-ORACLE | Generated run vs AMX reference; S127 fixtures. | PENDING | NOT RUN |
| S127-DIFF-CHECK | `git diff --check`; repository root. | PENDING | NOT RUN |
| S127-PRESERVE | Primary output and historical artifact manifests. | PENDING | NOT RUN |

## Reconciliation

| Evidence group | Required result | Raw status |
| --- | --- | --- |
| S127-IDENTITY | One deterministic brand per checker-compatible Measurement vector class across modules. | NOT RUN |
| S127-REPRO | Retained imported `averageSpeed` graph compiles. | NOT RUN |
| S127-PARITY | Generated Measurement export and unit match the AMX oracle. | NOT RUN |
| S127-ADJACENT | Imported unit, derived dimension, and equal-vector alias cases remain compatible. | NOT RUN |
| S127-RESIDUALS | S125/S126 raw Measurement failures and all unrelated G123/G124 residuals remain unchanged. | NOT RUN |
| S127-SCOPE | No helper/API/checker/CLI/desktop/docs/example or release changes. | NOT RUN |

## Failures, Limitations, and Residuals

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S125-MEASUREMENT-PROBE-01 | FAIL | Original S125 TS2339/TS2322 output remains unchanged. | Transpiler/emitter owner. | Accepted S125 residual; preserve raw status. |
| S126-MEASUREMENT-COMPILE-01 | FAIL | S126 TS2345 output remains unchanged. | Transpiler/emitter owner. | S126 Builder recommends BLOCKED/OPEN; preserve raw status. |
| S127-FIRST-FAILURE | NOT RUN | Record every failure and retry with unique run IDs. | Builder. | Preserve original output. |
| S121-D121-18 | Accepted residual | Best-effort rollback is not crash-atomic. | Graph output owner. | Unchanged; outside S127. |
| S122-D122-15 | Accepted residual | No AMX parity claim for unexpressible enum-valued record defaults. | Product Owner. | Unchanged; outside S127. |

## Recommendation and Disposition

- **Builder recommendation:** PENDING; state exactly whether the generated
  graph compiles and matches AMX for the accepted source form.
- **Product Owner disposition:** PENDING and separate from Builder evidence.
- **V0.20 boundary:** S127 does not close V0.20 or complete the remaining G123
  matrix. No release/package/platform authority follows.