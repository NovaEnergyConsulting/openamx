# Plan: OpenAMX V0.8 Consistent Release Packaging

Create a clean, consistent, and sustainable release workflow for the desktop app and VS Code extension. V0.8 provides local scripts that synchronize versions, build desktop installers on native hosts, package a release-ready VSIX, store versioned outputs, collect artifacts from different machines, and publish GitHub Releases through an explicit operator command. Continue sprint numbering at 047 and organize the work into four sprints, with no fixed sprint/date budget.

The requested desktop matrix is Linux, Windows, and macOS, each for x64 and arm64. Unavailable machines, unverified platforms, and unsupported architectures must not block script development or V0.8 completion on the current machine. Record these outcomes honestly; neither configuration entries nor simulated tests establish native support. The user will clone the repository on other machines and run the prepared commands there.

## Recommended Approach

- Reuse the existing Bun/Vite/Hutch/Electrobun desktop build chain and esbuild/vsce extension packaging. Prefer a small portable TypeScript release orchestrator exposed through root Bun commands over duplicated OS-specific scripts. Invoke native packaging tools through adapters where necessary; avoid POSIX-only shell assumptions.
- Make the root package version authoritative. Use an explicit preparation command to synchronize the root, desktop, and extension package manifests. Derive desktop application metadata from that authority rather than maintaining another version literal. Builds validate versions but never increment them.
- Build on each native OS/architecture rather than promising cross-compilation. Select maintainable native installer formats through bounded toolchain feasibility. Document prerequisites and unsupported targets without fabricating successful outputs or silently substituting a different distribution format.
- Use fresh staging directories for each build. Preserve application identity, worker resources, web assets, and required runtime dependencies. Inspect the generated artifact's embedded version and contents rather than trusting its filename or collecting stale files from existing output directories.
- Store accepted outputs under an ignored, versioned local release directory. Generate transferable per-target bundles with a structured manifest and SHA-256 checksums. The user manually transfers bundles to one collection machine.
- Collect only artifacts with the same release version and committed source revision. Reject corrupted files, unsafe paths, conflicting duplicates, and mismatched provenance. Keep previous releases and refuse silent overwrites.
- Produce unsigned desktop packages and document OS warnings and restrictions. Do not claim signing, notarization, or broad platform certification. Installer formats and minimum supported OS versions remain subject to evidence rather than assumptions.
- Package a Marketplace-ready VSIX, preserving the existing publisher identity, but leave Marketplace publication manual. The user has a Marketplace account and will supply a repository-wide dual-license file at `LICENSE.md`. Do not draft license terms or retain the superseded MIT decision.
- Publish GitHub Releases only through a separate explicit command. Permit partial releases after explicit acknowledgement, list missing/unverified targets, and allow later same-revision additions without replacing conflicting assets.
- Include protocol-neutral release metadata and preserve fresh tool-generated update metadata where available. The desktop updater itself is deferred; V0.8 does not implement update checking, downloading, installation, delta delivery, or an update service.

## Proposed Release Contract

Finalize argument spelling and manifest details in Sprint 047 while retaining these command responsibilities:

| Root command | Responsibility |
| --- | --- |
| `release:prepare <version>` | Validate an explicit stable semantic version, synchronize version sources safely, and leave changes for operator review and commit. |
| `release:check` | Check versions, application identity, host target, and prerequisites without mutating source. |
| `release:desktop` | Build and package the current native target, inspect the result, and emit a transferable target bundle and evidence. |
| `release:extension` | Build and inspect the VSIX, including version, publisher, entrypoint, resources, licensing, and package contents. |
| `release:collect <bundles>` | Validate and assemble manually transferred outputs for one version and source revision. |
| `release:verify` | Validate manifest, assets, checksums, licensing readiness, and recorded check status before publication. |
| `release:publish` | Explicitly publish or extend a validated GitHub Release, requiring acknowledgement when requested targets are missing. |

The operator workflow is prepare, review, commit, build on each available host, transfer, collect, verify, and explicitly publish. Publishable builds require a clean committed source revision. Preparation and builds must not automatically commit, tag, authenticate to GitHub, or publish. The publish command may create `v<version>` at the recorded revision; an existing tag must match and must not be moved.

