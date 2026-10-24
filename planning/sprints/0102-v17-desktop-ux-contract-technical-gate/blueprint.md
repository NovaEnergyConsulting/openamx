# Sprint 102 Blueprint: V0.17 Desktop UX Contract and Technical Gate

## Approach

1. Obtain separate Sprint 102 execution authorization. The authorized work is
   limited to this sprint folder; Sprint 102 is planning-only and does not
   require V0.16 closeout, but implementation in Sprint 103 onward does.
2. Reconcile the V0.17 master plan, the historical V0.6 UX contract, and the
   desktop feature brief. Keep confirmed decisions distinct from proposed
   interaction details and unresolved technical questions.
3. Record a source-grounded baseline for the shell, activation paths,
   explorer operations, panel layout/persistence, and runtime docking. Read
   only the controlling call paths and focused test surfaces needed to settle
   the contract.
4. Complete `desktop-ux-contract.md` with stable case IDs and observable
   outcomes for:
   - component ownership and behavior-preserving refactoring;
   - initial analysis/highlighting and preview on project open, restore,
     recovery, and user selection;
   - explorer menus, file/folder operations, drag/drop, collisions, trash,
     reveal/open, and whole-project counts;
   - command-palette selection and keyboard execution;
   - resizable bounds, persistence, keyboard operation, focus modes, and
     responsive behavior;
   - bottom-only runtime placement and retained functionality.
5. Resolve the explorer operation boundary. Specify which source operations
   already exist, how file moves preserve import transactions and open-tab
   state, and the service-owned operation required for folder rename/move.
   If a folder transaction cannot meet the safeguards, record the narrowest
   safe alternative and obtain disposition before Sprint 105.
6. Complete `resizable-technical-gate.md`. Verify the exact installed
   shadcn-vue/Reka UI capabilities and compare them with the existing project
   dimensions, sizing constraints, `setPanelSizes` persistence, keyboard
   semantics, and responsive CSS. Record a go/no-go recommendation and the
   evidence required before Sprint 107.
7. Complete `requirement-test-matrix.md`. Ensure every confirmed master-plan
   requirement maps to one or more contract cases, downstream sprint owner,
   and focused verification surface. Do not claim tests passed when the
   sprint only defines their cases.
8. Record evidence, decisions, blockers, residual owners, and recommendation
   in `builder-evidence.md`; request a separate contract disposition before
   Sprint 103-107 product work begins.

## Sprint 102 Artifact Set

- `desktop-ux-contract.md` — proposed normative interactions and stable
  acceptance case IDs.
- `resizable-technical-gate.md` — source/dependency baseline, candidate
  comparison, recommendation, and required local proof.
- `requirement-test-matrix.md` — traceability from confirmed requirements to
  acceptance cases and downstream implementation/test owners.
- `acceptance.md` — completion and disposition criteria for Sprint 102.
- `builder-evidence.md` — exact review/check log; unrun work remains NOT RUN.
- `handoff-prompt.md` — bounded instructions for separately authorized
  Sprint 102 execution.
- `requirements.md` — authority, scope, exclusions, and gates.

## Source-Grounded Baseline

- `App.vue` already has a shared `activate` path that sets AMX context,
  requests static analysis/highlighting, and schedules live preview. Project
  open, recent restore, and recovery restore currently load/select the active
  document through separate paths instead of consistently calling it.
- `ProjectExplorer.vue` currently retains search and hierarchical grouping,
  shows one combined file/folder total, and exposes New AMX, New CSS, New
  folder, and Move/Rename actions. It has no file/folder context menus or
  drag/drop.
- The desktop service owns create/duplicate/file-move and trash/list/restore/
  empty operations. Duplicate, move, trash, and restore currently operate on
  files; the trash DTO cannot represent folders. File move validates
  containment and performs AMX import rewrites transactionally. There is no
  complete service-owned folder duplicate/move/trash/restore operation.
- The workbench uses two custom vertical dividers for three columns. Current
  constraints are explorer 160-400 px, context pane 25-65%, and a 260 px
  minimum editor/context track. Panel sizes are stored per recent project via
  `setPanelSizes`.
- Responsive CSS switches to a stacked layout at 900 px and hides the custom
  dividers. Focus modes also hide panes and must remain compatible with any
  resizable group.
- Runtime docking is held in `App.vue`, `shell.ts`, Preferences, local storage,
  and layout CSS. Runtime currently has Run, Cancel, Details, status/stage,
  progress, cleanup-pending message, export status/output actions, diagnostics,
  and result summaries.
- `desktop-app/package.json` already declares shadcn-vue and Reka UI; no local
  `components/ui/resizable` source component is present. Reka UI documents
  keyboard support, min/max sizing, pixel sizing, and layout events. Its
  default auto-save is local-storage based, which is not the required
  per-project persistence authority.

## Files and Verification Boundary

- This preparation creates documents only under
  `planning/sprints/0102-v17-desktop-ux-contract-technical-gate/`.
- Do not edit production code, tests, dependencies, generated outputs, or
  repository status/decision ledgers under this sprint authorization.
- Sprint 102 acceptance is contract completeness, source/dependency evidence,
  traceability, and an explicit technical recommendation. Product tests are
  specified, not run as if new behavior existed.
- Finish with a reference/ID audit and `git diff --check` for these documents.

## Notes

Sprint 102 does not authorize product implementation, release, publication,
version changes, or certification. Its disposition does not close V0.16 or
remove the V0.16 Sprints 100-101 implementation gate.