# Sprint 119 Rendering, Editor, Documentation, and Example Matrix

## Status and Scope

Architect-prepared execution matrix. All rows are NOT RUN during preparation.
The S115/S116 output and migration CHT cases retain their stable IDs. S119-
internal IDs cover browser payload, accessibility, DOCX fallback, editor,
documentation, and example assertions.

## Shared Visibility Fixture

Use one prepared source with four charts over a deterministic Number list:

- `omitted`: no `showTable`;
- `explicitFalse`: `showTable false`;
- `explicitTrue`: `showTable true`;
- `dynamic`: `showTable enabled and threshold >= 2` with a true final result.

Expected output ownership:

- omitted/false: no chart-associated table in any format;
- true/dynamic-true: existing chart table content preserved;
- all four: plot, title, description, series, axes, normalized data, and source
  order remain.

A repeated-show dynamic fixture from S116 may additionally prove one false and
one true emission from the same declaration without renderer reevaluation.

## HTML and Preview Cases

| Case ID | Input/assertion | Expected result | Owner |
| --- | --- | --- | --- |
| CHT-HTML-01 | Omitted/false/true/dynamic charts rendered to HTML and preview | Plot present for all; chart table absent false, present true | renderer |
| CHT-OUTPUT-OMISSION-01 | False chart output inspected structurally | No `<table class="openamx-chart-data">`, caption, headings, rows, table ID, print chart-table markup, or hidden alternate | renderer |
| CHT-OUTPUT-TRUE-01 | True/dynamic-true chart inspected structurally | Existing table caption/headings/rows/null/unit display and table ID retained | renderer |
| S119-HTML-JSON-01 | Browser `data-chart-model` for false | No `table` key/object/rows/headings/caption; any `rowLabels` is a minimal ID-label map | renderer/HTML |
| S119-HTML-JSON-02 | Browser `data-chart-model` for true | Existing table payload remains, with optional resolved `showTable: true` field | renderer/HTML |
| S119-HTML-A11Y-01 | False figure/plot accessibility | No table-ID phrase, table caption ID, dangling `aria-describedby`; chart-only summary retained | HTML/accessibility |
| S119-HTML-A11Y-02 | True figure/plot accessibility | Existing table link and complete-data summary retained | HTML/accessibility |
| S119-HTML-TOOLTIP-01 | False chart tooltips/category labels | Plot, tooltips, units, line/scatter labels work without serialized table rows | browser runtime |
| S119-HTML-EMPTY-01 | False chart with no plottable data | Empty-state plot/notice remains; no table/fallback table data | renderer |

## PDF Cases

| Case ID | Input/assertion | Expected result | Owner |
| --- | --- | --- | --- |
| CHT-PDF-01 | Omitted/false/true/dynamic charts prepared/rendered to PDF | SVG plot present; chart table object/text absent false, present true | PDF |
| S119-PDF-STRUCT-01 | Prepared definition for false | No chart-associated table record after chart SVG stack | PDF structure |
| S119-PDF-TEXT-01 | Rendered PDF for true/false | True headings/rows searchable; false chart data-table text absent while title/description remain | PDF artifact |
| S119-PDF-VIEW-01 | Ordinary `table` view beside hidden chart | Ordinary table remains unaffected | PDF regression |

## DOCX Cases

| Case ID | Input/assertion | Expected result | Owner |
| --- | --- | --- | --- |
| CHT-DOCX-01 | Omitted/false/true/dynamic chart paths | Native/static chart present; Word data table absent false, retained true | DOCX |
| S119-DOCX-NATIVE-01 | Bar/column/numeric line/date line/scatter with false | Chart parts/workbooks may remain; no associated Word `<w:tbl>` | DOCX native |
| S119-DOCX-FALLBACK-01 | Zero point, unsupported axis, scatter-group fallback with false | Heading/description/notice remains; no table and no “complete table” claim | DOCX fallback |
| S119-DOCX-PARTIAL-01 | Numeric line omits no-plottable series with false | Notice explains omission without claiming series is in a table; chart remains | DOCX partial path |
| S119-DOCX-ALT-01 | False native/fallback chart alt text | No table ID/name/reference; chart title/description/summary retained | DOCX accessibility |
| S119-DOCX-TRUE-01 | True chart in all supported paths | Existing table contents/headings/rows and alt-text table link retained | DOCX regression |
| S119-DOCX-VIEW-01 | Ordinary table view beside hidden chart | Ordinary Word table remains unaffected | DOCX regression |

## Shared Model and Rendering Boundary

| Case ID | Assertion | Expected result |
| --- | --- | --- |
| S119-MODEL-01 | Internal false model still contains table | Plot/model construction unchanged; output adapters alone consume `showTable` |
| S119-MODEL-02 | No AST/expression reevaluation in renderer | Boolean copied from model; no parser/evaluator calls in output paths |
| S119-TRUE-MODEL-01 | True model table/measurement/null/source order unchanged | Existing S118 chart normalization and table model behavior preserved |
| S119-NO-CSS-01 | False output search | No hidden, screen-reader-only, offscreen, or CSS-hidden chart table fallback |

## VS Code and TextMate Cases

