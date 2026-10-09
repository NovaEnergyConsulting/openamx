# Plan: OpenAMX V0.11 Document Rendering Fidelity

Confirmed planning scope on 2026-10-09. Repair Markdown rendering in PDF exports and improve DOCX conversion of Markdown, charts, tables, and code blocks. Both outcomes are mandatory. Preserve existing AMX syntax, evaluation, report identity, show-time snapshots, narrative/source/view ordering, measurement semantics, export atomicity, and already-working PDF headings, charts, and emitted tables. Limited HTML and desktop-preview changes for narrative images, newlines, and links are included to keep those behaviors consistent. This is a focused reporting version, not a general report or desktop redesign.

This plan describes required behavior, not implemented or verified functionality. Prepare detailed requirements, blueprint, acceptance criteria, and handoff sprint packs before their respective sprints using the [existing template](sprints/0000-sprint-template/). Publication of this plan does not authorize implementation.

Continue sprint numbering at 065 after V0.10's Sprint 064. Organize the work into a contract/feasibility gate, shared Markdown and asset preparation, parallel destination integrations, and integrated acceptance closeout. The closeout adds no product feature scope.

## Recommended Approach

- Parse the agreed Markdown subset once into a small, safe, destination-neutral representation. Use the existing `marked` dependency where suitable, but do not render authored raw HTML. PDF, DOCX, and HTML adapters translate the same narrative structures into destination-native output.
- Preserve the existing report-preparation pipeline, expression interpolation semantics, narrative/view ordering, immutable show-time snapshots, and atomic export behavior. Keep executable AMX source and emitted views distinct from narrative Markdown.
- Preserve every authored narrative newline as a visible break within prose. Blank lines remain paragraph boundaries; Markdown structure must not introduce spurious breaks. Preserve spaces, tabs, and line breaks in code. Specify LF/CRLF and hard-break behavior in Sprint 065.
- Resolve and sanitize local image bytes during shared preparation. Resolve author paths relative to the source document and require containment within the canonical project root when supplied, otherwise within the canonical document directory. Embed images in output; do not fetch remote resources.
- Export local file links as relative links from the actual output directory, not from a temporary atomic-write path. Recipients must carry companion files in the same relative layout. Never leak machine-specific absolute paths into exported documents.
- Use the installed `docx/charts` native chart API and embedded workbooks for editable Word charts, subject to executable compatibility and semantics gates. Map from existing chart meaning and units; do not blindly forward ECharts options. If an accepted case cannot be represented faithfully, stop for a product decision rather than coercing data or silently falling back to an image.
- In the desktop preview, route approved external and local navigation through a narrowly validated, confirmed host action. Keep the preview isolated; never grant authored content direct access to the desktop bridge, parent context, or arbitrary host paths.
- Extend existing renderer, PDF, DOCX, and desktop tests. Verify output structure and visual behavior, including actual Word desktop/web review; XML inspection alone does not establish compatibility.

## Confirmed Feature Scope

### Markdown and Narrative

- PDF and DOCX support headings levels 1-6, paragraphs, bold and italic (including nesting), inline code, fenced narrative code, ordered and nested lists, blockquotes, Markdown tables, horizontal rules, hyperlinks, and PNG/JPEG images.
- Apply the same narrative image and newline behavior in standalone HTML and desktop preview. Keep the existing report preview and chart interactions otherwise unchanged.
- Preserve each authored prose newline as a visible line break. Blank-line paragraph boundaries remain meaningful. Code blocks preserve line breaks, spaces, and tabs. Test LF and CRLF input and hard-break syntax.
- Raw HTML is not active markup in any destination. Render it as escaped literal text or another inert representation established by the contract gate. The exact existing `<!-- page-break -->` report directive remains supported outside code blocks.
- Generate stable, document-wide heading anchors/bookmarks for internal Markdown links, with deterministic duplicate-heading handling. Missing internal targets must not become misleading links.
- Preserve interpolation behavior and safely render interpolated text. Data values and emitted table cells are not reparsed as authored Markdown.

### Images and Hyperlinks

