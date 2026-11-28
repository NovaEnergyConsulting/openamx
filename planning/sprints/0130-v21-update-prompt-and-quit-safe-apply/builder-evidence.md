# Sprint 130 Builder Evidence

## Status

Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS** for the authorized
S130 implementation and mocked workflow scope. All focused main-process, RPC,
typecheck, desktop, and UI workflow checks pass. Product Owner disposition:
**ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-28**. This closes only
the authorized S130 scope.

## Authorization and Baseline

- Product Owner authorized the exact S130 envelope on 2026-11-28.
- A narrow amendment on 2026-11-28 authorized starting the local Vite harness
	manually from `desktop-app/` on 127.0.0.1:4183 and rerunning the existing
	Playwright command with server reuse. No config file was added to the
	allowlist or changed. The launcher was
	`bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort`;
	the test command remained `bun run test:ui -- tests/ui/update-workflow.pw.ts`.
- Baseline: clean `feat/create-V0.21.0` at
	`bf4498a4d2b5a24cbc4d71c55f6e5cdd493c7848`.
- Validation worktree: detached
	`C:\Users\gamez\Programming\openamx-s130-validation-bf4498a`.
- Isolated `HUTCH_HOME`:
	`C:\Users\gamez\Programming\openamx-s130-validation-bf4498a\.hutch-home`.
- Allowlist: `desktop-app/src/mainview/App.vue`,
	`desktop-app/src/mainview/app.css`, `desktop-app/src/shared/rpc.ts`,
	`desktop-app/src/bun/index.ts`, new `desktop-app/src/bun/updateApply.ts` and
	`desktop-app/src/bun/updateApply.test.ts`,
	`desktop-app/tests/rpc-contract-check.ts`,
	`desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`,
	`desktop-app/tests/ui/update-workflow.pw.ts`, and files under this S130
	directory only. No `main.ts`, `playwright.config.ts`, service, updater, or
	unrelated source changes remain.
- Commands ran in the authorized root/`desktop-app/` CWDs. UI port 4183 was
	checked and had no listener. The configured runner's Windows launcher
	failure was followed by the separately authorized local-server retry.
- New evidence is under `artifacts/run-01/`. No cleanup was performed;
	retain the worktree, isolated Hutch home, and generated outputs.
- Retry cap: none. First failures and retries are preserved. No retry or
	scope expansion was made. The manual server command was authorized by the
	narrow amendment; the only code follow-up was an allowlisted UI-test change
	that hides the harness debug overlay.
- After the final audit, only the nine allowlisted source/test files, this
	Builder evidence file, and S130 `artifacts/run-01/**` were transferred to
	the clean primary checkout. Final source hashes matched for all nine files,
	including a retransferred final Playwright test adjustment.
- Disposition remains separate: this is a Builder recommendation, not Product
	Owner acceptance.

## Implementation Summary

- Added searchable `Check for updates` and `Restart to update` commands.
	Explicit checks use S129's RPC; update state refresh polls only the local
	state RPC while the startup check or preparation is pending.
- Added a versioned accessible offer with Update/Later, close, and Escape.
	Download begins only after Update consent. Preparation shows no byte or
	percentage progress.
- Added a persistent ready-state restart action and contextual preparation /
	apply errors. Cancel and save/conflict failure retain the ready state.
- Added typed apply RPC wiring in Bun main. The injected coordinator awaits
	the existing `confirmQuit()` guard before `Updater.applyUpdate()`. Its
	phase-scoped permit allows one `before-quit` then one `will-close`, expires
	if unmatched, and clears on failure. It does not substitute `Utils.quit()`.
- Added local-only mock states and UI cases. The Playwright cases are present
	and passed all ten cases on the third attempt after the harness-only debug
	button was hidden by the test.

## Toolchain and Host

- Host: Windows x64.
- Bun CLI: 1.4.5 (`a7733435c`); Hutch-managed Bun: 1.4.4.
- Hutch CLI: 0.30.0; Electrobun devkit: 2.0.7 Windows x64.
- TypeScript: 5.9.3; `vue-tsc`: 2.2.12; Playwright: 1.64.1.
- Vite: 6.4.3; Playwright Chromium headless shell revision: 1248.
- Git: 2.56.1.windows.1.
- Root install: 80 packages, frozen lockfile. Desktop install: 582 packages
	with `--no-save --no-lockfile`. No lockfile changes were made.
- Hutch setup emitted download notices to stderr but returned exit code 0;
	complete raw output is retained.

## Raw Results

