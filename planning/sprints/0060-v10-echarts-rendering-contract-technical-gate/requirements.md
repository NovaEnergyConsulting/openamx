# Sprint 060 Requirements: V0.10 ECharts Rendering Contract and Technical Gate

## Goal

Convert the approved V0.10 ECharts reporting scope into an executable, reviewable cross-surface contract and establish whether the proposed shared ECharts approach is feasible in supported Bun and packaged desktop environments. Submit evidence and explicit decisions for Lead Developer review before implementation begins.

This is a contract and feasibility sprint. It does not implement or ship the renderer replacement. A planning artifact or isolated proof of concept is not evidence that product behavior exists.

## Dependencies and Entry Gate

- No sprint dependency. Sprint numbering continues after Sprint 059; Sprint 060 may start independently of the separate final V0.9 disposition.
- `planning/plan-openamxV10MasterSprintPlan.md` is authoritative for scope, architecture direction, constraints, implementation ownership, and verification expectations.
- Existing AMX chart declarations, chart emissions, data ordering, normalization, report preparation, show-time snapshots, output atomicity, and DOCX behavior are compatibility references, not Sprint 060 implementation targets.
- Inspect and preserve the current worktree. Any feasibility code or generated artifact must be isolated, clearly identified, and must not alter production behavior or silently add a runtime dependency.
- No ECharts version, dependency placement, security model, new chart semantics, or architecture alternative is considered approved until the gate evidence is reviewed and the Lead Developer records a disposition.

## Inputs

- `planning/plan-openamxV10MasterSprintPlan.md`, especially Confirmed Feature Scope, Current-Codebase Evidence, Sprint 060 Technical Contract Gate, and Verification
- `planning/sprints/0000-sprint-template/`
- Current HTML/PDF/report-preparation/chart-emission implementations and their existing tests listed in the master plan's Relevant Files
- Desktop worker/build/resource configuration and existing preview sandbox implementation
- ECharts versioned documentation/package metadata, license and notice materials, Bun and pdfmake compatibility evidence

## In Scope

- Specify behavior and executable examples for `bar`, `column`, `line`, and `scatter`; scalar-list and record-list data; field mappings; labels; multiple series; scatter grouping; titles/descriptions; order preservation; and duplicate labels/coordinates.
- Specify category and numeric axes, including numeric, DateTime, and measurement-valued line data where already supported. Resolve per-series/axis units and normalization without losing dimensional metadata or implying an incorrect common unit.
- Define expected behavior for negative and zero values, null gaps, omitted scatter points, empty/all-null data, partially empty series/groups, and accessible header-only data alternatives. Do not fabricate points, values, or units.
- Specify presentation-state behavior per chart kind: tooltip content, legend visibility toggles, zoom/pan applicability, reset, print, resize, and complete-data access independent of interaction state.
- Establish representative chart dimensions, font assumptions, palette and restrained report-accent use, stable series/group color assignment, layout rules, deterministic rendering settings, and proposed measurable visual-comparison tolerances.
- Define the offline packaging, trusted HTML bootstrapping, and least-privilege desktop iframe security contract. Include adversarial inputs from narrative, labels, descriptions, chart data, and serialized payloads; define prohibited parent, bridge, filesystem, arbitrary-script, and network access.
- Perform isolated compatibility probes sufficient to determine whether a selected ECharts candidate can: initialize interactively in local-file HTML; produce static SVG in supported Bun; serialize as a pdfmake graphic; and resolve required assets/resources in the desktop build/package path without network access.
- Establish representative data-size cases, rendering-time and output-size observations, and implications for existing HTML/worker limits. Propose bounds with evidence; do not change product limits in this sprint.
- Document ECharts version candidates, package placement, bundled runtime/assets, license and third-party notice requirements, fonts, relevant SVG features, and any platform/packaging limitations.
- Record rendering failure diagnostics and the required preservation of failed-export atomicity.
- Submit the contract proposal, feasibility evidence, residuals, and specific Lead Developer decisions needed to close the gate.

## Out of Scope

- Replacing production HTML/PDF renderers, changing desktop iframe permissions, or adding a production ECharts dependency.
- Changes to AMX syntax, parser, typechecker, evaluator, chart validation, measurement normalization, captured data, or view emission order.
- DOCX chart rendering or DOCX-specific improvements; DOCX is only protected as an unchanged regression baseline.
- New chart kinds, raw ECharts options, author-facing theme controls, unrelated report redesign, a new PDF engine/viewer, or general performance work.
- Changing worker/output limits, preview architecture, accepted null semantics, data tables, report pipeline, export destinations, or atomic-write behavior.
- Browser-based PDF generation or another architecture that exceeds the master plan's recommendation, unless evidence shows the approved candidate infeasible; any such alternative requires explicit Lead Developer scope/architecture approval before implementation.
- Release, publication, installer certification, or claims of cross-platform support not directly evidenced.

## Constraints

- Preserve the master plan's proposed shared adapter from captured `ChartViewEmission` data to ECharts options, plus shared visual defaults. Surface adapters may differ only where interactive HTML and static PDF require it; they must not reinterpret chart meaning independently.
- Probe an exact ECharts version and exact relevant Bun, pdfmake, desktop bundler/package, and browser/runtime combination. Do not infer compatibility from documentation, a successful browser-only demo, or a source-only build.
- Keep any prototype disposable and outside production paths. Record files/dependencies/commands and remove only sprint-created artifacts after capturing evidence; never delete or overwrite pre-existing user data.
- No network or CDN dependency is allowed in target HTML, desktop preview/export, or PDF chart rendering. Demonstrate offline behavior rather than merely inspecting configuration.
- Do not enable `allow-same-origin`, arbitrary report-authored scripts, parent/application access, desktop bridge access, or unbounded network capability in the proposed preview security model.
- Treat SVG/pdfmake and packaged-runtime compatibility as empirical gates. If a gate fails, document the smallest reproduction, alternatives and consequences; do not silently substitute rendering architecture.
- Separate verified facts, proposals, assumptions, unresolved decisions, and unavailable checks. Include exact versions, commands, host/environment, outputs, and evidence artifacts where possible.
- No production implementation may begin until the technical contract and architecture decisions are explicitly approved. Sprint preparation and Builder evidence alone do not close the gate.