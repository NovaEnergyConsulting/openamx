# Sprint 049 Requirements: Extension Packaging and Release Assembly

## Goal

Produce and inspect a Marketplace-ready VSIX under the existing publisher identity, then implement safe collection, verification, and explicit GitHub Release publication for manually transferred desktop target bundles and the extension package. Preserve release version/source provenance, integrity, truthful target status, and immutable retry behavior. Marketplace publication remains manual.

## Dependencies and Entry Gate

- Sprint 049 depends on Sprint 047's finalized version, target, manifest, and release command contracts. Sprint 047 is **COMPLETE WITH RECORDED RESIDUALS** by Lead Developer disposition.
- Extension packaging and its license/package inspection can proceed independently. Release collection/publication integration must consume valid Sprint 048 output(s); Sprint 048 is **COMPLETE / APPROVED** by Lead Developer disposition.
- Sprint 048's accepted `releases/0.8.0/linux-x64` bundle records source commit `1a9585a24b5ec3c69afbccab0501e46752cbd104`; only consume it as a real release input if the extension and collection source provenance meet the same version/commit contract. Otherwise use disposable fixtures for tests and preserve the bundle unchanged.
- Current root has `LICENSE.md` and `COMMERCIAL-LICENSE.md`, but `LICENSE.md` refers to a separate full `LICENSE` file not present in the workspace inventory; the extension README still says there is no project license file, and `vscode-extension/package.json` has no license field. Do not interpret, invent, or modify legal terms. Sprint 049 may continue implementation and fixture tests, but production license readiness/publication must accurately report any missing full license text, notices, or required metadata.
- Sprint 050 owns integrated repeat-release acceptance and the consolidated operator runbook. Sprint 049 records its focused command/evidence details without taking over that integrated acceptance scope.

## Inputs

- `planning/plan-openamxV08MasterSprintPlan.md`, especially Sprint 049, release command contract, manifest/status rules, and publication decisions
- Sprint 047 requirements, finalized blueprint/contract, Builder evidence, and Lead Developer disposition
- Sprint 048 requirements, artifact/manifest/evidence format, Linux x64 bundle, Builder evidence, and Lead Developer disposition
- Root `package.json`, `scripts/release.ts`, `scripts/release/desktop.ts`, `tests/release.test.ts`, and release output rules
- `vscode-extension/package.json`, `vscode-extension/esbuild.mjs`, `.vscodeignore`, grammar/configuration resources, package scripts, and extension README
- `LICENSE.md`, `COMMERCIAL-LICENSE.md`, any actual full license/dependency notice files, and current package-manager/package-inclusion metadata
- `@vscode/vsce` behavior and actual package/Marketplace metadata requirements; GitHub CLI/API capabilities available in the environment

## In Scope

