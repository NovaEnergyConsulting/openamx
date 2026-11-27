# Sprint 129 Requirements: V0.21 Main-Process Updater Integration

## Document Status

Architect-prepared sprint packet. Sprint 128 was ACCEPTED/CLOSED WITH
RECORDED RESIDUALS on 2026-11-27; that disposition satisfies the S129
compatibility prerequisite only. This packet authorizes planning, not source
edits, verification commands, or release activity. Obtain separate exact
execution authorization before implementation.

## Goal

Integrate Electrobun's native updater into the Bun main process and expose a
small typed RPC/state contract for startup and explicit checks, available
version, user-authorized download/preparation, ready state, and failures. The
main process owns all updater calls. No renderer implementation or user-facing
update workflow is part of S129.

## Inputs and Authority

- V0.21 behavior and sprint sequence:
  [`plan-openamxV21MasterSprintPlan.md`](../../plan-openamxV21MasterSprintPlan.md).
- S128 compatibility contract and disposition:
  [`S128 compatibility note`](../0128-v21-toolchain-update-host-contract/compatibility-note.md)
  and [`S128 Builder evidence`](../0128-v21-toolchain-update-host-contract/builder-evidence.md).
- Existing Bun lifecycle and quit guard: `desktop-app/src/bun/index.ts`.
- Existing typed RPC contract: `desktop-app/src/shared/rpc.ts`.
- Existing desktop tests and contract check: `desktop-app/src/bun/*.test.ts` and
  `desktop-app/tests/rpc-contract-check.ts`.
- Official updater reference, rechecked for this packet on 2026-11-27:
  [Electrobun Updater API](https://docs.electrobun.dev/electrobun/apis/updater/)
  and [Main Process API](https://docs.electrobun.dev/electrobun/apis/main/).
  Recheck the installed pinned 2.0.7 type surface before implementation.

## Accepted Product Contract

- Check once at application startup and on explicit request. Do not schedule
  recurring or background checks.
- Only a packaged stable build with the supported direct updater configuration
  may check the production host. Development, unsupported, or non-stable
  configurations must not query the stable production endpoint.
- A check may discover an update but must not download or apply it.
- Download/preparation starts only after the later user-facing Update action
  requests it. S129 provides the typed operation; S130 owns the UI consent
  flow that calls it.
- No-update and routine check/network failures are quiet. Preserve a typed
  state/result so later UI can act without creating startup alerts.
- Electrobun owns update metadata validation, payload download/preparation,
  transactional replacement, and relaunch. S129 does not implement a custom
  installer or filesystem replacement.
- Existing unsaved/conflicted-tab `before-quit` and `will-close` protection
  remains authoritative. S129 does not call `applyUpdate()`; S130 owns apply
  behavior and quit-safe retry.

## In Scope

- Add a Bun-process updater coordinator/owner that wraps the pinned Electrobun
  updater API and can be tested with an injected adapter.
- Add typed updater state and RPC request/response operations for reading
  state, requesting a check, and explicitly starting download/preparation.
- Trigger exactly one startup check through the same coordinator used by the
  explicit check request.
- Represent no update, available version, checking, download/preparation,
  ready-to-apply, unsupported/not-configured, and actionable operation failure
  states without coupling them to renderer presentation.
- Prevent overlapping checks and downloads; repeated same-operation requests
  must not cause duplicate Electrobun work.
- Add focused tests for no update, available update, unsupported/dev builds,
  check failure, download failure, ready state, and duplicate requests.
- Extend the existing RPC contract check where needed to prove the new typed
  contract is represented and wired.

## Out of Scope

- Help/menu or command-palette entry, update prompt, Later/dismiss behavior,
  download progress UI, or any other renderer changes. Sprint 130 owns these.
- Calling `applyUpdate()`, restart controls, quit guard changes, or staged
  update retry presentation. Sprint 130 owns these.
- Release documentation, artifact assembly/publisher changes, toolchain pins,
  app identity/version changes, or public GitHub release requests.
- Canary/prerelease channels, another host, scheduled checks, telemetry,
  analytics, backend services, silent downloads, or forced restarts.
- Native installed-app update acceptance or cross-platform certification;
  Sprint 132 owns integrated acceptance.

## Constraints

- Keep updater API calls and state-machine ownership in the Bun main process;
  do not call Electrobun updater APIs from Vue/webview code.
- Use the exact S128-selected pair: Hutch `0.30.0` and Electrobun `2.0.7`,
  unless fresh official compatibility documentation requires a separately
  authorized toolchain change.
- Reuse one state machine for startup and explicit checks. A startup/manual
  race must not create parallel requests.
- Never call `downloadUpdate()` from startup or as an automatic consequence
  of finding an update. Never call `applyUpdate()` in S129.
- Do not expose raw updater internals or unfiltered native errors as the RPC
  contract. Keep results typed and stable for the later UI sprint.
- Use injected updater adapters or local fixtures in automated tests. Tests
  must not contact GitHub or another public update host.
- Preserve the existing quit guard and all unrelated project changes. Keep
  S129 evidence in its own artifact root and preserve every first failure and
  retry; there is no retry cap, but retries do not authorize scope expansion.
