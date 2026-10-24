# OpenAMX V0.17 Master Sprint Plan

## Problem and Proposed Approach

The desktop workbench has accumulated substantial shell, project, editor,
preview, layout, and runtime behavior in `desktop-app/src/mainview/App.vue`.
Some surrounding panels are already separate components, but the shell remains
large and panel-local workflows are difficult to maintain independently.
There are also user-facing gaps in initial document activation, project
exploration, command-palette keyboard use, and panel resizing/runtime controls.

V0.17 will be a desktop-only refactoring and UX-quality version. It will
preserve the current workbench layout, visual style, and panel behavior while
giving the shell and panels clearer ownership. `App.vue` will remain the
application shell and owner of project/RPC orchestration; panel presentation
and local interaction state will move into focused subcomponents. The version
will also ensure initial analysis/highlighting and preview run for the active
AMX document after project open or restoration, improve project-explorer
operations and command-palette keyboard navigation, and replace custom
workbench resizing with a suitable resizable component where it preserves
expected behavior.

The runtime panel will remain at the bottom. V0.17 will remove its Bottom/Right
relocation controls and obsolete docking behavior while retaining its current
runtime functionality. This deliberately overrides the earlier V0.6
bottom-or-right docking requirement for V0.17; the V0.6 contract remains
unchanged as the historical record.

V0.17 planning may proceed while V0.16 closeout is pending. Implementation
starts at Sprint 102 only after V0.16 Sprints 100 and 101 are closed. This plan
records scope and does not authorize implementation, release, or publication.

## Confirmed Product Decisions

- **Product surface:** Change the desktop app only. Do not change AMX language
  semantics or add VS Code features unless a required desktop integration
  dependency is identified and separately approved.
- **Refactor boundary:** Keep project/RPC orchestration in `App.vue`; extract
  panel presentation and panel-local interaction state. Preserve the existing
  workbench appearance and behavior except for the improvements listed here.
- **First-load behavior:** Initialize the active AMX document after project
  open, reopen/restore, and recovery restore. Initialize analysis/highlighting
  and preview once, and honor the user's preview-paused state.
- **Explorer scope:** Retain search and adopt the V0.6 project-operation set:
  create, duplicate, rename/move, delete to trash, restore/empty trash, reveal,
  and open where applicable. Use an action menu and file/folder context menus;
  support drag-and-drop moves and renaming while preserving existing
  transactional and filesystem safeguards.
- **Explorer count:** Show whole-project folder and file totals separately in
  `folders/files` order, for example `5/20`.
- **Command palette:** Preserve the Commands button, Ctrl+Shift+P, filtering,
  click execution, Help and Settings buttons, and focus restoration. Up/Down
  stops at list ends; opening or changing the filter selects the first enabled
  result. Enter/Return runs the selected enabled command.
- **Resizing:** Prefer shadcn-vue `Resizable` if it preserves layout bounds,
  keyboard adjustment, persisted sizing, and responsive behavior. An
  equivalent implementation is acceptable if the technical gate finds a
  behavior or accessibility regression.
- **Runtime panel:** Keep it fixed at the bottom and remove relocation controls
  and state. Preserve all current runtime content and actions, including Run
  Active Document and Show/Hide Details.
- **Sequencing:** Number V0.17 from Sprint 102. Planning is independent of
  V0.16 closeout; implementation is gated on V0.16 Sprints 100-101.

## Recommended Approach

- Start with a desktop UX contract and technical gate. Translate the brief and
  confirmed decisions into observable acceptance cases before structural
  changes, including file/folder action mapping, drag/drop collision behavior,
  activation paths, focus handling, resizing limits, and runtime content.
- Refactor the shell in a behavior-preserving sprint before adding new panel
  interactions. Keep cross-panel orchestration and RPC coordination in the
  shell; put panel rendering and panel-specific interaction state with the
  owning components. Avoid extracting abstractions that do not clarify
  ownership.
