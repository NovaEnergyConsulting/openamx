# Sprint 060 Blueprint: V0.10 ECharts Rendering Contract and Technical Gate

## Approach

1. Read the V0.10 master plan and inspect only the owning report preparation, HTML/PDF chart adapters, chart emissions, relevant tests, desktop preview sandbox, worker limits, and build/resource path. Confirm the existing data and security boundaries before proposing a contract.
2. Create a traceable contract appendix in this blueprint. For every master-plan technical-gate item, record the proposed rule, representative input/output, an executable test or experiment, evidence status, and the decision owner. Preserve accepted AMX semantics; mark any currently unknown behavior as a proposal or question rather than silently choosing it.
3. Build a compact but discriminating chart matrix. Include all chart kinds and both input forms, scalar and record labels/mappings, multiple series/groups, order and duplicate values, numeric/DateTime/measurement axes, normalized series with different display units, negatives/zero, null patterns, and empty states. Identify which cases can be checked against existing behavior and which require a Lead Developer rule.
4. Probe a specific ECharts candidate in an isolated harness. Establish browser interactivity under `file://` with networking disabled, server-side SVG generation in the supported Bun environment, pdfmake serialization and rendering, and desktop build/package resource resolution. Capture SVG/PDF artifacts and inspect actual output; successful serialization alone is not a rendering pass.
5. Validate the proposed security boundary with hostile narrative, chart titles/descriptions, labels, category values, and payload text. Exercise iframe-origin isolation and verify that report content cannot reach the parent, desktop bridge, local application state, arbitrary authored script execution, or unapproved network requests. A script-enabled demo without adversarial tests is insufficient.
6. Measure representative small, typical, and bounded-large data cases, multiple charts, repeated rendering, and output sizes/timings on named hosts. Compare observations with existing renderer/worker limits. Recommend thresholds or required adjustments without changing those limits.
7. Record candidate-version and package-placement recommendation, offline asset strategy, fonts, ECharts and transitive license/notice obligations, supported SVG feature subset, deterministic static settings, and packaged desktop resolution. Treat an unavailable packaging target as residual evidence, not a pass.
8. Update only this sprint's planning artifacts plus `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. If a separate scratch harness is needed, keep it isolated and document its exact lifecycle. Do not make production renderer/security/dependency changes.
9. Submit an explicit gate disposition request listing decisions, evidence, failed/inconclusive checks, residuals, and any proposed architecture/scope changes. Sprint 061 must not proceed on an unapproved proposal.

## Contract Proposal Matrix

The Builder must complete this matrix with exact cases and review status. It is a work product to resolve in Sprint 060, not a claim that every detail is already decided.

| Area | Minimum contract content | Required executable evidence |
|---|---|---|
| Chart-kind fidelity | `bar`/`column` orientation, `line`, `scatter`; axis roles and supported values | One non-empty case per kind; assert intended geometry/series type and labels |
| Input forms | Scalar lists, record lists, field mappings, scalar labels, titles/descriptions | Data-to-option assertions for each form and mapping |
| Series/grouping | Multiple record series, scatter groups, stable source order | Assert series/group identity and point order; duplicate labels/coordinates remain distinct |
| Axes and units | Numeric, DateTime, and supported measurement axes; normalization and per-series units | Mixed-unit case with correct axis/legend/tooltip meaning and dimensional metadata retained |
| Values/nulls | Negative/zero, null line gaps, omitted scatter null points, partially empty series/groups | Assert no zero coercion or invented values; preserve every table heading |
| Empty states | Empty and all-null chart forms across HTML/desktop/PDF | Render/inspect state and header-only data alternative; no fabricated unit or point |
| Interaction | Tooltip fields, legend toggle, applicable zoom/pan, reset, print-state behavior | Browser interaction assertions for every applicable kind; full data remains independently accessible |
| Appearance | Dimensions, fonts, palette/accent, color ordering, label/legend layout | Stable fixture screenshots and agreed comparison method/tolerance |
| Static rendering | Static SVG, pdfmake acceptance and actual PDF display | Inspect SVG and rasterized/visual PDF output at report dimensions |
| Offline/packaged | Standalone local HTML, desktop bundle/resource lookup, Bun runtime and PDF dependency resolution | Network-disabled run and packaged-output resolution; no CDN or adjacent runtime requirement |
| Isolation | Trusted bootstrap and untrusted narrative/chart fields under isolated iframe | Hostile fixture assertions for no parent/bridge access, authored script execution, or network escape |
| Limits/lifecycle | Representative data/size/timing envelope; deterministic output; cleanup | Record timings/output bytes; repeated/multiple charts; cleanup and bounded-output behavior |
| Failure/atomicity | Explicit chart-render failure diagnostics and unchanged destination on failed export | Inject or reproduce render failure and verify no success-looking substitute or partial destination |

