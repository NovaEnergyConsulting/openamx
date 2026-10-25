# Sprint 108 Integrated Evidence Matrix

## Status and Evidence Rules

Architect-prepared matrix. All rows begin `NOT RUN`; fill only after separate
Sprint 108 execution authorization. Sprint 107's technical GO and accepted
focused tests are baseline evidence, not a substitute for the approved S108
integrated run.

Allowed raw statuses: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
Use a separate disposition field for `ACCEPTED/CLOSED`, accepted residual,
deferred scope, or pending owner decision. A disposition never rewrites a raw
test result.

For every evidence row record exact command/action, cwd, environment/tool
versions, expected vs actual result, counts, artifact path, residual owner,
and separate disposition. Preserve initial failures and retries.

## Closeout and Scope Reconciliation

| Evidence ID | Requirement/scope | Required evidence | Raw status | Artifact/result | Residual owner / disposition |
| --- | --- | --- | --- | --- | --- |
| `INT108-STATUS-01` | S102-S107 state and dependency reconciliation | Verify S102 contract closed, S103-105/107 owner dispositions, S106 acceptance disposition, S104-107 dependencies. | NOT RUN |  |  |
| `INT108-SCOPE-01` | S105 file-scoped amendment | Verify S105 accepted file-only amendment and do not represent original full folder-operation scope as passed. | NOT RUN |  |  |
| `INT108-SCOPE-02` | Deferred folder operations | Record folder duplicate/move/tree drag/trash/restore as deferred from V0.17, NOT RUN, with no target version committed. | NOT RUN |  |  |

## Feature Acceptance

| Evidence ID | Requirement family | Required evidence | Raw status | Artifact/result | Residual owner / disposition |
| --- | --- | --- | --- | --- | --- |
| `INT108-SHELL-01` | S103 shell/component refactor | RuntimePanel typed props/events, App.vue RPC/orchestration ownership, preserved editor/context/preview/ref boundaries; focused UI regression. | NOT RUN |  |  |
| `INT108-ACT-01` | S104 project open/restore/recovery | Active AMX project-open, recent restore, recovery buffer, and tab selection each initialize analysis/highlighting and eligible preview once. | NOT RUN |  |  |
| `INT108-ACT-02` | S104 pause/non-AMX/run separation | Pause suppresses preview but not static analysis; resume schedules one; non-AMX skips AMX work; startup does not issue runtime Run. | NOT RUN |  |  |
| `INT108-ACT-03` | S104 identity/freshness | Cancellation, project/document/settings identity, stale results, last-good/error behavior are verified under delayed/superseded responses. | NOT RUN |  |  |
| `INT108-EXP-01` | S105 search/count/menu | `folders/files` count is whole-project and stable under search; accepted action menu/context actions appear by kind. | NOT RUN |  |  |
| `INT108-EXP-02` | S105 file operations | Create/duplicate/move/drop/trash/restore/native open/reveal pass within accepted file-only scope, including collisions, import safeguards, dirty/conflict and rollback behavior. | NOT RUN |  |  |
| `INT108-EXP-03` | S105 folder scope | Folder duplicate/move/tree drag/trash/restore are not implemented or represented as PASS; record explicit accepted deferral. | NOT RUN |  |  |
| `INT108-CMD-01` | S106 palette navigation | Open/filter, first enabled selection, non-wrapping Up/Down, disabled/no-result, dynamic availability, Enter/Return, click parity, shortcut opening, and focus restoration. | NOT RUN |  |  |
| `INT108-TRASH-01` | S106 Trash follow-up | Failed restore alert and retained list stay visible together; another item and retry can succeed in the same dialog. | NOT RUN |  |  |
| `INT108-TRASH-02` | S106 untested Trash/host cases | Record S106-TRASH-04 failed list/empty operation checks and macOS Cmd+Shift+P as independently run or residual/unavailable; do not infer PASS. | NOT RUN |  |  |
| `INT108-RESIZE-01` | S107 technical gate and sizing | Reconfirm installed Reka wrappers, actual A/B service persistence, 160-400 px explorer, >=260 px editor/context, 25-65% context, keyboard and focus behavior. | NOT RUN |  |  |
| `INT108-RESIZE-02` | S107 responsive layout | Verify 1024x720, 1440x900, and <=900 px adaptive stack; no overflow or bogus persistence from hidden/focused panels. | NOT RUN |  |  |
| `INT108-RUNTIME-01` | S107 bottom-only runtime | No Bottom/Right controls or preference/state; runtime remains bottom and retains Run/Cancel/Details/status/stage/progress/cleanup/diagnostics/results/export output actions. | NOT RUN |  |  |

## Desktop Verification Gates

| Evidence ID | Gate | Required evidence | Raw status | Artifact/result | Residual owner / disposition |
| --- | --- | --- | --- | --- | --- |
| `INT108-TYPE-01` | Desktop typecheck | Record Hutch wrapper and direct `bunx vue-tsc --noEmit` separately; preserve hangs/failures. | NOT RUN |  |  |
| `INT108-RPC-01` | Desktop unit/RPC contract | `bun run test` from an isolated desktop workspace; guide and RPC/workflow results/counters recorded. | NOT RUN |  |  |
| `INT108-BUILD-01` | Desktop web build | `bun run build:web` in a fresh isolated validation root; generated output inventory and hashes preserved. | NOT RUN |  |  |
| `INT108-UI-01` | Focused V0.17 UI suite | Run active-document, explorer, palette, runtime/resizer, shell/help/preview regressions with fresh S108 artifacts. | NOT RUN |  |  |
| `INT108-UI-02` | Full applicable desktop UI suite | Run the approved full Playwright suite; preserve all failures/retries and output paths. | NOT RUN |  |  |
| `INT108-REPO-01` | Approved repository gate | Record exact gate approved for desktop-only scope; do not infer root/VS Code coverage unless run. | NOT RUN |  |  |
| `INT108-PLATFORM-01` | Native/package/OS routes | Run only if a supported direct route is approved; otherwise mark `BLOCKED/UNAVAILABLE` and do not imply certification. | NOT RUN |  |  |
| `INT108-PRESERVE-01` | Output/worktree preservation | Exact changed-path inventory, generated-output comparison, S102-S107 artifacts unchanged, `git diff --check`. | NOT RUN |  |  |

## Residual Register

| Residual ID | Baseline | S108 evidence/disposition |
| --- | --- | --- |
| `R-103-TYPECHECK` | Hutch wrapper did not complete; direct Vue typecheck passed. |  |
| `R-103-DIAGRAM` | Two diagram time-text assertions failed in the combined S103 run; one native WebView test skipped. |  |
| `R-104-WINDOWS-HARNESS` | Configured Unix Vite shim failed under PowerShell; direct `bunx vite` harness passed. |  |
| `R-104-RELOAD` | Private reload helper had no UI call site, so reload-specific UI path was not exercised. |  |
| `R-105-FOLDER-DEFERRED` | Folder mutations deferred from V0.17; no target version committed. |  |
| `R-106-ACCEPTANCE` | S106 builder evidence currently has separate owner disposition PENDING. |  |
| `R-106-TRASH-04` | Failed Trash list/empty operation path not tested due harness controls unavailable in S106 scope. |  |
| `R-106-MAC-CMD` | Cmd+Shift+P not directly tested on macOS host. |  |
| `R-107-NATIVE-BUILD` | No native Electrobun host test or standalone production build in S107. |  |

Do not remove a residual because a later unrelated check passed. Owner
disposition is recorded separately from raw results.