# Sprint 071 Builder Evidence (2026-10-10)

## Authority and Scope

- Before edits, the user explicitly authorized Sprint 071 and approved the file-by-file plan through the authorization gate.
- The initial Sprint 071 worktree was clean. Sprint 071's approved closeout changes were documentation, the stale chart guidance in `examples/kitchen-sink.amx`, planning ledgers, and this evidence file; no product feature was added.
- After the initial FAIL was recorded, the user separately authorized the DOCX chart-width fix plan. That follow-up changes only `src/renderer/reportDocx.ts`, `tests/reportDocx.test.ts`, and `desktop-app/src/bun/desktopDocxExport.test.ts`, plus the chart-width warning in documentation/evidence. It does not change chart semantics, the shared chart model, PDF/HTML/preview renderers, dependencies, or security boundaries.
- The Lead Developer subsequently **ACCEPTED / CLOSED Sprint 071 and declared V0.11 finished** (2026-10-10). This evidence remains Builder evidence; recorded surface statuses are not retroactively changed. No release, publication, or platform certification is inferred.

## Environment and Inputs

- OS: Windows 10 Home, version `2009`, build `26300`, x64.
- Bun `1.4.2`; Node.js `24.13.1`; Playwright `1.63.0`; Chromium `153.0.8010.12`.
- Word desktop executable: `16.0.20430.20146`; Acrobat Reader: `26.2.21931.0`.
- Report fixture: the finalized `examples/kitchen-sink.amx`, with its frontmatter identity and no input mappings. The same source was exported as CLI PDF/DOCX/HTML, desktop-service PDF/DOCX, and desktop-service preview. The source includes captured chart/table views.
- Disposable outputs and screenshots are in the session artifact directory `files/sprint071/`; no generated output was written over the supplied example PDF.
- Supplied `examples/kitchen-sink.pdf` SHA-256 before and after: `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`.

## Requirement-to-Evidence Matrix

Statuses apply to the named surface and evidence only; adjacent formats are not used to infer a pass.

