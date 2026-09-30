# Sprint 023 Blueprint: Report-Ready PDF Export

## Approach

- Confirm the Sprint 022 static representation and `ViewEmission` contract before editing. Build a small in-memory report fixture containing headings, narrative, visible AMX source, a multi-page table, a static chart, and an explicit page-break marker. Run a focused PDF preparation/inspection test immediately after the first adapter edit.
- Add a pure, typed report model/adapter boundary that consumes the evaluated document, final narrative environment, and ordered view emissions without re-evaluating AMX. Keep source-order placement and the Sprint 022 static table/chart data. The same boundary must be callable by CLI now and desktop main process later.
- Pin/use pdfmake 0.3.11 in the owning package, load only approved local fonts, and verify font redistribution terms. If bundled Roboto terms cannot be established, replace the font files with project-approved redistributable fonts and record the exact source/license. Do not silently ship unverified font assets.
- Map narrative Markdown/HTML-safe content to report paragraphs/headings, visible formatted source to escaped report code text, tables to declaration-order columns/rows with repeated headers, and charts to local SVG/static graphics plus textual data tables. Preserve empty/no-data states and original show/document order. Keep interactive controls out of PDF.
- Define deterministic document defaults: A4 portrait, 18 mm margins, page numbers, local font setup, fixed colors/styles, explicit page breaks, and stable table/chart data ordering. Inspect generated PDFs with pdfjs-dist or equivalent for searchable text, page count, required rows/headings, page breaks, and absence of remote URLs; visual inspection remains evidence where available, not a pixel-parity claim.
- Add `export pdf` CLI parsing and route it through the existing module/input/check/evaluation barrier. Validate destination parent/canonical path/symlink/conflicts before and during preparation; write a unique same-directory temporary file, close it, then atomically rename. Exercise pre-existing destination preservation and cleanup on each failure class.
- Keep diagnostics stable and actionable. Map invalid destination/extension/conflict to AMX6001 and engine/layout/serialization/filesystem failures to AMX6002 with destination/file context where known. Ensure invalid analysis and failed PDF preparation cannot leave a new or replaced destination.
- Add focused unit/integration tests, then run root compatibility tests and existing output tests. Do not add desktop UI or change VS Code providers. Record exact commands, byte/page/text evidence, package/font decisions, and limitations in planning records.

## Files to Update

- `package.json` and lockfile for the selected PDF dependency, if root ownership is required
- `src/` focused report/PDF adapter, CLI command, destination/diagnostic helpers, and only narrowly necessary renderer model helpers
- `tests/` focused PDF/report/CLI tests plus existing output/regression suites
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `docs/language-spec-v0.4.md` only for approved factual corrections
- Isolated proof/package metadata only where required to document font licensing and reproducibility; do not commit generated PDFs or native desktop outputs

## Notes

Sprint 020 selected pdfmake 0.3.11 after a 22,702-byte, two-page searchable proof on Bun/Linux. Chrome 152.0.7977.82 remains a comparison only and must not become a hidden fallback. PDF generation is a separate static presentation from interactive HTML; do not pass browser UI state into the PDF model. DOCX remains optional and is not part of this sprint.
