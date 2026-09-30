# Sprint 029 Requirements: Desktop Workbench Shell and Project Workflow

## Goal

Turn the existing single-document desktop surface into the V0.5 workbench shell: native project/file/export selection, contained searchable explorer, conflict-safe multi-file tabs and entry designation, private local session history, resizable/focused layout, and keyboard-operable command palette. Preserve current-buffer execution and the typed main-process authority boundary. Sprint 030 supplies the full editor component later.

## Inputs

- `planning/plan-openamxV05MasterSprintPlan.md`, Sprint 029; approved `docs/language-spec-v0.5.md`, especially sections 4-5
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md`, `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`, `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`, and `desktop-app/tests/rpc-contract-check.ts`
- Current `.openamx/project.json` input workflow, shared loader/formatter/render/export adapters, and V0.4 desktop acceptance evidence

## In Scope

- Replace user-typed project, document and HTML/PDF/DOCX destination paths with native picker intents handled in the Bun main process. Cancel is a no-op; validate every selected path after the dialog using the existing canonical containment, regular-file, lowercase extension, destination conflict, and safe atomic-write rules. Keep a separate intentional project root and entry URI for local imports.
- Add a bounded, path-ordered, searchable hierarchical project explorer of canonical contained regular `.amx` files. Exclude symlinks, hidden/dot paths, `.openamx`, `node_modules`, generated/build/artifact directories and report outputs; reject explicit opens that bypass those exclusions. Search matches relative display paths case-insensitively with clear empty/no-match states.
- Add multiple canonical-path-keyed tabs with active and explicitly designated entry document. Switching retains in-memory unsaved text/hash/dirty/conflict/revision and selection where supported by the current editor. Active tab owns edit/save/format/static analysis; run/preview/export always use the entry tab's current buffer, with an entry label when active differs. Dirty imported dependencies must be saved first or report operations fail with a named unsaved-dependency prompt; never silently use stale disk.
- Support open/switch/close, guarded reload, per-tab conflict detection, save/discard/cancel on dirty/conflicted close, project switch and quit, and entry reassignment or disabled report commands after entry closure. Refuse silent overwrite on external disk changes; failed/cancelled save must leave state intact. Preserve existing current-buffer and no-write guarantees across project/tab transitions.
- Persist at most ten recent canonical project roots and optional relative active/entry paths and panel sizes in machine-local state only. Validate every restored path on startup; never persist unsaved text, inputs, diagnostics, evaluated values, HTML, private config, or secrets. Do not auto-run or silently restore dirty state. Provide clear-recents/session and handle unavailable projects safely.
- Implement bounded resizable/collapsible explorer, editor, preview, diagnostics, inputs/results and export regions, plus reversible focused editor/preview modes; restore focus, scroll and tab state on exit. Keep core actions reachable at 1280x720 and 800x600 (secondary panels become tabs/drawers at the smaller size), visible focus, keyboard resize/toggle, and no overlapping text/controls.
- Add a searchable named-command palette and documented cross-platform shortcuts for project/file open, tab switch, save, format, run entry, preview entry, explicit export, search and focus modes. Route toolbar, palette and shortcuts through the same typed operations; display disabled reasons, preserve editor text-edit shortcuts and restore focus on Escape/dialog dismissal.
- Extend focused desktop direct/RPC/UI tests for dialog validation/cancel, symlink/ignored-path containment, multi-tab save/reload/conflict/entry semantics, dependency freshness, recent/session privacy, command dispatch and accessibility/layout state. Record exact direct/package/native check outcomes and residuals in planning logs.

## Out of Scope

- Sprint 030 full editor integration, syntax highlighting, bracket pairing, find/replace, new completion/diagnostic source-map behavior and revised run/preview/export feedback. Retain current basic editing and current static analysis without claiming Sprint 030 acceptance.
- Sprint 031-032 report identity/configuration, HTML/PDF/DOCX styling or logo handling; Sprint 033 VS Code providers; Sprint 034 CLI/docs/examples/final manual visual sign-off.
- New AMX language/evaluator semantics, input mapping precedence changes, remote assets, webview filesystem/evaluator/dialog/export authority, native installer work, license/Marketplace publication or claiming inherited V0.4 platform/Hutch/Office gates are closed.

## Constraints

- Sprint 028's approved contract is normative. Use bounded typed main-process RPC for dialog, tab/session and command operations; never trust a picker return or browser-local state as authorization. Do not require secrets/private paths in project files or RPC summaries.
- Respect file-backed entry containment and saved dependency loading; keep active and entry separate, no dirty-text loss, silent overwrite, stale-file execution, or success displayed for a superseded project/tab request.
- Preserve existing V0.2-V0.4 behavior, current-buffer preview/run and export destination no-write/atomic safety. Manual visual review against the approved checklist is recorded for Sprint 034; Sprint 029 supplies focused automated and available desktop evidence without claiming native platform verification from WSL2.
