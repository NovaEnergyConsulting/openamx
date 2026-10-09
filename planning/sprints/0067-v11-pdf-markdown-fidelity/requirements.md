# Sprint 067 Requirements: PDF Markdown Fidelity

## Goal

Render the shared V0.11 narrative model faithfully in PDF exports, including supported Markdown structure, images, and safe links. Preserve the current report and export contracts while replacing the PDF adapter's line-based narrative conversion.

## Entry Gate

- Sprint 066 is **ACCEPTED / CLOSED** by Lead Developer disposition dated 2026-10-09. Sprint 067 depends on Sprint 066 and consumes its shared narrative model.
- Sprint 066 closure does not itself authorize downstream implementation. Obtain explicit Sprint 067 implementation authorization before source or test edits; follow the repository's separate code-gate approval.
- The V0.11 master plan is the scope authority. This sprint owns PDF destination integration only; DOCX, HTML/preview, and native chart work remain assigned to Sprints 068, 070, and 069 respectively.
- Pass the validated final PDF destination and source-document context to PDF link materialization for both CLI and desktop exports. The eventual URI must be based on the final destination, never an atomic temporary path.
- Preserve existing local-file and remote-resource restrictions. Do not bypass viewer trust prompts or infer that a PDF annotation guarantees a viewer will open its target.

## Inputs

- `planning/plan-openamxV11MasterSprintPlan.md` (scope and compatibility authority)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 065 contract/evidence and Sprint 066 accepted model/evidence
- `src/renderer/narrativeModel.ts` and `src/renderer/reportPreparation.ts`
- `src/renderer/reportPdf.ts`, `src/runtime/pdfDestination.ts`, and the PDF export flow in `src/cli.ts`
- Desktop PDF job flow in `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`, and `desktop-app/src/bun/desktopService.ts`
- `tests/reportPdf.test.ts`, `tests/pdfCli.test.ts`, `tests/reportPresentation.test.ts`, and relevant desktop contract tests
- `examples/kitchen-sink.amx` as a read-only regression input and `examples/kitchen-sink.pdf` as a read-only baseline

## In Scope

- Replace line-based PDF narrative conversion with a destination adapter over `PreparedReportItem.markdown` and the shared narrative AST; do not parse Markdown a second time.
- Render the approved subset: heading levels 1-6, paragraphs, nested strong/emphasis, inline and fenced code, ordered and nested lists, blockquotes, Markdown tables, horizontal rules, HTTP/HTTPS links, internal heading links, validated relative local-file links, PNG/JPEG images, explicit line breaks, and the standalone page-break directive.
- Keep authored prose line breaks visible, blank lines as paragraph boundaries, code whitespace intact, and raw HTML inert literal text. Interpolated values remain text and are never reparsed as Markdown or markup.
- Map headings to stable PDF destinations and valid internal links to those destinations. Duplicate headings use the unique IDs already assigned by the shared model; unresolved fragments remain non-links.
- Embed the already-sanitized shared PNG/JPEG image bytes in the PDF, preserve alt text where supported, and fit images proportionally within the printable area without upscaling. Do not fetch remote image resources or reread author paths in the PDF adapter.
- Emit local-link URI annotations relative to the final PDF directory from the validated source-relative target. Preserve relative layout and URI encoding; do not copy companion files or place absolute machine paths in the PDF.
- Make final destination context available to both CLI and desktop PDF exports without weakening destination validation or changing the atomic-write path. Preserve the current behavior when no local links require destination context.
- Preserve report item order and identity, searchable source and narrative text, existing chart SVGs, emitted tables and values, page breaks, Roboto fonts, and atomic destination replacement.
- Extend PDF tests to cover generated structure, searchable output, link annotations, images, pagination, line breaks, and compatibility behavior.

## Out of Scope

- DOCX narrative or chart integration; standalone HTML or desktop-preview changes; preview RPC, navigation, or iframe changes.
- Any chart-model semantics, chart kind, chart rendering, axes, series, measurements, or empty/null behavior changes.
- AMX syntax/evaluation, report preparation semantics, show-time snapshots, source visibility, emissions, output caps, general PDF pagination redesign, or a PDF engine replacement.
- New dependencies, lockfile changes, font additions, author-facing styles/settings, remote images, companion-file copying, `mailto:`, or active raw HTML.
- Changes to `examples/kitchen-sink.pdf`, unrelated cleanup, release/publication work, or V0.11 closeout.

## Constraints

- Consume the immutable shared model from Sprint 066. Do not mutate it or alter its authoring, sanitization, interpolation, or validation behavior.
- Source-relative local target validation and final-output-relative URI generation are distinct. Use the validated target and final destination; never derive links from the atomic temporary file.
- Desktop destination context must come from the already validated host-side export request, not from authored content or an untrusted preview message.
- Keep `pdfmake` URL access disabled and local-file access restricted to the packaged font directory. Link annotations are not permission to fetch or embed arbitrary files.
- Use existing dependencies and test helpers. Do not modify the supplied PDF baseline; generated artifacts belong in disposable test locations and must be cleaned up.
- Preserve invalid-link non-link behavior and preparation diagnostics. Surface serialization or destination-context failures through existing report/export errors; do not create a success-shaped PDF with malformed or absolute links.
- Record exact commands, measurable results, any visual inspection, and residuals in Sprint 067 `builder-evidence.md`. No PDF viewer restriction may be bypassed or reported as a successful link-open test.