- Markdown images use contained, document-relative local PNG/JPEG assets; embed sanitized bytes for offline output. Require descriptive alt text, proportional page-width fit without upscaling, bounded file/pixel/output sizes, and clear errors for missing, invalid, or unsafe assets.
- No remote images, SVG author assets, data-URI author inputs, or new image sizing/caption settings are included.
- Support clickable HTTP/HTTPS, internal heading, and relative local-file links in PDF, DOCX, standalone HTML, and desktop preview. No `mailto:` or executable links are required.
- Local exported links remain relative. Recipients need the linked companion files and the same relative layout. Do not automatically copy or bundle linked files.
- Internal preview links navigate within the preview. External and local preview links require an explicit user click, host-side target validation, and confirmation before dispatch. Viewer prompts or restrictions are documented, never bypassed.
- Apply restrictive protocol and path allowlists. Local navigation must reject traversal, symlinks, stale/forged preview requests, and executable/script targets. Exact allowed local target types and preview message protocol are settled in Sprint 065.

### PDF

- Translate supported inline and block Markdown into readable pdfmake text runs and structures: links, images, rules, lists, blockquotes, tables, code, and explicit line breaks.
- Preserve Roboto fonts, searchable narrative and data, working headings, ECharts chart graphics, emitted tables, report identity/footer, page breaks, and atomic destination handling.
- No PDF engine replacement or general pagination redesign.

### DOCX

- Produce native editable Word paragraphs, text runs, lists, hyperlinks/bookmarks, tables, images, and code blocks. Tables have readable page-width layout, emphasized/repeating headers, and ordinary editable cells. Code remains selectable monospaced text with preserved whitespace, restrained shading, and readable wrapping.
- Produce native editable Word chart objects with embedded editable chart data for every existing AMX kind: `bar`, `column`, `line`, and `scatter`. Word desktop must support chart-data editing and save/reopen persistence. Word web must display charts and preserve native objects through save/download; editing chart data in Word web is not required.
- Retain chart titles/descriptions, accessible descriptions, and a complete data-table alternative. Empty/all-null data must not invent values or points. Chart failures must be reported clearly and preserve an existing output destination; no silent static-image fallback.
- Match chart meaning, kind, series/grouping, units, and legibility. Pixel-identical appearance with ECharts is not required. Word edits do not round-trip into AMX source.
- No syntax highlighting, new author style settings, Word templates, merged-cell features, macros, or DOCX import.

### Explicit Exclusions

- AMX syntax, type, evaluation, or editor-language changes; new chart kinds or raw ECharts author settings.
- Remote narrative images, arbitrary embedded attachments, automatic local-file copying/bundling, macros, and arbitrary executable links.
- Word-to-AMX round-trip, syntax highlighting, general report redesign, PDF engine replacement, or broad desktop-preview redesign.
- Unrelated V0.10 residuals, installer certification, public release, and package publication.

## Current-Codebase Evidence

- [PDF renderer](../src/renderer/reportPdf.ts) and [DOCX renderer](../src/renderer/reportDocx.ts) currently process narrative text line by line. Both preserve headings and flat bullets but do not produce inline Markdown formatting, hyperlinks, Markdown tables, rules, or narrative images. Multi-line prose is joined with spaces.
- The DOCX renderer currently creates editable emitted tables, but charts are simplified SVG images with a transparent PNG fallback plus a data table. Source AMX is emitted as a monospaced paragraph.
- [Report preparation](../src/renderer/reportPreparation.ts) preserves ordered narrative, source, and view items and resolves inline expressions. Its logo pipeline already demonstrates path containment, symlink rejection, format/size checks, and image sanitization; narrative assets need an appropriately adapted policy.
- [HTML rendering](../src/renderer/renderHtml.ts) uses `marked` followed by a sanitizer. Current policy strips link destinations and disallows narrative images. Existing nonce/CSP and iframe isolation remain security constraints.
- [Chart model](../src/renderer/chartModel.ts) defines shared chart semantics, including series, axes, measurements, accessibility, and tabular data. Reuse its meaning rather than independently reinterpreting emissions for Word.
- [Document parser](../src/parser/parseDocument.ts) executes exact `amx` fences; other code fences remain narrative. This language behavior is unchanged.
- Root dependency metadata allows `docx` `^9.8.1`; desktop pins `9.8.1`. The installed package exposes the `docx/charts` subpath and native chart APIs for the existing chart kinds. Actual serialization, embedded data, packaged-worker resolution, and Word compatibility are not yet proven.
- Desktop preview uses an isolated `srcdoc` iframe with scripts but without same-origin permission. Existing trusted desktop path-opening APIs are not permission to pass authored URLs or paths directly to the host.
- User supplied [examples/kitchen-sink.pdf](../examples/kitchen-sink.pdf) as a representative regression artifact. It was confirmed present, but has not yet been visually inspected; do not claim a visual baseline until Sprint 065 evidence is collected. Use [examples/kitchen-sink.amx](../examples/kitchen-sink.amx) as the initial source fixture and keep its known-limitations text accurate as fixes land.

