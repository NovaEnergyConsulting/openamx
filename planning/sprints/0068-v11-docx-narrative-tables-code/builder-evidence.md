# Sprint 068 Builder Evidence (2026-10-10)

## Status and Authority

The user explicitly authorized Sprint 068 and approved the concrete file-by-file code plan before any source/test edits. Following evidence submission, the Lead Developer disposition was recorded as **ACCEPTED / CLOSED WITH RECORDED RESIDUALS (2026-10-10)**. This closes Sprint 068 only; it does not authorize Sprint 069-071, V0.11 completion, release, or publication.

## Scope and Implementation

- `src/renderer/reportDocx.ts` consumes each narrative item's shared `markdown` AST instead of splitting its plain text. It maps headings 1-6, paragraphs/runs, nested strong/emphasis/deletion, inline code and breaks, lists, blockquotes, native tables, sanitized images, rules, and page breaks to editable DOCX structures.
- Shared heading IDs map to deterministic Word-safe bookmark names; internal links use the mapped bookmark and unresolved links remain non-hyperlinked. External links use the prepared HTTP/HTTPS target. Local links use the prepared decoded path, source document directory, and validated final DOCX directory; URI path segments are encoded and query/fragment data is retained.
- Narrative tables use native Word cells, inline runs, emphasized/repeating header rows, fixed column grids at 100% page width, and row boundaries. Fenced code remains selectable and monospaced, with line breaks, tabs, and authored spaces represented in Word runs.
- Narrative images are embedded from sanitized shared-model data only, with alt text and proportional no-upscale dimensions. Source image files are not reread.
- CLI passes the source document path and `prepareDocxDestination(...).path`. Desktop protocol/service/worker pass only the host-validated `job.destination` to DOCX serialization; worker validation restricts that field to DOCX jobs and requires an absolute path. Existing destination validation, overwrite/conflict checks, caps, and atomic replacement remain in place.
- The shared model, report preparation, PDF, HTML/preview, chart path/semantics, emissions, metadata/footer/order, source visibility, table values, null/measurement display, dependencies, fonts, caps, and supplied baselines were not changed.

## Environment

- Host: Microsoft Windows 11 Home, version `10.0.26300`, build `26300`, x64.
- Bun: `1.4.2`.
- `docx`: `9.8.1` in root and desktop manifests; no dependency or lockfile changes.
- Word desktop executable file version: `16.0.20430.20146`; Office Click-to-Run platform `x64`; update channel ID `492350f6-3a01-4f97-b9c0-c7c6ddf67d60`.
- Word for the Web: Microsoft 365 Word at `word.cloud.microsoft`; the UI exposed no formal service version or channel.
- Reviewer: Builder automation via Word COM and the integrated browser. The user supplied the signed-in Word for the Web session. No human visual sign-off is claimed.

## Package and Export-Path Evidence

- Root package tests inspect `word/document.xml`, `word/numbering.xml`, document relationships, and media. Assertions cover heading styles/bookmarks, internal/external/local hyperlinks, editable table XML and repeating headers, list numbering, rules, page breaks, explicit breaks/tabs, monospaced code, sanitized image media/alt text, and image dimensions.
- The narrative-image test deletes its source image after preparation and before serialization. The DOCX still contains the sanitized embedded image, with the expected proportional extent for a 1200x1800 source.
- A 100-data-row Markdown table fixture verifies 101 serialized rows and a repeating header in OOXML.
- CLI relocation fixture puts the source and companion under `source/` and the final DOCX under `output/`; the relationship target is `../source/companions/asset%20one.txt?download=1#page`. It contains no machine-specific path or `.tmp` target, and no companion is copied.
- Desktop export fixture uses the host service and actual worker with a distinct source directory and final output directory; it verifies `../source/companions/asset%20one.txt?download=1#page` in the serialized package and verifies no companion copy or absolute/temp target.
- Representative `examples/kitchen-sink.amx` DOCX package inspection found 23 ZIP parts, 18 Word tables, 22 bookmark starts in the XML, 9 drawings, and 4 repeating table-header rows. Numbering XML contains bullet and decimal formats. Relationships contained no output/temp absolute path. The supplied `examples/kitchen-sink.pdf` remained unchanged; SHA-256: `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`.

