# Sprint 069 Blueprint: Editable Native Word Charts

## Approach

1. Reconfirm dependencies and dispositions in Sprints 065, 066, and 068. Obtain explicit Sprint 069 authorization and approved file-by-file code plan. Before chart implementation, reproduce the numeric-line category-spacing mismatch and exercise representative difficult cases in actual Windows Word desktop and Word for the Web.
2. Build a case-by-case feasibility matrix from the existing `ChartViewModel` and the master plan: all four chart kinds; scalar/record data; multiple series; bar/column orientation; grouped scatter; continuous numeric line x values with uneven intervals and source-order duplicates; UTC DateTime line x values; multiple independent measurement axes; negative/zero values; null gaps; empty, all-null, and mixed-null records.
3. Separate package feasibility from application behavior. For each case, record expected model meaning, `ChartRun` serialization result, OOXML axis/series/workbook evidence, Word desktop display/edit/save/reopen result, and Word web display/save/download result. If a case is not faithfully representable, stop and request a named Lead Developer decision before implementing a lossy or narrowed behavior.
4. Add a focused native chart adapter in `reportDocx.ts` (or the smallest cleanly owned module) that consumes `createChartViewModel` output and emits `ChartRun` plus its required chart data. Do not derive separate plot semantics from raw emissions. The adapter must preserve kind/orientation, ordered series and groups, values, axis meaning, labels, units, colors, duplicates, DateTime values, and null semantics as representable by the accepted gate.
5. Preserve the DOCX chart title and description, an accessible description associated with each chart, and the existing full data-table alternative. Build the alternative from the shared model's table, preserving null and omitted-from-plot rows. Empty/all-null states must state the truthful no-data condition without invented series values or fabricated points.
6. Use embedded workbooks only. Inspect all chart relationships and workbook links; reject external workbook relationships, external data, macros, and dangling package parts. Verify workbook values, caches, source order, duplicated labels/coordinates, and null behavior. Keep the current destination/atomic-write flow unchanged so any chart failure leaves a prior destination intact.
7. Extend `tests/reportDocx.test.ts` with focused OOXML and JSZip checks for each chart kind and edge condition, including chart parts, axis types, orientation, grouping, series ordering, units, chart titles/descriptions/alt data, workbook relationships/values/caches, table alternatives, and prohibited package content. Add failure-injection coverage for atomic destination preservation if an existing test does not already cover DOCX serialization errors.
8. Extend representative desktop DOCX export tests only as needed to prove the actual packaged worker path produces chart parts and embedded workbooks without changing export limits or host checks.
9. On the designated Windows host, open the generated charts in Word desktop without repair warnings, edit chart data and series for representative cases, save, close, and reopen; verify native object and edit persistence. In Word for the Web, verify representative display and save/download preservation, then confirm the download remains native/editable in desktop Word where available. Record exact OS/app/channel versions, reviewer, date, steps, prompts, and unavailable checks.
10. Run focused chart model/DOCX/presentation/desktop tests, root build, then root and desktop suites. Compare root editor/help and desktop sandbox-count results with Sprint 068 evidence; do not fix unrelated failures. Record every pass, fail, blocked, and not-run outcome in `builder-evidence.md`.
11. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with the evidence and remaining blockers. Request a separate Lead Developer disposition. If a required case failed feasibility, stop at the gate and await the decision; do not claim the chart feature sprint is complete by implementing a partial subset.

## Files to Update

- `src/renderer/reportDocx.ts` and, only if needed, a narrowly scoped native chart adapter module
- `tests/reportDocx.test.ts`
- `desktop-app/src/bun/jobWorker.test.ts` and/or a narrowly scoped DOCX export test only if desktop worker behavior needs additional coverage
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 069 `builder-evidence.md` after feasibility and implementation work

No chart model, AMX parser/runtime, PDF, HTML/preview, shared narrative model, dependency/lockfile, output cap, DOCX export destination, supplied example, or unrelated test files are in scope unless a specific implementation need is approved before changing them.

## Risks and Stop Conditions

- **Numeric line axis:** Sprint 065 observed `10, 30, 30, 11` as equally spaced categories in Word web. A continuous numeric line must remain continuous and in source order. If Word native charts still cannot express that meaning, stop and request explicit Lead Developer direction.
- **More than two independent axes:** The probed API exposed primary/secondary axis assignment only. Do not merge units or reassign axes silently; stop if required existing model semantics cannot be preserved.
- **Null/empty data:** Do not turn null into zero, fabricate points, discard source rows from the table, or emit a misleading empty chart. If a native object cannot truthfully represent a required case, stop for a specific decision.
- **Application mismatch:** OOXML/API success cannot override Word desktop/web rendering or persistence failure. Do not claim application support from package inspection alone.
- **Failure atomicity:** Native chart serialization may fail in worker or Packer paths; verify errors surface and existing destinations remain unchanged with no temp residue.
- **Scope creep:** Do not change the chart model, AMX evaluation, PDF/HTML charts, or data semantics to accommodate the DOCX API. Do not repair inherited unrelated test failures.

## Evidence Boundaries

- OOXML charts/workbooks prove package structure and stored data only.
- Word desktop proves only the tested Word version, fixture, edits, and persistence steps.
- Word for the Web proves only the observed service/client session; report the unavailable formal version/channel if applicable.
- Web save/download is not desktop edit/save/reopen evidence; downloaded package inspection is not proof of editable behavior.
