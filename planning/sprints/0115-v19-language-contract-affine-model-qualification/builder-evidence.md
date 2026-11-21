# Sprint 115 Builder Evidence: V0.19 Language Contract and Affine Model Qualification

## Status

**Architect preparation only.** Sprint 115 execution has not been separately
authorized or performed. This file is a completion template with truthful
preparation status; placeholders must be replaced during authorized execution.

**Builder recommendation:** NOT READY FOR DISPOSITION until the evidence items
below are completed.

**Separate product-owner disposition:** PENDING; this Architect-prepared
package does not open Sprint 116 or Sprint 117.

## Authorization and Baseline

| Evidence item | Status | Record |
| --- | --- | --- |
| Sprint 115 execution authorization | NOT RUN | Record approver, date, exact conversation/approval, and authorized file/command/output plan |
| Sprint 114/V0.18 closeout prerequisite | SOURCE VERIFIED during preparation | ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-01; raw residuals unchanged |
| Repository commit/worktree baseline | NOT RECORDED | Record branch, commit, dirty-state inventory, and preservation plan at execution start |
| Host and tool versions | NOT RECORDED | Record OS/architecture, CPU/memory as relevant, Bun/Node/PowerShell versions |
| Existing generated/shared artifacts | NOT RECORDED | Inventory hashes/outputs that must be preserved; package preparation changed planning files only |

## Contract and Source Review Evidence

- V0.19 master-plan decision audit: PREPARED in this package; execution review
  and product-owner disposition NOT RUN.
- Chart AST/parser/checker/emission/model source audit: PREPARED for planning;
  production `showTable` behavior absent at baseline.
- Unit metadata/declaration/runtime/external-data/chart-normalization source
  audit: PREPARED for planning; production offset behavior absent at baseline.
- Confirmed requirements/proposals/blocking decisions: D115-01 through D115-09
  remain CANDIDATE/PENDING.
- Exact stable case count and ID reconciliation: NOT RUN; complete before
  Builder recommendation using the prescribed reconciliation rule.
- Diagnostic identity/source-range verification for new syntax: NOT RUN.
- Published specification/example/editor/release evidence: OUT OF SCOPE for
  Sprint 115.

## Qualification Evidence Template

| Check | Command / method | Raw outcome | Limitation / disposition |
| --- | --- | --- | --- |
| $0\,C=32\,F=273.15\,K$ arithmetic | NOT RUN | Expected 273.15 K physical for all three | Contract/probe only; not production runtime evidence |
| Forward/reverse conversion | NOT RUN | C/F/K round-trip golden values | State floating tolerance and exact unit identity |
| Declaration precedence/composition | NOT RUN | Golden `(scale, offset)` pairs | Parser/checker feature absent until S117 |
| Mixed subtraction | NOT RUN | $20\,C-10\,C=10\,C$; mixed formula cases | Runtime feature absent until S118 |
| `sum`/`mean` exception | NOT RUN | Expected first-display-unit values | Runtime feature absent until S118 |
| Rejected affine operations | NOT RUN | Diagnostics only; no value output | Exact codes/messages/ranges pending S118 |
| PI/E declaration allowlist | NOT RUN | PI/E accepted; user/imported values rejected | Checker feature absent until S117 |
| External shape/compound unit | NOT RUN | Shape unchanged; D115-08 result recorded | Data implementation absent until S118 |
| Chart visibility model/output | NOT RUN | One resolved Boolean; no false tables | Parser/renderers absent until S116/S119 |

## Candidate Decision Ledger

| Decision | Preparation result | Execution result | Disposition / owner |
| --- | --- | --- | --- |
| D115-01 `showTable` line shape | CANDIDATE | NOT RUN | Product owner |
| D115-02 evaluation at `show` snapshot | CANDIDATE | NOT RUN | Product owner / S116 |
| D115-03 output omission/accessibility | CANDIDATE + confirmed master scope | NOT RUN | Product owner / S119 |
| D115-04 declaration offset operands | CANDIDATE; blocks S117 | NOT RUN | Product owner |
| D115-05 affine composition restrictions | CANDIDATE; blocks S117 | NOT RUN | Product owner |
| D115-06 runtime operation matrix | CANDIDATE + confirmed master scope | NOT RUN | Product owner / S118 |
| D115-07 PI/E narrow allowlist | CANDIDATE + confirmed master scope | NOT RUN | Product owner / S117 |
| D115-08 external shape/compound rule | CANDIDATE; shape source verified | NOT RUN | Product owner / S118 |
| D115-09 diagnostic policy | CANDIDATE existing-code policy | NOT RUN | Lead Developer allocator |

## Scope Audit

- Sprint package paths planned: this folder only.
- Production source/test/editor/generated/spec/example/manifest/release changes:
  NONE during Architect preparation.
- Any authorized execution writes beyond this folder: record exact path and
  amendment before command execution.
- Release/publication/package/version/deployment/certification: NOT AUTHORIZED.

## Builder Reconciliation Result

NOT RUN. During Sprint 115 execution, record:

- distinct `CHT-*` count from `qualification-cases.md`;
- distinct `AFF-*` count from `qualification-cases.md`;
- distinct diagnostic case count and any intentionally shared IDs;
- missing/duplicate/renamed IDs across the qualification, diagnostic, and
  requirement matrices;
- unresolved blocking decisions and exact downstream sprint impact;
- whether any case requires a fixture beyond ordinary AMX source.

## Final Recommendation and Disposition

At authorized execution completion, replace this section with:

- `Builder recommendation: ACCEPT/CLOSED`, `ACCEPT WITH RECORDED RESIDUALS`,
  or `BLOCKED/OPEN`;
- exact accepted evidence and named unresolved residual owners;
- separate product-owner disposition, date, and next-sprint gate;
- explicit statement that no implementation, release, publication, package
  version change, deployment, or certification is authorized by that
  disposition unless separately approved.
