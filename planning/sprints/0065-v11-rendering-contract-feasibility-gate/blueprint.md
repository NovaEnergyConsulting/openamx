# Sprint 065 Blueprint: V0.11 Rendering Contract and Feasibility Gate

## Approach

1. Read the V0.11 master plan, repository instructions, and current renderer/desktop ownership boundaries. Record the initial worktree and ensure probes cannot overwrite or mutate user artifacts. Use the supplied kitchen-sink PDF only as a read-only baseline.
2. Build a traceable Markdown behavior matrix for PDF, DOCX, standalone HTML, and desktop preview. For each construct, record source fixture, expected normalized narrative structure, destination representation, actual result, evidence location, and unresolved owner. Keep narrative, executable AMX source, emitted views, and captured report items distinct.
3. Write the exact prose/code/raw-HTML/page-break contract. Cover LF and CRLF, blank lines, hard breaks, headings/lists/table cells, nested formatting, tabs/spaces in code, and escaping of interpolation results. Establish deterministic heading IDs/bookmarks, duplicate rules, and missing internal-target behavior.
4. Probe only the smallest shared, destination-neutral narrative representation needed to establish feasibility. Use installed `marked` where appropriate, but never render authored raw HTML. Demonstrate that escaped/interpolated values and emitted table cells remain text, not recursively parsed Markdown. No production adapter or dependency change is permitted.
5. Exercise image and link preparation in a disposable harness. Resolve author paths relative to the source document and canonicalize both file and permitted project/document root; test containment, symlinks, traversal, extension/content mismatch, invalid bytes, missing assets, percent encoding, and boundary-sized assets. Sanitize/decode supported PNG/JPEG and measure proportional fit without upscaling. Select proposed byte/pixel/output bounds from evidence and existing worker constraints, then request approval; do not use logo-specific limits by assumption.
6. Verify portable local links from final output locations. Generate temporary PDF/DOCX destinations, atomically relocate them, and verify authored relative targets still resolve from the final output directory. Check URI encoding and report exact viewer/Word behavior and prompts. Never introduce absolute local paths or copy companion assets.
7. Inspect the installed `docx/charts` API and create disposable package-level probes for all four chart kinds. Verify serialization, relationship targets, workbook embedding, cached values, data series/categories, axes, grouping, units, DateTime/numeric value semantics, null gaps, duplicate/order preservation, and empty/all-null truthful states. Confirm the probe bundle and actual desktop worker/package dependency resolution without editing production manifests.
8. Pilot the resulting native charts in actual Word desktop: open without repair warnings, inspect each representative kind, edit chart data/series, save, close/reopen, and confirm the change persists. Pilot Word web display and save/download, then inspect that the chart remains a native object in desktop Word. Record exact Word channel/version, OS, review date, files, and steps. If the user/reviewer or application is unavailable, mark this mandatory gate blocked; XML inspection is not a substitute.
9. Compare native chart results to shared chart-model meaning rather than ECharts option shape. Include numeric/UTC DateTime line axes, uneven x intervals, duplicate labels and source order, different units/axes, negative/zero, null gaps, empty/all-null states, scatter group order, and data-table alternative. If the native API changes axis meaning, grouping, order, or units for any accepted case, stop for Lead Developer decision; do not invent coercion or a static image path.
10. Specify a desktop navigation protocol without implementing it: only a real click in the active isolated preview may submit an opaque target ID plus unforgeable/current frame-revision context; the host maps the ID from its own prepared target table, rechecks scheme/path/type and active revision, obtains confirmation for external/local navigation, and invokes only the approved native action. Reject raw URLs/paths, authored RPC commands, stale or synthetic requests, traversal, symlinks, executable targets, and arbitrary message origins. Keep `allow-scripts` only, without same-origin or broad bridge capability.
11. Complete decision, risk, and acceptance matrices; update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with proposal/evidence status only. Submit exact commands, temporary artifact locations, versions, and residuals. Ask the Lead Developer for an explicit disposition; Sprint 066 remains blocked until that disposition.

