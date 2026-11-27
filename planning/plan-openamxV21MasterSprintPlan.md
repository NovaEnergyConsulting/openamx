# OpenAMX V0.21 Master Sprint Plan

## Problem and Proposed Approach

OpenAMX desktop builds currently have no application-side update discovery or installation workflow. V0.21 will add one feature: the desktop app checks for stable releases, informs the user when one is available, and downloads/applies it only after the user authorizes the update. Electrobun's native updater will own update metadata validation, downloads, preparation, transactional replacement, and relaunch. The public OpenAMX GitHub Releases assets will be the update host.

The app will check once on launch and when the user requests a check. It will not download silently, force-close, or schedule background checks. The existing unsaved/conflicted-tab quit guard remains authoritative. If the user cancels that guard after an update has been staged, the app keeps the staged update and presents a persistent action to restart into it.

V0.21 also updates Electrobun and Hutch together to their latest stable compatible versions and records exact project pins. Official documentation reviewed on 2026-11-27 lists Electrobun 2.0.7 paired with Hutch 0.30.0; recheck the release channel before implementing the plan.

## Confirmed Product Decisions

- **Version scope:** One user-facing capability: native desktop update checking, notification, and user-authorized update installation. Upgrade Electrobun and Hutch as required build-tool maintenance.
- **Check policy:** Check once at app launch and on explicit user request. Do not schedule recurring checks.
- **Release source:** Stable OpenAMX GitHub Releases only. Use `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download` as the Electrobun release base URL. GitHub excludes prereleases from this route.
- **Consent:** Show an available version and offer Update or Later. Only after Update should the app download and prepare the update; apply it only after Electrobun reports it ready.
- **Deferral:** Later closes the offer without downloading. A ready staged update canceled by the current unsaved-tabs quit guard remains available through a persistent “Restart to update” action.
- **Quiet outcomes:** Do not notify for no update or routine check/network failures. Explain download/apply failures in context without damaging the running installation.
- **Bootstrap:** V0.20 installations cannot discover V0.21 because they do not contain the new updater call path. Existing users need one normal V0.21 installer upgrade; updates can be discovered from V0.21 onward.
- **Toolchain:** Pin an exact compatible stable Electrobun/Hutch pair in the project configuration. At planning time the official docs list Electrobun 2.0.7 with Hutch 0.30.0; confirm the latest stable pair before changing pins.
- **Release authority:** This plan authorizes planning and implementation only. It does not authorize creating/publishing a GitHub release, changing app identity, or certifying all platforms.

## Recommended Approach

- Configure Electrobun's `release.baseUrl` to the stable GitHub Releases latest-download endpoint. Preserve the existing app name, identifier, and stable channel so installed app state remains compatible.
- Keep updater ownership in the Bun main process. Expose a small typed RPC contract for check state and user-authorized download/apply operations; do not make renderer code responsible for updater internals.
- Reuse one update state machine for startup and manual checks, guarding against overlapping checks/downloads. Do not attempt production update flows for development builds or unsupported updater states.
- Treat Hutch's generated `artifacts/` as the protocol source of truth. Publish mandatory update manifests, full bundles, and integrity sidecars at their original flat basenames. If delta patches are generated, preserve the complete required patch trail and avoid basename conflicts; otherwise disable patch generation explicitly and rely on full-bundle downloads. Never publish metadata that refers to an unavailable patch.
- Preserve the current explicit release workflow: human review and publication remain separate operator actions. Automated tests use injected clients or local fixtures, never public GitHub endpoints.
- Test update preparation and restart on native hosts. A build or mock test on one OS is not evidence of cross-platform behavior.

## Confirmed Scope

### Toolchain and Update-Host Contract

- Upgrade the project's Electrobun pin and Hutch CLI pin to the latest compatible stable pair, revalidated at implementation time.
- Configure `release.baseUrl` for `NovaEnergyConsulting/openamx` stable GitHub Releases without changing `app.name`, `app.identifier`, or the stable update channel.
- Confirm Electrobun's generated stable manifests and full update bundles are included in each accepted target bundle and reach GitHub Releases as flat, unchanged asset names.
- Decide and verify the delta-patch policy. If enabled, retain all patch files needed to bridge supported release versions and prove that the publication pipeline handles their names without collisions. If the existing assembly contract cannot do that safely, explicitly disable patch generation and verify full-download updates.
- Keep GitHub latest-release semantics in scope: drafts and prereleases do not become the stable updater target until a human publishes a stable release.

### Desktop Update Flow

