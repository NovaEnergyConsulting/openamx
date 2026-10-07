# Sprint 060 Builder Evidence

Date: 2026-10-07  
Disposition: **COMPLETE / APPROVED WITH RECORDED RESIDUALS; Sprint 061 authorized by separate Lead Developer disposition (2026-10-07).**  
Scope: feasibility and contract only. No production renderer, iframe, AMX, report, worker limit, or application dependency changes were made.

## Environment

- Host: Arch Linux x86_64, Omarchy kernel `7.2.5-3-omarchy`.
- Repository branch: `feat/create-v0.10`; application worktree was clean before probe work.
- OpenAMX root version: `0.9.0`.
- Bun `1.4.2`; Node `v24.14.1`; Hutch `0.27.1`; Electrobun configured as `2.0.1`; desktop Vite `6.4.3`.
- Browser: Chromium `152.0.7977.82` (Arch Linux), driven by desktop `@playwright/test` installation. Network tests used `--disable-background-networking --host-resolver-rules=MAP * ~NOTFOUND`.
- PDF: root `pdfmake 0.3.11`; `pdfjs-dist 6.3.289`; Poppler `26.08.0` (`pdftoppm`, `pdfinfo`, `pdffonts`). Existing pdfmake Roboto font files: Regular 157,208 bytes; Medium 157,392; Italic 162,892; MediumItalic 163,192.
- Candidate only, not approved: ECharts `6.1.0`; zrender `6.1.0`; tslib `2.3.0`.

## Commands and Results

Focused existing regression baseline:

```sh
bun test tests/renderer.test.ts tests/reportPdf.test.ts tests/reportPresentation.test.ts tests/pdfCli.test.ts
```

**Passed:** 26 tests. This protects the unchanged current renderer/PDF/DOCX baseline; it does not validate ECharts integration.

Isolated candidate installation and Bun SVG:

```sh
bun install --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe --no-save
bun --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe ssr.ts
```

**Passed:** Bun generated a valid SVG with a null line gap; 3,218 bytes. No application manifest or application lockfile changed.

Offline browser and isolation:

```sh
bun --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe build-browser.ts
bun --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe verify-browser.ts
```

**Passed with a blocking network-navigation finding:** standalone `file://` HTML loaded and rendered all nine chart slots with networking disabled. At 1280px the fixture rendered nine canvases; at 390px the chart container was 366px wide. Zoom, reset, legend toggle, full table, print table visibility, duplicate points/categories, captured DateTime order, null values, empty state, and hostile text/payload assertions passed. An opaque `sandbox="allow-scripts"` `srcdoc` frame could not read a parent property and could not see the simulated parent bridge. Nonce-only CSP blocked hostile inline script/event handlers. Raw report-authored remote image markup generated a request event, then failed with Playwright failure reason `csp`; no response arrived.

The same command also demonstrates the residual: a report-authored external link and `<meta http-equiv="refresh">` each initiated an external navigation request from the frame despite `default-src 'none'`, `connect-src 'none'`, `navigate-to 'none'`, and the opaque sandbox. In this deliberately network-blocked host both then failed with `net::ERR_NAME_NOT_RESOLVED`; no external response is claimed. `form-action 'none'` blocked form submission. This fails the no-navigation/no-unapproved-network policy requirement; iframe isolation and CSP alone do not close it.

PDF SVG and visual rendering:

```sh
bun --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe pdf.ts
pdftoppm -f 1 -l 4 -png -r 120 planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe/artifacts/charts.pdf planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe/artifacts/pdf-page
pdfinfo planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe/artifacts/charts.pdf
pdffonts planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe/artifacts/charts.pdf
```

**Passed for the tested SVG subset:** pdfmake `0.3.11` accepted five ECharts `6.1.0` SVGs (bar, column, numeric line with separate unit axes, DateTime line, scatter), generated a 23,302-byte, two-page A4 PDF, and Poppler rasterized both pages. Visually inspected; zero/negative values, missing values, duplicate categories/coordinates, groups and chart labels render. Roboto-Regular and Roboto-Medium are embedded. These were isolated option fixtures, not production `ChartViewEmission` output. No browser PDF architecture was tested or substituted.

