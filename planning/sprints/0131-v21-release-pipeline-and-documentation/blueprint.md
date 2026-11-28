# Sprint 131 Blueprint: V0.21 Release Pipeline and Documentation

## Approach

1. Read the S128 compatibility note, S130 accepted evidence, and current
   `docs/releasing.md`. Treat S128's verified pins and no-patch policy as the
   controlling contract; do not copy planning-time candidate language.
2. Add a focused V0.21 section to `docs/releasing.md` near the desktop build,
   collect, and publish workflow. Keep the existing runbook structure and
   release controls intact.
3. Document the stable host:
   `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download`.
   Explain that GitHub's latest route selects the latest published stable
   release, not drafts or prereleases. Do not describe it as a tested live
   endpoint; S128 did not call it.
4. Name the artifact roles and exact pattern shapes established by S128:
   `stable-<platform>-<arch>-update.json`, the referenced
   `stable-<platform>-<arch>-*.tar.zst`, and
   `stable-<platform>-<arch>-checksum.json`. Explain `release.generatePatch:
   false`, so full-bundle download is the supported V0.21 path and patch
   files are not expected. The Setup installer remains a separate bootstrap
   artifact.
5. Trace and document the existing pipeline: native build -> immutable target
   bundle with manifest/evidence/SHA256SUMS/COMPLETE -> release assembly under
   target paths -> publisher flat basenames. Explain that all required update
   assets remain byte-identical and publisher rejects duplicate basenames
   before remote operations.
6. Document the V0.20-to-V0.21 bridge and runtime consent policy: V0.20 must
   install V0.21 normally; from V0.21, launch/manual checks may notify, but
   only Update downloads, Later does not, and apply follows preparation plus
   save/conflict approval. Keep the operator publication process human-owned.
7. Re-run the focused root release tests using local fixtures. Review the
   existing assertions for update manifest/checksum/full payload validation,
   assembly byte/name retention, and duplicate flat-name preflight. Extend
   tests only for a demonstrated coverage gap; do not change production code
   solely to restate existing evidence.
8. Check the S128 native inventory and S130 evidence references. State Windows
   x64 as the only native updater artifact build inspected; UI/mocked behavior
   is not installed-app or cross-platform evidence.
9. Record exact commands, outputs, doc review, test results, changes, and
   residuals in S131 Builder evidence. No public host, release, or production
   output is touched.

## Required Runbook Topics

- Stable-only host URL and latest-release behavior.
- Required updater files and the accepted full-bundle-only patch policy.
- Original filenames, checksums, target bundle, assembly, and flat publisher
  asset handling.
- Manual check/launch check, consent-before-download, and quit-safe apply.
- V0.20 installer bootstrap into V0.21.
- Human draft review/publication, no automated public GitHub calls, and
  separate real-release authorization.
- Explicit platform and installed-app evidence limitations.

## Candidate File Allowlist

Primary documentation and evidence:

- `docs/releasing.md`
- `planning/sprints/0131-v21-release-pipeline-and-documentation/requirements.md`
- `planning/sprints/0131-v21-release-pipeline-and-documentation/blueprint.md`
- `planning/sprints/0131-v21-release-pipeline-and-documentation/acceptance.md`
- `planning/sprints/0131-v21-release-pipeline-and-documentation/verification-plan.md`
- `planning/sprints/0131-v21-release-pipeline-and-documentation/handoff-prompt.md`
- `planning/sprints/0131-v21-release-pipeline-and-documentation/builder-evidence.md`
- S131 `artifacts/run-01/**`

Conditional test-only addition, after approval if a real gap is found:

- `tests/release.test.ts`

Do not change release implementation files by default. If a concrete defect in
assembly/publisher behavior is discovered, stop, preserve evidence, and request
an amended allowlist and scope decision before editing `scripts/release/**`.

## Risks and Questions

- The runbook is a production-operator document; distinguish static-host
  configuration from actual public GitHub asset availability.
- S128 verified generated artifacts and fixture-based name retention but did
  not execute production release collection/publication. Do not overstate
  production pipeline evidence.
- S130 passes mocked updater and browser-harness flows only. Do not describe
  an installed update or native relaunch as proven.
- Other OS/architecture bundles remain unverified. Avoid treating the update
  host or artifact contract as platform certification.
- License/notices readiness and explicit release authorization remain existing
  publication gates and must not be weakened.

## Non-Goals

- Do not create a real release draft, publish a release, or validate the
  public latest-download endpoint.
- Do not add canary support, delta patches, another update host, or update
  scheduling.
- Do not change the S128 or S130 implementation contracts.