- Use Electrobun's native `Updater` API from the Bun main process for `checkForUpdate`, `downloadUpdate`, `updateInfo`, and `applyUpdate` as supported by the pinned release.
- Check once at app startup and expose a manual check through the existing Help/command surface.
- Show a dismissible available-update prompt with the new version and Update/Later actions. Do not download before explicit consent.
- Report download/preparation status as needed. Apply only after the update is ready; rely on Electrobun's native transactional apply and relaunch behavior.
- Honor the existing `before-quit` and `will-close` save/conflict protection. If the quit prompt is canceled, keep the app open and provide a persistent retry action for the staged update.
- Keep no-update and routine check failures quiet. Surface actionable download/apply failures without exiting or replacing the installed app.

### Release Documentation and Acceptance

- Document the stable update source, user-consent behavior, one-time V0.20 installer bridge, and relationship to the existing release pipeline.
- Test check, no-update, available update, defer, consented download/apply, errors, duplicate requests, and quit-cancel/retry behavior.
- Exercise an installed V0.21 build updating to a later stable build using a loopback/static test host. Validate the public GitHub route only against an explicitly authorized published release.
- Record exact commands, outputs, platform/host evidence, and residuals. Mark unavailable platform checks unverified rather than passed.

## Explicit Exclusions

- Canary/prerelease update channels or a second update host.
- A hosted update service, backend, analytics, telemetry, or update scheduling service.
- Silent downloads, forced restarts, forced updates, or update installation without user authorization.
- Automatic release publication, tag movement, modification of published releases, or bypass of the existing human release review.
- Changes to the VS Code extension, CLI/npm distribution, AMX language/runtime behavior, app identity, licensing policy, or unrelated desktop UX.
- Broad platform certification from packaging checks or a single native test host.
- Resolving or overriding V0.20 closeout residuals; those remain governed by their existing disposition.

## Sprint Sequence

Continue after V0.20 Sprint 127 closeout, respecting its recorded residuals and disposition. This sequence does not grant release authority. S129 depends on the S128 toolchain and update-host contract. S130 depends on S129. S131 can proceed in parallel with S130 after S128. S132 depends on S128-S131.

### Sprint 128: Toolchain and Update-Host Contract

- Record the latest compatible stable Electrobun/Hutch pair and update exact project pins. Verify the Hutch project pragma and Electrobun configuration agree with the selected pair.
- Add the stable GitHub Releases `release.baseUrl`; preserve app identity and channel.
- Inspect the current build, desktop bundle, assembly, and publisher behavior against Electrobun's complete generated artifact contract.
- Decide whether V0.21 enables delta patches. Verify patch asset retention and uniqueness if enabled; otherwise explicitly set the no-patch policy and prove full-bundle update behavior.
- Add focused contract checks for required manifest/full-bundle/integrity assets and stable flat filenames. Keep release publication out of automated tests.
- Produce a dispositioned compatibility note before application-side updater implementation proceeds.

### Sprint 129: Main-Process Updater Integration (depends on Sprint 128)

- Add a Bun-process updater owner using the pinned Electrobun API. Keep application update logic out of renderer code.
- Add typed RPC operations and state for checking, available version, download/preparation, ready-to-apply, and failure outcomes.
- Trigger the launch check once and provide a shared manual-check request path. Prevent duplicate overlapping checks or downloads.
- Keep development builds and unsupported updater configurations from attempting stable production updates.
- Add main-process/RPC tests with injected or local responses for no update, available update, request failure, download failure, and duplicate requests.

### Sprint 130: Update Prompt and Quit-Safe Apply (depends on Sprint 129)

- Add a manual “Check for updates” command in the existing Help/command menu.
- Present the available version with Update and Later actions. Later must not start a download.
- On Update, download and prepare through Electrobun, report meaningful progress/state, and apply only when ready.
- Preserve existing unsaved/conflicted-tab prompts. If the user cancels quitting, leave the update staged and expose “Restart to update” persistently until it is applied or no longer available.
- Cover dismissal, retry, save/discard/cancel, errors, and repeated interactions in focused UI tests.

### Sprint 131: Release Pipeline and Documentation (after Sprint 128; may run in parallel with Sprint 130)

- Verify that the desktop release build output includes the stable update manifest, full update archive, integrity sidecars, and optional patches selected by Sprint 128.
- Extend bundle assembly and release tests only where required to retain the complete update contract without renaming or dropping assets. Preserve existing provenance, checksum, conflict, and draft-only guarantees.
- Document the GitHub latest-download host, stable-only behavior, asset retention requirements, V0.20-to-V0.21 installer bridge, user consent, and manual publication process in `docs/releasing.md`.
- Do not publish a real release or make public-endpoint calls in test suites.

### Sprint 132: Integrated Acceptance and V0.21 Closeout (depends on Sprints 128-131)