Use `releases/<version>/` as the proposed local output layout, with incomplete staging separated from accepted outputs. Produce one primary installer for each feasible desktop target, one VSIX, a release manifest, checksums, and clearly identified optional native update sidecars. Include product, version, OS, and architecture in desktop artifact names. Preserve the established application name `OpenAMX Desktop` and identifier `dev.openamx.desktop`.

The manifest should record schema version, product version, full source commit, target OS/architecture, installer format, artifact names/sizes/SHA-256, application identity, build-tool versions, exact tested host environment, and verification results. Separate build/package checks from manual installation/launch evidence. Distinguish available, missing, unverified, and known unsupported targets; building an artifact does not imply that its installer was tested. Do not include credentials, personal paths, or project source/input data in distributable evidence.

Use project-facing target names `linux`, `windows`, and `macos`, paired with `x64` or `arm64`, and explicit mappings to native tool conventions. Do not rewrite tool-owned update schemas to match the project manifest. Checksums establish file-transfer integrity, not signed update authenticity or bit-for-bit reproducible builds.

## Steps

### Phase 1 - Release Contract and Version Authority

#### Sprint 047: Release Contract, Preflight, and Version Synchronization (depends on nothing)

- Prepare the sprint requirements, blueprint, acceptance criteria, and handoff prompt using the existing sprint template. Finalize the command, target-status, artifact-naming, output-layout, and manifest contracts.
- Audit actual version sources, package metadata, identity, relevant lockfile metadata, tool prerequisites, and runtime/resource packaging. The current desktop configuration independently stores a version, and the extension's local-install helper has a version-specific VSIX filename; remove these future maintenance traps.
- Implement explicit stable-version preparation with the root package as authority. Synchronize all three package manifests, derive the desktop metadata version, and make the local-install helper version-neutral. Update lockfile version metadata only where actually required, without unrelated dependency upgrades.
- Validate all preparation inputs before writing, stage coordinated updates, and restore prior contents on a failed update. Repeating preparation for the same version must be safe. Build/check commands must not silently repair or modify source.
- Implement native OS/architecture detection and actionable prerequisite checks. Assess installer and architecture capabilities using available hosts and official toolchain documentation. Record unavailable targets as unverified and confirmed unsupported targets explicitly; do not require access to all six hosts.
- Add focused tests for invalid versions, inconsistent manifests, idempotence, failed coordinated writes, target detection, unsupported targets, and argument/path handling, including paths with spaces and Windows conventions.

Acceptance: consistent authoritative versions, repeatable preparation, non-mutating checks, and honest target preflight. Unresolved remote-host feasibility remains recorded follow-up rather than a blocker to local script development.

### Phase 2 - Native Desktop Installer Packaging

#### Sprint 048: Desktop Packaging and Target Evidence (depends on Sprint 047)

- Wrap the existing web/worker build and stable Hutch/Electrobun packaging controls. Preserve the separately bundled job worker, UI assets, native runtime, and required resources.
- Select the least additional maintained tooling needed to produce a native installer on available targets. Document per-target formats, architecture limitations, build prerequisites, and installer behavior. A switch to portable archives/AppImage or an incompatible toolchain migration requires explicit scope approval.
- Ensure users do not need Bun/Node or other developer tooling to run the installed application. Document any genuine platform webview or system-library requirements; do not claim complete self-containment without evidence.
- Build into fresh target-specific staging. Inspect embedded application identity/version and resource contents, and reject stale legacy Spike outputs or conflicting metadata. Existing ignored artifacts are not authoritative evidence of what current source builds produce.
- Emit transferable target bundles with manifests, checksums, build outcomes, and separate native-test status. Fail nonzero on packaging errors, and never treat incomplete staging as a successful collectable release.
- Document how the user runs the same commands after cloning the prepared revision on another native machine. Unsupported architectures must fail clearly, not generate placeholders or claim success.

Acceptance: packaging checks pass on available hosts, outputs carry the correct version/identity, and the workflow is reusable without version-specific script edits. Missing native evidence for other targets is recorded, not inferred from browser tests or mocks.

### Phase 3 - VSIX, Collection, and Explicit Publication

#### Sprint 049: Extension Packaging and Release Assembly (depends on Sprint 047; extension work may parallel Sprint 048, while collection integration needs its outputs)

