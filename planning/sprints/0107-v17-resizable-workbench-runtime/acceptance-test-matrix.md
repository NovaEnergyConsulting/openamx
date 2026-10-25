# Sprint 107 Acceptance Test Matrix

| ID | Scenario | Required assertions | Surface | Result |
| --- | --- | --- | --- | --- |
| `S107-GATE-01` | Installed splitter API | Installed exports/types resolve; wrapper uses supported props/events and no runtime shadcn-vue Resizable export is assumed. | Package probe + desktop typecheck | PASS |
| `S107-GATE-02` | Actual A/B persistence | Actual service preserves A/B values after restart/restore and rejects invalid bounds; App.vue commits stable pointer/keyboard sizes through `setPanelSizes`. | Desktop service/RPC test + App.vue Playwright | PASS |
| `S107-GATE-03` | Workbench integration | Real App.vue layout mounts candidate and retains focus modes, active project switching, context pane, and runtime row. | Playwright | PASS |
| `S107-SIZE-01`, `S107-GATE-03` | Desktop three-panel layout | Two handles and three columns at 1024x720 and 1440x900; real App.vue layout retains focus modes, project changes, context pane, and runtime row. | Playwright bounding boxes | PASS |
| `S107-SIZE-02`, `S107-GATE-04` | Explorer min/max | Pointer and keyboard stop at 160 px and 400 px; both 8 px splitter hit areas respond; context/editor minima and 25-65% context bounds hold without overflow. | Playwright | PASS |
| `S107-SIZE-03` | Context min/max | Context remains 25-65% and editor/context tracks remain >=260 px; resizing one does not make the other unreachable. | Playwright | PASS |
| `S107-SIZE-04`, `S107-SIZE-07`, `S107-GATE-05` | Keyboard handles | Tab/Shift+Tab reach both handles; focus is visible; separator semantics, Arrow/Home/End behavior, bounds, and traversal are verified. | Playwright/ARIA assertions | PASS |
| `S107-SIZE-05`, `S107-GATE-06` | Focus modes | Enter/exit editor/preview focus modes; hidden panels do not overwrite saved desktop sizes. | Playwright + persistence guard review | PASS |
| `S107-SIZE-06`, `S107-GATE-06` | Responsive stack | At <=900 px, explorer/editor/context/runtime remain reachable without horizontal overflow; hidden handles cannot initiate a save. | Playwright + persistence guard review | PASS |
| `S107-RUN-01` | Runtime controls removed | No Bottom/Right runtime controls, no drawer-dock field in Preferences, and no active right-docking path. | Playwright/DOM and source search | PASS |
| `S107-RUN-02` | Preferences preserved | Appearance, wrap, autosave, and delay controls continue to save/restore correctly. | Focused Playwright | PASS |
| `S107-RUN-03` | Runtime actions | Run, Cancel, output Open/Reveal, and Details invoke existing handlers and remain correctly enabled. | Playwright + workflow harness | PASS |
| `S107-RUN-04` | Runtime content | Status/stage/progress/cleanup/export/diagnostics/summary and empty-details state remain available; details/results and theme states pass UI assertions. | Playwright + source review | PASS |
| `S107-RUN-05`, `S107-GATE-07` | Runtime layout | Bottom panel remains bounded and independently scrollable at 1024x720, 1440x900, and adaptive width; context pane remains visible during resize. | Playwright bounding/scroll assertions | PASS |
| `S107-RUN-06` | No state regression | Dock removal leaves job authority and panel-size RPC contract intact. Legacy local-storage values are inert, not deleted. | Service test + focused integration/source review | PASS |

## Existing Test Surfaces

- `desktop-app/tests/ui/workbench-comfort.pw.ts`
- `desktop-app/tests/ui/shell-components.pw.ts`
- Desktop RPC contract checks that exercise `setPanelSizes`/recent-project
  persistence.
- New focused `desktop-app/tests/ui/resizable-runtime.pw.ts`.

Every gate case and every product acceptance case must have a recorded result
or a precise NOT RUN/BLOCKED reason. A library-level prototype alone is not
evidence for actual App.vue persistence/integration cases.