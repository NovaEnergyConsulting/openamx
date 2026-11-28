# Sprint 132 Builder Evidence

## Status

The initial preflight stopped when Hutch reported that it was downloading the
project-pinned CLI. The user clarified that Hutch setup was a one-time install
and instructed the Builder to continue. The isolated Hutch 0.30.0 installation
and cached Bun 1.4.4 / Electrobun 2.0.7 toolchain were then verified locally.
Windows x64 package builds, artifact checks, focused tests, and two loopback
metadata/checksum smoke cases completed. The V0.20 installer bridge and
packaged V0.21 update workflow remain NOT RUN because no disposable native
profile or VM was available. This is not S132 completion; Builder recommends
BLOCKED / NOT READY FOR CLOSEOUT pending an authorized isolated install route.

## Authorization and Baselines

- User instructions: proceed with the suggested Windows x64 validation; Hutch
	setup is a one-time install and becomes available on its installation path.
	The loopback/version edits were kept in detached validation worktrees only.
	No GitHub updater/API call, release assembly, release creation, publication,
	or production bundle mutation was authorized or performed.
- Pre-updater V0.20 baseline:
	`c05f608f86c2366358e9533a126464dc11fff416`. Root and desktop package versions
	were `0.20.0`; `desktop-app/src/bun/updater.ts` was absent.
- Accepted S131 V0.21 baseline:
	`f2bddb1205b2e9213c8fe56ec75112e13e0e1355`. Commits after this baseline
	changed only S132 planning files.
- Detached retained worktrees:
	`C:\Users\gamez\Programming\openamx-s132-v020-c05f608`,
	`C:\Users\gamez\Programming\openamx-s132-v021-production-f2bddb1`,
	`C:\Users\gamez\Programming\openamx-s132-v021-loopback-f2bddb1`, and
	`C:\Users\gamez\Programming\openamx-s132-v0211-target-f2bddb1`.
- Isolated `HUTCH_HOME`:
	`C:\Users\gamez\Programming\openamx-s132-v021-loopback-f2bddb1\.hutch-home`.
	It contains Hutch 0.30.0, Electrobun 2.0.7, Bun 1.4.4, and prepared project
	devkits; it is retained and was not cleaned.
- Disposable native environment: NOT AVAILABLE. Windows Sandbox/Hyper-V
	commands were not found; no local account/profile was created and no
	installer was run.
- Production audit worktree: synchronized test package versions to `0.21.0`,
	retained the GitHub stable config, and changed only the foreign-host test
	fixture to `http://127.0.0.1:4184/updates`. The package was built and its
	archive inspected; loopback was absent and GitHub stable was embedded.
- V0.21 loopback worktree: hardcoded
	`http://127.0.0.1:4184` in the test-only updater/config and synchronized
	root/desktop/extension package versions to `0.21.0`. It was built and
	inspected; loopback was embedded and GitHub stable was absent.
- V0.21.1 target worktree: same test-only loopback config and synchronized
	root/desktop/extension package versions to `0.21.1`; package was built and
	inspected. All source/config/version edits remain isolated and were not
	transferred to the primary checkout.
- Existing root and desktop `node_modules` were exposed through junctions to
	the validation worktrees; no package install ran. Vite created a `.vite`
	cache under the primary desktop `node_modules`; its pre-run state was not
	captured, so it remains untouched.
- The local fixture host binds only to `127.0.0.1:4184`, serves exactly the
	three original Hutch basenames, and logs requests. Both scenarios were
	smoke-tested for manifest/checksum only; neither full payload was requested.
	The server is stopped and both 4183 and 4184 are confirmed closed.

## Toolchain and Hosts

| Host | Bun | Hutch | Electrobun | Result |
| --- | --- | --- | --- | --- |
| Windows x64 | Bun CLI 1.4.5; managed Bun 1.4.4 | Hutch 0.30.0 | Electrobun 2.0.7 | Four local package lanes built and inspected; native install NOT RUN |
| Windows arm64 | Pending | Pending | Pending | NOT RUN |
| macOS x64/arm64 | Pending | Pending | Pending | NOT RUN |
| Linux x64/arm64 | Pending | Pending | Pending | NOT RUN |

Do not mark an unavailable target passed or unsupported without direct
accepted evidence.

## Installed-App Flow

