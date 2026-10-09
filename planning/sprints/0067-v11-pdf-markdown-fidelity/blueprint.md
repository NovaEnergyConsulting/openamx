# Sprint 067 Blueprint: PDF Markdown Fidelity

## Approach

1. Reconfirm the Sprint 066 acceptance and inspect the shared model, current PDF adapter, and CLI/desktop destination flows. Confirm explicit Sprint 067 authorization and the approved file-by-file implementation plan before changing source or tests.
2. Treat `PreparedReportItem.markdown` as the sole narrative structure input. Add a small typed traversal that converts shared inline/block nodes to pdfmake structures; do not duplicate parsing, interpolation, asset reads, or safety validation.
3. Preserve document order while mapping headings, paragraphs, inline runs, code, lists, nested blockquotes, tables, rules, images, and page breaks. Keep existing heading/title styling recognizable, use readable wrapping and restrained spacing, and maintain searchable/selectable text.
4. Render link nodes by their prepared kind only:
   - External links become URI annotations only for validated HTTP/HTTPS targets.
   - Internal links target the shared model's generated heading IDs. Assign matching IDs to PDF headings, including deterministic duplicate headings.
   - Local links use the validated source-relative target plus the actual final PDF directory to create an encoded relative URI. Keep source and output bases distinct; do not use the atomic temporary path, emit a file URI, or expose an absolute source path.
5. Pass the validated final output path from both export surfaces to PDF preparation. The CLI already has the result of `preparePdfDestination`; desktop host code validates the chosen destination before dispatching the job. Carry only that validated destination context into the PDF worker and leave host-side atomic commit and overwrite checks intact. If a reliable final destination cannot reach serialization, stop and return the exact gap rather than emitting an incorrect link.
6. Embed only the sanitized image data supplied by the shared narrative model. Use proportional no-upscale fitting within the printable page bounds. Keep captions/alt information available in the PDF representation and do not expand image formats or fetch external resources.
7. Keep existing source/view items routed through their current PDF emission paths. In particular, do not parse emitted table values as Markdown or alter chart models, SVG generation, chart table alternatives, report identity, footer, fonts, or item order.
8. Extend existing PDF tests with focused fixtures for every supported node, LF/CRLF equivalence, soft/hard breaks, code whitespace, literal raw HTML/interpolation, page-break behavior, duplicate/internal links, local links from a different final output directory, and rejected targets.
9. Verify generated PDF structure and PDF.js text/annotation results, not only successful serialization. Include multi-page Markdown tables with repeated headers, a long prose/code case, proportional portrait/landscape images, and a generated kitchen-sink regression PDF in a disposable location. Record visual inspection separately from text/package evidence; preserve the supplied `examples/kitchen-sink.pdf`.
10. Run focused tests first, then root build and suite. If desktop files change, run desktop typecheck and RPC contract tests. Update state, decisions, questions, and Sprint 067 builder evidence with exact outcomes and any unpassed checks.

## Files to Update

- `src/renderer/reportPdf.ts`
- `src/cli.ts` for the validated final PDF destination context
- `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`, and `desktop-app/src/bun/desktopService.ts` only as needed to carry the validated destination into PDF serialization
- `tests/reportPdf.test.ts`, `tests/pdfCli.test.ts`, `tests/reportPresentation.test.ts`, and desktop PDF/job contract tests as needed
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 067 `builder-evidence.md` after implementation and verification

No shared-model, DOCX, HTML/preview, chart-model, dependency/lockfile, font, supplied-baseline, or unrelated files are in scope.

## Risks and Stop Conditions

- If pdfmake cannot preserve a required structure or safe internal/local link behavior without changing the approved contract, stop and report the exact case; do not silently flatten or discard it.
- If source-relative link data and final destination context cannot be combined without leaking machine paths or using a temporary path, stop before PDF emission and request direction.
- If destination context cannot be passed through the desktop worker from an already validated host request, do not trust an authored path or bypass service validation.
- If an asset or malformed structure fails during PDF generation, surface the existing clear error and preserve any existing destination through the atomic export path.
- If a PDF viewer blocks a local link due to its trust policy, record the viewer/version and restriction. Do not weaken the viewer policy, infer that the URI is wrong from that restriction alone, or claim that link opening passed.
- Any change to chart output, identity/footer, source/view order, measurements, table values, or atomicity is a regression and must be repaired within scope or escalated; do not broaden scope to address unrelated behavior.
