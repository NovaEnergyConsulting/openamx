# Sprint 050 Blueprint: Sustainable Release Acceptance and Runbook

## Approach

1. Resolve Sprint 049's Lead Developer disposition or explicit authorization to proceed with named residuals. Review its Builder evidence, including the full AGPL inclusion, unresolved dual-license Marketplace metadata/third-party notices, dirty-source status, and mismatched 0.8.0 desktop versus extension commits. Do not treat implementation complete as release-ready or accepted.
2. Freeze the current release contract and record the available host, versions, target statuses, exact version-authority state, and existing accepted-output destinations. Preserve `releases/0.8.0/linux-x64` unchanged. Decide with the Lead Developer which explicitly authorized stable version/commit can support a fresh available-host exercise; if the destination already exists, stop before mutation and request an authorized version or use fixtures.
3. Build a two-version repeatability matrix from disposable fixtures. For versions A and B, run preparation/validation/build-bundle/collection/verification logic in temporary roots; repeat A with identical inputs; then attempt conflicting same-version data. Prove version/revision isolation, idempotence, preserved prior outputs, and deterministic errors without touching production package versions or accepted release paths.
4. Exercise available-host end-to-end integration from one clean committed revision when prerequisites and an unused authorized destination permit: `release:check`, review/commit preparation if necessary, `release:desktop`, `release:extension`, transfer-compatible bundle inputs, `release:collect`, and `release:verify`. Compare every full commit/version and hash. If license readiness remains blocked, expect verify/publication readiness to remain blocked and record that as truthful behavior rather than bypassing it.
5. Run or extend adversarial release tests for: unsupported/out-of-matrix host, missing tool, license/notices blocker, mixed version or commit, stale/corrupt/missing artifact, traversal/symlink/unsafe archive member, interrupted staging, duplicate/conflicting targets, tag mismatch, partial acknowledgement missing, missing credentials, interrupted upload, identical retries, and same-revision additions. Keep all remote operations injected/mocked, and add a guard that ensures automated tests make no public network requests.
6. Verify the lifecycle distinctions end to end: `release:check` and `release:verify` are read-only; builds require clean committed source; bundles carry full commit and checksums; install/launch status stays distinct from package status; verify reports missing/unverified/unsupported targets; and publish can only create/extend drafts after all gates and required explicit partial acknowledgement.
7. Perform native install/launch/reopen/close/uninstall checks on an available host only if a current matching artifact can be freshly built without replacing an accepted output. Record host OS/distribution/version/kernel/architecture, system dependencies, exact commands, sample behavior, user data behavior, and limitations. Preserve the existing Lead Developer-reported Sprint 048 launch disposition as a separate evidence source; do not add missing observations to it.
8. Write one consolidated `docs/releasing.md` for operators. Include prerequisite checks and per-native-host formats; unsigned warnings and Linux system libraries; prepare/review/commit; native build-per-host and artifact transfer; collection/verification; explicit GitHub draft publication and partial acknowledgement; manual Marketplace packaging/submission; license readiness; hashes/provenance; conflict/failed-upload recovery; immutable output retention; and next-version/same-version checklist. Use exact implemented commands and explain no cross-compilation, no automated Marketplace upload, and no automatic cleanup.
9. Run root `bun run build` and `bun test`, repository-owned root tests, desktop `bun run test`, `bun run typecheck`, `bun run build`/`build:web` and `bun run test:ui` where available, extension compile/package/Extension Development Host tests, focused release tests, and `git diff --check`. Record failures/warnings accurately, including generated-spike test issues if they recur.
10. Update Sprint 050 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with the matrix, commands, exact tool/host versions, checksums, artifacts, fixture scenarios, mock-only remote outcomes, license and platform status, native evidence boundaries, and final recommendation. Seek a separate Lead Developer disposition; do not self-accept.

## Acceptance Scenarios

| Scenario | Required outcome |
| --- | --- |
| Two disposable versions | Both versions remain isolated and verify against their own source commit. |
| Same-version identical rerun | No accepted output is replaced; byte-identical existing remote assets may be confirmed. |
| Same-version conflicting rerun | Fail without mutating accepted local or remote data. |
| Cross-machine collection | Manual transfer preserves bundle files/checksums and collection accepts only matching version/full commit. |
| Missing/unverified/unsupported target | Status is explicit; partial publish requires acknowledgement and lists the gap. |
| Missing license/notices readiness | Verify/publish remains blocked; no warning suppression or legal inference. |
| Interrupted staging/upload | Incomplete staging is not collectable; draft remains retryable and conflicts are rejected. |
| Automated publishing tests | All GitHub calls are mocked; no public endpoint or fixture release is contacted. |

## Runbook Coverage

The operator-facing guide must contain prerequisites and host limitations; Linux/Windows/macOS format/architecture facts and unsigned/runtime warnings; version prepare/review/commit procedure; exact command sequence; fresh native host builds; bundle contents and checksum verification; manual transfer/collection; verify status meanings; draft publish, partial acknowledgement and repository override; manual VSIX Marketplace submission; license/notices stop conditions; tag/asset conflicts and interrupted-upload recovery; release retention; and a next-version checklist. It must separate automated packaging from native installation and publication evidence.

## Files to Update

- `docs/releasing.md` as the single consolidated operator runbook
- Focused release tests in `tests/release.test.ts` and existing desktop/extension suites only as required by uncovered integrated failures
- Root/desktop/extension READMEs only for narrow links or current command/prerequisite corrections; avoid duplicate runbooks
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 050 Builder evidence and any required artifact/hash/evidence index

## Notes

The 0.8.0 Linux x64 bundle at commit `1a9585a24b5ec3c69afbccab0501e46752cbd104` is valid historical Sprint 048 output but cannot be combined with the Sprint 049 dirty worktree/VSIX candidate at `b92f6021284a58213641287043989267ebf387a5`. Do not mutate either record. The license owner still must confirm Marketplace representation of the AGPL/commercial offer and third-party notices. These constraints do not prevent fixture-driven repeatability tests or writing an accurate operator guide, but they prevent a false production-ready claim.