| Check | Command / CWD | Raw status | Evidence |
| --- | --- | --- | --- |
| Detached worktree | `git worktree add --detach ... bf4498a4d2b5a24cbc4d71c55f6e5cdd493c7848` / primary root | PASS | Tool output; worktree retained |
| Root dependencies | `bun install --frozen-lockfile` / validation root | PASS, 80 packages | [root-install.log](artifacts/run-01/root-install.log) |
| Desktop dependencies | `bun install --no-save --no-lockfile` / `desktop-app/` | PASS, 582 packages | [desktop-install.log](artifacts/run-01/desktop-install.log) |
| Hutch / Electrobun prepare | `hutch self version`, `hutch status`, `hutch electrobun prepare` / `desktop-app/`, isolated `HUTCH_HOME` | PASS, Hutch 0.30.0 / Electrobun 2.0.7 | [hutch-version.log](artifacts/run-01/hutch-version.log), [hutch-status.log](artifacts/run-01/hutch-status.log), [hutch-electrobun-prepare.log](artifacts/run-01/hutch-electrobun-prepare.log) |
| Apply coordinator attempt 1 | `bun test src/bun/updateApply.test.ts` / `desktop-app/` | PASS, 9/0, 34 assertions | [attempt 1](artifacts/run-01/update-apply-focused-attempt-01.log) |
| Apply coordinator attempt 2 | Same | PASS, 9/0, 35 assertions | [attempt 2](artifacts/run-01/update-apply-focused-attempt-02.log) |
| Apply coordinator final | Same | PASS, 9/0, 38 assertions | [attempt 3](artifacts/run-01/update-apply-focused-attempt-03.log) |
| S129 updater regression | `bun test src/bun/updater.test.ts` / `desktop-app/` | PASS, 9/0, 33 assertions | [updater-focused.log](artifacts/run-01/updater-focused.log) |
| RPC contract attempt 1 | `bun run tests/rpc-contract-check.ts` / `desktop-app/` | PASS | [attempt 1](artifacts/run-01/rpc-contract-attempt-01.log) |
| RPC contract final | Same | PASS | [attempt 2](artifacts/run-01/rpc-contract-attempt-02.log) |
| Desktop typecheck | `bun run typecheck` / `desktop-app/` | PASS on attempts 1-4, 6-10; attempt 5 failed TS2339 and is preserved | [attempt 5](artifacts/run-01/desktop-typecheck-attempt-05.log), [attempt 6](artifacts/run-01/desktop-typecheck-attempt-06.log), [final attempt 10](artifacts/run-01/desktop-typecheck-attempt-10.log) |
| Configured desktop suite | `bun run test` / `desktop-app/` | PASS, 9/0, 109 assertions; RPC contract passed | [attempt 1](artifacts/run-01/desktop-test-attempt-01.log), [final attempt 2](artifacts/run-01/desktop-test-attempt-02.log) |
| UI workflow attempt 1 | `bun run test:ui -- tests/ui/update-workflow.pw.ts` / `desktop-app/` | FAIL before test discovery; Windows web-server launch error | [attempt 1](artifacts/run-01/update-workflow-ui-attempt-01.log) |
| UI workflow attempt 2 | Manual Vite launch, then same Playwright command / `desktop-app/` | FAIL, 5 passed / 5 failed; harness debug overlay intercepted top-band clicks | [Vite log](artifacts/run-01/vite-server.log), [attempt 2](artifacts/run-01/update-workflow-ui-attempt-02.log) |
| UI workflow final attempt 3 | Same approved local harness and Playwright command | PASS, 10/0 in 10.8s | [attempt 3](artifacts/run-01/update-workflow-ui-attempt-03.log) |
| Port preflight | `Get-NetTCPConnection -LocalPort 4183 -State Listen` / validation host | No listener on 4183 | [attempt 1](artifacts/run-01/port-preflight-attempt-01.log), [corrected attempt 2](artifacts/run-01/port-preflight-attempt-02.log) |
| Diff whitespace | `git diff --check` / validation root | PASS, no output | [final log](artifacts/run-01/diff-check-after-evidence.log) |
| Source transfer | SHA-256 compare of 9 allowlisted files / validation to primary | PASS, 9 files, 0 differences | [validation](artifacts/run-01/source-hashes-final-validation.csv), [primary](artifacts/run-01/source-hashes-final-primary.csv), [transfer log](artifacts/run-01/source-transfer-final.log) |
| Protected-path audit | 4,385 before/after path hashes / primary | PASS, 0 protected differences | [final summary](artifacts/run-01/preservation-audit-final.log) |

### First Failures and Retries

- Typecheck attempt 5 failed with TS2339 because Vue could not narrow the
	updater state union through a computed boolean. A separately narrowed ready
	version fixed the local issue; attempts 6-10 passed.
- The first Playwright attempt failed at web-server startup with
	`[WebServer] '.' is not recognized as an internal or external command.`
- `playwright.config.ts` invokes `./node_modules/.bin/vite`. The Product Owner
	separately authorized the local Vite launch; no config file changed.
- UI attempt 2 reached all ten cases; five click actions timed out because the
	harness-only `#fail-next-preview` button covered update chrome. The focused
	test hides that debug control; attempt 3 passed all ten cases.