Repeat, size, timing, and desktop-shaped worker bundle:

```sh
bun --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe benchmark.ts
bun --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe desktop-bundle.ts
```

**Passed for the measured cases.** ECharts SSR rendered 20, 1,000 and 5,000 points; see `probe/artifacts/benchmark.json` for each timing sample and digest. Four repeats had structurally identical SVG after normalizing renderer-generated identifiers, but raw SVG bytes/hashes differed because zrender generates different `zrN` identifiers. Four simultaneous chart instances generated four separate SVGs. A 2,756,001-byte Bun worker bundle ran from a temporary `bun/jobWorker.js` location and generated SVG without an external ECharts import.

**Blocked/unavailable:** this is an Electrobun-shaped temp fixture, not an Electrobun package or native desktop runtime. The existing ignored `desktop-app/dist/` was pre-populated (27 MB), so it was not overwritten. A full packaged-resource test needs explicit package placement/build authorization and an isolated actual Electrobun output; source/build-fixture evidence is not promoted to a package pass.

Serialization and atomicity failure:

```sh
bun --cwd planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/probe failure-atomicity.ts
```

**Passed for injected failures:** pdfmake rejects malformed SVG before the atomic writer; the pre-existing temporary test destination remains byte-identical. A production `writePdfAtomically` pre-commit failure raises `AMX6002`, removes its temporary file, and leaves the destination unchanged. **Residual:** a valid ECharts render failure and its user-facing diagnostic are not injectable through the public production chart adapter; the error-path result is therefore not full chart-pipeline acceptance.

## Contract Evidence Matrix

