# Sprint 128 Blueprint: V0.21 Toolchain and Update-Host Contract

## Approach

1. Recheck the official Hutch and Electrobun stable release/compatibility
   documentation. Record the date, exact URLs, exact compatible pair, and any
   relevant artifact-contract changes. Do not promote the planning-time
   candidate without this check.
2. Pin Hutch with its exact first-line project pragma and pin Electrobun with
   the exact `electrobun.version` in `desktop-app/hutch.config.ts`. Prepare the
   selected toolchain and confirm Hutch resolves the project pin rather than
   relying on a machine-global channel selection.
3. Set the stable GitHub latest-download URL in
   `desktop-app/electrobun.config.ts`. Preserve the imported app metadata,
   stable channel behavior, and existing version source.
4. Build in an isolated validation worktree on an available native host. Read
   the generated artifact names and metadata from the pinned release, then
   trace every required file through desktop target bundling, release
   assembly, and the publisher's flat-basename mapping.
5. Resolve the delta-patch policy as a gate, not an assumption. The current
   publisher rejects duplicate basenames but does not itself establish that a
   complete historical patch chain is present. Prefer full-bundle-only if the
   toolchain has a supported explicit no-patch control. Otherwise demonstrate
   safe patch-chain retention or stop for a separate decision.
6. Add focused fixture-based checks for required artifact presence, metadata
   references, checksums, byte-preserving names, target assembly retention,
   and duplicate flat-name rejection. Do not make public GitHub requests.
7. Complete the compatibility note with exact commands, outputs, host,
   artifact inventory, selected patch policy, failures, unavailable platforms,
   and residuals. Request a separate disposition; Sprint 129 must not proceed
   on an incomplete or blocked contract.

## Artifact Contract to Verify

Use the exact contract for the version selected in step 1. The planning-time
Electrobun 2.0.7 documentation describes the following stable-host artifacts:

| Role | Expected shape | Required handling |
| --- | --- | --- |
| Update manifest | `stable-<platform>-<arch>-update.json` | Preserve exact basename; validate channel, target, version/hash, and referenced full payload. |
| Full update payload | Manifest-referenced `.tar.zst` | Require presence; preserve bytes and basename through target bundle, assembly, and publication. |
| Current integrity sidecar | `stable-<platform>-<arch>-checksum.json` | Preserve exact basename; validate the build hash and documented tar digest/size fields against the generated payload contract. |
| Optional legacy checksum | Hash-named checksum sidecar, if emitted/required by the selected toolchain | Preserve only when required by the toolchain/client compatibility contract; do not confuse it with the fixed current sidecar. |
| Optional delta patch | Toolchain-documented hash-named patch | Either prove the complete required trail is included and uniquely publishable, or explicitly disable generation and verify full-bundle behavior. |
| Installer | Existing native Setup artifact | Preserve through the release bundle; it is separate from updater metadata and does not replace the full update payload. |

The official updates guide says to upload generated artifacts without renaming,
including checksum files and any required retained patches, and to make the
manifest available only after its payload assets. The V0.21 GitHub release
workflow remains human-controlled; tests do not publish or mutate a release.

## Candidate File Allowlist

Implementation candidates, only after separate authorization:

- `desktop-app/hutch.config.ts`
- `desktop-app/electrobun.config.ts`
- `scripts/release/desktop.ts`
- `tests/release.test.ts`
- Files under this Sprint 128 directory, including the compatibility note
  and execution evidence.

Inspection-only unless a separately approved scope change is recorded:

- `desktop-app/app-metadata.ts`
- `desktop-app/package.json`
- `scripts/release/assembly.ts`
- `scripts/release/publish.ts`
- `scripts/release.ts`

If the contract requires assembly/publisher behavior changes, stop and request
an amendment or explicitly route the implementation to Sprint 131. Do not
expand the allowlist silently.

## Candidate Decisions and Risks

- **Toolchain candidate, unapproved:** Official docs reviewed on 2026-11-27
  list Electrobun 2.0.7 paired with Hutch 0.30.0. Recheck at execution time.
- **Patch policy, unresolved:** The current release process builds one native
  target, stores artifacts per target, and flattens names for GitHub. A
  current-build-only patch does not prove that older supported clients have a
  complete chain in the latest release. Do not enable patches based on the
  presence of one generated patch file.
- **Compatibility note gate:** Sprint 129 entry requires a completed,
  dispositioned note documenting exact tool pins, host URL, artifact schema,
  patch policy, tests, and remaining platform limitations.
- **V0.20 carry-forward:** Preserve prior raw statuses and residuals. Sprint
  128 is not a V0.20 closeout or disposition action.
