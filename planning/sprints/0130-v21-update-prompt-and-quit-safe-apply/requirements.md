# Sprint 130 Requirements: V0.21 Update Prompt and Quit-Safe Apply

## Document Status

Architect-prepared sprint packet. Sprint 129 was ACCEPTED/CLOSED WITH
RECORDED RESIDUALS on 2026-11-27; this satisfies the S130 dependency only.
This packet authorizes planning, not implementation or verification. Obtain
separate exact execution authorization before source edits or commands.

## Goal

Deliver the user-facing stable update workflow over the S129 main-process
updater: add a manual check command, present available versions with Update
and Later choices, start download/preparation only after consent, and safely
apply a prepared update through Electrobun. Preserve the existing save and
conflict guard. If the user cancels that guard, keep the update staged and
provide a persistent restart action.

## Inputs and Authority

- V0.21 product contract and sprint sequence:
  [`plan-openamxV21MasterSprintPlan.md`](../../plan-openamxV21MasterSprintPlan.md).
- Accepted S129 RPC/state contract and residuals:
  [`S129 acceptance`](../0129-v21-main-process-updater-integration/acceptance.md),
  [`S129 Builder evidence`](../0129-v21-main-process-updater-integration/builder-evidence.md),
  and `desktop-app/src/shared/rpc.ts`.
- S129 updater owner and quit guard:
  `desktop-app/src/bun/updater.ts` and `desktop-app/src/bun/index.ts`.
- Existing UI command and Help surface:
  `desktop-app/src/mainview/App.vue`,
  `desktop-app/src/mainview/components/CommandPalette.vue`,
  and `desktop-app/src/mainview/components/HelpCenterDialog.vue`.
- Existing UI test harness:
  `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts` and
  `desktop-app/tests/ui/*.pw.ts`.
- Official pinned API references rechecked 2026-11-27:
  [Electrobun Updater API](https://docs.electrobun.dev/electrobun/apis/updater/)
  and [Events API](https://docs.electrobun.dev/electrobun/apis/events/).
  The installed Electrobun 2.0.7 declarations remain authoritative at
  implementation time.

## Accepted Product Decisions

- Check once on launch (owned by S129) and when the user explicitly selects
  `Check for updates`. Do not schedule recurring checks.
- Stable GitHub Releases are the only production update source. Do not check
  from development, non-stable, unsupported, or non-direct-updater builds.
- An available update prompt shows its version and offers Update or Later.
  Closing/dismissing the offer has the same no-download effect as Later.
- Download and preparation start only after the user selects Update. Apply
  only after Electrobun reports the update ready.
- No-update results and routine check failures stay quiet. Download and apply
  failures are explained in context without exiting or damaging the running
  installation.
- Electrobun owns update download, verification, preparation, transactional
  replacement, and relaunch. OpenAMX does not implement a replacement engine.
- The current unsaved/conflicted-tab guard remains authoritative. Save All or
  Discard All may authorize the apply handoff; Cancel or save/conflict failure
  keeps the app open and the staged update available.
- V0.20 installations need a normal V0.21 installer upgrade first. S130 does
  not make old binaries update-aware.

## In Scope

- Add a searchable `Check for updates` command to the existing Help/command
  surface and wire it to S129's `checkForUpdates` RPC.
- Surface an update discovered by the one startup check even if it completes
  after the webview first reads state. Read/poll only Bun's local RPC state or
  use an approved state notification; do not repeat host checks.
- Add an accessible, dismissible available-update prompt with version and
  Update/Later actions. Later, Escape, or close must not download.
- Show a meaningful preparing state after consent without inventing byte
  percentages that the pinned API does not provide.
- When prepared, initiate apply through a typed main-process operation. Keep
  the renderer out of Electrobun internals.
- Integrate apply with the existing quit/save/conflict guard. Because
  Electrobun's `before-quit` event is synchronous and does not await returned
  promises, perform asynchronous save/discard confirmation before calling
  `Updater.applyUpdate()`. Use a narrowly scoped approval for the resulting
  native apply handoff; do not call `Utils.quit()` as a substitute for apply.
- If save/discard is canceled or blocked, retain ready state and present a
  persistent `Restart to update` action until applied or no longer available.
- Cover cancel, save, discard, retry, duplicate interaction, check/download/
  apply errors, and staged retry with focused unit and UI-harness tests.

## Out of Scope

- New release-host, toolchain, artifact, assembly, or publisher behavior.
- Changes to app identity, version authority, stable channel, updater host, or
  S129's default full-bundle policy.
- Canary/prerelease updates, telemetry, analytics, a backend, scheduled
  checks, silent downloads, forced updates, or forced restarts.
- General release-runbook changes; Sprint 131 owns `docs/releasing.md` updates.
- Real GitHub release checks/publication, installed-package rollout, or
  cross-platform certification; Sprint 132 owns integrated acceptance.
- Unrelated workbench UX, menu redesign, or changes to the underlying save/
  conflict semantics.

## Constraints

- Main-process RPC remains the only boundary to check, download, and apply.
- Reuse the S129 state machine and operations wherever practical. Any added
  `applyUpdate`/restart operation must be typed and handled in Bun main.
- The updater apply path must use the exact same `confirmQuit` save/discard
  behavior as normal quit. No unsaved or conflicted tab may be discarded
  without the user's chosen action.
- The apply approval must be scoped to one prepared-update handoff and cleared
  on cancel/failure; it must not permanently disable normal quit protection.
- `before-quit`/`will-close` handlers are synchronous; never rely on them
  awaiting a promise. Validate the installed API's precise veto and apply
  behavior against pinned 2.0.7 types/docs before implementation.
- Automated UI and RPC tests use local mocks/fixtures only. They must not
  contact the public update host or publish releases.
- Keep exact execution authorization, the S130 file allowlist, output roots,
  preservation, retry/stop policy, and residual disposition separate from
  this planning packet.