- Implement root `release:extension`. Reuse existing esbuild/vsce scripts and dependencies; preserve publisher `EngineersTools` and stable artifact name `openamx-vscode-<version>.vsix`.
- Validate release versions and package identity against root authority. Build and inspect the VSIX for version, publisher, extension entrypoint, AMX grammar, language configuration, required packaged runtime files, license reference and required notices. Verify package contents against the declared inclusion policy; exclude secrets, local build/test outputs, source material not needed at runtime, and unrelated repository content.
- Determine through actual `vsce`/Marketplace documentation and package inspection whether the extension is platform-neutral. Claim one VSIX serves all targets only if package evidence supports it; otherwise document the actual platform contract.
- Inspect the supplied license and notice files and actual `vsce` requirements. Where supported, add accurate package metadata and include the appropriate supplied license/notices. Do not suppress warnings or substitute a generic SPDX value unless it accurately represents the supplied terms and the tool supports it. Do not draft or amend legal terms.
- Update stale extension package/release documentation to match the current package version, publisher, local install flow, license-file state, and manual-only Marketplace publication. Do not make publication-readiness claims while required terms or notices are missing/unverified.
- Implement root `release:collect <bundles>` to accept manually transferred complete target bundles and the version-matched VSIX for one release version/full source commit. Validate manifest schema and fields, file names and sizes, SHA-256 values, complete markers, paths, duplicate targets, source/version provenance, target statuses, and artifact conflicts before accepting any data.
- Reject path traversal, absolute paths, symlinks or other unsafe archive members, malformed/incompatible manifests, corrupt or missing files, mixed versions/commits, stale/incomplete bundles, conflicting duplicate target assets, and silent overwrites. Preserve prior releases and do not auto-clean accepted outputs.
- Implement `release:verify` to validate the assembled manifest/assets/checksums, provenance, application identity, target statuses, package/build status, licensing readiness, and recorded install/launch status before publication. Distinguish `available`, `missing`, `unverified`, and `unsupported`; absence of an optional/unrequested target is not an error, while requested missing artifacts remain visible.
- Implement separate explicit `release:publish` for `NovaEnergyConsulting/openamx` by default with an explicit repository override. Use supported environment/CLI authentication without printing or storing credentials. Validate local source provenance and tag consistency before any remote mutation.
- Prefer creating a new release as a draft before uploading. Permit partial releases only with explicit acknowledgement and list missing/unverified/unsupported requested targets. Create `v<version>` only at the recorded source revision; never move an existing tag.
- Support safe retry and same-version additions: verify existing remote assets are byte-identical to requested assets; refuse conflicting replacement; permit later matching-version/revision additions without altering existing assets; fail nonzero and report retryable incomplete states after interrupted operations.
- Keep Marketplace submission manual. Provide package/inspection/local install guidance, but do not automate Marketplace upload.
- Add focused tests for VSIX contents/metadata, license readiness, manifests/checksums, safe paths, mixed provenance/version, corrupt/missing/stale assets, duplicate/conflict handling, target statuses, publication acknowledgement, tag consistency, auth/redaction, interrupted upload, and safe retry. Mock all GitHub operations in automated tests.
- Record exact commands/results, artifact paths/sizes/hashes, host/tool versions, package inspection evidence, remote-operation mocks, licensing gaps, and residuals in Sprint 049 Builder evidence and planning records.

## Out of Scope

- Automated Marketplace publication or changes to publisher identity.
- Drafting/revising legal text, selecting licensing terms, claiming legal compliance, or fabricating full license/third-party notice files. Missing supplied material is a readiness blocker to report, not an invitation to author terms.
- Native desktop installer builds/host certification, changing Sprint 048 installer formats, cross-target packaging, or changing desktop runtime dependencies except for manifest/collection compatibility needed by the approved contract.
- Integrated two-version repeat-release acceptance and the complete operator runbook; Sprint 050 owns those.
- Actual public GitHub publication during automated acceptance, public test releases, forced/replaced tags, force-updating releases, or credential storage/logging.
- Signing/notarization, desktop updater implementation, CI release pipelines, broad platform certification, AMX/CLI/editor behavior, or unrelated backlog.

## Constraints

- Use root `package.json` as version authority and require an explicit stable version. VSIX, desktop bundle, release manifest, and Git tag must agree on version and full committed source revision.
- Preserve publisher `EngineersTools`. The VSIX remains a package output only; install or package success does not imply Marketplace acceptance/publication.
- Use the finalized Sprint 047/048 manifest and target-bundle schema; preserve Electrobun update sidecars unchanged. Never normalize/modify tool-owned update metadata.
- Validate all inputs and hashes before mutation. Stage collection and remote publication; accepted local outputs and remote assets are immutable. Refuse silent overwrite and preserve previous releases.
- Restrict extraction/collection to safe relative paths within the chosen output root. Reject traversal, absolute paths, symlinks and unsafe archive entries; do not trust bundle filenames or JSON alone.
- Keep package/build checks separate from manual native install/launch results. Native target status is not upgraded by VSIX platform neutrality, mocks, configured target lists, or checksums.
- A partial GitHub release requires explicit operator acknowledgement. Existing tags must point to the recorded commit and are never moved. Existing assets may only be confirmed identical or left untouched; conflicts fail safely.
- Credentials may be read only through supported authentication channels and must not appear in logs, manifests, evidence, or command output.
- When actual license text/notices are incomplete or tool requirements remain unresolved, allow fixture-based development but make `release:verify` and `release:publish` report production readiness as blocked. Do not bypass the condition with warning suppression.