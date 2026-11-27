# Sprint 130 Blueprint: V0.21 Update Prompt and Quit-Safe Apply

## Approach

1. Confirm the S129 Product Owner disposition and read the actual S129 updater
   state/RPC types. Recheck pinned Electrobun 2.0.7 `applyUpdate()` and event
   declarations from the prepared devkit. Record any doc/type mismatch before
   implementing.
2. Add `Check for updates` to the existing `ShellCommand[]` in
   `App.vue`. Route it through `checkForUpdates`; only available state opens
   the offer. Keep up-to-date, unsupported, and routine check failures quiet.
3. On mount, read `getUpdateState` and surface completion of S129's startup
   check. The current RPC is request/response only; either add a narrowly
   scoped typed state notification, or poll only `getUpdateState` while the
   local coordinator is checking/preparing. Never trigger a second host check
   merely to refresh UI state.
4. Add an accessible available-update dialog showing the offered version and
   Update/Later actions. Escape, close, and Later all dismiss without calling
   `downloadUpdate`. Do not show the Update offer for unsupported or failed
   states.
5. On explicit Update, disable duplicate actions and call S129's
   `downloadUpdate`. Show a clear preparation state; do not show fake byte
   progress. On ready, invoke a typed main-process apply operation. Surface
   download/apply failures in context with a safe retry path.
6. Implement quit-safe apply as an explicit two-stage handshake:
   - The apply RPC confirms state is `ready` and awaits the existing
     `service.request.confirmQuit()` path before calling Electrobun. This
     handles Save All, Discard All, Cancel, and save/conflict failures before
     the synchronous native `before-quit` event.
   - If confirmation returns not-ready or an error, do not call
     `Updater.applyUpdate()`. Keep ready state and expose a persistent
     `Restart to update` action.
   - If confirmation succeeds, set a narrowly scoped update-handoff approval,
     then call `Updater.applyUpdate()`. The existing synchronous
     `before-quit` and `will-close` handlers allow only this authorized
     handoff, not unrelated quits. Clear approval on rejection/failure; do not
     call `Utils.quit()` for this path.
   - If the handoff is vetoed or fails, keep the app usable, retain or refresh
     staged state according to the actual updater state, and expose an
     actionable retry. Verify the pinned API semantics rather than assuming a
     resolved promise proves the new app launched.
7. Keep a persistent `Restart to update` affordance visible while state is
   ready after a canceled/failed guard. Add the action to the command surface
   as appropriate, while retaining a visible app-chrome action so it is not
   lost after the modal closes. It should disappear only after apply/handoff
   succeeds or the update is no longer ready.
8. Extend typed RPC, the command-palette UI, and the existing Vite mock RPC
   harness with deterministic scenarios. Test Later/no-download, consented
   download, no-update quietness, startup result after initial mount, save,
   discard, cancel, save failure, repeated action, failure/retry, and
   ready-state persistence. Add isolated main-process tests for the approval
   handshake and one-shot scope.
9. Run focused updater/RPC/UI checks and preservation audit under the separately
   authorized validation worktree. Record raw results and leave unavailable
   native routes unverified.

## Quit/Apply State Contract

- `ready` means the update is prepared and can be offered for restart; it does
  not mean it is installed.
- `Later` applies only before download and leaves no staged payload requirement.
- Canceling Save/Discard after preparation leaves the application open and the
  update ready. A persistent restart action remains available.
- Apply proceeds only after the shared quit service returns `ready: true`.
- The synchronous Electrobun quit callbacks may allow an update handoff only
  while a corresponding apply operation has already passed the async save/
  conflict preflight.
- A failed handoff must not silently set a permanent quit bypass or report
  success. The current installation remains usable; show a useful error and
  retain a retry when the native staged state remains ready.

## Candidate File Allowlist

Implementation candidates, only after separate authorization:

- `desktop-app/src/mainview/App.vue`
- `desktop-app/src/mainview/app.css`
- `desktop-app/src/shared/rpc.ts`
- `desktop-app/src/bun/index.ts`
- `desktop-app/src/bun/updater.ts`
- `desktop-app/src/bun/updateApply.ts` and its focused test, if the
  asynchronous preflight/one-shot approval needs an isolated testable owner
- `desktop-app/tests/rpc-contract-check.ts`
- `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`
- `desktop-app/tests/ui/update-workflow.pw.ts`
- Files under this Sprint 130 directory, including evidence/artifacts.

Do not change toolchain pins, release scripts, `docs/releasing.md`, app
identity/version, save/conflict behavior in `desktopService.ts`, or unrelated
UI components. If a necessary change falls outside this list, stop and request
an amendment before editing.

## Risks and Questions

- Electrobun event handlers run synchronously. An `await` inside
  `before-quit` cannot delay a native action; the save/discard preflight must
  complete before `applyUpdate()` is invoked.
- A transient handoff permit must cover both `before-quit` and the matching
  `will-close` path without authorizing unrelated user quit attempts. The
  Builder must prove this with injected tests and native/API behavior or stop
  for a design decision.
- S129 exposes state through request/response RPC, not a push subscription.
  Startup result delivery must avoid a second check and avoid indefinite
  polling.
- Electrobun status events report overall preparation/handoff status, not
  byte-level progress. UI must not imply a percentage.
- S128/S129 exercised native packaging/injected APIs only on Windows x64;
  S130 UI harness and mocks do not establish native updater behavior.

## Non-Goals

- No app-level updater implementation, custom download protocol, installer,
  or transactional replacement logic.
- No automatic checking beyond the S129 launch check, no silent download,
  and no apply before preparation is ready.
- No release publication or public-endpoint test.
