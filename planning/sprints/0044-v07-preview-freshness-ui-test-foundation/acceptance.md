# Sprint 044 Acceptance Criteria

**Builder verification: all Sprint 044 criteria have passing evidence as of 2026-10-03; Lead Developer disposition remains pending.** See [Builder evidence](builder-evidence.md). Native Electrobun IPC/window behavior was not exercised and is not claimed.

Sprint 044 is complete when:

- The reported edit, debounce, computation, and preview sequence has been reproduced or its non-reproduction is documented with exact steps, timing, environment, and observed status/output.
- Preview scheduling, autosave, captured request identity, freshness comparisons, result publication, and iframe rendering have been traced to their controlling code paths.
- A deterministic source-dependent delayed-worker regression confirms or falsifies the autosave/disk-hash hypothesis before any production freshness change is selected. The evidence identifies the exact values that changed and the acceptance/rejection decision.
- If a defect is confirmed, the production fix is limited to the responsible comparison and the regression passes. If the hypothesis is falsified, the actual controlling cause is supported by a nearby discriminating test or trace; no speculative production change is made.
- The current valid result after autosave reaches the rendered preview iframe and success state. A genuinely obsolete result is rejected when project, active document/revision, input/settings, job identity, or cancellation state is superseded.
- Invalid or stale current input preserves the last-good preview and displays the appropriate non-success status rather than replacing the preview with invalid output.
- Automated checks prove that pause stops automatic refresh, resume restores it, and manual refresh remains usable while paused. The existing 400 ms debounce remains unless measured evidence justifies a change; no configured/default debounce exceeds 500 ms.
- The Sprint 042 workflow harness has a recorded, bounded browser-automation compatibility result and a reasoned maintain/reuse decision. Any new browser dependency is maintained, test-only, and added only when the proof demonstrates need.
- Focused preview/service/UI checks and applicable desktop test, typecheck, and production-build checks pass; `git diff --check` passes. Exact commands, results, versions, warnings, and unverified checks are recorded.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` accurately record the implementation/evidence disposition and remaining owners/questions. No Sprint 045/046 scope or native/accessibility/release certification is claimed.