- Integrate the user-supplied repository-wide dual-license file into package metadata and distributed outputs, including required dependency notices. Use an accurate custom-license reference where supported, and inspect actual packaging/Marketplace requirements rather than suppressing licensing validation. Do not draft legal text or choose licensing terms.
- Wrap the existing esbuild/vsce extension workflow. Verify VSIX version, publisher, entrypoint, grammar/configuration resources, license, and package contents. Exclude secrets and unrelated repository/build material. Confirm the package is platform-neutral before asserting that one VSIX serves all targets.
- Preserve `EngineersTools` as publisher and document manual Marketplace submission. No automated Marketplace upload is included.
- Implement collection and verification for manually transferred bundles. Reject version/source-revision mismatches, malformed manifests, unsafe paths, corrupted files, and conflicting duplicates. Record requested targets that are missing, unverified, or unsupported.
- Implement the separate GitHub publishing command, defaulting to `NovaEnergyConsulting/openamx` with an explicit repository override. Use supported tool/environment authentication without exposing credentials in logs or metadata.
- Validate source provenance and tag consistency before upload. Prefer staging a new release as a draft before making it public, so interrupted upload does not expose an apparently complete release. Verify remote assets, fail nonzero on upload errors, and document retryable incomplete states.
- Require explicit acknowledgement for partial publication. Permit later additions only for the same version/revision. Verify already-uploaded identical assets during retries; refuse conflicting replacements and never move an existing version tag.

Acceptance: inspected release-ready VSIX, integrity-checked collection, deliberate GitHub publishing, safe retries, and clear partial-release status. If the actual license is not yet supplied, tests and script development may continue with fixtures, but production readiness/publication must report the missing license rather than invent one.

### Phase 4 - Integrated Repeat-Release Acceptance

#### Sprint 050: Sustainable Release Acceptance and Runbook (depends on Sprints 048-049)

- Exercise the available-host end-to-end workflow and simulated cross-machine collection. Use disposable fixtures to cover at least two release versions and same-version reruns without committing test version changes into production source.
- Test unsupported hosts, missing tools/license, mixed versions/commits, stale or corrupted assets, interrupted staging/uploads, duplicate targets, tag conflicts, partial-release acknowledgement, and missing credentials.
- Mock GitHub operations in automated tests. Actual public publishing requires an explicitly selected real release; acceptance tests must not accidentally publish test releases.
- Run applicable core, desktop, extension, and release-script checks. Perform native installer/launch checks where hosts are available, and record exact environments and unverified targets separately.
- Write one operator runbook covering prerequisites, installer formats, unsigned-package warnings, commands, outputs, version review/commit, artifact transfer, collection, verification, publication, manual Marketplace submission, recovery, retention, and the next-version checklist.
- Record commands, outcomes, evidence, exceptions, and disposition in the sprint artifacts and planning state/decisions/questions as appropriate. Distinguish implemented packaging adapters from native platform acceptance.

Acceptance: sustainable scripts, focused tests, correct available outputs, and an actionable runbook. Six-platform native certification is not a mandatory V0.8 completion gate; incomplete or unsupported targets must remain visible.

## Relevant Files

