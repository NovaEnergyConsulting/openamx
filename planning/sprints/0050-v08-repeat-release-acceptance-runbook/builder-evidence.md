# Sprint 050 Builder Evidence

Date: 2026-10-04

## Outcome and Disposition Recommendation

The V0.8 operator runbook and disposable release fixtures are implemented and verified. **Sprint 050 integrated acceptance is not declared complete.** Sprint 049 still has no recorded Lead Developer disposition or explicit authorization with named residuals, as required by the entry gate. Request that disposition before integrated closeout.

No fresh production release build or native install was attempted. The worktree is dirty, the retained `0.8.0/linux-x64` output already exists, no other stable version is authorized, and license/notices readiness is unresolved. These are stop conditions, not failed packaging checks. The real retained bundle was not modified or collected. No public GitHub operation or Marketplace upload occurred.

## Host and Provenance

- Host: Omarchy Linux 4.0.4, x86_64, kernel `7.2.5-3-omarchy` (`Linux nova 7.2.5-3-omarchy`).
- Tools: Bun `1.4.2`, Node `v24.14.1`, Hutch `0.27.1`, `@vscode/vsce` `3.9.2`, pinned Electrobun `2.0.1`; the desktop bundle records embedded Bun `1.4.0`.
- Branch/source HEAD: `feat/create-v0.8`, commit `8ce88673c060807ba8505b631c9465ecc9f71ea5`.
- Release checks were read-only, but the tree was dirty, so clean-source packaging gates were not met. Final worktree status also shows unrelated image changes (`assets/images/{OneDoc.ico,OneDoc_Logo.png,OneDoc_Logo.svg}` removed; `assets/images/{icon.ico,logo.png,logo.svg}` untracked). Those image changes were not edited or reverted.
- Current production manifest SHA-256 values match `HEAD` byte-for-byte: root `package.json` `bd66837716bb32cb186d340d42226b752f0384ab96d73addaef51770fc671412`; `desktop-app/package.json` `c16786e20476e4aa643bff72e907cc80b28ebd07b919ba5e872821848c0eaf27`; `vscode-extension/package.json` `79373068e8c49b8a17f4a99c7f1da6c56c618ff01b515bad6d0119204a0cfd01`. No test version was written to production manifests.

## Available-Host Preflight and Retained Bundle

`bun run release:check` passed read-only. It reported versions consistent at `0.8.0`, identity valid (`OpenAMX Desktop`, `dev.openamx.desktop`), Linux x64 available, and Bun/Hutch/Node/vsce available at the versions above. Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain `unverified`. This preflight does not establish a clean-source release build or additional platform support.

The retained Sprint 048 bundle at `releases/0.8.0/linux-x64` records full source commit `1a9585a24b5ec3c69afbccab0501e46752cbd104`. Its `sha256sum -c SHA256SUMS` passed for all five records:

| File | Size | SHA-256 |
| --- | ---: | --- |
| `manifest.json` | not recorded | `1c2146b5f5421490d0d20c3ea6b4f80e232e419c726e4bfa7c457e5b588bb849` |
| `evidence.json` | not recorded | `bccd483eb06c99b9cc82304e9b8b81d4880dfffeaef5a7b9fb0af72ddc6eaef9` |
| `artifacts/OpenAMX-Desktop-0.8.0-linux-x64.tar.gz` | 45,705,503 bytes | `73eac3441f2583c8f7e9f8234532a4d53bbd973714f8fb9df55dcc87e4c6dd09` |
| `artifacts/stable-linux-x64-update.json` | 207 bytes | `4ccb1219004676845cdaff8c3595efb4bd967ca7ded4c173118752b10bb689d7` |
| `artifacts/stable-linux-x64-OpenAMXDesktop.tar.zst` | 44,153,755 bytes | `e340ed04ced60dac707776ecb5953a37df51e064698f956f38ac5351e1c0ea56` |

Its evidence records build/package and resource inspection passed, but Builder-time manual install/launch is `not_performed`. Sprint 048's later **Lead Developer-reported** disposition says the latest correct installer launched and worked. The exact host/session, sample-preview procedure, close/uninstall, and user-data behavior were not supplied; this Builder did not repeat them or rewrite the retained evidence. Linux system WebKitGTK 4.1, GTK/GLib, and related graphics/media libraries remain runtime requirements on the tested host; no minimum Linux baseline or self-containment is claimed.

