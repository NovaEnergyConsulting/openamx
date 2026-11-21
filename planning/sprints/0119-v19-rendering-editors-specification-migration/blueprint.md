# Sprint 119 Blueprint: V0.19 Rendering, Editors, Specification, and Migration

## Approach

1. Recheck accepted S115 chart/output/migration authority, accepted S116 shared
   `showTable` propagation, accepted S118 affine runtime/SI/output-shape
   behavior, exact S119 baseline/worktree, and separate execution authorization.
2. Audit the three output adapters with a two-column truth matrix: resolved false
   and resolved true. Identify every table object, markup block, JSON table
   payload, accessibility link, DOCX fallback path, and alt-text reference.
3. Implement HTML first as a focused probe: false removes the table element,
   table caption/rows, table-specific browser JSON, and table ID references while
   preserving the plot. Retain a minimal row-label map in the browser payload
   only if plotting/tooltip formatters require it.
4. Apply the same resolved field to PDF and every DOCX chart/fallback branch.
   True continues through existing code unchanged; false only bypasses
   table/alternative construction and changes output-facing accessibility text.
5. Update parser-proven shared highlighting for `showTable` and affine unit
   declaration operator tokens; update the VS Code TextMate grammar only for
   demonstrated token gaps and verify actual extension-host tokenization.
6. Run focused desktop Vite/CodeMirror UI checks for the same tokens, exact
   diagnostics, and formatter idempotence. Distinguish Vite-harness evidence from
   native desktop/platform qualification.
7. Add the additive V0.19 language specification and README navigation. Do not
   revise V0.9-V0.18 specifications.
8. Extend Example 05 with runnable temperature/PI/E/aggregate cases and inert
   rejection examples; extend Example 07 with omitted/false/true/dynamic chart
   visibility and migration prose.
9. Execute focused renderer/editor/docs/example checks, root typecheck/build only
   if approved, generated-output provenance checks, and changed-path/scope audit.
   Record raw failures/retries/unavailable UI/extension checks. Submit a separate
   disposition; S120 remains gated.

## Implementation Decisions

| ID | Topic | S119 technical disposition |
| --- | --- | --- |
| D119-01 | Internal model/table | Keep `ChartViewModel.table` for plot/model construction. False affects output adapters and output-facing payload/accessibility, not the internal table model. |
| D119-02 | HTML false payload | Serialize no `table` object, caption, headings, rows, or table-ID accessibility for false. If category tooltips need labels, serialize a minimal `rowLabels` ID map separate from table data. |
| D119-03 | HTML true payload | Preserve existing browser table object and table markup for backward compatibility and output truthfulness. |
| D119-04 | Accessibility | Use a chart-only summary when false; omit table ID/caption/`aria-describedby` references. When true, retain existing “Complete chart data” summary and table link. |
| D119-05 | PDF/DOCX | `showTable` gates only chart-associated table/fallback-table construction. Chart title, description, native chart, SVG, notice, and supported fallback behavior otherwise remain unchanged. |
| D119-06 | DOCX fallback notices | When false, unsupported/zero/omitted-series notices must not claim data is available in a complete table; they describe only the limitation. |
| D119-07 | VS Code grammar | Add `showTable` to chart option keyword scope. Verify but do not unnecessarily change existing `+`, `-`, PI/E, numeric, and operator scopes. |
| D119-08 | Desktop facts | Emit parser-proven facts for `showTable` and affine declaration operator tokens. Preserve original UTF-16 offsets and exact option/expression AST ownership. |
| D119-09 | Examples | Example 05 remains executable and self-contained; rejected operations appear in inert `text` fences. Example 07 demonstrates all four visibility states with distinct chart/output assertions. |
| D119-10 | Specification | `docs/language-spec-v0.19.md` is additive and links backward; it records implementation decisions without rewriting historical contracts. |

## Source Baseline To Verify

