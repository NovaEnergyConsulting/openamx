# Sprint 102 Requirement and Test Matrix

This matrix is the traceability index for Sprint 102. It defines downstream
verification ownership; it does not claim that the new behaviors or tests
already exist or pass.

| Requirement group | Contract cases | Owner sprint | Focused verification surface |
| --- | --- | --- | --- |
| Shell ownership and behavior preservation | `S102-SHELL-01`, `S102-SHELL-02`, `S102-SHELL-03`, `S102-SHELL-04` | 103 | Desktop component/UI tests for parent-owned RPC orchestration, panel props/events, focus modes, and unchanged shell workflows. |
| Initial activation after project open | `S102-ACT-01` | 104 | Desktop UI/RPC test observing one static analysis and one initial preview for the opened active AMX identity. |
| Recent project reopen/restore | `S102-ACT-02` | 104 | Desktop UI/RPC test restoring a saved active AMX tab and asserting exactly-once initialization. |
| Recovery restore | `S102-ACT-03` | 104 | Recovery UI/RPC test using an unsaved recovered buffer; verify analysis/preview identity and no disk write. |
| Selection, paused preview, non-AMX | `S102-ACT-04`, `S102-ACT-05`, `S102-ACT-06` | 104 | Focused activation tests for switching, pause/resume, CSV/JSON/CSS, and no implicit runtime Run. |
| Cancellation, stale results, identity | `S102-ACT-07`, `S102-ACT-08` | 104 | Extend `desktop-app/tests/ui/preview-freshness.pw.ts` or companion tests; use delayed RPC/job results to prove stale commits are ignored. |
| Explorer search/count | `S102-EXP-01`, `S102-EXP-02`, `S102-EXP-03` | 105 | Explorer UI test with nested folders/files, ignored entries, and a changing search filter; assert stable `folders/files` totals and accessible count. |
| Action menu and file/folder actions | Action-placement tables; `S102-EXP-04`, `S102-EXP-09`, `S102-EXP-10` | 105 | Explorer UI plus desktop RPC-contract tests for file/folder duplicate, create, rename/move, trash/tree restore, typed trash entries, file-kind availability, confirmation, reveal/open fallback, and empty trash. |
| Drag/drop, collision, transaction safeguards | `S102-EXP-05`, `S102-EXP-06`, `S102-EXP-07`, `S102-EXP-08`, `S102-EXP-11` | 105 | Explorer UI drag/drop tests plus RPC tests for collisions, containment, dirty/conflicted tabs, external changes, import rewrites, complete folder descendants, rollback, and no partial mutation. |
| Command-palette keyboard behavior | `S102-CMD-01`, `S102-CMD-02`, `S102-CMD-03`, `S102-CMD-04`, `S102-CMD-05` | 106 | `CommandPalette.vue` component/UI coverage for open/filter, enabled selection, non-wrapping navigation, disabled commands, Enter/Return, empty state, click parity, and focus restoration. |
| Resizable implementation and sizing | `S102-SIZE-01`, `S102-SIZE-02`, `S102-SIZE-03`, `S102-SIZE-04`, `S102-SIZE-05`, `S102-TG-01`, `S102-TG-02`, `S102-TG-03`, `S102-TG-04`, `S102-TG-05`, `S102-TG-06` | 107 | Focused Playwright at 1024x720 and larger desktop size; assert two handles, three columns, bounds, keyboard, persistence across projects, focus modes, responsive stack, and no overflow. |
| Bottom-only runtime | `S102-RUN-01`, `S102-RUN-02`, `S102-RUN-03`, `S102-RUN-04` | 107 | UI test for absence of Bottom/Right controls and Preferences option; retain run/cancel, details, diagnostics/results, export status/output actions, and scroll bounds. |
| Integrated V0.17 acceptance | All groups | 108 | Approved integrated desktop acceptance and verification gate after V0.16 Sprints 100-101 close. |

## Traceability Rules

- Every case in `desktop-ux-contract.md` must appear in this matrix or be
  explicitly marked as a Sprint 102-only technical decision.
- Sprint 102 may define test fixtures and expected assertions, but it does not
  add product tests or report future acceptance as already passing.
- Existing focused tests are baseline evidence only. New behavior requires
  tests owned by the downstream sprint.
- Any contract change that moves an acceptance case between sprints or
  weakens a confirmed requirement must be dispositioned before the owning
  implementation begins.