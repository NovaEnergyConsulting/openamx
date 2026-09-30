# Sprint 027 Requirements: V0.4 Examples, Documentation, and Acceptance

## Goal

Close V0.4 through one auditable end-to-end example, aligned documentation and metadata, compatibility proof, and complete release-owner acceptance. Record every residual, platform result, DOCX disposition, and license/publication status accurately; do not claim V0.4 complete while a required core gate is unavailable or failed.

## Inputs

- `planning/plan-openamxV04MasterSprintPlan.md`, Sprint 027 scope
- `docs/language-spec-v0.2.md`, `docs/language-spec-v0.3.md`, and `docs/language-spec-v0.4.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 020–026 acceptance records and implementation outcomes
- Existing examples, CSV/JSON fixtures, local modules, root CLI/tests, `vscode-extension/`, and `desktop-app/`

## In Scope

- Add or extend one checked-in end-to-end V0.4 example using typed record/scalar-list data, local modules and CSV/JSON inputs where useful, tables, bar/column/line/scatter coverage as practical, interactive HTML, static PDF, and the delivered DOCX stretch where its entry point is supported.
- Assert actual evaluated values, view data/bindings, show placement, source order, HTML structure/interactions/escaping/accessibility, PDF searchable content/layout properties, DOCX semantic structure if delivered, diagnostics, and no-write/preserve-existing behavior on invalid analysis/export.
- Exercise the desktop workflow end to end: open/edit `.amx`, unsaved-buffer preview/run, local imports, portable defaults/local overrides/per-run inputs, aggregate/fail-fast diagnostics, HTML preview/save, PDF export, and DOCX export if supported. Use actual typed main-process RPC and record platform-specific outcomes.
- Update `docs/language-spec-v0.4.md` only for evidence-based corrections; update README, CLI/desktop/extension documentation, examples/limitations/migration notes, version metadata, scripts, and release instructions to match observed behavior. Preserve V0.2/V0.3 historical contracts.
- Run root build/tests and CLI acceptance; extension compile/host/package/install checks where supported; desktop isolated checks; and release-owner build/launch checks on macOS 14+, Windows 11+, and Ubuntu 24.04+. Record exact toolchain/OS versions, outputs, warnings, and unavailable gates.
- Record final DOCX delivered/deferred disposition, Roboto/docx dependency notices, no-license/publication decision, Hutch residuals, platform limitations, and any approved deviations in planning logs.

## Out of Scope

- New language features, chart types, report semantics, desktop architecture changes, installer/updater work, Marketplace publication, project license selection, remote assets/modules/inputs, or unapproved domain rules.
- Claiming pixel parity, PDF/A, tagged accessibility, broad Office compatibility, or platform support without direct evidence.
- Silently repairing unrelated defects or weakening required acceptance to close the release.

## Constraints

- V0.4 is complete only when every core acceptance gate passes. If a required gate is unavailable or failed, leave release status open and record the blocker/options; do not substitute WSL2/Linux for native platform checks.
- Preserve V0.2/V0.3 behavior and historical specifications. Any compatibility exception requires explicit approval and migration guidance.
- Test production paths and actual files, not only exit codes or mocks. Generated artifacts must be reproducible or their engine metadata limitations explicitly documented.
- Keep secrets, local absolute paths, ignored configuration, native build output, and user-local artifacts out of committed release content.
- Marketplace publication and project license selection remain separate decisions; do not infer or add a license during acceptance.
