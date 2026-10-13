# Sprint 081 Handoff Prompt

You are the Builder for OpenAMX Sprint 081: Static PDF and DOCX Diagrams.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user
  changes and generated artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV13MasterSprintPlan.md`.
- All Sprint 081 artifacts: `requirements.md`, `blueprint.md`,
  `acceptance.md`, and this handoff.
- Sprint 078's approved grammar, diagnostic matrix, feasibility report, and
  SVG/PDF/DOCX representation evidence.
- Sprint 079 `builder-evidence.md`, `src/runtime/diagramModel.ts`, and the
  `PreparedReport.diagrams` ordering contract in
  `src/renderer/reportPreparation.ts`.
- Sprint 080 `builder-evidence.md` and current interactive SVG/frame behavior.
- Existing production PDF/DOCX adapters, atomic destination helpers, focused
  tests, and desktop export tests.

## Authority and Entry Gate

- Sprint 081 depends on the Sprint 079 shared model. Sprint 079 evidence
  reports its language/model increment implemented; retain the recorded
  residuals and do not infer complete AMX parity.
- Sprint 080 evidence reports interactive HTML and actual packaged desktop
  preview coverage with residuals. This does not establish PDF/DOCX behavior.
- The approved static representation is SVG in PDF and PNG embedded in DOCX.
  DOCX diagrams are not editable native shapes.
- Before changing source or tests, obtain explicit Sprint 081 execution
  authorization and approval of the concrete file-by-file plan.

## Task Contract

- Integrate ordered prepared diagrams into the actual PDF and DOCX report
  preparation/rendering paths.
- Evaluate at each diagram's lower-bound time and preserve title,
  description, dimensions/aspect ratio, surrounding narrative, report order,
  and source-derived metadata.
- Use inline SVG for PDF and a static embedded PNG for DOCX. Include visible
  title/description and DOCX image alt text; verify the actual artifact.
- Preserve local/offline resource rules, existing output validation and
  atomic destination behavior. A failed diagram/export must not silently
  disappear or replace a valid existing destination.
- Test the production CLI and applicable desktop export paths, then visually
  inspect generated PDF and DOCX artifacts. Byte generation or XML assertions
  alone are insufficient.
- Create `builder-evidence.md` with exact commands, artifacts, screenshots,
  visible layout/metadata results, failure/atomicity checks, and residuals.

## Mandatory Boundaries

- Do not include interactive controls, scripts, autoplay, or timeline state in
  static exports.
- Do not change the approved grammar, model, diagnostic semantics, HTML
  playback, desktop preview, security boundary, or output representation.
- Do not replace a failed diagram with a blank, omission, or placeholder.
- Do not weaken destination validation, atomic writes, local resource
  restrictions, or existing report/chart behavior.
- Do not claim formal PDF/UA, screen-reader, minimum-host, platform, or
  end-to-end V0.13 acceptance without direct evidence.
- Editor integration, examples/specification, release, and publication remain
  out of scope.

## Completion

Meet every criterion in `acceptance.md`. Update the planning ledgers with exact
results and any unavailable checks. Sprint 081 completion does not by itself
accept or release V0.13.
