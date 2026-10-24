# Sprint 103 Requirements: V0.17 Workbench Shell and Component Refactor

## Document Status

Architect-prepared Sprint 103 documentation. It defines the candidate scope,
component boundaries, and verification plan; it does not authorize edits.
Sprint 103 implementation remains gated on V0.16 Sprints 100 and 101 being
closed and Sprint 102 receiving a separate contract disposition.

Sprint 102's current builder evidence records the prototype work as complete,
but its contract disposition remains pending and the Resizable technical gate
is open. The resizer path is not needed for Sprint 103, which preserves the
current dividers and docking behavior.

## Goal

Reduce `App.vue`'s responsibility by extracting clear panel presentation and
panel-local interaction state into focused desktop components. Keep
`App.vue` as the application shell and owner of project/RPC orchestration.
Preserve the current workbench layout, visual style, panel behavior, active
document workflows, and all current actions. Add focused component-boundary
and UI regression evidence before new panel interactions are introduced in
later sprints.

Sprint 103 is a behavior-preserving refactor. It adds no user-facing
functionality.

## Authority and Inputs

- Scope and dependency authority:
  [`plan-openamxV17MasterSprintPlan.md`](../../plan-openamxV17MasterSprintPlan.md).
- Candidate behavior and component ownership contract:
  [`0102-v17-desktop-ux-contract-technical-gate/desktop-ux-contract.md`](../0102-v17-desktop-ux-contract-technical-gate/desktop-ux-contract.md).
- Sprint 102 result and open gates:
  [`0102-v17-desktop-ux-contract-technical-gate/builder-evidence.md`](../0102-v17-desktop-ux-contract-technical-gate/builder-evidence.md)
  and
  [`0102-v17-desktop-ux-contract-technical-gate/resizable-technical-gate.md`](../0102-v17-desktop-ux-contract-technical-gate/resizable-technical-gate.md).
- Current desktop source: `desktop-app/src/mainview/App.vue`,
  `desktop-app/src/mainview/components/`, `desktop-app/src/mainview/app.css`,
  and current desktop UI/RPC tests.
- Sprint 103 artifacts: `blueprint.md`, `component-boundaries.md`,
  `behavior-preservation-matrix.md`, `acceptance.md`,
  `builder-evidence.md`, and `handoff-prompt.md`.

## In Scope

- Keep `App.vue` as the shell and owner of project lifecycle, RPC calls,
  active-document and preview identity, commands, cross-panel state, and
  workflow coordination.
- Extract the runtime panel's markup/presentation and local Details expanded
  state into a focused `RuntimePanel.vue`. Pass display data through typed
  props and return user intents through typed events; the component receives
  no RPC client or filesystem capability.
- Extract the contextual-pane frame/actions into a focused component if the
  proposed controlled props and slots preserve the existing preview-frame
  bridge and CSS/DOM behavior without adding a redundant abstraction.
- Preserve and reuse existing panel components such as `ProjectExplorer`,
  `WorkbenchTabs`, `CommandPalette`, `InputsPanel`, and `DataEditorPane`.
- Keep editor/data editor imperative refs and preview lifecycle/bridge in the
  shell unless implementation demonstrates a smaller, typed forwarding
  boundary with no behavior change.
- Add or update focused desktop UI tests to prove component event wiring and
  preservation of existing workbench/panel interactions.
- Adjust `app.css` only as needed to preserve existing panel styles and
  responsive behavior after extraction.

## Out of Scope

- First-load analysis/highlighting or preview changes, including routing
  project-open, recent-restore, and recovery flows through `activate`; those
  belong to Sprint 104.
- Explorer action menus, context menus, file/folder workflows, count changes,
  or drag-and-drop; those belong to Sprint 105.
- Command-palette keyboard selection or execution changes; those belong to
  Sprint 106.
- Replacing the custom resize dividers, changing resize bounds/persistence, or
  selecting the final Reka/shadcn-vue resizer path; those belong to Sprint
  107 and remain subject to Sprint 102's open technical gate.
- Removing Bottom/Right controls, drawer-dock preferences/state, or responsive
  docking CSS; those belong to Sprint 107. Sprint 103 preserves current
  docking behavior.
- New visual design, workbench modes, RPC/service behavior, AMX semantics,
  package/dependency changes, or unrelated cleanup.
- Release engineering, publication, version changes, certification, or
  changes to planning status/decision ledgers.

## Constraints and Gates

- The separately dispositioned Sprint 102 contract governs ownership. If it
  is not accepted or a required boundary is unresolved, stop before
  implementation and request the relevant disposition; do not treat this
  preparation as approval.
- V0.16 Sprints 100 and 101 must be closed before Sprint 103 implementation
  starts. Planning documentation may be prepared in advance.
- Preserve current visual hierarchy, CSS selectors used by UI tests, keyboard
  focus, active selection, scroll behavior, and all current button actions.
- Component children are presentation/interaction boundaries, not RPC
  authorities. Keep mutations, job creation/cancellation, navigation, and
  status/result updates in the shell/service path.
- Do not repair the known first-load gap or remove runtime docking while
  moving markup. Those are deliberately separate owner sprints.
- Do not add a Vue component-test framework. Follow the existing Playwright
  desktop Vite workflow harness and focused RPC-contract tests.
- Record any necessary scope or file-list expansion before editing. Preserve
  unrelated existing worktree changes.