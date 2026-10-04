# Sprint 048 Builder Evidence

Date: 2026-10-03

## Outcome

**Entry gate resolved; implementation authorized (2026-10-03).** The Lead Developer dispositioned Sprint 047 **COMPLETE WITH RECORDED RESIDUALS** and explicitly authorized Sprint 048 to proceed with those residuals. The former blocker below is retained as a historical checkpoint, not the current status.

The disposition and sequencing authorization are recorded in `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 047 Builder evidence. Sprint 048 requirements, blueprint, and acceptance criteria remain the implementation contract.

Implemented `release:desktop`, clean-source rejection, isolated native packaging from a detached worktree, fresh target staging, actual installer/app/sidecar inspection, app-resource validation, SHA-256 target bundles, and separate package/manual-install statuses. The clean committed `0449fe4` build created `releases/0.6.0/linux-x64`, but native installation then failed: Electrobun's embedded installer rejects the PAX/GNU LongLink needed for a 108-character `glibconfig.h` path in the packaged libvips development headers. Sprint 048 is not complete. Commit `0c05a42` omits that unused header and rejects overlong app-payload paths before bundle promotion; a new version/target build and install test are still required.

## Worktree and Scope Boundary

At initial inspection, `git status --short --branch` reported branch `feat/create-v0.8` and pre-existing planning edits plus the untracked Sprint 048 preparation directory. The final status also includes pre-existing `planning/ideas/amx-language-features.md` changes and untracked `writing/2026-10-03_Computable_Documents.md`; neither was touched. This session changed only the release implementation, desktop build resources, tests, README and Sprint 047/048 planning/evidence files. No files were committed.

After the operator cleaned the earlier writing-file change, `bun run release:desktop` passed its clean-source gate and created the 0.6.0 Linux x64 bundle. Its install test failed as recorded below. Commit `0c05a42` contains the USTAR compatibility correction. The current dirty changes are the 0.8.0 manifests and related planning/test updates; release builds must wait until they are committed.

## 0.8.0 Authorization and Build Gate (2026-10-04)

The Lead Developer explicitly authorized `0.8.0` for the next desktop build. `bun run release:prepare 0.8.0` synchronized root, desktop, and extension manifests to `0.8.0`; `bun run release:check` passed with consistent versions/identity and Linux x64 host/packaging available. The five other target architectures remain unverified.

Before the 0.8.0 authorization, a `release:desktop` retry reached the stale `.linux-x64.lock` left by an earlier interrupted attempt. The detached source worktree was verified clean at `0449fe4`, with no active build process or accepted target. That abandoned worktree and lock were removed, while its empty staging directory was retained. The retry built `releases/0.6.0/linux-x64` and verified all bundle checksums, but the native installer failed on a PAX LongLink. Afterward, the Lead Developer authorized `0.8.0`; the manifests were prepared, and `release:desktop` correctly refused because the 0.8.0 manifest changes remain uncommitted. The USTAR fix is committed as `0c05a42`. The retained 0.6.0 bundle will not be overwritten.

## Implementation and Verification

| Command/experiment | Result |
| --- | --- |
| `bun run release:check` | Pass, read-only: versions consistent at `0.6.0`; identity valid (`OpenAMX Desktop`, `dev.openamx.desktop`); Linux x64 host/packaging available; Bun `1.4.2`, Hutch `0.27.1`, Node `v24.14.1`, vsce `3.9.2` available; five other targets unverified. |
| Hutch/Electrobun docs: `https://framework.blackboard.sh/electrobun/guides/bundling-and-distribution/` and CLI/build configuration docs | Existing stable build emits Linux Setup `.tar.gz`, Windows Setup `.zip`, and macOS `.dmg`; Hutch builds host-native and does not cross-compile. Used only to bound format selection; actual build below confirms Linux. |
| `git worktree add --detach /tmp/openamx-sprint048-probe-91682f1 91682f150a491aee7ff3c0c8320555b6c594d449` | Pass; isolated clean committed source at `91682f150a491aee7ff3c0c8320555b6c594d449`. |
| In the detached worktree: `bun install --frozen-lockfile`; `cd desktop-app && bun install --frozen-lockfile && bun run build` | First build failed because Vite could not resolve root dependency `csv-parse/sync`. After installing the root frozen lockfile, the same desktop stable build passed. This evidence established that both lockfiles are required. |
| Fresh probe build: `hutch electrobun build --env=stable` via `bun run build` | Pass on Linux x64, Hutch `0.27.1`, Electrobun `2.0.1`. Existing Vite warning: chunks exceed 500 kB. No output from the active dirty worktree was reused. |
| `verifyBuiltApp` against the clean probe output | Pass for identity/name/version, app/payload hash, Electrobun `2.0.1`, embedded Bun `1.4.0`, separate job worker, HTML/assets, Linux x64 ELF runtime, and native Electrobun libraries. This earlier probe package lacked `sharp` native resources, discovered by the install test below. |
| `bun run build:web` after adding `scripts/copy-sharp-runtime.ts`; `hutch electrobun build --env=dev` | Pass on active source; copies only the selected host's `@img/sharp-linux-x64` binding and `@img/sharp-libvips-linux-x64` package under app `Resources/app/bun/node_modules/@img`. Vite retains its existing >500 kB warning. Dev output is not release evidence. |
| `bun test ./tests/release.test.ts` | Pass: 24 tests, 0 failures (native installer formats, ELF/PE/Mach-O architecture decoding, dirty/inconsistent source rejection, package resources/version, update metadata, checksum/completion/conflict paths, spike-artifact rejection, and personal-path warning redaction). |
| `bun run build` | Pass: root TypeScript build. |
| `bun test ./tests` | Pass: 243 tests, 0 failures, 1,038 expectations across 18 repository-owned test files. |
| `bun test` | 643 passed, 24 failed. Failures came from generated Hutch SDK tests under legacy `desktop-app/spikes/sprint041-data-editor-proof/.hutch/devkit` (missing generated SDK fixture files and one framework fixture mismatch); the scoped repository-owned test command above passes. No spike outputs were modified to address these unrelated failures. |
| `cd desktop-app && bun run test` | Pass: desktop RPC/workflow contract suite, ending `Final active resources: []`. |
| `cd desktop-app && bun run typecheck` | Pass: Hutch prepare and `vue-tsc --noEmit`. |
| `cd desktop-app && bun run build:web` | Pass with fresh web/worker resources and copied Linux x64 `sharp` binding/libvips. Existing Vite >500 kB chunk warning remains. |
| `cd desktop-app && hutch electrobun build --env=dev` | Pass; app bundle contains `Resources/app/bun/node_modules/@img/sharp-linux-x64` and `sharp-libvips-linux-x64`. Dev output is not release evidence. |
| `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --types bun --skipLibCheck ../scripts/release/desktop.ts` from `desktop-app/` | Pass after latest inspector changes. |
| `bun run release:check` | Pass, read-only; consistent `0.6.0`, valid identity, Linux x64 host/packaging available, five other targets unverified. Packaging status does not certify installation/preview or bypass the clean-source gate. |
| First `bun run release:desktop` after the operator cleaned the source worktree | Pass for automated packaging; emitted a complete checksummed `releases/0.6.0/linux-x64` bundle from commit `0449fe474e408b25a176e58f1b00ed2c5b432723`. Subsequent isolated installer test failed with `TarUnsupportedFileType` on the PAX LongLink documented below. |
| Later `bun run release:desktop` with the USTAR source fix uncommitted | Expected refusal, exit 1: clean committed source guard. No second bundle was created and the existing 0.6.0 target was preserved. |
| `git diff --check` | Pass across final tracked changes. |

