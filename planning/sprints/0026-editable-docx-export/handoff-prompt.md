# Sprint 026 Handoff Prompt

You are the Builder for OpenAMX Sprint 026, an optional V0.4 stretch sprint.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.4.md`, especially section 10
- `planning/sprints/0023-report-ready-pdf-export/acceptance.md`
- `planning/sprints/0025-desktop-analysis-platform-acceptance/acceptance.md`
- `planning/sprints/0026-editable-docx-export/requirements.md`
- `planning/sprints/0026-editable-docx-export/blueprint.md`
- `planning/sprints/0026-editable-docx-export/acceptance.md`
- The shared report/PDF adapter and desktop export boundary

## Preflight and Stop Rule

Sprint 025's official macOS 14+, Windows 11+, and native Ubuntu 24.04+ matrix is currently open, and Hutch package/launch residuals remain recorded. Do not begin DOCX implementation unless the Lead Developer explicitly confirms that core V0.4 must-haves are on track and approves this stretch. If the gate is not approved or a short feasibility comparison is unfavorable, record the stretch as deferred and stop; do not add production dependencies.

## Task Contract

**objective**: If approved, deliver a local/offline semantic editable DOCX export from the shared report model; otherwise deliver a documented, evidence-based deferral.

**owns**: DOCX feasibility evidence, approved DOCX adapter/entry points/tests/docs, safe destination handling, licenses/assets, and planning disposition.

**must_not**: Delay or weaken core PDF/desktop/platform/release gates, re-evaluate AMX, duplicate report semantics, claim editable or interactive charts, use remote content, ship unverified assets, add installers/DOCX macros, or claim cross-platform compatibility without evidence.

**acceptance**: Meet one of the delivered-stretch or deferred-stretch outcomes in `planning/sprints/0026-editable-docx-export/acceptance.md`; DOCX is never a V0.4 core acceptance gate.

**verification**:

1. Record the Lead Developer gate decision and run a bounded feasibility comparison before adding production dependencies.
2. If delivered, test semantic package/content structure, static chart image embedding, ordering/editability, destinations, no-write failures, licensing, and the supported CLI/desktop entry points.
3. If deferred, remove spike-only artifacts/dependencies and record exactly why the approach was not accepted, what remains, and how Sprint 027 should report the disposition.
4. Run the root build/tests and `git diff --check` for any changes; record exact runtime/tool/OS versions and all unavailable checks.
