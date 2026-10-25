# Sprint 105 Requirements: V0.17 Project Explorer Workflows

## Document Status

Architect-prepared Sprint 105 planning package. It defines candidate
interactions, file-operation safeguards, tests, and an unresolved folder
decision. It does not authorize implementation. Obtain separate Sprint 105
execution authorization and approval of the exact source/test/output plan
before editing.

Sprint 104 is ACCEPTED/CLOSED on 2026-10-25. Sprint 102's overall contract
was ACCEPTED/CLOSED, but its evidence explicitly leaves the folder-operation
contract pending a separate product-owner disposition. Sprint 105 folder
duplicate/move/trash/restore and folder drag/drop remain blocked until that
decision is closed or the approved scope is amended. File-level workflows
may be planned independently.

## Goal

Make the project explorer's existing hierarchy and search more actionable
through a compact action menu, file/folder context menus, safe file drag/drop,
and whole-project folder/file counts. Reuse existing project-operation
authority and preserve containment, import rewrite, collision, tab, disk
conflict, trash, and recovery safeguards. Do not weaken safeguards to make a
menu action or drag operation succeed.

## Authority and Inputs

- Scope and sequencing authority:
  [`plan-openamxV17MasterSprintPlan.md`](../../plan-openamxV17MasterSprintPlan.md).
- Accepted V0.17 explorer contract and unresolved folder gate:
  [`desktop-ux-contract.md`](../0102-v17-desktop-ux-contract-technical-gate/desktop-ux-contract.md),
  especially `S102-EXP-01` through `S102-EXP-11` and section 3.5.
- Sprint 102 closeout and folder-operation blocker:
  [`builder-evidence.md`](../0102-v17-desktop-ux-contract-technical-gate/builder-evidence.md).
- Current implementation: `desktop-app/src/mainview/components/ProjectExplorer.vue`,
  `desktop-app/src/mainview/App.vue`, `desktop-app/src/shared/rpc.ts`,
  `desktop-app/src/bun/desktopService.ts`, and `desktop-app/src/bun/index.ts`.
- Existing verification: `desktop-app/tests/ui/project-explorer-paths.pw.ts`,
  `desktop-app/tests/rpc-contract-check.ts`, and the existing Playwright/Vite
  workflow harness.
- Sprint 105 artifacts: `blueprint.md`, `explorer-contract.md`,
  `operation-test-matrix.md`, `folder-operation-gate.md`, `acceptance.md`,
  `builder-evidence.md`, and `handoff-prompt.md`.

## In Scope

- Keep project search and hierarchical listing.
- Show whole-project folder and file totals separately in `folders/files`
  order, independent of the search filter.
- Replace the current row of explorer actions with the separately approved
  compact action menu. Provide file and folder context menus with pointer and
  keyboard invocation.
- Support supported file create/duplicate/rename/move, delete-to-trash,
  restore/empty-trash, open, and reveal workflows where approved and
  technically available.
- Support drag/drop moves for files onto visible folder targets through the
  same validated file-move service path as menu actions.
- Remove the redundant standalone Move/Rename button after an equivalent
  menu/context action is available.
- Add focused explorer UI and desktop RPC/service tests for menu availability,
  operation success/failure, collisions, confirmations, and safeguards.
- Treat native open/reveal as a trusted service operation. No arbitrary
  filesystem path, direct Node/Bun API, or `openPath`/`revealPath` capability
  is exposed to the webview.

## Folder Mutation Gate

The approved V0.17 scope mentions folder rename/move and the V0.6 operation
set includes folder-capable workflows. However, Sprint 102 evidence states
that no service-owned folder duplicate/move/trash/restore API or folder trash
DTO exists, and explicitly blocks those variants pending separate
disposition. This Sprint 105 package does not decide or silently narrow that
scope.

Until a separate product-owner disposition accepts the whole-tree safeguards
in `folder-operation-gate.md` or approves a scope amendment:

- do not expose folder Duplicate, Rename/Move, folder drag/drop, Delete to
  Trash, or folder Restore;
- do not implement renderer-side directory mutations;
- do not report Sprint 105 as fully accepted against the master plan's folder
  requirements;
- file operations and creation of a new empty folder may proceed only within
  the separately approved Sprint 105 plan.

## Out of Scope

- Active-document initialization (Sprint 104, already closed).
- Command-palette keyboard navigation (Sprint 106).
- Replacing workbench dividers, changing panel-size persistence, or removing
  runtime docking (Sprint 107).
- New collaboration, external-project operations, symlink support, arbitrary
  filesystem access, new AMX semantics, CLI/VS Code changes, or broad visual
  redesign.
- Release, publication, package/version changes, platform certification, or
  updates to planning status/decision ledgers.

## Constraints and Gates

- Keep mutations in the trusted desktop service. ProjectExplorer emits typed
  user intents; it does not call the filesystem or construct OS paths.
- Use the existing file operations as the authority: `createProjectFile`,
  `createProjectFolder`, `duplicateProjectFile`, `moveProjectFile`,
  `deleteProjectFile`, `listTrash`, `restoreTrash`, and `emptyTrash`.
- File moves use the current transaction path for AMX import rewrites,
  current-buffer contents, disk-hash checks, collision rejection, rollback,
  and open-tab retargeting. Menu and drag/drop must not fork this behavior.
- Reject collisions. Do not overwrite, merge, or silently auto-rename. Same
  path is a no-op; case-only changes must be staged safely or rejected.
- Dirty/conflicted open documents and externally changed files require clear
  resolution before a destructive/move operation. A failure leaves files,
  imports, tabs, and active selection unchanged.
- Search filters visible rows only. Counts are computed from the full
  service-returned file/folder arrays and use the same hidden/ignored/symlink
  policy as `listProjectFiles`.
- Project-file reveal/open requires a narrow service/RPC boundary that
  revalidates the item under the current project root. Existing native helper
  functions used for export IDs are not a renderer capability.
- Any RPC/service change, folder-scope disposition, or extra file path needs
  separate approval before implementation.