# Sprint 063 Blueprint: V0.10 Static ECharts PDF Charts

## Approach

1. Confirm Sprint 061's separate **COMPLETE / APPROVED WITH RECORDED RESIDUALS** disposition and exact model/dependency evidence. Sprint 063 depends on Sprint 061 and may proceed independently of Sprint 062 under the master plan. Preserve Sprint 062's separate status; do not modify HTML/desktop preview or security behavior.
2. Inspect `reportPdf.ts`, existing pdfmake/font setup, atomic PDF destination flow, chart model types and existing PDF/CLI/presentation tests. Establish the existing A4 content width and where chart graphics affect pagination before editing.
3. In the existing `addChart` path, call `createChartViewModel(emission, report.identity)`. Use its complete table/headings and chart options; remove the PDF adapter's separate chart-row/SVG interpretation. Preserve caption, description, data table position, report ordering and all non-chart content.
4. Render a fresh ECharts SSR instance for each chart using the exact root `echarts@6.1.0` dependency, SVG renderer, SSR mode, explicit width/height derived from the model/approved PDF layout, and static animation off. Apply PDF-only dimension/text adjustments via a cloned or shallowly derived option that cannot mutate the shared model. Call `setOption`, `renderToSVGString`, validate expected SVG/finite size, and dispose in `finally` even on failure.
5. Keep the actual option and its trusted formatter callbacks in memory. Do not JSON-round-trip it: `ChartViewModel.option` contains function-valued tooltip/category/UTC formatters. SSR uses the trusted option directly. Ensure tooltip UI does not create interactive PDF content; omit/disable only static-irrelevant interaction behavior without changing chart data or axes.
6. Insert the resulting SVG into the existing pdfmake content item at the existing report position and fit available report width. Preserve aspect ratio, label visibility, fonts, page flow and table continuity. Empty/all-null charts still render the shared `No data` graphic or an approved equivalent and always retain the heading/data table; never fabricate values/units.
7. Handle ECharts SSR, SVG validation, and pdfmake errors through the existing failure path. If necessary, add a narrow dependency-injection seam for renderer failure tests; avoid a new public API or diagnostic allocation unless Lead Developer direction approves it. Prove failure occurs before atomic commit or otherwise leaves existing destination unchanged and removes temporary files.
8. Exercise actual production report inputs for all kinds, scalar/record forms, mappings/groups, multi-series and mixed measurement units, DateTime, duplicates/order, negative/zero, null gaps, partial series, and empty/all-null. Assert searchable PDF narrative, labels, units, headings and full table content separately from visual evidence.
9. Rasterize representative generated PDFs and inspect chart pages at the intended A4 dimensions. Include wide label/legend cases, mixed units, negatives/nulls, empty-state, multiple charts and page boundaries. Compare against Sprint 062 HTML chart screenshots/model theme; record visual findings and artifacts for Sprint 064 without claiming final parity or inventing a tolerance beyond the approved contract.
10. Test repeated rendering for stable chart meaning/appearance. ECharts-generated SVG IDs vary, so raw SVG/PDF byte equality is not expected from current evidence. If normalization is required, use a structural XML mechanism and prove reference integrity; do not perform broad string replacement.
11. Verify actual CLI PDF export and desktop worker/RPC PDF export path consume the same adapter, preserve existing destination atomicity, and make no network requests. Run focused PDF tests then root build/full tests and desktop tests available/required. Record actual native window/platform checks as unavailable if not run.
12. Update Builder evidence and state/decision/question records with exact changed files, commands, host/tool versions, output artifacts, PDF text/page count/font inspection, raster inspection, failures, and residuals. Request separate Lead Developer disposition; do not self-accept or claim Sprint 064/V0.10 acceptance.

## Static Render Contract