| Requirement / input | CLI PDF | Desktop PDF | CLI DOCX | Desktop DOCX | Standalone HTML | Desktop preview | Evidence / residual |
|---|---|---|---|---|---|---|---|
| Same source, report identity, narrative/source/view order, and emitted values | PASS | PASS | PASS | PASS | PASS | PASS | All outputs came from the same kitchen-sink source with no input mappings. CLI and desktop PDF text matched page-by-page (22/22 pages); CLI and desktop DOCX document text matched exactly (42,502 characters). HTML and worker-preview title, heading, chart count, and break count matched. |
| Shared Markdown, visible line breaks, interpolation, inert authored HTML | PASS | PASS | PASS | PASS | PASS | PASS | Root renderer/preparation/PDF/DOCX/presentation tests passed; HTML and preview each rendered 199 break elements. Preview output was produced by the desktop worker/service, not the native app window. |
| Local sanitized images and offline output | PASS | PASS | PASS | PASS | PASS | PASS | Focused preparation, PDF, DOCX, and Playwright tests cover PNG/JPEG containment, sanitization, alt text, offline embedding, and no remote requests. The kitchen-sink fixture itself contains no narrative images (0 images in each direct HTML rendering); direct image visuals for this fixture are NOT RUN. |
| Searchable PDF text, page flow, tables, footers, Markdown layout, and chart output | PASS | PASS | NOT RUN | NOT RUN | NOT RUN | NOT RUN | CLI and desktop PDFs each had 22 searchable pages with matching text. Acrobat 26.2.21931.0 visually inspected CLI `acrobat-kitchen-sink-page1-final.png` / `acrobat-kitchen-sink-page12.png` and desktop `acrobat-desktop-pdf-page1.png` / `acrobat-desktop-pdf-chart-page.png` (bar chart and complete table). The displayed desktop page number was 10; the artifact filename is descriptive rather than a page index. |
| PDF local-link annotation and viewer opening | PASS | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | A disposable allowed `.txt` link probe emitted the relative annotation `../../../../../Programming/openamx/examples/s071-viewer-companion.txt`. Clicking it in Acrobat opened the safe companion in Notepad with no trust prompt; screenshots: `acrobat-viewer-link-probe.png`, `local-companion-opened.png`. This closes only one relative TXT case in Acrobat; no trust setting was bypassed. The kitchen-sink `.md` link is not allowlisted and is non-clickable. |
| DOCX package structure, native charts, embedded data, and alternatives | NOT RUN | NOT RUN | PASS | PASS | NOT RUN | NOT RUN | Both DOCX packages had 54 parts, 18 tables, 23 bookmarks, 9 native charts, 9 embedded workbooks, 9 drawing descriptions/titles, 0 external workbook relationships, and 0 macro parts. Package text matched exactly across CLI/desktop outputs. The kitchen-sink `.md` link was not serialized as an active hyperlink. |
| Word desktop opens and native edits survive save/close/reopen | NOT RUN | NOT RUN | PASS | NOT RUN | NOT RUN | NOT RUN | Word `16.0.20430.20146` opened the finalized CLI DOCX read-only without an observed repair warning and exposed 9 native charts and 18 tables. Edits to one chart in each representative type persisted after save, close, and reopen: bar `2 -> 2.5`, column `2 -> 2.5`, numeric-X line/XY scatter `2 -> 2.5`, DateTime line `2 -> 2.5`, and scatter `1.5 -> 2`. |
| Word desktop chart fit before follow-up | NOT RUN | NOT RUN | FAIL | NOT RUN | NOT RUN | NOT RUN | The pre-fix Word screenshot `word-docx-numeric-line-final.png` showed the final x-axis tick clipped. Word COM measured all 9 frames at 540 pt vs a 451.3 pt text area. This historical FAIL is retained. |
| Word desktop chart fit after separately authorized follow-up | NOT RUN | NOT RUN | PASS | NOT RUN | NOT RUN | NOT RUN | All 9 finalized CLI DOCX charts measure 450 pt against a 451.3 pt text area. `word-docx-numeric-line-remediated.png` shows the full x-axis through 35 and page margin. Desktop package extents are tested, but the desktop DOCX was not separately opened in Word. |
| Word for the Web chart display/save/download and numeric-X null-gap visual | NOT RUN | NOT RUN | BLOCKED | BLOCKED | NOT RUN | NOT RUN | `word.cloud.microsoft` required sign-in; no user account was available in the browser session, and no document was uploaded. No null-gap screenshot, save/download, or downloaded-copy desktop check was performed. Prior relative DOCX links were rewritten as HTTPS-like targets; Word Web local companion support is not claimed. Owner: Lead Developer / Word reviewer. |
| Formal screen-reader review of chart description and full table alternative | NOT RUN | NOT RUN | BLOCKED | BLOCKED | NOT RUN | NOT RUN | Windows Narrator is installed, but no formal screen-reader reviewer/actions/result were available. Package descriptions or accessibility-tree inspection are not a substitute. Owner: Lead Developer / accessibility reviewer. |
| Standalone HTML/preview offline charts, safe targets, and freshness/security | NOT RUN | NOT RUN | NOT RUN | NOT RUN | PASS | PASS | Browser inspection of both same-input HTML files found 10 canvases, 199 breaks, 0 images, 0 links, and no external requests. The preview worker returned a 64-character token and did not expose its target map. Four Playwright UI tests passed; two desktop service callback tests passed. The UI tests use the documented Vite/Playwright harness. |
| Actual Electrobun native confirmation and OS opener; Open/Cancel ordering | NOT RUN | NOT RUN | NOT RUN | NOT RUN | NOT RUN | BLOCKED | The actual app launched, but restored an unrelated existing project. It was stopped without opening or editing that project; the native dialog and `Utils.openExternal`/`Utils.openPath` were not exercised. Injected callbacks and the browser harness do not count as native evidence. Owner: Lead Developer / Windows desktop reviewer. |

## Output Artifacts

