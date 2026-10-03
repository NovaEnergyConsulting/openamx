# Sprint 044 Handoff Prompt

You are the Builder for OpenAMX Sprint 044.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV07MasterSprintPlan.md`
- `planning/ideas/desktop-app-features.md`
- `planning/plan-openamxV06MasterSprintPlan.md` and the V0.6 product/preview contract
- Sprint 042 requirements, acceptance, and Builder evidence
- `planning/sprints/0044-v07-preview-freshness-ui-test-foundation/requirements.md`
- `planning/sprints/0044-v07-preview-freshness-ui-test-foundation/blueprint.md`
- `planning/sprints/0044-v07-preview-freshness-ui-test-foundation/acceptance.md`
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/bun/desktopService.ts`, relevant preview tests, and `desktop-app/spikes/sprint042-workflow-harness/`

## Task Contract

**objective**: Reproduce and correct the preview-after-autosave freshness failure if confirmed, add deterministic coverage for valid/current and obsolete results plus pause/resume/manual refresh/last-good behavior, and establish a justified repeatable browser/UI test approach.

**owns**: Sprint 044 preview scheduling/result acceptance and narrowly required freshness correction; focused service/UI regression coverage; bounded workflow-harness/browser-automation feasibility; exact evidence and Sprint 044 planning disposition.

**must_not**: Assume the disk-hash race is the cause; select a production fix before a delayed-worker regression confirms or falsifies it; weaken project/document/input/settings/job/cancellation identity checks; replace a valid last-good preview with invalid output; make AMX/CLI/VS Code changes; add browser dependencies to production; or claim browser evidence as native certification. Do not implement Sprint 045/046 features or unrelated V0.7 backlog.

**decision gates**: Keep the 400 ms preview debounce unless evidence supports a change and never exceed the existing 500 ms maximum. A new browser dependency is permitted only if a bounded compatibility proof establishes it is needed; it must be scoped to desktop tests. Record any remaining uncertainty in `planning/questions.md` rather than inventing behavior.

**acceptance**: Meet every item in `planning/sprints/0044-v07-preview-freshness-ui-test-foundation/acceptance.md`. In particular, prove current output reaches the iframe after autosave while genuinely superseded jobs remain rejected.

**verification**:

1. Reproduce the reported behavior and record exact steps, debounce, status, and output.
2. Add/run the deterministic source-dependent delayed-worker case before making any production freshness correction.
3. Verify current result publication, obsolete-result rejection, invalid/stale last-good retention, pause/resume, and manual refresh while paused.
4. Prove the browser/UI harness approach with a bounded compatibility check; justify any maintained desktop-test-only dependency.
5. Run focused tests first, then applicable desktop test/typecheck/build checks and `git diff --check`. Record exact commands/results, browser/runtime versions, warnings, artifacts, and unavailable native checks.
6. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 044 evidence. Do not report unperformed checks as passes.