## Repeatability and Adversarial Fixtures

`bun test ./tests/release.test.ts` passed **41 tests, 0 failures, 141 expectations**. Tests use temporary Git repositories and disposable directories; the new repeatability case exercised stable fixture versions `0.6.1` and `0.6.2` only in those temporary roots. Each version had a distinct full fixture commit and matching desktop/extension bundle inputs. For each accepted assembly, the test snapshotted every output file, retried identical inputs, then tried a valid same-version/same-commit desktop bundle with conflicting installer bytes. Both reruns were refused because the accepted destination exists; every accepted output hash and all three source-manifest bytes remained unchanged.

The release suite also exercises unsupported host mappings and missing tool probes separately; package/license and owner notice-confirmation blockers; mixed source commits, a stale bundle version, incomplete transferred evidence, unsafe paths, archive traversal/link entries, symlinks, corrupted hashes, duplicate targets, and existing-output conflicts; same-revision additions with identical VSIX bytes and base preservation; and partial acknowledgement, absent credentials, authentication error redaction, mismatched tags, published-release refusal, conflicting remote bytes, interrupted upload, identical remote retries, and later same-revision additions.

GitHub tests use injected in-memory clients or a fake HTTP response; the no-credentials check runs with an isolated empty `PATH` and fails before HTTP setup. No public endpoint was contacted. The production license gate remains blocked despite fixture tests that demonstrate the ready branch.

The incomplete-transfer case rejects an absent evidence file before creating `releases/`. A local filesystem fault was not injected after assembly staging begins; production staging failure cleanup remains code-path/source-reviewed rather than fault-injection-tested. Remote interrupted upload and retry behavior are directly mock-tested.

## Verification Results

| Command | Result |
| --- | --- |
| `bun run release:check` | Pass; read-only, consistent `0.8.0`, Linux x64 available, five targets unverified. |
| `bun test ./tests/release.test.ts` | Pass: 41 tests, 141 expectations. |
| `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --types bun --skipLibCheck scripts/release.ts scripts/release/desktop.ts scripts/release/extension.ts scripts/release/assembly.ts scripts/release/publish.ts` | Pass; no diagnostics. |
| `bun run build` | Pass; root TypeScript compilation. |
| `bun test ./tests` | Pass: 260 tests, 0 failures, 1,102 expectations across 18 files. |
| `cd desktop-app && bun run test` | Pass; desktop RPC/workflow contracts; `Final active resources: []`. |
| `cd desktop-app && bun run typecheck` | Pass; Hutch prepare and `vue-tsc --noEmit`. |
| `cd desktop-app && bun run build:web` | Pass; Vite/worker/host-native Sharp resource build. Existing Vite chunk warning: JS 2,689.67 kB and CSS 640.53 kB exceed the 500 kB warning threshold; `jobWorker.js` 4.13 MB. |
| `cd desktop-app && bun run test:ui` | Pass: 6 Playwright tests, Chromium 153.0.8010.12, Linux x64; viewports 1024x720, 1440x900, and adaptive 820x720. This is browser evidence, not native installer evidence. |
| `cd vscode-extension && bun run test` | Pass: compile, test compilation, 19 Extension Development Host tests on VS Code 1.85.0. Existing Fontconfig and Python API proposal warnings appeared. |
| `sha256sum -c SHA256SUMS` from `releases/0.8.0/linux-x64/` | Pass: all five retained bundle entries. |
| Production package-manifest current-vs-`HEAD` SHA-256 comparison | Pass: all three files byte-identical to `HEAD`. |
| `git diff --check` | Pass after final planning/evidence edits. |

The first checksum invocation was made from the repository root, where the bundle-relative file paths do not resolve; the corrected invocation from the bundle directory passed. A test-runner wrapper initially timed out the expanded fixture, while the focused Bun run and complete final release suite passed. No stable `release:desktop`, `release:extension`, production collection, or production verification was run: clean committed source and an unused authorized target are not available, and license readiness remains blocked. `release:verify`/`publish` readiness is therefore not claimed.