## Behavior Contract Matrix

| Topic | Required Sprint 065 contract | Minimum discriminating evidence |
|---|---|---|
| Shared narrative | One safe destination-neutral structure for agreed Markdown; preserve item order, interpolation, source and views | Fixture showing same parsed structure feeds all destination adapters without reparsing output data |
| Paragraphs and breaks | Every authored prose newline is visible; blank lines delimit paragraphs; hard-break syntax is specified; LF and CRLF agree | Paired newline fixtures with expected normalized structure and destination output |
| Code | Inline/fenced narrative code remains literal; preserve line breaks, spaces, and tabs; non-`amx` fences remain narrative | Whitespace-sensitive code fixture and exact extracted PDF/DOCX/HTML content |
| Formatting/blocks | Headings 1-6, nested bold/italic, ordered/nested lists, quotes, tables, rules, links and images map without spurious breaks | Behavior matrix covering nesting, heading/list/table cells, rules versus setext headings, and literal fence delimiters |
| Raw HTML/interpolation | Raw HTML is escaped/inert; interpolation is safely rendered and not reinterpreted as authored Markdown; page-break directive is exact and ignored inside code | Adversarial markup and interpolation fixture; exact `<!-- page-break -->` outside/inside code comparison |
| Anchors | Stable document-wide heading IDs/bookmarks, deterministic duplicate resolution; missing fragments are plain text or otherwise explicitly non-misleading | Duplicate headings, Unicode/punctuation, repeated exports, valid and missing fragment probes |
| Images | Contained document-relative PNG/JPEG only; sanitized embedded bytes; descriptive alt; proportional page-width fit without upscaling; bounded resources | Portrait/landscape fixtures plus traversal, symlink, deceptive extension, invalid/missing, byte/pixel/output boundary tests |
| Links | HTTP/HTTPS, internal headings and relative local files; no mailto/executable targets; output-relative links remain portable | PDF and DOCX export then move output with companions; URI encoding and actual viewer/Word checks |
| Native DOCX charts | Editable Word chart objects and embedded editable data for bar, column, line, scatter; truthful kind, order, groups, units, axes, null/empty meaning | OOXML relationship/workbook/cache inspection plus Word desktop edit/save/reopen and Word web save/download preservation |
| Preview security | Click-only opaque target ID; active-frame/revision binding; host mapping/revalidation, allowlists and confirmation | Protocol design and negative matrix for raw URLs, forged/stale/synthetic messages, traversal, symlinks and executable targets |
| Baseline | Preserve current report identity, ordered narrative/source/view items, snapshots, emitted tables, working PDF behavior and atomic destinations | Read-only supplied PDF metadata/visual capture and representative fixture baseline; never overwrite source artifact |

## Native Chart Semantics Probe Matrix

| Chart case | Preserve from shared model | Reject as a feasibility result if |
|---|---|---|
| `bar` / `column` | Chart kind/orientation, source order, duplicate categories, series identity, signs and zero | Native object changes kind/orientation, merges/reorders categories, or loses series values |
| Numeric `line` | Continuous numeric x axis, uneven intervals, duplicate x, source order, null y gaps | Values become equally spaced categories, are sorted/aggregated, or null becomes zero |
| DateTime `line` | UTC time meaning, actual elapsed spacing, source order and null gaps | Timestamps are local-time shifted or categorical/equally spaced without approved decision |
| Mixed measurement units | Existing normalized data and independently meaningful axes/labels/units | Axes/series imply a common unit or values are converted/coerced without contract |
| `scatter` | Group first-seen order, numeric x/y meaning, duplicate coordinates and separate axis units | Groups collapse, coordinates/categories change meaning, or null coordinates become fabricated values |
| Empty/all-null/mixed null | No invented points/units; truthful title/description and complete table alternative | A success-looking chart invents points/values, null becomes zero, or a static image replaces editable native chart |

No alternative chart mapping is approved by a successful subset probe. A failed case is a decision item, not permission to narrow required scope.

## Desktop Navigation Protocol Proposal

