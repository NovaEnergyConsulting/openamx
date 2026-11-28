# Sprint 132 Blueprint: V0.21 Integrated Acceptance and Closeout

## Approach

1. Reconcile S128-S131 closeout records and identify the exact accepted source
   baseline at authorization time. Preserve the S128 Windows x64-only artifact
   result, S130 mocked UI/apply evidence, S131 fixture-only assembly evidence,
   and every earlier first failure/retry.
2. Before native work, prove the pinned project toolchain in isolated
   `HUTCH_HOME`. The S131 `release:check` global Hutch `0.28.2` observation is
   preflight only; it does not replace S128's Hutch `0.30.0` / Electrobun
   `2.0.7` pins.
3. Resolve the packaged loopback host gate as a formal entry decision. S129's
   coordinator compares embedded `baseUrl` to the production URL, so changing
   `release.baseUrl` to loopback alone will not enable checks. Obtain explicit
   approval for a validation-only path that is impossible to ship, and test
   that production builds still reject non-production hosts. If this cannot
   be done safely, stop and mark native host cases blocked pending a separate
   decision.
4. Prepare two isolated test lanes:
   - V0.20 bootstrap source at the accepted pre-S129 updater baseline,
     retaining the S128 toolchain/config contract and no application updater.
   - V0.21 source at the accepted S130/S131 implementation, with disposable
     synchronized stable version values and the approved local-host test
     mechanism.
   Keep all temporary test version/config edits, builds, installers, and
   host fixtures within the authorized validation worktrees/evidence root.
5. Build the V0.20 Setup installer, install it in a disposable profile, then
   install the V0.21 Setup installer over it. Verify the running app version,
   stable channel, identity, and expected bootstrap transition. Do not infer
   update discovery from V0.20; the updater is first present in V0.21.
6. Build/install a test V0.21 stable package that uses the controlled loopback
   host. Populate a local static host from a later test stable build's exact
   Hutch manifest, full `.tar.zst`, and checksum sidecar. Retain the installer
   separately. Record request logs and artifact hashes.
7. Exercise no-update and available states. For an available version, verify
   that Later, Escape, or dismiss causes no full payload request. Then consent,
   confirm the full bundle is requested/prepared, and apply through the
   existing asynchronous save/conflict guard. Verify native relaunch reports
   the later test version and no-update on its next check.
8. With a prepared update and dirty/conflicted tab, choose Cancel. Verify the
   workbench stays open and the update is still ready after the prompt closes.
   Retry through the persistent action; exercise Save All and Discard All only
   when the fixture can safely validate them. Never bypass the guard.
9. Inject local network/download/preparation failures and capture the
   app-preservation and retry behavior. Exercise apply rejection through an
   approved test seam/injected test where safely possible; do not corrupt an
   installed app to manufacture a native apply failure.
10. Inspect complete generated artifacts and any authorized local target
    bundles/assembly fixture. Run focused application/release suites, type
    checks, web build, and release preflight/verification within the approved
    matrix. Do not create or publish a production release.
11. Record per-platform raw status, evidence, and residuals. Recommend V0.21
    closeout only for the tested scope; keep untested hosts and public GitHub
    availability unverified. Submit separate Product Owner disposition.

## Test Version and Host Contract

Use distinct stable semantic versions for the disposable test packages, such
as `0.20.0` (pre-updater bootstrap), `0.21.0` (installed updater-capable
build), and `0.21.1` (available update target), unless the authorized test
fixture requires other versions. These values must be synchronized only in
validation copies, reviewed before build, and never treated as a production
release preparation.

The local static host must serve the exact generated stable manifest, its
referenced full payload, and checksum sidecar at original basenames. A test
server should record all paths requested and must be bound only to loopback.
Verify that the test binary embeds the authorized local URL and has the
validation-only gate enabled before launch. Verify separately that the normal
production build still embeds the GitHub URL and rejects a loopback host.

## Candidate File Allowlist

Primary scope: S132 planning/evidence and artifacts only. No product source
change is assumed by this acceptance sprint.

Conditional validation-only source/config changes, requiring explicit
Product Owner amendment before first edit:

- `desktop-app/src/bun/updater.ts` for an explicitly test-only loopback
  allowance, with a production rejection regression.
- `desktop-app/electrobun.config.ts` and synchronized package manifests only
  inside disposable test worktrees, for the loopback endpoint and temporary
  test versions; never transfer these modifications.
- A small local host/test harness under the S132 `artifacts/run-01/` root if
  needed and explicitly authorized.

Inspection/verification surfaces:

- `desktop-app/src/bun/updater.test.ts`
- `desktop-app/src/bun/updateApply.test.ts`
- `desktop-app/tests/rpc-contract-check.ts`
- `desktop-app/tests/ui/update-workflow.pw.ts`
- `tests/release.test.ts`
- `scripts/release/desktop.ts`, `scripts/release/assembly.ts`,
  `scripts/release/publish.ts`

Any product defect or fix outside the explicitly amended validation allowlist
requires a separate corrective scope; S132 closeout must not absorb it.

## Acceptance Evidence Matrix

| Evidence lane | Primary proof | Explicit limitation |
| --- | --- | --- |
| Unit/RPC/UI | State transitions, consent, failures, duplicate prevention, guard flows | Mock/harness only; not native install evidence |
| V0.20 bootstrap | V0.20 Setup install followed by V0.21 Setup upgrade | Test build only; no published release implied |
| V0.21 loopback update | Packaged install checks local host, defers, downloads on consent, applies/relaunches | Only the native host actually exercised |
| Artifact/release contract | Manifest/full archive/checksum and exact name/hash retention | Fixture/local validation; no public GitHub availability |
| Other OS/architectures | Native run only if separately available and authorized | Otherwise `BLOCKED/UNAVAILABLE` or `NOT RUN` |

## Risks and Stop Conditions

- The production-base-URL equality check currently blocks a local loopback
  configuration. This is a real preflight blocker unless resolved through an
  explicitly approved non-shippable test path. Do not weaken the production
  host contract as an incidental test change.
- V0.20 and V0.21 package versions are currently not prepared as a production
  release. All test version changes stay isolated and have no release
  authority.
- A failed local update can be distinguished from no-update only when the
  host returns valid matching metadata for the no-update case; a 404 is a
  check failure, not a no-update proof.
- Electrobun apply/relaunch success is proven only after the new packaged
  version is observed after restart. A resolved mock promise is not that proof.
- Stop on any external host request, real release activity, data loss,
  production-host bypass, product defect outside the amended scope, or
  inability to preserve the installed app on failure.
