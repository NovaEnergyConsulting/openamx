# Sprint 131 Verification Plan

## Status and Authorization

Architect-prepared candidate. S128 and S130 were accepted/closed with
recorded residuals on 2026-11-27 and 2026-11-28 respectively; S129 is also
closed. S131 remains unexecuted and separately gated. This document
authorizes no documentation edits, tests, release commands, or public endpoint
requests.

Before execution, obtain Product Owner authorization for the exact baseline
commit, validation worktree, changed-file allowlist, command/CWD matrix,
evidence root, preservation/cleanup boundaries, retry/stop policy, and
residual disposition process. No baseline is selected by this document.

## Isolation and Preservation

- Use a new detached validation worktree at the approved S130 accepted
  implementation baseline. Do not run builds or tests in the primary
  worktree unless expressly authorized.
- Capture baseline status and relevant hashes for `docs/releasing.md`,
  `tests/release.test.ts`, `scripts/release/**`, `releases/`, and S121-S130
  evidence. Preserve ignored release bundles and all prior sprint artifacts.
- Keep S131 raw command output under
  `planning/sprints/0131-v21-release-pipeline-and-documentation/artifacts/run-01/`.
- Tests use local fixtures and injected release clients only. Do not access
  the public GitHub latest-download endpoint, GitHub API, or publication.
- Do not run `release:desktop`, `release:collect`, `release:publish`, create a
  real release draft, or clean any existing release/staging outputs as part of
  this candidate verification.

## Candidate Commands

Run from the repository root in the separately authorized validation
worktree:

```powershell
bun test tests/release.test.ts
bun run release:check
git diff --check
```

`release:check` is a host/prerequisite preflight, not packaging or platform
certification. If unavailable tools make it fail, record the raw result and
continue only within the approved matrix. Do not run a native build unless
explicitly authorized; use the S128 Windows x64 artifact evidence plus focused
fixture tests to support the S131 runbook and pipeline contract.

## Evidence Review

- Review S128 `windows-artifact-inspection.json` and the S128 compatibility
  note for the generated stable update manifest, `.tar.zst`, checksum sidecar,
  installer, full-bundle-only policy, file sizes/hashes, and host limitation.
- Review existing `tests/release.test.ts` cases for malformed/mismatched
  update metadata and checksum rejection, byte/name preservation through
  assembly, and duplicate flat basename rejection before mock uploads.
- Compare every new operational claim in `docs/releasing.md` with accepted
  S128/S130 records and the V0.21 master plan. Mark as unverified anything
  without direct evidence. Preserve current license, draft, provenance,
  and operator authorization gates.
- If a test or implementation defect is found, stop after preserving the
  failure. Request an allowlist/scope amendment before changing release code.

## Result Recording and Stop Rules

Record raw statuses as `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`.
Preserve the first failure and every retry; there is no retry cap, but retries
cannot expand the approved file or command scope. Stop on any need for public
GitHub calls, real publication, modification/deletion of a retained release,
app identity/version/toolchain changes, or an implementation edit outside the
approved allowlist.

The Builder recommendation and Product Owner disposition remain separate.
S131 does not establish a published update route, installed-app update,
platform support, or release authority.