- Route all initial active-document paths through one activation workflow, or
  a shared initialization step, so project open, restored sessions, recovery,
  and user-selected file changes receive consistent analysis and preview
  behavior. Preserve preview pause, cancellation, request identity, and
  freshness protections.
- Implement explorer affordances on top of the existing project-operation
  safeguards. Treat rename/move operations, including drag-and-drop, as the
  same validated operation; do not create a less-safe alternate mutation path.
  Keep search and whole-project counts independent of filtered display.
- Add command navigation as part of the palette's existing filter and execute
  flow. Keep selection synchronized with filtered results, skip disabled
  commands, and ensure keyboard execution shares the same command-run path as
  mouse execution.
- Replace the three custom workbench resize dividers only after verifying the
  candidate component against existing sizing, keyboard, persistence, and
  responsive requirements. Remove runtime docking state only after confirming
  no remaining user-facing path depends on it.
- Preserve all current panel functionality through focused component/UI tests
  and integrated desktop acceptance. Record native-host verification limits
  explicitly; do not infer platform certification.

## Confirmed Scope

### Workbench Shell and Panel Refactor

- Keep `App.vue` as the core application shell and owner of project/RPC
  orchestration.
- Split panel presentation and panel-local interaction state into focused
  subcomponents where that clarifies ownership and reduces the shell's
  responsibility.
- Preserve current layout, visual style, panel behavior, command/help/settings
  controls, editor and preview behavior, and runtime functionality except for
  the explicitly approved changes in this plan.
- Define and test component ownership and event/state boundaries before
  implementing the new explorer and runtime interactions.

### First-Load Analysis and Preview

- Initialize editor analysis/highlighting and preview for the active AMX file
  once after opening a project, restoring/reopening a project, or restoring
  recovery state.
- Use the same initialization behavior as selecting a file, without causing
  duplicate initial runs.
- Respect preview pause and do not run AMX preview for non-AMX active
  documents.
- Preserve active-document identity, cancellation, freshness, stale-result,
  and preview error behavior.

### Project Explorer

- Retain the Search files field and hierarchical project listing.
- Replace the row of top-level actions with a compact action menu and provide
  appropriate file and folder context menus.
- Support drag-and-drop moves and file/folder rename through the existing
  project-operation authority; remove the redundant Move/Rename button.
- Cover create, duplicate, rename/move, delete to trash, restore/empty trash,
  reveal in the system file manager, and open where applicable, consistent
  with the V0.6 project-operation contract.
- Preserve project containment, import rewrite transactions, collision
  handling, open-tab behavior, external-change detection, and confirmation
  requirements.
- Keep the count at the top-right and show whole-project folder/file totals in
  `folders/files` order, independent of search filtering.

### Command Palette

- Preserve opening through the Commands button and Ctrl+Shift+P, searchable
  command filtering, availability/disabled reasons, click-to-run behavior, and
  focus restoration.
- Support Up/Down selection with a clear visual highlight. Stop at the first
  and last enabled results rather than wrapping; select the first enabled
  result when the palette opens or its filter changes.
- Run the selected enabled command on Enter/Return. Keep disabled commands
  unavailable to both mouse and keyboard execution, and retain the current
  empty-results state.
- Keep the existing Help and Settings buttons unchanged.

### Resizing and Runtime Panel

- Replace custom resize bars for the left, center, and right workbench panels
  with shadcn-vue `Resizable` when the Sprint 102 technical gate confirms
  behavior parity; otherwise use an equivalent accessible implementation.
- Preserve useful minimum panel sizes, persisted dimensions, keyboard
  adjustment, and responsive behavior.
- Keep the runtime panel fixed at the bottom. Remove Bottom/Right controls,
  relocation behavior, and state that is no longer used.
- Retain all current runtime panel actions and content, including Run Active
  Document and Show/Hide Details.

### Tests and Acceptance

- Add focused tests for component boundaries and preservation of existing
  panel behavior, first-load/restoration, explorer workflows, command
  keyboard interaction, resizing, and runtime behavior.
