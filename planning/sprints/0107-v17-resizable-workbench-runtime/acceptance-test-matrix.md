# Sprint 107 Acceptance Test Matrix

| ID | Scenario | Required assertions | Surface |
| --- | --- | --- | --- |
| `S107-GATE-01` | Installed splitter API | Installed exports/types resolve; wrapper uses supported props/events and no runtime shadcn-vue Resizable export is assumed. | Direct package/type probe |
| `S107-GATE-02` | Actual A/B persistence | Resize A and B independently with pointer and keyboard; reopen/switch; actual service returns each saved layout without local-storage cross-talk. | Desktop service/RPC tests + integrated UI |
| `S107-GATE-03` | Workbench integration | Real App.vue layout mounts candidate and retains focus modes, active project switching, context pane, and runtime row. | Playwright |
| `S107-SIZE-01`, `S107-GATE-03` | Desktop three-panel layout | Two handles and three columns at 1024x720 and 1440x900; real App.vue layout retains focus modes, project changes, context pane, and runtime row. | Playwright bounding boxes |
| `S107-SIZE-02`, `S107-GATE-04` | Explorer min/max | Pointer and keyboard stop at 160 px and 400 px within documented pixel tolerance; context/editor minima and 25-65% context bounds hold without overflow. | Playwright |
| `S107-SIZE-03` | Context min/max | Context remains 25-65% and editor/context tracks remain >=260 px; resizing one does not make the other unreachable. | Playwright |
| `S107-SIZE-04`, `S107-SIZE-07`, `S107-GATE-05` | Keyboard handles | Tab/Shift+Tab reach both handles; focus is visible; accessible splitter semantics, Arrow/Home/End behavior, bounds, and no wrap/trap are verified. | Playwright/ARIA assertions |
| `S107-SIZE-05`, `S107-GATE-06` | Focus modes | Enter/exit editor/preview focus modes; hidden panels do not overwrite last saved dimensions. | Playwright + RPC log |
| `S107-SIZE-06`, `S107-GATE-06` | Responsive stack | At <=900 px and narrow viewport, explorer/editor/context/runtime remain reachable without horizontal overflow; hidden handles do not persist bogus layout. | Playwright |
| `S107-RUN-01` | Runtime controls removed | No Bottom/Right runtime controls, no drawer-dock field in Preferences, and no active drawer-right layout path. | Playwright/DOM and source review |
| `S107-RUN-02` | Preferences preserved | Appearance, wrap, autosave, and delay controls continue to save/restore correctly. | Existing workbench UI + focused assertions |
| `S107-RUN-03` | Runtime actions | Run, Cancel, export output Open/Reveal, and details toggle invoke existing handlers and remain correctly enabled. | Playwright + workflow harness |
| `S107-RUN-04` | Runtime content | Status/stage/progress/cleanup/export/diagnostics/summary and empty-details state remain available and readable. | Playwright |
| `S107-RUN-05`, `S107-GATE-07` | Runtime layout | Bottom panel remains bounded and independently scrollable at 1024x720, 1440x900, and adaptive width; context pane remains visible during resize. | Playwright bounding/scroll assertions |
| `S107-RUN-06` | No state regression | Removing dock state does not change job authority, active identity, or per-project panel-size RPC state. Legacy local storage is inert, not deleted. | Focused integration/source review |

## Existing Test Surfaces

- `desktop-app/tests/ui/workbench-comfort.pw.ts`
- `desktop-app/tests/ui/shell-components.pw.ts`
- Desktop RPC contract checks that exercise `setPanelSizes`/recent-project
  persistence.
- New focused `desktop-app/tests/ui/resizable-runtime.pw.ts`, if separately
  approved in the exact execution plan.

Every gate case and every product acceptance case must have a recorded result
or a precise NOT RUN/BLOCKED reason. A library-level prototype alone is not
evidence for actual App.vue persistence/integration cases.