# Sprint 048 Requirements: Desktop Packaging and Target Evidence

## Goal

Build and package OpenAMX Desktop for the current native OS/architecture through the prepared release workflow, select evidence-backed installer formats and prerequisites, and emit an inspectable, integrity-checkable target bundle. Preserve the existing application identity, web assets, Bun job worker, runtime resources, and root-authoritative version contract. Report all untested targets honestly.

## Dependencies and Entry Gate

- Sprint 048 depends on Sprint 047's release command, stable version, and native target/preflight contract.
- Sprint 047 Builder implementation and verification are recorded complete, but its Lead Developer disposition remains pending. Before production implementation begins, record the Lead Developer disposition or explicit authorization to proceed with Sprint 047's recorded residuals. Do not treat Builder completion as acceptance.
- Sprint 047 reports Linux x64 available for local checks; Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified. Its configured target mappings do not prove a native installer format or runtime self-containment.
- Sprint 049 owns VSIX packaging, release collection/verification integration, license/notices packaging validation, and publication. Sprint 048 must emit bundles compatible with Sprint 047's finalized contract without implementing those downstream commands.

## Inputs

- `planning/plan-openamxV08MasterSprintPlan.md`, Sprint 048, release contract, verification requirements, and V0.8 boundaries
- Sprint 047 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition or sequencing authorization
- `scripts/release/` implementation and finalized root release command/manifest/bundle contract from Sprint 047
- `desktop-app/package.json`, `desktop-app/electrobun.config.ts`, `desktop-app/hutch.config.ts`, and desktop build/runtime resource configuration
- `desktop-app/src/bun/jobWorker.ts`, `desktop-app/src/mainview/`, and the Vite/Bun build outputs required by the packaged application
- `.gitignore`, desktop packaging output rules, and existing ignored artifacts/spikes, which are not authoritative build results
- Official Hutch/Electrobun/toolchain documentation and actual available-host build/install/launch evidence

## In Scope

- Implement the finalized `release:desktop` root command for the current native OS/architecture. It validates versions, identity, clean committed source provenance, host target, and prerequisites without mutating source or silently repairing inconsistencies.
- Reuse the existing Bun/Vite/Hutch/Electrobun build chain and stable packaging controls. Preserve the separate Bun job worker, Vite HTML/assets, native runtime/resources, product name `OpenAMX Desktop`, and identifier `dev.openamx.desktop`.
- Establish available-host installer/toolchain feasibility from bounded experiments and official documentation. Select the least additional maintained tooling needed for a native installer on available targets, record per-target installer formats and known build prerequisites, and fail clearly for unsupported host/architecture combinations.
- If Sprint 047's preflight state needs to distinguish a target with a supported packaging route from an unverified or unsupported target, make only the minimal contract-compatible adjustment and document it. Do not claim a target available merely because a target mapping exists or tools are installed.
- Build into a fresh unique staging directory under the finalized incomplete-staging location. Never collect from stale build directories, spike artifacts, or ignored prior outputs. Inspect actual generated artifact contents and embedded app identity/version and required worker/web/runtime resources.
- Reject build outputs with stale/missing metadata, wrong identity/version/architecture, missing required resources, incomplete package state, or conflicting destination artifacts. Fail nonzero on build, inspection, or bundle-integrity errors.
- Emit a transferable target bundle for each successfully packaged target containing the required primary installer, finalized manifest, SHA-256 checksums, and evidence. Record automated build/package checks separately from manual native install/launch evidence. Incomplete staging must never be accepted as a collectable bundle.
- Keep `releases/<version>/` as ignored, retained local output, separate incomplete staging, and preserve prior outputs. Refuse silent overwrites and avoid automatic cleanup of accepted releases.
- On available native hosts, install without Bun/Node or other developer tooling, launch the application, open an AMX sample, verify preview and packaged resources/version/identity, close, and uninstall without deleting user documents. Record exact tested host and actual system webview/library prerequisites.
- Document commands users can run after cloning the prepared revision on other native machines, including prerequisites and how unavailable targets are recorded. Do not require the current machine to host all six target combinations.
- Add focused automated tests for command argument/host checks, fresh staging, artifact inspection and identity/resources, checksums/bundle completeness, stale/spike/conflicting output rejection, errors and cleanup, and unsupported-target behavior. Native install/launch claims require real native observations, not tests or mocks.
- Record exact commands, tool versions, artifact paths/sizes/hashes, measured native environment, installation observations, warnings, residuals, and visual or terminal evidence in Sprint 048 Builder evidence and planning records.

## Out of Scope

- VSIX production/inspection, collection of multiple transferred target bundles, release-wide verification, GitHub release creation/update, Marketplace publication, and the integrated operator runbook. Sprint 049 owns extension/release assembly and Sprint 050 owns integrated repeat-release acceptance/runbook.
- GitHub Actions, assumed cross-compilation, signed/notarized packages, code-signing infrastructure, updater implementation, delta delivery, or an update service.
- Changing to portable archives/AppImage or migrating to an incompatible/alternative native toolchain without explicit scope approval. Do not silently substitute a distribution format when the current chain cannot produce the agreed native installer.
- Claiming broad OS compatibility, minimum OS versions, self-contained runtime, or support for unavailable target hosts without direct evidence.
- Automatic version changes, source edits during build, commits/tags, release publication, overwrites, or deletion of earlier accepted outputs.
- License authoring or final license/notices/Marketplace readiness validation; Sprint 049 must inspect the supplied terms and actual package requirements.
- AMX language/core/CLI changes, desktop UX changes, VS Code behavior changes, unrelated V0.7 backlog, or formal accessibility certification.

## Constraints

- Keep the finalized root release contract and root-authoritative stable version. Build only a clean committed revision and capture its full commit ID; do not modify source or version metadata as part of building.
- Use project-facing target identifiers `linux`, `windows`, and `macos` with `x64` or `arm64`; preserve explicit native tool mappings. Never treat declared targets or simulated tests as native support.
- Distinguish host/toolchain feasibility, package/build checks, and manual installation/launch checks. A successfully built installer does not imply it was installed or tested.
- Use fresh target-specific staging, inspect the artifact rather than trusting its filename, hash every accepted artifact, and refuse destination conflicts. Incomplete staging is not a successful bundle.
- Retain unsigned packaging. Document genuine OS warnings/restrictions; do not claim signing or notarization.
- Users must not need Bun/Node or developer tools to launch the installed app. Record actual webview/system library requirements and do not describe the app as fully self-contained unless directly verified.
- Linux distribution support and minimum OS versions are evidence-specific; do not imply a universal Linux installer or compatibility range.
- All missing/unavailable remote native evidence remains visible as `unverified`; confirmed toolchain limitations are `unsupported` with actionable reasons. Six-target native certification is not a V0.8 completion gate.
- If installer selection requires migration, a format substitution, or a change to the approved contract, stop that slice and request explicit approval before expanding scope.