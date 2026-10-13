# Sprint 079 Blueprint: Diagram Language and Shared Scene Model

## Approach

1. Confirm Sprint 079 execution authorization and approval of the concrete
   file-by-file plan. Capture the starting worktree and inspect the approved
   Sprint 078 contract and residuals before edits.
2. Convert the canonical fixtures in `grammar-examples.md` into focused
   parser/type-checker/evaluator/formatter tests. Keep the complete document
   wrappers so source positions cover front matter, narrative, and executable
   fences exactly as specified.
3. Extend the AST and parser for the approved diagram and element structures.
   Preserve authored order and source nodes for all declarations, properties,
   elements, and dynamic expressions. Keep the construct inline in executable
   AMX and do not introduce a `show`/placement mechanism.
4. Add type and semantic validation for required fields, types, local time
   scope, static style, supported primitives/properties, dimensions, bounds,
   duration, out-of-interval selected time, and finite evaluated geometry.
   Use the exact Sprint 078 diagnostic mapping and source points. Resolve the
   approved-limit overflow diagnostic before publishing a user-facing error
   for the 16-diagram/512-element caps.
5. Add runtime evaluation that evaluates bounds and duration once in the
   surrounding document environment and builds an immutable typed diagram
   model. For each requested time, evaluate a fresh frame from the captured
   expressions and existing AMX context; do not accumulate state or generate
   executable code. Preserve the full typed context needed for existing
   imported functions, measurements, records, enums, dimensions, and units.
6. Preserve each element's source order, source attribution, title,
   accessible description, logical canvas, timeline, validated expressions,
   and static styles in the model. Keep this model neutral to HTML, desktop,
   PDF, and DOCX; do not wire destination renderers in this sprint.
7. Implement the approved canonical formatter behavior. Test canonical output,
   idempotence, parse-format-parse, unchanged expression meaning, and no
   changes to formatting of existing non-diagram documents.
8. Test positive examples `D-CRANK-01` and `D-BATTERY-01`, all invalid
   fixtures `D-NEG-01` through `D-NEG-24`, source locations, semantic model
   immutability/order, and host arbitrary-time evaluation. Add typed-context
   cases beyond the exact Sprint 078 probe where they are needed to cover
   existing AMX value/function forms.
9. Run focused suites and the root build. Record exact results, changed files,
   any approved diagnostic decision, residuals, and evidence in
   `builder-evidence.md`. Do not characterize production renderer, native
   desktop, editor, or export surfaces as accepted by this sprint.

## Candidate Files to Update

The concrete approved plan must name exact files before execution. Likely
surfaces, following the master plan, are:

- `src/ast/types.ts`
- `src/parser/parseStatements.ts` and, if required by the existing grammar,
  `src/parser/parseDocument.ts`
- `src/typechecker/checkDocument.ts` and, if required,
  `src/typechecker/declarationRegistry.ts`
- `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`,
  `src/runtime/environment.ts`, and any narrowly required runtime context
  capture helper
- `src/formatter/formatAmx.ts`
- A shared typed diagram model module, preferably reusing the existing
  renderer/model organization rather than duplicating model logic
- Existing parser, evaluator, formatter, renderer/model, and report-preparation
  tests; add a focused model test file only if no existing test module is an
  appropriate home
- Sprint 079 `builder-evidence.md` (create during execution)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

Do not edit HTML/PDF/DOCX production renderers, desktop preview, VS Code,
desktop editor clients, dependency manifests, the language specification, or
production examples in this sprint.

## Verification

- Run focused parser, evaluator, formatter, and model tests covering the
  fixtures and existing-language regression cases.
- Run `bun run build` from the repository root.
- Verify model and evaluator output at the lower bound, representative
  interior times, and upper bound; explicitly test invalid selected times and
  non-finite results at initial, interior, and upper-bound positions.
- Assert exact diagnostic identity/message and original-document
  line/column. For ranges, verify exclusive ends and the existing
  zero-based half-open UTF-16 `EditorRange` conversion without changing the
  range convention.
- Record cap-boundary tests and the approved overflow diagnostic decision;
  if the decision is not available, leave that criterion blocked and do not
  invent a diagnostic.
- Compare model fields/order and evaluated values before and after formatting.
  Prove existing AMX documents retain prior parser/runtime/formatter behavior.

## Notes

Sprint 079 delivers the language and shared model required by Sprints 080-082.
It does not claim that any destination renderer, interactive runtime, native
desktop package, editor client, PDF, or DOCX is integrated or accepted.
