# Sprint 071 Blueprint: Integrated Acceptance and V0.11 Closeout

## Approach

1. Confirm the separate Sprint 071 authorization/code gate. Read the master plan, Sprint 065-070 evidence, latest planning ledgers, current test baseline, and current documentation. Preserve the supplied PDF and existing user artifacts.
2. Build an integrated acceptance matrix before running checks. For each master-plan behavior, record the same source file, report metadata, and mapped input values; identify every relevant surface (CLI PDF, desktop PDF, CLI DOCX, desktop DOCX, standalone HTML, desktop preview); state the expected output and exact evidence artifact.
3. Separate product verification from documentation work:
   - Run focused tests for shared preparation/model, PDF, DOCX, charts, CLI, desktop worker/service, and preview security.
   - Run actual export paths to disposable destinations.
   - Inspect each artifact using the appropriate tool/application; do not infer PDF visual quality from text extraction, Word compatibility from XML, or desktop host behavior from a mocked callback.
4. PDF acceptance:
   - Generate the kitchen-sink and focused Markdown/link/image reports without touching the supplied PDF.
   - Inspect representative pages and page flow visually/rasterized; verify searchable text/data, Roboto, identity/footer, page breaks, Markdown tables, images, link annotations and existing charts.
   - Record capture tool/version, resolution/pages inspected, output hash/path, reviewer, and any findings. Check local URI annotations after output relocation but do not bypass viewer trust restrictions.
5. DOCX/chart acceptance:
   - Inspect package parts, chart/workbook relationships, values/caches, tables, links, images, and absence of external workbook relationships/macros.
   - In actual Word desktop, open without repair warnings, edit chart data/series, save, close, and reopen; verify native chart identity and values persist for representative bar, column, numeric-X line, DateTime line, and scatter cases.
   - In Word for the Web, inspect the representative generated file and the numeric-X null-gap case, capture the actual display, save/download, and reopen the downloaded file in Word desktop to verify native/editable charts.
   - Run a documented accessibility/screen-reader review of chart name/description and complete table alternative. Record actual screen-reader and Word versions; if unavailable, mark BLOCKED and request a specific disposition.
   - Verify no-chart/table notices for unsupported axes, zero plotted data, mixed-group scatter with a null-only group, and numeric-X lines whose individual no-coordinate series are omitted. Confirm the complete table retains all rows and omissions are disclosed.
6. HTML/desktop-preview acceptance:
   - Verify standalone HTML output is offline, contains sanitized local image data, uses final-output-relative local links, and retains supported Markdown/newline behavior.
   - Run focused hostile-content Playwright tests against the generated preview HTML and current iframe: valid human activation, cancel, internal fragments, raw/remote/unsupported targets, forged/stale/wrong-frame messages, synthetic clicks, traversal/symlinks, no automatic requests, and unchanged sandbox/CSP.
   - Manually exercise the real Electrobun native Open/Cancel dialog and OS opener with a safe disposable local `.txt` fixture and a reserved `.invalid` HTTPS target, if the installed host supports this. Record exact host/app versions and actions. Do not send private data or bypass prompts. If this cannot be done, retain the native integration criterion as BLOCKED; injected callbacks and a browser harness do not close it.
7. Check cross-surface report identity/order, narrative/source/view item ordering, emitted values, measurement/null displays, chart titles/descriptions and table alternatives using identical report inputs. Do not require pixel-identical results between native renderers.
8. Update `README.md`, desktop help JSON, and only the relevant example prose/known-limitations sections. In particular, remove stale claims that DOCX charts remain static images/unchanged; accurately describe the accepted native mappings, no-chart deferrals, relative companion layout, offline assets, visible line breaks, safe preview confirmation, and tested viewer limits. Do not edit language specs or imply a syntax/version change.
9. Re-run focused tests, root build and full root suite; from `desktop-app`, run focused host/worker tests, UI/security tests, typecheck, web/worker build, and desktop contract suite. Compare failures with Sprint 067-070 evidence, isolate timeouts as necessary, record exact results, and repair only proven Sprint 071 regressions.
10. Complete the evidence matrix with exact statuses and owner for every failed, unavailable, or not-run check. Update state/decisions/questions and Sprint 071 builder evidence. Request a separate Lead Developer disposition that explicitly states whether the V0.11 acceptance criteria pass, remain blocked, or are accepted with named residuals; do not claim release/publication authorization.

## Files to Update

- `README.md`
- `desktop-app/src/mainview/components/help-content.json`
- `examples/kitchen-sink.amx` and other specific examples only where verified descriptions/known limitations are stale
- Existing focused tests only if an integrated-acceptance regression is demonstrated; no unrelated test fixes
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 071 `builder-evidence.md` containing the matrix and closeout review

No production renderer, chart, parser/runtime, preview/RPC, dependency, lockfile, output cap, supplied PDF, or unrelated code changes are in scope.

## Risks and Stop Conditions

- If a mandatory behavior fails in any one surface, keep that cell failed/blocked and request a specific Lead Developer decision; do not infer success from neighboring formats or silently change scope.
- If native Word chart data edits do not persist, the Web null-gap chart is not visually verified, or the accessible alternative cannot be reviewed, keep the relevant criterion blocked.
- If native host confirmation/OS opening cannot be exercised, record that limitation explicitly and do not convert callback/Playwright results into native-host acceptance.
- If a full-suite failure differs from the known baseline, isolate the exact owner/test and establish whether a Sprint 071 edit caused it before acceptance. Do not mask flakes by reporting only the best run.
- If a viewer blocks local navigation, preserve the trust policy and document the viewer/version and observed behavior. Do not claim universal local-file support.
- If public documentation would need to claim an unverified feature/platform behavior, leave that claim out and request Lead Developer wording/scope direction.
- No release, publication, platform certification, or V0.11 completion may be inferred from Builder evidence alone.

## Evidence Boundaries

- PDF text/annotation extraction does not prove visual quality or viewer-open behavior.
- OOXML inspection does not prove Word rendering, editability, save/reopen persistence, or screen-reader usability.
- Word Web display/download does not prove desktop behavior without reopening the downloaded file in Word desktop.
- Playwright/Vite and injected host callbacks do not prove native Electrobun dialog or OS opener behavior.
- A full-suite pass in one timing-sensitive run does not erase failures from other required runs; record exact commands/results and preserve residuals.
