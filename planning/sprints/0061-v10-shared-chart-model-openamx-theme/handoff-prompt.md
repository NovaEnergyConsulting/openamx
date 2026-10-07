# Sprint 061 Handoff Prompt

You are the Builder for OpenAMX Sprint 061.

## Read First

- Applicable repository instructions and `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV10MasterSprintPlan.md`
- Sprint 061 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Sprint 060 `builder-evidence.md`, completed contract matrix/decision register in `blueprint.md`, and explicit Lead Developer disposition
- `src/runtime/environment.ts`, chart declaration/options in `src/ast/types.ts`, chart snapshot construction in `src/runtime/evaluateExpression.ts`, and measurement value/unit code
- Existing chart code in `src/renderer/renderHtml.ts` and `src/renderer/reportPdf.ts`, resolved report identity/accent in `src/renderer/reportPreparation.ts`, and relevant renderer/PDF/presentation tests

## Entry Gate and Approved Decisions

Sprint 060 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS**. The Lead Developer explicitly authorized Sprint 061. Implement against the approved shared adapter and exact `echarts@6.1.0` root-dependency baseline; no second desktop-only copy.

Approved chart contract includes horizontal bar with first source row at top; vertical column; input-order numeric/DateTime line with null gaps and UTC ISO DateTime presentation; independent named measurement axes; first-seen scatter groups with null-coordinate plotted points omitted but retained in complete table data; duplicate/order preservation; deterministic first-seen colors; truthful accessibility metadata; and no fabricated data/units.

Important residuals remain unpassed: untrusted links/meta refresh escaped the isolated script-enabled probe; actual Electrobun packaging was unavailable; ECharts default ARIA misstates null/DateTime; raw SVG generated IDs vary; larger performance bounds, cross-surface visual tolerance, pointer/keyboard/touch behavior, and public chart-render failure diagnostics were not verified. These are not permission to weaken requirements or expand Sprint 061.

## Task Contract

**owns**: Exact root dependency addition; one pure shared `ChartViewEmission` to typed ECharts option/model adapter for every current chart kind and data form; common theme and truthful accessibility/empty-state metadata; focused option/model and immutability regressions; Builder evidence and disposition request.

**must_not**: Replace or wire HTML/PDF production chart rendering; modify desktop `App.vue`, worker/package resources, or iframe sandbox; enable scripts; change AMX/parser/typechecker/evaluator/measurement normalization/report preparation/limits/export atomicity; add chart kinds/raw AMX ECharts options; modify DOCX; or claim package, offline surface, security, visual parity, V0.10 completion, platform certification, or release readiness.

## Implementation Rules

1. Inspect the worktree before editing and preserve all existing changes. Verify the Sprint 060 disposition and consult the exact approved matrix/evidence rather than relying on summary language alone.
2. Add exactly `echarts@6.1.0` at the approved root dependency placement and update the lockfile with the repository's Bun workflow. Record license/notice file locations, but do not state a legal conclusion.
3. Implement one small internal pure chart-model module. Keep captured emissions immutable and avoid DOM, filesystem, network, SVG string construction, ECharts instance creation, or report-authored code execution in the model.
4. Preserve exact order and duplicates. Do not sort timestamps, aggregate duplicate labels/coordinates, mutate nested values, or convert null to zero. Keep plotted points separate from the complete table rows/headings.
5. Use the already-normalized measurement display values and preserve unit/dimension descriptors. Different series units use separate named axes; scatter x/y units remain distinct. Do not redo normalization or erase metadata.
6. Model the approved kind differences exactly: horizontal top-first bar, vertical column, ordered numeric/DateTime line with gaps and UTC ISO presentation, and first-seen grouped scatter with null-coordinate plot omission only.
7. Use stable first-seen palette assignment and the resolved report accent as a restrained highlight. Start from the existing renderer palette; document/test deterministic behavior for additional series and contrast-safe accent fallback. Do not introduce theme authoring controls.
8. Include truthful title/description/accessibility inputs and complete table linkage metadata. Do not rely on default ECharts ARIA strings for null/DateTime.
9. Keep all destination integration in the later owning sprints. The app's current HTML/PDF and DOCX output must stay on existing adapters throughout Sprint 061. Production iframe scripts stay disabled because the no-navigation gate failed.
10. If the approved model cannot be implemented without changing semantics/scope, stop at the smallest reproducible conflict and request Lead Developer direction before proceeding.
11. Run focused model tests first, then relevant renderer/PDF/presentation/measurement regressions, root build, and full root tests when available. Record exact environment, command, totals, failures/skips, and residuals; do not upgrade Sprint 060's failed/unavailable checks.
12. Write `builder-evidence.md`, update planning state/decisions/questions, and request separate Lead Developer disposition. Do not self-accept.

## Closeout

Record changed files, exact dependency graph, model contracts, tests/results, residuals, and what Sprints 062/063 must consume. Sprint 061 completion alone does not mean browser HTML, desktop preview, PDF charts, security, or cross-surface acceptance is complete.