| Case | Accepted baseline / proposed expected result | Evidence and status | Owner decision / residual |
|---|---|---|---|
| `bar` / record categories | Preserve record order and duplicate categories; render horizontal bars; zero and negative values extend from zero. | Existing AMX cases plus ECharts `getOption` category order and PDF screenshot: **partial pass**. `inverse: true` is required for horizontal display order. Candidate only. | Approve orientation and whether source order is visual top-to-bottom. |
| `column` / scalar and record | Render vertical columns; supplied labels or one-based positions stay ordered; null is not zero. | Candidate browser/PDF render: **partial pass**. Scalar-list mapping and actual emissions not converted by an adapter. | Approve category layout/label density and legend visibility for one series. |
| `line` / numeric x | Preserve source rows, duplicates and null gaps; connect in input order; normalized series with different display units must not share a falsely labeled axis. | Existing tests confirm normalization metadata/headings. Browser/PDF candidate used separate `kW` and `MW` y axes and kept `[1,4],[2,null],[3,0]`: **partial pass**. | Approve one axis per normalized unit versus an alternate truthful unit layout. |
| `line` / DateTime x | Preserve wire timestamp and row order; keep duplicate x values; gaps remain gaps. | Existing checked shape and fixture supported. Browser `getOption()` retained out-of-order duplicate timestamps and null; rendered time-axis labels were local-time/short form. **Partial pass.** | Approve visible timezone/format (proposed UTC ISO labels); visual order remains input order, not silently sorted/aggregated. |
| `scatter` / grouped and ungrouped | Preserve group first-seen order, duplicate coordinates and source rows; omit points with null x or y from plot but keep them in the full table. | Candidate option data retained duplicate coordinates and null coordinates; screenshot showed separate groups. **Partial pass.** | Approve exact legend/toggle semantics and tooltip group/x/y/unit fields. |
| Scalar labels and record mappings | Existing mappings, labels, headings, titles and descriptions are unchanged; chart receives captured rows only. | Existing tests cover parser/evaluator and display headings; candidate fixtures cover labels/titles in ECharts only. **Not exercised end-to-end through a shared adapter.** | No AMX semantic change proposed; require adapter conformance tests in Sprint 061 after approval. |
| Measurement normalization | Keep existing independent first-non-null normalization for each series/axis and retain unit metadata in headings/tooltips/axes. | Existing report tests pass; synthetic browser/PDF `kW`/`MW` axes show separate labels. **Partial pass; no runtime MeasurementValue emission fed through ECharts.** | Approve axis/tooltip formatting for mixed units; no common unlabeled scale. |
| Null, empty, all-null | Line nulls remain gaps; scatter null coordinates are omitted from plot; empty/all-null plots have explicit “No data” and retain headers/full rows without invented points/units. | Browser assertions preserve nulls and `[]`; visible empty label was fixture-owned, not emitted by ECharts. PDF tested one null in a column but not empty/all-null PDF tables. **Partial pass.** | Approve identical empty-state wording/placement for HTML, desktop and PDF. |
| Negative/zero/duplicates/order | Keep values and duplicates; never aggregate or coerce null. | Browser/PDF candidate screenshots and `getOption` assertions: **partial pass**. | Approve exact ordering for time axes and vertical/horizontal categories. |
| Tooltips and legend | Tooltip: category or x/y, series/group, value and unit. Legend toggle changes presentation only; static export/full table remain complete. | ECharts tooltip and legend state exercised; hostile title/category/series strings rendered as text with no injected nodes or execution. **Partial pass**; no real pointer hover/keyboard test or unit-aware adapter. | Approve per-kind fields and whether single-series legend is omitted. |
| Zoom, pan, reset, resize | Proposed: zoom/pan on numeric/DateTime line and scatter; no zoom for categorical bar/column; a labeled reset restores full extent; responsive resize does not mutate data. | dataZoom action, reset button, resize to 390px and data immutability assertions: **partial pass**. Pointer drag, wheel, keyboard, and actual desktop resize lifecycle not tested. | Approve applicable input methods and controls. |
| Print and complete data access | Print excludes transient controls; complete table and report text remain available independent of legend/zoom state. | Browser print emulation confirmed table visible; full table remained unfiltered. **Partial pass**; PDF is static and separate. | Approve print layout and exact accessibility requirements. |
| Accessibility | Title/description and complete data alternative remain accessible; null and DateTime are described faithfully. | ECharts generated `role="img"`/`aria-label`, but its default ARIA text rendered null as `NaN` and DateTime as epoch milliseconds. HTML data table is complete. **Failed as-is.** | Approve custom truthful ARIA description or disabling generated summary in favor of title/description/table linkage. |
| Local HTML and offline assets | One report HTML file, no remote/runtime sibling resource, no network request needed to render. | Opened actual `file://` page with network blocked; 1,175,668-byte self-contained HTML. Chart boot assets are embedded. Hostile image was CSP-blocked; link/meta-refresh initiated navigation attempts rejected by test-host DNS: **pass for chart resource resolution, failed for strict navigation denial**. | Other browsers/hosts not certified. |
| Bun SVG | Exact Bun and ECharts versions produce SSR SVG with stable chart structure and supported labels/nulls. | Bun `1.4.2`, ECharts `6.1.0`; SVG generation and 2.76 MB worker fixture pass. Raw output has generated-ID churn. **Pass for isolated Linux Bun fixture.** | Decide whether generated IDs are acceptable or must be normalized for deterministic static bytes. |
| pdfmake and actual PDF | The shared static chart SVG is accepted, legible at report size, with approved font/SVG subset. | pdfmake `0.3.11`, five fixture SVGs, actual two-page PDF visually inspected. **Pass for tested subset only.** Actual production adapter, empty-state PDF and target-size tolerance remain unverified. | Approve supported SVG subset and dimensions; no architecture switch inferred. |
| Desktop packaged resource | Runtime/worker/font resources resolve from actual packaged layout offline. | Bun worker bundle ran from temporary `bun/jobWorker.js`; existing resource mapping inspected. **Blocked/unavailable for actual Electrobun package/runtime.** | Approve exact root dependency/package placement and authorize isolated actual package build. |
| Hostile content and network | Fixed trusted bootstrap only; report text/payload cannot execute code, read parent/bridge/filesystem or initiate unapproved network. | Nonce-only CSP blocks inline event handler; opaque origin denies parent read and bridge; JSON payload escaped. Link click and meta refresh escape; forms blocked. **Failed security gate.** | Lead Developer must require a sanitizer/navigation policy that closes both escapes before scripts are enabled. |
| Size, performance, lifecycle | Keep output within existing 8,000,000-character HTML and 32,000,000-byte binary worker limits; dispose instances; no limit increase assumed. | On one host, 5,000 points: 61,373-byte SVG, 102,070-byte JSON, four SSR runs 19.9–32.1ms; four small simultaneous charts 33.4ms. Full HTML is 1,175,668 bytes. **Evidence only to 5,000 points; not a proposed product cap.** | Approve representative production bound after end-to-end payload/table/browser/PDF measurements. |
| PDF failure and atomicity | Render/serialization failures return a diagnostic and never replace an existing destination with partial/success-looking output. | Malformed SVG serializer rejection plus injected atomic pre-commit failure preserve existing bytes and remove temp file. **Partial pass.** | Add public chart-render fault injection/diagnostic coverage in implementation sprint; no renderer fallback approved. |
| DOCX baseline | No new chart renderer or behavior is added to DOCX. | Focused `reportPresentation.test.ts` passed in unchanged tree. **Pass as existing regression only.** | No DOCX work authorized. |

