# OpenAMX Release Runbook

This runbook describes the implemented V0.8 local release workflow. A package build is not proof of installation, launch, platform support, license readiness, or publication. Release bundles are unsigned. GitHub operations are explicit and produce drafts; Marketplace submission is manual.

## Prerequisites and Limits

Use a clean clone of the reviewed full source commit. Install Git, Bun (1.0 or newer), Node.js, Hutch, and the repository's locked dependencies. `release:check` also probes `vsce`; the extension build uses the repository-local `vscode-extension/node_modules/.bin/vsce` when present. Install the root, desktop, and extension dependencies with their frozen lockfiles:

```sh
bun install --frozen-lockfile
cd desktop-app && bun install --frozen-lockfile && cd ..
cd vscode-extension && bun install --frozen-lockfile && cd ..
bun run release:check
```

The desktop build is host-native; it does not cross-compile. Recorded release-bundle build and inspection evidence exists only for Linux x64. The project owner reports having tested building and deploying OpenAMX on a Windows machine, but has not recorded the Windows version, architecture, toolchain, source revision, artifact, or exact deployment outcome. That report does not establish a Windows x64/arm64 release bundle or complete the documented native install/launch acceptance checks. The configured formats are Electrobun Linux Setup `.tar.gz`, Windows Setup `.zip`, and macOS `.dmg`. Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified in the release target matrix, not confirmed unsupported. `release:check` availability is a preflight result, not target certification.

The tested Linux host was Omarchy 4.0.4, x86_64, kernel `7.2.5-3-omarchy`, with Bun 1.4.2, Node v24.14.1, Hutch 0.27.1, and Electrobun 2.0.1. The installed app uses the host WebKitGTK 4.1, GTK/GLib, and related graphics/media libraries. This does not establish a minimum Linux distribution or self-contained runtime. Windows build/deployment testing is owner-reported, but its environment and unsigned-warning observations are not recorded; macOS prerequisites and unsigned-warning behavior have not been verified. Do not bypass operating-system warnings without the organization's release policy.

## Prepare and Commit

Choose a stable `MAJOR.MINOR.PATCH` version explicitly authorized by the release owner. The root `package.json` is the version authority; preparation updates the root, desktop, and extension package manifests only. It does not commit, tag, or build. Review the exact changes and commit all approved release source before building:

```sh
bun run release:prepare X.Y.Z
git diff -- package.json desktop-app/package.json vscode-extension/package.json
bun run release:check
git diff --check
git status --short
git add package.json desktop-app/package.json vscode-extension/package.json
git commit -m "Prepare OpenAMX X.Y.Z release"
git status --short
git rev-parse HEAD
```

The commit must contain the complete reviewed release source, not only version files. Do not build with a dirty tree. Never change versions just to work around an occupied output directory. `0.8.0` already has a retained Linux x64 bundle; request a new authorized stable version for a new production build. Preparation in disposable test fixtures is not authorization to change production manifests.

## Build on Each Host

At the same reviewed commit, install the locked dependencies and run these commands from the repository root on each available native host:

```sh
bun run release:check
bun run release:desktop
bun run release:extension
```

`release:desktop` builds only the current host target from a detached clean worktree. It inspects application identity/version, the embedded Bun runtime, worker and web resources, native `sharp` resources, installer, and Electrobun sidecars. `release:extension` packages and inspects one VSIX, including version, publisher, entrypoint, grammar, language configuration, license reference, and archive contents. The extension package is platform-neutral based on its JavaScript/JSON contents; that does not certify the desktop app on any additional platform.

Compressed Electrobun resources and update sidecars are inspected in memory using Bun's `node:zlib` Zstandard support (available in the tested Bun 1.4.2), without GNU `tar --zstd` or an external zstd executable. Use a current Bun release for this workflow; older versions without this API fail with an upgrade instruction. Inspection checks archive paths, member types, duplicates, checksums, and a 512 MiB decompressed-size limit. Runtime executable/library names and Sharp resources are checked for the native target, including Windows `.exe`/`.dll` files. These checks do not establish manual native installation or launch acceptance.

If an earlier Windows attempt failed with "Compressed Electrobun resource inspection is currently verified only on Linux", review and commit the updated release scripts before rerunning `bun run release:desktop`. The release command requires a clean committed tree and builds that commit, not uncommitted fixes. A failed staging attempt is not an accepted bundle and does not need to be deleted to retry; do not remove an existing accepted target bundle.