- Test the end-to-end updater state machine using a controlled static/loopback host: no update, available update, Later, consented download, successful apply/relaunch, network/download/apply failure, and already-staged retry.
- Verify that canceling the existing quit guard does not lose the staged update or close the workbench.
- Test a normal V0.20-to-V0.21 installer upgrade as the bootstrap path, then verify V0.21-to-later-stable update behavior.
- Run focused desktop tests, RPC contract checks, typecheck, web build, stable packaging, and release verification on available native hosts.
- Inspect complete target bundles and assembled release inputs for the exact stable update metadata and payload set. Verify a public `releases/latest/download` path only after explicit release authorization.
- Record exact commands, outcomes, unavailable targets, known limitations, and closeout status. Do not infer platform certification or release authorization from successful builds.

## Relevant Files and Surfaces

- `planning/plan-openamxV20MasterSprintPlan.md` — predecessor plan and V0.20 Sprint 127 closeout context.
- `desktop-app/electrobun.config.ts` — app identity, stable release host, and update artifact configuration.
- `desktop-app/hutch.config.ts` — current Electrobun version pin, Hutch project pin, and build tasks.
- `desktop-app/src/bun/index.ts` — main-process updater ownership and existing `before-quit` / `will-close` safeguards.
- `desktop-app/src/shared/rpc.ts` — typed updater RPC operations and state contract.
- `desktop-app/src/mainview/App.vue` — startup/manual check presentation and update command.
- `scripts/release/desktop.ts` — native build validation and target artifact collection.
- `scripts/release/assembly.ts` and `scripts/release/publish.ts` — accepted asset manifests, flat GitHub asset names, and draft-only publication.
- `tests/release.test.ts` and desktop updater/RPC/UI suites — artifact and application update acceptance coverage.
- `docs/releasing.md` — operator release and live-update runbook.

## Verification

1. Recheck official Electrobun/Hutch stable release documentation. Confirm exact compatible versions, project pins, Hutch preparation, and Electrobun config validation.
2. Verify update configuration preserves `dev.openamx.desktop`, stable channel behavior, and the GitHub base URL. Confirm development builds do not attempt production checks.
3. Run focused updater/RPC/UI tests for check, no update, available, Later, consent, download/apply errors, duplicate requests, and staged-update retry after quit cancellation.
4. Run desktop `bun run typecheck`, `bun run test`, `bun run build:web`, stable Electrobun packaging on available native hosts, root release tests, and `bun run release:check` where prerequisites permit.
5. Inspect generated artifacts and each accepted target bundle for the stable `*-update.json`, full update archive, checksum sidecars, and patch files if enabled. Verify no required file is renamed, omitted, or ambiguously flattened during assembly/publication.
6. Exercise a packaged installed app against a local/static test host and confirm update, defer, restart/relaunch, and save/discard/cancel behavior. Record per-platform evidence and leave unavailable targets unverified.
7. Treat published-GitHub validation and publication as separate explicitly authorized operator actions. Automated tests must never publish or mutate public releases.

## Decisions and Assumptions

- The V0.21 product contract is stable-only, launch-plus-manual checking, consent-before-download/apply, dismissible Later, and a persistent retry action if the existing quit guard cancels apply.
- Electrobun's documented static-host contract permits GitHub Releases. The configured host is `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download`; it resolves only to the latest published stable release, not drafts or prereleases.
- Electrobun documents `checkForUpdate()` and `downloadUpdate()` as explicit operations; configuring a base URL does not schedule checks. V0.21's startup and manual request paths are the complete check policy.
- Electrobun 2.0.7 and Hutch 0.30.0 are the paired versions listed in the official documentation reviewed on 2026-11-27, not a timeless pin. Recheck latest stable versions before implementation and pin the selected exact pair.
- The release pipeline currently collects Electrobun-generated update assets into target bundles and publishes accepted assets by basename. Sprint 128/131 must verify the complete artifact list after the toolchain update, particularly optional patch retention.
- Existing V0.20 installations need a normal V0.21 installer upgrade before native update discovery is available. The feature does not retroactively add updater code to already-installed builds.
- The plan authorizes no release publication, deployment, app identity change, or cross-platform certification. Existing release controls and V0.20 closeout dispositions remain in force.

## Further Considerations

1. Electrobun's official update documentation: <https://docs.electrobun.dev/electrobun/guides/updates/> and <https://docs.electrobun.dev/electrobun/apis/updater/>.
2. Electrobun's official Hutch guidance: <https://docs.electrobun.dev/electrobun/guides/hutch/>. The project pin must select a reproducible compatible toolchain rather than silently following a machine-global version.
3. GitHub's latest-release route intentionally omits prereleases. Supporting canary later would require a distinct contract and is not authorized by V0.21.