## Candidate, Packaging, Licensing, Fonts, SVG

- `npm view echarts@6.1.0 ...` reported Apache-2.0, exact dependencies `zrender@6.1.0` and `tslib@2.3.0`, and 60,297,703 unpacked bytes. Installed probe tree was 66 MB; `echarts/dist/echarts.min.js` is 1,121,883 bytes. The complete-browser Bun bundle was 1,173,870 bytes; final standalone fixture HTML was 1,175,668 bytes. These are probe sizes, not installed-product deltas.
- Candidate notice evidence: `echarts/LICENSE` (Apache-2.0) and `echarts/NOTICE`; `echarts/licenses/LICENSE-d3` (BSD-3-Clause); `zrender/LICENSE` (BSD-3-Clause); `tslib/LICENSE.txt` (0BSD) and `CopyrightNotice.txt` (Microsoft). SHA-256: ECharts LICENSE `634293835b43a6dd2094fa39182a3d9a6b9ca43b7fdb9ac354e8037af2a3093a`; ECharts NOTICE `d491d358344f842685c1b1585970999db65fe30ecf7ef3867af8814f4016c016`; D3 LICENSE `e1211892da0b0e0585b7aebe8f98c1274fba15bafe47fa1f4ee8a7a502c06304`; ZRender LICENSE `a681e9d183c72b4af4856935893805eb48c08f0f5a3f260203db7444c20fb98a`; tslib LICENSE `210b19e543130388c68654b7497e967119ce17145f66ab7d85688fbd70f08751`; tslib notice `dd835e67a9a297da32f9467d7677a5d02c8e50e10f15da43b810147c79c04b9b`. This is inventory, not legal advice or a redistribution conclusion.
- Browser ECharts SVG output exercised `svg`, `path`, `rect`, `circle`, `text`, `defs`, `clipPath`, generated class styles, and matrix transforms. pdfmake rendered the five tested figures. Gradients, filters, patterns, images and all other SVG elements/features are **not tested/supported by this evidence**.
- Browser chart text used `sans-serif`; PDF report fonts remain the existing copied Roboto set. `pdffonts` confirmed Roboto-Regular and Roboto-Medium embedded. No custom chart font packaging or font fallback matrix was tested.
- Minimal candidate package placement for approval: one exact root production dependency `echarts@6.1.0` (with its locked `zrender`/`tslib` tree), because CLI/PDF and the bundled desktop Bun worker both use shared renderer code; standalone HTML must embed the browser runtime. This package placement is **not approved or implemented**. The actual Electrobun package/resource build was not run.

## Visual, Interaction, and Limits Proposal

These are Builder proposals, not settled product rules:

