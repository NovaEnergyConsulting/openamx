# Sprint 103 Behavior-Preservation Matrix

This matrix defines Sprint 103's focused verification target. Cases verify
existing behavior through the new component boundaries; they do not add the
user-facing behavior owned by later sprints.

| ID | Existing behavior to preserve | Verification |
| --- | --- | --- |
| `S103-SHELL-01` | `App.vue` owns project/RPC/job orchestration; extracted children receive data and emit intents without direct RPC access. | Review component props/emits and imports; focused typecheck. |
| `S103-SHELL-02` | Welcome/open project, active project label, global header, Help, Preferences, and Commands remain reachable and unchanged. | Focused Playwright smoke at 1024x720 and 1440x900. |
| `S103-EDITOR-01` | Active tab selection/close and editor/data editor rendering remain wired to existing shell handlers. | UI test selects and closes tabs and confirms active content; existing editor suites. |
| `S103-EDITOR-02` | Find, format, save, editor focus/selection, completion, and data-location actions still reach existing editor refs. | Existing editor-focused UI tests plus one boundary smoke for format/save/find where available. |
| `S103-CTX-01` | AMX Preview/Inputs tabs and non-AMX Data/context views render with the same content and selection behavior. | UI test toggles AMX context views and opens a CSV/JSON tab; current shell state remains parent-owned. |
| `S103-CTX-02` | Preview iframe identity, load binding, navigation bridge, and current/stale status remain shell-owned and functional. | Existing `preview-freshness.pw.ts`, `preview-navigation.pw.ts`, and relevant diagram UI tests. |
| `S103-RUN-01` | Runtime state, stage, status, progress, cleanup state, export status/output actions, diagnostics, and summary values render unchanged. | Focused UI test inspects runtime states/content; existing `diagram-playback.pw.ts` checks diagnostic wiring. |
| `S103-RUN-02` | Run, Cancel, Details/Hide details, Open output, Reveal output, and diagnostic navigation use the same handlers and availability as before extraction. | Focused runtime component integration test with harness callbacks and observable results. |
| `S103-RUN-03` | Runtime Details retains its initial collapsed state, `aria-expanded`, button label, and shown/hidden content behavior. | Playwright keyboard and pointer toggle assertions. |
| `S103-RUN-04` | Runtime panel remains at bottom and independently scrollable under current responsive behavior; Bottom/Right controls and preference remain unchanged in this sprint. | Existing `workbench-comfort.pw.ts` at desktop/adaptive viewports plus assertions for current docking controls. |
| `S103-STYLE-01` | Existing panel classes, theme styles, scrolling, dimensions, focus visibility, and 1024x720 workbench remain intact. | Focused Playwright at 1024x720 and 1440x900; review screenshots and CSS diff. |
| `S103-SCOPE-01` | First-load behavior and all new explorer, command, resize, and docking behavior remain deferred to their owner sprints. | Diff/path review confirms no activation workflow, project-operation, palette-navigation, resizer, or docking-removal change. |

## Baseline Suite References

- `desktop-app/tests/ui/workbench-comfort.pw.ts`
- `desktop-app/tests/ui/preview-freshness.pw.ts`
- `desktop-app/tests/ui/preview-navigation.pw.ts`
- `desktop-app/tests/ui/diagram-playback.pw.ts`
- `desktop-app/tests/rpc-contract-check.ts` if event/RPC boundary wiring
  requires it

Use the existing Playwright workflow harness. Do not add a component-test
framework solely for this refactor. New tests should be concentrated in a
focused `desktop-app/tests/ui/shell-components.pw.ts` or a narrowly approved
extension of an existing UI test.