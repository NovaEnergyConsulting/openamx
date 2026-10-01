# Sprint 032 Blueprint: Branded PDF and DOCX Export Presentation

## Approach

1. Check the Sprint 031 gate against its acceptance checklist and actual Builder evidence. Currently only direct HTML identity resolution and separate PDF/DOCX frontmatter reads are present; they do not satisfy the shared prepared model or safe logo validation. Request Sprint 031 remediation/acceptance or an explicit Lead Developer dependency disposition before implementing Sprint 032. Record unresolved items without marking them passed.
2. Take the accepted shared resolved report sequence/identity and make both export adapters consume it behind compatible public entry points. Caller-owned CLI/Bun main-process preparation validates config/assets before serialization. Preserve the existing loader, current unsaved entry text, input mappings, destination preflight and atomic writer; test that adapters do not re-read config/files or evaluate modules/inputs/narrative again.
3. Map identity to format-native properties: PDF document info, visible report title/metadata, header/footer/page number, sanitized inline logo and contrast-safe style roles; DOCX editable headings/paragraphs/lists/tables/source, document core properties, section headers/footers, image description/adjacent alt and native page flow. Separate presentation rules per engine while sharing values/order/source visibility. Retain font license/redistribution evidence; no remote font or Chrome fallback.
4. Walk immutable report items in original document/statement order, preserving page breaks, visible source default, table header/column/row order, chart static images and textual alternatives. Refine existing table/caption/chart appearance without changing table/view binding, show-time snapshot, sorting/print data or value serialization. Use robust fallback/error for engine-specific image restrictions, not silent logo removal.
5. Add focused structure/content tests in existing `tests/reportPdf.test.ts`, `tests/reportDocx.test.ts`, CLI export tests and desktop direct RPC checks. Inspect searchable PDF text/page layout and OOXML headings/tables/media/relationships/source order rather than asserting exact bytes or pixel parity. Test masked-invalid config, traversal/symlink/missing logo, accent fallback, alternate source visibility, long tables/page breaks, analysis failure and existing-destination preservation.
6. Run root build/full tests, focused PDF/DOCX/CLI tests, relevant desktop direct/typecheck/Vite checks and `git diff --check`; record versions, counts, artifacts, engine-specific limitations and any unavailable native Office/native platform checks. Provide representative files and observations for the separate Sprint 034 Lead Developer visual review; do not sign it off in Sprint 032.

## Files to Update

- `src/renderer/reportPdf.ts`, `src/renderer/reportDocx.ts` and the accepted shared resolved report model/preparation API
- `src/cli.ts`, `desktop-app/src/bun/desktopService.ts` only where required to route validated preparation through existing safe export entry points
- `tests/reportPdf.test.ts`, `tests/reportDocx.test.ts`, `tests/pdfCli.test.ts`, `tests/docxCli.test.ts` and focused desktop RPC checks where the caller contract changes
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for actual gate outcome, results, limitations and Sprint 034 review handoff

## Notes

- Sprint 031 is a dependency, not a place to borrow unvalidated raw `report`/logo data. If it remains unaccepted, this blueprint is reviewable preparation only, not authorization for report branding exports.
- V0.4 PDF/DOCX searchable/editable guarantees and offline destination safety remain. Broad Office round trips, tagged PDF, cross-format pixels and inherited native platform/Hutch gates require separate proof and are not sprint-completion claims.
