# Sprint 119 Diagnostics and Output Gates

## Language Diagnostic Boundary

Sprint 119 allocates no new language diagnostic. Parser, checker, runtime,
input, and affine operation diagnostics remain owned by accepted S115-S118
behavior. Editor work preserves the same codes/messages/ranges rather than
translating them into editor-only errors.

| Surface | Existing policy | S119 gate |
| --- | --- | --- |
| Malformed `showTable` | AMX3006 parse family | TextMate/highlighting do not mask or rewrite parser span |
| Non-Boolean `showTable` | AMX3002 at expression | Shared/desktop/extension diagnostics use existing range |
| Duplicate `showTable` | AMX3005 at second option | No output-specific diagnostic |
| Unknown/not-visible expression name | AMX3001 ordinary identifier | No chart/editor wrapper |
| Invalid affine declaration | AMX3008 declaration family | Desktop/shared/VS Code show existing parser/checker diagnostic |
| Unsupported affine operation | AMX3007 at operator/call | Only inert examples or S118 runtime tests; S119 docs must not imply a successful result |
| Static/dynamic finite measurement error | AMX3010/AMX1009 phase split | Documentation records existing behavior; no output fallback |
| External shape/unit error | AMX4004/AMX4005 | Spec and migration preserve exact public input boundary |

## Output Failure Criteria

A false resolved chart fails S119 acceptance if any artifact contains:

- a chart `<table>` or chart table caption/headings/body;
- a false browser JSON `table`, `headings`, `rows`, or caption tied to table data;
- a hidden, CSS-only, screen-reader-only, offscreen, print-only, or alternate
  table representation;
- a table ID in `aria-describedby`, accessibility summary, serialized
  accessibility, DOCX alt text, PDF alternate data, or notice;
- a PDF table object associated with the chart;
- a DOCX `<w:tbl>` chart fallback/data table;
- a message claiming unplottable data is available in a complete table that is
  absent.

A true chart fails if any existing table caption, heading, row, null display,
measurement display unit, or source order changes without approved reason.
Ordinary table views are separate and must remain.

## Browser Payload Gate

False browser JSON may contain plot option data, series/axes metadata, and a
minimal ID-to-label map. It may not contain an alternate serialization of the
chart table with renamed fields. Reviewers must search both property names and
actual row arrays, not rely only on the string `table`.

The browser bootstrap must use the minimal map to restore labels/tooltips. A
payload with `rowLabels` and full source rows is still a violation. True payloads
retain the existing table for compatibility and are explicitly exercised.

## Accessibility Gate

- False HTML: chart plot's aria relationships reference only title, description,
  and chart summary; no table caption ID.
- False PDF: no fabricated alternate table or hidden accessibility row; actual
  PDF tagging/accessibility certification remains outside scope.
- False DOCX: chart alt text/title/description do not contain table IDs or a
  complete-data-table reference.
- True preserves existing table-linked accessibility. No broader PDF/UA,
  tagged-PDF, WCAG, native accessibility, or platform certification is claimed.

## Editor Gates

- A shared editor fact must originate from the accepted AST and exact source
  location. Text searching is limited to retrieving a known AST token at an AST
  source, not deciding syntax.
- `showTable` gets an option-keyword fact; affine operators in unit declarations
  get operator/keyword facts without rewriting the expression.
- Actual VS Code TextMate host evidence is distinct from shared facts; one does
  not prove the other.
- Vite CodeMirror presentation is distinct from native desktop behavior; record
  it as harness evidence and retain pre-existing native/platform gaps.
- Formatter idempotence does not prove diagnostics, and grammar scopes do not
  prove parser acceptance.

## Documentation and Example Gates

- Invalid AMX in Example 05 is inert and cannot make the executable lesson fail.
- Example 07 source remains one valid lesson with current mappings/outputs;
  adding charts must not change exported summary/row data.
- The V0.19 spec is additive. Historical specs may be linked but not edited to
  state V0.19 rules.
- Migration is precise: V0.18 omitted table always shown; V0.19 omitted false;
  authors add `showTable true` or a true Boolean expression to retain it.
- Examples/docs do not claim automatic migration, exact decimal arithmetic,
  arbitrary affine composition, new external shape, hidden table fallback,
  release, package/version, or certification.

## Stop Conditions

- Any output branch emits hidden/fallback table data for false.
- A renderer reparses/evaluates the `showTable` AST instead of consuming the
  shared Boolean.
- Browser behavior depends on full table rows but no approved minimal plot-label
  shape exists.
- A DOCX path omits the normal chart table but a fallback `addChartTable` remains.
- A desktop/VS Code implementation creates a second parser or broad source
  scanner contrary to parser-proven facts/actual grammar.
- A spec/example changes an accepted S116/S118 rule, historical contract, or
  external shape.
- An unavailable extension/desktop host check is called PASS without exact
  unavailable evidence and residual owner.