The successful `release:desktop` run emitted `releases/0.6.0/linux-x64` from commit `0449fe474e408b25a176e58f1b00ed2c5b432723`. `sha256sum -c releases/0.6.0/linux-x64/SHA256SUMS` passed for manifest, evidence, installer, update JSON, and app payload. The subsequent isolated native install failed during Electrobun's self-extractor with `TarUnsupportedFileType`. Raw tar inspection found one GNU LongLink (`././@LongLink`) for `OpenAMXDesktop/Resources/app/bun/node_modules/@img/sharp-libvips-linux-x64/lib/glib-2.0/include/glibconfig.h` (108 characters). Electrobun's bundled installer reports USTAR support; the GLib header is a build-time header and not needed at runtime. The source fix excludes `lib/glib-2.0` from the copied sharp runtime and package inspection now rejects any app-payload member path longer than 100 characters. Focused release tests pass after this change; it has not yet been packaged from a committed revision.

### 0.6.0 Target Bundle

The emitted bundle is retained and was not overwritten. `sha256sum -c releases/0.6.0/linux-x64/SHA256SUMS` passed for manifest, evidence, installer, update JSON, and app payload. The installer artifact is `OpenAMX-Desktop-0.6.0-linux-x64.tar.gz` (45,708,363 bytes; SHA-256 `8fa4ae5fc62c07c442661e7f8bfd004d8c7d36a949b596925fc99493c06f50fc`). Update metadata is 208 bytes (SHA-256 `0b423a4dc213da5599424e8786e93f172c4a1820715ad93c0e9f181e3d98fccc`); app payload is 44,156,466 bytes (SHA-256 `5f715e9da5e936ce84c97f180077febf6df040dbcc15766a8afcc7d240a93999`). The package/build manifest still truthfully records automated build checks as passed; the later native install failure is recorded separately here. Do not treat this 0.6.0 bundle as install-accepted.

### Clean Feasibility Artifacts

