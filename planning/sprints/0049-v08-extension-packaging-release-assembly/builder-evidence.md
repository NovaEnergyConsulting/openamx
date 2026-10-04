# Sprint 049 Builder Evidence

Date: 2026-10-04

## Outcome

Implemented the extension package inspector/adapter, root `release:extension`, safe transfer-bundle collection, read-only verification, and explicit draft-only `release:publish`. Added fixture-backed security/provenance checks and mock-only GitHub tests. No Marketplace upload or real GitHub API/public release was attempted. No legal terms/notices were authored or modified.

Sprint 049 is **IMPLEMENTATION COMPLETE WITH RELEASE-READINESS BLOCKERS**. The repository contains a release package candidate, but it is not production/license ready. The active source is dirty and its full commit is `b92f6021284a58213641287043989267ebf387a5`; the retained Sprint 048 0.8.0 Linux x64 bundle records `1a9585a24b5ec3c69afbccab0501e46752cbd104`. The real desktop bundle was not collected or changed. Fixture tests prove mismatched provenance is rejected and accepted output preserved.

## Extension Package Inspection

- Root, desktop, and extension package versions are `0.8.0`; publisher remains `EngineersTools`; package entrypoint is `./dist/extension.js`.
- The user concurrently supplied a complete AGPLv3 text in root `LICENSE.md` (SHA-256 `a96fd9920a72e79720d41bcf32ccd58634194aa01ee82f246a72392015d626e9`). The Builder preserved that file. Installed `@vscode/vsce` 3.9.2 source confirms support for `SEE LICENSE IN <file>`; package metadata now uses `SEE LICENSE IN LICENSE.md`, and a local staging helper copies the root file unchanged beside the extension manifest.
- Initial package inspection, before the license was supplied, visibly warned `LICENSE, LICENSE.md, or LICENSE.txt not found`; the warning was acknowledged to continue that earlier local inspection, not suppressed. After the user supplied the full text, `cd vscode-extension && bun run package` passed with no missing-license warning. `vsce` still reports the large 385.01 KB bundled extension advisory and, on the earlier output, that 4.0.0 is newer than installed 3.9.2.
- Final generated artifact `vscode-extension/openamx-vscode-0.8.0.vsix` is 93.3 KB packaged / 449,570 uncompressed bytes, SHA-256 `8686c079b5afb47005aab5c828a9b8d6bfd41baa403db8cc94c90285cb6d34a0`.
- Exact VSIX members: `[Content_Types].xml`, `extension.vsixmanifest`, `extension/package.json`, `extension/LICENSE.md`, `extension/amx.tmGrammar.json`, `extension/language-configuration.json`, `extension/readme.md`, and `extension/dist/extension.js`. No source, test output, secrets, native binary or installation helper was included. `.vscodeignore` excludes `install-local.mjs` and `package-local.mjs`.
- Package contents are platform-neutral JavaScript/JSON with the VS Code API external; this supports one VSIX package for the listed VS Code hosts, not native desktop certification or Marketplace acceptance.
- The first pre-fix artifact was 82.07 KB and contained `install-local.mjs`; it was generated before helper exclusions and license inclusion, and is not accepted output. The later 7-file temporary artifact is likewise superseded by the final 8-file licensed artifact.
- Full AGPLv3 terms are now included. `COMMERCIAL-LICENSE.md` remains an overview of a separately executed agreement; no authoritative NOTICE/THIRD-PARTY-NOTICES file or owner confirmation that none is required is recorded. The package's AGPL reference has not been confirmed as the correct Marketplace metadata for the separate commercial option. `release:verify` and `release:publish` remain blocked pending license-owner confirmation of the dual-license package reference and dependency notice requirements.

## Collection, Verification, Publication

