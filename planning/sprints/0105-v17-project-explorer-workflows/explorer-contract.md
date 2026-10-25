# Sprint 105 Project Explorer Contract

## Status and Authority

This is the Architect-prepared Sprint 105 candidate implementation contract
based on V0.17's confirmed scope and Sprint 102's accepted contract. Exact
action-menu placement and file context-menu details still require separate
Sprint 105 disposition. Folder duplicate/move/trash/restore mechanics and
folder drag/drop remain blocked by the separate Sprint 102 folder-operation
decision; this document does not approve them.

## 1. Search and Whole-Project Count

| ID | Observable behavior |
| --- | --- |
| `S105-COUNT-01` | Keep the accessible Search files field and current hierarchical project listing. Search filters visible file/folder groups only. |
| `S105-COUNT-02` | Show separate whole-project folder and file counts, with folders first, for example `5/20`. Accessible text must make the order explicit, such as `5 folders, 20 files`. |
| `S105-COUNT-03` | Counts derive from the complete, unfiltered `listProjectFiles` result and stay unchanged as the search query changes. Do not count the synthetic root group. |
| `S105-COUNT-04` | Count only entries the current project listing exposes: omit hidden/internal paths, `.openamx/trash`, symlinks, and ignored/generated directories; include supported visible outputs if returned by the service. Do not invent a second filesystem scan in the renderer. |

## 2. Top-Level Action Menu

Proposed contents, subject to Sprint 105 product-owner disposition:

| Action | Availability/behavior |
| --- | --- |
| New AMX, CSV, JSON, CSS | Create the selected supported editable file in the project root using `createProjectFile`; file kind/extension and containment are validated by the service. |
| New folder | Create a new empty contained folder using `createProjectFolder`. This creates one folder only; it is not folder duplication or movement. |
| Duplicate active file | Available only for an active contained editable AMX/CSV/JSON/CSS file; preserves extension and uses `duplicateProjectFile`. For AMX files, preserve valid relative-import resolution; if a destination outside the original directory would invalidate imports, safely rewrite the duplicate's imports or reject that destination without changing the source. |
| Rename/Move active file | Available only for an eligible active editable file; uses `moveProjectFile` and existing transactional AMX import rewrite behavior. Removes the redundant standalone Move/Rename button. |
| Open file | Opens the existing file picker/command where appropriate; clicking an explorer file continues to open it in the workbench. |
| Manage Trash | Presents trash items with Restore and an explicit Empty Trash action. Empty Trash requires a clear irreversible-action confirmation. |

Do not place folder Duplicate, Rename/Move, folder Delete, or folder Restore
in the menu while the folder-operation decision is open.

## 3. File Context Menu

Right-click/context-menu key/Shift+F10 on a file exposes actions by kind.
Actions invoke the same shell/service operation paths as the top-level menu.

| File kind | Proposed actions |
| --- | --- |
| Editable contained AMX/CSV/JSON/CSS | Open; Duplicate; Rename/Move; Delete to Trash; Reveal in system file manager. |
| Generated HTML/PDF/DOCX output | Open externally and Reveal only through a trusted project-scoped service action that revalidates the listed item; Delete to Trash only if the approved project policy and service support it. No editor-only actions. |

No native open/reveal action accepts an unrestricted absolute path from the
webview. A project-scoped service/RPC validates the relative item, root,
visibility, file kind, symlink status, and current existence immediately
before invoking native `openPath`/`revealPath`. If that narrow boundary is not
approved/available, omit the action with an explicit technical blocker rather
than calling native helpers directly from the renderer.

## 4. Folder Context Menu and Folder Mutation Gate

Folder context menus may offer New AMX/CSV/JSON/CSS and New folder within the
selected folder, subject to existing service containment checks. Reveal is
available only through an approved, revalidated service boundary. Folder
Duplicate, Rename/Move, drag/drop, Delete to Trash, and Restore are not
available unless a separate disposition accepts the safeguards in
`folder-operation-gate.md` and approves the exact implementation/test paths.

The current service supports empty-folder creation and listing, but its
duplicate, move, trash, restore, and `TrashItem` contract are file-only.
Renderer-side directory operations are never allowed.

## 5. File Operations and Drag/Drop