## Steps

### Phase 1 - Contract and Feasibility

#### Sprint 065: Rendering Contract and Feasibility Gate (depends on nothing)

- Prepare requirements, blueprint, acceptance criteria, and handoff using the existing sprint template.
- Build a behavior matrix for the agreed Markdown constructs across PDF, DOCX, HTML, and desktop preview. Capture the kitchen-sink PDF baseline without implying that it has already been visually inspected.
- Specify prose newline/paragraph rules, code whitespace, nested structures, raw HTML handling, page-break directive behavior, heading IDs/bookmarks, duplicate headings, and invalid fragments.
- Prove `docx/charts` serialization for all four chart kinds, chart relationships, embedded workbook data/caches, and Bun plus packaged desktop-worker dependency resolution.
- Pilot actual Word desktop chart display, data editing, save, and reopen; pilot Word web display and native-chart preservation through save/download. User confirms Microsoft 365 web access and desktop review availability. Record actual application/platform versions.
- Exercise chart semantics that may challenge native mapping: numeric and UTC DateTime line axes, uneven intervals, source order, duplicate labels, multiple measurement units/axes, null gaps, empty data, and scatter grouping. Do not silently convert continuous axes to equally spaced categories, coerce null to zero, reorder data, alter units, or change chart kind.
- Prove relative local hyperlink targets in PDF and DOCX after export relocation, including URI encoding and atomic-write behavior. Record tested viewer/Word behaviors and security prompts; do not bypass viewer policies.
- Set image byte, pixel, and output bounds based on representative portrait/landscape assets and existing worker limits, not by copying logo-specific limits.
- Define the desktop preview navigation protocol: user-initiated action, exact frame/revision identity, host-side target mapping/revalidation, allowlists, confirmation, and rejection of authored or stale/forged messages. Preserve `allow-scripts` without `allow-same-origin` and do not grant broad bridge access.
- This is a gate, not permission to defer mandatory outcomes. If an accepted behavior cannot be proven or requires scope/dependency changes, return for an explicit decision before implementation.

### Phase 2 - Shared Narrative and Assets

#### Sprint 066: Shared Markdown, Assets, and Link Model (depends on Sprint 065)

- Add the smallest suitable shared narrative normalization layer for the confirmed subset, preserving report order, interpolation semantics, and the distinct source/view item types.
- Represent supported inline/block structures, explicit breaks, inert raw HTML, and the existing page-break directive. Keep emitted data cells as text, not Markdown.
- Resolve and sanitize image assets relative to the authoring document within the canonical project/document boundary. Reject symlinks, traversal, unsupported formats, invalid content, missing files, and oversized assets with clear diagnostics.
- Validate links by scheme/type and containment. Assign stable heading anchors and bookmarks with consistent duplicate handling. Keep source base separate from final output base for portable local links.
- Add focused tests to existing renderer/presentation suites for structure, escaping/interpolation, LF/CRLF, nested blocks, assets, headings, links, invalid targets, and document boundaries.

### Phase 3 - Destination Integration

#### Sprint 067: PDF Markdown Fidelity (depends on Sprint 066; may run in parallel with Sprints 068 and 070)

- Replace line-based narrative conversion with shared narrative-to-pdfmake structures for formatted runs, links, rules, lists, blockquotes, native Markdown tables, code, images, and visible line breaks.
- Preserve working headings, chart graphics, emitted tables, searchable text/data, report identity/footer, page breaks, fonts, and atomic writes.
- Verify formatting inside headings/lists/tables, multi-page Markdown tables, link annotations, local-link portability, image sizing, rules, and long prose/code layout. Avoid chart or PDF-engine redesign.