| Scenario | Expected | Raw status | Evidence |
| --- | --- | --- | --- |
| V0.20 installer baseline | Installed; no updater discovery request | ARTIFACT BUILT; install NOT RUN | [package inventory](artifacts/run-01/package-inventory.md) |
| V0.20-to-V0.21 Setup upgrade | Same identity/channel; updater-capable app launches | NOT RUN | Disposable profile unavailable |
| V0.21 valid no-update | Quiet and no payload download | Fixture manifest/checksum PASS; app NOT RUN | [request log](artifacts/run-01/host/requests.jsonl) |
| Available update / Later | Offer shown; no full payload request | UI mock PASS; static manifest/checksum PASS; app NOT RUN | Playwright 10/10; no payload GET |
| Consent / full download / preparation | Payload fetched only after consent; ready state | NOT RUN | No installed app; no payload GET |
| Successful apply/relaunch | Later test version observed after restart | NOT RUN | Native apply/relaunch unverified |
| Network/download/checksum failure | Old app remains usable | NOT RUN in packaged app | Injected S129/S130 tests remain separate evidence |
| Quit Cancel with staged update | App/workbench stays open; ready state/action retained | UI mock PASS; real app NOT RUN | Playwright harness only |
| Save All / Discard All retry | Guard completes before apply handoff | UI mock PASS; real quit guard NOT RUN | Playwright harness only |
| Apply failure injection | Permit cleared; error and safe retry | S130 injected tests PASS; S132 native NOT RUN | Existing S130 evidence |
| Public host / GitHub request | No request in automated or loopback test | No S132 GitHub call made | Local request log records loopback only |

## Artifact and Release Verification

| Check | Raw status | Evidence |
| --- | --- | --- |
| Stable manifest/full payload/checksum inventory | PASS, Windows x64, four isolated packages | [package inventory](artifacts/run-01/package-inventory.md) |
| Exact filenames, sizes, hashes, metadata references | PASS | [package inventory](artifacts/run-01/package-inventory.md) |
| Full-bundle-only/no-patch contract | PASS; all four builds reported patch generation disabled | [package inventory](artifacts/run-01/package-inventory.md) |
| Target bundle/assembly retention | Generated app bundles inspected; release assembly NOT RUN | No authorized local assembled release |
| Duplicate flat asset rejection | PASS within focused root release suite | 65 tests / 256 expectations |
| Focused release tests | PASS, 65/0, 256 expectations | Local fixtures/injected clients only |
| `release:check` | PASS; version/identity consistent, Windows x64 available | Preflight only; other targets unverified |
| Local read-only release verification | NOT RUN | No local assembly created |

## Raw Commands and Failures

- Baseline: `git rev-parse c05f608 f2bddb1` returned
	`c05f608f86c2366358e9533a126464dc11fff416` and
	`f2bddb1205b2e9213c8fe56ec75112e13e0e1355`. `git diff --stat f2bddb1 HEAD`
	showed only S132 planning files after the selected V0.21 baseline.
- `git cat-file -e c05f608:desktop-app/src/bun/updater.ts`: expected exit 1;
	updater source is absent from the V0.20 pre-updater commit.
- Initial `hutch.exe self version` from the version cache printed
	`0.28.2`; not accepted as project pin evidence. Cached
	`hutch-engine.exe --version` returned `0.30.0`.
- Initial isolated `hutch-engine.exe status`: PASS for `cli=0.30.0`, resolved
	Hutch `0.30.0`, Cottontail `0.7.3`; initially no releases/toolchains in that
	HUTCH_HOME.
- Initial isolated `hutch self version`: printed
	`hutch: downloading hutch 0.30.0 for windows-x64`, then `0.30.0`. User
	clarified this is a one-time setup. The resulting isolated install was
	verified using its `hutch.exe self version`, which returned `0.30.0`.
- First `hutch electrobun prepare`: FAIL, printed
	`hutch: downloading bun 1.4.4 toolchain for windows-x64`, exit 1. The exact
	Bun 1.4.4 and Electrobun 2.0.7 caches were copied into isolated HUTCH_HOME;
	`hutch status` then listed Hutch 0.30.0, Electrobun 2.0.7 and Bun 1.4.4.
	Retry in the V0.21 loopback worktree: PASS, prepare complete.
- First V0.20 `hutch-engine.exe electrobun prepare`: FAIL, exit 1 without
	captured output. `hutch-engine.exe status` showed the expected pins; retry:
	PASS, prepare complete.
- Production audit worktree `hutch.exe status` / `bun run build:web` attempt:
	FAIL, launcher printed `hutch: downloading hutch 0.30.0 for windows-x64`
	and `hutch: could not resolve Hutch: DirNotEmpty`. The isolated engine file
	was absent after that attempt. The untouched global cache still held the
	complete release; it was recopied into HUTCH_HOME, direct engine status and
	prepare passed. Subsequent build used the direct cached engine path.
- A later attempt to invoke the engine at the now-missing global path failed
	with PowerShell `CommandNotFoundException`. The isolated engine path returned
	`0.30.0`; the V0.20 package build retry then passed.