- The first port check printed no listener rows but its logging wrapper exited
	1; the next wrapper attempt also had misplaced redirection. The captured
	first attempts and corrected explicit `NO_LISTENER_ON_4183` result are
	preserved in the linked port-preflight logs.
- Hutch's first invocation emitted stderr download notices while returning
	the requested pinned version with exit code 0. These are setup notices,
	not failed verification attempts.
- The first final-index copy wrapper failed because `Join-Path` received three
	positional arguments. The 56-entry validation index was generated; the
	corrected copy succeeded. The wrapper error is preserved in
	[evidence-index-sync-attempt-01.log](artifacts/run-01/evidence-index-sync-attempt-01.log).

## Behavior Matrix

| Case | Expected | Raw status | Evidence |
| --- | --- | --- | --- |
| Manual check, no update / routine check failure | Quiet; no download | PASS | UI attempt 3; updater attempt 1 |
| Available update prompt and exact version | Offer once; no eager download | PASS | UI attempt 3 |
| Later, close, or Escape | Dismiss; zero downloads | PASS | UI attempt 3 |
| Update consent / preparation | One download; truthful busy state, no percentage | PASS | UI attempt 3 |
| Download error and check-again path | Contextual error; retry requires explicit check/consent | PASS | UI attempt 3 |
| Save All / Discard All confirmation accepted | Confirm guard completes before native apply | PASS at injected coordinator and UI-mock boundaries | Apply attempt 3; UI attempt 3 |
| Cancel / save-conflict error | No apply; staged ready update retained | PASS | Apply attempt 3; UI attempt 3 |
| Apply failure and retry | Permit cleared; retry re-runs guard | PASS | Apply attempt 3; UI attempt 3 |
| One-shot before-quit/will-close scope | One ordered pair only; duplicate/late events denied | PASS | Apply attempt 3 |
| Delayed startup result | Local state polling; no second check | PASS | UI attempt 3 |
| Duplicate apply interactions | Coalesced while pending | PASS | Apply attempt 3; UI attempt 3 |
| Public update host request | None in injected/local tests | PASS; UI assertions recorded no external requests | Updater tests; UI attempt 3 |

## Preservation and Scope Audit

- Before/after SHA-256 manifests cover 4,385 paths across S129 source files,
	`desktop-app/.hutch/`, `build/`, `artifacts/`, `dist/`, `test-results/`,
	`releases/`, and S121-S129 sprint directories. Pre-transfer comparison:
	**0 differences**. The post-transfer comparison excludes only the expected
	changed allowlisted S129 `index.ts`, shared RPC, and RPC-contract files;
	all protected outputs and prior sprint evidence remain identical.
- Manifests: [before](artifacts/run-01/preservation-before.csv) and
	[pre-transfer after](artifacts/run-01/preservation-after.csv), plus
	[post-transfer after](artifacts/run-01/preservation-after-transfer.csv).
	The expected allowlisted path changes and zero protected-path differences
	are summarized in [preservation-audit-final.log](artifacts/run-01/preservation-audit-final.log).
	The nine source/test hashes before and after transfer are recorded in
	[before](artifacts/run-01/source-hashes-before-transfer.csv) and
	[after](artifacts/run-01/source-hashes-after-transfer.csv); comparison:
	**0 differences**. Final transfer comparison:
	[validation hashes](artifacts/run-01/source-hashes-final-validation.csv),
	[primary hashes](artifacts/run-01/source-hashes-final-primary.csv),
	[source-transfer-final.log](artifacts/run-01/source-transfer-final.log).
	Per-file evidence hashes:
	[evidence-hashes.csv](artifacts/run-01/evidence-hashes.csv).
	The full final source/evidence destination comparison is recorded in
	[transfer-bundle-comparison.csv](artifacts/run-01/transfer-bundle-comparison.csv).
- The primary checkout was clean during setup/verification. After the final
	audit it contains only the authorized changes listed above. Its generated
	outputs and earlier evidence were not used or cleaned. All dependency and
	devkit outputs remain in the detached validation worktree / isolated Hutch
	home. Initial copied paths are in [transfer.log](artifacts/run-01/transfer.log);
	final boundaries and hash results are in
	[transfer-final.log](artifacts/run-01/transfer-final.log).
- Final changed-file list was within the authorized allowlist. `main.ts` and
	`playwright.config.ts` match baseline and were not left modified.
- No release, publication, packaged app, installed-app update, or native
	cross-platform route was run. No automated test contacted the public update
	host.
- Worktree, Hutch home, and generated outputs are retained; cleanup is not
	authorized.

## Residuals and Disposition

- Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS** for the verified
	S130 scope. The Playwright launcher and harness-overlay first failures and
	retries remain preserved; they are not rewritten by the final pass.
- Product Owner disposition: **ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
	2026-11-28**.
- Native installed-app behavior and other platforms: **NOT RUN**; S132 owns
	integrated acceptance. No release, publication, deployment, or platform
	certification authority follows S130.
- S131 owns release documentation/pipeline follow-up. No S131/S132 work was
	performed.
