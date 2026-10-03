# Sprint 047 Requirements: Release Contract, Preflight, and Version Synchronization

## Goal

Establish the V0.8 release workflow contract, make the root package version authoritative across the desktop app and VS Code extension, and provide safe explicit version preparation plus truthful host/prerequisite preflight. Sprint 047 creates the repeatable foundation for native packaging and release assembly in later sprints; it does not produce release installers or publish artifacts.

## Dependencies and Entry Gate

- No sprint dependency. Sprint 047 may start independently of Sprint 046's pending Lead Developer disposition; do not alter or imply that disposition.
- The approved source is `planning/plan-openamxV08MasterSprintPlan.md`. This sprint implements only its Phase 1 contract, version-authority, and preflight scope.
- Repository-wide `LICENSE.md` is present, but Sprint 047 must not draft or revise legal terms. Full license/notices integration and production-readiness validation remain Sprint 049 work.

## Inputs

- `planning/plan-openamxV08MasterSprintPlan.md`, especially the proposed release contract, manifest schema, target matrix, decisions, and Phase 1 acceptance
- Root `package.json` as version authority; `desktop-app/package.json`, `desktop-app/electrobun.config.ts`, and `vscode-extension/package.json` as synchronized metadata surfaces
- Root, desktop, and extension Bun lockfiles, inspected for actual version metadata that may require coordinated updates
- `vscode-extension/esbuild.mjs` and extension package scripts, especially local VSIX installation
- `desktop-app/hutch.config.ts`, `desktop-app/electrobun.config.ts`, and current runtime/resource packaging configuration
- Existing tests, TypeScript/Bun conventions, `.gitignore`, and repository planning records

## In Scope

- Finalize and document the command responsibilities and argument contract for `release:prepare <version>`, `release:check`, `release:desktop`, `release:extension`, `release:collect <bundles>`, `release:verify`, and explicit `release:publish`. Sprint 047 implements only preparation and non-mutating preflight; later commands are interface contracts, not expected implementations in this sprint.
- Finalize project-facing targets `linux`, `windows`, and `macos`, each paired with `x64` or `arm64`, and document mappings to native tool conventions. Keep target facts separate from build/package checks and manual install/launch evidence.
- Finalize the local output proposal `releases/<version>/`, isolated incomplete staging, transferable per-target bundles, artifact naming, manifest/checksum expectations, retention, and no-overwrite rules for later sprints.
- Audit version and app-identity sources, lockfile metadata, the extension's local-install helper, native build/runtime prerequisites, and the current desktop worker/web asset/resource packaging.
- Treat root `package.json` as the sole version authority. Implement explicit stable-semver preparation that synchronizes root, desktop, and extension package versions; derive Electrobun application metadata from that authority; make extension local-install naming version-neutral.
- Validate all inputs and source state before mutation. Prepare coordinated updates safely, restore prior contents after a failed write, and make same-version preparation idempotent. Do not introduce dependency upgrades or unrelated lockfile churn; update lockfile metadata only if evidence shows it is required.
- Implement native OS/architecture detection and actionable prerequisite checks. Clearly distinguish the current available host from unavailable/unverified targets and confirmed unsupported targets.
- Add focused automated coverage for invalid/stable-version parsing, inconsistent source metadata, idempotence, failed coordinated writes/rollback, target detection, unsupported targets, argument/path handling, spaces, and Windows path semantics.
- Record exact commands, results, available host/toolchain facts, confirmed unsupported cases, unavailable native checks, and residuals in Sprint 047 Builder evidence and planning records.

## Out of Scope

- Building or inspecting native installers, changing installer formats/toolchains, producing a VSIX, collecting or verifying transferable bundles, publishing GitHub Releases, or submitting to the Marketplace. These belong to Sprints 048-050 or remain manual as specified by the master plan.
- Signing, notarization, cross-compilation promises, six-target native certification, or claims that configured targets are supported without native evidence.
- Implementing updater behavior, CI release pipelines, automatic version increments/prerelease channels, automatic commits/tags/authentication/publication, or release cleanup/overwrites.
- Drafting/changing license terms, publishing with a missing/invalid license, or resolving unrelated V0.8/V0.7 backlog.
- Changes to AMX language/core/CLI semantics, desktop UX behavior, VS Code feature behavior, or unrelated application/resource refactoring.

## Constraints

- Use a small portable TypeScript release orchestrator exposed through root Bun commands, reusing existing Bun/Vite/Hutch/Electrobun and esbuild/vsce tooling. Isolate native-command invocation behind a narrow adapter where needed; do not assume POSIX shell semantics.
- Stable semantic versions only: preparation requires an explicit version, never increments automatically, leaves reviewable source changes, and never commits or tags.
- `release:check` is read-only. Builds/checks in all later sprints must validate versions and prerequisites without silently repairing source.
- Preserve application name `OpenAMX Desktop` and identifier `dev.openamx.desktop`.
- Publishable artifacts in later sprints must come from one clean committed source revision. Do not claim provenance or native support from mocks, configuration entries, or browser evidence.
- Classify target evidence precisely: a current host with satisfied prerequisites may be `available`; a target that cannot be exercised here is `unverified`; a target proven unsupported by the selected toolchain is `unsupported`. `missing` describes a requested artifact absent from a release manifest/collection, not an unsupported platform.
- Keep status distinctions between build/package checks and manual installation/launch evidence. Do not put credentials, personal paths, or project source/input data into outputs or metadata.
- Keep V0.8 scope limited to the approved master plan. Any needed installer/toolchain migration or unresolved contract choice that changes the plan must be recorded and escalated for approval.