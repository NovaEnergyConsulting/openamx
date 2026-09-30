# Sprint 027 Acceptance Criteria

Sprint 027 and V0.4 are complete only when:

- A checked-in end-to-end example exercises typed record/scalar-list data, tables, the initial chart set as practical, interactive HTML, static PDF, local imports, and CSV/JSON inputs; delivered DOCX is exercised if its entry point is retained.
- Tests assert actual evaluated values, view binding/data and show placement, formatted/escaped source, narrative order, HTML interaction/accessibility/empty states/escaping, searchable PDF content/layout/page-break properties, and DOCX semantic content/package structure where applicable.
- Production CLI tests cover `run`, `render`, `export pdf`, and `export docx` where supported, including exact/structural output properties, repeatability limitations, destination validation, conflicts/symlinks/parents, aggregate/fail-fast diagnostics, invalid-analysis no-write behavior, and existing-destination preservation.
- Desktop acceptance covers opening/editing `.amx`, current unsaved preview/run, local imports, project/local/per-run input precedence, validation modes, diagnostics/status transitions, HTML save, PDF export, and DOCX export where delivered. Tests use the typed main-process boundary and do not grant webview authority.
- V0.3 and V0.2 compatibility is proven through existing examples and no-option CLI paths; historical specifications remain unchanged except for approved factual corrections to V0.4 documentation.
- README, V0.4 spec corrections, CLI/desktop/extension documentation, migration/limitations, examples, package versions, scripts, and release notes match verified behavior. Dependency/font/DOCX notices and the absence of a project license decision are explicit.
- Root `bun run build`, `bun test`, `git diff --check`, extension compile/host/package/install checks where supported, desktop isolated checks, and all required CLI/example checks pass. Record exact counts, artifacts, versions, warnings, and unavailable checks.
- Release-owner build and launch checks pass on macOS 14+, Windows 11+, and Ubuntu 24.04+ with exact OS/runtime/tool versions and outcomes. WSL2/Linux evidence cannot substitute for native targets. If any target or required gate is unavailable/failed, V0.4 remains open and the blocker/options are recorded.
- DOCX disposition is recorded as delivered stretch or deferred, including its limitations; DOCX does not block core V0.4 acceptance when deferred.
- Final planning records state whether V0.4 acceptance is `COMPLETE` or remains `OPEN`, list residual limitations and deviations, record platform outcomes, document the license/Marketplace status, and identify the next approved action. No release claim is made beyond the evidence.
