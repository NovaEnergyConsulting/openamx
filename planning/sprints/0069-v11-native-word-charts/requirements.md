# Sprint 069 Requirements: Editable Native Word Charts

## Goal

Replace the current static SVG/image chart path in DOCX exports with native editable Word charts backed by embedded workbooks, while preserving the existing OpenAMX chart model's meaning, accessibility information, and complete tabular alternative.

## Dependencies and Entry Gates

- The V0.11 master plan lists dependencies on Sprints 065, 066, and 068. Each is closed in the repository; Sprint 068 was ACCEPTED / CLOSED WITH RECORDED RESIDUALS on 2026-10-10.
- Prior sprint closeout does not authorize Sprint 069. Obtain explicit Lead Developer implementation authorization and approval of the Builder's concrete file-by-file code plan before source or test edits.
- Sprint 065 already observed a concrete mismatch: the native Word line chart serialized a numeric x-axis as categories and Word web displayed numeric values `10, 30, 30, 11` at equally spaced positions. Native mapping for more than two independent value axes, empty scatter series, and scatter null-coordinate points was unproven or rejected by the probed API.
- Reproduce the known mismatch and test the remaining required cases in actual Word desktop and Word for the Web before committing to an implementation mapping. Record exact OS, application versions/channels where available, reviewer, date, actions, and prompts.
- If a required native chart case still cannot preserve the existing OpenAMX/HTML/PDF meaning, stop and submit that concrete case to the Lead Developer for a specific product/architecture decision. Do not implement a lossy workaround or mark the sprint complete with mandatory chart cases silently omitted.
- Sprint 068's unresolved Word for the Web relative-link rewrite, root suite failures at `tests/editor.test.ts:73` and `tests/examples.test.ts:43`, and desktop sandbox-count failure at `desktop-app/tests/rpc-contract-check.ts:74` remain inherited residuals. They are not Sprint 069 scope unless a chart change demonstrably causes a regression.

## Inputs

- `planning/plan-openamxV11MasterSprintPlan.md` (chart semantics and acceptance authority)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 065 chart feasibility evidence and Lead Developer disposition
- Sprint 066 accepted chart residuals and Sprint 068 chart-preservation evidence
- `src/renderer/chartModel.ts`, `src/renderer/reportDocx.ts`, `src/runtime/environment.ts`, and the installed `docx/charts` API
- `tests/chartModel.test.ts`, `tests/reportDocx.test.ts`, and `tests/reportPresentation.test.ts`
- Desktop worker/service DOCX export flow and desktop DOCX integration tests
- `examples/kitchen-sink.amx` and `examples/kitchen-sink.pdf` as read-only regression references

## In Scope

- Replace only the current DOCX chart image path with native editable `ChartRun` objects and embedded chart workbooks for the four existing kinds: `bar`, `column`, `line`, and `scatter`.
- Consume the existing shared `ChartViewModel` as the semantic source. Preserve chart kind/orientation, series and grouping, palette/accent behavior, labels and ordering, chart title/description, axes, unit metadata, negative/zero values, DateTime meaning in UTC, duplicate labels/coordinates, and null gaps.
- Preserve each chart's accessibility description and a complete, truthful native table alternative. Preserve all source rows in the table even where a null coordinate cannot be plotted.
- Handle empty and all-null cases truthfully without fabricating values or points and without a success-looking blank/fallback chart. If native chart serialization cannot represent the required case, stop for a specific Lead Developer decision rather than coercing or silently omitting it.
- Embed editable chart data locally. Do not create external workbook relationships, macros, remote resources, or implicit companion files. Word edits to chart data do not round-trip into AMX source.
- Fail clearly if chart construction/serialization fails and retain an existing DOCX destination through the current atomic writer.
- Extend package-level tests to inspect chart XML, relationships, embedded workbook values/caches, chart-kind/axis/series properties, table alternative, and absence of external workbook links/macros.
- Validate actual Word desktop edit-data/series, save, close, and reopen persistence for representative kinds and edge cases. Validate Word web display and save/download preservation; Word web chart-data editing is not required. Confirm the downloaded chart remains a native editable object in desktop Word where available.
- Preserve report identity, order, metadata/footer, narrative structures, emitted tables/values, null/measurement display, destination validation, output caps, and atomic export behavior.

## Out of Scope

- Changes to AMX chart syntax, evaluation, chart declarations, shared chart-model semantics, chart kinds, user-authored ECharts options, or HTML/PDF chart behavior.
- Coercing continuous numeric x axes to equally spaced categories, changing data order or chart kind, merging duplicate points, changing units/axes, converting null to zero, fabricating empty values/points, or replacing unsupported native charts with static SVG/PNG.
- Chart data editing in Word web, Word-to-AMX round-trip, macros, external workbooks, remote resources, or Office template/style settings.
- Narrative Markdown, PDF rendering, HTML/preview, local-link policy, general DOCX redesign, dependency/lockfile changes, output-cap changes, or unrelated historical test repairs.
- V0.11 integrated closeout, release, publication, platform certification, or broad Word compatibility claims.

## Constraints

- Preserve exact established OpenAMX chart semantics and match HTML/PDF meaning. Use the shared chart model; do not independently reinterpret raw emissions for plotted data.
- Package/XML output is not proof of Word behavior. Required application evidence must be gathered in real Microsoft Word, with actual versions/channels reported. Do not substitute LibreOffice or infer desktop behavior from Word web.
- Native API limitation or Word mismatch is a stop-and-escalate condition when it affects a required case. A Lead Developer disposition must name the specific case and accepted change, if any, before any scope/meaning adjustment.
- Retain a complete table alternative containing every captured source row and displayed unit/label information, including rows excluded from plotted points because of null coordinates.
- No external workbook relationships, macro parts, or remotely fetched data. Existing DOCX atomic destination handling must preserve prior output on chart failure.
- Preserve Sprint 068/067 known residual statuses. Run focused chart tests before broader root/desktop tests; record exact results and whether an inherited failure reproduced unchanged.
- Keep `examples/kitchen-sink.amx` and the supplied `examples/kitchen-sink.pdf` read-only. Generate probes and output only in disposable locations.
