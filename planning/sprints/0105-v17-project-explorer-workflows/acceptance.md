# Sprint 105 Acceptance Criteria

Sprint 105 is complete only against an explicitly dispositioned scope. The
current approved evidence supports file-level operations and empty-folder
creation; it does not authorize complete-tree folder mutations.

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

- A separate product-owner disposition resolves the folder-operation gate
  before any folder duplicate/move/drop/trash/restore implementation.
- If the whole-tree contract is approved, the exact RPC/DTO/transaction and
  test file plan is separately approved before edits. S105-FOLDER-01/02 must
  then pass.
- If the scope is narrowed or deferred, the amendment identifies every
  folder action not shipped and its residual owner. Do not imply full V0.17
  explorer acceptance from a file-only implementation.
- If the folder decision is still open, Sprint 105 cannot be accepted as
  complete against the full master-plan scope; a file-only partial disposition
  must be explicit.

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
- `builder-evidence.md` records exact commands/results, open folder gate,
  residuals, and recommendation. Separate product-owner acceptance is
  required; no Sprint 106-108 or release authority is inferred.