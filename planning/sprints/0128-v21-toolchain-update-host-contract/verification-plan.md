# Sprint 128 Verification Plan

## Status and Authorization

Architect-prepared candidate. The current request authorizes preparation of
this planning packet only. Obtain separate Product Owner authorization before
editing implementation files, installing/updating the toolchain, running
builds, or creating execution artifacts.

The authorization must name the exact baseline commit, detached validation
worktree, changed-file allowlist, command/CWD matrix, artifact/evidence roots,
preservation and cleanup boundaries, retry/stop policy, and disposition
process. No baseline is selected by this document.

## Candidate Isolation and Preservation

- Use a new detached validation worktree selected at authorization time. Do
  not reuse or clean the primary worktree or any existing S128/S127 output.
- Set `HUTCH_HOME` to an isolated directory inside the validation worktree so
  an exact project pin does not mutate the user's shared Hutch installation.
- Capture the primary worktree status and hashes for existing
  `desktop-app/.hutch/`, `desktop-app/build/`, `desktop-app/artifacts/`,
  `desktop-app/dist/`, root `releases/`, and S121-S127 evidence before
  execution. Existing paths are user data; do not delete, overwrite, or
  restore them as cleanup.
- Record new raw evidence under
  `planning/sprints/0128-v21-toolchain-update-host-contract/artifacts/run-01/`
  in the validation worktree. Keep command output, raw failures, retries,
  toolchain versions, generated artifact inventories, and hashes.
- A direct Hutch build may write `desktop-app/build/` and
  `desktop-app/artifacts/` in the validation worktree only. Do not run
  `release:desktop`, `release:collect`, `release:publish`, or any command that
  creates or mutates a production release bundle.

## Candidate Commands

Run only after the exact commands are approved. Commands below are a proposal,
not execution authority. Recheck official documentation before selecting the
pair and adjust commands if the supported workflow has changed.

From `desktop-app/`, with the isolated `HUTCH_HOME`:

```powershell
hutch status
hutch self version
hutch electrobun prepare
```

From the repository root:

```powershell
bun run release:check
bun test tests/release.test.ts
bun run --cwd desktop-app typecheck
bun run --cwd desktop-app build:web
git diff --check
```

For artifact-contract verification, from `desktop-app/` in the validation
worktree only:

```powershell
hutch electrobun build --env=stable
```

Do not infer a packaged install/update result from this build. Do not access
`releases/latest/download` or any public release endpoint from tests. Hutch may
need network access to resolve its exact toolchain; any such dependency fetch
must be covered by execution authorization and recorded.

## Inspection and Assertions

For the exact pinned versions and each available native build:

- Record `hutch status`, Hutch CLI version, Electrobun version, host OS and
  architecture, and the resolved stable target.
- Inventory every file produced in `desktop-app/artifacts/`; preserve names,
  sizes, and SHA-256 hashes. Confirm the stable update manifest names the
  correct target, release version/hash, and full update payload.
- Validate the current checksum sidecar using the selected version's official
  schema, including the build hash, tar digest, and tar size where documented.
- Confirm target-bundle generation retains all required update files byte for
  byte and records each artifact in its manifest/checksum list.
- Use fixture-driven release assembly and an injected publisher client to
  verify original basenames survive and flatten uniquely. Duplicate basename
  fixtures must be rejected before upload. Tests must not call GitHub.
- Verify the selected patch policy. If patches are disabled, prove the
  documented setting is honored and full-bundle metadata remains valid. If
  enabled, enumerate and validate the complete supported patch trail in the
  latest release asset set; a single patch file is insufficient evidence.
- Record native targets not available for the approved host as
  `BLOCKED/UNAVAILABLE` or `NOT RUN`, never as passed.

## Raw Results and Stop Rules

Use `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` as separate raw
statuses. No retry cap is proposed; preserve each first failure and every
retry. Stop on a confirmed app-identity/channel regression, missing or
mismatched required artifact, unsafe/colliding filename, unsupported patch
policy, need to change an out-of-scope file, or any result that would require
real release/public-host activity. Request a replan or scope decision before
continuing past a stop condition.

The Builder recommendation, compatibility-note disposition, and Product Owner
acceptance remain separate records. This verification does not authorize a
real release, app installation, or platform certification.
