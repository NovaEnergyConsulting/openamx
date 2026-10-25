# Sprint 107 Resizable Technical Gate

## Current Decision

**GO for Reka UI 2.10.5 with local wrappers.** Sprint 107 verified the
installed splitter exports and types, exercised actual `createDesktopService`
`setPanelSizes` persistence for independent projects A/B, and mounted the
candidate through the real `App.vue` workbench in the desktop UI harness.
Bounds, keyboard/focus, responsive behavior, and bottom-only runtime checks
passed. The historical Sprint 102 gate document is unchanged.

The S102 evidence also confirmed that installed shadcn-vue 2.8.2 has no
runtime Resizable export; it supplies registry/CLI capability. If used, the
product must provide a local wrapper over installed Reka UI 2.10.5 splitter
primitives. This does not require a package update.

The GO is a technical implementation decision only. Separate product-owner
acceptance remains pending; this does not certify the native Electrobun host
or authorize release, publication, version changes, or Sprint 108.

## Gate Cases

| ID | Required proof | Pass condition |
| --- | --- | --- |
| `S107-GATE-01` | Installed API in product build | Installed Reka splitter exports and types match the proposed local wrapper. No runtime install/update or unsupported shadcn-vue export assumption is needed. |
| `S107-GATE-02` | Actual service persistence | Pointer and keyboard changes call the actual `setPanelSizes` path; service state for project A and B remains independent after reopen. No mock-only pass. |
| `S107-GATE-03` | Actual App.vue integration | Candidate is mounted through the real workbench composition and preserves focus modes, active project changes, active-document views, runtime row, and responsive CSS. |
| `S107-GATE-04` | Bounds and conversion | Explorer 160-400 px, editor/context >=260 px, context 25-65%, and two stable splitter tracks are preserved at 1024x720 and 1440x900 without layout normalization or horizontal overflow. |
| `S107-GATE-05` | Keyboard and accessibility | Handles are Tab reachable, visibly focused, expose correct splitter semantics, respond to arrows/Home/End, stop at bounds, and do not trap focus. Test user-observable pixel bounds with tolerance stated. |
| `S107-GATE-06` | Responsive/focus-mode persistence | <=900 px stack and focus modes remain usable. Hiding/unmounting panels does not save collapsed/default/bogus dimensions or destroy project-specific desktop sizes. |
| `S107-GATE-07` | Runtime and dock removal integration | Bottom runtime row stays bounded/scrollable and all required actions/content survive; no Bottom/Right control, preference, state, or CSS path remains active. |

## Evidence and Decision Rule

- Verify `S107-GATE-01` and document the outcome before selecting the
  candidate.
- Verify `S107-GATE-02` and `S107-GATE-03` against the actual service/RPC and
  workbench. The S102 mock-only results do not satisfy either case.
- Verify bounds, keyboard, responsive behavior, and runtime coexistence in
  focused Playwright at 1024x720, 1440x900, and an adaptive viewport.
- **GO for Reka:** all required cases pass, including actual per-project RPC
  and App.vue integration. Use the local wrappers and existing service
  persistence; do not use `autoSaveId`/local storage as project state.
- **NO-GO for Reka:** any required bound, persistence, keyboard, focus-mode,
  or responsive condition fails. Use an equivalent accessible implementation
  meeting the same contract and record evidence for it.
- **OPEN/BLOCKED:** required actual service/App.vue evidence cannot be run or
  the candidate needs an unapproved scope change. Stop the production resizer
  change and request disposition; do not infer pass from documentation.

Record the final decision in Sprint 107 `builder-evidence.md` and seek the
required product-owner disposition. Do not silently edit Sprint 102's
historical gate record under this sprint's file plan.

## Executed Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| `S107-GATE-01` | PASS | Installed `reka-ui` exports `SplitterGroup`, `SplitterPanel`, and `SplitterResizeHandle`; wrapper templates typecheck against installed declarations. No runtime `shadcn-vue` Resizable export or dependency update is used. |
| `S107-GATE-02` | PASS | Actual service requests save A `(311 px, 37%)` and B `(378 px, 59%)`, restart from the session file, restore both roots independently, and reject `(159 px, 66%)`. App.vue commits stable pointer/keyboard changes through `setPanelSizes`; it does not use `autoSaveId` or local storage for dimensions. |
| `S107-GATE-03` | PASS | Playwright mounts production `App.vue`; tests cover active-document restoration, recent-project restore, focus modes, context pane, runtime row, and responsive CSS. Harness RPC is mocked; real service persistence is separately covered by the RPC contract test. |
| `S107-GATE-04` | PASS | Browser geometry passes at 1024x720 and 1440x900; explorer is 160-400 px, editor/context are at least 260 px, context remains 25-65%, and document width does not overflow. |
| `S107-GATE-05` | PASS | Both handles expose vertical separator semantics and labels; Tab/Shift+Tab traversal, visible focus, Arrow/Home/End behavior, and hard stops pass. Pixel geometry is asserted directly; Reka separator `aria-valuenow/min/max` are percentages. |
| `S107-GATE-06` | PASS | Focus-mode and <=900 px stacking tests pass. Only completed pointer/keyboard interactions can persist; the persistence function returns early in focus mode, responsive mode, or before a measured desktop layout exists. |
| `S107-GATE-07` | PASS | Runtime remains bounded in the bottom row and independently scrollable; actions/details/output, theme, and Preferences regressions pass. No active docking control/type/preference/CSS path remains. |

The final focused browser run passed 6/6 tests on Chromium 156.0.8078.4,
Windows x64, at 1024x720, 1440x900, and 820x720. Screenshots are under
`artifacts/playwright/sprint107-focused/`. Exact commands, retry history,
counts, and residuals are recorded in `builder-evidence.md`.