| Case ID | Fixture/assertion | Expected result | Owner |
| --- | --- | --- | --- |
| S119-TM-SHOWTABLE-01 | `showTable enabled and threshold >= 2` actual TextMate host | `showTable` has `keyword.other.option.amx`; expression tokens preserve existing scopes | extension host |
| S119-TM-AFFINE-01 | `unit celsius = kelvin + 273.15` and Fahrenheit form | `+`, `-`, `*`, `/`, PI/E, numbers, identifiers retain accepted scopes | extension host |
| S119-TM-BOUNDARY-01 | Narrative/JS fence contains showTable/unit text | No AMX scopes leak outside exact `amx` fence | extension host |
| S119-EXT-FORMAT-01 | Valid V0.19 extension-host document | No diagnostics; format idempotent; option/expression spelling stable | extension host |
| S119-EXT-DIAG-01 | Invalid non-Boolean showTable/invalid affine expression | Existing source-local diagnostic and token presentation; no editor-only rewrite | extension host |

## Shared/Desktop Editor Cases

| Case ID | Fixture/assertion | Expected result | Owner |
| --- | --- | --- | --- |
| S119-FACT-SHOWTABLE-01 | Parser-proven chart option AST | Exact `showTable` keyword fact, expression facts, and option order | shared editor |
| S119-FACT-AFFINE-01 | Unit declaration with `+`, `-`, `PI`, `E` | Exact operator/reference/literal facts at original offsets | shared editor |
| S119-FACT-RANGE-01 | CRLF/non-BMP surrounding source | UTF-16/CRLF ranges remain exact; no token spans cross newline | shared editor |
| S119-DESKTOP-UI-01 | Vite CodeMirror V0.19 fixture | `.amx-token-keyword` includes `showTable` and affine operator tokens; no diagnostics for valid source | desktop UI |
| S119-DESKTOP-UI-02 | Format fixture twice | Idempotent text; table/chart options stay in authored order | desktop UI |
| S119-DESKTOP-DIAG-01 | Invalid V0.19 source | Diagnostic mark appears on exact source token; same code/message family as parser | desktop UI |
| S119-DESKTOP-BOUNDARY-01 | Narrative and inert fences | No V0.19 facts/classes leak | desktop UI/shared |

## Specification, README, Migration, and Examples

| Case ID | Assertion | Expected result | Owner |
| --- | --- | --- | --- |
| S119-SPEC-LINK-01 | V0.19 spec and historical links | File exists, links backward, historical specs unchanged | docs |
| S119-SPEC-CONTRACT-01 | showTable + affine + data shape content | All accepted syntax/evaluation/output/operation/diagnostic/migration rules covered | docs review |
| S119-SPEC-EXCLUSION-01 | Boundaries | No hidden table, no new shape, no unapproved units/release/certification claim | docs review |
| S119-README-01 | README navigation | V0.19 spec and updated Examples 05/07 linked; V0.18 links retained | docs |
| CHT-DEFAULT-MIGRATION-01 | Spec/README/Example 07 migration | Explicitly explains V0.18 implicit table -> V0.19 omitted false and `showTable true` | docs/migration |
| S119-EX05-RUN-01 | Example 05 parse/check/evaluate | Affine C/F conversions, subtraction, aggregates, PI/E examples execute; display values/units exact or tolerated as specified | example |
| S119-EX05-INERT-01 | Example 05 invalid operations | Rejected operations appear only in inert `text` fence and explain diagnostics | example/docs |
| S119-EX05-FORMAT-01 | Example 05 format twice | Stable and runnable | example |
| S119-EX07-RUN-01 | Example 07 CLI with documented mappings | Existing summary/exports remain unchanged; four visibility charts evaluate | example |
| S119-EX07-HTML-01 | Example 07 rendered HTML | Omitted/false no table; true/dynamic true retain existing table contents | example/render |
| S119-EX07-STATIC-01 | Focused PDF/DOCX for Example 07 or extracted fixture | Same four-way visibility behavior in static output | example/static |
| S119-EX07-NAV-01 | Lesson structure/navigation/support closure | Existing numbered-guide links and support-file invariants remain valid | docs/example |

## Cross-Surface Acceptance Matrix

| Feature | HTML | PDF | DOCX | Editor | Docs/Example |
| --- | --- | --- | --- | --- | --- |
| Omitted false | CHT-HTML-01, S119-HTML-* | CHT-PDF-01, S119-PDF-* | CHT-DOCX-01, S119-DOCX-* | N/A | S119-EX07-* |
| Explicit false | Same false rows | Same false rows | Same false rows | S119 syntax rows | Example 07 |
| Explicit true | CHT-OUTPUT-TRUE-01 | S119-PDF-TEXT-01 | S119-DOCX-TRUE-01 | S119 syntax rows | Example 07 |
| Dynamic Boolean | HTML true/false cases | PDF true/false cases | DOCX true/false cases | S119-TM/FACT expression facts | Example 07 |
| Affine authoring | N/A | N/A | N/A | S119-TM-AFFINE-01, S119-FACT-AFFINE-01 | Spec/Example 05 |

Every executed row records exact commands, artifact paths, source/output
inspection method, and whether evidence is source, runtime, browser, extension
host, Vite harness, PDF XML/text, or DOCX package/XML.