- **Input:** prepared `ChartViewEmission` plus resolved report identity, passed through Sprint 061 `createChartViewModel`.
- **Graphic:** a static ECharts SSR SVG in the empirically supported subset, derived from the shared option and theme. No browser runtime, external URL, interaction widget, captured legend selection, or zoomed viewport.
- **Data alternative:** the shared model's full ordered table rows/headings are serialized as searchable pdfmake table text regardless of which null points are omitted from plotted scatter data.
- **Sizing:** use explicit chart dimensions and fit within the existing report content width, preserving aspect ratio and labels. Follow the approved model/PDF geometry decisions; surface geometry may differ but chart meaning and theme do not.
- **Lifecycle:** each SSR instance is disposed on success and every failure path. Repeated/multiple charts remain isolated.
- **Failure:** no success-looking fallback. Rendering, SVG validation, or pdfmake failures are surfaced and cannot partially replace an existing destination.

## Required PDF Case Matrix

| Case | Required assertions/evidence |
|---|---|
| `bar` / `column` | Correct orientation; first source category top for bar; category order/duplicates; negative/zero; labels/series |
| `line` numeric/DateTime | Input order and duplicate x retained; UTC ISO labels/tooltips; null gaps; static output has no interactive state |
| Measurement axes | Distinct named axes for independently normalized units; scatter x/y units independently named; table and graphic agree |
| Scatter | First-seen group order; duplicate coordinates retained; null-coordinate plotted points omitted; complete source rows remain in table |
| Empty/mixed null | Explicit no-data visual; no fabricated values/units; headings and header-only/full table retained |
| Report integration | Searchable narrative/title/description/data; identity/accent/footer; source and view order; page breaks/header rows remain |
| SVG/fonts/geometry | Production model SVG uses supported subset; pdfmake embeds expected fonts; raster output nonblank, legible, unclipped, and within page flow |
| Atomic errors | Injected valid-render/serialization failure surfaces; pre-existing destination bytes remain unchanged; no temp residue |
| Repetition | Multiple and repeated SSR instances dispose; semantic/rendered result is stable; raw generated IDs may differ and are recorded |

## Files to Update

- `src/renderer/reportPdf.ts` and a narrowly scoped internal static SVG helper if needed
- `tests/reportPdf.test.ts`, `tests/pdfCli.test.ts`, `tests/reportPresentation.test.ts`, and focused runtime/worker PDF tests only where necessary
- Desktop worker/RPC tests only if needed to prove the existing shared PDF path; no desktop UI or preview changes
- `planning/sprints/0063-v10-static-echarts-pdf-charts/builder-evidence.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Do not edit `renderHtml.ts`, `chartModel.ts` semantics, `reportDocx.ts`, AMX/runtime/chart evaluation behavior, dependency version/placement, or output limits without a concrete approved need

## Verification

- Focused `tests/reportPdf.test.ts` and `tests/pdfCli.test.ts` plus `tests/reportPresentation.test.ts` and `tests/chartModel.test.ts`.
- Generate actual PDFs for chart matrix cases; use `pdfjs-dist` text extraction for searchable narrative/table checks and Poppler `pdfinfo`/`pdffonts`/`pdftoppm` or equivalent for page/font/raster evidence.
- Inspect pixels/visual pages at representative A4 output; PDF byte generation/text extraction alone does not prove chart rendering.
- Verify CLI and desktop worker/RPC PDF output use the shared path; exercise existing-output-preserving atomic failure.
- Confirm no external resources/network, no transient interactive state, and DOCX output unchanged through existing regression tests.
- Run `bun run build`, relevant focused tests, full root suite and desktop checks as required/available. Record exact totals/skips and direct-versus-wrapper results.
- `git diff --check` on owned paths; record warnings, limits, native/platform unavailability, and raw generated-ID behavior accurately.

## Notes

- Sprint 062 is separately **COMPLETE / APPROVED WITH RECORDED RESIDUALS**; its Linux packaged-worker and Chromium evidence does not establish PDF SVG compatibility beyond the Sprint 060 fixture subset.
- Sprint 062's no-network/opaque iframe security work is not changed by static PDF rendering.
- Sprint 060's raw generated SVG ID variance remains an expected byte-level limitation unless this sprint establishes a safe structural normalization. Sprint 064 owns the integrated visual parity disposition.
- DOCX and publication/release scope remain expressly excluded.