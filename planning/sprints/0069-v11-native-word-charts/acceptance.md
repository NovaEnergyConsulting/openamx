# Sprint 069 Acceptance Criteria

Sprint 069 is complete only after all required chart cases pass package and Word application checks, any required product decisions are recorded, and a separate Lead Developer disposition accepts the evidence. A failed mandatory case blocks completion; a partial native-chart subset or static-image fallback does not satisfy this sprint.

## Native Chart Semantics

- DOCX uses native editable Word chart objects with embedded workbooks for existing `bar`, `column`, `line`, and `scatter` kinds.
- Each chart is mapped from the shared `ChartViewModel`; chart kind/orientation, series order/grouping, labels, colors, units/axes, negative/zero values, DateTime meaning, duplicate labels/coordinates, and null gaps preserve established OpenAMX semantics and HTML/PDF meaning.
- Numeric line axes remain continuous where declared as numeric, preserve uneven intervals and source order, and are not converted to equally spaced categories. The approved narrow representation exception is a native XY scatter chart with straight-line connections for OpenAMX `line` charts with numeric X only; no categorical or DateTime line may use this exception.
- For a multi-series numeric-X line with both plotted and no-coordinate series (all-null Y or values only at null X), the native XY chart omits only the unplottable series, while the full table preserves every series column and the accessible description discloses the omission.
- UTC DateTime line values retain DateTime axis semantics and source order.
- Multiple independent measurement units/axes are represented without merging or mislabeling units when supported by the selected native encoding. If the encoding cannot preserve the required axes, no chart object is emitted; a clear unsupported-axis notice and the complete table alternative are emitted instead. This explicitly approved deferral includes more than two independent axes and numeric-X lines whose XY scatter representation cannot retain distinct Y-axis units.
- Scatter groups retain first-seen order and point data. Null-coordinate rows are not fabricated as plotted points; every original row remains in the complete table alternative.
- If one scatter group has no plottable coordinates while another group has points, emit no chart object; show a clear unsupported-scatter-group notice and the complete table, preserving every group and source row. Do not fabricate points or omit only the empty group.
- Negative and zero values, duplicate categories/coordinates, multiple series, and supported scalar/record data preserve their captured values and ordering.
- Any zero-plottable-point state (empty input, all-null series, or no finite scatter coordinates) emits no chart object and provides a clear “no plottable data” notice followed by the complete table. No invented values/points, blank success-looking chart, or silent image substitution is permitted.

## Editable Data, Accessibility, and Package Safety

- Every chart includes its title, description, and chart accessibility description, plus a complete native table alternative that preserves labels, units, and all source rows.
- DOCX chart objects are editable in desktop Word. Editing chart data/series, saving, closing, and reopening preserves a native chart and the edited values.
- Chart data is stored in embedded workbooks. OOXML/package tests verify the expected chart type, axes, series, order, categories/coordinates, cached values, workbook cells, and chart/workbook relationships.
- No external workbook relationship, remote data/resource, macro part, dangling chart relationship, or unsupported package part is introduced.
- A chart serialization failure is reported clearly and an existing DOCX destination remains byte-for-byte unchanged; atomic output leaves no temporary-file residue.
- Word for the Web displays representative native charts and saves/downloads them; where desktop review is available, the downloaded document is opened in desktop Word to verify the chart remains native/editable. Web data editing is not required.
- The numeric-X line representation is verified in both Word desktop and Word for the Web, including displayed continuous X spacing, source-order connections, edit/save/reopen persistence in desktop Word, and web save/download preservation. The Word OOXML chart type may be `scatter` for this one approved representation exception; the shared OpenAMX kind and chart meaning remain `line`.
- Each zero-point chart kind is verified to emit no native chart and a truthful no-data notice plus the complete table, preserving every row, label, and unit.
- Mixed-group scatter deferral is verified to emit no native chart and an unsupported-group notice with all original groups and rows in the table.

## Verification and Scope

- Focused `tests/chartModel.test.ts`, DOCX tests, presentation tests, and applicable desktop DOCX worker/export tests pass; root build passes. Root and desktop full-suite outcomes are recorded against inherited Sprint 068 residuals, with no new unexplained failure.
- Windows evidence records exact OS/Word versions/channels where available, reviewer, date, actions, prompts, edits, save/reopen outcomes, and each fixture/result. OOXML inspection is not reported as Word application evidence.
- If a required semantic case remains unrepresentable, implementation stops and evidence names the exact input, expected meaning, observed Word/API behavior, and decision owner. Sprint status remains blocked pending explicit Lead Developer decision; no acceptance or silent waiver is implied.
- The explicitly approved axis-capacity deferral is not treated as an unrecorded failure: tests verify that it produces no native chart, a truthful unsupported-axis notice, and every original table row, label, and unit. No units are merged, relabeled, or dropped.
- The explicitly approved zero-point policy is tested for every chart kind: no native chart, a truthful no-data notice, and all original table rows, labels, and units, without fabricated values or points.
- Existing DOCX metadata/footer, narrative, table values, emissions, null/measurement display, report order, export caps, destination validation, and atomic replacement remain unchanged.
- No changes to AMX syntax/evaluation, shared chart semantics, PDF/HTML/preview chart behavior, dependency/lockfile, output limits, unrelated residuals, release, publication, or V0.11 completion occur.