| ID | Observable behavior |
| --- | --- |
| `S105-FILE-01` | File create, duplicate, move, delete-to-trash, restore, and empty-trash all use the trusted RPC/service handlers. UI affordances do not reimplement operation policy. |
| `S105-FILE-02` | Dragging an eligible file to a visible folder constructs the destination from project-relative paths and calls the same `moveProjectFile` operation as Rename/Move. Preserve original extension and current active/open-tab state. |
| `S105-FILE-03` | Dropping a file onto another file, outside the project, a hidden/ignored folder, its own same path, or an invalid target is rejected/no-op without filesystem or tab changes. File drag/drop cannot start a folder-tree move. |
| `S105-FILE-04` | A collision never overwrites, merges, or silently auto-renames. Case-only changes are staged safely or rejected. Error feedback leaves the source and destination unchanged. |
| `S105-FILE-05` | AMX move preserves the existing import transaction: scan relevant modules, use current open-buffer text, preflight dependent files and disk hashes, rewrite relative imports, commit move and rewrites atomically, roll back on failure, and retarget tabs only after success. |
| `S105-FILE-06` | Duplicate preserves source bytes and does not modify source/importers. If moving an AMX copy to another directory would invalidate relative imports, the service rewrites only the duplicate under a reviewed contract or rejects it without creating a partial copy. |
| `S105-FILE-07` | Delete-to-trash does not permanently remove a file. Dirty/conflicted open tabs require resolution; external disk changes and AMX import dependents receive the approved warning/resolution before deletion. Failed deletion leaves source and tabs unchanged. |
| `S105-FILE-08` | Restore returns the file to its recorded project-relative path only when its original parent exists and no destination collision exists. Restore is atomic and never overwrites. |
| `S105-FILE-09` | Empty Trash requires explicit confirmation and reports success/failure. Cancellation leaves the trash unchanged. |
| `S105-FILE-10` | After any successful operation, refresh the project listing/count and reconcile active/open tabs. A failed/cancelled operation does not clear or retarget the active document. |
| `S105-FILE-11` | Context menus work by secondary pointer action and keyboard context invocation; keyboard users can reach every applicable action without drag/drop. Rejected states have visible text/status and are not communicated only by color. |

## 6. Failure and Confirmation Policy

- Destination collision, invalid extension, invalid/hidden/ignored path,
  outside-project target, symlink, missing parent, or service validation
  failure: do not mutate; display the service error and leave explorer/tabs
  coherent.
- Open document is dirty/conflicted: require the existing save/conflict
  resolution before move/delete. Never silently discard text.
- An AMX file has inbound/outbound imports: preserve transactional rewrite
  behavior for moves. For deletion or duplication, show the approved import
  impact/resolution; do not leave dependent documents silently broken.
- External change or stale disk hash: block the operation until the existing
  conflict is resolved. Do not retry against the new disk contents implicitly.
- Empty Trash: confirm before irreversible removal; cancel is a no-op.
- Native open/reveal unavailable: show the host error and keep the explorer
  state unchanged.

## 7. Open Product Decisions

Before Sprint 105 implementation, separately disposition:

- exact action-menu and file/folder menu placement;
- whether file creation offers CSV/JSON directly in the menu or under a New
  submenu;
- safe AMX duplicate behavior when the destination directory changes;
- delete handling for imported AMX files;
- precise native reveal/open eligibility for generated outputs;
- whether the folder-operation contract is accepted as written, amended, or
  deferred to a later version.

## 8. Test Case Index

| ID | Contract area |
| --- | --- |
| `S105-MENU-01` | Approved top-level action menu and shell handler routing. |
| `S105-MENU-02` | File context-menu pointer/keyboard access and per-kind actions. |
| `S105-MENU-03` | Folder context-menu safe actions while folder mutations remain blocked. |
| `S105-CREATE-01` | Supported editable-file creation and activation/list refresh. |
| `S105-CREATE-02` | Contained empty-folder creation and invalid-target rejection. |
| `S105-DUP-01` | File duplicate content, import validity, and atomic collision rejection. |
| `S105-MOVE-01` | Non-AMX file move/rename validation and collision safety. |
| `S105-MOVE-02` | AMX file move/import transaction and open-tab retargeting. |
| `S105-DND-01` | File drop onto a folder using the existing file-move authority. |
| `S105-DND-02` | Invalid file drop targets and no-mutation behavior. |
| `S105-TRASH-01` | File delete-to-trash and listing/tab reconciliation. |
| `S105-TRASH-02` | Dirty/conflicted/external/import-dependent file deletion safeguards. |
| `S105-TRASH-03` | File restore with missing-parent and collision handling. |
| `S105-TRASH-04` | Empty Trash confirmation, cancellation, and result reporting. |
| `S105-NATIVE-01` | Trusted project-scoped native open/reveal boundary. |