| Artifact | Size | SHA-256 |
|---|---:|---|
| `files/sprint071/kitchen-sink.pdf` | 167,597 bytes | `F063866C3085A3BE6BCDB53C1B1ED59AB05C3024D10FAC43EED74E2B2F469C18` |
| `files/sprint071/desktop-kitchen-sink.pdf` | 167,597 bytes | `3B020FBCA76A088D85CF8430C1E2D8E6D364FEB164F0442CEFC9D4807D486472` |
| `files/sprint071/kitchen-sink.docx` | 74,910 bytes | `930F80F370CA9A985D010105BEFA7FF016876CA317B21A2D9A731EDE1F848B8A` |
| `files/sprint071/desktop-kitchen-sink.docx` | 74,906 bytes | `2EE5E029BE66217DE01D2DA612A4A9354E2EBD3ADC8251278E19E82371C8089B` |
| `files/sprint071/kitchen-sink.html` | 1,254,216 bytes | `7CCFF87E6343747292482C6DEB9FD6FB171AFFCA81D86D091F48F3379403CBD5` |
| `files/sprint071/desktop-kitchen-sink-preview.html` | 1,255,028 bytes | `FDF486CFFD1AD7877D9029F5DA3FCB53876A2D4DFB64D1A4D2FD04EC3C2B7B41` |
| `files/sprint071/viewer-link-probe.pdf` | 16,842 bytes | `ED9C279D81B2040498128523F9A3D21E89BE8FF799A03268DB8FD781637FE67D` |
| `files/sprint071/word-chart-edit-after-fix.docx` | 102,465 bytes | `E29690678336A0B0F79F16F0E5FEE2E26266BC67658B9AA630B172EFE27B4F46` |

Visual evidence files are `acrobat-kitchen-sink-page1-final.png`, `acrobat-kitchen-sink-page12.png`, `word-docx-numeric-line-final.png` (pre-fix), `word-docx-numeric-line-remediated.png`, `standalone-kitchen-sink-page1-final.png`, `preview-kitchen-sink-page1-final.png`, `acrobat-viewer-link-probe.png`, and `local-companion-opened.png`.
Desktop PDF screenshots: `acrobat-desktop-pdf-page1.png`, `acrobat-desktop-pdf-chart-page.png`, and `acrobat-desktop-pdf-column-chart.png`.

## Separately Authorized DOCX Chart-Width Follow-up

- After the initial FAIL was recorded, the user asked for a separate fix plan and explicitly authorized it before code edits. This remediation is separate from Sprint 071's original no-feature scope.
- `src/renderer/reportDocx.ts` now supplies a DOCX-specific chart transformation of 600 x 300 CSS pixels, derived from the existing 9,026-twip text width with one pixel of clearance. The shared 720 x 360 chart model and PDF/HTML/preview sizes and chart semantics remain unchanged.
- `tests/reportDocx.test.ts` verifies each native chart extent fits the 9,026-twip text width and preserves the 2:1 aspect ratio. `desktop-app/src/bun/desktopDocxExport.test.ts` checks the same bound in the desktop service/worker package.
- The finalized CLI and desktop DOCX packages each contain nine chart extents of 5,715,000 EMU, below the 5,731,510 EMU bound. Word desktop 16.0.20430.20146 measured all nine at 450 pt against the 451.3 pt text area.
- `word-docx-numeric-line-remediated.png` shows the full numeric axis through 35 and the chart within the page. The historical pre-fix FAIL and screenshot are retained above; this follow-up resolves only that chart-fit finding.
- After resizing, edits to bar, column, numeric-X line/XY scatter, DateTime line, and scatter values still persisted through save/close/reopen.

## Exact Verification

