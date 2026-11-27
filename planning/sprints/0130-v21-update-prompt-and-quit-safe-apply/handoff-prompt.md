# Sprint 130 Handoff Prompt

You are the Builder for OpenAMX Sprint 130: V0.21 Update Prompt and Quit-Safe
Apply.

## Read First

- `.agents/main.md`, `planning/state.md`, and `planning/decisions.md`.
- `planning/plan-openamxV21MasterSprintPlan.md` and every S130 packet
  document, especially requirements, blueprint, acceptance, and verification
  plan.
- The accepted S129 [`acceptance criteria`](../0129-v21-main-process-updater-integration/acceptance.md)
  and [`Builder evidence`](../0129-v21-main-process-updater-integration/builder-evidence.md).
- `desktop-app/src/bun/updater.ts`, `desktop-app/src/bun/index.ts`,
  `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`,
  `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/shell.ts`,
  and `desktop-app/src/mainview/components/CommandPalette.vue`.
- `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`, the
  existing `desktop-app/tests/ui/*.pw.ts` conventions, and the pinned
  Electrobun 2.0.7 `Updater` and event type declarations.
- Official [Updater API](https://docs.electrobun.dev/electrobun/apis/updater/)
  and [Events API](https://docs.electrobun.dev/electrobun/apis/events/).

## Authority Gate

S129 acceptance satisfies the sprint dependency; it does not authorize S130
execution. Obtain separate Product Owner authorization for the exact baseline,
detached worktree, changed-file allowlist, command/CWD matrix, evidence roots,
preservation/cleanup boundaries, retry/stop rule, and residual disposition
process before source edits or verification.

Preserve S128/S129 evidence and generated outputs. Use mocks/local fixtures
only. Do not query or publish to GitHub, build a release, or claim installed-app
or cross-platform acceptance.

## Builder Task After Authorization

- Add `Check for updates` to the existing searchable Help/command surface.
  Use the S129 check RPC; keep no-update and routine check failures quiet.
- Surface the single startup-check result even if it arrives after UI mount,
  without triggering another host request.
- Show an accessible version offer with Update and Later. Later, close, and
  Escape must not download.
- Start `downloadUpdate()` only after consent; show preparation status without
  fabricated byte progress. Apply only after the updater says ready.
- Integrate apply through Bun-main-process code and preserve the existing
  Save All/Discard All/Cancel and conflict behavior.
- Respect the synchronous Electrobun event model: preflight the asynchronous
  `confirmQuit()` before calling `Updater.applyUpdate()`. Scope and test a
  one-shot approval for the matching `before-quit`/`will-close` handoff. Do
  not call `Utils.quit()` instead of updater apply or leave a persistent quit
  bypass after failure.
- If the save/conflict guard is canceled or blocked after staging, keep the
  update ready and provide a persistent `Restart to update` action that
  re-runs the same guard.
- Add injected main-process tests and local Playwright workflow-harness cases
  for quiet outcomes, consent, dismissal, errors, save/discard/cancel,
  persistence, retries, and duplicate interactions.
- Record raw commands, tool versions, first failures/retries, evidence hashes,
  preservation audit, and residuals in the authorized S130 evidence root.

## Stop Conditions

Stop immediately if apply can bypass save/conflict handling, the apply permit
cannot be scoped to one handoff, a test contacts the public update host,
Later/dismiss starts a download, the UI invents progress not supplied by the
pinned API, or the feature requires an out-of-scope source surface. Preserve
first failures and retries; there is no retry cap, but retries do not authorize
scope expansion. Request a replan before continuing past any stop condition.

S131 owns release documentation/pipeline follow-up. S132 owns packaged
installed-app update acceptance and integrated closeout. No release,
publication, deployment, or platform certification authority follows S130.
