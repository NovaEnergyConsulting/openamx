# Sprint 102 Resizable Technical Gate

## Decision Status

**Decision: OPEN.** The installed Reka splitter API is present and supports
keyboard resizing, but the tested pixel-unit three-panel adapter normalized
its initial layout and did not restore the seeded pixel sizes exactly. The
prototype used mock per-project RPC persistence; it did not call the actual
desktop service. Do not approve this adapter or select Reka for Sprint 107
until an alternative constraint mapping and actual `setPanelSizes` round-trip
pass the gate. The shadcn-vue component path is a local generated wrapper,
not an installed runtime export.

## Current Baseline

- The workbench currently uses CSS Grid and two custom vertical dividers to
  size three columns: explorer, editor, and contextual pane.
- Explorer width is constrained to 160-400 px. Context width is constrained
  to 25-65%; the editor and context tracks currently have a 260 px CSS minimum.
- Drag completion calls `setPanelSizes({ explorerWidth, previewWidth })`.
  The desktop service validates these ranges and persists them in the recent
  project record, not in a global layout store.
- At viewport widths up to 900 px, the layout changes to a vertical stack and
  the dividers are hidden. Editor/preview focus modes conditionally hide
  panels.
- The current custom separators are focusable but have pointer handlers only;
  keyboard adjustment is a confirmed requirement not currently met.
- The V0.6 UX contract establishes 1024x720 as the minimum workbench size.
- `desktop-app/package.json` and installed manifests report shadcn-vue 2.8.2
  and Reka UI 2.10.5. shadcn-vue exports CLI/registry APIs, not a runtime
  Resizable component. There is no generated local wrapper.
- `setPanelSizes` stores dimensions in each recent-project record. This RPC
  authority is required; local storage is not a substitute.

## Candidate Capability

## Installed API and Prototype Result

- `reka-ui` 2.10.5 exports `SplitterGroup`, `SplitterPanel`, and
  `SplitterResizeHandle`. The group accepts `direction`,
  `keyboardResizeBy`, `autoSaveId`, and a storage adapter and emits a
  `layout` array. It has no controlled-layout prop.
- Panels accept `defaultSize`, `minSize`, `maxSize`, and `sizeUnit` (`px` or
  `%`). Pixel constraints convert against the full measured group width.
  Handles support Arrow keys, Home/End, F6 cycling, and expose separator
  semantics with percentage-based ARIA values.
- The installed shadcn-vue 2.8.2 package exports CLI/registry APIs, not
  runtime Resizable components. A local generated wrapper over Reka is
  required if that component style is selected.
- The prototype's pixel-unit mapping normalized initial sizes because handle
  width is excluded from the CSS panel tracks but included in Reka's pixel
  constraint conversion. An all-percent mapping converted stored pixel bounds
  using `(group width - two 8px handles)` and preserved the seeded 220px/44%
  layout without Reka normalization warnings.
- The all-percent prototype exercised mock `setPanelSizes` state only. Reka's
  `autoSaveId` writes local storage and was not enabled. Actual desktop RPC and
  App.vue integration remain unverified.

## Required Integration Shape

1. Use the tested all-percent layout with three panels and two vertical
  handles. Convert stored pixel widths using available panel-track width,
  excluding both handles; translate the context track back to a percentage
  of the full group width. Do not use Reka pixel `sizeUnit` without
  compensating for handle width.
   desktop layout. Keep component wrappers local to this repository; do not
   add or update packages unless the installed dependency cannot meet the
   gate and a separate dependency decision is approved.
2. Load sizes from the active recent-project record and persist only completed
  pointer/keyboard adjustments through the real `setPanelSizes` RPC. Verify
  project A/B restoration independently. Do not enable `autoSaveId` or use
  local storage as a substitute.
3. Preserve explorer 160-400 px, editor/context minimums, contextual-pane
   25-65% range, and a reachable center editor at 1024x720. If Reka's single
   layout model cannot represent these bounds without violating them, record
   the incompatibility rather than silently relaxing a bound.
4. Keep focus-mode conditional visibility and the <=900 px stacked responsive
   layout outside or explicitly within the splitter group. Hidden/collapsed
   panels must not corrupt the persisted desktop layout.
5. Preserve handle focus visibility, accessible names/relationships,
   keyboard arrows, Home/End bounds, pointer capture, and no horizontal
   overflow. Do not infer parity solely from the library documentation.

## Technical Gate Cases

| ID | Check | Pass condition | Sprint 102 result |
| --- | --- | --- | --- |
| `S102-TG-01` | Exact package/API availability | The installed Reka UI 2.10.5 exports the required splitter parts and actual prop/event behavior matches the API used by the proposed wrapper. No runtime install/update is needed. |
| `S102-TG-02` | Three-panel sizing model | A three-panel group can preserve the explorer pixel bounds, editor/context minimums, and context percentage bounds together at 1024x720 and a larger viewport. |
| `S102-TG-03` | Per-project persistence | Pointer and keyboard resizing round-trip through the existing RPC/recent-project record. Reopening project A and project B restores each project's independent sizes; local-storage auto-save is not authoritative. |
| `S102-TG-04` | Keyboard/accessibility | Handles are reachable by Tab, expose splitter semantics and visible focus, respond to the documented keyboard controls, stop at limits, and do not trap focus. |
| `S102-TG-05` | Responsive/focus modes | At 1024x720 and a larger desktop size, all panels remain usable; at <=900 px, existing stack/reflow remains reachable without overflow. Focus modes and hidden panels do not save bogus dimensions. |
| `S102-TG-06` | Runtime row interaction | The bottom runtime row remains visible, bounded, and independently scrollable while resizing workbench columns; no right docking behavior is required. |

## Evidence Required Before Final GO

## Remaining Evidence Before Final GO/NO-GO

- Invoke the actual desktop `setPanelSizes` RPC and verify recent-project A/B
  persistence with pointer and keyboard adjustments.
- Mount the candidate in the actual App.vue shell and verify that focus modes,
  project changes, hidden panels, and the existing runtime row do not create
  bogus persistence or alter workbench behavior.
- Recheck restored bounds after real recent-project data is loaded. Record
  native-host behavior as `BLOCKED/UNAVAILABLE` if it cannot be exercised;
  do not imply platform certification.

## Decision Rule

- **GO:** All `S102-TG-01` through `S102-TG-06` pass, or any deviation is
  explicitly dispositioned while all confirmed master-plan requirements
  remain met. Use shadcn-vue's local Resizable wrappers over Reka UI and
  persist through the desktop service.
- **NO-GO:** Any bounds, per-project persistence, keyboard, focus-mode, or
  responsive requirement cannot be met. Retain an equivalent accessible
  implementation or amend the candidate before Sprint 107; do not replace the
  current dividers based on library documentation alone.
- **OPEN:** Required API/prototype evidence is unavailable. Sprint 107 remains
  blocked from choosing a resizer until the gap is resolved.

## Source References

- [shadcn-vue Resizable documentation](https://www.shadcn-vue.com/docs/components/resizable)
- [Reka UI Splitter documentation](https://reka-ui.com/docs/components/splitter)
- `desktop-app/package.json`
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`,
  `desktop-app/src/mainview/shell.ts`,
  `desktop-app/src/bun/desktopService.ts`, and
  `desktop-app/src/shared/rpc.ts`