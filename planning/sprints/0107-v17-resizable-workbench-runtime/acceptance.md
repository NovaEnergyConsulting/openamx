# Sprint 107 Acceptance Criteria

Sprint 107 is complete only when the resizer technical gate is explicitly
closed, workbench sizing and persistence meet the accepted contract, and the
runtime is fixed at the bottom with all existing behavior preserved.

## Resizer Gate and Behavior

- `technical-gate.md` has an evidence-backed GO for Reka or NO-GO with an
  accessible equivalent. OPEN/BLOCKED does not count as selecting a path.
- Actual installed API, actual `setPanelSizes` service/RPC persistence, and
  actual App.vue integration are verified; the S102 in-memory mock results
  alone are insufficient.
- Explorer/editor/context remain in order with two keyboard-operable
  splitters. Bounds, minima, 1024x720 and larger desktop usability, focus
  modes, and responsive stack are covered.
- A/B recent-project layouts persist independently through the trusted
  per-project service. No global splitter `autoSaveId`/local-storage store is
  used as authority.
- Keyboard handles provide visible focus and accessible splitter semantics,
  stop at limits, and do not trap focus. Pointer and keyboard changes persist
  only valid stable layouts.
- If Reka cannot meet a requirement, the equivalent implementation passes
  the same cases; constraints are not silently relaxed.

## Runtime Panel

- Runtime remains in the bottom row at all supported layout sizes.
- Bottom/Right controls, runtime drawer preference, `DrawerDock` state and
  type, local preference wiring, and obsolete right-docking CSS/layout are
  removed from active code.
- Preferences continues to preserve Appearance, line wrapping, Autosave,
  and autosave-delay behavior.
- Run, Cancel, Details, status/stage/progress/cleanup, export status/output
  actions, diagnostics/results/input detail, and accessible labels/live
  regions remain functional.
- Runtime and each content pane keep their independent bounded scrolling; the
  preview/context pane is not removed or replaced when docking state is
  removed.

## Verification and Boundaries

- `acceptance-test-matrix.md` cases are covered by focused UI/RPC evidence;
  unavailable native-host behavior is explicitly recorded.
- Desktop typecheck and focused resize/runtime tests pass. Build/tests use
  approved isolated output paths. `git diff --check` and path inventory pass.
- No folder operations, command-palette changes, AMX semantics, RPC unrelated
  to sizing, release/version/package behavior, publication, or platform
  certification are included.
- Builder evidence records exact results, failures/retries, final gate
  decision, and residuals. Separate product-owner acceptance is required;
  S108 and release authority are not inferred.