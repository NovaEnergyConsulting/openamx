# Sprint 105 Builder Evidence: V0.17 Project Explorer Workflows

## Status

Architect-prepared evidence template. Sprint 105 implementation and
verification have not started under this preparation.

**Builder recommendation:** PENDING authorized execution.
**Separate acceptance disposition:** PENDING.
**Folder-operation decision:** OPEN / BLOCKED pending separate disposition.

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

Pending separate authorization. Record exact approved source, RPC/service,
test, output, and evidence paths here before implementation. Folder mutation
files are excluded until the separate folder-operation gate is dispositioned
and a file-by-file plan is approved.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory | NOT RUN. |
| Folder-operation product disposition | NOT RUN / OPEN. |
| File-action/menu contract disposition | NOT RUN. |
| Desktop typecheck | NOT RUN. |
| Explorer-focused Playwright tests | NOT RUN. |
| Desktop RPC/service contract tests | NOT RUN. |
| Native open/reveal boundary tests, if approved | NOT RUN. |
| `git diff --check` and exact path/output inventory | NOT RUN. |

## Scope and Residuals

- No production source, tests, RPC, or service behavior changed during
  Architect preparation.
- Do not expose unsupported folder duplicate/move/drop/trash/restore actions
  while the gate is open.
- Do not expose a raw path to native APIs from the webview. If no approved
  service RPC exists for project-file reveal/open, record the blocker and seek
  disposition rather than bypassing the trusted boundary.
- No release, publication, package/version change, platform certification,
  or downstream sprint execution is authorized by this document package.