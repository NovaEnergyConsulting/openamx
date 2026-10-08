# Sprint 063 Builder Evidence: Static ECharts PDF Charts

Date: 2026-10-08  
Status: **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by Lead Developer disposition (2026-10-08).  
Host: Arch Linux x86_64; kernel `7.2.5-3-omarchy`; Bun `1.4.2`; Node `v24.14.1`; ECharts `6.1.0`; pdfmake `0.3.11`; Poppler `26.08.0`.

## Implementation

- Replaced PDF-only `chartRows`/`chartSvg` interpretation in `src/renderer/reportPdf.ts` with `createChartViewModel(emission, report.identity)`. Captions, descriptions, table headings/rows, axes, chart values/order, series/groups, unit labels, theme, and the `No data` graphic now originate in that shared model. The full table remains searchable and includes source rows omitted from scatter plots.
- Each chart is rendered by ECharts Bun SSR with the SVG renderer, explicit shared dimensions (720 x 360), `animation: false`, and `renderToSVGString()`. The option is shallowly derived without JSON serialization: formatter callbacks remain in memory. PDF-only settings suppress tooltip interaction and duplicate in-chart titles, center named axis labels, and hide empty-state axes; model values, series, axes/units, or rows are not changed. The model, emissions, report, and arrays are not mutated.
- Every ECharts instance is disposed in `finally`. SVG tags are checked against the measured subset (`svg`, `g`, `path`, `rect`, `circle`, `text`, `defs`, `clipPath`, `style`); an unsupported tag throws rather than producing a placeholder. Production SSR included `g` in addition to the named Sprint 060 fixture tags; pdfmake `0.3.11` serialized it successfully and the resulting chart pages rasterized correctly. No gradient, filter, pattern, or image output was observed.
- Static SVG is fitted with `width: 470` only, preserving its 2:1 intrinsic viewBox ratio. Chart title, description, and SVG are kept in a chart-only unbreakable stack to prevent orphaned headings; the complete data table remains a separate flowing table. Existing A4 size/margins, identity/footer, report ordering, source/view placement, font setup, and atomic output path remain in use.
- Added a narrow renderer callback seam to inject a valid chart-render failure. The error surfaces before serialization/destination writing; the existing output bytes remain unchanged and the test directory contains no temp file. No diagnostic code/API allocation was introduced.
- DOCX source and Sprint 062 HTML/desktop source were not changed. No AMX/runtime/chart semantics, dependencies, limits, network assets, worker behavior, or PDF engine changed.

## Verification

Focused command:

```sh
bun test tests/reportPdf.test.ts tests/pdfCli.test.ts tests/reportPresentation.test.ts tests/chartModel.test.ts tests/docxCli.test.ts desktop-app/src/bun/jobWorker.test.ts
```

**Passed:** 28 tests, 169 expectations, 0 failures. This includes all ten kitchen-sink chart emissions across `bar`, `column`, numeric/DateTime `line`, grouped/ungrouped `scatter`, scalar cases, empty state, callback-bearing option preservation, full searchable rows, render-failure preservation, CLI destination checks, shared-model semantics, unchanged DOCX regressions, and desktop worker PDF chart export.

Other checks:

- `bun run build`: passed (root TypeScript build).
- From `desktop-app`, `bun run typecheck`: passed (`hutch electrobun prepare && vue-tsc --noEmit`).
- From `desktop-app`, `bun test src/bun/jobWorker.test.ts`: **4 passed**, 18 expectations. The added chart test generated a worker PDF, parsed its searchable report text/table, and verified chart title, description, and complete rows.
- From `desktop-app`, `bun run tests/rpc-contract-check.ts`: passed. Existing workflow generated a 15,037-byte PDF; five-format serialization generated a 17,096-byte PDF; PDF serialization cancellation preserved the existing target. The check also exercised desktop PDF destination/current-buffer behavior. This is worker/RPC evidence, not a native Electrobun application launch.
- `git diff --check`: passed before planning evidence updates; final owned-path check is recorded after documentation edits.
- Full root suite, `bun test`: **399 passed, 2 skipped, 2 failed** (403 tests, 2,024 expectations). Both initial failures were desktop data-editor jobs still `running` after their fixed 500 ms polling windows; the release fixture timeout from the VS Code test runner did not reproduce in direct Bun execution.
- Serial retry, `bun test --max-concurrency=1`: **400 passed, 2 skipped, 1 failed**. The remaining failure is `desktop-app/src/bun/desktopDataEditor.test.ts`, “keeps failed mapped-data diagnostics free of private paths and source contents”; its job was still `running` at 532 ms. This unrelated timing failure remains unmodified and unpassed. The focused PDF/worker regression set passed separately.

## Actual PDF And Raster Evidence

