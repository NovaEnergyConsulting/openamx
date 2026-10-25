# Sprint 105 Blueprint: V0.17 Project Explorer Workflows

## Approach

1. Obtain separate Sprint 105 execution authorization and approval of the
   exact source, test, output, and evidence plan. Confirm Sprint 104 is
   ACCEPTED/CLOSED and resolve the Sprint 102 folder-operation blocker before
   authorizing any folder mutation implementation.
2. Record the worktree and inspect `ProjectExplorer.vue`, shell handlers,
   project RPCs/service, `listProjectFiles`, the existing explorer UI test,
   and focused RPC-contract assertions. Preserve unrelated user changes and
   generated outputs.
3. Disposition the action-menu/context-menu placement from
   `explorer-contract.md` before implementation. Keep file actions tied to
   current service methods. Identify exactly which new desktop RPC is needed
   for project-file reveal/external open and approve its service validation
   boundary before adding it.
4. Implement whole-project `folders/files` counts from the unfiltered
   service listing. Keep the search query local to the explorer and ensure
   count values do not change when rows are filtered.
5. Implement approved file actions and file context menu events in
   `ProjectExplorer.vue`; keep orchestration in `App.vue`. Route file
   creation, duplicate, move, delete/trash, and restore through existing
   methods/RPCs. Avoid putting mutation rules in menu handlers.
6. Implement file drag/drop onto visible folder rows by calculating the
   project-relative destination and calling the existing `moveProjectFile`
   path. Reject file targets, outside/hidden targets, self moves, and
   destination collisions before mutation. Keep keyboard-accessible file
   context actions as an alternative to drag/drop.
7. Preserve file-operation safeguards. For AMX moves, retain transactionally
   rewritten imports and open-tab/current-buffer identity. For deletion,
   inspect import dependents and dirty/conflicted tabs and require the
   approved resolution/confirmation before trashing. Restore must fail
   atomically when its original parent is unavailable or the destination
   collides. Empty Trash requires explicit confirmation.
8. Do not implement folder duplicate/move/trash/restore or folder drag/drop
   while the folder-operation disposition is pending. If a separate
   disposition is received, stop and obtain an amended exact file/test plan
   covering the typed RPC/DTOs and atomic whole-tree transaction before code
   edits.
9. Add focused Playwright coverage and service/RPC tests from
   `operation-test-matrix.md`. Verify supported file kinds, menu availability,
   counts while filtering, keyboard context invocation, file drop behavior,
   collisions, import handling, trash/restore, native open/reveal, and
   failure atomicity.
10. Run focused desktop typecheck, explorer UI tests, and RPC-contract tests.
    Preserve exact failures and use new Sprint 105 Playwright output paths.
    Run the broader desktop web build only if separately included in the
    approved output plan.
11. Record exact commands, outcomes, counts, artifacts, residuals, folder
    disposition, and recommendation in `builder-evidence.md`. Request
    separate acceptance; do not update global planning status or infer
    Sprint 106-108/release authorization.

## Candidate File Plan

Expected implementation paths, subject to separate approval:

- `desktop-app/src/mainview/components/ProjectExplorer.vue` — action menu,
  counts, context menus, and file drag/drop presentation/intents.
- `desktop-app/src/mainview/App.vue` — shell-owned event handlers, active
  file operations, confirmation, and listing refresh.
- `desktop-app/src/mainview/app.css` — focused explorer menu/context/drag
  feedback styles only.
- `desktop-app/src/shared/rpc.ts` — only if a project-scoped native
  open/reveal RPC is approved and required.
- `desktop-app/src/bun/desktopService.ts` and `desktop-app/src/bun/index.ts`
  — only for the approved trusted open/reveal boundary or narrowly approved
  file safeguards. No folder mutations without separate disposition.
- `desktop-app/tests/rpc-contract-check.ts` — file operation and approved
  service boundary assertions.
- `desktop-app/tests/ui/project-explorer-workflows.pw.ts` — focused explorer
  UI acceptance, or an approved narrow extension to the existing paths test.
- `planning/sprints/0105-v17-project-explorer-workflows/builder-evidence.md`
  — execution evidence.

Folder DTO/RPC/transaction files are not implicitly included. Approve an
amended exact plan before adding them.

## Proposed Verification

From `desktop-app/`, subject to approval of paths and generated output
isolation:

- `bun run typecheck` (record the wrapper result and any approved direct
  `bunx vue-tsc --noEmit` fallback separately).
- `bun run test:ui -- tests/ui/project-explorer-workflows.pw.ts --output=test-results/sprint105-explorer/`.
- `bun run test:ui -- tests/ui/project-explorer-paths.pw.ts --output=test-results/sprint105-explorer-paths/`.
- `bun run test` to exercise the RPC-contract check if service/RPC operations
  changed; use an approved isolated output/worktree strategy where required.
- `git diff --check` and exact path/output inventory.

## Notes

Folder mutation work remains blocked pending separate disposition. If that
gate is unresolved, either accept only the approved file-scoped portion with
an explicit plan amendment and recorded residual, or defer Sprint 105
implementation; do not call the full master-plan scope complete.