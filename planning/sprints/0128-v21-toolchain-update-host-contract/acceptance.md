# Sprint 128 Acceptance Criteria

Sprint 128 is complete only when the exact compatible toolchain, stable update
host, artifact set, publication naming, and patch policy are verified and
recorded in a dispositioned compatibility note. This sprint does not implement
the application updater or authorize a release.

## Entry and Scope

- The Product Owner approves the exact S128 execution baseline, worktree,
  changed-file allowlist, commands, output/evidence roots, preservation rules,
  retry/stop policy, and residual disposition before implementation or build
  commands.
- The selected Hutch and Electrobun versions have been rechecked against
  official current stable documentation and are recorded as exact versions.
- Changes remain within the approved S128 allowlist. No V0.20 historical
  status or artifact is rewritten.

## Toolchain and Configuration

- `desktop-app/hutch.config.ts` pins the exact Hutch CLI using the official
  project pragma and pins the compatible exact Electrobun version.
- Hutch reports the project-resolved pin; `hutch electrobun prepare` and
  Electrobun config validation succeed with the selected pair.
- `release.baseUrl` is exactly
  `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download`.
- `app.name` remains `OpenAMX Desktop`, `app.identifier` remains
  `dev.openamx.desktop`, and the updater channel remains `stable`.
- No version manifest, release tag, or published release is changed.

## Artifact and Publication Contract

- A native stable build on each available host emits the documented update
  manifest, its referenced full `.tar.zst` payload, and the required current
  checksum sidecar. Metadata fields identify the expected stable target and
  exact payload; checksum fields and size are consistent with the generated
  artifacts.
- Required artifacts are retained with their original basenames in the
  desktop target bundle and release assembly. The release publisher maps each
  to a unique flat asset name and rejects ambiguous duplicate basenames.
- The installer remains separately present and is not mistaken for the
  updater payload.
- The patch policy is explicit and technically demonstrated:
  - If full-bundle-only, the selected Hutch/Electrobun version has a supported
    explicit no-patch setting, the build emits no patch requirement, and the
    full payload path is validated.
  - If patches are enabled, the documented patch trail needed by supported
    clients is retained in the latest release asset set without basename
    collisions, and every manifest reference resolves.
- If neither policy is proven, S128 is BLOCKED and Sprint 129 does not start.

## Tests and Evidence

- Focused tests cover required artifacts, metadata references, checksums,
  exact filename retention, target assembly, and duplicate-name rejection.
- All release tests use fixtures or injected clients. No public GitHub API,
  latest-release endpoint, real release, or release publication is used.
- Focused desktop configuration/typecheck/build checks pass on the available
  host. Other OS/architecture targets are recorded as unverified, not passed.
- `git diff --check` passes. Exact commands, tool versions, host data,
  outputs, first failures/retries, hashes, patch decision, and residuals are
  recorded under the S128 evidence root.
- `compatibility-note.md` is completed and separately dispositioned before
  Sprint 129 entry. The note does not claim updater runtime behavior or
  cross-platform certification.

## Explicit Non-Acceptance

A successful config parse, one native package build, mock test, or passing
release test does not establish a working installed-app update, patch-chain
behavior across all supported prior versions, GitHub asset availability,
manual installation, or cross-platform support. Those remain later acceptance
work or explicit residuals.