Successful bundles are written under `releases/<version>/<os>-<architecture>/` and `releases/<version>/extension/`. Each includes a manifest, evidence, `SHA256SUMS`, a full-commit `COMPLETE` marker, and artifact files. Desktop bundles retain the installer and generated Electrobun update sidecars. Staging is under `releases/.staging/`; incomplete desktop attempts include `failure.txt` and are not collectable. The accepted target or extension directory must not already exist. Build commands refuse to overwrite it.

Inspect `manifest.json` and `evidence.json`, then verify the file hashes. On Linux/macOS, from the bundle directory:

```sh
sha256sum -c SHA256SUMS
```

On macOS, use `shasum -a 256` to compare entries if `sha256sum` is unavailable. On Windows, compare each recorded digest with `Get-FileHash -Algorithm SHA256`. Collection performs its own exact-file-set, checksum, provenance, and archive-member validation on every host.

Build/package status is separate from manual install/launch status. The build evidence starts with `manualInstallLaunch: not_performed`. Install a fresh, authorized artifact only in an appropriate isolated test environment; record OS/distribution/version, architecture, dependencies, exact steps, sample preview, close/uninstall, and user-data observations separately. Do not infer those results from preflight, archive inspection, browser tests, or the historical Sprint 048 report.

For a Linux x64 install check, use a disposable home and extract the freshly built Setup archive before running its installer. This command shape follows the prior Sprint 048 isolated-home procedure; it is not a new Sprint 050 install result:

```sh
test_home=/tmp/openamx-release-test
mkdir -p "$test_home/package"
tar -xzf releases/X.Y.Z/linux-x64/artifacts/OpenAMX-Desktop-X.Y.Z-linux-x64.tar.gz -C "$test_home/package"
(
	cd "$test_home/package"
	env PATH=/usr/bin:/bin HOME="$test_home" \
		XDG_DATA_HOME="$test_home/.local/share" \
		XDG_CACHE_HOME="$test_home/.cache" \
		XDG_STATE_HOME="$test_home/.local/state" ./installer
)
```

Launch the installed app from the test desktop session, open a bundled AMX sample, verify preview, then close it and record the observations. Afterward invoke the installed `uninstall --quiet` under the same isolated `HOME`/`XDG_*` values; the prior procedure located it at `$test_home/.local/share/dev.openamx.desktop/stable/uninstall`. Do not pass `--delete-data` unless data deletion is separately authorized. Verify the disposable home and an external sentinel document after uninstall. The project owner reports a Windows build/deployment test, but its procedure and observations are not recorded here; record them on the native host before counting them toward these installation/launch checks. Windows-specific warning behavior and macOS installation/warning behavior also remain to be documented.

## Transfer and Collect

Transfer complete bundle directories without renaming or omitting files. Keep desktop and extension bundles from the same stable version and the same full 40-character source commit. On the collection machine, check out that clean commit, install dependencies, and pass at least one desktop bundle and exactly one extension bundle:

```sh
bun run release:collect /path/to/linux-x64 /path/to/extension
```

The collector validates source version/commit, manifest schemas, completion markers, exact file sets, sizes, hashes, safe paths, archive members, VSIX contents, and duplicate targets before it stages an assembly. A normal assembly is placed at `releases/<version>/assembled/`; an occupied destination is never replaced. The retained `releases/0.8.0/linux-x64/` bundle is a separate target bundle and must not be edited or forced into an assembly with a different commit.

To add a newly built target later, reuse the exact same-version, same-commit extension bundle and collect only targets absent from the immutable base:

```sh
bun run release:collect --addition /path/to/new-desktop-target /path/to/original-extension-bundle
```

The collector writes a separate directory under `releases/<version>/additions/<commit-prefix>/`; it requires byte-identical VSIX contents and rejects targets already in the base or an earlier addition. It does not mutate the base assembly.

## Verify and Publish

Verification is read-only and defaults to the root package version. It checks assembly integrity, source provenance, package/build status, target status, install/launch evidence, and license/notices readiness:

```sh
bun run release:verify X.Y.Z
```

Target statuses distinguish `available`, `missing`, `unverified`, and `unsupported`. These describe artifact/target evidence, not a broad support promise. A correct hash establishes transfer integrity, not signature, authenticity, or reproducible builds.

Production verification/publication remains blocked until the license owner confirms that `SEE LICENSE IN LICENSE.md` accurately represents the AGPL/commercial offer for Marketplace metadata and confirms required third-party notices or that none are required. The full AGPLv3 text is present and packaged, but `COMMERCIAL-LICENSE.md` is an overview, not the executed commercial agreement. Do not invent terms or notices. The `release:extension` package may be produced while readiness is blocked; a blocked result is not Marketplace-ready.

