# Sprint 119 Requirements: V0.19 Rendering, Editors, Specification, and Migration

## Document Status and Entry Gate

Architect-prepared Sprint 119 planning package. Sprint 116 is ACCEPTED/CLOSED on
2026-11-21 with the resolved `showTable` Boolean propagated through shared
emission/model, and Sprint 118 is ACCEPTED/CLOSED on 2026-11-21 with affine
runtime, external data, chart normalization, and 50-unit SI inventory passing.
Both dependencies have no recorded residual affecting this sprint.

This package authorizes planning only. Obtain separate Sprint 119 execution
authorization and approval of the exact baseline, production/test/documentation/
example/UI/command/output plan before edits. Sprint 119 may begin only when:

- accepted S116 `showTable` syntax/evaluation/model semantics and accepted S118
affine runtime/SI behavior are treated as closed authorities;
- output adapters consume the shared resolved Boolean rather than parsing or
evaluating the option expression again;
- false/omitted output is true omission, including browser JSON, accessibility
references, PDF table objects, DOCX tables/fallback tables, and alt text;
- editor grammar/facts changes preserve parser-proven source ranges and do not
create a second AMX parser;
- public specification, examples, and migration describe implemented behavior
without revising historical specifications or adding product rules.

## Goal

Complete V0.19 user-facing integration across output, authoring, documentation,
and examples. Omit chart data tables whenever the accepted shared value is
false; preserve existing tables when true; recognize the V0.19 chart/affine
syntax in VS Code and desktop authoring; and publish an additive V0.19 language
contract, README navigation, and runnable/migration examples.

Sprint 119 does not close V0.19. Integrated acceptance remains Sprint 120.

## Accepted Inputs

- Accepted S115 chart/affine contract and migration decisions, especially
  D115-01/02/03 and D115-04/05/06/07/08/09.
- Accepted S116 AST/parser/checker/evaluation/formatter/model behavior. A chart
  always supplies an explicit `emission.showTable` and `model.showTable` Boolean.
- Accepted S118 canonical affine runtime, external shape, chart normalization,
  SI temperature exports, and exact public display-unit behavior.
- Historical V0.18 and prior specifications/examples remain authoritative for
  unrelated behavior and must not be rewritten.

## In Scope

### Output Rendering

- Update HTML/preview chart output to omit the actual chart table for false or
  omitted resolved visibility while preserving figure, plot, title,
  description, axes, series, tooltips, legend, and zoom controls.
- Remove table-specific data from serialized browser chart JSON when false. The
  browser runtime may retain only minimal plot-formatting metadata such as a
  row-ID-to-label map, not table rows, headings, caption, or a hidden alternate
  table representation.
- Make HTML accessibility references truthful: false charts have a chart-only
  summary/alt description and no table caption, table ID, or dangling
  `aria-describedby` reference. True charts preserve their complete data-table
  accessibility link and existing summary.
- Omit the PDF chart table block when false and preserve existing chart SVG/title/
  description. Keep the existing table model, headings, rows, null behavior, and
  measurement display when true.
- Omit every DOCX `addChartTable` path, including native chart, unsupported-chart
  fallback, and zero-point fallback paths, when false. Preserve native chart
  behavior and true tables. False chart alt text must not name/reference a table.
- Update DOCX helper notices that currently say an omitted/unrepresentable series
  is available only in a complete table. For false visibility, describe the chart
  limitation without claiming a table exists.

### Editors and Formatting

- Update VS Code TextMate grammar and host tokenization tests to recognize the
  `showTable` chart option and retain correct `PI`/`E`, numeric, identifier,
  `+`, `-`, and other operator scopes in affine unit declaration expressions.
- Update shared parser-proven editor highlighting to emit exact keyword/token
  facts for `showTable` and the accepted unit-expression syntax. Continue to
  walk existing AST/source ranges rather than parsing text separately.