| Command / action | Result |
|---|---|
| `bun test tests\renderer.test.ts tests\reportPreparation.test.ts tests\reportPdf.test.ts tests\reportDocx.test.ts tests\reportPresentation.test.ts tests\chartModel.test.ts tests\pdfCli.test.ts tests\docxCli.test.ts` | PASS: 65 tests, 0 failures, 513 expectations. |
| `bun test tests\examples.test.ts` | 7 passed, 1 failed, 135 expectations. The only failure is the inherited `tests/examples.test.ts:43` V0.9 help-term assertion; kitchen-sink and other example cases passed. |
| `bun run build` | PASS (`tsc`, exit 0). |
| `bun test` | 429 passed, 2 failed, 2,360 expectations across 431 tests/35 files in 39.64s. Only inherited failures: `tests/editor.test.ts:73` and `tests/examples.test.ts:43`; no timing timeout occurred in this run. |
| `bun test tests\reportDocx.test.ts tests\reportPresentation.test.ts` after sizing change | PASS: 12 tests, 0 failures, 196 expectations. |
| `desktop-app`: `bun test src\bun\desktopDocxExport.test.ts` after sizing change | PASS: 2 tests, 0 failures, 18 expectations. |
| `bun run build` / `desktop-app`: `bun run typecheck` after sizing change | PASS (`tsc`; `hutch electrobun prepare`, `vue-tsc --noEmit`). |
| `desktop-app`: `bun run build:web` after sizing change | PASS; existing large-chunk advisory. Worker bundled 915 modules (8.74 MB); Sharp runtime and four Roboto fonts copied. |
| Full `bun test` after sizing change | 429 passed, 2 failed, 2,374 expectations across 431 tests/35 files in 38.41s. Only inherited failures: `tests/editor.test.ts:73` and `tests/examples.test.ts:43`; no timing timeout occurred. |
| `desktop-app`: `bun test src\bun\desktopPreviewNavigation.test.ts src\bun\jobWorker.test.ts src\bun\desktopPdfExport.test.ts src\bun\desktopDocxExport.test.ts` | PASS: 10 tests, 0 failures, 87 expectations. |
| `desktop-app`: `bun run typecheck` | PASS (`hutch electrobun prepare`, `vue-tsc --noEmit`). |
| `desktop-app`: `bun run build:web` | PASS; existing >500 kB chunk advisory. Worker bundled 915 modules (8.74 MB); Sharp runtime and four Roboto fonts copied. |
| `desktop-app`: `bun run test` | FAIL at `tests/rpc-contract-check.ts:70`: expected two `sandbox="allow-scripts"` matches, found one. No iframe permission or assertion was changed. |
| `desktop-app`: `bun run test:ui -- tests/ui/preview-navigation.pw.ts tests/ui/html-chart-security.pw.ts tests/ui/preview-freshness.pw.ts tests/ui/project-explorer-paths.pw.ts` | First attempt failed because the configured Unix-style `./node_modules/.bin/vite` launcher is not recognized by Windows `cmd.exe`. Started the same harness with `bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort`; HTTP returned 200. Retry passed all 4 tests in 8.5s with Playwright 1.63.0 / Chromium 153.0.8010.12. This is harness evidence, not native Electrobun evidence. |
| Desktop service same-input exports | PASS: `createDesktopService` and the production worker generated PDF, DOCX, and preview from the same entry source using injected chooser/overwrite callbacks. Desktop/CLI PDF text matched on all 22 pages; desktop/CLI DOCX `word/document.xml` text matched exactly. |
| Desktop PDF visual review | PASS: Acrobat 26.2.21931.0 inspected the desktop report narrative page and record-bar chart/table page directly. |
| Word chart fit and edit follow-up | PASS: all 9 frames measure 450 pt within the 451.3 pt text area; all 9 DrawingML extents are 5,715,000 EMU under the 5,731,510 EMU limit. Five chart types retained edited values after save/close/reopen. |
| Word `ExportAsFixedFormat` attempt | Timed out after more than 180 seconds while exporting the finalized report to a disposable PDF; no output was produced. The specific Word process was stopped. Direct Word UI screenshots and COM chart tests were completed separately. |
| Acrobat local-link probe | PASS for one allowed relative TXT target: Acrobat 26.2.21931.0 opened the disposable companion in Notepad; no trust prompt or trust-policy change. |
| Word Web / screen reader / native Electrobun | BLOCKED as listed in the matrix; no success-shaped fallback or inferred pass. |

## Lead Developer Disposition

User-provided Lead Developer disposition (2026-10-10): **ACCEPTED / CLOSED; V0.11 FINISHED.** The initial Word desktop chart-width FAIL was resolved by the separately authorized follow-up. Word Web null-gap visual, formal screen-reader review, and actual native preview dialog/OS opener remain BLOCKED. Desktop PDF raster review was subsequently completed. The evidence matrix retains each actual PASS/FAIL/BLOCKED/NOT RUN result; no unpassed check is relabeled as passed. This disposition does not authorize release, publication, or platform certification.
