# Sprint 065 Requirements: V0.11 Rendering Contract and Feasibility Gate

## Goal

Turn the approved V0.11 reporting scope into an executable, reviewable cross-destination contract and establish whether the proposed shared Markdown/assets model, native DOCX charts, portable links, and controlled desktop-preview navigation are feasible. Submit evidence, unresolved decisions, and residuals for a separate Lead Developer disposition before Sprint 066 implementation begins.

This is a contract and feasibility sprint. It does not implement product behavior. A contract proposal, package API inspection, or isolated proof of concept is not evidence that the product supports the behavior.

## Dependencies and Entry Gate

- No sprint dependency. Numbering continues after V0.10 Sprint 064.
- `planning/plan-openamxV11MasterSprintPlan.md` is the authority for V0.11 scope, compatibility constraints, recommended architecture, sprint dependencies, and verification.
- Sprint 064 and final V0.10 implementation are accepted/closed with recorded residuals. Those residuals retain their exact outcomes and are not Sprint 065 targets unless the V0.11 plan explicitly says otherwise.
- Existing AMX syntax/evaluation, report identity and item order, interpolation semantics, captured show-time snapshots, measurements, emitted table values, output atomicity, and working PDF headings/charts/tables are compatibility baselines.
- Inspect and preserve the worktree. Keep probes disposable and separate from production paths, runtime manifests, lockfiles, user artifacts, and the supplied `examples/kitchen-sink.pdf`.
- No production implementation, dependency update, or behavior change is authorized by this sprint. Sprint 066 remains gated on explicit Lead Developer approval of the contract and feasibility outcomes.

## Inputs

- `planning/plan-openamxV11MasterSprintPlan.md`, especially Confirmed Feature Scope, Current-Codebase Evidence, Sprint 065, and Verification
- `planning/sprints/0000-sprint-template/`
- Existing report preparation, PDF/DOCX/HTML rendering, chart model, parser, desktop preview/RPC/host code, dependency metadata, and tests identified by the master plan
- `examples/kitchen-sink.amx` and the supplied `examples/kitchen-sink.pdf` regression artifact; the PDF must not be overwritten
- Microsoft Word desktop and Word web access, if available; exact app/platform versions and reviewer availability must be recorded

## In Scope

- Specify a destination behavior matrix for the supported Markdown subset across PDF, DOCX, standalone HTML, and desktop preview: headings 1-6, paragraphs, nested bold/italic, inline and fenced code, ordered/nested lists, blockquotes, tables, rules, links, images, explicit prose breaks, raw HTML, and the exact `<!-- page-break -->` directive.
- Resolve prose newline behavior for LF and CRLF, blank-line paragraph boundaries, hard-break syntax, and code whitespace preservation (including tabs and spaces). Define how raw HTML is inert in every destination and ensure emitted table cells/interpolated values are not reparsed as authored Markdown.
- Specify stable document-wide heading anchors/bookmarks, duplicate-heading resolution, internal-link behavior, and missing-fragment handling.
- Prove local PNG/JPEG resolution and byte sanitization for narrative images; define source-relative resolution, canonical root/document containment, traversal/symlink rejection, offline embedding, alt-text requirements, proportional sizing, and evidence-backed byte/pixel/output bounds. Remote images, SVG author assets, and data URIs remain excluded.
- Prove supported links: HTTP/HTTPS, valid internal heading targets, and relative local files. Test percent-encoded paths, output relocation, actual final-output-relative resolution after atomic writes, companion-file layout, and viewer/Word restrictions. Do not copy/bundle linked files or expose machine-specific absolute paths.
- Probe `docx/charts` for `bar`, `column`, `line`, and `scatter`, embedded workbook data/caches, chart relationships, worker/bundler dependency resolution, and chart semantics. Pilot actual Word desktop display, data editing, save/reopen persistence, plus Word web display and native-object preservation through save/download. Record app versions and reviewer/access availability.
- Exercise difficult chart cases against the shared chart model: numeric and UTC DateTime line axes, uneven intervals, order and duplicate labels, multiple measurement units/axes, null gaps, empty/all-null data, negative/zero values, and scatter grouping. Do not silently coerce values, replace continuous axes with categories, reorder, merge duplicates, turn null into zero, change chart kind, or use a static-image fallback.
- Define safe desktop preview navigation protocol requirements: actual user action, exact active frame/revision identity, opaque target identifiers, host-side target mapping and revalidation, strict scheme/path/type allowlists, confirmation, and rejection of stale/forged/authored URL or path messages. Retain opaque-origin isolation and do not grant direct bridge/host-path access.
- Capture a non-destructive visual/structural baseline for the supplied kitchen-sink PDF; record whether it was actually inspected and by whom. Preserve known limitations accurately. Use the AMX fixture for a behavior matrix without overwriting the PDF.
- Submit a completed contract matrix, executable feasibility evidence, exact tool/app versions, results, residuals, and decisions requiring Lead Developer disposition.

## Out of Scope

- Any production renderer, desktop, parser, runtime, RPC, or user-facing behavior change; AMX syntax or evaluation changes; changes to snapshots, measurements, data/table semantics, report identity/order, or atomicity.
- Installing/updating production dependencies, changing lockfiles/manifests, changing PDF engine, or changing worker/output limits.
- New Markdown syntax or styling settings, raw HTML activation, remote images, SVG author images, arbitrary attachments, local-file copying/bundling, `mailto:`, executable links, or chart author settings.
- Word-to-AMX round-trip, macros, syntax highlighting, merged-cell features, general report redesign, PDF pagination redesign, or DOCX image/static chart fallback for failed native chart cases.
- Weakening viewer prompts/restrictions, iframe isolation, content policy, or host validation to make a probe pass.
- V0.10 residual remediation, native installer certification, public release, package publication, or broad platform support claims.

## Constraints

- Distinguish approved master-plan behavior from implementation proposals and experimentally demonstrated behavior. The Builder records each result as passed, failed, blocked/unavailable, or not run; partial success is not an overall pass.
- All feasibility code, generated reports, and temporary packages must be isolated and clearly owned. Preserve existing worktree changes and artifacts; never overwrite the supplied PDF.
- Do not fetch remote image/link resources during rendering. Local images must be embedded only after content validation and canonical containment checks.
- Derive image byte, pixel, and output limits from representative assets and existing worker bounds; do not copy logo-specific bounds without evidence or change product caps.
- Local exported links are relative to the final output directory and companion files remain caller-managed. Validate behavior after relocation and account for viewer restrictions without bypassing them.
- Native DOCX chart API/XML/package evidence does not prove Word compatibility. Actual desktop/web application evidence is mandatory for corresponding acceptance; if access is unavailable, record the gate as blocked and do not authorize Sprint 066 implementation.
- If an accepted chart case cannot be represented faithfully as an editable native chart, stop and request an explicit product decision. Do not coerce semantics or silently fall back to an image.
- Preserve `allow-scripts` without `allow-same-origin`; no authored content receives direct bridge, parent, filesystem, or arbitrary host-path capability.
- Sprint 065 Builder completion is a proposal/evidence submission, not approval. Only a separate Lead Developer disposition closes the gate and authorizes Sprint 066.