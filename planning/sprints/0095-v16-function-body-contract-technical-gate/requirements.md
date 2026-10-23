# Sprint 095 Requirements: V0.16 Function Body Contract and Technical Gate

## Document Status

Architect-prepared Sprint 095 documentation. This package authorizes planning
only. Its candidate contract details are not approved until Sprint 095 review
and a separate Lead Developer/product-owner disposition. It does not authorize
implementation, release, publication, package/version changes, or changes to
historical sprint records.

## Goal

Turn the confirmed V0.16 function-body scope into a precise, internally
consistent behavior contract and executable fixture set before parser,
runtime, or type-checker implementation. Resolve return-path analysis,
lexical binding behavior, list-copy depth and independence, source-grounded
diagnostics, and compatibility boundaries. Provide the approved behavior
authority for Sprints 096-101.

Sprint 095 is a contract and technical gate. It adds no product behavior.

## Authority and Inputs

- Scope and sequencing authority:
  [`plan-openamxV16MasterSprintPlan.md`](../../plan-openamxV16MasterSprintPlan.md).
- Existing syntax/compatibility references:
  [`language-spec-v0.3.md`](../../../docs/language-spec-v0.3.md),
  [`language-spec-v0.2.md`](../../../docs/language-spec-v0.2.md), and the
  current V0.15-era language specifications as applicable.
- Relevant implementation references, consulted to establish preservation
  requirements rather than to approve current behavior: function AST/parser,
  statement parser, evaluator/environment, type checker, formatter, editor
  facts, and focused tests named in the master plan.
- Sprint 095 planning artifacts: `blueprint.md`, `acceptance.md`,
  `function-body-contract.md`, `control-flow-fixtures.md`,
  `diagnostic-matrix.md`, `requirement-test-matrix.md`,
  `builder-evidence.md`, and this handoff.

## In Scope

- Define the grammar and body boundary for both expression-bodied and
  brace-delimited functions, retaining existing expression-body programs.
- Inventory exactly which statement forms are legal in a function body and
  define their nesting, ordering, and source-location behavior.
- Define return propagation from a function body, nested if/else branches,
  and statement-form loops; distinguish it from return collection in
  expression-form loops.
- Specify return-type compatibility and a path-analysis rule for sequences,
  if/else, loops that may execute zero times, and later statements.
- Define lexical function/block scope, parameter assignment, local lifetime,
  shadowing, and declaration-order/visibility compatibility.
- Specify recursive list-argument copying, independence across parameters
  (including repeated arguments), local list mutation, and returned-list
  behavior.
- Specify prohibited function-body declarations/effects and identify any
  grammar edge or existing statement restriction that cannot be inferred
  safely from the confirmed scope.
- Produce mutually consistent valid/invalid examples, stable fixture IDs,
  diagnostic categories and source anchors, and a requirement-to-test matrix.
- Record all unresolved decisions and residuals with an owner and downstream
  sprint impact; obtain a separate contract disposition before Sprint 096.

## Out of Scope

- Changes to production source, tests, user-facing specifications, runnable
  examples, editor grammars/providers, manifests, or release files.
- Implementation or runtime verification of V0.16 features.
- New general-purpose syntax, nested-loop capability beyond what is
  explicitly approved, recursion, forward references, closures, or a
  visibility redesign.
- Module/document declarations, output actions, filesystem access, or other
  document-level effects in function bodies.
- Formatter/editor design or implementation, V0.16 language-spec publication,
  examples migration, release engineering, certification, or publication.
- Editing `planning/state.md`, `planning/decisions.md`,
  `planning/questions.md`, `planning/STATUS.json`, or historical sprint
  records without a separately approved file plan.

## Constraints and Gates

- The master plan's Confirmed Product Decisions and Confirmed Scope are fixed
  boundaries. Candidate details may resolve ambiguity but may not reduce or
  silently expand that scope.
- Keep source-observed behavior, confirmed product requirements, proposed
  semantics, and approved decisions separately labeled.
- Preserve the existing `fn name(...): Type = expression` path and its
  formatting, typing, visibility, and evaluation behavior.
- A function return must exit the function even when nested. A loop that may
  execute zero times cannot by itself prove that the function returns.
- A return inside an expression-form loop remains a per-iteration value
  collection mechanism unless a product decision explicitly changes that
  established contract; changing it is outside the current scope.
- List parameter copies must be recursively independent per parameter. Do
  not infer record/object copy rules, alias behavior for non-list parameters,
  or a copy-on-return rule without stating and approving that decision.
- Do not allocate or reuse a diagnostic code/message by guess. Verify current
  diagnostic meanings, document exact source ranges, and request allocation
  for any new stable identity.
- No downstream implementation sprint starts until this contract is
  explicitly dispositioned and the relevant decisions are closed.