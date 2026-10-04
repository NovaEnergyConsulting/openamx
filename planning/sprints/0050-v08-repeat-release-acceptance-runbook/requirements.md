# Sprint 050 Requirements: Sustainable Release Acceptance and Runbook

## Goal

Demonstrate that the V0.8 local release workflow is repeatable across at least two disposable versions and same-version reruns, exercise adversarial failure/recovery cases, validate the available-host workflow without overstating platform support, and deliver one accurate operator runbook for future releases. Preserve immutable outputs, source provenance, explicit publication, and truthful release/license status.

## Dependencies and Entry Gate

- Sprint 050 depends on Sprints 048 and 049. Sprint 048 is COMPLETE / APPROVED by Lead Developer direction; its Linux x64 installer/bundle and separate Lead Developer-reported launch result must retain their different evidence status.
- Sprint 049 Builder evidence reports implementation complete with release-readiness blockers; no Lead Developer disposition is recorded yet. Before integrated acceptance claims completion, obtain its disposition or explicit authorization to proceed with named residuals. Do not upgrade Builder completion to acceptance.
- Sprint 049's real 0.8.0 desktop bundle is from commit `1a9585a24b5ec3c69afbccab0501e46752cbd104`; its extension source was dirty at `b92f6021284a58213641287043989267ebf387a5`. They are intentionally provenance-incompatible and were not collected. Preserve that bundle unchanged; never use fixtures to claim the real bundle matches.
- `LICENSE.md` now contains the supplied full AGPLv3 text and the VSIX includes it. License-owner confirmation of the AGPL metadata for the dual-license offer and whether third-party notices are required remains unresolved. Script development/repeatability tests may proceed with disposable fixtures; production `release:verify`/`release:publish` must remain blocked until readiness is resolved.
- The available-host release exercise requires one clean committed source revision and an explicitly authorized stable version. If the chosen version/target destination already exists, do not overwrite it; request an authorized new version or use the existing non-mutating/fixture checks. No public release is selected by this sprint preparation.

## Inputs

- `planning/plan-openamxV08MasterSprintPlan.md`, Sprint 050, release command contract, manifest, target matrix, and operator workflow
- Sprint 047-049 artifacts, Builder evidence, Lead Developer dispositions, decisions, and unresolved questions
- Root `package.json`, `scripts/release.ts`, all `scripts/release/` adapters, `tests/release.test.ts`, and release output directories
- `releases/0.8.0/linux-x64/` retained desktop bundle, Sprint 049 extension package evidence, and their full-commit provenance/status fields
- `LICENSE.md`, `COMMERCIAL-LICENSE.md`, license-owner decisions, and any required dependency notices
- `README.md`, `desktop-app/README.md`, `vscode-extension/README.md`, `docs/releasing.md` (to be created or consolidated), package prerequisites, and native install evidence
- Current available-host environment and exact root/desktop/extension/release test/build commands

## In Scope

- Exercise the available-host end-to-end release workflow using a clean committed source revision and explicitly authorized stable version: preflight, reviewable version preparation as needed, native desktop bundle, VSIX bundle, checksums/provenance inspection, collection, read-only verification, and publication mock or deliberate operator hold.
- Never force the retained 0.8.0 Linux x64 bundle into a release with a different full source commit. Build a fresh matching target only when the selected version/destination is authorized and absent; otherwise record the exact blocker and use disposable data for collector integration.
- Exercise at least two distinct disposable release versions and same-version reruns without leaving test version changes in production package manifests or accepted release outputs. Demonstrate prior outputs remain unchanged and conflicting re-acceptance fails safely.
- Test unsupported hosts, missing prerequisites, missing/unconfirmed license or notices, mixed versions/commits, stale or corrupt assets, unsafe paths, interrupted staging/uploads, duplicate targets, tag conflicts, partial-release acknowledgement, missing credentials, identical remote retries, and later same-revision additions.
- Mock every GitHub remote operation in automated acceptance tests. Ensure test fixtures cannot reach a public endpoint or publish a test release. Real publication may occur only as a separately selected operator action against a user-authorized real release; it is not a default sprint gate.
- Run applicable core, desktop, extension, and release-script tests/builds. Perform native installer/install/launch checks on available hosts where a fresh authorized artifact exists; record exact environments and separate unverified targets. Browser, mock, and package inspections do not establish native certification.
- Create or consolidate one operator-facing `docs/releasing.md` covering prerequisites; target installer formats and platform requirements; unsigned-package warnings; version preparation/review/commit; exact command sequence and outputs; host-by-host builds; manual artifact transfer; collect/verify/publish; manual Marketplace submission; missing-license readiness; partial releases; recovery/retries; retention/no-overwrite; and next-version checklist.
- Record exact commands, versions, outcomes, manifests/artifact hashes and sizes, test host, screenshot/terminal evidence, residuals, and disposition in Sprint 050 Builder evidence and planning records.

## Out of Scope

- New desktop UX/language/CLI/VS Code functionality, broad native certification, changing installer/toolchains, signing/notarization, CI, desktop updater/service, or automatic cleanup/overwrite.
- Choosing or drafting licensing terms, asserting legal compliance, or reporting Marketplace readiness before license-owner confirmation and required notices are resolved.
- Automated Marketplace submission. The user submits the VSIX manually under `EngineersTools`.
- Unselected real/public GitHub releases, publishing test fixtures, public smoke tests, force-updating tags/releases/assets, or storing credentials.
- Requiring every OS/architecture host to be available. Six-target native certification is not required for V0.8 completion.

## Constraints

- Use the finalized commands and their actual behavior: `release:prepare <version>`, `release:check`, `release:desktop`, `release:extension`, `release:collect <bundles>`, `release:collect --addition <bundles>`, `release:verify [version]`, and `release:publish [--version=<version>] [--assembly=<path>] [--repo=OWNER/REPO] [--allow-partial]`.
- Version preparation is explicit and stable-semver only. Review and commit source changes before building; publishable artifacts must all share one clean full source commit and version.
- Use disposable test directories/files, isolated HOME where native installation is tested, and injected/mocked GitHub clients. Tests must not alter production package versions, retained bundles, or public repositories.
- Preserve accepted outputs and `releases/<version>/linux-x64`; refuse collisions, never delete prior releases, and distinguish a repeat with identical bytes from a conflicting overwrite.
- Keep build/package, checksum/provenance, manual install/launch, license readiness, target support, and publication status separate. Do not infer one from another.
- Current Linux x64 is the only packaged target. Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified unless new direct evidence is recorded. Unsupported must be evidence-backed.
- Record Linux system WebKitGTK 4.1, GTK/GLib, and related graphics/media dependencies where relevant; do not claim a universal Linux runtime or self-contained app.
- Keep Marketplace submission manual and GitHub publication explicitly operator-invoked. A draft or mock is not a public release.