The clean probe produced these unaccepted artifacts under `/tmp/openamx-sprint048-probe-91682f1/desktop-app/artifacts/` (the detached worktree's ignored `desktop-app/artifacts/`):

| Artifact | Size | SHA-256 |
| --- | ---: | --- |
| `linux-x64-OpenAMXDesktop-Setup.tar.gz` | 38,754,808 bytes | `676d2fd252943ae8874c10fa725ec067429f4efc7db9d2ebd18d70301442c2b1` |
| `stable-linux-x64-update.json` | 208 bytes | `7c13219cc15d717b674834bab465c6ecb3981488f15a9f861b0ecd19b19e4ca6` |
| `stable-linux-x64-OpenAMXDesktop.tar.zst` | 37,196,421 bytes | `4a64cb835a829fe4f9e611c4ac307379ca673d2de8ddefb3d9d84d3ee9d56e5a` |

No transferable target bundle was emitted from the active tree. The above archive came from the Sprint 047 commit before the new `sharp` resource copy, so it is feasibility evidence only and must not be collected as a current Sprint 048 release.

### Native Host Evidence

- Host: Omarchy Linux `4.0.4`, x86_64, kernel `7.2.5-3-omarchy`; Bun `1.4.2`; Node `v24.14.1`; Hutch `0.27.1`; Electrobun `2.0.1`; packaged Bun runtime `1.4.0`.
- Installed the clean probe `.tar.gz` under isolated HOME `/tmp/openamx-sprint048-install.texg4C` using `PATH=/usr/bin:/bin`; installer placed the app under `.local/share/dev.openamx.desktop/stable/app`, created a desktop entry, and installed a standalone uninstaller. No user home outside this temporary root was changed.
- Exact installation sequence: `tar -xzf linux-x64-OpenAMXDesktop-Setup.tar.gz -C <isolated-home>/package`, then from that directory `env PATH=/usr/bin:/bin HOME=<isolated-home> XDG_DATA_HOME=<isolated-home>/.local/share XDG_CACHE_HOME=<isolated-home>/.cache XDG_STATE_HOME=<isolated-home>/.local/state ./installer`.
- The first stable package built before sharp-resource copying failed at launch because `sharp` could not load `@img/sharp-linux-x64`; that missing binding was added to the packaged resources.
- The post-`sharp` 0.6.0 Setup installer then failed during installation, before launch, with `TarUnsupportedFileType` because the payload includes the GNU LongLink for the overlong `glibconfig.h` header. No launch/preview result is claimed for this 0.6.0 installer.
- After the correction, the active-source dev package launched its embedded Bun `1.4.0` main process with restricted PATH and no sharp-loader error. Hyprland reported a mapped `OpenAMX` window on workspace 7. A screenshot captured workspace 1, and this Hyprland command wrapper rejected the workspace selection attempts; therefore no app screenshot, sample open, or preview interaction is claimed.
- The app logged `Application menus are not supported on Linux` and `X11 Error: GLXBadWindow (code 170)`. It remained process-alive until stopped by the Builder. No self-containment claim is made.
- `ldd` on installed Linux components showed system WebKitGTK `libwebkit2gtk-4.1.so.0`, JavaScriptCoreGTK 4.1, GTK 3, GLib, GStreamer/media, GL/EGL/Wayland/X11 and related libraries. The installed host already supplied these; no minimum OS baseline is inferred.
- Conservative `uninstall --quiet` removed the installed app and shortcut state while preserving `/tmp/openamx-sprint048-install.texg4C/Documents/user-data-sentinel.txt`. A WebKit cookie DB remained under the app's dev cache; no project document was placed in an app-managed directory. The standard path's full user-data preservation behavior remains an explicit follow-up check.
- Exact uninstall command: `env PATH=/usr/bin:/bin HOME=<isolated-home> XDG_DATA_HOME=<isolated-home>/.local/share XDG_CACHE_HOME=<isolated-home>/.cache XDG_STATE_HOME=<isolated-home>/.local/state <isolated-home>/.local/share/dev.openamx.desktop/stable/uninstall --quiet`.
- Linux x64 installer build feasibility is confirmed, but the emitted 0.6.0 installer failed installation and is not install-accepted. The USTAR-compatible source fix is uncommitted and a post-fix installer/install/launch/preview test remains pending. Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified. No target is classified unsupported.

## Historical Blocker and Resume Gate

The gate was previously unresolved and is now resolved by the Lead Developer direction above. Before the corrected packaging can be accepted, still require:

- Commit the USTAR-compatible source fix and use a new version (or obtain explicit approval before replacing the retained 0.6.0 target output).
- Build a fresh bundle, verify its checksums and resources, then repeat isolated install/launch/sample-preview/close/uninstall testing.

Do not treat the Sprint 047 disposition or 0.6.0 automated package checks as evidence for install acceptance, or as a waiver of Sprint 048 criteria.
