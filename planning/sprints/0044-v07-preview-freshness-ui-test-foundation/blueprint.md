# Sprint 044 Blueprint: Preview Freshness and UI-Test Foundation

## Approach

1. Establish the baseline and reproduce the reported edit/debounce/compute/preview sequence. Record the active document, visible status/output, debounce timing, and whether autosave occurred before or during the job.
2. Trace the preview path end to end: scheduling and pause/resume in `App.vue`, autosave and request identity in `desktopService.ts`, job result acceptance, and iframe source update. Identify which captured values are compared and when.
3. Build a deterministic delayed-worker regression around source-dependent output and autosave. Hold a preview result until autosave has completed, then determine whether the unchanged active buffer's current result is incorrectly rejected. Add contrasting cases that change document/project/input/settings/job ownership and must remain rejected.
4. Make a production change only if the regression establishes a defect. Keep the change within the controlling freshness comparison; retain every unrelated identity, cancellation, invalid-input, and last-good guard. If the hypothesis is false, use one nearby trace/test to isolate the actual rejection condition before deciding whether a production change is warranted.
5. Extend focused tests for the current output reaching the iframe, stale-result rejection, invalid/stale last-good behavior, automatic pause/resume, and manual refresh while paused. Assert visible status as well as worker/service completion so a computed result cannot silently fail to render.
6. Run a bounded browser-automation feasibility proof against the existing Sprint 042 workflow fixture and actual desktop component boundary. Record compatibility, setup/reproducibility, and limitations. Add a desktop-test-only browser dependency only if the proof requires it; do not turn a spike fixture into a maintained test boundary without demonstrating suitability.
7. Run focused regressions first, then the desktop test/typecheck/build checks applicable to changed files, and `git diff --check`. Record exact commands, outcomes, dependency decision, and any unavailable native observations.
8. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` to reflect evidence and disposition. Keep the Sprint 045/046 work and unrelated V0.7 backlog untouched.

## Files to Update

- `desktop-app/src/mainview/App.vue` and/or `desktop-app/src/bun/desktopService.ts` only if evidence identifies a production defect in those ownership boundaries
- Focused desktop preview/service tests and, if suitable, `desktop-app/spikes/sprint042-workflow-harness/`
- `desktop-app/package.json` and lockfile only if the bounded proof requires a maintained browser-test dependency
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 044 Builder evidence and acceptance disposition

## Notes

This sprint begins with investigation and deterministic reproduction, not a preselected fix. The crucial discriminating check is a source-dependent preview whose worker result is deliberately delayed until after autosave. Keep the default debounce at 400 ms unless measurements justify a change; 500 ms remains the maximum. UI/browser evidence can verify the workbench behavior but cannot establish native-platform acceptance.