## Feasibility Probe Protocol

- State the exact candidate version, package source, Bun version, desktop bundler/package versions, pdfmake version, host OS/architecture, and browser used. If versions cannot be determined, the relevant result remains inconclusive.
- Keep the probe harness isolated from application entry points and production dependency manifests. Prefer a disposable directory or clearly owned ignored scratch location. Do not commit a runtime dependency or alter the lockfile as a side effect of experimentation.
- Browser: open generated standalone output as a local file with network disabled; assert chart initialization, tooltip/legend/zoom/reset behavior, resize, print output, complete table alternative, and absence of external requests.
- Bun: generate deterministic ECharts SVG from the same option/data model; test null, labels, fonts, and representative dimensions; verify required assets resolve without network access.
- PDF: feed the generated graphic into the existing pdfmake path; generate and inspect an actual PDF/rasterized page for display, clipping, labels, and legibility. Record unsupported SVG constructs, fonts, and transforms.
- Desktop: trace ECharts runtime/assets through the existing build and packaging/resource mechanism. Demonstrate resolution from the packaged layout or record a specific blocker; source import success alone is not package evidence.
- Security: test encoded markup/script-like strings in narrative and every chart text/data field. Verify output encoding and that executable bootstrap code is fixed application-owned code, not report-provided code. Verify an opaque isolated origin and no privileged capability.
- Limits: derive small/typical/bounded-large sizes from observed project data and existing caps. Measure payload bytes, generated HTML/SVG/PDF sizes, render time and cleanup. Recommendations are proposals until approved.
- Report each check as **passed**, **failed**, **blocked/unavailable**, or **not run**, with exact artifact/command and why. A partial result does not imply the full cross-surface gate passed.

## Decision Register (Sprint 060 Must Complete)

| Decision | Required disposition |
|---|---|
| ECharts version/dependency placement | Recommend exact version and root/desktop placement, package size and update path; document third-party license/notice handling |
| Shared model/options | Specify adapter input/output fields, order, labels, groups, units, theme, and static/interactive divergence boundary |
| Axes and unit presentation | Set supported numeric/DateTime/measurement axis behavior and prevent misleading shared-unit presentation across normalized series |
| Null/empty behavior | Set per-kind point/gap and shared cross-surface empty-state behavior without changing accepted data semantics |
| Interactions and access | Define per-kind tooltip, legend, zoom/pan/reset, keyboard/input, print and non-interactive full-data access |
| Visual system | Set dimensions, type/font availability, palette/accent usage, color assignment, responsive/PDF layout, animation and comparison tolerance |
| Security | Approve exact iframe sandbox attributes, bootstrap/payload boundary, escaping, CSP/resource policy, and negative tests |
| Feasibility/limits | Accept or reject SVG/pdfmake and packaged desktop results; set bounded evidence envelope and flag any required limit changes |
| Failure behavior | Specify surfaced diagnostics and prove export remains atomic on chart-render errors |

## Files to Update

