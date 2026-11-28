# Sprint 131 Acceptance Criteria

Sprint 131 is complete when the release runbook accurately describes the
accepted V0.21 stable update contract and the automated release tests confirm
that required update assets remain intact through assembly and publication
preflight. No release is created or published by S131.

## Entry and Scope

- S128 and S130 are ACCEPTED/CLOSED WITH RECORDED RESIDUALS, and S129 is
  accepted/closed; the accepted S128 artifact policy and S130 user contract
  control this sprint.
- Separate Product Owner authorization names the exact baseline, validation
  worktree, changed-file allowlist, command/CWD matrix, evidence roots,
  preservation/cleanup boundaries, retry/stop rule, and residual disposition
  process.
- Documentation changes are limited to `docs/releasing.md`; any test change
  is limited to the approved `tests/release.test.ts` path. Release
  implementation changes require a separate scope amendment.

## Release Documentation

- `docs/releasing.md` names the exact stable host URL and correctly explains
  GitHub `/releases/latest/download` excludes drafts and prereleases.
- The document explains the stable update manifest, its referenced full
  `.tar.zst`, required checksum JSON sidecar, and separate native Setup
  installer using the pinned toolchain's filename patterns.
- The accepted patch policy is explicit: `release.generatePatch: false`,
  full-bundle-only updates, and no patch-chain publication requirement.
- The bundle/assembly/publish steps preserve original basenames and bytes;
  update assets are retained alongside target artifacts, and the publisher
  rejects flat basename collisions before remote operations.
- The V0.20-to-V0.21 bridge is clear: V0.20 installs require a normal V0.21
  installer upgrade before native update discovery is available.
- User behavior is accurately summarized: startup and manual checks,
  Update/Later consent, no download on Later/dismiss, and apply only after
  preparation and save/conflict approval.
- The existing human release review and publication process, license/notices
  gate, draft-only automated publisher, and separate real-release
  authorization are preserved.
- Documentation distinguishes verified evidence from unverified work:
  native updater artifact generation is evidenced on Windows x64 only;
  S130 UI and state-machine verification used mocks/harness; installed-app,
  live-host, other-platform, and public GitHub availability remain unverified.

## Pipeline Verification

- Focused release tests pass for stable manifest/full payload/checksum
  verification, byte/name retention through assembly, and duplicate flat-name
  rejection before any client/remote operation.
- Any new test is justified by a named requirement that existing S128 tests do
  not cover. No public GitHub API, update URL, or release publication is
  invoked.
- No production release bundle is created, overwritten, or deleted. Existing
  release safeguards and provenance/checksum/draft-only behavior remain
  unchanged.
- `git diff --check` passes. Exact command output, first failures/retries,
  path allowlist, preservation results, and residuals are in S131 Builder
  evidence.
- S131 Builder recommendation and separate Product Owner disposition are
  recorded independently. No publication, deployment, or platform
  certification authority follows S131.
