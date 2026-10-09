# Sprint 067 Handoff Prompt

You are the Builder for OpenAMX Sprint 067: V0.11 PDF Markdown Fidelity.

## Read First

- Applicable repository instructions and current worktree status; preserve all existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV11MasterSprintPlan.md` and all four Sprint 067 artifacts.
- Sprint 065 contract/evidence and Sprint 066 accepted requirements, acceptance, and builder evidence.
- The PDF adapter and tests, shared narrative model, CLI destination flow, and desktop worker/service destination flow named in the blueprint.
- `examples/kitchen-sink.amx` and `examples/kitchen-sink.pdf`; the supplied PDF is read-only and must never be overwritten.

## Authority and Scope

The V0.11 master plan defines product scope. Sprint 067 depends on Sprint 066 and owns only PDF integration of the approved shared narrative model, including PDF-safe links and images. Preserve report identity/order, searchable content, source/view separation, chart output, emitted table meaning, page breaks, fonts, and atomic exports.

Sprint 066's ACCEPTED / CLOSED disposition does not authorize downstream implementation. Before editing source or test files, obtain explicit Sprint 067 authorization and the repository-required approval of the concrete file-by-file code plan. If either is absent, stop before those edits and report the missing gate.

## Mandatory Boundaries

- Use the prepared shared narrative AST; do not implement a second Markdown parser or change the shared model.
- Supply PDF link materialization with the validated source-document context and the validated final PDF destination for both CLI and desktop exports. Never use the atomic temp path. Do not serialize absolute machine paths, copy companion files, or bypass desktop destination checks.
- Do not fetch remote resources. Keep pdfmake URL access disabled and local file access font-only. Embed only sanitized narrative image data from preparation.
- Do not change DOCX, HTML/preview, chart semantics/rendering, AMX language/evaluation, emitted values, output caps, dependencies, lockfiles, fonts, or the supplied baseline.
- Preserve actual viewer restrictions. Record them; do not bypass trust settings or treat PDF.js annotations as proof of successful local-file opening.

## Task Contract

- **objective:** Replace line-based PDF narrative conversion with faithful rendering of the Sprint 066 shared Markdown model while preserving existing report and atomic export behavior.
- **owns:** The renderer, CLI PDF export context, narrowly required desktop PDF worker/service job context, related PDF/CLI/presentation/desktop contract tests, planning ledgers, and this sprint's `builder-evidence.md`, as listed in `blueprint.md`.
- **must_not:** Change shared model semantics, DOCX/HTML/preview, charts, report data/order, output limits, dependencies/fonts, destination security, or the supplied PDF; do not implement before both approval gates pass.
- **acceptance:** Meet every observable criterion in `acceptance.md`, including final-output-relative local-link annotations across both export paths and unchanged chart/emission/atomic behavior.
- **verification:** Run `bun test tests\reportPdf.test.ts tests\pdfCli.test.ts tests\reportPresentation.test.ts tests\examples.test.ts`, `bun run build`, and `bun test`. If desktop worker/service/protocol files change, also run `bun run typecheck` and `bun run test` from `desktop-app`. Record exact outcomes and any visual/viewer evidence in `builder-evidence.md`.

## Execution and Evidence

Run focused checks first and inspect generated PDFs in disposable locations. Verify structure, searchable text, links, page flow, image sizing, and charts; distinguish automated/PDF.js evidence from actual visual or viewer checks. Do not overwrite or delete pre-existing artifacts. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with the implementation status, exact residuals, and owners. Request a separate Lead Developer disposition; Builder completion does not self-accept the sprint or authorize Sprints 068-071.