- Update desktop shared facts and applicable Vite/CodeMirror UI tests so the
  syntax is visible and diagnostics remain source-located. Preserve existing
  formatter behavior and idempotence; production formatter changes are allowed
  only for a demonstrated S119 failure.
- Preserve inert Markdown/non-AMX boundaries and existing highlighting,
  completion, diagnostics, formatting, navigation, and outline behavior.

### Specification, README, Examples, and Migration

- Add `docs/language-spec-v0.19.md` as an additive contract covering `showTable`,
  the omitted-false breaking default, affine declaration/operation model, PI/E
  declaration constants, SI temperature units, output/data-shape compatibility,
  diagnostics, exclusions, and migration.
- Update README feature/navigation references to V0.19 and link the additive
  specification and updated examples. Do not replace historical spec links.
- Update `examples/07_Tables_Charts_and_Named_Outputs.amx` with omitted,
  explicit false, explicit true, and expression-controlled chart table
  visibility, plus migration explanation.
- Update `examples/05_Measurements_and_Units.amx` with the SI temperature units,
  PI/E unit declaration examples, conversions, left-unit subtraction, physical
  aggregates, display behavior, and inert examples of representative rejected
  affine operations. Keep executable portions runnable.
- Add focused documentation/example tests that parse/check/evaluate/format and,
  where applicable, render the updated examples and verify the new spec/README
  navigation and migration text.
- Record that V0.19 does not change the external `{ value, unit }` shape and does
  not add a CSS-hidden, screen-reader-only, or alternate hidden table fallback.

## Out of Scope

- Reopening parser/checker/evaluator/affine runtime behavior accepted in S116 or
  S118 except for a separately authorized, evidenced S119 integration defect.
- New chart kinds, styles, layouts, editor products, language syntax, affine
  units, external data shape, package resolution, or report features.
- Release, publication, package/version change, deployment, installer,
  distribution, platform certification, or integrated V0.19 closeout.
- Historical specification edits, broad README restructuring, generated runtime
  hand edits, or desktop native/cross-platform certification.
- A CSS-only hidden table, visually hidden table, screen-reader-only table,
  alternate table payload, or fallback table for false `showTable` output.

## Candidate File Surfaces

Core render candidates:

- `src/renderer/renderHtml.ts` and existing browser bootstrap/serialization;
- `src/renderer/reportPdf.ts`;
- `src/renderer/reportDocx.ts`;
- `src/renderer/chartModel.ts` only if the accepted accessibility model must
  distinguish true/false while retaining the internal table.

Editor candidates:

- `vscode-extension/amx.tmGrammar.json` and `vscode-extension/src/test/`;
- `src/editor/highlighting.ts` and `tests/editor.test.ts`;
- `desktop-app/tests/ui/` and any applicable desktop fixture/mocks;
- `tests/formatter.test.ts` if idempotence coverage is extended.

Documentation/example candidates:

- `docs/language-spec-v0.19.md` (new);
- `README.md`;
- `examples/05_Measurements_and_Units.amx`;
- `examples/07_Tables_Charts_and_Named_Outputs.amx`;
- `tests/examples.test.ts` and `tests/numbered-guide.test.ts` as required by the
  exact executable/navigation plan.

A required edit to another production/test/docs path needs exact scope amendment
before it occurs. Generated browser/runtime artifacts are changed only by their
source generator/build, never by hand.

## Completion Outputs

- Focused HTML/PDF/DOCX/editor/formatter/docs/example implementation with exact
  changed paths and generated-artifact evidence.
- A completed `builder-evidence.md` recording commands, exact output inspection,
  raw failures/retries, unavailable host checks, residuals, and recommendation.
- Requirement/case traceability for S116 output cases CHT-HTML/PDF/DOCX,
  CHT-OUTPUT-OMISSION/TRUE/MIGRATION plus editor/docs/example AFF behavior.
- No package/version/release/publication/certification or Sprint 120 closeout
  work. Separate product-owner disposition is required; S119 recommendation alone
  does not authorize integrated acceptance.
