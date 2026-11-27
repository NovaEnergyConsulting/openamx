# Sprint 128 Toolchain and Update-Host Compatibility Note

## Status

**Product Owner disposition: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
2026-11-27.** Builder recommendation: ACCEPT WITH RECORDED RESIDUALS. The
publisher basename collision was fixed under a narrow Product Owner-approved
allowlist amendment, and the duplicate-name test proves rejection before any
client/network operation. The native Windows x64 stable build and generated-
artifact inspection pass. Other native targets, installed-app updater
behavior, and platform certification remain unverified.

## Toolchain Selection

| Item | Planned candidate | Verified result |
| --- | --- | --- |
| Hutch CLI | `0.30.0` | Official Hutch guide pairing; project pin resolved by `hutch status` and `hutch self version`. |
| Electrobun | `2.0.7` | Official current stable pair; `hutch electrobun prepare` and native build passed. |
| Documentation checked | [Hutch guide](https://docs.electrobun.dev/electrobun/guides/hutch/), [Updates guide](https://docs.electrobun.dev/electrobun/guides/updates/), [Build Configuration](https://docs.electrobun.dev/electrobun/apis/cli/build-configuration/), [Bundling & Distribution](https://docs.electrobun.dev/electrobun/guides/bundling-and-distribution/) | Fetched 2026-11-27; docs identify 2.0.7/0.30.0, checksum schema, and `generatePatch: false`. |
| Host | Windows x64 | Baseline `d36ca2a9d715b5a6b7b0d29004eaa872de08c5a4`; native stable build passed. |

The planning candidates are not approved immutable pins. Replace them only
with the exact compatible stable pair established by the authorized
revalidation.

## Project Configuration

- Hutch project pragma: `// @hutch cli=0.30.0`; Hutch resolved it in the isolated store.
- Exact `electrobun.version`: `2.0.7`; prepare and native stable build passed.
- `release.baseUrl`:
  `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download`.
- `release.generatePatch`: `false`, the documented explicit full-bundle policy.
- App name, identifier, and package-derived version source remain unchanged
  in the edited configuration; the config contract fixture passes.
- Channel: stable build remains selected by `--env=stable`; no channel field
  was changed in the app identity config.
- Hutch config was loaded by prepare and stable build; both succeeded.

## Artifact Inventory and Flow

| Required role | Generated filename(s) | Target bundle | Assembly | Flat publisher name | Result |
| --- | --- | --- | --- | --- | --- |
| Stable update manifest | `stable-win-x64-update.json` | Target bundle/assembly fixture preserves exact bytes/name | Assembly fixture preserves exact bytes/name | Unique flat fixture name | Native PASS; assembly/publisher fixtures PASS |
| Full `.tar.zst` update payload | `stable-win-x64-OpenAMXDesktop.tar.zst` (57,347,984 bytes) | Required by verifier and copied by target bundling | Assembly fixture preserves exact bytes/name | Unique flat fixture name | Native verifier PASS; SHA-256 `0d284e84a3d830306cdf982e77a15db68a84d6925527b8b4661197ab2ae70580` |
| Current checksum sidecar | `stable-win-x64-checksum.json` (123 bytes) | Required and validated against payload hash/TAR size | Assembly fixture preserves exact bytes/name | Unique flat fixture name | Native PASS; SHA-256 `a2812149ac12525e7b5a229d7f8d61709b292e032cb0177575ee44d7320f7e7a` |
| Installer | `win-x64-OpenAMXDesktop-Setup.zip` (58,233,465 bytes) | Native artifact selected; ZIP contains setup executable and embedded payload | Assembly fixture covers artifact preservation | Unique flat fixture name | Native PASS; SHA-256 `b558022ea2870cc7f0bf74bf91044ec0477b89d03959f91a2541999746ce965a` |
| Optional patch trail | `release.generatePatch: false` | Hutch reports patch generation disabled; no patch emitted | Not applicable | Not applicable | Native full-bundle policy PASS; no patch files |

Record exact basename, byte size, SHA-256, metadata references, and any
required integrity fields for every file. Record duplicate-name checks and
confirm no file was renamed, dropped, or replaced.

## Delta-Patch Policy

- Decision: **Full-bundle-only**, using the supported `release.generatePatch:
  false` setting documented by Electrobun's Bundling & Distribution guide.
- The setting skips release-host lookup for patch generation and retains the
  full update archive. The native build confirmed patch generation disabled,
  emitted the full archive, and passed the generated checksum/TAR inspection.
- Installed-app update runtime behavior remains NOT RUN.
- No patch-chain retention is claimed or required for this policy.
- The publisher now preflights all flat asset basenames before client creation;
  the injected duplicate-name test passes with zero mock uploads.

## Verification Results

| Check | Status | Evidence reference |
| --- | --- | --- |
| Exact toolchain revalidated and pinned | PASS | `hutch status`, `hutch self version`; exact pair in isolated store |
| Electrobun prepare/config validation | PASS | `hutch electrobun prepare`; stable native build also loaded config |
| Focused release contract tests | PASS after authorized amendment | Run 08: 65 passed, 0 failed, 255 expectations; preserve run 03 and run 05/06 failures |
| Native stable artifact inventory | PASS for Windows x64 | `artifacts/run-01/windows-artifact-inspection.json` |
| Target bundle/assembly name retention | Fixture PASS | Exact names and bytes retained through release assembly fixture; production release command not run |
| Publisher flat-name uniqueness with injected client | PASS | Duplicate rejected before client creation and with zero uploads in run 04/run 08 |
| Patch policy and full-bundle output | PASS for Windows x64 | Explicit `generatePatch: false`; Hutch confirms disabled and no patch file emitted |
| Other native platforms | NOT RUN / UNVERIFIED | No cross-platform claim |

## Disposition and Residuals

- Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS** for the approved
  S128 contract scope.
- Product Owner disposition: **ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-11-27.**
- Sprint 129 entry gate: This S128 disposition satisfies the compatibility-note
  disposition prerequisite only. It does not authorize Sprint 129 execution;
  that requires its own handoff/authorization.
- Residuals: Windows x64 is the only native host verified. Other OS/architecture
  targets, actual release assembly/publication commands, installed-app updater
  runtime, GitHub asset availability, and platform certification remain
  unverified or out of scope. No release was created or published.
