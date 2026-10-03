# Sprint 048 Builder Evidence

Date: 2026-10-03

## Outcome

**Entry gate resolved; implementation authorized (2026-10-03).** The Lead Developer dispositioned Sprint 047 **COMPLETE WITH RECORDED RESIDUALS** and explicitly authorized Sprint 048 to proceed with those residuals. The former blocker below is retained as a historical checkpoint, not the current status.

The disposition and sequencing authorization are recorded in `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 047 Builder evidence. Sprint 048 requirements, blueprint, and acceptance criteria remain the implementation contract.

Implemented `release:desktop`, clean-source rejection, isolated native packaging from a detached worktree, fresh target staging, actual installer/app/sidecar inspection, app-resource validation, SHA-256 target bundles, and separate package/manual-install statuses. Installer feasibility is confirmed for current-host Linux x64 using existing Hutch/Electrobun output. Sprint 048 is not complete: a post-`sharp`-fix stable package has not been built because the active worktree is dirty; native preview interaction remains unverified; the remote target matrix remains unverified.

## Worktree and Scope Boundary

At initial inspection, `git status --short --branch` reported branch `feat/create-v0.8` and pre-existing planning edits plus the untracked Sprint 048 preparation directory. The final status also includes pre-existing `planning/ideas/amx-language-features.md` changes and untracked `writing/2026-10-03_Computable_Documents.md`; neither was touched. This session changed only the release implementation, desktop build resources, tests, README and Sprint 047/048 planning/evidence files. No files were committed.

The active working tree is dirty. `bun run release:desktop` was run from the repository root and exited 1 with `Release builds require a clean committed source tree`; it created no target bundle. The clean committed feasibility build below predates the resource-correction changes and is not presented as a release bundle for current source.

## Implementation and Verification

| Command/experiment | Result |
| --- | --- |
| `bun run release:check` | Pass, read-only: versions consistent at `0.6.0`; identity valid (`OpenAMX Desktop`, `dev.openamx.desktop`); Linux x64 available; Bun `1.4.2`, Hutch `0.27.1`, Node `v24.14.1`, vsce `3.9.2` available; five other targets unverified. |
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
| `bun run release:desktop` | Expected refusal, exit 1: active worktree is dirty. No `releases/` output or target lock was created. |
| `git diff --check` | Pass across final tracked changes. |

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
- Initial installed stable app launch with Bun/Node/Hutch absent from PATH failed before window creation because `sharp` could not load `@img/sharp-linux-x64`. This revealed the omitted optional native packages and drove the copy/inspection correction.
- After the correction, the active-source dev package launched its embedded Bun `1.4.0` main process with restricted PATH and no sharp-loader error. Hyprland reported a mapped `OpenAMX` window on workspace 7. A screenshot captured workspace 1, and this Hyprland command wrapper rejected the workspace selection attempts; therefore no app screenshot, sample open, or preview interaction is claimed.
- The app logged `Application menus are not supported on Linux` and `X11 Error: GLXBadWindow (code 170)`. It remained process-alive until stopped by the Builder. No self-containment claim is made.
- `ldd` on installed Linux components showed system WebKitGTK `libwebkit2gtk-4.1.so.0`, JavaScriptCoreGTK 4.1, GTK 3, GLib, GStreamer/media, GL/EGL/Wayland/X11 and related libraries. The installed host already supplied these; no minimum OS baseline is inferred.
- Conservative `uninstall --quiet` removed the installed app and shortcut state while preserving `/tmp/openamx-sprint048-install.texg4C/Documents/user-data-sentinel.txt`. A WebKit cookie DB remained under the app's dev cache; no project document was placed in an app-managed directory. The standard path's full user-data preservation behavior remains an explicit follow-up check.
- Exact uninstall command: `env PATH=/usr/bin:/bin HOME=<isolated-home> XDG_DATA_HOME=<isolated-home>/.local/share XDG_CACHE_HOME=<isolated-home>/.cache XDG_STATE_HOME=<isolated-home>/.local/state <isolated-home>/.local/share/dev.openamx.desktop/stable/uninstall --quiet`.
- Linux x64 installer feasibility is confirmed, but the post-fix stable install/launch/preview is unverified. Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified. No target is classified unsupported.

## Historical Blocker and Resume Gate

The gate was previously unresolved and is now resolved by the Lead Developer direction above. Before any publishable build, still require:

- A clean committed source revision, as required by Sprint 048 acceptance.

Do not treat the Sprint 047 disposition as evidence for any native packaging or platform residual, or as a waiver of Sprint 048 criteria. The native stable build must be rerun after these changes are committed, and a visible sample preview/native acceptance check remains open.
