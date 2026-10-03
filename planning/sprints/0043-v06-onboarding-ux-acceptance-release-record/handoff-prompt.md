# Sprint 043 Handoff Prompt

You are the Builder for OpenAMX Sprint 043.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- Sprint 035-042 requirements, acceptance, and Builder evidence, especially the Sprint 041 100k editor measurements and Sprint 042 final acceptance
- `planning/sprints/0043-v06-onboarding-ux-acceptance-release-record/requirements.md`
- `planning/sprints/0043-v06-onboarding-ux-acceptance-release-record/blueprint.md`
- `planning/sprints/0043-v06-onboarding-ux-acceptance-release-record/acceptance.md`
- Current welcome/project/recovery/session migration, help/preferences/diagnostic export, desktop RPC/workers, editor/data/export boundaries, examples, docs, and test suites

## Task Contract

**objective**: Complete V0.6 onboarding/help, V0.5 session migration, integrated UX acceptance, product documentation alignment, performance evidence, and truthful feature/release disposition.

**owns**: Guided first project, help/search/shortcuts/preferences/release notes/log export, safe legacy session migration, integrated end-to-end fixture, visual review, performance record, verified docs/metadata, residual ledger, and Lead Developer closeout.

**must_not**: Change AMX/CLI/report/data/VS Code semantics; auto-run migrated AMX; leak private paths/input/source/recovery data; weaken authority, conflict, cancellation, atomic-write, or compatibility rules; claim native release, Hutch, broad Office, Marketplace/license, or formal accessibility success without evidence; or reimpose the superseded hard 100k grid timing thresholds.

**decision gates**: Apply the explicit 2026-10-03 performance policy recorded in the V0.6 product contract: measure and report 100k grid behavior, but do not treat 3-second viewport or 100-ms grid-task values as fixed pass/fail gates. Require complete lossless access, scrolling, editing/history, cancellation, bounded fallback, and explicit Lead Developer usability acceptance. Keep project listing, preview debounce, cancellation, and background-operation budgets separate. Any further target change needs a recorded decision.

**acceptance**: Meet every item in `planning/sprints/0043-v06-onboarding-ux-acceptance-release-record/acceptance.md`. Distinguish verified feature acceptance from user-reported/native/release/accessibility evidence and assign every residual an owner and next action.

**verification**:

1. Run focused onboarding, migration, diagnostic-export privacy, and project-recovery tests first. Prove no migration auto-run or source overwrite.
2. Run the integrated project fixture across unsaved imports, mappings/settings, editor intelligence, CSV/JSON, preview/cancel, all export formats, conflicts, trash, and recovery. Assert stale work and every failure path preserve existing data/output.
3. Measure 100-file project workflows and the supported 100k CSV/JSON viewport/edit/history/cancel path. Record exact hardware/OS/runtime/fixture/timing/memory/long-task results. Treat 100k timing as descriptive and obtain explicit user/Lead Developer usability disposition; preserve other performance budgets.
4. Capture and review available-host screenshots at 1024x720 and larger in system/light/dark, with keyboard/focus, contrast, dense/error/dialog/drawer/onboarding states. Name actual viewer/host; do not substitute browser/WSL2 for native certification.
5. Run root build/full suite, desktop RPC/tests/typecheck/Vite/browser checks, applicable VS Code compile/host regressions, and `git diff --check`. Record exact outputs, warnings, versions, artifacts, hashes, and unavailable checks.
6. Update docs and version metadata only after verification. Update state/decisions/questions/evidence with separate V0.6 feature and release dispositions, residual owners, and the Lead Developer's final acceptance.
