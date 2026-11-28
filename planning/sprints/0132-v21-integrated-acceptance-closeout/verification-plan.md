# Sprint 132 Verification Plan

## Status and Authorization

Architect-prepared candidate. S128-S131 are accepted/closed with recorded
residuals. S132 remains unexecuted and separately gated. This document does
not authorize source changes, native package installation, public endpoint
requests, release assembly, or publication.

Before execution, obtain Product Owner authorization for exact source
baselines (pre-updater V0.20 and accepted S130/S131 V0.21), worktree paths,
disposable installation environment, test-only loopback mechanism, temporary
stable test versions, file allowlist, command/CWD matrix, output roots,
preservation/cleanup, retry/stop rules, and residual disposition.

## Mandatory Loopback Preflight

S129 `createUpdaterCoordinator` compares `Updater.getLocalInfo().baseUrl`
with the production GitHub URL and reports configuration unsupported on
mismatch. Therefore a test build with only `release.baseUrl` changed to
loopback will not check. Before attempting integrated E2E:

1. Demonstrate, using the pinned Electrobun `2.0.7` build, the actual URL
   embedded in a packaged test binary and the coordinator's current gate.
2. Obtain separate explicit approval for a validation-only loopback mechanism
   that is not enabled/available in production builds; include a regression
   proving ordinary production builds reject loopback/foreign hosts.
3. Build and inspect both test and production-config binaries. Confirm the
   test binary points only to `127.0.0.1`/`localhost`, and the ordinary
   production binary still points to GitHub stable.
4. If the approval or production-isolation proof is unavailable, stop before
   packaging/installing, record local-host E2E as `BLOCKED/UNAVAILABLE`, and
   request a separate decision. Do not use public GitHub as a substitute.

## Isolation and Preservation

- Use detached worktrees for the pre-updater S128/S129 baseline and accepted
  S130/S131 source. Confirm exact commits at authorization time; do not infer
  branch state from the planning ledger.
- Set an isolated `HUTCH_HOME`; run `hutch status`, `hutch self version`, and
  `hutch electrobun prepare` to verify project Hutch `0.30.0` and Electrobun
  `2.0.7`. Do not rely on S131's global Hutch `0.28.2` preflight result.
- Use a disposable VM, test account, or isolated OS profile for installer
  setup/upgrade. Capture pre/post app identity, version, channel, and test
  user-data observations. Never uninstall with data deletion unless separately
  authorized.
- Temporary test versions/configuration and test host files must remain in
  validation worktrees or
  `planning/sprints/0132-v21-integrated-acceptance-closeout/artifacts/run-01/`.
  Do not transfer them to the primary checkout or prepare production release
  manifests.
- Preserve primary `desktop-app/.hutch/`, `build/`, `artifacts/`, `dist/`,
  `test-results/`, `releases/`, all S121-S131 evidence, and historical V0.20
  files. Retain worktrees and outputs unless cleanup is separately approved.
- Local updater server binds only to loopback, logs every request, serves only
  test artifacts, and does not proxy/redirect to a public host. Automated
  tests never call GitHub or the production update URL.

## Candidate Version/Build Matrix

Use synchronized stable-semver values only in disposable worktrees. Candidate
values are `0.20.0` for the pre-updater base, `0.21.0` for the updater-capable
installed app, and `0.21.1` for the local update target. Confirm no release
version/tag exists or is being created; these are local test values only. If
version tooling requires different values, get them approved and record them
before building.

| Build | Source | Purpose | Host URL |
| --- | --- | --- | --- |
| V0.20 test installer | Accepted pre-S129 updater baseline with S128 toolchain | Install old app with no updater | No updater request expected |
| V0.21 test installer | Accepted S130/S131 source, validation-only test host gate | Normal installer bridge and installed updater | Loopback only |
| V0.21.1 test update | Same updater source, later test version | Full-bundle update payload | Loopback only |
| Production-config audit build | Accepted source, no test override | Verify shipped host/gate remain stable GitHub-only | Public URL embedded; do not run public check |

All test builds use `hutch electrobun build --env=stable` in isolated
worktrees after the approved test-only config/version preparation. Preserve
build and artifact outputs; do not use `release:desktop` if it would create or
overwrite a production `releases/<version>` bundle.

## Candidate Commands

Run only after exact approval. From repository root in the authorized worktree:

