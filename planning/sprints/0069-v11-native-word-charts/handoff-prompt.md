# Sprint 069 Handoff Prompt

You are the Builder for OpenAMX Sprint 069: V0.11 Editable Native Word Charts.

## Read First

- Applicable repository instructions and current worktree status; preserve all existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV11MasterSprintPlan.md` and all four Sprint 069 artifacts.
- Sprint 065 chart feasibility evidence and verbatim Lead Developer disposition; Sprint 066 accepted chart residuals; Sprint 068 acceptance, builder evidence, and disposition.
- `src/renderer/chartModel.ts`, `src/renderer/reportDocx.ts`, DOCX export flow, `tests/chartModel.test.ts`, `tests/reportDocx.test.ts`, and relevant desktop worker tests.
- `examples/kitchen-sink.amx` as a read-only regression fixture. Do not overwrite any supplied output, including `examples/kitchen-sink.pdf`.

## Authority and Entry Gates

The V0.11 master plan defines the required native-chart scope. Sprints 065, 066, and 068 are closed and satisfy the roadmap's formal dependencies. Their closure does not authorize Sprint 069 implementation.

Before changing source or test files, obtain explicit Lead Developer authorization and approval of the concrete file-by-file code plan. Start by reproducing the known numeric-line category-spacing mismatch and testing the other unresolved semantic cases in actual Windows Word desktop and Word for the Web.

The Sprint 065 evidence found that numeric line x values `10, 30, 30, 11` became equally spaced categories in Word web; the native chart API exposed only primary/secondary value-axis assignment; empty scatter series and null-coordinate scatter points were rejected in probes. If any required case remains semantically incompatible, stop and return the exact evidence for a specific Lead Developer decision. Do not proceed with coercion, omission, category substitution, null-to-zero, changed kind, changed units, fabricated points, or static-image fallback.

## Task Contract

- **objective:** Replace DOCX static chart images with editable native Word charts and embedded workbooks while preserving every accepted OpenAMX chart meaning and its accessible table alternative.
- **owns:** `src/renderer/reportDocx.ts` and a narrowly scoped chart adapter if required; chart/DOCX and desktop worker tests; `planning/state.md`, `planning/decisions.md`, `planning/questions.md`; and this sprint's `builder-evidence.md`, as bounded in the blueprint.
- **must_not:** Change AMX or shared chart semantics, coerce unsupported data, alter PDF/HTML charts, use static-image fallback, introduce external workbooks/macros/remotes, change dependencies/caps/destination security, repair unrelated residuals, or implement before both approval gates pass.
- **acceptance:** Pass every mandatory case and application check in `acceptance.md` for all four chart kinds, including numeric/DateTime axes, multiple units, null/empty cases, embedded data, accessibility/table alternative, Word desktop edit/save/reopen, and Word web preservation. A failed required semantic case blocks completion until a specific Lead Developer decision is recorded.
- **verification:** Run `bun test tests\chartModel.test.ts tests\reportDocx.test.ts tests\reportPresentation.test.ts`, `bun run build`, and `bun test`. If desktop chart-worker/export files change, from `desktop-app` run `bun test src\bun\jobWorker.test.ts src\bun\desktopDocxExport.test.ts`, `bun run typecheck`, and `bun run test`. Record inherited failures separately; conduct actual Word desktop and web checks as specified by the acceptance criteria.

## Execution and Evidence

Use the shared chart model as semantic source of truth. Maintain a requirement-to-case matrix and separate OOXML/workbook results from actual Word application results. Record OS/app versions, channels, reviewer, date, chart data, actions, prompts, saved artifacts, and failures. If a required case fails, stop and ask the Lead Developer rather than implementing a lossy path. Update the planning ledgers and Sprint 069 `builder-evidence.md` with exact statuses and residual owners. Request a separate Lead Developer disposition. Sprint 069 completion does not authorize Sprint 071, release, publication, or V0.11 completion.
