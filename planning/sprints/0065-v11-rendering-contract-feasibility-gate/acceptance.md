# Sprint 065 Acceptance Criteria

Sprint 065 is complete only when the Builder has submitted the following evidence and the Lead Developer has recorded a separate gate disposition. Builder evidence alone does not authorize Sprint 066.

## Contract

- A traceable behavior matrix covers every agreed Markdown block/inline construct on PDF, DOCX, standalone HTML, and desktop preview, with consistent narrative structure and destination-specific representation.
- LF/CRLF, prose newline visibility, blank paragraphs, hard breaks, code whitespace, nested blocks, inert raw HTML, interpolation escaping, emitted table-cell text, and exact page-break directive behavior are explicit and represented by executable examples.
- Heading anchors/bookmarks are document-wide and stable, with deterministic duplicate behavior and non-misleading handling of missing fragments.
- Asset and link contracts specify canonical source/project/document boundaries, safe formats/protocols, sanitization, alt text, sizing, resource bounds, relative output behavior, output relocation, companion-file expectations, and viewer restrictions.
- Desktop preview navigation proposal is narrowly specified: real user action, active frame/revision binding, opaque target IDs, host-side target resolution/revalidation, allowlists, confirmation, and rejection of stale/forged/raw URL/path requests. It retains opaque origin and grants no same-origin, direct bridge, or arbitrary host access.
- The supplied kitchen-sink PDF is preserved. Evidence distinguishes a captured artifact from one actually inspected, names the reviewer/tool, and records only verified baseline observations.

## Feasibility

- `docx/charts` is exercised for `bar`, `column`, `line`, and `scatter`; evidence records serialization, relationships, embedded editable workbook values/caches, axes, series/grouping, and worker/bundler/package resolution with exact dependency/runtime versions.
- Actual Word desktop review opens representative output without repair warnings, edits chart data/series, saves, closes/reopens, and verifies the edit persists as a native chart.
- Actual Word web review displays the charts and saves/downloads the document; desktop Word confirms the saved chart remains a native editable object. App versions, platform, files, steps, and reviewer are recorded.
- Numeric and UTC DateTime line axes, uneven intervals, source order, duplicate labels, multiple units/axes, null gaps, empty/all-null data, negative/zero data, and scatter grouping are explicitly exercised or are reported as blocked with exact evidence gaps.
- No accepted chart case is silently coerced, reordered, aggregated, converted to equally spaced categories, converted from null to zero, changed to another chart kind, or replaced by a static image. Any unrepresentable accepted case is submitted for product decision and blocks downstream implementation.
- Relative local PDF/DOCX hyperlinks are tested after atomic output relocation and with companion files in their documented relative layout. No machine-specific absolute path or implicit file copy is emitted. Viewer prompts/restrictions are recorded, not bypassed.
- Image byte/pixel/output bounds are evidence-backed against representative portrait/landscape inputs and existing worker constraints. Valid/invalid format, missing/oversized, traversal, symlink, path containment, content mismatch, alt text, and proportional no-upscale behavior are covered.

## Evidence and Disposition

- Builder evidence reports each criterion as passed, failed, blocked/unavailable, or not run; includes exact commands/actions, dependency/app/OS versions, artifacts, and residual owners. Partial success is not promoted to a gate pass.
- No production source, runtime dependency/manifest/lockfile, output limit, iframe permission, or user-visible behavior was changed. Disposable probes and their cleanup are accounted for without deleting pre-existing files.
- Any mandatory Word application access that is unavailable remains a blocking residual; package/XML tests do not substitute. No Sprint 066 implementation handoff is authorized until Lead Developer explicitly accepts or revises the gate.
- Lead Developer disposition names accepted contract decisions, failed/unavailable checks, any required follow-up, whether Sprint 066 is authorized, and that no release/publication or final V0.11 acceptance is implied.

## Lead Developer Disposition (2026-10-09)

- **COMPLETE / APPROVED WITH RECORDED RESIDUALS. Sprint 066 is authorized** for the shared Markdown/assets/link model only.
- Sprint 066 must use the Windows development host with Word desktop and web access. Record exact applications, versions, reviewer, date, actions and prompts. Word desktop edit/save/close/reopen was unavailable in Sprint 065 and remains unverified until run on that host.
- Word output must remain consistent with established OpenAMX semantics and HTML/PDF behavior. The numeric-line mismatch and other native chart mapping cases are not waived. If unresolved by direct Windows Word evidence, return with a concrete case for Lead Developer decision before Sprint 069 implementation.
- The 4 MiB input and 4 MiB sanitized image byte bounds are accepted. The 4,000,000-pixel bound is not explicitly dispositioned; resolve it before image decoding/embedding. No existing worker caps are changed.
- The preview navigation protocol proposal is approved as design direction for Sprint 070; no preview/RPC/iframe implementation is authorized in Sprint 066. Recheck local viewer restrictions on Windows and never bypass prompts.
- No V0.11 completion, release, publication, platform certification, or authorization beyond Sprint 066's assigned scope is implied.