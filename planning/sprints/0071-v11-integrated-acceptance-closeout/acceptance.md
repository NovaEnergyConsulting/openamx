# Sprint 071 Acceptance Criteria

Sprint 071 is complete only after the integrated matrix is populated, closeout documentation/examples are accurate, all mandatory criteria have direct evidence, and a separate Lead Developer disposition records V0.11 status. Any mandatory criterion that remains unpassed blocks V0.11 completion unless the Lead Developer explicitly dispositions that named residual; no unpassed check is relabeled as passed. Sprint 071 does not authorize release or publication.

## Integrated Evidence Matrix

- A matrix maps every V0.11 master-plan behavior to source fixture/input values, CLI/desktop PDF, DOCX, standalone HTML, desktop preview, exact test/manual action, artifact, status, and residual owner.
- The same report identity, source, report settings, data mappings, and captured view values are compared across applicable outputs. Narrative/source/view ordering, emitted table values, units, nulls, and chart data alternatives remain semantically consistent.
- Every row is explicitly PASS, FAIL, BLOCKED/UNAVAILABLE, or NOT RUN. Partial success or an adjacent surface's result is not used to mark a different surface passing.

## PDF and DOCX

- Generated PDFs are visually/raster inspected on representative pages and checked for searchable narrative/data, identity/footer, Roboto, page breaks, page flow, Markdown formatting, tables, images, chart output, and safe link annotations. Viewer trust restrictions are recorded and never bypassed.
- The supplied `examples/kitchen-sink.pdf` is byte-identical to its pre-run SHA-256 and is never overwritten.
- DOCX package inspection verifies narrative structure, tables, images, bookmarks/links, chart objects, embedded workbook relationships/values/caches, accessible descriptions/table alternatives, and absence of external workbook links or macros.
- Actual Word desktop opens representative DOCX files without repair warnings. Representative native chart data/series edits survive save, close, and reopen.
- Word for the Web displays representative charts and the numeric-X null-gap case; the document saves/downloads, and the downloaded copy is reopened in Word desktop to verify charts remain native/editable.
- A screen-reader/accessibility review directly exercises chart title/description and the complete table alternative. Screen-reader name/version, Word version, reviewer, actions, and result are recorded. If unavailable, the criterion is BLOCKED, not inferred from package or accessibility-tree inspection.
- Approved chart policies are verified: numeric-X line uses continuous XY scatter-with-straight-lines; unsupported axes, zero-plottable charts, mixed-group scatter with null-only group, and permitted no-coordinate series use truthful notices/omissions and complete tables as specified in Sprint 069 decisions. No values, units, ordering, nulls, or points are fabricated.

## HTML and Desktop Preview

- Standalone HTML and desktop preview render supported shared Markdown consistently, preserve visible line breaks, keep raw HTML/interpolation inert, display sanitized local PNG/JPEG offline, and issue no remote image requests.
- Standalone local links are final-output-relative and no companion files are copied. Preview links use opaque IDs and host-side revalidation/confirmation; internal anchors stay in-frame.
- Forged, stale, wrong-frame, synthetic, malformed, unsupported-scheme, traversal, symlink, missing-file, and disallowed-extension cases fail closed. Existing iframe sandbox/CSP and chart interactions remain intact.
- The actual Electrobun native confirmation UI and OS opener are exercised with safe disposable targets where available. Cancel opens nothing; approved open proceeds only after confirmation. If only mocks/harnesses are available, native integration remains BLOCKED and is not described as verified.

## Documentation, Examples, and Validation

- `README.md`, desktop Help, and relevant example descriptions accurately state supported Markdown/newline behavior, local image rules, external/local links, relative companion-file requirements, offline behavior, and viewer limitations.
- DOCX documentation reflects native editable charts with embedded data for representable cases and explicitly documents approved no-chart/table deferrals. Stale “static image” or “DOCX chart behavior unchanged” claims are corrected. No language syntax/version change is implied.
- Focused tests, root build, full root suite, desktop worker/host tests, desktop typecheck/web build, Playwright security/freshness tests, and desktop contract suite are run and recorded. Existing root editor/help, timing-sensitive worker, and desktop sandbox-count failures are compared with prior evidence; no new unexplained failure remains.
- Exact app/runtime/browser/screen-reader versions, commands, counts, output hashes, screenshots/artifact paths, actions, prompts, test statuses, and residual owners are present in `builder-evidence.md`.
- The Lead Developer disposition names the final V0.11 acceptance status and each retained residual. No release, publication, platform certification, or broader compatibility claim is made.
