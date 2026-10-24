# Sprint 102 Desktop UX Contract: V0.17

## Status and Authority

This is the Architect-prepared candidate interaction contract for Sprint 102
review. The V0.17 master plan's Confirmed Product Decisions and Confirmed
Scope are authoritative. Details below resolve implementation ambiguity but
remain proposed until a separate Sprint 102 disposition. This document does
not authorize product implementation.

The V0.17 runtime is bottom-only. This version-specific decision overrides
the V0.6 bottom-or-right runtime-drawer requirement without changing the
historical V0.6 contract.

## Authority Markers

- **Confirmed by the V0.17 master plan:** desktop-only scope; shell/RPC
	ownership stays in `App.vue`; the approved first-load activation paths;
	project search and whole-project `folders/files` counts; the V0.6 explorer
	operation set; command-palette keyboard behavior; replacement of the three
	custom dividers only if bounds, persistence, keyboard, and responsive
	behavior are preserved; and a fixed-bottom runtime panel with current
	actions/content retained.
- **Historical V0.6 requirements retained:** 1024x720 minimum workbench;
	editor/context minimum tracks; 160-400 px explorer and 25-65% context
	bounds; keyboard-adjustable splitters; reversible focus modes preserving
	tabs, selection, scroll, sizes, and focus; transactional AMX import
	rewrites; no silent collision overwrite; and resolution of open-tab and
	external-change conflicts before mutation.
- **Candidate proposals, not approved:** exact menu/context-menu contents,
	generated-output action availability, count eligibility details,
	case-only rename handling, folder drag/drop targets, and a service-owned
	complete-tree operation for folder mutations. These details require the
	separate contract disposition.
- **Open blockers:** no service-owned folder duplicate/move/trash/restore API
	exists today. The all-percent Reka prototype passed geometric and responsive
	checks with an in-memory per-project RPC mock, but the actual desktop RPC
	and App.vue integration were not exercised. See section 3.5 and the resizer
	technical gate.

## 1. Shell and Component Ownership

| ID | Observable contract |
| --- | --- |
| `S102-SHELL-01` | `App.vue` remains the application shell and owner of project lifecycle, RPC coordination, active-document identity, cross-panel state, and command orchestration. Extracted panels receive bounded props and emit typed user intents; they do not gain filesystem/RPC authority. |
| `S102-SHELL-02` | Panel-local presentation and interaction state may move into focused components when that makes ownership clearer. No component is extracted solely to reduce line count. |
| `S102-SHELL-03` | The refactor preserves the existing workbench layout, themes, visual density, panel behavior, Help/Preferences/Commands controls, editor/preview behavior, and runtime content except for changes explicitly approved in V0.17. |
| `S102-SHELL-04` | Focus modes, active tabs, scroll behavior, and responsive layout remain coherent across the shell/component boundary. Child actions return focus and status handling to the shell through explicit events. |

## 2. Active-Document Initialization

Initialization means one static AMX analysis request for diagnostics and
highlighting plus one initial preview attempt for the active AMX identity. It
does not mean the explicit runtime `Run Active Document` command.

| ID | Path and expected result |
| --- | --- |
| `S102-ACT-01` | Opening a project with an active AMX document loads and activates that document through the same activation behavior used by selecting a file. Static analysis/highlighting and preview are each initialized once for the current document identity. |
| `S102-ACT-02` | Reopening/restoring a recent project with an active AMX document initializes that active document once after its saved tab/document state is available. |
| `S102-ACT-03` | Restoring recovery state initializes the recovered active AMX buffer, including unsaved text, once. Recovery does not write recovered text to project files as a side effect. |
| `S102-ACT-04` | Selecting or opening a different AMX document uses the same initialization contract. A late result for the previous document cannot replace current analysis, preview, or status. |
| `S102-ACT-05` | When preview is paused at activation, static analysis/highlighting still initializes but no preview job is enqueued. Resuming schedules one current preview; it does not replay duplicate startup requests. |
| `S102-ACT-06` | A non-AMX active document does not request AMX static highlighting or AMX preview. Existing CSV/JSON validation and data-context behavior remain available where applicable. |
| `S102-ACT-07` | Requests remain bound to canonical active URI, project generation, document revision, input/settings revision, and job identity. Superseded/cancelled work cannot commit stale results. Existing preview errors and last-good/stale presentation remain intact. |
| `S102-ACT-08` | Opening, restoring, or recovering a document does not invoke the explicit runtime Run command. Runtime run state changes only through its existing user action or existing approved command. |

## 3. Project Explorer

### 3.1 Count and Search

