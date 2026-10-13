# Sprint 081 Requirements: Static PDF and DOCX Diagrams

## Goal

Integrate Sprint 079's shared diagram model into the existing PDF and DOCX
report-preparation/rendering pipelines. Produce a static frame at each
diagram's declared lower-bound time, preserve accessible text, proportions,
report order, and surrounding content, and fail explicitly and atomically
when a diagram cannot be rendered.

## Dependencies and Authority

- Sprint 079 is reported implemented with the immutable scene model and
  `PreparedReport.diagrams`, including `beforeItemIndex` and stable order.
  Its focused tests and build passed; broader AMX AST/value and performance
  residuals remain recorded.
- Sprint 080 is reported implemented for standalone HTML and desktop preview.
  Its runtime/preview changes do not authorize changes to those surfaces in
  Sprint 081. The full desktop RPC check retains a recorded assertion
  mismatch; manual screen-reader review and minimum-host/cross-platform
  qualification remain unavailable or untested.
- This sprint depends on Sprint 079's model, not Sprint 080's interactive
  controls. Use Sprint 080 evidence only for the approved representation and
  security/resource context; do not infer PDF/DOCX acceptance from HTML or
  desktop-preview results.
- Scope authority: `planning/plan-openamxV13MasterSprintPlan.md`.
- Read `planning/state.md`, `planning/decisions.md`, `planning/questions.md`,
  `.agents/main.md`, and the current worktree status.
- Review the approved Sprint 078 contract and representation evidence:
  `planning/sprints/0078-v13-diagram-contract-feasibility-gate/grammar-examples.md`,
  `diagnostic-matrix.md`, and `feasibility-report.md`.
- Review Sprint 079 requirements/evidence and existing
  `reportPreparation.ts`, `reportPdf.ts`, `reportDocx.ts`, destination/export
  code, and their focused tests.
- Obtain separate explicit Sprint 081 execution authorization and approval of
  the concrete file-by-file plan before changing production code or tests.

## In Scope

- Integrate `PreparedReport.diagrams` into PDF and DOCX generation, preserving
  each prepared diagram's `beforeItemIndex`/order relative to narrative,
  source, table, and chart content, including imported-module diagrams.
- Evaluate each static frame at the diagram timeline's lower bound using the
  validated Sprint 079 model; use the same frame meaning for both formats.
- Render PDF diagrams as the approved inline SVG representation. Render DOCX
  diagrams as static embedded PNG graphics rasterized from the same SVG/frame.
  DOCX diagrams are not editable native Word shapes and include no controls,
  playback state, or timeline UI.
- Preserve and expose the model title and accessible description in both
  outputs. PDF title/description remain readable in document order alongside
  the graphic. DOCX also stores the description as image alt text and retains
  visible title/description text.
- Keep diagram dimensions within each destination's printable/content width,
  preserve intrinsic aspect ratio, avoid cropping, and keep diagrams in
  correct report reading order with surrounding narrative.
- Preserve existing output validation, offline/local resource policies,
  destination preflight, atomic writes, and explicit error reporting.
- Fail visibly on invalid/unrenderable lower-bound geometry or static graphic
  generation. Do not silently omit, blank, or substitute a diagram.
- Test actual generated PDF and DOCX artifacts for visual appearance,
  dimensions, order, text/accessibility metadata, and failure behavior.

## Out of Scope

- Interactive controls, animation, timeline state, HTML renderer, or desktop
  preview changes; these belong to Sprint 080.
- Parser, type checker, runtime semantics, formatter, editor clients, or
  language-documentation changes.
- Editable Word shapes, changing the approved PDF SVG or DOCX PNG
  representation, new remote assets, or broad accessibility certification.
- Release engineering, version changes, publication, or platform
  certification.

## Constraints and Residuals

- Use the static representations approved in Sprint 078: inline SVG for PDF
  and embedded PNG for DOCX. Reuse a common safe frame/SVG serialization path
  where appropriate; do not duplicate geometry/evaluation semantics.
- Select exactly the lower-bound frame, not a midpoint or the current
  interactive time. Do not include playback controls or interactive scripts.
- Preserve `PreparedReport.diagrams` order and insertion positions. Do not
  reorder diagrams relative to text, tables, charts, source blocks, or
  imported-module output.
- Keep diagram-derived text as text/metadata, not active markup. Preserve
  output-local font and asset policies; no network resource may be required.
- The renderer must surface failures before atomic destination replacement.
  Existing PDF/DOCX destination validation and atomic-write contracts remain
  authoritative.
- The Sprint 080 full desktop RPC assertion failure is an existing
  test-contract residual, not permission to alter sandbox behavior or an
  inferred PDF/DOCX failure. Record relevant root and desktop export outcomes
  separately.
- If a final PDF accessibility property cannot be represented by the current
  PDF library, preserve the title and description as accessible text in
  reading order and record any limitation. Do not claim formal PDF/UA or
  screen-reader certification without direct evidence.