## Native, License, and Publication Status

- No fresh authorized desktop installer was built or installed in Sprint 050. Native sample preview, close, and uninstall are `not_performed` here. Sprint 048's Lead Developer report remains separately attributed and is not expanded with missing details.
- Root `LICENSE.md` contains the supplied full AGPLv3 text and the VSIX package history records it included unchanged. The license owner has not confirmed Marketplace metadata for the AGPL/commercial offer or whether dependency notices are required. `release:verify` and publication readiness remain blocked; no legal conclusion is made.
- GitHub publication was not selected or authorized. `release:publish` remains a separate operator action; automated tests are mocked. Marketplace upload was not attempted and remains manual under `EngineersTools`.
- No signing/notarization, cross-platform native build, six-target certification, runtime self-containment, or minimum OS claim is made.

## Builder Recommendation

At the Builder evidence checkpoint, recommend implementation/evidence complete with residuals and integrated acceptance **PENDING**. The subsequent disposition below supersedes that pending recommendation.

## Follow-up Verification: PDF Worker Resources (2026-10-04)

The Lead Developer reported a packaged-app runtime error when the worker tried to resolve `pdfmake` by package name while configuring Roboto fonts. The worker bundle already contains pdfmake code, but the application did not carry the four font files and the font-root code relied on a package-resolution path absent from the packaged app.

The follow-up copies `Roboto-Regular.ttf`, `Roboto-Medium.ttf`, `Roboto-Italic.ttf`, and `Roboto-MediumItalic.ttf` from the locked root pdfmake installation into `desktop-app/dist/pdfmake-fonts`, maps them to `Resources/app/bun/pdfmake-fonts`, resolves that adjacent directory in `reportPdf.ts`, and requires the files in stable package inspection. The source/development package font lookup remains a fallback.

Verification on commit `366efcc560e65b36de0877e7e0e16742bd8d6c9e`:

- `cd desktop-app && bun run build:web` passed; Vite retained its existing >500 kB chunk warning, and both Sharp and four-font resource-copy steps completed.
- `cd desktop-app && hutch electrobun build --env=dev` passed. Direct inspection found the worker and all four fonts under `OpenAMXDesktop-dev/Resources/app/bun/`.
- A real PDF job through `desktop-app/dist/jobWorker.js` completed and returned 13,945 bytes. A second job through `desktop-app/build/dev-linux-x64/OpenAMXDesktop-dev/Resources/app/bun/jobWorker.js` completed and returned 15,131 bytes.
- `bun test ./tests/release.test.ts` passed 41 tests, 142 expectations; the release inspector rejects a package missing fonts and accepts the complete font set.
- `bun test ./tests` passed 260 tests across 18 files, 1,103 expectations. Root `bun run build`, desktop contracts/typecheck, release adapter typecheck, and `git diff --check` passed.

The stable release output was not rebuilt or replaced. A development build and direct worker smoke are not stable-installer/native-install evidence. A generic stable-package metadata inspection was not applicable to Hutch's development output, which has `version.json`/`build.json` but no stable `metadata.json`.

## Lead Developer Disposition (2026-10-04)

**Disposition: COMPLETE WITH RECORDED RESIDUALS.** The Lead Developer reports testing all features and being satisfied with the results, and directs that Sprint 050's remaining items be accepted for closeout. This supersedes the Builder's pending recommendation above and closes Sprint 050. Sprint 049 is separately dispositioned COMPLETE WITH RECORDED RESIDUALS in its Builder evidence.

Accepted residuals: no fresh matching stable production assembly/build/collection; no new authorized version or destination; no independent Sprint 050 native install/launch/close/uninstall matrix; local post-staging filesystem interruption was not injected; license-owner Marketplace/notice confirmation remains unresolved; no public GitHub release or Marketplace upload occurred; and five requested desktop targets remain unverified. Production `release:verify`/publication readiness remains blocked by license/notices. The retained 0.8.0 bundle and its recorded provenance/checksums remain unchanged. These residuals are accepted for sprint closure, not asserted as passed checks or legal/platform certification.