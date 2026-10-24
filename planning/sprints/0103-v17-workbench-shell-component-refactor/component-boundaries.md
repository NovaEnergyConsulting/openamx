# Sprint 103 Component Boundaries

## Authority and Status

This is the Architect-prepared candidate boundary map for Sprint 103. The
V0.17 master plan keeps project/RPC orchestration in `App.vue` and calls for
panel presentation/local interaction state to move where that clarifies
ownership. This document does not authorize implementation; final boundaries
must be included in the separately approved Sprint 103 file plan.

## Ownership Map

| Surface | Sprint 103 owner | Contract |
| --- | --- | --- |
| Project lifecycle, active document, RPC, jobs, navigation, command definitions, status, cancellation, preview identity/bridge | `App.vue` | Remains shell-owned. Child components receive bounded display values and emit typed intents. |
| Welcome, project explorer, open tabs, command palette, dialogs, inputs panel, data editor, code editor | Existing focused components | Retain component ownership and public events. Do not refactor unrelated internals. |
| Runtime panel markup and Details expanded/collapsed state | New `RuntimePanel.vue` | Owns local disclosure state and runtime presentation. Receives state/data as props; emits run, cancel, open/reveal output, and navigation intents. Receives no RPC or filesystem capability. |
| Contextual panel frame (tabs, header actions, status placement) | Optional `DocumentContextPanel.vue` | Use a controlled `contextView` prop and typed events; render preview/inputs/data bodies through slots so `App.vue` retains frame refs, RPC callbacks, and domain orchestration. Do not move the activation reset contract into an uncoordinated child watcher. |
| Context view value and activation-driven default | `App.vue` | Remains parent-owned because `activate()` selects the default view for each active document. Context panel interaction returns updates through a typed event/model binding. |
| Editor and data-editor imperative refs | `App.vue` | Remain available to current focus, selection, formatting, replacement, and data-location workflows. Do not add broad forwarded-ref facades just to move the template. |
| Resizer state, panel dimensions, drawer dock, preferences state | `App.vue` and existing preferences | Preserve unchanged in Sprint 103. Resizer/docking cleanup belongs to Sprint 107. |

## RuntimePanel Contract

The exact props may use existing RPC types or small view models, but the
boundary must provide the current panel with:

- active document eligibility for Run Active Document;
- active job/running state, current run state, stage, status, and cleanup
  pending state;
- export status and completed output identity/name;
- static, run, preview-diagram, and input diagnostics plus run summary values;
- current `drawerDock` value until Sprint 107 removes docking controls.

Typed events cover:

- `run`, `cancel`, and `output-action` (`open` or `reveal`);
- diagnostic navigation and input-diagnostic navigation;
- current dock selection while those controls still exist in Sprint 103.

The component owns only the local Details disclosure state. Preserve the
current `runtime-drawer`, `drawer-heading`, `runtime-status`,
`runtime-details`, `output-actions`, and `drawer-stage` classes and accessible
labels relied on by existing styling/tests. Preserve the current button text,
titles, labels, disabled conditions, status/live-region behavior, and content
ordering. Do not remove Bottom/Right controls in this sprint.

## DocumentContextPanel Contract

Extract only if a controlled wrapper demonstrably clarifies the contextual
panel boundary. It may own the section/header/tab/action presentation, but:

- `App.vue` continues to own the `contextView` value and sets its initial
  value when the active document changes.
- `App.vue` owns `previewFrame`, `bindPreviewFrame`, preview tokens, identity,
  iframe load handling, preview scheduling, and all RPC calls.
- A `preview` slot retains the iframe in the shell, preserving its ref and
  lifecycle. `inputs` and `data` slots retain current mapped-data and editor
  callbacks.
- Pause/resume, refresh, export, report-settings, tab changes, and declaration
  navigation are typed events routed back to existing shell functions.
- Preserve section/iframe roles, labels, `preview-pane`, `context-tabs`,
  header/action classes, and view-state behavior.

If the slot-based boundary adds more indirection than it removes, do not
extract this wrapper in Sprint 103; record the reason and leave the contextual
template in `App.vue`. This does not block the required runtime extraction.

## Explicit Non-Ownership

Extracted components must not:

- call the desktop RPC client or desktop service directly;
- change active-document selection, project generation, request identity,
  job freshness, cancellation, preview scheduling, or filesystem mutation;
- introduce explorer/command/resizer/runtime-docking features assigned to
  later sprints;
- maintain a second copy of shell-owned state or issue duplicate callbacks.