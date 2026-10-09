# Sprint 067 Acceptance Criteria

Sprint 067 is complete only after implementation evidence and a separate Lead Developer disposition. It does not imply DOCX/HTML integration, V0.11 completion, release, or publication.

## PDF Narrative Fidelity

- The PDF adapter consumes the shared narrative AST and renders every in-scope block and inline node without reparsing Markdown.
- Heading levels 1-6, paragraphs, nested strong/emphasis, inline/fenced code, ordered and nested lists, blockquotes, Markdown tables, horizontal rules, and page breaks appear in the correct order and remain readable/searchable.
- LF and CRLF fixtures produce equivalent PDF narrative structure. Authored prose breaks are visible; blank lines remain paragraph boundaries; hard breaks and code line breaks/spaces/tabs remain observable.
- Tables render as PDF tables with readable width, emphasized headers, and repeated headers across page breaks. A multi-page fixture verifies continuation and row readability.
- Raw HTML is inert literal text. Interpolated values and captured source/view emissions remain text/data, are not interpreted as Markdown, and do not alter evaluation or report ordering.
- The exact standalone `<!-- page-break -->` directive creates a page break; the directive inside code remains literal code.
- Stable shared heading IDs are attached to PDF destinations. Valid internal links navigate to the intended heading; missing fragments produce no clickable annotation.

## Links and Images

- Valid HTTP/HTTPS links produce URI annotations; unsupported or rejected links are not clickable and retain the preparation diagnostic.
- Local link annotations are relative to the actual final PDF directory, use the validated source-relative target, preserve URI encoding, and remain resolvable when the PDF and companion files are relocated together in the documented relative layout.
- Tests use different source and final-output directories and verify annotations contain no machine-specific absolute path, drive path, `file:` URL, atomic temporary path, or implicitly copied companion.
- Both CLI and desktop PDF serialization receive the validated final destination context. Destination validation, overwrite checks, and atomic replacement are unchanged.
- Shared sanitized PNG/JPEG data is embedded without remote access or source-file rereads. Portrait and landscape images fit proportionally within printable bounds without upscaling; alt text is retained in the supported PDF representation.
- Invalid asset/preparation/serialization failures are surfaced and do not replace an existing output file. PDFMake's remote URL access stays disabled and local resource access remains font-only.

## Compatibility and Evidence

- Existing report title/metadata/footer, Roboto fonts, page numbering, item order, source visibility, chart SVGs and chart tables, emitted tables/values, and atomic output behavior remain intact.
- The generated kitchen-sink PDF retains all existing charts and data tables and visibly renders its supported narrative Markdown. The supplied `examples/kitchen-sink.pdf` remains unchanged.
- Focused PDF, CLI, and presentation tests pass; root build and test suite pass. If desktop job files change, desktop typecheck and RPC contract tests pass.
- Builder evidence records exact commands, test counts, generated artifact inspection, output relocation/link annotation results, any visual inspection performed, and blocked or untested viewer behavior. PDF.js or XML/annotation inspection is not represented as proof that an installed PDF viewer permits opening local targets.
- No DOCX, HTML/preview, native chart, parser/evaluator, shared model, dependency/lockfile, font, cap, unrelated, release, or publication scope is added.
