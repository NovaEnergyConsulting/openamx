# Sprint 129 Builder Evidence

## Status

Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS** for the approved
main-process integration scope. Product Owner disposition:
**ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27**.
Execution was separately authorized on 2026-11-27. No release, publication,
deployment, or platform-certification authority follows.

## Authorization and Baseline

- Product Owner authorized the exact S129 plan on 2026-11-27.
- Baseline: clean `feat/create-V0.21.0` at
	`c2a3a0da259dec93f413a81a8f999bb11f1e2657`.
- Validation worktree: detached
	`C:\Users\gamez\Programming\openamx-s129-validation-c2a3a0d`.
- Isolated `HUTCH_HOME`:
	`C:\Users\gamez\Programming\openamx-s129-validation-c2a3a0d\.hutch-home`.
- The primary checkout was clean before validation. All installs, Hutch
	preparation, tests, and checks ran in the detached worktree.
- Changed-file allowlist: `desktop-app/src/bun/index.ts`, new
	`desktop-app/src/bun/updater.ts`, new `desktop-app/src/bun/updater.test.ts`,
	`desktop-app/src/shared/rpc.ts`, `desktop-app/tests/rpc-contract-check.ts`,
	this evidence file, and `artifacts/run-01/**` only.
- Evidence root: `planning/sprints/0129-v21-main-process-updater-integration/artifacts/run-01/`.
- The authorized no-cap retry policy was followed. Every first failure and
	retry is retained; no failure authorized scope expansion.
- The validation worktree, isolated Hutch home, and generated files are being
	retained. Cleanup requires separate approval.

## Toolchain and Commands

| Tool | Exact version / result |
| --- | --- |
| Host | Windows x64 |
| Bun | 1.4.5 (`a7733435c`) |
| Hutch CLI | 0.30.0 |
| Electrobun | 2.0.7, Windows x64 devkit |
| Hutch-managed Bun | 1.4.4, Windows x64 |
| TypeScript | 5.9.3, project pin |
| Git | 2.56.1.windows.1 |
| Electrobun source manifest | SHA-256 `890f98e498392b5cb948ef079db341c30606d6514f9a86026372ceebdd902e9b` |

| Command | CWD / environment | Raw result |
| --- | --- | --- |
| `git worktree add --detach C:\Users\gamez\Programming\openamx-s129-validation-c2a3a0d c2a3a0da259dec93f413a81a8f999bb11f1e2657` | Primary root | PASS; detached worktree created at baseline |
| `bun install --frozen-lockfile` | Validation root | PASS; 80 packages installed in 7.02s |
| `bun install --cwd desktop-app --no-save --no-lockfile` | Validation root | PASS; 582 packages installed in 41.46s; no lockfile change |
| `hutch self version` | `desktop-app/`, isolated `HUTCH_HOME` | PASS; Hutch 0.30.0 |
| `hutch status` | `desktop-app/`, isolated `HUTCH_HOME` | PASS; exact Hutch 0.30.0 pin and prepared Electrobun 2.0.7 selected |
| `hutch electrobun prepare` | `desktop-app/`, isolated `HUTCH_HOME` | PASS; generated the pinned devkit |
| `bun test src/bun/updater.test.ts` | `desktop-app/` | Final PASS; 9 tests, 0 failures, 33 assertions. Attempts are retained below. |
| `bun run tests/rpc-contract-check.ts` | `desktop-app/` | PASS on retry; complete output retained below |
| `bun run typecheck` | `desktop-app/` | PASS on retry and final rerun; complete outputs retained below |
| `bun run test` | `desktop-app/` | PASS; 9 tests, 0 failures, 109 assertions, followed by passing RPC contract script |
| `git diff --check` | Validation root | PASS; no output |

## Implementation Summary

- Added an injectable Bun-main-process coordinator around the pinned
	Electrobun updater adapter. The only native operations are local metadata
	read, check, state read, and user-requested download/preparation.
- Startup calls one coordinator check. Explicit checks share the same
	single-flight promise; concurrent checks do not overlap a download.
- Production checks require a packaged stable build, direct/default updater
	authority, the S128 stable GitHub base URL, and matching app name and
	identifier. Development, canary, external/none authority, host mismatch, and
	identity mismatch are gated before `checkForUpdate()`.
- No-update, available, checking, downloading, ready, unsupported, and typed
	failure states are exposed through typed `getUpdateState`,
	`checkForUpdates`, and `downloadUpdate` RPC operations.
- Checks never download. Download starts only through the explicit RPC and
	duplicate requests coalesce. Native errors are reduced to stable codes and
	messages.
- No `applyUpdate()` or restart operation was added. The existing quit guard
	was left unchanged. No Vue/UI, menu/help, release, package, or app identity
	files were edited.
- `DesktopUpdaterRPCClient` is separate from the desktop service request type;
	this preserves the existing `DesktopService` implementation boundary while
	the RPC schema and Bun handlers remain compile-time checked.

## Toolchain and Host

The primary checkout's existing ignored Hutch cache was not rewritten. The
pinned 2.0.7 declarations were generated only inside the authorized worktree.
Tests used an injected adapter and made no request to GitHub or another public
update host. Hutch and package distribution downloads during isolated setup
were within the approved setup commands.

## Raw Results

