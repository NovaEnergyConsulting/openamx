# Sprint 060 Acceptance Criteria

Sprint 060 is complete only when all applicable criteria are evidenced and a separate Lead Developer disposition closes the technical gate:

- The blueprint contains a completed contract matrix covering all existing kinds (`bar`, `column`, `line`, `scatter`), scalar and record inputs, labels/mappings, multiple series and scatter groups, captured order, duplicate labels/coordinates, and supported axis/value forms.
- Executable cases resolve numeric, DateTime, and already-supported measurement line axes; multiple independently normalized display units are represented without misleading shared-unit axes, legends, tooltips, or loss of dimensional metadata.
- Negative/zero values, line null gaps, omitted scatter null points, empty/all-null datasets, and partially populated series/groups have explicit expected output. No point, zero, unit, or value is fabricated; data-table headings and complete data access are retained.
- Each chart kind has a documented interaction table for tooltip fields, legend toggle, applicable zoom/pan and reset, resize, print, input/keyboard behavior, and how users access the complete dataset without interaction.
- Representative HTML/PDF dimensions, font strategy, theme/palette, report accent use, stable series/group color assignment, layout behavior, deterministic static settings, and a measurable visual comparison method/tolerance are specified and demonstrated with fixture evidence.
- A specific ECharts version candidate is exercised in an offline standalone `file://` browser report, in server-side SVG generation under supported Bun, through existing pdfmake serialization and actual PDF inspection, and through the desktop build/packaged-resource resolution path. Each result names exact versions, host, command, artifact, and status.
- If any target cannot be directly exercised, its status is blocked/unavailable or inconclusive, with the exact boundary and follow-up. Browser-only, source-import-only, documentation-only, or serialization-only evidence is not represented as a pass for other surfaces.
- No CDN/network dependency is required by chart rendering. Browser, desktop, Bun, and PDF required resources are demonstrated to resolve offline for the tested surfaces.
- The security contract specifies the exact isolated iframe model, fixed trusted bootstrap, untrusted payload encoding, and resource policy. Adversarial narrative, title, description, labels, values, and serialized fields cannot execute report-authored script or access the parent, desktop bridge, local application state, filesystem, or unapproved network.
- The feasibility report names the selected candidate's license and transitive notice obligations, package placement, bundle/runtime size observations, fonts, SVG subset, and packaging limitations. No legal conclusion or license permission is inferred beyond sourced evidence.
- Small, typical, and bounded-large data cases, multi-chart and repeated-render cases record render time, output sizes, cleanup, and existing HTML/worker-limit implications. Proposed thresholds/limit changes are clearly marked for approval; product limits and unrelated performance goals are not modified.
- Render failure behavior is specified and experimentally shown to produce a diagnostic and preserve existing export atomicity; failed charts are never silently replaced with success-looking output.
- Planning artifacts separate approved master-plan scope, verified evidence, Builder proposals, assumptions, open questions, and required Lead Developer decisions. No production renderer, iframe permission, runtime dependency, or AMX behavior is changed.
- Builder evidence is recorded in the sprint folder with exact commands, versions, hosts, results, artifacts, failed/unavailable checks, and residuals. Planning state, decisions, and questions reflect that Sprint 060 is prepared/submitted, not approved or implemented.
- Lead Developer explicitly reviews and either approves the contract/architecture gate, approves with named residuals and authorizes Sprint 061, or keeps Sprint 061 blocked. Sprint 061 does not begin based only on Builder completion.

## Required Evidence Set

1. Completed chart contract and case matrix with testable expected data/options/output.
2. Browser-local offline interaction evidence and screenshots at representative document widths.
3. Bun server-side SVG output and actual pdfmake/PDF visual inspection.
4. Desktop packaged-resource resolution or a precisely classified blocker.
5. Adversarial script-isolation and network/privileged-access evidence.
6. Data-size, timing, output-limit, determinism, repeated-render, and cleanup observations.
7. License/notice, font, SVG compatibility, and dependency/package-placement report.
8. Failure diagnostic and export atomicity evidence.
9. Separate Lead Developer gate disposition and Sprint 061 authorization status.

Sprint 060 acceptance does not claim that ECharts has been implemented, that any production renderer changed, or that V0.10 is complete or releasable.