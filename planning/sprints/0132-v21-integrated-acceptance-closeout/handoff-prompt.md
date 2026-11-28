# Sprint 132 Handoff Prompt

You are the Builder for OpenAMX Sprint 132: V0.21 Integrated Acceptance and
Closeout.

## Read First

- `.agents/main.md`, `planning/state.md`, and `planning/decisions.md`.
- `planning/plan-openamxV21MasterSprintPlan.md` and every S132 packet file,
  especially requirements, blueprint, acceptance, and verification plan.
- S128 [`compatibility note`](../0128-v21-toolchain-update-host-contract/compatibility-note.md)
  and [`Builder evidence`](../0128-v21-toolchain-update-host-contract/builder-evidence.md).
- S129 [`acceptance`](../0129-v21-main-process-updater-integration/acceptance.md)
  and [`Builder evidence`](../0129-v21-main-process-updater-integration/builder-evidence.md).
- S130 [`acceptance`](../0130-v21-update-prompt-and-quit-safe-apply/acceptance.md)
  and [`Builder evidence`](../0130-v21-update-prompt-and-quit-safe-apply/builder-evidence.md).
- S131 [`Builder evidence`](../0131-v21-release-pipeline-and-documentation/builder-evidence.md)
  and the V0.21 section in `docs/releasing.md`.
- `desktop-app/src/bun/updater.ts`, `desktop-app/src/bun/updateApply.ts`,
  `desktop-app/src/bun/index.ts`, `desktop-app/src/shared/rpc.ts`,
  `desktop-app/electrobun.config.ts`, the focused desktop tests, and
  `scripts/release/**`/`tests/release.test.ts` as needed.

## Authority Gate

This packet is planning only. Before building or installing any app, obtain
separate Product Owner authorization.

The packaged loopback gate is a known blocker: S129 currently only accepts the
production GitHub base URL. Do not relax this gate silently. Obtain an
explicitly approved non-shippable loopback test path and prove ordinary
production builds still reject alternate hosts before running packaged
loopback tests; otherwise stop and record the block.

Use only local test artifacts and a server bound to loopback. No GitHub/public
host calls, release creation, publication, or production bundle mutation are
authorized by this sprint.

## Builder Task After Authorization

- Verify the pinned project toolchain in isolated `HUTCH_HOME`; do not treat
  the S131 global Hutch `0.28.2` preflight as the accepted `0.30.0` project
  pin.
- In a disposable account/profile, install a V0.20 pre-updater Setup artifact
  and upgrade it through the V0.21 Setup installer. Preserve identity and
  record that V0.20 has no update discovery.
- Build/install the updater-capable V0.21 test package with the approved
  loopback-only test mechanism. Serve a later stable test package's exact
  manifest, full archive, and checksum sidecar from a local static host.
- Test valid no-update, available update, Later/dismiss, consented download,
  preparation, apply/relaunch, network/download/checksum failure, quit-cancel
  staged retry, and post-relaunch state. Assert no full payload request before
  consent and no external network requests.
- Exercise Save All/Discard All/Cancel through the real quit guard. Do not
  bypass it or delete user data. Use injected apply-failure tests rather than
  damaging the installed app when native failure cannot be safely triggered.
- Inspect exact artifact names, bytes, hashes, metadata/checksum, no-patch
  policy, target bundle, and any authorized local assembled release inputs.
- Run the focused desktop/RPC/UI/release tests, typecheck, web build,
  `release:check`, and authorized read-only local `release:verify` checks.
- Record every raw result, first failure/retry, request log, tool/host version,
  preservation hash, and unavailable target. Submit a closeout recommendation
  with explicit residuals for separate Product Owner disposition.

## Stop Conditions

Stop if the packaged loopback gate cannot be safely enabled for test builds,
if any request escapes loopback, if temporary versions/config escape the
validation worktree, if the save/conflict guard is bypassed, if install/update
risks real user data, if an existing accepted release output would be
replaced, or if the workflow needs a source fix outside the approved
allowlist. Preserve failures and request a replan before continuing.

No release, publication, deployment, distribution, or platform certification
authority follows S132. V0.21 closeout is a separate Product Owner decision.
