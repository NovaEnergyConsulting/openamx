# Sprint 040 Handoff Prompt

You are the Builder for OpenAMX Sprint 040.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0035-v06-product-ux-contract-feasibility/builder-evidence.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/builder-evidence.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/acceptance.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/requirements.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/blueprint.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/acceptance.md`
- `planning/sprints/0040-v06-amx-language-intelligence-refactoring/requirements.md`
- `planning/sprints/0040-v06-amx-language-intelligence-refactoring/blueprint.md`
- `planning/sprints/0040-v06-amx-language-intelligence-refactoring/acceptance.md`
- Existing parser/checker/formatter modules, VS Code providers/tests, CodeMirror editor, desktop RPC, and active-document overlay/job contracts

## Task Contract

**objective**: Deliver shared AMX editor facts and desktop/VS Code language intelligence: exact fence-aware highlighting, completion, diagnostics, navigation, safe rename, deterministic code actions, and formatting ergonomics.

**owns**: Pure shared editor/module analysis, symbol identity/ranges/occurrences, completion/diagnostic/navigation/action facts, CodeMirror decorations, VS Code adapters/regressions, desktop editor integration, overlay-aware static analysis, atomic refactoring guards, and evidence.

**must_not**: Add AMX syntax/semantics, create a second parser/grammar, evaluate AMX or load CSV/JSON for static assistance, build structured data editing, final preview/export, project lifecycle, onboarding, LSP/network services, unrestricted workspace indexing, or claim native/release/accessibility certification.

**decision gates**: Preserve Sprint 036 overlay/request identity, Sprint 037 editor/shell authority, and existing VS Code behavior. Any new shared semantic API or change to source locations, formatting, action safety, or parser authority requires a recorded decision. If a range/identity is unproven, withhold the result.

**acceptance**: Meet every item in `planning/sprints/0040-v06-amx-language-intelligence-refactoring/acceptance.md`. Distinguish shared-fact proofs, desktop/browser evidence, VS Code host evidence, and the known VS Code apply-time limitation.

**verification**:

1. Run focused shared parser/checker/editor tests for symbols, UTF-16 ranges, imports, unsaved overlays, completion, diagnostics, navigation, actions, and no-result ambiguity cases.
2. Run CodeMirror/component tests for exact executable-fence highlighting, formatting undo/selection/scroll, CRLF/non-BMP behavior, stale revisions, and desktop focus. Run VS Code compile and Extension Development Host regressions.
3. Run root build/full tests and desktop typecheck/Vite/direct RPC checks when host tooling is available. Record bundle size, latency, memory, warnings, and any existing failures without masking them.
4. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 040 builder-evidence record with compatibility, limitations, residual owners, and Sprint 041/042 entry conditions.
