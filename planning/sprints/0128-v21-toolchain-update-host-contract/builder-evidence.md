# Sprint 128 Builder Evidence

## Status

**Product Owner disposition: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27.** Builder recommendation: ACCEPT WITH RECORDED RESIDUALS. The initial artifact-name collision test demonstrated that the publisher uploaded five assets before detecting a duplicate flat basename. The Product Owner authorized a narrow allowlist amendment for `scripts/release/publish.ts`; basename validation now runs before client creation and remote operations, and the focused fixture passes with zero mock uploads. The native Windows x64 stable build and artifact verification also pass. Other native targets and updater runtime remain unverified. This disposition does not authorize Sprint 129 execution.

## Authorization and Isolation

- Authorized baseline: `d36ca2a9d715b5a6b7b0d29004eaa872de08c5a4`, branch `feat/create-V0.21.0`.
- Validation worktree: `C:\Users\gamez\Programming\openamx-s128-validation-d36ca2a9` (detached).
- Isolated `HUTCH_HOME`: `C:\Users\gamez\Programming\openamx-s128-validation-d36ca2a9\.hutch-home`.
- The Product Owner amended the changed-file allowlist to add only `scripts/release/publish.ts`, for duplicate flat-name preflight before any client/network operation.
- Primary worktree was clean on the authorized baseline before execution. After validation and disposition, the approved source, test, note, and S128 evidence files were transferred into the primary worktree. Hutch caches and build/release outputs were not transferred.
- The first `git worktree add --detach ...` failed on Windows long paths in S106/S107 screenshot files: `error: unable to create file ... Filename too long` and `fatal: Could not reset index file to revision 'HEAD'.` Inspection found no registered or partial S128 worktree. Retry with `git -c core.longpaths=true worktree add --detach ...` succeeded without persistent Git configuration changes.

## Stable Contract Reviewed

Official Hutch, Updates, Build Configuration, and Bundling & Distribution guides were fetched on 2026-11-27:

- https://docs.electrobun.dev/electrobun/guides/hutch/
- https://docs.electrobun.dev/electrobun/guides/updates/
- https://docs.electrobun.dev/electrobun/apis/cli/build-configuration/
- https://docs.electrobun.dev/electrobun/guides/bundling-and-distribution/

The current docs pair Electrobun `2.0.7` with Hutch `0.30.0`. The supported stable update contract uses `stable-<os>-<arch>-update.json`, its referenced full `.tar.zst`, and `stable-<os>-<arch>-checksum.json` with `hash`, `tarSha256`, and `tarSize`. The distribution guide explicitly supports `release.generatePatch: false`: it skips release-host lookup for patch generation while retaining the full update archive.

## Raw Commands and Outcomes

