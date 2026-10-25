# Sprint 105 Explorer Operation Test Matrix

This matrix defines focused Sprint 105 evidence. File cases can proceed under
an approved file-operation scope. Folder mutation cases are blocked until
`folder-operation-gate.md` is dispositioned.

| ID | Scenario | Required assertions | Surface/status |
| --- | --- | --- | --- |
| `S105-COUNT-01`, `S105-COUNT-02`, `S105-COUNT-03`, `S105-COUNT-04` | Whole-project totals and search | Counts use `folders/files`, are accessible, derive from the complete list, and do not change under filtering. Hidden/ignored/symlink/trash entries follow `listProjectFiles` policy. | ProjectExplorer UI; file workflows |
| `S105-MENU-01`, `S105-FILE-01`, `S105-FILE-10` | Top action menu | Exact approved actions appear; unavailable operations are disabled/omitted; New file/folder, duplicate, move, open, and trash actions reach the intended shell handler. | UI; exact menu placement pending disposition |
| `S105-MENU-02`, `S105-FILE-11` | File context menu | Pointer and keyboard invocation work; supported editable files receive the approved actions; generated outputs receive only approved native actions. | UI; exact action availability pending disposition |
| `S105-MENU-03` | Folder context menu | New contained file/folder actions remain safe. Folder duplicate/move/trash/restore are absent or disabled while gate is open. | UI; folder mutations blocked |
| `S105-CREATE-01`, `S105-FILE-01`, `S105-FILE-10` | Create editable file | AMX/CSV/JSON/CSS path and extension validation, supported contents, listing update, and active-document initialization are correct. | Desktop RPC + UI; file workflow |
| `S105-CREATE-02` | Create folder | Contained one-level folder creation succeeds; existing path, hidden/ignored path, outside path, symlink parent, or missing parent fails without mutation. | Desktop RPC + UI; supported |
| `S105-DUP-01`, `S105-FILE-06` | Duplicate editable file | Content/extension is correct, source remains unchanged, destination collision/outside path fails. AMX relative imports remain valid or cross-directory duplicate is rejected atomically. | Desktop RPC + UI; file workflow |
| `S105-MOVE-01`, `S105-FILE-04`, `S105-FILE-10` | Rename/move non-AMX file | Existing contained destination succeeds; same-extension and parent rules hold; collision/outside/symlink/external-change cases fail without mutation. | Desktop RPC + UI; file workflow |
| `S105-MOVE-02`, `S105-FILE-05`, `S105-FILE-10` | Rename/move AMX with imports and open buffers | Current buffer is used; inbound/descendant imports rewrite transactionally; open tabs retarget after commit; failed preflight/commit preserves all files/tabs. | Desktop RPC + UI; file workflow |
| `S105-DND-01`, `S105-FILE-02` | Drop file onto folder | Same validated `moveProjectFile` path and results as menu move; active/open tab behavior is identical. | UI + RPC spy/service assertion; file workflow |
| `S105-DND-02`, `S105-FILE-03`, `S105-FILE-04` | Invalid file drop | Drop onto file, outside/hidden/ignored target, self/same path, or collision performs no mutation and reports/indicates rejection. | UI + RPC/service assertions; file workflow |
| `S105-TRASH-01`, `S105-FILE-01`, `S105-FILE-07`, `S105-FILE-10` | Delete clean file to Trash | File moves under `.openamx/trash`, disappears from listing, tabs/status reconcile, and it is not permanently deleted. | Desktop RPC + UI; file workflow |
| `S105-TRASH-02`, `S105-FILE-07` | Dirty/conflicted/external/import-dependent file | Require approved save/conflict/import-impact resolution; cancellation or rejection leaves file, imports, buffers, and tabs unchanged. | Desktop RPC + UI; safeguards |
| `S105-TRASH-03`, `S105-FILE-08` | Restore file | Restore original relative path when parent exists and no collision; unavailable parent or collision fails without overwriting/partial restore. | Desktop RPC + UI; file workflow |
| `S105-TRASH-04`, `S105-FILE-09` | Empty Trash | Confirmation is required; cancel preserves trash; confirm empties and listing updates; service failure is reported. | Desktop RPC + UI; file workflow |
| `S105-NATIVE-01` | Reveal/open project file or output | Calls a project-scoped trusted service operation; rejects stale, hidden, outside-root, symlink, and unsupported targets; unavailable native host is surfaced. No raw native path capability is exposed. | RPC/UI; new safe RPC may be required |
| `S105-FOLDER-01` | Duplicate/move/drop folder tree | Preflight complete subtree, AMX descendant/inbound imports, collisions, open tabs, disk changes; commit or rollback atomically. | BLOCKED until separate disposition and amended plan |
| `S105-FOLDER-02` | Trash/restore folder tree | Trash and restore complete tree all-or-nothing; typed trash item, collisions, missing parent, dirty descendants, and empty-trash confirmation are covered. | BLOCKED until separate disposition and amended plan |

## Coverage Rules

- Use `desktop-app/tests/rpc-contract-check.ts` for service-authority and
  filesystem invariant assertions; keep UI assertions in a focused
  `desktop-app/tests/ui/project-explorer-workflows.pw.ts` or an approved
  narrow extension of `project-explorer-paths.pw.ts`.
- For each failure case, assert the on-disk tree, import contents, open tabs,
  and active identity remain unchanged where applicable, not only the returned
  error.
- Do not count a disabled/hidden folder action as implemented folder
  capability. It only proves the unresolved gate is respected.
- Do not report `S105-FOLDER-01` or `S105-FOLDER-02` PASS until their product
  decision, exact file plan, service implementation, and tests are approved.