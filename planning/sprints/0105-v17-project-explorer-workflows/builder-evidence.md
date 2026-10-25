# Sprint 105 Builder Evidence: V0.17 Project Explorer Workflows

## Status

Sprint 105 was ACCEPTED/CLOSED on 2026-10-25 against the separately amended
file-only V0.17 scope after focused UI follow-up passed. The original broader
V0.17 explorer master-plan scope is not accepted.

**Builder recommendation:** ACCEPT for the amended file-only scope, with
explicit residuals below.
**Separate acceptance disposition:** ACCEPTED/CLOSED 2026-10-25 for the
amended scope only.
**Folder-operation decision:** DEFERRED FROM V0.17 to the product-owner
backlog; target version uncommitted. No folder mutation implementation is
authorized.

## Preconditions and Baseline

- Sprint 104 is ACCEPTED/CLOSED on 2026-10-25 with verification residuals:
  Hutch-wrapped typecheck did not complete; direct `bunx vue-tsc --noEmit`
  passed; the approved Vite UI tests passed; an existing private reload helper
  has no UI call site.
- Sprint 102's overall UX contract is ACCEPTED/CLOSED. Its builder evidence
  still says folder duplicate/move/trash/restore and folder drag/drop are
  blocked pending separate disposition; the resizer gate remains OPEN for
  Sprint 107.
- Current explorer has search and hierarchical file grouping, a combined
  count, four top-row actions, and one Windows-path grouping UI test.
- Current service supports empty folder creation and file create/duplicate/
  move/trash/list/restore/empty. File AMX move performs transactional import
  rewrites and current-buffer/disk conflict checks. Folder mutation operations
  and a folder trash DTO do not exist.
- Native open/reveal helpers exist only behind the trusted desktop host and
  are currently used for approved export IDs / preview navigation. No
  project-scoped explorer reveal/open RPC was found.

## Approved Execution Plan

On 2026-10-25, the user separately authorized the file-scoped Sprint 105
slice, approved the menu/import/native-action defaults below, and approved
the exact source/test/output list. Folder mutation implementation was
explicitly excluded.

- Top explorer menu: New submenu for AMX/CSV/JSON/CSS, New folder, Duplicate
  active file, Rename/Move active file, Open file, and Manage Trash.
- File context menu: Open, Duplicate, Rename/Move, Delete to Trash, Reveal;
  generated outputs receive external Open and Reveal only.
- Folder context menu: New contained AMX/CSV/JSON/CSS, New folder, and Reveal.
  Folder duplicate/move/drop/trash/restore remain absent.
- AMX duplicate with relative imports is rejected atomically when the target
  directory differs. Dirty/conflicted source buffers must be saved/resolved
  before duplicate, move, or delete.
- AMX deletion is blocked when inbound importers exist. Outbound imports
  require explicit confirmation before delete-to-Trash.
- Native `openProjectItem` accepts a project-relative path and action only;
  service revalidates exact current listing membership, root, visibility,
  kind, symlink status, and existence. Reveal supports listed files/folders;
  native Open supports listed HTML/PDF/DOCX outputs only.

Approved production/harness source paths:

- `desktop-app/src/mainview/components/ProjectExplorer.vue`
- `desktop-app/src/mainview/App.vue`
- `desktop-app/src/mainview/app.css`
- `desktop-app/src/shared/rpc.ts`
- `desktop-app/src/bun/desktopService.ts`
- `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`

Approved test/evidence paths:

- Extend `desktop-app/tests/rpc-contract-check.ts`.
- Add `desktop-app/tests/ui/project-explorer-workflows.pw.ts`.
- Run `desktop-app/tests/ui/project-explorer-paths.pw.ts` unchanged.
- Update only this `builder-evidence.md`.
- Follow-up authorization on 2026-10-25: extend only the approved UI workflow
  test and harness mock; write fresh test outputs only under
  `outputs/ui-follow-up/`.

Approved generated paths:

- `planning/sprints/0105-v17-project-explorer-workflows/outputs/typecheck.log`
- `planning/sprints/0105-v17-project-explorer-workflows/outputs/rpc-contract-check.log`
- `planning/sprints/0105-v17-project-explorer-workflows/outputs/project-explorer-workflows-playwright.log`
- `planning/sprints/0105-v17-project-explorer-workflows/outputs/playwright/`
- `planning/sprints/0105-v17-project-explorer-workflows/outputs/ui-follow-up/baseline-playwright.log`
- `planning/sprints/0105-v17-project-explorer-workflows/outputs/ui-follow-up/playwright/`
- `planning/sprints/0105-v17-project-explorer-workflows/outputs/ui-follow-up/playwright-final.log`
- `planning/sprints/0105-v17-project-explorer-workflows/outputs/ui-follow-up/playwright-final/`