| Check | Command / CWD | Raw status | Evidence |
| --- | --- | --- | --- |
| Updater focused attempt 1 | `bun test src/bun/updater.test.ts` / `desktop-app/` | FAIL, 8/1, 30 assertions | [attempt 1](artifacts/run-01/updater-focused-attempt-01.log) |
| Updater focused attempt 2 | Same | PASS, 9/0, 30 assertions | [attempt 2](artifacts/run-01/updater-focused-attempt-02.log) |
| Updater focused attempt 3 | Same | PASS, 9/0, 30 assertions | [attempt 3](artifacts/run-01/updater-focused-attempt-03.log) |
| Updater focused attempt 4 | Same | PASS, 9/0, 33 assertions | [attempt 4](artifacts/run-01/updater-focused-attempt-04.log) |
| RPC contract attempt 1 | `bun run tests/rpc-contract-check.ts` / `desktop-app/` | FAIL at existing HTML export status timing assertion | [attempt 1](artifacts/run-01/rpc-contract-check-attempt-01.log) |
| RPC contract attempt 2 | Same | PASS | [attempt 2](artifacts/run-01/rpc-contract-check-attempt-02.log) |
| Desktop typecheck attempt 1 | `bun run typecheck` / `desktop-app/` | FAIL; service/client type overlap | [attempt 1](artifacts/run-01/desktop-typecheck-attempt-01.log) |
| Desktop typecheck attempt 2 | Same | PASS | [attempt 2](artifacts/run-01/desktop-typecheck-attempt-02.log) |
| Desktop typecheck final | Same | PASS | [attempt 3](artifacts/run-01/desktop-typecheck-attempt-03.log) |
| Configured desktop test | `bun run test` / `desktop-app/` | PASS, 9/0, 109 assertions; RPC script passed | [full output](artifacts/run-01/desktop-test.log) |
| Diff whitespace check | `git diff --check` / validation root | PASS, no output | Recorded above |

The first updater failure was caused by the test adapter not changing its
`updateInfo()` snapshot to ready after its deferred download succeeded. The
fake was corrected; production code was not changed in response to that
failure. The RPC contract retry passed without a code change; attempt 1 saw an
outside HTML export still in `running` state at the existing immediate-status
assertion. The first typecheck failure exposed the existing `DesktopService`
use of `DesktopRPCClient`; updater request typing was separated without
editing the service implementation.

## Behavior Matrix

| Case | Expected | Raw status | Evidence |
| --- | --- | --- | --- |
| Stable check, no update | Typed up-to-date state; no download/apply | PASS | Focused updater tests |
| Stable check, update available | Version reported; no download | PASS | Focused updater tests |
| Check request failure | Typed quiet failure | PASS | Focused updater tests |
| Explicit download success | Ready-to-apply; no apply | PASS | Focused updater tests |
| Explicit download failure | Typed failure; no apply | PASS | Focused updater tests |
| Development/non-stable/non-direct config | No local or production host request | PASS | Focused updater tests |
| Host/app identity mismatch | No production host request | PASS | Focused updater tests |
| Startup called repeatedly/manual overlap | One in-flight check | PASS | Focused updater tests |
| Duplicate download and check during preparation | One in-flight download; no overlapping check | PASS | Focused updater tests |
| RPC declarations and main handlers | Typed methods are declared and wired | PASS | RPC contract check and typecheck |
| Public update host request | None in automated tests | PASS | Injected adapter only |
| Apply/restart/quit guard | No apply/restart RPC; quit guard unchanged | PASS | Allowlist and source audit |

## Changed-File Hashes

SHA-256 values captured in the validation worktree after implementation:

| File | SHA-256 |
| --- | --- |
| `desktop-app/src/bun/index.ts` | `31E27261416972477020981AA1381B50990101C2F9A21AE1E886CBA8A18AFE22` |
| `desktop-app/src/bun/updater.ts` | `CA24DA1DBC74FBFA9BA650C6F7A0BCCDE76B9CCAA183E8C750E3A1F56C6D0AB4` |
| `desktop-app/src/bun/updater.test.ts` | `6756556F565B6AE80489E15401E01BC667A7C42DEB385A781A92FDAEB2AE8675` |
| `desktop-app/src/shared/rpc.ts` | `B548F4C14FE8955FA2E6E895CF4621189319A6DC5BCB063521ADE0CEBE658913` |
| `desktop-app/tests/rpc-contract-check.ts` | `7A2B808CCFC9A4BF131DE34686F3BB0F485ADDA345D2510492B9D9F3F45FCC6C` |

## Preservation and Scope Audit

- No test/build/verification command ran in the primary worktree. Its existing
	`.hutch`, `build`, `artifacts`, `dist`, `test-results`, `releases`, and
	S121-S128 evidence were not used as outputs or cleaned.
- The isolated worktree status showed only the five authorized source/test
	files plus the authorized isolated `.hutch-home`; generated dependency and
	devkit state remained in the validation worktree.
- The prior S128 residuals remain: only Windows x64 packaging was verified;
	installed-app updates, other platforms, GitHub asset availability, and
	platform certification remain unverified/out of scope.
- The allowlisted source/test/evidence files are transferred to the primary
	checkout only after final primary baseline verification. Worktree and cache
	cleanup are not authorized. All five transferred source/test files matched
	their validation-worktree SHA-256 values; the final primary status and exact
	comparison are in `artifacts/run-01/setup-and-audit.log`.

## Residuals and Disposition

- Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS** for the tested
	S129 integration scope.
- Product Owner disposition: **ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
	2026-11-27**. This closes only the approved S129 integration scope.
- Installed packaged-app update behavior, live-host behavior, native
	preparation, cross-platform behavior, release assembly/publication, and
	platform certification were not tested or authorized.
- S130 retains Help/menu entry, prompt and consent UI, `applyUpdate()`, restart,
	and quit-safe staged-update retry.
- No release, publication, deployment, distribution, or platform
	certification authority follows from S129.
