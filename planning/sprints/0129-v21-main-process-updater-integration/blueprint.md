# Sprint 129 Blueprint: V0.21 Main-Process Updater Integration

## Approach

1. Recheck the S128 disposition and exact pins. Read the updater declarations
   produced by the pinned Electrobun 2.0.7 devkit and the official API docs;
   adapt to the actual typed signatures rather than copying a floating example.
2. Define a small internal updater port around the required Electrobun calls:
   obtain local packaged update metadata, check, read update state, and
   download/prepare. Provide a production adapter over `Updater` and inject a
   deterministic adapter in tests.
3. Keep the coordinator separate from `src/bun/index.ts` lifecycle wiring so
   the state machine can be tested without constructing a native window or
   calling a public endpoint. The coordinator owns current state and in-flight
   promises.
4. Model only the necessary transitions:
   - idle/not checked -> checking -> no update or available version;
   - checking -> quiet check failure state on request failure;
   - available -> downloading/preparing only on explicit RPC invocation;
   - downloading/preparing -> ready-to-apply or actionable download failure;
   - unsupported development/non-stable configuration -> unsupported/disabled
     state without a production network request.
5. Coalesce duplicate checks and duplicate downloads. A concurrent check must
   not start while download/preparation is active, and repeated download
   requests must not create another download. Reject or return the current
   state for invalid transitions consistently and test the selected behavior.
6. Add typed updater state and request/response methods to
   `src/shared/rpc.ts`, then wire the coordinator request methods alongside
   the existing `service.request` in `src/bun/index.ts`. Startup invokes the
   same check method once after initialization; no renderer notification is
   added.
7. Keep existing `before-quit` and `will-close` handlers unchanged. S129 does
   not call `applyUpdate`; ready state is the boundary consumed by S130.
8. Add injected tests for the state transitions, failure paths, unsupported
   builds, startup single-check behavior, request coalescing, and the guarantee
   that checking never downloads. Run the existing RPC contract check and
   focused desktop validation.

## Suggested Internal State Contract

The final type names are implementation details, but the externally visible
contract should distinguish these outcomes without leaking Electrobun internals:

- status: `not-checked`, `checking`, `up-to-date`, `available`,
  `downloading`, `ready`, `unsupported`, or `failed`;
- optional available version;
- optional stable error code and user-actionable message for check/download
  failures, while keeping routine check failures quiet in the UI;
- no raw payload, filesystem path, or native implementation object.

The RPC should support reading current state, requesting a check, and
explicitly requesting download/preparation. It should not expose apply/restart
in S129. S130 may refine the exact return shape only through an agreed
cross-sprint contract update, not by moving updater ownership into the renderer.

## Planned File Allowlist

- `desktop-app/src/bun/index.ts`
- `desktop-app/src/bun/updater.ts` (new internal coordinator, if that remains
  the smallest testable owner)
- `desktop-app/src/bun/updater.test.ts` (focused injected tests)
- `desktop-app/src/shared/rpc.ts`
- `desktop-app/tests/rpc-contract-check.ts`
- Files under this S129 directory, including evidence/artifacts.

Do not edit `desktop-app/src/mainview/App.vue`, menu/help files, UI tests,
`docs/releasing.md`, release scripts, package manifests, toolchain configs, or
app identity. If the pinned API cannot satisfy the contract without changing
one of those surfaces, stop and request a scope amendment.

## Risks and Questions

- Electrobun's installed type declarations may differ from the current docs;
  the pinned package/devkit is authoritative for compile-time signatures.
- A launch check and manual check may race. Both must use the same
  single-flight coordinator.
- A request failure is represented in internal state for UI handling but must
  remain quiet by default; do not show native dialogs from the coordinator.
- A download can be ready but not applied. Treat `ready` as staged state only;
  do not infer installation or relaunch success.
- The current quit guard vetoes quit until `confirmQuit()` succeeds. S130 must
  integrate `applyUpdate()` with this lifecycle without bypassing the guard.
- Windows x64 is the only S128 native packaging host verified. S129's injected
  tests and typecheck do not change that platform residual.

## Non-Goals

- No renderer update prompt, user-facing menu action, Later/dismiss flow, or
  restart affordance.
- No automatic download, update apply, forced quit, restart, or scheduler.
- No public GitHub route validation, release publication, or platform
  certification.
