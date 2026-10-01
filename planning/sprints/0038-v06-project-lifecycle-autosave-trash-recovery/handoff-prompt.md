# Sprint 038 Handoff Prompt

You are the Builder for OpenAMX Sprint 038.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/builder-evidence.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/requirements.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/blueprint.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/acceptance.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/builder-evidence.md`
- `planning/sprints/0038-v06-project-lifecycle-autosave-trash-recovery/requirements.md`
- `planning/sprints/0038-v06-project-lifecycle-autosave-trash-recovery/blueprint.md`
- `planning/sprints/0038-v06-project-lifecycle-autosave-trash-recovery/acceptance.md`
- Current desktop Bun services, RPC contracts, shell components, project/session tests, module loader, atomic writers, and recovery-related code

## Task Contract

**objective**: Deliver safe project lifecycle, file operations, autosave, conflict resolution, trash/restore, recovery snapshots, and guarded project/window transitions on top of Sprint 036/037 boundaries.

**owns**: Contained project enumeration, external-input labeling/opening, project creation, file/folder operations, transactional AMX import rewrites, trash metadata/restore/empty, delayed autosave, disk conflict handling, local snapshots/recovery, recents/layout bounds, project-switch/quit guards, lifecycle RPC/UI routes, and evidence.

**must_not**: Implement Inputs/report settings, AMX intelligence, structured data editing, final live preview/export UX, onboarding completion, broad native release certification, or any webview filesystem/process/evaluator authority; change AMX/CLI/VS Code semantics; silently browse arbitrary external paths; or claim native behavior from mocks/browser shims.

**decision gates**: Preserve Sprint 036 active-document/project-generation/job identity and Sprint 037 typed shell/command registry. Any change to authority, persistence privacy, import-transaction semantics, autosave/conflict rules, or recovery behavior requires a recorded decision. Native host evidence remains a separate gate; unavailable checks must stay explicitly blocked.

**acceptance**: Meet every item in `planning/sprints/0038-v06-project-lifecycle-autosave-trash-recovery/acceptance.md`. Final status must distinguish trusted-service/unit evidence, browser shell evidence, and direct native-host evidence.

**verification**:

1. Run focused enumeration/path-substitution/symlink tests before UI wiring. Prove create, rename/move/import rewrite, trash/restore, and atomic rollback with temporary isolated fixtures.
2. Run autosave, invalid-text, external-file, disk-conflict, project-switch, quit, recovery restart, cancellation, stale-job, and no-write tests. Record exact fixture paths only when private and temporary; redact them from shared evidence.
3. Run desktop direct RPC tests, root regressions/build, Vue typecheck/Vite build, and available native host checks. Keep missing `.hutch/devkit`, native dialog/window, Hutch, target-platform, Office, license and Marketplace limitations explicit.
4. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 038 builder-evidence record with commands, versions, counts, recovery/conflict observations, residual owners, and Sprint 039 entry conditions.
