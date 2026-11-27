# Sprint 129 Acceptance Criteria

Sprint 129 is complete when the pinned Electrobun updater is owned by the Bun
main process, has a typed RPC/state contract, checks once at startup and on an
explicit request, and has focused injected tests for the accepted state and
failure cases. S129 does not deliver update UI or apply/restart behavior.

## Entry and Scope

- S128 is accepted/closed with recorded residuals; its compatibility note is
  the controlling artifact and the exact Hutch/Electrobun pair is pinned.
- Separate Product Owner authorization names the exact baseline, worktree,
  changed-file allowlist, command/CWD matrix, artifact/evidence roots,
  preservation boundaries, retry/stop policy, and disposition process.
- Source and tests remain within the S129 file allowlist. S128 evidence and
  V0.20 raw outcomes remain unchanged.

## Main-Process Ownership and Check Policy

- Electrobun updater APIs are called only from Bun main-process code.
- A packaged stable build with supported direct update authority may check the
  configured stable host. Development, non-stable, unsupported, or
  non-direct-updater configurations do not issue production update requests.
- The application starts one check at launch. An explicit check request uses
  the same coordinator; startup/manual overlap does not create two checks.
- A no-update result is represented distinctly from an available version.
  Check/network failures are represented as typed state but do not trigger a
  native dialog or automatic retry/schedule.
- Discovering an update does not download it. Startup and check operations
  never call `downloadUpdate()` or `applyUpdate()`.

## Typed RPC and State

- RPC can retrieve current updater state, request a check, and explicitly
  request download/preparation for a later consent UI.
- State represents at minimum not checked/checking, no update, update
  available with version, downloading/preparing, ready-to-apply, unsupported,
  and failure outcomes.
- Electrobun implementation types and raw error objects are not exposed as the
  renderer contract. No RPC apply/restart method is added in S129.
- Repeated concurrent checks coalesce or return the same in-flight outcome;
  repeated download requests do not cause duplicate downloads. Invalid
  transitions have deterministic typed results.

## Focused Tests

- Injected adapter tests cover stable check with no update, available version,
  check request failure, download/preparation failure, successful ready state,
  and unsupported/development configuration without a production request.
- Tests prove startup check executes once, explicit checks share the same
  coordinator, duplicate requests do not duplicate API calls, and a check
  never causes a download.
- RPC contract validation proves the declared typed operations and wired
  request handlers remain consistent.
- No automated test calls GitHub or a public update endpoint.

## Verification and Residuals

- Focused updater tests, the desktop RPC contract check, desktop typecheck,
  and the configured desktop test command pass; exact results and all
  first-failure/retry history are recorded in S129 Builder evidence.
- `git diff --check` passes. Existing `before-quit` and `will-close` save and
  conflict protection remains unchanged.
- No update prompt, Help command, Later/dismiss behavior, `applyUpdate()`,
  restart retry, installed-app update, or cross-platform certification is
  claimed. These remain S130/S132 scope or explicit residuals.
- S129 Builder recommendation and separate Product Owner disposition are
  recorded independently. No release, publication, deployment, or platform
  certification authority follows S129.