| Command / CWD | Raw outcome |
| --- | --- |
| First `git worktree add` / primary root | FAIL on four Windows long paths in prior S106/S107 artifacts; exact output and successful `core.longpaths=true` retry are in `artifacts/run-01/setup-failures.md`. |
| `bun test tests/release.test.ts` / validation root, before dependencies | `0 pass, 1 fail, 1 error`; missing `jszip`; exact output in `setup-failures.md`. |
| `bun install --frozen-lockfile` / validation root | PASS; 80 packages installed. |
| `bun test tests/release.test.ts` / validation root, run 01 | PASS; 62 passed, 0 failed, 236 expectations. |
| `bun test tests/release.test.ts` / validation root, run 02 | PASS; 63 passed, 0 failed, 245 expectations. |
| `bun test tests/release.test.ts` / validation root, run 03 | FAIL; 64 passed, 1 failed, 253 expectations. Duplicate basename was rejected after five mock uploads. |
| `bun test tests/release.test.ts` / validation root, run 04 after approved publisher amendment | PASS; 65 passed, 0 failed, 253 expectations; duplicate collision rejected with zero mock uploads. |
| `bun test tests/release.test.ts` / validation root, run 05 | FAIL; 64 passed, 1 fixture `ReferenceError` from declaration order. |
| `bun test tests/release.test.ts` / validation root, run 06 | FAIL; 64 passed, 1 fixture expected a filename error but lacked newly required stable metadata. |
| `bun test tests/release.test.ts` / validation root, run 07 | PASS; 65 passed, 0 failed, 255 expectations. |
| `bun test tests/release.test.ts` / validation root, run 08 after return-type correction | PASS; 65 passed, 0 failed, 255 expectations. |
| `bun test tests/release.test.ts` / primary root after transfer | PASS; 65 passed, 0 failed, 255 expectations. |
| `hutch status`, `hutch self version`, `hutch electrobun prepare` / `desktop-app`, isolated `HUTCH_HOME` | PASS; Hutch `0.30.0`, Electrobun `2.0.7`, Bun toolchain `1.4.4`; project lock verified. |
| `bun run release:check` / validation root | PASS; versions consistent at `0.20.0`, identity valid, Windows x64 host available, Hutch `0.30.0`, Bun `1.4.5`; other native targets unverified. |
| `bun install --cwd desktop-app --no-save --no-lockfile` / validation root | PASS; 582 desktop packages installed without a desktop lockfile change. |
| `bun run --cwd desktop-app typecheck` / validation root | PASS. |
| `bun run --cwd desktop-app build:web` / validation root | PASS; Vite built 4,125 modules, 26 guide files staged, worker/sharp/fonts copied. Existing large-chunk warning noted; raw output in `artifacts/run-01/build-web.log`. |
| `hutch electrobun build --env=stable` / `desktop-app`, isolated `HUTCH_HOME` | PASS; native Windows x64 build completed and printed `delta patch generation disabled`. |
| `inspect-windows-artifacts.ts` / `desktop-app` | PASS; app identity/version, update JSON, full archive, checksum, installer ZIP members, hashes, and no-patch output validated. See `artifacts/run-01/windows-artifact-inspection.json`. |
| `git diff --check` / validation root | PASS; no output. |

Run 03 exposed `explicit GitHub release publication > rejects duplicate flat update basenames before uploading assets`: expected the injected publisher client's remote asset count to remain `0`, received `5`. After the approved amendment, the manifest basenames are preflighted before client creation; run 04 passes the same case with zero mock uploads. Runs 05 and 06 exposed test-fixture defects only and are retained; runs 07 and 08 pass. The primary post-transfer run also passes. Exact validation transcripts are preserved as `artifacts/run-01/release-test-run-01.log` through `release-test-run-08.log`; all publication behavior used injected clients, with no public GitHub endpoint call.

## Native Windows Artifact Inventory

The generated manifest reports `schemaVersion: 1`, identifier `dev.openamx.desktop`, channel `stable`, version `0.20.0`, platform `win`, architecture `x64`, and app hash `32q0pp714v7fm`. The verifier matched the fixed checksum sidecar to the exact uncompressed TAR (160,506,880 bytes; SHA-256 `c75bda621d0888bc83c978875e4af33148f407051c16bdc6b15cded106862e89`).

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `stable-win-x64-update.json` | 205 | `5aacbd2927119f243e427c7507f3e0776165be3cca3488ed47c0bd905e458fbc` |
| `stable-win-x64-OpenAMXDesktop.tar.zst` | 57,347,984 | `0d284e84a3d830306cdf982e77a15db68a84d6925527b8b4661197ab2ae70580` |
| `stable-win-x64-checksum.json` | 123 | `a2812149ac12525e7b5a229d7f8d61709b292e032cb0177575ee44d7320f7e7a` |
| `win-x64-OpenAMXDesktop-Setup.zip` | 58,233,465 | `b558022ea2870cc7f0bf74bf91044ec0477b89d03959f91a2541999746ce965a` |

The installer contains `.installer\\OpenAMX Desktop-Setup.metadata.json`, `.installer\\OpenAMX Desktop-Setup.tar.zst`, and `OpenAMX Desktop-Setup.exe`. The generated artifact directory contains no `.patch` files. Assembly byte/name retention and publisher uniqueness are covered by fixture tests; production release assembly/publication commands were not run.

## Implemented In The Authorized Worktree

