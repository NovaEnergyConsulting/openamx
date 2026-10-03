# Sprint 042 Handoff Prompt

You are the Builder for OpenAMX Sprint 042.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/builder-evidence.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/acceptance.md`
- `planning/sprints/0038-v06-project-lifecycle-autosave-trash-recovery/builder-evidence.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/acceptance.md`
- `planning/sprints/0040-v06-amx-language-intelligence-refactoring/acceptance.md`
- `planning/sprints/0041-v06-structured-csv-json-data-editor/acceptance.md`
- `planning/sprints/0041-v06-structured-csv-json-data-editor/builder-evidence.md`
- `planning/sprints/0042-v06-live-preview-runtime-drawer-export-parity/requirements.md`
- `planning/sprints/0042-v06-live-preview-runtime-drawer-export-parity/blueprint.md`
- `planning/sprints/0042-v06-live-preview-runtime-drawer-export-parity/acceptance.md`
- Current job/worker, RPC, active-document, project/settings/data, report preparation, export adapters, and focused tests

## Task Contract

**objective**: Deliver active-document live preview/Run, contextual runtime state, a unified five-format Export workflow, safe destinations, atomic output preservation, and measured cancellation/performance evidence.

**owns**: Debounced active-file analysis/preview, pause/resume/manual refresh, explicit Run, stale-last-good state, source-linked diagnostics/progress, runtime drawer details, export eligibility/discovery, native destination routing, HTML/PDF/DOCX/JSON/CSV preparation and serialization, Open/Reveal/output refresh, cancellation/no-write tests, and evidence.

**must_not**: Reintroduce designated-entry desktop targeting; change AMX, CLI, report, input, data, visualization, or VS Code semantics; weaken path/privacy/authority/atomic-write boundaries; implement new project lifecycle, settings, editor intelligence, data editor, or onboarding features; claim unavailable native/platform/release/accessibility proof; or silently declare Sprint 041's 100ms responsiveness exception solved.

**decision gates**: Preserve Sprint 036 identity/worker/overlay and main-process commit authority; consume Sprint 038/039 lifecycle/settings boundaries and Sprint 040/041 analysis/data contracts. Any change to output eligibility, privacy, format semantics, or cancellation/write ordering requires a recorded Lead Developer decision. Atomic replacement already in progress is non-interruptible and must be described accurately.

**acceptance**: Meet every item in `planning/sprints/0042-v06-live-preview-runtime-drawer-export-parity/acceptance.md`. Distinguish browser/component, service, and direct native-host evidence; preserve the Sprint 041 performance exception for Sprint 043 unless directly measured and dispositioned.

**verification**:

1. Run focused active-document identity and stale-result tests for tab/project/module/data/settings changes, pause/resume, cancellation, supersession, and late replies before UI polish.
2. Run no-write tests for every failure/cancel phase and destination class. Verify existing HTML/PDF/DOCX/JSON/CSV bytes survive invalid analysis/input/settings, stale jobs, overwrite cancel, serialization failure, and write errors.
3. Test current unsaved imports and active tab across all eligible formats. Verify named JSON/CSV outputs expose only explicit supported bindings and that private paths/content never enter shared payloads.
4. Measure preview debounce, real cancellation acknowledgement and cleanup, serialization, memory, and webview long tasks. Keep Sprint 041's 100k grid/edit task measurements and exception explicit for Sprint 043.
5. Run root build/full tests, focused report/input/output suites, desktop direct RPC/tests/typecheck/Vite/component checks, and native host checks only where available. Record exact commands, versions, counts, bundle/timing results, artifacts, hashes, warnings, and unavailable gates.
6. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 042 builder-evidence record with residual owners and Sprint 043 integrated acceptance conditions.