- Verify that initial analysis and preview occur once for eligible active AMX
  documents, preview pause is honored, and stale/cancelled work cannot replace
  current results.
- Verify explorer search, whole-project counts, file/folder action menus,
  drag/drop, rename/move, operation safeguards, and supported create,
  duplicate, delete/trash, restore, reveal, and open workflows.
- Verify palette mouse and keyboard execution, selection boundaries, disabled
  commands, filter changes, empty results, shortcut opening, and focus
  restoration.
- Verify resizable panel bounds and keyboard operation at the established
  minimum workbench size and a larger desktop viewport; verify runtime
  run/details/results behavior without relocation controls.
- Run focused desktop typecheck/build and applicable UI/RPC tests, followed by
  the approved integrated verification gate after V0.16 closeout. Record
  failures and platform limitations accurately.

## Explicit Exclusions

- New AMX syntax, language semantics, standard-library behavior, or changes to
  the CLI and VS Code extension.
- Broad visual redesign, new workbench modes, or unrelated changes to editor,
  preview, renderer, export, settings, or project behavior.
- Removal of runtime functionality beyond its Bottom/Right relocation
  controls and obsolete docking state.
- Changes to the historical V0.6 product UX contract; V0.17 records the
  bottom-only runtime decision as a version-specific override.
- Release engineering, publication, package/version changes, platform
  certification, or changes to historical sprint records/status.

## Sprint Sequence

Continue after V0.16 Sprints 100-101, beginning with Sprint 102. Planning may
proceed before V0.16 closeout, but V0.17 implementation is gated on that
closeout.

### Sprint 102: Desktop UX Contract and Technical Gate

- Translate the approved feature brief and product decisions into executable
  acceptance cases for shell/component ownership, first-load activation,
  explorer actions and menus, command navigation, workbench resizing, and
  runtime behavior.
- Define the action placement and contents for the explorer action menu and
  file/folder context menus, drag/drop targets and collision handling, rename
  and move safeguards, and count presentation.
- Specify activation behavior for project open, reopen/restore, and recovery,
  including paused preview, non-AMX documents, and exactly-once
  initialization.
- Evaluate shadcn-vue `Resizable` against existing panel bounds, persisted
  sizes, keyboard adjustment, and responsive layout; record the chosen
  implementation path.
- Record the bottom-only runtime decision as a V0.17 override to the V0.6
  contract. Define the runtime content/actions that must remain available.
- Establish focused component, RPC, and UI verification coverage before
  implementation begins.

### Sprint 103: Workbench Shell and Component Refactor (depends on Sprint 102)

- Keep `App.vue` as the shell and owner of project/RPC orchestration while
  extracting panel presentation and panel-local interaction state into
  focused components.
- Preserve the existing workbench layout, visual style, and behavior; avoid
  adding new explorer, command, or runtime interactions in this sprint.
- Add or update focused tests that establish component boundaries and guard
  existing panel workflows.

### Sprint 104: First-Load Initialization (depends on Sprint 103)

- Unify active-document initialization for project open, reopen/restore,
  recovery restore, and file selection so active AMX analysis/highlighting and
  preview start consistently.
- Ensure initialization occurs once, honors preview pause, and does not
  preview non-AMX files.
- Preserve cancellation, request identity, stale-result rejection, and
  existing preview freshness behavior; add focused UI/RPC regression tests.

### Sprint 105: Project Explorer Workflows (depends on Sprint 103)

- Keep search and the hierarchical listing; replace the top action row with a
  compact action menu and add file/folder context menus.
- Add drag-and-drop moves and file/folder rename, using the same safe project
  operation paths and transaction rules as menu actions.
- Cover the V0.6 project-operation set, including create, duplicate,
  rename/move, delete/trash, restore/empty trash, reveal, and open where
  applicable; remove the redundant Move/Rename button.
- Display whole-project folder/file totals as `folders/files` and retain the
  values while the search filter changes.
- Add focused explorer/UI/RPC coverage for action availability, operations,
  collision/confirmation behavior, and safeguards.

