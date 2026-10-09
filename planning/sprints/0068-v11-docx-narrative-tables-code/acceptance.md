# Sprint 068 Acceptance Criteria

Sprint 068 is complete only after Builder evidence and a separate Lead Developer disposition. It does not authorize Sprint 069 chart implementation, V0.11 completion, release, or publication.

## Native DOCX Narrative

- The DOCX adapter consumes the shared narrative AST directly and emits editable Word paragraphs/runs, not flattened Markdown text.
- Headings 1-6, paragraphs, nested strong/emphasis, inline code, line breaks, ordered/nested lists, nested blockquotes, horizontal rules, and page breaks preserve authoring order and remain readable.
- Authored prose breaks and blank-line paragraph boundaries remain visible. LF and CRLF fixtures are equivalent. Fenced code remains selectable and monospaced, with its line breaks, spaces, and tabs preserved observably.
- Raw HTML is literal/inert; interpolation remains text and is never reparsed. Captured source/view emissions and emitted table cells retain their existing plain-data behavior.
- A Markdown table is a native editable Word table. Inline formatting and breaks work in cells; the header is emphasized and repeats where supported; widths fit page content and multi-page continuation remains readable.
- Shared heading IDs map to deterministic, valid Word bookmarks. Valid internal links target the correct bookmark, including duplicate headings; unresolved fragments produce no hyperlink.
- Existing title/metadata/footer, source visibility, item order, emitted table contents, null/measurement values, and current chart graphics/data tables remain unchanged.

## Links, Images, and Export Paths

- Valid HTTP/HTTPS links become external hyperlink relationships; rejected schemes/targets do not become active relationships and retain the shared preparation diagnostics.
- Local links serialize as relative OOXML hyperlink targets calculated from the validated source-relative target to the final `.docx` directory. Query/fragment and encoded path segments are preserved. No absolute machine path or `file:` URL is serialized and no companion is copied.
- Tests use separate source and final-output directories and confirm that relocated DOCX/companion bundles resolve using the same relative layout.
- CLI and desktop DOCX serialization receive the validated final destination context. Existing destination validation, overwrite/conflict checks, output cap, and atomic replacement behavior remain intact.
- Only shared sanitized PNG/JPEG bytes are embedded. Images include appropriate alt text and proportional no-upscale dimensions within page bounds; no source-path reread or remote image relationship is introduced.
- Invalid preparation/image/package errors are surfaced and do not replace an existing destination.
- Word desktop and Word for the Web observations are recorded with exact available OS/app/channel information, reviewer, actions, prompts, and persistence results. A viewer restriction is recorded, never bypassed. OOXML tests are not represented as Word application evidence.

## Verification and Residuals

- Focused root DOCX, DOCX CLI, and report-presentation tests pass; root build passes. Focused desktop DOCX/worker tests and desktop typecheck pass when desktop files are touched.
- Root full-suite and desktop contract-test outcomes are run and recorded against Sprint 067's known residuals: `tests/editor.test.ts:73`, `tests/examples.test.ts:43`, and `desktop-app/tests/rpc-contract-check.ts:74`. These failures are not silently counted as passes or repaired unless shown to be caused by Sprint 068. No new unexplained regression remains.
- Builder evidence reports exact test counts, commands, Word evidence, artifacts, residuals, and owners. No claim of Word web local-link support is made if it remains malformed or unverified.
- No native chart, PDF, HTML/preview, shared model, parser/evaluator, dependency/lockfile, font, output cap, supplied baseline, unrelated cleanup, or release/publication change occurs.
- Sprint 069 remains gated by its separate chart-semantic and Word-application requirements. Sprint 068 completion alone does not authorize it.
