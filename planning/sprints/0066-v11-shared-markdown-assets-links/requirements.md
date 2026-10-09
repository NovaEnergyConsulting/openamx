# Sprint 066 Requirements: Shared Markdown, Assets, and Link Model

## Goal

Implement and test the shared, destination-neutral narrative model authorized by the V0.11 master plan and Sprint 065 disposition. Preserve existing AMX evaluation, report item order, interpolation values, show-time snapshots, measurement semantics, emitted table values, and atomic export behavior. Sprint 066 prepares structure and validated references; later destination sprints own PDF/DOCX/HTML/preview adapters.

## Entry Gate

- Sprint 065 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by Lead Developer disposition dated 2026-10-09. Sprint 066 is authorized only for this scope.
- Work on the designated Windows development host with Microsoft Word desktop and web available. Record exact Windows and Word versions/channels, reviewer, and date for any application evidence; preserve prompts and restrictions.
- Before image decoding/embedding, obtain an explicit disposition of the unresolved 4,000,000 decoded-pixel proposal. The Lead Developer accepted 4 MiB input and 4 MiB sanitized-output bounds per image. Do not change existing aggregate worker caps.
- Native chart behavior is not Sprint 066 scope. Preserve chart model meaning. Numeric line axes, multiple unit axes, null/empty chart mapping, and Word application residuals remain open for Sprint 069. If this sprint encounters a shared-model conflict, stop and request direction; do not redefine chart behavior.

## Inputs

- `planning/plan-openamxV11MasterSprintPlan.md` (scope and ownership authority)
- Sprint 065 disposition and evidence in `planning/sprints/0065-v11-rendering-contract-feasibility-gate/`
- `src/renderer/reportPreparation.ts`, `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, `src/renderer/reportDocx.ts`, `src/renderer/chartModel.ts`
- `src/runtime/pdfDestination.ts`, `src/runtime/docxDestination.ts`, CLI and desktop worker/service destination flow
- `tests/renderer.test.ts`, `tests/reportPresentation.test.ts`, plus the destination tests as call-site/compatibility references
- `examples/kitchen-sink.amx` and the supplied `examples/kitchen-sink.pdf` (read-only; never overwrite the PDF)

## In Scope

- Add the smallest suitable shared, destination-neutral narrative structure for the approved Markdown subset: headings 1-6, paragraphs, nested bold/italic, inline/fenced code, ordered/nested lists, blockquotes, Markdown tables, horizontal rules, links, images, explicit breaks, and the exact standalone `<!-- page-break -->` directive.
- Make LF and CRLF equivalent. Preserve authored prose line breaks visibly, blank lines as paragraph boundaries, hard breaks, and code tabs/spaces/line breaks. Keep the page-break directive inert inside code.
- Treat raw HTML as escaped literal text. Resolve interpolation only into text nodes; never reparse interpolated values as Markdown/HTML. Keep emitted data cells and source/view items separate from narrative parsing.
- Specify and test deterministic document-wide heading IDs, duplicate handling, valid internal targets, and missing-fragment non-link behavior. Any exact slug/bookmark algorithm not already accepted by the master plan must be identified as a Sprint 066 implementation decision and covered by tests.
- Resolve local narrative assets relative to the source document. Canonicalize the permitted project root when supplied; otherwise use the canonical document directory. Reject traversal (including percent-encoded traversal), symlink components, non-regular/missing files, invalid/deceptive formats, remote resources, SVG, and data URIs. Re-encode accepted PNG/JPEG to strip metadata, require descriptive alt text, and calculate proportional no-upscale sizing.
- After pixel-bound disposition, enforce accepted per-image byte limits: no more than 4 MiB input and 4 MiB sanitized output. Keep current HTML/binary aggregate output caps unchanged.
- Model HTTP/HTTPS links, internal heading links, and relative local-file links distinctly. Validate local author paths relative to the source document, while retaining source base independently from final-export base. Do not copy/bundle companions or serialize machine-specific absolute paths. Record the Windows Word/viewer local-link prompts/restrictions; never bypass them.
- Add focused tests using existing parser/renderer/presentation test files for structure, escaping/interpolation, LF/CRLF, nesting, assets, containment, headings, links, invalid paths, and separate source/final output bases.

## Out of Scope

- PDF, DOCX, standalone HTML, or desktop preview adapter integration; those belong to Sprints 067, 068, and 070.
- Native DOCX chart implementation or changes to chart meaning; Sprint 069 remains blocked on faithful application evidence and a specific disposition for any irreconcilable mismatch.
- Desktop RPC navigation implementation, preview event handlers, iframe permission changes, or privileged host actions; Sprint 070 owns those changes.
- AMX syntax/evaluation, report identity/order, show-time snapshots, measurements, emitted table meaning, output atomicity, PDF engine/layout redesign, dependency/lockfile changes, and output-cap changes.
- Remote images, SVG/data-URI assets, automatic companion copying, executable links, `mailto:`, new author styling/settings, or behavior beyond the approved V0.11 scope.

## Constraints

- Follow the master plan and preserve all compatibility requirements. Do not treat the Sprint 065 Builder proposal as blanket approval where the Lead Developer did not answer an exact detail.
- Use structured parsing and existing utilities where suitable. Do not duplicate renderer parsing or add unnecessary dependencies.
- Keep source-relative asset/link validation distinct from final-output-relative link materialization; atomic temp paths are never link bases.
- No production pixel limit is implemented until the 4,000,000-pixel proposal is explicitly resolved. No worker cap changes.
- Record actual Word viewer versions and prompts only when observed. No Word desktop result may be inferred from OOXML or Word web.
- Sprint 066 completion does not authorize Sprint 069 chart work if its semantic gate remains unresolved; no release, publication, or V0.11 completion is implied.
