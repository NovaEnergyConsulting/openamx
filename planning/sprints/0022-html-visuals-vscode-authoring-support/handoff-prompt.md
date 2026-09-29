# Sprint 022 Handoff Prompt

You are the Builder for OpenAMX Sprint 022.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.4.md`, with V0.2/V0.3 specifications as compatibility references
- `planning/sprints/0021-visualization-constructs-parser-conformance/acceptance.md`
- `planning/sprints/0022-html-visuals-vscode-authoring-support/requirements.md`
- `planning/sprints/0022-html-visuals-vscode-authoring-support/blueprint.md`
- `planning/sprints/0022-html-visuals-vscode-authoring-support/acceptance.md`
- `src/runtime/environment.ts`, `src/runtime/moduleLoader.ts`, `src/renderer/renderHtml.ts`, `src/formatter/formatAmx.ts`, and `vscode-extension/src/providers/`

## Task Contract

**objective**: Turn the Sprint 021 checked view emissions into interactive, accessible, offline HTML tables/charts with deterministic static print fallbacks, and extend direct VS Code V0.4 authoring providers.

**owns**: Renderer/formatter and narrowly necessary local assets, focused render/interaction/format/CLI tests, existing direct extension providers and host tests, and planning logs with actual results.

**must_not**: Re-evaluate views from final bindings, duplicate module/input execution, add PDF generation or export commands, expand AMX syntax/chart kinds, replace the VS Code provider architecture, read input data or execute AMX in the editor, add remote report assets, or claim Sprint 020 residual desktop checks passed.

**acceptance**: Meet every item in `planning/sprints/0022-html-visuals-vscode-authoring-support/acceptance.md`; keep historical document and CLI behavior when there are no V0.4 views. Resolve any observable contract ambiguity in the planning logs before implementation.

**verification**:

1. After the first renderer edit, run a focused typed table/show placement test that checks one evaluation and the source listing; fix this slice before expanding to interactive visuals.
2. Exercise table DOM behavior, chart data/interaction, accessibility, escaping, empty states, static print output and deterministic repeat renders in focused tests. Include at least one actual CLI path with inputs and no-output-on-failure verification.
3. Test formatter idempotence and parser-valid output; run extension host tests for source-scoped V0.4 completion, diagnostics, unsaved edits and format scope. Do not substitute unit mocks alone for host behavior.
4. Run root `bun run build`, `bun test`, extension `bun run compile`, `bun run test`, and `git diff --check`; record counts, dependency choices, limitations, and Sprint 023 handoff in planning logs. Keep any unavailable gate open.
