# Sprint 023 Handoff Prompt

You are the Builder for OpenAMX Sprint 023.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.4.md`, `docs/language-spec-v0.3.md`, and `docs/language-spec-v0.2.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`
- `planning/sprints/0022-html-visuals-vscode-authoring-support/acceptance.md`
- `planning/sprints/0023-report-ready-pdf-export/requirements.md`
- `planning/sprints/0023-report-ready-pdf-export/blueprint.md`
- `planning/sprints/0023-report-ready-pdf-export/acceptance.md`
- `src/runtime/moduleLoader.ts`, `src/runtime/outputData.ts`, `src/renderer/renderHtml.ts`, `src/cli.ts`, and existing output/renderer tests

## Task Contract

**objective**: Deliver the shared offline pdfmake-based report adapter and additive `openamx export pdf` CLI command with safe destination handling, searchable report content, static tables/charts, deterministic preparation, and no-write failure guarantees.

**owns**: The focused PDF/report adapter, CLI command and diagnostics, selected package/font metadata, focused PDF/report/CLI tests, compatibility regressions, and planning records with exact evidence.

**must_not**: Re-evaluate AMX or read inputs/modules a second time, use Chrome as a hidden fallback, write before complete preparation, ship unverified fonts, change V0.2/V0.3 output behavior, implement desktop UI/RPC handlers, add DOCX, alter HTML interactions, replace VS Code providers, or claim cross-platform PDF acceptance from Linux evidence.

**acceptance**: Meet every item in `planning/sprints/0023-report-ready-pdf-export/acceptance.md`. Preserve the V0.4 spec's explicit path, page, no-write, offline, and limitation rules. Record any approved contract clarification before coding it.

**verification**:

1. After the first adapter edit, run a focused representative PDF test that checks searchable heading/table text and page count/explicit break; repair that slice before adding CLI/path failure cases.
2. Run focused destination, no-write, serialization, existing-destination preservation, input-validation, and deterministic-output tests. Inspect PDFs with a text/page parser and document exact bytes/pages/rows where relevant.
3. Run the production CLI command with valid and invalid inputs, repeated mappings, existing destinations, conflicting paths, and unsupported destinations. Confirm existing `run`/`render` and JSON/CSV tests remain green.
4. Run `bun run build`, `bun test`, and `git diff --check`. Record dependency/font/runtime versions, permission-test limitations, platform limitations, warnings, and the typed adapter boundary for Sprint 024/025.
