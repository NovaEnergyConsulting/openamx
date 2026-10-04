# Sprint 049 Blueprint: Extension Packaging and Release Assembly

## Approach

1. Confirm Sprint 047 and Sprint 048 dispositions and inspect their finalized contracts/evidence. Keep extension-only work independent from collection; collection/publication consumes only complete Sprint 048 bundles with matching version and full source commit.
2. Establish exact license/package baseline without interpreting terms: inventory `LICENSE.md`, `COMMERCIAL-LICENSE.md`, any full license text and dependency notices, extension package metadata, `.vscodeignore`, `vsce` warnings, current extension README, and package contents. Record that `LICENSE.md` currently references a separate full `LICENSE` file not present in the workspace. Ask the Lead Developer/user to supply or identify missing authoritative material; do not draft it. Continue tests with explicit fixtures while production readiness remains blocked.
3. Implement the extension command through the existing `bun run package` / esbuild / vsce path. Validate version/publisher/entrypoint before invoking package; stage a clean package output without picking up stale VSIXs. Inspect the generated archive and package listing for version, `EngineersTools`, `dist/extension.js`, `amx.tmGrammar.json`, `language-configuration.json`, required metadata, license/notices and absence of secrets/build/test/repository debris. Record package hash and exact tool versions.
4. Establish VSIX platform neutrality from metadata, package structure, dependencies, and actual `vsce` contract. Keep Marketplace submission manual and retain the existing publisher. Update the extension README's stale version/license statements with only verified, current information.
5. Implement `release:collect <bundles>` against the Sprint 048 target-bundle schema. Parse structured manifests, validate schema and required fields, normalize/reject unsafe relative paths, verify checksums/sizes/complete markers and artifact records, and ensure all bundles plus VSIX share one stable version and full source commit. Determine duplicate, requested-target, and status outcomes before creating any accepted output.
6. Keep bundle validation and file installation transactional: build a fresh collection staging tree, reject corrupted/missing/unsafe/conflicting data without changing accepted releases, write the release-wide manifest/checksums/status, then promote atomically only to an absent `releases/<version>/` destination. Never overwrite a prior version or silently discard an artifact. Preserve update sidecars exactly as emitted.
7. Implement `release:verify` as a read-only check of collected local assets, provenance, checksums, app identity, release/target status, package checks, install evidence, and license/notices readiness. Report missing/unverified/unsupported requested targets and any incomplete/manual evidence accurately. Do not infer installation from package success.
8. Implement explicit `release:publish` using the supported GitHub interface with default repo `NovaEnergyConsulting/openamx` and an explicit override. Preflight credentials and all local verification before remote changes. Create a draft for a new release, require explicit partial-release acknowledgement, verify `v<version>` tag consistency at the recorded commit, upload assets, then verify remote asset identity/hash. Do not move tags or replace conflicting assets.
9. Model retries as stateful but immutable operations. On retry, compare an existing tag/release and assets with the local version/revision; accept only identical already-uploaded assets, add only nonconflicting later assets for that same release, and leave interrupted releases draft/incomplete with clear remediation. Do not publish real fixtures in tests.
10. Add focused fixtures for complete/incomplete 0.8.0-like bundles and extension packages, at least one additional target state, corruption/traversal/symlink/conflicts, mixed version/revision, missing license/notices, remote tag/assets, authentication, and interrupted upload. Mock GitHub calls and prove no test reaches a public endpoint.
11. Run focused release/extension tests, package and inspect the actual VSIX when license conditions permit (otherwise record the precise warning/blocker and keep fixture-based coverage), applicable root/desktop/extension checks, and `git diff --check`. Update Builder evidence plus `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`; list exact commands, hashes, statuses, remote mock outcomes, and limitations.

## Command Responsibilities

| Command | Sprint 049 contract |
| --- | --- |
| `release:extension` | Validate stable version and publisher metadata, package with existing esbuild/vsce tooling, inspect package contents and licensing/notices, and emit versioned VSIX/evidence without publishing. |
| `release:collect <bundles>` | Validate manually transferred target bundles and VSIX for one version/full revision; reject unsafe, corrupt, mixed, stale, or conflicting inputs; atomically assemble only a complete accepted local release. |
| `release:verify` | Read-only validation of manifest, files/checksums, provenance, identity, licensing readiness, and recorded build/manual status before publication. |
| `release:publish` | Explicitly publish or extend a GitHub Release; require partial-release acknowledgement, preserve tag/assets, support safe retry, and never publish through automated acceptance tests. |

## Files to Update

- `scripts/release.ts` command dispatch and focused adapters under `scripts/release/`
- `scripts/release/extension.ts` and collection/verification/publication modules only if they reduce real complexity and fit current conventions
- Root `package.json` release commands
- `vscode-extension/package.json`, `.vscodeignore`, and extension README for accurate package/license/publisher usage metadata
- Existing `tests/release.test.ts` and extension packaging tests/conventions
- Actual supplied license/notice files only as needed to include them; never create legal text
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 049 Builder evidence and package/collection inspection evidence

## Notes

The current release source is root version `0.8.0`, and Sprint 048 produced a verified Linux x64 bundle for commit `1a9585a24b5ec3c69afbccab0501e46752cbd104`; the bundle's Builder evidence records native manual install as not performed, while a later Lead Developer disposition separately reports successful launch/use. Preserve these distinct evidence records. Use the bundle only when the extension/package commit and collection input satisfy the same full-commit provenance contract. The existing license overview may not be enough for vsce/Marketplace or required full-text distribution; no readiness claim is allowed until actual requirements and authoritative files are confirmed.