- `package.json` and the three `bun.lock` files - root version authority, release commands, and relevant encoded metadata.
- `desktop-app/package.json`, `desktop-app/electrobun.config.ts`, and `desktop-app/hutch.config.ts` - existing native build chain, version derivation, toolchain prerequisites, and application identity.
- `vscode-extension/package.json` and `vscode-extension/esbuild.mjs` - extension build/package commands, publisher metadata, and version-neutral local installation.
- `.gitignore` and component ignore/package-inclusion rules - release staging/output exclusions and controlled package contents.
- `README.md`, `desktop-app/README.md`, and `vscode-extension/README.md` - accurate development/release instructions and readiness limits.
- `tests/` and `desktop-app/tests/` - existing test conventions and focused release/target integration coverage.
- `planning/plan-openamxV07MasterSprintPlan.md` and `planning/sprints/0000-sprint-template/` - planning structure, sprint numbering, and implementation artifact templates.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` - acceptance evidence, dispositions, and unresolved host/toolchain decisions.
- Proposed `scripts/release/`, `tests/release.test.ts`, and `docs/releasing.md` - a small release orchestrator with necessary adapters, focused tests, and one runbook. Final file organization belongs to Sprint 047; avoid unnecessary abstractions or duplicate test files.
- Future user-supplied `LICENSE.md` - repository-wide dual-license terms to include accurately; implementers must not create legal terms on the user's behalf.

## Verification

1. Verify root, desktop, and extension versions agree after preparation, and independently inspect desktop metadata and VSIX contents. Builds/checks must not mutate or increment source versions.
2. Run focused release tests for version preparation, native target detection, checksums, provenance, collection, status reporting, retry behavior, and error paths. Include Windows path semantics and argument quoting. Run root `bun run build` and `bun test` as applicable integration gates.
3. Run desktop `bun run test`, `bun run typecheck`, `bun run build`, and `bun run test:ui` where prerequisites are available. Record exact errors or unavailable native checks; web builds/browser tests do not certify native packaging.
4. Run extension compile, package, and Extension Development Host tests where runnable. Inspect the VSIX and test local installation/document editing where available. Verify actual license/notices inclusion before claiming production readiness.
5. On available native hosts, install without developer tooling, launch, open an AMX sample, confirm preview/resources/version/identity, close, and uninstall without destroying user documents. Record user-data/settings behavior and exact OS/runtime prerequisites. Other requested targets remain unverified until exercised.
6. Verify corrupt, mixed-revision, mixed-version, and conflicting bundles are rejected. Test explicit publication, partial acknowledgement, tag consistency, immutable conflicting assets, authentication failure, interrupted uploads, and safe retries without publicly publishing test fixtures.
7. Demonstrate two-version releases and same-version reruns preserve earlier outputs and require no version-specific script edits. Run `git diff --check` and record acceptance evidence and residuals.

## Decisions

- Four sprints, numbered 047-050, with no fixed date/effort budget. Recheck numbering when preparing the first sprint if concurrent planning has advanced it.
- The requested matrix contains Linux x64/arm64, Windows x64/arm64, and macOS x64/arm64. No individual target is a mandatory completion gate on the current machine; support and verification status must be explicit.
- Local native-host execution is the delivery model. No GitHub Actions pipeline or presumed cross-compilation is included.
- Native installer formats are selected through feasibility. Unsigned distribution is acceptable and documented; no signing or notarization is required.
- Root-authoritative, explicitly supplied stable semantic versions are used. No automatic increments or prerelease channels are included. Preparation produces reviewable changes; the user commits them before building publishable artifacts.
- Publishable artifacts come from the same clean committed revision. Preparation/builds do not auto-commit or auto-tag; only explicit publishing may create the requested tag at that revision.
- Local outputs are versioned and retained. Transfer is manual, collection validates provenance/integrity, and overwrites/automatic cleanup are not allowed.
- GitHub publication is explicit. Partial releases require acknowledgement and truthful target status; later assets must match the release revision/version.
- Marketplace publication remains manual under the existing publisher identity. The VSIX must be release-ready, subject to the supplied license and actual metadata/content validation.
- Repository-wide dual licensing supersedes MIT. The user supplies `LICENSE.md`; scripts integrate it without selecting or drafting legal terms.
- Automatic updates are deferred. Metadata is groundwork, not a promise of compatibility with an undecided updater protocol or security model.
- No language, editor/desktop UX, CLI/npm distribution, formal accessibility, Office compatibility, broad platform certification, unapproved toolchain migration, or unrelated backlog work is authorized.

## Further Considerations

1. Configured OS targets do not prove that every architecture or installer format is supported by the current toolchain. Known unsupported targets require actionable errors; changing the packaging approach or toolchain needs approval rather than silently expanding scope.
2. macOS x64 and arm64 may need separate installers. A universal macOS package is not required or promised. Linux installer support must name its supported distributions when evidence establishes them; there is no assumed universal native Linux installer.
3. No minimum OS versions were selected during discovery. Record exact tested hosts and runtime prerequisites without inferring broader compatibility.
4. The actual dual-license text may impose packaging/notices requirements or need Marketplace metadata clarification. Treat that as a bounded release-readiness dependency when the user supplies it, not a reason to block script development or invent legal content.
5. SHA-256 and source provenance support collection and auditability; they do not replace code signing, establish update authenticity, or guarantee byte-identical native rebuilds.

## Next Actions

- Review this master plan and approve implementation handoff.
- Prepare Sprint 047 using the existing requirements, blueprint, acceptance, and handoff-prompt templates; record active status in `planning/state.md` when the sprint actually starts.
- Hand off the release contract, version-authority work, and bounded available-host preflight/feasibility checks. Do not require unavailable native machines or fabricate installer support.
- Integrate the root dual-license file when the user supplies it, and keep final production-readiness/publication limitations explicit until then.