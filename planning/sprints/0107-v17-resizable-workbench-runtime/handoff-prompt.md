# Sprint 107 Handoff Prompt

You are executing Sprint 107, V0.17 Resizable Workbench and Runtime Panel. Do
not edit until separate Sprint 107 authorization and an exact source/test/
output plan are approved. Preserve the worktree, generated outputs, and
unrelated user changes.

The Sprint 102 Resizable technical gate is still OPEN. Before selecting a
production path, verify the actual installed splitter API, exercise the real
`setPanelSizes` service/RPC with independent recent-project A/B values, and
mount the candidate through the actual App.vue workbench. The prior S102
prototype used mock persistence and does not pass those requirements. Record
GO, NO-GO, or OPEN in `technical-gate.md` and `builder-evidence.md`. If Reka
fails, use an equivalent accessible splitter meeting the same constraints;
do not silently relax them. Do not use global local-storage auto-save as the
per-project size authority.

Preserve the three panels, 160-400 px explorer, 260 px editor/context minima,
25-65% context bounds, keyboard/focus/accessibility, 1024x720 and larger
desktop behavior, responsive stacking, focus modes, and project-specific
size persistence. Hidden panels must not save bogus dimensions.

Keep runtime at the bottom. Remove Bottom/Right controls, relocation behavior,
`DrawerDock` type/state, Preferences field/wiring, and obsolete right-docking
layout/CSS. Preserve Run, Cancel, Details, status/stage/progress/cleanup,
diagnostics/results, export status/output Open/Reveal, themes, and independent
scrolling.

Use `acceptance-test-matrix.md`; update only approved UI/RPC tests and keep
fresh outputs under Sprint 107. Record exact commands, counts, artifacts,
failures/retries, gate decision, and residuals. This sprint authorizes no
release, publication, version change, certification, or Sprint 108 execution.