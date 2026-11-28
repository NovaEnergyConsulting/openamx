# Sprint 131 Handoff Prompt

You are the Builder for OpenAMX Sprint 131: V0.21 Release Pipeline and
Documentation.

## Read First

- `.agents/main.md`, `planning/state.md`, and `planning/decisions.md`.
- `planning/plan-openamxV21MasterSprintPlan.md` and every S131 packet
  document, especially requirements, blueprint, acceptance, and verification
  plan.
- S128 [`compatibility note`](../0128-v21-toolchain-update-host-contract/compatibility-note.md)
  and [`Builder evidence`](../0128-v21-toolchain-update-host-contract/builder-evidence.md).
- S130 [`acceptance criteria`](../0130-v21-update-prompt-and-quit-safe-apply/acceptance.md)
  and [`Builder evidence`](../0130-v21-update-prompt-and-quit-safe-apply/builder-evidence.md).
- `docs/releasing.md`, `scripts/release/desktop.ts`,
  `scripts/release/assembly.ts`, `scripts/release/publish.ts`, and
  `tests/release.test.ts`.

## Authority Gate

This packet is planning only. Obtain separate Product Owner authorization to commence implementation before editing documentation or
running tests.

Preserve all S128/S130 raw results, ignored release outputs, and existing
accepted bundles. Do not call GitHub, create a draft, publish a release, or
access the public updater URL.

## Builder Task After Authorization

- Update only `docs/releasing.md` to explain the accepted V0.21 release/update
  contract: stable latest-download host, manifest/full payload/checksum
  assets, explicit no-patch policy, artifact name retention, V0.20 installer
  bridge, consent behavior, and human publication workflow.
- Keep every statement aligned with accepted evidence. Native artifact
  inspection is proven only on Windows x64; installed-app and live-host update
  behavior, other platforms, and public asset availability remain unverified.
- Run the focused release test suite using local fixtures/injected clients.
  Confirm coverage for update metadata/checksum, assembly byte/name
  retention, and publisher duplicate-name rejection before remote operations.
- Add only a focused `tests/release.test.ts` case if an explicit requirement
  is not already covered. Do not modify release implementation without an
  approved scope amendment.
- Preserve license/notices, immutable bundle, provenance, checksum, draft-only,
  and manual-publication safeguards.
- Record exact commands, raw outputs, retries, hashes, preservation audit,
  and residuals in the authorized S131 evidence root.

## Stop Conditions

Stop if runbook accuracy requires an unapproved product/toolchain/identity
change, a release-code fix outside the allowlist, a public endpoint call, a
real release/draft, or mutation/deletion of retained release data. Preserve
all first failures and retries; there is no retry cap, but retries do not
authorize scope expansion. Request a separate amendment before continuing.

S132 owns installed-app update acceptance and V0.21 integrated closeout. No
release, publication, deployment, or platform-certification authority follows
from S131.