Artifacts are retained in this sprint's `artifacts/` directory:

- `kitchen-sink.pdf`: actual CLI export from `examples/kitchen-sink.amx`, containing all four kinds and ten shown charts; 20 A4 pages, final size 149,836 bytes.
- `kitchen-sink-page-01.png` through `kitchen-sink-page-20.png`: all pages rasterized with `pdftoppm -png -r 120`. Pages 9-17 were inspected for record/scalar bars, columns, numeric/DateTime lines, grouped/ungrouped scatter, empty state, table flow, and page boundaries. No blank graphics, clipping, overlap, or chart-heading split remained. Page 9 preserves repeated categories and all 30 rows; pages 12-14 show UTC ISO DateTime, first-seen groups, and full scatter tables; page 17 shows centered `No data` with hidden axes and the header-only table.
- `measurement-report.pdf`: actual CLI export from `examples/v09-measurement-report.amx` with `examples/v09-trips.json`; 2 A4 pages, final size 22,535 bytes. `measurement-page-2.png` is the 144-DPI raster of the chart page. Inspected unit name `kilometer` is centered and fully visible; searchable text includes both route rows, display units, and normalized values.
- Both PDFs report embedded `Roboto-Regular` and `Roboto-Medium` via `pdffonts`. The existing local/package Roboto resource policy is unchanged.
- `pdfinfo` reports A4 (`595.28 x 841.89 pt`), 20 and 2 pages respectively. No encryption, JavaScript, or remote PDF resources are present.
- A repeated kitchen-sink CLI export was rasterized at 120 DPI. ImageMagick `compare -metric AE` for chart page 9 reported `0 (0)` differing pixels. Raw PDF/SVG byte identity is not asserted; generated ECharts SVG IDs remain variable.
- Production ECharts SSR tags observed were `svg`, `g`, `path`, `rect`, `style`, `text`, `clipPath`, and `defs` (some kinds omit `g`/clip paths). All ten production model charts passed serialization and the actual multipage report rasterization. The probe is distinct from Sprint 060's isolated five-fixture PDF probe; these are production adapter/model outputs.

Commands used for visual evidence:

```sh
bun run src/cli.ts export pdf examples/kitchen-sink.amx --out planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/kitchen-sink.pdf
pdfinfo planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/kitchen-sink.pdf
pdffonts planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/kitchen-sink.pdf
pdftoppm -png -r 120 planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/kitchen-sink.pdf planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/kitchen-sink-page
bun run src/cli.ts export pdf examples/v09-measurement-report.amx --input trips=examples/v09-trips.json --out planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/measurement-report.pdf
pdftoppm -f 2 -l 2 -png -r 144 planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/measurement-report.pdf planning/sprints/0063-v10-static-echarts-pdf-charts/artifacts/measurement-page
```

The CLI PDFs above were generated on the named Linux host. No native desktop launch or other platform was used for this evidence.

## Residuals And Boundaries

- One desktop data-editor test exceeds its fixed polling window in full/serial root runs; it is not part of the PDF change and remains an explicit full-suite residual, not a pass.
- The valid chart-render injection fails before atomic writing begins; existing bytes and absence of temp residue are verified. A failure inside native ECharts `renderToSVGString()` itself and a separate public chart diagnostic are not injected/defined. CLI generic failure handling remains existing behavior; no public diagnostic was invented.
- Only the Linux x86_64 Bun/Poppler host and Chromium-independent PDF rasterization were exercised. No native Electrobun window/install/launch, other OS/architecture, or packaged-worker PDF chart smoke was run here. Desktop RPC/worker results are reported separately above.
- Cross-surface visual tolerance, >5,000-point end-to-end behavior, and Sprint 064 integrated acceptance remain open. Sprint 062 status/security evidence is unchanged and is not PDF evidence.
- No DOCX chart work, release readiness, publication, platform certification, V0.10 completion, or Sprint 064 acceptance is claimed.

## Changed Files

- `src/renderer/reportPdf.ts`
- `tests/reportPdf.test.ts`
- `tests/reportPresentation.test.ts`
- `desktop-app/src/bun/jobWorker.test.ts`
- This evidence file, sprint `artifacts/`, and `planning/state.md`, `planning/decisions.md`, `planning/questions.md`

At evidence submission, a separate Lead Developer disposition was requested. The disposition below records the subsequent closeout.

## Lead Developer Disposition

On 2026-10-08 the Lead Developer accepted this Builder evidence and closed Sprint 063 as **COMPLETE / APPROVED WITH RECORDED RESIDUALS**. The full-suite desktop data-editor polling timeout remains unpassed as recorded above. This disposition does not claim native desktop launch, platform certification, Sprint 064 integrated acceptance, V0.10 completion, release readiness, or publication.