- First `bun -e` version/config assertion: FAIL before file access because
	PowerShell stripped inline JavaScript quotes. Native PowerShell JSON retry:
	PASS, three synchronized manifests and expected test/production hosts.
- Production audit focused updater test: PASS, 9/0/33 before and after the
	loopback-specific host rejection fixture. Loopback V0.21 updater/apply tests:
	PASS, 18/0/71. RPC contract: PASS. Desktop `vue-tsc --noEmit`: PASS.
	Configured desktop `bun run test`: PASS, 9/0/109 plus RPC contract.
- Production V0.21 and loopback V0.21/V0.21.1 web assets built by direct local
	steps: diagram runtime, Vite 4,125 modules, 26 guide files, worker bundle,
	Sharp runtime, and four PDFMake fonts. V0.20 web assets built similarly.
	Vite emitted its existing >500 kB chunk warning; build succeeded.
- `hutch-engine.exe electrobun build --env=stable` passed for V0.20,
	production-config V0.21, loopback V0.21 and loopback V0.21.1. Each reported
	`delta patch generation disabled` and produced Windows x64 artifacts.
- S128 `inspect-windows-artifacts.ts` passed for all four packages. Embedded
	host scanner passed: production package contains GitHub stable and no
	loopback; test packages contain `127.0.0.1:4184` and no GitHub stable.
	Exact filenames, byte counts, hashes, metadata and checksum fields are in
	[package inventory](artifacts/run-01/package-inventory.md).
- Local loopback host smoke: available scenario returned V0.21.1 manifest and
	checksum; no payload GET. No-update scenario returned V0.21.0 manifest and
	checksum; no payload GET. A final post-refactor host smoke requested the
	V0.21.1 manifest only. Every request was from `127.0.0.1`; five total
	requests, all status 200. Exact log SHA-256:
	`e7ec0bffcd5fe543f72f543b710facd5cbd4764e8bf4e77e51c9a20102e91d3d`.
	The host was stopped and ports 4183/4184 confirmed closed.
- Evidence-root host script validation: standalone `tsc --noEmit` with strict
	mode and Node types passed; `bun build` passed; final manifest runtime smoke
	passed. VS Code `get_errors` continued to report unresolved Bun globals from
	its standalone workspace context after the source was changed to a local
	structural API type; the CLI compiler and Bun runtime checks passed.
- Root `bun test tests/release.test.ts` in production audit worktree: PASS,
	65/0/256. `bun run release:check`: PASS; versions/identity consistent,
	Hutch 0.30.0 detected, Windows x64 available; other native targets
	unverified. No release assembly or `release:verify` run.
- Loopback UI harness: Vite bound to 127.0.0.1:4183; Playwright focused
	workflow passed 10/10. Harness was stopped and port 4183 confirmed closed.
	This is mock UI evidence, not native updater behavior.
- Windows Sandbox/Hyper-V command lookup found no available disposable VM
	facility; no local account/profile was created. No Setup installer was run.

## Additional Finding: `run:app` Startup Failure and Fix

- Reproduction command: root `bun run run:app` from a fresh detached worktree
	at current commit `2a0a11cae21776d6c770545871ec6d74ac72fc3c`, with
	dependencies linked locally and the installed Hutch 0.30.0 path on `PATH`.
- The root script dispatches to `desktop-app` and completed web build, dev
	package build, and launcher startup. It then terminated the Bun app worker
	with `ENOENT` for
	`desktop-app/build/dev-win-x64/OpenAMXDesktop-dev/Resources/app/bun/package.json`.
	The diagnostic bundle contained `Resources/app/bun/index.js` but no sibling
	`package.json`.
- Root cause: [app-metadata.ts](../../../desktop-app/app-metadata.ts)
	resolves the package version using `readFileSync(new URL("./package.json",
	import.meta.url))`. The module is imported by the Bun main process at
	[startup](../../../desktop-app/src/bun/index.ts) and bundled into
	`Resources/app/bun/index.js`. At runtime, the relative URL resolves beside
	that bundled entrypoint, where the Electrobun `build.copy` map does not ship
	`package.json`. Build/config evaluation succeeds from the source checkout,
	which is why the failure appears only after the dev app launcher starts.
- The `setJSUtils called but using map-based approach instead of callbacks`
	line precedes the fatal exception but is not the root cause. This defect is
	not specific to `run:app`; the same bundled main-process path is used by
	stable packages.
- The user authorized execution of the fix plan on 2026-11-28. The primary
	checkout now statically imports `./package.json` in
	[app-metadata.ts](../../../desktop-app/app-metadata.ts); package version
	authority and the app name/identifier are unchanged. This avoids shipping a
	full manifest or relying on a sibling runtime file.
