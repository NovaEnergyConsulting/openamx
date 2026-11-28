# Sprint 132 Acceptance Criteria

Sprint 132 is complete when integrated V0.21 update behavior has been tested
against a controlled local host on each available, separately authorized
native host; the V0.20 installer bootstrap is exercised; release artifact
integrity is inspected; and residuals plus a V0.21 closeout recommendation
are recorded. This sprint does not publish a release or certify untested
platforms.

## Entry and Authorization

- S128, S129, S130, and S131 are ACCEPTED/CLOSED WITH RECORDED RESIDUALS.
- Separate Product Owner authorization specifies the exact S131 baseline,
  pre-updater V0.20 source baseline, disposable native environment/profile,
  worktrees, allowed test-only loopback/version mechanism, changed-file
  allowlist, command/CWD matrix, artifact/evidence roots, preservation and
  cleanup, retry/stop policy, and disposition process.
- The packaged-loopback gate is proven to permit the authorized test host only
  in the non-production test build. A normal production build still embeds
  the stable GitHub URL and rejects a non-production host.
- If that test-only gate cannot be proven safe, mark local packaged-host
  acceptance `BLOCKED/UNAVAILABLE`, request an architecture decision, and do
  not relax the production gate.

## V0.20-to-V0.21 Bootstrap

- A native V0.20 Setup installer built from the accepted pre-updater code is
  installed in a disposable profile.
- Installing the V0.21 Setup installer upgrades the same app identity/channel
  in that profile and launches the updater-capable V0.21 test build.
- Evidence confirms V0.20's lack of update discovery and the normal installer
  bridge; no V0.20 binary is claimed to self-update.
- No primary user profile, user data, accepted release bundle, or production
  package version is modified. Test versions remain local-only.

## Packaged V0.21 Update Flow

- A packaged stable V0.21 test installation verifies a valid no-update
  response without treating a 404/check failure as up-to-date.
- A valid later stable test manifest produces one available-version offer.
- Later, Escape, or close dismisses the offer and produces no full-payload
  request. Only explicit Update consent requests/downloads the full
  `.tar.zst` payload; no delta patch is required under `generatePatch:false`.
- The full payload and checksum are accepted by the native updater, preparation
  reaches ready, and apply/relaunch starts the later test version. After
  relaunch, the app reports the new version and no available update for the
  current host manifest.
- Network, malformed/missing payload, and checksum/preparation failures leave
  the currently installed app usable and do not claim update success.
- Apply failure is covered through a safe injected/test seam where available;
  do not damage a real installation to force failure. If no safe integrated
  failure path exists, retain it as an explicit residual tied to the S130
  injected apply-failure evidence.

## Quit Guard and Staged Retry

- With a staged ready update and unsaved/conflicted tab, Cancel keeps the app
  open, keeps the tab/workbench intact, preserves ready update state, and
  leaves a persistent `Restart to update` action.
- Selecting Restart to update repeats the existing guard. Save All proceeds
  only when safe; Discard All proceeds only after explicit user selection;
  save/conflict failures do not call apply.
- After consented Save/Discard and successful apply, native relaunch reaches
  the target version. The one-shot permit cannot authorize a later unrelated
  quit or close event.

## Release Artifact and Regression Verification

- The exact stable update manifest, referenced full payload, checksum
  sidecar, and separate installer are inspected with original basenames,
  expected metadata, byte sizes, and hashes.
- S128's explicit full-bundle policy is confirmed; no patch file or patch
  reference is required or published.
- Focused release tests pass for metadata/checksum validation, byte/name
  retention through assembly, and duplicate flat asset rejection before
  remote operations.
- Run focused desktop updater/apply tests, RPC contract check, desktop
  typecheck, configured tests, web build, root release tests, and
  `release:check` on the authorized matrix. Run read-only `release:verify`
  only against a local test assembly when present and authorized.
- No test contacts GitHub or the public updater URL. No real release, draft,
  tag, publication, deployment, or public asset mutation occurs.

## Closeout and Residuals

- Record exact commands, outputs, first failures/retries, toolchain/host
  versions, request logs, artifact hashes, preservation audit, all native
  targets attempted, and unavailable routes in S132 Builder evidence.
- Distinguish injected tests, browser harness, packaged native update, and
  actual production release evidence. Do not merge these evidence classes.
- Windows x64 is the only S128 native updater-artifact host evidenced to date;
  other platforms remain unverified unless S132 separately runs them.
- Builder recommendation and separate Product Owner disposition are recorded
  independently. V0.21 may be recommended for closeout only at demonstrated
  scope, with all residuals named.
- No release, publication, deployment, distribution, or platform
  certification authority follows S132.
