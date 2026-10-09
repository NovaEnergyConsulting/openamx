# Sprint 068 Blueprint: Native DOCX Narrative, Tables, and Code

## Approach

1. Confirm the Sprint 066 shared-model contract, Sprint 067 closeout residuals, explicit Sprint 068 authorization, and the approved file-by-file code plan. Inspect current DOCX generation, CLI destination context, and desktop job serialization before implementation.
2. Replace only the narrative adapter path in `reportDocx.ts`. Traverse `PreparedReportItem.markdown` directly and map the shared AST to `docx` `Paragraph`, `TextRun`, numbering, `Table`, `ImageRun`, hyperlink, and bookmark constructs. Keep parsing, interpolation, sanitization, and source/view sequencing in their existing layers.
3. Keep recursive conversion small and typed:
   - Inline mapping handles text, bold/italic nesting, inline code, explicit breaks, links, and images without losing source order or child text.
   - Block mapping handles headings, paragraphs, fenced code, nested ordered/unordered lists, blockquotes, Markdown tables, rules, and page breaks.
   - Markdown table cells use the same inline conversion as paragraphs. Emitted view tables continue through the existing emission path and are never parsed as Markdown.
4. Preserve heading IDs for intra-document links by assigning each generated heading a deterministic Word-safe bookmark name and maintaining an ID-to-bookmark map. Test non-ASCII headings, duplicate headings, and unresolved fragments; do not change shared IDs or expose invalid bookmark names.
5. Encode links from the prepared kind only. External links use validated HTTP/HTTPS targets. Internal links use generated bookmarks. Local links combine the already validated decoded source-relative path with the source document directory, then relativize it to the final `.docx` parent and encode URI segments. Preserve query/fragment where present, do not emit absolute paths, and do not copy companions.
6. Carry the final output path to DOCX serialization through both production paths: use `prepareDocxDestination(...).path` in CLI and only the already host-validated destination in the desktop worker request. Preserve overwrite snapshots, conflict checks, atomic commit, output caps, and request validation. If either flow cannot reliably supply the final path, stop rather than serialize an incorrect local link.
7. Convert sanitized narrative image data to native embedded image runs without filesystem rereads. Use `fitNarrativeImage` and document content bounds for proportional no-upscale sizing. Preserve accessible alt text and verify no remote relationship is introduced.
8. Use native editable table rows/cells for narrative tables. Make headers bold and repeating where supported, constrain widths to page content, and permit sensible row breaks. Keep table cells readable and preserve inline formatting and line breaks.
9. Render code using selectable monospaced text, preserving tabs, spaces, and line endings as visibly as Word permits. Apply restrained shading/formatting only; do not add syntax highlighting. Keep existing AMX source paragraphs monospaced and unchanged.
10. Add focused JSZip tests for document XML, styles, numbering, bookmarks, hyperlinks, tables, images, and relationships; test relative links from distinct source/final directories in both CLI and desktop paths. Add desktop DOCX export coverage in `desktop-app/src/bun/desktopDocxExport.test.ts` or the closest existing DOCX job test surface.
11. Run focused tests and root build first. Run root full tests and desktop checks, explicitly comparing the known Sprint 067 failures. Open generated DOCX files in Word desktop and Word for the Web where available; record exact app/platform versions, repair warnings, table/code/link/image behavior, save/reopen results, and local-link prompts. Do not claim package/XML evidence as application evidence.
12. Preserve existing chart and emitted-data output byte/content semantics as applicable; run report presentation and representative kitchen-sink export regressions. Do not overwrite any supplied artifact. Update state, decisions, questions, and builder evidence with actual results and unpassed criteria.

## Files to Update

- `src/renderer/reportDocx.ts`
- `src/cli.ts` for validated final DOCX destination context
- `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`, and `desktop-app/src/bun/desktopService.ts` only as needed to pass the validated DOCX destination to serialization
- `tests/reportDocx.test.ts`, `tests/docxCli.test.ts`, and `tests/reportPresentation.test.ts`
- `desktop-app/src/bun/desktopDocxExport.test.ts` or the closest existing desktop DOCX test surface
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 068 `builder-evidence.md` after implementation and verification

No shared-model, PDF, HTML/preview, chart-model, dependency/lockfile, font, supplied baseline, or unrelated file changes are in scope.

## Risks and Stop Conditions

- If the `docx` API cannot produce valid editable structures or Word-safe bookmarks/links for an accepted shared node, stop with the exact case; do not silently flatten content, omit text, or create malformed relationships.
- If Word for the Web continues to expose a local DOCX link as a malformed HTTPS target, record the exact output/viewer evidence and request a product disposition before claiming web local-link support. Do not rewrite local links as external URLs or bypass viewer restrictions.
- If the host-validated final destination cannot be transported to the desktop worker without trusting an unvalidated caller value, stop before implementation of that flow.
- If native image embedding, hyperlink serialization, or `Packer` fails, surface the failure and verify an existing destination remains intact through the atomic writer.
- If actual Word desktop/web access is unavailable, record the missing app/version/review actions as blocked. OOXML inspection or another office suite does not substitute for Word evidence.
- If an inherited Sprint 067 root or desktop failure changes, isolate whether Sprint 068 caused it. Do not edit unrelated tests or app surfaces merely to make the baseline green.
- Any alteration to existing chart output, report order/identity, emitted table meaning, source visibility, null/measurement semantics, or atomicity is a regression or scope violation.

## Evidence Boundaries

- DOCX XML/relationship/media checks prove package structure only.
- Word desktop open/edit/save/close/reopen checks prove only the tested desktop version and fixtures.
- Word for the Web display/save/download checks prove only the observed service/session; its formal build/channel may not be exposed.
- Local hyperlink target serialization is not proof that every viewer will open the companion. Record prompts/restrictions without bypass.