- Prepared preview content assigns each permitted target an opaque, per-document identifier. Authored content never supplies the native URL/path or a privileged command to the host.
- Only a genuine user click handled within the active isolated frame can request navigation. The request includes exact frame identity and current document revision/nonce; synthetic, replayed, stale, and unbound messages are rejected.
- The host resolves the opaque ID through its own current prepared-target table, revalidates scheme, canonical path containment, symlink status, file type, and document revision, then applies confirmation before dispatching only an approved external HTTP/HTTPS or safe local-file action.
- Internal fragments stay within the preview and do not invoke host navigation. Remote resources/images are not fetched by report rendering. Local targets must be non-executable and in the accepted type allowlist from the gate.
- Preserve opaque-origin iframe isolation with `allow-scripts` and without `allow-same-origin`; no parent, bridge, direct filesystem, arbitrary RPC, or application path capability is granted to authored content.
- Exact message encoding, target identifier lifetime, allowed local file types, and confirmation presentation must be specified against existing RPC ownership and submitted for approval. This protocol is a proposal until Lead Developer disposition.

## Files to Update

- `planning/sprints/0065-v11-rendering-contract-feasibility-gate/requirements.md`
- `planning/sprints/0065-v11-rendering-contract-feasibility-gate/blueprint.md`
- `planning/sprints/0065-v11-rendering-contract-feasibility-gate/acceptance.md`
- `planning/sprints/0065-v11-rendering-contract-feasibility-gate/handoff-prompt.md`
- `planning/sprints/0065-v11-rendering-contract-feasibility-gate/builder-evidence.md` after Builder execution; do not prefill it with assumed results
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Optional disposable probe artifacts only; no production files, manifests, lockfiles, user data, or supplied PDF

## Verification

- Reconcile every Sprint 065 requirement and master-plan gate item with an evidence ID, exact command/action, environment/app versions, artifact, outcome, and owner.
- Verify the Markdown behavior matrix covers all agreed nodes on PDF, DOCX, HTML, and desktop preview, including LF/CRLF, hard breaks, raw HTML, code whitespace, interpolation, page-break directive, anchors, and emitted data text.
- Prove image/link path policy with canonical roots, source-relative paths, final output-relative links, atomic relocation, percent encoding, symlink/traversal and content validation, plus bounded image resource measurements.
- Inspect DOCX package structure for native chart parts, chart/workbook relationships, caches and embedded workbook values for each chart kind; verify no external workbook relationships, macros, or remote resources.
- Record actual Word desktop and Word web version/platform and manual steps. Desktop data edit/save/reopen must persist. Web save/download must preserve a native chart that opens as editable in desktop. Missing access or incomplete review is blocked/unavailable, not pass.
- Evaluate every semantic edge in the native chart matrix; report exact mismatches and stop for a product decision instead of changing source data, chart kind, or fallback format.
- Submit the desktop preview protocol and its attacker/negative matrix, preserving active-frame/revision binding, opaque IDs, host-side revalidation, confirmation, and existing sandbox isolation.
- Read/capture the supplied kitchen-sink PDF without modifying it; distinguish artifact capture from actual visual inspection and identify reviewer, tool, and baseline findings.
- Do not run product acceptance/build suites as proof of unimplemented behavior. Any focused tests must belong to disposable probes; record exact commands and status. Run `git diff --check` only on owned planning files.
- Request a separate Lead Developer disposition listing each approved contract, residual, blocker, and any required scope/architecture decision. Sprint 066 is not authorized before approval.

## Notes

- The V0.11 plan is the approved product-scope authority; this blueprint sharpens feasibility and implementation-facing contracts without amending scope.
- Native API availability, serialized OOXML, or a passing isolated harness does not establish Word desktop/web compatibility.
- If a mandatory application check is unavailable, provide the precise missing host/access and stop the dependent gate. Do not replace the requirement with XML inspection or mark the sprint approved for downstream implementation.
- This sprint produces no language-version change, no product implementation, no release claim, and no final V0.11 acceptance.