| ID | Observable contract |
| --- | --- |
| `S102-EXP-01` | Keep the Search files field and hierarchical project listing. Search remains independent of the whole-project count. |
| `S102-EXP-02` | Display folder/file totals in `folders/files` order, for example `5/20`, at the top-right. Provide an accessible name/value that unambiguously says “5 folders, 20 files.” |
| `S102-EXP-03` | Count the complete eligible project listing, not filtered rows. Exclude the synthetic root heading, hidden/internal state, trash, symlinks, and ignored/generated directories according to the existing project-list policy. Include supported visible project files, including generated outputs when the listing includes them. |

### 3.2 Action Placement

The top-level row becomes one compact action menu. Its proposed items are:

| Menu item | Availability and behavior |
| --- | --- |
| New AMX / CSS / CSV / JSON | Create the selected supported editable file in the project root or current creation context using the trusted create operation. If Sprint 102 finds a type is intentionally unsupported by the existing project contract, record that narrower set explicitly before implementation. |
| New folder | Create a project-contained folder; a folder context menu may set the new folder's parent. |
| Duplicate active file | Available only for a supported contained editable file. Preserve its extension and use the existing duplicate authority. |
| Move/rename active file | Available only when an eligible editable file is active. This replaces the redundant standalone Move/Rename button and uses the same validated move path as a contextual action. |
| Open file | Opens a project file through the existing picker/open flow where that flow is available. |
| Manage trash | Opens a bounded list of trash items with per-item Restore and an explicit Empty Trash action. Empty Trash requires confirmation. |

### 3.3 File and Folder Context Menus

Context menus are available by secondary pointer action and an equivalent
keyboard invocation (context-menu key or Shift+F10). Disabled/inapplicable
actions are omitted or clearly disabled; menu commands share the same shell
handlers as their toolbar/command equivalents.

| Target | Proposed actions |
| --- | --- |
| Editable contained AMX/CSV/JSON/CSS file | Open; Duplicate; Rename/Move; Delete to Trash; Reveal in system file manager. |
| Generated HTML/PDF/DOCX output | Open with the system default where supported; Reveal; Delete to Trash where the existing project policy permits. Do not offer text-editor-only operations. |
| Folder | New supported file; New folder; Duplicate; Rename/Move; Delete to Trash; Reveal. Duplicate, move, and trash/restore operations must be service-owned and operate on the complete contained tree. |
| Trash item | Restore to the recorded original relative path; show the item path and report an unavailable/colliding destination without overwriting. |

### 3.4 Rename, Move, Drag/Drop, and Safeguards

| ID | Observable contract |
| --- | --- |
| `S102-EXP-04` | File and folder rename/move commands validate project-relative destinations in the trusted desktop service. The renderer never constructs an alternate filesystem mutation path. |
| `S102-EXP-05` | Dropping a file onto a visible folder targets that folder. A folder-to-folder move, if accepted, moves the entire subtree through a service-owned operation; dropping on a file, outside the project, a hidden/internal target, or a folder's own descendant is rejected. Sprint 102 must explicitly disposition folder drag/drop against the transaction requirements below. |
| `S102-EXP-06` | A destination collision never overwrites, merges, or silently auto-renames. The operation reports the conflict and leaves source, destination, tabs, and imports unchanged. A same-path drop is a no-op. Case-only path changes must either use a safe staged transaction or be clearly rejected; they must not become an overwrite. |
| `S102-EXP-07` | Moving/renaming an AMX file preserves the existing import-rewrite transaction: inspect every affected current revision and destination, use current open-buffer contents where applicable, and commit the move plus import updates all-or-nothing. A folder operation that changes AMX relative paths must account for every affected descendant and inbound import or be rejected before mutation. |
| `S102-EXP-08` | Dirty/conflicted tabs, external disk changes, invalid containment, symlinks, unsupported file kinds, or incomplete preflight block a mutation until safely resolved. No partial mutation or silent overwrite is allowed. Open tabs and the active document remain correctly identified after successful operations. |
| `S102-EXP-09` | Delete moves eligible contained files or folders to `.openamx/trash`; it is not permanent deletion. A folder is moved as a complete subtree, and dirty/conflicted open documents require the existing save/conflict resolution before trashing. Restore fails safely if the original parent/path is unavailable or any restored descendant collides; it never partially restores or overwrites. Empty Trash is irreversible and requires an explicit confirmation. |
| `S102-EXP-10` | Reveal and external Open use the trusted native/service boundary and report unavailable host support. No unrestricted path capability is exposed to the webview. Internal AMX/data files open in the workbench; generated output opens externally where supported. |
| `S102-EXP-11` | Drag cancellation or invalid drop leaves the project unchanged. Visible target feedback identifies the destination and rejected states without relying on color alone. Keyboard context actions remain available when dragging is not. |

### 3.5 Folder-Operation Decision Required

