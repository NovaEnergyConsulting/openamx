# Sprint 081 Acceptance Criteria

Sprint 081 is complete when production PDF and DOCX report paths render every
prepared diagram as a visible, static lower-bound frame with the approved
representation, accessibility text, proportions, and reading order; export
failures remain explicit and atomic.

## Shared Report Order and Frame Semantics

- Both adapters consume `PreparedReport.diagrams` and merge diagrams at their
  `beforeItemIndex`/stable `order`. Narrative, source, table, chart, and
  imported-module diagram order is preserved.
- Every diagram is evaluated at `model.timeline.from` for both outputs,
  regardless of any prior HTML/desktop playback. A fixture whose lower,
  interior, and upper frames differ proves the lower-bound selection.
- Each diagram is static: no controls, scripts, autoplay, timeline state, or
  reader interaction appears in either format.
- Both formats use the same validated lower-bound geometry and static styles.
  Supported text/style data is escaped/encoded safely, not treated as markup.

## PDF

- The production PDF path embeds the approved inline SVG representation from
  the shared frame/model and preserves intrinsic aspect ratio without
  exceeding printable content width or cropping.
- Title and accessible description are readable in the intended report order
  and searchable/extractable from the generated PDF. Include/retain SVG
  accessibility metadata where supported by the PDF adapter; record any
  library limitation and do not claim PDF/UA or screen-reader compliance
  without direct verification.
- PDF page layout is visually inspected in rendered artifacts. Diagrams stay
  with their title/description and surrounding narrative; page-break and
  content-width cases do not clip or reorder them.

## DOCX

- The production DOCX path embeds one static PNG graphic per prepared diagram,
  rasterized from the same lower-bound SVG/frame. There are no editable native
  Word shapes, playback controls, or active code.
- Each graphic's OOXML image `altText.title` and `altText.description`
  preserve the diagram title and accessible description. Visible title and
  description text appear in report reading order around the image.
- Image extents fit the document's usable text width and preserve aspect ratio
  without crop, overflow, or unintended page splitting. Inspect both OOXML
  metadata/relationships and the rendered artifact in Word or an equivalent
  document viewer.

## Failure, Offline Behavior, and Export Integrity

- Invalid or non-finite lower-bound geometry, SVG failure, and DOCX raster
  failure surface explicit errors; no blank, omitted, placeholder, or
  success-shaped diagram is emitted.
- A failed PDF/DOCX export does not replace an existing destination or leave a
  partial temporary artifact. Destination preflight, offline/local resource
  policy, and existing atomic-write behavior remain intact.
- Outputs require no remote scripts, fonts, or diagram assets. Authored text
  cannot inject active markup into SVG, PDF, DOCX, relationship targets, or
  document metadata.

## Verification and Boundaries

- Focused preparation, PDF, DOCX, and renderer tests pass, with root build
  passing. Relevant desktop PDF/DOCX export checks pass or are explicitly
  recorded as unavailable/not run.
- Evidence includes exact commands/results, test counts, PDF render images,
  inspected DOCX output, relevant extracted text/alt metadata, output order,
  and failure/atomicity artifacts.
- Accessibility metadata is verified directly. Any unavailable formal
  screen-reader/accessibility audit, native host, or platform qualification is
  reported as such rather than inferred from successful serialization.
- No interactive HTML/desktop behavior, editor integration, V0.13 end-to-end
  acceptance, release, publication, versioning, or platform certification is
  claimed.