- `planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/requirements.md`
- `planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/blueprint.md`
- `planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/acceptance.md`
- `planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/handoff-prompt.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Optional isolated, temporary proof-of-concept artifacts only as described above; no production files or dependency manifests

## Notes

- The V0.10 master plan is the approved scope authority. This blueprint proposes implementation-facing contracts and does not amend it.
- This gate is a design/feasibility sprint, not an implementation sprint. A failed experiment can disprove the recommended architecture; it cannot authorize an alternative.
- DOCX remains explicitly excluded from the new renderer architecture. Existing DOCX regression checks may protect its baseline only.
- Builder completion is a submission for review, not approval. The Lead Developer must explicitly close the gate and authorize Sprint 061.

## Builder Contract Matrix and Decision Register (2026-10-07)

Status vocabulary: **accepted baseline** refers to the master plan/current AMX behavior; **proposal** identifies the Builder recommendation now approved by the Lead Developer; evidence is only for the exact fixtures/hosts in [`builder-evidence.md`](builder-evidence.md). Approval does not change evidence statuses or authorize scope outside the master plan.

| Area / exact cases | Accepted baseline | Builder proposal and expected result | Evidence status | Lead Developer decision |
|---|---|---|---|---|
| `bar`, record categories | Preserve input/emission order and duplicate category rows. | Horizontal bars; first source row at top; stable distinct row identity; zero/negative extend from zero. | Partial: ECharts option and screenshots; `inverse: true` required. | Approve orientation and top-to-bottom order. |
| `column`, record/scalar | Preserve declared or positional labels and source order. | Vertical bars; null stays a gap; preserve duplicate labels, zero and negatives. | Partial: browser/PDF fixture. | Approve label-density and single-series legend rules. |
| `line`, numeric x | Existing Number x and nullable y; source order, duplicates, null gaps retained. | Numeric axis; no sorting/aggregation; gap at null; show each normalized-unit series against a correctly named axis. | Partial: candidate fixture; current production adapter not exercised. | Approve order and independent-axis policy. |
| `line`, DateTime x | Existing DateTime x; preserve timestamp/source order and duplicates. | UTC ISO axis/tooltip labels; preserve captured order and null gaps. | Partial: candidate retains input timestamps; rendered ticks were browser-local/short. | Approve timezone/format. |
| Measurement series/scatter axes | Existing independent first-non-null normalization and dimensional metadata/headings remain. | Separate axes for different normalized display units; scatter x/y units identified independently; never imply one common unit. | Partial: tests pass and synthetic dual axes render; no actual MeasurementValue emission fed to ECharts. | Approve multi-unit axis/tooltip layout. |
| `scatter`, grouped/ungrouped | Preserve group first-seen order, point order and duplicate coordinates; null x/y is not zero. | One series per group; omit plotted null-coordinate points but retain their source rows in the full table. | Partial: option state and screenshots. | Approve legend and tooltip fields. |
| Scalar labels, field mappings, titles, descriptions, captured snapshots | Existing chart emission, headings/order, immutable snapshot and AMX semantics unchanged. | Shared adapter consumes captured emission without mutation; use stable row/series/group identities. | Not end-to-end tested; no adapter implemented in this gate. | Approve as Sprint 061 contract requirement. |
| Negative/zero/null/empty | No invented values/units/points; retain headings and full data. | Line null gap; scatter null point omitted; empty/all-null “No data” in chart slot; mixed series retain independent gaps. | Partial: browser assertions for `[]`, nulls and scatter coordinates; empty label was fixture-owned; empty PDF not tested. | Approve cross-surface wording/layout. |
| Tooltip, legend, zoom/pan/reset | No new AMX interaction semantics. | Tooltip has category or x/y, series/group, values and units. Legend only when multiple series/groups. Zoom/pan numeric/time line and scatter only; reset restores full domain; no category zoom. | Partial: legend/dataZoom/reset actions passed; pointer, keyboard, touch and desktop lifecycle not tested. | Approve per-kind matrix and input methods. |
| Resize, print and full-data access | HTML interactive; PDF static; full data independent of interaction. | Resize without data mutation; print hides controls, retains chart and complete table; table remains available when legend/zoom changes. | Partial: 1280/390 resize and print emulation passed in Chromium. | Approve print/lifecycle contract. |
| Accessibility | Preserve titles/descriptions and complete table alternative. | Link chart role/name/description to title, description and table; replace inaccurate generated null/DateTime summary. | Failed as-is: ECharts role exists but says `NaN` for null and epoch milliseconds for DateTime. | Approve truthful custom ARIA/table linkage. |
| Visual dimensions/fonts/theme | Shared identity across HTML/desktop/PDF; geometry may differ. | Browser 720x360 CSS px, responsive width >=320px; PDF 16:9 viewBox at existing report width; animation off for static output; stable first-seen series/group colors. Proposed matched-crop SSIM >=0.97, labels/plot bounds <=2 CSS px, no clipping/overlap. | Screenshots inspected; no cross-surface metric run. Tolerance is a proposal only. | Approve dimensions, palette/accent, fonts and tolerance. |
| Offline HTML/security | Standalone report; no CDN; opaque isolated frame; no parent/bridge/app access, authored script or unapproved network. | Fixed nonce bootstrap; JSON escapes `<`, `>`, `&`; prevent external links/refresh before enabling scripts. | Offline local load, CSP inline-handler denial and opaque-origin denial passed; link and meta-refresh each navigated externally despite CSP; failed network gate. | Blocking: choose sanitizer/navigation policy and require adversarial rerun. |
| Bun SSR/PDF SVG | Existing PDF pipeline retained; SVG/PDF is an empirical gate. | Supported subset: paths, rect/circle, text, defs/clipPath, generated style classes and matrix transforms; untested gradients, filters, patterns/images excluded pending evidence. | Bun `1.4.2` + ECharts `6.1.0` SSR passed; pdfmake `0.3.11` accepted five fixture SVGs, actual two-page A4 PDF visually inspected. Pass for tested subset only. | Approve subset, PDF dimensions/page flow; no PDF architecture change inferred. |
| Size/timing/lifecycle | Existing 8,000,000-character HTML and 32,000,000-byte binary caps unchanged. | Treat 5,000 points as evidence envelope only, not a product cap; measure full report tables, payload, multi-chart browser/PDF and cleanup before setting bound. | Partial: 5k => 61,373-byte SVG, 102,070-byte JSON, repeated SSR 19.9–32.1ms; four small charts 33.4ms; raw SVG generated IDs differ. | Approve bounded-large target only after end-to-end measurements; no cap change. |
| Desktop package/resource | Existing worker/resource map is authoritative. | Test actual packaged `bun/jobWorker.js`, browser resources and fonts offline. | Blocked/unavailable: temporary 2,756,001-byte Bun bundle ran, but no actual Electrobun package/native runtime test; existing ignored `desktop-app/dist/` was pre-populated and not overwritten. | Approve placement and an isolated real package run. |
| License/notices | No legal conclusion. | Candidate inventory: ECharts Apache-2.0 + NOTICE, D3 BSD-3-Clause, zrender BSD-3-Clause, tslib 0BSD/Microsoft notice. | Exact files/hashes and npm package size recorded in Builder evidence; inventory only. | License owner/Lead Developer review required. |
| Failure/atomicity | Preserve existing atomic export; no success-looking fallback. DOCX remains out of scope. | Serialize before commit; surface existing error family; retain existing destination on failures. | Partial: malformed SVG and atomic pre-commit failure preserve bytes/remove temp; valid renderer fault/production diagnostic not injectable. DOCX focused baseline passes. | Approve named residual or require a public test seam. |

### Decision Register Disposition Requested

| Decision | Builder proposal | Evidence state | Lead Developer disposition needed |
|---|---|---|---|
| Candidate/version/placement | Evaluate exact `echarts@6.1.0`; likely one root runtime dependency shared by CLI/PDF and bundled desktop Bun worker; browser bundle embedded in standalone HTML. Not installed in applications. | Bun/browser/pdfmake candidate fixtures pass; actual desktop package unavailable. | Approve exact version and placement, approve with residuals, or keep blocked. |
| Shared model/options | One adapter from immutable captured emissions to common options/theme; destination-only interactive/static differences. | No adapter implementation authorized or tested. | Approve as Sprint 061 requirement only. |
| Axes/null/interactions/visual/accessibility | Proposals above; no AMX semantic changes. Truthful null/DateTime ARIA is required. | Candidate partially tested; ARIA and navigation security fail as-is. | Approve details or name required revisions. |
| Security | Opaque origin; trusted nonce bootstrap; no same-origin. Neutralize report navigation/refresh before scripts run. | Parent/bridge denial passes; external navigation gate fails. | **Blocking:** approve a specific remediation/test requirement or keep Sprint 061 blocked. |
| Feasibility/limits | Accept only named Bun/browser/pdfmake fixture results; retain desktop package as unavailable; no limit changes. | Linux host only, 5k max measured, SVG subset only. | Accept/reject each surface independently; no extrapolated target pass. |
| Failure | Preserve serialize-before-atomic-write; no fallback. | Failure/atomic writer partial pass; diagnostic path incomplete. | Approve residual or require follow-up evidence. |

### Lead Developer Disposition (2026-10-07)

- **COMPLETE / APPROVED WITH RECORDED RESIDUALS.** The Lead Developer approved all Sprint 060 contract and architecture proposals and explicitly authorized Sprint 061.
- The tested implementation baseline is ECharts `6.1.0` with the proposed shared root dependency placement; this authorizes design/implementation evaluation, not a claim that production dependencies, renderers, or packaged resources are already integrated or verified.
- The external link/meta-refresh navigation finding, inaccurate ECharts default ARIA for null/DateTime, unavailable actual Electrobun package run, SVG generated-ID variability, unmeasured visual tolerance, 5,000-point-only size/performance evidence, untested pointer/keyboard/touch cases, and unavailable public chart-render failure injection remain named residuals. Their original failed/partial/unavailable statuses stand.
- The no-unapproved-network security contract is not waived: production iframe scripts must remain disabled until untrusted navigation is prevented and adversarially verified. Sprint 061 is authorized but has not started. No final V0.10 acceptance, platform certification, release readiness, or legal conclusion is implied.