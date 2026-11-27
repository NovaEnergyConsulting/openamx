# Sprint 130 Acceptance Criteria

Sprint 130 is complete when the desktop offers a manual stable update check,
shows a consent-based version offer, prepares only after consent, and applies a
ready update through a quit-safe main-process path. Canceling the existing
save/conflict guard must leave the app open with the update staged and a
persistent restart action.

## Entry and Scope

- Sprint 129 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS. Its exact RPC
  contract and updater state machine are the implementation baseline.
- Separate Product Owner authorization names the exact baseline, validation
  worktree, changed-file allowlist, command/CWD matrix, artifact/evidence
  roots, preservation and cleanup boundaries, retry/stop rule, and residual
  disposition process.
- All implementation remains inside the authorized S130 allowlist. Preserve
  S128/S129 evidence and the V0.20 raw status ledger.

## Manual and Startup Check UX

- The existing Help/command palette includes `Check for updates` and routes
  to S129's shared explicit check RPC.
- The S129 startup check result is eventually reflected even if it completes
  after the webview first loads. UI state refresh does not issue another host
  check.
- An available update presents its exact offered version and Update/Later
  choices. Escape, close, and Later dismiss the offer without invoking
  `downloadUpdate`.
- No-update, unsupported, and routine check/network-failure outcomes do not
  create a modal, native dialog, or repeated background check.
- Development/non-stable/unsupported configurations never contact the
  production stable update host.

## Consent, Preparation, and Errors

- `downloadUpdate` is invoked only after an explicit Update action; repeated
  clicks cannot create duplicate downloads.
- A clear preparing state is shown while the native operation is pending. No
  fabricated percentage or byte progress is displayed.
- Apply is requested only after the updater reports `ready`.
- Download/preparation and apply failures are explained in context, leave the
  installed app open, and allow a safe retry when the updater still reports a
  ready staged update.
- Closing or dismissing the offer before download does not cause a later
  automatic download.

## Quit-Safe Apply

- Before invoking `Updater.applyUpdate()`, the Bun main process awaits the
  existing `confirmQuit()` save/discard/conflict path. It must not await inside
  the synchronous Electrobun `before-quit`/`will-close` callbacks.
- Save All proceeds only after every dirty/conflicted tab is safely handled;
  failed saves/conflicts keep the app open and do not start apply.
- Discard All proceeds only after the user explicitly selects it.
- Cancel leaves the app open, preserves the staged ready update, and shows a
  persistent `Restart to update` action in app chrome (and command palette if
  included in the approved implementation).
- The persistent action re-runs the same save/discard/cancel guard. It does
  not bypass conflicts or invoke apply while the state is not ready.
- The one-shot apply approval is scoped to the corresponding Electrobun
  handoff, allows required quit/close callbacks for that handoff, and is
  cleared on failure/cancel. Normal quit protection remains active afterward.
- Successful handoff relies on Electrobun's transactional apply/relaunch; no
  app-level file replacement or force quit is implemented.

## Required Tests and Evidence

- Focused main-process tests prove apply requires ready state, performs
  asynchronous quit preflight before native apply, blocks on Cancel/save
  failure, allows Save/Discard, scopes/clears the handoff permit, and retains
  retry after failure.
- Focused UI harness tests cover command discovery/activation, available
  version prompt, Later/Escape no-download, consented preparation, quiet
  no-update/check failure, startup-result arrival, preparation/apply error,
  save/discard/cancel, staged retry, and duplicate interactions.
- RPC contract/type checks prove new apply methods and UI calls remain typed.
  All automated tests use local mocks; no public update host is contacted.
- Focused desktop tests, RPC contract check, desktop typecheck, UI workflow
  suite, and `git diff --check` pass. Keep exact commands/results, retries,
  preservation hashes, and residuals in S130 Builder evidence.
- Installed-app updater behavior and cross-platform behavior are not inferred
  from tests or Vite harness checks. They remain S132 acceptance work.
- Builder recommendation and separate Product Owner disposition are recorded
  independently. No release, publication, deployment, or certification
  authority follows S130.
