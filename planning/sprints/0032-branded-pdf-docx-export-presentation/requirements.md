# Sprint 032 Requirements: Branded PDF and DOCX Export Presentation

## Goal

Apply the approved V0.5 resolved report identity and content hierarchy to offline pdfmake and DOCX exports using format-native styling. Preserve one evaluated analysis path, ordered source/narrative/view content, searchable PDF text, editable DOCX structure and atomic no-write guarantees.

## Entry Gate

- Sprint 032 depends on Sprint 031 acceptance. The user reports Sprint 031 Builder completion, but `planning/state.md` has no Sprint 031 Builder outcome or Lead Developer acceptance. Current HTML identity handling remains inside `renderHtml.ts`, accepts `data:` logos and silently omits invalid local files, while PDF/DOCX independently inspect frontmatter. This does **not** establish the approved shared validated model or asset policy. Before Sprint 032 implementation, record Sprint 031 acceptance with focused evidence after correcting these gaps, or an explicit Lead Developer dependency disposition and a named prerequisite remediation owner. Do not replicate unvalidated HTML behavior in exports or treat Sprint 031 as accepted by assertion alone.

## Inputs

- `planning/plan-openamxV05MasterSprintPlan.md`, Sprint 032; approved `docs/language-spec-v0.5.md`, especially sections 1-4 and report/export compatibility clauses
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md` F0-F5; Sprint 031 requirements, acceptance and actual Builder evidence when recorded
- `src/renderer/reportPdf.ts`, `src/renderer/reportDocx.ts`, `src/renderer/renderHtml.ts`, trusted report-preparation boundary when accepted, `src/cli.ts`, `desktop-app/src/bun/desktopService.ts`, PDF/DOCX destination writers and existing export tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for dependency decisions, prior exceptions and release residuals

## In Scope

- Consume the Sprint 031 immutable, validated resolved report identity/content sequence (evaluated document, final narrative values, original formatted source and immutable `viewEmissions`) in both PDF and DOCX. Use the same identity precedence and `sourceVisible` decision as HTML; never reread project config/assets, modules or inputs, or reevaluate AMX inside an export adapter. Keep existing public adapter entry points compatible where feasible.
- Present title, organization/logo, author, status/classification and footer/legal notice in format-native PDF and DOCX layouts. Apply the approved offline type/spacing/contrast tokens, bounded logo image, headings, captions, code/source and table/figure hierarchy. Preserve source/view order, explicit page breaks, repeated table headers where supported, page numbers and accessible textual chart data.
- Use the already sanitized, bounded local PNG and effective alt/description prepared by the trusted caller. PDF embeds locally through the engine API; DOCX embeds package media with alt/description or adjacent descriptive text when image alternatives cannot be verified. No network image/font loading, original logo filenames, EXIF, unsanitized SVG logos, external OOXML relationships or unlicensed font additions.
- Keep PDF body/headings/source/searchable table and chart data as text, and DOCX headings/paragraphs/lists/tables/source as editable semantic OOXML. Charts remain static representations with data alternatives; preserve all V0.4 table/bar/column/line/scatter bindings, show-time snapshots, declaration order and data values. Do not promise identical HTML/PDF/DOCX pagination or pixels.
- Preserve CLI `export pdf|docx --project-root` and desktop selected-project current-entry-buffer routing through the existing preflight/atomic destination writers. Invalid identity, unavailable asset, analysis failure, serialization or invalid destination must not replace an existing output; never mislabel a failed export as success. Keep input mapping/path bases and `run` unchanged.
- Add focused PDF/DOCX structural/content/path/no-write tests for neutral/no-metadata compatibility, project/report precedence, escaped metadata, invalid-logo and accent fallback, visible/hidden source, narrative/source/view order, long tables and page breaks, logos/footers, textual chart data, unsupported assets and existing-destination preservation. Record actual engine-specific accessibility, font and Office limitations; document manual-review findings for Sprint 034 without claiming its Lead Developer sign-off.

## Out of Scope

- Repairing Sprint 031's shared identity/security defects as an implicit change to the approved Sprint 032 dependency; prerequisite remediation must be separately recorded/accepted before exporting with branding.
- New chart kinds, evaluation semantics, interactive exports, browser-print fallback, remote assets, PDF/A or tagged-PDF certification, broad Office compatibility or HTML/PDF/DOCX pixel parity.
- Sprint 029 native picker/quit and Sprint 030 editor exceptions; Sprint 033 VS Code providers; Sprint 034 CLI/docs/examples/final visual-review disposition; license/Marketplace publication.

## Constraints

- The approved V0.5 contract is normative; never consume a raw `logo` path, unchecked `data:` URI, or unvalidated `report` frontmatter directly in PDF/DOCX. Fail before write with approved `AMX6001`/`AMX6002` diagnostics rather than silently omitting branding.
- Preserve source-visible default, V0.2-V0.4 language/data/view ordering, format-native accessible data, existing destination validation, complete preparation, same-directory temporary writes and atomic rename. No second analysis/evaluation path.
- Distinguish Sprint 032 feature proof from inherited macOS/Windows/native Ubuntu, Hutch package/native-launch, broad Office, project license/Marketplace and Sprint 034 visual-review gates. WSL2/direct package tests cannot certify native release targets.
