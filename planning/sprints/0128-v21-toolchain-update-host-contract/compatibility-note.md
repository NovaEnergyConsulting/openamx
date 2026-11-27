# Sprint 128 Toolchain and Update-Host Compatibility Note

## Status

Planning template only. No Sprint 128 implementation, build, or artifact
verification has been performed. Complete from authorized run evidence and
obtain a separate Product Owner disposition before Sprint 129 begins.

## Toolchain Selection

| Item | Planned candidate | Verified result |
| --- | --- | --- |
| Hutch CLI | `0.30.0` as paired by official docs reviewed 2026-11-27 | Pending recheck and authorized `hutch status` evidence |
| Electrobun | `2.0.7` as paired by official docs reviewed 2026-11-27 | Pending recheck, exact project pin, and prepare/build evidence |
| Documentation checked | [Hutch guide](https://docs.electrobun.dev/electrobun/guides/hutch/), [Updates guide](https://docs.electrobun.dev/electrobun/guides/updates/) | Record URLs, access date, relevant version statement, and any newer guidance |
| Host | Not selected | Record OS, architecture, tool versions, and native target |

The planning candidates are not approved immutable pins. Replace them only
with the exact compatible stable pair established by the authorized
revalidation.

## Project Configuration

- Hutch project pragma: pending implementation/evidence.
- Exact `electrobun.version`: pending implementation/evidence.
- `release.baseUrl`: expected
  `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download`.
- App name and identifier: expected unchanged as `OpenAMX Desktop` and
  `dev.openamx.desktop`.
- Channel: expected unchanged as `stable`.
- Configuration validation commands/results: pending.

## Artifact Inventory and Flow

| Required role | Generated filename(s) | Target bundle | Assembly | Flat publisher name | Result |
| --- | --- | --- | --- | --- | --- |
| Stable update manifest | Pending | Pending | Pending | Pending | NOT RUN |
| Full `.tar.zst` update payload | Pending | Pending | Pending | Pending | NOT RUN |
| Current checksum sidecar | Pending | Pending | Pending | Pending | NOT RUN |
| Installer | Pending | Pending | Pending | Pending | NOT RUN |
| Optional patch trail | Pending policy decision | Pending | Pending | Pending | NOT RUN |

Record exact basename, byte size, SHA-256, metadata references, and any
required integrity fields for every file. Record duplicate-name checks and
confirm no file was renamed, dropped, or replaced.

## Delta-Patch Policy

- Decision: Pending.
- Supported Hutch/Electrobun opt-out or patch behavior: Pending official
  documentation/config inspection.
- If full-bundle-only: record the explicit setting and full-bundle evidence.
- If enabled: list supported source-to-target patch edges and prove every
  required patch is present in the latest release's flat asset set.
- If neither route is proven: mark Sprint 128 `BLOCKED`; do not start Sprint
  129.

## Verification Results

| Check | Status | Evidence reference |
| --- | --- | --- |
| Exact toolchain revalidated and pinned | NOT RUN | Pending |
| Electrobun prepare/config validation | NOT RUN | Pending |
| Focused release contract tests | NOT RUN | Pending |
| Native stable artifact inventory | NOT RUN | Pending |
| Target bundle/assembly name retention | NOT RUN | Pending |
| Publisher flat-name uniqueness with injected client | NOT RUN | Pending |
| Patch policy and full-bundle fallback | NOT RUN | Pending |
| Other native platforms | NOT RUN | Pending; do not infer certification |

## Disposition and Residuals

- Builder recommendation: Pending.
- Product Owner disposition: Pending.
- Sprint 129 entry gate: Do not proceed until this note is complete,
  dispositioned, and the patch policy is safe for the selected release
  pipeline.
- Residuals/limitations: Pending.