#### Sprint 068: Native DOCX Narrative, Tables, and Code (depends on Sprint 066; may run in parallel with Sprints 067 and 070)

- Map shared structures to native `Paragraph`/`TextRun`, numbering, hyperlinks/bookmarks, editable tables, inline images, and rules.
- Preserve inline styling and explicit breaks within headings, lists, and table cells. Keep code selectable, monospaced, and whitespace-preserving.
- Use restrained built-in styling without author-facing settings. Ensure table headers are emphasized/repeated where supported and tables fit page width with sensible row splitting.
- Preserve metadata/footer/order, source visibility, emitted table values, null and measurement display semantics. Never parse emitted cell values as Markdown.

#### Sprint 069: Editable Native Word Charts (depends on Sprints 065, 066, and 068)

- Replace the current SVG/image chart path with a native `ChartRun` adapter and embedded workbooks using the `docx/charts` API proven in Sprint 065.
- Map existing chart model semantics for `bar`, `column`, `line`, and `scatter`, preserving series, grouping, colors, units, axes, data order, labels, negative/zero values, DateTime meaning, duplicates, and null gaps.
- Retain titles/descriptions, chart accessibility descriptions, and a complete table alternative. Empty/all-null states show truthful headings and no fabricated points; do not emit a misleading success-looking substitute.
- Verify chart XML, relationships, caches, and workbook values; prohibit external workbook relationships, macros, and remote resources. Fail clearly and preserve the prior destination on chart serialization failure.
- Repeat actual Word desktop edit/save/reopen and Word web preservation checks across representative chart kinds, not just the pilot.

#### Sprint 070: HTML Alignment and Controlled Preview Links (depends on Sprint 066; may run in parallel with Sprints 067 and 068)

- Align standalone HTML and desktop preview narrative images, visible prose newlines, and approved links through both existing HTML render paths. Do not redesign HTML or change chart behavior beyond necessary security integration.
- Embed sanitized local images in standalone HTML; do not fetch remote resources. External navigation is user-initiated only.
- Internal preview links navigate within the document. External/local preview links dispatch opaque target identifiers through a dedicated host-validated protocol; the host maps targets to the active document revision, revalidates, confirms, and invokes only approved native actions.
- Reject raw authored URLs/paths in privileged RPC, arbitrary message commands, synthetic/stale-frame requests, and untrusted content as authorization. Preserve iframe isolation and existing chart interactions.
- Extend RPC, UI, and hostile-content tests for permitted clicks, malformed/forged/stale messages, parent/bridge denial, automatic network/navigation attempts, and safe confirmation behavior.

### Phase 4 - Acceptance and Closeout

#### Sprint 071: Integrated Acceptance and V0.11 Closeout (depends on Sprints 067, 069, and 070)

- Complete a requirement-to-evidence matrix across CLI/desktop PDF, DOCX, and HTML, using identical captured report data and representative kitchen-sink/focused fixtures.
- Inspect PDFs visually and for searchable text and link annotations. Inspect DOCX package structure and actual Word behavior. Desktop evidence must include chart edit/save/reopen; web evidence must include display and save/download preservation with the chart remaining native/editable on desktop. Record application/platform versions. Missing host/application evidence blocks the corresponding acceptance criterion.
- Update reporting documentation, relevant examples, and desktop help with image base rules, supported Markdown, newline semantics, safe links, and companion-file requirements. Do not imply a language-version change.
- Run focused checks first, then integrated root and desktop validation. Record exact results, unavailable checks, and residual owners. Do not repair unrelated historical residuals or change prior chart-visual thresholds.
- Closeout adds no product features and does not itself authorize release or publication.

## Relevant Files

