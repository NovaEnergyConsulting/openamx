# Sprint 024 Handoff Prompt

You are the Builder for OpenAMX Sprint 024.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.4.md`, `docs/language-spec-v0.3.md`, and `docs/language-spec-v0.2.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`
- `planning/sprints/0023-report-ready-pdf-export/acceptance.md`
- `planning/sprints/0024-desktop-application-foundation/requirements.md`
- `planning/sprints/0024-desktop-application-foundation/blueprint.md`
- `planning/sprints/0024-desktop-application-foundation/acceptance.md`
- `desktop-app/README.md`, `desktop-app/package.json`, and the existing `desktop-app/src/` prototype

## Task Contract

**objective**: Deliver the first usable isolated OpenAMX desktop authoring foundation with safe project/file handling, dirty/save state, local module navigation, AMX-aware editor services, split live preview, and typed main-process RPC.

**owns**: `desktop-app/` source/config/tests/docs, narrowly reusable core API changes proven necessary for the boundary, and planning logs with exact verification.

**must_not**: Implement Sprint 025 data-input/run/export workflows, change language semantics, duplicate core parser/evaluator/module logic, give the webview filesystem or evaluation authority, silently run saved text instead of the current buffer, claim native platform acceptance, add installers/updaters/DOCX, or replace the VS Code provider architecture.

**acceptance**: Meet every item in `planning/sprints/0024-desktop-application-foundation/acceptance.md`. Keep the app isolated from root and extension workflows and preserve the Sprint 020 residual record.

**verification**:

1. After the first RPC/session edit, run a focused contract test for open/read/current-buffer preview and path containment. Repair that boundary before expanding UI.
2. Test dirty/save/conflict state, safe project navigation, formatting/completion/diagnostics, preview of unsaved text, parser/link failures, and webview capability restrictions.
3. Run available desktop frozen install, direct typecheck, web build, package test, native/host smoke checks, and the documented Hutch commands. Record timeouts or unavailable checks exactly; do not substitute direct Linux evidence for other platforms.
4. Run root `bun run build`, `bun test`, relevant extension checks, and `git diff --check`. Update planning records with exact versions, counts, residuals, and the Sprint 025 boundary.
