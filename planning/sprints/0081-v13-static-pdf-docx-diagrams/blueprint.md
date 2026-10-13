# Sprint 081 Blueprint: Static PDF and DOCX Diagrams

## Approach

1. Confirm Sprint 079's current model/preparation API and Sprint 080's final
   worktree/evidence. Obtain explicit Sprint 081 execution authorization and
   an approved file-by-file plan. Preserve the starting worktree.
2. Use the existing `PreparedReport.diagrams` records and insertion
   positions. Build one deterministic merged report sequence for each
   destination so diagrams appear at `beforeItemIndex` in stable `order`,
   interleaved correctly with narrative, source, table, and chart items.
   Imported-module diagrams retain dependency-before-entry ordering.
3. Add or reuse a safe static SVG/frame helper. Evaluate each
   `DiagramSceneModel` at `model.timeline.from` using the existing evaluator,
   validate the resulting frame, and serialize only supported diagram
   primitives and static styles. Escape all authored title, description, and
   label text; include SVG accessibility metadata where retained by the
   destination.
4. PDF integration:
   - Add an inline SVG graphic using the model's logical aspect ratio and
     available PDF content width.
   - Include the title and accessible description as readable text in the
     correct report flow, as well as SVG metadata where supported.
   - Keep page flow and neighboring items intact; test page breaks and
     diagrams near content-width/page boundaries.
5. DOCX integration:
   - Rasterize the same lower-bound SVG/frame to a PNG using the existing
     offline image tooling.
   - Embed it as a static `ImageRun` with image alt title/description and
     visible title/description text in reading order.
   - Fit within the actual Word text area while preserving aspect ratio.
     Do not create editable shapes or include animation controls.
6. Ensure failed frame evaluation, SVG serialization, or rasterization
   surfaces an explicit error before export commit. Exercise CLI and
   applicable desktop export paths with an existing destination file to
   prove failures do not replace it or leave a partial artifact.
7. Add focused tests for placement/order, initial-frame values, visible
   artifact dimensions, PDF SVG/text content, DOCX image parts/alt metadata,
   adversarial text, offline resources, and failures. Reuse canonical
   `D-CRANK-01` and `D-BATTERY-01` inputs and add aspect-ratio/page-flow cases.
8. Inspect complete generated artifacts: render PDFs to images and inspect
   their pages; open DOCX output in Microsoft Word Print Layout or an
   equivalent viewer and inspect figure placement. Verify OOXML alt text and
   relationships programmatically. Byte serialization or XML checks alone
   are insufficient visual evidence.
9. Run focused root renderer/preparation/PDF/DOCX tests and the root build.
   Run relevant desktop PDF/DOCX export tests/build where available. Create
   `builder-evidence.md` with exact commands, counts, inspected artifacts,
   screenshots, residuals, and unavailable platform/accessibility checks.
   Update ledgers without claiming end-to-end V0.13 acceptance.

## Candidate Files to Update

The explicit approved file plan must identify the exact files before edits.
Likely surfaces include:

- `src/renderer/reportPreparation.ts` only if a shared ordering/adapter
  adjustment is required; prefer its established `diagrams` and
  `beforeItemIndex` contract
- `src/renderer/reportPdf.ts`
- `src/renderer/reportDocx.ts`
- A focused shared static diagram SVG/frame helper under `src/renderer/`,
  reusing `src/runtime/diagramModel.ts` and the safe interactive SVG
  conventions in `src/renderer/diagramHtml.ts` without bringing interactive
  controls/runtime into static outputs
- `tests/reportPreparation.test.ts`, `tests/reportPdf.test.ts`,
  `tests/reportDocx.test.ts`, and `tests/renderer.test.ts`
- `desktop-app/src/bun/desktopPdfExport.test.ts` and
  `desktop-app/src/bun/desktopDocxExport.test.ts` if the shared adapter
  changes desktop export behavior or those paths lack diagram assertions
- Relevant CLI/export regression tests only if needed for atomic-failure
  evidence
- Sprint 081 `builder-evidence.md` (create during execution)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

Do not edit the diagram language/model, interactive HTML/desktop preview,
editors, examples/specification, dependency manifests, or release/version
files unless a separately approved plan amendment requires it.

## Verification

From the repository root, run:

1. `bun test tests\reportPreparation.test.ts tests\reportPdf.test.ts tests\reportDocx.test.ts tests\renderer.test.ts`
2. `bun run build`

From `desktop-app`, run focused PDF/DOCX export tests and relevant typecheck or
build if the changed files are consumed by the desktop worker. Record actual
commands and outcomes. The existing full desktop RPC sandbox assertion is
not diagram-export evidence.

For artifacts, inspect PDF page rendering and searchable title/description;
inspect DOCX visible layout and image alt metadata/relationships. Test a
lower-bound frame with values different from interior frames so selecting the
wrong time is detectable. Test an invalid lower-bound frame against both a
new destination and a pre-existing destination.

## Notes

`reportPreparation.ts` already returns ordered diagram records separately
from `PreparedReport.items`; PDF/DOCX adapters must consume them. The approved
output contract is vector SVG in PDF and a static embedded PNG in DOCX. Sprint
080's interactive output and preview success do not prove either report
format's integration.
