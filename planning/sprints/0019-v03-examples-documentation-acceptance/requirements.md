# 019 Requirements: V0.3 Examples, Documentation, and Acceptance

## Goal

Complete V0.3 acceptance with a working typed-data analysis, exact-value and exact-output tests, up-to-date user/editor documentation and metadata, and verified release gates. Preserve V0.2 behavior; close V0.3 only when the required checks pass and residual limitations are recorded.

## Inputs

- `planning/plan-openamxV03MasterSprintPlan.md` and `docs/language-spec-v0.3.md`
- Completed Sprint 013-018 acceptance/results in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Existing V0.2 examples/tests, `README.md`, `vscode-extension/README.md`, root and extension package scripts
- Production `run`/`render` CLI, opt-in `libraries/asset-management.amx`, JSON/CSV input/output and validation, and installed extension host checks

## In Scope

- Add one reproducible end-to-end `.amx` example with a custom record and an explicitly imported Asset Management record, CSV and JSON input fixtures (including nested/list JSON), a typed pure-function computation, and explicit named JSON and CSV exports.
- Add invalid CSV/JSON fixture(s) demonstrating aggregate and fail-fast validation with deterministic field path, expected/actual, and file/record context; use CLI `--input name=path` to override logical inputs.
- Assert exact evaluated values, validation diagnostics and ordering, HTML content/escaping, and byte-for-byte JSON/CSV export contents through production CLI paths. Generate checked-in HTML from the CLI; use isolated temporary destinations for test outputs rather than overwriting committed artifacts.
- Update the authoritative V0.3 specification only for evidence-based accuracy, the root README, extension README, V0.2-to-V0.3 migration/compatibility guidance, CLI input/output usage, known limitations, and version metadata/package scripts consistently with the accepted release.
- Run and record final root, example, CLI, extension-host, VSIX packaging/local-install, and V0.2 compatibility gates. Record deviations, domain-library stability caveat, and license/publication status in planning logs.
- If acceptance finds an actual product defect, implement only its smallest necessary fix with a focused regression test and record the deviation. Include the Sprint 018 record-constructor-in-`match` composition limitation in the conformance review.

## Out of Scope

- New language syntax, domain constraints/scoring rules, charts, units/currency, remote modules, broad multi-document workflows, Word/PDF, or a new editor architecture.
- Choosing/adding a license or uploading/publishing a Marketplace extension without an explicit project decision.
- Treating the provisional Asset Management schemas as domain-certified standards, or refactoring code unrelated to an observed acceptance failure.

## Constraints

- Examples must use only existing specified V0.3 features; the core remains domain-neutral. Do not invent a domain formula as a built-in or as an asserted standard.
- V0.2 documents and no-option `run`/`render` behavior remain valid, including inert bare declarations and ordinary fences.
- Version/package changes must be consistent across root CLI, extension manifest/scripts, lockfiles where present, README, VSIX artifact, and locally installed listing; do not advertise a release version that commands do not report.
- Report checks as passed only when actually run. Do not mark V0.3 complete if any required gate is blocked or unverified; record residual issues separately.
