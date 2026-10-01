# Sprint 034 Requirements: V0.5 CLI, Documentation, Examples, Acceptance, and Release Record

## Goal

Produce the auditable V0.5 integrated acceptance record: clear CLI and documentation onboarding, a branded end-to-end example/fixture suite, automated cross-surface evidence, Lead Developer manual visual review, and an honest feature/release disposition. Update only verified product claims and keep unresolved prior-sprint and release-engineering gates explicit.

## Inputs

- `planning/plan-openamxV05MasterSprintPlan.md`, Sprint 034; approved `docs/language-spec-v0.5.md`; approved Sprint 028 visual-review manifest and F0-F6 fixtures
- Sprint 029-033 requirements/acceptance/outcomes, especially Sprint 031 remediation/Sprint 032 export outcome and Sprint 033 direct-provider code-action residual
- Root `README.md`, `package.json`, `src/cli.ts`, examples/fixtures, renderer/export adapters/tests, `desktop-app/README.md`, `vscode-extension/README.md`, extension package/tests and planning records
- Current automated verification commands and tracked previous outcomes; temporary fixture projects/output directories must be isolated from shared config/version control

## In Scope

- Improve CLI help, errors, examples and onboarding for verified V0.5 report identity, `--project-root`, source visibility, safe local logo behavior, HTML/PDF/DOCX export, desktop workflow and VS Code provider capabilities. Preserve noninteractive CLI behavior, existing `run` input semantics/path base, actionable source/JSON-pointer diagnostics, nonzero failure and no private path/secret disclosure.
- Add one auditable V0.5 end-to-end fixture/example based on existing typed inputs/views/local imports, plus safe copied temporary project fixtures for F0-F6 as the visual-review manifest requires. Include a newly authored local PNG with recorded dimensions/bytes/license, never a remote asset. Assert identity precedence, valid/invalid logo/metadata, default/hidden source, final values, original report/source/view order, existing table/chart data/interaction/static print, and invalid analysis/destination no-write preservation.
- Update README, V0.5 contract references, desktop/extension documentation, CLI guidance, examples, version metadata and release instructions only where verified. Preserve V0.2-V0.4 specifications as historical contracts. Correct stale V0.4-only product wording; do not represent a local VSIX as Marketplace publication or WSL2 as native Ubuntu evidence.
- Run and record root build/full tests; CLI/example/report config/no-write acceptance; desktop direct RPC/typecheck/Vite checks; extension compile/host/package/install/installed-artifact checks where supported; and `git diff --check`. Record exact command, version, assertion/test count, artifacts, warnings, unavailable checks and whether an artifact used a temporary fixture. Do not substitute missing checks with unrelated success.
- Run the Lead Developer visual review using the approved evidence form against representative desktop, HTML, PDF and DOCX F0-F6 outputs. Record reviewer/date/environment/viewer/OS, fixture and artifact SHA-256, pass/exception/blocked state, observations/remediation and the final signed V0.5 decision. Manual review supplements, never replaces, automated evidence.
- Reconcile every known open item in a final disposition table: Sprint 029 native project/save/close/populated accessibility; Sprint 030 AMX highlighting/static completion/UI state/accessibility exceptions; Sprint 032 named viewer/Office visual evidence; Sprint 033 WorkspaceEdit apply-time stale-precondition limitation; native macOS/Windows/native Ubuntu, Hutch package/launch, broad Office, project license and Marketplace tracks. Close only an item with direct evidence or explicit Lead Developer exception/deferral; otherwise retain named owner/next action.

## Out of Scope

- New AMX syntax/type/runtime/view behavior, report identity policy changes, new chart types, LSP/runtime execution in VS Code, interactive CLI flows, remote assets, browser-print export fallback, installers/updaters, Marketplace publication or selecting/adding a project license.
- Quietly implementing or waiving Sprint 029/030/033 residuals during documentation work. If a discovered failure needs code, record it and obtain a scoped follow-up rather than concealing it in example/doc changes.
- Claiming tagged PDF/PDF-A, HTML/PDF/DOCX pixel parity, broad Office compatibility, formal accessibility certification or native platform support without direct evidence.

## Constraints

- V0.5 feature completion and V0.4 inherited release-engineering status are separate dispositions. A Lead Developer may approve V0.5 with documented exceptions only if every exception, owner and limitation is recorded; do not call the product or release fully complete if required evidence remains open.
- Keep source-visible default and V0.2-V0.4 compatibility. Exercise the shared `PreparedReport` path and safe atomic writers, never a second evaluation path. Keep fixture secrets/private local paths out of committed assets, docs, diagnostics and screenshots.
- Respect the Sprint 033 code-action limitation: VS Code 1.85 cannot attach an apply-time document-version precondition to `WorkspaceEdit`. Sprint 034 must have the Lead Developer decide whether resolve-time guard is an accepted bounded exception or require an explicitly scoped guarded-command/preview remediation before provider criterion closure.
