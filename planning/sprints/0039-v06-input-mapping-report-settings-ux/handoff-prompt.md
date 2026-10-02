# Sprint 039 Handoff Prompt

You are the Builder for OpenAMX Sprint 039.

Read these files first:

- `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV06MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- The final Sprint 038 requirements, blueprint, acceptance, and builder evidence; if only interim evidence exists, record the dependency as blocked
- `planning/sprints/0036-v06-active-document-project-model-cancellable-jobs/builder-evidence.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/requirements.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/blueprint.md`
- `planning/sprints/0037-v06-workbench-shell-themes-menus-welcome/acceptance.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/requirements.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/blueprint.md`
- `planning/sprints/0039-v06-input-mapping-report-settings-ux/acceptance.md`
- Existing input, report-preparation, config/frontmatter, native picker, RPC, shell, and privacy tests

## Task Contract

**objective**: Deliver the active-document Inputs panel, private/project mapping persistence, conflict-safe configuration writes, and scoped Report Settings modal while preserving V0.5 semantics and Sprint 036 identity/job safety.

**owns**: Declared-input contextual UX, effective mapping/preference state, session/local/project precedence, private local persistence, explicit contained promotion, validation/diagnostic links, report-settings scopes, logo picker/validation routing, config/frontmatter preservation, revision invalidation, RPC/service tests, and evidence.

**must_not**: Reimplement project lifecycle, general filesystem browsing, AMX intelligence, structured data editing, final live preview/export, onboarding completion, or native release certification; change V0.5 identity/input semantics, leak private paths, silently overwrite config, or grant webview filesystem/loader/evaluator/write authority.

**decision gates**: Require final Sprint 038 acceptance before claiming Sprint 039 complete. Preserve Sprint 036 active-document/input-settings revision/job identity and Sprint 038 atomic/conflict/recovery boundaries. Any change to precedence, privacy, frontmatter preservation, logo security, or authority requires a recorded Lead Developer decision.

**acceptance**: Meet every item in `planning/sprints/0039-v06-input-mapping-report-settings-ux/acceptance.md`. Keep native-host limitations, dependency blockers, and any unmeasured behavior explicit.

**verification**:

1. Run focused precedence, local/project promotion, containment/POSIX/network, config merge/conflict/no-write, logo validation, frontmatter preservation, and revision invalidation tests before broad UI wiring.
2. Exercise real active-document changes, cancellation/supersession, invalid/missing mappings/assets, stale disks, and current-buffer frontmatter. Verify private paths and input contents are absent from RPC/log/evidence payloads.
3. Run desktop direct tests, `bunx vue-tsc --noEmit`, direct `bunx vite build`, root input/report/config regressions, and applicable VS Code checks. Record exact commands, counts, bundle warnings, and missing generated-host/native limitations.
4. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 039 builder-evidence record with the dependency disposition, precedence/privacy results, residual owners, and downstream entry conditions.