The initial implementation authorization excluded global decision-ledger
edits. A later separate disposition authorization permitted only
`planning/decisions.md`, this sprint's `explorer-contract.md`,
`folder-operation-gate.md`, `acceptance.md`, and this evidence file. No
package/config/version changes, release, publication, certification, or
downstream sprint execution were authorized.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory | PASS: `git status --short` was empty before implementation. Final changed paths match the approved list; `main.ts` is unchanged. |
| Folder-operation product disposition | DEFERRED FROM V0.17 to the product-owner backlog; target version uncommitted. No folder duplicate/move/tree-drop/trash/restore implementation or folder RPC/DTO was added. Empty-folder creation and file drop onto a folder remain in scope. |
| File-action/menu contract disposition | APPROVED 2026-10-25 for the file-scoped defaults recorded above. |
| Desktop typecheck | PASS: `bunx vue-tsc --noEmit` from `desktop-app`; initial log in `outputs/typecheck.log`, final post-follow-up log in `outputs/ui-follow-up/typecheck.log`. |
| Explorer-focused Playwright tests | PASS: final follow-up from `desktop-app`, `bunx playwright test tests/ui/project-explorer-workflows.pw.ts tests/ui/project-explorer-paths.pw.ts --output ..\planning\sprints\0105-v17-project-explorer-workflows\outputs\ui-follow-up\playwright-final`; 6 passed, 0 failed. Log: `outputs/ui-follow-up/playwright-final.log`. Baseline after harness changes passed 4/4 in `outputs/ui-follow-up/baseline-playwright.log`. |
| Desktop RPC/service contract tests | PASS: `bun run tests/rpc-contract-check.ts`; captured in `outputs/rpc-contract-check.log`. All Sprint 105 duplicate/import/delete/restore/native-boundary checks passed; final active worker resources were empty. |
| Native open/reveal boundary tests | PASS: only listed generated outputs can be opened; listed contained files/folders can be revealed; outside, stale, symlinked, hidden, and unsupported paths were rejected without native calls. |
| `git diff --check` and exact path/output inventory | PASS after final disposition edits. Final changed paths are the six approved source/harness files, two approved test paths (one new), the separately approved five planning files, and approved `outputs/` trees. `main.ts`, package/config/version files remain unchanged. |

### Validation Failures and Corrections

- Initial Playwright invocation redirected its log one directory above the
  repository because the terminal was at the repo root. No test started and
  no file was created at that external path.
- The configured Playwright web server invokes the Unix-only
  `./node_modules/.bin/vite` shim; Windows rejected it. The approved tests
  passed after starting the same Vite harness with `bunx vite` on
  `127.0.0.1:4183`; no config file was changed.
- The first typecheck exposed a builder patch-placement error that put the
  native handler outside the RPC object. The handler was moved to the service
  request table and the final direct typecheck passed.
- Initial RPC runs exposed two hard-coded `/` expectations on Windows for
  nested relative paths. Assertions now use `path.relative`; the final
  RPC/service contract run passed.
- The initial expanded UI follow-up runs failed on test-only prompt ordering,
  fixture listing behavior, and assertions. Those corrections were made
  within the approved UI-test/harness paths; the final selection passed 6/6.

## Scope and Residuals

- The authorized source, RPC/service behavior, harness mock, and tests changed
  only at the approved paths. No raw path capability is exposed to the
  webview.
- Folder duplicate, rename/move, folder-tree drag/drop, trash, and restore
  remain deferred to the product-owner backlog with no target version
  committed. No folder implementation or later-sprint execution is authorized.
- A failed Trash restore displays its error in place of the Trash list; the
  item remains stored and appears after closing/reopening Trash. Sprint 106
  owns this UX follow-up; no Sprint 106 execution is authorized.
- Sprint 105 is ACCEPTED/CLOSED only against the amended file-only scope. The
  original broader master-plan scope and S105-FOLDER-01/02 are not accepted.
  No release, publication, package/version change, platform certification,
  or downstream sprint execution is authorized by this evidence.
- A failed Trash restore displays its error in place of the Trash list; the
  item remains stored and appears after closing/reopening Trash. Sprint 106
  owns this follow-up UX residual; no Sprint 106 execution is authorized.
- Sprint 105 is ACCEPTED/CLOSED only against the amended file-only scope. The
  original broader master-plan scope and S105-FOLDER-01/02 are not accepted.
  No release, publication, package/version change, platform certification,
  or downstream sprint execution is authorized by this evidence.