# Plan: OpenAMX V0.10 ECharts Reporting

Confirmed planning scope on 2026-10-07. Replace the custom chart graphics used by CLI HTML/PDF reporting and the desktop document preview with [Apache ECharts](https://echarts.apache.org/en/index.html). This is a focused renderer-only version: preserve existing AMX chart declarations, validation, data contracts, measurement behavior, and show-time snapshots. Do not add unrelated language, desktop, extension, or release-engineering features.

HTML reports and the desktop document display panel must present the same offline, interactive chart experience. PDF charts are static counterparts with the same data and visual design as closely as the format permits; pixel-identical page layouts are not required. DOCX chart rendering and all DOCX-specific improvements are explicitly excluded and deferred to a future version.

This plan describes required behavior, not implemented or verified functionality. Prepare detailed requirements, blueprint, acceptance criteria, and handoff sprint packs before their respective sprints using the [existing template](sprints/0000-sprint-template/). Publication of this plan does not authorize implementation.

Continue sprint numbering at 060 after V0.9's Sprint 059. Organize the work into four contract/implementation sprints followed by an integrated acceptance closeout sprint. The closeout adds no product feature scope.

## Recommended Approach

- Use a shared adapter from captured `ChartViewEmission` data to ECharts options and shared visual defaults. HTML, desktop preview, and static PDF graphics must not independently reinterpret chart data.
- Preserve the existing report-preparation pipeline, narrative/view ordering, unit normalization, immutable show-time snapshots, and atomic export behavior.
- Prefer ECharts SVG server-side rendering for static charts and the existing pdfmake report pipeline, subject to an executable compatibility gate. Do not assume SVG compatibility or introduce a browser-based PDF architecture without proving the need and obtaining approval for expanded scope.
- Embed the browser runtime and required chart assets in standalone HTML. Bundle everything required by desktop preview/export and static PDF generation. No CDN or network dependency is permitted for chart rendering.
- Keep the desktop preview isolated. Evaluate `allow-scripts` without `allow-same-origin`, and permit only the trusted rendering behavior required by the approved interactions. Do not enable arbitrary report-authored scripts or parent/application access.
- Keep common options, theme, sizing, and static-versus-interactive adapters explicit. Responsive browser layout and PDF page constraints may differ, but chart meaning and visual identity must remain consistent.
- Extend existing renderer, PDF, and desktop tests rather than introducing parallel test infrastructure. Establish visual evidence in addition to data/markup assertions.

## Confirmed Feature Scope

### Chart Types and Compatibility

- Preserve all existing AMX chart kinds: `bar`, `column`, `line`, and `scatter`. Render each as its intended chart form rather than treating unrelated kinds as bars.
- Preserve supported scalar-list and record-list input forms, labels, field mappings, multiple series, scatter grouping, titles, and descriptions.
- Preserve existing chart validation and diagnostics, source data order, view emission order, and measurement normalization. Charts continue to normalize compatible measurements to the existing axis/series display-unit choice and identify units in labels.
- Keep source data and captured emissions immutable during rendering and interaction. Legend or viewport changes are presentation state, not AMX data mutations.
- No new chart kinds, author-facing ECharts option objects, theme controls, or AMX syntax are included. Parser, checker, runtime evaluation, and editor language behavior do not acquire new features.

### Cross-Surface Appearance

- CLI standalone HTML, desktop live HTML preview, and desktop HTML export use the same chart renderer and visual defaults.
- CLI and desktop PDF exports use static ECharts-generated graphics based on the same chart model and theme.
- Match series/group colors, axes, labels, units, titles, descriptions, legends, and chart geometry as closely as the output medium permits. Agree representative browser/PDF dimensions and visual comparison tolerances in Sprint 060.
- Define stable OpenAMX visual defaults and use existing report accent metadata as a restrained highlight where available. Do not add author-facing styling controls.
- Browser charts resize with their document container without clipped labels, overlapping legends, or blank graphics. PDF charts fit available report width and remain legible within existing page layout constraints.
- Static exports represent the complete captured chart data, not a transient browser zoom or legend selection. Do not add persistence or export of interactive presentation state.

### Offline Interactive HTML and Desktop Preview

- HTML chart output is self-contained and works without network access, including when opened as a local report file. No adjacent chart-runtime files or external services are required.
- Provide tooltips, legend toggles, and zoom/pan for applicable chart kinds in HTML and the desktop preview. Define exact per-kind behavior and reset behavior in Sprint 060 without adding new interactions or chart types.
- Tooltips identify relevant category/coordinates, series/group, values, and units consistently with the displayed chart data.
- Keep the desktop document display panel as the existing live HTML preview. An in-app PDF viewer or a new exported-document display workflow is not included.
- Retain iframe isolation and prevent report content from accessing the parent document, desktop bridge, local application state, or privileged capabilities. Adding script permission alone is not sufficient evidence of safety.
- Preserve preview freshness, cancellable job behavior, bounded output handling, and existing desktop export workflows. Clean up chart instances and resize handlers when previews are replaced.

### Static PDF, Printing, and Accessibility

- PDF contains static chart graphics, not interactive widgets. Preserve searchable report narrative, titles/descriptions, chart-data tables, report identity, and existing pagination behavior.
- Preserve accessible chart titles/descriptions and a tabular data alternative in HTML and desktop preview. Interactions must not remove access to the complete captured dataset.
- Preserve usable HTML print output, including chart/data alternatives without clipped graphics or interaction controls. Specify print handling independently of browser interaction state during the technical gate.
- Define a consistent empty-chart state across HTML, desktop preview, and PDF, including empty and all-null datasets. Retain the data-table headings and do not invent values, units, or plotted points.
- Preserve existing accepted null-data semantics. Make exact gaps, omitted points, and mixed populated/empty series presentation executable in Sprint 060 rather than silently coercing nulls to zero.

### Explicit Exclusions

- DOCX chart rendering, DOCX layout/style improvements, and native Word chart objects.
- New AMX chart syntax, new chart/data types, raw ECharts configuration access, or author-facing theme/settings panels.
- General report redesign, replacement of the PDF engine, desktop preview architecture replacement, or a new in-app PDF viewer.
- Unrelated table interaction changes, language/editor improvements, report performance projects, installer certification, or public release/package publication.

## Current-Codebase Evidence

- Root and desktop package metadata identify the baseline version as 0.9.0. The preceding master plan ends at Sprint 059.
- The AST chart-kind union includes `bar`, `column`, `line`, and `scatter`; retaining current chart scope includes all four.
- Shared report preparation supplies ordered narrative, source, and captured view emissions to output adapters.
- HTML charts currently use custom inline SVG plus a data table and print alternative. The SVG code distinguishes scatter but renders other kinds as bars.
- PDF uses pdfmake with a separate custom SVG chart builder and data table. Its current graphic builder renders bars regardless of declared chart kind.
- Desktop preview and HTML export call the shared `renderPreparedHtml` path. Both live preview iframe locations in `App.vue` currently use an empty sandbox, which disables scripts.
- Desktop PDF exports use the same PDF adapter as the CLI. Exported files are opened externally rather than through an in-app PDF viewer.
- Existing renderer tests cover chart accessibility/print markup, normalization, and labels; PDF tests cover serialized content. These do not yet establish ECharts interaction or visual parity.
- Desktop worker HTML and binary output limits are existing constraints that offline runtime bundling and static graphics must respect or deliberately reconcile during the technical gate.
- DOCX uses a separate chart adapter. Its presence in shared tests is regression coverage, not permission to expand V0.10 scope.

## Steps

### Phase 1 - Rendering Contract and Feasibility

#### Sprint 060: ECharts Rendering Contract and Technical Gate (depends on nothing)

- Prepare requirements, blueprint, acceptance criteria, and handoff using the existing sprint template.
- Turn confirmed scope into executable chart-type, interaction, visual, accessibility, print, empty/null, and security contracts.
- Prove the shared chart model can produce interactive browser charts and static ECharts graphics suitable for pdfmake in supported Bun and packaged desktop environments.
- Confirm dependency/version placement, bundling, required license/notice handling, fonts, supported SVG features, and offline behavior.
- Validate the isolated iframe approach against untrusted report narrative, labels, descriptions, embedded markup, and serialized chart payloads before enabling scripts.
- Establish bounded representative data sizes, HTML/runtime size and preview-limit implications, rendering timings, and visual comparison fixtures. This is a chart feasibility gate, not general report optimization scope.
- Complete the technical contract gate below before implementation.

### Phase 2 - Shared Chart Model and Destination Integration

#### Sprint 061: Shared Chart Model and OpenAMX Theme (depends on Sprint 060)

- Implement the shared adapter for all existing chart kinds, scalar/record inputs, series/grouping, labels, unit-aware axes, and captured data order.
- Define stable palette, report-accent usage, typography, axes, legends, layout, and consistent empty/null presentation.
- Keep destination-specific interaction/static settings separate from shared chart meaning and theme.
- Add focused model/option tests and snapshot/normalization regressions without changing AMX language or runtime behavior.

#### Sprint 062: Offline Interactive HTML and Desktop Preview (depends on Sprint 061)

- Replace HTML custom chart SVG generation with ECharts-based output and embed the required runtime/assets for offline standalone reports.
- Wire browser tooltips, legend toggles, zoom/pan, responsive sizing, and lifecycle cleanup according to the contract.
- Enable trusted rendering in both existing desktop preview iframe locations while retaining isolation and blocking report-authored scripts/privileged access.
- Preserve chart descriptions, complete tabular alternatives, usable print output, preview freshness, output limits, and HTML export behavior.
- Verify actual chart rendering and interaction in standalone HTML and the desktop preview, including offline and malicious-content cases.

#### Sprint 063: Static ECharts PDF Charts (depends on Sprint 061)

- Replace the PDF custom chart graphics with static ECharts output from the shared options/theme, using the adapter proven in Sprint 060.
- Keep pdfmake report structure, searchable narrative and data, report identity, existing page breaks, and atomic destination handling intact.
- Verify chart kinds, series/groups, axes/units, legends, negative/zero values, null/empty states, and readability at PDF dimensions.
- Compare representative static graphics against HTML/desktop defaults. Do not make PDF depend on transient browser interaction state.
- This sprint may proceed independently of Sprint 062 after the shared model is stable; final cross-surface acceptance requires both.

### Phase 3 - Integrated Acceptance and Closeout

#### Sprint 064: Cross-Surface Acceptance and V0.10 Closeout (depends on Sprints 062 and 063)

- Complete chart visual/behavior parity, offline, security, accessibility, printing, packaged-runtime, and regression verification.
- Update relevant reporting documentation, examples, and bundled help to describe the new behavior without inventing language changes or DOCX improvement claims.
- Run focused checks followed by integrated root/desktop validation and representative CLI HTML/PDF exports.
- Record exact evidence, unavailable-host checks, and residuals for a separate acceptance disposition. Closeout adds no product scope and does not itself authorize publication.

## Sprint 060 Technical Contract Gate

Business scope is resolved. Before implementation, make these contracts executable and reviewable:

- Select a supported ECharts version and a shared option/data model; demonstrate browser initialization, server-side static rendering, pdfmake serialization, and packaged desktop resolution with no network access.
- Specify bar/column orientation, numeric/DateTime/measurement line axes, source-order handling, scalar labels, grouped series, scatter grouping, negative/zero values, and duplicate labels/coordinates. Preserve accepted AMX semantics rather than silently sorting or aggregating data.
- Resolve independently normalized multi-series units on a common chart, ensuring axes/legends/tooltips do not imply an incorrect shared unit. Do not silently change normalization or discard dimensional metadata.
- Specify null gaps, omitted scatter points, empty/all-null states, and partially empty series/groups. Preserve table headings and never fabricate data or units.
- Define per-kind tooltip, legend-toggle, zoom/pan, reset, print, and resize behavior; cover input methods and accessible data access without requiring interaction to read the report.
- Choose representative chart dimensions, fonts, theme/accent rules, palette assignment, and visual comparison tolerances. Disable or bound animation where needed for deterministic static output and reliable screenshots.
- Prove least-privilege iframe behavior without same-origin access. Define trusted script injection, escaping/sanitization, and network/content restrictions so narrative or chart fields cannot execute arbitrary code after scripts are enabled.
- Demonstrate self-contained HTML packaging and safe runtime/payload embedding, packaged PDF dependencies, instance cleanup, and compatibility with existing worker output limits.
- Define rendering-failure diagnostics and preserve failed-export atomicity; do not silently replace failed chart graphics with success-looking output.

These are design gates, not deferred feature scope. If a feasibility result requires expanding the agreed architecture or changing compatibility constraints, obtain approval before implementation.

## Relevant Files

- [HTML renderer](../src/renderer/renderHtml.ts), [PDF renderer](../src/renderer/reportPdf.ts), and [report preparation](../src/renderer/reportPreparation.ts).
- [Chart AST](../src/ast/types.ts), [runtime emissions](../src/runtime/environment.ts), and [chart evaluation](../src/runtime/evaluateExpression.ts) as unchanged contract references.
- [CLI](../src/cli.ts), [PDF destinations](../src/runtime/pdfDestination.ts), [desktop worker](../desktop-app/src/bun/jobWorker.ts), and [desktop service](../desktop-app/src/bun/desktopService.ts).
- [Desktop preview](../desktop-app/src/mainview/App.vue), [desktop styles](../desktop-app/src/mainview/app.css), [root package](../package.json), [desktop package](../desktop-app/package.json), and desktop build scripts/configuration.
- [Renderer tests](../tests/renderer.test.ts), [PDF tests](../tests/reportPdf.test.ts), [cross-format presentation tests](../tests/reportPresentation.test.ts), [CLI PDF tests](../tests/pdfCli.test.ts), [examples](../examples/), and [desktop tests](../desktop-app/tests/).
- [V0.9 language contract](../docs/language-spec-v0.9.md) as the preserved measurement/language baseline; relevant reporting documentation and desktop help.
- [DOCX renderer](../src/renderer/reportDocx.ts) is explicitly outside implementation scope. Shared regression tests must not redefine its output to match ECharts.

## Verification

1. Assert shared options/data for every existing chart kind, supported scalar/record forms, labels, series/grouping, captured order, and immutable snapshots.
2. Cover numeric, DateTime, and measurement axes where already supported; multiple unit-normalized series; negative/zero values; duplicate labels; null gaps; empty/all-null and partially empty data.
3. Use browser screenshots and rendering assertions to prove charts are nonblank, unclipped, and legible at representative document/preview widths. Test tooltips, legend toggles, zoom/pan, reset, and resizing in standalone HTML and desktop preview.
4. Open standalone HTML as a local file with network disabled, and verify desktop preview/export and PDF generation without remote runtime/assets. Check packaged dependency resolution, not only development source execution.
5. Test untrusted narrative/markup and chart payload escaping in the script-enabled sandbox. Demonstrate denial of parent/application access, privileged bridge access, arbitrary authored scripts, and unwanted network requests.
6. Verify accessible titles/descriptions, complete data alternatives, print layout, and matching empty-state presentation across the in-scope destinations.
7. Inspect serialized PDFs for static graphics, correct labels/units/legends, searchable report/data text, page breaks, and representative visual parity. Byte generation or text extraction alone does not prove chart appearance.
8. Verify repeated rendering is stable, multiple charts remain independent, old preview instances are disposed, and interaction never mutates AMX emissions or affects fresh exports. Exercise existing output limits and failure/atomic-write behavior.
9. Run focused Bun renderer/PDF/presentation/CLI tests, then the repository-owned suite and root `bun run build`. Run desktop RPC tests, `typecheck`, `build:web`, and focused Playwright preview checks using existing commands.
10. Run representative CLI HTML/PDF and native desktop smoke checks on available hosts; record skipped/unavailable checks and residuals honestly. Check DOCX regressions only to preserve baseline output, not to add DOCX requirements or fixes.

Planning publication does not establish implementation, build, test completion, or release readiness. Public release, installer certification, package publication, unrelated historical residuals, and all DOCX-specific improvements remain outside this focused chart-rendering cycle.