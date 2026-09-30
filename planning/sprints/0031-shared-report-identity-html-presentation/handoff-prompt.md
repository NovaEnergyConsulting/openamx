# Sprint 031 Handoff Prompt

You are the Builder for OpenAMX Sprint 031.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV05MasterSprintPlan.md`
- `docs/language-spec-v0.5.md`, especially sections 1-4
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md`
- `planning/sprints/0031-shared-report-identity-html-presentation/requirements.md`
- `planning/sprints/0031-shared-report-identity-html-presentation/blueprint.md`
- `planning/sprints/0031-shared-report-identity-html-presentation/acceptance.md`
- `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, `src/renderer/reportDocx.ts`, `src/cli.ts`, `desktop-app/src/bun/desktopService.ts`, `tests/renderer.test.ts`

## Task Contract

**entry gate**: Sprint 028's approved report contract is sufficient for Sprint 031. Sprint 029 is still OPEN and Sprint 030 is CLOSED with exceptions; they are separately tracked acceptance gates, not new Sprint 031 dependencies or waived features.

**objective**: Implement one resolved report identity/content boundary and offline, branded, accessible HTML while preserving V0.2-V0.4 semantics, visible source by default, existing report writes and table/chart behavior. Make the typed model available to Sprint 032 PDF/DOCX.

**owns**: Portable project/report metadata validation, safe offline logo and contrast preparation, CLI/desktop trusted identity integration, shared immutable report presentation model, standalone HTML presentation and focused report/CLI regressions.

**must_not**: Reevaluate AMX or reread modules/inputs in adapters; allow webview filesystem or logo fetches; change chart bindings/interaction/print data or no-option CLI input behavior; silently omit invalid branding; claim branded PDF/DOCX complete, close desktop exceptions or infer native/Office/license/Marketplace approval.

**acceptance**: Satisfy `planning/sprints/0031-shared-report-identity-html-presentation/acceptance.md`. Keep Sprint 029/030 follow-up ownership visible and escalate any incompatibility with the approved V0.5 contract before changing it.

**verification**:

1. Add the smallest testable resolved identity/content boundary with focused config/precedence/asset/no-write checks first. Verify legacy visible source and existing view data/order before changing HTML presentation.
2. Run focused CLI/renderer/browser checks for HTML semantics, escaping, responsive/print behavior, offline logo, source visibility and V0.2-V0.4 interaction regressions. Check existing PDF/DOCX caller compatibility without claiming Sprint 032 layout work done.
3. Run root `bun run build`, `bun test`, relevant desktop direct/RPC/typecheck/Vite checks for touched code, and `git diff --check`; record exact counts, environment, observed limits and no-write evidence.
4. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md` with actual outcomes and the shared-model handoff to Sprint 032. Do not mark the remaining Sprint 029/030 or release-engineering gates closed without their own evidence.
