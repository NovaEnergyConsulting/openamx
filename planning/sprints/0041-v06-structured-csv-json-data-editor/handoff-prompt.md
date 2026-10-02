# Sprint 041 Handoff Prompt

You are the Builder for OpenAMX Sprint 041.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/builder-evidence.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/builder-evidence.md`
- `planning/sprints/0038-v06-project-lifecycle-autosave-trash-recovery/builder-evidence.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/requirements.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/blueprint.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/acceptance.md`
- `planning/sprints/0040-v06-amx-language-intelligence-refactoring/requirements.md`
- `planning/sprints/0040-v06-amx-language-intelligence-refactoring/blueprint.md`
- `planning/sprints/0040-v06-amx-language-intelligence-refactoring/acceptance.md`
- Existing input/output services, data shells, RPC contracts, editor facts, atomic writers, and focused tests

## Task Contract

**objective**: Integrate the Lead Developer-selected maintained editors into the production desktop app, then deliver lossless virtualized CSV/JSON editing, mapped schema diagnostics, explicit external-input editing, autosave/conflicts, cancellation, and measured 100,000-row behavior.

**owns**: Production integration of `vxe-table@4.22.3` for CSV and `json-editor-vue@0.19.2` backed by `vanilla-jsoneditor@3.13.0` for JSON; CSV grid, JSON tree/array editor, raw/structured modes, deterministic serialization, undo/redo, type/schema/diagnostic integration, external/private labels and route, autosave/conflict integration, scale/cancellation evidence, and focused tests.

**must_not**: Hand-roll virtualization, change core JSON/CSV/AMX semantics, expose general filesystem/private paths, implement final live preview/export, alter project/settings policy, or claim 100k interactive/native/accessibility behavior without direct measured evidence.

**decision gates**: Candidate selection is resolved by Lead Developer direction. Add and pin the selected packages in the production desktop package and use them in the CSV/JSON editor surfaces. The reported isolated-host manual checklist passed; record OS/session, input method, and individual timings as unavailable because they were not captured. This does not waive production bundle, JSON 100k, raw-fidelity, schema, privacy, autosave/conflict, stale-job, or no-write acceptance. Preserve Sprint 036 identity/jobs, Sprint 038 atomic/conflict/autosave, Sprint 039 external mapping/privacy, and Sprint 040 shared facts. Do not hand-roll virtualization or silently lower scope.

**acceptance**: Meet every item in `planning/sprints/0041-v06-structured-csv-json-data-editor/acceptance.md`. Separate core parsing performance, candidate/browser evidence, external-data service evidence, and native-host evidence.

**verification**:

1. Pin the selected production dependencies and integrate each editor into the active CSV/JSON document path. Register VXE's official `en-US` locale before mounting and audit every enabled visible label.
2. Run focused JSON/CSV/data-editor tests for valid/invalid nested values, duplicate keys, RFC 4180 cases, exact raw preservation, undo, sort/filter non-mutation, schema navigation, external privacy, autosave/conflicts, stale jobs, and no-write behavior.
3. Run real 100,000-row CSV and JSON array-of-record viewport/edit/scroll/cancel fixtures and larger/unsupported fallback checks. Record hardware, OS, runtime, fixture sizes, timings, memory method, bundle deltas, warnings, and artifacts. Keep unrecorded manual-host details explicitly unavailable.
4. Run root build/full tests, desktop direct RPC/typecheck/Vite checks, selected component/browser checks, and `git diff --check`. Update planning state/decisions/questions and the Sprint 041 builder-evidence record with residuals and Sprint 042 entry conditions.
