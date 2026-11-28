# Sprint 131 Requirements: V0.21 Release Pipeline and Documentation

## Document Status

Architect-prepared sprint packet. Sprint 128 and Sprint 130 are
ACCEPTED/CLOSED WITH RECORDED RESIDUALS; Sprint 129 is likewise closed. This
packet authorizes planning only. Obtain separate exact Product Owner
execution authorization before editing implementation or running verification.

## Goal

Bring the operator-facing release runbook up to date for V0.21's stable
Electrobun updater and verify that the accepted desktop release pipeline
retains the complete update asset contract chosen in S128. The runbook must
explain the stable GitHub host, artifact retention, user consent, the one-time
V0.20-to-V0.21 installer bridge, and the existing draft/review/publish process
without implying release or platform approval.

## Inputs and Authority

- V0.21 product contract and S131 sequence:
  [`plan-openamxV21MasterSprintPlan.md`](../../plan-openamxV21MasterSprintPlan.md).
- Accepted update artifact policy and platform residuals:
  [`S128 compatibility note`](../0128-v21-toolchain-update-host-contract/compatibility-note.md)
  and [`S128 Builder evidence`](../0128-v21-toolchain-update-host-contract/builder-evidence.md).
- Accepted app updater behavior and mock-only verification residuals:
  [`S130 acceptance`](../0130-v21-update-prompt-and-quit-safe-apply/acceptance.md)
  and [`S130 Builder evidence`](../0130-v21-update-prompt-and-quit-safe-apply/builder-evidence.md).
- Release runbook: `docs/releasing.md`.
- Current release verification and publication: `scripts/release/desktop.ts`,
  `scripts/release/assembly.ts`, `scripts/release/publish.ts`, and
  `tests/release.test.ts`.
- S128 established the exact Hutch `0.30.0` / Electrobun `2.0.7` pair,
  stable host URL, and full-bundle-only policy. Do not reselect these in S131
  unless current documentation reveals a blocking incompatibility and a
  separately approved change is obtained.

## In Scope

- Update `docs/releasing.md` with the V0.21 stable update host and stable-only
  GitHub `/releases/latest/download` semantics.
- Document the exact V0.21 update artifact roles and stable filename patterns:
  update manifest, manifest-referenced full `.tar.zst`, checksum JSON
  sidecar, and native Setup installer. State that S128 selected
  `release.generatePatch: false`; no patch trail is expected or published.
- Explain byte/name retention through target bundle, assembly, and flat
  GitHub assets. Preserve existing provenance, hashes, duplicate-basename
  rejection, immutable accepted bundles, draft-only publisher, and human
  review/publication steps.
- Explain app behavior at an operator level: one launch check and manual
  check, Update/Later consent, no download before consent, and native apply
  only after preparation and the existing save/conflict guard.
- Explain bootstrap: V0.20 installations do not contain updater discovery;
  users first install V0.21 normally, then can receive later stable updates.
- Re-run focused release fixture tests for update artifact verification,
  assembly retention, and publisher basename uniqueness. Add tests only when
  the existing contract does not prove a documented requirement.
- Record evidence and residuals accurately, including that S128 native
  artifact verification covered Windows x64 only and S130 used mocks/UI
  harness rather than an installed updater.

## Out of Scope

- Real release creation, publication, tag changes, public-host validation,
  GitHub API calls, asset mutation, or deployment.
- Changes to app identity, package version, toolchain pins, stable host,
  updater behavior/UI, `release.generatePatch`, licensing, or signed-build
  policy.
- Broad native/platform certification or installed-app update testing; S132
  owns integrated acceptance.
- Changes to the CLI, VS Code extension, AMX language/runtime, or unrelated
  release documentation.

## Constraints

- Keep GitHub latest-release semantics precise: drafts and prereleases are not
  the stable update target; only a human-published stable release is eligible.
- Preserve the exact artifact basenames from Hutch output through the bundle,
  assembly, and flat publisher assets. Never omit or rename the manifest,
  full payload, or checksum sidecar.
- Tests must use fixtures/injected clients and must not contact a public GitHub
  endpoint or publish a release.
- Do not infer platform support from packaging checks. Record only the S128
  Windows x64 result; other target rows remain unverified unless separately
  evidenced.
- Treat a real published GitHub route check as a separate explicitly
  authorized operator action, outside automated verification.
- Preserve all historical S128/S130 failures, retries, and residuals in their
  original evidence; later documentation or test passes do not rewrite them.
