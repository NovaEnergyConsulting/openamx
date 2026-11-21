# Sprint 119 Acceptance Criteria

Sprint 119 is complete only when S116's resolved `showTable` and S118's affine
behavior are integrated across output adapters, authoring editors, public
specification, examples, and migration, with exact evidence and a separate
product-owner disposition. Sprint 119 does not close V0.19.

## Entry and Authority

- Sprint 116 and Sprint 118 are verified ACCEPTED/CLOSED on 2026-11-21 with
  no residual blocking S119.
- Separate S119 execution authorization records exact baseline, worktree/output
  preservation, file scope, renderer/UI/extension/docs commands, generated
  artifact rules, and evidence roots.
- No accepted S115-S118 language behavior is reopened. S119 consumes shared
  model/runtime results rather than redefining expression or affine semantics.

## HTML/Preview

- All omitted/false charts retain plot/title/description/controls but emit no
  chart table markup, caption, rows/headings, table ID, print table, or hidden
  alternate.
- False browser JSON contains no table data. A permitted minimal row-label map
  supports tooltips/category formatters without representing a table.
- False accessibility/ARIA output has no table ID/caption reference or table
  phrase. True output preserves existing complete-data table and accessibility.
- All four chart kinds and no-data/null/measurement/date/time paths remain
  functional without a table payload.

## PDF/DOCX

- False PDF chart output has no chart-associated table object or searchable table
  text while the SVG/title/description remains.
- Every false DOCX native/fallback branch emits no chart-associated Word table.
  Unsupported/zero/partial-series notices do not claim a table exists.
- False DOCX alt text has no table identity/reference. True native and fallback
  paths retain existing table/headings/rows/measurement display and alt behavior.
- Ordinary table views remain independent and render normally in HTML/PDF/DOCX.

## Editors and Formatting

- Actual VS Code TextMate host scopes `showTable` correctly and retains affine
  `+`, `-`, `*`, `/`, `^`, PI/E, literals, and Markdown boundary behavior.
- Shared desktop facts derive `showTable` and declaration operator spans from
  AST source locations with exact LF/CRLF/UTF-16 mappings.
- Desktop Vite/CodeMirror presents approved tokens and source-local diagnostics;
  valid V0.19 formatting is idempotent.
- Existing editor completion/navigation/outline behavior remains; no second
  parser or broad scanner is introduced.

## Specification and README

- `docs/language-spec-v0.19.md` exists and links backward as an additive
  contract. Historical specifications are unchanged.
- The spec covers chart visibility/evaluation/output, affine declaration/runtime
  model and operations, PI/E, SI temperature exports, chart normalization,
  external shape, diagnostics, exclusions, and migration.
- README links V0.19 and updated examples while retaining historical navigation.
- Migration states omitted `showTable` is now false and an intentional retained
  table needs `showTable true` or a true Boolean expression.

## Examples

- Example 05 executes with affine C/F/K conversion, PI/E declaration examples,
  left-unit subtraction, physical aggregates, and display-unit intent. Invalid
  operations appear only in inert documentation fences.
- Example 07 executes with omitted, false, true, and expression-controlled chart
  declarations. Existing named outputs/mappings/summary remain stable.
- HTML and applicable PDF/DOCX artifact checks prove false absence and true
  preservation for the updated chart examples.
- Numbered-guide structure, links, support closure, parser/checker runtime,
  formatting, and CLI expectations remain valid.

## Scope and Closeout

- Every applicable S119 CHT/internal/editor/docs case in the matrix maps to exact
  evidence, source/output artifact, host type, and raw status.
- No CSS/screen-reader/alternate hidden table is accepted for false.
- No external `{ value, unit }` shape change, historical spec rewrite, release,
  package/version, publication, deployment, installer, distribution, or
  certification occurs.
- Vite/native/platform/extension unavailable checks remain distinct; a Vite pass
  does not become native desktop evidence and an extension unit test does not
  become VS Code host evidence.
- `builder-evidence.md` records baseline, commands, raw pass/fail counts,
  failures/retries, unavailable checks, generated/output artifacts, changed
  paths, residuals, and recommendation.
- A separate product-owner disposition accepts/closes or blocks/opens Sprint 119.
  Sprint 120 and all release/closeout work remain separately gated.