- `release:collect` validates exact bundle file sets, schema/version/full 40-character commit, target and desktop application identity, extension publisher/entrypoint, VSIX internals, completion markers, artifact sizes and SHA-256, sidecar preservation, and `SHA256SUMS`. It rejects unsafe paths, symlinks/non-regular members (including symlinked parent paths), undeclared files, malformed or incomplete bundles, mixed provenance/version, corruption, and duplicate targets before promotion. TAR.GZ and ZIP members are parsed without extraction; TAR.ZST sidecars are screened using `tar --zstd -tvf`. Traversal, link/special member types, invalid headers, oversized archives and excessive member counts fail. The retained real sidecar was screened with no link/traversal-looking names. Collection copies only declared installer/sidecar/VSIX artifacts into fresh staging and promotes only to an absent `releases/<version>/assembled/` path; the separate path preserves Sprint 048's existing `linux-x64` directory.
- `release:verify` is read-only. It validates the exact assembled file set, manifest/artifact hashes and sizes, full-commit completion marker, app/publisher identity, target `available`/`missing`/`unverified`/`unsupported` state, package/build status, per-target manual install/launch evidence, and license readiness. Desktop package/build status is kept separate from desktop and extension manual install/launch observations.
- Same-revision additions use `release:collect --addition <bundles>` and create a new unique assembly under `releases/<version>/additions/<commit-prefix>/<id>/`. The collector verifies the immutable base and prior additions, requires identical VSIX bytes/version/full commit, rejects targets already present, and never mutates the base or prior additions. `release:publish --assembly=<path>` explicitly selects the base or a supplement for the same draft.
- `release:publish` defaults to `NovaEnergyConsulting/openamx`, permits `--repo=OWNER/REPOSITORY`, and requires `--allow-partial` before remote mutation when target artifacts are missing/unverified/unsupported. It requires authentication through `gh auth token`, `GH_TOKEN`, or `GITHUB_TOKEN`; errors omit credentials and response bodies. New releases are drafts. Existing tags must resolve to the recorded full commit; published releases are not modified. Existing assets are downloaded and hash-checked; identical retries are accepted, conflicting bytes/name collisions are refused, and later same-revision assets may be added. Upload failures leave the draft retryable.
- All remote tests use an injected in-memory GitHub client or fake `fetch` returning 401. Tests cover draft creation, partial acknowledgement before mutation, tag mismatch, post-create tag check, non-draft refusal, auth redaction, identical retries, later additions, conflicts, remote byte verification, and interrupted upload. No public endpoint was contacted.
- Disposable collection fixtures pass matching bundles and reject corruption, symlink members, duplicate targets and mismatched commits. They prove read-only verify and preservation of an existing accepted assembly. The real 0.8.0 desktop bundle was deliberately not collected because its source commit does not match the active source and the current tree is dirty.

## Verification

Environment: Omarchy Linux x86_64; Bun 1.4.2; Node v24.14.1; Hutch 0.27.1; Electrobun 2.0.1; `@vscode/vsce` 3.9.2; Extension Development Host VS Code 1.85.0.

| Command | Result |
| --- | --- |
| `bun test ./tests/release.test.ts` | Pass: 38 tests, 124 expectations; covers release/extension inspection, unsafe VSIX/bundle/TAR paths, collection/provenance/checksums, immutable same-revision additions, verification, license-owner confirmation gating, production publication blocking, and mocked publication/retries. |
| `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --types bun --skipLibCheck scripts/release.ts scripts/release/desktop.ts scripts/release/extension.ts scripts/release/assembly.ts scripts/release/publish.ts` | Pass. |
| `cd vscode-extension && bun run test` | Pass: compile, test TypeScript, and 19 Extension Development Host tests; VS Code 1.85.0. Existing Fontconfig and Python API proposal warnings appeared. |
| `cd vscode-extension && bun run package` | Pass with the supplied full AGPLv3 file included via `SEE LICENSE IN LICENSE.md`; 8 VSIX files, 93.3 KB. No missing-license warning. |
| `bun run build` | Pass (root TypeScript). |
| `bun test` | Pass: 283 tests, 0 failures, 26 files. |
| `bun test ./tests` | Pass: 257 tests, 0 failures, 18 repository-owned root test files. |
| `cd desktop-app && bun run test` | Pass; desktop RPC/workflow contracts and 5-format serialization; `Final active resources: []`. |
| `cd desktop-app && bun run typecheck` | Pass (`hutch electrobun prepare && vue-tsc --noEmit`). |
| `git diff --check` | Pass after the release implementation and planning edits. |

VSIX was built by direct package tooling from the current worktree because the new `release:extension` clean-committed-source guard correctly rejects the dirty implementation tree. Therefore no accepted extension release bundle was produced from this uncommitted source. The production command's staging/promotion path is covered at unit level; final CLI execution requires a clean commit. No new dependency was added.

## Target and Release Readiness

The retained Sprint 048 bundle remains unchanged at `releases/0.8.0/linux-x64`. Its manifest records installer size 45,705,503 bytes and SHA-256 `73eac3441f2583c8f7e9f8234532a4d53bbd973714f8fb9df55dcc87e4c6dd09`; update metadata and app payload remain as listed in that manifest. Its recorded source commit differs from this worktree. Linux x64 package availability and the Lead Developer's separately reported successful install/launch do not upgrade any remote target. Linux arm64, Windows x64/arm64 and macOS x64/arm64 remain unverified; no target is confirmed unsupported.

Remaining blockers/residuals:

- Confirm the custom AGPL reference is correct Marketplace metadata for the dual-license offer and identify required third-party notices or confirm none are required. The full AGPLv3 text is now supplied and included unchanged; do not draft or alter legal terms.
- Commit the release implementation before generating a provenance-valid extension bundle. Rebuild the VSIX from that committed source and record the accepted release bundle hashes.
- Obtain matching desktop/extension full source commit outputs before collecting. The current real desktop bundle is intentionally rejected as mixed provenance.
- No real GitHub authentication/publication was attempted. Marketplace submission remains manual. Native targets beyond Linux x64 remain unverified.
- Sprint 050 integrated repeat-release acceptance and the consolidated operator runbook remain out of scope.