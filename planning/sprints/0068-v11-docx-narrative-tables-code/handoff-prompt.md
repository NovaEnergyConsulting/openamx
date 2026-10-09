# Sprint 068 Handoff Prompt

You are the Builder for OpenAMX Sprint 068: V0.11 Native DOCX Narrative, Tables, and Code.

## Read First

- Applicable repository instructions and current worktree status; preserve existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV11MasterSprintPlan.md` and all four Sprint 068 artifacts.
- Sprint 065 contract/evidence; Sprint 066 accepted model, builder evidence, and Word local-link observations; Sprint 067 acceptance, implementation decisions, builder evidence, and known verification residuals.
- `src/renderer/narrativeModel.ts`, `src/renderer/reportPreparation.ts`, `src/renderer/reportDocx.ts`, the CLI DOCX destination path, and desktop DOCX worker/service path.
- `tests/reportDocx.test.ts`, `tests/docxCli.test.ts`, `tests/reportPresentation.test.ts`, and desktop job/export tests.
- `examples/kitchen-sink.amx`; never overwrite the supplied `examples/kitchen-sink.pdf`.

## Authority and Scope

The V0.11 master plan defines product scope. Sprint 068 has a formal dependency on Sprint 066 and owns native DOCX narrative integration only: editable paragraphs/runs, bookmarks/links, lists, tables, images, rules, code, and final-output-relative local link targets. Preserve existing report metadata/footer/order, source visibility, emitted table values, null/measurement display, chart images/data tables, and atomic exports.

Sprint 067 is ACCEPTED / CLOSED WITH RECORDED RESIDUALS, but that disposition does not authorize Sprint 068. Before editing source or test files, obtain explicit Sprint 068 authorization and approval of the concrete file-by-file code plan. If either is absent, stop before those edits and report the missing gate.

## Mandatory Boundaries

- Consume the Sprint 066 shared narrative AST; do not duplicate Markdown parsing or change shared-model behavior.
- Use only sanitized image data and already-validated link targets. Pass source and final-output context from the CLI and from the host-validated desktop DOCX request; never use an atomic temp path, serialize machine-specific absolute paths, copy companions, or bypass destination checks.
- Preserve `.pdf`, `.png`, `.jpg`, `.jpeg`, `.txt`, `.csv`, and `.json` as the accepted local-link extension set. Do not convert local links to HTTP/HTTPS to accommodate a viewer.
- Do not change the existing chart adapter or chart semantics; Sprint 069 remains separately gated.
- Do not change PDF, HTML/preview, AMX syntax/evaluation, report preparation, dependencies, lockfiles, fonts, output caps, or supplied baselines.
- Word for the Web previously exposed a relative local link as `https://./sprint066-companion.txt`; recheck and record actual behavior. Never claim this is a valid link or bypass viewer restrictions.
- Preserve Sprint 067's known root and desktop test residuals unless a failure is demonstrably caused by your changes. Do not perform unrelated repairs.

## Task Contract

- **objective:** Replace line-based DOCX narrative conversion with native editable rendering of the shared Markdown model, preserving DOCX report and export contracts.
- **owns:** DOCX renderer, CLI DOCX destination context, narrowly required desktop DOCX job context, related root/desktop DOCX tests, planning ledgers, and this sprint's `builder-evidence.md`, as listed in `blueprint.md`.
- **must_not:** Change chart rendering/meaning, PDF or HTML/preview, the shared model, emitted report data/order, destination security, dependencies/fonts/caps, or inherited unrelated failures; do not implement before both approval gates pass.
- **acceptance:** Meet the observable criteria in `acceptance.md`, including native editable tables/code, valid bookmarks and links, sanitized images, final-output-relative local targets through both export paths, actual Word evidence, and preserved chart/emission/atomic behavior.
- **verification:** Run `bun test tests\reportDocx.test.ts tests\docxCli.test.ts tests\reportPresentation.test.ts`, `bun run build`, and `bun test`. If desktop files change, from `desktop-app` run `bun test src\bun\jobWorker.test.ts src\bun\desktopDocxExport.test.ts`, `bun run typecheck`, and `bun run test`. Record the known Sprint 067 failures accurately; run only the desktop test paths that exist or add the named DOCX export test in scope.

## Execution and Evidence

Run focused checks first. Inspect package XML/relationships/media and then review representative generated DOCX files in Word desktop and Word for the Web where available. Record exact versions/channels, reviewer, steps, repair warnings, formatting/editability, save/reopen behavior, and local-link prompts. Distinguish package evidence from actual Word evidence. Keep generated files in disposable locations and do not delete pre-existing artifacts. Update the planning ledgers and Sprint 068 `builder-evidence.md`; request a separate Lead Developer disposition. Sprint 068 completion does not authorize Sprints 069-071.
