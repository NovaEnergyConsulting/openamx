# Sprint 107 Builder Evidence: V0.17 Resizable Workbench and Runtime Panel

## Status

Architect-prepared evidence template. Sprint 107 implementation and
verification have not started under this preparation.

**S102 resizer gate:** OPEN at preparation time.
**Builder recommendation:** PENDING authorized execution.
**Separate acceptance disposition:** PENDING.

## Preconditions and Baseline

- Sprint 106 implementation and focused tests are complete; its evidence
  still says separate product-owner acceptance is PENDING. Focused palette,
  Trash, Help, and direct desktop typecheck passed. S106-TRASH-04 (failed
  Empty Trash/list refresh) was not exercised because the authorized harness
  lacked deterministic failure controls. Cmd+Shift+P was not separately run
  on macOS; no native certification is claimed.
- The live layout still uses custom CSS Grid dividers and pointer handlers.
  Per-project sizes flow through `setPanelSizes`; current values are
  explorer 160-400 px and context 25-65%, with 260 px editor/context minimum
  tracks.
- `RuntimePanel.vue`, `shell.ts`, `App.vue`, `PreferencesDialog.vue`, and
  `app.css` still contain Bottom/Right docking state/control/wiring.
- S102's all-percent Reka prototype passed mock geometry/keyboard/focus/
  responsive probes but did not exercise actual `setPanelSizes` persistence
  or App.vue integration. Its technical gate remains OPEN.
- S105 is ACCEPTED/CLOSED against file-only explorer scope; folder mutation
  work was deferred and is unrelated to Sprint 107.

## Approved Execution Plan

Pending separate authorization. Record the exact approved source, RPC/test,
generated output, browser artifact, and evidence paths before implementation.
The actual service/App.vue resizer proof must occur before selecting the
production path.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory | NOT RUN. |
| Installed Reka/shadcn-vue API probe | NOT RUN. |
| Actual service `setPanelSizes` A/B persistence | NOT RUN. |
| Actual App.vue candidate integration | NOT RUN. |
| Desktop bounds/keyboard/responsive Playwright | NOT RUN. |
| Runtime bottom-only/content regression | NOT RUN. |
| Direct desktop typecheck | NOT RUN. |
| Desktop build, if separately approved | NOT RUN. |
| `git diff --check` and exact path/output inventory | NOT RUN. |

## Scope and Residuals

- No product source or tests were changed during Architect preparation.
- Do not select Reka from documentation/mock evidence alone; do not silently
  relax sizing, persistence, keyboard, or responsive requirements.
- Preserve all runtime content/actions and leave legacy local-storage values
  inert rather than deleting user data.
- Record failures and native-host/platform checks precisely. No release,
  publication, package/version change, certification, or Sprint 108
  execution is authorized by this document package.