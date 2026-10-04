# Sprint 050 Handoff Prompt

You are the Builder for OpenAMX Sprint 050.

Read these files first:

- `.agents/main.md` if present, plus applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV08MasterSprintPlan.md`
- Sprint 047-049 requirements, blueprints, acceptance criteria, Builder evidence, and Lead Developer dispositions
- Sprint 050 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Root `package.json`, `scripts/release.ts`, all release adapters/tests, and `docs/releasing.md` if it already exists
- Current desktop/extension manifests, package documentation, `LICENSE.md`, `COMMERCIAL-LICENSE.md`, notices, and output-ignore rules
- `releases/0.8.0/linux-x64/manifest.json`, `evidence.json`, and checksum record; preserve the retained bundle unchanged

## Entry Gate

Before declaring integrated acceptance complete, record Sprint 049's Lead Developer disposition or explicit authorization to proceed with named residuals. Do not treat Builder implementation completion as acceptance. A production release exercise additionally requires a clean committed source revision, one explicitly authorized stable version, matching desktop/extension full-commit provenance, an absent accepted-output destination, and resolved license/notices readiness if claiming release verification/publication readiness.

## Task Contract

**objective**: Prove repeatable V0.8 release preparation/build/collection/verification behavior with available-host evidence and disposable multi-version fixtures, then write the single accurate operator release runbook.

**owns**: End-to-end release acceptance; two-version/same-version fixture runs; adversarial recovery and safety cases; available-host verification; `docs/releasing.md`; final evidence and planning disposition recommendation.

**must_not**: Overwrite or modify retained release outputs; combine mismatched full source commits; change versions without explicit authorization; use test versions in production manifests; contact public GitHub or publish fixture releases in automated tests; upload to Marketplace; invent legal terms/notices; claim unverified platform/runtime/native behavior; sign/notarize packages; or expand beyond V0.8 acceptance/runbook scope.

**decision gates**: Preserve source/version/artifact provenance and immutable releases. Keep remote GitHub operations mocked. A real public release, if ever selected, is a separate operator action with explicit authorization and a real verified assembly. If no clean matching desktop/extension artifacts or no authorized unused release version is available, record the blocker and use disposable fixtures; do not force the historical 0.8.0 bundle into a mismatched release. Keep `release:verify`/publish readiness blocked until the license owner confirms Marketplace representation and third-party notice requirements.

**acceptance**: Meet every criterion in `planning/sprints/0050-v08-repeat-release-acceptance-runbook/acceptance.md`.

**verification**:

1. Test two disposable versions, same-version identical rerun, and same-version conflict while proving source manifests and accepted prior outputs are unchanged.
2. Exercise available-host preflight/build/package/inspection and matching collection when clean committed source, explicit version authorization, and unused destination permit. Inspect actual artifacts, source commit, checksums, runtime/resource contents, and license state.
3. Exercise missing tools/license, unsupported hosts, mixed version/commit, unsafe/corrupt/stale/incomplete/duplicate inputs, partial acknowledgement, missing credentials, tag conflict, interrupted upload, identical retries, and safe additions. Mock GitHub operations and assert no real network publication occurs.
4. Perform native install/launch/sample preview/close/uninstall only on available host with a fresh authorized build; record exact environment and steps. Preserve Sprint 048's separate Lead Developer-reported acceptance accurately.
5. Write `docs/releasing.md` with exact implemented command syntax, prerequisites, target limitations/formats, unsigned/runtime caveats, review/commit, transfer/collection/verification/publication, manual Marketplace submission, recovery, retention, and next-version steps.
6. Run applicable release, root, desktop, and extension checks plus `git diff --check`; record exact outcomes, failures, warnings, hashes, host/tool versions, and evidence.
7. Update Sprint 050 Builder evidence and planning state/decisions/questions; request a Lead Developer disposition. Do not report any unavailable check as passed.