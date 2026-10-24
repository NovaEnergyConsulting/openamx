# Sprint 102 Resizable Technical Gate

## Decision Status

**Architect recommendation: conditional GO for shadcn-vue Resizable backed by
the already-declared Reka UI dependency.** This is a technical recommendation,
not an accepted product decision. Sprint 102 must verify the exact installed
API and a focused workbench proof before recording the final path. If any
required behavior regresses, use the equivalent accessible implementation
allowed by the V0.17 master plan.

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
- The V0.6 UX contract establishes 1024x720 as the minimum workbench size.
- `desktop-app/package.json` declares `shadcn-vue` 2.8.2 as a dev dependency
  and `reka-ui` 2.10.5 as an application dependency. The repository does not
  currently have a generated local `components/ui/resizable` wrapper.

## Candidate Capability

The shadcn-vue Resizable usage is a set of locally composed
`ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` components
backed by Reka UI's splitter primitives. The documented Reka API provides:

- horizontal/vertical groups with layout events;
- panel minimum/maximum bounds and pixel sizing;
- keyboard interaction and focusable resize handles;
- accessible window-splitter semantics;
- layout persistence hooks and an `autoSaveId` convenience option.

This capability fits the three-column/two-handle layout in principle. The
convenience persistence option defaults to local storage and must not be used
as the OpenAMX persistence authority: it conflicts with existing
per-project dimensions and could restore one project's layout into another.

## Required Integration Shape

1. Use a horizontal group with three panels and two vertical handles for the
   desktop layout. Keep component wrappers local to this repository; do not
   add or update packages unless the installed dependency cannot meet the
   gate and a separate dependency decision is approved.
2. Translate splitter layout changes to the existing
   `{ explorerWidth, previewWidth }` representation and persist through the
   desktop RPC after a completed pointer/keyboard adjustment. Maintain
   project-specific restore behavior. Do not enable global `autoSaveId`
   persistence.
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

| ID | Check | Pass condition |
| --- | --- | --- |
| `S102-TG-01` | Exact package/API availability | The installed Reka UI 2.10.5 exports the required splitter parts and actual prop/event behavior matches the API used by the proposed wrapper. No runtime install/update is needed. |
| `S102-TG-02` | Three-panel sizing model | A three-panel group can preserve the explorer pixel bounds, editor/context minimums, and context percentage bounds together at 1024x720 and a larger viewport. |
| `S102-TG-03` | Per-project persistence | Pointer and keyboard resizing round-trip through the existing RPC/recent-project record. Reopening project A and project B restores each project's independent sizes; local-storage auto-save is not authoritative. |
| `S102-TG-04` | Keyboard/accessibility | Handles are reachable by Tab, expose splitter semantics and visible focus, respond to the documented keyboard controls, stop at limits, and do not trap focus. |
| `S102-TG-05` | Responsive/focus modes | At 1024x720 and a larger desktop size, all panels remain usable; at <=900 px, existing stack/reflow remains reachable without overflow. Focus modes and hidden panels do not save bogus dimensions. |
| `S102-TG-06` | Runtime row interaction | The bottom runtime row remains visible, bounded, and independently scrollable while resizing workbench columns; no right docking behavior is required. |

## Evidence Required Before Final GO

- Confirm actual exports and type signatures from the installed lockfile/
  package rather than relying only on current online documentation.
- Build a throwaway or test-only harness/prototype under the separately
  approved Sprint 102 artifact scope; do not add production components or
  alter dependencies during the planning gate.
- Record viewport dimensions, starting/restored sizes, handle keyboard
  behavior, min/max outcomes, responsive transition, focus modes, and per-
  project persistence results.
- Prefer focused desktop Playwright verification. If native host behavior is
  unavailable, label it `BLOCKED/UNAVAILABLE`; do not imply platform
  certification.

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