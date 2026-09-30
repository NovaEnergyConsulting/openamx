# Sprint 025 Handoff Prompt

You are the Builder for OpenAMX Sprint 025.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.4.md`, `docs/language-spec-v0.3.md`, and `docs/language-spec-v0.2.md`
- `planning/sprints/0023-report-ready-pdf-export/acceptance.md`
- `planning/sprints/0024-desktop-application-foundation/acceptance.md`
- `planning/sprints/0025-desktop-analysis-platform-acceptance/requirements.md`
- `planning/sprints/0025-desktop-analysis-platform-acceptance/blueprint.md`
- `planning/sprints/0025-desktop-analysis-platform-acceptance/acceptance.md`
- `desktop-app/README.md`, the desktop RPC/session source, `src/runtime/moduleLoader.ts`, `src/runtime/inputData.ts`, `src/renderer/reportPdf.ts`, and existing CLI/output tests

## Task Contract

**objective**: Complete the desktop current-buffer analysis workflow with input configuration precedence, run/preview/result/error states, HTML/PDF actions, safe outputs, and official platform acceptance.

**owns**: `desktop-app/` workflow/configuration/RPC/UI/tests/docs, narrowly demonstrated shared API fixes, platform verification records, and planning logs with exact results.

**must_not**: Run stale saved text, evaluate in the webview, grant webview filesystem/PDF authority, duplicate core loader/input/evaluator/report logic, weaken containment or safe-write rules, alter language semantics, replace frameworks without approval, claim platform checks not run, or add installers/updaters/DOCX/Marketplace work.

**acceptance**: Meet every item in `planning/sprints/0025-desktop-analysis-platform-acceptance/acceptance.md`. Preserve root/extension/CLI behavior and record every unavailable or failed gate honestly.

**verification**:

1. After the first workflow/RPC edit, run a focused current-buffer test with a local import plus JSON/CSV mappings and an unsaved change; confirm the saved file is not used or modified.
2. Test project/local/per-run precedence, invalid configurations, aggregate/fail-fast diagnostics, run/preview success/failure transitions, HTML/PDF actions, destination conflicts, no-write/preserve-existing behavior, and capability boundaries.
3. Run desktop isolated install/typecheck/web/native/host commands, then perform the release-owner matrix on macOS 14+, Windows 11+, and Ubuntu 24.04+. Record exact versions, commands, observations, and unavailable targets; do not substitute WSL2 evidence.
4. Run root `bun run build`, `bun test`, relevant extension checks, and `git diff --check`. Update planning records with Sprint 027 readiness, residuals, and the DOCX/license/publication disposition.