nothing. Direct renderer-side directory operations are not acceptable. If
**Confirmed source boundary:** `desktopService.ts` owns file duplication,
file move, file trash, and file restore. File move already preflights current
AMX revisions/imports, checks source and dependent-file disk hashes, rejects
an existing destination, stages rewritten files, rolls back a failed commit,
and retargets open tabs after success. `TrashItem` is file-kind typed; restore
accepts only a regular file. `rpc.ts` and the service have no complete folder
duplicate/move/trash/restore operation.

**Candidate folder contract, not approved:** any future folder operation is
service-owned and treats the folder as one complete contained tree. Duplicate
and move preflight the complete tree, reject symlinks and every destination
collision, and never merge, overwrite, or silently rename. A move accounts
for every descendant AMX import whose relative path changes and every
inbound import from outside the tree; it uses current open-buffer revisions
only after dirty/conflicted tabs are resolved. Open tabs retain identity and
are retargeted only after commit. Any disk-hash/external-change mismatch
aborts without changing files or tabs. The folder rename and all import
rewrites commit as one transaction; a failure restores the original tree,
destinations, and all rewritten sources or reports an explicit rollback
failure. Folder trash moves the complete tree; restore preflights every
descendant destination and either restores the whole tree or none of it.

**Disposition and downstream block:** these guarantees are a proposal, not
an implemented or accepted capability. Until the product owner separately
dispositions the contract and Sprint 105 proves the service transaction, do
not expose folder duplicate, rename/move, folder drag/drop, trash, or restore.
Sprint 105 folder-operation work is blocked pending that disposition. File
operations may use only their existing service-owned paths. Renderer-side
filesystem mutation is prohibited in all cases.

## 4. Command Palette

| ID | Observable contract |
| --- | --- |
| `S102-CMD-01` | Preserve the Commands button, Ctrl+Shift+P, searchable filtering, availability/disabled reasons, click execution, Help and Preferences buttons, empty-results state, and focus restoration to the opener. |
| `S102-CMD-02` | On open and every filter change, select the first enabled filtered command. If there is no enabled result, there is no selection. |
| `S102-CMD-03` | Up/Down moves among enabled results and stops at the first/last; it never wraps. Disabled results are skipped and cannot become selected. |
| `S102-CMD-04` | Enter/Return runs the selected enabled command through the same execution path as a click. It cannot run a disabled command or execute a stale selection after filter/availability changes. |
| `S102-CMD-05` | Escape dismisses the palette and restores focus. Help and Preferences behavior remains unchanged. |

## 5. Workbench Resizing

| ID | Observable contract |
| --- | --- |
| `S102-SIZE-01` | The desktop layout continues to have explorer, editor, and contextual panels separated by two keyboard-operable vertical splitters. Focus modes remain functional. |
| `S102-SIZE-02` | At the established 1024x720 minimum and a larger desktop viewport, all three primary panels remain reachable and useful. Preserve the current explorer 160-400 px bounds, editor/context minimum tracks, and contextual-pane 25-65% bounds unless the technical gate identifies a necessary, explicitly dispositioned adjustment. |
| `S102-SIZE-03` | Persist sizes per recent project using the desktop service/RPC authority (`setPanelSizes` or an approved compatible contract). A global splitter `localStorage` layout must not overwrite per-project dimensions. Restored dimensions are validated/clamped/rejected safely under the approved policy. |
| `S102-SIZE-04` | Splitter keyboard adjustment has visible focus and predictable Arrow/Home/End behavior with no panel crossing its allowed bounds. Pointer drag, keyboard resizing, and focus-mode transitions do not lose panel content or corrupt saved dimensions. |
| `S102-SIZE-05` | Preserve the current responsive stack/reflow and hidden-divider behavior at narrow viewport widths. Resizable groups must not trap a collapsed or unreachable panel or cause horizontal overflow. |

## 6. Bottom-Only Runtime Panel

| ID | Observable contract |
| --- | --- |
| `S102-RUN-01` | Runtime remains fixed in the bottom workbench row. Remove Bottom/Right controls, relocation behavior, the drawer-dock preference, local-storage state, and obsolete right-docking layout state. |
| `S102-RUN-02` | Preserve Run Active Document and Cancel Current Job where currently available, plus runtime state/status, job stage, progress, cleanup-pending message, export status, output Open/Reveal actions, and all diagnostic/result/input details. |
| `S102-RUN-03` | Preserve Show/Hide Details with its current expansion semantics and visible diagnostics/summary. The panel remains independently scrollable and bounded at desktop and narrow viewport sizes. |
| `S102-RUN-04` | Removing docking does not remove or relocate the contextual preview/data pane, change runtime job authority, or alter the V0.6 historical contract. |

## 7. Contract Disposition

Before Sprint 103-107 implementation, separately disposition all candidate
details, especially folder move/rename transaction support, collision and
case-only behavior, action availability for generated outputs, count
eligibility, and the resizable implementation path. Unresolved items block
only their dependent product work until the scope is amended or the decision
is closed.