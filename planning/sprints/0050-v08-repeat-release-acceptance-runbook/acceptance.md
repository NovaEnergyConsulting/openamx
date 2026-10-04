# Sprint 050 Acceptance Criteria

Sprint 050 is complete when:

- Sprint 048's approved disposition and Sprint 049's Lead Developer disposition or explicit authorization with named residuals are recorded. No Builder status is silently upgraded to acceptance.
- One available-host workflow is exercised with clean committed source, an explicitly authorized stable version, and matching full commit provenance across desktop, extension, manifest, and collection. If current version/destination/license constraints prevent a complete production-ready flow, the blocker is recorded and no accepted bundle is fabricated or overwritten.
- At least two disposable stable versions and same-version reruns are exercised in isolated fixtures. Version/source provenance is verified, identical reruns do not mutate accepted output, conflicting reruns fail safely, and production package versions/accepted release directories remain unchanged by tests.
- The available-host native desktop path is built and its current installer/package is inspected; native installation/launch/sample preview/close/uninstall is performed where a fresh authorized artifact and host are available. Exact host, commands, outcomes, and user-data observations are recorded. Unperformed behavior is marked unverified/not performed; the Sprint 048 Lead Developer report remains separately attributed.
- Cross-machine transfer/collection is exercised with checksummed disposable bundles and matching full source commit. Corrupt, stale, unsafe, incomplete, mixed-version, mixed-commit, duplicate-target and conflicting inputs are rejected before mutation, and previous accepted outputs remain byte-identical.
- Failure coverage includes unsupported host/architecture, missing prerequisites, unresolved license/notices, interrupted staging/upload, tag mismatch, partial-release acknowledgement, missing authentication, remote asset conflict, identical retry, and later same-revision addition. No test invokes a real public GitHub endpoint or publishes a test release.
- Release status accurately distinguishes available, missing, unverified, and unsupported targets, and separates build/package checks, checksums/provenance, manual install/launch, licensing readiness, and publication. No six-platform certification or self-containment claim exceeds evidence.
- One consolidated `docs/releasing.md` explains prerequisites; actual installer formats/target limits; unsigned warnings and runtime dependencies; version preparation/review/commit; per-host builds; artifact transfer; collection/verification; explicit draft GitHub publication and partial-release acknowledgement; manual Marketplace submission; license/notices blockers; recovery/retries; immutable retention; and the next-version checklist using actual CLI syntax.
- Applicable root build/tests, focused release tests, desktop tests/typecheck/build/UI tests, and extension compile/package/Extension Development Host tests pass, or exact unavailable/failing commands and residuals are recorded. `git diff --check` passes.
- Sprint 050 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` include exact commands, environment/tool versions, results, artifact hashes/sizes, target matrix, fixture cases, mock-only remote results, license status, and remaining owners/disposition.
- No actual public GitHub release or Marketplace upload is claimed unless a separate real release/operator action is explicitly authorized and recorded. No legal terms are created and no native target is inferred from simulation.

## Lead Developer Disposition (2026-10-04)

**Disposition: COMPLETE WITH RECORDED RESIDUALS.** The Lead Developer reports that all features were tested and the results are satisfactory, and accepts the Sprint 050 open items for sprint closeout as listed below. This closes Sprint 050; it does not certify unperformed release, legal, native-platform, or publication checks.

| Acceptance area | Closeout status | Record |
| --- | --- | --- |
| Sprint 048/049 dependency gate | Accepted / complete | Sprint 048 remains COMPLETE / APPROVED. Sprint 049 is dispositioned COMPLETE WITH RECORDED RESIDUALS in its Builder evidence by this Lead Developer direction. |
| Fresh matching production release workflow | Accepted residual | No fresh stable desktop/extension production assembly was built or collected. The existing 0.8.0 Linux x64 output remains immutable; the production version/destination and license gates were not bypassed. |
| Two disposable versions and same-version reruns | Verified | Fixture versions 0.6.1 and 0.6.2, identical rerun refusal, conflict refusal, and unchanged prior outputs/source manifests are covered by release tests. |
| Native install/launch/sample/close/uninstall | Accepted residual | The Lead Developer reports feature testing as satisfactory. Sprint 050 did not produce a fresh authorized installer or independently record an OS/session/step matrix; Sprint 048's separate report and Builder-time evidence remain distinct. |
| Transfer and collection safety | Verified | Matching fixture provenance, integrity checks, and unsafe/stale/incomplete/mixed/duplicate/conflicting rejection are covered by tests. |
| Failure and recovery coverage | Verified with accepted residual | Mocked upload interruption/retry, credentials, tag/partial/conflict cases are tested. A local filesystem fault after assembly staging begins was not injected and is accepted as a Sprint 050 residual. |
| Target/readiness distinctions | Verified | The runbook/evidence keep package checks separate from native installation, license readiness, target status, and publication. Unverified targets remain unverified. |
| Operator runbook | Verified | `docs/releasing.md` documents implemented commands, prerequisites, host limits, transfer, recovery, retention, and manual Marketplace workflow. |
| Automated checks/evidence | Verified | Recorded Builder checks passed, including the follow-up PDF font resource fix and packaged-worker PDF smoke; exact latest outcomes are in Builder evidence. |
| Public GitHub/Marketplace activity and legal readiness | Accepted residual / not performed | No public release or Marketplace upload occurred. No legal terms were invented. Production verification/publication remains blocked until the license owner confirms metadata and notices. |

This disposition accepts the remaining items as sprint-closeout exceptions only. It does not authorize a new version, overwrite or modify `releases/0.8.0/linux-x64`, claim `release:verify` readiness, or publish a release.