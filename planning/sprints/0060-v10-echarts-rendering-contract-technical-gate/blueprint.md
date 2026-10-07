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