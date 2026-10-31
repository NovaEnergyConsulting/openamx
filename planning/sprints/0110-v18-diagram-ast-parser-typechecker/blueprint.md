# Sprint 110 Blueprint: Diagram AST, Parser, and Typechecker

## Approach

1. Recheck the accepted Sprint 109 disposition and all D109-04 allocations.
   Verify the exact implementation commit, dirty worktree, output roots, and
   preservation baseline. Obtain separate Sprint 110 authorization and the
   exact file/command/evidence plan before source edits.
2. Resolve and record D110-01, the AST/integration boundary. Current runtime,
   module loading, formatter, and editor services consume the flat
   `DiagramDeclarationNode.elements` shape. The new recursive AST must not
   make the current evaluator render control-body primitives unconditionally
   or silently drop them. Select a compatibility projection or a narrow
   fail-closed boundary and include every required file in the approved plan.
3. Add a diagram-specific recursive content union. Keep it separate from the
   general statement AST; reuse `V02ExpressionNode`, `SourceLocation`, and
   current parser conventions. Record control opening/closing locations and
   expression/name locations needed for checker errors and future expansion.
4. Extend `parseDiagramDeclaration` with a recursive content reader. Track
   whether parsing is already inside a `for`; allow `if` within `for` and
   `for` within `if`, but reject a second `for` at any recursive depth. Use
   string-aware balanced-block handling and produce an `AMX3006` error at the
   confirmed inner-loop anchor. Do not rely on the current `parseFor.ts`
   nested-loop substring check for this diagram-specific rule.
5. Extend `checkDiagram` with a recursive visitor. Each block gets the
   correct local bindings; iterator bindings are restored after the block.
   Reuse existing iterable/conditional diagnostics only for the exact
   matching cases. Reject the declared diagram time identifier in control
   expressions using the newly allocated shared diagnostic. Continue
   validating primitive/property rules through one shared validation path.
6. Count each syntactically authored primitive exactly once toward the
   existing 512-per-report rule, including primitives nested in controls.
   Preserve cross-module aggregation and `AMXD013`; do not count runtime loop
   repetitions or selected/unselected branches at this static phase.
7. Update `formatDiagram` to recursively format controls and primitives in
   source order. Keep current metadata/time placement and primitive property
   canonicalization. Require parse-format-parse semantic equivalence.
8. Add focused parser, checker, formatter, diagnostic, source-location, and
   legacy-diagram regressions. Do not claim runtime expansion or rendering
   parity; those are not S110 acceptance criteria.
9. Record the approved file inventory, exact focused commands, outcomes,
   failures/retries, residuals, and changed-path audit in
   `builder-evidence.md`. Request a separate disposition.

## Candidate Source and Test Surfaces

Production candidates, subject to the approved file plan:

- `src/ast/types.ts` - recursive diagram content discriminants and sources.
- `src/parser/parseStatements.ts` - diagram body parser integration.
- `src/typechecker/checkDocument.ts` - recursive diagram validation,
  bindings, diagnostics, and authored-element accounting.
- `src/formatter/formatAmx.ts` - ordered recursive formatting.
- Compatibility adapters only if D110-01 requires them: current consumers
  include `src/runtime/diagramModel.ts`, `src/runtime/evaluateExpression.ts`,
  `src/runtime/moduleLoader.ts`, `src/editor/completion.ts`,
  `src/editor/highlighting.ts`, and `src/editor/symbols.ts`. These are not
  blanket authorization to edit runtime or editor behavior.

Existing test candidates:

- `tests/parser.test.ts` - AST shape, syntax, nesting, malformed blocks,
  source locations, and LF/CRLF behavior.
- `tests/diagram.test.ts` - checker diagnostics, primitive/property rules,
  authored accounting, and static diagram compatibility.
- `tests/formatter.test.ts` - canonical recursive format and round-trip.
- `tests/evaluator.test.ts` or a diagram-specific test - only if required to
  validate the approved fail-closed staging boundary; do not test S111
  expansion here.

No additional source/test path is approved by this preparation. A newly
required file needs a separate explicit scope amendment before edits.

## Verification

- Run only the focused tests and type/build checks named in the separately
  approved execution plan; tests listed here are candidates until approved.
- Verify diagnostics against complete AMX source envelopes, including
  original document/fence mapping, LF and CRLF, and UTF-16 columns.
- Audit every `DiagramDeclarationNode` consumer for recursive-AST
  compatibility. Record exact consumers and changed paths; do not dismiss
  compiler errors by broad casts or unsafe flattening.
- Cross-check fixture IDs against the diagnostic and requirement matrices.
- `git diff --check` and final changed-path inventory are required.
- Do not run broad root, editor-host, renderer, or release workflows as a
  proxy for S110 parser/checker acceptance.

## Stop Conditions

- Missing/unapproved `t` diagnostic allocation blocks its checker behavior.
- Unconfirmed nested-loop parse diagnostic details block that parse behavior.
- An unresolved D110-01 integration boundary blocks source edits that could
  silently execute or discard generated content.
- Any necessary out-of-plan source/test change requires separate approval.
- Sprint 111 does not start from a Builder recommendation alone; a separate
  ACCEPTED/CLOSED disposition is required.