### Sprint 106: Command Palette Navigation (depends on Sprint 103)

- Preserve the Commands button, Ctrl+Shift+P, search/filter behavior,
  availability and disabled reasons, click execution, and focus restoration.
- Add visible selection, Up/Down movement that stops at list ends, and
  selection of the first enabled result after opening or filtering.
- Run the selected enabled command on Enter/Return using the existing command
  execution path; preserve disabled and empty-result behavior.
- Add focused keyboard and UI tests for selection, filtering, execution, and
  focus behavior.

### Sprint 107: Resizable Workbench and Runtime Panel (depends on Sprint 103)

- Replace custom left/center/right resize bars with shadcn-vue `Resizable` if
  Sprint 102 confirms it meets the workbench contract; otherwise use the
  approved equivalent.
- Preserve sizing constraints, persistence, keyboard adjustment, and
  responsive minimum-workbench behavior.
- Fix the runtime panel at the bottom, remove Bottom/Right controls and unused
  docking state, and preserve current runtime content/actions.
- Add focused UI tests for resizing and continued runtime run/details/results
  behavior.

### Sprint 108: Integrated Desktop Acceptance and V0.17 Closeout (depends on Sprints 104-107)

- Verify the refactored shell and existing panels alongside all V0.17
  first-load, explorer, command-palette, resize, and runtime requirements.
- Run focused desktop typecheck/build and applicable UI/RPC tests, followed by
  the approved repository verification gate.
- Record exact evidence, unavailable checks, platform limitations, and
  residuals. Closeout adds no new product scope and authorizes no release,
  publication, version change, or certification.

## Relevant Files and Surfaces

- `planning/ideas/desktop-app-features-2.md` — source feature brief.
- `planning/plan-openamxV16MasterSprintPlan.md` — master-plan structure and
  sprint-sequencing precedent.
- `planning/openamxV06ProductUXContract.md` — existing explorer safeguards,
  workbench resizing, and historical runtime docking requirement.
- `planning/decisions.md` — record V0.17 decisions and the V0.16 execution
  gate when the plan is separately approved.
- `desktop-app/src/mainview/App.vue` — shell, orchestration, active-document
  initialization, layout, and runtime state.
- `desktop-app/src/mainview/components/ProjectExplorer.vue` — explorer
  search, grouping, actions, and count display.
- `desktop-app/src/mainview/components/CommandPalette.vue` — command
  filtering and execution; add keyboard selection and navigation here or in a
  focused child component as established by Sprint 102.
- `desktop-app/src/mainview/shell.ts` — shell-level layout and drawer state.
- `desktop-app/tests/ui/preview-freshness.pw.ts` — existing preview freshness
  test precedent; extend or complement with initial-load coverage.
- `desktop-app/tests/ui/` and applicable desktop RPC/component tests — focused
  acceptance for explorer, palette, resizing, and runtime behavior.

## Verification

1. Sprint 102 defines observable contract cases and a technical decision for
   the resizable implementation before implementation starts.
2. Focused desktop tests cover project open, reopen/restore, and recovery;
   exactly-once analysis/highlighting and eligible preview; paused preview;
   active-file switching; and stale/cancelled result rejection.
3. Explorer tests cover search, whole-project `folders/files` counts, menu
   actions, drag/drop, folder targets, rename/move, create/duplicate,
   delete/trash, restore/empty trash, reveal/open, collisions, and existing
   filesystem/import safeguards.
4. Command-palette tests cover mouse and keyboard execution, selection
   boundaries, disabled/no-result states, filter changes, shortcut opening,
   Enter/Return, and focus restoration.
5. Workbench tests cover left/center/right resizing, keyboard adjustment,
   persisted dimensions, minimum sizes, the established minimum and larger
   desktop viewports, and continued runtime run/details/results behavior with
   no relocation controls.
6. Run the focused desktop typecheck/build and relevant UI/RPC suites, then
   the approved integrated gate after V0.16 closeout. Record native-host or
   platform checks that are unavailable; do not imply certification.