- Added [appMetadata.test.ts](../../../desktop-app/src/bun/appMetadata.test.ts),
	which bundles the metadata module into a temporary directory with no sibling
	manifest and imports it. It asserts the desktop package version, app name,
	and identifier. The test passes in the primary checkout; the fix and test
	SHA-256 values match the isolated diagnostic copy:
	`app-metadata.ts` `D35C3128EDEFFE468FBE5F52A058EF5D7C538BCAD25B8D9694A93A1924992C72`,
	`appMetadata.test.ts` `868D2FD54FB8AC8176A4956FF27B14C59ECEBE43C30D104DE5204D04BC0B89E3`.
- Electrobun config evaluation in the primary checkout passed and reported
	`OpenAMX Desktop`, `dev.openamx.desktop`, version `0.20.0`.
- Focused primary tests passed: app metadata bundle regression plus updater
	and update-apply suites, 19/0 with 73 assertions.
- A fixed stable package built in the diagnostic worktree and passed the S128
	Windows artifact inspector: app hash `1yml4gpazcchk`, managed Bun `1.4.4`,
	valid manifest/full archive/checksum/Setup ZIP, and no patch files.
- The exact `bun run run:app` chain was rerun in a detached worktree with
	byte-identical `app-metadata.ts` and `appMetadata.test.ts`. Web build, dev
	package build, and launcher startup succeeded; the launcher and Bun app
	process remained alive and emitted no missing-`package.json` exception.
	The diagnostic app process was stopped afterward. Primary `desktop-app/build`
	and `desktop-app/dist` were not written during this end-to-end rerun.
- The initial ENOENT and the S132 changed-file boundary remain historical
	evidence. No other S132 updater/installer behavior is inferred from this
	startup fix; installed V0.20/V0.21 acceptance remains NOT RUN.

## Preservation and Scope Audit

No pre-run S132 tree-hash snapshot was captured. A comparison against the
retained S131 `preservation-after.csv` matched all 4,042 rows: zero missing
paths and zero hash differences. The older S130 `preservation-after-transfer`
index compared 4,301 files and found 40 hash differences plus 84 absent
historical paths, concentrated in `.hutch/devkit` and ignored desktop
development `build/dist` outputs. Those paths are not covered by S131's later
manifest; the comparison does not date or attribute the differences. No S132
build command targeted the primary checkout's `.hutch`, `build`, `dist`,
`artifacts`, `test-results`, or `releases`; leave these existing paths
untouched and retain this drift as an explicit residual.

Package builds, generated outputs, local host fixtures, and Playwright
results are confined to the detached worktrees or S132 `artifacts/run-01/`.
The primary tracked worktree contains the authorized
`desktop-app/app-metadata.ts` fix and `desktop-app/src/bun/appMetadata.test.ts`,
plus S132 planning/evidence updates; no validation version/config change was
transferred. No installer, user profile, or user data was touched. Existing
primary desktop `node_modules/.vite` is
present after using a dependency junction; its before-state was not captured,
so it was left untouched. All validation worktrees, caches and outputs remain
retained; no cleanup was performed.

## Closeout and Residuals

- Builder recommendation: **BLOCKED / NOT READY FOR CLOSEOUT**. Windows x64
	production and loopback packages and local fixtures are verified, but the
	V0.20 installer bridge, installed V0.21 update, consent-gated payload
	download, native preparation/apply/relaunch, failure preservation, and real
	quit guard have not been exercised. The reproduced `run:app` startup defect
	is fixed in the primary checkout and verified in a byte-identical diagnostic
	worktree; it does not close the remaining S132 installed-app gates.
- Product Owner disposition: Pending.
- Loopback-test gate: **PASS for Windows x64 package host isolation**: the
	production artifact embeds GitHub stable and has no loopback string; both
	test artifacts embed only loopback and have no GitHub stable string; the
	coordinator rejection unit test passes. This does not prove packaged update
	behavior.
- Installed-app result by native host: Windows x64 **NOT RUN**; no disposable
	VM/profile was available. Other hosts: **NOT RUN**.
- Toolchain: Hutch 0.30.0 / Electrobun 2.0.7 / Bun 1.4.4 project pair
	prepared from local caches after the one-time Hutch setup clarification.
- Residuals: release assembly and read-only `release:verify`, save/conflict
	guard in the installed app, successful update/relaunch, update failure
	preservation, external-network monitor evidence, and all non-Windows targets
	remain unverified.
- Public GitHub route/publication: NOT RUN and not authorized by S132.
- Unverified targets and remaining limitations: Pending.
- Release/publication/platform authority: None follows from S132.
