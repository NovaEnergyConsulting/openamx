# Sprint 104 Activation Test Matrix

These cases verify the accepted Sprint 102 activation contract. They are
planned Sprint 104 evidence, not claims that current behavior passes.

| ID | Scenario | Required assertions | Surface |
| --- | --- | --- | --- |
| `S104-ACT-01` | Open project with active AMX document | Exactly one initial static analysis and one preview start for the active identity; preview becomes current; zero runtime `run` jobs. | Playwright + harness RPC log |
| `S104-ACT-02` | Open project with no active document | No static analysis, preview, or run request; empty workbench remains usable. | Playwright + harness RPC log |
| `S104-ACT-03` | Restore recent project with active AMX tab | One analysis and preview for restored project generation/path/revision; no duplicate caused by project listing or workbench sync. | Playwright + restore-capable harness RPC |
| `S104-ACT-04` | Restore recovery with unsaved AMX buffer | One analysis and preview for recovered buffer contents and identity; recovered text remains unsaved and is not written by initialization. | Playwright + recovery-capable harness RPC |
| `S104-ACT-05` | Select a second AMX document/tab | New identity receives one analysis and one preview; old identity results cannot replace it. Re-selecting/synchronizing the same identity does not duplicate startup work. | Playwright + harness RPC log |
| `S104-ACT-06` | Activate while preview is paused | Static analysis occurs once; no preview job starts while paused; explicit resume causes one current preview; no runtime run occurs. | Playwright + harness RPC log |
| `S104-ACT-07` | Activate CSV/JSON/CSS document | No AMX analysis or preview; existing data validation/context behavior still occurs for eligible mapped CSV/JSON data. | Playwright + harness RPC log |
| `S104-ACT-08` | Switch documents while analysis/preview responses are delayed | Delayed old response is cancelled, ignored, or marked stale; it cannot replace current HTML, analysis, status, or identity. | Playwright + controllable deferred harness responses |
| `S104-ACT-09` | Preview failure/cancellation during initial activation | One initial attempt only; existing failure/cancel/stale state and last-good preview behavior are preserved; no automatic retry loop. | Playwright + harness failure/cancel controls |
| `S104-ACT-10` | Create, duplicate, or move operation activates an AMX document | If the existing operation changes the active AMX identity, initialize that identity once through the shared boundary; do not alter the operation or introduce a second request path. | Playwright + harness only for supported existing workflows |
| `S104-ACT-11` | Explicit Run Active Document after activation | Startup emits only a `preview` job; `run` appears only after the user explicitly requests Run. | Playwright + harness RPC log |

## Coverage Notes

- Reuse `desktop-app/tests/ui/preview-freshness.pw.ts` as the regression
  baseline for pause/resume, debounce, autosave ordering, stale output, and
  failure behavior.
- Put activation-path and exactly-once assertions in a focused
  `desktop-app/tests/ui/initial-active-document.pw.ts` test file.
- Extend `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts` with
  test-only counters, controlled recent/recovery state, and delayed responses
  as needed. Do not add production RPC APIs merely to make the test possible.
- Check recovery behavior against actual persisted active buffer semantics;
  the harness's “no disk write” observation is not a substitute for the
  desktop service's recovery guarantees.
- Run existing preview-navigation/freshness tests if callback ordering or
  cancellation changes. Do not include unrelated S103 diagram-time failures
  as part of this focused test gate without separately approved scope.