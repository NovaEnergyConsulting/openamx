# Sprint 102 Requirements: V0.17 Desktop UX Contract and Technical Gate

## Document Status

Architect-prepared Sprint 102 planning package. These documents define a
candidate contract and technical recommendation for separate review. This
preparation changes no product behavior and is not implementation authority.
Sprint 102 execution requires separate authorization. Sprint 103 and later
implementation remains gated on V0.16 Sprints 100 and 101 being closed.

## Goal

Translate the confirmed V0.17 desktop scope into observable acceptance cases
and resolve the technical path for resizable workbench panels before product
implementation. Establish clear component ownership, first-load activation,
project-explorer operations and safeguards, command-palette keyboard behavior,
panel sizing, and bottom-only runtime requirements. Produce the behavior
authority and test traceability needed by Sprints 103-108.

Sprint 102 is a contract and technical-gate sprint. It adds no product
behavior.

## Authority and Inputs

- Scope and sequencing authority:
  [`plan-openamxV17MasterSprintPlan.md`](../../plan-openamxV17MasterSprintPlan.md).
- Historical explorer, project-operation, accessibility, and layout contract:
  [`openamxV06ProductUXContract.md`](../../openamxV06ProductUXContract.md).
  The V0.17 master plan's bottom-only runtime decision is a version-specific
  override; the V0.6 document remains unchanged.
- Source feature brief:
  [`desktop-app-features-2.md`](../../ideas/desktop-app-features-2.md).
- Current implementation surfaces named in the master plan: `App.vue`,
  `ProjectExplorer.vue`, `CommandPalette.vue`, `shell.ts`, desktop RPC/service
  code, and focused desktop UI/RPC tests.
- Sprint 102 artifacts: `blueprint.md`, `desktop-ux-contract.md`,
  `resizable-technical-gate.md`, `requirement-test-matrix.md`,
  `acceptance.md`, `builder-evidence.md`, and `handoff-prompt.md`.

## In Scope

- Define observable shell/component ownership and behavior-preservation
  boundaries before extraction.
- Specify exactly-once initial active-AMX analysis/highlighting and preview
  behavior for project open, recent-project reopen/restore, recovery restore,
  and user-selected document activation. Define pause, non-AMX, cancellation,
  request identity, and stale-result cases.
- Define explorer action-menu contents; file and folder context actions;
  create, duplicate, rename/move, trash, restore, empty-trash, reveal, and open
  behavior; drag/drop targets; collision handling; and whole-project counts.
- Resolve how folder rename/move can use trusted project-operation authority
  while preserving containment, open-tab, external-change, and AMX import
  transaction safeguards. The current file-only move API is a known design
  boundary that must not be bypassed in the renderer.
- Specify command-palette selection, filtering, Up/Down boundaries, disabled
  commands, Enter/Return execution, and focus restoration.
- Evaluate shadcn-vue `Resizable` against current workbench limits,
  per-project persistence, keyboard adjustment, focus modes, and responsive
  layout. Record the chosen path and its evidence or blocker.
- Record the V0.17 bottom-only runtime override and preserve the complete
  runtime content/action set.
- Establish stable acceptance IDs and map each to the downstream owner sprint
  and a focused component, RPC, or UI verification surface.

## Out of Scope

- Product source, test behavior, dependency, generated output, or application
  configuration changes.
- Implementing or prototyping the new explorer, keyboard navigation,
  initialization, resizing, or runtime behavior in production code.
- AMX language, CLI, VS Code, export, settings, preview-renderer, or broad
  visual redesign changes.
- Updates to `planning/state.md`, `planning/decisions.md`,
  `planning/questions.md`, `planning/STATUS.json`, the V0.17 master plan, or
  historical sprint records as part of this preparation.
- Release engineering, publication, package/version changes, or platform
  certification.

## Constraints and Gates

- Treat the V0.17 master plan's Confirmed Product Decisions and Confirmed
  Scope as fixed boundaries. Label additional interaction details as proposed
  until Sprint 102 receives a separate contract disposition.
- Planning and Sprint 102 contract work may proceed while V0.16 closeout is
  pending. Product implementation in Sprint 103 onward may not start until
  V0.16 Sprints 100 and 101 are closed.
- Keep project/RPC orchestration and trusted mutation authority in the shell
  and desktop service. Extract presentation and panel-local state only where
  ownership becomes clearer; do not move filesystem authority into Vue
  components.
- Keep all active-document results bound to the current canonical document,
  project generation, revision, input/settings revision, and job identity.
  Initial activation must not run the explicit runtime `Run Active Document`
  command implicitly.
- Route menu and drag/drop mutations through the same validated service
  operation. Reject unsafe or colliding destinations without overwriting,
  merging, or silently renaming existing content.
- Persist panel sizing using the existing per-project session/RPC authority;
  do not rely on a global `localStorage` splitter layout that would override
  project-specific sizes.
- Preserve keyboard access, visible focus, accessible names, and the
  established 1024x720 minimum workbench behavior. Do not claim formal WCAG or
  native-platform certification.
- A technical recommendation is not a product disposition. Record unresolved
  folder-operation or resizer limitations with owners and downstream impact;
  block affected implementation until the contract is explicitly resolved.