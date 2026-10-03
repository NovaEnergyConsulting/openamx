# Sprint 047 Builder Evidence

Date: 2026-10-03

## Outcome

Implemented only explicit version preparation and read-only release preflight. No installer, VSIX, release bundle, publication, signing/notarization, or native installation was produced or claimed.

`release:prepare <version>` accepts one stable `MAJOR.MINOR.PATCH` argument and rejects prerelease/build metadata. It validates all expected manifest identities and stable versions before staging, updates only the three package `version` fields, uses root `package.json` as the requested-version authority, and derives the Electrobun app version from `desktop-app/package.json`. Staged replacements use same-directory temporary/backup files, recheck source content before replacement, roll back on injected failure, and clean up temporary files. Repeating the same version is a no-op. The extension local-install helper computes `openamx-vscode-<package-version>.vsix`; it does not build or rename a package.

`release:check` does not repair source or create outputs. It reports package version consistency, preserved app name/identifier, current host/architecture, native packaging as `unverified`, prerequisites, and all six project targets. Current-host `available` requires version/identity consistency and successful local tool probes. Other matrix rows remain `unverified`; no target was classified unsupported. Missing prerequisites use `unavailable`; `missing` remains reserved for requested release artifacts.

## Audited Facts

- Initial package versions: root `0.6.0`, desktop `0.6.0`, extension `0.6.0`.
- Bun lockfiles inspected: `bun.lock`, `desktop-app/bun.lock`, `vscode-extension/bun.lock`. They record workspace names/dependencies and resolved package versions, but no root/desktop/extension package-version metadata. All three lockfiles are unchanged; there was no dependency churn and frozen-lock validation was not applicable.
- Identity preserved: `OpenAMX Desktop`, `dev.openamx.desktop`.
- Desktop package configuration copies `dist/index.html` and `dist/assets` into the Electrobun main-view resources and `dist/jobWorker.js` into Bun resources. `build:web` produces the Vite web resources and Bun worker. Hutch configuration uses frozen Bun install and Electrobun `2.0.1`; configured `bundleCEF: false` is not proof that the installed app is self-contained.
- Host: Linux x86_64, kernel `7.2.5-3-omarchy`; Bun `1.4.2`, Node `v24.14.1`, Hutch `0.27.1`, vsce `3.9.2`.
- Current Linux x64 host preflight is `available`. Linux arm64, Windows x64/arm64 and macOS x64/arm64 are `unverified`. Installer format, complete runtime prerequisites, native installation and launch remain open for Sprint 048. No official toolchain capability claim was used to mark a target unsupported.

## Verification

| Command | Result |
| --- | --- |
| `bun test ./tests/release.test.ts` | Pass: 13 tests, 48 expectations. Covers stable/invalid versions, invalid input and source no-write, CLI synchronization from a fixture path containing spaces, three-manifest synchronization, idempotence, injected coordinated rename failure/rollback, desktop app-version derivation, all six native OS/architecture mappings, unavailable prerequisites vs unsupported host, divergent-version reporting, read-only check, Windows path joining and Windows CLI quoting. |
| `bun run release:check` | Pass, read-only. Reported consistent `0.6.0`, valid identity, Linux x64 available, Bun/Hutch/Node/vsce available, native packaging unverified, and five remote rows unverified. |
| Manifest SHA-256 before/after `bun run release:check` | Pass: byte-identical root, desktop and extension manifests. |
| `bun run release:prepare 1.2.3-rc.1` with manifest SHA-256 before/after | Pass: rejected with exit code 1 before writes; all three manifest hashes remained identical. |
| `bun run build` | Pass (`tsc`). |
| `bun test` | Pass: 258 tests, 1,152 expectations across 26 files. |
| `builtin cd /home/cgamez/Programming/openamx/desktop-app && bun run test` | Pass: desktop RPC/workflow contract suite; ended `Final active resources: []`. |
| `builtin cd /home/cgamez/Programming/openamx/desktop-app && bun run typecheck` | Pass: Hutch prepare and `vue-tsc --noEmit`. |
| `builtin cd /home/cgamez/Programming/openamx/desktop-app && bun run build:web` | Pass: Vite 6.4.3 and Bun worker build. Existing Vite warning: JS/CSS chunks exceed 500 kB. No native installer build was run. |
| `builtin cd /home/cgamez/Programming/openamx/vscode-extension && bun run test` | Pass: esbuild compile, test TypeScript compile and 19 Extension Development Host tests. Existing host emitted Fontconfig configuration warnings. No VSIX was produced. |
| `git diff --check` | Pass. |

The three lockfiles were inspected and unchanged, so frozen-lock validation was intentionally not run. A parallel invocation initially tried to change into an already-current package directory and failed before running its commands; the relevant commands were rerun from explicit absolute package paths and passed. No source changes resulted from that invocation.

## Residuals and Ownership

Sprint 048 owns native installer/toolchain selection, per-target native build evidence, artifact inspection, runtime dependency/self-containment analysis, and native install/launch checks. Any required toolchain migration or release-contract expansion must be documented and approved before implementation. Sprint 049 owns VSIX production/inspection, collection/verification, license/notices packaging validation and explicit publication. Remote platform certification, signing/notarization and Marketplace/GitHub publication remain open.

## Lead Developer Disposition

Date: 2026-10-03

**Disposition: COMPLETE WITH RECORDED RESIDUALS.** The Lead Developer accepts the Sprint 047 Builder implementation and verification for sprint closeout and explicitly authorizes Sprint 048 to proceed with the residuals recorded above. This disposition does not claim installer feasibility, native package/runtime completeness, native installation or launch, or support for remote targets. Linux x64 remains preflight-available only; the other five target rows remain unverified.
