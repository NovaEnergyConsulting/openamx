# Sprint 067 Builder Evidence (2026-10-09)

## Status and Authority

The Lead Developer explicitly authorized Sprint 067 and approved the concrete file-by-file code plan before any source/test edits. The PDF integration and verification work described below is complete. **Lead Developer disposition (2026-10-09): ACCEPTED / CLOSED WITH RECORDED RESIDUALS.** This closes Sprint 067 only and does not authorize Sprints 068-071, V0.11 completion, release, or publication.

## Implementation

- `src/renderer/reportPdf.ts` now traverses the shared `PreparedReportItem.markdown` AST rather than splitting narrative text into lines. It maps heading IDs, paragraphs, nested formatting, inline/fenced code, ordered/nested lists, blockquotes, Markdown tables, rules, and page breaks to pdfmake structures.
- Valid external links become HTTP/HTTPS annotations; internal links target the shared heading IDs, including duplicate-heading IDs. Rejected/missing links remain non-clickable and retain shared preparation diagnostics.
- Local links combine the prepared source-relative path with the source document directory and the final PDF output directory. The emitted annotation is a relative URI with encoded path segments and retained query/fragment. No absolute machine path, `file:` URL, atomic temporary path, or companion copy is emitted.
- CLI passes the source document path and `preparePdfDestination(...).path`. Desktop passes the service-validated destination through the PDF-only worker request and uses the worker's entry-document path as source context. Existing host destination checks, overwrite snapshots, atomic replacement, and output caps are unchanged.
- Narrative images use only the sanitized data URI and dimensions from the shared model. `fitNarrativeImage` constrains the PDF dimensions without upscaling. The image test removes the original image files after shared preparation and before PDF serialization.
- The source/view emission branches, chart SVG renderer, emitted table values, title/identity/footer, page numbering, Roboto configuration, PDF URL denial, and font-only local access policy remain unchanged. No shared model, DOCX, HTML/preview, chart semantics, dependency/lockfile, font, or supplied-baseline changes were made.

## Exact Verification

- `bun test tests\reportPdf.test.ts tests\pdfCli.test.ts tests\reportPresentation.test.ts` — **13 passed, 0 failed; 139 assertions**.
- `bun test tests\reportPdf.test.ts tests\pdfCli.test.ts tests\reportPresentation.test.ts tests\examples.test.ts` — **20 passed, 1 failed; 274 assertions**. The failure is `tests/examples.test.ts:43`, the V0.9 help-topic `terms` assertion. The same failure reproduces in isolation; that file and its help implementation were not changed.
- `bun run build` — **passed** (`tsc` exited 0).
- `bun test` — **415 passed, 2 failed; 2,174 assertions across 417 tests in 33 files**. The failures are `tests/editor.test.ts:73` (missing imported `Length` declaration fact) and `tests/examples.test.ts:43` (V0.9 help-topic `terms` assertion). Both reproduced with `bun test tests\editor.test.ts tests\examples.test.ts`; neither owning file was changed.
- From `desktop-app`: `bun test src\bun\jobWorker.test.ts src\bun\desktopPdfExport.test.ts` — **5 passed, 0 failed; 23 assertions**.
- From `desktop-app`: `bun run typecheck` — **passed** (`hutch electrobun prepare` and `vue-tsc --noEmit`).
- From `desktop-app`: `bun run test` — **failed** at `desktop-app/tests/rpc-contract-check.ts:74`: expected two `sandbox="allow-scripts"` occurrences but found one. `App.vue` and the contract test are unchanged; this unrelated mismatch was not repaired.

## PDF and Viewer Evidence

- PDF.js tests inspected searchable text, page count/order, repeated Markdown-table headers, heading destinations, external/local annotations, and the emitted chart/table content. CLI and desktop fixtures place the source and final PDF in different directories and confirm encoded final-output-relative local targets.
- PDF.js reports the relative local target as `unsafeUrl`; this is annotation evidence only. No attempt to open a generated local link in an installed viewer was made, and no viewer trust setting was bypassed. Sprint 065 records Chromium's refusal to open a relocated PDF from an untrusted folder; that restriction remains in force.
- No visual screenshot or raster-page review was performed. PDF structures, extracted text, PDF.js annotations, image alt/data and fitted dimensions, and table/page flow were verified automatically.
- `examples/kitchen-sink.pdf` was read-only. SHA-256 before and after: `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`.
- Test-generated PDFs and fixtures were confined to disposable locations and cleaned. No generated PDF replaced the supplied baseline.

## Residuals and Owners

- Root `editor.test.ts` and `examples.test.ts` failures remain unaddressed. Owner: Lead Developer / the respective editor and help test maintainers.
- Desktop RPC contract sandbox-count assertion remains unaddressed. Owner: Lead Developer / desktop contract-test maintainer.
- Visual review and any actual viewer-open evidence remain unverified. Owner: Lead Developer / reviewer, subject to existing viewer trust restrictions.
- Separate Lead Developer disposition is pending. Builder completion does not authorize downstream sprints.
