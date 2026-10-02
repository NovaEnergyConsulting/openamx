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

**objective**: Prove and select a maintained data-editor component, then deliver lossless virtualized CSV/JSON editing, mapped schema diagnostics, explicit external-input editing, autosave/conflicts, cancellation, and measured 100,000-row behavior.

**owns**: Candidate proof/selection, CSV grid, JSON tree/array editor, raw/structured modes, deterministic serialization, undo/redo, type/schema/diagnostic integration, external/private labels and route, autosave/conflict integration, scale/cancellation evidence, and focused tests.

**must_not**: Hand-roll virtualization, change core JSON/CSV/AMX semantics, expose general filesystem/private paths, implement final live preview/export, alter project/settings policy, or claim 100k interactive/native/accessibility behavior without direct measured evidence.

**decision gates**: Complete the candidate proof before production dependency adoption. Preserve Sprint 036 identity/jobs, Sprint 038 atomic/conflict/autosave, Sprint 039 external mapping/privacy, and Sprint 040 shared facts. If no candidate meets the contract, record `BLOCKED` with evidence and fallback; do not silently lower scope.

**acceptance**: Meet every item in `planning/sprints/0041-v06-structured-csv-json-data-editor/acceptance.md`. Separate core parsing performance, candidate/browser evidence, external-data service evidence, and native-host evidence.

**verification**:

1. Run candidate proof first, recording exact package metadata/license, pins, build, keyboard/IME, raw/structured, undo, 100k viewport, memory, bundle, and cancellation results. Stop adoption on a failed gate.
2. Run focused JSON/CSV/data-editor tests for valid/invalid nested values, duplicate keys, RFC 4180 cases, raw preservation, undo, sort/filter non-mutation, schema navigation, external privacy, autosave/conflicts, stale jobs, and no-write behavior.
3. Run real 100,000-row viewport/edit/scroll/cancel fixtures and larger/unsupported fallback checks. Record hardware, OS, runtime, fixture sizes, timings, memory method, warnings, and artifacts.
4. Run root build/full tests, desktop direct RPC/typecheck/Vite checks, selected component/browser checks, and `git diff --check`. Update planning state/decisions/questions and a Sprint 041 builder-evidence record with residuals and Sprint 042 entry conditions.
