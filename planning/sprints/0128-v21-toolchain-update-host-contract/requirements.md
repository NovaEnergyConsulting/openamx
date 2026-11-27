# Sprint 128 Requirements: V0.21 Toolchain and Update-Host Contract

## Document Status

Architect-prepared sprint candidate, pending Product Owner scope approval and
separate exact execution authorization. This packet authorizes documentation
preparation only. It authorizes no source edit, dependency installation,
Hutch/Electrobun build, release operation, or public endpoint request.

## Goal

Establish a reproducible Hutch/Electrobun toolchain and a tested static update
artifact contract for V0.21. Configure the stable GitHub Releases host without
changing the desktop app identity or stable channel. Document and disposition
whether V0.21 ships delta patches or uses full-bundle updates only. Complete a
compatibility note that gates Sprint 129 updater implementation.

## Inputs and Authority

- V0.21 scope and sprint sequencing:
  [`plan-openamxV21MasterSprintPlan.md`](../../plan-openamxV21MasterSprintPlan.md).
- Prior lifecycle and residuals:
  [`planning/state.md`](../../state.md) and
  [`planning/decisions.md`](../../decisions.md). Preserve all V0.20 raw
  outcomes and recorded residuals; Sprint 128 does not resolve them.
- Current toolchain/build configuration: `desktop-app/hutch.config.ts`,
  `desktop-app/electrobun.config.ts`, `desktop-app/app-metadata.ts`, and
  `desktop-app/package.json`.
- Current target artifact and publication surfaces:
  `scripts/release/desktop.ts`, `scripts/release/assembly.ts`,
  `scripts/release/publish.ts`, `scripts/release.ts`, and
  `tests/release.test.ts`.
- Official references reviewed for planning on 2026-11-27:
  [Hutch guide](https://docs.electrobun.dev/electrobun/guides/hutch/) and
  [Updates guide](https://docs.electrobun.dev/electrobun/guides/updates/).
  Recheck both before implementation and record the exact revision/date and
  selected versions in the compatibility note.

## Baseline Observations

- `desktop-app/hutch.config.ts` currently pins Electrobun `2.0.5` and has no
  Hutch CLI project pragma. The official guide documents the first-line
  `// @hutch cli=<exact-version>` pragma and an exact `electrobun.version`.
- The official compatibility table currently pairs Electrobun `2.0.7` with
  Hutch `0.30.0`. Treat this as a candidate, not an irrevocable pin; confirm
  latest compatible stable versions before changing configuration.
- `desktop-app/electrobun.config.ts` has no `release.baseUrl`.
- `scripts/release/desktop.ts` currently validates the update manifest and
  referenced `.tar.zst`, then retains files with the matching stable
  platform/architecture prefix. Release assembly preserves target paths;
  publishing uses flat basenames and rejects duplicate names.
- Existing release tests cover manifest metadata and compressed sidecar
  integrity, but the complete current update-artifact set and flat-name
  publication contract need focused end-to-end contract assertions.

## In Scope

- Revalidate and pin one exact compatible stable Hutch/Electrobun pair using
  the documented project pin mechanisms.
- Set `release.baseUrl` to
  `https://github.com/NovaEnergyConsulting/openamx/releases/latest/download`.
- Preserve `app.name`, `app.identifier`, application version authority, and
  the stable release channel.
- Inspect fresh native build artifacts, target bundle assembly, and publisher
  asset naming against the pinned toolchain's official artifact contract.
- Decide and record the delta-patch policy. If patches are enabled, prove that
  the complete supported patch trail is retained and uniquely publishable. If
  patches are disabled, use an officially supported explicit configuration
  and prove that full-bundle updates remain available.
- Add focused local contract tests for required manifests, full bundles,
  checksum sidecars, optional patches, unchanged basenames, and duplicate-name
  rejection. Tests must use fixtures/injected clients, not public GitHub.
- Complete and disposition `compatibility-note.md` before Sprint 129 begins.

## Out of Scope

- Main-process updater integration, RPC, update UI, consent flow, or quit/apply
  behavior; these belong to Sprints 129-130.
- General release-runbook edits; Sprint 131 owns V0.21 release documentation.
- Real GitHub release creation, publication, asset mutation, or public-host
  validation.
- Root/desktop package version changes, app identity changes, canary support,
  managed hosting, signing, deployment, or platform certification.
- V0.20 residual disposition or changes to its historical evidence.

## Constraints

- The stable URL must be HTTPS and use GitHub's `/releases/latest/download`
  route. Drafts and prereleases must not be treated as the stable target.
- Artifact basenames must remain unchanged from Hutch output through the
  target bundle, assembly, and eventual flat GitHub assets.
- The stable update manifest must never refer to a missing payload or patch.
  Do not silently discard generated sidecars.
- Prefer full-bundle-only updates if Hutch supports an explicit, documented
  no-patch setting and the current pipeline cannot prove patch-chain
  retention. If neither safe policy can be demonstrated, stop and request a
  separate scope/product decision before Sprint 129.
- Keep generated Hutch state, build outputs, desktop artifacts, release
  bundles, and all prior sprint evidence out of the primary worktree. Use a
  separately authorized validation worktree and preserve its raw results.
- Sprint 128 acceptance is a host/artifact contract, not evidence that the
  updater works on every platform or that any release is authorized.