- [Report preparation](../src/renderer/reportPreparation.ts), [PDF renderer](../src/renderer/reportPdf.ts), [DOCX renderer](../src/renderer/reportDocx.ts), and [HTML renderer](../src/renderer/renderHtml.ts).
- [Shared chart model](../src/renderer/chartModel.ts), [runtime emissions](../src/runtime/environment.ts), and [document parser](../src/parser/parseDocument.ts) as preserved-contract references.
- [CLI](../src/cli.ts), [PDF destination](../src/runtime/pdfDestination.ts), [DOCX destination](../src/runtime/docxDestination.ts), [desktop worker](../desktop-app/src/bun/jobWorker.ts), and [desktop service](../desktop-app/src/bun/desktopService.ts).
- [Desktop preview](../desktop-app/src/mainview/App.vue), [desktop RPC types](../desktop-app/src/shared/rpc.ts), and [desktop host entry](../desktop-app/src/bun/index.ts).
- [Renderer tests](../tests/renderer.test.ts), [PDF tests](../tests/reportPdf.test.ts), [DOCX tests](../tests/reportDocx.test.ts), [presentation tests](../tests/reportPresentation.test.ts), [PDF CLI tests](../tests/pdfCli.test.ts), [DOCX CLI tests](../tests/docxCli.test.ts), and [example tests](../tests/examples.test.ts).
- [Desktop RPC tests](../desktop-app/tests/rpc-contract-check.ts) and [preview security tests](../desktop-app/tests/ui/html-chart-security.pw.ts).
- [Kitchen-sink source](../examples/kitchen-sink.amx) and user-supplied [kitchen-sink PDF](../examples/kitchen-sink.pdf). Do not overwrite the supplied PDF as a generated test artifact.
- [README](../README.md), [language spec v0.5](../docs/language-spec-v0.5.md), [language spec v0.9](../docs/language-spec-v0.9.md), and [desktop help content](../desktop-app/src/mainview/components/help-content.json) for reporting guidance updates only; no language syntax change is planned.

## Verification

1. Run focused root tests for renderer, PDF, DOCX, and report presentation, followed by PDF/DOCX CLI and example tests. Include chart-model and measurement regressions.
2. Inspect PDF text, font/run styling, link annotations, representative raster output, and page flow. Text extraction or successful byte generation alone does not prove formatting or layout.
3. Inspect DOCX with the existing JSZip-based test approach: run styling, breaks, numbering, bookmarks, hyperlinks, tables, images, chart relationships, embedded workbooks, and cached values. Reject dangling parts, external workbook references, macros, and active raw HTML.
4. Cover nested formatting, formatted headings/lists/table cells, duplicate headings, LF/CRLF, blank lines, rules versus setext headings, literal delimiters/code fences, long URLs/code, tabs/spaces, portrait/landscape images, and multi-page tables. Verify interpolation and ordinary emitted data text remain unchanged.
5. Cover all chart kinds and supported scalar/record forms, multiple series, scatter groups, numeric/UTC DateTime axes, uneven intervals, multiple units/axes, negative/zero values, duplicates/order, null gaps, empty/all-null/mixed-null data, and representative bounded workloads.
6. In actual Word desktop, open without repair warnings, edit chart data/series, save/reopen, and verify the native chart and changed values persist. Check tables, code, links, and images. In Word web, verify display, save/download, and reopen in desktop to confirm the chart remains native/editable. Record reviewer and application versions.
7. Test path traversal, symlinks, missing/deceptive/oversized images, invalid schemes, remote assets, raw HTML, forged/stale preview messages, and automatic navigation attempts. Verify allowed links require a real user action and host confirmation. Record viewer restrictions on local-file links without bypassing them.
8. Run representative CLI PDF, DOCX, and HTML exports to temporary destinations. Exercise image fixtures with an explicit source/project base, relocate outputs with companion files, and verify relative-link behavior. Never overwrite the supplied `examples/kitchen-sink.pdf`.
9. Run focused checks, then root `bun test` and `bun run build`. In `desktop-app`, run `bun run test`, `bun run typecheck`, `bun run build:web`, and focused Playwright preview/security/navigation checks. Verify packaged worker dependency resolution, not only development execution.
10. Confirm invalid assets or failed chart serialization preserve existing PDF/DOCX destinations and leave no temporary files. Preserve preview freshness, cancellation, and worker output limits.

Plan publication does not establish implementation, test completion, or release readiness. Native API availability and OOXML inspection do not prove Word compatibility. Mandatory acceptance failures cannot be silently deferred, replaced by static charts, or waived without an explicit scope decision. Viewer restrictions must be recorded and never bypassed. Public release, installer certification, and package publication remain outside this focused rendering cycle.
