# Sprint 105 Acceptance Criteria

Sprint 105 is ACCEPTED/CLOSED on 2026-10-25 only against the explicitly
amended file-only V0.17 scope. This disposition does not accept the broader
V0.17 explorer master-plan scope or authorize complete-tree folder mutations.

## Explorer Behavior

- Search and hierarchical listing remain available.
- Whole-project folder/file counts show `folders/files`, remain independent
  of the search filter, and match the service's visibility policy.
- The approved compact action menu and file/folder context menus expose only
  applicable, separately dispositioned actions. Keyboard context invocation
  is supported.
- Supported file create/duplicate/move/trash/restore/open/reveal actions use
  the trusted service boundary. Empty Trash requires explicit confirmation.
- File drag/drop onto a folder invokes the same safe file move operation as
  the menu. Invalid targets and collisions do not mutate the project.
- AMX move/import rewriting, current-buffer revisions, disk-hash conflict
  detection, collision handling, rollback, open-tab retargeting, dirty-tab
  resolution, deletion/import impact, and safe restore are verified.
- Reveal/open uses a project-scoped revalidated RPC or is omitted only after
  the relevant requirement is separately dispositioned. The renderer has no
  unrestricted native path access.

## Folder-Operation Decision

- Product-owner disposition deferred folder duplicate, rename/move,
  folder-tree drag/drop, trash, and restore from V0.17 to the product-owner
  backlog; target version is uncommitted. Empty-folder creation and file drop
  onto a folder remain supported.
- S105-FOLDER-01/02 remain DEFERRED/BLOCKED and are not PASS. Full V0.17
  explorer master-plan acceptance is not claimed. Any future folder mutation
  requires its own approved API/transaction and exact implementation/test
  plan before edits.

## Verification and Boundaries

- `operation-test-matrix.md` file cases are covered by focused Playwright and
  desktop RPC/service tests. Failure cases assert filesystem and tab state,
  not merely an error string.
- Desktop typecheck and applicable UI/RPC tests run with outputs isolated in
  Sprint 105-specific paths; record any wrapper/fallback differences exactly.
- `git diff --check` and exact file/output inventory pass.
- No language semantics, command-palette keyboard navigation, resizer choice,
  runtime docking, release/version/package behavior, publication, or platform
  certification changes are included.
- `builder-evidence.md` records exact commands/results, the folder deferral,
  residuals, and the amended-scope acceptance. A Trash restore failure is
  surfaced, but the dialog temporarily hides the list until reopened; the
  underlying item remains intact. This UX follow-up is assigned to Sprint 106.
  No Sprint 106-108 execution or release authority is inferred.