## Word Application Evidence

- **Word desktop:** Windows 11 Home `10.0.26300`; Word `16.0.20430.20146`, x64 Click-to-Run channel ID `492350f6-3a01-4f97-b9c0-c7c6ddf67d60`. The Builder opened the generated kitchen-sink DOCX through Word automation; no repair dialog was observed. Word reported 1,316 paragraphs, 18 tables, 9 inline images, and 23 bookmarks. The Builder edited the title, saved, closed, and reopened the DOCX; the edit persisted.
- A separate disposable Word desktop local-link probe opened with one hyperlink whose address was `../source/companions/sprint068-companion.txt`. The same address persisted after save and reopen. The target was not clicked during Sprint 068; therefore no new local-link prompt/open result is claimed. Sprint 066's single relative-TXT no-prompt click remains limited to that prior fixture.
- A separate 100-data-row table fixture opened in Word desktop as one 101-row table spanning seven pages. Word reported the header row's `HeadingFormat` as true, confirming the repeat-header setting in the actual application.
- **Word for the Web:** the user-authenticated Word session opened the kitchen-sink DOCX, rendered seven pages and 6,119 words, and showed editable heading, prose, and monospaced code formatting. The UI showed the saved cloud state; no repair warning was presented. A browser screenshot and accessibility snapshot were inspected. The web session did not expose a formal app build/channel. Browser logs included Word-service UI warnings/errors during navigation; the document still rendered.
- A disposable DOCX with a validated relative TXT relationship (`Target="sprint068-companion.txt"`) opened in Word for the Web. The viewer exposed the address as `https://sprint068-companion.txt`. It was not clicked. This is not a valid or verified companion target and is not a claim of Word for the Web local-link support. Sprint 066's earlier `https://./sprint066-companion.txt` observation remains recorded; no viewer restriction was bypassed.
- Both uploaded review copies were moved to the OneDrive Recycle Bin after review. They were not permanently deleted. Local generated artifacts were confined to disposable temporary directories.

## Exact Verification

- `bun test tests\reportDocx.test.ts tests\docxCli.test.ts tests\reportPresentation.test.ts` — **10 passed, 0 failed; 102 expectations**.
- `bun run build` — **passed** (`tsc`).
- `bun test` — **419 passed, 2 failed; 2,220 expectations across 421 tests in 34 files**. Failures are the recorded `tests/editor.test.ts:73` imported `Length` declaration identity assertion and `tests/examples.test.ts:43` V0.9 help-term assertion. Both were already Sprint 067 residuals and remain outside the changed files.
- From `desktop-app`: `bun test src\bun\jobWorker.test.ts src\bun\desktopDocxExport.test.ts` — **5 passed, 0 failed; 25 expectations**.
- From `desktop-app`: `bun run typecheck` — **passed** (`hutch electrobun prepare` and `vue-tsc --noEmit`).
- From `desktop-app`: `bun run test` — **failed** at `desktop-app/tests/rpc-contract-check.ts:74`: expected two `sandbox="allow-scripts"` occurrences but found one. `App.vue` and the contract test were not changed.
- A concurrent root-suite invocation momentarily saw the existing `desktopPdfExport.test.ts` job in `committing`; that test passed in isolation and in a subsequent non-concurrent full root run. No PDF code or test was changed.

## Residuals and Owners

- Word for the Web's relative-local-link rewrite remains unresolved. Owner: Lead Developer / reviewer; do not claim web support or convert the link to HTTP/HTTPS. Decide whether further viewer evidence or a product disposition is required.
- The root editor/help assertions and desktop sandbox-count assertion remain unchanged Sprint 067 residuals. Owners: Lead Developer and the respective maintainers.
- Word desktop local-link navigation was not clicked during this sprint. The previous Sprint 066 single-file desktop result does not generalize to all file types or layouts.
- Sprint 068 is ACCEPTED / CLOSED WITH RECORDED RESIDUALS. The disposition does not authorize chart implementation, Sprints 069-071, release, publication, or V0.11 completion.