- Pinned Hutch with `// @hutch cli=0.30.0` and Electrobun with `electrobun.version: "2.0.7"`.
- Configured the exact stable `releases/latest/download` base URL and `generatePatch: false`; app name, identifier, and package-derived version source remain unchanged.
- Extended update artifact verification to require schema, app identifier, stable channel, target-matching manifest, full compressed TAR payload, fixed checksum sidecar, matching app hash, exact uncompressed TAR SHA-256 and size, and valid TAR contents. Target bundling also rejects any emitted `.patch` under the full-bundle-only policy.
- Added passing fixtures for required checksum/payload mismatches and byte/name preservation through release assembly.
- Added duplicate basename preflight in `scripts/release/publish.ts`; the injected-client test proves rejection before any draft/client operation or upload.

## Preservation Baseline

Read-only aggregate SHA-256 fingerprints captured before execution were repeated after the run. Every file count, byte count, and tree fingerprint matched, including primary desktop outputs, releases, and S121-S127 evidence. No primary output or prior sprint artifact was modified.

| Primary path | Files | Bytes | Tree SHA-256 |
| --- | ---: | ---: | --- |
| `desktop-app/.hutch` | 224 | 1,529,658 | `45F88018451204882EAD36AE36BE523C9DC6D9936D3C36023E525D5A97097BCE` |
| `desktop-app/build` | 98 | 251,545,087 | `E375CAC1361C2381EF0B05B8AC832C71043E7ACAABD9E3D3C596A1A6AFB5FB94` |
| `desktop-app/artifacts` | 3 | 90,288,373 | `80480EFF18A8C1E7C440892C54BD3104A438355DD0712930E9E1B7069154100A` |
| `desktop-app/dist` | 75 | 33,613,454 | `E5455802A327D89D04F4DFB32756A21F52B584E8BAD44E4EF1918FBE72705CC1` |
| `releases` | 196 | 2,148,705,820 | `AF39D739EE03C30F1B97A69C09FBF84F2C002F82503B12280734DCE1F4B184E8` |
| S121 `artifacts` | 220 | 1,865,875 | `6114E4543C136463A20C3C9AC6D0D9114FE24BFF33C73FCE1D48D3DA9DE32991` |
| S122 `artifacts` | 19 | 335,027 | `4FC09DBC6635E7599054D161033F23B73486D4D324FA9E22B7349A0A6E65DD2E` |
| S123 `artifacts` | 1,975 | 17,763,064 | `1C253E27FA019C2FC9E97A9A942E94DD610C714E6A5F178EB7AEE2FC122063FC` |
| S124 `artifacts` | 674 | 6,004,199 | `6893EB720209B5721F2B8AB6A93AC3C7936CC85ADA370B8B8DC46D03A4FF4E1B` |
| S125 `artifacts` | 449 | 4,100,302 | `482C9DE1762297BDB39177497C26DDB8A8AFEEECE3C11F2ED42590EFD94F6459` |
| S126 `artifacts` | 63 | 2,259,643 | `1FD41A3BD147601D72C75599EA992AF5E9BCD7DE5A2B6B58265CFDFA2F187563` |
| S127 `artifacts` | 283 | 2,648,783 | `36F696F2F691D72F8EEA0B8F97F89BFF95BD7CDEF9EB8AD016B6885E0608BBA3` |

## Not Run / Residuals

Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS** for the approved S128 contract scope.

Product Owner disposition: **ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27.** This closes S128 only. Sprint 129 requires its own handoff/authorization.

## Final Audit

- `get_errors` on `scripts/release/desktop.ts` and `scripts/release/publish.ts`: no errors found. On `tests/release.test.ts`, the workspace TypeScript service reports missing Bun-specific type context (`bun:test`, `Bun`, `import.meta.dir`) and an existing fixture-state typing diagnostic; the focused Bun suite passes 65/0.
- Final `git diff --check`: PASS.
- Final primary worktree status: authorized S128 changes only on `feat/create-V0.21.0`; no unrelated changes were present at transfer time.
- Final primary preservation fingerprints: all file counts, byte counts, and tree SHA-256 values match the pre-run snapshot above.
- Final validation worktree status contains only the approved config, release verifier/publisher, test, S128 evidence, and isolated `.hutch-home` paths. No lockfile or app package version changed.
