# Sprint 107 Resizing and Runtime Contract

## Status and Authority

This contract operationalizes the accepted V0.17 requirements
`S102-SIZE-01` through `S102-SIZE-05` and `S102-RUN-01` through
`S102-RUN-04`. The S102 technical evaluation itself remains OPEN and must be
closed with actual App.vue and service/RPC evidence before the final
production resizer path is selected.

## 1. Workbench Layout

The desktop workbench continues to contain three primary columns in order:
project explorer, editor, contextual pane. Two vertical splitters separate
these columns. The runtime panel remains a bottom row spanning the workbench.

| ID | Observable behavior |
| --- | --- |
| `S107-SIZE-01` | Explorer/editor/context are separated by two keyboard-operable vertical splitters at desktop widths. Existing panel content, tabs, selection, scroll, focus modes, and visual hierarchy remain intact. |
| `S107-SIZE-02` | Explorer width remains 160-400 px. Editor and contextual pane each retain at least 260 px at the established 1024x720 minimum workbench. Splitter handles remain stable 8 px tracks or an explicitly dispositioned equivalent. |
| `S107-SIZE-03` | Contextual-pane width stays within the existing 25-65% constraint while preserving the editor minimum. Bounds must hold at 1024x720 and 1440x900; no silent relaxation is allowed. |
| `S107-SIZE-04` | Pointer resizing and keyboard resizing respect the same min/max constraints and persist to the active project's existing recent-project record through `setPanelSizes`. |
| `S107-SIZE-05` | Project A and B retain independent dimensions. Layout restore does not use a global local-storage splitter key as authority and does not overwrite another project's sizes. |
| `S107-SIZE-06` | Focus-editor/focus-preview modes and responsive stacking at <=900 px keep the required panel reachable. Hidden/collapsed/unmounted panels do not emit layout values that replace the last valid desktop sizing. |
| `S107-SIZE-07` | Splitter handles are keyboard reachable, have visible focus and accessible separator/splitter semantics, and support predictable directional adjustment plus Home/End limits. No focus trap or horizontal overflow is introduced. |

The exact splitter implementation is conditional on `technical-gate.md`.
Candidate: local shadcn-vue-style wrappers over the already installed Reka UI
splitter primitives with all-percent layout conversion, excluding handle
tracks correctly. If that fails the gate, implement an equivalent accessible
splitter; do not keep pointer-only custom dividers as the accessibility
fallback.

## 2. Persistence and Conversion

- Existing service values remain `{ explorerWidth, previewWidth }`, validated
  by the trusted service as explorer 160-400 px and contextual width 25-65%.
- Recent-project state is the persisted source of truth. Save only stable
  completed pointer/keyboard adjustments, not intermediate drag frames or
  transient responsive/focus-mode layouts.
- Convert pixel/percentage values using the measured available panel-track
  width and handle widths consistently. Avoid the S102 pixel-unit mismatch
  that normalized Reka's initial geometry.
- On invalid/legacy saved values, use the approved safe fallback/default and
  do not write the fallback until a real user adjustment occurs.
- Restore and save operations remain scoped to the current project root.

## 3. Bottom-Only Runtime

| ID | Observable behavior |
| --- | --- |
| `S107-RUN-01` | Runtime remains fixed at the bottom. Remove Bottom/Right controls, right relocation, `DrawerDock`, local preference/state handlers, and obsolete `.drawer-right` CSS/layout branches. |
| `S107-RUN-02` | Remove the Runtime drawer selection from Preferences while preserving Appearance, Wrap long editor lines, Autosave, and autosave delay settings. |
| `S107-RUN-03` | Preserve Run Active Document, Cancel Current Job, state/status, job stage, progress, cleanup-pending status, export status, and output Open/Reveal actions. |
| `S107-RUN-04` | Preserve Details/Hide details, diagnostics navigation, input diagnostics, preview diagram errors, result summaries, and independently scrollable runtime details. |
| `S107-RUN-05` | Runtime remains bounded and usable at 1024x720, 1440x900, and adaptive/narrow widths; its bottom placement never hides or replaces the preview/context pane. |
| `S107-RUN-06` | Removing docking does not change RPC/job authority, runtime state, command execution, project-size persistence, or preview behavior. |

Stop reading/writing `openamx.drawer-dock` and remove the associated UI/state.
Do not delete legacy values from user local storage or perform profile data
cleanup. The old key, if present, becomes inert.

## 4. Runtime Content Preservation Checklist

The implementation must retain all of the following unless a precise
currently-unavailable state is described:

- Run active document and Cancel current job.
- Idle/running/success/failure/cancelled/stale state and status text.
- Job stage, progress indicator, and worker-cleanup-pending status.
- Export status and completed output Open/Reveal actions.
- Static/run/input diagnostics, preview-diagram errors, and diagnostic
  navigation callbacks.
- Run summary values and empty-details state.
- Details expand/collapse with correct `aria-expanded` and existing visible
  labels.
- Theme styles, accessible labels/live regions, independent scrolling, and
  bottom-row containment.