- Browser/preview chart box: 720 x 360 CSS px at desktop; responsive width with a 320px minimum; preserve title/description and keep labels from overlapping. PDF static SVG: preserve a 16:9 viewBox and fit the existing report content width; validate page flow before fixing height.
- Keep bar horizontal and column vertical. Use explicit per-series/axis measurement units; do not encode independently normalized series on one unlabeled axis. Keep category/series/group colors stable by first-seen order. Disable animation for static output and deterministic screenshots.
- Tooltip: line/bar/column show category or x, series, value and display unit; scatter shows group, x and y with each axis unit. Legend only when it controls two or more series/groups. Full data table remains independent. Zoom/pan on numeric/DateTime line and scatter only; reset restores the complete captured domain. Keyboard and touch behavior remains unresolved.
- Compare matched chart crops at the same logical dimensions; proposed tolerance is SSIM >= 0.97 and plot-area edge/label bounds within 2 CSS px, with zero clipped/overlapping labels. Current screenshots demonstrate appearance only; no cross-surface pixel metric has been run or approved.
- 5,000 points is the largest directly measured probe case, not an approved product limit. It does not consume a material fraction of the current worker HTML character cap in the simple fixture, but real tables, escaped payloads, multiple charts and PDF pagination were not bounded. Do not change existing caps.

## Acceptance Status

- Contract matrix/decision register: **Builder proposal completed; Lead Developer approval pending**.
- Local standalone browser/Bun SVG/pdfmake actual PDF: **passed for named fixtures and host only**.
- Security/no-network gate: **failed** due external link and meta-refresh navigation.
- Desktop actual package/resource resolution: **blocked/unavailable**; the temp Bun fixture does not substitute for it.
- Accessibility: **failed as-is** because generated ARIA misrepresents null and DateTime values.
- Size/timing: **partial** through 5,000-point fixture only.
- Failure/atomicity: **partial pass**; valid candidate-render failure/diagnostic unavailable.
- Production behavior/dependency/sandbox changes: **not run/not authorized**.
- DOCX: existing focused regression passes; no new implementation.

## Artifacts

- `probe/ssr.ts`, `probe/browser-entry.ts`, `probe/build-browser.ts`, `probe/verify-browser.ts`, `probe/pdf.ts`, `probe/benchmark.ts`, `probe/desktop-bundle.ts`, and `probe/failure-atomicity.ts`: reproducible isolated harness.
- `probe/artifacts/charts.html`: standalone 1,175,668-byte local report.
- `probe/artifacts/charts-browser.png`, `charts-browser-mobile.png`: Chromium 1280px and 390px screenshots.
- `probe/artifacts/charts.pdf`, `pdf-page-1.png`, `pdf-page-2.png`: actual PDF and 120-DPI raster pages.
- `probe/artifacts/benchmark.json`, `ssr.svg`: generated SSR results.

No full desktop application package, Windows/macOS/Linux-native matrix, other browser-engine run, or release/platform certification is claimed.

## Lead Developer Disposition (2026-10-07)

- **Decision: COMPLETE / APPROVED WITH RECORDED RESIDUALS.** The Lead Developer approved all Sprint 060 contract and architecture proposals and explicitly authorized Sprint 061.
- Approved implementation baseline: evaluate ECharts `6.1.0` using the proposed shared root dependency placement, subject to the approved master-plan boundaries. This is design authorization, not evidence that production integration or actual Electrobun package resolution passed.
- Accepted residuals remain: external-link/meta-refresh navigation attempts from the opaque sandbox; generated ARIA says `NaN` for null and uses epoch values for DateTime; no actual Electrobun packaged-resource test; raw SVG byte differences from generated IDs; cross-surface visual tolerance not measured; performance measured only through 5,000 points; pointer/keyboard/touch cases and public valid-render failure diagnostics unavailable.
- Sprint 061 is authorized but has not started. The no-network security requirement remains a prerequisite before enabling production iframe scripts; the builder probe failure is not converted to a pass. No V0.10 implementation completion, final acceptance, platform certification, release readiness or legal conclusion is claimed.
