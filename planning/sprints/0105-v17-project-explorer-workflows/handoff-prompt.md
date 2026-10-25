# Sprint 105 Handoff Prompt

You are executing Sprint 105, V0.17 Project Explorer Workflows. Do not edit
until separate Sprint 105 authorization and an exact source/test/output plan
are approved. Preserve the current worktree and unrelated user changes.

Sprint 104 is ACCEPTED/CLOSED. Sprint 102's overall contract is accepted, but
its evidence explicitly leaves folder duplicate/move/trash/restore and folder
drag/drop blocked pending a separate product-owner disposition. Before any
folder mutation work, obtain and record that separate decision and approve an
amended exact service/RPC/DTO/test plan. Do not add renderer-side filesystem
operations. If the decision remains open, proceed only with an explicitly
approved file-scoped slice; do not report complete Sprint 105 acceptance for
the full master-plan scope.

Implement the explorer menu, accessible file/folder context menus, independent
whole-project `folders/files` counts, and safe file workflows from
`explorer-contract.md`. Keep search, path grouping, active tabs, and existing
project operations working. Route file drag/drop through the same
`moveProjectFile` service path as menu actions. Preserve transactional AMX
import updates, buffer/disk revision checks, collision rejection, rollback,
trash/restore safety, and open-tab identity.

Project-file reveal/open must use a narrow trusted service operation that
revalidates the listed project-relative target. Never pass arbitrary paths to
native open/reveal helpers from the webview. If this boundary or import/delete
impact rules need a scope/API decision, stop and obtain approval before
editing.

Use `operation-test-matrix.md`; add focused UI and RPC/service assertions for
both success and failure atomicity. Keep test outputs in approved new Sprint
105 paths. Record exact evidence, failures, folder disposition, and residuals
in `builder-evidence.md`. This sprint authorizes no release, publication,
package/version change, certification, or later sprint execution.