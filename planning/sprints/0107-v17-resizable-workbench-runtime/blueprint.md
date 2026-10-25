# Sprint 107 Blueprint: V0.17 Resizable Workbench and Runtime Panel

## Approach

1. Obtain separate Sprint 107 execution authorization and an exact
   source/test/output plan. Confirm the V0.16 closeout gate is closed. Record
   that Sprint 106's implementation evidence is complete but its separate
   product-owner disposition is still pending unless that status changes.
2. Close the S102 resizer technical gap before selecting a production path.
   Verify actual installed Reka exports/types, actual `setPanelSizes` service
   persistence for projects A/B, and a candidate integrated with the real
   App.vue layout. Do not treat the existing S102 all-percent prototype's
   in-memory persistence as a pass.
3. Record an explicit GO/NO-GO/OPEN in `technical-gate.md` and the authorized
   Sprint 107 evidence. GO requires all bounds, per-project persistence,
   keyboard, focus-mode, and responsive cases. If Reka fails, use the approved
   accessible equivalent. If evidence cannot be obtained, stop/rescope rather
   than shipping an unverified resize path.
4. For a GO candidate, use a three-panel horizontal group with two vertical
   handles and local wrappers over the installed Reka UI primitives. Convert
   between the panel group's layout representation and the existing
   `{ explorerWidth, previewWidth }` values without including handle width
   incorrectly. Keep actual recent-project RPC as the only persisted source
   of truth; do not enable `autoSaveId`.
5. Test persistence by changing sizes with pointer and keyboard in project A,
   switching to project B and changing its sizes, then reopening A/B and
   proving each restores independently. Also verify startup/default behavior
   when no saved sizing exists and rejection/clamping of invalid persisted
   values according to the approved policy.
6. Preserve focus-mode behavior and responsive CSS. Hidden panels or the
   <=900 px stacked layout must not trigger resize events that persist zero,
   normalized, or otherwise bogus panel sizes. At 1024x720 and 1440x900,
   assert all three desktop panels remain useful; at narrow sizes assert the
   stack remains reachable and no overflow occurs.
7. Remove runtime relocation only after resizer/layout integration is stable.
   Keep the runtime panel on the bottom grid row; remove Bottom/Right
   controls, `DrawerDock` state/type/preferences/localStorage wiring, and
   `.drawer-right` layout rules. Preserve the runtime panel and all actions/
   content listed in `implementation-contract.md`.
8. Update focused UI tests, including `workbench-comfort.pw.ts` and a new
   `resizable-runtime.pw.ts` where appropriate. Keep runtime run/details/output
   behavior and independent scrolling covered at desktop and narrow
   viewports.
9. Run direct desktop typecheck, focused resize/runtime UI tests, actual RPC
   persistence tests, relevant existing workbench tests, and `git diff
   --check`. If a build is authorized, isolate generated outputs exactly as
   approved. Record unavailable native-host behavior as unavailable, not
   certified.
10. Complete `acceptance-test-matrix.md` and `builder-evidence.md` with exact
    commands, counts, artifacts, first failures/retries, gate decision, and
    residuals. Request separate product-owner acceptance; do not infer S108
    or release authority.

## Candidate File Plan

Expected implementation paths, subject to separate approval:

- `desktop-app/src/mainview/App.vue` — splitter wiring, size conversion and
  per-project RPC persistence; remove drawer-dock state and preference
  wiring.
- Local resizable wrappers under `desktop-app/src/mainview/components/ui/`
  or an approved equivalent implementation; do not add dependencies without
  separate approval.
- `desktop-app/src/mainview/components/RuntimePanel.vue` — remove dock prop,
  event, and Bottom/Right controls while retaining runtime content/actions.
- `desktop-app/src/mainview/components/PreferencesDialog.vue` and
  `desktop-app/src/mainview/shell.ts` — remove drawer-dock preference/type.
- `desktop-app/src/mainview/app.css` — splitter group/handle styles, removal
  of `.drawer-right` CSS, and responsive preservation only.
- `desktop-app/tests/ui/resizable-runtime.pw.ts` and/or approved narrow
  updates to `workbench-comfort.pw.ts`, `shell-components.pw.ts`, and relevant
  desktop RPC tests.
- `planning/sprints/0107-v17-resizable-workbench-runtime/builder-evidence.md`.

The exact list must be approved before implementation. No S102/S106
historical evidence, package manifests, generated artifacts, or unrelated
tests may be modified without explicit scope approval.

## Proposed Verification

From `desktop-app/`, subject to approved isolation/output paths:

- `bunx vue-tsc --noEmit` (report Hutch-wrapper attempts separately if
  authorized).
- Focused resizer/runtime Playwright at 1024x720, 1440x900, and an adaptive
  viewport such as 820x720.
- Actual service/RPC tests for per-project size persistence and invalid
  bounds, with two project records.
- Existing `workbench-comfort.pw.ts`, `shell-components.pw.ts`, and applicable
  UI tests; update expectations that asserted right docking or old custom
  separators only under the approved plan.
- Desktop web build only if approved with isolated generated-output paths.
- `git diff --check` and exact path/artifact inventory.

## Notes

Sprint 107 closes the layout/runtime requirements only. It does not close
V0.17 integrated acceptance, release, publication, version changes, or
platform certification.