# Sprint 128 Handoff Prompt

You are the Builder for OpenAMX Sprint 128: V0.21 Toolchain and Update-Host
Contract.

## Read First

- `.agents/main.md`, `planning/state.md`, and `planning/decisions.md`.
- `planning/plan-openamxV21MasterSprintPlan.md` and every document in this
  S128 directory, especially requirements, blueprint, acceptance, and the
  verification plan.
- Current desktop configuration and identity:
  `desktop-app/hutch.config.ts`, `desktop-app/electrobun.config.ts`,
  `desktop-app/app-metadata.ts`, and `desktop-app/package.json`.
- Current release path and tests: `scripts/release/desktop.ts`,
  `scripts/release/assembly.ts`, `scripts/release/publish.ts`,
  `scripts/release.ts`, and `tests/release.test.ts`.
- Official [Hutch](https://docs.electrobun.dev/electrobun/guides/hutch/) and
  [Updates](https://docs.electrobun.dev/electrobun/guides/updates/) guides.
  Recheck current stable compatibility and artifact requirements before
  selecting versions.

## Authority Gate

This packet is Architect-prepared planning, not implementation/build
authorization. Before the first source edit, toolchain installation, or
verification command, obtain separate Product Owner authorization for the
exact baseline, detached worktree, changed-file allowlist, command/CWD matrix,
artifact/evidence roots, preservation boundaries, retry/stop rules, and
residual disposition process.

Use a new validation worktree and isolated `HUTCH_HOME`. Preserve all primary
worktree changes, generated outputs, release artifacts, and prior sprint
history. Do not create or publish a release or call a public GitHub release
endpoint.

## Builder Task After Authorization

- Revalidate the latest compatible stable Hutch/Electrobun pair and pin exact
  versions with the supported Hutch project pragma and
  `electrobun.version` setting.
- Configure the stable GitHub Releases latest-download URL without changing
  app name, identifier, version source, or stable channel.
- Build only in the authorized isolated worktree on available native hosts.
  Inspect all required manifest, full payload, checksum, installer, and
  optional patch artifacts.
- Trace required assets through desktop bundle generation, release assembly,
  and flat-name publisher behavior. Add focused fixture tests and reject
  missing, renamed, mismatched, or duplicate assets.
- Decide and record the patch policy. Prefer an explicit supported full-bundle
  policy if patch-chain retention cannot be proven. If neither policy is
  safely demonstrated, stop and request a decision; do not proceed to Sprint
  129.
- Complete `compatibility-note.md` and record exact raw outcomes and
  residuals. Keep publication, updater runtime, and cross-platform claims out
  of this sprint.

## Stop Conditions

Stop on an unverified toolchain pair, app identity/channel change, missing or
mismatched update asset, unsafe basename collision, absent patch-chain route,
need to edit an out-of-scope path, or any need for public release activity.
Preserve the first failure and every retry; there is no retry cap, but retries
do not authorize expansion past a stop condition. Request a scope decision
before continuing.

Sprint 129 may start only after the compatibility note is complete and
separately dispositioned. No release, publication, deployment, package-version
change, or platform certification authority follows S128.