- `ChartViewEmission` and `ChartViewModel` carry required `showTable: boolean`;
  internal chart table/accessibility still exist after S116.
- `renderChart` currently emits one table and serializes the full table/accessibility
  model unconditionally; browser formatter code uses table rows to map IDs to
  category labels.
- PDF currently appends a table after each chart SVG.
- DOCX calls table construction for scatter, numeric/date/category line, bar/
  column, zero-point, unsupported, and partial-representation fallback paths;
  chart alt text currently uses table identity.
- VS Code grammar already scopes PI/E and all arithmetic operators, but not the
  exact `showTable` option keyword.
- Shared highlighting walks unit declaration expressions but does not emit
  operator facts or chart option expressions; chart `showTable` is not traversed
  for option keyword/expression facts.
- Examples 05 and 07 remain V0.9-era linear/table behavior; V0.19 spec is absent;
  README ends current navigation at V0.18.

## Candidate File Plan

Core output paths:

- `src/renderer/renderHtml.ts`
- `src/renderer/reportPdf.ts`
- `src/renderer/reportDocx.ts`
- `src/renderer/chartModel.ts` if output-facing accessibility summary/type needs
  a conditional shape

Focused output tests:

- `tests/renderer.test.ts`
- `tests/reportPdf.test.ts`
- `tests/reportDocx.test.ts`
- `tests/chartModel.test.ts` if model accessibility changes

Editor paths:

- `vscode-extension/amx.tmGrammar.json`
- `vscode-extension/src/test/`
- `src/editor/highlighting.ts`
- `tests/editor.test.ts`
- `desktop-app/tests/ui/` and exact desktop fixture/harness support
- `tests/formatter.test.ts` only for V0.19 syntax stability additions

Public docs/examples:

- `docs/language-spec-v0.19.md`
- `README.md`
- `examples/05_Measurements_and_Units.amx`
- `examples/07_Tables_Charts_and_Named_Outputs.amx`
- `tests/examples.test.ts`
- `tests/numbered-guide.test.ts` if lesson structure/navigation/CLI expectations
  change

No S120 closeout, package/version, release, publication, installer, deployment,
or certification path is approved.

## Verification Candidates

```text
bun test tests/renderer.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts tests/chartModel.test.ts tests/editor.test.ts tests/formatter.test.ts tests/examples.test.ts tests/numbered-guide.test.ts
bunx tsc --noEmit
bun run build
git diff --check
```

Separately configured extension and desktop commands must be recorded exactly.
Expected checks include the actual VS Code TextMate host test, desktop no-emit/
typecheck where configured, and applicable Vite UI editor test. Native desktop,
Hutch, cross-platform, extension publication, or release checks are not assumed.

Inspect actual artifacts, not only object construction:

- parse final HTML for absent/present table markup, table captions, `data-chart-model`
  table keys, rowLabels-only false payload, and dangling IDs;
- inspect PDF content-definition/chart table blocks and rendered PDF text;
- inspect DOCX package XML for `w:tbl`, chart XML, alt text, and fallback notices;
- run Examples 05/07 and render them through approved HTML/PDF/DOCX paths;
- verify spec and README links and exact migration statement;
- verify TextMate token scopes and CodeMirror rendered facts with inert prose/
  fence boundaries.

## Stop Conditions

- False output still contains table markup, a hidden/CSS table, table payload,
  table caption/ID, dangling `aria-describedby`, DOCX table, or alt-text table
  reference: stop and fix the same output slice before other work.
- Browser plotting/tooltips require table rows and no minimal row-label design is
  proposed: return for payload decision; do not embed hidden table data as a
  workaround.
- A desktop/editor change needs a separate text parser or fuzzy regex parser in
  place of accepted AST facts: stop for architecture review.
- A new historical spec change or unrelated README rewrite appears: revert the
  scope within the same edit and continue from the approved additive path.
- An example relies on an invalid operation in executable `amx` fences: move it
  to an inert diagnostic example and keep the lesson runnable.