```powershell
bun install --frozen-lockfile
bun run release:check
bun test tests/release.test.ts
```

From `desktop-app/`, with isolated `HUTCH_HOME`:

```powershell
bun install --no-save --no-lockfile
hutch status
hutch self version
hutch electrobun prepare
bun run build:web
hutch electrobun build --env=stable
bun test src/bun/updater.test.ts src/bun/updateApply.test.ts
bun run tests/rpc-contract-check.ts
bun run typecheck
bun run test
bun run test:ui -- tests/ui/update-workflow.pw.ts
```

From root, for a local accepted test assembly only:

```powershell
bun run release:verify <authorized-test-version>
git diff --check
```

Command lists are candidates and must be reconciled with the exact worktrees
and artifact paths in the approval. The Playwright workflow harness is not
native install/update evidence. Do not run `release:publish`, create a tag,
create a public draft, or use `--allow-partial` to force a result.

## Local Host Scenarios

Use a loopback-only static server with request logging. Serve exact files from
the test artifacts without renaming them. Expected updater files are the
stable update manifest, referenced full `.tar.zst`, and fixed checksum JSON;
`release.generatePatch: false` means no patch file is expected.

1. **V0.20 bootstrap:** Install the pre-updater `0.20.0` Setup artifact in a
   disposable profile; install the updater-capable V0.21 Setup artifact over
   it. Confirm the same app identity/stable channel and the new installed
   version. Do not expect V0.20 to query the update host.
2. **No update:** Serve valid stable metadata for the installed V0.21 version
   with matching checksum/payload. Confirm the UI remains quiet and no full
   payload download occurs. A 404 is a failure case, not this case.
3. **Available / Later:** Serve valid V0.21.1 metadata. Confirm the exact
   version prompt; choose Later, close, and Escape in separate runs. Assert
   no request for the full payload after dismissal.
4. **Consent / apply:** Choose Update, observe one full payload download and
   successful preparation, then allow apply with no dirty tabs. Confirm the
   process relaunches and the installed version is V0.21.1.
5. **Quit cancellation / staged retry:** With a ready update and dirty or
   conflicted tab, invoke restart and select Cancel. Confirm the app remains
   open, tab/workbench stays intact, updater still reports ready, and the
   persistent restart action remains. Retry through the same save/conflict
   guard; exercise Save All and Discard All if safely supported.
6. **Network/download/preparation failure:** Stop the local server for network
   failure; use missing, malformed, or checksum-mismatched local artifacts for
   failure cases. Confirm old app remains usable and no false success appears.
7. **Apply failure:** Prefer the approved injected `applyUpdate` failure seam
   and verify permit clearing/retry. Do not sabotage an installed app or
   corrupt its installation to manufacture native apply failure. If no safe
   integrated fault injection exists, record the remaining gap and cite S130
   injected apply-failure evidence without upgrading it to native evidence.
8. **Post-relaunch check:** Keep the host manifest at V0.21.1 and confirm the
   relaunched app reports up-to-date. Capture server logs showing all requests
   stayed on loopback and no full payload was fetched before consent.

## Artifact and Release Verification

- Record SHA-256, byte size, exact basename, target, version, app hash, and
  checksum fields for each generated manifest/payload/checksum/installer.
- Inspect the target bundle manifest/evidence/SHA256SUMS/COMPLETE and any
  authorized assembled test release. Verify exact required asset presence and
  no renames/drops or duplicate flat basenames.
- Run root release tests for metadata/checksum validation, assembly retention,
  publisher collision preflight, and existing provenance/draft-only behavior.
- `release:check` is a preflight only. `release:verify` is read-only and must
  target only an authorized local test assembly; a license/notices blocker is
  a blocker, not a reason to bypass policy.
- Do not call the public `/releases/latest/download` endpoint. Only an
  explicitly authorized published-release check could validate public
  reachability, and no such action is included here.

## Raw Results and Stop Rules

Record `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN` for every test and
native target. Preserve first failures and all retries; there is no retry cap,
but a confirmed defect, unsafe loopback exception, unexpected external request,
data loss, app identity/channel change, existing-release conflict, or need for
out-of-scope change is an immediate stop and replan.

Builder recommendation, S132 Product Owner disposition, and V0.21 closeout
status remain separate. Do not infer certification from successful Windows
x64 packaging or a single installed-app path.