After successful verification and authorization for a real release, authenticate with `gh auth login` or a protected `GH_TOKEN`/`GITHUB_TOKEN` environment variable. Never put credentials in source, command arguments, or evidence. The command creates or extends a GitHub draft only; a human must review and publish that draft. Its default repository is `NovaEnergyConsulting/openamx`:

```sh
bun run release:publish --version=X.Y.Z --assembly=releases/X.Y.Z/assembled
```

Use `--repo=OWNER/REPOSITORY` only when the release owner selects another repository. If target artifacts are missing, unverified, or unsupported, publication requires explicit `--allow-partial`; the draft records the partial target status. Never use this flag to bypass license readiness or integrity/provenance blockers. Existing tags must resolve to the recorded source commit. Published releases, tags, and conflicting asset bytes are never replaced. Marketplace upload is not automated: submit the inspected VSIX manually under the `EngineersTools` publisher after the license owner clears the metadata/notices gate.

Automated tests inject in-memory GitHub clients or fake HTTP responses. They must not use public GitHub endpoints or publish fixture releases. A real release is a separate operator action and needs its own explicit authorization.

## Publish the CLI to npm

The command-line tool is published to npm as `@nova-energy/openamx`. It requires Bun at runtime (`bunx @nova-energy/openamx` or a global `bun add -g`); Node and Deno are not supported. JSR publication is deferred until the CLI no longer depends on Bun-only APIs.

From a clean committed tree at the prepared version:

```sh
bun run release:cli
```

This compiles the CLI into `releases/.staging/`, generates a scoped package manifest without lifecycle scripts or development dependencies, runs `npm pack`, and rejects tarballs with undeclared files, a missing license, a non-Bun entry point, or a mismatched name/version. It then installs the tarball into a temporary project with Bun and checks `--version`, `run`, `render`, and PDF/DOCX export of `examples/hello-world.amx`. The accepted bundle is written to `releases/<version>/cli/` with `manifest.json`, `evidence.json`, `SHA256SUMS`, and `COMPLETE`, and is never overwritten. Finally it runs `npm publish --dry-run`; nothing is uploaded.

After reviewing the dry-run file list and obtaining release authorization, run `npm login` with an account that can publish to the `@nova-energy` scope, then:

```sh
bun run release:cli --publish
```

Publication reuses the existing bundle for the current commit, re-checks its hash and contents, refuses if the version already exists on npm, and uploads that exact tarball. Supply a one-time password through `NPM_CONFIG_OTP` or the interactive prompt; never put credentials in source or evidence. The license/notices gate described above applies to the npm package as well; the package metadata uses `SEE LICENSE IN LICENSE.md`.

## Recovery and Retention

- If preflight reports inconsistent versions or missing tools, install/repair prerequisites or explicitly prepare and review an authorized version; `release:check` does not repair files.
- If a build reports a dirty tree, review and commit the intended source. Do not stash or discard changes automatically to make a release proceed.
- If an accepted target, extension bundle, or assembly already exists, stop. Do not delete it or retry into the same path. Review its provenance and use a separately authorized unused version if another production build is needed.
- If desktop staging reports failure, preserve and inspect the named incomplete attempt and `failure.txt`; it is not a bundle. Confirm no build is active before investigating a lock. Do not remove accepted outputs or staging blindly.
- If collection rejects an input, correct or rebuild the transferred bundle from the same commit. Collection validates all inputs before promotion and removes its incomplete assembly staging on failure.
- If GitHub upload is interrupted, the draft is retained. Retry the same verified assembly: identical remote assets are confirmed by bytes/hash, missing assets may be uploaded, and conflicting assets or moved tags stop the operation. Do not delete/replace remote assets to force a retry.
- Keep release directories and transferred bundles as retained evidence. `releases/` is ignored by Git and the scripts perform no automatic cleanup. Back up accepted bundles and their manifests/checksum records according to the project's retention policy.

## Next Version Checklist

1. Obtain explicit authorization for an unused stable version and confirm license/notices readiness before claiming production verification or publication readiness.
2. Review and commit synchronized manifests plus all intended source changes; record the full commit.
3. Run preflight and build only on available native hosts. Record unavailable targets as unverified unless evidence establishes unsupported status.
4. Inspect bundle provenance, artifact contents, checksums, warnings, and separate manual install/launch results.
5. Transfer intact bundles to a clean matching source checkout; collect, verify, and review target gaps.
6. Request separate authorization before creating a real GitHub draft. Review and publish the draft manually; submit the VSIX to Marketplace manually only after license-owner clearance.
7. Preserve all accepted outputs and record exact commands, tool/host versions, hashes, failures, and residual owners for the next release.