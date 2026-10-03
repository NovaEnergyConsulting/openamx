# Sprint 047 Blueprint: Release Contract, Preflight, and Version Synchronization

## Approach

1. Establish the exact repository baseline before editing: inspect all version-bearing package/config/lock files, package identity, local extension-install helper, desktop runtime/resource layout, and the available host/tool versions. Record which facts are observed and which target/toolchain facts remain unknown.
2. Confirm the release command contract and data vocabulary against the V0.8 master plan. Document arguments, read/write behavior, failure behavior, target naming, target status semantics, artifact naming, `releases/<version>/` layout, staging separation, manifest fields, checksums, provenance, no-overwrite behavior, and the manual operator sequence. Preserve the separation between automated build/package checks and manual installation/launch evidence.
3. Implement the minimal root TypeScript orchestrator and root Bun command entries needed for `release:prepare <version>` and `release:check`. Keep pure validation/version/target logic separately testable; isolate filesystem coordination and native prerequisite invocation behind small interfaces only where required by actual complexity.
4. Make the root package version authoritative. Prepare and validate all candidate manifest/config contents before writes; synchronize root/desktop/extension package metadata; derive Electrobun version from the desktop package metadata; remove the hardcoded VSIX filename from local install. Inspect Bun lockfile metadata and update only fields required to keep supported frozen installs consistent.
5. Make preparation an explicit stable-semver operation. Reject malformed versions, prerelease/build metadata if outside the stable-version contract, inconsistent inputs, and unsafe paths before mutation. Guarantee idempotence for the same requested version and rollback of coordinated changes if a write fails. Do not auto-increment, commit, tag, or mutate during check/build.
6. Implement host/architecture detection and prerequisite reporting using project target names and explicit native-tool mappings. Report current-host facts and actionable missing tools; report other platforms as unverified unless official toolchain evidence establishes support or a concrete unsupported limitation. Do not turn absent hosts into failures that block local script development.
7. Add focused tests around parser/validation, consistency, idempotence, transactional write failure, host mapping, prerequisite/status outcomes, and portable path/argument cases including spaces and Windows conventions. Use temporary fixtures and never modify the production version in tests.
8. Record exact test/build/check commands and results, actual host environment, remaining installer-format/host questions, and unavailable checks in Builder evidence plus `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Do not claim installer, VSIX, cross-platform, license, publication, or native installation acceptance in Sprint 047.

## Finalized Release Contract

| Command | Contract |
| --- | --- |
| `release:prepare <version>` | Implemented in Sprint 047. Requires exactly one explicit stable `MAJOR.MINOR.PATCH`; validates all three package manifests before staging; root `package.json` is authoritative; synchronizes root, desktop, and extension versions; leaves reviewable changes and never increments, commits, tags, authenticates, or publishes. Repeating the same version is a no-op. Failure rolls back coordinated replacements. |
| `release:check` | Implemented in Sprint 047. Read-only checks manifest validity/consistency, fixed desktop name/identifier, current host/architecture, prerequisite executable/version results, six target mappings/statuses, and installer-toolchain uncertainty. Does not repair source or create output. |
| `release:desktop` | Later sprint: validate (never repair) versions/prerequisites; build/inspect one current native target and emit a transferable target bundle with evidence. |
| `release:extension` | Later sprint: validate (never repair) versions/prerequisites; compile/package/inspect the Marketplace-ready VSIX. |
| `release:collect <bundles>` | Later sprint: integrity/provenance-check manually transferred bundles and assemble one release version/revision. |
| `release:verify` | Later sprint: validate manifest, checksums, licensing readiness, and verification status before publication. |
| `release:publish` | Later sprint: explicit GitHub publication/extension, with partial-release acknowledgement and immutable tag/assets. |

Use project target identifiers `linux`, `windows`, and `macos`, each with `x64` or `arm64`. Keep `available`, `unverified`, and `unsupported` as target feasibility/verification states; use `missing` for a requested release asset that is absent. The local output root is `releases/<version>/`, with incomplete staging isolated from accepted artifacts. Artifact names identify product, version, OS, and architecture. The release manifest records schema/product version, full source commit, target OS/architecture, installer format, artifact names/sizes/SHA-256, application identity, build-tool versions, tested host environment, and verification results. Preserve tool-generated update sidecars unchanged when later packaging provides them.

The desktop artifact basename is `OpenAMX-Desktop-<version>-<os>-<architecture>.<format>`; Sprint 048 selects the platform extension only after toolchain evidence. The extension artifact basename is `openamx-vscode-<version>.vsix`. A target bundle contains its manifest, primary artifact(s), SHA-256 checksums, and evidence record; collection accepts only a complete bundle. The versioned release manifest records product/version, full source commit, target OS/architecture, installer format, artifact filename/size/SHA-256, application name/identifier, exact build-tool versions, tested host OS/kernel/architecture, automated build/package checks, and separately labeled manual install/launch results. No credentials, personal paths, project source, or input data are permitted.

`releases/<version>/` is retained local output and is not a source of build inputs. Incomplete work belongs under `releases/.staging/<version>/<target>-<architecture>/<unique-id>/`. Every accepted destination must be absent; preparation, build, collection, and publication retries do not silently overwrite accepted artifacts or remove prior versions. Transfer checksums establish file integrity, not signatures, update authenticity, or reproducible builds. A bundle or target is never called `missing` until a release manifest requests that asset and confirms it absent.

The operator sequence is explicit preparation, review, operator commit, native builds on available hosts, manual bundle transfer, collection, verification, and explicit publication. Build/package checks do not imply installation/launch checks. Sprint 047 reports the current Linux x64 host `available` only when versions/identity and local prerequisites pass; other matrix entries remain `unverified` absent direct native/toolchain evidence. Missing local prerequisites are reported separately, not converted into an unsupported-target claim. `unsupported` is reserved for an evidence-backed limitation; Sprint 047 has no such platform finding.

## Files to Update

- Proposed `scripts/release/` implementation and root `package.json` command entries, final organization determined by the existing codebase conventions
- `desktop-app/electrobun.config.ts`, package metadata and only demonstrably required lockfile metadata
- `vscode-extension/package.json` local-install helper
- Focused release tests under the existing test conventions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 047 Builder evidence and contract details in these artifacts

## Notes

The requested matrix is six native OS/architecture targets, but the current machine cannot establish remote-host support. Use official toolchain documentation and available-host experiments to document bounded feasibility; label untested targets `unverified`, not supported or unsupported by assumption. Do not implement desktop installer packaging, VSIX packaging, collection, or GitHub publication in this sprint. `LICENSE.md` is not a license-authoring task; later production readiness must validate its actual terms and packaged notices.