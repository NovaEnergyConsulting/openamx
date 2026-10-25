# Sprint 105 Folder-Operation Gate

## Status

**DEFERRED FROM V0.17.** On 2026-10-25, the product owner deferred folder
duplicate, rename/move, folder-tree drag/drop, trash, and restore to the
product-owner backlog with no target version committed. Empty-folder creation
and file-to-folder drop remain in V0.17. No folder mutation implementation
or weaker transaction is approved. Any future folder work requires its own
scope/API decision and exact implementation/test plan.

## Confirmed Current Service Boundary

- `createProjectFolder` creates one empty folder under an existing contained
  parent.
- `listProjectFiles` returns visible relative file and folder paths while
  omitting hidden/internal entries, symlinks, and ignored directories.
- `duplicateProjectFile`, `moveProjectFile`, `deleteProjectFile`,
  `listTrash`, and `restoreTrash` operate on regular files. `TrashItem` is
  typed using file kinds; restore rejects non-regular payloads.
- AMX file move already preflights current buffers and dependent module files,
  rewrites imports transactionally, rejects stale disk content/collisions,
  rolls back failed commits, and retargets open tabs after success.
- No renderer filesystem mutation is acceptable.

## Candidate Whole-Tree Contract Requiring Approval

If the product owner approves folder mutations, every folder operation must
be implemented as a trusted service transaction over one complete contained
tree:

- Reject hidden/ignored paths, symlinks, outside-root paths, self-descendant
  destinations, unsupported entries, and any target collision. Never merge,
  overwrite, or silently rename.
- Folder duplicate preflights and copies the complete tree. Either preserve
  all AMX relative-import resolution under a reviewed rewrite contract or
  reject the destination before writing any part of the duplicate.
- Folder move/rename accounts for all descendant AMX imports whose relative
  path changes and all inbound imports from outside the tree. Use current
  open-buffer revisions only after dirty/conflicted tabs are resolved.
- Preflight every affected file revision/disk hash, tab, import, source,
  destination, and parent before commit. Commit the tree move and every import
  update atomically or roll back all changes. Open tabs retain identity and
  are retargeted only after commit.
- Folder trash moves the complete tree as one trash item and safely handles
  open/dirty/conflicted descendants and import impacts. `TrashItem` must
  represent a folder without losing its original path/kind.
- Folder restore preflights every descendant destination, parent, collision,
  and symlink. Restore all descendants or none; never partially restore or
  overwrite.
- Empty Trash requires confirmation and removes folder/file payloads only
  through the trusted service.

These are proposed safeguards from the accepted Sprint 102 contract, not an
approved API design. Exact operation API/DTO, transaction design, import
semantics, tab behavior, and test scope require a separate disposition.

## Decision Options

**Selected disposition (2026-10-25):** Option 2, narrowed V0.17 scope. Folder
duplicate, rename/move, tree drag/drop, trash, and restore are deferred to the
product-owner backlog; target version is uncommitted. Empty-folder creation
and file-to-folder drop remain supported. This records no execution authority
for a later sprint.

1. **Approve whole-tree folder operations:** approve this contract and a
   detailed service/RPC design. Sprint 105 then requires a separately amended
   exact file plan including shared RPC types, desktop service, UI, and RPC
   tests before code changes.
2. **Approve narrowed V0.17 scope:** explicitly defer folder duplicate,
   rename/move, drag/drop, trash, and restore; retain empty-folder creation
   and file drop-to-folder. Record the version-scope amendment and residual
   owner. This is not implied by the current contract.
3. **Defer Sprint 105 folder work:** proceed only with an explicitly
   dispositioned file-only slice, or hold the sprint if the owner requires
   complete master-plan scope for acceptance.

## Gate Exit Criteria

- Separate product-owner disposition recorded in `planning/decisions.md` and
  this gate.
- Approved behavior identifies exactly which folder actions ship in V0.17
  and whether folder drag/drop is supported.
- Approved typed RPC/DTO and atomic transaction design exists if any folder
  mutation ships.
- Any future folder implementation requires separate exact implementation,
  test, and output paths approved before product edits.

## Blocked Test Cases

| ID | Required evidence after disposition |
| --- | --- |
| `S105-FOLDER-01` | Approved whole-tree duplicate/move/drop behavior, including complete-tree preflight, descendant and inbound import handling, collision/external-change safeguards, open tabs, rollback, and atomic service/RPC tests. |
| `S105-FOLDER-02` | Approved folder trash/restore behavior, typed trash representation, all-descendant collision/missing-parent checks, atomic tree restoration, and empty-trash confirmation. |