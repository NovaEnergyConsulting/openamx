# Sprint 132 Requirements: V0.21 Integrated Acceptance and Closeout

## Document Status

Architect-prepared sprint packet. S128-S131 are recorded ACCEPTED/CLOSED WITH
RECORDED RESIDUALS. This packet authorizes planning only; obtain separate
Product Owner authorization for exact test builds, commands, worktrees,
outputs, and any test-only updater-host mechanism before execution.

## Goal

Establish integrated evidence that the stable update workflow works from a
packaged installation through discovery, user consent, download/preparation,
quit-safe apply, and relaunch on available native hosts. Verify the V0.20 to
V0.21 installer bootstrap and a later V0.21 stable update using a controlled
loopback/static host. Close V0.21 with explicit residuals; do not publish a
release or infer unavailable platform support.

## Inputs and Authority

- V0.21 product contract and S132 sequence:
  [`plan-openamxV21MasterSprintPlan.md`](../../plan-openamxV21MasterSprintPlan.md).
- S128 pinned toolchain and update-host contract:
  [`compatibility note`](../0128-v21-toolchain-update-host-contract/compatibility-note.md)
  and [`Builder evidence`](../0128-v21-toolchain-update-host-contract/builder-evidence.md).
- S129 accepted main-process state/RPC contract:
  [`acceptance`](../0129-v21-main-process-updater-integration/acceptance.md)
  and [`Builder evidence`](../0129-v21-main-process-updater-integration/builder-evidence.md).
- S130 accepted consent/apply/quit behavior:
  [`acceptance`](../0130-v21-update-prompt-and-quit-safe-apply/acceptance.md)
  and [`Builder evidence`](../0130-v21-update-prompt-and-quit-safe-apply/builder-evidence.md).
- S131 runbook and release-fixture verification:
  [`docs/releasing.md`](../../../docs/releasing.md) and
  [`Builder evidence`](../0131-v21-release-pipeline-and-documentation/builder-evidence.md).
- Runtime/release surfaces: `desktop-app/src/bun/updater.ts`,
  `desktop-app/src/bun/updateApply.ts`, `desktop-app/src/bun/index.ts`,
  `desktop-app/src/shared/rpc.ts`, `desktop-app/electrobun.config.ts`,
  `scripts/release/desktop.ts`, `scripts/release/assembly.ts`,
  `scripts/release/publish.ts`, and `tests/release.test.ts`.

## Confirmed Product Contract

- Production updates use stable GitHub Releases only. The production host is
  `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download`.
- S128 pinned Hutch `0.30.0` / Electrobun `2.0.7` and accepted
  `release.generatePatch: false`; updater packages must retain the update
  manifest, full `.tar.zst`, checksum JSON, and separate Setup installer.
- V0.20 does not contain update discovery and must be upgraded by installing
  V0.21 normally. From V0.21 onward, checks occur once at launch and by
  explicit user request. Download starts only after Update consent.
- Later/dismiss does not download. Apply waits for preparation and the existing
  save/conflict guard. Canceling the guard keeps the app open and retains a
  persistent restart action.
- Electrobun owns verification, preparation, transactional replacement, and
  relaunch. No app-level replacement or forced quit is allowed.
- S128 verified native update artifact generation only on Windows x64. S129
  and S130 used injected/mocked tests; neither established installed-app
  update behavior. S131 added no native or production assembly evidence.

## In Scope

- Test a normal V0.20 native Setup installation followed by a normal V0.21
  Setup installer upgrade in a disposable host/profile.
- Test a packaged V0.21 build against a controlled loopback/static host for:
  valid no-update, available update, Later/dismiss without payload download,
  explicit consent, full-bundle preparation, successful apply/relaunch,
  network/download/preparation failures, and retryable staged update.
- Test cancellation of the unsaved/conflicted-tab guard after preparation:
  the app stays open, staged state is retained, and the persistent restart
  action re-runs the guard; cover Save All and Discard All when safely
  available.
- Verify exact update metadata/payload/checksum files and target bundle /
  assembled release inputs for a local test fixture or authorized clean
  native build. Preserve original names, bytes, hashes, and the S128 no-patch
  policy.
- Run focused updater/apply/RPC/UI tests, desktop typecheck/test/web build,
  root release tests, and `release:check`/read-only release verification where
  available and authorized.
- Record per-host evidence, unavailable targets, residuals, and a Builder
  recommendation for V0.21 closeout. Keep Product Owner disposition separate.

## Critical Test-Host Gate

The accepted S129 coordinator rejects any embedded base URL other than the
production GitHub URL. A packaged build whose `release.baseUrl` points to
loopback is therefore currently classified as unsupported before it checks.
S132 must resolve this constraint before attempting packaged loopback tests:

- Obtain explicit approval for a narrowly scoped, validation-only loopback
  test mechanism that cannot be enabled in production builds, and prove that
  ordinary production configuration still rejects non-production hosts; or
- Stop and request a separate product/architecture decision if no safe
  test-only mechanism can be established.

Do not relax the production host gate silently, leave a test override in a
release binary, or claim the loopback test passed when the packaged app never
made the local request. Any test-only source/config modification requires an
explicit allowlist amendment and remains isolated to disposable validation
worktrees.

## Out of Scope

- Creating or publishing a GitHub release, moving tags, mutating public assets,
  or making public updater/API requests. Public route validation is a separate
  explicitly authorized operator action.
- Changing the production stable host, identity, release version, toolchain,
  checksum policy, full-bundle policy, consent contract, or license terms.
- Broad certification of platforms not actually exercised on native hosts.
- Destructive cleanup, uninstall with data deletion, or changes to a user's
  real profile/data. Use disposable environments and retain test outputs.
- Unrelated source fixes. Any discovered product defect or test-host
  enablement beyond the approved allowlist stops for replan/amendment.

## Constraints

- Use isolated detached worktrees and `HUTCH_HOME`; the globally selected
  Hutch observed by S131 (`0.28.2`) is not the accepted project pin.
  Confirm project Hutch `0.30.0` and Electrobun `2.0.7` in the isolated store.
- No test operation may contact the public GitHub host. Record local server
  request logs and verify the embedded test URL before launch.
- Keep V0.20 and V0.21 test versions as temporary, synchronized stable
  versions in validation worktrees only. They are test packages, not released
  versions; do not transfer temporary manifest/config edits to the primary
  worktree or create a release tag/draft.
- Run native installation/update only in a disposable VM, account, or profile.
  Do not remove application data during cleanup unless separately authorized.
- A successful build, mock test, UI harness, local artifact check, or single
  native host is not platform certification.
- Preserve all historical raw statuses, failures/retries, and S128-S131
  residuals. Record unavailable checks as `BLOCKED/UNAVAILABLE` or `NOT RUN`.
